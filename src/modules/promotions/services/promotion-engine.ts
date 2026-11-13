/**
 * Moteur promotionnel : évalue un code promo sur un panier.
 * Chaque type de promotion est une règle indépendante — on peut en ajouter sans toucher au panier.
 */
import { DEMO_NOW } from "@/shared/lib/clock";
import { formatPrice } from "@/shared/lib/format";
import { PROMOTIONS, VOUCHERS, type Promotion } from "../data/promotions";

export interface PricedLine {
  productId: string;
  category: string;
  subcategory: string;
  brand: string;
  unitPrice: number;
  qty: number;
}

export interface PromoEvaluation {
  ok: boolean;
  code: string;
  message: string;
  discount: number;
  freeShipping?: boolean;
  promotion?: Promotion;
}

export function findPromotionByCode(code: string): Promotion | undefined {
  return PROMOTIONS.find((p) => p.code?.toUpperCase() === code.trim().toUpperCase());
}

function isActive(p: Promotion): { ok: boolean; reason?: string } {
  const now = DEMO_NOW.toISOString().slice(0, 10);
  if (p.status === "brouillon") return { ok: false, reason: "Ce code n'est pas encore publié." };
  if (now < p.startsAt) return { ok: false, reason: `Ce code sera valable à partir du ${p.startsAt.split("-").reverse().join("/")}.` };
  if (now > p.endsAt) return { ok: false, reason: "Ce code a expiré." };
  return { ok: true };
}

export function evaluatePromoCode(code: string, lines: PricedLine[], ctx: { isFirstOrder?: boolean } = {}): PromoEvaluation {
  const promo = findPromotionByCode(code);
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const fail = (message: string): PromoEvaluation => ({ ok: false, code, message, discount: 0 });
  if (!promo) return fail("Code promo inconnu. Vérifiez l'orthographe.");
  const active = isActive(promo);
  if (!active.ok) return fail(active.reason!);
  if (promo.minOrder && subtotal < promo.minOrder) return fail(`Ce code nécessite un minimum d'achat de ${formatPrice(promo.minOrder)}.`);
  if (promo.type === "premiere_commande" && ctx.isFirstOrder === false) return fail("Ce code est réservé à la première commande.");

  const cap = (v: number) => Math.round(promo.maxDiscount ? Math.min(v, promo.maxDiscount) : v);
  const pct = (base: number) => cap((base * promo.value) / 100);

  switch (promo.type) {
    case "livraison_gratuite":
      return { ok: true, code, message: "Livraison offerte appliquée 🎉", discount: 0, freeShipping: true, promotion: promo };
    case "code_montant":
      return { ok: true, code, message: `−${formatPrice(promo.value)} appliqués`, discount: Math.min(promo.value, subtotal), promotion: promo };
    case "categorie": {
      const eligible = lines.filter((l) => l.subcategory.includes(promo.category!) || l.category === promo.category);
      const base = eligible.reduce((s, l) => s + l.unitPrice * l.qty, 0);
      if (!base) return fail("Aucun article de votre panier n'est concerné par ce code.");
      return { ok: true, code, message: `−${promo.value} % sur ${eligible.length} article(s) éligible(s)`, discount: pct(base), promotion: promo };
    }
    case "marque": {
      const base = lines.filter((l) => l.brand === promo.brand).reduce((s, l) => s + l.unitPrice * l.qty, 0);
      if (!base) return fail("Aucun article de cette marque dans votre panier.");
      return { ok: true, code, message: `−${promo.value} % sur la marque`, discount: pct(base), promotion: promo };
    }
    default: {
      const base = promo.category ? lines.filter((l) => l.category === promo.category).reduce((s, l) => s + l.unitPrice * l.qty, 0) : subtotal;
      if (!base) return fail("Aucun article de votre panier n'est concerné par ce code.");
      return { ok: true, code, message: `−${promo.value} % appliqués`, discount: pct(base), promotion: promo };
    }
  }
}

export function evaluateVoucher(code: string): { ok: boolean; amount: number; message: string } {
  const amount = VOUCHERS[code.trim().toUpperCase()];
  if (!amount) return { ok: false, amount: 0, message: "Bon d'achat invalide ou déjà utilisé." };
  return { ok: true, amount, message: `Bon d'achat de ${formatPrice(amount)} appliqué` };
}

/** Résumé lisible d'une promotion (ex. « −20 % sur les chaussures du 1er au 15 novembre ») */
export function describePromotion(p: Pick<Promotion, "type" | "value" | "category" | "brand" | "startsAt" | "endsAt" | "minOrder">, labels: { category?: string; brand?: string } = {}): string {
  const fmt = (d: string) => {
    const [, m, day] = d.split("-").map(Number);
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return `${day === 1 ? "1er" : day} ${months[m - 1]}`;
  };
  const period = p.startsAt && p.endsAt ? ` du ${fmt(p.startsAt)} au ${fmt(p.endsAt)}` : "";
  const target = labels.category ? ` sur ${labels.category.toLowerCase()}` : labels.brand ? ` sur la marque ${labels.brand}` : "";
  const min = p.minOrder ? ` dès ${formatPrice(p.minOrder)} d'achat` : "";
  switch (p.type) {
    case "code_montant":
      return `−${formatPrice(p.value)}${target}${min}${period}`;
    case "livraison_gratuite":
      return `Livraison gratuite${min}${period}`;
    case "x_achetes_y_offert":
      return `2 achetés = 1 offert${target}${period}`;
    case "produit_offert":
      return `Un produit offert${min}${period}`;
    default:
      return `−${p.value} %${target}${min}${period}`;
  }
}
