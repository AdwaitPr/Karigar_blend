import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { clsx } from "clsx";
import type { ImageAsset } from "../../types/catalog";
import { imageSrc, imageSrcSet } from "../../lib/media";
import { useInView } from "../../hooks/useInView";
import { delay } from "./Primitives";

type EditorialImageProps = {
  image: ImageAsset;
  sizes?: string;
  /** The LCP image: eager, high fetch priority, no fade */
  priority?: boolean;
  /** Purely visual duplicates (hover alternates) are hidden from assistive tech */
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Photography primitive. The parent reserves space (aspect ratio) so nothing
 * shifts; responsive sources are served where the CDN allows; below-the-fold
 * plates lazy-load and fade in on decode; a missing plate falls back gracefully.
 */
export function EditorialImage({
  image,
  sizes = "100vw",
  priority = false,
  decorative = false,
  className,
  style,
}: EditorialImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const asset = failed && image.fallback ? image.fallback : image;

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [asset.src]);

  return (
    <img
      ref={ref}
      src={imageSrc(asset)}
      srcSet={imageSrcSet(asset)}
      sizes={asset.remote ? sizes : undefined}
      alt={decorative ? "" : image.alt}
      width={asset.width}
      height={asset.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (!failed && image.fallback) setFailed(true);
      }}
      data-loaded={priority || loaded ? "true" : "false"}
      draggable={false}
      className={clsx("block h-full w-full object-cover", !priority && "img-load", className)}
      style={{ objectPosition: asset.position ?? image.position, ...style }}
    />
  );
}

/** Image frame with a curtain (clip-path) reveal as it enters the viewport. */
export function RevealFrame({
  className,
  children,
  wait = 0,
}: {
  className?: string;
  children: ReactNode;
  wait?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx("frame-reveal", inView && "is-visible", className)} style={delay(wait)}>
      {children}
    </div>
  );
}
