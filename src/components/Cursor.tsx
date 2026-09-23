import { useEffect, useRef, useState } from "react";

/**
 * A tiny contextual label that follows the pointer over links that open
 * something ("Explore", "View object", "Read"). Desktop with a fine pointer
 * only — never rendered for touch or reduced motion. The native cursor stays.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!enabled) {
      delete root.dataset.cursor;
      return;
    }
    const el = ref.current;
    const label = labelRef.current;
    if (!el || !label) return;
    root.dataset.cursor = "on";

    let x = -200;
    let y = -200;
    let tx = -200;
    let ty = -200;
    let frame = 0;
    let current: string | null = null;

    const loop = () => {
      x += (tx - x) * 0.24;
      y += (ty - y) * 0.24;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (x < -100) {
        x = tx;
        y = ty;
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };

    const onOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.("[data-cursor]");
      const next = target?.getAttribute("data-cursor") ?? null;
      if (next === current) return;
      current = next;
      if (next) label.textContent = next;
      el.dataset.active = next ? "true" : "false";
    };

    const onLeave = () => {
      current = null;
      el.dataset.active = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.cursor;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={ref} aria-hidden="true" className="cursor" data-active="false">
      <span ref={labelRef} className="cursor-chip" />
    </div>
  );
}
