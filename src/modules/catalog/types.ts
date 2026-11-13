export interface SubCategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  /** Classes Tailwind de la pastille (fond + texte) */
  tone: string;
  subcategories: SubCategory[];
}

export interface Brand {
  slug: string;
  name: string;
  productCount: number;
  categories: string[];
}

export interface VariantValue {
  label: string;
  hex?: string;
  priceDelta?: number;
  /** stock spécifique à la valeur (0 = indisponible dans cette option) */
  stock?: number;
}

export interface VariantOption {
  name: string;
  values: VariantValue[];
}

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "coming_soon";

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  brandName: string;
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  discountPct?: number;
  costPrice: number;
  images: string[];
  video?: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  availability: Availability;
  availableAt?: string;
  isNew: boolean;
  isFlashSale: boolean;
  flashSoldPct?: number;
  createdAt: string;
  options: VariantOption[];
  colors: string[];
  sizes: string[];
  description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  tags: string[];
  warrantyMonths: number;
  weightKg: number;
  sellerStore: string;
}

export type SortKey = "pertinence" | "popularite" | "nouveautes" | "prix-asc" | "prix-desc" | "meilleures-ventes" | "note" | "remise";

export interface ProductFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  brands?: string[];
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  promo?: boolean;
  sort?: SortKey;
}
