import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatLongDate } from "@/lib/dates";
import { getSite, staticSiteSlugs } from "@/lib/sites";
import { getTheme } from "@/themes";

// Bundled sites are prerendered at build time; sites that only exist in
// Supabase render on first request and are then cached for a minute.
export const revalidate = 60;

export function generateStaticParams() {
  return staticSiteSlugs().map((site) => ({ site }));
}

export async function generateMetadata({ params }: PageProps<"/[site]">): Promise<Metadata> {
  const site = await getSite((await params).site);
  if (!site) return {};
  const { coupleNames, weddingDate, timeZone, venue, heroPhoto } = site.content;
  const title = `${coupleNames[0]} & ${coupleNames[1]}`;
  const description = `Join us on ${formatLongDate(weddingDate, timeZone)} at ${venue.name}, ${venue.city}.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [heroPhoto.src] },
  };
}

export default async function SitePage({ params }: PageProps<"/[site]">) {
  const site = await getSite((await params).site);
  if (!site) notFound();
  const { Component } = getTheme(site.themeId);
  return <Component site={site} />;
}
