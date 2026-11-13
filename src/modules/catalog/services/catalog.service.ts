/**
 * Service catalogue — point d'accès unique aux produits.
 * En production, ces fonctions appelleront l'API (ou la base) : seule cette couche changera.
 */
import { CATEGORIES, CATEGORY_BY_SLUG } from "../data/categories";
import { PRODUCTS, SIZE_ORDER } from "../data/products";
import type { Brand, Product, ProductFilters, SortKey } from "../types";

const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));
const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

export function getAllProducts(): Product[] {
  return PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return BY_SLUG.get(slug);
}

export function getProductById(id: string): Product | undefined {
  return BY_ID.get(id);
}

export function getCategories() {
  return CATEGORIES;
}

export function getCategory(slug: string) {
  return CATEGORY_BY_SLUG[slug];
}

let brandsCache: Brand[] | null = null;
export function getBrands(): Brand[] {
  if (brandsCache) return brandsCache;
  const map = new Map<string, Brand>();
  for (const p of PRODUCTS) {
    const b = map.get(p.brand) ?? { slug: p.brand, name: p.brandName, productCount: 0, categories: [] };
    b.productCount++;
    if (!b.categories.includes(p.category)) b.categories.push(p.category);
    map.set(p.brand, b);
  }
  brandsCache = [...map.values()].sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
  return brandsCache;
}

export function getBrand(slug: string): Brand | undefined {
  return getBrands().find((b) => b.slug === slug);
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "pertinence", label: "Pertinence" },
  { value: "popularite", label: "Popularité" },
  { value: "meilleures-ventes", label: "Meilleures ventes" },
  { value: "nouveautes", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "note", label: "Mieux notés" },
  { value: "remise", label: "Plus fortes remises" },
];

const popularity = (p: Product) => p.soldCount * 0.6 + p.reviewCount * 4 + p.rating * 40;

export function sortProducts(list: Product[], sort: SortKey = "pertinence"): Product[] {
  const arr = [...list];
  const availabilityRank = (p: Product) => (p.availability === "out_of_stock" ? 1 : 0);
  switch (sort) {
    case "prix-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "prix-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "nouveautes":
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "meilleures-ventes":
      return arr.sort((a, b) => b.soldCount - a.soldCount);
    case "note":
      return arr.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "remise":
      return arr.sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
    case "popularite":
      return arr.sort((a, b) => popularity(b) - popularity(a));
    default:
      // Pertinence : produits disponibles d'abord, puis popularité
      return arr.sort((a, b) => availabilityRank(a) - availabilityRank(b) || popularity(b) - popularity(a));
  }
}

export function filterProducts(list: Product[], f: ProductFilters): Product[] {
  return list.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.subcategory && p.subcategory !== f.subcategory) return false;
    if (f.brands?.length && !f.brands.includes(p.brand)) return false;
    if (f.colors?.length && !p.colors.some((c) => f.colors!.includes(c))) return false;
    if (f.sizes?.length && !p.sizes.some((s) => f.sizes!.includes(s))) return false;
    if (f.minPrice != null && p.price < f.minPrice) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.minRating && p.rating < f.minRating) return false;
    if (f.inStock && (p.availability === "out_of_stock" || p.availability === "coming_soon")) return false;
    if (f.promo && !p.discountPct) return false;
    return true;
  });
}

/** Facettes calculées sur un ensemble de produits (pour les filtres avancés) */
export function getFacets(list: Product[]) {
  const count = <K extends string>(keys: K[]) => {
    const m = new Map<K, number>();
    keys.forEach((k) => m.set(k, (m.get(k) ?? 0) + 1));
    return [...m.entries()].map(([value, n]) => ({ value, count: n }));
  };
  const prices = list.map((p) => p.price);
  return {
    brands: count(list.map((p) => p.brand))
      .map((b) => ({ ...b, label: list.find((p) => p.brand === b.value)!.brandName }))
      .sort((a, b) => b.count - a.count),
    colors: count(list.flatMap((p) => p.colors)).sort((a, b) => b.count - a.count),
    sizes: count(list.flatMap((p) => p.sizes)).sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a.value);
      const ib = SIZE_ORDER.indexOf(b.value);
      if (ia >= 0 && ib >= 0) return ia - ib;
      return Number(a.value) - Number(b.value);
    }),
    subcategories: count(list.map((p) => p.subcategory)),
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    promoCount: list.filter((p) => p.discountPct).length,
    inStockCount: list.filter((p) => p.availability === "in_stock" || p.availability === "low_stock").length,
  };
}

/* --------------------------------------------------------- collections */

const available = (p: Product) => p.availability !== "coming_soon";

export function getFlashSales(): Product[] {
  return PRODUCTS.filter((p) => p.isFlashSale);
}

export function getNewArrivals(limit = 12): Product[] {
  return sortProducts(PRODUCTS.filter((p) => p.isNew && available(p)), "nouveautes").slice(0, limit);
}

export function getPopular(limit = 12): Product[] {
  return sortProducts(PRODUCTS.filter(available), "popularite").slice(0, limit);
}

export function getBestSellers(limit = 12): Product[] {
  return sortProducts(PRODUCTS.filter(available), "meilleures-ventes").slice(0, limit);
}

export function getPromotions(limit = 12): Product[] {
  return sortProducts(PRODUCTS.filter((p) => p.discountPct && available(p)), "remise").slice(0, limit);
}

export function getComingSoon(): Product[] {
  return PRODUCTS.filter((p) => p.availability === "coming_soon").sort((a, b) => (a.availableAt ?? "").localeCompare(b.availableAt ?? ""));
}

export interface Collection {
  slug: string;
  title: string;
  description: string;
  products: () => Product[];
}

export const COLLECTIONS: Collection[] = [
  { slug: "ventes-flash", title: "Ventes flash", description: "Des prix fous, pour quelques heures seulement.", products: getFlashSales },
  { slug: "promotions", title: "Promotions", description: "Toutes nos remises du moment, jusqu'à −45 %.", products: () => getPromotions(200) },
  { slug: "nouveautes", title: "Nouveautés", description: "Les dernières pièces arrivées chez MMKids.", products: () => getNewArrivals(200) },
  { slug: "populaires", title: "Produits populaires", description: "Ce que les parents ivoiriens regardent et achètent le plus.", products: () => getPopular(48) },
  { slug: "meilleures-ventes", title: "Meilleures ventes", description: "Le top des ventes, toutes catégories confondues.", products: () => getBestSellers(48) },
  { slug: "bientot-disponibles", title: "Bientôt disponibles", description: "Soyez prévenu dès l'arrivée en stock.", products: getComingSoon },
  { slug: "made-in-ci", title: "Made in Côte d'Ivoire", description: "Les créateurs et ateliers ivoiriens que nous soutenons.", products: () => PRODUCTS.filter((p) => p.tags.includes("local")) },
];

/* --------------------------------------------------------- recommandations */

/** Produits similaires : même sous-catégorie, prix proche */
export function getSimilarProducts(product: Product, limit = 10): Product[] {
  return PRODUCTS.filter((p) => p.id !== product.id && p.subcategory === product.subcategory)
    .sort((a, b) => Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
    .slice(0, limit);
}

/** Produits associés (souvent achetés ensemble) : complémentaires d'autres sous-catégories */
const COMPLEMENTS: Record<string, string[]> = {
  "bodies-grenouilleres": ["accessoires-bebe", "premiers-pas", "chaussettes-collants"],
  "ensembles-bebe": ["accessoires-bebe", "premiers-pas"],
  "accessoires-bebe": ["bodies-grenouilleres", "ensembles-bebe"],
  "robes-fille": ["chaussures-habillees", "sandales-enfant", "accessoires-cheveux"],
  "hauts-fille": ["bas-fille", "baskets-enfant"],
  "bas-fille": ["hauts-fille", "baskets-enfant"],
  "ensembles-fille": ["sandales-enfant", "accessoires-cheveux"],
  "tshirts-garcon": ["bas-garcon", "baskets-enfant", "chapeaux-casquettes"],
  "chemises-garcon": ["bas-garcon", "chaussures-habillees"],
  "bas-garcon": ["tshirts-garcon", "chemises-garcon", "baskets-enfant"],
  "ensembles-garcon": ["baskets-enfant", "chapeaux-casquettes"],
  "robes-ceremonie": ["chaussures-habillees", "accessoires-cheveux", "chaussettes-collants"],
  "costumes-garcon": ["chaussures-habillees", "lunettes-montres"],
  "tenues-traditionnelles": ["sandales-enfant", "chaussures-habillees"],
  "baskets-enfant": ["chaussettes-collants", "survetements"],
  "premiers-pas": ["chaussettes-collants", "bodies-grenouilleres"],
  pyjamas: ["sous-vetements", "chaussettes-collants"],
  survetements: ["baskets-enfant", "maillots-sport"],
  "maillots-bain": ["chapeaux-casquettes", "lunettes-montres", "sandales-enfant"],
  uniformes: ["sacs-scolaires", "chaussures-habillees", "chaussettes-collants"],
  "sacs-scolaires": ["uniformes", "sweats-gilets"],
};

export function getRelatedProducts(product: Product, limit = 8): Product[] {
  const subs = COMPLEMENTS[product.subcategory] ?? [];
  const pool = PRODUCTS.filter((p) => p.id !== product.id && (subs.includes(p.subcategory) || (p.category === product.category && p.subcategory !== product.subcategory)));
  return sortProducts(pool.filter(available), "popularite").slice(0, limit);
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids.map((id) => BY_ID.get(id)).filter((p): p is Product => Boolean(p));
}

/** Prix effectif d'une combinaison de variantes */
export function priceForSelection(product: Product, selection: Record<string, string>): number {
  let price = product.price;
  for (const opt of product.options) {
    const v = opt.values.find((x) => x.label === selection[opt.name]);
    if (v?.priceDelta) price += v.priceDelta;
  }
  return price;
}

export function variantKey(selection: Record<string, string>): string {
  return Object.entries(selection)
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

export function variantLabel(selection: Record<string, string>): string {
  return Object.values(selection).join(" · ");
}
