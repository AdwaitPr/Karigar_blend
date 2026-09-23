import { clsx } from "clsx";
import { products } from "../data/catalog";
import { ArrowLink, Eyebrow, Reveal, SplitLines } from "./ui/Primitives";
import { ProductCard } from "./ProductCard";

/**
 * The turn into commerce — still set like a spread. Three columns on desktop
 * with the middle column dropped; two columns on mobile with a gentle stagger.
 */
export function ProductGrid() {
  return (
    <section
      id="objects"
      data-nav-theme="light"
      data-running-head="04 — Objects worth keeping"
      aria-labelledby="objects-title"
      className="bg-paper px-gutter py-section"
    >
      <div className="grid grid-cols-12 items-end gap-x-4 md:gap-x-6">
        <div className="col-span-12 lg:col-span-7">
          <Reveal>
            <Eyebrow index="04">Objects worth keeping</Eyebrow>
          </Reveal>
          <h2 id="objects-title" className="mt-10 font-display text-display-lg md:mt-14">
            <SplitLines lines={["Made here.", <em key="k">Kept elsewhere.</em>]} />
          </h2>
        </div>

        <Reveal className="col-span-12 mt-10 md:col-span-7 lg:col-span-4 lg:col-start-9 lg:mt-0" delay={120}>
          <p className="text-muted">
            Six objects from this season’s workshops. Numbered, signed where the craft allows, shipped with
            their story.
          </p>
          <div className="mt-6 flex items-center justify-between gap-6 border-t border-ink/15 pt-4">
            <p className="caps text-muted">This season · 06 objects</p>
            <ArrowLink href="#objects">The collection</ArrowLink>
          </div>
        </Reveal>
      </div>

      <ul className="mt-16 grid grid-cols-2 gap-x-3 gap-y-14 sm:gap-x-5 md:mt-24 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-24">
        {products.map((product, i) => (
          <li key={product.id} className={clsx(i % 2 === 1 && "max-lg:mt-14", i % 3 === 1 && "lg:mt-28")}>
            <Reveal delay={(i % 3) * 90}>
              <ProductCard product={product} index={i} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
