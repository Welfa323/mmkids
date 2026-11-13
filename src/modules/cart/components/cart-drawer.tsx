"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../store/cart.store";
import { useCartSummary } from "../hooks/use-cart-summary";
import { FreeShippingProgress } from "./free-shipping-progress";
import { QuantityStepper } from "./quantity-stepper";
import { Sheet } from "@/shared/ui/sheet";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState } from "@/shared/ui/misc";
import { formatPrice } from "@/shared/lib/format";

export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const setOpen = useCart((s) => s.setDrawerOpen);
  const setQty = useCart((s) => s.setQty);
  const summary = useCartSummary();
  const close = () => setOpen(false);

  return (
    <Sheet
      open={open}
      onClose={close}
      title={
        <span>
          Mon panier <span className="text-ink-400">({summary.itemCount})</span>
        </span>
      }
      footer={
        summary.lines.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">Sous-total</span>
              <span className="text-lg font-extrabold">{formatPrice(summary.subtotal)}</span>
            </div>
            {summary.savings > 0 && <p className="text-xs font-medium text-brand-700">Vous économisez {formatPrice(summary.savings)} 🎉</p>}
            <div className="grid grid-cols-2 gap-2">
              <ButtonLink href="/panier" variant="outline" onClick={close}>
                Voir le panier
              </ButtonLink>
              <ButtonLink href="/commande" onClick={close}>
                Commander
              </ButtonLink>
            </div>
          </div>
        )
      }
    >
      {summary.lines.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<ShoppingBag className="size-7" />}
            title="Votre panier est vide"
            description="Découvrez nos ventes flash et nos nouveautés."
            action={
              <ButtonLink href="/collection/ventes-flash" onClick={close}>
                Voir les ventes flash
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <FreeShippingProgress subtotal={summary.subtotal} threshold={summary.shipping.threshold} remaining={summary.shipping.remainingForFree} />
          <ul className="divide-y divide-ink-100">
            {summary.lines.map((l) => (
              <li key={l.key} className="flex gap-3 py-3">
                <Link href={`/p/${l.product.slug}`} onClick={close} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  <Image src={l.product.images[0]} alt={l.product.name} fill sizes="80px" className="object-contain p-1.5" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/p/${l.product.slug}`} onClick={close} className="line-clamp-2 text-sm font-medium text-ink-800">
                    {l.product.name}
                  </Link>
                  {Object.keys(l.selection).length > 0 && <p className="mt-0.5 text-xs text-ink-500">{Object.values(l.selection).join(" · ")}</p>}
                  {l.unavailable && <p className="mt-0.5 text-xs font-semibold text-accent-600">Plus disponible — non comptabilisé</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper size="sm" value={l.qty} max={l.maxQty} onChange={(v) => setQty(l.key, v)} />
                    <span className="text-sm font-bold">{formatPrice(l.lineTotal)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
