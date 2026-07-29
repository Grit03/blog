"use client";

import type { MouseEvent, ReactNode } from "react";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** 노션 블록 id — 그대로 앵커가 된다 */
  id: string;
  as: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
};

export function HeadingAnchor({ id, as: Tag, className, children }: Props) {
  const copyLink = (e: MouseEvent<HTMLElement>) => {
    // 제목 안에 본문 링크가 들어있을 수 있다 — 그 링크 클릭은 원래대로 이동시킨다
    const anchor = (e.target as HTMLElement).closest("a");
    if (anchor && !anchor.hasAttribute("data-heading-anchor")) return;

    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    window.history.replaceState(null, "", `#${id}`);

    // 클립보드 API는 https/localhost에서만 동작한다 — 실패하면 조용히 넘어간다
    navigator.clipboard?.writeText(url).catch(() => {});
  };

  return (
    <Tag
      id={id}
      onClick={copyLink}
      className={cn(
        "group hover:text-primary scroll-mt-24 cursor-pointer transition-colors",
        className
      )}
    >
      {children}
      <a
        href={`#${id}`}
        data-heading-anchor
        aria-label="이 제목의 링크 복사"
        className="text-primary ml-1.5 inline-block align-middle opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        {/* 제목마다 크기가 달라 em 기준으로 따라가게 한다 */}
        <Hash className="size-[0.7em]" />
      </a>
    </Tag>
  );
}
