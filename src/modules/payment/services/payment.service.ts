/**
 * Registre des agrégateurs + routage par moyen de paiement (avec bascule automatique).
 */
import { cardProvider, cinetpayProvider, offlineProvider, paydunyaProvider } from "../providers/mock-providers";
import type { PaymentMethodId, PaymentProvider, PaymentRequest, PaymentResult } from "../types";

export const PROVIDERS: PaymentProvider[] = [cinetpayProvider, paydunyaProvider, cardProvider, offlineProvider];

/** Ordre de préférence par moyen de paiement — modifiable depuis le back-office */
export const ROUTING: Record<PaymentMethodId, string[]> = {
  orange_money: ["cinetpay", "paydunya"],
  mtn_momo: ["cinetpay", "paydunya"],
  moov_money: ["paydunya", "cinetpay"],
  wave: ["paydunya"],
  carte: ["stripe"],
  plusieurs_fois: ["stripe"],
  acompte: ["stripe"],
  livraison: ["offline"],
  virement: ["offline"],
};

export function providerFor(method: PaymentMethodId): PaymentProvider {
  const id = ROUTING[method][0];
  return PROVIDERS.find((p) => p.id === id)!;
}

export async function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  let last: PaymentResult | undefined;
  for (const id of ROUTING[req.method]) {
    const provider = PROVIDERS.find((p) => p.id === id);
    if (!provider) continue;
    try {
      last = await provider.initiate(req);
      // Échec fonctionnel (solde, refus) : inutile de basculer
      return last;
    } catch {
      // Panne technique de l'agrégateur : on bascule sur le suivant
      continue;
    }
  }
  return last ?? { status: "echoue", reference: "-", provider: "-", amountCaptured: 0, message: "Aucun agrégateur disponible." };
}

export interface PaymentMethodInfo {
  id: PaymentMethodId;
  label: string;
  short: string;
  description: string;
  group: "mobile" | "carte" | "autre";
  color: string;
  needsAccount?: "phone" | "card";
}

export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  { id: "orange_money", label: "Orange Money", short: "OM", description: "Validation par USSD #144#", group: "mobile", color: "bg-[#ff7900] text-white", needsAccount: "phone" },
  { id: "mtn_momo", label: "MTN MoMo", short: "MoMo", description: "Validation sur votre téléphone", group: "mobile", color: "bg-[#ffcb05] text-ink-900", needsAccount: "phone" },
  { id: "wave", label: "Wave", short: "Wave", description: "Sans frais, via l'application Wave", group: "mobile", color: "bg-[#1dc8f2] text-white", needsAccount: "phone" },
  { id: "moov_money", label: "Moov Money", short: "Moov", description: "Validation par USSD #155#", group: "mobile", color: "bg-[#0066b3] text-white", needsAccount: "phone" },
  { id: "carte", label: "Carte bancaire", short: "CB", description: "Visa, Mastercard, GIM-UEMOA — 3-D Secure", group: "carte", color: "bg-ink-900 text-white", needsAccount: "card" },
  { id: "plusieurs_fois", label: "Paiement en 3 fois", short: "3×", description: "Par carte, sans frais dès 30 000 FCFA", group: "carte", color: "bg-brand-700 text-white", needsAccount: "card" },
  { id: "acompte", label: "Acompte 30 %", short: "30 %", description: "Payez 30 % maintenant, le solde à la livraison", group: "carte", color: "bg-gold-500 text-white", needsAccount: "card" },
  { id: "livraison", label: "Paiement à la livraison", short: "COD", description: "Espèces ou Mobile Money au livreur", group: "autre", color: "bg-brand-100 text-brand-800" },
  { id: "virement", label: "Virement bancaire", short: "VIR", description: "Commande réservée 48 h", group: "autre", color: "bg-ink-100 text-ink-700" },
];

export const PAYMENT_LABEL = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.id, m.label])) as Record<PaymentMethodId, string>;
