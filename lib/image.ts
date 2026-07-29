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
    return OPTIMIZED_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}
