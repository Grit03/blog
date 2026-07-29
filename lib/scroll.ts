/**
 * scrollTo/scrollIntoView의 behavior:"smooth"는 CSS scroll-behavior와 달리
 * prefers-reduced-motion을 브라우저가 알아서 무시해주지 않는다 — 직접 확인한다.
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}
