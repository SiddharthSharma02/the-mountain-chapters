import type { MetadataRoute } from "next";
import { getPublishedStaySlugs } from "@/lib/data/content";
import { SITE_URL } from "@/lib/stays/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes = [
    "",
    "/destinations",
    "/stays",
    "/experiences",
    "/road-trips",
    "/stories",
    "/gallery",
    "/about",
    "/contact",
    "/login",
    "/signup",
  ];

  const stays = await getPublishedStaySlugs();

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...stays.map((s) => ({
      url: `${SITE_URL}/stays/${s.slug}`,
      lastModified: new Date(s.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
