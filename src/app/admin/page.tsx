"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Banknote, Boxes, CreditCard, Package, ShoppingBag, Sparkles, TrendingUp, Users, Wallet } from "lucide-react";
import { useMemo } from "react";
import { CHANNEL_SHARES, CITY_SHARES, chartSeries, getKpis, hourlySeries, monthlySeries, productProfitability, salesByCategory, sliceDays, split, storeFactor } from "@/modules/analytics";
import { useAdminSession } from "@/modules/admin/store/admin-session.store";
import { KpiCard, PageHeader, Panel, PeriodPicker, usePeriod, ExportButton } from "@/modules/admin/components/ui";
import { stockoutRisk, stockForStore } from "@/modules/inventory";
import { ABANDONED_CARTS } from "@/modules/marketing";
import { BarList, ColumnChart, TrendChart } from "@/shared/ui/charts";
import { formatCompact, formatNumber, formatPercent, formatPrice } from "@/shared/lib/format";
import { STORES } from "@/modules/stores";

export default function AdminDashboard() {
  const storeId = useAdminSession((s) => s.storeId);
  const { period, setPeriod, custom, setCustom } = usePeriod("aujourdhui");
  const k = useMemo(() => getKpis(period, storeId, custom), [period, storeId, custom]);
  const c = k.current;

  const trend = useMemo(() => {
    if (k.days.length <= 1) return hourlySeries(c.revenue);
    return chartSeries(k.days);
  }, [k.days, c.revenue]);
  const prevDays = useMemo(() => {
    if (k.days.length <= 1) return null;
    const len = k.days.length;
    const all = sliceDays({ from: "2025-01-01", to: "2026-10-26" }, storeId);
    const idx = all.findIndex((d) => d.date === k.days[0].date);
    return idx >= len ? all.slice(idx - len, idx) : null;
  }, [k.days, storeId]);
  const trendData = useMemo(() => (prevDays && k.days.length <= 62 ? chartSeries(k.days, prevDays) : trend), [trend, prevDays, k.days]);

  const months = useMemo(() => monthlySeries(storeId).slice(-12), [storeId]);
  const profit = useMemo(() => productProfitability(Math.max(1, k.days.length), storeId), [k.days.length, storeId]);
  const topSold = [...profit].sort((a, b) => b.units - a.units).slice(0, 6);
  const topProfit = [...profit].sort((a, b) => b.margin - a.margin).slice(0, 6);
  const risk = stockoutRisk(15, storeId);
  const lowStock = stockForStore(storeId).filter((r) => r.status === "faible" || r.status === "rupture");
  const carts = ABANDONED_CARTS.filter((a) => a.status === "a_relancer");

  const periodLabel = period === "aujourdhui" ? "du jour" : period === "hier" ? "d'hier" : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bonjour Melaine 👋"
        description={
          <>
            Vue {storeId === "all" ? "consolidée de toutes les boutiques" : STORES.find((s) => s.id === storeId)?.name} · lundi 26 octobre 2026, 14 h 30
          </>
        }
        actions={<ExportButton label="Rapport PDF" />}
      />
      <PeriodPicker value={period} onChange={setPeriod} custom={custom} onCustom={setCustom} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label={`CA ${periodLabel}`} value={formatPrice(c.revenue)} delta={k.delta("revenue")} icon={<Banknote className="size-4" />} />
        <KpiCard label="Commandes" value={formatNumber(c.orders)} delta={k.delta("orders")} icon={<ShoppingBag className="size-4" />} />
        <KpiCard label="Panier moyen" value={formatPrice(c.avgBasket)} delta={k.delta("avgBasket")} icon={<Wallet className="size-4" />} tone="gold" />
        <KpiCard label="Nouveaux clients" value={`+${formatNumber(c.newCustomers)}`} delta={k.delta("newCustomers")} icon={<Users className="size-4" />} tone="ink" />
        <KpiCard label="Produits vendus" value={formatNumber(c.units)} delta={k.delta("units")} icon={<Package className="size-4" />} tone="ink" />
        <KpiCard label="Bénéfice estimé" value={formatPrice(c.profit)} delta={k.delta("profit")} icon={<TrendingUp className="size-4" />} hint={`Marge ${formatPercent((c.profit / Math.max(1, c.revenue)) * 100)}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Panel title={k.days.length <= 1 ? "Chiffre d'affaires heure par heure" : "Chiffre d'affaires par jour"} subtitle={k.days.length <= 1 ? "Cumul de la journée en cours" : `${formatNumber(k.days.length)} jours · comparé à la période précédente`}>
          <TrendChart
            data={trendData as unknown as Record<string, unknown>[]}
            series={k.days.length <= 1 || !prevDays || k.days.length > 62 ? [{ key: "revenue", label: "Chiffre d'affaires" }] : [{ key: "revenue", label: "Période actuelle" }, { key: "previous", label: "Période précédente", reference: true }]}
            format={formatPrice}
          />
        </Panel>
        <div className="grid gap-4">
          <Panel title="À traiter maintenant" bodyClassName="space-y-2 pt-3">
            {[
              { href: "/admin/commandes", icon: ShoppingBag, label: "Commandes en attente", value: formatNumber(c.pendingOrders), tone: "text-sky-700 bg-sky-50" },
              { href: "/admin/paiements", icon: CreditCard, label: "Paiements à vérifier", value: "3", tone: "text-red-700 bg-red-50" },
              { href: "/admin/paniers-abandonnes", icon: AlertTriangle, label: "Paniers à relancer", value: String(carts.length), tone: "text-accent-700 bg-accent-50" },
              { href: "/admin/stock", icon: Boxes, label: "Alertes stock", value: String(lowStock.length), tone: "text-amber-700 bg-amber-50" },
            ].map((a) => (
              <Link key={a.label} href={a.href} className="flex items-center gap-3 rounded-xl p-2 hover:bg-ink-50">
                <span className={`grid size-9 place-items-center rounded-lg ${a.tone}`}>
                  <a.icon className="size-4" />
                </span>
                <span className="flex-1 text-sm font-medium text-ink-700">{a.label}</span>
                <span className="text-lg font-extrabold">{a.value}</span>
              </Link>
            ))}
          </Panel>
          <Link href="/admin/assistant-ia" className="group rounded-2xl bg-gradient-to-br from-ink-900 to-brand-950 p-5 text-white shadow-soft">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-400">
              <Sparkles className="size-4" /> Assistant IA
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-100">
              <b className="text-white">{risk.length} produits</b> risquent la rupture dans les 15 prochains jours, dont <b className="text-white">{risk[0]?.product.name}</b> ({risk[0]?.daysOfCover ? `${risk[0].daysOfCover} j` : "moins d'1 jour"} de stock).
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-300 group-hover:gap-2">
              Demander à l&apos;IA <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="CA par mois" subtitle="12 derniers mois">
          <ColumnChart data={months as unknown as Record<string, unknown>[]} series={[{ key: "revenue", label: "Chiffre d'affaires" }]} format={formatPrice} />
        </Panel>
        <Panel title="Évolution des commandes" subtitle="12 derniers mois">
          <TrendChart data={months as unknown as Record<string, unknown>[]} series={[{ key: "orders", label: "Commandes", color: "#2a78d6" }]} format={(v) => `${formatNumber(v)} commandes`} axisFormat={formatCompact} height={240} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Ventes par catégorie">
          <BarList items={salesByCategory(c.revenue).map((x) => ({ label: x.label, value: x.value, sub: formatPercent((x.value / Math.max(1, c.revenue)) * 100, 0) }))} format={formatCompact} />
        </Panel>
        <Panel title="Ventes par ville">
          <BarList items={split(c.revenue, CITY_SHARES)} format={formatCompact} color="#2a78d6" />
        </Panel>
        <Panel title="Ventes par canal">
          <BarList items={split(c.revenue, CHANNEL_SHARES).map((x) => ({ ...x, sub: formatPercent((x.value / Math.max(1, c.revenue)) * 100, 0) }))} format={formatCompact} color="#eb6834" />
          <p className="mt-4 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            Le canal WhatsApp progresse de <b>+18 %</b> ce mois : pensez à activer les relances automatiques.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { title: "Produits les plus vendus", rows: topSold, metric: (r: (typeof profit)[number]) => `${formatNumber(r.units)} unités`, sub: (r: (typeof profit)[number]) => formatPrice(r.revenue) },
          { title: "Produits les plus rentables", rows: topProfit, metric: (r: (typeof profit)[number]) => formatPrice(r.margin), sub: (r: (typeof profit)[number]) => `marge ${formatPercent(r.marginPct)}` },
        ].map((t) => (
          <Panel key={t.title} title={t.title} actions={<Link href="/admin/rentabilite" className="text-xs font-semibold text-brand-700">Détails →</Link>} bodyClassName="pt-2">
            <ol className="divide-y divide-ink-100">
              {t.rows.map((r, i) => (
                <li key={r.product.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-5 text-center text-sm font-bold text-ink-400">{i + 1}</span>
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    <Image src={r.product.images[0]} alt="" fill sizes="40px" className="object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-sm font-medium">{r.product.name}</span>
                    <span className="text-xs text-ink-400">{r.product.brandName}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-bold">{t.metric(r)}</span>
                    <span className="text-xs text-ink-400">{t.sub(r)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        ))}
      </div>

      {storeId === "all" && (
        <Panel title="Performance par boutique" subtitle="Chaque point de vente a son stock, ses vendeurs et ses statistiques — la direction garde la vue globale">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="pb-2">Point de vente</th>
                  <th className="pb-2 text-right">CA</th>
                  <th className="pb-2 text-right">Commandes</th>
                  <th className="pb-2 text-right">Panier moyen</th>
                  <th className="pb-2 text-right">Bénéfice</th>
                  <th className="pb-2 pl-6">Part du CA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {STORES.map((s) => {
                  const f = storeFactor(s.id);
                  return (
                    <tr key={s.id}>
                      <td className="py-2.5 font-medium">{s.name}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatPrice(c.revenue * f)}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatNumber(Math.round(c.orders * f))}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatPrice(c.avgBasket * (0.9 + f * 0.4))}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatPrice(c.profit * f)}</td>
                      <td className="py-2.5 pl-6">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-ink-100">
                            <div className="h-full rounded-full bg-brand-600" style={{ width: `${f * 100 * 2.5}%` }} />
                          </div>
                          <span className="text-xs text-ink-500">{formatPercent(f * 100, 0)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
