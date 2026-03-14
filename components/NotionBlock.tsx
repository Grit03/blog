import type { RichTextItemResponse } from "@notionhq/client";
import type { BlockWithChildren } from "@/lib/notion";
import { ShikiCodeBlock } from "./ShikiCodeBlock";
import { Image } from "@/components/Image";
import { BookmarkBlock } from "./BookmarkBlock";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";



function RichTextSpan({ richTexts }: { richTexts: RichTextItemResponse[] }) {
  return (
    <>
      {richTexts.map((text, i) => {
        let node: React.ReactNode = text.plain_text;

        if (text.annotations.bold) node = <strong key={i} className="font-semibold">{node}</strong>;
        else if (text.annotations.italic) node = <em>{node}</em>;
        else if (text.annotations.strikethrough) node = <s>{node}</s>;
        else if (text.annotations.underline) node = <u>{node}</u>;
        else if (text.annotations.code)
          node = (
            <code className={cn("bg-[#e8e8e8] text-[#c7254e] px-1 py-0.5 rounded text-[0.85em] mx-0.5", text.annotations.bold && "font-semibold")}>
              {node}
            </code>
          );
        else if (text.type === "mention" && text.href) {
          const { mention } = text;
          if (mention.type === "link_mention") {
            const linkMention = mention.link_mention;
            const iconUrl = linkMention?.icon_url;
            const title = linkMention?.title;
            const linkProvider = linkMention?.link_provider;
            const linkAuthor = linkMention?.link_author;
            node = (
              <a
                href={text.href}
                className="flex items-center gap-1 text-sm font-medium underline px-2 py-1 rounded-md hover:bg-background-highlight transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="w-5 h-5 shrink-0"
                    unoptimized
                  />
                )}
                {linkAuthor ? <span className="text-sm text-[#737373]">{linkAuthor}</span> : linkProvider ? <span className="text-sm text-[#737373]">{linkProvider}</span> : null}
                {title}
              </a>
            );
          } else if (mention.type === "page") {
            node = (
              <a
                href={mention.page.id}
                className="text-[#737373] underline hover:text-primary transition-colors "
                target="_blank"
                rel="noopener noreferrer"
              >
                📚 {text.plain_text}
                <ExternalLink className="size-4 inline mb-1 ml-0.5" />
              </a>
            );
          }
        }
        else if (text.type === "text" && text.href) {
          console.log(text);
          node = (
            <a
              href={text.href}
              className="text-[#737373] underline hover:text-primary transition-colors "
              target="_blank"
              rel="noopener noreferrer"
            >
              {text.plain_text}
              <ExternalLink className="size-4 inline mb-1 ml-0.5" />
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function getBlockContent(block: BlockWithChildren) {
  const { type } = block;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (block as any)[type];
}

function ChildBlocks({
  blocks,
  firstImageBlockIds,
}: {
  blocks: BlockWithChildren[];
  firstImageBlockIds?: string[] | null;
}) {
  if (!blocks || blocks.length === 0) return null;
  return <NotionBlocks blocks={blocks} firstImageBlockIds={firstImageBlockIds} />;
}

export function NotionBlock({
  block,
  firstImageBlockIds,
}: {
  block: BlockWithChildren;
  firstImageBlockIds?: string[] | null;
}) {
  const content = getBlockContent(block);

  switch (block.type) {
    case "paragraph": {
      if (content.rich_text.length === 1 && content.rich_text[0].type === "mention") {
        return (
          <p className="mb-1 leading-relaxed">
            <RichTextSpan richTexts={content.rich_text} />
          </p>
        );
      }
      return (
        <div className="mb-3">
          <p className="leading-relaxed">
            <RichTextSpan richTexts={content.rich_text} />
          </p>
          {block.children.length > 0 && (
            <div className="pl-4">
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </div>
          )}
        </div>
      );
    }

    case "heading_1":
      return (
        <>
          <h1 id={block.id} className="text-[1.75rem] font-bold mb-1 mt-8 scroll-mt-24">
            <RichTextSpan richTexts={content.rich_text} />
          </h1>
          {block.has_children && (
            <div className="pl-4">
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </div>
          )}
        </>
      );

    case "heading_2":
      return (
        <>
          <h2 id={block.id} className="text-[1.45rem] font-bold mb-0.5 mt-7 scroll-mt-24">
            <RichTextSpan richTexts={content.rich_text} />
          </h2>
          {block.has_children && (
            <div className="pl-4">
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </div>
          )}
        </>
      );

    case "heading_3":
      return (
        <>
          <h3 id={block.id} className="text-[1.2rem] font-bold mb-0.5 mt-7 scroll-mt-24">
            <RichTextSpan richTexts={content.rich_text} />
          </h3>
          {block.has_children && (
            <div className="pl-4">
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </div>
          )}
        </>
      );

    case "bulleted_list_item":
      return (
        <li className="ml-6 list-disc mb-1 leading-relaxed">
          <RichTextSpan richTexts={content.rich_text} />
          {block.children.length > 0 && (
            <ul>
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </ul>
          )}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="ml-6 list-decimal mb-1 leading-relaxed">
          <RichTextSpan richTexts={content.rich_text} />
          {block.children.length > 0 && (
            <ol>
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </ol>
          )}
        </li>
      );

    case "to_do":
      return (
        <div className="mb-1">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={content.checked}
              readOnly
              className="mt-1.5"
            />
            <span className={content.checked ? "line-through text-[#999]" : ""}>
              <RichTextSpan richTexts={content.rich_text} />
            </span>
          </div>
          {block.children.length > 0 && (
            <div className="pl-6">
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </div>
          )}
        </div>
      );

    case "toggle":
      return (
        <details className="mb-4">
          <summary className="cursor-pointer font-medium">
            <RichTextSpan richTexts={content.rich_text} />
          </summary>
          <div className="pl-4 pt-2">
            <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
          </div>
        </details>
      );

    case "code": {
      const codeParts: string[] = [];
      const segments: { start: number; end: number; bold?: boolean }[] = [];
      let pos = 0;
      for (const t of content.rich_text) {
        const text = "plain_text" in t ? t.plain_text : "";
        const annotations = "annotations" in t ? t.annotations : undefined;
        if (text.length > 0 && annotations?.bold) {
          segments.push({ start: pos, end: pos + text.length, bold: true });
        }
        codeParts.push(text);
        pos += text.length;
      }
      const codeText = codeParts.join("");
      const language = (content.language as string) ?? "plaintext";
      return (
        <ShikiCodeBlock code={codeText} language={language} boldSegments={segments} />
      );
    }

    case "quote":
      return (
        <blockquote className="border-l-4 pl-4 italic mb-4 text-[#555] bg-[#f8f8f8] p-3">
          <RichTextSpan richTexts={content.rich_text} />
          {block.children.length > 0 && (
            <div className="mt-2 not-italic">
              <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
            </div>
          )}
        </blockquote>
      );

    case "callout":
      return (
        <div className="bg-background-highlight p-4 rounded-xl my-2 flex gap-3 whitespace-pre-wrap">
          {content.icon?.emoji && (
            <span className="text-xl">{content.icon.emoji}</span>
          )}
          <div className="min-w-0 flex-1">
            <RichTextSpan richTexts={content.rich_text} />
            {block.children.length > 0 && (
              <div className="mt-2">
                <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />
              </div>
            )}
          </div>
        </div>
      );

    case "synced_block":
      return <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />;

    case "column_list":
      return (
        <div className="flex gap-4 mb-4">
          {block.children.map((column) => (
            <div key={column.id} className="flex-1 min-w-0">
              <ChildBlocks blocks={column.children} firstImageBlockIds={firstImageBlockIds} />
            </div>
          ))}
        </div>
      );

    case "column":
      return <ChildBlocks blocks={block.children} firstImageBlockIds={firstImageBlockIds} />;

    case "table": {
      const hasHeader = content.has_column_header;
      const rows = block.children;
      return (
        <div className="overflow-x-auto mb-4">
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full border-collapse text-sm">
              {rows.length > 0 && hasHeader && (
                <thead>
                  <tr className="bg-background-highlight">
                    {getBlockContent(rows[0]).cells?.map(
                      (cell: RichTextItemResponse[], ci: number) => (
                        <th
                          key={ci}
                          className="border-b border-r last:border-r-0 px-3 py-2 bg-background-highlight text-left font-semibold text-foreground"
                        >
                          <RichTextSpan richTexts={cell} />
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.slice(hasHeader ? 1 : 0).map((row: BlockWithChildren) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    {getBlockContent(row).cells?.map(
                      (cell: RichTextItemResponse[], ci: number) => (
                        <td key={ci} className="border-r last:border-r-0 px-3 py-2">
                          <RichTextSpan richTexts={cell} />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case "table_row":
      return null;

    case "divider":
      return <hr className="my-8 border-[#ebebeb]" />;

    case "image": {
      const src =
        content.type === "external"
          ? content.external.url
          : content.file?.url;
      const caption = content.caption?.[0]?.plain_text;
      const isPriorityImage =
        firstImageBlockIds?.includes(block.id) ?? false;
      return (
        <figure className="mb-6">
          {src && (
            <Image
              src={src}
              alt={caption || `${content.type} 이미지`}
              width={800}
              height={600}
              sizes="(max-width: 800px) 100vw, 800px"
              quality={82}
              className="w-full"
              priority={isPriorityImage}
              imageClassName="rounded-xl w-full max-w-[800px] mx-auto h-auto"
            />
          )}
          {caption && (
            <figcaption className="text-center text-sm text-[#888] mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "bookmark": {
      const caption = content.caption?.[0]?.plain_text;
      return (
        <BookmarkBlock
          url={content.url}
          caption={caption}
        />
      );
    }

    case "embed":
      return (
        <div className="mb-4">
          <iframe
            src={content.url}
            className="w-full h-80 rounded-lg border border-[#ddd]"
            allowFullScreen
          />
        </div>
      );

    case "video": {
      const videoUrl =
        content.type === "external"
          ? content.external.url
          : content.file?.url;
      if (videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be")) {
        const videoId = videoUrl.includes("youtu.be")
          ? videoUrl.split("/").pop()
          : new URL(videoUrl).searchParams.get("v");
        return (
          <div className="mb-4 aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <video src={videoUrl} controls className="w-full rounded-lg mb-4" />
      );
    }

    default:
      return null;
  }
}

export function NotionBlocks({
  blocks,
  firstImageBlockIds,
}: {
  blocks: BlockWithChildren[];
  firstImageBlockIds?: string[] | null;
}) {
  const rendered: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "bulleted_list_item") {
      const items: BlockWithChildren[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blocks[i]);
        i++;
      }
      rendered.push(
        <ul key={items[0].id} className="mb-4">
          {items.map((item) => (
            <NotionBlock key={item.id} block={item} firstImageBlockIds={firstImageBlockIds} />
          ))}
        </ul>,
      );
      continue;
    }

    if (block.type === "numbered_list_item") {
      const items: BlockWithChildren[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blocks[i]);
        i++;
      }
      rendered.push(
        <ol key={items[0].id} className="mb-4">
          {items.map((item) => (
            <NotionBlock key={item.id} block={item} firstImageBlockIds={firstImageBlockIds} />
          ))}
        </ol>,
      );
      continue;
    }

    rendered.push(
      <NotionBlock key={block.id} block={block} firstImageBlockIds={firstImageBlockIds} />,
    );
    i++;
  }

  return <>{rendered}</>;
}
