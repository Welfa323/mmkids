"use client";

import { useCallback } from "react";
import { useCart } from "../store/cart.store";
import { toast } from "@/shared/ui/toast";
import type { Product } from "@/modules/catalog";

/** Sélection par défaut : première valeur disponible de chaque option */
export function defaultSelection(product: Product): Record<string, string> {
  return Object.fromEntries(product.options.map((o) => [o.name, (o.values.find((v) => v.stock !== 0) ?? o.values[0]).label]));
}

export function needsChoice(product: Product) {
  return product.options.some((o) => o.name === "Taille" || o.name === "Pointure");
}

export function useAddToCart() {
  const add = useCart((s) => s.add);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  return useCallback(
    (product: Product, selection?: Record<string, string>, qty = 1, opts: { openDrawer?: boolean } = {}) => {
      const sel = selection ?? defaultSelection(product);
      add(product.id, sel, qty);
      const variant = Object.values(sel).join(" · ");
      toast.success("Ajouté au panier", {
        description: `${product.name}${variant ? ` — ${variant}` : ""}`,
        image: product.images[0],
        action: { label: "Voir le panier", onClick: () => setDrawerOpen(true) },
      });
      if (opts.openDrawer) setDrawerOpen(true);
    },
    [add, setDrawerOpen],
  );
}
