/**
 * Kārigar Domain Types
 * Source of truth: docs/system-architecture.md & docs/domain-model.md
 *
 * NOTE: These types belong strictly to the domain/application layer and have
 * ZERO dependencies on Prisma or ORM-specific imports.
 */

export type UserRole = "CUSTOMER" | "ARTISAN_SELLER" | "ADMIN" | "CURATOR";
export type ContentSource = "demo" | "verified";
export type CraftCategory = "TEXTILE" | "WOOD" | "PAINTING";
export type AvailabilityStatus = "ready" | "made-to-order" | "one-of-one";
export type SellerVerificationStatus = "PENDING" | "VERIFIED" | "SUSPENDED";
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export type SellerOrderStatus =
  | "PENDING_ACCEPTANCE"
  | "ACCEPTED"
  | "IN_CRAFTING"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type DomainUser = {
  id: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt: Date;
};

export type DomainCustomer = {
  id: string;
  userId: string;
  fullName: string;
  defaultShippingAddressId?: string | null;
  createdAt: Date;
};

export type DomainAddress = {
  id: string;
  customerId: string;
  recipientName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

export type DomainSeller = {
  id: string;
  userId: string;
  legalName: string;
  tradeName: string;
  gstin?: string | null;
  pan: string;
  bankDetails: unknown;
  verificationStatus: SellerVerificationStatus;
  commissionRatePercentage: number;
  createdAt: Date;
};

export type DomainRegion = {
  id: string;
  place: string;
  state: string;
  lat: number;
  lng: number;
};

export type DomainCraft = {
  id: string;
  source: ContentSource;
  place: string;
  name: string;
  medium: string;
  category: CraftCategory;
  regionId: string;
  material: string;
  swatch: unknown;
  note: string;
  image: unknown;
};

export type DomainArtisan = {
  id: string;
  source: ContentSource;
  numberLabel: string;
  name: string;
  pronoun: string;
  regionId: string;
  craftId: string;
  village: string;
  practice: string;
  yearsExperience: number;
  sinceYear: number;
  quote?: string | null;
  bio?: unknown;
  portrait?: unknown;
  plateCaption?: string | null;
  sellerId?: string | null;
};

export type DomainProduct = {
  id: string;
  source: ContentSource;
  name: string;
  basePricePaise: bigint;
  craftId: string;
  regionId: string;
  artisanId: string;
  sellerId: string;
  material: string;
  technique?: string | null;
  craftingTime?: string | null;
  dimensions?: string | null;
  description: string;
  story?: string | null;
  images: unknown;
  detail?: unknown;
  framed?: boolean | null;
  availabilityStatus: AvailabilityStatus;
  isPublished: boolean;
  createdAt: Date;
};

export type DomainProductVariant = {
  id: string;
  productId: string;
  sku: string;
  attributes: Record<string, string>;
  priceAdjustmentPaise: bigint;
  createdAt: Date;
};

export type DomainInventory = {
  id: string;
  variantId: string;
  sellerId: string;
  stockQuantity: number;
  allocatedQuantity: number;
  reservedQuantity: number;
  leadTimeDays?: number | null;
  isAvailable: boolean;
  updatedAt: Date;
};

export type DomainOrderItem = {
  id: string;
  sellerOrderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPricePaise: bigint;
  lineSubtotalPaise: bigint;
  productNameSnapshot: string;
  variantAttributesSnapshot: unknown;
  sellerNameSnapshot: string;
};

export type DomainSellerOrder = {
  id: string;
  orderId: string;
  sellerId: string;
  sellerOrderNumber: string;
  status: SellerOrderStatus;
  subtotalPaise: bigint;
  commissionPaise: bigint;
  taxPaise: bigint;
  sellerPayoutPaise: bigint;
  waybillNumber?: string | null;
  trackingUrl?: string | null;
  acceptedAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  refundedAt?: Date | null;
  createdAt: Date;
  items?: DomainOrderItem[];
};

export type DomainOrder = {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  subtotalPaise: bigint;
  taxPaise: bigint;
  shippingPaise: bigint;
  totalPaise: bigint;
  shippingAddress: DomainAddress;
  paymentIntentId?: string | null;
  createdAt: Date;
  paidAt?: Date | null;
  cancelledAt?: Date | null;
  sellerOrders?: DomainSellerOrder[];
};

/**
 * REST API JSON DTO Serialization Helper
 *
 * Converts BigInt monetary amounts to strings and Date objects to ISO8601 strings
 * to ensure predictable REST API responses without JSON serialization errors.
 */
export function serializeBigIntAndDates<T>(data: T): unknown {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    })
  );
}
