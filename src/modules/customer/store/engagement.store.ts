"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE = 4;

interface EngagementState {
  wishlist: string[];
  compare: string[];
  recent: string[];
  stockAlerts: string[];
  toggleWishlist: (id: string) => boolean;
  toggleCompare: (id: string) => "added" | "removed" | "full";
  clearCompare: () => void;
  pushRecent: (id: string) => void;
  toggleStockAlert: (id: string) => boolean;
}

/** Favoris, comparateur, produits récemment consultés et alertes de disponibilité */
export const useEngagement = create<EngagementState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      compare: [],
      recent: [],
      stockAlerts: [],
      toggleWishlist: (id) => {
        const has = get().wishlist.includes(id);
        set({ wishlist: has ? get().wishlist.filter((x) => x !== id) : [id, ...get().wishlist] });
        return !has;
      },
      toggleCompare: (id) => {
        const { compare } = get();
        if (compare.includes(id)) {
          set({ compare: compare.filter((x) => x !== id) });
          return "removed";
        }
        if (compare.length >= MAX_COMPARE) return "full";
        set({ compare: [...compare, id] });
        return "added";
      },
      clearCompare: () => set({ compare: [] }),
      pushRecent: (id) => set({ recent: [id, ...get().recent.filter((x) => x !== id)].slice(0, 16) }),
      toggleStockAlert: (id) => {
        const has = get().stockAlerts.includes(id);
        set({ stockAlerts: has ? get().stockAlerts.filter((x) => x !== id) : [...get().stockAlerts, id] });
        return !has;
      },
    }),
    { name: "mmk-engagement", skipHydration: true },
  ),
);
