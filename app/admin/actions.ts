"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin, endAdminSession, isAdminConfigured, startAdminSession } from "@/lib/admin/auth";
import { requireSupabaseAdmin } from "@/lib/admin/data";
import { blankSiteContent } from "@/lib/admin/defaults";
import { passwordMatches } from "@/lib/admin/session";
import { parseSiteForm, type SiteContentRow, type SiteFormErrors } from "@/lib/admin/site-form";
import { MEDIA_BUCKET } from "@/lib/media";
import { slugError } from "@/lib/slug";
import { isValidTimeZone, zonedLocalToIso } from "@/lib/zoned";
import { heirloomColors } from "@/themes/heirloom/config";

// Server Actions for the admin area. Each one is a public POST endpoint, so
// each checks the admin session itself; hiding a button is not security.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Clear cached copies of a couple's site so changes show at once. */
function refreshSite(...slugs: string[]) {
  for (const slug of new Set(slugs)) revalidatePath(`/${slug}`);
  revalidatePath("/");
  revalidatePath("/admin", "layout");
}

// ------------------------------------------------------------------ login

export type LoginState = { error?: string };

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "The admin area is switched off. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET first." };
  }
  if (!passwordMatches(text(formData, "password"), process.env.ADMIN_PASSWORD ?? "")) {
    await new Promise((resolve) => setTimeout(resolve, 800)); // slow down guessing
    return { error: "That password is not right." };
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

// ------------------------------------------------------------ create site

export type NewSiteState = { errors?: Record<string, string>; message?: string };

export async function createSite(_previous: NewSiteState, formData: FormData): Promise<NewSiteState> {
  await assertAdmin();
  const admin = requireSupabaseAdmin();

  const name1 = text(formData, "coupleName1");
  const name2 = text(formData, "coupleName2");
  const slug = text(formData, "slug").toLowerCase();
  const timeZone = text(formData, "timeZone");
  const weddingDate = zonedLocalToIso(text(formData, "weddingDate"), timeZone);
  const startFrom = text(formData, "startFrom");

  const errors: Record<string, string> = {};
  if (!name1) errors.coupleName1 = "Please enter the first name.";
  if (!name2) errors.coupleName2 = "Please enter the second name.";
  const slugProblem = slugError(slug);
  if (slugProblem) errors.slug = slugProblem;
  if (!isValidTimeZone(timeZone)) errors.timeZone = "Choose a time zone from the list.";
  else if (!weddingDate) errors.weddingDate = "Please enter the date and start time.";
  if (Object.keys(errors).length > 0) return { errors };

  let content: SiteContentRow = blankSiteContent({ coupleNames: [name1, name2], weddingDate: weddingDate!, timeZone });
  if (startFrom && startFrom !== "blank") {
    // Copy the wording, attire, schedule and colours from an existing site.
    // Anything personal to the other couple (photos, logo, venue, hosts,
    // music) starts empty, so none of it can go live on this site by mistake.
    const { data: source } = await admin
      .from("site_content")
      .select("*")
      .eq("site_id", startFrom)
      .maybeSingle<SiteContentRow & { site_id: string; updated_at: string }>();
    if (!source) return { message: "The site to copy from could not be found." };
    const copied: Record<string, unknown> = { ...source };
    delete copied.site_id;
    delete copied.updated_at;
    const base = copied as unknown as SiteContentRow;
    content = {
      ...base,
      couple_names: [name1, name2],
      wedding_date: weddingDate!,
      wedding_end: null,
      time_zone: timeZone,
      ceremony_time: "",
      rsvp_deadline: null,
      venue: { name: "", city: "", addressLines: [], mapsUrl: "" },
      hero_photo_url: "",
      gallery_photo_urls: [],
      music_track_url: null,
      theme_data: {
        ...base.theme_data,
        logoUrl: undefined,
        invitation: { ...base.theme_data.invitation, hosts: [] },
      },
    };
  }

  const { data: site, error } = await admin
    .from("sites")
    .insert({ slug, theme_id: "heirloom", plan_tier: "standard", published: false })
    .select("id")
    .single<{ id: string }>();
  if (error) {
    if (error.code === "23505") return { errors: { slug: "Another site already uses this address." } };
    console.error("[admin] Creating a site failed:", error.message);
    return { message: `Could not create the site: ${error.message}` };
  }

  const { error: contentError } = await admin.from("site_content").insert({ site_id: site.id, ...content });
  if (contentError) {
    await admin.from("sites").delete().eq("id", site.id);
    console.error("[admin] Creating site content failed:", contentError.message);
    return { message: `Could not create the site: ${contentError.message}` };
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/sites/${site.id}`);
}

// -------------------------------------------------------------- save site

export type SaveSiteState =
  | { status: "idle" }
  | { status: "saved"; savedAt: number }
  | { status: "error"; message: string; errors?: SiteFormErrors };

export async function saveSite(siteId: string, _previous: SaveSiteState, formData: FormData): Promise<SaveSiteState> {
  await assertAdmin();
  const admin = requireSupabaseAdmin();

  const parsed = parseSiteForm(formData, { colors: heirloomColors });
  if (!parsed.ok) return { status: "error", message: "Please fix the highlighted fields.", errors: parsed.errors };

  const { data: current } = await admin.from("sites").select("slug").eq("id", siteId).maybeSingle<{ slug: string }>();
  if (!current) return { status: "error", message: "This site no longer exists." };

  const { error } = await admin.from("sites").update(parsed.site).eq("id", siteId);
  if (error) {
    if (error.code === "23505") {
      return { status: "error", message: "Please fix the highlighted fields.", errors: { slug: "Another site already uses this address." } };
    }
    return { status: "error", message: `Could not save: ${error.message}` };
  }

  const { error: contentError } = await admin.from("site_content").update(parsed.content).eq("site_id", siteId);
  if (contentError) return { status: "error", message: `Could not save: ${contentError.message}` };

  refreshSite(current.slug, parsed.site.slug);
  return { status: "saved", savedAt: Date.now() };
}

export async function setPublished(siteId: string, published: boolean): Promise<void> {
  await assertAdmin();
  const admin = requireSupabaseAdmin();
  const { data } = await admin.from("sites").update({ published }).eq("id", siteId).select("slug").maybeSingle<{ slug: string }>();
  if (data) refreshSite(data.slug);
}

// ---------------------------------------------------------- photo uploads

const UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // the bucket's limit

export type UploadTarget = { path: string; token: string } | { error: string };

/**
 * Photos go straight from the browser to Supabase Storage (a server
 * request can only carry a few MB on Vercel). This hands out one-time
 * signed upload slots under sites/<slug>/.
 */
export async function createUploadTargets(
  siteId: string,
  files: { name: string; type: string; size: number }[],
): Promise<UploadTarget[]> {
  await assertAdmin();
  const admin = requireSupabaseAdmin();
  const { data: site } = await admin.from("sites").select("slug").eq("id", siteId).maybeSingle<{ slug: string }>();
  if (!site) return files.map(() => ({ error: "This site no longer exists." }));

  return Promise.all(
    files.slice(0, 50).map(async (file): Promise<UploadTarget> => {
      const extension = UPLOAD_TYPES[file.type];
      if (!extension) {
        return { error: `${file.name}: use a JPG, PNG, WebP, GIF or AVIF image (iPhone HEIC photos need converting to JPG first).` };
      }
      if (file.size > MAX_UPLOAD_BYTES) return { error: `${file.name} is larger than 50 MB.` };
      const base = file.name.replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "photo";
      const path = `sites/${site.slug}/${base}-${randomUUID().slice(0, 8)}.${extension}`;
      const { data, error } = await admin.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
      if (error || !data) return { error: `${file.name}: ${error?.message ?? "upload could not start"}` };
      return { path: data.path, token: data.token };
    }),
  );
}

// ------------------------------------------------------------ RSVP options

export type RsvpEmailState = { status: "idle" | "saved" | "error"; message?: string };

export async function saveRsvpEmail(siteId: string, _previous: RsvpEmailState, formData: FormData): Promise<RsvpEmailState> {
  await assertAdmin();
  const enabled = formData.get("rsvpEmailEnabled") === "on";
  const email = text(formData, "notificationEmail").toLowerCase();
  if (email && !EMAIL_PATTERN.test(email)) return { status: "error", message: "Please enter a valid email address." };
  if (enabled && !email) return { status: "error", message: "Add the couple's email address, or turn emails off." };

  const { error } = await requireSupabaseAdmin()
    .from("sites")
    .update({ notification_email: email || null, rsvp_email_enabled: enabled })
    .eq("id", siteId);
  if (error) return { status: "error", message: `Could not save: ${error.message}` };
  revalidatePath("/admin", "layout");
  return { status: "saved" };
}

/** Create (or replace) the couple's private RSVP link, or turn it off. */
export async function setShareLink(siteId: string, enabled: boolean): Promise<void> {
  await assertAdmin();
  const token = enabled ? randomBytes(24).toString("base64url") : null; // 32 characters
  const { error } = await requireSupabaseAdmin().from("sites").update({ rsvp_share_token: token }).eq("id", siteId);
  if (error) throw new Error(`Could not update the link: ${error.message}`);
  revalidatePath("/admin", "layout");
}

export async function deleteRsvp(siteId: string, rsvpId: string): Promise<void> {
  await assertAdmin();
  const { error } = await requireSupabaseAdmin().from("rsvps").delete().eq("id", rsvpId).eq("site_id", siteId);
  if (error) throw new Error(`Could not delete the RSVP: ${error.message}`);
  revalidatePath("/admin", "layout");
}
