export const THEME_STORAGE_KEY = "theme";

/**
 * 첫 페인트 전에 실행되어야 하는 스크립트 — 하이드레이션을 기다리면
 * 다크 사용자에게 흰 화면이 한 프레임 번쩍인다. layout의 <head>에 인라인으로 넣는다.
 *
 * 저장된 선택이 있으면 그걸 쓰고, 없으면 OS 설정을 따른다.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;
