"use client";

import { Heart, Share2 } from "lucide-react";
import { getPopular, getProductsByIds } from "@/modules/catalog";
import { ProductGrid, ProductRail } from "@/modules/catalog/components/product-rail";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { useAddToCart } from "@/modules/cart/hooks/use-add-to-cart";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { Button, ButtonLink } from "@/shared/ui/button";
import { EmptyState, SectionHeader } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatPrice } from "@/shared/lib/format";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const ids = useEngagement((s) => s.wishlist);
  const addToCart = useAddToCart();
  const products = hydrated ? getProductsByIds(ids) : [];
  const available = products.filter((p) => p.availability === "in_stock" || p.availability === "low_stock");
  const total = available.reduce((s, p) => s + p.price, 0);

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Mes favoris</h1>
          <p className="text-sm text-ink-500">{products.length} produit{products.length > 1 ? "s" : ""} · nous vous prévenons des baisses de prix</p>
        </div>
        {products.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success("Lien de votre liste copié", { description: "Partagez-le sur WhatsApp pour vos idées cadeaux 🎁" });
              }}
            >
              <Share2 className="size-4" /> Partager
            </Button>
            {available.length > 0 && (
              <Button size="sm" onClick={() => available.forEach((p) => addToCart(p))}>
                Tout ajouter au panier · {formatPrice(total)}
              </Button>
            )}
          </div>
        )}
      </div>
      {hydrated && products.length === 0 ? (
        <>
          <EmptyState icon={<Heart className="size-7" />} title="Aucun favori pour l'instant" description="Touchez le ♥ sur un produit pour le retrouver ici." action={<ButtonLink href="/">Explorer la boutique</ButtonLink>} />
          <section className="mt-10">
            <SectionHeader title="Les coups de cœur de nos clients" />
            <ProductRail products={getPopular(12)} />
          </section>
        </>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
