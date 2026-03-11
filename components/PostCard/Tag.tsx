import { cn } from "@/lib/utils";

type TagProps = {
  name: string;
  className?: string;
};

export function Tag({ name, className }: TagProps) {
  return (
    <span
      key={name}
      className={cn("text-xs font-medium px-2 py-1 rounded-sm bg-neutral-200 text-neutral-600", className)}
    >
      {name}
    </span>
  );
}
