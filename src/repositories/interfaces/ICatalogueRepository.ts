import type {
  DomainArtisan,
  DomainCraft,
  DomainProduct,
  DomainProductVariant,
  DomainRegion,
} from "../types";

export interface CatalogueFilterParams {
  craftId?: string;
  regionId?: string;
  artisanId?: string;
  sellerId?: string;
  isPublished?: boolean;
}

export interface ICatalogueRepository {
  findProductById(id: string): Promise<DomainProduct | null>;
  findProductVariantById(id: string): Promise<DomainProductVariant | null>;
  listProducts(filters?: CatalogueFilterParams): Promise<DomainProduct[]>;
  findCraftById(id: string): Promise<DomainCraft | null>;
  listCrafts(): Promise<DomainCraft[]>;
  findRegionById(id: string): Promise<DomainRegion | null>;
  listRegions(): Promise<DomainRegion[]>;
  findArtisanById(id: string): Promise<DomainArtisan | null>;
  listArtisans(): Promise<DomainArtisan[]>;
}
