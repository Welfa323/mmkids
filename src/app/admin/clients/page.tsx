"use client";

import Link from "next/link";
import { Crown, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { CUSTOMERS, SEGMENT_META, segmentCounts, type CustomerSegment } from "@/modules/crm";
import { ExportButton, KpiCard, PageHeader } from "@/modules/admin/components/ui";
import { Avatar } from "@/shared/ui/misc";
import { DEMO_NOW } from "@/shared/lib/clock";
import { formatNumber, formatPrice, timeAgo } from "@/shared/lib/format";
import { cn, normalize } from "@/shared/lib/utils";

type SortKey = "totalSpent" | "ordersCount" | "lastOrderAt" | "lifetimeValue" | "churnRisk";

export default function ClientsPage() {
  const [seg, setSeg] = useState<CustomerSegment | "">("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("totalSpent");
  const counts = segmentCounts();
  const list = useMemo(
    () =>
      CUSTOMERS.filter((c) => (!seg || c.segment === seg) && (!q || normalize(`${c.name} ${c.email} ${c.phone} ${c.commune}`).includes(normalize(q)))).sort((a, b) =>
        sort === "lastOrderAt" ? b.lastOrderAt.localeCompare(a.lastOrderAt) : (b[sort] as number) - (a[sort] as number),
      ),
    [seg, q, sort],
  );
  const totalCA = CUSTOMERS.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div>
      <PageHeader title="Clients (CRM)" description="Fiche client complète, valeur client et segmentation : meilleurs clients, à risque, inactifs, nouveaux, VIP" actions={<ExportButton rows={list.map((c) => ({ nom: c.name, email: c.email, telephone: c.phone, commandes: c.ordersCount, ca: c.totalSpent, segment: SEGMENT_META[c.segment].label }))} filename="clients" />} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Clients" value={formatNumber(CUSTOMERS.length * 29)} hint="dont 42 affichés (échantillon)" tone="ink" />
        <KpiCard label="CA moyen / client" value={formatPrice(totalCA / CUSTOMERS.length)} />
        <KpiCard label="Valeur vie client (CLV)" value={formatPrice(CUSTOMERS.reduce((s, c) => s + c.lifetimeValue, 0) / CUSTOMERS.length)} tone="gold" icon={<Crown className="size-4" />} />
        <KpiCard label="Nouveaux (30 j)" value={`+${counts.nouveau * 29}`} icon={<UserPlus className="size-4" />} tone="ink" />
      </div>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <button onClick={() => setSeg("")} className={cn("chip shrink-0", !seg && "chip-active")}>
          Tous ({CUSTOMERS.length})
        </button>
        {(Object.keys(SEGMENT_META) as CustomerSegment[]).map((s) => (
          <button key={s} onClick={() => setSeg(s)} className={cn("chip shrink-0", seg === s && "chip-active")} title={SEGMENT_META[s].description}>
            <span className={cn("size-2 rounded-full", SEGMENT_META[s].tone.split(" ")[0])} /> {SEGMENT_META[s].label} ({counts[s]})
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, email, téléphone, commune…" className="input h-10 w-72 pl-9" />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input h-10 w-56">
          <option value="totalSpent">Trier : CA généré</option>
          <option value="ordersCount">Trier : nombre de commandes</option>
          <option value="lastOrderAt">Trier : dernier achat</option>
          <option value="lifetimeValue">Trier : valeur client</option>
          <option value="churnRisk">Trier : risque de départ</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3 text-right">Commandes</th>
              <th className="px-4 py-3 text-right">CA généré</th>
              <th className="px-4 py-3 text-right">Panier moyen</th>
              <th className="px-4 py-3">Dernier achat</th>
              <th className="px-4 py-3">Risque</th>
              <th className="px-4 py-3">Segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {list.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50/60">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3">
                    <Avatar name={c.name} size="sm" />
                    <span>
                      <span className="block font-medium hover:text-brand-700">{c.name}</span>
                      <span className="text-xs text-ink-400">{c.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-xs text-ink-600">
                  {c.commune}, {c.city}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{c.ordersCount}</td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatPrice(c.totalSpent)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{formatPrice(c.avgBasket)}</td>
                <td className="px-4 py-2.5 text-xs text-ink-500">{timeAgo(c.lastOrderAt, DEMO_NOW)}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-100">
                      <div className={cn("h-full rounded-full", c.churnRisk > 60 ? "bg-red-500" : c.churnRisk > 30 ? "bg-amber-500" : "bg-brand-500")} style={{ width: `${c.churnRisk}%` }} />
                    </div>
                    <span className="text-xs text-ink-500">{c.churnRisk} %</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", SEGMENT_META[c.segment].tone)}>{SEGMENT_META[c.segment].label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
