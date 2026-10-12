// Where bundled media (theme assets and the reference site's photos) is
// served from. With NEXT_PUBLIC_MEDIA_URL set (the Supabase Storage bucket's
// public URL, printed by `npm run media:migrate`), files come from the
// bucket. Without it, the original Wix URL is used, so a fresh checkout with
// no settings still shows images.

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL?.trim().replace(/\/+$/, "");

/** `path` inside the site-media bucket, e.g. "sites/amali-ashen/hero.jpeg". */
export function mediaUrl(path: string, fallback: string): string {
  return MEDIA_URL ? `${MEDIA_URL}/${path}` : fallback;
}
