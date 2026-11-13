import type { ProductFilters, SortKey } from "../types";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) => (typeof v === "string" && v ? v.split(",") : undefined);
const num = (v: string | string[] | undefined) => (typeof v === "string" && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined);

/** URL -> filtres (URLs propres et partageables : ?marque=mmkids,petit-baobab&prix-max=15000&tri=prix-asc) */
export function parseFilters(sp: SearchParamsRecord): ProductFilters & { page: number } {
  return {
    subcategory: typeof sp.sous === "string" ? sp.sous : undefined,
    brands: list(sp.marque),
    colors: list(sp.couleur),
    sizes: list(sp.taille),
    minPrice: num(sp["prix-min"]),
    maxPrice: num(sp["prix-max"]),
    minRating: num(sp.note),
    inStock: sp.stock === "1",
    promo: sp.promo === "1",
    sort: (typeof sp.tri === "string" ? sp.tri : undefined) as SortKey | undefined,
    page: Math.max(1, num(sp.page) ?? 1),
  };
}

export function activeFilterCount(f: ProductFilters): number {
  return (f.brands?.length ?? 0) + (f.colors?.length ?? 0) + (f.sizes?.length ?? 0) + (f.minPrice != null || f.maxPrice != null ? 1 : 0) + (f.minRating ? 1 : 0) + (f.inStock ? 1 : 0) + (f.promo ? 1 : 0);
}

export const PAGE_SIZE = 20;
