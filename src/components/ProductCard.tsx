import { useEffect, useRef, useState } from "react";
import type { Product } from "../types/catalog";
import { artisanById, craftById, regionById } from "../data/catalog";
import { formatINR, pad } from "../lib/media";
import { objectPath } from "../lib/routes";
import { useBag } from "../context/BagContext";
import { EditorialImage } from "./ui/EditorialImage";
import { Arrow } from "./ui/Primitives";

const SIZES = "(min-width: 1024px) 30vw, 50vw";

/**
 * Image first. Then name, craft / region, maker and price — nothing shouting.
 * Hover (desktop): the plate crossfades to an alternate or a material detail,
 * the metadata shifts, and a small "View object" label surfaces.
 * Nothing important depends on hover.
 */
export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { add, has, open } = useBag();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const craft = craftById(product.craftId);
  const region = regionById(product.regionId);
  const artisan = artisanById(product.artisanId);
  const [primary, alternate] = product.images;
  const unique = product.availability.status === "one-of-one";
  const inBag = has(product.id);
  const href = objectPath(product.id);

  const onAdd = () => {
    if (justAdded || (unique && inBag)) {
      open();
      return;
    }
    add(product.id);
    setJustAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), 2600);
  };

  const actionLabel = justAdded ? "Added — view bag" : unique && inBag ? "In your bag" : "Add to bag";

  return (
    <article id={`object-${product.id}`} className="product-card">
      <a href={href} tabIndex={-1} aria-hidden="true" data-cursor="View object" className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bone">
          {product.framed ? (
            <FramedWork product={product} />
          ) : (
            <div className="hover-zoom absolute inset-0">
              <EditorialImage image={primary} sizes={SIZES} />
            </div>
          )}

          {alternate ? (
            <div className="product-alt absolute inset-0">
              <div className="product-alt-img absolute inset-0">
                <EditorialImage image={alternate} sizes={SIZES} decorative />
              </div>
            </div>
          ) : product.detail ? (
            <div className="product-alt absolute inset-0 overflow-hidden">
              <EditorialImage
                image={primary}
                sizes={SIZES}
                decorative
                style={{ transform: `scale(${product.detail.scale})`, transformOrigin: product.detail.origin }}
              />
            </div>
          ) : null}

          <span className="caps absolute left-3 top-3 tabular-nums text-ink/60 md:left-4 md:top-4">
            {pad(index + 1)}
          </span>
          <span className="product-view caps absolute bottom-3 left-3 hidden items-center gap-2.5 bg-paper px-3 py-2 text-ink sm:inline-flex md:bottom-4 md:left-4">
            View object <Arrow />
          </span>
        </div>
      </a>

      <div className="product-meta mt-4 md:mt-5">
        <div className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:justify-between md:gap-6">
          <h3 className="font-display text-[1.2rem] leading-[1.1] md:text-[1.5rem]">
            <a href={href} className="link-line">
              {product.name}
            </a>
          </h3>
          <p className="shrink-0 text-[0.875rem] tabular-nums">{formatINR(product.price)}</p>
        </div>
        <p className="caps mt-2 text-muted">
          {craft.medium} <span className="px-1 opacity-50">/</span> {region.place}
        </p>
        <p className="mt-1.5 hidden text-[0.8125rem] text-muted sm:block">By {artisan.name}</p>
      </div>

      <div className="mt-4 flex flex-col items-start gap-2 border-t border-ink/10 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="meta text-muted">{product.availability.label}</p>
        <button
          type="button"
          onClick={onAdd}
          className="caps link-line shrink-0 py-1"
          aria-label={`${actionLabel}: ${product.name}`}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

/** Original artworks are shown as they would hang: framed, matted, on a wall. */
function FramedWork({ product }: { product: Product }) {
  return (
    <div className="hover-zoom absolute inset-0 flex items-center justify-center">
      <div className="w-[62%] border-[5px] border-[#2b2621] bg-[#f8f5ee] p-[6%] shadow-[0_24px_40px_-24px_rgb(21_20_18/0.55)]">
        <div className="aspect-[3/4] overflow-hidden">
          <EditorialImage image={product.images[0]} sizes="(min-width: 1024px) 18vw, 32vw" />
        </div>
      </div>
    </div>
  );
}
