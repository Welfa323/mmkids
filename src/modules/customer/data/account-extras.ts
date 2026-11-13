export interface CustomerNotification {
  id: string;
  kind: "commande" | "paiement" | "livraison" | "promo" | "produit" | "retour" | "remboursement";
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

export const CUSTOMER_NOTIFICATIONS: CustomerNotification[] = [
  { id: "n1", kind: "livraison", title: "Votre colis est en route 🚚", body: "Le livreur MMKids Express arrive à Cocody entre 15 h et 17 h. Commande MK-261026-8017.", at: "2026-10-26T13:05:00Z", read: false, href: "/compte/commandes/o8017" },
  { id: "n2", kind: "commande", title: "Commande expédiée", body: "MK-261023-8016 a été remise à Kolis CI. Suivi : TRK…", at: "2026-10-24T09:12:00Z", read: false, href: "/compte/commandes/o8016" },
  { id: "n3", kind: "promo", title: "−20 % sur les chaussures enfant 👟", body: "Votre catégorie préférée est en promo avec le code CHAUSSURES20 jusqu'au 15 novembre.", at: "2026-10-20T08:00:00Z", read: true, href: "/recherche?q=chaussures" },
  { id: "n4", kind: "paiement", title: "Paiement confirmé", body: "Nous avons bien reçu 21 400 FCFA via Orange Money.", at: "2026-10-23T10:31:00Z", read: true },
  { id: "n5", kind: "produit", title: "De retour en stock", body: "Le produit que vous suiviez est de nouveau disponible.", at: "2026-10-18T07:45:00Z", read: true, href: "/collection/nouveautes" },
  { id: "n6", kind: "remboursement", title: "Remboursement effectué", body: "16 900 FCFA ont été remboursés sur votre compte Wave (commande MK-260911-8013).", at: "2026-09-16T14:20:00Z", read: true },
  { id: "n7", kind: "retour", title: "Retour accepté", body: "Votre demande de retour a été acceptée. Un livreur passera le récupérer.", at: "2026-09-13T11:00:00Z", read: true },
];

export const NOTIFICATION_PREFS = [
  { event: "Commande reçue & confirmée", email: true, sms: true, whatsapp: true, push: true },
  { event: "Paiement confirmé", email: true, sms: false, whatsapp: true, push: true },
  { event: "Commande préparée / expédiée", email: false, sms: true, whatsapp: true, push: true },
  { event: "Livraison (livreur en route)", email: false, sms: true, whatsapp: true, push: true },
  { event: "Retours & remboursements", email: true, sms: true, whatsapp: true, push: false },
  { event: "Promotions & ventes flash", email: true, sms: false, whatsapp: true, push: true },
  { event: "Nouveaux produits & retours en stock", email: true, sms: false, whatsapp: false, push: true },
];

export const SESSIONS = [
  { id: "s1", device: "iPhone 13 · Safari", location: "Abidjan, Cocody", ip: "102.67.xx.12", lastActive: "Actif maintenant", current: true },
  { id: "s2", device: "Windows · Chrome", location: "Abidjan, Plateau", ip: "41.207.xx.88", lastActive: "Il y a 2 h", current: false },
  { id: "s3", device: "Application Android", location: "Bouaké", ip: "160.154.xx.4", lastActive: "Il y a 6 jours", current: false },
];

export const LOGIN_HISTORY = [
  { at: "2026-10-26T08:12:00Z", device: "iPhone 13 · Safari", location: "Abidjan", method: "Mot de passe", ok: true },
  { at: "2026-10-25T19:40:00Z", device: "Windows · Chrome", location: "Abidjan", method: "Google", ok: true },
  { at: "2026-10-24T22:03:00Z", device: "Inconnu · Firefox", location: "Lagos, Nigeria", method: "Mot de passe", ok: false },
  { at: "2026-10-20T07:55:00Z", device: "Application Android", location: "Bouaké", method: "Code SMS", ok: true },
];
