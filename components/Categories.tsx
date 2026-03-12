import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";

type CategoriesProps = {
  currentSlug: string | null;
};

export function Categories({ currentSlug }: CategoriesProps) {
  return (
    <aside className="flex-shrink-0 w-[215px] hidden lg:block">
      <h2 className="text-sm font-semibold text-[#242424] mb-3">Categories</h2>
      <nav className="flex flex-col gap-1.5" aria-label="카테고리">
        <Link
          href="/"
          className={cn(
            "block w-full py-2 px-3 text-sm rounded-md text-center transition font-medium",
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
              "block w-full py-2 px-3 text-sm rounded-md text-center transition font-medium",
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
    <aside className="mt-3 mb-1 block lg:hidden">
      <nav className="flex gap-1.5" aria-label="카테고리">
        <Link
          href="/"
          className={cn(
            "block w-full py-2 px-3 text-sm rounded-md text-center transition font-medium",
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
              "block w-full py-2 px-3 text-sm rounded-md text-center transition font-medium",
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
