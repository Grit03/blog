"use client";

import { useEffect, useRef } from "react";

const GISCUS_ORIGIN = "https://giscus.app";

/**
 * https://giscus.app 에서 뽑은 설정 — 전부 공개 식별자라 노출돼도 문제없다.
 * 저장소나 카테고리를 바꾸면 거기서 다시 뽑아 그대로 갈아끼우면 된다.
 *
 * mapping=pathname: /post/<노션 페이지 id>가 discussion 제목이 된다.
 * 노션 페이지 id는 글을 수정해도 안 바뀌니 댓글이 떨어져 나갈 일이 없다.
 */
const GISCUS_ATTRS: Record<string, string> = {
  "data-repo": "Grit03/blog",
  "data-repo-id": "R_kgDORkd_0Q",
  "data-category": "Announcements",
  "data-category-id": "DIC_kwDORkd_0c4DCSql",
  "data-mapping": "pathname",
  "data-strict": "0",
  "data-reactions-enabled": "1",
  "data-emit-metadata": "0",
  "data-input-position": "bottom",
  "data-lang": "ko",
};

function currentGiscusTheme() {
  // 다크에선 transparent_dark로 사이트 배경(#16171a)에 그대로 녹인다.
  // giscus 기본 dark(#0d1117)를 쓰면 댓글 영역만 더 까맣게 뜬다.
  return document.documentElement.classList.contains("dark")
    ? "transparent_dark"
    : "light";
}

export function Comments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = `${GISCUS_ORIGIN}/client.js`;
    script.async = true;
    script.crossOrigin = "anonymous";
    for (const [name, value] of Object.entries(GISCUS_ATTRS)) {
      script.setAttribute(name, value);
    }
    script.setAttribute("data-theme", currentGiscusTheme());
    container.appendChild(script);

    // client.js는 iframe을 심고 끝이라 다른 글로 넘어가도 스스로 정리하지 않는다.
    // 컨테이너를 비워야 새 글에서 위젯이 다시 심긴다.
    return () => container.replaceChildren();
  }, []);

  // 테마 토글은 <html>의 dark 클래스만 건드리므로, iframe에는 따로 알려줘야 한다
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const iframe = document.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: currentGiscusTheme() } } },
        GISCUS_ORIGIN
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-label="댓글" className="border-hairline mt-16 border-t pt-10">
      <div ref={containerRef} />
    </section>
  );
}
