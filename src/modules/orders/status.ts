import type { OrderStatus } from "./types";

export const ORDER_FLOW: OrderStatus[] = ["nouvelle", "paiement_en_attente", "payee", "en_preparation", "prete", "expediee", "en_livraison", "livree"];

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string; dot: string; customerLabel: string }> = {
  nouvelle: { label: "Nouvelle", tone: "bg-sky-50 text-sky-700 ring-sky-600/20", dot: "bg-sky-500", customerLabel: "Commande reçue" },
  paiement_en_attente: { label: "Paiement en attente", tone: "bg-amber-50 text-amber-700 ring-amber-600/20", dot: "bg-amber-500", customerLabel: "En attente de paiement" },
  payee: { label: "Payée", tone: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500", customerLabel: "Paiement confirmé" },
  en_preparation: { label: "En préparation", tone: "bg-indigo-50 text-indigo-700 ring-indigo-600/20", dot: "bg-indigo-500", customerLabel: "Commande en préparation" },
  prete: { label: "Prête", tone: "bg-violet-50 text-violet-700 ring-violet-600/20", dot: "bg-violet-500", customerLabel: "Commande préparée" },
  expediee: { label: "Expédiée", tone: "bg-cyan-50 text-cyan-700 ring-cyan-600/20", dot: "bg-cyan-500", customerLabel: "Expédiée" },
  en_livraison: { label: "En livraison", tone: "bg-brand-50 text-brand-700 ring-brand-600/20", dot: "bg-brand-500", customerLabel: "En route" },
  livree: { label: "Livrée", tone: "bg-brand-100 text-brand-800 ring-brand-700/20", dot: "bg-brand-700", customerLabel: "Livrée" },
  annulee: { label: "Annulée", tone: "bg-ink-100 text-ink-600 ring-ink-500/20", dot: "bg-ink-400", customerLabel: "Annulée" },
  echec_paiement: { label: "Échec paiement", tone: "bg-red-50 text-red-700 ring-red-600/20", dot: "bg-red-500", customerLabel: "Échec du paiement" },
  retour: { label: "Retour", tone: "bg-orange-50 text-orange-700 ring-orange-600/20", dot: "bg-orange-500", customerLabel: "Retour en cours" },
  remboursee: { label: "Remboursée", tone: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20", dot: "bg-fuchsia-500", customerLabel: "Remboursée" },
};

/** Étapes visibles côté client : Commande préparée → Expédiée → En route → Livrée */
export const CUSTOMER_TRACKING_STEPS: { key: OrderStatus[]; label: string }[] = [
  { key: ["nouvelle", "paiement_en_attente", "payee"], label: "Confirmée" },
  { key: ["en_preparation", "prete"], label: "Préparée" },
  { key: ["expediee"], label: "Expédiée" },
  { key: ["en_livraison"], label: "En route" },
  { key: ["livree"], label: "Livrée" },
];

export function trackingStepIndex(status: OrderStatus): number {
  return CUSTOMER_TRACKING_STEPS.findIndex((s) => s.key.includes(status));
}

export function canCancel(status: OrderStatus) {
  return ["nouvelle", "paiement_en_attente", "payee", "en_preparation"].includes(status);
}

export function canReturn(status: OrderStatus) {
  return status === "livree";
}

/** Transitions autorisées depuis le back-office */
export function nextStatuses(status: OrderStatus): OrderStatus[] {
  const i = ORDER_FLOW.indexOf(status);
  const forward = i >= 0 && i < ORDER_FLOW.length - 1 ? [ORDER_FLOW[i + 1]] : [];
  const extra: OrderStatus[] = [];
  if (canCancel(status)) extra.push("annulee");
  if (status === "paiement_en_attente") extra.push("echec_paiement");
  if (status === "livree") extra.push("retour");
  if (status === "retour") extra.push("remboursee");
  if (status === "echec_paiement") extra.push("paiement_en_attente");
  return [...forward, ...extra];
}
