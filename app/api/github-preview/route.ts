import { type NextRequest, NextResponse } from "next/server";
import { fetchGithubPreview, parseGithubIssueUrl } from "@/lib/github";

/** GitHub PR/이슈 상태를 조회 시점 기준으로 반환 — 정적 페이지의 카드가 클라이언트에서 동기화할 때 사용 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !parseGithubIssueUrl(url)) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const preview = await fetchGithubPreview(url, { revalidate: 300 });
  if (!preview) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(preview, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
