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
    <div className="mx-auto mb-3 max-w-[800px]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[130px] overflow-hidden rounded-lg border border-[#e3e3e3] no-underline transition-colors hover:bg-[#efefef]"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-4 py-3">
          <span className="text-md line-clamp-1 animate-pulse font-medium text-[#737373]">
            미리보기 불러오는 중…
          </span>
          <span className="mt-auto flex items-center gap-1.5">
            <span className="truncate text-xs text-[#999]">{hostname}</span>
          </span>
        </div>
      </a>
      {caption && (
        <p className="mt-1.5 px-0.5 text-xs text-[#999]">{caption}</p>
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
    <div className="mx-auto mb-3 max-w-[800px]">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[130px] overflow-hidden rounded-lg border border-[#e3e3e3] no-underline transition-colors hover:bg-[#efefef]"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5 px-4 py-3">
          {meta?.title ? (
            <span className="text-md text-foreground line-clamp-1 font-medium">
              {meta.title}
            </span>
          ) : (
            <span className="text-md text-foreground line-clamp-1 font-medium text-[#737373]">
              미리보기를 불러올 수 없습니다
            </span>
          )}
          {meta?.description && (
            <span className="line-clamp-2 text-xs leading-relaxed text-[#999]">
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
                className="h-4 w-4 shrink-0 rounded-sm"
                imageClassName="rounded-sm"
                unoptimized
              />
            )}
            <span className="truncate text-xs text-[#999]">{hostname}</span>
          </span>
        </div>

        {meta?.image && (
          <div className="relative w-[190px] shrink-0 border-l border-[#e3e3e3] sm:block sm:w-[230px]">
            <Image
              src={meta.image}
              alt={meta.title ?? "링크 썸네일"}
              fill
              className="absolute inset-0"
              imageClassName="object-cover"
              unoptimized
            />
          </div>
        )}
      </a>

      {caption && (
        <p className="mt-1.5 px-0.5 text-xs text-[#999]">{caption}</p>
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
