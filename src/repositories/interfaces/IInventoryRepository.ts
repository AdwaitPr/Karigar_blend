import type { DomainInventory } from "../types";

export interface IInventoryRepository {
  findByVariantId(variantId: string): Promise<DomainInventory | null>;
  findBySellerId(sellerId: string): Promise<DomainInventory[]>;
  reserveStock(variantId: string, quantity: number): Promise<boolean>;
  releaseReservation(variantId: string, quantity: number): Promise<void>;
  confirmAllocation(variantId: string, quantity: number): Promise<void>;
  updateStock(variantId: string, stockQuantity: number, isAvailable?: boolean): Promise<DomainInventory>;
}
