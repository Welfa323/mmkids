"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, Plus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, getAllProducts } from "@/modules/catalog";
import { KpiCard, PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { SITE } from "@/shared/lib/site";
import { formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const REDIRECTS = [
  { from: "/produit/:slug", to: "/p/:slug", hits: 1240 },
  { from: "/categorie/:slug", to: "/c/:slug", hits: 860 },
  { from: "/search", to: "/recherche", hits: 312 },
  { from: "/cart", to: "/panier", hits: 95 },
  { from: "/promos", to: "/collection/promotions", hits: 421 },
];
const NOT_FOUND = [
  { url: "/p/robe-wax-fille-6-ans", hits: 87, suggestion: "/p/robe-en-wax-fille" },
  { url: "/p/uniforme-2025", hits: 54, suggestion: "/c/ecole?sous=uniformes" },
  { url: "/c/bebes", hits: 31, suggestion: "/c/bebe" },
  { url: "/blog/black-friday-2025", hits: 12, suggestion: "/blog" },
];

export default function SeoPage() {
  const [tab, setTab] = useState<"pages" | "redirections" | "technique">("pages");
  const [redirects, setRedirects] = useState(REDIRECTS);
  const products = getAllProducts().slice(0, 14);
  const checks = [
    { label: "URLs propres et lisibles (/p/robe-en-wax-fille)", ok: true },
    { label: "Sitemap XML généré automatiquement", ok: true, href: "/sitemap.xml" },
    { label: "robots.txt (admin, compte, panier exclus)", ok: true, href: "/robots.txt" },
    { label: "Meta title & description sur toutes les pages", ok: true },
    { label: "Open Graph (partage Facebook / WhatsApp)", ok: true },
    { label: "Schema.org Product, Offer, AggregateRating", ok: true },
    { label: "BreadcrumbList (fil d'Ariane)", ok: true },
    { label: "URL canonique", ok: true },
    { label: "Pages catégories optimisées (texte + filtres indexables)", ok: true },
    { label: "Blog / Le Mag", ok: true, href: "/blog" },
    { label: "Redirections 301", ok: true },
    { label: "Page 404 utile (produits populaires)", ok: true, href: "/page-supprimee" },
    { label: "Images WebP/AVIF + lazy loading", ok: true },
    { label: "Textes alternatifs manquants sur 3 images", ok: false },
  ];

  return (
    <div>
      <PageHeader title="SEO" description="Le site est conçu pour Google dès le départ" actions={<Link href="/sitemap.xml" target="_blank" className="chip"><ExternalLink className="size-4" /> sitemap.xml</Link>} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Score SEO technique" value="96 / 100" />
        <KpiCard label="Pages indexables" value={formatNumber(getAllProducts().length + CATEGORIES.length * 4 + 40)} tone="ink" />
        <KpiCard label="Clics Google (28 j)" value="18 420" delta={23.4} tone="gold" />
        <KpiCard label="Position moyenne" value="8,2" delta={-11.8} invert hint="plus bas = mieux" tone="ink" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "pages", label: "Métadonnées des pages" }, { id: "redirections", label: "Redirections 301 & pages supprimées" }, { id: "technique", label: "Audit technique" }]} />

      {tab === "pages" && (
        <div className="card divide-y divide-ink-100">
          {products.map((p) => {
            const title = `${p.name} — ${formatPrice(p.price)} | ${SITE.name}`;
            const ok = title.length <= 65;
            return (
              <div key={p.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_1fr_auto]">
                <div>
                  <p className="text-xs text-ink-500">mmkids.ci › p › {p.slug}</p>
                  <p className="line-clamp-1 text-[15px] text-[#1a0dab]">{title}</p>
                  <p className="line-clamp-2 text-xs text-ink-600">{p.description.slice(0, 155)}…</p>
                </div>
                <div className="space-y-1 text-xs">
                  <p className={cn("flex items-center gap-1", ok ? "text-brand-700" : "text-amber-600")}>
                    {ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />} Title {title.length} car.
                  </p>
                  <p className="flex items-center gap-1 text-brand-700">
                    <CheckCircle2 className="size-3.5" /> Schema Product + avis
                  </p>
                  <p className="flex items-center gap-1 text-brand-700">
                    <CheckCircle2 className="size-3.5" /> Canonical /p/{p.slug}
                  </p>
                </div>
                <Link href={`/admin/produits/${p.id}`} className="self-center text-xs font-semibold text-brand-700">
                  Modifier →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {tab === "redirections" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Redirections 301" actions={<Button size="sm" variant="outline" onClick={() => setRedirects([{ from: "/ancienne-url", to: "/nouvelle-url", hits: 0 }, ...redirects])}><Plus className="size-3.5" /> Ajouter</Button>}>
            <ul className="divide-y divide-ink-100">
              {redirects.map((r, i) => (
                <li key={i} className="flex items-center gap-2 py-2.5 text-sm">
                  <span className="font-mono text-xs">{r.from}</span>
                  <span className="text-ink-300">→</span>
                  <span className="flex-1 font-mono text-xs text-brand-700">{r.to}</span>
                  <span className="text-xs text-ink-400">{formatNumber(r.hits)} hits</span>
                  <button onClick={() => setRedirects(redirects.filter((_, j) => j !== i))} className="text-ink-300 hover:text-red-600" aria-label="Supprimer">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Pages supprimées (404 détectées)" subtitle="Redirigez-les pour conserver le référencement">
            <ul className="divide-y divide-ink-100">
              {NOT_FOUND.map((n) => (
                <li key={n.url} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-red-600">{n.url}</span>
                    <span className="text-xs text-ink-400">{n.hits} visites</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xs text-ink-500">
                      Suggestion IA : <span className="font-mono">{n.suggestion}</span>
                    </span>
                    <button onClick={() => (setRedirects([{ from: n.url, to: n.suggestion, hits: 0 }, ...redirects]), toast.success("Redirection 301 créée"))} className="text-xs font-semibold text-brand-700">
                      Rediriger (301)
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "technique" && (
        <div className="card divide-y divide-ink-100">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3 px-4 py-3 text-sm">
              {c.ok ? <CheckCircle2 className="size-5 text-brand-600" /> : <XCircle className="size-5 text-amber-500" />}
              <span className="flex-1">{c.label}</span>
              {c.href && (
                <Link href={c.href} target="_blank" className="text-xs font-semibold text-brand-700">
                  Vérifier →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
