# Kārigar Production Persistence Architecture

*This document specifies the database technology, relational schema design, monetary standards, repository abstraction boundary, and seed/migration procedures for the **Kārigar** marketplace persistence layer.*

---

## 1. Database Technology & ORM Choice

* **Database Engine**: PostgreSQL 16
* **ORM & Migration Tool**: Prisma ORM (`@prisma/client` and `prisma`)
* **Type System**: Fully typed TypeScript client with `BigInt` monetary support and native JSON/UUID column mapping.

---

## 2. Relational Schema Overview

The relational model directly implements the requirements in `docs/system-architecture.md` and `docs/domain-model.md`.

```text
  [users] ───────1:1───────> [customers] ──────1:N──────> [orders]
     │                           │                         │
     │ 1:1                       │ 1:N                     │ 1:N
     ▼                           ▼                         ▼
 [sellers] ──1:N──> [artisans]  [addresses]          [seller_orders]
     │                   │                                 │
     │ 1:N               │ 1:N                             │ 1:N
     ▼                   ▼                                 ▼
 [products] ──1:N──> [product_variants] ──1:1──> [inventories]  [order_items]
```

### Table Specifications & Tables Created

1. **`users`**: Core account identity (`id`, `email`, `phone`, `role`, `created_at`, `updated_at`).
2. **`customers`**: Customer profile (`id`, `user_id`, `full_name`, `default_shipping_address_id`, `created_at`).
3. **`addresses`**: Customer shipping/billing locations (`id`, `customer_id`, `recipient_name`, `address_line1`, `city`, `state`, `postal_code`, `country`, `phone`).
4. **`sellers`**: Legal merchant records (`id`, `user_id`, `legal_name`, `trade_name`, `gstin`, `pan`, `bank_details`, `verification_status`, `commission_rate_percentage`).
5. **`regions`**: Geographical origin coordinates (`id`, `place`, `state`, `lat`, `lng`).
6. **`crafts`**: Heritage craft disciplines (`id`, `source`, `place`, `name`, `medium`, `category`, `region_id`, `material`, `swatch`, `note`, `image`).
7. **`artisans`**: Master craftsperson profile (`id`, `source`, `number_label`, `name`, `pronoun`, `region_id`, `craft_id`, `village`, `practice`, `years_experience`, `since_year`, `quote`, `bio`, `portrait`, `plate_caption`, `seller_id`).
8. **`products`**: Editorial craft listing (`id`, `source`, `name`, `base_price_paise`, `craft_id`, `region_id`, `artisan_id`, `seller_id`, `material`, `technique`, `crafting_time`, `dimensions`, `description`, `story`, `images`, `detail`, `framed`, `availability_status`, `is_published`).
9. **`product_variants`**: Dimension/color variations (`id`, `product_id`, `sku`, `attributes`, `price_adjustment_paise`).
10. **`inventories`**: Mutable stock counters (`id`, `variant_id`, `seller_id`, `stock_quantity`, `allocated_quantity`, `reserved_quantity`, `lead_time_days`, `is_available`, `updated_at`).
11. **`orders`**: Top-level customer purchase order (`id`, `order_number`, `customer_id`, `status`, `subtotal_paise`, `tax_paise`, `shipping_paise`, `total_paise`, `shipping_address`, `payment_intent_id`, `paid_at`, `cancelled_at`).
12. **`seller_orders`**: Individual seller fulfillment group (`id`, `order_id`, `seller_id`, `seller_order_number`, `status`, `subtotal_paise`, `commission_paise`, `tax_paise`, `seller_payout_paise`, `waybill_number`, `tracking_url`, `accepted_at`, `shipped_at`, `delivered_at`, `cancelled_at`, `refunded_at`).
13. **`order_items`**: Order line items (`id`, `seller_order_id`, `product_id`, `variant_id`, `quantity`, `unit_price_paise`, `line_subtotal_paise`, `product_name_snapshot`, `variant_attributes_snapshot`, `seller_name_snapshot`).
14. **`wishlists`**: Customer saved items (`id`, `customer_id`, `product_ids`, `updated_at`).
15. **`journal_entries`**: Editorial content (`id`, `source`, `index_label`, `kind`, `minutes`, `title`, `excerpt`, `image`, `published_at`).
16. **`collections`**: Curated product groupings (`id`, `title`, `description`, `product_ids`).
17. **`audit_logs`**: Financial and inventory mutation audit trail (`id`, `entity_type`, `entity_id`, `action`, `actor_id`, `changes`, `created_at`).

---

## 3. Monetary Representation Standard

All monetary amounts (`basePricePaise`, `subtotalPaise`, `taxPaise`, `shippingPaise`, `totalPaise`, `commissionPaise`, `sellerPayoutPaise`, `unitPricePaise`, `lineSubtotalPaise`) are stored as **BigInt integers representing Indian Paise ($\text{₹1.00} = 100 \text{ paise}$)**.

* **Formula**: $\text{paise} = \text{rupees} \times 100$
* **Rule**: Floating-point values are strictly forbidden for currency fields in both schema and domain code.

---

## 4. Multi-Seller Order Decomposition & Snapshotting

When a customer checks out a bag containing items from multiple artisans:

1. One top-level `Order` record is created (e.g. `K-90210`).
2. Items are grouped by `sellerId`.
3. For each unique seller, a child `SellerOrder` is created (e.g. `K-90210-A`, `K-90210-B`) containing seller-specific subtotals, commissions, payouts, and fulfillment status.
4. Each `OrderItem` captures historical snapshots:
   - `productNameSnapshot`
   - `variantAttributesSnapshot`
   - `sellerNameSnapshot`
   - `unitPricePaise`

This ensures historical order receipts remain immutable even if product listings or seller profiles are edited in the future.

---

## 5. Decoupled Inventory Architecture

Static product metadata (`products` table) contains zero stock counters. Mutable stock counts reside exclusively in `inventories`:

* `stockQuantity`: On-hand physical units.
* `allocatedQuantity`: Locked in paid active orders.
* `reservedQuantity`: Locked in active checkout sessions.
* `leadTimeDays`: Production SLA for `made-to-order` items.

---

## 6. Repository Abstraction Boundary

Domain services communicate with the persistence layer through clean TypeScript interfaces in `src/repositories/interfaces/`:

* `ICatalogueRepository` $\implies$ `PrismaCatalogueRepository`
* `IInventoryRepository` $\implies$ `PrismaInventoryRepository`
* `IOrderRepository` $\implies$ `PrismaOrderRepository`
* `ISellerRepository` $\implies$ `PrismaSellerRepository`

Domain services do not depend on Prisma-specific types.

---

## 7. Protective Abstractions for Deferred Decisions

The persistence layer preserves the protective interfaces for deferred business decisions defined in `src/domain/interfaces/`:

* `ITaxCalculator`: Inter-state (IGST) vs Intra-state (CGST/SGST) tax logic interface.
* `IInventoryLockProvider`: Reservation lock abstraction for concurrent checkouts.
* `IEscrowStrategy`: Multi-tranche payout schedule calculation interface.
* `ILogisticsAdapter`: Carrier integration interface for shipping label generation.
* `IPaymentGatewayAdapter`: Payment gateway intent creation and webhook verification interface.

---

## 8. Development & Migration Commands

```bash
# Spin up local PostgreSQL container
docker compose up -d

# Generate Prisma Client
npx prisma generate

# Apply versioned database migrations
npx prisma migrate dev

# Run deterministic database seed
npx prisma db seed

# Execute persistence layer unit & integration tests
npx vitest run

# Execute TypeScript typecheck
npm run typecheck
```
