/**
 * Module Notifications : système centralisé (événements → canaux → destinataires).
 */
export type Audience = "client" | "commercant";

export interface NotificationEvent {
  id: string;
  audience: Audience;
  label: string;
  channels: { email: boolean; sms: boolean; whatsapp: boolean; push: boolean };
  template: string;
}

export const NOTIFICATION_EVENTS: NotificationEvent[] = [
  { id: "c1", audience: "client", label: "Commande reçue", channels: { email: true, sms: true, whatsapp: true, push: true }, template: "Merci {prénom} ! Votre commande {numéro} de {total} est bien reçue." },
  { id: "c2", audience: "client", label: "Paiement confirmé", channels: { email: true, sms: false, whatsapp: true, push: true }, template: "Paiement de {montant} confirmé via {moyen}." },
  { id: "c3", audience: "client", label: "Commande préparée", channels: { email: false, sms: false, whatsapp: true, push: true }, template: "Votre commande {numéro} est prête 📦" },
  { id: "c4", audience: "client", label: "Commande expédiée", channels: { email: true, sms: true, whatsapp: true, push: true }, template: "Expédiée avec {transporteur}. Suivi : {lien}" },
  { id: "c5", audience: "client", label: "Livraison en cours", channels: { email: false, sms: true, whatsapp: true, push: true }, template: "Votre livreur arrive entre {créneau}. Tél : {téléphone}" },
  { id: "c6", audience: "client", label: "Commande livrée", channels: { email: true, sms: false, whatsapp: true, push: true }, template: "Livrée ✅ Donnez votre avis et gagnez 25 points : {lien}" },
  { id: "c7", audience: "client", label: "Promotion", channels: { email: true, sms: false, whatsapp: true, push: true }, template: "{titre} — {réduction} jusqu'au {date}" },
  { id: "c8", audience: "client", label: "Nouveau produit / retour en stock", channels: { email: true, sms: false, whatsapp: false, push: true }, template: "{produit} est de nouveau disponible !" },
  { id: "c9", audience: "client", label: "Retour accepté", channels: { email: true, sms: true, whatsapp: true, push: false }, template: "Votre retour est accepté. Collecte prévue le {date}." },
  { id: "c10", audience: "client", label: "Remboursement effectué", channels: { email: true, sms: true, whatsapp: true, push: true }, template: "{montant} remboursés sur {moyen}." },
  { id: "m1", audience: "commercant", label: "Nouvelle commande", channels: { email: false, sms: false, whatsapp: true, push: true }, template: "🛒 {numéro} — {total} ({ville})" },
  { id: "m2", audience: "commercant", label: "Paiement reçu", channels: { email: true, sms: false, whatsapp: false, push: true }, template: "💰 {montant} reçus via {moyen}" },
  { id: "m3", audience: "commercant", label: "Stock faible", channels: { email: true, sms: false, whatsapp: true, push: true }, template: "⚠️ {produit} : plus que {quantité} unités ({boutique})" },
  { id: "m4", audience: "commercant", label: "Rupture", channels: { email: true, sms: true, whatsapp: true, push: true }, template: "⛔ {produit} en rupture ({boutique})" },
  { id: "m5", audience: "commercant", label: "Retour client", channels: { email: true, sms: false, whatsapp: false, push: true }, template: "↩️ Retour demandé sur {numéro} : {motif}" },
  { id: "m6", audience: "commercant", label: "Échec paiement", channels: { email: true, sms: false, whatsapp: false, push: true }, template: "❌ Paiement échoué sur {numéro} ({moyen})" },
  { id: "m7", audience: "commercant", label: "Livraison problématique", channels: { email: true, sms: true, whatsapp: true, push: true }, template: "🚨 {numéro} : {incident}" },
];

export interface MerchantNotification {
  id: string;
  kind: "commande" | "paiement" | "stock" | "rupture" | "retour" | "echec" | "livraison";
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

export const MERCHANT_FEED: MerchantNotification[] = [
  { id: "mf1", kind: "commande", title: "Nouvelle commande", body: "MK-261026 · 24 300 FCFA · Cocody", at: "2026-10-26T14:22:00Z", read: false, href: "/admin/commandes" },
  { id: "mf2", kind: "rupture", title: "Rupture de stock", body: "Robe en wax fille (6 ans) — tous points de vente", at: "2026-10-26T13:50:00Z", read: false, href: "/admin/stock" },
  { id: "mf3", kind: "echec", title: "Échec de paiement", body: "Orange Money refusé — solde insuffisant (Abobo)", at: "2026-10-26T13:31:00Z", read: false, href: "/admin/paiements" },
  { id: "mf4", kind: "stock", title: "Stock faible", body: "Body manches courtes étoiles : 4 unités restantes (Boutique Cocody)", at: "2026-10-26T12:05:00Z", read: false, href: "/admin/stock" },
  { id: "mf5", kind: "paiement", title: "Paiement reçu", body: "Wave · 32 900 FCFA", at: "2026-10-26T11:47:00Z", read: true, href: "/admin/paiements" },
  { id: "mf6", kind: "livraison", title: "Livraison problématique", body: "Client injoignable à Yopougon — 2e tentative", at: "2026-10-26T10:20:00Z", read: true, href: "/admin/livraison" },
  { id: "mf7", kind: "retour", title: "Retour client", body: "Baskets à scratch enfant — pointure non adaptée", at: "2026-10-26T09:02:00Z", read: true, href: "/admin/commandes" },
];
