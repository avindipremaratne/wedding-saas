import { mediaUrl } from "@/lib/media";
import type { Site } from "@/lib/types";

const SLUG = "amali-ashen";

// Photos live in the Supabase Storage bucket under sites/<slug>/.
const photo = (name: string) => mediaUrl(`sites/${SLUG}/${name}`);

// Theme 1's reference site (Amali & Ashen): everything that was hardcoded in
// the Wix build, pulled out into data. It is the fallback when Supabase has
// no row for the slug; supabase/seed.sql inserts the same content.
export const heirloomReferenceSite: Site = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: SLUG,
  themeId: "heirloom",
  planTier: "demo",
  content: {
    coupleNames: ["Amali", "Ashen"],
    weddingDate: "2026-08-27T15:00:00-03:00",
    weddingEnd: "2026-08-27T20:00:00-03:00",
    timeZone: "America/Halifax",
    ceremonyTime: "3:00 PM AST (2:00 PM EST)",
    rsvpDeadline: "2026-08-20",
    venue: {
      name: "St. Thomas Aquinas Church",
      city: "Halifax, Nova Scotia",
      addressLines: ["1725 Oxford St,", "Halifax, NS B3H 3Z7"],
      mapsUrl:
        "https://www.google.com/maps/place/St.+Thomas+Aquinas+%26+Canadian+Martyrs+Church/@44.6414593,-63.5982412,17z/data=!4m6!3m5!1s0x4b5a2227c11922ad:0xc4fd0eb63325b849!8m2!3d44.6414593!4d-63.5982412!16s%2Fg%2F1tj525h4",
      description:
        "A place of faith, love and blessings.\nWe are delighted to celebrate this special moment\nsurrounded by our family and friends.",
    },
    heroPhoto: {
      src: photo("hero.jpeg"),
      alt: "Amali and Ashen",
    },
    // Fixed order on purpose: the Wix CMS returned photos in a
    // non-deterministic order, so the gallery is a static ordered array.
    galleryPhotos: [
      { src: photo("gallery-01.jpg"), alt: "Journey moment 1" },
      { src: photo("gallery-02.jpg"), alt: "Journey moment 2" },
      { src: photo("gallery-03.jpg"), alt: "Journey moment 3" },
      { src: photo("gallery-04.jpg"), alt: "Journey moment 4" },
      { src: photo("gallery-05.jpg"), alt: "Journey moment 5" },
    ],
    musicTrackUrl: "https://www.youtube.com/watch?v=7maJOI3QMu0",
    storyText: "Before forever, there was this — our story in moments.",
    schedule: [],
    details: {
      logoUrl: photo("logo.png"),
      tagline: "Where We Become Us",
      heroKicker: "We're getting married",
      verse: {
        text: "“Love is patient, love is kind… it always protects, always trusts, always hopes, always perseveres.”",
        reference: "1 Corinthians 13:4–7",
      },
      invitation: {
        lead: "With hearts full of love and joy,",
        hosts: ["Mr. & Mrs. Fernando", "Mr. & Mrs. Perera"],
        inviteLine: "invite you to celebrate the union of",
      },
      attire: {
        title: "Modern Heirloom",
        intro:
          "We kindly invite our guests to dress in elegant, timeless attire as we celebrate this special day together.",
        ladies:
          "Ladies are encouraged to choose elegant formal dresses or coordinated ensembles in keeping with the theme.",
        gentlemen: "Gentlemen are kindly asked to wear a dark suit; tie is optional.",
        palette: [
          { color: "#F7E6CA", name: "Champagne" },
          { color: "#B9A281", name: "Taupe" },
          { color: "#DCCFC0", name: "Beige" },
          { color: "#D8B7B2", name: "Dusty Rose" },
          { color: "#B9C3AE", name: "Sage" },
          { color: "#6D3B07", name: "Mocha" },
          { color: "#B7B2AC", name: "Stone Grey" },
          { color: "#987B71", name: "Soft Cocoa" },
        ],
        note: "We kindly ask that guests refrain from wearing white, ivory, cream, or shades closely resembling the bridal gown.",
      },
      rsvpPrompt: "Will you join us as we become us?",
      footerTagline: "The Beginning of Always",
      credit: {
        name: "Avindi Premaratne",
        email: "avindibuthmini@gmail.com",
        phone: "+15197313490",
      },
    },
  },
};
