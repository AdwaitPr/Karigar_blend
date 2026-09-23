import { useEffect, useRef } from "react";
import { EditorialImage } from "./ui/EditorialImage";
import { Arrow, delay } from "./ui/Primitives";
import { heroImage } from "../data/catalog";
import { prefersReducedMotion } from "../hooks/useMedia";

/**
 * The signature moment. One art-directed plate; the type sits inside the
 * photograph's own shadow rather than on top of it.
 *
 * Load choreography (keyed off html[data-ready]):
 *   plate expands → headline rises → navigation settles → metadata arrives last.
 * On scroll, the plate recedes while the next page slides over it.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);

  // Begin the sequence once the plate has decoded (or after a short safety timeout).
  useEffect(() => {
    const root = document.documentElement;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          root.dataset.ready = "true";
        })
      );
    };
    const img = ref.current?.querySelector("img");
    if (!img || (img.complete && img.naturalWidth > 0)) start();
    else {
      img.addEventListener("load", start, { once: true });
      img.addEventListener("error", start, { once: true });
    }
    const safety = window.setTimeout(start, 1600);
    return () => window.clearTimeout(safety);
  }, []);

  // Recede: writes --hp (0 → 1 across the first viewport of scroll).
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let frame = 0;
    let last = -1;
    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight || 1)));
      if (p === last) return;
      last = p;
      el.style.setProperty("--hp", p.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      data-nav-theme="hero"
      data-running-head="India, made by hand"
      aria-labelledby="hero-title"
      className="hero sticky top-0 h-[88svh] min-h-[34rem] overflow-hidden bg-ink text-paper md:h-[100svh]"
    >
      <div className="hero-recede absolute inset-0">
        <div className="hero-media absolute inset-0">
          <div className="hero-img absolute inset-0">
            <EditorialImage
              image={heroImage}
              priority
              sizes="100vw"
              className="object-[58%_50%] md:object-[40%_50%]"
            />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="hero-scrim pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0 bg-ink" />

      <div className="hero-content relative flex h-full flex-col px-gutter pb-5 pt-24 md:pb-7 md:pt-32">
        <p className="caps load-fade text-paper/75" style={delay(1450)}>
          India <span className="px-1 opacity-40">/</span> Objects <span className="px-1 opacity-40">/</span> 01
        </p>

        <div className="mt-auto md:mt-[7svh]">
          <h1 id="hero-title" className="font-display text-display-2xl">
            <span className="hero-line">
              <span style={delay(420)}>Made slowly.</span>
            </span>{" "}
            <span className="hero-line">
              <span className="italic" style={delay(560)}>
                Held forever.
              </span>
            </span>
          </h1>

          <div className="mt-7 max-w-[23rem] md:mt-10">
            <p className="load-fade text-body-lg text-paper/80" style={delay(900)}>
              A contemporary house for India’s handmade traditions. Every object traced to a region, a
              workshop, a pair of hands.
            </p>
            <a
              href="#objects"
              className="load-fade group mt-7 inline-flex items-center gap-3 caps"
              style={delay(1060)}
            >
              <span className="link-line">Explore the collection</span>
              <Arrow className="arrow-shift" />
            </a>
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between gap-6 border-t border-paper/15 pt-4 md:mt-auto">
          <p className="load-fade meta max-w-[48ch] text-paper/60" style={delay(1600)}>
            <span className="caps mr-2 text-paper/90">Plate 01</span>
            Kadhua brocade on katan silk. Woven over 31 days in Sarai Mohana, Varanasi.
          </p>
          <div className="load-fade hidden shrink-0 items-center gap-8 md:flex" style={delay(1750)}>
            <p className="caps tabular-nums text-paper/55">25.32° N, 82.97° E</p>
            <a href="#intro" className="flex items-center gap-3 caps text-paper/75">
              Scroll
              <span aria-hidden="true" className="relative block h-8 w-px overflow-hidden bg-paper/20">
                <span className="scroll-cue absolute inset-0 bg-paper" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
