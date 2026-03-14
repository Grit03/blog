import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPosts, getPage, getPageBlocks, getPageTitle, getPageCover, getPageExcerpt, getFirstImageBlockIds, type BlockWithChildren } from "@/lib/notion";
import { getPageTags } from "@/lib/notion";
import { NotionBlocks } from "@/components/NotionBlock";
import { Tag } from "@/components/PostCard/Tag";
import { PostTableOfContents } from "@/components/PostTableOfContents";
import { cn } from "@/lib/utils";

export const revalidate = false;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((page) => ({ id: page.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const page = await getPage(id);
    const title = getPageTitle(page) || "글 상세";
    const description = getPageExcerpt(page, 160);
    const coverUrl = getPageCover(page);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://grit03.vercel.app";
    const postUrl = `${siteUrl}/post/${id}`;
    const defaultOgImage = `${siteUrl}/image/blog-og-image.png`;
    // Notion/S3 URL은 크롤러가 가져오지 못할 수 있어, 같은 도메인 기본 이미지 사용
    const ogImageUrl =
      coverUrl && coverUrl.startsWith(siteUrl) ? coverUrl : defaultOgImage;

    return {
      title,
      description: description || undefined,
      openGraph: {
        title,
        description: description || undefined,
        url: postUrl,
        type: "article",
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description || undefined,
        images: [ogImageUrl],
      },
      alternates: { canonical: postUrl },
    };
  } catch {
    return { title: "글 상세" };
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  const [page, blocks] = await (async () => {
    try {
      return await Promise.all([getPage(id), getPageBlocks(id)]);
    } catch {
      notFound();
      throw new Error("unreachable");
    }
  })();

  const title = getPageTitle(page);
  const tags = getPageTags(page);
  const createdAt = new Date(page.created_time).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contentTable = blocks
    .filter(
      (b): b is BlockWithChildren =>
        b.type === "heading_1" || b.type === "heading_2" || b.type === "heading_3",
    )
    .map((block) => {
      let depth = 0;
      let text = "";
      if (block.type === "heading_1") {
        depth = 0;
        text = block.heading_1?.rich_text[0].plain_text ?? "";
      } else if (block.type === "heading_2") {
        depth = 1;
        text = block.heading_2?.rich_text[0].plain_text ?? "";
      } else {
        depth = 2;
        const content = (block as unknown as { heading_3?: { rich_text: { plain_text: string }[] } }).heading_3;
        text = content?.rich_text[0].plain_text ?? "";
      }
      return { id: block.id, text, depth };
    });

  return (
    <div className="w-full">
      <div className={cn("mx-auto w-full px-10 xl:px-0 py-10 relative md:max-w-4xl", contentTable.length > 0 && "xl:pr-60 md:max-w-5xl")}>
        <article className="min-w-0 flex-1">
          <header className="mb-7">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1">
                {tags.map((tag) => (
                  <Tag key={tag.id} name={tag.name} />
                ))}
              </div>
            )}
            <h1 className="text-[2.1rem] font-bold leading-tight mb-1 break-keep text-pretty">
              {title || "제목이 없습니다"}
            </h1>
            <time className="text-sm text-neutral-500">{createdAt}</time>
          </header>
          <section className="text-base leading-relaxed break-keep">
            <NotionBlocks blocks={blocks} firstImageBlockIds={getFirstImageBlockIds(blocks)} />
          </section>
        </article>
        {contentTable.length > 0 && (
          <aside className="hidden xl:block w-68 absolute inset-y-20 left-[80%]">
            <div className="sticky top-20 border rounded-md px-4 py-3">
              <PostTableOfContents items={contentTable} />
            </div>
          </aside>)}
      </div>
    </div>

  );
}
