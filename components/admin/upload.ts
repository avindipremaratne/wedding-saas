import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createUploadTargets } from "@/app/admin/actions";
import { MEDIA_BUCKET } from "@/lib/media";

// Browser side of photo uploads: ask the server for signed upload slots,
// then send each file straight to Supabase Storage with the public key.

let client: SupabaseClient | null = null;

function storage() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase is not configured.");
    client = createClient(new URL(url).origin, key, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client.storage.from(MEDIA_BUCKET);
}

export async function uploadPhotos(siteId: string, files: File[]): Promise<{ paths: string[]; errors: string[] }> {
  const targets = await createUploadTargets(
    siteId,
    files.map((file) => ({ name: file.name, type: file.type, size: file.size })),
  );
  const results = await Promise.all(
    targets.map(async (target, i) => {
      if ("error" in target) return { error: target.error };
      const { error } = await storage().uploadToSignedUrl(target.path, target.token, files[i], {
        contentType: files[i].type,
        cacheControl: "31536000",
      });
      return error ? { error: `${files[i].name}: ${error.message}` } : { path: target.path };
    }),
  );
  return {
    paths: results.flatMap((r) => ("path" in r && r.path ? [r.path] : [])),
    errors: results.flatMap((r) => ("error" in r && r.error ? [r.error] : [])),
  };
}
