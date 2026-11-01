import { formatRepliedAt, rsvpTotals, type RsvpForExport } from "@/lib/admin/rsvp-export";
import type { ReactNode } from "react";

// The RSVP list, used by the admin page and the couple's private link.
export default function RsvpTable({
  rsvps,
  timeZone,
  action,
}: {
  rsvps: (RsvpForExport & { id: string })[];
  timeZone: string;
  action?: (rsvpId: string) => ReactNode;
}) {
  const totals = rsvpTotals(rsvps);
  return (
    <div>
      <dl className="mb-4 grid grid-cols-3 gap-3">
        {[
          ["Attending", totals.yes],
          ["Declined", totals.no],
          ["Total replies", totals.total],
        ].map(([label, count]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-3 text-center">
            <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
            <dd className="text-2xl font-semibold text-stone-900">{count}</dd>
          </div>
        ))}
      </dl>
      {rsvps.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-500">No RSVPs yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Attending</th>
                <th className="px-3 py-2 font-medium">Message</th>
                <th className="px-3 py-2 font-medium">Replied</th>
                {action && <th className="px-3 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rsvps.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium text-stone-900">{r.guest_name}</div>
                    <a href={`mailto:${r.email}`} className="text-xs text-stone-500 hover:underline">
                      {r.email}
                    </a>
                  </td>
                  <td className="px-3 py-2">{r.attending ? <span className="text-emerald-700">Yes</span> : <span className="text-stone-500">No</span>}</td>
                  <td className="whitespace-pre-line px-3 py-2 text-stone-700">{r.message || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-stone-500">{formatRepliedAt(r.created_at, timeZone)}</td>
                  {action && <td className="px-3 py-2 text-right">{action(r.id)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
