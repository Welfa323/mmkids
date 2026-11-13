"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, Check, GitCompareArrows, Heart, PackageCheck, RotateCcw, Share2, ShieldCheck, Store, Truck, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "../types";
import { priceForSelection } from "../services/catalog.service";
import { Price } from "./price";
import { QuantityStepper } from "@/modules/cart/components/quantity-stepper";
import { useAddToCart } from "@/modules/cart/hooks/use-add-to-cart";
import { useCart } from "@/modules/cart/store/cart.store";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { ZoneSelect } from "@/modules/delivery/components/zone-select";
import { quoteShipping, ZONE_BY_ID } from "@/modules/delivery";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { Button } from "@/shared/ui/button";
import { RatingStars } from "@/shared/ui/misc";
import { Countdown } from "@/shared/ui/countdown";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const addToCart = useAddToCart();
  const zoneId = useCart((s) => s.zoneId);
  const setZone = useCart((s) => s.setZone);
  const { wishlist, compare, stockAlerts, toggleWishlist, toggleCompare, toggleStockAlert, pushRecent } = useEngagement();

  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.filter((o) => o.name !== "Taille" && o.name !== "Pointure").map((o) => [o.name, (o.values.find((v) => v.stock !== 0) ?? o.values[0]).label])),
  );
  const [qty, setQty] = useState(1);
  const [missing, setMissing] = useState<string | null>(null);

  useEffect(() => {
    pushRecent(product.id);
  }, [product.id, pushRecent]);

  const price = priceForSelection(product, selection);
  const compareAt = product.compareAtPrice ? Math.round((price * product.compareAtPrice) / product.price / 100) * 100 : undefined;
  const unavailable = product.availability === "out_of_stock" || product.availability === "coming_soon";
  const quote = useMemo(() => quoteShipping({ zoneId, mode: "standard", subtotal: price * qty }), [zoneId, price, qty]);
  const zone = ZONE_BY_ID[zoneId];

  const wished = hydrated && wishlist.includes(product.id);
  const compared = hydrated && compare.includes(product.id);
  const alerted = hydrated && stockAlerts.includes(product.id);

  const validate = () => {
    const miss = product.options.find((o) => !selection[o.name]);
    if (miss) {
      setMissing(miss.name);
      toast.error(`Choisissez une ${miss.name.toLowerCase()}`);
      return false;
    }
    return true;
  };

  const add = (buyNow = false) => {
    if (!validate()) return;
    addToCart(product, selection, qty);
    if (buyNow) router.push("/commande");
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <a href={`/marque/${product.brand}`} className="text-sm font-semibold text-brand-700 hover:underline">
            {product.brandName}
          </a>
          {product.isNew && <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] font-bold uppercase text-brand-700">Nouveau</span>}
          {product.tags.includes("local") && <span className="rounded-md bg-gold-100 px-1.5 py-0.5 text-[11px] font-bold text-gold-600">Made in CI 🇨🇮</span>}
        </div>
        <h1 className="text-balance text-xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-2xl lg:text-[1.75rem]">{product.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
          {product.reviewCount > 0 && (
            <a href="#avis" className="flex items-center gap-1.5 hover:text-ink-800">
              <RatingStars rating={product.rating} />
              <span className="font-semibold text-ink-800">{String(product.rating).replace(".", ",")}</span>({formatNumber(product.reviewCount)} avis)
            </a>
          )}
          <span>{formatNumber(product.soldCount)} vendus</span>
          <span className="text-ink-400">Réf. {product.sku}</span>
        </div>
      </div>

      {product.isFlashSale && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-accent-500 to-rose-600 px-4 py-2.5 text-white">
          <span className="flex items-center gap-1.5 text-sm font-bold">
            <Zap className="size-4 text-gold-400" fill="currentColor" /> Vente flash
          </span>
          <Countdown />
        </div>
      )}

      <div className="rounded-2xl bg-ink-50 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Price price={price} compareAt={compareAt} size="xl" />
          {product.discountPct && <span className="rounded-lg bg-accent-500 px-2 py-1 text-sm font-bold text-white">−{product.discountPct}%</span>}
        </div>
        {compareAt && <p className="mt-1 text-sm font-medium text-brand-700">Vous économisez {formatPrice(compareAt - price)}</p>}
        {price >= 30000 && !unavailable && (
          <p className="mt-2 text-xs text-ink-600">
            ou <b>3 × {formatPrice(Math.ceil(price / 3))}</b> sans frais par carte · acompte possible de 30 %
          </p>
        )}
      </div>

      {/* Variantes */}
      {product.options.map((opt) => (
        <div key={opt.name}>
          <p className={cn("mb-2 text-sm font-semibold", missing === opt.name ? "text-accent-600" : "text-ink-800")}>
            {opt.name} : <span className="font-normal text-ink-500">{selection[opt.name] ?? "à choisir"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((v) => {
              const active = selection[opt.name] === v.label;
              const out = v.stock === 0;
              if (opt.name === "Couleur")
                return (
                  <button
                    key={v.label}
                    disabled={out}
                    onClick={() => {
                      setSelection((s) => ({ ...s, [opt.name]: v.label }));
                      setMissing(null);
                    }}
                    title={out ? `${v.label} — épuisé` : v.label}
                    className={cn("relative grid size-11 place-items-center rounded-full border-2 transition", active ? "border-brand-600" : "border-transparent hover:border-ink-200", out && "opacity-40")}
                  >
                    <span className="size-8 rounded-full ring-1 ring-black/10" style={{ background: v.hex }} />
                    {active && <Check className={cn("absolute size-4", ["Blanc", "Argent", "Beige", "Jaune", "Or"].includes(v.label) ? "text-ink-900" : "text-white")} />}
                    {out && <span className="absolute h-0.5 w-9 rotate-45 bg-ink-500" />}
                  </button>
                );
              return (
                <button
                  key={v.label}
                  disabled={out}
                  onClick={() => {
                    setSelection((s) => ({ ...s, [opt.name]: v.label }));
                    setMissing(null);
                  }}
                  className={cn(
                    "relative min-w-12 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition",
                    active ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-600/20" : "border-ink-200 text-ink-700 hover:border-ink-400",
                    out && "cursor-not-allowed border-dashed text-ink-300 line-through hover:border-ink-200",
                  )}
                >
                  {v.label}
                  {v.priceDelta ? <span className="ml-1 text-xs font-medium text-ink-400">+{formatNumber(v.priceDelta)}</span> : null}
                </button>
              );
            })}
          </div>
          {(opt.name === "Taille" || opt.name === "Pointure") && <Link href="/aide/tailles" target="_blank" className="mt-2 inline-block text-xs font-medium text-brand-700 underline-offset-2 hover:underline">Guide des tailles</Link>}
        </div>
      ))}

      {/* Disponibilité */}
      {product.availability === "coming_soon" ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-brand-900">
            <CalendarClock className="size-5" /> Bientôt disponible — le {formatDate(product.availableAt!, { long: true })}
          </p>
          <p className="mt-1 text-sm text-brand-800">Activez l&apos;alerte pour être prévenu par SMS/WhatsApp dès la mise en vente.</p>
          <Button className="mt-3 w-full" variant={alerted ? "outline" : "primary"} onClick={() => toast.success(toggleStockAlert(product.id) ? "Alerte activée" : "Alerte désactivée")}>
            <Bell className="size-4" /> {alerted ? "Alerte activée ✓" : "M'alerter de la sortie"}
          </Button>
        </div>
      ) : product.availability === "out_of_stock" ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <p className="font-semibold text-ink-900">Rupture de stock</p>
          <p className="mt-1 text-sm text-ink-500">Réapprovisionnement prévu sous 7 à 10 jours.</p>
          <Button className="mt-3 w-full" variant={alerted ? "outline" : "dark"} onClick={() => toast.success(toggleStockAlert(product.id) ? "Nous vous prévenons dès le retour en stock" : "Alerte désactivée")}>
            <Bell className="size-4" /> {alerted ? "Alerte activée ✓" : "M'alerter du retour en stock"}
          </Button>
        </div>
      ) : (
        <>
          <p className={cn("flex items-center gap-2 text-sm font-semibold", product.availability === "low_stock" ? "text-accent-600" : "text-brand-700")}>
            <span className={cn("size-2 rounded-full", product.availability === "low_stock" ? "animate-pulse bg-accent-500" : "bg-brand-500")} />
            {product.availability === "low_stock" ? `Plus que ${product.stock} en stock — commandez vite` : "En stock, prêt à être expédié"}
          </p>
          <div className="flex gap-2">
            <QuantityStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} max={Math.min(10, product.stock)} allowRemove={false} />
            <Button className="flex-1" size="lg" onClick={() => add(false)}>
              Ajouter au panier
            </Button>
          </div>
          <Button className="w-full" size="lg" variant="dark" onClick={() => add(true)}>
            Acheter maintenant
          </Button>
        </>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => toast.success(toggleWishlist(product.id) ? "Ajouté aux favoris" : "Retiré des favoris")}
          className={cn("flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition", wished ? "border-accent-200 bg-accent-50 text-accent-700" : "border-ink-200 text-ink-700 hover:bg-ink-50")}
        >
          <Heart className="size-4" fill={wished ? "currentColor" : "none"} /> Favoris
        </button>
        <button
          onClick={() => {
            const r = toggleCompare(product.id);
            if (r === "full") toast.error("Comparateur plein (4 max.)");
            else toast.info(r === "added" ? "Ajouté au comparateur" : "Retiré du comparateur");
          }}
          className={cn("flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition", compared ? "border-brand-200 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-700 hover:bg-ink-50")}
        >
          <GitCompareArrows className="size-4" /> Comparer
        </button>
        <button
          onClick={async () => {
            const url = window.location.href;
            if (navigator.share) await navigator.share({ title: product.name, url }).catch(() => {});
            else {
              await navigator.clipboard?.writeText(url);
              toast.success("Lien copié");
            }
          }}
          className="grid size-10 place-items-center rounded-xl border border-ink-200 text-ink-700 hover:bg-ink-50"
          aria-label="Partager"
        >
          <Share2 className="size-4" />
        </button>
      </div>

      {/* Livraison */}
      <div className="divide-y divide-ink-100 rounded-2xl border border-ink-100">
        <div className="p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Truck className="size-4 text-brand-600" /> Livraison
          </p>
          <ZoneSelect value={zoneId} onChange={setZone} />
          <div className="mt-2.5 text-sm">
            <p className="text-ink-700">
              {quote.free ? <b className="text-brand-700">Gratuite</b> : <b>{formatPrice(quote.fee)}</b>} · {quote.eta}
            </p>
            {zone?.expressAvailable && <p className="mt-0.5 text-xs text-ink-500">Express en 3 h disponible (+2 000 FCFA) pour une commande avant 16 h</p>}
            {quote.remainingForFree != null && quote.remainingForFree > 0 && <p className="mt-0.5 text-xs text-ink-500">Gratuite dès {formatPrice(quote.threshold!)} d&apos;achat</p>}
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 text-sm">
          <Store className="mt-0.5 size-4 shrink-0 text-brand-600" />
          <p className="text-ink-700">
            <b>Retrait gratuit</b> en 2 h à la {product.sellerStore.startsWith("Boutique") ? product.sellerStore : "Boutique Cocody"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-4 text-center text-[11px] font-medium text-ink-600">
          <span className="flex flex-col items-center gap-1">
            <ShieldCheck className="size-5 text-brand-600" />
            {product.warrantyMonths ? `Garantie ${product.warrantyMonths} mois` : "Qualité vérifiée"}
          </span>
          <span className="flex flex-col items-center gap-1">
            <RotateCcw className="size-5 text-brand-600" /> Échange de taille 15 j
          </span>
          <span className="flex flex-col items-center gap-1">
            <PackageCheck className="size-5 text-brand-600" /> Paiement à la livraison
          </span>
        </div>
      </div>

      {/* Barre d'achat collante (mobile) */}
      {!unavailable && (
        <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t border-ink-100 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-500">{product.name}</p>
            <p className="font-extrabold">{formatPrice(price * qty)}</p>
          </div>
          <Button onClick={() => add(false)}>Ajouter au panier</Button>
        </div>
      )}
    </div>
  );
}
