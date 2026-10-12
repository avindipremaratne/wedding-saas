import type { NextConfig } from "next";

// Hosts serving files from Supabase Storage: the project itself, and the
// media URL if it is set separately.
const storageHosts = [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_MEDIA_URL]
  .filter((value): value is string => Boolean(value))
  .map((value) => new URL(value).hostname)
  .filter((host, i, all) => all.indexOf(host) === i);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Photos and theme assets copied to Supabase Storage.
      ...storageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/**",
      })),
    ],
  },
};

export default nextConfig;
