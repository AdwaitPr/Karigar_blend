import type { PrismaClient } from "@prisma/client";
import type { CreateSellerInput, ISellerRepository } from "../interfaces/ISellerRepository";
import type { DomainSeller, SellerVerificationStatus } from "../types";

export class PrismaSellerRepository implements ISellerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findSellerById(id: string): Promise<DomainSeller | null> {
    const seller = await this.prisma.seller.findUnique({ where: { id } });
    if (!seller) return null;
    return {
      ...seller,
      verificationStatus: seller.verificationStatus as SellerVerificationStatus,
      commissionRatePercentage: Number(seller.commissionRatePercentage),
    };
  }

  async findSellerByUserId(userId: string): Promise<DomainSeller | null> {
    const seller = await this.prisma.seller.findUnique({ where: { userId } });
    if (!seller) return null;
    return {
      ...seller,
      verificationStatus: seller.verificationStatus as SellerVerificationStatus,
      commissionRatePercentage: Number(seller.commissionRatePercentage),
    };
  }

  async createSeller(input: CreateSellerInput): Promise<DomainSeller> {
    const seller = await this.prisma.seller.create({
      data: {
        userId: input.userId,
        legalName: input.legalName,
        tradeName: input.tradeName,
        gstin: input.gstin,
        pan: input.pan,
        bankDetails: input.bankDetails as object,
        commissionRatePercentage: input.commissionRatePercentage ?? 15.0,
      },
    });

    return {
      ...seller,
      verificationStatus: seller.verificationStatus as SellerVerificationStatus,
      commissionRatePercentage: Number(seller.commissionRatePercentage),
    };
  }

  async updateVerificationStatus(
    sellerId: string,
    status: SellerVerificationStatus
  ): Promise<DomainSeller> {
    const seller = await this.prisma.seller.update({
      where: { id: sellerId },
      data: { verificationStatus: status },
    });

    return {
      ...seller,
      verificationStatus: seller.verificationStatus as SellerVerificationStatus,
      commissionRatePercentage: Number(seller.commissionRatePercentage),
    };
  }
}
