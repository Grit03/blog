"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  {
    href: "/",
    label: "글",
    match: (p: string) => p === "/" || p.startsWith("/category/"),
  },
  {
    href: "/series",
    label: "시리즈",
    match: (p: string) => p.startsWith("/series"),
  },
];

/** 로고 옆 사이트 구역 링크. 현재 구역은 글자 색과 굵기로만 표시한다. */
export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="블로그 탐색"
      className="flex items-center gap-4 text-sm sm:gap-5 sm:text-[0.95rem]"
    >
      {LINKS.map(({ href, label, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-colors",
              active
                ? "text-foreground font-semibold"
                : "text-subtle hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
