import { cache } from "react";
import { getPosts, getPageTitle, getPageCover, queryPages } from "./notion";
import { getOrderedSeriesPosts } from "./series-model";

export const getSeries = cache(async () => {
  const dataSourceId = process.env.NOTION_SERIES_DATA_SOURCE_ID;
  if (!dataSourceId) return [];

  const [pages, posts] = await Promise.all([
    queryPages({ data_source_id: dataSourceId }),
    getPosts(),
  ]);
  const entries = pages.flatMap((page) => {
    if (page.archived || page.in_trash) return [];
    const slugProp = page.properties.slug;
    const slug =
      slugProp?.type === "rich_text"
        ? slugProp.rich_text
            .map((part) => part.plain_text)
            .join("")
            .trim()
        : "";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return [];
    const seriesPosts = getOrderedSeriesPosts(posts, page.id);
    if (!seriesPosts.length) return [];
    const descriptionProp = page.properties.description;
    return [
      {
        id: page.id,
        slug,
        title: getPageTitle(page),
        description:
          descriptionProp?.type === "rich_text"
            ? descriptionProp.rich_text.map((part) => part.plain_text).join("")
            : "",
        coverUrl: getPageCover(page),
        posts: seriesPosts,
        updatedAt: [
          page.last_edited_time,
          ...seriesPosts.map((post) => post.last_edited_time),
        ]
          .sort()
          .at(-1)!,
      },
    ];
  });
  // 중복 slug는 잘못된 시리즈로 연결하지 않고 목록에서 제외한다.
  const counts = new Map<string, number>();
  for (const entry of entries)
    counts.set(entry.slug, (counts.get(entry.slug) ?? 0) + 1);
  return entries
    .filter((entry) => counts.get(entry.slug) === 1)
    .sort(
      (a, b) =>
        b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id)
    );
});

export type Series = Awaited<ReturnType<typeof getSeries>>[number];
