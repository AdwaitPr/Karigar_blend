import { useEffect, useState } from "react";

const canMatch = () => typeof window !== "undefined" && typeof window.matchMedia === "function";

export function useMediaQuery(query: string, initial = false) {
  const [matches, setMatches] = useState(() => (canMatch() ? window.matchMedia(query).matches : initial));

  useEffect(() => {
    if (!canMatch()) return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

export const prefersReducedMotion = () =>
  canMatch() && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
