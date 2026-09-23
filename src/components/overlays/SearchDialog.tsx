import { useMemo, useRef, useState } from "react";
import { crafts, regionById } from "../../data/catalog";
import { searchCatalogue } from "../../lib/search";
import { Sheet } from "../ui/Sheet";

const SUGGESTIONS = ["Banarasi silk", "Kutch", "Pashmina", "Channapatna", "Madhubani", "Kalamkari"];

const FACET_LABELS = {
  category: "Craft",
  region: "Region",
  availability: "Availability",
} as const;

/**
 * UI for the catalogue index. The ranking, facets and results here are the
 * contract a real search engine (Meilisearch, Postgres, Algolia) should honour.
 */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(() => searchCatalogue(query), [query]);

  return (
    <Sheet open={open} onClose={onClose} label="Search Kārigar" placement="top" initialFocus={inputRef}>
      <div className="px-gutter pb-12 pt-3 md:pb-16 md:pt-4">
        <div className="flex h-10 items-center justify-between">
          <p className="caps text-muted">Search</p>
          <button type="button" onClick={onClose} className="caps link-line">
            Close
          </button>
        </div>

        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="mt-8 border-b border-ink/25 transition-colors duration-500 focus-within:border-ink md:mt-12"
        >
          <label htmlFor="site-search" className="sr-only">
            Search crafts, makers and objects
          </label>
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Silk, Kutch, a maker’s name…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent pb-4 font-display text-display-md outline-none placeholder:text-ink/30"
          />
        </form>

        <div className="mt-10 md:mt-12">
          {index === null ? (
            <div className="grid grid-cols-12 gap-x-6 gap-y-10">
              <div className="col-span-12 md:col-span-7">
                <p className="caps text-muted">Often searched</p>
                <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                  {SUGGESTIONS.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="link-line font-display text-[1.6rem] leading-none"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-12 md:col-span-4 md:col-start-9">
                <p className="caps text-muted">By region</p>
                <ul className="mt-5 border-t border-ink/15">
                  {crafts.map((craft) => (
                    <li key={craft.id}>
                      <a
                        href={`#craft-${craft.id}`}
                        onClick={onClose}
                        className="group flex items-baseline justify-between gap-4 border-b border-ink/15 py-2.5"
                      >
                        <span className="link-line">{craft.place}</span>
                        <span className="meta text-muted">{regionById(craft.regionId).state}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : index.total === 0 ? (
            <p className="text-body-lg text-muted" role="status">
              Nothing yet for “{index.query}”. Try a place, a material or a maker’s name.
            </p>
          ) : (
            <div>
              <p className="sr-only" role="status">
                {index.total} results
              </p>

              <ul className="mb-10 flex flex-wrap gap-x-8 gap-y-2 border-b border-ink/15 pb-5">
                {(Object.keys(FACET_LABELS) as (keyof typeof FACET_LABELS)[]).map((key) => {
                  const buckets = index.facets[key];
                  if (buckets.length === 0) return null;
                  return (
                    <li key={key} className="meta text-muted">
                      <span className="caps mr-2 text-ink">{FACET_LABELS[key]}</span>
                      {buckets.map((bucket, i) => (
                        <button
                          key={bucket.value}
                          type="button"
                          onClick={() => setQuery(bucket.value)}
                          className="link-line"
                        >
                          {bucket.value}
                          <span className="tabular-nums"> ({bucket.count})</span>
                          {i < buckets.length - 1 ? <span className="mx-1.5 opacity-40">·</span> : null}
                        </button>
                      ))}
                    </li>
                  );
                })}
              </ul>

              <div className="grid grid-cols-12 gap-x-6 gap-y-10">
                {index.groups.map((group) => (
                  <div key={group.id} className="col-span-12 md:col-span-6 lg:col-span-3">
                    <p className="caps text-muted">
                      {group.title} <span className="tabular-nums">({group.items.length})</span>
                    </p>
                    <ul className="mt-4 border-t border-ink/15">
                      {group.items.slice(0, 5).map((item) => (
                        <li key={item.key}>
                          <a
                            href={item.href}
                            onClick={onClose}
                            className="group flex items-baseline justify-between gap-4 border-b border-ink/15 py-3"
                          >
                            <span className="font-display text-[1.25rem] leading-tight">
                              <span className="link-line">{item.label}</span>
                            </span>
                            <span className="meta shrink-0 text-muted">{item.meta}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
