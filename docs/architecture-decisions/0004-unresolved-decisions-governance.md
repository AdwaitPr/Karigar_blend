# ADR 0004: Architectural Governance for Deferred & Unresolved Decisions

* **Status**: Accepted
* **Date**: 2025-03-30
* **Deciders**: Kārigar Engineering Architecture Board

## Context and Problem Statement

`docs/marketplace-contract.md` explicitly identifies five operational and financial decisions that are intentionally left unresolved prior to full production backend implementation:
1. GST Calculation Engine across state boundaries (Inter-state IGST vs Intra-state CGST/SGST).
2. Real-time Inventory Reservation Lock Strategy during checkout spikes (`one-of-one` stock).
3. Long Lead-Time Escrow & Payout Tranches for 60+ day `made-to-order` loom items.
4. Carrier & Logistics Partner Integration APIs.
5. Payment Gateway Provider selection (Razorpay, Cashfree, Stripe India).

We must define explicit architectural boundaries, protective interfaces, and governance criteria so that future development agents or engineers can implement these modules without breaking existing system contracts or architecture invariants.

## Protective Interface Boundaries

For each unresolved decision, the system defines a clean interface abstraction:

### 1. Tax Engine Abstraction (`ITaxCalculator`)
* **Interface**:
  ```typescript
  export interface ITaxCalculator {
    calculateOrderTax(params: {
      sellerState: string;
      customerState: string;
      items: Array<{ variantId: string; subtotal: number; hsnCode?: string }>;
    }): Promise<{
      taxType: "IGST" | "CGST_SGST";
      igstAmount: number;
      cgstAmount: number;
      sgstAmount: number;
      totalTax: number;
    }>;
  }
  ```
* **Governance**: The tax calculator MUST operate on integer paise. Inter-state (seller state != customer state) applies IGST; intra-state applies equal CGST + SGST. The specific vendor SDK (e.g. Cleartax / Avalara / internal rules) is plugged in behind this interface.

### 2. Inventory Lock Abstraction (`IInventoryLockProvider`)
* **Interface**:
  ```typescript
  export interface IInventoryLockProvider {
    acquireLock(variantId: string, qty: number, checkoutSessionId: string, ttlMs: number): Promise<boolean>;
    releaseLock(variantId: string, checkoutSessionId: string): Promise<void>;
    confirmReservation(variantId: string, checkoutSessionId: string): Promise<void>;
  }
  ```
* **Governance**: Protects `one-of-one` and low-stock items during active payment sessions. Implementation may swap between Redis TTL locks (`SET key val NX PX`) and PostgreSQL row locks (`SELECT FOR UPDATE`) without altering checkout domain logic.

### 3. Escrow & Payout Strategy (`IEscrowStrategy`)
* **Interface**:
  ```typescript
  export interface IEscrowStrategy {
    calculatePayoutSchedule(sellerOrder: {
      subtotal: number;
      availabilityStatus: AvailabilityStatus;
      leadTimeDays?: number;
    }): { tranches: Array<{ releaseMilestone: string; percentage: number; amount: number }> };
  }
  ```
* **Governance**: Allows switching between 100% post-delivery payout and multi-tranche material advances for long `made-to-order` items (>30 days on loom).

### 4. Logistics Provider Abstraction (`ILogisticsAdapter`)
* **Interface**:
  ```typescript
  export interface ILogisticsAdapter {
    getShippingRates(originPincode: string, destPincode: string, weightGrams: number): Promise<{ rate: number; estimatedDays: number }>;
    createShipment(sellerOrderId: string): Promise<{ waybillNumber: string; trackingUrl: string; labelPdfUrl: string }>;
    getTrackingStatus(waybillNumber: string): Promise<{ status: string; currentLocation?: string }>;
  }
  ```
* **Governance**: Decouples courier aggregators (Shiprocket, Delhivery, Bluedart) from `SellerOrder` state machines.

### 5. Payment Gateway Adapter (`IPaymentGatewayAdapter`)
* **Interface**:
  ```typescript
  export interface IPaymentGatewayAdapter {
    createPaymentIntent(orderId: string, amount: number, currency: string): Promise<{ gatewayTransactionId: string; clientSecret: string }>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
    parseWebhookEvent(body: unknown): { eventType: string; orderId: string; status: "success" | "failed" };
    processRefund(gatewayTransactionId: string, amount: number): Promise<{ refundId: string }>;
  }
  ```
* **Governance**: Guarantees that payment provider details (Razorpay/Cashfree/Stripe) do not bleed into order domain logic, and client-side code is NEVER authoritative for payment completion.

## Compliance Guarantee

Any future Jules agent or engineer implementing these components MUST:
1. Implement the specified TypeScript interface.
2. Maintain all invariants in `docs/marketplace-contract.md`.
3. Document vendor selection in an update to this ADR file.
