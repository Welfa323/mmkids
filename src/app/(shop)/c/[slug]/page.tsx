import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getAllProducts, getCategory, subcategoryName } from "@/modules/catalog";
import { CategoryIcon } from "@/modules/catalog/components/category-icon";
import { ProductListing } from "@/modules/catalog/components/product-listing";
import { Breadcrumbs } from "@/shared/ui/misc";
import { SITE } from "@/shared/lib/site";
import { cn } from "@/shared/lib/utils";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const cat = getCategory(slug);
  if (!cat) return {};
  const sub = typeof sp.sous === "string" ? subcategoryName(slug, sp.sous) : undefined;
  const title = sub ? `${sub} — ${cat.name}` : `${cat.name} : achat en ligne en Côte d'Ivoire`;
  return {
    title,
    description: `${cat.description} Livraison rapide à Abidjan et partout en Côte d'Ivoire. Paiement Mobile Money ou à la livraison.`,
    alternates: { canonical: `/c/${slug}${typeof sp.sous === "string" ? `?sous=${sp.sous}` : ""}` },
    openGraph: { title: `${title} | ${SITE.name}`, url: `/c/${slug}` },
  };
}

export default async function CategoryPage(props: PageProps<"/c/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const cat = getCategory(slug);
  if (!cat) notFound();
  const products = getAllProducts().filter((p) => p.category === slug);
  const activeSub = typeof sp.sous === "string" ? sp.sous : undefined;

  const breadcrumb = [
    { label: "Accueil", href: "/" },
    { label: cat.name, href: activeSub ? `/c/${slug}` : undefined },
    ...(activeSub ? [{ label: subcategoryName(slug, activeSub) }] : []),
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumb.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.label, item: b.href ? `${SITE.url}${b.href}` : undefined })),
  };

  return (
    <div className="container-page py-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={breadcrumb} />
      <header className="mb-5 mt-4 flex items-center gap-4">
        <span className={cn("hidden size-14 place-items-center rounded-2xl sm:grid", cat.tone)}>
          <CategoryIcon slug={slug} className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{activeSub ? subcategoryName(slug, activeSub) : cat.name}</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-ink-500">{cat.description}</p>
        </div>
      </header>

      <nav className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Sous-catégories">
        <Link href={`/c/${slug}`} className={cn("chip shrink-0", !activeSub && "chip-active")}>
          Tout ({products.length})
        </Link>
        {cat.subcategories.map((s) => {
          const n = products.filter((p) => p.subcategory === s.slug).length;
          return (
            <Link key={s.slug} href={`/c/${slug}?sous=${s.slug}`} className={cn("chip shrink-0", activeSub === s.slug && "chip-active")}>
              {s.name} <span className="text-ink-400">({n})</span>
            </Link>
          );
        })}
      </nav>

      <ProductListing products={products} searchParams={sp} basePath={`/c/${slug}`} />
    </div>
  );
}
