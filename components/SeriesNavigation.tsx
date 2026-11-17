import Link from "next/link";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import type { Series } from "@/lib/series";
import { getPageTitle } from "@/lib/notion";
import { getSeriesNeighbors } from "@/lib/series-model";
import { cn } from "@/lib/utils";

export function SeriesContents({
  series,
  pageId,
}: {
  series: Series;
  pageId: string;
}) {
  const { index } = getSeriesNeighbors(series.posts, pageId);
  if (index < 0) return null;
  return (
    <aside
      aria-label="시리즈 목차"
      className="border-hairline mb-8 overflow-hidden rounded-xl border"
    >
      <details open className="group">
        <summary className="bg-surface flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <Layers className="text-primary size-4 shrink-0" />
          <Link
            href={`/series/${series.slug}`}
            className="hover:text-primary min-w-0 flex-1 truncate font-semibold transition-colors"
          >
            {series.title}
          </Link>
          <span className="bg-chip text-quiet rounded-sm px-2 py-1 text-xs font-medium tabular-nums">
            {index + 1} / {series.posts.length}
          </span>
          <ChevronRight className="text-subtle size-4 shrink-0 transition-transform group-open:rotate-90" />
        </summary>
        <ol className="border-hairline m-0 list-none space-y-0.5 border-t p-2">
          {series.posts.map((post, i) => {
            const current = post.id === pageId;
            return (
              <li key={post.id}>
                <Link
                  href={`/post/${post.id}`}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                    current
                      ? "bg-chip text-foreground font-semibold"
                      : "text-quiet hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 shrink-0 text-right tabular-nums",
                      current ? "text-primary" : "text-faint"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="break-keep">{getPageTitle(post)}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </details>
    </aside>
  );
}

export function SeriesPagination({
  series,
  pageId,
}: {
  series: Series;
  pageId: string;
}) {
  const { previous, next } = getSeriesNeighbors(series.posts, pageId);
  if (!previous && !next) return null;
  const card =
    "border-hairline hover:bg-surface-hover group flex items-center gap-3 rounded-xl border p-4 transition-colors";
  return (
    <nav
      aria-label="시리즈 이전 글과 다음 글"
      className="mt-12 grid gap-3 sm:grid-cols-2"
    >
      {previous && (
        <Link href={`/post/${previous.id}`} className={card}>
          <ChevronLeft className="text-subtle size-5 shrink-0" />
          <span className="min-w-0">
            <span className="text-subtle block text-xs">이전 글</span>
            <span className="group-hover:text-primary mt-0.5 line-clamp-1 font-medium transition-colors">
              {getPageTitle(previous)}
            </span>
          </span>
        </Link>
      )}
      {next && (
        <Link
          href={`/post/${next.id}`}
          className={cn(card, "justify-end text-right sm:col-start-2")}
        >
          <span className="min-w-0">
            <span className="text-subtle block text-xs">다음 글</span>
            <span className="group-hover:text-primary mt-0.5 line-clamp-1 font-medium transition-colors">
              {getPageTitle(next)}
            </span>
          </span>
          <ChevronRight className="text-subtle size-5 shrink-0" />
        </Link>
      )}
    </nav>
  );
}
