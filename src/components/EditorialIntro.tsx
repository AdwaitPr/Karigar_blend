import { ArrowLink, Eyebrow, Reveal, SplitLines } from "./ui/Primitives";
import { EditorialImage, RevealFrame } from "./ui/EditorialImage";
import { introFigure } from "../data/catalog";
import { pad } from "../lib/media";

/** The provenance system every object carries — previewed here as a colophon. */
const PROVENANCE = [
  { term: "Region", value: "Where it was made, down to the village." },
  { term: "Technique", value: "How — named, never paraphrased." },
  { term: "Time", value: "The days it took. Sometimes months." },
  { term: "Maker", value: "Who made it, credited by name." },
];

/**
 * The page that slides over the hero. A single statement, a quiet paragraph,
 * one small figure — and the provenance system the rest of the site follows.
 */
export function EditorialIntro() {
  return (
    <section
      id="intro"
      data-nav-theme="light"
      data-running-head="01 — A living tradition"
      aria-labelledby="intro-title"
      className="relative z-10 bg-paper px-gutter py-section"
    >
      <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
        <Reveal className="col-span-12">
          <Eyebrow index="01">A living tradition</Eyebrow>
        </Reveal>

        <h2 id="intro-title" className="col-span-12 mt-10 font-display text-display-lg md:mt-14 lg:col-span-8">
          <SplitLines
            lines={[
              "Not everything",
              <>
                made <em>by hand</em>
              </>,
              "belongs in the past.",
            ]}
          />
        </h2>

        <Reveal
          className="col-span-12 mt-12 md:col-span-6 md:col-start-7 lg:col-span-3 lg:col-start-10 lg:mt-0 lg:self-end"
          delay={150}
        >
          <p className="text-body-lg text-ink/85">
            Kārigar works with independent makers — weavers, dyers, turners, painters, embroiderers — from
            Kashmir to Karnataka.
          </p>
          <p className="mt-5 text-muted">
            Each object is photographed as it is, priced with the maker, and credited by name.
          </p>
          <ArrowLink href="#atlas" className="mt-8">
            Read our craft philosophy
          </ArrowLink>
        </Reveal>

        <figure className="col-span-8 col-start-5 mt-20 md:col-span-4 md:col-start-2 md:mt-28 lg:col-span-3 lg:col-start-4">
          <RevealFrame className="aspect-[4/5] overflow-hidden bg-bone">
            <div className="frame-reveal-img h-full">
              <EditorialImage
                image={introFigure}
                sizes="(min-width: 1024px) 22vw, (min-width: 768px) 32vw, 62vw"
              />
            </div>
          </RevealFrame>
          <figcaption className="meta mt-3 text-muted">
            <span className="caps mr-2 text-ink">Fig. 01</span>
            Thread, before it becomes cloth.
          </figcaption>
        </figure>

        <Reveal
          className="col-span-12 mt-16 md:col-span-5 md:col-start-8 md:mt-28 md:self-end lg:col-span-4 lg:col-start-8"
          delay={120}
        >
          <p className="caps text-muted">On every object</p>
          <dl className="mt-5 border-t border-ink/15">
            {PROVENANCE.map((item, i) => (
              <div
                key={item.term}
                className="grid grid-cols-[8.5rem_1fr] items-baseline gap-4 border-b border-ink/15 py-3.5"
              >
                <dt className="caps flex gap-3">
                  <span className="tabular-nums text-muted">{pad(i + 1)}</span>
                  {item.term}
                </dt>
                <dd className="font-display text-[1.2rem] leading-snug text-ink/85">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
