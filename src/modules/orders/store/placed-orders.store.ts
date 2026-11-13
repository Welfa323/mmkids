"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "../types";

/** Commandes passées pendant la démo (navigateur) — s'ajoutent à l'historique fictif */
interface PlacedOrdersState {
  orders: Order[];
  add: (o: Order) => void;
  update: (id: string, patch: Partial<Order>) => void;
}

export const usePlacedOrders = create<PlacedOrdersState>()(
  persist(
    (set) => ({
      orders: [],
      add: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      update: (id, patch) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
    }),
    { name: "mmk-placed-orders", skipHydration: true },
  ),
);
