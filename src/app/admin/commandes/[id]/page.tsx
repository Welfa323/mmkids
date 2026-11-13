"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, FileText, Mail, MessageCircle, Phone, Save, Truck } from "lucide-react";
import { useState } from "react";
import { useAllOrders, useAdminOrders } from "@/modules/admin/store/admin-orders.store";
import { Panel } from "@/modules/admin/components/ui";
import { ORDER_FLOW, ORDER_STATUS, nextStatuses, type OrderStatus } from "@/modules/orders";
import { OrderHistoryTimeline } from "@/modules/orders/components/order-tracking";
import { PAYMENT_LABEL } from "@/modules/payment";
import { CARRIERS, DELIVERY_MODES } from "@/modules/delivery";
import { DOCUMENT_META, documentNumber, type DocumentType } from "@/modules/billing";
import { CUSTOMER_BY_ID } from "@/modules/crm";
import { storeName } from "@/modules/stores";
import { ToneBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { EmptyState, Switch } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatDateTime, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = useAllOrders().find((o) => o.id === id);
  const { setStatus, patch } = useAdminOrders();
  const [comment, setComment] = useState(order?.internalComment ?? "");
  const [carrier, setCarrier] = useState(order?.carrier ?? CARRIERS[0]);
  const [tracking, setTracking] = useState(order?.trackingNumber ?? "");
  const [notify, setNotify] = useState(true);

  if (!order) return <EmptyState icon={<Truck className="size-7" />} title="Commande introuvable" action={<Link href="/admin/commandes" className="link">Retour</Link>} />;
  const flowIdx = ORDER_FLOW.indexOf(order.status);
  const customer = CUSTOMER_BY_ID[order.customerId];

  const change = (s: OrderStatus) => {
    setStatus(order, s, "Melaine");
    if (s === "expediee" && !order.trackingNumber) patch(order.id, { carrier, trackingNumber: tracking || `TRK${Date.now().toString().slice(-9)}CI` });
    toast.success(`Statut : ${ORDER_STATUS[s].label}`, { description: notify ? `${order.customerName} a été notifié(e) par WhatsApp et SMS.` : undefined });
  };

  return (
    <div className="space-y-5">
      <Link href="/admin/commandes" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Commandes
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-extrabold tracking-tight">
            <span className="font-mono">{order.number}</span>
            <ToneBadge tone={ORDER_STATUS[order.status].tone} dot={ORDER_STATUS[order.status].dot} className="text-sm">
              {ORDER_STATUS[order.status].label}
            </ToneBadge>
          </h1>
          <p className="text-sm text-ink-500">
            {formatDateTime(order.createdAt)} · {order.channel} · {storeName(order.storeId)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-600">
          Notifier le client <Switch checked={notify} onChange={setNotify} label="Notifier le client" />
        </div>
      </div>

      {/* Workflow des statuts */}
      <div className="card overflow-x-auto p-5">
        <ol className="flex min-w-[760px] items-center">
          {ORDER_FLOW.map((s, i) => {
            const done = flowIdx >= i;
            return (
              <li key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={cn("grid size-8 place-items-center rounded-full text-xs font-bold", done ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400", flowIdx === i && "ring-4 ring-brand-500/25")}>{done ? <Check className="size-4" /> : i + 1}</span>
                  <span className={cn("whitespace-nowrap text-[11px] font-semibold", done ? "text-ink-800" : "text-ink-400")}>{ORDER_STATUS[s].label}</span>
                </div>
                {i < ORDER_FLOW.length - 1 && <span className={cn("mx-1 mb-5 h-0.5 flex-1 rounded-full", flowIdx > i ? "bg-brand-500" : "bg-ink-200")} />}
              </li>
            );
          })}
        </ol>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
          <span className="text-sm font-semibold text-ink-600">Passer à :</span>
          {nextStatuses(order.status).map((s) => (
            <Button key={s} size="sm" variant={["annulee", "echec_paiement", "retour"].includes(s) ? "outline" : "primary"} onClick={() => change(s)}>
              {ORDER_STATUS[s].label}
            </Button>
          ))}
          {nextStatuses(order.status).length === 0 && <span className="text-sm text-ink-400">Commande clôturée</span>}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Panel title={`Produits (${order.items.reduce((n, i) => n + i.qty, 0)})`} bodyClassName="pt-2">
            <ul className="divide-y divide-ink-100">
              {order.items.map((it) => (
                <li key={it.productId} className="flex items-center gap-3 py-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                    <Image src={it.image} alt="" fill sizes="56px" className="object-contain p-1" />
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{it.name}</p>
                    <p className="text-xs text-ink-500">
                      {it.variant && `${it.variant} · `}Prix unitaire {formatPrice(it.unitPrice)} · coût {formatPrice(it.unitCost)}
                    </p>
                  </div>
                  <span className="text-sm text-ink-500">× {it.qty}</span>
                  <span className="w-28 text-right text-sm font-bold">{formatPrice(it.unitPrice * it.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Réduction {order.promoCode && <span className="font-mono text-xs">({order.promoCode})</span>}</dt>
                <dd>{order.discount ? `−${formatPrice(order.discount)}` : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Livraison</dt>
                <dd>{formatPrice(order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-extrabold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Historique des changements">
            <OrderHistoryTimeline order={order} showActors />
          </Panel>

          <Panel title="Commentaire interne" subtitle="Visible uniquement par l'équipe">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input h-24 py-2.5" placeholder="Ex. client VIP, appeler avant livraison…" />
            <Button size="sm" className="mt-2" onClick={() => (patch(order.id, { internalComment: comment }), toast.success("Commentaire enregistré"))}>
              <Save className="size-4" /> Enregistrer
            </Button>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Client">
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-sm text-ink-500">{order.email}</p>
            <p className="text-sm text-ink-500">{order.phone}</p>
            <div className="mt-3 flex gap-2">
              <a href={`tel:${order.phone}`} className="chip h-8 text-xs"><Phone className="size-3.5" /> Appeler</a>
              <a href="https://wa.me/2250700000000" className="chip h-8 text-xs"><MessageCircle className="size-3.5" /> WhatsApp</a>
              <a href={`mailto:${order.email}`} className="chip h-8 text-xs"><Mail className="size-3.5" /> Email</a>
            </div>
            {customer && (
              <Link href={`/admin/clients/${customer.id}`} className="mt-3 block rounded-xl bg-ink-50 p-3 text-xs text-ink-600 hover:bg-ink-100">
                {customer.ordersCount} commandes · {formatPrice(customer.totalSpent)} dépensés → <b className="text-brand-700">Fiche CRM</b>
              </Link>
            )}
          </Panel>

          <Panel title="Livraison">
            <p className="text-sm font-semibold">{DELIVERY_MODES.find((m) => m.id === order.deliveryMode)?.label}</p>
            <p className="text-sm text-ink-600">{order.address}</p>
            <p className="text-sm text-ink-600">{order.city}</p>
            <div className="mt-4 space-y-2">
              <label className="label">Transporteur</label>
              <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="input h-10">
                {CARRIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <label className="label">Numéro de suivi</label>
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="input h-10 font-mono" placeholder="TRK…" />
              <Button size="sm" variant="outline" onClick={() => (patch(order.id, { carrier, trackingNumber: tracking }), toast.success("Livraison mise à jour"))}>
                Enregistrer
              </Button>
            </div>
          </Panel>

          <Panel title="Paiement">
            <p className="text-sm font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</p>
            <p className="text-sm text-ink-600">{order.paidAmount ? `Encaissé : ${formatPrice(order.paidAmount)}` : "Aucun encaissement"}</p>
            {order.paymentRef && <p className="font-mono text-xs text-ink-400">Réf. {order.paymentRef}</p>}
            {order.paidAmount > 0 && order.paidAmount < order.total && <p className="mt-1 text-xs font-semibold text-amber-600">Reste à encaisser : {formatPrice(order.total - order.paidAmount)}</p>}
          </Panel>

          <Panel title="Documents" bodyClassName="grid gap-2">
            {(Object.keys(DOCUMENT_META) as DocumentType[])
              .filter((t) => t !== "avoir" || order.status === "remboursee")
              .map((t) => (
                <Link key={t} href={`/facture/${order.number}?type=${t}`} target="_blank" className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2 text-sm hover:bg-ink-50">
                  <FileText className="size-4 text-brand-600" />
                  <span className="flex-1">{DOCUMENT_META[t].label}</span>
                  <span className="font-mono text-[11px] text-ink-400">{documentNumber(t, order)}</span>
                </Link>
              ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
