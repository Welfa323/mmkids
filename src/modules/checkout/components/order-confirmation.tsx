"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Coins, FileText, MessageCircle, Package } from "lucide-react";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";
import { OrderTrackingBar } from "@/modules/orders/components/order-tracking";
import { PAYMENT_LABEL } from "@/modules/payment";
import { useAuth } from "@/modules/customer/store/auth.store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/misc";
import { formatNumber, formatPrice } from "@/shared/lib/format";

export function OrderConfirmation() {
  const hydrated = useHydrated();
  const n = useSearchParams().get("n");
  const order = usePlacedOrders((s) => s.orders.find((o) => o.number === n));
  const user = useAuth((s) => s.user);
  if (!hydrated) return <div className="container-page py-10"><div className="skeleton mx-auto h-96 max-w-2xl rounded-3xl" /></div>;
  if (!order)
    return (
      <div className="container-page py-10">
        <EmptyState icon={<Package className="size-7" />} title="Commande introuvable" action={<ButtonLink href="/compte/commandes">Mes commandes</ButtonLink>} />
      </div>
    );
  const pending = order.status === "paiement_en_attente" || order.status === "nouvelle";
  return (
    <div className="container-page max-w-2xl py-8">
      <div className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-600 to-brand-900 px-6 py-10 text-center text-white">
          <span className="mx-auto grid size-16 animate-pop place-items-center rounded-full bg-white text-brand-600 shadow-lift">
            <Check className="size-8" strokeWidth={3} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Merci {order.customerName.split(" ")[0]} ! 🎉</h1>
          <p className="mt-1 text-brand-100">
            Commande <b className="font-mono text-white">{order.number}</b> {pending ? "enregistrée" : "confirmée et payée"}
          </p>
          <p className="mt-3 text-sm text-brand-100">Un SMS et un message WhatsApp de confirmation viennent d&apos;être envoyés au {order.phone}.</p>
        </div>
        <div className="space-y-6 p-6">
          <OrderTrackingBar order={order} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-ink-50 p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Paiement</p>
              <p className="mt-1 font-semibold">{PAYMENT_LABEL[order.paymentMethod]}</p>
              <p className="text-ink-500">{order.paidAmount ? `${formatPrice(order.paidAmount)} encaissés` : "À régler à la livraison / par virement"}</p>
              {order.paymentRef && <p className="text-xs text-ink-400">Réf. {order.paymentRef}</p>}
            </div>
            <div className="rounded-2xl bg-ink-50 p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Livraison</p>
              <p className="mt-1 font-semibold">{order.city}</p>
              <p className="text-ink-500">{order.address}</p>
            </div>
          </div>
          <ul className="divide-y divide-ink-100">
            {order.items.map((it) => (
              <li key={it.productId} className="flex items-center gap-3 py-2.5">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  <Image src={it.image} alt="" fill sizes="56px" className="object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="line-clamp-1 font-medium">{it.name}</span>
                  <span className="text-ink-500">
                    {it.variant ? `${it.variant} · ` : ""}Qté {it.qty}
                  </span>
                </span>
                <span className="text-sm font-bold">{formatPrice(it.unitPrice * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-ink-100 pt-4">
            <span className="font-bold">Total</span>
            <span className="text-xl font-extrabold">{formatPrice(order.total)}</span>
          </div>
          {user ? (
            <p className="flex items-center gap-2 rounded-2xl bg-gold-50 p-3 text-sm text-ink-800">
              <Coins className="size-5 text-gold-600" /> Vous gagnez <b>{formatNumber(Math.floor((order.total / 1000) * 1.5))} points</b> fidélité avec cette commande.
            </p>
          ) : (
            <div className="rounded-2xl bg-brand-50 p-4 text-sm">
              <p className="font-semibold text-brand-900">Créez votre compte en 1 clic</p>
              <p className="text-brand-800">Suivez vos commandes, gagnez des points et retrouvez vos adresses.</p>
              <Link href="/inscription" className="mt-2 inline-block font-semibold text-brand-700 underline">
                Créer mon compte
              </Link>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-3">
            <ButtonLink href={`/suivi?commande=${order.number}`}>Suivre ma commande</ButtonLink>
            <ButtonLink href={`/facture/${order.number}`} variant="outline" target="_blank">
              <FileText className="size-4" /> Facture
            </ButtonLink>
            <ButtonLink href="/" variant="ghost">
              Continuer mes achats
            </ButtonLink>
          </div>
          <a href="https://wa.me/2250700000000" className="flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-ink-800">
            <MessageCircle className="size-4" /> Une question ? Écrivez-nous sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
