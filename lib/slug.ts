// Site slugs become the /<slug> path (and the subdomain in multi-tenant
// mode). The pattern matches the check constraint on sites.slug.

export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

// Paths the app itself uses, which a couple's site must never shadow.
const RESERVED = new Set(["admin", "rsvps", "api", "www", "app", "_next", "favicon", "robots", "sitemap"]);

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/, "");
}

export function slugError(slug: string): string | null {
  if (!slug) return "Please enter a web address.";
  if (!SLUG_PATTERN.test(slug)) return "Use lowercase letters, numbers and hyphens only (no spaces).";
  if (RESERVED.has(slug)) return "That address is reserved. Please choose another.";
  return null;
}
