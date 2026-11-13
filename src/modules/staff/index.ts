/**
 * Module Employés : rôles et permissions fines (module × action).
 */
export type RoleId = "super_admin" | "manager" | "vendeur" | "magasinier" | "comptable" | "marketing";
export type Action = "voir" | "creer" | "modifier" | "supprimer" | "exporter";

export const ADMIN_MODULES = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "ventes", label: "Gestion commerciale" },
  { id: "rentabilite", label: "Rentabilité" },
  { id: "commandes", label: "Commandes" },
  { id: "paiements", label: "Paiements" },
  { id: "paniers", label: "Paniers abandonnés" },
  { id: "facturation", label: "Facturation" },
  { id: "produits", label: "Produits" },
  { id: "stock", label: "Stock & inventaire" },
  { id: "avis", label: "Avis clients" },
  { id: "clients", label: "Clients (CRM)" },
  { id: "promotions", label: "Promotions" },
  { id: "marketing", label: "Marketing" },
  { id: "livraison", label: "Livraison" },
  { id: "boutiques", label: "Boutiques" },
  { id: "employes", label: "Employés & rôles" },
  { id: "securite", label: "Sécurité" },
  { id: "notifications", label: "Notifications" },
  { id: "seo", label: "SEO" },
  { id: "ia", label: "Assistant IA" },
] as const;

export type ModuleId = (typeof ADMIN_MODULES)[number]["id"];

const ALL: Action[] = ["voir", "creer", "modifier", "supprimer", "exporter"];
const RW: Action[] = ["voir", "creer", "modifier", "exporter"];
const R: Action[] = ["voir"];

export interface Role {
  id: RoleId;
  label: string;
  description: string;
  tone: string;
  permissions: Partial<Record<ModuleId, Action[]>>;
}

export const ROLES: Role[] = [
  {
    id: "super_admin",
    label: "Super Admin",
    description: "Accès complet à toute la plateforme",
    tone: "bg-ink-900 text-white",
    permissions: Object.fromEntries(ADMIN_MODULES.map((m) => [m.id, ALL])),
  },
  {
    id: "manager",
    label: "Manager",
    description: "Ventes, stock et commandes de sa boutique",
    tone: "bg-brand-100 text-brand-800",
    permissions: { dashboard: R, ventes: RW, rentabilite: R, commandes: ALL, paiements: R, paniers: RW, produits: RW, stock: ALL, avis: RW, clients: RW, livraison: RW, boutiques: R, ia: R, facturation: R },
  },
  { id: "vendeur", label: "Vendeur", description: "Traitement des commandes", tone: "bg-sky-100 text-sky-800", permissions: { commandes: ["voir", "creer", "modifier"], clients: R, produits: R, paniers: ["voir", "modifier"] } },
  { id: "magasinier", label: "Magasinier", description: "Gestion du stock et des inventaires", tone: "bg-amber-100 text-amber-800", permissions: { stock: ALL, produits: R, commandes: ["voir", "modifier"] } },
  { id: "comptable", label: "Comptable", description: "Paiements, factures et rentabilité", tone: "bg-violet-100 text-violet-800", permissions: { paiements: ALL, facturation: ALL, rentabilite: ["voir", "exporter"], ventes: ["voir", "exporter"], dashboard: R } },
  { id: "marketing", label: "Marketing", description: "Promotions, campagnes et SEO", tone: "bg-pink-100 text-pink-800", permissions: { promotions: ALL, marketing: ALL, clients: ["voir", "exporter"], avis: RW, seo: RW, ia: R, dashboard: R } },
];

export const ROLE_BY_ID = Object.fromEntries(ROLES.map((r) => [r.id, r])) as Record<RoleId, Role>;

export function can(role: RoleId, module: ModuleId, action: Action = "voir"): boolean {
  return ROLE_BY_ID[role].permissions[module]?.includes(action) ?? false;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleId;
  storeId: string;
  status: "actif" | "invite" | "suspendu";
  twoFactor: boolean;
  lastLogin: string;
}

export const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Melaine", email: "melaine@mmkids.ci", phone: "+225 07 01 01 01 01", role: "super_admin", storeId: "all", status: "actif", twoFactor: true, lastLogin: "2026-10-26T08:02:00Z" },
  { id: "e2", name: "Awa Touré", email: "awa.toure@mmkids.ci", phone: "+225 07 02 02 02 02", role: "manager", storeId: "cocody", status: "actif", twoFactor: true, lastLogin: "2026-10-26T07:45:00Z" },
  { id: "e3", name: "Serge Bamba", email: "serge.bamba@mmkids.ci", phone: "+225 05 03 03 03 03", role: "manager", storeId: "marcory", status: "actif", twoFactor: false, lastLogin: "2026-10-25T18:20:00Z" },
  { id: "e4", name: "Mariam Coulibaly", email: "mariam.c@mmkids.ci", phone: "+225 01 04 04 04 04", role: "manager", storeId: "yopougon", status: "actif", twoFactor: true, lastLogin: "2026-10-26T09:10:00Z" },
  { id: "e5", name: "Ibrahim Ouattara", email: "ibrahim.o@mmkids.ci", phone: "+225 07 05 05 05 05", role: "magasinier", storeId: "entrepot-abidjan", status: "actif", twoFactor: false, lastLogin: "2026-10-26T06:30:00Z" },
  { id: "e6", name: "Konan Yao", email: "konan.yao@mmkids.ci", phone: "+225 05 06 06 06 06", role: "magasinier", storeId: "entrepot-bouake", status: "actif", twoFactor: false, lastLogin: "2026-10-24T16:00:00Z" },
  { id: "e7", name: "Fatou Diabaté", email: "fatou.d@mmkids.ci", phone: "+225 07 07 07 07 07", role: "comptable", storeId: "all", status: "actif", twoFactor: true, lastLogin: "2026-10-25T10:12:00Z" },
  { id: "e8", name: "Christelle Gnagne", email: "christelle.g@mmkids.ci", phone: "+225 01 08 08 08 08", role: "marketing", storeId: "all", status: "actif", twoFactor: true, lastLogin: "2026-10-26T09:55:00Z" },
  { id: "e9", name: "Yannick Ehui", email: "yannick.e@mmkids.ci", phone: "+225 05 09 09 09 09", role: "vendeur", storeId: "cocody", status: "actif", twoFactor: false, lastLogin: "2026-10-26T08:40:00Z" },
  { id: "e10", name: "Grâce Aka", email: "grace.aka@mmkids.ci", phone: "+225 07 10 10 10 10", role: "vendeur", storeId: "yopougon", status: "actif", twoFactor: false, lastLogin: "2026-10-26T08:58:00Z" },
  { id: "e11", name: "Didier Zadi", email: "didier.z@mmkids.ci", phone: "+225 01 11 11 11 11", role: "vendeur", storeId: "marcory", status: "invite", twoFactor: false, lastLogin: "" },
  { id: "e12", name: "Hervé Assi", email: "herve.a@mmkids.ci", phone: "+225 05 12 12 12 12", role: "vendeur", storeId: "cocody", status: "suspendu", twoFactor: false, lastLogin: "2026-09-30T12:00:00Z" },
];
