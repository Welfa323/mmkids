"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, GitCompareArrows, Heart, Plus, Zap } from "lucide-react";
import type { Product } from "../types";
import { Price } from "./price";
import { RatingStars } from "@/shared/ui/misc";
import { cn } from "@/shared/lib/utils";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { needsChoice, useAddToCart } from "@/modules/cart/hooks/use-add-to-cart";
import { toast } from "@/shared/ui/toast";
import { useHydrated } from "@/shared/hooks/use-hydrated";

export function ProductCard({ product, className, priority, variant = "default" }: { product: Product; className?: string; priority?: boolean; variant?: "default" | "flash" | "compact" }) {
  const hydrated = useHydrated();
  const wished = useEngagement((s) => s.wishlist.includes(product.id));
  const compared = useEngagement((s) => s.compare.includes(product.id));
  const toggleWishlist = useEngagement((s) => s.toggleWishlist);
  const toggleCompare = useEngagement((s) => s.toggleCompare);
  const toggleStockAlert = useEngagement((s) => s.toggleStockAlert);
  const addToCart = useAddToCart();

  const unavailable = product.availability === "out_of_stock" || product.availability === "coming_soon";
  const href = `/p/${product.slug}`;

  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-lift", className)}>
      <Link href={href} className="relative block aspect-square overflow-hidden bg-gradient-to-b from-ink-50 to-white" aria-label={product.name}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className={cn("object-contain p-4 transition duration-500 group-hover:scale-105", unavailable && "opacity-60 grayscale-[40%]")}
        />
        {product.images[1] && (
          <Image src={product.images[1]} alt="" fill sizes="240px" className="object-contain p-4 opacity-0 transition duration-500 group-hover:opacity-100 max-lg:hidden" />
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {product.discountPct ? <span className="rounded-lg bg-accent-500 px-1.5 py-0.5 text-xs font-bold text-white">−{product.discountPct}%</span> : null}
          {product.isFlashSale && (
            <span className="inline-flex items-center gap-0.5 rounded-lg bg-ink-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-400">
              <Zap className="size-3" fill="currentColor" /> Flash
            </span>
          )}
          {product.isNew && !product.isFlashSale && product.availability !== "coming_soon" && <span className="rounded-lg bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Nouveau</span>}
        </div>
        {product.availability === "coming_soon" && (
          <span className="absolute inset-x-2 bottom-2 rounded-xl bg-white/95 px-2 py-1.5 text-center text-[11px] font-semibold text-ink-800 shadow-soft backdrop-blur">
            Disponible le {formatDate(product.availableAt!)}
          </span>
        )}
        {product.availability === "out_of_stock" && (
          <span className="absolute inset-x-2 bottom-2 rounded-xl bg-ink-900/85 px-2 py-1.5 text-center text-[11px] font-semibold text-white">Rupture de stock</span>
        )}
      </Link>

      <div className="absolute right-2 top-2 flex flex-col gap-1.5">
        <button
          onClick={() => {
            const added = toggleWishlist(product.id);
            toast.success(added ? "Ajouté aux favoris" : "Retiré des favoris", { description: product.name });
          }}
          className={cn("grid size-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110", hydrated && wished ? "text-accent-500" : "text-ink-500")}
          aria-label="Ajouter aux favoris"
          aria-pressed={hydrated && wished}
        >
          <Heart className="size-[18px]" fill={hydrated && wished ? "currentColor" : "none"} />
        </button>
        {variant !== "compact" && (
          <button
            onClick={() => {
              const res = toggleCompare(product.id);
              if (res === "full") toast.error("Comparateur plein", { description: "4 produits maximum. Retirez-en un pour continuer." });
              else toast.info(res === "added" ? "Ajouté au comparateur" : "Retiré du comparateur", { action: res === "added" ? { label: "Comparer", href: "/comparer" } : undefined });
            }}
            className={cn("grid size-9 place-items-center rounded-full bg-white/90 shadow-soft backdrop-blur transition hover:scale-110 lg:opacity-0 lg:group-hover:opacity-100", hydrated && compared ? "text-brand-600 lg:opacity-100" : "text-ink-500")}
            aria-label="Comparer"
          >
            <GitCompareArrows className="size-[18px]" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{product.brandName}</p>
        <Link href={href} className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5 text-ink-800 hover:text-brand-700">
          {product.name}
        </Link>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-ink-500">
            <RatingStars rating={product.rating} size="xs" />
            <span>({formatNumber(product.reviewCount)})</span>
          </div>
        )}
        <Price price={product.price} compareAt={product.compareAtPrice} />

        {variant === "flash" && product.flashSoldPct != null && (
          <div className="mt-0.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-accent-100">
              <div className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-600" style={{ width: `${product.flashSoldPct}%` }} />
            </div>
            <p className="mt-1 text-[11px] font-medium text-accent-700">
              {product.flashSoldPct > 80 ? "Presque épuisé !" : `${product.flashSoldPct}% vendus`} · {product.stock} restants
            </p>
          </div>
        )}
        {variant !== "flash" && product.availability === "low_stock" && <p className="text-[11px] font-semibold text-accent-600">Plus que {product.stock} en stock</p>}

        <div className="mt-auto pt-2">
          {unavailable ? (
            <button
              onClick={() => {
                const on = toggleStockAlert(product.id);
                toast.success(on ? "Alerte activée" : "Alerte désactivée", { description: on ? "Nous vous prévenons par SMS/WhatsApp dès l'arrivée en stock." : product.name });
              }}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-ink-200 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              <Bell className="size-4" /> M&apos;alerter
            </button>
          ) : needsChoice(product) ? (
            <Link href={href} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 text-sm font-semibold text-brand-800 transition hover:bg-brand-100">
              Choisir la taille
            </Link>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700 active:scale-[0.98]"
            >
              <Plus className="size-4" /> Ajouter
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
