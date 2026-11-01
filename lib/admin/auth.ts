import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionToken, SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session";

// The admin area is for the business owner only: one password, set in
// ADMIN_PASSWORD, plus ADMIN_SESSION_SECRET to sign the login cookie. With
// either missing the admin area stays switched off.

function settings() {
  return {
    password: process.env.ADMIN_PASSWORD ?? "",
    secret: process.env.ADMIN_SESSION_SECRET ?? "",
  };
}

export function isAdminConfigured(): boolean {
  const { password, secret } = settings();
  return password.length >= 8 && secret.length >= 32;
}

export const isAdmin = cache(async (): Promise<boolean> => {
  // Read the cookie first, even when the admin area is off: it marks every
  // admin page as per-request, so none is ever built ahead of time.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!isAdminConfigured()) return false;
  const { password, secret } = settings();
  return verifySessionToken(token, secret, password);
});

/** For admin pages: sends anyone who isn't signed in to the login page. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For Server Actions and Route Handlers, which are public endpoints. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not signed in");
}

export async function startAdminSession(): Promise<void> {
  const { password, secret } = settings();
  const { token, expires } = createSessionToken(secret, password);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
