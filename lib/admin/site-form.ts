// The admin site editor's form: turning a database row into form values and
// a submitted form back into validated column values. Pure (no Next.js or
// Supabase imports), so it is unit tested in tests/site-form.test.ts.

import { slugError } from "@/lib/slug";
import type { HeirloomDetails, ScheduleItem, ThemeColors, ThemeId } from "@/lib/types";
import { youtubeVideoId } from "@/lib/youtube";
import { isoToZonedLocal, isValidTimeZone, zonedLocalToIso } from "@/lib/zoned";

export const THEME_COLOR_KEYS = ["gold", "navy", "ivory", "linen", "silk", "ink", "charcoal", "porcelain"] as const;

export interface PaletteSwatch {
  name: string;
  color: string;
}

/** Everything the editor shows, as plain strings and lists. */
export interface SiteFormValues {
  slug: string;
  published: boolean;
  themeId: ThemeId;
  coupleName1: string;
  coupleName2: string;
  weddingDate: string; // "YYYY-MM-DDTHH:mm" in timeZone
  weddingEnd: string;
  timeZone: string;
  ceremonyTime: string;
  rsvpDeadline: string; // "YYYY-MM-DD"
  venueName: string;
  venueCity: string;
  venueAddress: string; // one line per address line
  venueMapsUrl: string;
  venueDescription: string;
  heroPhoto: string; // bucket path
  logo: string;
  gallery: string[];
  musicTrackUrl: string;
  storyText: string;
  tagline: string;
  heroKicker: string;
  verseText: string;
  verseReference: string;
  invitationLead: string;
  invitationHosts: string; // one host per line
  inviteLine: string;
  rsvpPrompt: string;
  footerTagline: string;
  creditName: string;
  creditEmail: string;
  creditPhone: string;
  attireEnabled: boolean;
  attireTitle: string;
  attireIntro: string;
  attireLadies: string;
  attireGentlemen: string;
  attirePalette: PaletteSwatch[];
  attireNote: string;
  schedule: ScheduleItem[];
  colors: Partial<ThemeColors>; // only the colours that differ from the theme
}

/** The site_content columns, as Supabase reads and writes them. */
export interface SiteContentRow {
  couple_names: [string, string];
  wedding_date: string;
  wedding_end: string | null;
  time_zone: string;
  ceremony_time: string;
  rsvp_deadline: string | null;
  venue: { name: string; city: string; addressLines: string[]; mapsUrl: string; description?: string };
  hero_photo_url: string;
  gallery_photo_urls: string[] | null;
  palette_override: Partial<ThemeColors> | null;
  music_track_url: string | null;
  story_text: string | null;
  schedule: ScheduleItem[] | null;
  theme_data: HeirloomDetails;
}

export interface SiteRowForAdmin {
  slug: string;
  published: boolean;
  theme_id: ThemeId;
  site_content: SiteContentRow;
}

export function toFormValues(row: SiteRowForAdmin): SiteFormValues {
  const c = row.site_content;
  const d = c.theme_data ?? ({} as HeirloomDetails);
  return {
    slug: row.slug,
    published: row.published,
    themeId: row.theme_id,
    coupleName1: c.couple_names[0] ?? "",
    coupleName2: c.couple_names[1] ?? "",
    weddingDate: isoToZonedLocal(c.wedding_date, c.time_zone),
    weddingEnd: c.wedding_end ? isoToZonedLocal(c.wedding_end, c.time_zone) : "",
    timeZone: c.time_zone,
    ceremonyTime: c.ceremony_time,
    rsvpDeadline: c.rsvp_deadline ?? "",
    venueName: c.venue?.name ?? "",
    venueCity: c.venue?.city ?? "",
    venueAddress: (c.venue?.addressLines ?? []).join("\n"),
    venueMapsUrl: c.venue?.mapsUrl ?? "",
    venueDescription: c.venue?.description ?? "",
    heroPhoto: c.hero_photo_url ?? "",
    logo: d.logoUrl ?? "",
    gallery: c.gallery_photo_urls ?? [],
    musicTrackUrl: c.music_track_url ?? "",
    storyText: c.story_text ?? "",
    tagline: d.tagline ?? "",
    heroKicker: d.heroKicker ?? "",
    verseText: d.verse?.text ?? "",
    verseReference: d.verse?.reference ?? "",
    invitationLead: d.invitation?.lead ?? "",
    invitationHosts: (d.invitation?.hosts ?? []).join("\n"),
    inviteLine: d.invitation?.inviteLine ?? "",
    rsvpPrompt: d.rsvpPrompt ?? "",
    footerTagline: d.footerTagline ?? "",
    creditName: d.credit?.name ?? "",
    creditEmail: d.credit?.email ?? "",
    creditPhone: d.credit?.phone ?? "",
    attireEnabled: Boolean(d.attire),
    attireTitle: d.attire?.title ?? "",
    attireIntro: d.attire?.intro ?? "",
    attireLadies: d.attire?.ladies ?? "",
    attireGentlemen: d.attire?.gentlemen ?? "",
    attirePalette: d.attire?.palette ?? [],
    attireNote: d.attire?.note ?? "",
    schedule: c.schedule ?? [],
    colors: c.palette_override ?? {},
  };
}

export type SiteFormErrors = Partial<Record<keyof SiteFormValues, string>>;

export type SiteFormResult =
  | {
      ok: true;
      site: { slug: string; published: boolean; theme_id: ThemeId };
      content: SiteContentRow;
    }
  | { ok: false; errors: SiteFormErrors };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_TEXT = 4000;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function lines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function json<T>(formData: FormData, key: string, fallback: T): T {
  try {
    const parsed = JSON.parse(text(formData, key) || "null");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/** A Storage path (e.g. "sites/amali-ashen/hero.jpeg") or a full URL. */
function isMediaRef(value: string): boolean {
  if (isHttpUrl(value)) return true;
  return /^[\w][\w./-]{0,300}$/.test(value) && !value.includes("..");
}

const optional = (value: string) => value || undefined;

export function parseSiteForm(formData: FormData, defaults: { colors: ThemeColors }): SiteFormResult {
  const errors: SiteFormErrors = {};
  const tooLong = (key: keyof SiteFormValues, value: string, max = MAX_TEXT) => {
    if (value.length > max) errors[key] = "This is too long.";
  };

  const slug = text(formData, "slug").toLowerCase();
  const slugProblem = slugError(slug);
  if (slugProblem) errors.slug = slugProblem;

  const themeId = (text(formData, "themeId") || "heirloom") as ThemeId;

  const name1 = text(formData, "coupleName1");
  const name2 = text(formData, "coupleName2");
  if (!name1) errors.coupleName1 = "Please enter the first name.";
  if (!name2) errors.coupleName2 = "Please enter the second name.";
  tooLong("coupleName1", name1, 60);
  tooLong("coupleName2", name2, 60);

  const timeZone = text(formData, "timeZone");
  if (!isValidTimeZone(timeZone)) errors.timeZone = "Choose a time zone from the list, e.g. America/Halifax.";

  const weddingDate = zonedLocalToIso(text(formData, "weddingDate"), timeZone);
  if (!weddingDate && !errors.timeZone) errors.weddingDate = "Please enter the date and start time.";
  const endLocal = text(formData, "weddingEnd");
  const weddingEnd = endLocal ? zonedLocalToIso(endLocal, timeZone) : null;
  if (endLocal && !weddingEnd && !errors.timeZone) errors.weddingEnd = "Please enter a valid end time.";
  if (weddingDate && weddingEnd && weddingEnd <= weddingDate) errors.weddingEnd = "The end must be after the start.";

  const ceremonyTime = text(formData, "ceremonyTime");
  if (!ceremonyTime) errors.ceremonyTime = 'Please enter the time as guests should see it, e.g. "3:00 PM".';
  tooLong("ceremonyTime", ceremonyTime, 120);

  const rsvpDeadline = text(formData, "rsvpDeadline");
  if (rsvpDeadline && !DATE_PATTERN.test(rsvpDeadline)) errors.rsvpDeadline = "Please enter a valid date.";

  const venueName = text(formData, "venueName");
  if (!venueName) errors.venueName = "Please enter the venue name.";
  const venueMapsUrl = text(formData, "venueMapsUrl");
  if (venueMapsUrl && !isHttpUrl(venueMapsUrl)) errors.venueMapsUrl = "Paste the full link, starting with https://";

  const heroPhoto = text(formData, "heroPhoto");
  if (heroPhoto && !isMediaRef(heroPhoto)) errors.heroPhoto = "That photo path is not valid.";
  const logo = text(formData, "logo");
  if (logo && !isMediaRef(logo)) errors.logo = "That logo path is not valid.";
  const gallery = json<unknown[]>(formData, "gallery", []).filter(
    (item): item is string => typeof item === "string" && isMediaRef(item),
  );

  const musicTrackUrl = text(formData, "musicTrackUrl");
  if (musicTrackUrl && !youtubeVideoId(musicTrackUrl)) errors.musicTrackUrl = "Paste a YouTube link, e.g. https://www.youtube.com/watch?v=…";

  const creditEmail = text(formData, "creditEmail");
  if (creditEmail && !EMAIL_PATTERN.test(creditEmail)) errors.creditEmail = "Please enter a valid email address.";

  const attireEnabled = formData.get("attireEnabled") === "on";
  const palette = json<unknown[]>(formData, "attirePalette", [])
    .filter((s): s is PaletteSwatch => typeof s === "object" && s !== null && typeof (s as PaletteSwatch).name === "string")
    .map((s) => ({ name: s.name.trim(), color: String(s.color ?? "").trim() }))
    .filter((s) => s.name || s.color);
  if (palette.some((s) => !s.name || !HEX_COLOR.test(s.color))) errors.attirePalette = "Each colour needs a name and a colour.";

  const schedule = json<unknown[]>(formData, "schedule", [])
    .filter((s): s is ScheduleItem => typeof s === "object" && s !== null)
    .map((s) => ({
      name: String(s.name ?? "").trim(),
      startTime: String(s.startTime ?? "").trim(),
      endTime: optional(String(s.endTime ?? "").trim()),
      location: optional(String(s.location ?? "").trim()),
      description: optional(String(s.description ?? "").trim()),
    }))
    .filter((s) => s.name || s.startTime || s.location || s.description);
  if (schedule.some((s) => !s.name || !s.startTime)) errors.schedule = "Each event needs a name and a start time.";

  const overrides: Partial<ThemeColors> = {};
  for (const key of THEME_COLOR_KEYS) {
    const value = text(formData, `color_${key}`).toLowerCase();
    if (!value) continue;
    if (!HEX_COLOR.test(value)) {
      errors.colors = "Colours must be in the form #RRGGBB.";
      continue;
    }
    if (value !== defaults.colors[key].toLowerCase()) overrides[key] = value;
  }

  const textFields: (keyof SiteFormValues)[] = [
    "venueDescription", "storyText", "verseText", "invitationLead", "invitationHosts", "inviteLine",
    "rsvpPrompt", "footerTagline", "attireIntro", "attireLadies", "attireGentlemen", "attireNote",
  ];
  for (const key of textFields) tooLong(key, text(formData, key));

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const verseText = text(formData, "verseText");
  const creditName = text(formData, "creditName");
  const theme_data: HeirloomDetails = {
    logoUrl: optional(logo),
    tagline: text(formData, "tagline"),
    heroKicker: text(formData, "heroKicker"),
    verse: verseText ? { text: verseText, reference: text(formData, "verseReference") } : undefined,
    invitation: {
      lead: text(formData, "invitationLead"),
      hosts: lines(text(formData, "invitationHosts")),
      inviteLine: text(formData, "inviteLine"),
    },
    attire: attireEnabled
      ? {
          title: text(formData, "attireTitle"),
          intro: text(formData, "attireIntro"),
          ladies: text(formData, "attireLadies"),
          gentlemen: text(formData, "attireGentlemen"),
          palette,
          note: optional(text(formData, "attireNote")),
        }
      : undefined,
    rsvpPrompt: text(formData, "rsvpPrompt"),
    footerTagline: text(formData, "footerTagline"),
    credit: creditName
      ? { name: creditName, email: optional(creditEmail), phone: optional(text(formData, "creditPhone")) }
      : undefined,
  };

  return {
    ok: true,
    site: { slug, published: formData.get("published") === "on", theme_id: themeId },
    content: {
      couple_names: [name1, name2],
      wedding_date: weddingDate!,
      wedding_end: weddingEnd,
      time_zone: timeZone,
      ceremony_time: ceremonyTime,
      rsvp_deadline: rsvpDeadline || null,
      venue: {
        name: venueName,
        city: text(formData, "venueCity"),
        addressLines: lines(text(formData, "venueAddress")),
        mapsUrl: venueMapsUrl,
        description: optional(text(formData, "venueDescription")),
      },
      hero_photo_url: heroPhoto,
      gallery_photo_urls: gallery,
      palette_override: Object.keys(overrides).length > 0 ? overrides : null,
      music_track_url: musicTrackUrl || null,
      story_text: text(formData, "storyText") || null,
      schedule,
      theme_data: JSON.parse(JSON.stringify(theme_data)), // drop undefined keys
    },
  };
}
