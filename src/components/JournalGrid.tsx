import { journal } from "../data/catalog";
import type { JournalEntry } from "../types/catalog";
import { ArrowLink, Eyebrow, SplitLines } from "./ui/Primitives";
import { EditorialImage, RevealFrame } from "./ui/EditorialImage";

function Kicker({ entry, long = false }: { entry: JournalEntry; long?: boolean }) {
  return (
    <p className="caps text-muted">
      <span className="tabular-nums text-ink">{entry.index}</span> — {entry.kind}
      {long ? <span className="block md:mt-1">{entry.minutes} min read</span> : <> · {entry.minutes} min</>}
    </p>
  );
}

function Plate({ entry, className, sizes }: { entry: JournalEntry; className: string; sizes: string }) {
  return (
    <RevealFrame className={`overflow-hidden bg-bone ${className}`}>
      <div className="frame-reveal-img h-full">
        <div className="hover-zoom h-full">
          <EditorialImage image={entry.image} sizes={sizes} />
        </div>
      </div>
    </RevealFrame>
  );
}

/**
 * Three stories in three different beats: a lead, a column, a horizontal aside.
 * On mobile the secondary stories become a quiet list.
 */
export function JournalGrid() {
  const [lead, second, third] = journal;

  return (
    <section
      id="journal"
      data-nav-theme="light"
      data-running-head="07 — The journal"
      aria-labelledby="journal-title"
      className="bg-paper px-gutter pb-section"
    >
      <div className="grid grid-cols-12 gap-x-4 border-t border-ink/15 pt-5 md:gap-x-6">
        <Eyebrow index="07" className="col-span-6">
          The journal
        </Eyebrow>
        <div className="col-span-6 flex justify-end">
          <ArrowLink href="#journal">All stories</ArrowLink>
        </div>
        <h2 id="journal-title" className="col-span-12 mt-12 font-display text-display-lg md:mt-16 lg:col-span-8">
          <SplitLines lines={["Notes from", <em key="w">the workshop.</em>]} />
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-14 md:mt-20 md:gap-x-6 lg:gap-y-24">
        {/* Lead */}
        <article className="col-span-12 lg:col-span-7">
          <a href="#journal" data-cursor="Read" className="group block">
            <Plate entry={lead} className="aspect-[4/3]" sizes="(min-width: 1024px) 56vw, 100vw" />
            <div className="mt-6 grid grid-cols-12 gap-x-4 md:gap-x-6">
              <div className="col-span-12 md:col-span-3">
                <Kicker entry={lead} long />
              </div>
              <div className="col-span-12 mt-3 md:col-span-9 md:mt-0">
                <h3 className="font-display text-display-md">
                  <span className="link-line">{lead.title}</span>
                </h3>
                <p className="mt-4 max-w-[46ch] text-muted">{lead.excerpt}</p>
              </div>
            </div>
          </a>
        </article>

        {/* Column */}
        <article className="col-span-12 lg:col-span-4 lg:col-start-9">
          <a href="#journal" data-cursor="Read" className="group grid grid-cols-12 gap-x-4 lg:block">
            <Plate
              entry={second}
              className="col-span-5 aspect-[4/5]"
              sizes="(min-width: 1024px) 31vw, 40vw"
            />
            <div className="col-span-7 lg:mt-6">
              <Kicker entry={second} />
              <h3 className="mt-3 font-display text-display-sm">
                <span className="link-line">{second.title}</span>
              </h3>
              <p className="mt-3 hidden max-w-[40ch] text-[0.875rem] leading-relaxed text-muted sm:block">
                {second.excerpt}
              </p>
            </div>
          </a>
        </article>

        {/* Horizontal aside */}
        <article className="col-span-12 lg:col-span-7 lg:col-start-5">
          <a href="#journal" data-cursor="Read" className="group grid grid-cols-12 items-end gap-x-4 md:gap-x-6">
            <Plate
              entry={third}
              className="col-span-5 aspect-[4/5] lg:aspect-square"
              sizes="(min-width: 1024px) 24vw, 40vw"
            />
            <div className="col-span-7 lg:pb-2">
              <Kicker entry={third} />
              <h3 className="mt-3 font-display text-display-sm lg:text-display-md">
                <span className="link-line">{third.title}</span>
              </h3>
              <p className="mt-3 hidden max-w-[40ch] text-[0.875rem] leading-relaxed text-muted sm:block">
                {third.excerpt}
              </p>
            </div>
          </a>
        </article>
      </div>
    </section>
  );
}
