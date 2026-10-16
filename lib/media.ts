// All media (photos, theme images, the envelope videos) lives in the public
// Supabase Storage bucket "site-media". Content refers to files by their
// path inside the bucket, e.g. "sites/amali-ashen/hero.jpeg", and this
// module turns that into a full URL.
//
// The bucket URL is NEXT_PUBLIC_MEDIA_URL when set, otherwise derived from
// NEXT_PUBLIC_SUPABASE_URL, so a deployment only needs its Supabase settings.

export const MEDIA_BUCKET = "site-media";

function bucketUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const project = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!project) return undefined;
  try {
    return `${new URL(project).origin}/storage/v1/object/public/${MEDIA_BUCKET}`;
  } catch {
    return undefined;
  }
}

const BASE = bucketUrl();

/**
 * Full URL for a file in the bucket. Values that are already absolute URLs
 * (older database rows store those) are returned unchanged. Without any
 * Supabase settings there is nowhere to load media from, so the result is a
 * local path that simply won't resolve.
 */
export function mediaUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.replace(/^\/+/, "");
  return BASE ? `${BASE}/${path}` : `/${MEDIA_BUCKET}/${path}`;
}
