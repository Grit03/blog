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

/**
 * giscus iframe은 body에 배경을 칠하지 않아 페이지 배경이 그대로 비친다.
 * 그래서 테마가 실제로 정하는 건 댓글 카드와 입력창의 색이다.
 */
function currentGiscusTheme() {
  // 다크: 카드를 투명하게 두면 사이트 배경(#16171a)에 그대로 녹는다.
  // 기본 dark는 카드가 #0d1117이라 페이지보다 까맣게 떠 보인다.
  if (document.documentElement.classList.contains("dark")) {
    return "transparent_dark";
  }
  // 라이트: 기본 테마는 카드가 흰색인데 배경(#f5f5f5)과 명도 차가 4%뿐이라
  // 경계가 흐릿하다. 팔레트를 맞추고 테두리를 세운 커스텀 CSS로 대체한다.
  // giscus는 테마 값으로 URL도 받는다 — 프리뷰 배포·로컬에서도 각자의 주소로
  // 잡히도록 하드코딩 대신 location.origin을 쓴다.
  return `${window.location.origin}/giscus/light.css`;
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
      {/*
        본문에서 드래그를 이어가면 iframe이 통째로 선택 범위에 잡혀 파랗게 반전된다.
        부모 문서의 선택에서만 빼는 것이라, iframe 안에서 댓글 텍스트를 긁는 건
        그대로 된다 — 선택 영역은 문서마다 따로 관리되기 때문이다.
      */}
      <div ref={containerRef} className="select-none" />
    </section>
  );
}
