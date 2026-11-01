import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DeleteRsvpButton, RsvpEmailForm, ShareLinkPanel } from "@/components/admin/RsvpOptions";
import RsvpTable from "@/components/admin/RsvpTable";
import SiteTabs from "@/components/admin/SiteTabs";
import { Card, secondaryButtonClass } from "@/components/admin/ui";
import { getAdminSite, listRsvps } from "@/lib/admin/data";

export const metadata: Metadata = { title: "RSVPs" };

export default async function SiteRsvpsPage({ params }: PageProps<"/admin/sites/[id]/rsvps">) {
  const { id } = await params;
  const site = await getAdminSite(id);
  if (!site?.site_content) notFound();
  const rsvps = await listRsvps(site.id);
  const timeZone = site.site_content.time_zone;

  // The private link uses whichever address this admin page was opened on.
  const host = (await headers()).get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const shareUrl = site.rsvp_share_token && host ? `${protocol}://${host}/rsvps/${site.rsvp_share_token}` : null;

  return (
    <>
      <SiteTabs siteId={site.id} coupleNames={site.site_content.couple_names} slug={site.slug} published={site.published} active="rsvps" />

      <h2 className="mb-1 text-lg font-semibold">How the couple gets their RSVPs</h2>
      <p className="mb-4 text-sm text-stone-500">Use any or all of these, whatever the couple prefers.</p>
      <div className="mb-10 grid gap-4 lg:grid-cols-3">
        <Card title="1. Email for each reply" description="The couple gets an email with the guest's answer and message as soon as they reply.">
          <RsvpEmailForm siteId={site.id} email={site.notification_email ?? ""} enabled={site.rsvp_email_enabled} />
        </Card>
        <Card title="2. Spreadsheet" description="Download the list and send it to the couple. Opens in Excel, Numbers or Google Sheets.">
          <a href={`/admin/sites/${site.id}/rsvps/download`} className={secondaryButtonClass}>
            Download spreadsheet (.csv)
          </a>
        </Card>
        <Card title="3. Private link" description="A link only the couple has, showing their up-to-date list and a download button. No login needed.">
          <ShareLinkPanel siteId={site.id} url={shareUrl} />
        </Card>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Replies</h2>
      <RsvpTable rsvps={rsvps} timeZone={timeZone} action={(rsvpId) => <DeleteRsvpButton siteId={site.id} rsvpId={rsvpId} />} />
    </>
  );
}
