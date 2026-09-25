# ADR 0003: Relational Persistence Model and Multi-Seller Order Decomposition

* **Status**: Accepted
* **Date**: 2025-03-30
* **Deciders**: Kārigar Engineering Architecture Board

## Context and Problem Statement

Kārigar is a multi-seller luxury craft marketplace. A single customer order can contain objects crafted by different artisans and sold by distinct seller entities. The platform requires relational integrity across users, customer profiles, products, variants, inventory, top-level customer orders, seller-level fulfillment groups (`SellerOrder`), financial line items, commissions, and delivery tracking.

We must define the database engine, monetary representation, and relational invariants to guarantee transactional safety and seller data isolation.

## Decision Drivers

1. **Relational Integrity**: Foreign key constraints are mandatory to guarantee that an order item references a valid variant, seller, and top-level order.
2. **ACID Financial Transactions**: Placing an order, capturing payment, creating $N$ seller orders, and locking inventory MUST succeed or fail as a atomic database transaction.
3. **Monetary Precision**: Fractional currency errors or rounding drift in price, commission, GST, and payouts are unacceptable in a luxury marketplace.
4. **Seller Isolation**: Database schema must support enforcing row-level query scoping (`WHERE seller_id = :sellerId`).

## Decision Outcome

**Chosen Engine**: **PostgreSQL** relational database.

### Monetary & Currency Standard

1. All monetary values (`price`, `subtotal`, `shippingFee`, `taxAmount`, `commissionAmount`, `netPayout`) MUST be stored as **BigInt / Integer values representing the smallest currency unit (paise in INR)**.
2. Example: $\text{₹38,700.00} \implies 3,870,000 \text{ paise}$.
3. Display formatting (`formatINR`) MUST remain a presentation-layer concern using `Intl.NumberFormat('en-IN')`.

### Multi-Seller Decomposition Invariants

1. **Top-Level Order (`orders`)**: Holds global transaction ID, customer ID, payment status, aggregate total, global shipping address, and global tax totals.
2. **Seller Orders (`seller_orders` / `fulfilment_groups`)**: Each unique `seller_id` present in a checkout bag generates exactly ONE child `seller_order` record linked to the top-level `order_id`.
3. **Order Items (`order_items`)**: Each line item belongs directly to a `seller_order_id` (and implicitly to the parent `order_id`).
4. **Invariant Equation**:
   $$\text{order.total\_amount} = \sum_{i=1}^{N} \text{seller\_orders}_i.\text{subtotal} + \text{order.shipping\_fee} + \text{order.tax\_amount}$$
5. **Payout Invariant**:
   $$\text{seller\_payout}_i = \text{seller\_orders}_i.\text{subtotal} - \text{seller\_orders}_i.\text{commission\_amount} - \text{tds\_tcs\_deductions}$$

### Inventory Decoupling Standard

* Static editorial product attributes (`name`, `description`, `story`, `images`) reside in `products` / `product_variants`.
* Mutable inventory (`stock_quantity`, `allocated_quantity`, `reserved_quantity`, `lead_time_days`) resides strictly in the `inventories` table keyed by `variant_id`.
* Static product tables MUST NOT contain mutable stock counters.

### Data Isolation Rules

* All seller API queries for dashboard, orders, inventory, or analytics MUST append `seller_id = loggedInSellerId` at the database query layer.
* Sellers MUST NEVER receive line items or customer data associated with another seller's fulfillment group.
