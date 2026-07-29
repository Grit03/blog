"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY } from "@/lib/theme";

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

/** 전환하는 250ms 동안만 트랜지션을 켠다 — globals.css의 .theme-transition 참고 */
function applyThemeWithTransition(dark: boolean) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(dark);
  window.setTimeout(() => root.classList.remove("theme-transition"), 250);
}

export function ThemeToggle() {
  // 사용자가 직접 고르기 전까지는 OS 설정 변화를 그대로 따라간다
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      applyThemeWithTransition(e.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    applyThemeWithTransition(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // 시크릿 모드 등에서 저장이 막혀도 전환 자체는 동작해야 한다
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="라이트/다크 테마 전환"
      title="라이트/다크 테마 전환"
      className="hover:bg-background-highlight"
    >
      {/*
        현재 테마를 state로 들고 있으면 서버 렌더링 결과와 어긋난다.
        아이콘 두 개를 모두 심고 .dark 유무로 CSS가 고르게 하면
        하이드레이션 불일치도, 첫 프레임 깜빡임도 없다.
      */}
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
}
