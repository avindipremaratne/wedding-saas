import { mediaUrl } from "@/lib/media";
import type { Site } from "@/lib/types";

const WIX = "https://static.wixstatic.com/media";
const SLUG = "amali-ashen";

// Photos live in the Supabase Storage bucket under sites/<slug>/ (copied by
// `npm run media:migrate`); the Wix URL is only a fallback for a checkout
// without NEXT_PUBLIC_MEDIA_URL.
const photo = (name: string, wixFile: string) => mediaUrl(`sites/${SLUG}/${name}`, `${WIX}/${wixFile}`);

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
      src: photo("hero.jpeg", "b5e630_5146772074b643ac90882b1e50aba8d2~mv2.jpeg"),
      alt: "Amali and Ashen",
    },
    // Fixed order on purpose: the Wix CMS returned photos in a
    // non-deterministic order, so the gallery is a static ordered array.
    galleryPhotos: [
      { src: photo("gallery-01.jpg", "b5e630_80c27a2802be428a8b3a404cdab5c878~mv2.jpg"), alt: "Journey moment 1" },
      { src: photo("gallery-02.jpg", "b5e630_46a0f3cec01a47a99162a0a6cb6fc0ab~mv2.jpg"), alt: "Journey moment 2" },
      { src: photo("gallery-03.jpg", "b5e630_f2ab7a1bc0644fc19d3c1d8837feb462~mv2.jpg"), alt: "Journey moment 3" },
      { src: photo("gallery-04.jpg", "b5e630_1c156a7d317148a89a42dabb06c4df9e~mv2.jpg"), alt: "Journey moment 4" },
      { src: photo("gallery-05.jpg", "b5e630_74ddea6e0f1f4ec28d1135fccb7eb9d6~mv2.jpg"), alt: "Journey moment 5" },
    ],
    musicTrackUrl: "https://www.youtube.com/watch?v=7maJOI3QMu0",
    storyText: "Before forever, there was this — our story in moments.",
    schedule: [],
    details: {
      logoUrl: photo("logo.png", "b5e630_ded37eca146a4ec2852495daf970742e~mv2.png"),
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
