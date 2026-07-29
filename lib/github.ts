/** GitHub PR/이슈 URL을 파싱해 REST API로 프리뷰 정보를 가져온다 */

export type GithubPreview = {
  kind: "pull" | "issue";
  state: "open" | "draft" | "merged" | "closed" | "completed" | "not_planned";
  title: string;
  number: number;
  repo: string;
  author: { login: string; avatarUrl: string } | null;
};

const GITHUB_ISSUE_URL_RE =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(pull|issues)\/(\d+)/;

export function parseGithubIssueUrl(url: string) {
  const m = url.match(GITHUB_ISSUE_URL_RE);
  if (!m) return null;
  const [, owner, repo, path, number] = m;
  return {
    owner,
    repo,
    kind: path === "pull" ? ("pull" as const) : ("issue" as const),
    number: Number(number),
  };
}

export async function fetchGithubPreview(
  url: string,
  opts?: { revalidate?: number }
): Promise<GithubPreview | null> {
  const parsed = parseGithubIssueUrl(url);
  if (!parsed) return null;

  const { owner, repo, kind, number } = parsed;
  const endpoint =
    kind === "pull"
      ? `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`
      : `https://api.github.com/repos/${owner}/${repo}/issues/${number}`;

  try {
    const res = await fetch(endpoint, {
      // revalidate 미지정 시(빌드 타임) 무기한 캐시 — 라우트가 ISR로 바뀌지 않도록 next.revalidate를 넣지 않는다
      ...(opts?.revalidate != null
        ? { next: { revalidate: opts.revalidate } }
        : { cache: "force-cache" as const }),
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
    });
    if (!res.ok) return null;
    const data = await res.json();

    // /issues/N URL이지만 실제로는 PR인 경우 (issues API는 PR도 반환)
    const resolvedKind: GithubPreview["kind"] =
      kind === "issue" && data.pull_request ? "pull" : kind;

    const state: GithubPreview["state"] =
      resolvedKind === "pull"
        ? (data.merged_at ?? data.pull_request?.merged_at)
          ? "merged"
          : data.draft
            ? "draft"
            : data.state === "closed"
              ? "closed"
              : "open"
        : data.state === "closed"
          ? data.state_reason === "not_planned"
            ? "not_planned"
            : "completed"
          : "open";

    return {
      kind: resolvedKind,
      state,
      title: data.title ?? "",
      number: data.number ?? number,
      repo: `${owner}/${repo}`,
      author: data.user
        ? { login: data.user.login, avatarUrl: data.user.avatar_url }
        : null,
    };
  } catch {
    return null;
  }
}
