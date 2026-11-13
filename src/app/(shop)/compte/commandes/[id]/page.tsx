"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Ban, FileText, MessageCircle, Phone, RotateCcw, RotateCw, Truck, Undo2, Wallet } from "lucide-react";
import { useState } from "react";
import { useMyOrders } from "@/modules/customer/hooks/use-my-orders";
import { OrderHistoryTimeline, OrderTrackingBar } from "@/modules/orders/components/order-tracking";
import { useReorder } from "@/modules/orders/components/order-card";
import { canCancel, canReturn, ORDER_STATUS, type Order, type OrderStatus } from "@/modules/orders";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";
import { PAYMENT_LABEL } from "@/modules/payment";
import { DELIVERY_MODES } from "@/modules/delivery";
import { ToneBadge } from "@/shared/ui/badge";
import { Button, ButtonLink } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { EmptyState } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const RETURN_REASONS = ["Taille / pointure non adaptée", "Produit défectueux ou endommagé", "Ne correspond pas à la description", "Erreur de commande", "J'ai changé d'avis"];
const CANCEL_REASONS = ["J'ai trouvé moins cher ailleurs", "Délai de livraison trop long", "Je me suis trompé de produit", "Je n'en ai plus besoin", "Autre"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orders = useMyOrders();
  const updatePlaced = usePlacedOrders((s) => s.update);
  const reorder = useReorder();
  const base = orders.find((o) => o.id === id);
  const [override, setOverride] = useState<Partial<Order>>({});
  const [modal, setModal] = useState<"cancel" | "return" | "refund" | null>(null);
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [refundTo, setRefundTo] = useState("mobile");

  if (!base) return <EmptyState icon={<Truck className="size-7" />} title="Commande introuvable" action={<ButtonLink href="/compte/commandes">Retour à mes commandes</ButtonLink>} />;
  const order: Order = { ...base, ...override };
  const s = ORDER_STATUS[order.status];

  const transition = (status: OrderStatus, note: string) => {
    const patch = { status, history: [...order.history, { status, at: new Date().toISOString(), by: "Client", note }] };
    setOverride(patch);
    if (order.id.startsWith("demo-")) updatePlaced(order.id, patch);
    setModal(null);
  };

  return (
    <div className="space-y-5">
      <Link href="/compte/commandes" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Mes commandes
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Commande <span className="font-mono">{order.number}</span>
          </h1>
          <p className="text-sm text-ink-500">
            Passée le {formatDate(order.createdAt, { long: true })} · {order.channel}
          </p>
        </div>
        <ToneBadge tone={s.tone} dot={s.dot} className="text-sm">
          {s.customerLabel}
        </ToneBadge>
      </div>

      <div className="card p-5">
        <OrderTrackingBar order={order} />
        {order.trackingNumber && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink-50 p-4 text-sm">
            <div>
              <p className="text-ink-500">Transporteur</p>
              <p className="font-semibold">{order.carrier}</p>
            </div>
            <div>
              <p className="text-ink-500">N° de suivi</p>
              <p className="font-mono font-semibold">{order.trackingNumber}</p>
            </div>
            {order.status === "en_livraison" && (
              <a href="tel:+2250700000000" className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 font-semibold text-white">
                <Phone className="size-4" /> Appeler le livreur
              </a>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="card divide-y divide-ink-100">
            {order.items.map((it) => (
              <div key={it.productId} className="flex items-center gap-3 p-4">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  <Image src={it.image} alt="" fill sizes="64px" className="object-contain p-1" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{it.name}</p>
                  <p className="text-xs text-ink-500">
                    {it.variant ? `${it.variant} · ` : ""}
                    {it.qty} × {formatPrice(it.unitPrice)}
                  </p>
                  <button onClick={() => reorder(order, it.productId)} className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand-700">
                    <RotateCw className="size-3" /> Racheter
                  </button>
                </div>
                <p className="text-sm font-bold">{formatPrice(it.unitPrice * it.qty)}</p>
              </div>
            ))}
            <dl className="space-y-1.5 p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Sous-total</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-brand-700">
                  <dt>Réductions {order.promoCode && `(${order.promoCode})`}</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-500">Livraison</dt>
                <dd>{order.shippingFee ? formatPrice(order.shippingFee) : "Gratuite"}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-extrabold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
          <div className="card p-5">
            <h2 className="mb-4 font-bold">Historique</h2>
            <OrderHistoryTimeline order={order} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card space-y-4 p-5 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Livraison</p>
              <p className="mt-1 font-semibold">{DELIVERY_MODES.find((m) => m.id === order.deliveryMode)?.label}</p>
              <p className="text-ink-600">{order.address}</p>
              <p className="text-ink-600">{order.city}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Paiement</p>
              <p className="mt-1 font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</p>
              <p className="text-ink-600">{order.paidAmount ? `Payé ${formatPrice(order.paidAmount)}` : "Non encore réglé"}</p>
            </div>
          </div>
          <div className="card grid gap-2 p-4">
            <ButtonLink href={`/facture/${order.number}`} target="_blank" variant="outline">
              <FileText className="size-4" /> Télécharger la facture
            </ButtonLink>
            {order.status === "livree" && (
              <Button variant="outline" onClick={() => reorder(order)}>
                <RotateCw className="size-4" /> Commander à nouveau
              </Button>
            )}
            {canReturn(order.status) && (
              <Button variant="outline" onClick={() => (setItems(order.items.map((i) => i.productId)), setReason(""), setModal("return"))}>
                <Undo2 className="size-4" /> Demander un retour
              </Button>
            )}
            {order.status === "retour" && (
              <Button variant="outline" onClick={() => setModal("refund")}>
                <Wallet className="size-4" /> Demander le remboursement
              </Button>
            )}
            {canCancel(order.status) && (
              <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => (setReason(""), setModal("cancel"))}>
                <Ban className="size-4" /> Annuler la commande
              </Button>
            )}
            <a href="https://wa.me/2250700000000" className="flex items-center justify-center gap-2 pt-1 text-sm text-ink-500 hover:text-ink-800">
              <MessageCircle className="size-4" /> Contacter le service client
            </a>
          </div>
        </div>
      </div>

      <Modal open={modal === "cancel"} onClose={() => setModal(null)} title="Annuler la commande">
        <div className="space-y-3 p-5">
          <p className="text-sm text-ink-600">Pourquoi souhaitez-vous annuler ? {order.paidAmount > 0 && "Le montant payé vous sera remboursé sous 48 h."}</p>
          {CANCEL_REASONS.map((r) => (
            <label key={r} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm", reason === r ? "border-brand-600 bg-brand-50" : "border-ink-200")}>
              <input type="radio" checked={reason === r} onChange={() => setReason(r)} className="accent-brand-600" /> {r}
            </label>
          ))}
          <Button variant="danger" className="w-full" disabled={!reason} onClick={() => (transition("annulee", reason), toast.success("Commande annulée", { description: order.paidAmount ? "Remboursement lancé sur votre moyen de paiement." : undefined }))}>
            Confirmer l&apos;annulation
          </Button>
        </div>
      </Modal>

      <Modal open={modal === "return"} onClose={() => setModal(null)} title="Demande de retour">
        <div className="space-y-4 p-5">
          <div>
            <p className="label">Articles à retourner</p>
            <div className="space-y-2">
              {order.items.map((it) => (
                <label key={it.productId} className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-200 p-2.5 text-sm">
                  <input type="checkbox" checked={items.includes(it.productId)} onChange={(e) => setItems((x) => (e.target.checked ? [...x, it.productId] : x.filter((y) => y !== it.productId)))} className="size-4 accent-brand-600" />
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    <Image src={it.image} alt="" fill sizes="40px" className="object-contain p-0.5" />
                  </span>
                  <span className="line-clamp-1 flex-1">{it.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Motif</p>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="input">
              <option value="">Choisir un motif…</option>
              {RETURN_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="label">Remboursement souhaité</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "mobile", label: "Mobile Money" },
                { id: "bon", label: "Bon d'achat +5 %" },
                { id: "echange", label: "Échange" },
              ].map((o) => (
                <button key={o.id} onClick={() => setRefundTo(o.id)} className={cn("rounded-xl border p-2.5 text-xs font-semibold", refundTo === o.id ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200")}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-2 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">
            <RotateCcw className="size-4 shrink-0 text-brand-600" /> Retour gratuit : un livreur récupère le colis à votre adresse sous 48 h.
          </p>
          <Button className="w-full" disabled={!reason || !items.length} onClick={() => (transition("retour", reason), toast.success("Demande de retour envoyée", { description: "Vous recevrez une confirmation par WhatsApp." }))}>
            Envoyer la demande
          </Button>
        </div>
      </Modal>

      <Modal open={modal === "refund"} onClose={() => setModal(null)} title="Demande de remboursement">
        <div className="space-y-4 p-5">
          <p className="text-sm text-ink-600">
            Montant : <b>{formatPrice(order.total)}</b>. Le remboursement est effectué sous 48 h après réception et contrôle du produit.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["Mobile Money", "Bon d'achat (+5 %)"].map((o, i) => (
              <button key={o} onClick={() => setRefundTo(i ? "bon" : "mobile")} className={cn("rounded-xl border p-3 text-sm font-semibold", (i ? "bon" : "mobile") === refundTo ? "border-brand-600 bg-brand-50" : "border-ink-200")}>
                {o}
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={() => (transition("remboursee", refundTo === "bon" ? "Remboursé en bon d'achat" : "Remboursé en Mobile Money"), toast.success("Remboursement effectué"))}>
            Valider
          </Button>
        </div>
      </Modal>
    </div>
  );
}
