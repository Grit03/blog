"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/** globals.css의 전환 지속시간과 맞춰야 한다 */
const TRANSITION_MS = 250;

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

/**
 * View Transition이 없는 브라우저용 폴백.
 * 전환하는 250ms 동안만 트랜지션을 켠다 — globals.css의 .theme-transition 참고.
 */
function applyThemeWithCssTransition(dark: boolean) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  applyTheme(dark);
  window.setTimeout(
    () => root.classList.remove("theme-transition"),
    TRANSITION_MS
  );
}

/**
 * View Transition은 전/후 화면을 스냅샷 두 장으로 떠서 GPU에서 크로스페이드한다.
 * 색이 바뀌는 노드를 하나하나 애니메이션하지 않으니 비용이 DOM 크기와 무관하고,
 * 코드 블록이 많은 긴 글에서도 프레임이 밀리지 않는다.
 * 미지원 브라우저(Safari 17 이하 등)는 CSS 폴백으로 내려간다.
 */
function applyThemeAnimated(dark: boolean) {
  // 움직임을 줄여달라고 한 사용자에겐 애니메이션 없이 바로 바꾼다
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyTheme(dark);
    return;
  }

  // 타입 정의상으론 항상 있지만 실제로는 없는 브라우저가 있다
  if (typeof document.startViewTransition !== "function") {
    applyThemeWithCssTransition(dark);
    return;
  }

  const root = document.documentElement;
  root.classList.add("theme-view-transition");
  const transition = document.startViewTransition(() => applyTheme(dark));
  // 성공/실패 어느 쪽이든 클래스는 떼야 한다. finally를 쓰면 거부가 그대로
  // 흘러나가 unhandled rejection이 된다.
  const cleanup = () => root.classList.remove("theme-view-transition");
  transition.finished.then(cleanup, cleanup);
}

export function ThemeToggle() {
  // 사용자가 직접 고르기 전까지는 OS 설정 변화를 그대로 따라간다
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      applyThemeAnimated(e.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    applyThemeAnimated(next);
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
