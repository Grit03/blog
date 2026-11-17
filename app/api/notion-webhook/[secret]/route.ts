import { revalidatePath } from "next/cache";
import { getPage, getPageStatus } from "@/lib/notion";
import { CATEGORIES } from "@/lib/categories";

type WebhookPayload = {
  type?: string;
  verification_token?: string;
  entity?: { id: string; type?: string };
};

function revalidateFeeds() {
  // 시리즈 이동·삭제 전의 관계를 알 수 없으므로 관련 경로를 모두 무효화한다.
  revalidatePath("/series");
  revalidatePath("/series/[slug]", "page");
  revalidatePath("/post/[id]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
}

function revalidateAllCategories(pageId?: string) {
  revalidatePath("/");
  for (const { slug } of CATEGORIES) {
    revalidatePath(`/category/${slug}`);
  }
  if (pageId) {
    revalidatePath(`/post/${pageId}`);
  }
  revalidateFeeds();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ secret: string }> }
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

  if (body.verification_token) {
    return Response.json({ ok: true });
  }

  const eventType = body.type;
  const pageId = body.entity?.id;
  console.log("[webhook] received:", eventType, pageId);

  if (!pageId) {
    return Response.json({ error: "Missing entity id" }, { status: 400 });
  }

  if (eventType === "page.deleted" || eventType === "page.trashed") {
    revalidateAllCategories(pageId);
    return Response.json({
      revalidated: true,
      event: eventType,
      pageId,
      action: "deleted",
    });
  }

  if (
    eventType === "page.content_updated" ||
    eventType === "page.properties_updated" ||
    eventType === "page.created" ||
    eventType === "page.restored" ||
    eventType === "page.undeleted"
  ) {
    let status: string | null = null;

    try {
      const page = await getPage(pageId);
      status = getPageStatus(page);
    } catch {
      revalidateAllCategories(pageId);
      return Response.json({
        revalidated: true,
        event: eventType,
        pageId,
        action: "page_not_found_cleanup",
      });
    }

    revalidateAllCategories(pageId);

    return Response.json({
      revalidated: true,
      event: eventType,
      pageId,
      status,
    });
  }

  return Response.json({ ignored: true, event: eventType });
}
