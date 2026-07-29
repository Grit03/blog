"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="맨 위로"
      // prefers-reduced-motion이 켜져 있으면 브라우저가 smooth를 알아서 무시한다
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "bg-surface text-subtle border-hairline hover:text-primary fixed right-5 bottom-5 z-40 flex size-11 items-center justify-center rounded-full border shadow-md transition-all sm:right-8 sm:bottom-8",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
