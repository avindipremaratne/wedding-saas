-- Wedding SaaS initial schema.
-- Tables follow the technical document's data model (sites, site_content,
-- rsvps, themes), plus `orders` for Stripe checkouts made on the separate
-- business website, which shares this Supabase project. This repo stays the
-- single source of truth for the schema. Row Level Security is
-- on for every table; the comments on each policy say who can do what.

-- ---------------------------------------------------------------- themes
create table public.themes (
  id text primary key,                       -- e.g. 'heirloom'
  name text not null,
  preview_image text,
  component_bundle_ref text not null,        -- key in themes/index.ts
  created_at timestamptz not null default now()
);

alter table public.themes enable row level security;

-- Anyone can list the available designs.
create policy "themes are public"
  on public.themes for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------- sites
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  -- The slug becomes the subdomain and the /<slug> path.
  slug text not null unique
    check (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$'),
  owner_id uuid references auth.users (id) on delete set null,
  theme_id text not null references public.themes (id),
  plan_tier text not null default 'standard'
    check (plan_tier in ('demo', 'standard', 'premium')),
  -- Drafts stay hidden from guests until the couple approves them.
  published boolean not null default false,
  -- Where RSVP notifications go. Not readable by guests (see grants below).
  notification_email text,
  created_at timestamptz not null default now()
);

create index sites_owner_id_idx on public.sites (owner_id);

alter table public.sites enable row level security;

-- Guests can see published sites; couples can always see their own.
create policy "published or owned sites are visible"
  on public.sites for select
  to anon, authenticated
  using (published or owner_id = (select auth.uid()));

-- Keep the notification address private: grant column-level read access
-- instead of the default table-wide SELECT.
revoke select on public.sites from anon, authenticated;
grant select (id, slug, owner_id, theme_id, plan_tier, published, created_at)
  on public.sites to anon, authenticated;

-- ---------------------------------------------------------- site_content
create table public.site_content (
  site_id uuid primary key references public.sites (id) on delete cascade,
  couple_names text[] not null check (array_length(couple_names, 1) = 2),
  wedding_date timestamptz not null,
  wedding_end timestamptz,
  time_zone text not null default 'UTC',
  ceremony_time text not null,
  rsvp_deadline date,
  venue jsonb not null,                       -- { name, city, addressLines[], mapsUrl, description }
  hero_photo_url text not null,
  gallery_photo_urls text[] not null default '{}',
  palette_override jsonb,                     -- partial theme colours
  music_track_url text,
  story_text text,
  schedule jsonb not null default '[]',       -- [{ name, startTime, endTime, location, description }]
  theme_data jsonb not null default '{}',     -- theme-specific copy (see HeirloomDetails)
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "content of visible sites is visible"
  on public.site_content for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.sites s
      where s.id = site_id
        and (s.published or s.owner_id = (select auth.uid()))
    )
  );

-- Couples can edit their own content (for the self-serve phase).
create policy "owners update their content"
  on public.site_content for update
  to authenticated
  using (exists (select 1 from public.sites s where s.id = site_id and s.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.sites s where s.id = site_id and s.owner_id = (select auth.uid())));

-- ----------------------------------------------------------------- rsvps
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 120),
  email text not null check (char_length(email) <= 254),
  attending boolean not null,
  message text check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

create index rsvps_site_id_created_at_idx on public.rsvps (site_id, created_at desc);

alter table public.rsvps enable row level security;

-- Guests can reply to a published site, but cannot read any replies back.
create policy "guests can rsvp to published sites"
  on public.rsvps for insert
  to anon, authenticated
  with check (exists (select 1 from public.sites s where s.id = site_id and s.published));

-- Couples can read the replies to their own site.
create policy "owners read their rsvps"
  on public.rsvps for select
  to authenticated
  using (exists (select 1 from public.sites s where s.id = site_id and s.owner_id = (select auth.uid())));

-- ---------------------------------------------------------------- orders
-- One row per completed Stripe Checkout, written only by the business
-- website's webhook with the service role key. No policies: anon and authenticated get no access.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  email text,
  couple_names text,
  wedding_date date,
  amount_total integer,                       -- smallest currency unit
  currency text,
  status text,                                -- Stripe payment_status
  site_id uuid references public.sites (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- ------------------------------------------------------ updated_at helper
create function public.touch_updated_at() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger site_content_touch_updated_at
  before update on public.site_content
  for each row execute function public.touch_updated_at();
