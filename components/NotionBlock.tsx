import type { RichTextItemResponse } from "@notionhq/client";
import type { BlockWithChildren } from "@/lib/notion";
import { ShikiCodeBlock } from "./ShikiCodeBlock";
import { Image } from "@/components/Image";
import { BookmarkBlock } from "./BookmarkBlock";
import { cn } from "@/lib/utils";
import { ExternalLink, GitPullRequestArrow } from "lucide-react";
import { fetchOgMeta } from "@/lib/fetch";

async function LinkPreview({
  url,
  fallbackText,
}: {
  url: string;
  fallbackText: string;
}) {
  const metaInfo = await fetchOgMeta(url);

  if (
    metaInfo &&
    metaInfo.title &&
    url.startsWith("https://github.com/") &&
    url.includes("pull")
  ) {
    const infoDetails = metaInfo.title.split(" · ");
    const [title, author] = infoDetails[0].split(" by ");
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-background-highlight flex cursor-pointer items-center gap-2.5 rounded-sm border-[1.4px] border-gray-300 px-4.5 py-3.5 text-sm"
      >
        <div className="relative size-8.5 overflow-hidden rounded-full">
          <img
            src={`https://github.com/${author}.png`}
            alt="깃헙 사용자 프로필"
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="truncate font-semibold break-words">
            {title}
            <ExternalLink className="mb-1 ml-0.5 inline size-4 text-[#737373]" />
          </div>
          <div className="flex items-center gap-1.5">
            <GitPullRequestArrow className="text-primary size-3.5 shrink-0" />
            <div className="truncate text-xs text-[#737373]">
              {`${infoDetails[1]} · ${author} · ${infoDetails[2]}`}
            </div>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={url}
      className="hover:text-primary text-[#737373] underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {fallbackText}
      <ExternalLink className="mb-1 ml-0.5 inline size-4" />
    </a>
  );
}

function RichTextSpan({
  richTexts,
  id,
}: {
  richTexts: RichTextItemResponse[];
  id: string;
}) {
  return (
    <>
      {richTexts.map((text, i) => {
        let node: React.ReactNode = text.plain_text;

        if (text.annotations.bold)
          node = (
            <strong key={id + i} className="font-semibold">
              {node}
            </strong>
          );
        else if (text.annotations.italic) node = <em>{node}</em>;
        else if (text.annotations.strikethrough) node = <s>{node}</s>;
        else if (text.annotations.underline) node = <u>{node}</u>;
        else if (text.annotations.code)
          node = (
            <code
              className={cn(
                "mx-0.5 rounded bg-[#e8e8e8] px-1 py-0.5 text-[0.85em] text-[#c7254e]",
                text.annotations.bold && "font-semibold"
              )}
            >
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
                className="hover:bg-background-highlight flex items-center gap-1 rounded-md px-2 py-1 text-[0.9rem] font-medium text-[#737373] underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0"
                    unoptimized
                  />
                )}
                {linkAuthor ? (
                  <span>{linkAuthor}</span>
                ) : linkProvider ? (
                  <span>{linkProvider}</span>
                ) : null}
                {title}
                <ExternalLink className="mb-0.5 inline size-3.5" />
              </a>
            );
          } else if (mention.type === "link_preview") {
            node = (
              <LinkPreview
                url={mention.link_preview.url}
                fallbackText={text.plain_text}
              />
            );
          } else if (mention.type === "page") {
            node = (
              <a
                href={mention.page.id}
                className="hover:text-primary text-[#737373] underline transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                📚 {text.plain_text}
                <ExternalLink className="mb-1 ml-0.5 inline size-4" />
              </a>
            );
          }
        } else if (text.type === "text" && text.href) {
          node = (
            <a
              href={text.href}
              className="hover:text-primary text-[#737373] underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {text.plain_text}
              <ExternalLink className="mb-1 ml-0.5 inline size-4" />
            </a>
          );
        }
        return <span key={id + i}>{node}</span>;
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
  return (
    <NotionBlocks blocks={blocks} firstImageBlockIds={firstImageBlockIds} />
  );
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
      if (
        content.rich_text.length === 1 &&
        content.rich_text[0].type === "mention"
      ) {
        return (
          <div className="mb-1 leading-relaxed">
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </div>
        );
      }
      return (
        <div className="mb-3">
          <p className="leading-relaxed">
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </p>
          {block.children.length > 0 && (
            <div className="pl-4">
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </div>
          )}
        </div>
      );
    }

    case "heading_1":
      return (
        <>
          <h1
            id={block.id}
            className="mt-8 mb-1 scroll-mt-24 text-2xl font-bold sm:text-[1.75rem]"
          >
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </h1>
          {block.has_children && (
            <div className="pl-4">
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </div>
          )}
        </>
      );

    case "heading_2":
      return (
        <>
          <h2
            id={block.id}
            className="mt-7 mb-0.5 scroll-mt-24 text-xl font-bold sm:text-[1.45rem]"
          >
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </h2>
          {block.has_children && (
            <div className="pl-4">
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </div>
          )}
        </>
      );

    case "heading_3":
      return (
        <>
          <h3
            id={block.id}
            className="mt-7 mb-0.5 scroll-mt-24 text-lg font-bold sm:text-[1.2rem]"
          >
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </h3>
          {block.has_children && (
            <div className="pl-4">
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </div>
          )}
        </>
      );

    case "bulleted_list_item":
      return (
        <li className="mb-1 ml-6 list-disc leading-relaxed">
          <RichTextSpan richTexts={content.rich_text} id={block.id} />
          {block.children.length > 0 && (
            <ul>
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </ul>
          )}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="mb-1 ml-6 list-decimal leading-relaxed">
          <RichTextSpan richTexts={content.rich_text} id={block.id} />
          {block.children.length > 0 && (
            <ol>
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
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
            <span className={content.checked ? "text-[#999] line-through" : ""}>
              <RichTextSpan richTexts={content.rich_text} id={block.id} />
            </span>
          </div>
          {block.children.length > 0 && (
            <div className="pl-6">
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </div>
          )}
        </div>
      );

    case "toggle":
      return (
        <details className="mb-4">
          <summary className="cursor-pointer font-medium">
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </summary>
          <div className="pt-2 pl-4">
            <ChildBlocks
              blocks={block.children}
              firstImageBlockIds={firstImageBlockIds}
            />
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
        <ShikiCodeBlock
          code={codeText}
          language={language}
          boldSegments={segments}
        />
      );
    }

    case "quote":
      return (
        <blockquote className="mb-4 border-l-4 bg-[#f8f8f8] p-3 pl-4 text-[#555] italic">
          <RichTextSpan richTexts={content.rich_text} id={block.id} />
          {block.children.length > 0 && (
            <div className="mt-2 not-italic">
              <ChildBlocks
                blocks={block.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </div>
          )}
        </blockquote>
      );

    case "callout":
      return (
        <div className="bg-background-highlight my-2 flex gap-3 rounded-xl p-4 whitespace-pre-wrap">
          {content.icon?.emoji && (
            <span className="text-xl">{content.icon.emoji}</span>
          )}
          <div className="min-w-0 flex-1">
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
            {block.children.length > 0 && (
              <div className="mt-2">
                <ChildBlocks
                  blocks={block.children}
                  firstImageBlockIds={firstImageBlockIds}
                />
              </div>
            )}
          </div>
        </div>
      );

    case "synced_block":
      return (
        <ChildBlocks
          blocks={block.children}
          firstImageBlockIds={firstImageBlockIds}
        />
      );

    case "column_list":
      return (
        <div className="mb-4 flex gap-4">
          {block.children.map((column) => (
            <div key={column.id} className="min-w-0 flex-1">
              <ChildBlocks
                blocks={column.children}
                firstImageBlockIds={firstImageBlockIds}
              />
            </div>
          ))}
        </div>
      );

    case "column":
      return (
        <ChildBlocks
          blocks={block.children}
          firstImageBlockIds={firstImageBlockIds}
        />
      );

    case "table": {
      const hasHeader = content.has_column_header;
      const rows = block.children;
      return (
        <div className="mb-4 overflow-x-auto">
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full border-collapse text-sm">
              {rows.length > 0 && hasHeader && (
                <thead>
                  <tr className="bg-background-highlight">
                    {getBlockContent(rows[0]).cells?.map(
                      (cell: RichTextItemResponse[], ci: number) => (
                        <th
                          key={ci}
                          className="bg-background-highlight text-foreground border-r border-b px-3 py-2 text-left font-semibold last:border-r-0"
                        >
                          <RichTextSpan richTexts={cell} id={block.id} />
                        </th>
                      )
                    )}
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.slice(hasHeader ? 1 : 0).map((row: BlockWithChildren) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    {getBlockContent(row).cells?.map(
                      (cell: RichTextItemResponse[], ci: number) => (
                        <td
                          key={ci}
                          className="border-r px-3 py-2 last:border-r-0"
                        >
                          <RichTextSpan richTexts={cell} id={block.id} />
                        </td>
                      )
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
        content.type === "external" ? content.external.url : content.file?.url;
      const caption = content.caption?.[0]?.plain_text;
      const isPriorityImage = firstImageBlockIds?.includes(block.id) ?? false;
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
            <figcaption className="mt-2 text-center text-sm text-[#888]">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case "bookmark": {
      const caption = content.caption?.[0]?.plain_text;
      return <BookmarkBlock url={content.url} caption={caption} />;
    }

    case "embed":
      return (
        <div className="mb-4">
          <iframe
            src={content.url}
            className="h-80 w-full rounded-lg border border-[#ddd]"
            allowFullScreen
          />
        </div>
      );

    case "video": {
      const videoUrl =
        content.type === "external" ? content.external.url : content.file?.url;
      if (videoUrl?.includes("youtube.com") || videoUrl?.includes("youtu.be")) {
        const videoId = videoUrl.includes("youtu.be")
          ? videoUrl.split("/").pop()
          : new URL(videoUrl).searchParams.get("v");
        return (
          <div className="mb-4 aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="h-full w-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <video src={videoUrl} controls className="mb-4 w-full rounded-lg" />
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
            <NotionBlock
              key={item.id}
              block={item}
              firstImageBlockIds={firstImageBlockIds}
            />
          ))}
        </ul>
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
            <NotionBlock
              key={item.id}
              block={item}
              firstImageBlockIds={firstImageBlockIds}
            />
          ))}
        </ol>
      );
      continue;
    }

    rendered.push(
      <NotionBlock
        key={block.id}
        block={block}
        firstImageBlockIds={firstImageBlockIds}
      />
    );
    i++;
  }

  return <>{rendered}</>;
}
