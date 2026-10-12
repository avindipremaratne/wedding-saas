"use server";

import { sendRsvpNotification } from "@/lib/email";
import { parseRsvp, type RsvpFieldErrors } from "@/lib/rsvp";
import { getSite } from "@/lib/sites";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase/server";

// Echoed back on errors: React resets the form after an action runs, so the
// fields are refilled from these via defaultValue.
export interface RsvpValues {
  guestName: string;
  email: string;
  attending: string;
  message: string;
}

export type RsvpState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: RsvpFieldErrors; values?: RsvpValues }
  | { status: "success"; attending: boolean; guestName: string };

// Bound to a site slug in the form: submitRsvp.bind(null, slug).
// The slug comes from the page, but everything else (the site id, where the
// notification goes) is looked up here on the server, never trusted from the form.
export async function submitRsvp(
  siteSlug: string,
  _previous: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const values: RsvpValues = {
    guestName: String(formData.get("guestName") ?? ""),
    email: String(formData.get("email") ?? ""),
    attending: String(formData.get("attending") ?? "yes"),
    message: String(formData.get("message") ?? ""),
  };
  const fail = (message: string, fieldErrors?: RsvpFieldErrors): RsvpState => ({
    status: "error",
    message,
    fieldErrors,
    values,
  });

  const parsed = parseRsvp(formData);
  if (!parsed.ok) return fail("Please check the highlighted fields.", parsed.errors);
  const rsvp = parsed.data;
  const success: RsvpState = { status: "success", attending: rsvp.attending, guestName: rsvp.guestName };

  // Hidden honeypot field: people never see it, simple bots fill it in.
  if (formData.get("company")) return success;

  const site = await getSite(siteSlug);
  if (!site) return fail("This wedding site could not be found.");

  const supabase = getSupabase();
  if (!supabase) {
    if (process.env.NODE_ENV === "production") {
      console.error("[rsvp] Supabase is not configured; RSVP was not saved.");
      return fail("Something went wrong. Please try again.");
    }
    console.info(`[rsvp] (dev, Supabase not configured) ${site.slug}:`, rsvp);
    return success;
  }

  const { error } = await supabase.from("rsvps").insert({
    site_id: site.id,
    guest_name: rsvp.guestName,
    email: rsvp.email,
    attending: rsvp.attending,
    message: rsvp.message || null,
  });
  if (error) {
    console.error("[rsvp] Insert failed:", error.message);
    return fail("Something went wrong. Please try again.");
  }

  // The couple's notification address is not readable with the anon key,
  // so look it up with the admin client.
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data } = await admin
      .from("sites")
      .select("notification_email")
      .eq("id", site.id)
      .maybeSingle<{ notification_email: string | null }>();
    if (data?.notification_email) {
      await sendRsvpNotification({ to: data.notification_email, coupleNames: site.content.coupleNames, rsvp });
    } else {
      console.info(`[email] RSVP notification skipped: no notification_email set for site "${site.slug}".`);
    }
  } else {
    console.info("[email] RSVP notification skipped: SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  return success;
}
