import Link from "next/link";
import { Rss } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { GithubIcon } from "@/components/icons/GithubIcon";

const LINKS = [
  {
    href: "https://github.com/Grit03",
    label: "GitHub",
    Icon: GithubIcon,
    external: true,
  },
  { href: "/feed.xml", label: "RSS", Icon: Rss, external: false },
];

export function Footer() {
  // 페이지가 전부 정적 생성이라 이 값은 빌드 시점에 고정된다
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t px-4 sm:px-10">
      <div className="mx-auto w-full py-10 lg:max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-foreground hover:text-primary inline-flex items-center gap-1.5 font-bold transition-colors"
            >
              <span>🍀</span>
              <span className="font-sriracha">Gyuri&apos;s Devlog</span>
            </Link>
            <p className="text-subtle mt-2 text-sm break-keep">
              프로젝트, 딥다이브, 학습정리, 회고를 기록합니다.
            </p>
          </div>

          <nav aria-label="바깥 링크" className="flex items-center gap-5">
            {LINKS.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                className="text-subtle hover:text-primary flex items-center gap-1.5 text-sm transition-colors"
                {...(external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </nav>
        </div>

        <nav
          aria-label="카테고리"
          className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
        >
          <Link
            href="/"
            className="text-subtle hover:text-primary transition-colors"
          >
            전체
          </Link>
          {CATEGORIES.map(({ slug, label }) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="text-subtle hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-hairline text-faint mt-7 flex items-center justify-between border-t pt-5 text-xs">
          <span>© {year} Gyuri</span>
          {/* 사이트 타이틀의 "Moving Forward" — 헤더 워드마크와 같은 손글씨체로 맞춰 마무리한다 */}
          <span className="font-sriracha text-sm">Moving Forward 🍀</span>
        </div>
      </div>
    </footer>
  );
}
