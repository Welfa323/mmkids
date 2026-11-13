import { seeded } from "@/shared/lib/utils";
import { daysAgo } from "@/shared/lib/clock";

export type CustomerSegment = "vip" | "fidele" | "a_risque" | "inactif" | "nouveau" | "occasionnel";

export interface CrmCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  commune: string;
  gender: "F" | "M";
  ordersCount: number;
  totalSpent: number;
  avgBasket: number;
  lastOrderAt: string;
  createdAt: string;
  points: number;
  favoriteCategories: string[];
  segment: CustomerSegment;
  /** valeur vie client estimée (CLV) */
  lifetimeValue: number;
  churnRisk: number;
  channel: "Site web" | "Application" | "WhatsApp" | "Boutique";
  tags: string[];
}

export const SEGMENT_META: Record<CustomerSegment, { label: string; tone: string; description: string }> = {
  vip: { label: "VIP", tone: "bg-gold-100 text-gold-600", description: "Plus de 400 000 FCFA dépensés" },
  fidele: { label: "Fidèle", tone: "bg-brand-100 text-brand-800", description: "Achats réguliers, au moins 5 commandes" },
  a_risque: { label: "À risque", tone: "bg-accent-100 text-accent-700", description: "Bon client sans achat depuis 30 à 60 jours" },
  inactif: { label: "Inactif", tone: "bg-ink-100 text-ink-600", description: "Aucun achat depuis plus de 60 jours" },
  nouveau: { label: "Nouveau", tone: "bg-sky-100 text-sky-700", description: "Inscrit depuis moins de 30 jours" },
  occasionnel: { label: "Occasionnel", tone: "bg-violet-100 text-violet-700", description: "1 à 4 commandes" },
};

const NAMES: [string, "F" | "M"][] = [
  ["Jean Kouassi", "M"], ["Aya Koné", "F"], ["Mamadou Traoré", "M"], ["Fatou Diabaté", "F"], ["Konan Yao", "M"], ["Adjoua N'Guessan", "F"],
  ["Ibrahim Ouattara", "M"], ["Mariam Coulibaly", "F"], ["Serge Bamba", "M"], ["Awa Touré", "F"], ["Kouadio Kouamé", "M"], ["Christelle Gnagne", "F"],
  ["Moussa Diarra", "M"], ["Aminata Cissé", "F"], ["Yannick Ehui", "M"], ["Grâce Aka", "F"], ["Abdoul Diallo", "M"], ["Estelle Kacou", "F"],
  ["Didier Zadi", "M"], ["Salimata Koné", "F"], ["Hervé Assi", "M"], ["Nadège Brou", "F"], ["Karim Fofana", "M"], ["Rachelle Yapi", "F"],
  ["Olivier Tanoh", "M"], ["Marina Dosso", "F"], ["Lassina Sanogo", "M"], ["Prisca Amani", "F"], ["Arnaud Koffi", "M"], ["Bintou Camara", "F"],
  ["Eric N'Dri", "M"], ["Sandrine Lago", "F"], ["Ismaël Bakayoko", "M"], ["Laetitia Kra", "F"], ["Rodrigue Allou", "M"], ["Mireille Achi", "F"],
  ["Souleymane Kanté", "M"], ["Inès Djédjé", "F"], ["Cédric Gooré", "M"], ["Paule Séka", "F"], ["Wilfried Boni", "M"], ["Josiane Ahoua", "F"],
];

const PLACES: [string, string][] = [
  ["Abidjan", "Cocody"], ["Abidjan", "Yopougon"], ["Abidjan", "Marcory"], ["Abidjan", "Plateau"], ["Abidjan", "Abobo"], ["Abidjan", "Koumassi"],
  ["Abidjan", "Treichville"], ["Abidjan", "Port-Bouët"], ["Bouaké", "Commerce"], ["Yamoussoukro", "Habitat"], ["San-Pédro", "Bardot"], ["Korhogo", "Soba"],
  ["Daloa", "Lobia"], ["Grand-Bassam", "France"],
];

const CATS = ["Bébé", "Fille", "Garçon", "Chaussures", "Cérémonie", "Pyjamas", "Uniformes", "Sport & plage", "Accessoires", "Wax"];
const CHANNELS = ["Site web", "Application", "WhatsApp", "Boutique"] as const;

function segmentFor(c: { totalSpent: number; ordersCount: number; lastDays: number; createdDays: number }): CustomerSegment {
  if (c.createdDays <= 30) return "nouveau";
  if (c.lastDays > 60) return "inactif";
  if (c.totalSpent >= 400_000 && c.lastDays <= 30) return "vip";
  if (c.lastDays > 30 && c.totalSpent >= 100_000) return "a_risque";
  if (c.ordersCount >= 5) return "fidele";
  return "occasionnel";
}

export const CUSTOMERS: CrmCustomer[] = NAMES.map(([name, gender], i) => {
  const r = seeded(i * 131 + 7);
  const isJean = i === 0;
  const ordersCount = isJean ? 17 : r.chance(0.2) ? r.int(8, 26) : r.int(1, 7);
  const avg = isJean ? 28_588 : r.int(12, 48) * 1000;
  const totalSpent = isJean ? 486_000 : ordersCount * avg;
  const lastDays = isJean ? 14 : r.chance(0.25) ? r.int(61, 200) : r.chance(0.25) ? r.int(31, 60) : r.int(0, 29);
  const createdDays = isJean ? 962 : r.chance(0.12) ? r.int(2, 28) : r.int(60, 900);
  const [city, commune] = isJean ? PLACES[0] : r.pick(PLACES);
  const first = name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const last = name.split(" ").slice(1).join("").toLowerCase().normalize("NFD").replace(/[̀-ͯ']/g, "");
  const segment = isJean ? "vip" : segmentFor({ totalSpent, ordersCount, lastDays, createdDays: Math.min(createdDays, ordersCount <= 2 ? createdDays : 999) });
  return {
    id: `c${String(i + 1).padStart(3, "0")}`,
    name,
    gender,
    email: `${first}.${last}@exemple.ci`,
    phone: `+225 0${r.pick([1, 5, 7])} ${r.int(10, 99)} ${r.int(10, 99)} ${r.int(10, 99)} ${r.int(10, 99)}`,
    city,
    commune,
    ordersCount,
    totalSpent,
    avgBasket: Math.round(totalSpent / ordersCount),
    lastOrderAt: daysAgo(lastDays, r.int(8, 21)).toISOString(),
    createdAt: daysAgo(createdDays).toISOString(),
    points: isJean ? 1250 : Math.floor(totalSpent / 1000) % 3000,
    favoriteCategories: isJean ? ["Garçon", "Chaussures", "Uniformes"] : r.shuffle(CATS).slice(0, 3),
    segment,
    lifetimeValue: Math.round(totalSpent * (1.6 + r.next())),
    churnRisk: Math.min(97, Math.round(lastDays * 0.9 + r.int(0, 15))),
    channel: r.pick(CHANNELS),
    tags: [...(gender === "F" ? ["maman"] : ["papa"]), ...(r.chance(0.4) ? ["fratrie"] : []), ...(r.chance(0.3) ? ["newsletter"] : []), ...(r.chance(0.2) ? ["parrain"] : [])],
  };
});

export const CUSTOMER_BY_ID = Object.fromEntries(CUSTOMERS.map((c) => [c.id, c]));
