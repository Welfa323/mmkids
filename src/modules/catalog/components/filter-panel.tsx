"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, SlidersHorizontal, Star, X } from "lucide-react";
import { useState, useTransition } from "react";
import { COLOR_HEX } from "../data/products";
import { SORT_OPTIONS } from "../services/catalog.service";
import { Sheet } from "@/shared/ui/sheet";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { formatNumber, formatPrice } from "@/shared/lib/format";

export interface Facets {
  brands: { value: string; label: string; count: number }[];
  colors: { value: string; count: number }[];
  sizes: { value: string; count: number }[];
  minPrice: number;
  maxPrice: number;
  promoCount: number;
  inStockCount: number;
}

function useFilterUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const update = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params.toString());
    mutate(p);
    p.delete("page");
    start(() => router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false }));
  };
  const toggleList = (key: string, value: string) =>
    update((p) => {
      const cur = p.get(key)?.split(",").filter(Boolean) ?? [];
      const next = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });
  const setParam = (key: string, value?: string) => update((p) => (value ? p.set(key, value) : p.delete(key)));
  return { params, update, toggleList, setParam, pending };
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink-100 py-4 last:border-0">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-sm font-bold text-ink-900">
        {title}
        <ChevronDown className={cn("size-4 text-ink-400 transition", open && "rotate-180")} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

const PRICE_PRESETS = [
  { label: "Moins de 5 000", max: 5000 },
  { label: "5 000 – 10 000", min: 5000, max: 10000 },
  { label: "10 000 – 15 000", min: 10000, max: 15000 },
  { label: "15 000 – 25 000", min: 15000, max: 25000 },
  { label: "Plus de 25 000", min: 25000 },
];

function Filters({ facets, hideBrands }: { facets: Facets; hideBrands?: boolean }) {
  const { params, toggleList, setParam, update } = useFilterUrl();
  const sel = (k: string) => params.get(k)?.split(",") ?? [];
  const [min, setMin] = useState(params.get("prix-min") ?? "");
  const [max, setMax] = useState(params.get("prix-max") ?? "");
  const [showAllBrands, setShowAllBrands] = useState(false);

  return (
    <div>
      <Section title="Disponibilité & offres">
        <div className="space-y-2.5">
          {[
            { key: "stock", label: "En stock uniquement", count: facets.inStockCount },
            { key: "promo", label: "En promotion", count: facets.promoCount },
          ].map((o) => (
            <label key={o.key} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
              <input type="checkbox" checked={params.get(o.key) === "1"} onChange={(e) => setParam(o.key, e.target.checked ? "1" : undefined)} className="size-4 rounded accent-brand-600" />
              <span className="flex-1">{o.label}</span>
              <span className="text-xs text-ink-400">{o.count}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="Prix (FCFA)">
        <div className="space-y-1.5">
          {PRICE_PRESETS.map((p) => {
            const active = params.get("prix-min") === (p.min?.toString() ?? null) && params.get("prix-max") === (p.max?.toString() ?? null);
            return (
              <button
                key={p.label}
                onClick={() =>
                  update((q) => {
                    if (active) {
                      q.delete("prix-min");
                      q.delete("prix-max");
                    } else {
                      if (p.min) q.set("prix-min", String(p.min));
                      else q.delete("prix-min");
                      if (p.max) q.set("prix-max", String(p.max));
                      else q.delete("prix-max");
                    }
                  })
                }
                className={cn("flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition", active ? "bg-brand-50 font-semibold text-brand-800" : "text-ink-700 hover:bg-ink-50")}
              >
                {p.label}
                {active && <Check className="size-4" />}
              </button>
            );
          })}
        </div>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update((q) => {
              if (min) q.set("prix-min", min);
              else q.delete("prix-min");
              if (max) q.set("prix-max", max);
              else q.delete("prix-max");
            });
          }}
        >
          <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={`Min ${formatNumber(facets.minPrice)}`} className="input h-9 px-2.5 text-xs" />
          <span className="text-ink-300">–</span>
          <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder={`Max ${formatNumber(facets.maxPrice)}`} className="input h-9 px-2.5 text-xs" />
          <button className="h-9 shrink-0 rounded-lg bg-ink-900 px-3 text-xs font-semibold text-white">OK</button>
        </form>
      </Section>

      {!hideBrands && facets.brands.length > 1 && (
        <Section title="Marque">
          <div className="space-y-2.5">
            {(showAllBrands ? facets.brands : facets.brands.slice(0, 6)).map((b) => (
              <label key={b.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700">
                <input type="checkbox" checked={sel("marque").includes(b.value)} onChange={() => toggleList("marque", b.value)} className="size-4 rounded accent-brand-600" />
                <span className="flex-1">{b.label}</span>
                <span className="text-xs text-ink-400">{b.count}</span>
              </label>
            ))}
          </div>
          {facets.brands.length > 6 && (
            <button onClick={() => setShowAllBrands((v) => !v)} className="mt-2 text-xs font-semibold text-brand-700">
              {showAllBrands ? "Voir moins" : `Voir les ${facets.brands.length} marques`}
            </button>
          )}
        </Section>
      )}

      {facets.colors.length > 0 && (
        <Section title="Couleur">
          <div className="flex flex-wrap gap-2">
            {facets.colors.map((c) => {
              const active = sel("couleur").includes(c.value);
              return (
                <button key={c.value} onClick={() => toggleList("couleur", c.value)} className={cn("flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-xs font-medium transition", active ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-700 hover:border-ink-300")} title={`${c.count} produits`}>
                  <span className="size-5 rounded-full ring-1 ring-black/10" style={{ background: COLOR_HEX[c.value] }} />
                  {c.value}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {facets.sizes.length > 0 && (
        <Section title="Taille / pointure">
          <div className="grid grid-cols-4 gap-1.5">
            {facets.sizes.map((s) => {
              const active = sel("taille").includes(s.value);
              return (
                <button key={s.value} onClick={() => toggleList("taille", s.value)} className={cn("h-9 rounded-lg border text-xs font-semibold transition", active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 text-ink-700 hover:border-ink-400")}>
                  {s.value}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Note client">
        <div className="space-y-1.5">
          {[4.5, 4, 3].map((n) => {
            const active = params.get("note") === String(n);
            return (
              <button key={n} onClick={() => setParam("note", active ? undefined : String(n))} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition", active ? "bg-brand-50 font-semibold text-brand-800" : "text-ink-700 hover:bg-ink-50")}>
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={cn("size-3.5", i <= Math.floor(n) ? "text-gold-400" : "text-ink-200")} fill="currentColor" strokeWidth={0} />
                  ))}
                </span>
                {String(n).replace(".", ",")} et plus
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

export function FilterSidebar({ facets, hideBrands }: { facets: Facets; hideBrands?: boolean }) {
  return (
    <aside className="hidden lg:block">
      <div className="card sticky top-36 max-h-[calc(100dvh-10rem)] overflow-y-auto px-4 py-1">
        <Filters facets={facets} hideBrands={hideBrands} />
      </div>
    </aside>
  );
}

export function ListingToolbar({ facets, total, activeCount, hideBrands }: { facets: Facets; total: number; activeCount: number; hideBrands?: boolean }) {
  const { params, setParam, update, pending } = useFilterUrl();
  const [open, setOpen] = useState(false);
  const sort = params.get("tri") ?? "pertinence";

  const chips: { label: string; remove: () => void }[] = [];
  params.get("marque")?.split(",").forEach((b) => chips.push({ label: facets.brands.find((x) => x.value === b)?.label ?? b, remove: () => update((p) => {
    const next = p.get("marque")!.split(",").filter((x) => x !== b);
    if (next.length) p.set("marque", next.join(","));
    else p.delete("marque");
  }) }));
  params.get("couleur")?.split(",").forEach((c) => chips.push({ label: c, remove: () => update((p) => {
    const next = p.get("couleur")!.split(",").filter((x) => x !== c);
    if (next.length) p.set("couleur", next.join(","));
    else p.delete("couleur");
  }) }));
  params.get("taille")?.split(",").forEach((s) => chips.push({ label: `Taille ${s}`, remove: () => update((p) => {
    const next = p.get("taille")!.split(",").filter((x) => x !== s);
    if (next.length) p.set("taille", next.join(","));
    else p.delete("taille");
  }) }));
  if (params.get("prix-min") || params.get("prix-max"))
    chips.push({
      label: `${params.get("prix-min") ? formatPrice(Number(params.get("prix-min"))) : "0"} – ${params.get("prix-max") ? formatPrice(Number(params.get("prix-max"))) : "∞"}`,
      remove: () => update((p) => (p.delete("prix-min"), p.delete("prix-max"))),
    });
  if (params.get("note")) chips.push({ label: `${params.get("note")}★ et +`, remove: () => setParam("note") });
  if (params.get("stock")) chips.push({ label: "En stock", remove: () => setParam("stock") });
  if (params.get("promo")) chips.push({ label: "En promotion", remove: () => setParam("promo") });

  return (
    <>
      <div className="sticky top-[7.5rem] z-30 -mx-4 mb-4 border-b border-ink-100 bg-ink-50/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="chip lg:hidden">
            <SlidersHorizontal className="size-4" /> Filtres
            {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">{activeCount}</span>}
          </button>
          <p className={cn("hidden text-sm text-ink-500 transition lg:block", pending && "opacity-50")}>
            <b className="text-ink-900">{formatNumber(total)}</b> produit{total > 1 ? "s" : ""}
          </p>
          <label className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden text-ink-500 sm:inline">Trier par</span>
            <span className="relative">
              <select value={sort} onChange={(e) => setParam("tri", e.target.value === "pertinence" ? undefined : e.target.value)} className="h-9 appearance-none rounded-full border border-ink-200 bg-white pl-3.5 pr-9 text-sm font-medium text-ink-800 outline-none focus:border-brand-500">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            </span>
          </label>
        </div>
        {chips.length > 0 && (
          <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto">
            {chips.map((c) => (
              <button key={c.label} onClick={c.remove} className="flex h-8 shrink-0 items-center gap-1 rounded-full bg-brand-600 pl-3 pr-2 text-xs font-semibold text-white">
                {c.label} <X className="size-3.5" />
              </button>
            ))}
            <button
              onClick={() => update((p) => ["marque", "couleur", "taille", "prix-min", "prix-max", "note", "stock", "promo"].forEach((k) => p.delete(k)))}
              className="h-8 shrink-0 px-2 text-xs font-semibold text-ink-500 hover:text-ink-900"
            >
              Tout effacer
            </button>
          </div>
        )}
      </div>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        title="Filtres"
        footer={
          <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
            Voir {formatNumber(total)} produit{total > 1 ? "s" : ""}
          </Button>
        }
      >
        <div className="px-5">
          <Filters facets={facets} hideBrands={hideBrands} />
        </div>
      </Sheet>
    </>
  );
}
