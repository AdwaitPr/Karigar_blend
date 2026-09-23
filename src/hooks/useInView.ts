import { useEffect, useRef, useState } from "react";

/**
 * One shared IntersectionObserver for every reveal on the page.
 * Elements reveal once, as they cross into the lower 90% of the viewport.
 */
type Callback = () => void;

const callbacks = new WeakMap<Element, Callback>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        sharedObserver?.unobserve(entry.target);
        callbacks.delete(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0 }
  );
  return sharedObserver;
}

export function useInView<T extends Element = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = getObserver();
    callbacks.set(el, () => setInView(true));
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, []);

  return [ref, inView] as const;
}
