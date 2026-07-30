import {
  getPosts,
  getPageTitle,
  getPageTags,
  getPageExcerpt,
  getPageDate,
  getPageCover,
} from "@/lib/notion";
import { PostCard } from "@/components/PostCard";
import { Categories, MiniCategories } from "@/components/Categories";

export const revalidate = false;

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="flex w-full flex-col px-4 sm:px-10">
      <div className="mx-auto flex w-full flex-1 gap-10 py-6 lg:max-w-6xl">
        {/*
          min-w-0이 없으면 flex 아이템의 기본 min-width: auto 때문에 이 열이
          내용의 최소 너비 아래로 못 줄어든다. MiniCategories의 칩 6개가
          min-w-11.5 + shrink-0이라 최소 306px를 요구해서, 320px 화면에서는
          가로 스크롤 대신 열 자체가 넓어지며 페이지가 밀렸다.
        */}
        <main className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-subtle">
            총 {posts.length}개의 글
          </p>
          <MiniCategories currentSlug={null} />
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-muted mb-4 rounded-full p-4 text-7xl">🥺</div>
              <h3 className="text-foreground text-lg font-semibold">
                아직 작성된 글이 없습니다
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                열심히 글을 작성중입니다... ✏️
              </p>
            </div>
          ) : (
            <ul className="m-0 w-full list-none space-y-2 p-0">
              {posts.map((page, index) => (
                <li key={page.id}>
                  <PostCard
                    href={`/post/${page.id}`}
                    coverUrl={getPageCover(page) ?? undefined}
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
        <Categories currentSlug={null} />
      </div>
    </div>
  );
}
