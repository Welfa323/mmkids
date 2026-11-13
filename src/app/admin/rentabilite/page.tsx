"use client";

import Image from "next/image";
import { AlertTriangle, Info, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { marginByCategory, monthlyMargin, productProfitability, profitWaterfall } from "@/modules/analytics";
import { ORDERS } from "@/modules/orders";
import { PAYMENT_LABEL } from "@/modules/payment";
import { useAdminSession } from "@/modules/admin/store/admin-session.store";
import { ExportButton, KpiCard, PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { BarList, ColumnChart } from "@/shared/ui/charts";
import { formatCompact, formatNumber, formatPercent, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const WINDOWS = [
  { days: 30, label: "30 jours" },
  { days: 90, label: "Trimestre" },
  { days: 365, label: "12 mois" },
];

export default function ProfitabilityPage() {
  const storeId = useAdminSession((s) => s.storeId);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState<"produit" | "categorie" | "commande" | "mois">("produit");
  const rows = useMemo(() => productProfitability(days, storeId), [days, storeId]);
  const w = profitWaterfall(rows);
  const best = [...rows].sort((a, b) => b.margin - a.margin).slice(0, 8);
  const medianUnits = [...rows].sort((a, b) => a.units - b.units)[Math.floor(rows.length / 2)].units;
  const traps = rows.filter((r) => r.units >= medianUnits * 1.5 && r.marginPct < 8).sort((a, b) => b.units - a.units).slice(0, 8);

  const steps = [
    { label: "Prix de vente (CA)", value: w.revenue, kind: "total" },
    { label: "− Coût d'achat", value: -w.purchaseCost, kind: "minus" },
    { label: "− Commission paiement (2,2 %)", value: -w.commission, kind: "minus" },
    { label: "− Coût de livraison", value: -w.delivery, kind: "minus" },
    { label: "− Remises", value: -w.discount, kind: "minus" },
    { label: "− Autres frais (emballage, pub)", value: -w.otherFees, kind: "minus" },
    { label: "= Marge estimée", value: w.margin, kind: "result" },
  ];

  const orderMargins = useMemo(
    () =>
      ORDERS.filter((o) => !["annulee", "echec_paiement"].includes(o.status))
        .slice(0, 25)
        .map((o) => {
          const cost = o.items.reduce((s, i) => s + i.unitCost * i.qty, 0);
          const commission = Math.round(o.total * 0.022);
          const delivery = o.deliveryMode === "retrait" ? 0 : 1800 + (o.deliveryMode === "express" ? 1500 : 0);
          // Les frais de livraison facturés compensent le coût réel de livraison
          const margin = o.total - cost - commission - delivery;
          return { o, cost, commission, delivery, margin, pct: (margin / o.total) * 100 };
        }),
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyse de rentabilité"
        description="« J'ai vendu 10 millions » ne suffit pas : combien ai-je réellement gagné ?"
        actions={
          <>
            <div className="flex rounded-xl bg-white p-1 ring-1 ring-ink-200">
              {WINDOWS.map((x) => (
                <button key={x.days} onClick={() => setDays(x.days)} className={cn("h-8 rounded-lg px-3 text-xs font-semibold", days === x.days ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100")}>
                  {x.label}
                </button>
              ))}
            </div>
            <ExportButton rows={rows.map((r) => ({ produit: r.product.name, unites: r.units, ca: r.revenue, achat: r.purchaseCost, commission: r.commission, livraison: r.delivery, remise: r.discount, frais: r.otherFees, marge: r.margin }))} filename="rentabilite" />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Chiffre d'affaires" value={formatPrice(w.revenue)} />
        <KpiCard label="Coûts totaux" value={formatPrice(w.revenue - w.margin)} tone="accent" />
        <KpiCard label="Marge estimée" value={formatPrice(w.margin)} hint="ce que vous avez réellement gagné" />
        <KpiCard label="Taux de marge" value={formatPercent((w.margin / w.revenue) * 100)} tone="gold" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Panel title="Du chiffre d'affaires à la marge" subtitle="Décomposition de chaque franc encaissé">
          <ul className="space-y-3">
            {steps.map((s) => {
              const pct = (Math.abs(s.value) / w.revenue) * 100;
              return (
                <li key={s.label}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className={cn(s.kind === "result" ? "font-bold text-ink-900" : s.kind === "total" ? "font-semibold" : "text-ink-600")}>{s.label}</span>
                    <span className={cn("font-semibold tabular-nums", s.kind === "minus" && "text-ink-600", s.kind === "result" && "text-lg font-extrabold text-brand-700")}>
                      {formatPrice(s.value)} <span className="text-xs font-normal text-ink-400">{formatPercent(pct)}</span>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-ink-100">
                    <div className={cn("h-full rounded-full", s.kind === "total" ? "bg-ink-700" : s.kind === "result" ? "bg-brand-600" : "bg-accent-400")} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Marge mensuelle" subtitle="Bénéfice estimé par mois (12 derniers mois)">
          <ColumnChart data={monthlyMargin(storeId).slice(-12) as unknown as Record<string, unknown>[]} series={[{ key: "revenue", label: "Chiffre d'affaires", color: "#2a78d6" }, { key: "profit", label: "Marge estimée" , color: "#0c805e"}]} format={formatPrice} height={300} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={<span className="flex items-center gap-2"><Trophy className="size-4 text-gold-500" /> Produits les plus rentables</span>}>
          <BarList items={best.map((r) => ({ key: r.product.id, label: r.product.name, value: r.margin, sub: formatPercent(r.marginPct) }))} format={formatCompact} />
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><AlertTriangle className="size-4 text-accent-500" /> Se vendent beaucoup mais rapportent peu</span>} subtitle="Volume élevé, marge < 8 % — revoir prix, coûts de livraison ou remises">
          {traps.length ? (
            <ul className="divide-y divide-ink-100">
              {traps.map((r) => (
                <li key={r.product.id} className="flex items-center gap-3 py-2">
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    <Image src={r.product.images[0]} alt="" fill sizes="36px" className="object-contain p-0.5" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="line-clamp-1 font-medium">{r.product.name}</span>
                    <span className="text-xs text-ink-400">{formatNumber(r.units)} unités · livraison {formatPrice(r.delivery / r.units)}/u</span>
                  </span>
                  <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", r.marginPct < 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>{formatPercent(r.marginPct)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">Aucun produit concerné sur la période 🎉</p>
          )}
        </Panel>
      </div>

      <div>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "produit", label: "Marge par produit" },
            { id: "categorie", label: "Par catégorie" },
            { id: "commande", label: "Par commande" },
            { id: "mois", label: "Par mois" },
          ]}
        />
        <div className="card overflow-x-auto">
          {tab === "produit" && (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  {["Produit", "Unités", "Prix de vente", "Coût d'achat", "Commission", "Livraison", "Remise", "Autres", "Marge", "%"].map((h, i) => (
                    <th key={h} className={cn("px-4 py-2.5", i > 0 && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {[...rows].sort((a, b) => b.revenue - a.revenue).slice(0, 30).map((r) => (
                  <tr key={r.product.id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-2.5 font-medium">{r.product.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatNumber(r.units)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatCompact(r.revenue)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatCompact(r.purchaseCost)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatCompact(r.commission)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatCompact(r.delivery)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatCompact(r.discount)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatCompact(r.otherFees)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatCompact(r.margin)}</td>
                    <td className={cn("px-4 py-2.5 text-right font-bold tabular-nums", r.marginPct < 5 ? "text-red-600" : r.marginPct < 15 ? "text-amber-600" : "text-brand-700")}>{formatPercent(r.marginPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "categorie" && (
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-2.5">Catégorie</th>
                  <th className="px-4 py-2.5 text-right">CA</th>
                  <th className="px-4 py-2.5 text-right">Marge</th>
                  <th className="px-4 py-2.5">Taux de marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {marginByCategory(rows).map((c) => (
                  <tr key={c.label}>
                    <td className="px-4 py-2.5 font-medium">{c.label}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatPrice(c.revenue)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatPrice(c.margin)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-ink-100">
                          <div className={cn("h-full rounded-full", c.marginPct < 8 ? "bg-accent-500" : "bg-brand-600")} style={{ width: `${Math.max(0, Math.min(100, c.marginPct * 2.5))}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{formatPercent(c.marginPct)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "commande" && (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  {["Commande", "Paiement", "Total", "Coût produits", "Commission", "Livraison", "Marge", "%"].map((h, i) => (
                    <th key={h} className={cn("px-4 py-2.5", i > 1 && "text-right")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {orderMargins.map(({ o, cost, commission, delivery, margin, pct }) => (
                  <tr key={o.id}>
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold">{o.number}</td>
                    <td className="px-4 py-2.5 text-ink-600">{PAYMENT_LABEL[o.paymentMethod]}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatPrice(o.total)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatPrice(cost)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatPrice(commission)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-500">−{formatPrice(delivery)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatPrice(margin)}</td>
                    <td className={cn("px-4 py-2.5 text-right font-bold", pct < 5 ? "text-red-600" : "text-brand-700")}>{formatPercent(pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === "mois" && (
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-2.5">Mois</th>
                  <th className="px-4 py-2.5 text-right">CA</th>
                  <th className="px-4 py-2.5 text-right">Marge</th>
                  <th className="px-4 py-2.5 text-right">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {monthlyMargin(storeId)
                  .slice(-12)
                  .reverse()
                  .map((m) => (
                    <tr key={m.date}>
                      <td className="px-4 py-2.5 font-medium capitalize">{m.label}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatPrice(m.revenue)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatPrice(m.profit)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{formatPercent(m.marginPct)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
          <Info className="size-3.5" /> Marge = prix de vente − coût d&apos;achat − commission paiement − coût livraison − remise − autres frais.
        </p>
      </div>
    </div>
  );
}
