"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, Search } from "lucide-react";
import { Suspense, useState } from "react";
import { getOrder } from "@/modules/orders";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";
import { OrderHistoryTimeline, OrderTrackingBar } from "@/modules/orders/components/order-tracking";
import { ORDER_STATUS } from "@/modules/orders/status";
import { ToneBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { formatDate, formatPrice } from "@/shared/lib/format";

function Tracking() {
  const router = useRouter();
  const n = useSearchParams().get("commande") ?? "";
  const [value, setValue] = useState(n);
  const placed = usePlacedOrders((s) => s.orders.find((o) => o.number === n));
  const order = n ? (getOrder(n.toUpperCase()) ?? placed) : undefined;

  return (
    <div className="container-page max-w-3xl py-8">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <PackageSearch className="size-7" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">Suivre ma commande</h1>
        <p className="mt-1 text-sm text-ink-500">Saisissez le numéro reçu par SMS / WhatsApp (ex. MK-261026-8017)</p>
      </div>
      <form
        className="mx-auto mt-6 flex max-w-lg gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/suivi?commande=${encodeURIComponent(value.trim().toUpperCase())}`);
        }}
      >
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input value={value} onChange={(e) => setValue(e.target.value)} className="input h-12 pl-9 font-mono uppercase" placeholder="MK-261026-8017" />
        </label>
        <Button size="lg">Suivre</Button>
      </form>

      {n && !order && <p className="mt-8 rounded-2xl bg-ink-100 p-5 text-center text-sm text-ink-600">Aucune commande ne correspond à « {n} ». Vérifiez le numéro.</p>}

      {order && (
        <div className="card mt-8 space-y-6 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono font-bold">{order.number}</p>
              <p className="text-sm text-ink-500">
                {formatDate(order.createdAt, { long: true })} · {formatPrice(order.total)}
              </p>
            </div>
            <ToneBadge tone={ORDER_STATUS[order.status].tone} dot={ORDER_STATUS[order.status].dot}>
              {ORDER_STATUS[order.status].customerLabel}
            </ToneBadge>
          </div>
          <OrderTrackingBar order={order} />
          <div className="flex gap-2 overflow-x-auto">
            {order.items.map((it) => (
              <span key={it.productId} className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                <Image src={it.image} alt={it.name} fill sizes="56px" className="object-contain p-1" />
              </span>
            ))}
          </div>
          {order.carrier && (
            <p className="rounded-xl bg-ink-50 p-3 text-sm">
              Transporteur : <b>{order.carrier}</b>
              {order.trackingNumber && (
                <>
                  {" "}
                  · N° <span className="font-mono">{order.trackingNumber}</span>
                </>
              )}
            </p>
          )}
          <OrderHistoryTimeline order={order} />
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense>
      <Tracking />
    </Suspense>
  );
}
