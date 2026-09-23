/**
 * Kārigar catalogue model.
 *
 *   Craft → Region → Category → Product → Artisan
 *
 * The landing page reads from these shapes so the same components can later
 * power collection pages, product detail pages, craft pages and maker profiles.
 *
 * Every record carries a `source`. In this prototype everything is `"demo"`:
 * names, quotes, prices and counts are art direction, not marketplace data.
 * Production ingest should only set `"verified"` after onboarding.
 */

export type ContentSource = "demo" | "verified";

/**
 * Art-directed image.
 *
 * Production pipeline:
 *   original master → image service → AVIF/WebP variants → CDN → srcset
 *
 * `position` is the crop. Do not replace it with a raw `url`.
 */
export type ImageKind = "studio" | "field" | "placeholder";

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position — the art-directed crop */
  position?: string;
  /** Remote CDN source that supports responsive width parameters */
  remote?: boolean;
  /** Used when the primary source cannot be loaded */
  fallback?: ImageAsset;
  kind?: ImageKind;
  credit?: string;
};

export type Region = {
  id: string;
  place: string;
  state: string;
  lat: number;
  lng: number;
};

export type CraftCategory = "Textile" | "Wood" | "Painting";

export type Craft = {
  id: string;
  source: ContentSource;
  /** Display name in the atlas — usually the place a craft is known by */
  place: string;
  name: string;
  medium: string;
  category: CraftCategory;
  regionId: string;
  material: string;
  swatch: { name: string; hex: string };
  note: string;
  image: ImageAsset;
};

export type Artisan = {
  id: string;
  source: ContentSource;
  number: string;
  name: string;
  pronoun: "his" | "her";
  regionId: string;
  craftId: string;
  village: string;
  practice: string;
  years: number;
  since: number;
  quote?: string;
  bio?: string[];
  portrait?: ImageAsset;
  /** Caption for the plate — never invent that a stock photograph is this person */
  plate?: string;
};

export type AvailabilityStatus = "ready" | "made-to-order" | "one-of-one";

export type Product = {
  id: string;
  source: ContentSource;
  name: string;
  price: number;
  craftId: string;
  regionId: string;
  artisanId: string;
  material: string;
  technique?: string;
  time?: string;
  dimensions?: string;
  description: string;
  story?: string;
  images: ImageAsset[];
  /** When no alternate photograph exists, hover reveals a detail crop of the primary */
  detail?: { scale: number; origin: string };
  /** Original artworks are presented framed, as they would hang */
  framed?: boolean;
  availability: { status: AvailabilityStatus; label: string };
};

export type JournalEntry = {
  id: string;
  source: ContentSource;
  index: string;
  kind: string;
  minutes: number;
  title: string;
  excerpt: string;
  image: ImageAsset;
};

export type NavLink = { label: string; href: string };
