import Image from "next/image";
import { canOptimize } from "@/lib/image";

type FeaturedImageProps = {
  src?: string;
  alt: string;
  /** LCP용: 목록 상단 1~2개 카드에 true 권장 */
  priority?: boolean;
};

export function FeaturedImage({
  src,
  alt = "No image found",
  priority = false,
}: FeaturedImageProps) {
  const resolvedSrc = src ?? "/image/placeholder.png";

  return (
    // fill을 쓰려면 부모가 relative + 크기를 갖고 있어야 한다
    <div className="relative aspect-[280/180] w-full flex-shrink-0 self-start overflow-hidden rounded-xl md:aspect-auto md:h-[180px] md:w-[280px]">
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, 280px"
        unoptimized={!canOptimize(resolvedSrc)}
        className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
      />
    </div>
  );
}
