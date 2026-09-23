import { useScrollProgress } from "../hooks/useScrollProgress";
import { ArrowLink, SplitLines } from "./ui/Primitives";

/**
 * The final page. As it rises, the paper darkens to near-black and the words
 * surface out of it — like a print developing.
 */
export function ClosingStatement() {
  const ref = useScrollProgress<HTMLElement>("enter");

  return (
    <section
      ref={ref}
      id="closing"
      data-nav-theme="dark"
      data-running-head="Colophon"
      aria-labelledby="closing-title"
      className="closing relative overflow-hidden bg-paper text-paper"
    >
      <div aria-hidden="true" className="closing-veil absolute inset-0 bg-ink" />

      <div className="relative flex min-h-[100svh] flex-col justify-center px-gutter py-section">
        <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
          <h2 id="closing-title" className="col-span-12 font-display text-display-xl lg:col-span-11">
            <SplitLines lines={["India has been making", "beautiful things", "for centuries."]} stagger={110} />
          </h2>

          <p className="col-span-12 mt-10 font-display text-display-xl italic text-rawsilk md:mt-14 lg:col-span-9 lg:col-start-4">
            <SplitLines lines={["We’re still making them."]} delay={380} />
          </p>

          <div className="col-span-12 mt-20 flex flex-col gap-6 border-t border-paper/15 pt-6 md:flex-row md:items-center md:justify-between lg:mt-28">
            <p className="caps text-paper/55">Kārigar — India, made by hand</p>
            <ArrowLink href="#maker">Discover the makers</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
