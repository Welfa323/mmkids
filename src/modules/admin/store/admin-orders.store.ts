"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { ORDERS, type Order, type OrderStatus } from "@/modules/orders";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";

/** Modifications faites depuis le back-office pendant la session (statuts, commentaires, transporteur…) */
interface AdminOrdersState {
  overrides: Record<string, Partial<Order>>;
  patch: (id: string, p: Partial<Order>) => void;
  setStatus: (order: Order, status: OrderStatus, by: string, note?: string) => void;
}

export const useAdminOrders = create<AdminOrdersState>((set, get) => ({
  overrides: {},
  patch: (id, p) => set({ overrides: { ...get().overrides, [id]: { ...get().overrides[id], ...p } } }),
  setStatus: (order, status, by, note) =>
    get().patch(order.id, {
      status,
      history: [...order.history, { status, at: new Date("2026-10-26T14:30:00Z").toISOString(), by, note }],
    }),
}));

export function useAllOrders(): Order[] {
  const overrides = useAdminOrders((s) => s.overrides);
  const placed = usePlacedOrders((s) => s.orders);
  return useMemo(() => [...placed, ...ORDERS].map((o) => (overrides[o.id] ? { ...o, ...overrides[o.id] } : o)), [overrides, placed]);
}
