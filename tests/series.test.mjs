import test from "node:test";
import assert from "node:assert/strict";
import {
  getOrderedSeriesPosts,
  getPostSeriesId,
  getSeriesNeighbors,
} from "../lib/series-model.ts";

function post(
  id,
  order,
  { series = "react", status = "Published", archived = false } = {}
) {
  return {
    id,
    archived,
    in_trash: false,
    properties: {
      series: { type: "relation", relation: series ? [{ id: series }] : [] },
      seriesOrder: { type: "number", number: order },
      status: { type: "status", status: { name: status } },
    },
  };
}

test("공개 글만 정렬하고 다른 시리즈·초안·삭제 글은 제외한다", () => {
  const posts = [
    post("b", 20),
    post("draft", 15, { status: "Draft" }),
    post("a", 10),
    post("other", 5, { series: "network" }),
    post("deleted", 3, { archived: true }),
    post("standalone", 1, { series: null }),
  ];
  const original = [...posts];
  assert.deepEqual(
    getOrderedSeriesPosts(posts, "react").map(({ id }) => id),
    ["a", "b"]
  );
  assert.deepEqual(posts, original);
});

test("순서가 비어 있으면 맨 뒤로, 순서가 같으면 ID로 정렬한다", () => {
  const posts = [
    post("z", null),
    post("b", 10),
    post("c", null),
    post("a", 10),
  ];
  assert.deepEqual(
    getOrderedSeriesPosts(posts, "react").map(({ id }) => id),
    ["a", "b", "c", "z"]
  );
});

test("순서 번호의 간격과 관계없이 공개 글의 앞뒤를 연결한다", () => {
  const posts = getOrderedSeriesPosts(
    [post("a", 10), post("draft", 15, { status: "Draft" }), post("b", 30)],
    "react"
  );
  assert.equal(getSeriesNeighbors(posts, "a").previous, null);
  assert.equal(getSeriesNeighbors(posts, "a").next.id, "b");
  assert.equal(getSeriesNeighbors(posts, "b").previous.id, "a");
  assert.equal(getSeriesNeighbors(posts, "b").next, null);
  assert.deepEqual(getSeriesNeighbors(posts, "missing"), {
    index: -1,
    previous: null,
    next: null,
  });
});

test("시리즈 속성이 없는 기존 글과 글 한 편짜리 시리즈를 처리한다", () => {
  assert.equal(getPostSeriesId({ properties: {} }), null);
  const single = post("a", 10);
  assert.deepEqual(getSeriesNeighbors([single], "a"), {
    index: 0,
    previous: null,
    next: null,
  });
});

test("시리즈 이동·공개 해제 후 이전 목록에서 제거한다", () => {
  const moved = post("a", 10, { series: "network" });
  assert.deepEqual(getOrderedSeriesPosts([moved], "react"), []);
  assert.equal(getOrderedSeriesPosts([moved], "network").length, 1);
  assert.deepEqual(
    getOrderedSeriesPosts([post("a", 10, { status: "Draft" })], "react"),
    []
  );
});
