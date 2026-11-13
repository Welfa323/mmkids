"use client";

import { Plus, Sparkles, Ticket } from "lucide-react";
import { useState } from "react";
import { describePromotion, PROMOTION_TYPE_LABEL, PROMOTIONS, type Promotion, type PromotionType } from "@/modules/promotions";
import { CATEGORIES, getBrands } from "@/modules/catalog";
import { KpiCard, PageHeader } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { Sheet } from "@/shared/ui/sheet";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const STATUS = { active: "bg-brand-50 text-brand-700", planifiee: "bg-sky-50 text-sky-700", expiree: "bg-ink-100 text-ink-500", brouillon: "bg-amber-50 text-amber-700" };
const STATUS_LABEL = { active: "Active", planifiee: "Planifiée", expiree: "Expirée", brouillon: "Brouillon" };

export default function PromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>(PROMOTIONS);
  const [filter, setFilter] = useState<Promotion["status"] | "">("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "Chaussures −20 %", code: "NOV20", type: "categorie" as PromotionType, value: 20, category: "chaussures", brand: "", minOrder: 0, startsAt: "2026-11-01", endsAt: "2026-11-15", audience: "Tous les clients", usageLimit: 500 });
  const catLabel = draft.type === "categorie" ? CATEGORIES.find((c) => c.slug === draft.category)?.name : undefined;
  const brandLabel = draft.type === "marque" ? getBrands().find((b) => b.slug === draft.brand)?.name : undefined;
  const shown = promos.filter((p) => !filter || p.status === filter);

  return (
    <div>
      <PageHeader
        title="Promotions"
        description="Moteur promotionnel : codes, pourcentages, montants fixes, produits offerts, lots, catégories, marques, ciblage…"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Nouvelle promotion
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Promotions actives" value={String(promos.filter((p) => p.status === "active").length)} />
        <KpiCard label="Utilisations" value={formatNumber(promos.reduce((s, p) => s + p.usageCount, 0))} tone="ink" />
        <KpiCard label="CA généré" value={formatPrice(promos.reduce((s, p) => s + p.revenue, 0))} tone="gold" />
        <KpiCard label="Planifiées" value={String(promos.filter((p) => p.status === "planifiee").length)} tone="ink" hint="dont Black Friday" />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(["", "active", "planifiee", "expiree", "brouillon"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cn("chip h-9", filter === s && "chip-active")}>
            {s ? STATUS_LABEL[s] : "Toutes"}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => (
          <div key={p.id} className="card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-ink-500">{PROMOTION_TYPE_LABEL[p.type]}</p>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS[p.status])}>{STATUS_LABEL[p.status]}</span>
            </div>
            <p className="mt-3 text-sm text-ink-700">{p.description}</p>
            {p.code && (
              <p className="mt-3 flex items-center gap-2">
                <Ticket className="size-4 text-accent-500" />
                <span className="rounded-lg border border-dashed border-accent-300 bg-accent-50 px-2 py-0.5 font-mono text-sm font-bold text-accent-700">{p.code}</span>
              </p>
            )}
            {p.audience && <p className="mt-2 text-xs text-ink-500">Cible : {p.audience}</p>}
            <div className="mt-auto grid grid-cols-3 gap-2 border-t border-ink-100 pt-3 text-xs">
              <div>
                <p className="text-ink-400">Période</p>
                <p className="font-medium">
                  {formatDate(p.startsAt).replace(" 2026", "")} → {formatDate(p.endsAt).replace(" 2026", "")}
                </p>
              </div>
              <div>
                <p className="text-ink-400">Utilisations</p>
                <p className="font-medium">{formatNumber(p.usageCount)}</p>
              </div>
              <div>
                <p className="text-ink-400">CA généré</p>
                <p className="font-medium">{formatPrice(p.revenue)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle promotion"
        footer={
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              setPromos([{ id: `pr-new-${promos.length}`, name: draft.name, code: draft.code || undefined, type: draft.type, value: draft.value, category: draft.category, brand: draft.brand, minOrder: draft.minOrder || undefined, startsAt: draft.startsAt, endsAt: draft.endsAt, status: "planifiee", usageCount: 0, usageLimit: draft.usageLimit, revenue: 0, audience: draft.audience, description: describePromotion(draft, { category: catLabel, brand: brandLabel }) }, ...promos]);
              setOpen(false);
              toast.success("Promotion planifiée", { description: describePromotion(draft, { category: catLabel, brand: brandLabel }) });
            }}
          >
            Créer la promotion
          </Button>
        }
      >
        <div className="space-y-4 p-5">
          <div className="rounded-2xl bg-gradient-to-br from-accent-500 to-rose-600 p-4 text-white">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/80">
              <Sparkles className="size-3.5" /> Aperçu client
            </p>
            <p className="mt-1 text-lg font-extrabold">{describePromotion(draft, { category: catLabel, brand: brandLabel })}</p>
            {draft.code && <p className="mt-1 text-sm">avec le code <b className="font-mono">{draft.code}</b></p>}
          </div>
          <div>
            <label className="label">Nom interne</label>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Type de promotion</label>
            <select className="input" value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as PromotionType })}>
              {(Object.keys(PROMOTION_TYPE_LABEL) as PromotionType[]).map((t) => (
                <option key={t} value={t}>
                  {PROMOTION_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{draft.type === "code_montant" ? "Montant (FCFA)" : "Valeur (%)"}</label>
              <input className="input" type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Code (facultatif)</label>
              <input className="input font-mono uppercase" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} />
            </div>
          </div>
          {draft.type === "categorie" && (
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {draft.type === "marque" && (
            <div>
              <label className="label">Marque</label>
              <select className="input" value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })}>
                <option value="">Choisir…</option>
                {getBrands().map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Début</label>
              <input type="date" className="input" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} />
            </div>
            <div>
              <label className="label">Fin</label>
              <input type="date" className="input" value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Minimum d&apos;achat</label>
              <input className="input" type="number" value={draft.minOrder} onChange={(e) => setDraft({ ...draft, minOrder: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Limite d&apos;utilisation</label>
              <input className="input" type="number" value={draft.usageLimit} onChange={(e) => setDraft({ ...draft, usageLimit: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Clients ciblés</label>
            <select className="input" value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })}>
              {["Tous les clients", "Nouveaux clients (1re commande)", "Clients VIP", "Clients ayant dépensé > 500 000 FCFA", "Clients inactifs depuis 60 jours", "Anniversaire du mois"].map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
