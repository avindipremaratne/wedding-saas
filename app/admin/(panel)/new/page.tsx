import type { Metadata } from "next";
import NewSiteForm from "@/components/admin/NewSiteForm";
import { listSites } from "@/lib/admin/data";
import { timeZones } from "@/lib/admin/time-zones";

export const metadata: Metadata = { title: "New site" };

export default async function NewSitePage() {
  const sites = await listSites();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">New site</h1>
      <p className="mb-6 text-sm text-stone-500">
        Start with the basics. You&apos;ll fill in the venue, photos and wording on the next page. New sites stay hidden
        from guests until you publish them.
      </p>
      <NewSiteForm
        timeZones={timeZones()}
        copyFrom={sites.map((s) => ({ id: s.id, label: `${s.coupleNames[0]} & ${s.coupleNames[1]} (/${s.slug})` }))}
      />
    </div>
  );
}
