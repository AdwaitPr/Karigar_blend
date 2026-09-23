import type { CSSProperties } from "react";
import { clsx } from "clsx";
import { crafts, regionById } from "../data/catalog";
import type { Craft } from "../types/catalog";
import { formatCoordinates, pad } from "../lib/media";
import { Arrow, ArrowLink, Eyebrow, Reveal, SplitLines } from "./ui/Primitives";
import { EditorialImage, RevealFrame } from "./ui/EditorialImage";

type AtlasLayout = { wrap: string; frame: string; sizes: string };

/**
 * A deliberately uneven rhythm — large, small, small, large, medium, wide —
 * so the atlas reads like a spread, not a category grid. On mobile the entries
 * become a vertical sequence with alternating insets.
 */
const LAYOUT: AtlasLayout[] = [
  {
    wrap: "col-span-12 lg:col-span-7",
    frame: "aspect-[4/5] lg:aspect-square",
    sizes: "(min-width: 1024px) 56vw, 100vw",
  },
  {
    wrap: "col-span-10 col-start-3 lg:col-span-4 lg:col-start-9 lg:mt-[16vw]",
    frame: "aspect-[3/4]",
    sizes: "(min-width: 1024px) 31vw, 84vw",
  },
  {
    wrap: "col-span-9 lg:col-span-4 lg:col-start-2 lg:mt-[7vw]",
    frame: "aspect-square",
    sizes: "(min-width: 1024px) 31vw, 76vw",
  },
  {
    wrap: "col-span-12 lg:col-span-6 lg:col-start-7",
    frame: "aspect-[4/5]",
    sizes: "(min-width: 1024px) 47vw, 100vw",
  },
  {
    wrap: "col-span-10 col-start-2 lg:col-span-5 lg:col-start-1",
    frame: "aspect-[3/4]",
    sizes: "(min-width: 1024px) 39vw, 84vw",
  },
  {
    wrap: "col-span-12 lg:col-span-6 lg:col-start-7 lg:mt-[13vw]",
    frame: "aspect-[4/3]",
    sizes: "(min-width: 1024px) 47vw, 100vw",
  },
];

export function CraftAtlas() {
  return (
    <section
      id="atlas"
      data-nav-theme="light"
      data-running-head="02 — The atlas"
      aria-labelledby="atlas-title"
      className="bg-paper px-gutter pb-section"
    >
      <div className="grid grid-cols-12 gap-x-4 border-t border-ink/15 pt-5 md:gap-x-6">
        <Eyebrow index="02" className="col-span-6 md:col-span-4">
          The atlas
        </Eyebrow>
        <p className="caps col-span-6 text-right text-muted md:col-span-8">Six regions</p>

        <h2 id="atlas-title" className="col-span-12 mt-12 font-display text-display-lg md:mt-16 lg:col-span-8">
          <SplitLines lines={["A textile can carry", <em key="g">a geography.</em>]} />
        </h2>

        <Reveal
          className="col-span-12 mt-10 md:col-span-6 lg:col-span-3 lg:col-start-10 lg:mt-0 lg:self-end"
          delay={120}
        >
          <p className="text-muted">
            Every craft on Kārigar is held by a community that has refined it for generations — often within a
            few square kilometres. So we begin with the place.
          </p>
          <ArrowLink href="#craft-banarasi" className="mt-6">
            All crafts
          </ArrowLink>
        </Reveal>
      </div>

      <nav id="atlas-index" aria-label="Atlas index" className="mt-16 hidden lg:block">
        <ol className="grid grid-cols-6 border-y border-ink/15">
          {crafts.map((craft, i) => (
            <li key={craft.id} className={clsx(i > 0 && "border-l border-ink/15")}>
              <a
                href={`#craft-${craft.id}`}
                className="group flex items-baseline justify-between gap-3 px-4 py-4"
              >
                <span className="caps">
                  <span className="mr-3 tabular-nums text-muted">{pad(i + 1)}</span>
                  <span className="link-line">{craft.place}</span>
                </span>
                <span className="meta text-muted">{craft.medium}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-16 grid grid-cols-12 items-start gap-x-4 gap-y-20 md:gap-x-6 md:gap-y-28 lg:mt-24 lg:gap-y-[8vw]">
        {crafts.map((craft, i) => (
          <AtlasEntry key={craft.id} craft={craft} index={i} layout={LAYOUT[i % LAYOUT.length]} />
        ))}
      </div>
    </section>
  );
}

function AtlasEntry({ craft, index, layout }: { craft: Craft; index: number; layout: AtlasLayout }) {
  const region = regionById(craft.regionId);

  return (
    <article id={`craft-${craft.id}`} className={layout.wrap}>
      <a href={`#craft-${craft.id}`} data-cursor="Explore" className="group block">
        <RevealFrame className={clsx("relative overflow-hidden bg-bone", layout.frame)}>
          <div className="frame-reveal-img h-full">
            <div className="hover-zoom h-full">
              <EditorialImage image={craft.image} sizes={layout.sizes} />
            </div>
          </div>
          <span
            aria-hidden="true"
            className="caps absolute left-4 top-4 tabular-nums text-paper mix-blend-difference"
          >
            {pad(index + 1)}
          </span>
        </RevealFrame>

        <div className="mt-5 flex items-end justify-between gap-6">
          <div>
            <p className="caps text-muted">
              {craft.medium} <span className="px-1 opacity-50">/</span> {region.state}
            </p>
            <h3 className="mt-3 font-display text-display-md">
              <span className="link-line">{craft.place}</span>
            </h3>
          </div>
          <Arrow className="arrow-shift mb-3" />
        </div>

        <dl className="meta mt-5 grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-1.5 border-t border-ink/15 pt-4">
          <dt className="caps pt-px text-muted">Material</dt>
          <dd className="flex items-center gap-2">
            <span
              aria-hidden="true"
              title={craft.swatch.name}
              className="swatch"
              style={{ "--swatch": craft.swatch.hex } as CSSProperties}
            />
            {craft.material}
          </dd>
          <dt className="caps pt-px text-muted">Location</dt>
          <dd className="tabular-nums">{formatCoordinates(region.lat, region.lng)}</dd>
        </dl>

        <div className="hover-reveal mt-4 max-w-[46ch]">
          <p className="text-[0.875rem] leading-relaxed text-muted">{craft.note}</p>
        </div>
      </a>
    </article>
  );
}
