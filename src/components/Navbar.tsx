import { useEffect, useState } from "react";
import { useBag } from "../context/BagContext";
import { primaryNav } from "../data/catalog";

type NavTheme = "hero" | "light" | "bone" | "dark";

type NavbarProps = {
  onSearch: () => void;
  onMenu: () => void;
};

/**
 * Almost invisible over the hero; settles into a solid surface once the
 * reader turns the page. The centre carries a running head — like a magazine —
 * that follows the section beneath it. Sections declare their surface with
 * data-nav-theme and their running head with data-running-head.
 */
export function Navbar({ onSearch, onMenu }: NavbarProps) {
  const { count, open } = useBag();
  const [theme, setTheme] = useState<NavTheme>("hero");
  const [runningHead, setRunningHead] = useState("India, made by hand");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]"));
    let frame = 0;

    const probe = () => {
      frame = 0;
      const line = 36;
      let current: HTMLElement | undefined;
      // Later sections overlay earlier ones (the hero is sticky), so the last match wins.
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) current = section;
      }
      if (!current) return;
      setTheme((current.dataset.navTheme as NavTheme) ?? "light");
      if (current.dataset.runningHead) setRunningHead(current.dataset.runningHead);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };

    probe();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="nav fixed inset-x-0 top-0 z-50" data-theme={theme}>
      <div aria-hidden="true" className="nav-bg absolute inset-0" />

      <nav
        aria-label="Primary"
        className="nav-row relative grid h-14 grid-cols-[1fr_auto] items-center gap-6 px-gutter md:h-16 lg:grid-cols-[1fr_auto_1fr]"
      >
        <a
          href="#top"
          aria-label="Kārigar — return to the beginning"
          className="justify-self-start font-display text-[1.2rem] leading-none tracking-[0.22em] md:text-[1.35rem]"
        >
          KĀRIGAR
        </a>

        <p aria-hidden="true" className="caps hidden text-center opacity-70 lg:block">
          <span key={runningHead} className="running-head">
            {runningHead}
          </span>
        </p>

        <div className="flex items-center justify-end gap-5 md:gap-7">
          <ul className="hidden items-center gap-7 lg:flex">
            {primaryNav.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="caps link-line">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <span aria-hidden="true" className="hidden h-3 w-px bg-current opacity-30 lg:block" />

          <button
            type="button"
            onClick={onSearch}
            className="caps flex min-h-[44px] items-center px-1"
            aria-label="Search"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              className="lg:hidden"
            >
              <circle cx="7" cy="7" r="5.25" />
              <path d="m11 11 4 4" />
            </svg>
            <span className="link-line hidden lg:inline">Search</span>
          </button>

          <button
            type="button"
            onClick={open}
            className="caps flex min-h-[44px] items-center gap-1.5 px-1"
            aria-label={`Bag, ${count} ${count === 1 ? "item" : "items"}`}
          >
            <span className="link-line">Bag</span>
            <span key={count} className="count-bump tabular-nums">
              ({count})
            </span>
            {count > 0 ? <span aria-hidden="true" className="ml-0.5 h-1.5 w-1.5 rounded-full bg-madder" /> : null}
          </button>

          <button
            type="button"
            onClick={onMenu}
            className="caps flex min-h-[44px] items-center px-1 lg:hidden"
            aria-haspopup="dialog"
          >
            Menu
          </button>
        </div>
      </nav>

      <div aria-hidden="true" className="nav-rule absolute inset-x-0 bottom-0 h-px bg-current" />
    </header>
  );
}
