import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Suspense } from "react";
import type { Product } from "../types";
import { filterProducts, getFacets, sortProducts } from "../services/catalog.service";
import { activeFilterCount, PAGE_SIZE, parseFilters, type SearchParamsRecord } from "../services/url-filters";
import { FilterSidebar, ListingToolbar } from "./filter-panel";
import { ProductGrid } from "./product-rail";
import { EmptyState } from "@/shared/ui/misc";
import { ButtonLink } from "@/shared/ui/button";

/**
 * Liste de produits filtrable (serveur) : catégories, marques, collections, recherche.
 * Les filtres vivent dans l'URL → pages partageables et indexables.
 */
export function ProductListing({
  products,
  searchParams,
  basePath,
  hideBrands,
  keepOrder,
}: {
  products: Product[];
  searchParams: SearchParamsRecord;
  basePath: string;
  hideBrands?: boolean;
  /** conserve l'ordre fourni (ex. pertinence de la recherche) quand aucun tri n'est choisi */
  keepOrder?: boolean;
}) {
  const f = parseFilters(searchParams);
  const base = f.subcategory ? products.filter((p) => p.subcategory === f.subcategory) : products;
  const facets = getFacets(base);
  const filtered = filterProducts(base, f);
  const sorted = keepOrder && !f.sort ? filtered : sortProducts(filtered, f.sort);
  const visible = sorted.slice(0, f.page * PAGE_SIZE);
  const activeCount = activeFilterCount(f);

  const nextParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => typeof v === "string" && nextParams.set(k, v));
  nextParams.set("page", String(f.page + 1));

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Suspense>
        <FilterSidebar facets={facets} hideBrands={hideBrands} />
      </Suspense>
      <div className="min-w-0">
        <Suspense>
          <ListingToolbar facets={facets} total={sorted.length} activeCount={activeCount} hideBrands={hideBrands} />
        </Suspense>
        {sorted.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="size-7" />}
            title="Aucun produit ne correspond"
            description="Essayez d'élargir votre fourchette de prix ou de retirer un filtre."
            action={
              <ButtonLink href={basePath} variant="outline">
                Réinitialiser les filtres
              </ButtonLink>
            }
          />
        ) : (
          <>
            <ProductGrid products={visible} className="lg:grid-cols-3 xl:grid-cols-4" />
            {visible.length < sorted.length && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <p className="text-sm text-ink-500">
                  {visible.length} sur {sorted.length} produits
                </p>
                <div className="h-1 w-48 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full bg-brand-500" style={{ width: `${(visible.length / sorted.length) * 100}%` }} />
                </div>
                <Link href={`${basePath}?${nextParams}`} scroll={false} className="mt-1 inline-flex h-11 items-center rounded-xl border border-ink-200 bg-white px-6 text-sm font-semibold hover:bg-ink-50">
                  Voir plus de produits
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
