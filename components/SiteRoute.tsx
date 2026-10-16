import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatLongDate } from "@/lib/dates";
import { getSite } from "@/lib/sites";
import { getTheme } from "@/themes";

// Shared by "/" (the deployment's default site) and "/[site]".

export async function siteMetadata(slug: string): Promise<Metadata> {
  const site = await getSite(slug);
  if (!site) return {};
  const { coupleNames, weddingDate, timeZone, venue, heroPhoto, details } = site.content;
  const title = `${coupleNames[0]} & ${coupleNames[1]}`;
  const description = `Join us on ${formatLongDate(weddingDate, timeZone)} at ${venue.name}, ${venue.city}.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [heroPhoto.src] },
    // The couple's logo doubles as the browser-tab icon (the Wix site set
    // its favicon in the Wix dashboard, so it was never in the code).
    icons: details.logoUrl ? { icon: details.logoUrl, apple: details.logoUrl } : undefined,
  };
}

export default async function SiteRoute({ slug }: { slug: string }) {
  const site = await getSite(slug);
  if (!site) notFound();
  const { Component } = getTheme(site.themeId);
  return <Component site={site} />;
}
