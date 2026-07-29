import { codeToHtml } from "shiki";
import { CodeBlockWithAnnotations } from "./CodeBlockWithAnnotations";

export type BoldSegment = { start: number; end: number; bold?: boolean };

type ShikiCodeBlockProps = {
  code: string;
  language: string;
  boldSegments?: BoldSegment[];
};

const NOTION_LANG_TO_SHIKI: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  tsx: "tsx",
  jsx: "jsx",
  python: "python",
  py: "python",
  html: "html",
  css: "css",
  json: "json",
  bash: "bash",
  shell: "shell",
  sh: "shell",
  sql: "sql",
  java: "java",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  swift: "swift",
  kotlin: "kotlin",
  c: "c",
  "c++": "cpp",
  cpp: "cpp",
  csharp: "csharp",
  cs: "csharp",
  yaml: "yaml",
  yml: "yaml",
  markdown: "markdown",
  md: "markdown",
  plain: "plaintext",
  "plain text": "plaintext",
  plaintext: "plaintext",
  text: "plaintext",
};

function toShikiLang(notionLang: string): string {
  const normalized = notionLang.toLowerCase().trim();
  return NOTION_LANG_TO_SHIKI[normalized] ?? (normalized || "plaintext");
}

const codeBlockClassName =
  "my-5 overflow-x-auto rounded-lg text-sm leading-relaxed [&_pre]:!m-0 [&_pre]:!p-4 [&_pre]:!bg-background-highlight bg-background-highlight [&_pre]:w-fit";

export async function ShikiCodeBlock({
  code,
  language,
  boldSegments = [],
}: ShikiCodeBlockProps) {
  const lang = toShikiLang(language);
  const html = await codeToHtml(code, {
    lang,
    theme: "one-light",
  });

  if (boldSegments.length > 0) {
    return (
      <CodeBlockWithAnnotations
        html={html}
        boldSegments={boldSegments}
        className={codeBlockClassName}
      />
    );
  }

  return (
    <div
      className={codeBlockClassName}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
