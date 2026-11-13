/**
 * Module Facturation : numérotation, types de documents, calculs fiscaux.
 */
import type { Order } from "@/modules/orders";
import { ORDERS } from "@/modules/orders";
import { SITE } from "@/shared/lib/site";

export type DocumentType = "facture" | "bon-de-commande" | "bon-de-livraison" | "recu" | "avoir";

export const DOCUMENT_META: Record<DocumentType, { label: string; prefix: string }> = {
  facture: { label: "Facture", prefix: "FA" },
  "bon-de-commande": { label: "Bon de commande", prefix: "BC" },
  "bon-de-livraison": { label: "Bon de livraison", prefix: "BL" },
  recu: { label: "Reçu de paiement", prefix: "RC" },
  avoir: { label: "Avoir", prefix: "AV" },
};

export function documentNumber(type: DocumentType, order: Order): string {
  const seq = order.number.split("-").pop();
  return `${DOCUMENT_META[type].prefix}-${order.createdAt.slice(0, 4)}-${seq}`;
}

/** Les prix sont TTC : on extrait la TVA (18 %) */
export function taxBreakdown(totalTtc: number) {
  const ht = Math.round(totalTtc / (1 + SITE.vatRate));
  return { ht, tva: totalTtc - ht, ttc: totalTtc };
}

export interface BillingDocument {
  id: string;
  number: string;
  type: DocumentType;
  orderNumber: string;
  customer: string;
  amount: number;
  date: string;
  status: "emis" | "envoye" | "paye" | "annule";
}

/** Historique des documents générés automatiquement à partir des commandes */
export function buildDocuments(): BillingDocument[] {
  const docs: BillingDocument[] = [];
  ORDERS.slice(0, 120).forEach((o) => {
    const push = (type: DocumentType, status: BillingDocument["status"], amount = o.total) =>
      docs.push({ id: `${type}-${o.id}`, number: documentNumber(type, o), type, orderNumber: o.number, customer: o.customerName, amount, date: o.createdAt, status });
    push("bon-de-commande", "emis");
    if (o.paidAmount > 0) {
      push("facture", "paye");
      push("recu", "paye", o.paidAmount);
    } else if (!["annulee", "echec_paiement"].includes(o.status)) push("facture", "envoye");
    if (["expediee", "en_livraison", "livree", "retour", "remboursee"].includes(o.status)) push("bon-de-livraison", "emis");
    if (o.status === "remboursee") push("avoir", "emis", -o.total);
  });
  return docs.sort((a, b) => b.date.localeCompare(a.date));
}
