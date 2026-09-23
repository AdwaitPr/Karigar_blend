import type { CSSProperties, ElementType, ReactNode } from "react";
import { clsx } from "clsx";
import { useInView } from "../../hooks/useInView";

/** Inline style for staggered transitions (consumed as --delay in CSS). */
export const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

type Direction = "right" | "up" | "down" | "up-right";
const ROTATION: Record<Direction, number> = { right: 0, down: 90, up: -90, "up-right": -45 };

/** Hairline arrow. Travels in the direction it points on hover (see .arrow-shift). */
export function Arrow({ className, direction = "right" }: { className?: string; direction?: Direction }) {
  const rotation = ROTATION[direction];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 22 10"
      width="22"
      height="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={clsx("inline-block shrink-0 overflow-visible", className)}
      style={rotation ? { rotate: `${rotation}deg` } : undefined}
    >
      <path d="M0 5h20.5" />
      <path d="M16.2.8 20.6 5l-4.4 4.2" />
    </svg>
  );
}

/** Section eyebrow — "01 —— A LIVING TRADITION" */
export function Eyebrow({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx("caps flex items-center gap-3", className)}>
      {index ? (
        <>
          <span className="tabular-nums">{index}</span>
          <span aria-hidden="true" className="h-px w-8 bg-current opacity-35" />
        </>
      ) : null}
      <span>{children}</span>
    </p>
  );
}

/** The site's only call-to-action style: a text link with a travelling arrow. */
export function ArrowLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a href={href} onClick={onClick} className={clsx("group inline-flex items-center gap-3 caps", className)}>
      <span className="link-line">{children}</span>
      <Arrow className="arrow-shift" />
    </a>
  );
}

/**
 * Editorial headline with authored line breaks. Each line rises out of a mask
 * when the headline enters the viewport.
 */
export function SplitLines({
  lines,
  className,
  delay: start = 0,
  stagger = 90,
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className={clsx("lines block", inView && "is-visible", className)}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <span className="line-inner" style={delay(start + i * stagger)}>
            {line}
          </span>
          {i < lines.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** Level-3 motion: opacity 0 → 1, translateY 20px → 0, once. */
export function Reveal({ as = "div", children, className, delay: wait = 0 }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>();
  const Component = as as ElementType;
  return (
    <Component ref={ref} className={clsx("reveal", inView && "is-visible", className)} style={delay(wait)}>
      {children}
    </Component>
  );
}
