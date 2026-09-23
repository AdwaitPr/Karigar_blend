import type { ImageAsset } from "../types/catalog";

const BASE = import.meta.env.BASE_URL ?? "/";
const RESPONSIVE_WIDTHS = [480, 720, 960, 1280, 1600, 2000];

/** Art-directed photography that ships with the site (public/images). */
export function localImage(
  file: string,
  alt: string,
  width: number,
  height: number,
  extra: Partial<ImageAsset> = {}
): ImageAsset {
  return {
    src: `${BASE}images/${file}`,
    alt,
    width,
    height,
    kind: "studio",
    ...extra,
  };
}

/** Documentary / placeholder plate. Production should replace these with commissioned masters. */
export function pexelsImage(
  id: number,
  alt: string,
  width: number,
  height: number,
  extra: Partial<ImageAsset> = {}
): ImageAsset {
  return {
    src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`,
    alt,
    width,
    height,
    remote: true,
    kind: "placeholder",
    ...extra,
  };
}

export function imageSrc(image: ImageAsset, width = 1280): string {
  return image.remote ? `${image.src}?auto=compress&cs=tinysrgb&w=${width}` : image.src;
}

export function imageSrcSet(image: ImageAsset): string | undefined {
  if (!image.remote) return undefined;
  return RESPONSIVE_WIDTHS.filter((w) => w <= image.width)
    .map((w) => `${image.src}?auto=compress&cs=tinysrgb&w=${w} ${w}w`)
    .join(", ");
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatINR = (value: number) => inr.format(value);

export const formatCoordinates = (lat: number, lng: number) =>
  `${lat.toFixed(2)}° N, ${lng.toFixed(2)}° E`;

export const pad = (n: number) => String(n).padStart(2, "0");
