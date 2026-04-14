import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";

type CategoriesProps = {
  currentSlug: string | null;
};

export function Categories({ currentSlug }: CategoriesProps) {
  return (
    <aside className="hidden w-53.75 shrink-0 lg:block">
      <h2 className="mb-3 text-sm font-semibold text-[#242424]">Categories</h2>
      <nav className="flex flex-col gap-1.5" aria-label="카테고리">
        <Link
          href="/"
          className={cn(
            "block w-full rounded-md px-3 py-2 text-center text-sm font-medium transition",
            currentSlug === null
              ? "bg-primary text-white"
              : "bg-[#E8E8E8] text-[#242424] hover:bg-[#D4D4D4]"
          )}
        >
          전체
        </Link>
        {CATEGORIES.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className={cn(
              "block w-full rounded-md px-3 py-2 text-center text-sm font-medium transition",
              currentSlug === slug
                ? "bg-primary text-white"
                : "bg-[#E8E8E8] text-[#242424] hover:bg-[#D4D4D4]"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function MiniCategories({ currentSlug }: CategoriesProps) {
  return (
    <aside className="no-scrollbar mt-3 mb-1 block overflow-x-scroll lg:hidden">
      <nav className="flex gap-1.5 py-2" aria-label="카테고리">
        <Link
          href="/"
          className={cn(
            "block w-1/5 min-w-11.5 shrink-0 rounded-md px-3 py-2 text-center text-xs font-medium transition sm:w-full sm:text-sm",
            currentSlug === null
              ? "bg-primary text-white"
              : "bg-[#E8E8E8] text-[#242424] hover:bg-[#D4D4D4]"
          )}
        >
          전체
        </Link>
        {CATEGORIES.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className={cn(
              "block w-1/5 min-w-11.5 shrink-0 rounded-md px-3 py-2 text-center text-xs font-medium transition sm:w-full sm:text-sm",
              currentSlug === slug
                ? "bg-primary text-white"
                : "bg-[#E8E8E8] text-[#242424] hover:bg-[#D4D4D4]"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
