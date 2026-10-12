import { NextResponse, type NextRequest } from "next/server";

// Multi-tenant mode: with NEXT_PUBLIC_ROOT_DOMAIN set, <slug>.<root domain>
// serves /<slug>. Otherwise "/" shows DEFAULT_SITE_SLUG (see app/page.tsx),
// which suits one deployment per couple.

const RESERVED = new Set(["www", "app", "api"]);

export function siteSlugForHost(host: string | null, rootDomain: string | undefined): string | null {
  if (!host || !rootDomain) return null;
  const hostname = host.split(":")[0].toLowerCase();
  const root = rootDomain.split(":")[0].toLowerCase();
  if (!hostname.endsWith(`.${root}`)) return null;
  const sub = hostname.slice(0, -(root.length + 1));
  if (!sub || sub.includes(".") || RESERVED.has(sub)) return null;
  return sub;
}

export function proxy(request: NextRequest) {
  const slug = siteSlugForHost(request.headers.get("host"), process.env.NEXT_PUBLIC_ROOT_DOMAIN);
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Only the site root is rewritten; assets and other pages pass through.
  matcher: "/",
};
