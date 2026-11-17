import { getSeries } from "@/lib/series";
import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/notion";
import { CATEGORIES } from "@/lib/categories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grit03.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, series] = await Promise.all([getPosts(), getSeries()]);

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/post/${post.id}`,
    lastModified: new Date(post.last_edited_time),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    { url: `${siteUrl}/series`, changeFrequency: "weekly", priority: 0.6 },
    ...series.map((entry) => ({
      url: `${siteUrl}/series/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categoryEntries,
    ...postEntries,
  ];
}
