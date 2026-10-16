import SiteRoute, { siteMetadata } from "@/components/SiteRoute";
import { DEFAULT_SITE_SLUG } from "@/lib/sites";

// The root of the deployment shows one couple's site. For a deployment per
// couple, set DEFAULT_SITE_SLUG; otherwise the Theme 1 reference site is shown.
export const revalidate = 60;

export function generateMetadata() {
  return siteMetadata(DEFAULT_SITE_SLUG);
}

export default function Home() {
  return <SiteRoute slug={DEFAULT_SITE_SLUG} />;
}
