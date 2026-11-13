"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleId } from "@/modules/staff";

/** Session back-office simulée : rôle courant (pour tester les permissions) et boutique filtrée */
interface AdminSession {
  role: RoleId;
  storeId: string;
  sidebarCollapsed: boolean;
  setRole: (r: RoleId) => void;
  setStore: (s: string) => void;
  toggleSidebar: () => void;
}

export const useAdminSession = create<AdminSession>()(
  persist(
    (set) => ({
      role: "super_admin",
      storeId: "all",
      sidebarCollapsed: false,
      setRole: (role) => set({ role }),
      setStore: (storeId) => set({ storeId }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: "mmk-admin-session" },
  ),
);
