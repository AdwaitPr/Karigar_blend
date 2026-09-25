export interface ITaxCalculator {
  calculateOrderTax(params: {
    sellerState: string;
    customerState: string;
    items: Array<{ variantId: string; subtotalPaise: bigint; hsnCode?: string }>;
  }): Promise<{
    taxType: "IGST" | "CGST_SGST";
    igstAmountPaise: bigint;
    cgstAmountPaise: bigint;
    sgstAmountPaise: bigint;
    totalTaxPaise: bigint;
  }>;
}
