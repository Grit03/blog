"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

export function PostTableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const headingIds = items.map((i) => i.id);
    const topOffset = 50;

    const updateActive = () => {
      let current: string | null = null;
      for (const id of headingIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top } = el.getBoundingClientRect();
        if (top <= topOffset) current = id;
      }
      setActiveId(current ?? headingIds[0]);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <ul className="space-y-1.5 text-[#737373] sticky text-xs">
      {
        items.map((item) => (
          <li key={item.id} className={cn(item.depth === 0 && "font-semibold")} style={{ paddingLeft: `${item.depth * 10}px` }}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block cursor-pointer transition-colors hover:text-primary",
                activeId === item.id && "text-primary"
              )}
            >
              {item.text}
            </a>
          </li>
        ))
      }
    </ul >
  );
}
