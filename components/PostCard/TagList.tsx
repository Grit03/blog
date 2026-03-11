import { cn } from "@/lib/utils";
import { Tag } from "./Tag";

type TagItem = { id: string; name: string; color?: string };

type TagListProps = {
  tags: TagItem[];
  className?: string;
};

export function TagList({ tags, className }: TagListProps) {
  if (!tags.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="태그 목록">
      {tags.map((tag) => (
        <li key={tag.id}>
          <Tag name={tag.name} />
        </li>
      ))}
    </ul>
  );
}
