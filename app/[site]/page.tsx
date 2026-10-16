import SiteRoute, { siteMetadata } from "@/components/SiteRoute";
import { staticSiteSlugs } from "@/lib/sites";

// Bundled sites are prerendered at build time; sites that only exist in
// Supabase render on first request and are then cached for a minute.
export const revalidate = 60;

export function generateStaticParams() {
  return staticSiteSlugs().map((site) => ({ site }));
}

export async function generateMetadata({ params }: PageProps<"/[site]">) {
  return siteMetadata((await params).site);
}

export default async function SitePage({ params }: PageProps<"/[site]">) {
  return <SiteRoute slug={(await params).site} />;
}
