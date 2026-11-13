"use client";

import { useMemo } from "react";
import { useCart } from "../store/cart.store";
import { computeCart } from "../services/cart-pricing";
import { useAuth } from "@/modules/customer/store/auth.store";

export function useCartSummary() {
  const { lines, promoCode, voucherCode, usePoints, zoneId, mode, relayId } = useCart();
  const user = useAuth((s) => s.user);
  return useMemo(
    () => computeCart(lines, { promoCode, voucherCode, usePoints, availablePoints: user?.points ?? 0, zoneId, mode, relayId }),
    [lines, promoCode, voucherCode, usePoints, user?.points, zoneId, mode, relayId],
  );
}

export function useCartCount() {
  return useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
}
