"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CATEGORIES, getAllProducts, subcategoryName, type Availability } from "@/modules/catalog";
import { ExportButton, PageHeader } from "@/modules/admin/components/ui";
import { ButtonLink } from "@/shared/ui/button";
import { formatNumber, formatPrice } from "@/shared/lib/format";
import { cn, normalize } from "@/shared/lib/utils";

const AV: Record<Availability, { label: string; tone: string }> = {
  in_stock: { label: "En stock", tone: "bg-brand-50 text-brand-700" },
  low_stock: { label: "Stock faible", tone: "bg-amber-50 text-amber-700" },
  out_of_stock: { label: "Rupture", tone: "bg-red-50 text-red-700" },
  coming_soon: { label: "Bientôt", tone: "bg-sky-50 text-sky-700" },
};

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [av, setAv] = useState<Availability | "">("");
  const products = useMemo(
    () => getAllProducts().filter((p) => (!cat || p.category === cat) && (!av || p.availability === av) && (!q || normalize(`${p.name} ${p.sku} ${p.brandName}`).includes(normalize(q)))),
    [q, cat, av],
  );

  return (
    <div>
      <PageHeader
        title="Produits"
        description={`${getAllProducts().length} produits · variantes, photos, vidéo, SEO`}
        actions={
          <>
            <ExportButton rows={products.map((p) => ({ sku: p.sku, nom: p.name, marque: p.brandName, prix: p.price, cout: p.costPrice, stock: p.stock }))} filename="produits" />
            <ButtonLink href="/admin/produits/nouveau">
              <Plus className="size-4" /> Nouveau produit
            </ButtonLink>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, référence, marque…" className="input h-10 w-72 pl-9" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input h-10 w-56">
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setAv("")} className={cn("chip h-10", !av && "chip-active")}>
            Tous
          </button>
          {(Object.keys(AV) as Availability[]).map((a) => (
            <button key={a} onClick={() => setAv(a)} className={cn("chip h-10", av === a && "chip-active")}>
              {AV[a].label} <span className="text-ink-400">({getAllProducts().filter((p) => p.availability === a).length})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3 text-right">Prix</th>
              <th className="px-4 py-3 text-right">Coût</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Ventes</th>
              <th className="px-4 py-3">Variantes</th>
              <th className="px-4 py-3">État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                      <Image src={p.images[0]} alt="" fill sizes="44px" className="object-contain p-1" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-medium hover:text-brand-700">{p.name}</span>
                      <span className="text-xs text-ink-400">
                        {p.sku} · {p.brandName} {p.video && "· 🎬"}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-xs text-ink-600">{subcategoryName(p.category, p.subcategory)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  <span className="font-semibold">{formatPrice(p.price)}</span>
                  {p.discountPct && <span className="block text-xs text-accent-600">−{p.discountPct} %</span>}
                </td>
                <td className="px-4 py-2.5 text-right text-xs tabular-nums text-ink-500">{formatPrice(p.costPrice)}</td>
                <td className={cn("px-4 py-2.5 text-right font-semibold tabular-nums", p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "")}>{formatNumber(p.stock)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{formatNumber(p.soldCount)}</td>
                <td className="px-4 py-2.5 text-xs text-ink-500">{p.options.map((o) => `${o.name} (${o.values.length})`).join(", ") || "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", AV[p.availability].tone)}>{AV[p.availability].label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
