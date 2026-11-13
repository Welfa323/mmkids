import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_BY_SLUG, getAllProducts, getBrand, getBrands } from "@/modules/catalog";
import { ProductListing } from "@/modules/catalog/components/product-listing";
import { Breadcrumbs } from "@/shared/ui/misc";

export function generateStaticParams() {
  return getBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(props: PageProps<"/marque/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const b = getBrand(slug);
  if (!b) return {};
  return {
    title: `${b.name} : tous les produits ${b.name} en Côte d'Ivoire`,
    description: `Achetez les produits ${b.name} au meilleur prix sur MMKids. ${b.productCount} produits, vêtements et chaussures pour enfants, livraison rapide à Abidjan.`,
    alternates: { canonical: `/marque/${slug}` },
  };
}

export default async function BrandPage(props: PageProps<"/marque/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const b = getBrand(slug);
  if (!b) notFound();
  return (
    <div className="container-page py-5">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Marques", href: "/marques" }, { label: b.name }]} />
      <header className="mb-6 mt-4 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-100">
        <span className="grid size-16 place-items-center rounded-2xl bg-ink-900 text-xl font-black text-white">{b.name.slice(0, 2).toUpperCase()}</span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{b.name}</h1>
          <p className="text-sm text-ink-500">
            {b.productCount} produits · {b.categories.map((c) => CATEGORY_BY_SLUG[c]?.shortName).join(", ")}
          </p>
        </div>
      </header>
      <ProductListing products={getAllProducts().filter((p) => p.brand === slug)} searchParams={sp} basePath={`/marque/${slug}`} hideBrands />
    </div>
  );
}
