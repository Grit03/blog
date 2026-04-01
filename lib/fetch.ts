export const fetchOgMeta = async (url: string) => {
  try {
    const res = await fetch(url, {
      cache: "force-cache",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    const get = (property: string) => {
      const m =
        html.match(
          new RegExp(
            `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`,
            "i"
          )
        ) ??
        html.match(
          new RegExp(
            `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
            "i"
          )
        );
      return m?.[1] ?? null;
    };

    const title =
      get("og:title") ??
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ??
      null;
    const description = get("og:description") ?? get("description");
    const image = get("og:image");

    const origin = new URL(url).origin;
    const favicon = `${origin}/favicon.ico`;

    const ogImage =
      image === null
        ? null
        : image.startsWith("http")
          ? image
          : new URL(image, origin).href;

    return { title, description, image: ogImage, favicon };
  } catch {
    return null;
  }
};
