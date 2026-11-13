import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchX, Sparkles } from "lucide-react";
import { getPopular } from "@/modules/catalog";
import { ProductListing } from "@/modules/catalog/components/product-listing";
import { ProductRail } from "@/modules/catalog/components/product-rail";
import { searchProducts, TRENDING_SEARCHES } from "@/modules/search";
import { Breadcrumbs, EmptyState, SectionHeader } from "@/shared/ui/misc";

export async function generateMetadata(props: PageProps<"/recherche">): Promise<Metadata> {
  const { q } = await props.searchParams;
  return { title: q ? `Recherche « ${q} »` : "Recherche", robots: { index: false, follow: true } };
}

export default async function SearchPage(props: PageProps<"/recherche">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const res = searchProducts(q);
  // Recherche par référence : accès direct à la fiche produit
  if (res.matchedSku && res.products[0]) redirect(`/p/${res.products[0].slug}`);

  return (
    <div className="container-page py-5">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Recherche" }]} />
      <header className="mb-5 mt-4">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{q ? <>Résultats pour «&nbsp;{q}&nbsp;»</> : "Rechercher"}</h1>
        {res.fuzzy && res.didYouMean && (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-gold-50 px-3 py-2 text-sm text-ink-700">
            <Sparkles className="size-4 text-gold-600" />
            Aucun résultat exact. Nous affichons des résultats approchants — vouliez-vous dire{" "}
            <Link href={`/recherche?q=${encodeURIComponent(res.didYouMean)}`} className="link">
              {res.didYouMean}
            </Link>{" "}
            ?
          </p>
        )}
      </header>
      {res.products.length > 0 ? (
        <ProductListing products={res.products} searchParams={sp} basePath={`/recherche?q=${encodeURIComponent(q)}`.split("?")[0]} keepOrder />
      ) : (
        <>
          <EmptyState
            icon={<SearchX className="size-7" />}
            title={q ? "Aucun produit trouvé" : "Que cherchez-vous ?"}
            description={
              <>
                Essayez :{" "}
                {TRENDING_SEARCHES.slice(0, 5).map((t, i) => (
                  <span key={t}>
                    {i > 0 && ", "}
                    <Link href={`/recherche?q=${encodeURIComponent(t)}`} className="link">
                      {t}
                    </Link>
                  </span>
                ))}
              </>
            }
          />
          <section className="mt-10">
            <SectionHeader title="Nos produits populaires" />
            <ProductRail products={getPopular(12)} />
          </section>
        </>
      )}
    </div>
  );
}
