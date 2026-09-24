# Kārigar Marketplace Contract & Multi-Seller Architecture

*This contract defines the multi-seller order architecture, seller isolation boundaries, inventory ownership, commission models, and operational lifecycle for the **Kārigar** marketplace. Future Jules agents implementing backend services, database schemas, or API endpoints MUST strictly abide by these rules.*

---

## 1. Multi-Seller Order Architecture

### 1.1 Core Mandate
A single customer order placed on Kārigar may contain craft objects originating from multiple independent artisans or craft cooperatives (sellers).

**The platform MUST NOT assume a 1:1 relationship between a customer order and a seller.**

### 1.2 Entity Splitting Model

```text
                     CUSTOMER ORDER (Order #K-90210)
                 Total Amount: ₹38,700 | Status: Paid
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
FULFILMENT GROUP / SELLER ORDER A                 FULFILMENT GROUP / SELLER ORDER B
Seller: Abdul Rahim Ansari (Banaras)              Seller: Hansaben Ahir (Kutch)
Subtotal: ₹26,900 | Status: In Crafting           Subtotal: ₹11,800 | Status: Shipped
           │                                                 │
           ▼                                                 ▼
1x Banarasi Silk Stole (Made-to-Order)             1x Kutch Mirrorwork Panel (One-of-One)
```

1. **Top-Level Customer Order (`Order`)**:
   - Represents the monetary transaction between Customer and Kārigar Marketplace.
   - Holds aggregate subtotal, taxes, shipping, payment status, and customer shipping address.
2. **Seller Order / Fulfilment Group (`SellerOrder`)**:
   - Represents the fulfillment contract between Kārigar and an individual `Seller`.
   - Generated automatically upon successful payment authorization.
   - Each `SellerOrder` operates on an independent lifecycle (e.g., Seller A's item can be shipped while Seller B's item is in crafting).

### 1.3 Mathematical & Financial Invariants
For any top-level `Order` split into $N$ `SellerOrder` records:

$$\text{Order.totalAmount} = \sum_{i=1}^{N} \text{SellerOrder}_i.\text{subtotal} + \text{Order.totalShippingFee} + \text{Order.totalTaxes}$$

Each `SellerOrder` computes seller payout as:

$$\text{SellerPayout}_i = \text{SellerOrder}_i.\text{subtotal} - \text{CommissionAmount}_i - \text{ApplicableTDS/TCS}$$

---

## 2. Seller Concerns & Operations

### 2.1 Seller Onboarding & Verification
- **Seller Identity**: Every seller record (`Seller`) MUST undergo verification (`verificationStatus: "verified"`) before any of their products appear as `"verified"` in the marketplace.
- **Required Credentials**:
  - `legalName` & `tradeName`
  - `PAN` (Permanent Account Number)
  - `GSTIN` (GST Identification Number, or formal handloom exemption declaration where applicable)
  - Bank Account verification (IFSC code, Account Number, holder match)
  - Physical workshop / craft cluster audit record

### 2.2 Product & Inventory Ownership
- **Ownership**: Each `Product` and `ProductVariant` is owned by exactly one `Seller` (`sellerId`).
- **Inventory Mutability**:
  - Sellers manage their own `Inventory` records (`stockQuantity`, `leadTimeDays`, `isAvailable`).
  - Sellers CANNOT edit another seller's products or inventory.
  - Updating mutable inventory MUST NOT alter static editorial `Product` metadata.

### 2.3 Data Isolation & Order Visibility Boundaries
- **Strict Seller Scope**: When a seller logs into their dashboard or queries APIs, they MUST ONLY receive `SellerOrder` records where `SellerOrder.sellerId === loggedInSeller.id`.
- **Privacy Protection**:
  - Sellers receive the delivery address and recipient contact ONLY for their specific packages.
  - Sellers MUST NOT see items from other sellers present in the customer's top-level order.
  - Sellers MUST NOT see customer payment details or credit card tokens.

### 2.4 Fulfilment Workflow & SLAs

```text
Order Placed ──> Pending Acceptance ──> Accepted ──> [Crafting / Packing] ──> Dispatch ──> Delivered
                     │
                     └── (Timeout > 48h) ──> Auto-Escalated / Cancelled
```

1. **Acceptance SLA**: Sellers MUST accept a new `SellerOrder` within 48 hours.
2. **Fulfillment Modes**:
   - **`ready`**: Item MUST be packed and marked `ready_for_pickup` within 3 business days.
   - **`made-to-order`**: Item enters `in_crafting` status. Seller provides regular progress updates if crafting exceeds 14 days.
   - **`one-of-one`**: Unique piece allocated immediately upon payment; double-selling is strictly prevented by database locks.

### 2.5 Commissions & Financial Settlements
- **Commission Rate**: Configured per seller (`commissionRatePercentage`, e.g. 15%).
- **Escrow Mechanics**:
  - Customer funds held in escrow until fulfillment and inspection complete.
  - Payout released $X$ days post-delivery confirmation (e.g. 7-day inspection window).
- **Made-to-Order Advance**: For long crafting periods (> 30 days), platform may support a phased advance payout contract upon verified craft milestone completion.

### 2.6 Returns & Refunds
- **Return Initiation**: Customers may initiate returns per line item / `SellerOrder`.
- **Fault Allocation**:
  - **Defect / Misrepresentation / Damaged in Transit**: Return shipping charged to Seller; full customer refund issued.
  - **Buyer Remorse (where applicable under policy)**: Subject to return eligibility rules (note: custom `made-to-order` items and `one-of-one` artworks are strictly non-returnable unless defective).

---

## 3. Non-Negotiable Architecture Invariants

Future Jules agents working on this codebase MUST NOT violate these rules:

1. **Multi-Seller Order Rule**: Never assume 1 Order = 1 Seller. Always query or mutate order items via `SellerOrder` / `FulfilmentGroup` boundaries.
2. **Inventory Decoupling Rule**: Static product records (`Product`) MUST NEVER store mutable stock counters directly. Stock counts belong strictly in `Inventory`.
3. **Data Boundary Isolation**: Never expose other sellers' items or sales metrics to a seller context.
4. **Content Provenance Integrity**: Never set `source: "verified"` on unverified or stock placeholder records.
5. **Editorial Identity & Terminology**: Never rename domain concepts (`Kārigar`, `Object`, `Bag`, `Atlas`, `Provenance`) to generic e-commerce terms (`SKU`, `Cart`, `Item`, `Vendor`).
6. **No Fake Urgency Tropes**: Never introduce countdown timers, popups, or fake scarcity badges (governed by section 7 of `AGENTS.md`).

---

## 4. Unresolved Architectural Decisions

The following decisions are explicitly deferred for future implementation agents and MUST NOT be blindly defaulted:

1. **GST Calculation Engine Across State Boundaries**:
   - *Issue*: Determining IGST (inter-state) vs CGST/SGST (intra-state) requires comparing Seller dispatch state vs Customer shipping state at checkout.
   - *Status*: Defer selection of tax engine (e.g., Avalara, Cleartax, or custom GST module) until backend API implementation.
2. **Real-time Inventory Lock Strategy**:
   - *Issue*: Preventing overselling during checkout spikes for `one-of-one` items.
   - *Status*: Choice between Redis TTL reservation locks vs PostgreSQL row-level locks (`SELECT FOR UPDATE`) is deferred to database tier implementation.
3. **Long Lead-Time Escrow & Payout Tranches**:
   - *Issue*: Whether `made-to-order` items with 60-day loom times receive partial material advances or 100% post-delivery payout.
   - *Status*: Financial policy deferred to marketplace legal and ops review.
4. **Logistics & Carrier Partner Selection**:
   - *Issue*: API integration for automated shipping label generation and courier dispatch.
   - *Status*: Carrier aggregator choice (e.g. Shiprocket, Delhivery, Bluedart) deferred until fulfillment module build.
5. **Payment Gateway Provider**:
   - *Issue*: Gateway selection supporting INR netbanking, UPI, international cards, and split settlements.
   - *Status*: Choice of Razorpay / Cashfree / Stripe India deferred until payments integration wave.
