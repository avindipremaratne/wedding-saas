import "server-only";
import { requireAdminPage } from "@/lib/admin/auth";
import type { SiteContentRow } from "@/lib/admin/site-form";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { PlanTier, ThemeId } from "@/lib/types";

// Reads for the admin area. Everything goes through the service role key
// (drafts and RSVPs are hidden from the public key), so every function here
// checks the admin session first (sending signed-out visitors to the login
// page: pages render alongside their layout, so they cannot rely on it).

export interface AdminSiteSummary {
  id: string;
  slug: string;
  published: boolean;
  coupleNames: [string, string];
  weddingDate: string | null;
  timeZone: string;
  rsvps: { yes: number; no: number };
}

export interface AdminSite {
  id: string;
  slug: string;
  published: boolean;
  theme_id: ThemeId;
  plan_tier: PlanTier;
  notification_email: string | null;
  rsvp_email_enabled: boolean;
  rsvp_share_token: string | null;
  site_content: SiteContentRow | null;
}

export interface RsvpRow {
  id: string;
  guest_name: string;
  email: string;
  attending: boolean;
  message: string | null;
  created_at: string;
}

export function requireSupabaseAdmin() {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  return admin;
}

export async function listSites(): Promise<AdminSiteSummary[]> {
  await requireAdminPage();
  const { data, error } = await requireSupabaseAdmin()
    .from("sites")
    .select("id, slug, published, created_at, site_content(couple_names, wedding_date, time_zone), rsvps(attending)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load sites: ${error.message}`);

  type Row = {
    id: string;
    slug: string;
    published: boolean;
    site_content: { couple_names: [string, string]; wedding_date: string; time_zone: string } | null;
    rsvps: { attending: boolean }[];
  };
  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    published: row.published,
    coupleNames: row.site_content?.couple_names ?? ["?", "?"],
    weddingDate: row.site_content?.wedding_date ?? null,
    timeZone: row.site_content?.time_zone ?? "UTC",
    rsvps: {
      yes: row.rsvps.filter((r) => r.attending).length,
      no: row.rsvps.filter((r) => !r.attending).length,
    },
  }));
}

const SITE_COLUMNS =
  "id, slug, published, theme_id, plan_tier, notification_email, rsvp_email_enabled, rsvp_share_token, site_content(*)";

export async function getAdminSite(id: string): Promise<AdminSite | null> {
  await requireAdminPage();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await requireSupabaseAdmin()
    .from("sites")
    .select(SITE_COLUMNS)
    .eq("id", id)
    .maybeSingle<AdminSite>();
  if (error) throw new Error(`Could not load the site: ${error.message}`);
  return data;
}

export async function listRsvps(siteId: string): Promise<RsvpRow[]> {
  await requireAdminPage();
  return fetchRsvps(siteId);
}

async function fetchRsvps(siteId: string): Promise<RsvpRow[]> {
  const { data, error } = await requireSupabaseAdmin()
    .from("rsvps")
    .select("id, guest_name, email, attending, message, created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Could not load RSVPs: ${error.message}`);
  return data as RsvpRow[];
}

/**
 * For the couple's private link (no admin session): the token in the URL is
 * the only key, so it must match exactly and be long enough to be unguessable.
 */
export async function getSharedRsvps(
  token: string,
): Promise<{ coupleNames: [string, string]; slug: string; timeZone: string; rsvps: RsvpRow[] } | null> {
  if (!/^[A-Za-z0-9_-]{32,}$/.test(token)) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data } = await admin
    .from("sites")
    .select("id, slug, site_content(couple_names, time_zone)")
    .eq("rsvp_share_token", token)
    .maybeSingle<{ id: string; slug: string; site_content: { couple_names: [string, string]; time_zone: string } | null }>();
  if (!data) return null;
  return {
    slug: data.slug,
    coupleNames: data.site_content?.couple_names ?? ["", ""],
    timeZone: data.site_content?.time_zone ?? "UTC",
    rsvps: await fetchRsvps(data.id),
  };
}

export interface EnquiryRow {
  id: string;
  names: string;
  email: string;
  phone: string | null;
  wedding_date: string | null;
  design: string | null;
  message: string | null;
  handled: boolean;
  created_at: string;
}

/** Enquiries from the business website, newest first. Null if the table is missing. */
export async function listEnquiries(): Promise<EnquiryRow[] | null> {
  await requireAdminPage();
  const { data, error } = await requireSupabaseAdmin()
    .from("enquiries")
    .select("id, names, email, phone, wedding_date, design, message, handled, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin] Could not load enquiries:", error.message);
    return null;
  }
  return data as EnquiryRow[];
}
