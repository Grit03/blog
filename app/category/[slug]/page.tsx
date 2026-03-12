import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPosts,
  getPageTitle,
  getPageTags,
  getPageExcerpt,
  getPageDate,
} from "@/lib/notion";
import { PostCard } from "@/components/PostCard";
import { Categories, MiniCategories } from "@/components/Categories";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";

export const revalidate = false;

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: "카테고리" };
  return { title: category.label };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await getPosts(category.value);

  return (
    <div className="flex flex-col w-full px-10">
      <div className="flex flex-1 py-6 w-full lg:max-w-6xl mx-auto gap-10">
        <main className="flex-1">
          <p className="text-sm text-[#737373] mb-4">
            총 {posts.length}개의 글
          </p>
          <MiniCategories currentSlug={slug} />
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 rounded-full bg-muted p-4 text-7xl">
                🥺
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                해당 카테고리에 글이 없습니다
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                다른 카테고리를 선택하거나 전체 글 목록을 확인해 보세요.
              </p>
            </div>
          ) : (
            <ul className="w-full space-y-2 list-none p-0 m-0">
              {posts.map((page, index) => (
                <li key={page.id}>
                  <PostCard
                    href={`/post/${page.id}`}
                    coverUrl={page.cover?.type === "file" ? page.cover.file?.url : undefined}
                    title={getPageTitle(page)}
                    excerpt={getPageExcerpt(page)}
                    tags={getPageTags(page)}
                    date={getPageDate(page)}
                    priorityImage={index < 2}
                  />
                </li>
              ))}
            </ul>
          )}
        </main>
        <Categories currentSlug={slug} />
      </div>
    </div>
  );
}
