import type { PageObjectResponse } from "@notionhq/client";

export function getPostSeriesId(page: PageObjectResponse): string | null {
  const property = page.properties.series;
  return property?.type === "relation"
    ? (property.relation[0]?.id ?? null)
    : null;
}

export function getSeriesOrder(page: PageObjectResponse): number {
  const property = page.properties.seriesOrder;
  return property?.type === "number" && property.number !== null
    ? property.number
    : Infinity;
}

export function getOrderedSeriesPosts(
  posts: PageObjectResponse[],
  seriesId: string
) {
  return posts
    .filter((post) => {
      const status = post.properties.status ?? post.properties.Status;
      return (
        !post.archived &&
        !post.in_trash &&
        status?.type === "status" &&
        status.status?.name === "Published" &&
        getPostSeriesId(post) === seriesId
      );
    })
    .sort((a, b) => {
      const aOrder = getSeriesOrder(a);
      const bOrder = getSeriesOrder(b);
      return aOrder === bOrder ? a.id.localeCompare(b.id) : aOrder - bOrder;
    });
}

export function getSeriesNeighbors(
  posts: PageObjectResponse[],
  pageId: string
) {
  const index = posts.findIndex((post) => post.id === pageId);
  return {
    index,
    previous: index > 0 ? posts[index - 1] : null,
    next: index >= 0 ? (posts[index + 1] ?? null) : null,
  };
}
