"use client";

import { AlertTriangle, MapPin, Truck } from "lucide-react";
import { useState } from "react";
import { CARRIERS, DELIVERY_MODES, PICKUP_STORES, RELAY_POINTS, ZONES, ZONE_GROUP_LABEL, type DeliveryZone, type ZoneGroup } from "@/modules/delivery";
import { useAllOrders } from "@/modules/admin/store/admin-orders.store";
import { KpiCard, PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { ORDER_STATUS } from "@/modules/orders";
import { ToneBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatPrice } from "@/shared/lib/format";

export default function DeliveryAdminPage() {
  const orders = useAllOrders();
  const [tab, setTab] = useState<"suivi" | "zones" | "modes">("suivi");
  const [zones, setZones] = useState<DeliveryZone[]>(ZONES);
  const [free, setFree] = useState({ abidjan: 30000, interieur: 50000 });
  const inTransit = orders.filter((o) => o.status === "expediee" || o.status === "en_livraison");
  const toShip = orders.filter((o) => o.status === "prete" || o.status === "en_preparation");

  return (
    <div>
      <PageHeader title="Livraison" description="Zones (Abidjan, communes, régions, villes, national, international), tarifs, modes et transporteurs" />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="En cours de livraison" value={String(inTransit.length)} icon={<Truck className="size-4" />} />
        <KpiCard label="À expédier" value={String(toShip.length)} tone="gold" />
        <KpiCard label="Délai moyen Abidjan" value="19 h" hint="objectif < 24 h" tone="ink" />
        <KpiCard label="Incidents ouverts" value="2" tone="accent" icon={<AlertTriangle className="size-4" />} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "suivi", label: "Suivi des livraisons" }, { id: "zones", label: "Zones & tarifs" }, { id: "modes", label: "Modes, points de retrait & transporteurs" }]} />

      {tab === "suivi" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Commande</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Transporteur</th>
                <th className="px-4 py-3">N° de suivi</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {[...inTransit, ...toShip].slice(0, 40).map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-2.5">
                    <p className="font-mono text-xs font-semibold">{o.number}</p>
                    <p className="text-xs text-ink-500">{o.customerName}</p>
                  </td>
                  <td className="px-4 py-2.5 text-xs">{o.city}</td>
                  <td className="px-4 py-2.5 text-xs">{DELIVERY_MODES.find((m) => m.id === o.deliveryMode)?.label}</td>
                  <td className="px-4 py-2.5 text-xs">{o.carrier ?? <span className="text-ink-400">À assigner</span>}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{o.trackingNumber ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <ToneBadge tone={ORDER_STATUS[o.status].tone} dot={ORDER_STATUS[o.status].dot}>
                      {ORDER_STATUS[o.status].label}
                    </ToneBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "zones" && (
        <div className="space-y-5">
          <Panel title="Livraison gratuite à partir d'un montant">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Abidjan</label>
                <input className="input" type="number" value={free.abidjan} onChange={(e) => setFree({ ...free, abidjan: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Intérieur</label>
                <input className="input" type="number" value={free.interieur} onChange={(e) => setFree({ ...free, interieur: Number(e.target.value) })} />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={() => toast.success("Seuils enregistrés")}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </Panel>
          {(["abidjan", "interieur", "international"] as ZoneGroup[]).map((g) => (
            <Panel key={g} title={<span className="flex items-center gap-2"><MapPin className="size-4 text-brand-600" /> {ZONE_GROUP_LABEL[g]}</span>} bodyClassName="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-ink-400">
                  <tr>
                    <th className="pb-2">Zone</th>
                    <th className="pb-2">Tarif (FCFA)</th>
                    <th className="pb-2">Délai (jours)</th>
                    <th className="pb-2">Express 3 h</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {zones
                    .filter((z) => z.group === g)
                    .map((z) => (
                      <tr key={z.id}>
                        <td className="py-2 font-medium">
                          {z.name} {z.region && <span className="text-xs text-ink-400">· {z.region}</span>}
                        </td>
                        <td className="py-2">
                          <input className="input h-9 w-28" type="number" value={z.fee} onChange={(e) => setZones(zones.map((x) => (x.id === z.id ? { ...x, fee: Number(e.target.value) } : x)))} />
                        </td>
                        <td className="py-2 text-ink-600">
                          {z.minDays}–{z.maxDays}
                        </td>
                        <td className="py-2">
                          <Switch checked={z.expressAvailable} onChange={(v) => setZones(zones.map((x) => (x.id === z.id ? { ...x, expressAvailable: v } : x)))} label={`Express ${z.name}`} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Panel>
          ))}
          <button onClick={() => toast.info("Nouvelle zone", { description: "Ajoutez une commune, une ville ou un pays." })} className="w-full rounded-2xl border-2 border-dashed border-ink-200 py-3 text-sm font-semibold text-ink-500 hover:border-brand-400 hover:text-brand-700">
            + Ajouter une zone
          </button>
        </div>
      )}

      {tab === "modes" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Modes de livraison">
            <ul className="divide-y divide-ink-100">
              {DELIVERY_MODES.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-semibold">{m.label}</p>
                    <p className="text-xs text-ink-500">
                      {m.description} {m.surcharge ? `· +${formatPrice(m.surcharge)}` : ""}
                    </p>
                  </div>
                  <Switch checked onChange={() => toast.info("Mode modifié")} label={m.label} />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Transporteurs">
            <ul className="divide-y divide-ink-100">
              {CARRIERS.map((c, i) => (
                <li key={c} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-medium">{c}</span>
                  <span className="text-xs text-ink-500">{["Abidjan — 3 h / 24 h", "Abidjan & Grand-Bassam", "Intérieur du pays", "International", "National économique"][i]}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Retrait en boutique">
            {PICKUP_STORES.map((s) => (
              <p key={s.id} className="py-1.5 text-sm">
                <b>{s.name}</b> — <span className="text-ink-500">{s.address} · {s.hours}</span>
              </p>
            ))}
          </Panel>
          <Panel title="Points relais">
            {RELAY_POINTS.map((r) => (
              <p key={r.id} className="py-1.5 text-sm">
                <b>{r.name}</b> — <span className="text-ink-500">{r.address} · {formatPrice(r.fee)}</span>
              </p>
            ))}
          </Panel>
        </div>
      )}
    </div>
  );
}
