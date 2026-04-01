"use client";

import NextImage from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** 모듈 스코프 — SPA 네비게이션에서 언마운트/리마운트되어도 유지 */
const loadedSrcs = new Set<string>();

type ImageProps = React.ComponentProps<typeof NextImage> & {
  /** wrapper에 줄 className (fill일 때는 relative + 크기 필수) */
  className?: string;
  /** Next Image에 줄 className */
  imageClassName?: string;
};

export function Image({
  src,
  alt,
  className,
  imageClassName,
  onLoad,
  ...rest
}: ImageProps) {
  const srcKey = typeof src === "string" ? src : "";
  const [showBlur, setShowBlur] = useState(() => !loadedSrcs.has(srcKey));

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (srcKey) loadedSrcs.add(srcKey);
    setShowBlur(false);
    onLoad?.(e);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <NextImage
        src={src}
        alt={alt}
        className={imageClassName}
        onLoad={handleLoad}
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
