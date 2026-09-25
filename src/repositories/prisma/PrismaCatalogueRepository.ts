import type { PrismaClient } from "@prisma/client";
import type { CatalogueFilterParams, ICatalogueRepository } from "../interfaces/ICatalogueRepository";
import type {
  AvailabilityStatus,
  ContentSource,
  CraftCategory,
  DomainArtisan,
  DomainCraft,
  DomainProduct,
  DomainProductVariant,
  DomainRegion,
} from "../types";

function mapSource(source: string): ContentSource {
  return source === "VERIFIED" || source === "verified" ? "verified" : "demo";
}

function mapAvailabilityStatus(status: string): AvailabilityStatus {
  if (status === "MADE_TO_ORDER" || status === "made-to-order") return "made-to-order";
  if (status === "ONE_OF_ONE" || status === "one-of-one") return "one-of-one";
  return "ready";
}

function mapCraftCategory(cat: string): CraftCategory {
  if (cat === "WOOD") return "WOOD";
  if (cat === "PAINTING") return "PAINTING";
  return "TEXTILE";
}

export class PrismaCatalogueRepository implements ICatalogueRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProductById(id: string): Promise<DomainProduct | null> {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) return null;
    return {
      ...p,
      source: mapSource(p.source),
      availabilityStatus: mapAvailabilityStatus(p.availabilityStatus),
      images: p.images,
      detail: p.detail,
    };
  }

  async findProductVariantById(id: string): Promise<DomainProductVariant | null> {
    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) return null;
    return {
      ...variant,
      attributes: variant.attributes as Record<string, string>,
    };
  }

  async listProducts(filters?: CatalogueFilterParams): Promise<DomainProduct[]> {
    const where: Record<string, unknown> = {};
    if (filters?.craftId) where.craftId = filters.craftId;
    if (filters?.regionId) where.regionId = filters.regionId;
    if (filters?.artisanId) where.artisanId = filters.artisanId;
    if (filters?.sellerId) where.sellerId = filters.sellerId;
    if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;

    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      source: mapSource(p.source),
      availabilityStatus: mapAvailabilityStatus(p.availabilityStatus),
      images: p.images,
      detail: p.detail,
    }));
  }

  async findCraftById(id: string): Promise<DomainCraft | null> {
    const c = await this.prisma.craft.findUnique({ where: { id } });
    if (!c) return null;
    return {
      ...c,
      source: mapSource(c.source),
      category: mapCraftCategory(c.category),
    };
  }

  async listCrafts(): Promise<DomainCraft[]> {
    const crafts = await this.prisma.craft.findMany();
    return crafts.map((c) => ({
      ...c,
      source: mapSource(c.source),
      category: mapCraftCategory(c.category),
    }));
  }

  async findRegionById(id: string): Promise<DomainRegion | null> {
    const region = await this.prisma.region.findUnique({ where: { id } });
    if (!region) return null;
    return {
      ...region,
      lat: Number(region.lat),
      lng: Number(region.lng),
    };
  }

  async listRegions(): Promise<DomainRegion[]> {
    const regions = await this.prisma.region.findMany();
    return regions.map((r) => ({
      ...r,
      lat: Number(r.lat),
      lng: Number(r.lng),
    }));
  }

  async findArtisanById(id: string): Promise<DomainArtisan | null> {
    const a = await this.prisma.artisan.findUnique({ where: { id } });
    if (!a) return null;
    return {
      ...a,
      source: mapSource(a.source),
    };
  }

  async listArtisans(): Promise<DomainArtisan[]> {
    const artisans = await this.prisma.artisan.findMany();
    return artisans.map((a) => ({
      ...a,
      source: mapSource(a.source),
    }));
  }
}
