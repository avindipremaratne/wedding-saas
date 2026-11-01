import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteEditor from "@/components/admin/SiteEditor";
import SiteTabs from "@/components/admin/SiteTabs";
import { getAdminSite } from "@/lib/admin/data";
import { toFormValues } from "@/lib/admin/site-form";
import { timeZones } from "@/lib/admin/time-zones";
import { themes } from "@/themes";
import { heirloomColors } from "@/themes/heirloom/config";

export const metadata: Metadata = { title: "Edit site" };

export default async function EditSitePage({ params }: PageProps<"/admin/sites/[id]">) {
  const { id } = await params;
  const site = await getAdminSite(id);
  if (!site) notFound();
  if (!site.site_content) {
    return <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">This site has no content row in Supabase yet.</p>;
  }

  const values = toFormValues({ slug: site.slug, published: site.published, theme_id: site.theme_id, site_content: site.site_content });
  return (
    <>
      <SiteTabs siteId={site.id} coupleNames={site.site_content.couple_names} slug={site.slug} published={site.published} active="edit" />
      <SiteEditor
        // Remount after a save that changed the address, so the form starts from the saved values.
        key={site.slug}
        siteId={site.id}
        initial={values}
        timeZones={timeZones()}
        themes={Object.entries(themes).map(([themeId, t]) => ({ id: themeId, name: t.name }))}
        defaultColors={heirloomColors}
        previewHref={`/admin/preview/${site.id}`}
        liveHref={`/${site.slug}`}
      />
    </>
  );
}
