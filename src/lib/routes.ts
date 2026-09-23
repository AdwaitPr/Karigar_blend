/**
 * Prototype routes.
 *
 * The landing page is a single document, so objects open as hash routes.
 * These helpers are named and shaped for the eventual App Router paths:
 *
 *   #object/banarasi-silk-stole  →  /object/[id]
 *   #craft-kutch                 →  /craft/[id]
 *   #maker                       →  /maker/[id]
 */

export const objectPath = (id: string) => `#object/${id}`;
export const craftPath = (id: string) => `#craft-${id}`;

export type HashRoute =
  | { type: "object"; id: string }
  | { type: "section"; id: string }
  | { type: "none" };

export function parseHash(hash: string): HashRoute {
  const value = hash.replace(/^#/, "").trim();
  if (!value) return { type: "none" };

  const nested = value.match(/^object\/([^/?#]+)/);
  if (nested) return { type: "object", id: decodeURIComponent(nested[1]) };

  const dashed = value.match(/^object-([^/?#]+)/);
  if (dashed) return { type: "object", id: decodeURIComponent(dashed[1]) };

  return { type: "section", id: value };
}
