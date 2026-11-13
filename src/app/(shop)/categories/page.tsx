import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CATEGORIES, getAllProducts, getPopular } from "@/modules/catalog";
import { CategoryIcon } from "@/modules/catalog/components/category-icon";
import { cn } from "@/shared/lib/utils";

export const metadata: Metadata = { title: "Toutes les catégories", alternates: { canonical: "/categories" } };

export default function CategoriesPage() {
  const all = getAllProducts();
  const popular = getPopular(500);
  return (
    <div className="container-page py-5">
      <h1 className="mb-5 text-2xl font-extrabold tracking-tight sm:text-3xl">Catégories</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((c) => {
          const covers = popular.filter((p) => p.category === c.slug).slice(0, 3);
          return (
            <div key={c.slug} className="card overflow-hidden">
              <Link href={`/c/${c.slug}`} className="flex items-center gap-3 p-4">
                <span className={cn("grid size-12 place-items-center rounded-2xl", c.tone)}>
                  <CategoryIcon slug={c.slug} className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-bold">{c.name}</span>
                  <span className="text-xs text-ink-500">{all.filter((p) => p.category === c.slug).length} produits</span>
                </span>
                <span className="flex -space-x-3">
                  {covers.map((p) => (
                    <span key={p.id} className="relative size-11 overflow-hidden rounded-full border-2 border-white bg-ink-50">
                      <Image src={p.images[0]} alt="" fill sizes="44px" className="object-contain p-1" />
                    </span>
                  ))}
                </span>
              </Link>
              <ul className="border-t border-ink-100">
                {c.subcategories.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/c/${c.slug}?sous=${s.slug}`} className="flex items-center justify-between px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
                      {s.name}
                      <ChevronRight className="size-4 text-ink-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
