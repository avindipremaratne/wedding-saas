// Starting content for a site created from scratch in the admin area: enough
// for the Heirloom theme to render, with wording the admin then edits.

import { heirloomReferenceSite } from "@/content/sites/heirloom-reference";
import type { SiteContentRow } from "@/lib/admin/site-form";

export function blankSiteContent(options: {
  coupleNames: [string, string];
  weddingDate: string;
  timeZone: string;
}): SiteContentRow {
  return {
    couple_names: options.coupleNames,
    wedding_date: options.weddingDate,
    wedding_end: null,
    time_zone: options.timeZone,
    ceremony_time: "",
    rsvp_deadline: null,
    venue: { name: "", city: "", addressLines: [], mapsUrl: "" },
    hero_photo_url: "",
    gallery_photo_urls: [],
    palette_override: null,
    music_track_url: null,
    story_text: null,
    schedule: [],
    theme_data: {
      tagline: "Where We Become Us",
      heroKicker: "We're getting married",
      invitation: {
        lead: "With hearts full of love and joy,",
        hosts: [],
        inviteLine: "invite you to celebrate the union of",
      },
      rsvpPrompt: "We would be honoured to have you celebrate with us.",
      footerTagline: "The Beginning of Always",
      // The designer credit in the footer: the business, same as the reference site.
      credit: heirloomReferenceSite.content.details.credit,
    },
  };
}
