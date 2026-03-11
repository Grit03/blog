import { Image } from "@/components/Image";

type FeaturedImageProps = {
  src?: string;
  alt: string;
  /** 대표 이미지가 없을 때 사용할 플레이스홀더 배경 색 */
  placeholderClassName?: string;
};

export function FeaturedImage({
  src,
  alt = "No image found",
}: FeaturedImageProps) {
  return (
    <Image
      src={src ?? "/image/placeholder.png"}
      alt={alt}
      fill
      className="relative flex-shrink-0 w-full aspect-[280/180] md:w-[280px] md:h-[180px] md:aspect-auto overflow-hidden rounded-xl self-start"
      imageClassName="object-cover object-center w-full h-full group-hover:scale-110 transition-transform duration-300"
    />
  );
}
