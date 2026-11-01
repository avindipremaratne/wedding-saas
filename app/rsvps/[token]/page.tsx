import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import RsvpTable from "@/components/admin/RsvpTable";
import { secondaryButtonClass } from "@/components/admin/ui";
import { getSharedRsvps } from "@/lib/admin/data";

export const metadata: Metadata = {
  title: "Your RSVPs",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

// The couple's private RSVP list. The long random token in the address is
// the only key, so the page is never cached or indexed, and the admin can
// replace or switch off the link at any time.
export default async function SharedRsvpsPage({ params }: PageProps<"/rsvps/[token]">) {
  await connection();
  const { token } = await params;
  const shared = await getSharedRsvps(token);
  if (!shared) notFound();

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-8 text-stone-900">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-stone-500">RSVPs for</p>
        <h1 className="mb-1 text-2xl font-semibold">
          {shared.coupleNames[0]} &amp; {shared.coupleNames[1]}
        </h1>
        <p className="mb-6 text-sm text-stone-500">This list updates as guests reply. Please keep this link private.</p>
        <a href={`/rsvps/${token}/download`} className={`${secondaryButtonClass} mb-6`}>
          Download spreadsheet (.csv)
        </a>
        <RsvpTable rsvps={shared.rsvps} timeZone={shared.timeZone} />
      </div>
    </main>
  );
}
