import type { Metadata } from "next";
import Link from "next/link";
import { Badge, buttonClass } from "@/components/admin/ui";
import { listSites } from "@/lib/admin/data";
import { formatLongDate } from "@/lib/dates";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "All sites" };

export default async function AdminHome() {
  if (!getSupabaseAdmin()) {
    return (
      <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
        Supabase is not set up here. Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> to the environment variables.
      </p>
    );
  }
  const sites = await listSites();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">All sites</h1>
        <Link href="/admin/new" className={buttonClass}>
          New site
        </Link>
      </div>

      {sites.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
          No sites yet. Create the first one with <strong>New site</strong>.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          {sites.map((site) => (
            <li key={site.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/sites/${site.id}`} className="font-medium text-stone-900 hover:underline">
                    {site.coupleNames[0]} &amp; {site.coupleNames[1]}
                  </Link>
                  <Badge tone={site.published ? "green" : "stone"}>{site.published ? "Live" : "Draft"}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-stone-500">
                  /{site.slug}
                  {site.weddingDate && <> · {formatLongDate(site.weddingDate, site.timeZone)}</>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <Link href={`/admin/sites/${site.id}/rsvps`} className="text-stone-600 hover:underline">
                  {site.rsvps.yes} attending · {site.rsvps.no} declined
                </Link>
                <Link href={`/admin/sites/${site.id}`} className="font-medium text-navy hover:underline">
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
