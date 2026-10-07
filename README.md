# Wedding SaaS

Themeable wedding websites on Next.js 16. Theme 1 ("Heirloom") is the Amali & Ashen design ported from the Wix build; every couple-specific value is data, so a new couple is a new row (or file), not new code.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, example site at /amali-ashen
npm test           # unit tests (Vitest)
npm run lint
npm run typecheck
```

No keys are needed locally: without Supabase the bundled site in `content/sites/` is used and RSVPs are printed to the terminal; without Stripe the checkout button is disabled. Copy `.env.example` to `.env.local` to turn services on.

## How it fits together

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Product landing page with the "Start your site" checkout form |
| `app/[site]/page.tsx` | A couple's site at `/<slug>`, rendered by its theme |
| `app/actions/rsvp.ts` | Server Action: validates, saves to Supabase, emails the couple |
| `app/api/checkout`, `app/api/stripe/webhook` | Stripe Checkout and the webhook that records paid orders |
| `proxy.ts` | Serves a site at `/` (one deployment per couple) or on `<slug>.<domain>` (multi-tenant) |
| `lib/` | Types, site loading (Supabase first, static fallback), dates, RSVP validation, email, Stripe |
| `themes/heirloom/` | Theme 1: config (colours, assets), CSS module, sections |
| `themes/index.ts` | Theme registry, keyed by `themes.component_bundle_ref` |
| `content/sites/` | Bundled site data (also prerendered at build time) |
| `supabase/` | Schema migration with Row Level Security, and seed data |

Server Components by default; `"use client"` only on the envelope intro, music player, header, countdown, RSVP form and the scroll fade-in wrapper.

## Setting up services

**Supabase.** Create a project, run `supabase/migrations/20261007000000_init.sql` then `supabase/seed.sql` in the SQL editor (or `supabase db push` with the CLI), and set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. Guests can insert RSVPs for published sites but never read them; `notification_email` is hidden from the anon key.

**RSVP email.** Set `RESEND_API_KEY` and `RSVP_FROM_EMAIL`, and fill `sites.notification_email` for each couple.

**Stripe.** Create a product and price, set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` and optionally `STRIPE_CHECKOUT_MODE=subscription`. Add a webhook for `checkout.session.completed` pointing at `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`. Paid checkouts land in the `orders` table for onboarding.

## Adding a couple (service phase)

1. Insert a `sites` row (slug, `theme_id = 'heirloom'`, `published = false`) and its `site_content` row. `supabase/seed.sql` is a complete example.
2. Preview it by setting `published = true` on a preview deployment, or by adding the same data to `content/sites/` locally (couple sign-in arrives with the self-serve phase).
3. Set `published = true`. The page refreshes within a minute.
