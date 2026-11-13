/**
 * Adaptateurs simulés. En production, chaque fichier appellerait l'API de l'agrégateur
 * côté serveur (route handler / server action) — l'interface reste la même.
 */
import type { PaymentProvider, PaymentRequest, PaymentResult } from "../types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ref = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

/** Règle de démo : un numéro / une carte se terminant par « 00 » simule un échec */
const shouldFail = (req: PaymentRequest) => Boolean(req.account && req.account.replace(/\s/g, "").endsWith("00"));

function mobileMoneyProvider(id: string, name: string, feePct: number): PaymentProvider {
  return {
    id,
    name,
    feePct,
    supports: ["orange_money", "mtn_momo", "moov_money", "wave"],
    async initiate(req): Promise<PaymentResult> {
      await wait(1600);
      if (shouldFail(req))
        return { status: "echoue", reference: ref("MM"), provider: name, amountCaptured: 0, message: "Solde insuffisant ou transaction refusée par l'opérateur." };
      return {
        status: "confirme",
        reference: ref("MM"),
        provider: name,
        amountCaptured: req.amount,
        message: "Paiement confirmé automatiquement par l'opérateur.",
        nextAction: req.method === "wave" ? "Validez le paiement dans l'application Wave" : "Composez le code reçu par USSD pour valider",
      };
    },
    async verify() {
      await wait(300);
      return "confirme";
    },
    async refund(reference) {
      await wait(800);
      return { ok: true, reference: `RF-${reference}`, message: "Remboursement envoyé sur le compte Mobile Money." };
    },
  };
}

export const cinetpayProvider = mobileMoneyProvider("cinetpay", "CinetPay (simulé)", 2.5);
export const paydunyaProvider = mobileMoneyProvider("paydunya", "PayDunya (simulé)", 2.2);

export const cardProvider: PaymentProvider = {
  id: "stripe",
  name: "Passerelle carte (simulée)",
  feePct: 2.9,
  supports: ["carte", "plusieurs_fois", "acompte"],
  async initiate(req) {
    await wait(1800);
    if (shouldFail(req)) return { status: "echoue", reference: ref("CB"), provider: this.name, amountCaptured: 0, message: "Carte refusée (3-D Secure non validé)." };
    const captured = req.method === "plusieurs_fois" && req.installments ? Math.ceil(req.amount / req.installments) : req.method === "acompte" ? Math.ceil(req.amount * 0.3) : req.amount;
    return {
      status: captured < req.amount ? "partiel" : "confirme",
      reference: ref("CB"),
      provider: this.name,
      amountCaptured: captured,
      message: captured < req.amount ? "Premier versement encaissé, les échéances suivantes seront prélevées automatiquement." : "Paiement par carte confirmé.",
    };
  },
  async verify() {
    return "confirme";
  },
  async refund(reference) {
    await wait(800);
    return { ok: true, reference: `RF-${reference}`, message: "Remboursement sous 5 à 10 jours ouvrés sur la carte." };
  },
};

export const offlineProvider: PaymentProvider = {
  id: "offline",
  name: "Paiement hors ligne",
  feePct: 0,
  supports: ["livraison", "virement"],
  async initiate(req) {
    await wait(700);
    return {
      status: "en_attente",
      reference: ref(req.method === "virement" ? "VIR" : "COD"),
      provider: this.name,
      amountCaptured: 0,
      message: req.method === "virement" ? "Commande réservée 48 h en attente de votre virement." : "Vous paierez en espèces ou Mobile Money à la livraison.",
    };
  },
  async verify() {
    return "en_attente";
  },
  async refund(reference) {
    return { ok: true, reference: `AV-${reference}`, message: "Un avoir a été émis." };
  },
};
