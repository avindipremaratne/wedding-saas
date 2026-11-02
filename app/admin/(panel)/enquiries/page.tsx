import type { Metadata } from "next";
import EnquiryHandledButton from "@/components/admin/EnquiryHandledButton";
import { Badge } from "@/components/admin/ui";
import { listEnquiries, type EnquiryRow } from "@/lib/admin/data";
import { formatPlainDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Enquiries" };

const DESIGNS: Record<string, string> = { heirloom: "Heirloom", custom: "Something custom", unsure: "Not sure yet" };

// Enquiries sent through the business website's contact form. Each one is
// also emailed to you; this list makes sure none gets lost.
export default async function EnquiriesPage() {
  const enquiries = await listEnquiries();

  if (!enquiries) {
    return (
      <p className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
        The enquiries list isn&apos;t set up yet. Run <code>supabase/migrations/20261102000000_enquiries.sql</code> in the Supabase SQL
        Editor, then refresh this page.
      </p>
    );
  }

  const open = enquiries.filter((e) => !e.handled);
  const done = enquiries.filter((e) => e.handled);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Enquiries</h1>
      <p className="mb-6 text-sm text-stone-500">From the contact form on the business website. Reply by email, then mark each one as handled.</p>
      {enquiries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">No enquiries yet.</p>
      ) : (
        <div className="space-y-8">
          <EnquiryList title={`New (${open.length})`} items={open} empty="Nothing waiting. All caught up." />
          {done.length > 0 && <EnquiryList title={`Handled (${done.length})`} items={done} />}
        </div>
      )}
    </div>
  );
}

function EnquiryList({ title, items, empty }: { title: string; items: EnquiryRow[]; empty?: string }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-stone-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-stone-900">{e.names}</span>
                    {e.design && <Badge tone="stone">{DESIGNS[e.design] ?? e.design}</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-stone-600">
                    <a href={`mailto:${e.email}`} className="hover:underline">
                      {e.email}
                    </a>
                    {e.phone && <> · {e.phone}</>}
                    {e.wedding_date && <> · wedding {formatPlainDate(e.wedding_date, "/")}</>}
                  </p>
                  {e.message && <p className="mt-2 whitespace-pre-line text-sm text-stone-800">{e.message}</p>}
                  <p className="mt-2 text-xs text-stone-400">Received {new Date(e.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</p>
                </div>
                <EnquiryHandledButton id={e.id} handled={e.handled} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
