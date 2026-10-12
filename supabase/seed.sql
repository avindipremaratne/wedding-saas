-- Seed data: the Heirloom theme and the Amali & Ashen reference site.
-- Mirrors content/sites/heirloom-reference.ts. Photo columns hold paths in
-- the site-media Storage bucket; the app turns them into full URLs.
-- Safe to re-run: existing site content is left untouched, so edits made in
-- the dashboard and migrated photo URLs are never overwritten.

insert into public.themes (id, name, component_bundle_ref)
values ('heirloom', 'Heirloom', 'heirloom')
on conflict (id) do update set name = excluded.name, component_bundle_ref = excluded.component_bundle_ref;

insert into public.sites (id, slug, theme_id, plan_tier, published)
values ('00000000-0000-4000-8000-000000000001', 'amali-ashen', 'heirloom', 'demo', true)
on conflict (id) do update set slug = excluded.slug, theme_id = excluded.theme_id,
  plan_tier = excluded.plan_tier, published = excluded.published;

insert into public.site_content (
  site_id, couple_names, wedding_date, wedding_end, time_zone, ceremony_time, rsvp_deadline,
  venue, hero_photo_url, gallery_photo_urls, palette_override, music_track_url, story_text,
  schedule, theme_data
) values (
  '00000000-0000-4000-8000-000000000001',
  array['Amali', 'Ashen'],
  '2026-08-27T15:00:00-03:00',
  '2026-08-27T20:00:00-03:00',
  'America/Halifax',
  '3:00 PM AST (2:00 PM EST)',
  '2026-08-20',
  '{
  "name": "St. Thomas Aquinas Church",
  "city": "Halifax, Nova Scotia",
  "addressLines": [
    "1725 Oxford St,",
    "Halifax, NS B3H 3Z7"
  ],
  "mapsUrl": "https://www.google.com/maps/place/St.+Thomas+Aquinas+%26+Canadian+Martyrs+Church/@44.6414593,-63.5982412,17z/data=!4m6!3m5!1s0x4b5a2227c11922ad:0xc4fd0eb63325b849!8m2!3d44.6414593!4d-63.5982412!16s%2Fg%2F1tj525h4",
  "description": "A place of faith, love and blessings.\nWe are delighted to celebrate this special moment\nsurrounded by our family and friends."
}'::jsonb,
  'sites/amali-ashen/hero.jpeg',
  array['sites/amali-ashen/gallery-01.jpg', 'sites/amali-ashen/gallery-02.jpg', 'sites/amali-ashen/gallery-03.jpg', 'sites/amali-ashen/gallery-04.jpg', 'sites/amali-ashen/gallery-05.jpg'],
  null,
  'https://www.youtube.com/watch?v=7maJOI3QMu0',
  'Before forever, there was this — our story in moments.',
  '[]'::jsonb,
  '{
  "logoUrl": "sites/amali-ashen/logo.png",
  "tagline": "Where We Become Us",
  "heroKicker": "We''re getting married",
  "verse": {
    "text": "“Love is patient, love is kind… it always protects, always trusts, always hopes, always perseveres.”",
    "reference": "1 Corinthians 13:4–7"
  },
  "invitation": {
    "lead": "With hearts full of love and joy,",
    "hosts": [
      "Mr. & Mrs. Fernando",
      "Mr. & Mrs. Perera"
    ],
    "inviteLine": "invite you to celebrate the union of"
  },
  "attire": {
    "title": "Modern Heirloom",
    "intro": "We kindly invite our guests to dress in elegant, timeless attire as we celebrate this special day together.",
    "ladies": "Ladies are encouraged to choose elegant formal dresses or coordinated ensembles in keeping with the theme.",
    "gentlemen": "Gentlemen are kindly asked to wear a dark suit; tie is optional.",
    "palette": [
      {
        "color": "#F7E6CA",
        "name": "Champagne"
      },
      {
        "color": "#B9A281",
        "name": "Taupe"
      },
      {
        "color": "#DCCFC0",
        "name": "Beige"
      },
      {
        "color": "#D8B7B2",
        "name": "Dusty Rose"
      },
      {
        "color": "#B9C3AE",
        "name": "Sage"
      },
      {
        "color": "#6D3B07",
        "name": "Mocha"
      },
      {
        "color": "#B7B2AC",
        "name": "Stone Grey"
      },
      {
        "color": "#987B71",
        "name": "Soft Cocoa"
      }
    ],
    "note": "We kindly ask that guests refrain from wearing white, ivory, cream, or shades closely resembling the bridal gown."
  },
  "rsvpPrompt": "Will you join us as we become us?",
  "footerTagline": "The Beginning of Always",
  "credit": {
    "name": "Avindi Premaratne",
    "email": "avindibuthmini@gmail.com",
    "phone": "+15197313490"
  }
}'::jsonb
)
on conflict (site_id) do nothing;
