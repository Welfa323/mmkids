"use client";

import { Banknote, CheckCircle2, Clock, CreditCard, Package, RotateCcw, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";
import { chartSeries, getKpis, hourlySeries, PAYMENT_SHARES, productProfitability, salesByCategory, split, storeFactor } from "@/modules/analytics";
import { useAdminSession } from "@/modules/admin/store/admin-session.store";
import { ExportButton, KpiCard, PageHeader, Panel, PeriodPicker, usePeriod } from "@/modules/admin/components/ui";
import { STORES } from "@/modules/stores";
import { BarList, ColumnChart } from "@/shared/ui/charts";
import { formatCompact, formatNumber, formatPercent, formatPrice } from "@/shared/lib/format";

export default function SalesPage() {
  const storeId = useAdminSession((s) => s.storeId);
  const { period, setPeriod, custom, setCustom } = usePeriod("mois");
  const k = useMemo(() => getKpis(period, storeId, custom), [period, storeId, custom]);
  const c = k.current;
  const series = useMemo(() => (k.days.length <= 1 ? hourlySeries(c.revenue) : chartSeries(k.days)), [k.days, c.revenue]);
  const products = useMemo(() => productProfitability(Math.max(1, k.days.length), storeId).sort((a, b) => b.revenue - a.revenue), [k.days.length, storeId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion commerciale"
        description="Le chiffre d'affaires, les commandes et les paiements de la période, par boutique."
        actions={<ExportButton rows={products.slice(0, 50).map((p) => ({ produit: p.product.name, unites: p.units, ca: p.revenue, marge: p.margin }))} filename="ventes" />}
      />
      <PeriodPicker value={period} onChange={setPeriod} custom={custom} onCustom={setCustom} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Chiffre d'affaires" value={formatPrice(c.revenue)} delta={k.delta("revenue")} icon={<Banknote className="size-4" />} />
        <KpiCard label="Nombre de commandes" value={formatNumber(c.orders)} delta={k.delta("orders")} icon={<ShoppingBag className="size-4" />} />
        <KpiCard label="Panier moyen" value={formatPrice(c.avgBasket)} delta={k.delta("avgBasket")} icon={<Wallet className="size-4" />} tone="gold" />
        <KpiCard label="Produits vendus" value={formatNumber(c.units)} delta={k.delta("units")} icon={<Package className="size-4" />} tone="ink" />
        <KpiCard label="Bénéfice estimé" value={formatPrice(c.profit)} delta={k.delta("profit")} icon={<TrendingUp className="size-4" />} />
        <KpiCard label="Paiements encaissés" value={formatPrice(c.payments)} delta={k.delta("payments")} icon={<CreditCard className="size-4" />} />
        <KpiCard label="Commandes en attente" value={formatNumber(c.pendingOrders)} icon={<Clock className="size-4" />} tone="gold" hint="à traiter" />
        <KpiCard label="Commandes livrées" value={formatNumber(c.deliveredOrders)} icon={<CheckCircle2 className="size-4" />} hint={`${formatPercent((c.deliveredOrders / Math.max(1, c.orders)) * 100, 0)} des commandes`} />
        <KpiCard label="Retours" value={formatNumber(c.returns)} delta={k.delta("returns")} invert icon={<RotateCcw className="size-4" />} tone="accent" />
        <KpiCard label="Taux de marge" value={formatPercent((c.profit / Math.max(1, c.revenue)) * 100)} icon={<TrendingUp className="size-4" />} tone="ink" hint="bénéfice / CA" />
      </div>

      <Panel title="Chiffre d'affaires" subtitle={k.days.length <= 1 ? "Par heure" : k.days.length <= 62 ? "Par jour" : "Par mois"}>
        <ColumnChart data={series as unknown as Record<string, unknown>[]} series={[{ key: "revenue", label: "Chiffre d'affaires" }]} format={formatPrice} height={260} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Paiements par moyen">
          <BarList items={split(c.payments, PAYMENT_SHARES).map((x) => ({ ...x, sub: formatPercent((x.value / Math.max(1, c.payments)) * 100, 0) }))} format={formatCompact} color="#2a78d6" />
        </Panel>
        <Panel title="Ventes par catégorie">
          <BarList items={salesByCategory(c.revenue)} format={formatCompact} />
        </Panel>
      </div>

      {storeId === "all" && (
        <Panel title="Comparatif des boutiques" bodyClassName="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
              <tr>
                <th className="pb-2">Boutique</th>
                <th className="pb-2 text-right">CA</th>
                <th className="pb-2 text-right">Commandes</th>
                <th className="pb-2 text-right">Produits vendus</th>
                <th className="pb-2 text-right">En attente</th>
                <th className="pb-2 text-right">Livrées</th>
                <th className="pb-2 text-right">Retours</th>
                <th className="pb-2 text-right">Bénéfice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {STORES.map((s) => {
                const f = storeFactor(s.id);
                return (
                  <tr key={s.id} className="hover:bg-ink-50/60">
                    <td className="py-2.5 font-medium">{s.name}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatPrice(c.revenue * f)}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatNumber(Math.round(c.orders * f))}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatNumber(Math.round(c.units * f))}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatNumber(Math.round(c.pendingOrders * f))}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatNumber(Math.round(c.deliveredOrders * f))}</td>
                    <td className="py-2.5 text-right tabular-nums">{formatNumber(Math.round(c.returns * f))}</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums">{formatPrice(c.profit * f)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}

      <Panel title="Produits vendus sur la période" subtitle="Classés par chiffre d'affaires" bodyClassName="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
            <tr>
              <th className="pb-2">Produit</th>
              <th className="pb-2 text-right">Unités</th>
              <th className="pb-2 text-right">CA</th>
              <th className="pb-2 text-right">Bénéfice estimé</th>
              <th className="pb-2 text-right">Marge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.slice(0, 15).map((p) => (
              <tr key={p.product.id}>
                <td className="py-2.5">
                  <span className="font-medium">{p.product.name}</span> <span className="text-xs text-ink-400">{p.product.sku}</span>
                </td>
                <td className="py-2.5 text-right tabular-nums">{formatNumber(p.units)}</td>
                <td className="py-2.5 text-right tabular-nums">{formatPrice(p.revenue)}</td>
                <td className="py-2.5 text-right tabular-nums">{formatPrice(p.margin)}</td>
                <td className={`py-2.5 text-right font-semibold tabular-nums ${p.marginPct < 5 ? "text-red-600" : "text-brand-700"}`}>{formatPercent(p.marginPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
