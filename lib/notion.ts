import {
  Client,
  type PageObjectResponse,
  type BlockObjectResponse,
  type RichTextItemResponse,
} from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

if (!DATABASE_ID) {
  console.warn("NOTION_DATABASE_ID is not set. Notion fetch will fail.");
}

export type BlockWithChildren = BlockObjectResponse & {
  children: BlockWithChildren[];
};

/** Notion DB에서 페이지(글) 목록 가져오기 — status가 Draft인 글은 제외 */
export async function getPosts(category?: string | null): Promise<PageObjectResponse[]> {
  if (!DATABASE_ID) return [];

  const publishedFilter = { property: "status", status: { equals: "Published" as const } };

  const filter = category
    ? {
      and: [
        publishedFilter,
        { property: "category", select: { equals: category } },
      ],
    }
    : publishedFilter;

  const response = await notion.dataSources.query({
    data_source_id: DATABASE_ID,
    filter: process.env.NODE_ENV === "development" ? undefined : filter,
    sorts: [{ timestamp: "created_time", direction: "descending" }],
  });
  return response.results.filter(
    (r): r is PageObjectResponse => r.object === "page"
  );
}

/** 한 블록의 자식을 페이지네이션 처리하여 모두 가져오기 */
async function fetchBlockChildren(blockId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });

    for (const block of response.results) {
      if ("type" in block) {
        blocks.push(block as BlockObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

/**
 * BFS flat fetch → tree rebuild.
 * 모든 블록을 평탄하게 수집한 뒤 parent 관계로 트리를 재구성한다.
 * 동시 API 호출 수를 CONCURRENCY로 제한하여 rate limit을 방지한다.
 */
export async function getPageBlocks(pageId: string): Promise<BlockWithChildren[]> {
  const CONCURRENCY = 6;

  const allBlocks: BlockWithChildren[] = [];
  const parentMap = new Map<string, string>();
  const queue: string[] = [pageId];

  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENCY);

    const results = await Promise.all(
      batch.map(async (parentId) => ({
        parentId,
        blocks: await fetchBlockChildren(parentId),
      })),
    );

    for (const { parentId, blocks } of results) {
      for (const block of blocks) {
        const bwc: BlockWithChildren = Object.assign(block, { children: [] as BlockWithChildren[] });
        allBlocks.push(bwc);
        parentMap.set(block.id, parentId);

        if (block.has_children) {
          queue.push(block.id);
        }
      }
    }
  }

  const blockMap = new Map<string, BlockWithChildren>();
  for (const block of allBlocks) {
    blockMap.set(block.id, block);
  }

  const topLevel: BlockWithChildren[] = [];
  for (const block of allBlocks) {
    const pid = parentMap.get(block.id);
    if (pid === pageId) {
      topLevel.push(block);
    } else if (pid && blockMap.has(pid)) {
      blockMap.get(pid)!.children.push(block);
    }
  }

  return topLevel;
}

/** 블록 트리에서 문서 순서상 처음 N개 이미지 블록 ID 반환 (priority 지정에 사용) */
export function getFirstImageBlockIds(
  blocks: BlockWithChildren[],
  limit = 2,
): string[] {
  const ids: string[] = [];
  const queue: BlockWithChildren[] = [...blocks];
  while (queue.length > 0 && ids.length < limit) {
    const block = queue.shift()!;
    if (block.type === "image") ids.push(block.id);
    queue.push(...block.children);
  }
  return ids;
}

/** 단일 페이지 가져오기 — Published 상태가 아니면 에러를 던진다 */
export async function getPage(pageId: string): Promise<PageObjectResponse> {
  const response = await notion.pages.retrieve({ page_id: pageId });
  const page = response as PageObjectResponse;
  // if (getPageStatus(page) !== "Published") {
  //   throw new Error("Page is not published");
  // }
  return page;
}

/** 페이지 속성에서 제목 rich text 추출 — 인라인 코드 등 어노테이션 렌더링용 */
export function getPageTitleRichText(
  page: PageObjectResponse
): RichTextItemResponse[] {
  const props = page.properties;
  const titleProp = Object.values(props).find((p) => p.type === "title");
  if (!titleProp || titleProp.type !== "title") return [];
  return titleProp.title;
}

/** 페이지 속성에서 제목 추출 */
export function getPageTitle(page: PageObjectResponse): string {
  return getPageTitleRichText(page)
    .map((t) => t.plain_text)
    .join("");
}

/** 페이지 속성에서 태그(multi_select) 추출 — propertyName 지정 가능, 미지정 시 첫 multi_select 사용 */
export function getPageTags(
  page: PageObjectResponse,
  propertyName?: string
): { id: string; name: string; color: string }[] {
  const props = page.properties;
  const tagProp = propertyName
    ? props[propertyName]
    : Object.values(props).find((p) => p.type === "multi_select");
  if (!tagProp || tagProp.type !== "multi_select") return [];
  return tagProp.multi_select.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }));
}

const BLOG_CATEGORIES = ["프로젝트", "딥다이브", "회고"] as const;

/** 페이지 속성에서 카테고리(select) 추출 — "Category"/"category"/"카테고리" 또는 값이 카테고리 목록인 첫 select */
export function getPageCategory(page: PageObjectResponse): string | null {
  const props = page.properties;
  const byName = props["Category"] ?? props["category"] ?? props["카테고리"];
  if (byName && byName.type === "select" && byName.select?.name)
    return byName.select.name;
  for (const p of Object.values(props)) {
    if (p.type === "select" && p.select?.name && BLOG_CATEGORIES.includes(p.select.name as (typeof BLOG_CATEGORIES)[number]))
      return p.select.name;
  }
  return null;
}

/** 노션 S3 URL은 서명이 1시간 뒤 만료되므로, 만료되지 않는 notion.so 주소로 바꾼다 */
export function toNotionImageUrl(s3Url: string, blockId: string): string {
  try {
    const url = new URL(s3Url);
    if (!url.hostname.includes("prod-files-secure.s3")) return s3Url;
    const parts = url.pathname.slice(1).split("/");
    if (parts.length < 3) return s3Url;
    const [workspaceId, fileId, ...rest] = parts;
    const filename = rest.join("/");
    return `https://www.notion.so/image/attachment%3A${fileId}%3A${filename}?table=block&id=${blockId}&spaceId=${workspaceId}&width=2000`;
  } catch {
    return s3Url;
  }
}

/** blob:처럼 그 브라우저 탭에서만 유효한 주소는 서버에서 못 쓰므로 걸러낸다 */
function toUsableImageUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : null;
}

/** 페이지 대표 이미지 — DB 속성 "coverUrl"을 우선 쓰고, 없으면 노션 페이지 커버를 쓴다 */
export function getPageCover(page: PageObjectResponse): string | null {
  const coverProp = page.properties["coverUrl"];
  if (coverProp?.type === "url") {
    const fromProp = toUsableImageUrl(coverProp.url);
    if (fromProp) return fromProp;
  }

  const cover = page.cover;
  if (cover?.type === "external") return toUsableImageUrl(cover.external.url);
  if (cover?.type === "file") {
    const url = toUsableImageUrl(cover.file.url);
    return url ? toNotionImageUrl(url, page.id) : null;
  }
  return null;
}

/** 페이지 요약 — DB 속성 "summary" (rich_text) 사용 */
export function getPageExcerpt(
  page: PageObjectResponse,
  maxLength = 120
): string {
  const props = page.properties;
  const p = props["summary"];
  if (!p || p.type !== "rich_text") return "";
  const text = p.rich_text.map((t) => t.plain_text).join("");
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/** 페이지 날짜 — created_time 또는 "Date" 속성, 포맷: YYYY. MM. DD. */
export function getPageDate(page: PageObjectResponse): string {
  const props = page.properties;
  const dateProp = props["Date"] ?? Object.values(props).find((p) => p.type === "date");
  const raw = dateProp && dateProp.type === "date" && dateProp.date?.start
    ? dateProp.date.start
    : page.created_time;
  if (!raw) return "";
  const d = new Date(raw);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${day}.`;
}

/** 페이지 속성에서 status(status type) 추출 */
export function getPageStatus(page: PageObjectResponse): string | null {
  const props = page.properties;
  const p = props["status"] ?? props["Status"];
  if (!p || p.type !== "status" || !p.status) return null;
  return p.status.name;
}

export { notion };
