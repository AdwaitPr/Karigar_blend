import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { clsx } from "clsx";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  placement: "right" | "top" | "full";
  children: ReactNode;
  className?: string;
  initialFocus?: RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog primitive — modal semantics, focus trap, Escape to close,
 * scroll lock and focus restoration. It stays mounted (inert while closed)
 * so it can animate out as gracefully as it arrives.
 */
export function Sheet({ open, onClose, label, placement, children, className, initialFocus }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const target =
        initialFocus?.current ??
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
        panelRef.current;
      target?.focus({ preventScroll: true });
    }, 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, initialFocus]);

  return (
    <div
      className={clsx("sheet fixed inset-0 z-[80]", `sheet--${placement}`)}
      data-open={open ? "true" : "false"}
      inert={!open}
    >
      <div
        aria-hidden="true"
        className="sheet-backdrop absolute inset-0 bg-ink/45"
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={clsx("sheet-panel absolute bg-paper text-ink outline-none", className)}
      >
        {children}
      </div>
    </div>
  );
}
