import "server-only";
import type { RsvpInput } from "@/lib/rsvp";

// RSVP notification email through Resend's HTTP API (replaces the Wix
// Automation to Gmail flow). Skipped quietly when not configured, and never
// throws: a failed email must not turn a saved RSVP into an error for the guest.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendRsvpNotification(options: {
  to: string;
  coupleNames: [string, string];
  rsvp: RsvpInput;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RSVP_FROM_EMAIL;
  if (!apiKey || !from) {
    console.info("[email] RSVP notification skipped: RESEND_API_KEY or RSVP_FROM_EMAIL is not set.");
    return;
  }

  const { rsvp, coupleNames } = options;
  const answer = rsvp.attending ? "Joyfully accepts" : "Regretfully declines";
  const rows: [string, string][] = [
    ["Name", rsvp.guestName],
    ["Email", rsvp.email],
    ["Attending", answer],
    ["Message", rsvp.message || "—"],
  ];

  const html = `
    <h2 style="font-family:Georgia,serif">New RSVP for ${escapeHtml(coupleNames.join(" & "))}</h2>
    <table cellpadding="6" style="font-family:Arial,sans-serif;font-size:14px">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
        )
        .join("")}
    </table>`;
  const text = [`New RSVP for ${coupleNames.join(" & ")}`, "", ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [options.to],
        reply_to: rsvp.email,
        subject: `RSVP: ${rsvp.guestName} — ${answer}`,
        html,
        text,
      }),
    });
    if (!response.ok) {
      console.error("[email] Resend rejected the RSVP notification:", response.status, await response.text());
    } else {
      console.info(`[email] RSVP notification sent to ${options.to}.`);
    }
  } catch (error) {
    console.error("[email] Could not reach Resend:", error);
  }
}
