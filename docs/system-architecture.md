# Kārigar Production System Architecture Specification

*This document establishes the binding system architecture, layer boundaries, API contracts, domain model, persistence design, security specifications, and operational lifecycle for the **Kārigar** luxury Indian craft marketplace.*

---

## 1. System Overview & Architecture Diagram

Kārigar connects discerning buyers with India’s master craftspersons through an editorial-first luxury marketplace. The system architecture bridges a high-performance React presentation layer with a modular monolith backend, guaranteeing relational financial integrity, multi-seller fulfillment isolation, and provenance tracking.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           EDITORIAL FRONTEND LAYER                              │
│  React 19 + Vite 7 + Tailwind CSS v4 (SPA / CDN Edge Deployment)                 │
│  Components: EditorialImage, CraftAtlas, ProductSheet, BagDrawer, OmniSearch    │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ HTTPS / REST (JSON API)
                                       │ Bearer JWT / Session Cookies
┌──────────────────────────────────────▼──────────────────────────────────────────┐
│                         APPLICATION / API LAYER                                 │
│  Node.js / TypeScript Modular Monolith (Fastify / Express API Gateway)          │
│  Middlewares: Auth, Rate Limiter, Request Correlation, Input Validation         │
└──────────────────────────────────────┬──────────────────────────────────────────┘
                                       │ Direct Module Invocations
┌──────────────────────────────────────▼──────────────────────────────────────────┐
│                            DOMAIN SERVICES LAYER                                │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────────┐ │
│ │ Catalogue     │ │ Inventory     │ │ Order &       │ │ Seller &             │ │
│ │ Service       │ │ Service       │ │ Fulfilment    │ │ Settlement           │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └──────────────────────┘ │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────────┐ │
│ │ Search        │ │ Identity &    │ │ Editorial /   │ │ Customer             │ │
│ │ Service       │ │ Access (RBAC) │ │ Provenance    │ │ Profile              │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └──────────────────────┘ │
└──────┬──────────────────────┬───────────────────────┬───────────────────────────┘
       │                      │                       │
┌──────▼──────────────┐ ┌─────▼───────────────┐ ┌─────▼───────────────────────────┐
│ PERSISTENCE LAYER   │ │ SEARCH INDEX        │ │ ASYNCHRONOUS JOB QUEUE          │
│ PostgreSQL Database │ │ Meilisearch / FTS   │ │ Redis + BullMQ                  │
│ Relational ACID     │ │ Denormalized Index  │ │ Webhooks, Indexing, Email, Sync │
└─────────────────────┘ └─────────────────────┘ └─────────────────────────────────┘
                                                      │ External Integrations
                                                ┌─────▼───────────────────────────┐
                                                │ EXTERNAL PROVIDERS              │
                                                │ Payment Gateway, Logistics API, │
                                                │ Object Storage & Image CDN      │
                                                └─────────────────────────────────┘
```

---

## 2. Framework Evaluation & Frontend Architecture Decision

### 2.1 Framework Evaluation: Vite + React 19 vs. Next.js App Router
As established in **ADR 0001**, the current Vite 7 + React 19 architecture is intentionally retained as a decoupled Single-Page Application (SPA) communicating with the backend via HTTP/JSON.

* **Rationale for Retention**:
  1. **Scroll & Animation Performance**: The landing page features intricate scroll-linked motion (`useScrollProgress`), hero clip-path masks, and custom cursor tracking that depend on continuous client-side DOM measurements.
  2. **Server/Client Boundary Isolation**: Pure domain types (`src/types/catalog.ts`), utility formatters (`src/lib/media.ts`), and route parsers (`src/lib/routes.ts`) remain strictly side-effect free and client-agnostic.
  3. **Zero Migration Risk**: Deferring Next.js prevents destabilizing the interactive prototype while establishing a clean separation between presentation and backend domain services.
  4. **Future Edge Proxying**: For public product URL OpenGraph preview cards and SEO indexing, a lightweight Edge Proxy (e.g., Cloudflare Worker) can inject meta tags dynamically without rewriting the React application into SSR.

---

## 3. Architectural Layers Specification

The system is structured into seven distinct layers to maintain strict modularity and prevent domain leaks.

### Layer 1: Presentation Layer
* **Responsibility**: Render editorial UI, capture user interactions, manage bag drawer state, handle interactive hash/path overlays, display craft stories, and present search suggestions.
* **Depends On**: Application/API Layer (HTTP endpoints), Design System Primitives (`EditorialImage`), Client State (`BagContext`).
* **Must NOT Depend On**: Database drivers, SQL queries, payment gateway private keys, ORM models, file system paths.
* **Representative Modules**: `src/components/*`, `src/context/BagContext.tsx`, `src/lib/media.ts`, `src/lib/routes.ts`.
* **Data In**: JSON payloads from backend endpoints (`/api/v1/objects`, `/api/v1/search`).
* **Data Out**: User gestures, search query strings, checkout submission payloads (`/api/v1/checkout`).

### Layer 2: Application / API Layer
* **Responsibility**: HTTP routing, request parsing/validation, authentication middleware execution, rate limiting, request correlation assignment (`x-request-id`), response formatting, and error boundary handling.
* **Depends On**: Domain Services Layer, Identity/RBAC module.
* **Must NOT Depend On**: Direct SQL tables, external vendor SDK specifics (wrapped by adapters).
* **Representative Modules**: `api/routes/*`, `api/middlewares/auth.ts`, `api/middlewares/validate.ts`.
* **Data In**: HTTP requests (GET, POST, PUT, DELETE), Bearer JWTs, session cookies.
* **Data Out**: HTTP status codes, JSON responses, error structures (`{ code, message, details }`).

### Layer 3: Domain Services Layer
* **Responsibility**: Implement core business logic, multi-seller order splitting, commission calculations, provenance verification rules, inventory allocation state machines, and seller isolation constraints.
* **Depends On**: Persistence Layer interfaces, External Provider abstractions, Event Bus.
* **Must NOT Depend On**: Express/Fastify HTTP request/response objects, React components, browser DOM APIs.
* **Representative Modules**: `domain/catalogue/`, `domain/inventory/`, `domain/order/`, `domain/seller/`.
* **Data In**: Domain DTOs passed from API layer.
* **Data Out**: Mutated domain entities, domain events, result objects.

### Layer 4: Persistence Layer
* **Responsibility**: Maintain relational integrity, execute ACID transactions, enforce foreign key constraints, manage row-level query scopes, run migrations, and maintain audit logs.
* **Depends On**: Relational Database Engine (PostgreSQL), Database Driver / Query Builder (Kysely or Prisma).
* **Must NOT Depend On**: HTTP routes, presentation formatters, vendor APIs.
* **Representative Modules**: `db/migrations/`, `db/schema.ts`, `db/repositories/`.
* **Data In**: Query parameters, entity records.
* **Data Out**: Persisted rows, typed database records.

### Layer 5: External Integrations Layer
* **Responsibility**: Encapsulate third-party vendor communication (Payment Gateways, Shipping/Logistics APIs, Image Transformation CDNs, SMS/Email services) behind strict TypeScript interfaces.
* **Depends On**: External Vendor APIs, HTTP client libraries.
* **Must NOT Depend On**: Internal database schemas directly; vendor data must be mapped to internal DTOs.
* **Representative Modules**: `integrations/payments/`, `integrations/logistics/`, `integrations/media/`.
* **Data In**: Internal domain request DTOs.
* **Data Out**: Normalized provider response DTOs.

### Layer 6: Background / Asynchronous Processing Layer
* **Responsibility**: Execute non-blocking background tasks (webhook event consumption, search index reindexing, email sending, inventory reconciliation, shipment status polling).
* **Depends On**: Job Queue Engine (BullMQ + Redis), Domain Services.
* **Must NOT Depend On**: Synchronous HTTP response lifecycles.
* **Representative Modules**: `jobs/workers/indexWorker.ts`, `jobs/workers/webhookWorker.ts`.
* **Data In**: Serialized job messages (`{ name: "REINDEX_PRODUCT", productId: "..." }`).
* **Data Out**: Job completion status, retry logs.

### Layer 7: Observability Layer
* **Responsibility**: Capture structured JSON logs, record request correlation IDs, track errors, emit metrics, and maintain financial/inventory audit trails.
* **Depends On**: Logging frameworks (Pino / Winston), Error tracking (Sentry).
* **Must NOT Depend On**: Domain business rules.
* **Representative Modules**: `observability/logger.ts`, `observability/metrics.ts`.
* **Data In**: Log messages, error exceptions, request timing metrics.
* **Data Out**: Structured stdout JSON logs, alert metrics.

---

## 4. Frontend ↔ Backend API Boundary & Contracts

The application communicates via a versioned REST HTTP/JSON API (`/api/v1`). All endpoints enforce type safety via shared TypeScript definitions.

### 4.1 Prototype Hash-Route Bridge
The frontend currently uses hash-based route overlays (`#object/[id]`). The route utility (`src/lib/routes.ts`) bridges to production API endpoints as follows:

| Prototype Route | Production API Endpoint | Return Entity |
| :--- | :--- | :--- |
| `#object/[id]` | `GET /api/v1/objects/:id` | `ProductDetailDTO` |
| `#craft-[id]` | `GET /api/v1/crafts/:id` | `CraftDetailDTO` |
| `#maker` / `#maker-[id]`| `GET /api/v1/artisans/:id` | `ArtisanDetailDTO` |
| OmniSearch `/` | `POST /api/v1/search` | `SearchIndexResponse` |
| Bag State | `POST /api/v1/cart/sync` | `CartSummaryDTO` |

### 4.2 Canonical API Endpoints

```text
GET  /api/v1/catalogue/products         → Query product list (filterable, paginated)
GET  /api/v1/catalogue/products/:id     → Get detailed product with images & craft provenance
GET  /api/v1/catalogue/crafts           → Get all heritage crafts (Atlas data)
GET  /api/v1/catalogue/regions          → Get regional coordinates and places
GET  /api/v1/catalogue/artisans/:id     → Get artisan maker profile and assigned objects

POST /api/v1/search                     → Execute provider-agnostic search query

POST /api/v1/cart/sync                  → Sync client bag lines with real-time stock status
POST /api/v1/checkout/intent            → Initialize multi-seller order & payment intent
POST /api/v1/webhooks/payment           → Process payment gateway callback (Webhook)

GET  /api/v1/customer/profile           → Customer account profile (Authenticated)
GET  /api/v1/customer/orders            → Customer order history with multi-seller tracking
GET  /api/v1/customer/orders/:id        → Customer detailed order receipt

GET  /api/v1/seller/orders              → Isolated seller fulfilment dashboard (Seller Auth)
PATCH /api/v1/seller/orders/:id/status  → Update seller order status (e.g. accepted, in_crafting)
POST /api/v1/seller/orders/:id/shipment → Attach waybill & tracking number
```

---

## 5. Domain Boundary & Entity Specification

Entities are strictly categorized by ownership, mutability, transaction requirements, and consistency constraints.

```text
                               ┌───────────────────┐
                               │       User        │
                               └─────────┬─────────┘
                                         │ 1:1
                        ┌────────────────┴────────────────┐
                        │                                 │
                        ▼                                 ▼
              ┌───────────────────┐             ┌───────────────────┐
              │     Customer      │             │      Seller       │
              └─────────┬─────────┘             └─────────┬─────────┘
                        │                                 │
            ┌───────────┴───────────┐                     │ 1:N
            ▼                       ▼                     ▼
   ┌─────────────────┐     ┌─────────────────┐   ┌─────────────────┐
   │     Address     │     │     Wishlist    │   │     Product     │
   └─────────────────┘     └─────────────────┘   └────────┬────────┘
                                                          │ 1:N
                                                 ┌────────┴────────┐
                                                 ▼                 ▼
                                        ┌─────────────────┐ ┌──────────────┐
                                        │ ProductVariant  │ │   Inventory  │
                                        └─────────────────┘ └──────────────┘
```

### 5.1 Domain Entity Classification Table

| Entity | Mutability | Ownership | Read vs Write | Transaction Boundary | Consistency Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`User`** | Low | Identity | Read-heavy | User creation | Strong |
| **`Customer`** | Low | User | Read-heavy | Customer update | Strong |
| **`Address`** | Medium | Customer | Read-heavy | Order checkout | Strong |
| **`Artisan`** | Low | Craft Lineage / Seller | Read-heavy | Catalogue ingest | Eventual |
| **`Craft`** | Read-Only | Cultural Heritage | Read-heavy | Catalogue ingest | Eventual |
| **`Region`** | Read-Only | Geographical Atlas| Read-heavy | Catalogue ingest | Eventual |
| **`Seller`** | Low | User | Read-heavy | Seller onboarding | Strong |
| **`Product`** | Low | Seller | Read-heavy | Catalogue ingest | Eventual |
| **`ProductVariant`**| Low | Product | Read-heavy | Catalogue ingest | Eventual |
| **`Inventory`** | High | Seller | Write-heavy | Checkout reservation | **Strict Serialized** |
| **`Cart` / `Bag`**| High | Customer / Session | Write-heavy | Cart update | Eventual |
| **`Order`** | Low (State) | Customer | Read-heavy | Payment capture | **Strict ACID** |
| **`SellerOrder`** | Medium (State)| Seller | Read/Write | Order decomposition | **Strict ACID** |
| **`OrderItem`** | Immutable | SellerOrder | Read-heavy | Order decomposition | **Strict ACID** |

---

## 6. Logical Persistence Model (PostgreSQL Relational Schema)

Monetary values are stored as `BIGINT` representing integer paise ($\text{₹1.00} = 100 \text{ paise}$). Timestamps use `TIMESTAMPTZ` (UTC).

```sql
-- Core User & Auth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL CHECK (role IN ('customer', 'artisan_seller', 'admin', 'curator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seller & Merchant Record
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15),
    pan VARCHAR(10) NOT NULL,
    bank_details JSONB NOT NULL,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'pending',
    commission_rate_percentage NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cultural Entities
CREATE TABLE regions (
    id VARCHAR(64) PRIMARY KEY,
    place VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    lat NUMERIC(9,6) NOT NULL,
    lng NUMERIC(9,6) NOT NULL
);

CREATE TABLE crafts (
    id VARCHAR(64) PRIMARY KEY,
    source VARCHAR(16) NOT NULL DEFAULT 'demo',
    place VARCHAR(128) NOT NULL,
    name VARCHAR(128) NOT NULL,
    medium VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL,
    region_id VARCHAR(64) NOT NULL REFERENCES regions(id),
    material VARCHAR(255) NOT NULL,
    swatch JSONB NOT NULL,
    note TEXT NOT NULL,
    image JSONB NOT NULL
);

CREATE TABLE artisans (
    id VARCHAR(64) PRIMARY KEY,
    source VARCHAR(16) NOT NULL DEFAULT 'demo',
    number_label VARCHAR(8) NOT NULL,
    name VARCHAR(128) NOT NULL,
    pronoun VARCHAR(8) NOT NULL,
    region_id VARCHAR(64) NOT NULL REFERENCES regions(id),
    craft_id VARCHAR(64) NOT NULL REFERENCES crafts(id),
    village VARCHAR(128) NOT NULL,
    practice VARCHAR(255) NOT NULL,
    years_experience INT NOT NULL,
    since_year INT NOT NULL,
    quote TEXT,
    bio JSONB,
    portrait JSONB,
    plate_caption TEXT,
    seller_id UUID REFERENCES sellers(id)
);

-- Catalog Entities
CREATE TABLE products (
    id VARCHAR(128) PRIMARY KEY,
    source VARCHAR(16) NOT NULL DEFAULT 'demo',
    name VARCHAR(255) NOT NULL,
    base_price_paise BIGINT NOT NULL,
    craft_id VARCHAR(64) NOT NULL REFERENCES crafts(id),
    region_id VARCHAR(64) NOT NULL REFERENCES regions(id),
    artisan_id VARCHAR(64) NOT NULL REFERENCES artisans(id),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    material VARCHAR(255) NOT NULL,
    technique VARCHAR(255),
    crafting_time VARCHAR(128),
    dimensions VARCHAR(128),
    description TEXT NOT NULL,
    story TEXT,
    images JSONB NOT NULL,
    detail JSONB,
    framed BOOLEAN,
    availability_status VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(128) NOT NULL REFERENCES products(id),
    sku VARCHAR(128) UNIQUE NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}',
    price_adjustment_paise BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Decoupled Inventory
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID UNIQUE NOT NULL REFERENCES product_variants(id),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    allocated_quantity INT NOT NULL DEFAULT 0 CHECK (allocated_quantity >= 0),
    reserved_quantity INT NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    lead_time_days INT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Orders & Multi-Seller Splitting
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(32) NOT NULL DEFAULT 'pending_payment',
    subtotal_paise BIGINT NOT NULL,
    tax_paise BIGINT NOT NULL,
    shipping_paise BIGINT NOT NULL,
    total_paise BIGINT NOT NULL,
    shipping_address JSONB NOT NULL,
    payment_intent_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seller_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    seller_id UUID NOT NULL REFERENCES sellers(id),
    seller_order_number VARCHAR(48) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending_acceptance',
    subtotal_paise BIGINT NOT NULL,
    commission_paise BIGINT NOT NULL,
    tax_paise BIGINT NOT NULL,
    seller_payout_paise BIGINT NOT NULL,
    waybill_number VARCHAR(128),
    tracking_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_order_id UUID NOT NULL REFERENCES seller_orders(id),
    product_id VARCHAR(128) NOT NULL REFERENCES products(id),
    variant_id UUID NOT NULL REFERENCES product_variants(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_paise BIGINT NOT NULL,
    line_subtotal_paise BIGINT NOT NULL
);

-- Database Indexes for Query Performance
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_craft ON products(craft_id);
CREATE INDEX idx_seller_orders_seller ON seller_orders(seller_id);
CREATE INDEX idx_seller_orders_order ON seller_orders(order_id);
CREATE INDEX idx_inventories_variant ON inventories(variant_id);
```

---

## 7. Decoupled Inventory Architecture

Inventory is completely decoupled from static product catalog metadata.

### 7.1 Inventory Operations Interface
```typescript
export interface IInventoryService {
  checkAvailability(variantId: string, quantity: number): Promise<{
    available: boolean;
    status: AvailabilityStatus;
    leadTimeDays?: number;
  }>;

  reserveStock(variantId: string, quantity: number, checkoutSessionId: string): Promise<boolean>;

  releaseReservation(variantId: string, checkoutSessionId: string): Promise<void>;

  confirmAllocation(variantId: string, quantity: number): Promise<void>;

  restock(variantId: string, quantity: number): Promise<void>;
}
```

### 7.2 Stock Rules by Availability Status
1. **`ready`**: `stockQuantity` represents physical on-hand units. Reserving stock increments `reservedQuantity`. Confirming payment moves units from `reservedQuantity` to `allocatedQuantity` and decrements `stockQuantity`.
2. **`made-to-order`**: `stockQuantity` is `0`. Purchases do not decrement stock but create a fulfillment contract with `leadTimeDays` SLA.
3. **`one-of-one`**: `stockQuantity` is strictly $\le 1$. Reservation locks the single unit immediately.

---

## 8. Multi-Seller Order Architecture & Lifecycle

### 8.1 The Invariant Lifecycle Flow

```text
1. Customer Bag  ──> 2. Checkout Session ──> 3. Payment Gateway Auth
                                                   │
                                                   ▼
 6. Escrow Release <── 5. Delivery Window <── 4. Order & SellerOrder Decomposition
```

1. **Bag & Checkout**: Customer adds objects from multiple sellers into a single Bag. Total is calculated.
2. **Payment Authorization**: Customer pays `order.total_paise`. Payment gateway authorizes funds.
3. **Atomic Decomposition Transaction**:
   - Backend receives payment authorization webhook.
   - Database creates 1 `orders` row.
   - Backend groups cart items by `seller_id`.
   - Creates $N$ `seller_orders` rows with unique `seller_order_number` (e.g. `K-90210-A`, `K-90210-B`).
   - Creates corresponding `order_items` attached to respective `seller_orders`.
   - Converts inventory reservations to allocations.
4. **Independent Seller Fulfillment**:
   - Seller A accepts order, generates waybill, ships item (`status: shipped`).
   - Seller B accepts made-to-order item, enters crafting pipeline (`status: in_crafting`).
5. **Partial Return / Cancellation**:
   - Customer can cancel or return Seller A's line item without impacting Seller B's order.
   - Payout refund and commission reversal occur strictly within Seller A's `seller_order` financial scope.

---

## 9. Authentication, Authorization & Seller Data Isolation

### 9.1 Identity vs. Authorization
* **Identity**: Authenticated via JWT bearer tokens or HTTP-only SameSite cookies containing `userId`, `email`, and `role`.
* **Roles**:
  * `customer`: Can view public catalogue, manage own bag/wishlist/profile, place orders.
  * `artisan_seller`: Can view and fulfill ONLY their assigned `seller_orders` and update their own `inventories`.
  * `curator`: Can ingest craft stories, edit catalogue editorial metadata.
  * `admin`: Full platform administrative access.

### 9.2 Strict Seller Scope Enforcement
All database queries executed in a seller context MUST automatically enforce:
```sql
SELECT * FROM seller_orders WHERE id = :sellerOrderId AND seller_id = :loggedInSellerId;
```
A seller attempting to access another seller's order ID receives an authoritative `404 Not Found` (to prevent ID enumeration).

---

## 10. Search Strategy

Search follows the provider-agnostic interface in `docs/domain-model.md` (`SearchQueryRequest` & `SearchIndexResponse`).

```text
Database (PostgreSQL) ──> Event / CDC Sync ──> Search Engine Index (Meilisearch / PostgreSQL FTS)
                                                        │
                                                        ▼
Presentation Layer <── HTTP / POST /search <── Application Search Service
```

* **Authoritative Data**: PostgreSQL database.
* **Denormalized Index**: Search index holds search hits (`key`, `label`, `meta`, `href`, `image`, `facets`).
* **Synchronization**: Inventory/Product edits emit background reindex jobs via Redis queue.

---

## 11. Content / CMS Strategy

* **Commerce Data** (Products, Variants, Inventory, Seller Orders) resides in PostgreSQL.
* **Editorial Content** (Journal Entries, Craft Narratives, Material Stories, Hero Collections) resides in a Headless CMS (or structured Git/JSON content store).
* **Boundary**: The CMS MUST NEVER hold stock counts, pricing, or transactional order data.

---

## 12. Media Architecture

Preserves the `EditorialImage` primitive and `position` CSS crop attribute (`src/components/ui/EditorialImage.tsx`).

```text
Master Asset Upload ──> S3 / Storage ──> Image Transformation Service ──> CDN ──> Frontend EditorialImage
```

* Remote assets emit responsive `srcset` with width parameters (`w=480`, `w=720`, `w=1280`, `w=2000`).
* Decorative hover detail crops use CSS `object-position` without destructive asset cropping.

---

## 13. Payment Gateway Boundary

* **Flow**: Client requests Payment Intent (`POST /api/v1/checkout/intent`) $\implies$ Client opens Gateway SDK $\implies$ Gateway fires Webhook to Backend (`POST /api/v1/webhooks/payment`) $\implies$ Backend verifies signature $\implies$ Backend updates Order & creates `SellerOrder`s.
* **Rule**: Client-side success callbacks MUST NEVER create orders or confirm payments directly. The backend payment webhook is authoritative.

---

## 14. Shipping & Logistics Boundary

* Abstracts courier aggregators via `ILogisticsAdapter`.
* Waybills and tracking URLs are attached per `seller_order_id`. Each seller prints their own shipping labels from their dashboard.

---

## 15. GST / Tax Calculation Boundary

* Calculates inter-state (IGST) vs intra-state (CGST + SGST) based on Seller dispatch pincode vs Customer shipping pincode.
* Tax results are persisted at both top-level `orders` and granular `seller_orders` / `order_items` levels.

---

## 16. Background Jobs & Webhooks

Uses Redis + BullMQ for asynchronous non-blocking operations:
1. `payment-webhooks`: Process payment notifications asynchronously.
2. `search-reindex`: Reindex updated products or crafts.
3. `notifications`: Email/SMS receipts and seller order alerts.
4. `inventory-reconciliation`: Expire stale checkout reservations.

---

## 17. Caching Strategy

* **CDN / Edge**: Static assets, JS bundles, media images, public craft atlas JSON.
* **Redis Cache**: Public catalogue query results, search facets, artisan profiles (TTL 1 hour with event invalidation).
* **NO CACHE**: Active inventory counts, cart states, checkout total calculations, seller dashboard balances.

---

## 18. Security Model

* Server-authoritative totals, prices, and seller identities.
* Input validation via Zod schemas on all API inputs.
* Rate limiting on auth and search endpoints (100 req/min).
* Secrets stored strictly in environment variables; zero hardcoded credentials.

---

## 19. Observability Strategy

* Structured JSON logs with request correlation IDs (`x-request-id`).
* Audit trail logging for all financial transactions, inventory adjustments, and status changes in `audit_logs` table.

---

## 20. Environment & Deployment Model

* **Development**: Local Node.js server + PostgreSQL container + Redis container.
* **Staging / Production**: Containerized app on AWS ECS / Render / Fly.io + Managed PostgreSQL + Managed Redis + CDN.

---

## 21. Explicit Governance of Unresolved Decisions

| Unresolved Issue | Decision Status | Protective Abstraction |
| :--- | :--- | :--- |
| **GST Tax Engine** | Deferred | `ITaxCalculator` interface |
| **Inventory Lock Strategy** | Deferred | `IInventoryLockProvider` interface |
| **Long Lead-Time Escrow** | Deferred | `IEscrowStrategy` interface |
| **Logistics Carrier API** | Deferred | `ILogisticsAdapter` interface |
| **Payment Gateway Choice** | Deferred | `IPaymentGatewayAdapter` interface |

---

## 22. Audit of Disagreements & Codebase Adaptations

1. **Static Catalog vs Seller Entities**: Current `src/data/catalog.ts` links `Product` to `artisanId`, `craftId`, `regionId`, but lacks `sellerId`. Production ingest MUST assign a valid `sellerId` to every product.
2. **Local Storage Bag vs Variant Bag**: Current `BagContext.tsx` uses `product.id` in `localStorage`. Production bag MUST track `variantId` and synchronize with backend endpoints (`POST /api/v1/cart/sync`).
3. **Hash Routes vs Production URLs**: Prototype routes (`#object/[id]`) map directly to REST endpoints (`/api/v1/objects/:id`).

---

## 23. Phased Implementation Sequence for Future Jules Tasks

Future agents MUST implement the backend in this strict sequence:

1. **Phase 1: Database Setup & Migrations**: Apply PostgreSQL schema (`users`, `sellers`, `crafts`, `products`, `inventories`, `orders`, `seller_orders`).
2. **Phase 2: Catalogue & Search Modules**: Implement public REST endpoints (`/api/v1/catalogue/*`) and search query provider.
3. **Phase 3: Inventory & Bag Sync Module**: Implement `IInventoryService` and cart synchronization endpoints (`/api/v1/cart/sync`).
4. **Phase 4: Checkout & Multi-Seller Order Engine**: Implement checkout session creation, payment webhook processing, and multi-seller order decomposition.
5. **Phase 5: Seller Isolation & Dashboard Endpoints**: Implement RBAC middleware and seller-scoped order fulfillment endpoints.
6. **Phase 6: Integrations & Background Workers**: Plug in payment gateway adapters, logistics adapters, and BullMQ workers.
