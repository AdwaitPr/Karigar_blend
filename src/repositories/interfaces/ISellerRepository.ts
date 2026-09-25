import type { DomainSeller, SellerVerificationStatus } from "../types";

export interface CreateSellerInput {
  userId: string;
  legalName: string;
  tradeName: string;
  gstin?: string;
  pan: string;
  bankDetails: unknown;
  commissionRatePercentage?: number;
}

export interface ISellerRepository {
  findSellerById(id: string): Promise<DomainSeller | null>;
  findSellerByUserId(userId: string): Promise<DomainSeller | null>;
  createSeller(input: CreateSellerInput): Promise<DomainSeller>;
  updateVerificationStatus(sellerId: string, status: SellerVerificationStatus): Promise<DomainSeller>;
}
