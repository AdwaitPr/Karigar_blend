# Kārigar Production Domain Model & Architectural Specification

*This document establishes the binding domain model, entity relationships, search contract, content provenance rules, and commerce lifecycle for the **Kārigar** luxury Indian craft marketplace. All future implementation agents MUST strictly comply with the contracts defined herein.*

---

## 1. Ubiquitous Language & Terminology

To maintain domain clarity and alignment with the existing codebase (`src/types/catalog.ts`, `AGENTS.md`), all system schemas, code, and APIs MUST adhere to these terms:

| Term | Domain Definition |
| :--- | :--- |
| **Kārigar (कारीगर)** | Indian master artisan or craftsperson who creates the object. |
| **Object** | A physical craft item or product listed in the marketplace (preferred over "SKU" or generic "item"). |
| **Bag** | The shopping selection container (referred to as "Bag", not "Cart"). |
| **Object Sheet** | Deep-linkable product detail view modal/page (`#object/[id]` in prototype, `/object/[id]` in production). |
| **Atlas** | The regional craft index mapping craft disciplines to geographical coordinates across India. |
| **Craft** | Specific traditional technique, discipline, medium, or heritage lineage (e.g., Banarasi brocade, Kutch embroidery). |
| **Provenance** | Traced origin: master artisan, village, material filaments, loom/crafting duration, and craft lineage. |
| **ContentSource** | Provenance status discriminator (`"demo"` vs `"verified"`). |
| **AvailabilityStatus** | Inventory velocity descriptor: `"ready"` (ready to ship), `"made-to-order"` (crafted upon purchase), `"one-of-one"` (singular artwork). |

---

## 2. Core Entities & Relationships

```text
[Customer] ────1:N────> [Order] ────1:N────> [SellerOrder / FulfilmentGroup]
  │                       │                           │
  │ (Wishlist)            │ (Shipping Address)        │ 1:N
  ▼                       ▼                           ▼
[Wishlist]            [Address]                   [OrderItem]
                                                      │
                                                      │ References
                                                      ▼
[ProductVariant] <────1:N──── [Product (Object)] ───1:1───> [Inventory]
      │                              │
      │                              ├──── N:1 ───> [Craft] ─── N:1 ───> [Region]
      ▼                              ├──── N:1 ───> [Artisan]
[ProductImage]                       └──── N:1 ───> [Seller]
```

### Entity Specifications

#### 2.1 User & Identity
- **`User`**: Core account identity.
  - `id`: `string` (UUID v4)
  - `email`: `string` (unique)
  - `phone`: `string` (E.164 format)
  - `role`: `"customer" | "artisan_seller" | "admin" | "curator"`
  - `createdAt`: `ISO8601 Timestamp`

#### 2.2 Customer Domain
- **`Customer`**: Buyer profile linked to `User`.
  - `id`: `string`
  - `userId`: `string` (FK -> `User.id`)
  - `fullName`: `string`
  - `defaultShippingAddressId`: `string | null`
  - `createdAt`: `ISO8601 Timestamp`
- **`Address`**: Physical delivery or billing location.
  - `id`: `string`
  - `customerId`: `string`
  - `recipientName`: `string`
  - `addressLine1`: `string`
  - `addressLine2`: `string | null`
  - `city`: `string`
  - `state`: `string`
  - `postalCode`: `string` (PIN code)
  - `country`: `string` (default `"IN"`)
  - `phone`: `string`
- **`Wishlist`**: Saved objects for a customer.
  - `id`: `string`
  - `customerId`: `string`
  - `productIds`: `string[]`
  - `updatedAt`: `ISO8601 Timestamp`

#### 2.3 Cultural & Artisan Domain
- **`Region`**: Geographical origin mapping to the Craft Atlas.
  - `id`: `string` (e.g., `"banaras"`, `"kutch"`)
  - `place`: `string`
  - `state`: `string`
  - `lat`: `number` (Latitude)
  - `lng`: `number` (Longitude)
- **`Craft`**: Heritage craft discipline and lineage.
  - `id`: `string` (e.g., `"banarasi"`, `"kutch"`)
  - `source`: `ContentSource` (`"demo" | "verified"`)
  - `place`: `string`
  - `name`: `string`
  - `medium`: `string`
  - `category`: `"Textile" | "Wood" | "Painting"` (extensible enum)
  - `regionId`: `string` (FK -> `Region.id`)
  - `material`: `string`
  - `swatch`: `{ name: string; hex: string }`
  - `note`: `string`
  - `image`: `ImageAsset`
- **`Artisan`**: Master craftsperson / maker profile (cultural representation).
  - `id`: `string` (e.g., `"abdul-rahim-ansari"`)
  - `source`: `ContentSource`
  - `number`: `string` (e.g., `"07"`)
  - `name`: `string`
  - `pronoun`: `"his" | "her"`
  - `regionId`: `string` (FK -> `Region.id`)
  - `craftId`: `string` (FK -> `Craft.id`)
  - `village`: `string`
  - `practice`: `string`
  - `years`: `number`
  - `since`: `number` (Year onboarding / practicing)
  - `quote`: `string | null`
  - `bio`: `string[] | null`
  - `portrait`: `ImageAsset | null`
  - `plate`: `string | null` (Caption for workshop / studio photograph)
  - `sellerId`: `string | null` (FK -> `Seller.id` when linked to a seller entity)

#### 2.4 Seller & Marketplace Entity
- **`Seller`**: Legal merchant of record handling stock, orders, and settlements.
  - `id`: `string`
  - `userId`: `string` (FK -> `User.id`)
  - `artisanId`: `string | null` (FK -> `Artisan.id`, null if a seller represents a master craft cooperative)
  - `legalName`: `string`
  - `tradeName`: `string`
  - `gstin`: `string | null` (Goods and Services Tax Identification Number)
  - `pan`: `string` (Permanent Account Number)
  - `bankAccount`: `{ accountNumber: string; ifscCode: string; accountHolderName: string; bankName: string }`
  - `verificationStatus`: `"pending" | "verified" | "suspended"`
  - `commissionRatePercentage`: `number` (e.g., `15.0`)
  - `createdAt`: `ISO8601 Timestamp`

---

## 3. Product Model & Inventory Decoupling

### 3.1 Product Metadata (Static Catalog Representation)
`Product` represents the editorial listing and craft specification. Static metadata MUST NOT contain mutable inventory counts or active order reservations.

- **`Product`**:
  - `id`: `string`
  - `source`: `ContentSource`
  - `name`: `string`
  - `price`: `number` (Base price in integer INR)
  - `craftId`: `string` (FK -> `Craft.id`)
  - `regionId`: `string` (FK -> `Region.id`)
  - `artisanId`: `string` (FK -> `Artisan.id`)
  - `sellerId`: `string` (FK -> `Seller.id`)
  - `material`: `string`
  - `technique`: `string | null`
  - `time`: `string | null` (Crafting / loom duration, e.g. `"31 days on the loom"`)
  - `dimensions`: `string | null`
  - `description`: `string`
  - `story`: `string | null`
  - `images`: `ImageAsset[]`
  - `detail`: `{ scale: number; origin: string } | null`
  - `framed`: `boolean | null`
  - `availability`: `{ status: AvailabilityStatus; label: string }`

- **`ImageAsset`**: Art-directed photography asset.
  - `src`: `string`
  - `alt`: `string`
  - `width`: `number`
  - `height`: `number`
  - `position`: `string | null` (CSS object-position)
  - `remote`: `boolean | null`
  - `fallback`: `ImageAsset | null`
  - `kind`: `"studio" | "field" | "placeholder" | null`
  - `credit`: `string | null`

- **`ProductVariant`**: Dimension/colorway variation.
  - `id`: `string`
  - `productId`: `string` (FK -> `Product.id`)
  - `sku`: `string`
  - `variantAttributes`: `Record<string, string>` (e.g., `{ "color": "Madder Red", "size": "70 x 200 cm" }`)
  - `priceAdjustment`: `number` (Delta to base price, default `0`)

### 3.2 Inventory Entity (Mutable Commerce State)
Inventory MUST be managed independently from product records to prevent lock contention and catalog invalidations.

- **`Inventory`**:
  - `id`: `string`
  - `variantId`: `string` (FK -> `ProductVariant.id`, unique)
  - `sellerId`: `string` (FK -> `Seller.id`)
  - `stockQuantity`: `number` (Available physical units for `ready` status)
  - `allocatedQuantity`: `number` (Units locked in active paid orders awaiting fulfilment)
  - `reservedQuantity`: `number` (Units locked in active checkout sessions)
  - `leadTimeDays`: `number | null` (Production time in days for `made-to-order`)
  - `isAvailable`: `boolean` (Seller soft enable/disable)

**Critical Constraints**:
1. For `availability.status === "one-of-one"`, `stockQuantity` MUST BE $\le 1$ at all times.
2. For `availability.status === "made-to-order"`, `stockQuantity` is `0` (or ignored), and `leadTimeDays` MUST BE $> 0$.

---

## 4. Content & Provenance Verification

### 4.1 Discriminator (`ContentSource`)
All content records (`Product`, `Artisan`, `Craft`, `JournalEntry`) carry `source: ContentSource`.

- `"demo"`: Editorial placeholder data for UI layout, design, and art direction testing. Must NEVER be treated as real inventory or transmitted to payment gateways.
- `"verified"`: Authenticated artisan masterwork backed by physical provenance, verified seller identity, and physical workshop audit.

### 4.2 Provenance Ingestion Rules
1. **Artisan Attribution**: A product marked `"verified"` MUST link to a verified `Artisan` and `Seller`.
2. **Photography Integrity**: Stock or documentary photography MUST set `kind: "placeholder"` or `kind: "field"` and supply a `credit`. It MUST NOT pretend a stock photograph depicts a specific artisan.
3. **Selvedge / Signature Mark**: `one-of-one` and high-value textiles should record physical verification marks (e.g. woven selvedge signature slip, artisan thumbprint, paper watermark).

---

## 5. Stable Search Contract

The search layer interface is decoupled from specific providers (e.g. Meilisearch, Elasticsearch, PostgreSQL FTS).

### 5.1 Search Request Contract (`SearchQueryRequest`)
```typescript
export type SearchSortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "crafting_time"
  | "newest";

export type SearchQueryRequest = {
  query?: string;
  filters?: {
    craftIds?: string[];
    regionIds?: string[];
    categories?: CraftCategory[];
    materials?: string[];
    techniques?: string[];
    artisanIds?: string[];
    availabilityStatus?: AvailabilityStatus[];
    priceRange?: { min?: number; max?: number };
  };
  sort?: SearchSortOption;
  page?: number;
  limit?: number;
};
```

### 5.2 Search Response Contract (`SearchIndexResponse`)
```typescript
export type SearchFacetBucket = { value: string; label: string; count: number };

export type SearchIndexFacets = {
  category: SearchFacetBucket[];
  region: SearchFacetBucket[];
  availability: SearchFacetBucket[];
  craft: SearchFacetBucket[];
  material: SearchFacetBucket[];
};

export type SearchHit = {
  key: string;
  label: string;
  meta: string;
  href: string;
  kind: "object" | "craft" | "maker" | "journal";
  image?: ImageAsset;
  price?: number;
};

export type SearchGroup = {
  id: "objects" | "crafts" | "makers" | "journal";
  title: string;
  items: SearchHit[];
};

export type SearchIndexResponse = {
  query: string;
  groups: SearchGroup[];
  facets: SearchIndexFacets;
  total: number;
  page: number;
  totalPages: number;
};
```

---

## 6. Commerce & Order Lifecycle

The end-to-end commerce sequence spans product selection through fulfillment and settlement:

```text
Product (Object) ──> Bag ──> Checkout ──> Payment Authorization
                                                │
                                                ▼
  [Settlement] <── [Delivery] <── [Shipment] <── Order (Customer)
                                                │
                                                ├─ (Split per Seller)
                                                ▼
                                   [SellerOrder / FulfilmentGroup]
```

### 6.1 Commerce Lifecycle Stages
1. **Product Selection (`Bag`)**: Customer adds objects to Bag. Items hold product ID, variant ID, quantity, and reference seller ID.
2. **Checkout**: Shipping address specified. Taxes (GST) and shipping rates computed.
3. **Payment Authorization**: Customer pays for the complete `Order` via payment gateway. Funds captured into platform escrow.
4. **Order Creation & Multi-Seller Split**: System creates top-level `Order`, then immediately generates $N$ `SellerOrder` / `FulfilmentGroup` entities (one per seller involved in the order).
5. **Seller Fulfillment**:
   - For `ready` stock: Seller packs object and generates shipping label.
   - For `made-to-order`: Seller accepts order, enters crafting pipeline, and updates status to `in_crafting`.
6. **Dispatch & Shipment**: Carrier pickup confirmed; tracking number attached to `SellerOrder`.
7. **Delivery & Inspection**: Carrier delivers package. Customer given inspection window (e.g., 7 days).
8. **Return / Refund (If Applicable)**: If damaged or non-authentic, return request initiated against specific `SellerOrder`.
9. **Financial Settlement**: Escrow releases seller net payout (`Subtotal - Commission - GST`) after return window closes.
