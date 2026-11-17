import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  ["posts", "/", "전체 글"],
  ["series", "/series", "시리즈"],
] as const;

/** shadcn Tabs 모양의 페이지 전환 링크. 탭마다 주소가 달라 Link로 만든다. */
export function BlogTabs({ active }: { active: "posts" | "series" }) {
  return (
    <nav
      aria-label="블로그 탐색"
      className="bg-chip mb-5 inline-flex h-10 items-center rounded-lg p-1"
    >
      {TABS.map(([value, href, label]) => (
        <Link
          key={value}
          href={href}
          aria-current={active === value ? "page" : undefined}
          className={cn(
            "focus-visible:ring-ring/50 inline-flex h-full items-center rounded-md px-4 text-sm font-medium transition-all outline-none focus-visible:ring-3",
            active === value
              ? "bg-card text-foreground dark:bg-background shadow-sm"
              : "text-subtle hover:text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
