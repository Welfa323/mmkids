import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_BY_SLUG, getBrands } from "@/modules/catalog";
import { Breadcrumbs } from "@/shared/ui/misc";

export const metadata: Metadata = {
  title: "Toutes les marques",
  description: "MMKids, Petit Baobab, Akwaba Kids, Wax Junior, P'tits Pas… les marques de mode enfant et les ateliers ivoiriens disponibles sur MMKids.",
  alternates: { canonical: "/marques" },
};

export default function BrandsPage() {
  const brands = [...getBrands()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const groups = brands.reduce<Record<string, typeof brands>>((acc, b) => {
    const k = /[a-z]/i.test(b.name[0]) ? b.name[0].toUpperCase() : "#";
    (acc[k] ??= []).push(b);
    return acc;
  }, {});
  const letters = Object.keys(groups).sort();
  return (
    <div className="container-page py-5">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Marques" }]} />
      <h1 className="mb-1 mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Toutes les marques</h1>
      <p className="mb-5 text-sm text-ink-500">{brands.length} marques internationales et ivoiriennes</p>
      <nav className="no-scrollbar sticky top-[7.5rem] z-20 -mx-4 mb-6 flex gap-1 overflow-x-auto bg-ink-50/95 px-4 py-2 backdrop-blur lg:top-36">
        {letters.map((l) => (
          <a key={l} href={`#lettre-${l}`} className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sm font-bold text-ink-700 ring-1 ring-ink-100 hover:bg-brand-600 hover:text-white">
            {l}
          </a>
        ))}
      </nav>
      <div className="space-y-8">
        {letters.map((l) => (
          <section key={l} id={`lettre-${l}`} className="scroll-mt-48">
            <h2 className="mb-3 text-lg font-extrabold text-brand-700">{l}</h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {groups[l].map((b) => (
                <Link key={b.slug} href={`/marque/${b.slug}`} className="card p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                  <p className="font-bold text-ink-900">{b.name}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                    {b.productCount} produit{b.productCount > 1 ? "s" : ""} · {b.categories.map((c) => CATEGORY_BY_SLUG[c]?.shortName).join(", ")}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
