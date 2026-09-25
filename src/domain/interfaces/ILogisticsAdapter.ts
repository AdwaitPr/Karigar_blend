export interface ShippingRateQuote {
  ratePaise: bigint;
  estimatedDays: number;
}

export interface CreatedShipment {
  waybillNumber: string;
  trackingUrl: string;
  labelPdfUrl?: string;
}

export interface ILogisticsAdapter {
  getShippingRates(originPincode: string, destPincode: string, weightGrams: number): Promise<ShippingRateQuote>;
  createShipment(sellerOrderId: string): Promise<CreatedShipment>;
  getTrackingStatus(waybillNumber: string): Promise<{ status: string; currentLocation?: string }>;
}
