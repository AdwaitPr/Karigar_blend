import { clsx } from "clsx";
import { kutchDetail, kutchPanel, products } from "../data/catalog";
import { formatINR } from "../lib/media";
import { objectPath } from "../lib/routes";
import { useMediaQuery, useReducedMotion } from "../hooks/useMedia";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { ArrowLink, Eyebrow, Reveal, SplitLines } from "./ui/Primitives";
import { EditorialImage, RevealFrame } from "./ui/EditorialImage";

/** Museum-catalogue metadata, not an infographic. */
const CATALOGUE = [
  { term: "Region", value: "Bhuj and the Banni grasslands, Gujarat" },
  { term: "Technique", value: "Hand embroidery — chain, interlacing, abhla mirror" },
  { term: "Material", value: "Cotton ground; silk and cotton thread; hand-cut mirror" },
  { term: "Time", value: "40 to 90 days, maker dependent" },
  { term: "Community", value: "Rabari, Ahir, Jat, Meghwal" },
];

const STEPS = [
  {
    chapter: "I — The panel",
    text: "North of Bhuj, embroidery is a language. A Rabari woman can read a stranger’s community — sometimes her village — from the stitches on a sleeve.",
  },
  {
    chapter: "II — The stitch",
    text: "No panel begins with a drawing. Chain stitch, interlacing, a mirror held by thread alone — counted by eye and built outward from a single square. A large piece holds three months of evenings.",
  },
];

const CAPTIONS = [
  { plate: "Plate 03", text: "Rabari panel, full view. Cotton ground, silk thread, abhla mirrors." },
  { plate: "Plate 04", text: "Detail — chain stitch and interlacing around a mirror, approx. 4 mm." },
];

const panelProduct = products.find((p) => p.id === "kutch-mirrorwork-panel");

/**
 * Featured craft story. On desktop the spread pins while the reader scrolls:
 * the full panel gives way to a detail crop, the text turns from chapter I to II,
 * and a hairline measures progress — craftsmanship told through structure.
 * On smaller screens (and with reduced motion) it recomposes as a stacked essay.
 */
export function CraftStory() {
  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const reduced = useReducedMotion();
  const pinned = isDesktop && !reduced;
  const ref = useScrollProgress<HTMLElement>("pinned", pinned);

  return (
    <section
      ref={ref}
      id="kutch"
      data-nav-theme="bone"
      data-running-head="03 — Kutch, Gujarat"
      aria-labelledby="kutch-title"
      className={clsx("story relative bg-bone", pinned && "h-[280vh]")}
    >
      {pinned ? <PinnedStory /> : <StackedStory />}
    </section>
  );
}

function Heading() {
  return (
    <header>
      <Eyebrow index="03">In focus</Eyebrow>
      <p className="caps mt-10 text-muted">Kutch, Gujarat</p>
      <h2 id="kutch-title" className="mt-4 font-display text-display-lg">
        <SplitLines lines={["The geometry", <em key="p">of patience.</em>]} />
      </h2>
    </header>
  );
}

function Links() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ArrowLink href="#journal">Read the field notes</ArrowLink>
      {panelProduct ? (
        <ArrowLink href={objectPath(panelProduct.id)}>
          The panel shown — {formatINR(panelProduct.price)}
        </ArrowLink>
      ) : null}
    </div>
  );
}

function PinnedStory() {
  return (
    <div className="sticky top-0 h-[100svh] overflow-hidden">
      <div className="grid h-full grid-cols-12 gap-x-6 px-gutter pb-8 pt-24">
        {/* Left — progress and catalogue metadata */}
        <aside className="col-span-3 flex h-full min-h-0 flex-col justify-between gap-6 pb-1 xl:col-span-2">
          <div className="flex gap-5">
            <div aria-hidden="true" className="relative h-32 w-px bg-ink/15 xl:h-44">
              <span className="story-bar absolute inset-0 bg-ink" />
            </div>
            <div aria-hidden="true" className="space-y-3">
              <p className="caps story-chapter-1">I — Panel</p>
              <p className="caps story-chapter-2">II — Stitch</p>
            </div>
          </div>
          <dl className="space-y-4">
            {CATALOGUE.map((item) => (
              <div key={item.term}>
                <dt className="caps text-muted">{item.term}</dt>
                <dd className="mt-1 text-[0.8125rem] leading-snug">{item.value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        {/* Centre — the plate */}
        <div className="col-span-5 col-start-4 flex h-full min-h-0 flex-col xl:col-span-6 xl:col-start-3">
          <div className="relative min-h-0 flex-1 overflow-hidden bg-parchment">
            <div className="story-a absolute inset-0">
              <EditorialImage image={kutchPanel} sizes="50vw" />
            </div>
            <div className="story-b absolute inset-0">
              <div className="story-b-img absolute inset-0">
                <EditorialImage image={kutchDetail} sizes="50vw" />
              </div>
            </div>
            <p
              aria-hidden="true"
              className="caps absolute right-4 top-4 tabular-nums text-paper mix-blend-difference [writing-mode:vertical-rl]"
            >
              23.24° N — 69.67° E
            </p>
          </div>
          <div className="relative mt-3 h-5">
            {CAPTIONS.map((caption, i) => (
              <p
                key={caption.plate}
                className={clsx(
                  "meta absolute inset-x-0 top-0 truncate text-muted",
                  i === 0 ? "story-cap-1" : "story-cap-2"
                )}
              >
                <span className="caps mr-2 text-ink">{caption.plate}</span>
                {caption.text}
              </p>
            ))}
          </div>
        </div>

        {/* Right — the story */}
        <div className="col-span-4 col-start-9 flex h-full flex-col justify-between">
          <Heading />
          <div className="grid">
            {STEPS.map((step, i) => (
              <div
                key={step.chapter}
                className={clsx("[grid-area:1/1]", i === 0 ? "story-step-1" : "story-step-2")}
              >
                <p className="caps text-muted">{step.chapter}</p>
                <p className="mt-4 max-w-[36ch] text-body-lg">{step.text}</p>
              </div>
            ))}
          </div>
          <Links />
        </div>
      </div>
    </div>
  );
}

function StackedStory() {
  return (
    <div className="px-gutter py-section">
      <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
        <div className="col-span-12 md:col-span-9">
          <Heading />
        </div>

        <figure className="col-span-12 -mx-gutter mt-12 md:col-span-10 md:mx-0 md:mt-16">
          <RevealFrame className="aspect-[4/5] overflow-hidden bg-parchment">
            <div className="frame-reveal-img h-full">
              <EditorialImage image={kutchPanel} sizes="(min-width: 768px) 80vw, 100vw" />
            </div>
          </RevealFrame>
          <figcaption className="meta mt-3 px-gutter text-muted md:px-0">
            <span className="caps mr-2 text-ink">{CAPTIONS[0].plate}</span>
            {CAPTIONS[0].text}
          </figcaption>
        </figure>

        <Reveal className="col-span-12 mt-12 md:col-span-8">
          <p className="caps text-muted">{STEPS[0].chapter}</p>
          <p className="mt-4 text-body-lg">{STEPS[0].text}</p>
        </Reveal>

        <Reveal className="col-span-12 mt-12 md:col-span-10">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-ink/15 pt-6 md:grid-cols-3">
            {CATALOGUE.map((item) => (
              <div key={item.term}>
                <dt className="caps text-muted">{item.term}</dt>
                <dd className="mt-1 text-[0.875rem] leading-snug">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <figure className="col-span-9 col-start-4 mt-16 md:col-span-6 md:col-start-6">
          <RevealFrame className="aspect-[4/5] overflow-hidden bg-parchment">
            <div className="frame-reveal-img h-full">
              <EditorialImage image={kutchDetail} sizes="(min-width: 768px) 50vw, 75vw" />
            </div>
          </RevealFrame>
          <figcaption className="meta mt-3 text-muted">
            <span className="caps mr-2 text-ink">{CAPTIONS[1].plate}</span>
            {CAPTIONS[1].text}
          </figcaption>
        </figure>

        <Reveal className="col-span-12 mt-12 md:col-span-8">
          <p className="caps text-muted">{STEPS[1].chapter}</p>
          <p className="mt-4 text-body-lg">{STEPS[1].text}</p>
        </Reveal>

        <Reveal className="col-span-12 mt-12">
          <Links />
        </Reveal>
      </div>
    </div>
  );
}
