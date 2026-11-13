"use client";

import { Building2, MapPin, Phone, Users, Warehouse } from "lucide-react";
import { getKpis, storeFactor } from "@/modules/analytics";
import { stockForStore } from "@/modules/inventory";
import { EMPLOYEES, ROLE_BY_ID } from "@/modules/staff";
import { STORES } from "@/modules/stores";
import { useAdminSession } from "@/modules/admin/store/admin-session.store";
import { PageHeader } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { formatDate, formatNumber, formatPrice } from "@/shared/lib/format";

export default function StoresPage() {
  const setStore = useAdminSession((s) => s.setStore);
  const month = getKpis("mois").current;
  return (
    <div>
      <PageHeader title="Boutiques & entrepôts" description="Entreprise → boutiques → entrepôts : chaque point a son stock, ses vendeurs, ses commandes et ses statistiques. La direction garde une vue globale." />
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-ink-900 to-brand-950 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-300">Vue direction · octobre 2026</p>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-ink-300">CA consolidé</p>
            <p className="text-2xl font-extrabold">{formatPrice(month.revenue)}</p>
          </div>
          <div>
            <p className="text-sm text-ink-300">Commandes</p>
            <p className="text-2xl font-extrabold">{formatNumber(month.orders)}</p>
          </div>
          <div>
            <p className="text-sm text-ink-300">Points de vente</p>
            <p className="text-2xl font-extrabold">{STORES.length}</p>
          </div>
          <div>
            <p className="text-sm text-ink-300">Employés</p>
            <p className="text-2xl font-extrabold">{STORES.reduce((s, x) => s + x.staffCount, 0)}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STORES.map((s) => {
          const f = storeFactor(s.id);
          const stock = stockForStore(s.id);
          const staff = EMPLOYEES.filter((e) => e.storeId === s.id);
          const Icon = s.kind === "boutique" ? Building2 : Warehouse;
          return (
            <div key={s.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{s.name}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-500">
                    <MapPin className="size-3" /> {s.address}, {s.city}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-ink-500">
                    <Phone className="size-3" /> {s.phone}
                  </p>
                </div>
                <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-ink-600">{s.kind}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-ink-50 p-3 text-center">
                <div>
                  <p className="text-[11px] text-ink-500">CA du mois</p>
                  <p className="text-sm font-bold">{formatPrice(month.revenue * f).replace(" FCFA", "")}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-500">Commandes</p>
                  <p className="text-sm font-bold">{formatNumber(Math.round(month.orders * f))}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-500">Unités en stock</p>
                  <p className="text-sm font-bold">{formatNumber(stock.reduce((a, r) => a + r.available, 0))}</p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Users className="size-4 text-ink-400" /> Équipe ({s.staffCount})
                </p>
                <p className="text-xs text-ink-500">Responsable : {s.manager}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {staff.map((e) => (
                    <span key={e.id} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-600">
                      {e.name} · {ROLE_BY_ID[e.role].label}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-400">Ouvert le {formatDate(s.openedAt)} · {stock.filter((r) => r.status === "rupture" || r.status === "faible").length} alertes stock</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => setStore(s.id)}>
                Basculer le back-office sur ce point
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
