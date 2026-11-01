import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { isAdmin, isAdminConfigured } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = isAdminConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Wedding sites admin</h1>
        <p className="mb-6 mt-1 text-sm text-stone-500">Sign in to manage couples&apos; sites and RSVPs.</p>
        {configured ? (
          <LoginForm />
        ) : (
          <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            The admin area is switched off. Add <code>ADMIN_PASSWORD</code> (at least 8 characters) and{" "}
            <code>ADMIN_SESSION_SECRET</code> (at least 32 characters) to the environment variables, then restart.
          </p>
        )}
      </div>
    </main>
  );
}
