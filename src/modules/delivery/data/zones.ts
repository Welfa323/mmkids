export type ZoneGroup = "abidjan" | "interieur" | "international";

export interface DeliveryZone {
  id: string;
  name: string;
  group: ZoneGroup;
  region?: string;
  fee: number;
  /** délai standard, en jours ouvrés */
  minDays: number;
  maxDays: number;
  expressAvailable: boolean;
}

export const ZONES: DeliveryZone[] = [
  // Abidjan — communes
  { id: "cocody", name: "Cocody", group: "abidjan", fee: 1500, minDays: 0, maxDays: 1, expressAvailable: true },
  { id: "plateau", name: "Plateau", group: "abidjan", fee: 1500, minDays: 0, maxDays: 1, expressAvailable: true },
  { id: "marcory", name: "Marcory", group: "abidjan", fee: 1500, minDays: 0, maxDays: 1, expressAvailable: true },
  { id: "treichville", name: "Treichville", group: "abidjan", fee: 1500, minDays: 0, maxDays: 1, expressAvailable: true },
  { id: "adjame", name: "Adjamé", group: "abidjan", fee: 1500, minDays: 0, maxDays: 1, expressAvailable: true },
  { id: "koumassi", name: "Koumassi", group: "abidjan", fee: 1500, minDays: 1, maxDays: 1, expressAvailable: true },
  { id: "yopougon", name: "Yopougon", group: "abidjan", fee: 2000, minDays: 1, maxDays: 2, expressAvailable: true },
  { id: "abobo", name: "Abobo", group: "abidjan", fee: 2000, minDays: 1, maxDays: 2, expressAvailable: true },
  { id: "port-bouet", name: "Port-Bouët", group: "abidjan", fee: 2000, minDays: 1, maxDays: 2, expressAvailable: true },
  { id: "attecoube", name: "Attécoubé", group: "abidjan", fee: 2000, minDays: 1, maxDays: 2, expressAvailable: true },
  { id: "bingerville", name: "Bingerville", group: "abidjan", fee: 2500, minDays: 1, maxDays: 2, expressAvailable: false },
  { id: "anyama", name: "Anyama", group: "abidjan", fee: 2500, minDays: 1, maxDays: 2, expressAvailable: false },
  { id: "songon", name: "Songon", group: "abidjan", fee: 3000, minDays: 1, maxDays: 3, expressAvailable: false },
  // Intérieur — villes / régions
  { id: "grand-bassam", name: "Grand-Bassam", group: "interieur", region: "Sud-Comoé", fee: 2500, minDays: 1, maxDays: 2, expressAvailable: false },
  { id: "yamoussoukro", name: "Yamoussoukro", group: "interieur", region: "Lacs", fee: 3500, minDays: 2, maxDays: 3, expressAvailable: false },
  { id: "bouake", name: "Bouaké", group: "interieur", region: "Gbêkê", fee: 3500, minDays: 2, maxDays: 3, expressAvailable: false },
  { id: "san-pedro", name: "San-Pédro", group: "interieur", region: "San-Pédro", fee: 4000, minDays: 2, maxDays: 4, expressAvailable: false },
  { id: "daloa", name: "Daloa", group: "interieur", region: "Haut-Sassandra", fee: 4000, minDays: 2, maxDays: 4, expressAvailable: false },
  { id: "gagnoa", name: "Gagnoa", group: "interieur", region: "Gôh", fee: 4000, minDays: 2, maxDays: 4, expressAvailable: false },
  { id: "abengourou", name: "Abengourou", group: "interieur", region: "Indénié-Djuablin", fee: 4000, minDays: 3, maxDays: 4, expressAvailable: false },
  { id: "korhogo", name: "Korhogo", group: "interieur", region: "Poro", fee: 4500, minDays: 3, maxDays: 5, expressAvailable: false },
  { id: "man", name: "Man", group: "interieur", region: "Tonkpi", fee: 4500, minDays: 3, maxDays: 5, expressAvailable: false },
  // International
  { id: "cedeao", name: "Afrique de l'Ouest (CEDEAO)", group: "international", fee: 15000, minDays: 5, maxDays: 10, expressAvailable: false },
  { id: "europe", name: "Europe", group: "international", fee: 35000, minDays: 7, maxDays: 14, expressAvailable: false },
];

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export const ZONE_GROUP_LABEL: Record<ZoneGroup, string> = {
  abidjan: "Abidjan",
  interieur: "Intérieur du pays",
  international: "International",
};

export type DeliveryMode = "standard" | "express" | "retrait" | "relais" | "programmee";

export interface DeliveryModeInfo {
  id: DeliveryMode;
  label: string;
  description: string;
  surcharge: number;
}

export const DELIVERY_MODES: DeliveryModeInfo[] = [
  { id: "standard", label: "Livraison standard", description: "À domicile ou au bureau", surcharge: 0 },
  { id: "express", label: "Express en 3 h", description: "Abidjan uniquement, commande avant 16 h", surcharge: 2000 },
  { id: "programmee", label: "Livraison programmée", description: "Choisissez votre jour et votre créneau", surcharge: 1000 },
  { id: "relais", label: "Point relais", description: "Retrait chez un partenaire près de chez vous", surcharge: 0 },
  { id: "retrait", label: "Retrait en boutique", description: "Gratuit, prêt en 2 h", surcharge: 0 },
];

export const PICKUP_STORES = [
  { id: "bq-cocody", name: "Boutique Cocody", address: "Riviera 2, carrefour Anono", hours: "Lun–Sam · 8h30–20h" },
  { id: "bq-marcory", name: "Boutique Marcory", address: "Zone 4, rue du Docteur Blanchard", hours: "Lun–Sam · 9h–20h" },
  { id: "bq-yopougon", name: "Boutique Yopougon", address: "Siporex, face pharmacie", hours: "Lun–Dim · 8h–21h" },
];

export const RELAY_POINTS = [
  { id: "rp-angre", name: "Relais Angré 8e tranche", address: "Station Total Angré", fee: 500 },
  { id: "rp-plateau", name: "Relais Plateau Cité administrative", address: "Librairie de France", fee: 500 },
  { id: "rp-abobo", name: "Relais Abobo Gare", address: "Supérette Akwaba", fee: 500 },
  { id: "rp-bouake", name: "Relais Bouaké Commerce", address: "Pharmacie du Marché", fee: 1000 },
];

export const TIME_SLOTS = ["8h – 10h", "10h – 12h", "12h – 14h", "14h – 16h", "16h – 18h", "18h – 20h"];

export const CARRIERS = ["MMKids Express (interne)", "Kolis CI", "Yobante Logistics", "DHL Express", "La Poste CI"];
