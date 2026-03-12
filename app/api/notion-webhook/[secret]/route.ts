import { revalidatePath } from "next/cache";
import { getPage, getPageStatus, getPageCategory } from "@/lib/notion";
import { CATEGORIES, getSlugByCategoryValue } from "@/lib/categories";

type WebhookPayload = {
  type?: string;
  verification_token?: string;
  entity?: { id: string; type?: string };
};

function revalidateAllCategories(pageId?: string) {
  revalidatePath("/");
  for (const { slug } of CATEGORIES) {
    revalidatePath(`/category/${slug}`);
  }
  if (pageId) {
    revalidatePath(`/post/${pageId}`);
  }
}

function revalidateForCategory(pageId: string, categoryValue: string | null) {
  revalidatePath("/");
  revalidatePath(`/post/${pageId}`);
  if (categoryValue) {
    const slug = getSlugByCategoryValue(categoryValue);
    if (slug) revalidatePath(`/category/${slug}`);
  }
}

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
    eventType === "page.properties_updated" ||
    eventType === "page.created" ||
    eventType === "page.restored" ||
    eventType === "page.undeleted"
  ) {
    let status: string | null = null;
    let category: string | null = null;

    try {
      const page = await getPage(pageId);
      status = getPageStatus(page);
      category = getPageCategory(page);
    } catch {
      revalidateAllCategories(pageId);
      return Response.json({
        revalidated: true,
        event: eventType,
        pageId,
        action: "page_not_found_cleanup",
      });
    }

    revalidateForCategory(pageId, category);
    console.log("[webhook] revalidated:", pageId, "category:", category);

    return Response.json({
      revalidated: true,
      event: eventType,
      pageId,
      status,
      category,
    });
  }

  return Response.json({ ignored: true, event: eventType });
}
