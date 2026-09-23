import { useEffect, useState } from "react";
import type { Product } from "../../types/catalog";
import { artisanById, craftById, featuredArtisanId, findProduct, products, regionById } from "../../data/catalog";
import { useBag } from "../../context/BagContext";
import { formatINR, pad } from "../../lib/media";
import { objectPath } from "../../lib/routes";
import { EditorialImage } from "../ui/EditorialImage";
import { Sheet } from "../ui/Sheet";
import { Arrow } from "../ui/Primitives";

/**
 * Object page — the visual language of the future PDP.
 *
 * Prototype route:  #object/[id]
 * Production route: /object/[id]
 *
 * A museum catalogue spread, not a Shopify product template.
 */
export function ObjectSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const product = id ? findProduct(id) : undefined;

  useEffect(() => {
    if (id && !product) onClose();
  }, [id, product, onClose]);

  return (
    <Sheet open={Boolean(product)} onClose={onClose} label={product ? product.name : "Object"} placement="full">
      {product ? <ObjectPage product={product} onClose={onClose} /> : null}
    </Sheet>
  );
}

function ObjectPage({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add, has, open } = useBag();
  const [plate, setPlate] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setPlate(0);
    setJustAdded(false);
  }, [product.id]);

  const craft = craftById(product.craftId);
  const region = regionById(product.regionId);
  const artisan = artisanById(product.artisanId);
  const index = products.findIndex((item) => item.id === product.id);
  const prev = products[(index - 1 + products.length) % products.length];
  const next = products[(index + 1) % products.length];
  const unique = product.availability.status === "one-of-one";
  const inBag = has(product.id);
  const image = product.images[Math.min(plate, product.images.length - 1)] ?? product.images[0];

  const actionLabel = justAdded ? "Added — view bag" : unique && inBag ? "In your bag" : "Add to bag";

  const onAdd = () => {
    if (justAdded || (unique && inBag)) {
      open();
      return;
    }
    add(product.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2600);
  };

  const provenance: [string, string][] = [
    ["Region", `${region.place}, ${region.state}`],
    ["Technique", product.technique ?? craft.name],
    ["Material", product.material],
    ...(product.dimensions ? [["Dimensions", product.dimensions] as [string, string]] : []),
    ...(product.time ? [["Time", product.time] as [string, string]] : []),
    ["Maker", artisan.name],
  ];

  const makerHref = artisan.id === featuredArtisanId ? "#maker" : `#craft-${artisan.craftId}`;

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-ink/10 bg-paper px-gutter">
        <p className="caps text-muted">
          Object <span className="tabular-nums text-ink">{pad(index + 1)}</span>
          <span className="px-2 opacity-40">/</span>
          <span className="tabular-nums">{pad(products.length)}</span>
        </p>
        <button type="button" onClick={onClose} className="caps link-line">
          Close
        </button>
      </div>

      <div className="grid flex-1 lg:grid-cols-12">
        <div className="flex flex-col bg-bone lg:col-span-7 lg:sticky lg:top-14 lg:h-[calc(100svh-3.5rem)]">
          <div className="relative min-h-[70vw] flex-1 overflow-hidden sm:min-h-[32rem]">
            <EditorialImage
              key={`${product.id}-${plate}`}
              image={image}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className={product.framed ? "!object-contain bg-bone p-[8%]" : undefined}
            />
          </div>

          {product.images.length > 1 ? (
            <div className="flex gap-2 border-t border-ink/10 bg-paper p-3">
              {product.images.map((img, i) => (
                <button
                  key={img.src + i}
                  type="button"
                  onClick={() => setPlate(i)}
                  aria-label={`Plate ${i + 1}`}
                  aria-pressed={i === plate}
                  className={`h-16 w-12 overflow-hidden sm:h-20 sm:w-16 ${
                    i === plate ? "outline outline-1 outline-offset-2 outline-ink" : "opacity-55 hover:opacity-100"
                  }`}
                >
                  <EditorialImage image={img} sizes="64px" decorative />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col px-gutter py-10 lg:col-span-5 lg:py-14">
          <p className="caps text-muted">
            {craft.medium} <span className="px-1 opacity-50">/</span> {region.place}
          </p>
          <h2 className="mt-4 font-display text-display-md">{product.name}</h2>
          <p className="mt-4 text-[1.15rem] tabular-nums">{formatINR(product.price)}</p>

          <p className="mt-8 max-w-[42ch] text-body-lg text-ink/85">{product.description}</p>

          {product.story ? (
            <p className="mt-6 max-w-[42ch] font-display text-[1.35rem] italic leading-snug text-ink/80">
              {product.story}
            </p>
          ) : null}

          <dl className="mt-10 border-t border-ink/15">
            {provenance.map(([term, value]) => (
              <div key={term} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-ink/15 py-3">
                <dt className="caps pt-0.5 text-muted">{term}</dt>
                <dd className="text-[0.9375rem]">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="meta mt-6 text-muted">{product.availability.label}</p>

          <button
            type="button"
            onClick={onAdd}
            className="group caps mt-8 flex w-full items-center justify-between bg-ink px-5 py-4 text-paper transition-colors duration-500 hover:bg-charcoal"
          >
            <span>{actionLabel}</span>
            <Arrow className="arrow-shift" />
          </button>

          <a href={makerHref} onClick={onClose} className="group caps mt-6 inline-flex items-center gap-3 self-start">
            <span className="link-line">The maker — {artisan.name}</span>
            <Arrow className="arrow-shift" />
          </a>

          <div className="mt-auto flex items-center justify-between gap-6 border-t border-ink/15 pt-6 lg:mt-16">
            <a href={objectPath(prev.id)} className="group inline-flex items-center gap-3 caps">
              <Arrow direction="right" className="arrow-shift rotate-180" />
              <span className="link-line hidden sm:inline">{prev.name}</span>
              <span className="link-line sm:hidden">Prev</span>
            </a>
            <a href={objectPath(next.id)} className="group inline-flex items-center gap-3 caps">
              <span className="link-line hidden sm:inline">{next.name}</span>
              <span className="link-line sm:hidden">Next</span>
              <Arrow className="arrow-shift" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
