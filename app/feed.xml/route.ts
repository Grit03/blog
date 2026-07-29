import { getPosts, getPageTitle, getPageExcerpt } from "@/lib/notion";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://grit03.vercel.app";

export const dynamic = "force-static";

export async function GET() {
  const posts = await getPosts();

  const itemsXml = posts
    .map((post) => {
      const title = getPageTitle(post);
      const description = getPageExcerpt(post, 200);
      const pubDate = new Date(post.created_time).toUTCString();
      const link = `${siteUrl}/post/${post.id}`;

      return `    <item>
      <title><![CDATA[${title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Gyuri's Devlog</title>
    <link>${siteUrl}</link>
    <description>프로젝트, 딥다이브, 학습정리, 회고를 담는 개발 블로그</description>
    <language>ko</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
