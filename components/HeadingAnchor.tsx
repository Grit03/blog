"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** 노션 블록 id — 그대로 앵커가 된다 */
  id: string;
  as: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
};

export function HeadingAnchor({ id, as: Tag, className, children }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const copyLink = (e: MouseEvent<HTMLElement>) => {
    // 제목 안에 본문 링크가 들어있을 수 있다 — 그 링크 클릭은 원래대로 이동시킨다
    const anchor = (e.target as HTMLElement).closest("a");
    if (anchor && !anchor.hasAttribute("data-heading-anchor")) return;

    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    window.history.replaceState(null, "", `#${id}`);

    // 클립보드 API는 https/localhost에서만 동작한다 — 실패하면 조용히 넘어간다
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
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
      <span className="relative ml-2 inline-block align-middle">
        <a
          href={`#${id}`}
          data-heading-anchor
          aria-label="이 제목의 링크 복사"
          className="text-primary text-[0.8em] font-normal opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          #
        </a>
        {copied && (
          <span
            role="status"
            className="bg-foreground text-background absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 rounded-md px-2 py-1 text-xs font-normal whitespace-nowrap"
          >
            링크 복사됨
          </span>
        )}
      </span>
    </Tag>
  );
}
