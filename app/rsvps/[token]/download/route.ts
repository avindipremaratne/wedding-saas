import { getSharedRsvps } from "@/lib/admin/data";
import { csvResponse, rsvpCsv } from "@/lib/admin/rsvp-export";

export async function GET(_request: Request, ctx: RouteContext<"/rsvps/[token]/download">) {
  const { token } = await ctx.params;
  const shared = await getSharedRsvps(token);
  if (!shared) return new Response("Not found", { status: 404 });
  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(rsvpCsv(shared.rsvps, shared.timeZone), `rsvps-${shared.slug}-${today}.csv`);
}
