import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Two clients, both server-only:
// - getSupabase(): the public anon key. Row Level Security decides what it can
//   read and write, so it is safe for guest-facing work like RSVPs.
// - getSupabaseAdmin(): the service role key, which bypasses RLS. Only use it
//   for trusted server work such as looking up where RSVP notifications go.
// Both return null when the keys are missing, so the app still runs locally
// on the static site files in content/sites before Supabase is set up.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const options = { auth: { persistSession: false, autoRefreshToken: false } };

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  anonClient ??= createClient(url, anonKey, options);
  return anonClient;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  adminClient ??= createClient(url, serviceKey, options);
  return adminClient;
}
