"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type MinimapItem = {
  id: string;
  text: string;
  /** 0 = heading_1, 1 = heading_2, 2 = heading_3 */
  depth: number;
};

/** 오른쪽 정렬이라 선이 짧아질수록 안쪽으로 들어가 계단처럼 보인다 */
const WIDTH_BY_DEPTH = ["w-11", "w-8", "w-5"];

export function PostMinimap({ items }: { items: MinimapItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // 화면 상단을 지난 제목 중 마지막 것이 지금 읽고 있는 절이다
      let current: string | null = null;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 100) current = id;
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

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="본문 목차"
      className="fixed top-1/2 right-6 z-30 hidden -translate-y-1/2 flex-col items-end gap-1 xl:flex"
    >
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
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
                WIDTH_BY_DEPTH[item.depth] ?? "w-5",
                active
                  ? // 얇은 선이라 색만으로는 약해서, primary 번짐을 얹어 밝아 보이게 한다
                    "bg-primary shadow-[0_0_10px_2px] shadow-primary/55"
                  : "bg-subtle/40 group-hover:bg-subtle"
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
