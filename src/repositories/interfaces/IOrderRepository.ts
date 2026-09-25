import type {
  DomainAddress,
  DomainOrder,
  DomainSellerOrder,
  OrderStatus,
  SellerOrderStatus,
} from "../types";

export interface CreateOrderItemInput {
  productId: string;
  variantId: string;
  sellerId: string;
  quantity: number;
  unitPricePaise: bigint;
  productNameSnapshot: string;
  variantAttributesSnapshot: Record<string, string>;
  sellerNameSnapshot: string;
}

export interface CreateOrderInput {
  orderNumber: string;
  customerId: string;
  subtotalPaise: bigint;
  taxPaise: bigint;
  shippingPaise: bigint;
  totalPaise: bigint;
  shippingAddress: DomainAddress;
  paymentIntentId?: string;
  items: CreateOrderItemInput[];
}

export interface IOrderRepository {
  createOrderWithSellerDecomposition(input: CreateOrderInput): Promise<DomainOrder>;
  findOrderById(orderId: string): Promise<DomainOrder | null>;
  findOrdersByCustomerId(customerId: string): Promise<DomainOrder[]>;
  findSellerOrdersBySellerId(sellerId: string): Promise<DomainSellerOrder[]>;
  findSellerOrderById(sellerOrderId: string): Promise<DomainSellerOrder | null>;
  updateSellerOrderStatus(
    sellerOrderId: string,
    status: SellerOrderStatus,
    waybillNumber?: string,
    trackingUrl?: string
  ): Promise<DomainSellerOrder>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<DomainOrder>;
}
