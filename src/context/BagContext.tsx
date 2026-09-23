import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products } from "../data/catalog";
import type { Product } from "../types/catalog";

type BagLine = { id: string; qty: number };
export type BagItem = BagLine & { product: Product };

type BagValue = {
  items: BagItem[];
  count: number;
  subtotal: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  has: (id: string) => boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const BagContext = createContext<BagValue | null>(null);
const STORAGE_KEY = "karigar.bag.v1";
const MAX_QTY = 9;

function readStored(): BagLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return (parsed as BagLine[]).filter((line) => products.some((p) => p.id === line.id));
  } catch {
    return [];
  }
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BagLine[]>(readStored);
  const [isOpen, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — the bag still works for this visit */
    }
  }, [lines]);

  const add = useCallback((id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const unique = product.availability.status === "one-of-one";
    setLines((prev) => {
      const existing = prev.find((line) => line.id === id);
      if (existing) {
        return prev.map((line) =>
          line.id === id ? { ...line, qty: unique ? 1 : Math.min(line.qty + 1, MAX_QTY) } : line
        );
      }
      return [...prev, { id, qty: 1 }];
    });
    setAnnouncement(`${product.name} added to your bag.`);
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
    const product = products.find((p) => p.id === id);
    if (product) setAnnouncement(`${product.name} removed from your bag.`);
  }, []);

  const setQty = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        remove(id);
        return;
      }
      setLines((prev) =>
        prev.map((line) => (line.id === id ? { ...line, qty: Math.min(qty, MAX_QTY) } : line))
      );
    },
    [remove]
  );

  const items = useMemo(
    () =>
      lines
        .map((line) => ({ ...line, product: products.find((p) => p.id === line.id) }))
        .filter((line): line is BagItem => Boolean(line.product)),
    [lines]
  );

  const count = items.reduce((n, line) => n + line.qty, 0);
  const subtotal = items.reduce((n, line) => n + line.qty * line.product.price, 0);
  const has = useCallback((id: string) => lines.some((line) => line.id === id), [lines]);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ items, count, subtotal, add, remove, setQty, has, isOpen, open, close }),
    [items, count, subtotal, add, remove, setQty, has, isOpen, open, close]
  );

  return (
    <BagContext.Provider value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </BagContext.Provider>
  );
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside <BagProvider>");
  return ctx;
}
