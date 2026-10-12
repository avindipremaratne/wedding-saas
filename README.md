# Wedding SaaS

The wedding website template: themeable wedding sites on Next.js 16. Theme 1 ("Heirloom") is the Amali & Ashen design ported from the Wix build; every couple-specific value is data, so a new couple is a new row (or file), not new code.

The business website (landing page, pricing, Stripe checkout) lives in a separate repo, `wedding-saas-business-website`. Both share one Supabase project, and this repo owns the database schema.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 shows the Theme 1 reference site
npm test           # unit tests (Vitest)
npm run lint
npm run typecheck
```

No keys are needed locally: without Supabase the bundled site in `content/sites/` is used and RSVPs are printed to the terminal. Copy `.env.example` to `.env.local` to turn services on.

## How it fits together

| Path | What it is |
| --- | --- |
| `app/page.tsx` | The deployment's own site at `/` (`DEFAULT_SITE_SLUG`, default `amali-ashen`) |
| `app/[site]/page.tsx` | Any site at `/<slug>`, useful for previews |
| `components/SiteRoute.tsx` | Loads a site and renders it with its theme |
| `app/actions/rsvp.ts` | Server Action: validates, saves to Supabase, emails the couple |
| `proxy.ts` | Optional multi-tenant mode: serves `<slug>.<domain>` |
| `lib/` | Types, site loading (Supabase first, static fallback), dates, RSVP validation, email |
| `themes/heirloom/` | Theme 1: config (colours, assets), CSS module, sections |
| `themes/index.ts` | Theme registry, keyed by `themes.component_bundle_ref` |
| `content/sites/` | Bundled site data (also prerendered at build time) |
| `supabase/` | Schema migration with Row Level Security (shared with the business website), and seed data |

Server Components by default; `"use client"` only on the envelope intro, music player, header, countdown, RSVP form and the scroll fade-in wrapper.

## Setting up services

**Supabase.** Create a project, run `supabase/migrations/20261007000000_init.sql` then `supabase/seed.sql` in the SQL editor (or `supabase db push` with the CLI), and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Guests can insert RSVPs for published sites but never read them; `notification_email` is hidden from the anon key.

**RSVP email.** Set `RESEND_API_KEY` and `RSVP_FROM_EMAIL`, and fill `sites.notification_email` for each couple.

## Adding a couple (service phase)

1. Insert a `sites` row (slug, `theme_id = 'heirloom'`, `published = false`) and its `site_content` row. `supabase/seed.sql` is a complete example.
2. Preview it by setting `published = true` on a preview deployment, or by adding the same data to `content/sites/` locally (couple sign-in arrives with the self-serve phase).
3. Set `published = true`. The page refreshes within a minute.
4. For a deployment per couple, create a Vercel project from this repo and set `DEFAULT_SITE_SLUG` to their slug.
