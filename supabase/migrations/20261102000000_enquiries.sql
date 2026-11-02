-- Enquiries from the business website's contact form. The business website
-- inserts with the service role key; the wedding-saas admin area reads and
-- updates them. No access at all for the public keys.

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  names text not null check (char_length(names) between 1 and 120),
  email text not null check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  wedding_date date,
  design text,                                 -- heirloom | custom | unsure
  message text check (char_length(message) <= 4000),
  handled boolean not null default false,      -- ticked off in the admin area
  created_at timestamptz not null default now()
);

create index enquiries_created_at_idx on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon, authenticated;
grant all on public.enquiries to service_role;
