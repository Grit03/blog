import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { canOptimize } from "@/lib/image";
import { getSeries } from "@/lib/series";

export const revalidate = false;
export const metadata: Metadata = {
  title: "시리즈",
  description: "주제별로 순서대로 읽는 글 모음",
  alternates: { canonical: "/series" },
};

export default async function SeriesPage() {
  const series = await getSeries();
  return (
    // 홈·카테고리와 같은 바깥 틀을 써야 탭을 오갈 때 위치가 흔들리지 않는다.
    <div className="flex w-full flex-col px-4 sm:px-10">
      <main className="mx-auto w-full flex-1 py-6 lg:max-w-6xl">
        <h1 className="sr-only">시리즈</h1>
        <p className="text-subtle mb-4 text-sm">
          총 {series.length}개의 시리즈
        </p>
        {series.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((entry, index) => {
              const src = entry.coverUrl ?? "/image/placeholder.png";
              return (
                <li key={entry.id}>
                  <Link
                    href={`/series/${entry.slug}`}
                    className="group border-hairline bg-card dark:bg-surface hover:border-primary/40 flex h-full flex-col overflow-hidden rounded-xl border transition-colors"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={src}
                        alt=""
                        fill
                        priority={index < 3}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                        unoptimized={!canOptimize(src)}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <span className="bg-chip text-quiet w-fit rounded-sm px-2 py-1 text-xs font-medium">
                        {entry.posts.length}편
                      </span>
                      <h2 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-bold break-keep transition-colors">
                        {entry.title}
                      </h2>
                      {entry.description && (
                        <p className="text-quiet line-clamp-2 text-sm leading-relaxed break-keep">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-muted mb-4 rounded-full p-4 text-7xl">📚</div>
            <h2 className="text-foreground text-lg font-semibold">
              아직 공개된 시리즈가 없습니다
            </h2>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
              하나의 주제로 이어지는 글을 준비하고 있습니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
