"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllOrders, useAdminOrders } from "@/modules/admin/store/admin-orders.store";
import { useAdminSession } from "@/modules/admin/store/admin-session.store";
import { ExportButton, PageHeader } from "@/modules/admin/components/ui";
import { ORDER_STATUS, type OrderStatus } from "@/modules/orders";
import { PAYMENT_LABEL } from "@/modules/payment";
import { ToneBadge } from "@/shared/ui/badge";
import { toast } from "@/shared/ui/toast";
import { formatDateTime, formatPrice } from "@/shared/lib/format";
import { cn, normalize } from "@/shared/lib/utils";

const GROUPS: { id: string; label: string; statuses: OrderStatus[] }[] = [
  { id: "toutes", label: "Toutes", statuses: [] },
  { id: "a_traiter", label: "À traiter", statuses: ["nouvelle", "paiement_en_attente", "payee"] },
  { id: "preparation", label: "En préparation", statuses: ["en_preparation", "prete"] },
  { id: "expedition", label: "Expédiées / en livraison", statuses: ["expediee", "en_livraison"] },
  { id: "livrees", label: "Livrées", statuses: ["livree"] },
  { id: "incidents", label: "Incidents", statuses: ["annulee", "echec_paiement", "retour", "remboursee"] },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const storeId = useAdminSession((s) => s.storeId);
  const all = useAllOrders();
  const setStatus = useAdminOrders((s) => s.setStatus);
  const [group, setGroup] = useState("toutes");
  const [status, setStatusFilter] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [limit, setLimit] = useState(30);

  const scoped = useMemo(() => all.filter((o) => storeId === "all" || o.storeId === storeId), [all, storeId]);
  const list = useMemo(() => {
    const g = GROUPS.find((x) => x.id === group)!;
    const nq = normalize(q);
    return scoped.filter(
      (o) =>
        (!g.statuses.length || g.statuses.includes(o.status)) &&
        (!status || o.status === status) &&
        (!channel || o.channel === channel) &&
        (!nq || normalize(`${o.number} ${o.customerName} ${o.phone} ${o.city}`).includes(nq)),
    );
  }, [scoped, group, status, channel, q]);

  const bulk = (s: OrderStatus) => {
    list.filter((o) => selected.includes(o.id)).forEach((o) => setStatus(o, s, "Melaine", "Action groupée"));
    toast.success(`${selected.length} commande(s) → ${ORDER_STATUS[s].label}`, { description: "Les clients ont été notifiés par WhatsApp." });
    setSelected([]);
  };

  return (
    <div>
      <PageHeader
        title="Commandes"
        description={`${scoped.length} commandes · statut, paiement, livraison et historique de chaque commande`}
        actions={<ExportButton rows={list.map((o) => ({ numero: o.number, date: o.createdAt, client: o.customerName, total: o.total, statut: ORDER_STATUS[o.status].label, paiement: PAYMENT_LABEL[o.paymentMethod] }))} filename="commandes" />}
      />

      <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {GROUPS.map((g) => {
          const n = g.statuses.length ? scoped.filter((o) => g.statuses.includes(o.status)).length : scoped.length;
          return (
            <button key={g.id} onClick={() => (setGroup(g.id), setStatusFilter(""))} className={cn("chip shrink-0", group === g.id && "chip-active")}>
              {g.label} <span className={cn("rounded-full px-1.5 text-[11px]", group === g.id ? "bg-brand-600 text-white" : "bg-ink-100")}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N°, client, téléphone, ville…" className="input h-10 w-72 pl-9" />
        </label>
        <select value={status} onChange={(e) => setStatusFilter(e.target.value as OrderStatus)} className="input h-10 w-48">
          <option value="">Tous les statuts</option>
          {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS[s].label}
            </option>
          ))}
        </select>
        <select value={channel} onChange={(e) => setChannel(e.target.value)} className="input h-10 w-44">
          <option value="">Tous les canaux</option>
          {["Site web", "Application", "WhatsApp", "Boutique", "Facebook"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-ink-900 px-4 py-2.5 text-sm text-white">
          <span className="font-semibold">{selected.length} sélectionnée(s)</span>
          <span className="text-ink-400">→</span>
          {(["en_preparation", "prete", "expediee", "livree"] as OrderStatus[]).map((s) => (
            <button key={s} onClick={() => bulk(s)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20">
              {ORDER_STATUS[s].label}
            </button>
          ))}
          <button onClick={() => toast.success("Bons de livraison générés", { description: `${selected.length} documents PDF prêts à imprimer` })} className="ml-auto flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold">
            <Printer className="size-3.5" /> Imprimer les BL
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" className="size-4 accent-brand-600" checked={selected.length > 0 && selected.length === Math.min(limit, list.length)} onChange={(e) => setSelected(e.target.checked ? list.slice(0, limit).map((o) => o.id) : [])} aria-label="Tout sélectionner" />
              </th>
              <th className="px-3 py-3">Commande</th>
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3">Articles</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3">Paiement</th>
              <th className="px-3 py-3">Statut</th>
              <th className="px-3 py-3">Canal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {list.slice(0, limit).map((o) => (
              <tr key={o.id} className={cn("cursor-pointer transition hover:bg-brand-50/40", selected.includes(o.id) && "bg-brand-50/60", o.id.startsWith("demo-") && "bg-gold-50/60")} onClick={() => router.push(`/admin/commandes/${o.id}`)}>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="size-4 accent-brand-600" checked={selected.includes(o.id)} onChange={(e) => setSelected((x) => (e.target.checked ? [...x, o.id] : x.filter((y) => y !== o.id)))} aria-label={`Sélectionner ${o.number}`} />
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/commandes/${o.id}`} className="font-mono text-xs font-semibold text-ink-900 hover:text-brand-700">
                    {o.number}
                  </Link>
                  <p className="text-xs text-ink-400">{formatDateTime(o.createdAt)}</p>
                  {o.id.startsWith("demo-") && <span className="text-[10px] font-bold uppercase text-gold-600">Passée en démo</span>}
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium">{o.customerName}</p>
                  <p className="text-xs text-ink-400">{o.city}</p>
                </td>
                <td className="px-3 py-3">
                  <div className="flex -space-x-2">
                    {o.items.slice(0, 3).map((it) => (
                      <span key={it.productId} className="relative size-8 overflow-hidden rounded-lg border-2 border-white bg-ink-50">
                        <Image src={it.image} alt="" fill sizes="32px" className="object-contain p-0.5" />
                      </span>
                    ))}
                    {o.items.length > 3 && <span className="grid size-8 place-items-center rounded-lg border-2 border-white bg-ink-100 text-[10px] font-bold">+{o.items.length - 3}</span>}
                  </div>
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                <td className="px-3 py-3 text-xs">
                  <p>{PAYMENT_LABEL[o.paymentMethod]}</p>
                  <p className={o.paidAmount ? "text-brand-700" : "text-ink-400"}>{o.paidAmount ? "Payé" : "Non payé"}</p>
                </td>
                <td className="px-3 py-3">
                  <ToneBadge tone={ORDER_STATUS[o.status].tone} dot={ORDER_STATUS[o.status].dot}>
                    {ORDER_STATUS[o.status].label}
                  </ToneBadge>
                </td>
                <td className="px-3 py-3 text-xs text-ink-500">{o.channel}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-10 text-center text-sm text-ink-500">Aucune commande pour ces filtres.</p>}
      </div>
      {list.length > limit && (
        <div className="mt-4 text-center">
          <button onClick={() => setLimit((l) => l + 30)} className="chip">
            Afficher 30 de plus ({list.length - limit} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
