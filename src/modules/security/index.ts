/**
 * Module Sécurité : journal d'activité, connexions, sessions, politiques.
 */
export interface ActivityLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  level: "info" | "warning" | "critical";
}

export const ACTIVITY_LOG: ActivityLog[] = [
  { id: "l1", at: "2026-10-26T09:55:00Z", actor: "Christelle Gnagne", action: "a créé la promotion", target: "Semaine du wax (−10 %)", ip: "41.207.12.4", level: "info" },
  { id: "l2", at: "2026-10-26T09:40:00Z", actor: "Système", action: "a bloqué 5 tentatives de connexion", target: "admin@mmkids.ci", ip: "102.89.33.7 (Lagos)", level: "critical" },
  { id: "l3", at: "2026-10-26T09:12:00Z", actor: "Mariam Coulibaly", action: "a modifié le statut de la commande", target: "MK-261026-4762 → Expédiée", ip: "160.154.8.21", level: "info" },
  { id: "l4", at: "2026-10-26T08:58:00Z", actor: "Fatou Diabaté", action: "a exporté", target: "Transactions octobre (CSV)", ip: "41.207.12.9", level: "warning" },
  { id: "l5", at: "2026-10-26T08:31:00Z", actor: "Awa Touré", action: "a remboursé", target: "MK-261019-4690 (18 400 FCFA)", ip: "41.207.12.4", level: "warning" },
  { id: "l6", at: "2026-10-26T08:02:00Z", actor: "Melaine", action: "s'est connecté (2FA)", target: "Back-office", ip: "41.207.12.2", level: "info" },
  { id: "l7", at: "2026-10-26T07:15:00Z", actor: "Ibrahim Ouattara", action: "a ajusté le stock", target: "Robe d'été fleurie (−2, article taché)", ip: "196.47.3.18", level: "info" },
  { id: "l8", at: "2026-10-25T22:00:00Z", actor: "Système", action: "a effectué la sauvegarde automatique", target: "Base de données (2,4 Go)", ip: "—", level: "info" },
  { id: "l9", at: "2026-10-25T19:20:00Z", actor: "Melaine", action: "a modifié les permissions du rôle", target: "Vendeur", ip: "41.207.12.2", level: "warning" },
  { id: "l10", at: "2026-10-25T17:48:00Z", actor: "Système", action: "a limité le débit (rate limiting)", target: "API /recherche — 312 req/min", ip: "185.220.101.5", level: "critical" },
  { id: "l11", at: "2026-10-25T15:05:00Z", actor: "Serge Bamba", action: "a masqué un avis", target: "Avis abusif — Sneakers Off-White", ip: "160.154.8.40", level: "info" },
  { id: "l12", at: "2026-10-25T11:30:00Z", actor: "Melaine", action: "a suspendu le compte", target: "Hervé Assi (Vendeur)", ip: "41.207.12.2", level: "warning" },
];

export const ADMIN_SESSIONS = [
  { id: "as1", user: "Melaine", device: "MacBook Pro · Chrome", location: "Abidjan, Cocody", ip: "41.207.12.2", since: "2026-10-26T08:02:00Z", current: true },
  { id: "as2", user: "Awa Touré", device: "Windows · Edge", location: "Abidjan, Cocody", ip: "41.207.12.4", since: "2026-10-26T07:45:00Z", current: false },
  { id: "as3", user: "Mariam Coulibaly", device: "iPad · Safari", location: "Abidjan, Yopougon", ip: "160.154.8.21", since: "2026-10-26T09:10:00Z", current: false },
  { id: "as4", user: "Ibrahim Ouattara", device: "Android · Application", location: "Abidjan, Vridi", ip: "196.47.3.18", since: "2026-10-26T06:30:00Z", current: false },
  { id: "as5", user: "Christelle Gnagne", device: "Windows · Chrome", location: "Abidjan, Plateau", ip: "41.207.12.9", since: "2026-10-26T09:55:00Z", current: false },
];

export const SECURITY_POLICIES = [
  { id: "2fa", label: "2FA obligatoire pour les administrateurs", description: "Code SMS ou application d'authentification", enabled: true },
  { id: "bruteforce", label: "Protection anti-brute-force", description: "Verrouillage 15 min après 5 tentatives échouées", enabled: true },
  { id: "ratelimit", label: "Rate limiting API", description: "100 requêtes / minute / IP, 1 000 pour les partenaires", enabled: true },
  { id: "encryption", label: "Chiffrement des données sensibles", description: "AES-256 au repos, TLS 1.3 en transit (téléphones, adresses, IBAN)", enabled: true },
  { id: "backup", label: "Sauvegardes automatiques", description: "Quotidiennes à 22 h, rétention 30 jours, copie hors site", enabled: true },
  { id: "session", label: "Expiration des sessions", description: "Déconnexion après 30 min d'inactivité", enabled: true },
  { id: "ipallow", label: "Restriction d'IP pour le back-office", description: "Autoriser uniquement les réseaux des boutiques", enabled: false },
  { id: "masking", label: "Masquage des données clients", description: "Téléphones et emails partiellement masqués pour les vendeurs", enabled: true },
];

export const BACKUPS = [
  { at: "2026-10-25T22:00:00Z", size: "2,4 Go", status: "ok" },
  { at: "2026-10-24T22:00:00Z", size: "2,4 Go", status: "ok" },
  { at: "2026-10-23T22:00:00Z", size: "2,3 Go", status: "ok" },
  { at: "2026-10-22T22:00:00Z", size: "2,3 Go", status: "ok" },
];
