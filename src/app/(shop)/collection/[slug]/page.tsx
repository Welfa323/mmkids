import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Zap } from "lucide-react";
import { COLLECTIONS } from "@/modules/catalog";
import { ProductListing } from "@/modules/catalog/components/product-listing";
import { Breadcrumbs } from "@/shared/ui/misc";
import { Countdown } from "@/shared/ui/countdown";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/collection/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = COLLECTIONS.find((x) => x.slug === slug);
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: `/collection/${slug}` } };
}

export default async function CollectionPage(props: PageProps<"/collection/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const c = COLLECTIONS.find((x) => x.slug === slug);
  if (!c) notFound();
  const isFlash = slug === "ventes-flash";

  return (
    <div className="container-page py-5">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: c.title }]} />
      {isFlash ? (
        <header className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-accent-500 via-accent-600 to-rose-600 p-5 text-white sm:p-7">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
              <Zap className="size-7 text-gold-400" fill="currentColor" /> {c.title}
            </h1>
            <p className="mt-1 text-sm text-white/85">{c.description}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/80">Se termine dans</p>
            <Countdown className="text-lg" />
          </div>
        </header>
      ) : (
        <header className="mb-6 mt-4">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{c.title}</h1>
          <p className="mt-1 text-sm text-ink-500">{c.description}</p>
        </header>
      )}
      <ProductListing products={c.products()} searchParams={sp} basePath={`/collection/${slug}`} keepOrder />
    </div>
  );
}
