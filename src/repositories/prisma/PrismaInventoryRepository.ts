import type { PrismaClient } from "@prisma/client";
import type { IInventoryRepository } from "../interfaces/IInventoryRepository";
import type { DomainInventory } from "../types";

export class PrismaInventoryRepository implements IInventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByVariantId(variantId: string): Promise<DomainInventory | null> {
    const inv = await this.prisma.inventory.findUnique({
      where: { variantId },
    });
    if (!inv) return null;
    return { ...inv };
  }

  async findBySellerId(sellerId: string): Promise<DomainInventory[]> {
    const inventories = await this.prisma.inventory.findMany({
      where: { sellerId },
    });
    return inventories.map((i) => ({ ...i }));
  }

  async reserveStock(variantId: string, quantity: number): Promise<boolean> {
    return await this.prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({ where: { variantId } });
      if (!inv || !inv.isAvailable) return false;

      // Available stock is stockQuantity - allocatedQuantity - reservedQuantity
      const available = inv.stockQuantity - inv.allocatedQuantity - inv.reservedQuantity;
      if (available < quantity) return false;

      await tx.inventory.update({
        where: { variantId },
        data: {
          reservedQuantity: { increment: quantity },
        },
      });

      return true;
    });
  }

  async releaseReservation(variantId: string, quantity: number): Promise<void> {
    await this.prisma.inventory.update({
      where: { variantId },
      data: {
        reservedQuantity: { decrement: quantity },
      },
    });
  }

  async confirmAllocation(variantId: string, quantity: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { variantId },
        data: {
          reservedQuantity: { decrement: quantity },
          allocatedQuantity: { increment: quantity },
          stockQuantity: { decrement: quantity },
        },
      });
    });
  }

  async updateStock(
    variantId: string,
    stockQuantity: number,
    isAvailable = true
  ): Promise<DomainInventory> {
    const updated = await this.prisma.inventory.update({
      where: { variantId },
      data: {
        stockQuantity,
        isAvailable,
      },
    });
    return { ...updated };
  }
}
