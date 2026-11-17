import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getSeries } from "@/lib/series";
import Image from "next/image";
import {
  getPageTitle,
  getPageCover,
  getPageExcerpt,
  getPageDate,
} from "@/lib/notion";
import { canOptimize } from "@/lib/image";
import { Button } from "@/components/ui/button";

export const revalidate = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSeries()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = (await getSeries()).find((entry) => entry.slug === slug);
  if (!series) return { title: "시리즈를 찾을 수 없습니다" };
  return {
    title: series.title,
    description: series.description || undefined,
    alternates: { canonical: `/series/${series.slug}` },
    openGraph: {
      title: series.title,
      description: series.description,
      url: `/series/${series.slug}`,
      type: "website",
      ...(series.coverUrl ? { images: [series.coverUrl] } : {}),
    },
  };
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const series = (await getSeries()).find((entry) => entry.slug === slug);
  if (!series) notFound();
  return (
    <div className="flex w-full flex-col px-4 sm:px-10">
      {/* 레이아웃 <main>의 py-6만 써서 "전체 시리즈"를 헤더 가까이 둔다 */}
      <main className="mx-auto w-full flex-1 lg:max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-subtle -ml-2.5"
        >
          <Link href="/series">
            <ChevronLeft />
            전체 시리즈
          </Link>
        </Button>
        <header className="mt-3 mb-6">
          <p className="text-primary text-sm font-semibold">시리즈</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-bold break-keep sm:text-3xl">
              {series.title}
            </h1>
            <span className="bg-chip text-quiet rounded-sm px-2 py-1 text-xs font-medium">
              {series.posts.length}편
            </span>
          </div>
          {series.description && (
            <p className="text-quiet mt-2 leading-relaxed break-keep whitespace-pre-line">
              {series.description}
            </p>
          )}
        </header>
        <ol className="border-hairline divide-hairline m-0 list-none divide-y overflow-hidden rounded-xl border p-0">
          {series.posts.map((post, index) => {
            const title = getPageTitle(post);
            const excerpt = getPageExcerpt(post);
            const src = getPageCover(post) ?? "/image/placeholder.png";
            return (
              <li key={post.id}>
                <Link
                  href={`/post/${post.id}`}
                  className="group hover:bg-surface-hover flex items-center gap-3 p-3 transition-colors sm:gap-4 sm:px-4"
                >
                  <span className="text-faint w-5 shrink-0 text-center text-sm font-semibold tabular-nums">
                    {index + 1}
                  </span>
                  <div className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md sm:w-24">
                    <Image
                      src={src}
                      alt=""
                      fill
                      priority={index < 3}
                      sizes="96px"
                      unoptimized={!canOptimize(src)}
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-bold break-keep transition-colors sm:text-base">
                      {title}
                    </h2>
                    {excerpt && (
                      <p className="text-quiet mt-1 line-clamp-1 text-xs sm:text-sm">
                        {excerpt}
                      </p>
                    )}
                    <time className="text-subtle mt-1.5 block text-xs">
                      {getPageDate(post)}
                    </time>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}
