# Wedding SaaS

The wedding website template: themeable wedding sites on Next.js 16. Theme 1 ("Heirloom") is the Amali & Ashen design ported from the Wix build; every couple-specific value is data, so a new couple is a new row (or file), not new code.

The business website (landing page, pricing, Stripe checkout) lives in a separate repo, `wedding-saas-business-website`. Both share one Supabase project, and this repo owns the database schema.

New to the project? Start with the plain-language guide, [Wedding SaaS: How Everything Works](https://claude.ai/code/artifact/f3fbbd39-ed84-4c0d-9e1b-d3cd418f42f4). Keep it updated as the project changes.

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
| `app/admin/` | The owner-only admin area: create and edit couples' sites, upload photos, preview drafts, manage RSVPs |
| `app/rsvps/[token]/` | A couple's private RSVP list (no login; the long token in the link is the key) |
| `proxy.ts` | Optional multi-tenant mode: serves `<slug>.<domain>` |
| `lib/` | Types, site loading (Supabase first, static fallback), dates, RSVP validation, email |
| `themes/heirloom/` | Theme 1: config (colours, assets), CSS module, sections |
| `themes/index.ts` | Theme registry, keyed by `themes.component_bundle_ref` |
| `content/sites/` | Bundled site data (also prerendered at build time) |
| `supabase/` | Schema migrations with Row Level Security (shared with the business website), storage bucket, and seed data |

Server Components by default; `"use client"` only on the envelope intro, music player, header, countdown, RSVP form, the scroll fade-in wrapper, and the admin forms.

## Setting up services

**Supabase.** Create a project, run `supabase/migrations/20261007000000_init.sql` then `supabase/seed.sql` in the SQL editor (or `supabase db push` with the CLI), and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Guests can insert RSVPs for published sites but never read them; `notification_email` is hidden from the anon key.

**Photos and videos.** Run `supabase/migrations/20261012000000_storage.sql` in the SQL editor to create the public `site-media` bucket. Theme files live under `themes/<theme>/` (listed in `themes/heirloom/assets.json`) and each couple's under `sites/<slug>/`. The database stores paths inside the bucket, such as `sites/amali-ashen/hero.jpeg`; the app builds the full URL from `NEXT_PUBLIC_SUPABASE_URL`. To add or replace a photo, upload it in **Storage → site-media** and put its path in `site_content`.

**RSVP email.** Set `RESEND_API_KEY` and `RSVP_FROM_EMAIL`, and fill `sites.notification_email` for each couple.

## Admin area

Sign in at `/admin` with `ADMIN_PASSWORD` (set it and `ADMIN_SESSION_SECRET` in `.env.local` and in Vercel; see `.env.example`). It is for the business owner only: couples never log in.

- **All sites**: every couple, with Live/Draft status and RSVP counts.
- **New site**: names, web address, date and time zone. Start blank, or copy another site's wording, attire, schedule and colours (photos, logo, venue, hosts and music always start empty).
- **Edit site**: every detail on the page, photo uploads (straight to Supabase Storage), gallery order, attire colours, schedule, music, theme colours, and the Published switch. **Preview** shows drafts exactly as guests will see them.
- **RSVPs**: the replies, with three ways for the couple to get them, used in any combination:
  1. **Email for each reply** (on/off, and the couple's address).
  2. **Spreadsheet**: download a `.csv` and send it.
  3. **Private link**: `/rsvps/<token>` shows the couple their live list and a download button. **New link** replaces it; **Turn off** disables it.

- **Enquiries**: messages from the business website's contact form (each is also emailed to you). Mark them as handled once answered. Needs `supabase/migrations/20261102000000_enquiries.sql`.

Changes appear on the live site straight away (the page cache is cleared on save). Custom requests beyond these fields (new sections, layout changes) are code changes.

**Before first use**, run `supabase/migrations/20261101000000_rsvp_options.sql` in the Supabase SQL editor. It adds the email on/off switch and the private-link column. Until it runs, RSVP emails keep working as before, but opening a site in the admin area shows an error.

## Adding a couple

1. In `/admin`, click **New site**, then fill in the details on the edit page and upload their photos.
2. Send the couple the **Preview**, or publish and send `/<slug>`. Make their changes and save.
3. On the **RSVPs** tab, set up the options they chose.
4. For a deployment per couple, create a Vercel project from this repo and set `DEFAULT_SITE_SLUG` to their slug.

## Notes and next steps

Reminders from setting this up. Tick them off as they're done.

**Before real guests use the RSVP form**

- [ ] Buy a business domain (ideally in Vercel → **Settings → Domains**), verify it in Resend (**Domains → Add domain**) and add the DNS records it lists. A `vercel.app` address can't be used. Until then the test sender `onboarding@resend.dev` can only email the Resend account's own address.
- [ ] Set `RSVP_FROM_EMAIL` in Vercel and `.env.local` to the verified sender, e.g. `RSVPs <rsvp@yourbrand.com>`, then redeploy.
- [ ] Set the couple's real email address in `/admin` → the site → **RSVPs** → **Email for each reply**.

**Remaining work**

- [x] Admin area: run `supabase/migrations/20261101000000_rsvp_options.sql` in the Supabase SQL editor, then add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to `.env.local` and to Vercel (**Settings → Environment Variables**) and redeploy.
- [ ] Enquiries: run `supabase/migrations/20261102000000_enquiries.sql` in the Supabase SQL editor (the business website saves its contact form here).
- [x] Open pull requests and merge `feature/theme1-heirloom` (this repo) and `feature/landing-and-checkout` (business repo) into `main`.
- [x] Deploy to Vercel from `main` (project `wedding-saas-siti`, https://wedding-saas-siti.vercel.app), adding the same settings as `.env.local`. Every merge into `main` now deploys automatically.
- [ ] Test on real phones, especially the iPhone envelope intro.
- [ ] Delete the `archive/business-stripe` branch on GitHub once the business repo is confirmed complete.

**Good to know**

- The **Emails** page in the Resend dashboard shows every RSVP email and whether it was delivered.
- After `git pull`, run `npm ci` (not `npm install`) so `package-lock.json` isn't rewritten.
- `.env.local` is only read when `npm run dev` starts: save it, then restart the server.
- **Envelope videos** are replaced in **Storage → site-media → themes/heirloom/** (`envelope-mobile.mp4`, `envelope-desktop.mp4`); no code change needed. The video fills the screen and crops whatever doesn't fit, so export the mobile one at **1080 × 1800** (the shape of a phone browser with its toolbars showing) and keep the design a little away from the edges. Start on the closed envelope standing still, end on plain ivory, and keep it under ~10 MB. Any sound in the video plays on the tap; the music starts after it ends. Browsers and Supabase may show the old file for up to an hour.
