export interface PaymentIntentResult {
  gatewayTransactionId: string;
  clientSecret: string;
}

export interface WebhookEventResult {
  eventType: string;
  orderId: string;
  status: "success" | "failed";
}

export interface IPaymentGatewayAdapter {
  createPaymentIntent(orderId: string, amountPaise: bigint, currency: string): Promise<PaymentIntentResult>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookEvent(body: unknown): WebhookEventResult;
  processRefund(gatewayTransactionId: string, amountPaise: bigint): Promise<{ refundId: string }>;
}
