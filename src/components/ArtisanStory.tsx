import { clsx } from "clsx";
import { artisanById, featuredArtisanId, makerDetail } from "../data/catalog";
import { ArrowLink, Eyebrow, Reveal, SplitLines } from "./ui/Primitives";
import { EditorialImage, RevealFrame } from "./ui/EditorialImage";

/**
 * A contemporary magazine profile — the maker named, placed and quoted.
 * Mobile order: portrait → metadata → quote → story.
 */
export function ArtisanStory() {
  const artisan = artisanById(featuredArtisanId);
  const possessive = artisan.pronoun === "his" ? "His" : "Her";
  const rows: [string, string][] = [
    ["Region", artisan.village],
    ["Craft", artisan.practice],
    ["At the loom", `${artisan.years} years`],
    ["On Kārigar", `Since ${artisan.since}`],
  ];

  return (
    <section
      id="maker"
      data-nav-theme="light"
      data-running-head="05 — The maker"
      aria-labelledby="maker-title"
      className="bg-paper px-gutter pb-section"
    >
      <div className="grid grid-cols-12 gap-x-4 border-t border-ink/15 pt-5 md:gap-x-6">
        <Eyebrow index="05" className="col-span-6">
          The maker
        </Eyebrow>
        <p className="caps col-span-6 text-right text-muted">Profile no. {artisan.number}</p>
      </div>

      <h2 id="maker-title" className="mt-12 font-display text-display-xl md:mt-16">
        <SplitLines lines={["The maker is part", <em key="o">of the object.</em>]} />
      </h2>

      <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-12 md:mt-20 md:gap-x-6 lg:mt-24">
        <figure className="col-span-12 md:col-span-7 lg:col-span-6">
          <RevealFrame className="aspect-[4/5] overflow-hidden bg-bone">
            <div className="frame-reveal-img h-full">
              {artisan.portrait ? (
                <EditorialImage
                  image={artisan.portrait}
                  sizes="(min-width: 1024px) 48vw, (min-width: 768px) 58vw, 100vw"
                />
              ) : null}
            </div>
          </RevealFrame>
          <figcaption className="meta mt-3 text-muted">
            <span className="caps mr-2 text-ink">Portrait</span>
            {artisan.plate ?? artisan.village}
          </figcaption>
        </figure>

        <div className="col-span-12 flex flex-col md:col-span-5 lg:col-span-5 lg:col-start-8">
          <Reveal>
            <p className="caps text-muted">Artisan {artisan.number}</p>
            <h3 className="mt-3 font-display text-display-md">{artisan.name}</h3>
            <dl className="mt-8 border-t border-ink/15">
              {rows.map(([term, value]) => (
                <div key={term} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-ink/15 py-3">
                  <dt className="caps pt-0.5 text-muted">{term}</dt>
                  <dd className="text-[0.9375rem]">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {artisan.quote ? (
            <Reveal as="blockquote" className="mt-12 lg:mt-auto lg:pt-16">
              <p className="font-display text-[1.75rem] italic leading-[1.12] md:text-[2.1rem] xl:text-[2.6rem]">
                “{artisan.quote}”
              </p>
            </Reveal>
          ) : null}

          <Reveal className="mt-8">
            {artisan.bio?.map((paragraph, i) => (
              <p key={i} className={clsx("max-w-[52ch] text-muted", i > 0 && "mt-4")}>
                {paragraph}
              </p>
            ))}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              <ArrowLink href="#maker">Meet the maker</ArrowLink>
              <ArrowLink href="#object/banarasi-silk-stole">{possessive} work</ArrowLink>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-12 gap-x-4 md:mt-20 md:gap-x-6">
        <figure className="col-span-8 col-start-5 md:col-span-4 md:col-start-8 lg:col-span-3 lg:col-start-8">
          <RevealFrame className="aspect-[3/2] overflow-hidden bg-bone">
            <div className="frame-reveal-img h-full">
              <EditorialImage image={makerDetail} sizes="(min-width: 1024px) 22vw, 60vw" />
            </div>
          </RevealFrame>
          <figcaption className="meta mt-3 text-muted">
            <span className="caps mr-2 text-ink">Fig. 05</span>
            The last thread is cut by hand.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
