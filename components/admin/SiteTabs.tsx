import Link from "next/link";
import { Badge } from "./ui";

// Heading and tabs shared by a site's Edit and RSVPs pages.
export default function SiteTabs({
  siteId,
  coupleNames,
  slug,
  published,
  active,
}: {
  siteId: string;
  coupleNames: [string, string];
  slug: string;
  published: boolean;
  active: "edit" | "rsvps";
}) {
  const tab = (href: string, label: string, isActive: boolean) => (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`border-b-2 px-1 pb-2 text-sm font-medium ${isActive ? "border-navy text-navy" : "border-transparent text-stone-500 hover:text-stone-800"}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">
          {coupleNames[0]} &amp; {coupleNames[1]}
        </h1>
        <Badge tone={published ? "green" : "stone"}>{published ? "Live" : "Draft"}</Badge>
      </div>
      <p className="mt-1 text-sm text-stone-500">/{slug}</p>
      <nav className="mt-4 flex gap-6 border-b border-stone-200">
        {tab(`/admin/sites/${siteId}`, "Edit site", active === "edit")}
        {tab(`/admin/sites/${siteId}/rsvps`, "RSVPs", active === "rsvps")}
      </nav>
    </div>
  );
}
