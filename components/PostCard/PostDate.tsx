import { cn } from "@/lib/utils";

type PostDateProps = {
  date: string;
  className?: string;
};

export function PostDate({ date, className }: PostDateProps) {
  if (!date) return null;
  return (
    <time className={cn("text-sm text-subtle md:text-[0.8125rem]", className)} dateTime={date}>
      {date}
    </time>
  );
}
