/**
 * Module Fidélité : niveaux, points, cashback, coupons personnels.
 */
import { SITE } from "@/shared/lib/site";

export interface LoyaltyTier {
  id: "bronze" | "argent" | "or" | "platine";
  name: string;
  minSpent: number;
  multiplier: number;
  cashbackPct: number;
  perks: string[];
  gradient: string;
}

export const TIERS: LoyaltyTier[] = [
  { id: "bronze", name: "Bronze", minSpent: 0, multiplier: 1, cashbackPct: 0, perks: ["1 point / 1 000 FCFA", "Offres exclusives par email"], gradient: "from-orange-300 to-amber-700" },
  { id: "argent", name: "Argent", minSpent: 100_000, multiplier: 1.25, cashbackPct: 1, perks: ["Points ×1,25", "1 % de cashback", "Accès anticipé aux ventes flash"], gradient: "from-slate-300 to-slate-500" },
  { id: "or", name: "Or", minSpent: 300_000, multiplier: 1.5, cashbackPct: 2, perks: ["Points ×1,5", "2 % de cashback", "Livraison express offerte 2×/mois", "Service client prioritaire"], gradient: "from-gold-400 to-gold-600" },
  { id: "platine", name: "Platine", minSpent: 800_000, multiplier: 2, cashbackPct: 3, perks: ["Points ×2", "3 % de cashback", "Livraison gratuite illimitée", "Conseiller dédié WhatsApp"], gradient: "from-ink-700 to-ink-950" },
];

export function tierForSpent(spent: number): LoyaltyTier {
  return [...TIERS].reverse().find((t) => spent >= t.minSpent)!;
}

export function nextTier(spent: number): { tier: LoyaltyTier; remaining: number } | null {
  const next = TIERS.find((t) => t.minSpent > spent);
  return next ? { tier: next, remaining: next.minSpent - spent } : null;
}

export function pointsValue(points: number): number {
  return points * SITE.pointValue;
}

export function pointsEarned(amount: number, tier: LoyaltyTier): number {
  return Math.floor((amount / 1000) * SITE.pointsPerThousand * tier.multiplier);
}

export interface PointsEntry {
  id: string;
  date: string;
  label: string;
  points: number;
}

export const POINTS_HISTORY: PointsEntry[] = [
  { id: "pt1", date: "2026-10-12T10:20:00Z", label: "Commande MK-261012-8015", points: 36 },
  { id: "pt2", date: "2026-10-01T09:00:00Z", label: "Bonus niveau Or — octobre", points: 100 },
  { id: "pt3", date: "2026-09-22T16:45:00Z", label: "Points utilisés — commande MK-260922-8014", points: -300 },
  { id: "pt4", date: "2026-09-22T16:45:00Z", label: "Commande MK-260922-8014", points: 52 },
  { id: "pt5", date: "2026-09-10T12:00:00Z", label: "Avis produit publié (Baskets lumineuses LED)", points: 25 },
  { id: "pt6", date: "2026-08-30T18:10:00Z", label: "Commande MK-260830-8012", points: 61 },
  { id: "pt7", date: "2026-08-14T08:00:00Z", label: "Parrainage — Aya Koné", points: 200 },
  { id: "pt8", date: "2026-07-30T11:30:00Z", label: "Commande MK-260730-8010", points: 44 },
  { id: "pt9", date: "2026-07-02T09:00:00Z", label: "Points expirés", points: -60 },
];

export interface PersonalCoupon {
  code: string;
  label: string;
  expiresAt: string;
  kind: "coupon" | "bon" | "cashback";
  amount: string;
}

export const PERSONAL_COUPONS: PersonalCoupon[] = [
  { code: "ANNIV15", label: "Coupon anniversaire −15 %", expiresAt: "2026-11-30", kind: "coupon", amount: "−15 %" },
  { code: "AKWABA5000", label: "−5 000 FCFA dès 30 000 FCFA", expiresAt: "2026-11-30", kind: "coupon", amount: "−5 000" },
  { code: "LIVRAISON0", label: "Livraison offerte", expiresAt: "2026-10-31", kind: "coupon", amount: "0 FCFA" },
  { code: "BON-10000", label: "Bon d'achat (remboursement retour)", expiresAt: "2027-03-31", kind: "bon", amount: "10 000" },
];
