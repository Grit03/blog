"use client";

import NextImage from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CircleSlash } from "lucide-react";

/** 모듈 스코프 — SPA 네비게이션에서 언마운트/리마운트되어도 유지 */
const loadedSrcs = new Set<string>();

type ImageProps = React.ComponentProps<typeof NextImage> & {
  /** wrapper에 줄 className (fill일 때는 relative + 크기 필수) */
  className?: string;
  /** Next Image에 줄 className */
  imageClassName?: string;
  /** 이미지 크기 */
  size?: "sm" | "md" | "lg";
};

export function Image({
  src,
  alt,
  className,
  size,
  imageClassName,
  onLoad,
  ...rest
}: ImageProps) {
  const srcKey = typeof src === "string" ? src : "";
  const [showBlur, setShowBlur] = useState(() => !loadedSrcs.has(srcKey));
  const [error, setError] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (srcKey) loadedSrcs.add(srcKey);
    setShowBlur(false);
    onLoad?.(e);
  };

  const handleError = () => {
    setError(true);
  };

  if (error && size === "sm") {
    return <CircleSlash className="size-4.5 text-neutral-500" />;
  }

  if (error) {
    return (
      <div
        className={cn(
          "bg-background-highlight flex h-50 flex-col items-center justify-center gap-5 rounded-xl text-neutral-500",
          className
        )}
      >
        <CircleSlash className="size-5" />
        <span className="text-xs font-medium">
          이미지를 불러올 수 없습니다.
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <NextImage
        src={src}
        alt={alt}
        className={imageClassName}
        onLoad={handleLoad}
        onError={handleError}
        {...rest}
      />
      {showBlur && (
        <div
          className="pointer-events-none absolute inset-0 mx-auto max-w-[800px] rounded-xl bg-neutral-100/10 backdrop-blur-md transition-opacity duration-500"
          aria-hidden
        />
      )}
    </div>
  );
}
