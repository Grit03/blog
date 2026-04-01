import Link from "next/link";
import { FeaturedImage } from "./FeaturedImage";
import { PostTitle } from "./PostTitle";
import { PostExcerpt } from "./PostExcerpt";
import { TagList } from "./TagList";
import { PostDate } from "./PostDate";

export type PostCardProps = {
  href: string;
  coverUrl?: string;
  title: string;
  excerpt: string;
  tags: { id: string; name: string; color?: string }[];
  date: string;
  /** 목록 상단 LCP 개선용 */
  priorityImage?: boolean;
};

export function PostCard({
  href,
  coverUrl,
  title = "제목이 없습니다",
  excerpt,
  tags,
  date,
  priorityImage = false,
}: PostCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-[180px] flex-col gap-3 rounded-xl p-3 text-left transition md:flex-row md:gap-5.5"
    >
      <FeaturedImage src={coverUrl} alt={title} priority={priorityImage} />
      <div className="group-hover:text-primary flex flex-1 flex-col py-1 transition-colors">
        <div className="flex flex-1 flex-col gap-1.5">
          <TagList tags={tags} />
          <PostTitle>{title}</PostTitle>
          {excerpt && (
            <PostExcerpt className="flex-1 break-keep">{excerpt}</PostExcerpt>
          )}
        </div>
        <div className="mt-3 flex justify-start">
          <PostDate date={date} className="flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}
