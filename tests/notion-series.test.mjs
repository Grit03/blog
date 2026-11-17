import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Node의 테스트 실행에서도 애플리케이션의 확장자 없는 TS import를 해석한다.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      context.parentURL?.endsWith("/lib/series.ts") &&
      specifier.startsWith("./")
    ) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

process.env.NOTION_DATABASE_ID = "posts-source";
process.env.NOTION_API_KEY = "test-placeholder";
const { notion, queryPages, getPublishedPage, getPage } =
  await import("../lib/notion.ts");
const { getSeries } = await import("../lib/series.ts");

function post(id, series = "series-a", order = 10, status = "Published") {
  return {
    object: "page",
    id,
    archived: false,
    in_trash: false,
    parent: { type: "data_source_id", data_source_id: "posts-source" },
    last_edited_time: "2026-11-17T00:00:00Z",
    properties: {
      status: { type: "status", status: { name: status } },
      series: { type: "relation", relation: [{ id: series }] },
      seriesOrder: { type: "number", number: order },
    },
  };
}
const response = (results) => ({ results, has_more: false, next_cursor: null });

test("Notion 조회는 다음 커서를 따라 모든 글을 반환한다", async (t) => {
  const calls = [];
  t.mock.method(notion.dataSources, "query", async (query) => {
    calls.push(query);
    return query.start_cursor
      ? response([post("second")])
      : {
          results: [post("first"), { object: "page", id: "partial" }],
          has_more: true,
          next_cursor: "cursor",
        };
  });
  assert.deepEqual(
    (await queryPages({ data_source_id: "posts-source" })).map(
      (page) => page.id
    ),
    ["first", "second"]
  );
  assert.equal(calls[1].start_cursor, "cursor");
  assert.equal(calls[1].data_source_id, "posts-source");
});

test("글 상세는 초안·삭제·다른 DB 페이지를 차단하고 웹훅 조회는 초안을 허용한다", async (t) => {
  let page = post("a");
  t.mock.method(notion.pages, "retrieve", async () => page);
  assert.equal((await getPublishedPage("a")).id, "a");
  page = post("draft", "series-a", 10, "Draft");
  await assert.rejects(getPublishedPage("draft"));
  assert.equal((await getPage("draft")).id, "draft");
  process.env.NODE_ENV = "development";
  t.after(() => delete process.env.NODE_ENV);
  assert.equal((await getPublishedPage("dev-draft")).id, "draft");
  delete process.env.NODE_ENV;
  page = { ...post("deleted"), in_trash: true };
  await assert.rejects(getPublishedPage("deleted"));
  page = {
    ...post("foreign"),
    parent: { type: "data_source_id", data_source_id: "another-db" },
  };
  await assert.rejects(getPublishedPage("foreign"));
});

test("시리즈 DB를 설정하지 않으면 API 호출 없이 빈 목록을 반환한다", async (t) => {
  delete process.env.NOTION_SERIES_DATA_SOURCE_ID;
  t.mock.method(notion.dataSources, "query", async () => {
    throw new Error("Unexpected API call");
  });
  assert.deepEqual(await getSeries(), []);
});

test("시리즈 목록은 공개 글만 포함하고 빈 시리즈·잘못된 slug·중복 slug를 제외한다", async (t) => {
  process.env.NOTION_SERIES_DATA_SOURCE_ID = "series-source";
  t.after(() => {
    delete process.env.NOTION_SERIES_DATA_SOURCE_ID;
  });
  function series(id, slug) {
    return {
      ...post(id),
      properties: {
        name: { type: "title", title: [{ plain_text: id }] },
        slug: { type: "rich_text", rich_text: [{ plain_text: slug }] },
      },
    };
  }
  t.mock.method(notion.dataSources, "query", async ({ data_source_id }) =>
    response(
      data_source_id === "series-source"
        ? [
            series("series-a", "react"),
            series("empty", "empty"),
            series("bad", "bad/slug"),
            series("dup-a", "duplicate"),
            series("dup-b", "duplicate"),
          ]
        : [
            post("second", "series-a", 30),
            post("first", "series-a", 10),
            post("draft", "series-a", 20, "Draft"),
            post("bad-post", "bad"),
            post("dup-post-a", "dup-a"),
            post("dup-post-b", "dup-b"),
          ]
    )
  );
  const entries = await getSeries();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].slug, "react");
  assert.deepEqual(
    entries[0].posts.map((page) => page.id),
    ["first", "second"]
  );
});
