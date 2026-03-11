import { revalidatePath } from "next/cache";
import { getPage, getPageStatus } from "@/lib/notion";

type WebhookPayload = {
  type: string;
  entity?: { id: string; type?: string };
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ secret: string }> },
) {
  const { secret } = await params;

  if (secret !== process.env.WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: WebhookPayload;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = body.type;
  const pageId = body.entity?.id;

  if (!pageId) {
    return Response.json({ error: "Missing entity id" }, { status: 400 });
  }

  // 페이지 삭제 이벤트 — 홈 + 해당 포스트 경로 revalidate
  if (eventType === "page.deleted" || eventType === "page.trashed") {
    revalidatePath("/");
    revalidatePath(`/post/${pageId}`);

    return Response.json({
      revalidated: true,
      event: eventType,
      pageId,
      action: "deleted",
    });
  }

  // 페이지 업데이트/생성/복원 — Notion API로 상태 조회 후 판단
  // page.updated는 속성(status, title 등) 변경도 포함
  if (
    eventType === "page.updated" ||
    eventType === "page.created" ||
    eventType === "page.restored" ||
    eventType === "page.undeleted"
  ) {
    let status: string | null = null;

    try {
      const page = await getPage(pageId);
      status = getPageStatus(page);
    } catch {
      // 페이지가 이미 삭제되었거나 접근 불가 → 삭제 케이스로 처리
      revalidatePath("/");
      revalidatePath(`/post/${pageId}`);

      return Response.json({
        revalidated: true,
        event: eventType,
        pageId,
        action: "page_not_found_cleanup",
      });
    }

    revalidatePath("/");
    revalidatePath(`/post/${pageId}`);

    return Response.json({
      revalidated: true,
      event: eventType,
      pageId,
      status,
    });
  }

  return Response.json({ ignored: true, event: eventType });
}
