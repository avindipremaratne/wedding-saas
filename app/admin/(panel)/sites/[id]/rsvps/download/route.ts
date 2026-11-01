import { isAdmin } from "@/lib/admin/auth";
import { getAdminSite, listRsvps } from "@/lib/admin/data";
import { csvResponse, rsvpCsv } from "@/lib/admin/rsvp-export";

export async function GET(_request: Request, ctx: RouteContext<"/admin/sites/[id]/rsvps/download">) {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const { id } = await ctx.params;
  const site = await getAdminSite(id);
  if (!site?.site_content) return new Response("Not found", { status: 404 });
  const rsvps = await listRsvps(site.id);
  const today = new Date().toISOString().slice(0, 10);
  return csvResponse(rsvpCsv(rsvps, site.site_content.time_zone), `rsvps-${site.slug}-${today}.csv`);
}
