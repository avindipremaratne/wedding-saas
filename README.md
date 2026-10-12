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

Copy `.env.example` to `.env.local` and add the Supabase settings. Without them the bundled site in `content/sites/` still renders and RSVPs are printed to the terminal, but photos and videos won't load, because they live in Supabase Storage.

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
| `supabase/` | Schema migrations with Row Level Security (shared with the business website), storage bucket, and seed data |

Server Components by default; `"use client"` only on the envelope intro, music player, header, countdown, RSVP form and the scroll fade-in wrapper.

## Setting up services

**Supabase.** Create a project, run `supabase/migrations/20261007000000_init.sql` then `supabase/seed.sql` in the SQL editor (or `supabase db push` with the CLI), and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Guests can insert RSVPs for published sites but never read them; `notification_email` is hidden from the anon key.

**Photos and videos.** Run `supabase/migrations/20261012000000_storage.sql` in the SQL editor to create the public `site-media` bucket. Theme files live under `themes/<theme>/` (listed in `themes/heirloom/assets.json`) and each couple's under `sites/<slug>/`. The database stores paths inside the bucket, such as `sites/amali-ashen/hero.jpeg`; the app builds the full URL from `NEXT_PUBLIC_SUPABASE_URL`. To add or replace a photo, upload it in **Storage → site-media** and put its path in `site_content`.

**RSVP email.** Set `RESEND_API_KEY` and `RSVP_FROM_EMAIL`, and fill `sites.notification_email` for each couple.

## Adding a couple (service phase)

1. Insert a `sites` row (slug, `theme_id = 'heirloom'`, `published = false`) and its `site_content` row. `supabase/seed.sql` is a complete example.
2. Preview it by setting `published = true` on a preview deployment, or by adding the same data to `content/sites/` locally (couple sign-in arrives with the self-serve phase).
3. Set `published = true`. The page refreshes within a minute.
4. For a deployment per couple, create a Vercel project from this repo and set `DEFAULT_SITE_SLUG` to their slug.

## Notes and next steps

Reminders from setting this up. Tick them off as they're done.

**Before real guests use the RSVP form**

- [ ] Verify a sending domain in Resend (**Domains → Add domain**) and add the DNS records it lists where the domain is managed (for `amaliandashen.com`, likely Wix's domain settings). Until then the test sender `onboarding@resend.dev` can only email the Resend account's own address.
- [ ] Change `RSVP_FROM_EMAIL` to the verified sender, e.g. `Amali & Ashen <rsvp@amaliandashen.com>`.
- [ ] Set `sites.notification_email` in Supabase to the couple's real address.
- [ ] Later, with many couples: send from one business domain (e.g. `rsvp@yourbrand.com`) rather than verifying each couple's domain.

**Remaining work**

- [ ] Open pull requests and merge `feature/theme1-heirloom` (this repo) and `feature/landing-and-checkout` (business repo) into `main`.
- [ ] Deploy to Vercel from `main`, adding the same settings as `.env.local` (Supabase URL and keys, Resend key and sender). Then test on real phones, especially the iPhone envelope intro.
- [ ] Delete the `archive/business-stripe` branch on GitHub once the business repo is confirmed complete.

**Good to know**

- The **Emails** page in the Resend dashboard shows every RSVP email and whether it was delivered.
- After `git pull`, run `npm ci` (not `npm install`) so `package-lock.json` isn't rewritten.
- `.env.local` is only read when `npm run dev` starts: save it, then restart the server.
