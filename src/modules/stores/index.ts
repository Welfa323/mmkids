/**
 * Module Multi-boutiques : entreprise -> boutiques / entrepôts.
 * Chaque point de vente a son stock, ses vendeurs, ses commandes et ses statistiques.
 */
export interface Store {
  id: string;
  name: string;
  kind: "boutique" | "entrepot";
  city: string;
  address: string;
  manager: string;
  phone: string;
  staffCount: number;
  /** part du CA global (pour la répartition des statistiques fictives) */
  share: number;
  openedAt: string;
}

export const STORES: Store[] = [
  { id: "cocody", name: "Boutique Cocody", kind: "boutique", city: "Abidjan", address: "Riviera 2, carrefour Anono", manager: "Awa Touré", phone: "+225 27 22 41 10 10", staffCount: 9, share: 0.31, openedAt: "2024-03-01" },
  { id: "marcory", name: "Boutique Marcory", kind: "boutique", city: "Abidjan", address: "Zone 4, rue du Dr Blanchard", manager: "Serge Bamba", phone: "+225 27 21 35 20 20", staffCount: 7, share: 0.22, openedAt: "2024-09-15" },
  { id: "yopougon", name: "Boutique Yopougon", kind: "boutique", city: "Abidjan", address: "Siporex, face pharmacie", manager: "Mariam Coulibaly", phone: "+225 27 23 45 30 30", staffCount: 8, share: 0.19, openedAt: "2025-02-10" },
  { id: "entrepot-abidjan", name: "Entrepôt central Abidjan", kind: "entrepot", city: "Abidjan", address: "Zone industrielle de Vridi", manager: "Ibrahim Ouattara", phone: "+225 27 21 27 40 40", staffCount: 14, share: 0.21, openedAt: "2024-01-20" },
  { id: "entrepot-bouake", name: "Entrepôt Bouaké", kind: "entrepot", city: "Bouaké", address: "Zone industrielle, route de Katiola", manager: "Konan Yao", phone: "+225 27 31 63 50 50", staffCount: 6, share: 0.07, openedAt: "2025-06-01" },
];

export const STORE_BY_ID = Object.fromEntries(STORES.map((s) => [s.id, s]));

export function storeName(id: string): string {
  return STORE_BY_ID[id]?.name ?? id;
}
