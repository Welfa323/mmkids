"use client";

import { AlertTriangle, ArrowDownUp, CheckCircle2, Clock, CreditCard, Plug, RotateCcw, Undo2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllOrders } from "@/modules/admin/store/admin-orders.store";
import { ExportButton, KpiCard, PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { PAYMENT_LABEL, PAYMENT_METHODS, PROVIDERS, ROUTING, type PaymentMethodId } from "@/modules/payment";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatDateTime, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

type TxStatus = "confirme" | "en_attente" | "echoue" | "rembourse" | "partiel";
const TX_META: Record<TxStatus, { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  confirme: { label: "Confirmé", tone: "bg-brand-50 text-brand-700", icon: CheckCircle2 },
  partiel: { label: "Partiel", tone: "bg-gold-50 text-gold-600", icon: Clock },
  en_attente: { label: "En attente", tone: "bg-amber-50 text-amber-700", icon: Clock },
  echoue: { label: "Échoué", tone: "bg-red-50 text-red-700", icon: XCircle },
  rembourse: { label: "Remboursé", tone: "bg-fuchsia-50 text-fuchsia-700", icon: Undo2 },
};

export default function PaymentsPage() {
  const orders = useAllOrders();
  const [tab, setTab] = useState<"transactions" | "echecs" | "agregateurs">("transactions");
  const [filter, setFilter] = useState<TxStatus | "">("");
  const [refund, setRefund] = useState<string | null>(null);
  const [refunded, setRefunded] = useState<string[]>([]);
  const [routing, setRouting] = useState(ROUTING);
  const [online, setOnline] = useState<Record<string, boolean>>({ cinetpay: true, paydunya: true, stripe: true, offline: true });

  const txs = useMemo(
    () =>
      orders.slice(0, 160).map((o) => {
        const status: TxStatus = refunded.includes(o.id) || o.status === "remboursee" ? "rembourse" : o.status === "echec_paiement" ? "echoue" : o.paidAmount === 0 ? "en_attente" : o.paidAmount < o.total ? "partiel" : "confirme";
        const provider = PROVIDERS.find((p) => p.id === ROUTING[o.paymentMethod][0])!;
        return { o, status, provider, fee: Math.round((o.paidAmount || o.total) * (provider.feePct / 100)) };
      }),
    [orders, refunded],
  );
  const shown = txs.filter((t) => !filter || t.status === filter);
  const sum = (s: TxStatus) => txs.filter((t) => t.status === s).reduce((a, t) => a + (t.o.paidAmount || t.o.total), 0);
  const failed = txs.filter((t) => t.status === "echoue");
  const refundTx = txs.find((t) => t.o.id === refund);

  return (
    <div>
      <PageHeader title="Paiements" description="Transactions Mobile Money, carte, à la livraison et virement · confirmation automatique" actions={<ExportButton rows={shown.map((t) => ({ reference: t.o.paymentRef ?? "", commande: t.o.number, moyen: PAYMENT_LABEL[t.o.paymentMethod], montant: t.o.paidAmount || t.o.total, statut: TX_META[t.status].label }))} filename="transactions" />} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Encaissé" value={formatPrice(sum("confirme") + sum("partiel"))} icon={<CheckCircle2 className="size-4" />} />
        <KpiCard label="En attente" value={formatPrice(sum("en_attente"))} icon={<Clock className="size-4" />} tone="gold" hint="COD & virements" />
        <KpiCard label="Échecs" value={String(failed.length)} icon={<XCircle className="size-4" />} tone="accent" hint={formatPrice(sum("echoue"))} />
        <KpiCard label="Remboursements" value={formatPrice(sum("rembourse"))} icon={<RotateCcw className="size-4" />} tone="ink" />
        <KpiCard label="Commissions agrégateurs" value={formatPrice(txs.reduce((a, t) => a + (t.status === "confirme" || t.status === "partiel" ? t.fee : 0), 0))} icon={<CreditCard className="size-4" />} tone="ink" />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "transactions", label: "Historique des transactions" },
          { id: "echecs", label: <>Paiements échoués <span className="ml-1 rounded-full bg-red-100 px-1.5 text-[11px] text-red-700">{failed.length}</span></> },
          { id: "agregateurs", label: "Agrégateurs & routage" },
        ]}
      />

      {tab === "transactions" && (
        <>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button onClick={() => setFilter("")} className={cn("chip h-8 text-xs", !filter && "chip-active")}>
              Toutes
            </button>
            {(Object.keys(TX_META) as TxStatus[]).map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={cn("chip h-8 text-xs", filter === s && "chip-active")}>
                {TX_META[s].label}
              </button>
            ))}
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Commande / client</th>
                  <th className="px-4 py-3">Moyen</th>
                  <th className="px-4 py-3">Agrégateur</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-right">Frais</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {shown.slice(0, 60).map(({ o, status, provider, fee }) => {
                  const M = TX_META[status];
                  return (
                    <tr key={o.id} className="hover:bg-ink-50/60">
                      <td className="px-4 py-2.5 font-mono text-xs">{o.paymentRef ?? "—"}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-500">{formatDateTime(o.createdAt)}</td>
                      <td className="px-4 py-2.5">
                        <p className="font-mono text-xs font-semibold">{o.number}</p>
                        <p className="text-xs text-ink-500">{o.customerName}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs">{PAYMENT_LABEL[o.paymentMethod]}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-500">{provider.name}</td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatPrice(o.paidAmount || o.total)}</td>
                      <td className="px-4 py-2.5 text-right text-xs tabular-nums text-ink-500">{formatPrice(fee)}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", M.tone)}>
                          <M.icon className="size-3.5" /> {M.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {(status === "confirme" || status === "partiel") && (
                          <button onClick={() => setRefund(o.id)} className="text-xs font-semibold text-ink-500 hover:text-red-600">
                            Rembourser
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "echecs" && (
        <div className="space-y-3">
          {failed.map(({ o }) => (
            <div key={o.id} className="card flex flex-wrap items-center gap-4 p-4">
              <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {o.customerName} · <span className="font-mono text-sm">{o.number}</span>
                </p>
                <p className="text-sm text-ink-500">
                  {PAYMENT_LABEL[o.paymentMethod]} · {formatPrice(o.total)} · {o.history.at(-1)?.note ?? "Transaction refusée"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => toast.success("Lien de paiement renvoyé", { description: `Envoyé par WhatsApp au ${o.phone}` })}>
                  Renvoyer un lien de paiement
                </Button>
                <Button size="sm" onClick={() => toast.success("Commande basculée en paiement à la livraison")}>
                  Passer en paiement à la livraison
                </Button>
              </div>
            </div>
          ))}
          {failed.length === 0 && <p className="card p-8 text-center text-sm text-ink-500">Aucun paiement échoué 🎉</p>}
        </div>
      )}

      {tab === "agregateurs" && (
        <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
          <Panel title={<span className="flex items-center gap-2"><Plug className="size-4 text-brand-600" /> Agrégateurs connectés</span>} subtitle="Chaque agrégateur est un adaptateur indépendant : en ajouter un ne modifie pas le reste de l'application.">
            <ul className="space-y-3">
              {PROVIDERS.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                  <span className={cn("size-2.5 rounded-full", online[p.id] ? "bg-brand-500" : "bg-ink-300")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-ink-500">
                      Frais {String(p.feePct).replace(".", ",")} % · {p.supports.map((s) => PAYMENT_LABEL[s]).join(", ")}
                    </p>
                  </div>
                  <Switch checked={online[p.id]} onChange={(v) => (setOnline({ ...online, [p.id]: v }), toast.info(`${p.name} ${v ? "activé" : "désactivé"}`, { description: v ? undefined : "Le trafic bascule automatiquement sur l'agrégateur suivant." }))} label={p.name} />
                </li>
              ))}
            </ul>
            <button onClick={() => toast.info("Catalogue d'adaptateurs", { description: "Adaptateurs disponibles : Hub2, FedaPay, Flutterwave, Ecobank Pay…" })} className="mt-4 w-full rounded-xl border-2 border-dashed border-ink-200 py-3 text-sm font-semibold text-ink-500 hover:border-brand-400 hover:text-brand-700">
              + Ajouter un agrégateur
            </button>
          </Panel>
          <Panel title={<span className="flex items-center gap-2"><ArrowDownUp className="size-4 text-brand-600" /> Routage par moyen de paiement</span>} subtitle="Ordre de priorité avec bascule automatique en cas de panne">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                {PAYMENT_METHODS.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 font-medium">{m.label}</td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {routing[m.id].map((pid, i) => (
                          <span key={pid} className={cn("rounded-lg px-2 py-1 text-xs font-semibold", i === 0 ? "bg-brand-50 text-brand-800" : "bg-ink-100 text-ink-600")}>
                            {i + 1}. {PROVIDERS.find((p) => p.id === pid)?.name.split(" ")[0]}
                          </span>
                        ))}
                        {routing[m.id].length > 1 && (
                          <button onClick={() => setRouting({ ...routing, [m.id]: [...routing[m.id]].reverse() } as Record<PaymentMethodId, string[]>)} className="grid size-7 place-items-center rounded-lg text-ink-400 hover:bg-ink-100" aria-label="Inverser la priorité">
                            <ArrowDownUp className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      <Modal open={!!refundTx} onClose={() => setRefund(null)} title="Rembourser la transaction">
        {refundTx && (
          <div className="space-y-4 p-5">
            <p className="text-sm text-ink-600">
              Commande <b className="font-mono">{refundTx.o.number}</b> — {refundTx.o.customerName}
            </p>
            <div>
              <label className="label">Montant à rembourser</label>
              <input className="input" defaultValue={refundTx.o.paidAmount} />
            </div>
            <div>
              <label className="label">Destination</label>
              <select className="input">
                <option>Moyen de paiement d&apos;origine ({PAYMENT_LABEL[refundTx.o.paymentMethod]})</option>
                <option>Avoir / bon d&apos;achat client</option>
              </select>
            </div>
            <Button className="w-full" variant="danger" onClick={() => (setRefunded([...refunded, refundTx.o.id]), setRefund(null), toast.success("Remboursement initié", { description: `Via ${refundTx.provider.name}. Un avoir a été généré.` }))}>
              Confirmer le remboursement
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
