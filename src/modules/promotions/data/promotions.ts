export type PromotionType =
  | "code_pourcentage"
  | "code_montant"
  | "produit_offert"
  | "x_achetes_y_offert"
  | "categorie"
  | "marque"
  | "quantite"
  | "flash"
  | "clients_cibles"
  | "livraison_gratuite"
  | "premiere_commande"
  | "anniversaire";

export const PROMOTION_TYPE_LABEL: Record<PromotionType, string> = {
  code_pourcentage: "Code promo — pourcentage",
  code_montant: "Code promo — montant fixe",
  produit_offert: "Produit offert",
  x_achetes_y_offert: "2 achetés = 1 offert",
  categorie: "Promotion par catégorie",
  marque: "Promotion par marque",
  quantite: "Promotion sur quantité",
  flash: "Promotion limitée dans le temps",
  clients_cibles: "Réservée à certains clients",
  livraison_gratuite: "Livraison gratuite",
  premiere_commande: "Coupon première commande",
  anniversaire: "Coupon anniversaire",
};

export interface Promotion {
  id: string;
  name: string;
  code?: string;
  type: PromotionType;
  /** % ou montant FCFA selon le type */
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  category?: string;
  brand?: string;
  startsAt: string;
  endsAt: string;
  status: "active" | "planifiee" | "expiree" | "brouillon";
  usageCount: number;
  usageLimit?: number;
  revenue: number;
  audience?: string;
  description: string;
}

export const PROMOTIONS: Promotion[] = [
  { id: "pr1", name: "Bienvenue — première commande", code: "BIENVENUE10", type: "premiere_commande", value: 10, maxDiscount: 5000, startsAt: "2026-01-01", endsAt: "2026-12-31", status: "active", usageCount: 846, revenue: 18_400_000, description: "−10 % sur la première commande (plafonné à 5 000 FCFA)" },
  { id: "pr2", name: "Chaussures −20 %", code: "CHAUSSURES20", type: "categorie", value: 20, category: "chaussures", startsAt: "2026-10-20", endsAt: "2026-11-15", status: "active", usageCount: 268, revenue: 3_650_000, description: "−20 % sur toutes les chaussures enfant du 20 octobre au 15 novembre" },
  { id: "pr3", name: "Akwaba 5 000", code: "AKWABA5000", type: "code_montant", value: 5000, minOrder: 30000, startsAt: "2026-10-01", endsAt: "2026-11-30", status: "active", usageCount: 412, revenue: 15_200_000, description: "−5 000 FCFA dès 30 000 FCFA d'achat" },
  { id: "pr4", name: "Livraison offerte", code: "LIVRAISON0", type: "livraison_gratuite", value: 0, startsAt: "2026-10-15", endsAt: "2026-10-31", status: "active", usageCount: 530, revenue: 9_800_000, description: "Livraison standard gratuite sans minimum" },
  { id: "pr5", name: "Black Friday Kids", code: "BLACKKIDS", type: "code_pourcentage", value: 15, startsAt: "2026-11-27", endsAt: "2026-11-30", status: "planifiee", usageCount: 0, revenue: 0, description: "−15 % sur tout le site pendant le Black Friday" },
  { id: "pr6", name: "Pyjamas & dessous : 2 achetés = 1 offert", type: "x_achetes_y_offert", value: 1, category: "nuit", startsAt: "2026-10-24", endsAt: "2026-11-02", status: "active", usageCount: 174, revenue: 1_450_000, description: "2 articles pyjamas ou sous-vêtements achetés = le 3e offert" },
  { id: "pr7", name: "Semaine du wax", type: "marque", value: 10, brand: "wax-junior", startsAt: "2026-10-26", endsAt: "2026-11-01", status: "active", usageCount: 96, revenue: 1_380_000, description: "−10 % sur toute la marque Wax Junior" },
  { id: "pr8", name: "Lot de 3 — −15 %", type: "quantite", value: 15, startsAt: "2026-09-01", endsAt: "2026-12-31", status: "active", usageCount: 233, revenue: 2_100_000, description: "−15 % dès 3 articles identiques (idéal fratries et uniformes)" },
  { id: "pr9", name: "VIP Platine", code: "VIPPLATINE", type: "clients_cibles", value: 12, audience: "Clients VIP (> 200 000 FCFA dépensés)", startsAt: "2026-10-01", endsAt: "2026-12-31", status: "active", usageCount: 41, revenue: 1_900_000, description: "−12 % réservé aux clients VIP" },
  { id: "pr10", name: "Joyeux anniversaire !", code: "ANNIV15", type: "anniversaire", value: 15, maxDiscount: 7500, startsAt: "2026-01-01", endsAt: "2026-12-31", status: "active", usageCount: 188, revenue: 2_900_000, description: "−15 % le mois de l'anniversaire de votre enfant" },
  { id: "pr11", name: "Bonnet offert", type: "produit_offert", value: 0, minOrder: 40000, startsAt: "2026-10-10", endsAt: "2026-10-25", status: "expiree", usageCount: 62, revenue: 3_100_000, description: "Lot de 2 bonnets naissance offert dès 40 000 FCFA d'achat en rayon bébé" },
  { id: "pr12", name: "Ventes flash du jour", type: "flash", value: 45, startsAt: "2026-10-26", endsAt: "2026-10-26", status: "active", usageCount: 389, revenue: 2_600_000, description: "Jusqu'à −45 % pendant 24 h" },
  { id: "pr13", name: "Rentrée scolaire", code: "RENTREE", type: "categorie", value: 10, category: "ecole", startsAt: "2026-08-25", endsAt: "2026-09-20", status: "expiree", usageCount: 1_120, revenue: 21_400_000, description: "−10 % sur les uniformes, sacs et vestes" },
];

/** Bons d'achat (cartes cadeaux / avoirs) */
export const VOUCHERS: Record<string, number> = {
  "BON-25000": 25000,
  "BON-10000": 10000,
  "CADEAU-50K": 50000,
};
