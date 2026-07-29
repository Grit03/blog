"use client";

import { useEffect, useState } from "react";
import {
  CircleCheck,
  CircleDot,
  CircleSlash,
  ExternalLink,
  GitMerge,
  GitPullRequestArrow,
  GitPullRequestClosed,
  GitPullRequestDraft,
  type LucideIcon,
} from "lucide-react";
import type { GithubPreview } from "@/lib/github";
import { cn } from "@/lib/utils";

// 깃허브 상태 색은 브랜드 색이라 토큰으로 뽑지 않고, 깃허브가 쓰는 다크 대응값을 그대로 짝지었다
const STATE_COLOR = {
  green: "text-[#1a7f37] border-[#1a7f37] dark:text-[#3fb950] dark:border-[#3fb950]",
  gray: "text-[#59636e] border-[#59636e] dark:text-[#9198a1] dark:border-[#9198a1]",
  purple: "text-[#8250df] border-[#8250df] dark:text-[#a371f7] dark:border-[#a371f7]",
  red: "text-[#cf222e] border-[#cf222e] dark:text-[#f85149] dark:border-[#f85149]",
  blue: "text-[#0969da] border-[#0969da] dark:text-[#4493f8] dark:border-[#4493f8]",
} as const;

const STATE_META: Partial<
  Record<
    `${GithubPreview["kind"]}:${GithubPreview["state"]}`,
    { Icon: LucideIcon; label: string; className: string }
  >
> = {
  "pull:open": {
    Icon: GitPullRequestArrow,
    label: "Open",
    className: STATE_COLOR.green,
  },
  "pull:draft": {
    Icon: GitPullRequestDraft,
    label: "Draft",
    className: STATE_COLOR.gray,
  },
  "pull:merged": {
    Icon: GitMerge,
    label: "Merged",
    className: STATE_COLOR.purple,
  },
  "pull:closed": {
    Icon: GitPullRequestClosed,
    label: "Closed",
    className: STATE_COLOR.red,
  },
  "issue:open": {
    Icon: CircleDot,
    label: "Open",
    className: STATE_COLOR.green,
  },
  // 머지(보라)와 구분되도록 이슈 종료는 파랑 — 깃허브는 둘 다 보라라 색만으로는 구분이 안 된다
  "issue:completed": {
    Icon: CircleCheck,
    label: "Closed",
    className: STATE_COLOR.blue,
  },
  "issue:not_planned": {
    Icon: CircleSlash,
    label: "Not planned",
    className: STATE_COLOR.gray,
  },
};

export function GithubPreviewCard({
  url,
  initialPreview,
  fallbackText,
}: {
  url: string;
  initialPreview: GithubPreview | null;
  fallbackText: string;
}) {
  const [preview, setPreview] = useState(initialPreview);

  // 페이지는 정적으로 캐싱되므로, PR/이슈 상태는 조회 시점 기준으로 다시 동기화한다
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/github-preview?url=${encodeURIComponent(url)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: GithubPreview | null) => {
        if (!cancelled && data) setPreview(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!preview) {
    return (
      <a
        href={url}
        className="hover:text-primary text-subtle underline transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {fallbackText}
        <ExternalLink className="mb-1 ml-0.5 inline size-4" />
      </a>
    );
  }

  const meta = STATE_META[`${preview.kind}:${preview.state}`];
  const StateIcon = meta?.Icon ?? GitPullRequestArrow;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:bg-background-highlight flex cursor-pointer items-center gap-2.5 rounded-sm border-[1.4px] border-hairline px-4.5 py-3.5 text-sm"
    >
      {preview.author && (
        <div className="relative size-8.5 shrink-0 overflow-hidden rounded-full">
          <img
            src={preview.author.avatarUrl}
            alt={`${preview.author.login} 깃헙 프로필`}
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col">
        <div className="truncate font-semibold wrap-break-word">
          {preview.title}
          <span className="ml-1 font-normal text-subtle">
            #{preview.number}
          </span>
          <ExternalLink className="mb-1 ml-0.5 inline size-4 text-subtle" />
        </div>
        <div className="flex items-center gap-1.5">
          <StateIcon className={cn("size-3.5 shrink-0", meta?.className)} />
          <div className="truncate text-xs text-subtle">
            {preview.repo}
            {preview.author && ` · ${preview.author.login}`}
            {` · ${preview.kind === "pull" ? "Pull request" : "Issue"}`}
          </div>
          {meta && (
            <span
              className={cn(
                "shrink-0 rounded-full border px-1.5 py-px text-[11px] leading-4 font-medium",
                meta.className
              )}
            >
              {meta.label}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
