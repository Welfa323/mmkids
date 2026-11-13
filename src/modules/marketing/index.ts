/**
 * Module Marketing : segmentation, campagnes multicanales et paniers abandonnés (relance).
 */
import { getAllProducts } from "@/modules/catalog";
import { CUSTOMERS } from "@/modules/crm";
import { DEMO_NOW } from "@/shared/lib/clock";
import { seeded } from "@/shared/lib/utils";

export type Channel = "email" | "sms" | "whatsapp" | "push";

export const CHANNEL_LABEL: Record<Channel, string> = { email: "Email", sms: "SMS", whatsapp: "WhatsApp", push: "Notification push" };

export interface Segment {
  id: string;
  name: string;
  rule: string;
  count: number;
  auto?: boolean;
}

const daysSince = (iso: string) => (DEMO_NOW.getTime() - new Date(iso).getTime()) / 86_400_000;

export const SEGMENTS: Segment[] = [
  { id: "big", name: "Gros acheteurs", rule: "Montant total dépensé > 200 000 FCFA", count: CUSTOMERS.filter((c) => c.totalSpent > 200_000).length * 37 },
  { id: "dormant", name: "Clients endormis", rule: "Aucun achat depuis 60 jours", count: CUSTOMERS.filter((c) => daysSince(c.lastOrderAt) > 60).length * 41 },
  { id: "baby", name: "Jeunes parents", rule: "A acheté au moins 1 article « Bébé (0-24 mois) »", count: 1_284 },
  { id: "new", name: "Nouveaux clients", rule: "Inscrits depuis moins de 30 jours", count: 612 },
  { id: "vip", name: "VIP (niveau Or & Platine)", rule: "Niveau fidélité ≥ Or", count: 348, auto: true },
  { id: "risk", name: "À risque de départ", rule: "Score de churn IA > 70 %", count: 506, auto: true },
  { id: "cart", name: "Panier abandonné (7 j)", rule: "Panier > 10 000 FCFA non converti", count: 231, auto: true },
  { id: "bday", name: "Anniversaire d'un enfant ce mois-ci", rule: "Date de naissance d'un enfant en novembre", count: 418 },
  { id: "school", name: "Parents d'écoliers", rule: "A acheté un uniforme ou un sac scolaire", count: 2_046 },
];

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  segment: string;
  status: "envoyee" | "planifiee" | "brouillon" | "en_cours";
  sentAt: string;
  sent: number;
  opened: number;
  clicked: number;
  orders: number;
  revenue: number;
  cost: number;
}

export const CAMPAIGNS: Campaign[] = [
  { id: "cp1", name: "Ventes flash du week-end", channel: "whatsapp", segment: "Tous les clients opt-in", status: "envoyee", sentAt: "2026-10-24T09:00:00Z", sent: 8_420, opened: 7_190, clicked: 2_310, orders: 412, revenue: 9_300_000, cost: 168_400 },
  { id: "cp2", name: "−20 % chaussures enfant", channel: "email", segment: "Parents d'écoliers", status: "envoyee", sentAt: "2026-10-20T08:00:00Z", sent: 2_046, opened: 880, clicked: 301, orders: 118, revenue: 1_890_000, cost: 10_200 },
  { id: "cp3", name: "On vous a manqué ? −5 000 FCFA", channel: "sms", segment: "Clients endormis", status: "envoyee", sentAt: "2026-10-15T10:00:00Z", sent: 1_640, opened: 1_640, clicked: 298, orders: 61, revenue: 1_420_000, cost: 41_000 },
  { id: "cp4", name: "Nouvelle collection cérémonie", channel: "push", segment: "Application installée", status: "en_cours", sentAt: "2026-10-26T07:00:00Z", sent: 5_210, opened: 1_380, clicked: 402, orders: 38, revenue: 860_000, cost: 0 },
  { id: "cp5", name: "Black Friday — avant-première VIP", channel: "whatsapp", segment: "VIP (niveau Or & Platine)", status: "planifiee", sentAt: "2026-11-26T18:00:00Z", sent: 0, opened: 0, clicked: 0, orders: 0, revenue: 0, cost: 0 },
  { id: "cp6", name: "Joyeux anniversaire 🎂", channel: "email", segment: "Anniversaire d'un enfant ce mois-ci", status: "planifiee", sentAt: "2026-11-01T07:00:00Z", sent: 0, opened: 0, clicked: 0, orders: 0, revenue: 0, cost: 0 },
  { id: "cp7", name: "Rentrée scolaire — uniformes −10 %", channel: "sms", segment: "Parents d'écoliers", status: "envoyee", sentAt: "2026-08-28T08:00:00Z", sent: 9_800, opened: 9_800, clicked: 1_120, orders: 520, revenue: 12_600_000, cost: 245_000 },
];

/* --------------------------------------------------------- paniers abandonnés */

export interface AbandonedCart {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  items: { productId: string; name: string; image: string; qty: number; price: number }[];
  total: number;
  abandonedAt: string;
  step: "panier" | "livraison" | "paiement";
  status: "a_relancer" | "relance" | "recupere" | "perdu";
  reminders: { channel: Channel; at: string }[];
  recoveredAmount?: number;
}

export const ABANDONED_CARTS: AbandonedCart[] = (() => {
  const r = seeded(888);
  const products = getAllProducts().filter((p) => p.availability !== "coming_soon");
  const steps = ["panier", "livraison", "paiement"] as const;
  const list: AbandonedCart[] = [];
  // Exemple de démonstration : Jean, 3 articles pour ses enfants
  const jeanItems = [
    { slug: "baskets-lumineuses-led", qty: 1 },
    { slug: "robe-d-ete-fleurie", qty: 1 },
    { slug: "sweat-a-capuche-enfant", qty: 2 },
  ].map(({ slug, qty }) => {
    const p = products.find((x) => x.slug === slug)!;
    return { productId: p.id, name: p.name, image: p.images[0], qty, price: p.price };
  });
  list.push({
    id: "ab0",
    customerName: "Jean Kouassi",
    phone: "+225 07 07 12 34 56",
    email: "jean.kouassi@exemple.ci",
    items: jeanItems,
    total: jeanItems.reduce((s, it) => s + it.price * it.qty, 0),
    abandonedAt: new Date(DEMO_NOW.getTime() - 2.5 * 3_600_000).toISOString(),
    step: "paiement",
    status: "a_relancer",
    reminders: [],
  });
  for (let i = 1; i < 16; i++) {
    const c = CUSTOMERS[r.int(1, CUSTOMERS.length - 1)];
    const n = r.int(1, 4);
    const items = Array.from({ length: n }, () => {
      const p = r.pick(products);
      return { productId: p.id, name: p.name, image: p.images[0], qty: p.price < 8000 ? r.int(1, 3) : 1, price: p.price };
    });
    const hours = r.int(1, 24 * 6);
    const status: AbandonedCart["status"] = hours < 3 ? "a_relancer" : r.pick(["relance", "relance", "recupere", "perdu", "a_relancer"]);
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    const at = new Date(DEMO_NOW.getTime() - hours * 3_600_000);
    list.push({
      id: `ab${i}`,
      customerName: c.name,
      phone: c.phone,
      email: c.email,
      items,
      total,
      abandonedAt: at.toISOString(),
      step: r.pick(steps),
      status,
      reminders:
        status === "a_relancer"
          ? []
          : [
              { channel: "whatsapp" as Channel, at: new Date(at.getTime() + 3_600_000).toISOString() },
              ...(hours > 24 ? [{ channel: "email" as Channel, at: new Date(at.getTime() + 86_400_000).toISOString() }] : []),
            ],
      recoveredAmount: status === "recupere" ? total : undefined,
    });
  }
  return list.sort((a, b) => b.abandonedAt.localeCompare(a.abandonedAt));
})();

export const RECOVERY_RULES = [
  { delay: "1 heure", channel: "whatsapp" as Channel, message: "Bonjour {prénom} 👋 Vous avez oublié {n} article(s) dans votre panier ({total}). Finalisez ici : {lien}", enabled: true },
  { delay: "24 heures", channel: "email" as Channel, message: "Votre panier vous attend — profitez de −5 % avec le code RETOUR5", enabled: true },
  { delay: "72 heures", channel: "sms" as Channel, message: "Dernière chance : vos articles sont presque épuisés. {lien}", enabled: false },
];
