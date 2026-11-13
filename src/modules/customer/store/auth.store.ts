"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_CUSTOMER, type CustomerProfile } from "../data/customer";

interface AuthState {
  user: CustomerProfile | null;
  login: (email?: string) => void;
  logout: () => void;
  update: (patch: Partial<CustomerProfile>) => void;
}

/** Authentification simulée : n'importe quel identifiant connecte le compte de démonstration */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email) => set({ user: { ...DEMO_CUSTOMER, email: email && email.includes("@") ? email : DEMO_CUSTOMER.email } }),
      logout: () => set({ user: null }),
      update: (patch) => set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),
    }),
    { name: "mmk-auth", skipHydration: true },
  ),
);
