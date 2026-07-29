"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { scrollBehavior } from "@/lib/scroll";

export type MinimapItem = {
  id: string;
  text: string;
  /** 0 = heading_1, 1 = heading_2, 2 = heading_3 */
  depth: number;
};

/** 오른쪽 정렬이라 선이 짧아질수록 안쪽으로 들어가 계단처럼 보인다 */
const WIDTH_BY_DEPTH = ["w-7", "w-5", "w-3"];

/** 이 선을 지난 제목을 "읽고 있는 절"로 본다 (헤더 높이 + 여유) */
const READING_LINE = 100;

export function PostMinimap({ items }: { items: MinimapItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - viewport;
      const remaining = Math.max(0, maxScroll - window.scrollY);

      /*
       * 기준선을 상단 100px에 고정하면 문서 끝의 제목들은 거기까지 올라올 만큼
       * 스크롤이 남아있지 않아 영영 활성화되지 않는다.
       * 바닥에 가까워질수록 기준선을 내려(맨 아래에서는 뷰포트 하단까지)
       * 남은 제목들이 차례로 활성화되게 한다.
       */
      const line =
        remaining >= viewport
          ? READING_LINE
          : READING_LINE +
            ((viewport - remaining) * (viewport - READING_LINE)) / viewport;

      // 기준선을 지난 제목 중 마지막 것이 지금 읽고 있는 절이다
      let current: string | null = null;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActiveId(current ?? items[0].id);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  const jumpTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    // 못 찾으면 브라우저 기본 동작(해시 이동)에 맡긴다
    if (!el) return;
    e.preventDefault();
    // 제목의 scroll-mt-24가 반영되어 헤더에 가리지 않는다
    el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="본문 목차"
      className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col items-end gap-0.5 xl:flex"
    >
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => jumpTo(e, item.id)}
            className="group flex items-center justify-end gap-2 py-0.5"
          >
            <span
              className={cn(
                "bg-surface border-hairline pointer-events-none max-w-50 truncate rounded-md border px-2 py-1 text-xs opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                active ? "text-primary" : "text-subtle"
              )}
            >
              {item.text}
            </span>
            <span
              className={cn(
                "h-0.5 shrink-0 rounded-full transition-all duration-300 ease-out",
                WIDTH_BY_DEPTH[item.depth] ?? "w-3",
                active
                  ? // 얇은 선이라 색만으로는 약해서, primary 번짐을 얹어 밝아 보이게 한다
                    "bg-primary shadow-[0_0_6px_1px] shadow-primary/35"
                  : "bg-subtle/40 group-hover:bg-subtle"
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
