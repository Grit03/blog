import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getSeries } from "@/lib/series";
import {
  getPageTitle,
  getPageCover,
  getPageExcerpt,
  getPageTags,
  getPageDate,
} from "@/lib/notion";
import { PostCard } from "@/components/PostCard";
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
      <main className="mx-auto w-full flex-1 py-6 lg:max-w-6xl">
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
        <header className="border-hairline mt-4 mb-6 border-b pb-6">
          <p className="text-primary text-sm font-semibold">시리즈</p>
          <h1 className="mt-1 text-3xl font-bold break-keep">{series.title}</h1>
          {series.description && (
            <p className="text-quiet mt-3 leading-relaxed break-keep whitespace-pre-line">
              {series.description}
            </p>
          )}
          <p className="text-subtle mt-4 text-sm">총 {series.posts.length}편</p>
        </header>
        <ol className="m-0 list-none space-y-2 p-0">
          {series.posts.map((post, index) => (
            <li key={post.id} className="flex gap-2 sm:gap-4">
              <span
                aria-hidden
                className="bg-chip text-quiet mt-4 flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <PostCard
                  href={`/post/${post.id}`}
                  title={getPageTitle(post)}
                  excerpt={getPageExcerpt(post)}
                  coverUrl={getPageCover(post) ?? undefined}
                  tags={getPageTags(post)}
                  date={getPageDate(post)}
                  priorityImage={index < 2}
                />
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
