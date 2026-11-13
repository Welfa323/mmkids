"use client";

import { Printer } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { DOCUMENT_META, documentNumber, taxBreakdown, type DocumentType } from "../index";
import { getOrder, type Order } from "@/modules/orders";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";
import { PAYMENT_LABEL } from "@/modules/payment";
import { DELIVERY_MODES } from "@/modules/delivery";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { LogoMark } from "@/shared/ui/logo";
import { SITE } from "@/shared/lib/site";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function InvoiceDocument({ orderNumber }: { orderNumber: string }) {
  const hydrated = useHydrated();
  const type = (useSearchParams().get("type") ?? "facture") as DocumentType;
  const placed = usePlacedOrders((s) => s.orders.find((o) => o.number === orderNumber));
  const order: Order | undefined = getOrder(orderNumber) ?? (hydrated ? placed : undefined);

  if (!order) return <p className="p-10 text-center text-ink-500">{hydrated ? "Document introuvable." : "Chargement…"}</p>;
  const meta = DOCUMENT_META[type] ?? DOCUMENT_META.facture;
  const sign = type === "avoir" ? -1 : 1;
  const tax = taxBreakdown(order.total);
  const isDelivery = type === "bon-de-livraison";

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(DOCUMENT_META) as DocumentType[]).map((t) => (
            <a key={t} href={`?type=${t}`} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", t === type ? "bg-ink-900 text-white" : "bg-white text-ink-600 ring-1 ring-ink-200")}>
              {DOCUMENT_META[t].label}
            </a>
          ))}
        </div>
        <button onClick={() => window.print()} className="flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          <Printer className="size-4" /> Imprimer / PDF
        </button>
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink-100 sm:p-10 print:shadow-none print:ring-0">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-ink-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <LogoMark />
              <span className="text-lg font-extrabold">MMKids</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-ink-500">
              {SITE.legal.company} · Capital {SITE.legal.capital}
              <br />
              {SITE.address}
              <br />
              RCCM {SITE.legal.rccm} · NCC {SITE.legal.ncc}
              <br />
              {SITE.phone} · {SITE.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold uppercase tracking-tight text-brand-700">{meta.label}</p>
            <p className="mt-1 font-mono text-sm font-semibold">{documentNumber(type, order)}</p>
            <p className="mt-1 text-xs text-ink-500">Date : {formatDate(order.createdAt)}</p>
            <p className="text-xs text-ink-500">Commande : {order.number}</p>
          </div>
        </header>

        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{isDelivery ? "Livrer à" : "Facturé à"}</p>
            <p className="mt-1 font-semibold">{order.customerName}</p>
            <p className="text-sm text-ink-600">{order.address}</p>
            <p className="text-sm text-ink-600">{order.city}</p>
            <p className="text-sm text-ink-600">{order.phone}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400">{isDelivery ? "Expédition" : "Règlement"}</p>
            {isDelivery ? (
              <>
                <p className="mt-1 text-sm">{DELIVERY_MODES.find((m) => m.id === order.deliveryMode)?.label}</p>
                <p className="text-sm text-ink-600">{order.carrier ?? "MMKids Express"}</p>
                {order.trackingNumber && <p className="font-mono text-xs text-ink-500">{order.trackingNumber}</p>}
              </>
            ) : (
              <>
                <p className="mt-1 text-sm">{PAYMENT_LABEL[order.paymentMethod]}</p>
                <p className="text-sm text-ink-600">{order.paidAmount ? `Payé : ${formatPrice(order.paidAmount)}` : "En attente de règlement"}</p>
                {order.paymentRef && <p className="font-mono text-xs text-ink-500">Réf. {order.paymentRef}</p>}
              </>
            )}
          </div>
        </section>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-ink-200 text-left text-xs uppercase tracking-wider text-ink-500">
              <th className="py-2.5">Désignation</th>
              <th className="py-2.5 text-center">Qté</th>
              {!isDelivery && <th className="py-2.5 text-right">P.U. TTC</th>}
              {!isDelivery && <th className="py-2.5 text-right">Total TTC</th>}
              {isDelivery && <th className="py-2.5 text-right">Contrôle</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {order.items.map((it) => (
              <tr key={it.productId}>
                <td className="py-3">
                  <p className="font-medium">{it.name}</p>
                  {it.variant && <p className="text-xs text-ink-500">{it.variant}</p>}
                </td>
                <td className="py-3 text-center">{it.qty}</td>
                {!isDelivery && <td className="py-3 text-right">{formatPrice(it.unitPrice * sign)}</td>}
                {!isDelivery && <td className="py-3 text-right font-semibold">{formatPrice(it.unitPrice * it.qty * sign)}</td>}
                {isDelivery && <td className="py-3 text-right">☐</td>}
              </tr>
            ))}
          </tbody>
        </table>

        {!isDelivery ? (
          <div className="ml-auto mt-6 w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Sous-total</span>
              <span>{formatPrice(order.subtotal * sign)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-500">Remise {order.promoCode ?? ""}</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-500">Livraison</span>
              <span>{formatPrice(order.shippingFee * sign)}</span>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-1.5">
              <span className="text-ink-500">Total HT</span>
              <span>{formatPrice(tax.ht * sign)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">TVA 18 %</span>
              <span>{formatPrice(tax.tva * sign)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-ink-900 pt-2 text-base font-extrabold">
              <span>Total TTC</span>
              <span>{formatPrice(tax.ttc * sign)}</span>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 text-xs text-ink-500">
            <div className="h-24 rounded-xl border border-dashed border-ink-300 p-3">Signature du livreur</div>
            <div className="h-24 rounded-xl border border-dashed border-ink-300 p-3">Signature du client (bon état, colis complet)</div>
          </div>
        )}

        <footer className="mt-10 border-t border-ink-100 pt-4 text-center text-[11px] leading-5 text-ink-400">
          {type === "avoir" ? "Avoir utilisable sur MMKids pendant 12 mois. " : ""}
          Document généré automatiquement — prototype de démonstration, données fictives. Merci pour votre confiance !
        </footer>
      </article>
    </div>
  );
}
