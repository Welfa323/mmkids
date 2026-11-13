"use client";

import { useLayoutEffect } from "react";
import { useCart } from "@/modules/cart/store/cart.store";
import { useAuth } from "@/modules/customer/store/auth.store";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";
import { Toaster } from "@/shared/ui/toast";

/** Réhydrate les stores persistés (localStorage) après le montage pour éviter les écarts SSR */
export function Providers({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    useCart.persist.rehydrate();
    useAuth.persist.rehydrate();
    useEngagement.persist.rehydrate();
    usePlacedOrders.persist.rehydrate();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
