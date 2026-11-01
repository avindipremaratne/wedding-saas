import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin/auth";
import { getAdminSite } from "@/lib/admin/data";
import { fromRow, type SiteRow } from "@/lib/sites";
import { getTheme } from "@/themes";

export const metadata: Metadata = { title: "Preview" };

// The couple's site exactly as guests will see it, including drafts, which
// the public pages hide. Only the signed-in admin can open it.
export default async function PreviewPage({ params }: PageProps<"/admin/preview/[id]">) {
  await requireAdminPage();
  const { id } = await params;
  const row = await getAdminSite(id);
  const site = row ? fromRow(row as unknown as SiteRow) : null;
  if (!row || !site) notFound();
  const { Component } = getTheme(site.themeId);

  return (
    <>
      <Component site={site} />
      <div className="fixed bottom-3 left-1/2 z-[10000] flex -translate-x-1/2 items-center gap-3 rounded-full bg-stone-900/90 px-4 py-2 text-xs text-white shadow-lg">
        <span>
          Preview{row.published ? "" : " · not published yet"}
          {row.published ? "" : " · RSVPs are switched off until published"}
        </span>
        <Link href={`/admin/sites/${id}`} className="underline">
          Back to editing
        </Link>
      </div>
    </>
  );
}
