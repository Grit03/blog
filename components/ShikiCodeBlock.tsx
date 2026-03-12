import { codeToHtml } from "shiki";
import { cacheLife } from "next/cache";

type ShikiCodeBlockProps = {
  code: string;
  language: string;
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

export async function ShikiCodeBlock({ code, language }: ShikiCodeBlockProps) {
  "use cache";
  cacheLife("max");
  const lang = toShikiLang(language);
  const html = await codeToHtml(code, {
    lang,
    theme: "one-light",
  });

  return (
    <div
      className="mb-4 overflow-x-auto rounded-lg text-sm leading-relaxed [&_pre]:!m-0 [&_pre]:!p-4 [&_pre]:!bg-background-highlight"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
