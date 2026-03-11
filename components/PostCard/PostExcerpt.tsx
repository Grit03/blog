import { cn } from "@/lib/utils";

type PostExcerptProps = {
  children: React.ReactNode;
  className?: string;
  maxLines?: number;
};

export function PostExcerpt({
  children,
  className,
  maxLines = 3,
}: PostExcerptProps) {
  if (!children) return null;
  const lineClampClass =
    maxLines === 2 ? "line-clamp-2" : maxLines === 3 ? "line-clamp-3" : "line-clamp-4";
  return (
    <p
      className={cn(
        "text-sm text-[#525252] leading-relaxed",
        lineClampClass,
        className
      )}
    >
      {children}
    </p>
  );
}
