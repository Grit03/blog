import { Fragment } from "react";
import type { RichTextItemResponse } from "@notionhq/client";
import { toNotionImageUrl, type BlockWithChildren } from "@/lib/notion";
import { ShikiCodeBlock } from "./ShikiCodeBlock";
import Image from "next/image";
import { canOptimize } from "@/lib/image";
import { BookmarkBlock } from "./BookmarkBlock";
import { HeadingAnchor } from "./HeadingAnchor";
import { cn } from "@/lib/utils";
import { ExternalLink, GitPullRequestArrow } from "lucide-react";
import { fetchOgMeta } from "@/lib/fetch";
import { fetchGithubPreview, parseGithubIssueUrl } from "@/lib/github";
import { GithubPreviewCard } from "./GithubPreviewCard";

async function LinkPreview({
  url,
  fallbackText,
}: {
  url: string;
  fallbackText: string;
}) {
  if (parseGithubIssueUrl(url)) {
    // 빌드 타임 데이터는 초기 렌더링용 — 최신 상태는 카드가 클라이언트에서 다시 동기화한다
    const initialPreview = await fetchGithubPreview(url);
    return (
      <GithubPreviewCard
        url={url}
        initialPreview={initialPreview}
        fallbackText={fallbackText}
      />
    );
  }

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
        className="hover:bg-background-highlight flex cursor-pointer items-center gap-2.5 rounded-sm border-[1.4px] border-hairline px-4.5 py-3.5 text-sm"
      >
        <div className="relative size-8.5 overflow-hidden rounded-full">
          <img
            src={`https://github.com/${author}.png`}
            alt="깃헙 사용자 프로필"
          />
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="truncate font-semibold wrap-break-word">
            {title}
            <ExternalLink className="mb-1 ml-0.5 inline size-4 text-subtle" />
          </div>
          <div className="flex items-center gap-1.5">
            <GitPullRequestArrow className="text-primary size-3.5 shrink-0" />
            <div className="truncate text-xs text-subtle">
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
      className="hover:text-primary text-subtle underline transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      {fallbackText}
      <ExternalLink className="mb-1 ml-0.5 inline size-4" />
    </a>
  );
}

export function RichTextSpan({
  richTexts,
  id,
}: {
  richTexts: RichTextItemResponse[];
  id: string;
}) {
  // <p> 안에 들어가므로 div가 아닌 span이어야 브라우저가 문단을 쪼개지 않는다
  if (richTexts.length === 0) return <span className="block h-2" />;

  return (
    <>
      {richTexts.map((text, i) => {
        // 노션의 Shift+Enter는 같은 블록 안에 \n으로 들어온다 — HTML이 접어버리므로 <br />로 살린다.
        // 다만 블록 맨 앞뒤의 줄바꿈은 빈 줄만 만들어 간격이 벌어지므로 버린다.
        let raw = text.plain_text;
        if (i === 0) raw = raw.replace(/^\n+/, "");
        if (i === richTexts.length - 1) raw = raw.replace(/\n+$/, "");

        /*
         * 노션은 인라인 코드 같은 서식 경계에 붙는 공백을 U+00A0(줄바꿈 없는 공백)으로
         * 내려준다. 이름 그대로 그 자리에서는 줄을 바꿀 수 없다.
         *
         * 그래서 `Object.defineProperty()`, `Reflect.defineProperty()`, ... 처럼
         * 코드가 쉼표로 이어지면 사이의 공백이 전부 못 끊는 공백이라 네 덩어리가 하나의
         * "단어"가 된다. 본문은 word-break: keep-all이라 그 단어 안에서도 끊지 못해,
         * 375px 화면에서 문단 하나가 895px까지 늘어나며 페이지가 가로로 스크롤됐다.
         *
         * 일반 공백으로 되돌려 쉼표 뒤에서 자연스럽게 접히게 한다. 본문은
         * white-space: normal이므로 보이는 모양은 그대로다. 글 전체를 뒤져 봐도 U+00A0은
         * 늘 한 칸씩만 쓰여 있어(연속 사용 0건), 일부러 벌려 둔 간격을 망칠 일은 없다.
         */
        raw = raw.replace(/ /g, " ");

        const lines = raw.split("\n");
        let node: React.ReactNode =
          lines.length === 1
            ? raw
            : lines.map((line, li) => (
                <Fragment key={li}>
                  {li > 0 && <br />}
                  {line}
                </Fragment>
              ));

        if (text.annotations.code)
          node = (
            <code
              className={cn(
                "bg-code text-code-foreground mx-0.5 rounded px-1 py-0.5 text-[0.85em]",
                text.annotations.bold && "font-semibold"
              )}
            >
              {node}
            </code>
          );
        if (text.annotations.bold)
          node = <strong className="font-semibold">{node}</strong>;
        if (text.annotations.italic) node = <em>{node}</em>;
        if (text.annotations.strikethrough) node = <s>{node}</s>;
        if (text.annotations.underline) node = <u>{node}</u>;

        if (text.type === "mention" && text.href) {
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
                className="bg-background-highlight mt-3 mb-5 flex items-center gap-2 rounded-md px-2.5 py-2 text-[0.9rem] font-medium text-subtle underline transition-colors hover:bg-surface-hover"
                target="_blank"
                rel="noopener noreferrer"
              >
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    alt={`링크 미리보기 아이콘 (${title || "제목 없음"})`}
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
                className="hover:text-primary text-subtle underline transition-colors"
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
              className="hover:text-primary text-subtle underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {node}
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
      // 엔터만 친 빈 문단 — 문단 간격이 이미 충분하므로 살짝만 더 띄운다
      if (content.rich_text.length === 0 && block.children.length === 0) {
        return <div className="h-2" />;
      }
      if (
        content.rich_text.length === 1 &&
        content.rich_text[0].type === "mention"
      ) {
        return (
          <div className="mb-4.5">
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </div>
        );
      }
      return (
        <div className="mb-4.5">
          <p>
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
          <HeadingAnchor
            as="h1"
            id={block.id}
            className="mt-16 mb-4 text-2xl leading-snug font-bold sm:text-[1.75rem]"
          >
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </HeadingAnchor>
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
          <HeadingAnchor
            as="h2"
            id={block.id}
            className="mt-12 mb-4 text-xl leading-snug font-bold sm:text-[1.45rem]"
          >
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </HeadingAnchor>
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
          <HeadingAnchor
            as="h3"
            id={block.id}
            className="mt-9 mb-3 text-lg leading-snug font-bold sm:text-[1.2rem]"
          >
            <RichTextSpan richTexts={content.rich_text} id={block.id} />
          </HeadingAnchor>
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
        <li className="mb-2 ml-6 list-disc">
          <RichTextSpan richTexts={content.rich_text} id={block.id} />
          {block.children.length > 0 && (
            <ul className="mt-2">
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
        <li className="mb-2 ml-6 list-decimal">
          <RichTextSpan richTexts={content.rich_text} id={block.id} />
          {block.children.length > 0 && (
            <ol className="mt-2">
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
        <div className="mb-2">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={content.checked}
              readOnly
              className="mt-1.5"
            />
            <span className={content.checked ? "text-faint line-through" : ""}>
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
        <details className="my-4">
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
        <blockquote className="my-5 border-l-4 bg-surface px-5 py-4 text-quiet italic">
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
        <div className="bg-background-highlight my-5 flex gap-3 rounded-xl p-5">
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
        <div className="my-5 flex gap-4">
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
        <div className="my-8 overflow-x-auto">
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
      return <hr className="my-12 border-hairline" />;

    case "image": {
      const rawSrc =
        content.type === "external" ? content.external.url : content.file?.url;
      const src =
        content.type === "file" && rawSrc
          ? toNotionImageUrl(rawSrc, block.id)
          : rawSrc;
      const caption = content.caption?.[0]?.plain_text;
      return (
        <figure className="my-8">
          {src && (
            <Image
              src={src}
              alt={caption || `${content.type} 이미지`}
              width={800}
              height={600}
              sizes="(max-width: 800px) 100vw, 800px"
              quality={82}
              priority
              unoptimized={!canOptimize(src)}
              className="mx-auto h-auto w-full max-w-[800px] rounded-xl"
            />
          )}
          {caption && (
            <figcaption className="mt-2 text-center text-sm text-faint">
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

    // 노션에서 URL을 "Create link preview"로 붙여넣으면 mention이 아닌 독립 블록으로 온다
    case "link_preview":
      return (
        <div className="my-5">
          <LinkPreview url={content.url} fallbackText={content.url} />
        </div>
      );

    case "embed":
      return (
        <div className="my-8">
          <iframe
            src={content.url}
            className="h-80 w-full rounded-lg border border-hairline"
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
          <div className="my-8 aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="h-full w-full rounded-lg"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <video src={videoUrl} controls className="my-8 w-full rounded-lg" />
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
        <ul key={items[0].id} className="my-5">
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
        <ol key={items[0].id} className="my-5">
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
