import "server-only";
import { heirloomReferenceSite } from "@/content/sites/heirloom-reference";
import { mediaUrl } from "@/lib/media";
import { getSupabase } from "@/lib/supabase/server";
import type { HeirloomDetails, PlanTier, Site, SiteContent, ThemeId } from "@/lib/types";

// Static sites bundled with the app. They are the fallback when Supabase is
// not configured (local development) or has no row for the slug, and they
// are prerendered at build time.
const STATIC_SITES: Record<string, Site> = {
  [heirloomReferenceSite.slug]: heirloomReferenceSite,
};

/** Site shown at "/" (see app/page.tsx). */
export const DEFAULT_SITE_SLUG = process.env.DEFAULT_SITE_SLUG || heirloomReferenceSite.slug;

export function staticSiteSlugs(): string[] {
  return Object.keys(STATIC_SITES);
}

interface SiteRow {
  id: string;
  slug: string;
  theme_id: ThemeId;
  plan_tier: PlanTier;
  site_content: {
    couple_names: [string, string];
    wedding_date: string;
    wedding_end: string | null;
    time_zone: string;
    ceremony_time: string;
    rsvp_deadline: string | null;
    venue: SiteContent["venue"];
    hero_photo_url: string;
    gallery_photo_urls: string[] | null;
    palette_override: SiteContent["paletteOverride"] | null;
    music_track_url: string | null;
    story_text: string | null;
    schedule: SiteContent["schedule"] | null;
    theme_data: HeirloomDetails;
  } | null;
}

function fromRow(row: SiteRow): Site | null {
  const c = row.site_content;
  if (!c) return null;
  const names = c.couple_names.join(" and ");
  return {
    id: row.id,
    slug: row.slug,
    themeId: row.theme_id,
    planTier: row.plan_tier,
    content: {
      coupleNames: c.couple_names,
      weddingDate: c.wedding_date,
      weddingEnd: c.wedding_end ?? undefined,
      timeZone: c.time_zone,
      ceremonyTime: c.ceremony_time,
      rsvpDeadline: c.rsvp_deadline ?? undefined,
      venue: c.venue,
      // Media columns hold bucket paths (or, in older rows, full URLs).
      heroPhoto: { src: mediaUrl(c.hero_photo_url), alt: names },
      galleryPhotos: (c.gallery_photo_urls ?? []).map((src, i) => ({
        src: mediaUrl(src),
        alt: `${names}, photo ${i + 1}`,
      })),
      paletteOverride: c.palette_override ?? undefined,
      musicTrackUrl: c.music_track_url ?? undefined,
      storyText: c.story_text ?? undefined,
      schedule: c.schedule ?? [],
      details: {
        ...c.theme_data,
        logoUrl: c.theme_data.logoUrl ? mediaUrl(c.theme_data.logoUrl) : undefined,
      },
    },
  };
}

async function fetchFromSupabase(slug: string): Promise<Site | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // RLS only exposes published sites to the anon key.
  const { data, error } = await supabase
    .from("sites")
    .select("id, slug, theme_id, plan_tier, site_content(*)")
    .eq("slug", slug)
    .maybeSingle<SiteRow>();

  if (error) {
    console.error(`[sites] Supabase lookup failed for "${slug}":`, error.message);
    return null;
  }
  return data ? fromRow(data) : null;
}

export async function getSite(slug: string): Promise<Site | null> {
  const normalized = slug.toLowerCase();
  return (await fetchFromSupabase(normalized)) ?? STATIC_SITES[normalized] ?? null;
}
