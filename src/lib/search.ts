/**
 * Client search over the demo catalogue.
 *
 * This is the *shape* of the index the production pipeline should emit:
 *   CMS / DB → catalogue index → search engine → facets → ranking → results
 *
 * It is not the engine. Facets here are derived in memory from six objects.
 */

import { artisanById, artisans, craftById, crafts, featuredArtisanId, journal, products, regionById } from "../data/catalog";
import { formatINR } from "./media";
import { craftPath, objectPath } from "./routes";

export type SearchHit = {
  key: string;
  label: string;
  meta: string;
  href: string;
};

export type SearchGroup = {
  id: "objects" | "crafts" | "makers" | "journal";
  title: string;
  items: SearchHit[];
};

export type FacetBucket = { value: string; count: number };

export type SearchFacets = {
  category: FacetBucket[];
  region: FacetBucket[];
  availability: FacetBucket[];
};

export type SearchIndex = {
  query: string;
  groups: SearchGroup[];
  facets: SearchFacets;
  total: number;
};

const AVAILABILITY_LABEL: Record<string, string> = {
  ready: "Ready to ship",
  "made-to-order": "Made to order",
  "one-of-one": "One of one",
};

function buckets(values: string[]): FacetBucket[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function matches(query: string, ...fields: string[]) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = fields.join(" ").toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function searchCatalogue(query: string): SearchIndex | null {
  const q = query.trim();
  if (!q) return null;

  const objects: SearchHit[] = products
    .filter((p) => {
      const craft = craftById(p.craftId);
      const region = regionById(p.regionId);
      const artisan = artisanById(p.artisanId);
      return matches(
        q,
        p.name,
        p.material,
        p.description,
        craft.name,
        craft.medium,
        craft.category,
        region.place,
        region.state,
        artisan.name,
        AVAILABILITY_LABEL[p.availability.status]
      );
    })
    .map((p) => ({
      key: p.id,
      label: p.name,
      meta: formatINR(p.price),
      href: objectPath(p.id),
    }));

  const craftHits: SearchHit[] = crafts
    .filter((c) => matches(q, c.name, c.place, c.medium, c.material, c.category, regionById(c.regionId).state))
    .map((c) => ({
      key: c.id,
      label: c.place,
      meta: `${c.medium} / ${regionById(c.regionId).state}`,
      href: craftPath(c.id),
    }));

  const makerHits: SearchHit[] = artisans
    .filter((a) => matches(q, a.name, a.village, a.practice, craftById(a.craftId).name))
    .map((a) => ({
      key: a.id,
      label: a.name,
      meta: a.village,
      href: a.id === featuredArtisanId ? "#maker" : craftPath(a.craftId),
    }));

  const journalHits: SearchHit[] = journal
    .filter((j) => matches(q, j.title, j.excerpt, j.kind))
    .map((j) => ({
      key: j.id,
      label: j.title,
      meta: `${j.kind} · ${j.minutes} min`,
      href: "#journal",
    }));

  const matchedProducts = products.filter((p) => objects.some((hit) => hit.key === p.id));

  const groups = (
    [
      { id: "objects", title: "Objects", items: objects },
      { id: "crafts", title: "Crafts", items: craftHits },
      { id: "makers", title: "Makers", items: makerHits },
      { id: "journal", title: "Journal", items: journalHits },
    ] satisfies SearchGroup[]
  ).filter((group) => group.items.length > 0);

  return {
    query: q,
    groups,
    total: groups.reduce((n, group) => n + group.items.length, 0),
    facets: {
      category: buckets(matchedProducts.map((p) => craftById(p.craftId).category)),
      region: buckets(matchedProducts.map((p) => regionById(p.regionId).place)),
      availability: buckets(matchedProducts.map((p) => AVAILABILITY_LABEL[p.availability.status])),
    },
  };
}
