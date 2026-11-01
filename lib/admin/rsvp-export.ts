// The RSVP list as a spreadsheet and as summary numbers, shared by the
// admin page and the couple's private link.

import { toCsv } from "@/lib/csv";

export interface RsvpForExport {
  guest_name: string;
  email: string;
  attending: boolean;
  message: string | null;
  created_at: string;
}

export function formatRepliedAt(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date(iso))
    .replace(",", "");
}

export function rsvpCsv(rsvps: RsvpForExport[], timeZone: string): string {
  return toCsv([
    ["Name", "Email", "Attending", "Message", "Replied"],
    ...rsvps.map((r) => [r.guest_name, r.email, r.attending ? "Yes" : "No", r.message ?? "", formatRepliedAt(r.created_at, timeZone)]),
  ]);
}

export function rsvpTotals(rsvps: { attending: boolean }[]) {
  const yes = rsvps.filter((r) => r.attending).length;
  return { yes, no: rsvps.length - yes, total: rsvps.length };
}

export function csvResponse(csv: string, filename: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^\w.-]/g, "-")}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
