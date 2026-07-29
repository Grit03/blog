export const CATEGORIES = [
  { slug: "project", label: "프로젝트", value: "프로젝트" },
  { slug: "deepdive", label: "딥다이브", value: "딥다이브" },
  { slug: "study", label: "학습정리", value: "학습정리" },
  { slug: "retro", label: "회고", value: "회고" },
  { slug: "opensource", label: "오픈소스", value: "오픈소스"}
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export function getSlugByCategoryValue(value: string): string | null {
  return CATEGORIES.find((c) => c.value === value)?.slug ?? null;
}
