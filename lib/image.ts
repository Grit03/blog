/** next.config.ts 의 remotePatterns 와 맞춰둔 목록 — 여기 없는 호스트를 최적화하면 400이 난다 */
const OPTIMIZED_HOSTS = new Set([
  "img.notionusercontent.com",
  "www.notion.so",
  "prod-files-secure.s3.us-west-2.amazonaws.com",
]);

export function canOptimize(src: unknown) {
  if (typeof src !== "string") return true;
  if (!/^https?:\/\//i.test(src)) return true;
  try {
    const { hostname } = new URL(src);
    // 노션 Cloudflare가 로컬 최적화기의 요청(User-Agent 없음)을 403으로 막는다.
    // 개발 환경에서는 브라우저가 직접 받게 하고, 배포 환경은 Vercel 최적화를 그대로 쓴다.
    if (process.env.NODE_ENV === "development" && hostname === "www.notion.so")
      return false;
    return OPTIMIZED_HOSTS.has(hostname);
  } catch {
    return false;
  }
}
