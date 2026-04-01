"use client";

import NextImage from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
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
      <div
        className="pointer-events-none absolute inset-0 mx-auto max-w-[800px] rounded-xl bg-neutral-100/10 backdrop-blur-md transition-opacity duration-500"
        style={{ opacity: loaded ? 0 : 1 }}
        aria-hidden
      />
    </div>
  );
}
