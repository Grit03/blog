import { cn } from "@/lib/utils";

type PostDateProps = {
  date: string;
  className?: string;
};

export function PostDate({ date, className }: PostDateProps) {
  if (!date) return null;
  return (
    <time className={cn("text-sm text-[#737373]", className)} dateTime={date}>
      {date}
    </time>
  );
}
