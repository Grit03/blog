import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPosts,
  getPage,
  getPageBlocks,
  getPageTitle,
  getPageTitleRichText,
  getPageCover,
  getPageExcerpt,
  getFirstImageBlockIds,
} from "@/lib/notion";
import { getPageTags } from "@/lib/notion";
import { NotionBlocks, RichTextSpan } from "@/components/NotionBlock";
import { Tag } from "@/components/PostCard/Tag";
import { PostMinimap } from "@/components/PostMinimap";

export const revalidate = false;

const HEADING_DEPTH = { heading_1: 0, heading_2: 1, heading_3: 2 } as const;

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
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://grit03.vercel.app";
    const postUrl = `${siteUrl}/post/${id}`;
    const defaultOgImage = `${siteUrl}/image/blog-og-image.png`;
    const ogImageUrl = coverUrl ?? defaultOgImage;

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

  const title = getPageTitle(page) || "글 상세";
  const titleRichText = getPageTitleRichText(page);
  const tags = getPageTags(page);
  const createdAt = new Date(page.created_time).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://grit03.vercel.app";
  const postUrl = `${siteUrl}/post/${id}`;
  const description = getPageExcerpt(page, 160);
  const coverUrl = getPageCover(page);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: page.created_time,
    dateModified: page.last_edited_time,
    author: {
      "@type": "Person",
      name: "김규리",
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: "김규리",
      url: siteUrl,
    },
    url: postUrl,
    ...(coverUrl && { image: coverUrl }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    ...(tags.length > 0 && {
      keywords: tags.map((t) => t.name).join(", "),
    }),
  };

  // 우측 미니맵용 — 최상위 제목만 모은다 (중첩 블록 안의 제목은 목차에 넣지 않는다)
  const contentTable = blocks.flatMap((block) => {
    if (
      block.type !== "heading_1" &&
      block.type !== "heading_2" &&
      block.type !== "heading_3"
    ) {
      return [];
    }
    const richText =
      block.type === "heading_1"
        ? block.heading_1.rich_text
        : block.type === "heading_2"
          ? block.heading_2.rich_text
          : block.heading_3.rich_text;
    const text = richText
      .map((t) => t.plain_text)
      .join("")
      .trim();
    return text
      ? [{ id: block.id, text, depth: HEADING_DEPTH[block.type] }]
      : [];
  });

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PostMinimap items={contentTable} />
      <div className="relative mx-auto w-full px-4.5 sm:px-10 sm:py-10 md:max-w-200 xl:px-0">
        <article className="min-w-0 flex-1">
          <header className="mb-7">
            {tags.length > 0 && (
              <div className="mb-1 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag key={tag.id} name={tag.name} />
                ))}
              </div>
            )}
            <h1 className="mb-1 text-3xl leading-tight font-bold text-pretty break-keep sm:text-[2.1rem]">
              {titleRichText.length > 0 ? (
                <RichTextSpan richTexts={titleRichText} id={page.id} />
              ) : (
                "제목이 없습니다"
              )}
            </h1>
            <time className="text-sm text-subtle">{createdAt}</time>
          </header>
          <section className="text-lg leading-7 break-keep">
            <NotionBlocks
              blocks={blocks}
              firstImageBlockIds={getFirstImageBlockIds(blocks)}
            />
          </section>
        </article>
      </div>
    </div>
  );
}
