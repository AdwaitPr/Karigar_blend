import type { Prisma, PrismaClient } from "@prisma/client";
import type { CreateOrderInput, IOrderRepository } from "../interfaces/IOrderRepository";
import type {
  DomainAddress,
  DomainOrder,
  DomainSellerOrder,
  OrderStatus,
  SellerOrderStatus,
} from "../types";

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createOrderWithSellerDecomposition(input: CreateOrderInput): Promise<DomainOrder> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Group input items by sellerId
      const sellerGroups = new Map<string, typeof input.items>();
      for (const item of input.items) {
        const group = sellerGroups.get(item.sellerId) ?? [];
        group.push(item);
        sellerGroups.set(item.sellerId, group);
      }

      // 2. Create Top-Level Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: input.orderNumber,
          customerId: input.customerId,
          status: "PAID",
          subtotalPaise: input.subtotalPaise,
          taxPaise: input.taxPaise,
          shippingPaise: input.shippingPaise,
          totalPaise: input.totalPaise,
          shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
          paymentIntentId: input.paymentIntentId,
          paidAt: new Date(),
        },
      });

      let sellerIndex = 1;
      const createdSellerOrders: DomainSellerOrder[] = [];

      // 3. For each unique seller, create SellerOrder and attached OrderItems
      for (const [sellerId, items] of sellerGroups.entries()) {
        const sellerSubtotal = items.reduce(
          (sum, i) => sum + i.unitPricePaise * BigInt(i.quantity),
          0n
        );

        // Fetch seller commission rate and calculate in pure BigInt arithmetic
        const seller = await tx.seller.findUnique({ where: { id: sellerId } });
        const rateBasisPoints = seller
          ? BigInt(Math.round(Number(seller.commissionRatePercentage) * 100))
          : 1500n; // 15.00% -> 1500 basis points
        const commissionPaise = (sellerSubtotal * rateBasisPoints) / 10000n;
        const sellerTaxPaise = 0n; // Tax engine interface calculates exact GST split
        const sellerPayoutPaise = sellerSubtotal - commissionPaise;

        const sellerOrderNum = `${input.orderNumber}-${String.fromCharCode(64 + sellerIndex)}`;
        sellerIndex++;

        const createdSellerOrder = await tx.sellerOrder.create({
          data: {
            orderId: createdOrder.id,
            sellerId,
            sellerOrderNumber: sellerOrderNum,
            status: "PENDING_ACCEPTANCE",
            subtotalPaise: sellerSubtotal,
            commissionPaise,
            taxPaise: sellerTaxPaise,
            sellerPayoutPaise,
            items: {
              create: items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
                quantity: i.quantity,
                unitPricePaise: i.unitPricePaise,
                lineSubtotalPaise: i.unitPricePaise * BigInt(i.quantity),
                productNameSnapshot: i.productNameSnapshot,
                variantAttributesSnapshot: i.variantAttributesSnapshot as Prisma.InputJsonValue,
                sellerNameSnapshot: i.sellerNameSnapshot,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        createdSellerOrders.push({
          ...createdSellerOrder,
          status: createdSellerOrder.status as SellerOrderStatus,
          items: createdSellerOrder.items.map((it) => ({
            ...it,
          })),
        });
      }

      return {
        ...createdOrder,
        status: createdOrder.status as OrderStatus,
        shippingAddress: createdOrder.shippingAddress as unknown as DomainAddress,
        sellerOrders: createdSellerOrders,
      };
    });
  }

  async findOrderById(orderId: string): Promise<DomainOrder | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        sellerOrders: {
          include: { items: true },
        },
      },
    });
    if (!order) return null;
    return {
      ...order,
      status: order.status as OrderStatus,
      shippingAddress: order.shippingAddress as unknown as DomainAddress,
      sellerOrders: order.sellerOrders.map((so) => ({
        ...so,
        status: so.status as SellerOrderStatus,
        items: so.items.map((it) => ({ ...it })),
      })),
    };
  }

  async findOrdersByCustomerId(customerId: string): Promise<DomainOrder[]> {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: {
        sellerOrders: {
          include: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      ...order,
      status: order.status as OrderStatus,
      shippingAddress: order.shippingAddress as unknown as DomainAddress,
      sellerOrders: order.sellerOrders.map((so) => ({
        ...so,
        status: so.status as SellerOrderStatus,
        items: so.items.map((it) => ({ ...it })),
      })),
    }));
  }

  async findSellerOrdersBySellerId(sellerId: string): Promise<DomainSellerOrder[]> {
    // Strictly scoped query enforcing seller data isolation
    const sellerOrders = await this.prisma.sellerOrder.findMany({
      where: { sellerId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return sellerOrders.map((so) => ({
      ...so,
      status: so.status as SellerOrderStatus,
      items: so.items.map((it) => ({ ...it })),
    }));
  }

  async findSellerOrderById(sellerOrderId: string): Promise<DomainSellerOrder | null> {
    const so = await this.prisma.sellerOrder.findUnique({
      where: { id: sellerOrderId },
      include: { items: true },
    });
    if (!so) return null;
    return {
      ...so,
      status: so.status as SellerOrderStatus,
      items: so.items.map((it) => ({ ...it })),
    };
  }

  async updateSellerOrderStatus(
    sellerOrderId: string,
    status: SellerOrderStatus,
    waybillNumber?: string,
    trackingUrl?: string
  ): Promise<DomainSellerOrder> {
    const data: Prisma.SellerOrderUpdateInput = { status };
    if (waybillNumber) data.waybillNumber = waybillNumber;
    if (trackingUrl) data.trackingUrl = trackingUrl;

    if (status === "ACCEPTED") data.acceptedAt = new Date();
    if (status === "SHIPPED") data.shippedAt = new Date();
    if (status === "DELIVERED") data.deliveredAt = new Date();
    if (status === "CANCELLED") data.cancelledAt = new Date();
    if (status === "REFUNDED") data.refundedAt = new Date();

    const updated = await this.prisma.sellerOrder.update({
      where: { id: sellerOrderId },
      data,
      include: { items: true },
    });

    return {
      ...updated,
      status: updated.status as SellerOrderStatus,
      items: updated.items.map((it) => ({ ...it })),
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<DomainOrder> {
    const data: Prisma.OrderUpdateInput = { status };
    if (status === "PAID") data.paidAt = new Date();
    if (status === "CANCELLED") data.cancelledAt = new Date();

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        sellerOrders: {
          include: { items: true },
        },
      },
    });

    return {
      ...updated,
      status: updated.status as OrderStatus,
      shippingAddress: updated.shippingAddress as unknown as DomainAddress,
      sellerOrders: updated.sellerOrders.map((so) => ({
        ...so,
        status: so.status as SellerOrderStatus,
        items: so.items.map((it) => ({ ...it })),
      })),
    };
  }
}
