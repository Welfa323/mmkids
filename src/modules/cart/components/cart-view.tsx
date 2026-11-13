"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useMemo } from "react";
import { useCart } from "../store/cart.store";
import { useCartSummary } from "../hooks/use-cart-summary";
import { priceLines } from "../services/cart-pricing";
import { CartSummaryPanel } from "./cart-summary-panel";
import { FreeShippingProgress } from "./free-shipping-progress";
import { QuantityStepper } from "./quantity-stepper";
import { getAllProducts, sortProducts } from "@/modules/catalog";
import { ProductRail } from "@/modules/catalog/components/product-rail";
import { ZoneSelect } from "@/modules/delivery/components/zone-select";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { ButtonLink } from "@/shared/ui/button";
import { EmptyState, SectionHeader } from "@/shared/ui/misc";
import { formatPrice } from "@/shared/lib/format";

export function CartView() {
  const hydrated = useHydrated();
  const { setQty, remove, saveForLater, moveToCart, removeSaved, saved, zoneId, setZone } = useCart();
  const summary = useCartSummary();
  const savedLines = priceLines(saved);

  // Suggestions : complémentaires aux catégories du panier, sinon populaires
  const suggestions = useMemo(() => {
    const cats = new Set(summary.lines.map((l) => l.product.category));
    const inCart = new Set(summary.lines.map((l) => l.productId));
    const pool = getAllProducts().filter((p) => !inCart.has(p.id) && p.availability !== "coming_soon" && p.availability !== "out_of_stock");
    const near = summary.shipping.remainingForFree && summary.shipping.remainingForFree > 0 ? summary.shipping.remainingForFree : null;
    const filtered = near ? pool.filter((p) => p.price >= near && p.price <= near * 2.5) : pool.filter((p) => cats.has(p.category));
    return sortProducts(filtered.length >= 4 ? filtered : pool, "popularite").slice(0, 12);
  }, [summary.lines, summary.shipping.remainingForFree]);

  if (!hydrated)
    return (
      <div className="container-page py-8">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );

  return (
    <div className="container-page py-6 pb-32 lg:pb-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Mon panier <span className="text-ink-400">({summary.itemCount})</span>
      </h1>
      <p className="mt-1 text-sm text-ink-500">Votre panier est sauvegardé automatiquement, même après fermeture du navigateur.</p>

      {summary.lines.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<ShoppingBag className="size-7" />}
          title="Votre panier est vide"
          description="Parcourez nos catégories ou laissez-vous tenter par les ventes flash du jour."
          action={<ButtonLink href="/collection/ventes-flash">Voir les ventes flash</ButtonLink>}
        />
      ) : (
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <FreeShippingProgress subtotal={summary.subtotal - summary.promoDiscount} threshold={summary.shipping.threshold} remaining={summary.shipping.remainingForFree} />
            <div className="card divide-y divide-ink-100">
              {summary.lines.map((l) => (
                <div key={l.key} className="flex gap-3 p-4 sm:gap-4">
                  <Link href={`/p/${l.product.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-ink-50 sm:size-28">
                    <Image src={l.product.images[0]} alt={l.product.name} fill sizes="112px" className="object-contain p-2" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{l.product.brandName}</p>
                        <Link href={`/p/${l.product.slug}`} className="line-clamp-2 font-medium text-ink-800 hover:text-brand-700">
                          {l.product.name}
                        </Link>
                        {Object.keys(l.selection).length > 0 && <p className="mt-0.5 text-sm text-ink-500">{Object.entries(l.selection).map(([k, v]) => `${k} : ${v}`).join(" · ")}</p>}
                        {l.unavailable ? (
                          <p className="mt-1 text-xs font-semibold text-accent-600">Produit devenu indisponible — retiré du total</p>
                        ) : l.product.availability === "low_stock" ? (
                          <p className="mt-1 text-xs font-semibold text-accent-600">Plus que {l.product.stock} en stock</p>
                        ) : (
                          <p className="mt-1 text-xs font-medium text-brand-700">En stock</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-extrabold">{formatPrice(l.lineTotal)}</p>
                        {l.qty > 1 && <p className="text-xs text-ink-400">{formatPrice(l.unitPrice)} / unité</p>}
                        {l.compareAtUnit && <p className="text-xs text-ink-400 line-through">{formatPrice(l.compareAtUnit * l.qty)}</p>}
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <QuantityStepper size="sm" value={l.qty} max={l.maxQty} onChange={(v) => setQty(l.key, v)} />
                      <div className="flex items-center gap-1">
                        <button onClick={() => saveForLater(l.key)} className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-600 hover:bg-ink-100">
                          <Bookmark className="size-4" /> <span className="hidden sm:inline">Plus tard</span>
                        </button>
                        <button onClick={() => remove(l.key)} className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-600 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="size-4" /> <span className="hidden sm:inline">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Truck className="size-4 text-brand-600" /> Estimer les frais de livraison
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <ZoneSelect value={zoneId} onChange={setZone} className="sm:w-80" />
                <p className="text-sm text-ink-600">
                  {summary.shipping.fee === 0 ? <b className="text-brand-700">Livraison gratuite</b> : <b>{formatPrice(summary.shipping.fee)}</b>} · {summary.shipping.eta}
                </p>
              </div>
            </div>

            {savedLines.length > 0 && (
              <div className="card p-4">
                <p className="mb-3 text-sm font-bold">Sauvegardés pour plus tard ({savedLines.length})</p>
                <ul className="space-y-3">
                  {savedLines.map((l) => (
                    <li key={l.key} className="flex items-center gap-3">
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                        <Image src={l.product.images[0]} alt="" fill sizes="56px" className="object-contain p-1" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-medium">{l.product.name}</p>
                        <p className="text-sm font-bold">{formatPrice(l.unitPrice)}</p>
                      </div>
                      <button onClick={() => moveToCart(l.key)} className="text-xs font-semibold text-brand-700 hover:underline">
                        Remettre au panier
                      </button>
                      <button onClick={() => removeSaved(l.key)} className="p-1 text-ink-400 hover:text-red-600" aria-label="Supprimer">
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-36">
            <CartSummaryPanel
              summary={summary}
              cta={
                <ButtonLink href="/commande" size="lg" className="hidden w-full lg:flex">
                  Passer la commande · {formatPrice(summary.total)}
                </ButtonLink>
              }
            />
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            title={summary.shipping.remainingForFree ? "Complétez votre panier" : "Vous aimerez aussi"}
            subtitle={summary.shipping.remainingForFree ? `Ajoutez ${formatPrice(summary.shipping.remainingForFree)} pour la livraison gratuite` : "Sélectionnés selon votre panier"}
          />
          <ProductRail products={suggestions} />
        </section>
      )}

      {summary.lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-ink-100 bg-white/95 p-3 backdrop-blur lg:hidden">
          <ButtonLink href="/commande" size="lg" className="w-full">
            Commander · {formatPrice(summary.total)}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
