import type { CSSProperties } from "react";
import { footerNav, primaryNav } from "../../data/catalog";
import { pad } from "../../lib/media";
import { Sheet } from "../ui/Sheet";

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function MobileMenu({
  open,
  onClose,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
}) {
  const about = footerNav.find((column) => column.title === "About")?.links ?? [];
  const social = footerNav.find((column) => column.title === "Social")?.links ?? [];

  return (
    <Sheet open={open} onClose={onClose} label="Menu" placement="full">
      <div className="flex min-h-full flex-col px-gutter pb-8">
        <div className="flex h-14 shrink-0 items-center justify-between">
          <span className="font-display text-[1.2rem] leading-none tracking-[0.22em]">KĀRIGAR</span>
          <button
            type="button"
            onClick={onClose}
            className="caps link-line inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
          >
            Close
          </button>
        </div>

        <nav aria-label="Menu" className="mt-10">
          <ol className="border-t border-ink/15">
            {primaryNav.map((link, i) => (
              <li key={link.label} className="menu-item border-b border-ink/15" style={stagger(i)}>
                <a href={link.href} onClick={onClose} className="flex items-baseline justify-between py-5">
                  <span className="font-display text-[2.75rem] leading-none">{link.label}</span>
                  <span className="caps tabular-nums text-muted">{pad(i + 1)}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <button
          type="button"
          onClick={onSearch}
          className="menu-item caps mt-8 flex items-center gap-3 self-start py-2"
          style={stagger(primaryNav.length)}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.1">
            <circle cx="7" cy="7" r="5.25" />
            <path d="m11 11 4 4" />
          </svg>
          <span className="link-line">Search crafts, makers, objects</span>
        </button>

        <div className="menu-item mt-12 grid grid-cols-2 gap-6" style={stagger(primaryNav.length + 1)}>
          <ul className="space-y-2.5">
            {about.map((link) => (
              <li key={link.label}>
                <a href={link.href} onClick={onClose} className="link-line text-[0.9375rem]">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <ul className="space-y-2.5">
            {social.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer" className="link-line text-[0.9375rem]">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="caps mt-auto flex items-center gap-3 pt-12 text-muted">
          India, made by hand
          <span lang="hi" className="font-deva text-[1rem] normal-case tracking-normal">
            कारीगर
          </span>
        </p>
      </div>
    </Sheet>
  );
}
