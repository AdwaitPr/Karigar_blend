export interface IInventoryLockProvider {
  acquireLock(variantId: string, quantity: number, checkoutSessionId: string, ttlMs: number): Promise<boolean>;
  releaseLock(variantId: string, checkoutSessionId: string): Promise<void>;
  confirmReservation(variantId: string, checkoutSessionId: string): Promise<void>;
}
