import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatLongDate } from "@/lib/dates";
import { getSite } from "@/lib/sites";
import { getTheme } from "@/themes";

// Shared by "/" (the deployment's default site) and "/[site]".

export async function siteMetadata(slug: string): Promise<Metadata> {
  const site = await getSite(slug);
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

export default async function SiteRoute({ slug }: { slug: string }) {
  const site = await getSite(slug);
  if (!site) notFound();
  const { Component } = getTheme(site.themeId);
  return <Component site={site} />;
}
