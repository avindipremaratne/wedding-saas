// Shared shapes for a couple's site. These mirror the Supabase tables in
// supabase/migrations (snake_case there, camelCase here) so the same data can
// come from a static file during development or from the database in production.

export type ThemeId = "heirloom";

export interface ThemeColors {
  gold: string;
  navy: string;
  ivory: string;
  linen: string;
  silk: string;
  ink: string;
  charcoal: string;
  porcelain: string;
}

export interface Photo {
  src: string;
  alt: string;
  /** Intrinsic size, used by next/image to reserve space before load. */
  width?: number;
  height?: number;
}

export interface ScheduleItem {
  name: string;
  /** Display string, e.g. "3:00 PM". */
  startTime: string;
  endTime?: string;
  location?: string;
  description?: string;
}

export interface Venue {
  name: string;
  city: string;
  addressLines: string[];
  mapsUrl: string;
  description?: string;
}

/** Content that is specific to the Heirloom theme (site_content.theme_data). */
export interface HeirloomDetails {
  logoUrl?: string;
  tagline: string;
  heroKicker: string;
  verse?: { text: string; reference: string };
  invitation: {
    lead: string;
    hosts: string[];
    inviteLine: string;
  };
  attire?: {
    title: string;
    intro: string;
    ladies: string;
    gentlemen: string;
    palette: { name: string; color: string }[];
    note?: string;
  };
  rsvpPrompt: string;
  footerTagline: string;
  credit?: { name: string; email?: string; phone?: string };
}

export interface SiteContent {
  coupleNames: [string, string];
  /** ISO 8601 with offset, e.g. "2026-08-27T15:00:00-03:00". */
  weddingDate: string;
  /** ISO 8601 with offset, used for calendar invites. */
  weddingEnd?: string;
  /** IANA zone used to format dates, e.g. "America/Halifax". */
  timeZone: string;
  /** Display string, e.g. "3:00 PM AST". */
  ceremonyTime: string;
  /** ISO date (YYYY-MM-DD) guests should reply by. */
  rsvpDeadline?: string;
  venue: Venue;
  heroPhoto: Photo;
  galleryPhotos: Photo[];
  paletteOverride?: Partial<ThemeColors>;
  /** YouTube URL or video id. */
  musicTrackUrl?: string;
  storyText?: string;
  schedule: ScheduleItem[];
  details: HeirloomDetails;
}

export type PlanTier = "demo" | "standard" | "premium";

export interface Site {
  id: string;
  slug: string;
  themeId: ThemeId;
  planTier: PlanTier;
  content: SiteContent;
}
