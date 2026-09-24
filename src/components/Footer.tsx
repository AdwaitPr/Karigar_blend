import { useState, type FormEvent } from "react";
import { footerNav } from "../data/catalog";
import { Arrow } from "./ui/Primitives";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (email.trim()) setSubscribed(true);
  };

  return (
    <footer
      data-nav-theme="dark"
      data-running-head="Colophon"
      className="bg-ink px-gutter pb-8 pt-20 text-paper md:pt-28"
    >
      <div className="grid grid-cols-12 gap-x-4 gap-y-16 md:gap-x-6">
        <div className="col-span-12 lg:col-span-5">
          <p className="caps text-paper/55">Letters from the workshop</p>
          <p className="mt-5 max-w-[24ch] font-display text-display-sm">
            Once a month. New makers, new objects, and the stories behind them.
          </p>
          {subscribed ? (
            <p className="mt-8 max-w-md text-paper/80" role="status">
              Thank you. The next letter arrives on the first of the month.
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-8 flex max-w-md items-end gap-4 border-b border-paper/30 transition-colors duration-500 focus-within:border-paper"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 outline-none placeholder:text-paper/60"
              />
              <button type="submit" className="group caps flex min-h-[44px] shrink-0 items-center gap-3 py-3">
                <span className="link-line">Subscribe</span>
                <Arrow className="arrow-shift" />
              </button>
            </form>
          )}
        </div>

        <nav
          aria-label="Footer"
          className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:col-span-6 lg:col-start-7"
        >
          {footerNav.map((column) => (
            <div key={column.title}>
              <p className="caps text-paper/50">{column.title}</p>
              <ul className="mt-5 space-y-2.5">
                {column.links.map((link) => {
                  const external = link.href.startsWith("http");
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="link-line text-[0.9375rem] text-paper/85 transition-colors hover:text-paper"
                        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-24 grid grid-cols-12 items-end gap-x-4 gap-y-6 border-t border-paper/15 pt-8 md:mt-32 md:gap-x-6">
        <p
          aria-hidden="true"
          className="col-span-12 font-display text-[clamp(4rem,14vw,13.5rem)] leading-[0.82] tracking-[-0.01em] lg:col-span-8"
        >
          Kārigar
        </p>
        <div className="col-span-12 lg:col-span-4 lg:pb-3">
          <p lang="hi" className="font-deva text-[1.6rem] leading-none text-paper/85">
            कारीगर
          </p>
          <p className="mt-3 max-w-[34ch] text-[0.875rem] leading-relaxed text-paper/60">
            <em className="font-display text-[1.05rem] text-paper/80">n.</em> one who makes by hand; an artisan, a
            master of a craft.
          </p>
        </div>
      </div>

      <div className="caps mt-12 flex flex-col gap-3 text-paper/50 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Kārigar</p>
        <p>Made in India</p>
        <a href="#top" className="group inline-flex items-center gap-3 text-paper/70">
          <span className="link-line">Back to top</span>
          <Arrow direction="up" className="arrow-shift" />
        </a>
      </div>
    </footer>
  );
}
