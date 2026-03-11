import { cn } from "@/lib/utils";

type PostTitleProps = {
  children: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
};

export function PostTitle({
  children,
  as: Component = "h2",
  className,
}: PostTitleProps) {
  return (
    <Component
      className={cn(
        "text-lg font-bold leading-tight line-clamp-2",
        className
      )}
    >
      {children}
    </Component>
  );
}
