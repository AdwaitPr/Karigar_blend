import { materialImage } from "../data/catalog";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { Eyebrow, Reveal, SplitLines } from "./ui/Primitives";
import { EditorialImage } from "./ui/EditorialImage";

/**
 * Almost nothing: one plate, one sentence, a wall label.
 * The plate slowly settles (scale 1.16 → 1) as it passes through the viewport.
 */
export function MaterialMoment() {
  const plateRef = useScrollProgress<HTMLDivElement>("through");

  return (
    <section
      id="material"
      data-nav-theme="light"
      data-running-head="06 — Material"
      aria-labelledby="material-title"
      className="bg-paper px-gutter py-section-lg"
    >
      <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
        <Reveal className="col-span-12 lg:col-start-2">
          <Eyebrow index="06">Material</Eyebrow>
        </Reveal>
        <h2
          id="material-title"
          className="col-span-12 mt-12 font-display text-display-xl md:mt-16 lg:col-span-10 lg:col-start-2"
        >
          <SplitLines lines={["You can see the", <em key="t">time in it.</em>]} />
        </h2>
      </div>

      <div className="mt-20 grid grid-cols-12 gap-x-4 md:gap-x-6 lg:mt-32">
        <div className="order-2 col-span-12 mt-10 md:order-1 md:col-span-4 md:mt-0 md:self-end lg:col-span-3 lg:col-start-2">
          <Reveal>
            <ul className="caps space-y-1.5">
              <li>Handloom</li>
              <li>Natural silk</li>
              <li>Banaras</li>
            </ul>
            <p className="mt-6 max-w-[34ch] text-[0.875rem] leading-relaxed text-muted">
              Katan: two or more filaments of mulberry silk, twisted by hand before they reach the loom. It holds
              zari without puckering, and softens with every wear.
            </p>
            <p className="meta mt-6 text-muted">
              <span className="caps mr-2 text-ink">Plate 06</span>
              Raw mulberry silk, undyed.
            </p>
          </Reveal>
        </div>

        <div
          ref={plateRef}
          className="order-1 col-span-12 md:order-2 md:col-span-7 md:col-start-6 lg:col-span-5 lg:col-start-7"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-bone">
            <div className="material-img absolute inset-0">
              <EditorialImage
                image={materialImage}
                sizes="(min-width: 1024px) 40vw, (min-width: 768px) 58vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
