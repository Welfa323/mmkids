import { SITE } from "@/shared/lib/site";
import { DELIVERY_MODES, RELAY_POINTS, ZONE_BY_ID, type DeliveryMode, type DeliveryZone } from "../data/zones";
import { DEMO_NOW, DAY_MS } from "@/shared/lib/clock";
import { formatDate } from "@/shared/lib/format";

export const FREE_SHIPPING_THRESHOLD: Record<DeliveryZone["group"], number | null> = {
  abidjan: SITE.freeShippingThreshold,
  interieur: 50_000,
  international: null,
};

export interface ShippingQuote {
  fee: number;
  baseFee: number;
  free: boolean;
  /** montant restant pour la livraison gratuite (null si non applicable) */
  remainingForFree: number | null;
  threshold: number | null;
  eta: string;
  available: boolean;
  reason?: string;
}

export function quoteShipping(params: {
  zoneId: string;
  mode: DeliveryMode;
  subtotal: number;
  relayId?: string;
  forceFree?: boolean;
}): ShippingQuote {
  const zone = ZONE_BY_ID[params.zoneId] ?? ZONE_BY_ID.cocody;
  const modeInfo = DELIVERY_MODES.find((m) => m.id === params.mode)!;
  const threshold = FREE_SHIPPING_THRESHOLD[zone.group];

  if (params.mode === "retrait") {
    return { fee: 0, baseFee: 0, free: true, remainingForFree: null, threshold: null, eta: "Prêt en 2 h en boutique", available: true };
  }
  if (params.mode === "relais") {
    const relay = RELAY_POINTS.find((r) => r.id === params.relayId) ?? RELAY_POINTS[0];
    return { fee: relay.fee, baseFee: relay.fee, free: false, remainingForFree: null, threshold: null, eta: "Disponible sous 24 à 48 h", available: true };
  }
  if (params.mode === "express" && !zone.expressAvailable) {
    return { fee: 0, baseFee: 0, free: false, remainingForFree: null, threshold, eta: "", available: false, reason: `L'express n'est pas disponible pour ${zone.name}` };
  }

  const base = zone.fee + modeInfo.surcharge;
  const qualifiesFree = params.mode === "standard" && threshold != null && params.subtotal >= threshold;
  const free = Boolean(params.forceFree) || qualifiesFree;
  return {
    fee: free ? (params.mode === "standard" ? 0 : modeInfo.surcharge) : base,
    baseFee: base,
    free,
    remainingForFree: params.mode === "standard" && threshold != null ? Math.max(0, threshold - params.subtotal) : null,
    threshold,
    eta: params.mode === "express" ? "Aujourd'hui en moins de 3 h" : params.mode === "programmee" ? "Au créneau choisi" : estimateDelivery(zone),
    available: true,
  };
}

export function estimateDelivery(zone: DeliveryZone): string {
  if (zone.maxDays <= 1 && zone.minDays === 0) return "Aujourd'hui ou demain";
  const from = new Date(DEMO_NOW.getTime() + Math.max(1, zone.minDays) * DAY_MS);
  const to = new Date(DEMO_NOW.getTime() + zone.maxDays * DAY_MS);
  return zone.minDays === zone.maxDays ? `Le ${formatDate(from, { weekday: true })}` : `Entre le ${formatDate(from)} et le ${formatDate(to)}`;
}
