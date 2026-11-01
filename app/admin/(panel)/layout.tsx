import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { requireAdminPage } from "@/lib/admin/auth";

// Every page in this group is for the signed-in admin only.
export default async function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdminPage();
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="text-base font-semibold text-stone-900">
            Wedding sites
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/admin" className="rounded-md px-3 py-1.5 text-stone-700 hover:bg-stone-100">
              All sites
            </Link>
            <Link href="/admin/new" className="rounded-md px-3 py-1.5 text-stone-700 hover:bg-stone-100">
              New site
            </Link>
            <form action={logout}>
              <button type="submit" className="rounded-md px-3 py-1.5 text-stone-500 hover:bg-stone-100">
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
