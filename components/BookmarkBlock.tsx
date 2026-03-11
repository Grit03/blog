import { Suspense } from "react";
import { Image } from "@/components/Image";

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
    <div className="mb-3 max-w-[800px] mx-auto">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex border border-[#e3e3e3] min-h-[130px] rounded-lg overflow-hidden hover:bg-[#efefef] transition-colors no-underline"
      >
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-between gap-1.5">
          <span className="text-md font-medium text-[#737373] line-clamp-1 animate-pulse">
            미리보기 불러오는 중…
          </span>
          <span className="flex items-center gap-1.5 mt-auto">
            <span className="text-xs text-[#999] truncate">{hostname}</span>
          </span>
        </div>
      </a>
      {caption && (
        <p className="text-xs text-[#999] mt-1.5 px-0.5">{caption}</p>
      )}
    </div>
  );
}

const fetchOgMeta = async (url: string) => {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    const get = (property: string) => {
      const m =
        html.match(
          new RegExp(
            `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
            "i",
          ),
        ) ??
        html.match(
          new RegExp(
            `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
            "i",
          ),
        );
      return m?.[1] ?? null;
    };

    const title =
      get("og:title") ??
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ??
      null;
    const description = get("og:description") ?? get("description");
    const image = get("og:image");

    const origin = new URL(url).origin;
    const favicon = `${origin}/favicon.ico`;

    const ogImage =
      image === null
        ? null
        : image.startsWith("http")
          ? image
          : new URL(image, origin).href;

    return { title, description, image: ogImage, favicon };
  } catch {
    return null;
  }
};

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
    <div className="mb-3 max-w-[800px] mx-auto">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex border border-[#e3e3e3] min-h-[130px] rounded-lg overflow-hidden hover:bg-[#efefef] transition-colors no-underline"
      >
        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-between gap-1.5">
          {meta?.title ? (
            <span className="text-md font-medium text-foreground line-clamp-1">
              {meta.title}
            </span>
          ) : (
            <span className="text-md font-medium text-foreground line-clamp-1 text-[#737373]">
              미리보기를 불러올 수 없습니다
            </span>
          )}
          {meta?.description && (
            <span className="text-xs text-[#999] line-clamp-2 leading-relaxed">
              {meta.description}
            </span>
          )}
          <span className="flex items-center gap-1.5 mt-auto">
            {faviconUrl && (
              <Image
                src={faviconUrl}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 shrink-0 rounded-sm"
                imageClassName="rounded-sm"
                unoptimized
              />
            )}
            <span className="text-xs text-[#999] truncate">{hostname}</span>
          </span>
        </div>

        {meta?.image && (
          <div className="w-[190px] sm:block sm:w-[230px] shrink-0 border-l border-[#e3e3e3] relative">
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
        <p className="text-xs text-[#999] mt-1.5 px-0.5">{caption}</p>
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
