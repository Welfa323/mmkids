import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getAllProducts, getCategory, getProductBySlug, getRelatedProducts, getSimilarProducts, subcategoryName } from "@/modules/catalog";
import { ProductGallery } from "@/modules/catalog/components/product-gallery";
import { ProductBuyBox } from "@/modules/catalog/components/product-buy-box";
import { ProductRail } from "@/modules/catalog/components/product-rail";
import { getProductReviews, ratingDistribution } from "@/modules/reviews";
import { ProductReviews } from "@/modules/reviews/components/product-reviews";
import { RecentlyViewed } from "@/modules/storefront/components/recently-viewed";
import { Breadcrumbs, SectionHeader } from "@/shared/ui/misc";
import { SITE } from "@/shared/lib/site";
import { formatPrice } from "@/shared/lib/format";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = getProductBySlug(slug);
  if (!p) return { title: "Produit introuvable" };
  const title = `${p.name} — ${formatPrice(p.price)}`;
  const description = `${p.name} (${p.brandName}) à ${formatPrice(p.price)}${p.discountPct ? ` (−${p.discountPct} %)` : ""}. ${p.description.slice(0, 110)}…`;
  return {
    title,
    description,
    alternates: { canonical: `/p/${p.slug}` },
    openGraph: { type: "website", title, description, url: `/p/${p.slug}`, images: [{ url: p.images[0], alt: p.name }] },
  };
}

export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const cat = getCategory(product.category)!;
  const reviews = getProductReviews(product);
  const similar = getSimilarProducts(product);
  const related = getRelatedProducts(product);

  const url = `${SITE.url}/p/${product.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      image: product.images.map((i) => `${SITE.url}${i}`),
      description: product.description,
      brand: { "@type": "Brand", name: product.brandName },
      aggregateRating: product.reviewCount ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "XOF",
        price: product.price,
        availability:
          product.availability === "out_of_stock" ? "https://schema.org/OutOfStock" : product.availability === "coming_soon" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
        seller: { "@type": "Organization", name: SITE.name },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE.url },
        { "@type": "ListItem", position: 2, name: cat.name, item: `${SITE.url}/c/${cat.slug}` },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-page py-4">
        <Breadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            { label: cat.name, href: `/c/${cat.slug}` },
            { label: subcategoryName(cat.slug, product.subcategory), href: `/c/${cat.slug}?sous=${product.subcategory}` },
            { label: product.name },
          ]}
        />
      </div>

      <section className="container-page grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div className="lg:sticky lg:top-36 lg:self-start">
          <ProductGallery
            images={product.images}
            video={product.video}
            name={product.name}
            badge={product.discountPct ? <span className="rounded-xl bg-accent-500 px-2.5 py-1 text-sm font-bold text-white">−{product.discountPct}%</span> : null}
          />
        </div>
        <ProductBuyBox product={product} />
      </section>

      {related.length > 0 && (
        <section className="container-page mt-12">
          <SectionHeader title="Souvent achetés ensemble" subtitle="Les clients ayant acheté ce produit ont aussi choisi" />
          <ProductRail products={related} />
        </section>
      )}

      <section className="container-page mt-12 grid gap-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-extrabold">Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-700">{product.description}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-ink-700">
                <span className="grid size-5 place-items-center rounded-full bg-brand-100 text-brand-700">
                  <Check className="size-3" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-extrabold">Caractéristiques</h2>
          <dl className="mt-3 divide-y divide-ink-100 text-sm">
            {product.specs.map((s) => (
              <div key={s.label} className="grid grid-cols-[140px_1fr] gap-3 py-2.5">
                <dt className="text-ink-500">{s.label}</dt>
                <dd className="font-medium text-ink-800">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="avis" className="container-page mt-12 scroll-mt-36">
        <SectionHeader title="Avis clients" subtitle="Uniquement des parents ayant acheté sur MMKids" />
        <ProductReviews reviews={reviews} rating={product.rating} reviewCount={product.reviewCount} distribution={ratingDistribution(product)} productName={product.name} />
      </section>

      {similar.length > 0 && (
        <section className="container-page mt-12">
          <SectionHeader title="Produits similaires" href={`/c/${cat.slug}?sous=${product.subcategory}`} />
          <ProductRail products={similar} />
        </section>
      )}

      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
