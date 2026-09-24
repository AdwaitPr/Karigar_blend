import { useBag } from "../../context/BagContext";
import { artisanById, craftById, regionById } from "../../data/catalog";
import { formatINR } from "../../lib/media";
import { Sheet } from "../ui/Sheet";
import { EditorialImage } from "../ui/EditorialImage";
import { Arrow } from "../ui/Primitives";

export function BagDrawer() {
  const { isOpen, close, items, count, subtotal, setQty, remove } = useBag();

  return (
    <Sheet open={isOpen} onClose={close} label="Your bag" placement="right">
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink/15 px-6">
          <p className="caps">
            Bag <span className="tabular-nums text-muted">({count})</span>
          </p>
          <button
            type="button"
            onClick={close}
            className="caps link-line inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-6 pb-16">
            <p className="font-display text-display-sm">Your bag is empty.</p>
            <p className="mt-3 max-w-[32ch] text-muted">Objects made slowly are worth waiting for.</p>
            <a href="#objects" onClick={close} className="group caps mt-8 inline-flex items-center gap-3">
              <span className="link-line">Objects worth keeping</span>
              <Arrow className="arrow-shift" />
            </a>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
              {items.map(({ product, qty }) => {
                const craft = craftById(product.craftId);
                const region = regionById(product.regionId);
                const artisan = artisanById(product.artisanId);
                const unique = product.availability.status === "one-of-one";
                return (
                  <li key={product.id} className="grid grid-cols-[5.25rem_1fr] gap-4 py-5">
                    <div className="aspect-[4/5] overflow-hidden bg-bone">
                      <EditorialImage image={product.images[0]} sizes="84px" />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-[1.2rem] leading-tight">{product.name}</p>
                        <p className="shrink-0 text-[0.875rem] tabular-nums">{formatINR(product.price * qty)}</p>
                      </div>
                      <p className="caps mt-1.5 text-muted">
                        {craft.medium} / {region.place}
                      </p>
                      <p className="mt-1 text-[0.8125rem] text-muted">By {artisan.name}</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        {unique ? (
                          <p className="meta text-muted">One of one</p>
                        ) : (
                          <div className="flex items-center" role="group" aria-label={`Quantity for ${product.name}`}>
                            <button
                              type="button"
                              onClick={() => setQty(product.id, qty - 1)}
                              className="flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:border-ink"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-9 text-center text-[0.875rem] tabular-nums">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(product.id, qty + 1)}
                              className="flex h-11 w-11 items-center justify-center border border-ink/20 transition-colors hover:border-ink"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          className="caps link-line inline-flex min-h-[44px] items-center text-muted"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="shrink-0 border-t border-ink/15 px-6 pb-6 pt-5">
              <div className="flex items-baseline justify-between">
                <p className="caps">Subtotal</p>
                <p className="font-display text-[1.7rem] leading-none tabular-nums">{formatINR(subtotal)}</p>
              </div>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
                Orders are placed with the house, then settled with the maker. Shipping within India is
                complimentary.
              </p>
              <button
                type="button"
                className="group caps mt-6 flex w-full items-center justify-between bg-ink px-5 py-4 text-paper transition-colors duration-500 hover:bg-charcoal"
              >
                <span>Checkout</span>
                <Arrow className="arrow-shift" />
              </button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
