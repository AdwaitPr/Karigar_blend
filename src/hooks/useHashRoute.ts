import { useCallback, useEffect, useState } from "react";
import { parseHash, type HashRoute } from "../lib/routes";

function read(): HashRoute {
  if (typeof window === "undefined") return { type: "none" };
  return parseHash(window.location.hash);
}

/** Keeps the open object (and any future hash routes) in sync with the URL. */
export function useHashRoute() {
  const [route, setRoute] = useState<HashRoute>(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const closeObject = useCallback(() => {
    const next = `${window.location.pathname}${window.location.search}#objects`;
    window.history.pushState(null, "", next);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  return { route, closeObject };
}
