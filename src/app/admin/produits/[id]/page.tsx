"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, ImagePlus, Plus, Sparkles, Trash2, Video, X } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, getAllProducts, type Product, type VariantOption } from "@/modules/catalog";
import { generateDescription, generateSeoTitle } from "@/modules/ai/services/merchant-assistant";
import { Panel } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { SITE } from "@/shared/lib/site";
import { formatPercent, formatPrice } from "@/shared/lib/format";
import { slugify } from "@/shared/lib/utils";

const BLANK: Product = {
  id: "new",
  sku: "MK-NEW-0001",
  slug: "",
  name: "",
  brand: "",
  brandName: "",
  category: "fille",
  subcategory: "robes-fille",
  price: 0,
  costPrice: 0,
  images: [],
  rating: 0,
  reviewCount: 0,
  soldCount: 0,
  stock: 0,
  availability: "in_stock",
  isNew: true,
  isFlashSale: false,
  createdAt: "2026-10-26",
  options: [],
  colors: [],
  sizes: [],
  description: "",
  highlights: [],
  specs: [],
  tags: [],
  warrantyMonths: 0,
  weightKg: 0.5,
  sellerStore: "Entrepôt central Abidjan",
};

export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const source = id === "nouveau" ? BLANK : (getAllProducts().find((p) => p.id === id) ?? BLANK);
  const [p, setP] = useState<Product>(source);
  const [options, setOptions] = useState<VariantOption[]>(source.options);
  const [seoTitle, setSeoTitle] = useState(source.name ? `${source.name} | ${SITE.name}` : "");
  const [seoDesc, setSeoDesc] = useState(source.description.slice(0, 155));
  const [slug, setSlug] = useState(source.slug);
  const cat = CATEGORIES.find((c) => c.slug === p.category)!;
  const margin = p.price ? ((p.price - p.costPrice - p.price * 0.022) / p.price) * 100 : 0;
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success(id === "nouveau" ? "Produit créé" : "Produit enregistré", { description: "Prototype : les modifications ne sont pas persistées." });
        router.push("/admin/produits");
      }}
    >
      <Link href="/admin/produits" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Produits
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">{id === "nouveau" ? "Nouveau produit" : p.name}</h1>
        <div className="flex gap-2">
          {id !== "nouveau" && (
            <Link href={`/p/${p.slug}`} target="_blank" className="flex h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold">
              <Eye className="size-4" /> Voir en ligne
            </Link>
          )}
          <Button>Enregistrer</Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel title="Informations générales">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Nom du produit</label>
                <input className="input" value={p.name} onChange={(e) => (set("name", e.target.value), id === "nouveau" && setSlug(slugify(e.target.value)))} required />
              </div>
              <div>
                <label className="label">Marque</label>
                <input className="input" value={p.brandName} onChange={(e) => set("brandName", e.target.value)} />
              </div>
              <div>
                <label className="label">Référence (SKU)</label>
                <input className="input font-mono" value={p.sku} onChange={(e) => set("sku", e.target.value)} />
              </div>
              <div>
                <label className="label">Catégorie</label>
                <select className="input" value={p.category} onChange={(e) => (set("category", e.target.value), set("subcategory", CATEGORIES.find((c) => c.slug === e.target.value)!.subcategories[0].slug))}>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Sous-catégorie</label>
                <select className="input" value={p.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
                  {cat.subcategories.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="label mb-0">Description</label>
                  <button type="button" onClick={() => p.name && (set("description", generateDescription(p, "pro")), toast.success("Description générée par l'IA"))} className="flex items-center gap-1 text-xs font-semibold text-brand-700">
                    <Sparkles className="size-3.5" /> Générer avec l&apos;IA
                  </button>
                </div>
                <textarea className="input h-36 py-2.5" value={p.description} onChange={(e) => set("description", e.target.value)} />
              </div>
            </div>
          </Panel>

          <Panel title="Médias" subtitle="Plusieurs photos (zoom HD) et une vidéo produit">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {p.images.map((img, i) => (
                <div key={img} className="group relative aspect-square overflow-hidden rounded-xl border border-ink-100 bg-ink-50">
                  <Image src={img} alt="" fill sizes="120px" className="object-contain p-2" />
                  {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-ink-900 px-1.5 text-[10px] font-bold text-white">Principale</span>}
                  <button type="button" onClick={() => set("images", p.images.filter((x) => x !== img))} className="absolute right-1.5 top-1.5 hidden size-6 place-items-center rounded-full bg-white shadow group-hover:grid" aria-label="Retirer">
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-ink-200 text-xs font-semibold text-ink-500 hover:border-brand-400 hover:text-brand-700">
                <ImagePlus className="size-5" /> Ajouter
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files?.length && toast.success(`${e.target.files.length} photo(s) ajoutée(s)`, { description: "Compression et formats WebP/AVIF automatiques" })} />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-ink-50 p-3">
              <Video className="size-5 text-brand-600" />
              <input className="input h-10 flex-1" placeholder="URL de la vidéo (MP4, YouTube…)" defaultValue={p.video} />
            </div>
          </Panel>

          <Panel title="Variantes" subtitle="Taille, couleur, modèle, capacité… avec prix et stock par valeur" actions={<Button type="button" size="sm" variant="outline" onClick={() => setOptions([...options, { name: "Nouvelle option", values: [{ label: "Valeur 1" }] }])}><Plus className="size-4" /> Option</Button>}>
            {options.length === 0 && <p className="text-sm text-ink-500">Produit simple, sans variante.</p>}
            <div className="space-y-4">
              {options.map((o, oi) => (
                <div key={oi} className="rounded-xl border border-ink-100 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <input className="input h-9 w-48 font-semibold" value={o.name} onChange={(e) => setOptions(options.map((x, j) => (j === oi ? { ...x, name: e.target.value } : x)))} />
                    <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== oi))} className="ml-auto text-ink-400 hover:text-red-600" aria-label="Supprimer l'option">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-ink-400">
                      <tr>
                        <th className="pb-1">Valeur</th>
                        <th className="pb-1">Supplément</th>
                        <th className="pb-1">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.values.map((v, vi) => (
                        <tr key={vi}>
                          <td className="py-1 pr-2">
                            <div className="flex items-center gap-2">
                              {v.hex && <span className="size-5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: v.hex }} />}
                              <input className="input h-9" defaultValue={v.label} />
                            </div>
                          </td>
                          <td className="py-1 pr-2">
                            <input className="input h-9" defaultValue={v.priceDelta ?? 0} />
                          </td>
                          <td className="py-1">
                            <input className="input h-9" defaultValue={v.stock ?? ""} placeholder="—" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button type="button" onClick={() => setOptions(options.map((x, j) => (j === oi ? { ...x, values: [...x.values, { label: `Valeur ${x.values.length + 1}` }] } : x)))} className="mt-2 text-xs font-semibold text-brand-700">
                    + Ajouter une valeur
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Référencement (SEO)" subtitle="URL propre, meta title, meta description — aperçu Google">
            <div className="space-y-3">
              <div>
                <label className="label">URL</label>
                <div className="flex">
                  <span className="flex h-11 items-center rounded-l-xl border border-r-0 border-ink-200 bg-ink-50 px-3 text-xs text-ink-500">mmkids.ci/p/</span>
                  <input className="input rounded-l-none font-mono text-xs" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="label mb-0">Meta title</label>
                  <span className={`text-xs ${seoTitle.length > 60 ? "text-red-600" : "text-ink-400"}`}>{seoTitle.length}/60</span>
                </div>
                <input className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                {p.name && (
                  <button type="button" onClick={() => setSeoTitle(generateSeoTitle(p)[0])} className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-700">
                    <Sparkles className="size-3.5" /> Suggestion IA
                  </button>
                )}
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="label mb-0">Meta description</label>
                  <span className={`text-xs ${seoDesc.length > 160 ? "text-red-600" : "text-ink-400"}`}>{seoDesc.length}/160</span>
                </div>
                <textarea className="input h-20 py-2.5" value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} />
              </div>
              <div className="rounded-xl border border-ink-100 p-4">
                <p className="text-xs text-ink-500">mmkids.ci › p › {slug || "…"}</p>
                <p className="mt-0.5 line-clamp-1 text-lg text-[#1a0dab]">{seoTitle || "Titre de la page"}</p>
                <p className="line-clamp-2 text-sm text-ink-600">{seoDesc || "Description affichée dans les résultats de recherche."}</p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Prix & marge">
            <div className="space-y-3">
              <div>
                <label className="label">Prix de vente TTC (FCFA)</label>
                <input className="input" inputMode="numeric" value={p.price || ""} onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")))} />
              </div>
              <div>
                <label className="label">Prix barré (facultatif)</label>
                <input className="input" inputMode="numeric" defaultValue={p.compareAtPrice ?? ""} />
              </div>
              <div>
                <label className="label">Coût d&apos;achat</label>
                <input className="input" inputMode="numeric" value={p.costPrice || ""} onChange={(e) => set("costPrice", Number(e.target.value.replace(/\D/g, "")))} />
              </div>
              <div className="rounded-xl bg-ink-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-500">Marge unitaire estimée</span>
                  <b>{formatPrice(p.price - p.costPrice - p.price * 0.022)}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Taux de marge</span>
                  <b className={margin < 10 ? "text-red-600" : "text-brand-700"}>{formatPercent(margin)}</b>
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="Disponibilité">
            <div className="space-y-3 text-sm">
              <select className="input" value={p.availability} onChange={(e) => set("availability", e.target.value as Product["availability"])}>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock faible</option>
                <option value="out_of_stock">Rupture (alerte clients activée)</option>
                <option value="coming_soon">Bientôt disponible (précommande)</option>
              </select>
              {p.availability === "coming_soon" && <input type="date" className="input" defaultValue={p.availableAt?.slice(0, 10)} />}
              {[
                ["Nouveauté", p.isNew],
                ["Vente flash", p.isFlashSale],
                ["Mettre en avant sur l'accueil", false],
                ["Autoriser la vente hors stock", false],
              ].map(([label, v]) => (
                <div key={String(label)} className="flex items-center justify-between">
                  <span>{label}</span>
                  <Switch checked={Boolean(v)} onChange={() => toast.info("Paramètre modifié")} label={String(label)} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Logistique">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Poids (kg)</label>
                <input className="input" defaultValue={p.weightKg} />
              </div>
              <div>
                <label className="label">Garantie (mois)</label>
                <input className="input" defaultValue={p.warrantyMonths} />
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}
