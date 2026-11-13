"use client";

import Image from "next/image";
import Link from "next/link";
import { GitCompareArrows, Plus, Trophy, X } from "lucide-react";
import { getProductsByIds, subcategoryName, type Product } from "@/modules/catalog";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { useAddToCart } from "@/modules/cart/hooks/use-add-to-cart";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { Button, ButtonLink } from "@/shared/ui/button";
import { EmptyState, RatingStars } from "@/shared/ui/misc";
import { formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const AVAIL: Record<Product["availability"], string> = { in_stock: "En stock", low_stock: "Stock faible", out_of_stock: "Rupture", coming_soon: "Bientôt" };

export default function ComparePage() {
  const hydrated = useHydrated();
  const ids = useEngagement((s) => s.compare);
  const toggle = useEngagement((s) => s.toggleCompare);
  const clear = useEngagement((s) => s.clearCompare);
  const addToCart = useAddToCart();
  const products = hydrated ? getProductsByIds(ids) : [];

  if (hydrated && products.length === 0)
    return (
      <div className="container-page py-10">
        <EmptyState icon={<GitCompareArrows className="size-7" />} title="Comparateur vide" description="Ajoutez jusqu'à 4 produits avec l'icône ⇄ pour les comparer côte à côte." action={<ButtonLink href="/c/chaussures">Comparer des chaussures</ButtonLink>} />
      </div>
    );

  const best = (fn: (p: Product) => number, lower = false) => {
    const vals = products.map(fn);
    const target = lower ? Math.min(...vals) : Math.max(...vals);
    return (p: Product) => products.length > 1 && fn(p) === target;
  };
  const cheapest = best((p) => p.price, true);
  const topRated = best((p) => p.rating);
  const bestSeller = best((p) => p.soldCount);

  const specLabels = Array.from(new Set(products.flatMap((p) => p.specs.map((s) => s.label)))).filter((l) => l !== "Référence");

  const rows: { label: string; render: (p: Product) => React.ReactNode }[] = [
    { label: "Prix", render: (p) => <span className={cn("font-extrabold", cheapest(p) && "text-brand-700")}>{formatPrice(p.price)}{cheapest(p) && <Trophy className="ml-1 inline size-4" />}</span> },
    { label: "Remise", render: (p) => (p.discountPct ? <span className="font-semibold text-accent-600">−{p.discountPct} %</span> : "—") },
    { label: "Note", render: (p) => <span className={cn("flex items-center gap-1", topRated(p) && "font-bold text-brand-700")}><RatingStars rating={p.rating} size="xs" /> {String(p.rating).replace(".", ",")}</span> },
    { label: "Ventes", render: (p) => <span className={cn(bestSeller(p) && "font-bold text-brand-700")}>{formatNumber(p.soldCount)}</span> },
    { label: "Disponibilité", render: (p) => AVAIL[p.availability] },
    { label: "Catégorie", render: (p) => subcategoryName(p.category, p.subcategory) },
    ...specLabels.map((l) => ({ label: l, render: (p: Product) => p.specs.find((s) => s.label === l)?.value ?? "—" })),
  ];

  return (
    <div className="container-page py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Comparer ({products.length}/4)</h1>
        <button onClick={clear} className="text-sm font-semibold text-ink-500 hover:text-ink-900">
          Tout effacer
        </button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-32 bg-white p-4 sm:w-44" />
              {products.map((p) => (
                <th key={p.id} className="p-4 align-top font-normal">
                  <div className="relative">
                    <button onClick={() => toggle(p.id)} className="absolute -right-1 -top-1 z-10 grid size-7 place-items-center rounded-full bg-ink-100 text-ink-600 hover:bg-ink-200" aria-label="Retirer">
                      <X className="size-4" />
                    </button>
                    <Link href={`/p/${p.slug}`} className="relative mx-auto block aspect-square w-full max-w-36 overflow-hidden rounded-2xl bg-ink-50">
                      <Image src={p.images[0]} alt={p.name} fill sizes="150px" className="object-contain p-3" />
                    </Link>
                    <p className="mt-2 text-xs font-semibold uppercase text-ink-400">{p.brandName}</p>
                    <Link href={`/p/${p.slug}`} className="line-clamp-2 text-left font-semibold text-ink-800 hover:text-brand-700">
                      {p.name}
                    </Link>
                    <Button size="sm" className="mt-3 w-full" disabled={p.availability === "out_of_stock" || p.availability === "coming_soon"} onClick={() => addToCart(p)}>
                      Ajouter
                    </Button>
                  </div>
                </th>
              ))}
              {products.length < 4 && (
                <th className="p-4 align-top">
                  <Link href="/" className="flex aspect-square w-full max-w-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-200 text-xs font-semibold text-ink-400 hover:border-brand-400 hover:text-brand-700">
                    <Plus className="size-6" /> Ajouter un produit
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((r) => (
              <tr key={r.label} className="even:bg-ink-50/50">
                <th className="sticky left-0 bg-inherit p-4 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">{r.label}</th>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-ink-800">
                    {r.render(p)}
                  </td>
                ))}
                {products.length < 4 && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
