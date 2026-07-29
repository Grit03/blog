import { Suspense } from "react";
import { Image } from "@/components/Image";
import { fetchOgMeta } from "@/lib/fetch";

/** OG 메타 없이 바로 보여주는 링크 카드 (Suspense fallback용) */
function BookmarkBlockFallback({
  url,
  caption,
}: {
  url: string;
  caption?: string;
}) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();
  return (
    <div className="mx-auto mb-3 max-w-200">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-32.5 overflow-hidden rounded-lg border border-hairline no-underline transition-colors hover:bg-surface-hover"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-4 py-3">
          <span className="text-md line-clamp-1 animate-pulse font-medium text-subtle">
            미리보기 불러오는 중…
          </span>
          <span className="mt-auto flex items-center gap-1.5">
            <span className="truncate text-xs text-faint">{hostname}</span>
          </span>
        </div>
      </a>
      {caption && (
        <p className="mt-1.5 px-0.5 text-xs text-faint">{caption}</p>
      )}
    </div>
  );
}

async function BookmarkBlockInner({
  url,
  caption,
}: {
  url: string;
  caption?: string;
}) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();
  const meta = await fetchOgMeta(url);
  const faviconUrl = meta?.favicon;

  return (
    <div className="mx-auto mb-3 max-w-200">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-32.5 overflow-hidden rounded-lg border border-hairline no-underline transition-colors hover:bg-surface-hover"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-4 py-3">
          {meta?.title ? (
            <span className="text-md text-foreground line-clamp-1 font-medium">
              {meta.title}
            </span>
          ) : (
            <span className="text-md text-foreground line-clamp-1 font-medium">
              미리보기를 불러올 수 없습니다
            </span>
          )}
          {meta?.description && (
            <span className="line-clamp-2 text-xs leading-relaxed text-faint">
              {meta.description}
            </span>
          )}
          <span className="mt-auto flex items-center gap-1.5">
            {faviconUrl && (
              <Image
                src={faviconUrl}
                alt=""
                width={16}
                height={16}
                size="sm"
                className="h-4 w-4 shrink-0 rounded-sm"
                imageClassName="rounded-sm"
                unoptimized
              />
            )}
            <span className="truncate text-xs text-faint">{hostname}</span>
          </span>
        </div>

        {meta?.image && (
          <div className="relative w-47.5 shrink-0 border-l border-hairline sm:block sm:w-57.5">
            <Image
              src={meta.image}
              alt={meta.title ?? "링크 썸네일"}
              fill
              className="absolute inset-0 h-full w-full rounded-none"
              imageClassName="object-cover"
              unoptimized
            />
          </div>
        )}
      </a>

      {caption && (
        <p className="mt-1.5 px-0.5 text-xs text-faint">{caption}</p>
      )}
    </div>
  );
}

export function BookmarkBlock({
  url,
  caption,
}: {
  url: string;
  caption?: string;
}) {
  return (
    <Suspense fallback={<BookmarkBlockFallback url={url} caption={caption} />}>
      <BookmarkBlockInner url={url} caption={caption} />
    </Suspense>
  );
}
