import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./useMedia";

export type ProgressMode = "through" | "pinned" | "enter";

/**
 * Writes a 0 → 1 scroll progress value to the element as the CSS custom
 * property `--p`. No React re-renders; scroll work only happens while the
 * element is near the viewport. CSS then maps `--p` onto transform, opacity
 * or clip-path — never layout.
 *
 *  - through: element enters at the bottom (0) → leaves at the top (1)
 *  - pinned:  tall section with a sticky child; top aligned (0) → bottom aligned (1)
 *  - enter:   element top at viewport bottom (0) → element top at viewport top (1)
 */
export function useScrollProgress<T extends HTMLElement = HTMLElement>(
  mode: ProgressMode = "through",
  enabled = true
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || prefersReducedMotion()) return;

    let frame = 0;
    let listening = false;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      let p: number;
      if (mode === "pinned") p = -rect.top / Math.max(1, rect.height - vh);
      else if (mode === "enter") p = (vh - rect.top) / vh;
      else p = (vh - rect.top) / (rect.height + vh);
      el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const start = () => {
      if (listening) return;
      listening = true;
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
    };
    const stop = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
        measure();
      },
      { rootMargin: "15% 0px 15% 0px" }
    );
    io.observe(el);
    measure();

    return () => {
      io.disconnect();
      stop();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode, enabled]);

  return ref;
}
