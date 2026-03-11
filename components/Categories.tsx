import Link from "next/link";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "전체", value: null },
  { id: "project", label: "프로젝트", value: "프로젝트" },
  { id: "deepdive", label: "딥다이브", value: "딥다이브" },
  { id: "study", label: "학습정리", value: "학습정리" },
  { id: "retro", label: "회고", value: "회고" },
] as const;

type CategoriesProps = {
  currentCategory: string | null;
};

export function Categories({ currentCategory }: CategoriesProps) {
  return (
    <aside className="flex-shrink-0 w-[215px] hidden lg:block">
      <h2 className="text-sm font-semibold text-[#242424] mb-3">Categories</h2>
      <nav className="flex flex-col gap-1.5" aria-label="카테고리">
        {CATEGORIES.map(({ id, label, value }) => {
          const isActive =
            (value === null && currentCategory === null) ||
            (value !== null && currentCategory === value);
          const href = value === null ? "/" : `/?category=${encodeURIComponent(value)}`;
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "block w-full py-2 px-3 text-sm rounded-md text-center transition font-medium",
                isActive ? "bg-primary text-white" : "bg-[#E8E8E8] text-[#242424] hover:bg-[#D4D4D4]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MiniCategories({ currentCategory }: CategoriesProps) {
  return (
    <aside className="mt-3 mb-1 block lg:hidden">
      <nav className="flex gap-1.5" aria-label="카테고리">
        {CATEGORIES.map(({ id, label, value }) => {
          const isActive =
            (value === null && currentCategory === null) ||
            (value !== null && currentCategory === value);
          const href = value === null ? "/" : `/?category=${encodeURIComponent(value)}`;
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                "block w-full py-2 px-3 text-sm rounded-md text-center transition font-medium",
                isActive ? "bg-primary text-white" : "bg-[#E8E8E8] text-[#242424] hover:bg-[#D4D4D4]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
