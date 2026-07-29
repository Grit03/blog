"use client";

import Link from "next/link";
import { useRef, useCallback, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import { CategoriesProps } from "@/components/Categories/Categories";

export function MiniCategories({ currentSlug }: CategoriesProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = useCallback((e: MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      isDragging: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
    };
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const { isDragging, startX, scrollLeft } = dragState.current;
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollRef.current!;
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX);
  }, []);

  const onMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
  }, []);

  return (
    <aside
      ref={scrollRef}
      className="no-scrollbar mt-3 mb-1 block cursor-grab overflow-x-scroll active:cursor-grabbing lg:hidden"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <nav className="flex gap-1.5 py-2" aria-label="카테고리">
        <Link
          href="/"
          draggable={false}
          className={cn(
            "block w-1/5 min-w-11.5 shrink-0 rounded-md px-3 py-2 text-center text-xs font-medium transition select-none sm:text-sm",
            currentSlug === null
              ? "bg-primary text-primary-foreground"
              : "bg-chip text-chip-foreground hover:bg-chip-hover"
          )}
        >
          전체
        </Link>
        {CATEGORIES.map(({ slug, label }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            draggable={false}
            className={cn(
              "block w-1/5 min-w-11.5 shrink-0 rounded-md px-3 py-2 text-center text-xs font-medium transition select-none sm:text-sm",
              currentSlug === slug
                ? "bg-primary text-primary-foreground"
                : "bg-chip text-chip-foreground hover:bg-chip-hover"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
