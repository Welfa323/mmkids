"use client";

import { useMemo } from "react";
import { getCustomerOrders } from "@/modules/orders";
import { usePlacedOrders } from "@/modules/orders/store/placed-orders.store";
import { useAuth } from "../store/auth.store";

/** Commandes du client connecté : historique fictif + commandes passées pendant la démo */
export function useMyOrders() {
  const user = useAuth((s) => s.user);
  const placed = usePlacedOrders((s) => s.orders);
  return useMemo(() => {
    if (!user) return [];
    const mine = placed.filter((o) => o.customerId === user.id);
    return [...mine, ...getCustomerOrders(user.id)];
  }, [user, placed]);
}
