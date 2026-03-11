import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage, getPageBlocks, getPageTitle, type BlockWithChildren } from "@/lib/notion";
import { getPageTags } from "@/lib/notion";
import { NotionBlocks } from "@/components/NotionBlock";
import { Tag } from "@/components/PostCard/Tag";
import { PostTableOfContents } from "@/components/PostTableOfContents";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const page = await getPage(id);
    const title = getPageTitle(page);
    return { title: title || "글 상세" };
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
            <h1 className="text-[2.1rem] font-bold leading-tight mb-1">
              {title || "(제목 없음)"}
            </h1>
            <time className="text-sm text-neutral-500">{createdAt}</time>
          </header>
          <section className="text-base leading-relaxed">
            <NotionBlocks blocks={blocks} />
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
