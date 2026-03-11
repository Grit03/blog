import {
  getPosts,
  getPageTitle,
  getPageTags,
} from "@/lib/notion";
import { PostCard } from "@/components/PostCard";
import { getPageCategory, getPageExcerpt, getPageDate } from "@/lib/notion";
import { Categories, MiniCategories } from "@/components/Categories";

const CATEGORY_VALUES = ["프로젝트", "딥다이브", "학습정리", "회고"] as const;

/** ISR: 1시간 캐시. webhook으로 revalidatePath 호출 시 즉시 갱신 */
export const revalidate = 3600;

function postMatchesCategory(
  page: Awaited<ReturnType<typeof getPosts>>[number],
  category: string
): boolean {
  const fromSelect = getPageCategory(page);
  if (fromSelect === category) return true;
  const tagNames = getPageTags(page).map((t) => t.name);
  return tagNames.includes(category);
}

function normalizeCategoryParam(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !CATEGORY_VALUES.includes(raw as (typeof CATEGORY_VALUES)[number]))
    return null;
  return raw;
}

type Props = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function Home({ searchParams }: Props) {
  const resolved = await searchParams;
  const categoryParam = normalizeCategoryParam(resolved.category);

  const allPosts = await getPosts();
  const posts = categoryParam
    ? allPosts.filter((page) => postMatchesCategory(page, categoryParam))
    : allPosts;

  return (
    <div className="flex flex-col w-full px-10">
      <div className="flex flex-1 py-6 w-full lg:max-w-6xl mx-auto gap-10">
        <main className="flex-1">
          <p className="text-sm text-[#737373] mb-4">
            총 {posts.length}개의 글
          </p>
          <MiniCategories currentCategory={categoryParam} />
          {allPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 rounded-full bg-muted p-4 text-7xl">
                🥺
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                아직 작성된 글이 없습니다
              </h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                열심히 글을 작성중입니다... ✏️
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 rounded-full bg-muted p-4 text-7xl">
                🥺
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                해당 카테고리에 글이 없습니다
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
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
        <Categories currentCategory={categoryParam} />
      </div>
    </div>
  );
}
