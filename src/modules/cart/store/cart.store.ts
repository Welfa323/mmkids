"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DeliveryMode } from "@/modules/delivery";

export interface CartLine {
  key: string;
  productId: string;
  selection: Record<string, string>;
  qty: number;
  addedAt: number;
}

interface CartState {
  lines: CartLine[];
  saved: CartLine[];
  promoCode?: string;
  voucherCode?: string;
  usePoints: boolean;
  zoneId: string;
  mode: DeliveryMode;
  relayId?: string;
  pickupStoreId?: string;
  drawerOpen: boolean;
  add: (productId: string, selection?: Record<string, string>, qty?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  removeSaved: (key: string) => void;
  clear: () => void;
  setPromoCode: (code?: string) => void;
  setVoucherCode: (code?: string) => void;
  setUsePoints: (v: boolean) => void;
  setZone: (zoneId: string) => void;
  setMode: (mode: DeliveryMode) => void;
  setRelay: (id: string) => void;
  setPickupStore: (id: string) => void;
  setDrawerOpen: (open: boolean) => void;
}

export const lineKey = (productId: string, selection: Record<string, string> = {}) =>
  [productId, ...Object.entries(selection).map(([k, v]) => `${k}=${v}`)].join("|");

export const MAX_QTY = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      saved: [],
      usePoints: false,
      zoneId: "cocody",
      mode: "standard",
      drawerOpen: false,
      add: (productId, selection = {}, qty = 1) =>
        set((s) => {
          const key = lineKey(productId, selection);
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
            : [...s.lines, { key, productId, selection, qty, addedAt: Date.now() }];
          return { lines, saved: s.saved.filter((l) => l.key !== key) };
        }),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.key !== key) : s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)),
        })),
      saveForLater: (key) =>
        set((s) => {
          const line = s.lines.find((l) => l.key === key);
          if (!line) return s;
          return { lines: s.lines.filter((l) => l.key !== key), saved: [line, ...s.saved.filter((l) => l.key !== key)] };
        }),
      moveToCart: (key) =>
        set((s) => {
          const line = s.saved.find((l) => l.key === key);
          if (!line) return s;
          return { saved: s.saved.filter((l) => l.key !== key), lines: [...s.lines, line] };
        }),
      removeSaved: (key) => set((s) => ({ saved: s.saved.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [], promoCode: undefined, voucherCode: undefined, usePoints: false }),
      setPromoCode: (promoCode) => set({ promoCode }),
      setVoucherCode: (voucherCode) => set({ voucherCode }),
      setUsePoints: (usePoints) => set({ usePoints }),
      setZone: (zoneId) => set({ zoneId }),
      setMode: (mode) => set({ mode }),
      setRelay: (relayId) => set({ relayId }),
      setPickupStore: (pickupStoreId) => set({ pickupStoreId }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
    }),
    {
      name: "mmk-cart",
      version: 1,
      skipHydration: true,
      partialize: ({ drawerOpen, ...rest }) => rest,
    },
  ),
);
