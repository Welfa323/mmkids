import { getAllProducts, type Product } from "@/modules/catalog";
import { CUSTOMERS } from "@/modules/crm";
import { CARRIERS, ZONES } from "@/modules/delivery";
import type { PaymentMethodId } from "@/modules/payment";
import { DEMO_NOW, DAY_MS } from "@/shared/lib/clock";
import { seeded } from "@/shared/lib/utils";
import { SITE } from "@/shared/lib/site";
import { ORDER_FLOW } from "../status";
import type { Order, OrderEvent, OrderItem, OrderStatus, SalesChannel } from "../types";

const PAYMENTS: PaymentMethodId[] = ["orange_money", "orange_money", "mtn_momo", "wave", "wave", "livraison", "livraison", "carte", "moov_money", "virement", "plusieurs_fois"];
const CHANNELS: SalesChannel[] = ["Site web", "Site web", "Application", "Application", "WhatsApp", "Boutique", "Facebook"];
const STORES = ["cocody", "marcory", "yopougon", "entrepot-abidjan", "entrepot-bouake"];
const ACTORS = ["Système", "Awa Touré", "Serge Bamba", "Mariam Coulibaly", "Ibrahim Ouattara"];

function buildHistory(status: OrderStatus, created: Date, r: ReturnType<typeof seeded>, method: PaymentMethodId): OrderEvent[] {
  const events: OrderEvent[] = [];
  let t = created.getTime();
  const push = (s: OrderStatus, note?: string) => {
    events.push({ status: s, at: new Date(t).toISOString(), by: s === "nouvelle" || s === "payee" ? "Système" : r.pick(ACTORS), note });
    t += r.int(20, 600) * 60_000;
  };
  const terminal: OrderStatus[] = ["annulee", "echec_paiement", "retour", "remboursee"];
  const target = terminal.includes(status)
    ? status === "annulee" || status === "echec_paiement"
      ? "paiement_en_attente"
      : "livree"
    : status;
  const skipPending = method !== "livraison" && method !== "virement";
  for (const s of ORDER_FLOW) {
    if (s === "paiement_en_attente" && skipPending && target !== "paiement_en_attente") continue;
    if (s === "payee" && method === "livraison" && ORDER_FLOW.indexOf(target) < ORDER_FLOW.indexOf("livree")) continue;
    push(s, s === "payee" ? "Paiement confirmé automatiquement" : s === "expediee" ? "Remis au transporteur" : undefined);
    if (s === target) break;
  }
  if (status === "annulee") push("annulee", r.pick(["Annulée par le client", "Rupture de stock fournisseur", "Client injoignable"]));
  if (status === "echec_paiement") push("echec_paiement", "Transaction refusée par l'opérateur");
  if (status === "retour") push("retour", r.pick(["Taille trop petite", "Pointure non adaptée", "Couleur différente de la photo"]));
  if (status === "remboursee") {
    push("retour", "Article défectueux");
    push("remboursee", "Remboursement Mobile Money effectué");
  }
  // Les dates ne doivent pas dépasser « maintenant »
  return events.map((e) => (new Date(e.at) > DEMO_NOW ? { ...e, at: DEMO_NOW.toISOString() } : e));
}

function statusForAge(days: number, r: ReturnType<typeof seeded>): OrderStatus {
  if (days === 0) return r.pick(["nouvelle", "nouvelle", "paiement_en_attente", "payee", "payee", "en_preparation", "prete", "expediee", "echec_paiement"]);
  if (days <= 2) return r.pick(["en_preparation", "prete", "expediee", "en_livraison", "en_livraison", "livree", "annulee"]);
  if (days <= 5) return r.pick(["en_livraison", "livree", "livree", "livree", "retour", "annulee"]);
  return r.pick(["livree", "livree", "livree", "livree", "livree", "livree", "livree", "annulee", "remboursee", "retour", "echec_paiement"]);
}

function pickItems(r: ReturnType<typeof seeded>, products: Product[], favorite?: string): OrderItem[] {
  const n = r.pick([1, 1, 2, 2, 3, 3, 4]);
  const pool = products.filter((p) => p.availability !== "coming_soon");
  const items: OrderItem[] = [];
  for (let i = 0; i < n; i++) {
    const p = favorite && i === 0 ? (pool.find((x) => x.subcategory.includes(favorite)) ?? r.pick(pool)) : r.pick(pool);
    if (items.some((it) => it.productId === p.id)) continue;
    const opt = p.options[0];
    items.push({
      productId: p.id,
      name: p.name,
      image: p.images[0],
      variant: opt ? opt.values[r.int(0, opt.values.length - 1)].label : undefined,
      qty: p.price < 8000 ? r.int(1, 3) : 1,
      unitPrice: p.price,
      unitCost: p.costPrice,
      category: p.category,
    });
  }
  return items;
}

function makeOrder(seq: number, created: Date, customerIdx: number, r: ReturnType<typeof seeded>, forced?: Partial<Order>): Order {
  const products = getAllProducts();
  const c = CUSTOMERS[customerIdx];
  const days = Math.floor((DEMO_NOW.getTime() - created.getTime()) / DAY_MS);
  const status = forced?.status ?? statusForAge(days, r);
  const zone = c.city === "Abidjan" ? (ZONES.find((z) => z.name === c.commune) ?? ZONES[0]) : (ZONES.find((z) => z.name === c.city) ?? ZONES[14]);
  const items = forced?.items ?? pickItems(r, products, customerIdx === 0 ? r.pick(["garcon", "baskets", "uniformes"]) : undefined);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const promo = r.chance(0.22) ? r.pick(["AKWABA5000", "BIENVENUE10", "CHAUSSURES20", "LIVRAISON0"]) : undefined;
  const discount = promo === "AKWABA5000" && subtotal >= 30000 ? 5000 : promo === "BIENVENUE10" ? Math.min(15000, Math.round(subtotal * 0.1)) : promo === "CHAUSSURES20" ? Math.round(subtotal * 0.08) : 0;
  const deliveryMode = r.pick(["standard", "standard", "standard", "express", "retrait", "relais", "programmee"] as const);
  const shippingFee = deliveryMode === "retrait" || promo === "LIVRAISON0" || (subtotal >= SITE.freeShippingThreshold && zone.group === "abidjan" && deliveryMode === "standard") ? 0 : zone.fee + (deliveryMode === "express" ? 2000 : deliveryMode === "programmee" ? 1000 : 0);
  const total = subtotal - discount + shippingFee;
  const paymentMethod = forced?.paymentMethod ?? r.pick(PAYMENTS);
  const paid = ["payee", "en_preparation", "prete", "expediee", "en_livraison", "livree", "retour", "remboursee"].includes(status) && !(paymentMethod === "livraison" && status !== "livree");
  const shipped = ["expediee", "en_livraison", "livree", "retour", "remboursee"].includes(status);
  const ymd = created.toISOString().slice(2, 10).replace(/-/g, "");
  return {
    id: `o${seq}`,
    number: `MK-${ymd}-${String(seq).padStart(4, "0")}`,
    customerId: c.id,
    customerName: c.name,
    phone: c.phone,
    email: c.email,
    items,
    subtotal,
    discount,
    promoCode: discount ? promo : promo === "LIVRAISON0" ? promo : undefined,
    shippingFee,
    total,
    paymentMethod,
    paymentRef: paid ? `${paymentMethod === "carte" ? "CB" : "MM"}-${(seq * 7919).toString(36).toUpperCase()}` : undefined,
    paidAmount: paid ? (paymentMethod === "plusieurs_fois" ? Math.ceil(total / 3) : total) : 0,
    deliveryMode,
    zoneId: zone.id,
    city: c.city === "Abidjan" ? `Abidjan · ${c.commune}` : c.city,
    address: customerIdx === 0 ? "Riviera Palmeraie, rue I 45, villa 12" : `${c.commune}, ${r.pick(["près du marché", "rue des jardins", "cité SIR", "face station Total", "derrière l'église", "carrefour pharmacie"])}`,
    carrier: shipped ? (deliveryMode === "retrait" ? undefined : r.pick(CARRIERS)) : undefined,
    trackingNumber: shipped && deliveryMode !== "retrait" ? `TRK${(seq * 104729).toString().slice(0, 9)}CI` : undefined,
    status,
    history: buildHistory(status, created, r, paymentMethod),
    internalComment: r.chance(0.15) ? r.pick(["Cadeau d'anniversaire — emballage cadeau", "Appeler avant livraison", "Adresse difficile, demander point de repère", "Vérifier la pointure avant envoi", "Retouche ourlet demandée"]) : undefined,
    channel: r.pick(CHANNELS),
    storeId: zone.id === "bouake" ? "entrepot-bouake" : r.pick(STORES.slice(0, 4)),
    createdAt: created.toISOString(),
    ...forced,
  };
}

function generate(): Order[] {
  const r = seeded(2026);
  const orders: Order[] = [];
  let seq = 4300;
  // ~ 8 commandes / jour sur 60 jours (échantillon affiché dans le back-office)
  for (let d = 60; d >= 0; d--) {
    const perDay = d === 0 ? 16 : r.int(4, 11);
    for (let k = 0; k < perDay; k++) {
      const created = new Date(DEMO_NOW.getTime() - d * DAY_MS);
      created.setUTCHours(d === 0 ? r.int(7, 14) : r.int(7, 22), r.int(0, 59), 0, 0);
      const customerIdx = r.chance(0.05) ? 0 : r.int(1, CUSTOMERS.length - 1);
      orders.push(makeOrder(seq++, created, customerIdx, r));
    }
  }
  return orders;
}

const GENERATED = generate();

/** Les 17 commandes de Jean Kouassi (compte de démonstration, papa de Kevin 8 ans et Emma 3 ans) */
function jeanOrders(): Order[] {
  const r = seeded(17);
  const products = getAllProducts();
  const find = (slug: string) => products.find((p) => p.slug === slug)!;
  const item = (slug: string, qty = 1, variant?: string): OrderItem => {
    const p = find(slug);
    return { productId: p.id, name: p.name, image: p.images[0], qty, unitPrice: p.price, unitCost: p.costPrice, category: p.category, variant };
  };
  const plan: { days: number; status: OrderStatus; items: OrderItem[]; pay: PaymentMethodId }[] = [
    { days: 0, status: "en_livraison", items: [item("baskets-lumineuses-led", 1, "32 · Noir"), item("t-shirt-garcon-dinosaure", 2, "8 ans · Gris")], pay: "wave" },
    { days: 3, status: "expediee", items: [item("robe-d-ete-fleurie", 1, "3 ans · Jaune"), item("serre-tete-a-noeud", 1, "Rose")], pay: "orange_money" },
    { days: 14, status: "livree", items: [item("costume-garcon-3-pieces", 1, "8 ans · Bleu marine"), item("robe-de-ceremonie-satin-et-tulle", 1, "3 ans · Blanc")], pay: "carte" },
    { days: 34, status: "livree", items: [item("pyjama-long-garcon-dinosaures", 1, "8 ans · Bleu marine"), item("pyjama-court-fille-licorne", 1, "3 ans · Rose")], pay: "mtn_momo" },
    { days: 45, status: "remboursee", items: [item("baskets-a-scratch-enfant", 1, "30 · Bleu marine")], pay: "wave" },
    { days: 57, status: "livree", items: [item("pack-uniforme-chemise-et-short", 3, "8 ans · Kaki"), item("sac-a-dos-maternelle", 1, "Rose")], pay: "livraison" },
    { days: 71, status: "annulee", items: [item("cartable-primaire-a-roulettes", 1, "Bleu marine")], pay: "orange_money" },
    { days: 88, status: "livree", items: [item("chemise-d-uniforme-kaki", 2, "8 ans"), item("short-d-uniforme-garcon", 2, "8 ans · Kaki")], pay: "carte" },
    { days: 102, status: "livree", items: [item("maillot-de-bain-fille-une-piece", 1, "3 ans · Corail"), item("short-de-bain-garcon", 1, "8 ans · Bleu ciel"), item("bob-de-plage-anti-uv", 2, "4-7 ans · Jaune")], pay: "livraison" },
    { days: 120, status: "livree", items: [item("ensemble-wax-garcon", 1, "8 ans · Orange")], pay: "wave" },
    { days: 141, status: "livree", items: [item("lot-de-3-t-shirts-basiques", 1, "8 ans")], pay: "orange_money" },
    { days: 160, status: "livree", items: [item("salopette-fille-en-velours", 1, "3 ans · Rose")], pay: "carte" },
    { days: 188, status: "livree", items: [item("maillot-de-foot-enfant-orange-et-vert", 1, "8 ans")], pay: "mtn_momo" },
    { days: 214, status: "livree", items: [item("sandales-garcon-sport", 1, "31 · Bleu marine"), item("sandales-fille-a-fleurs", 1, "26 · Rose")], pay: "wave" },
    { days: 240, status: "livree", items: [item("survetement-enfant-2-pieces", 1, "8 ans · Rouge"), item("lot-de-7-paires-de-chaussettes", 1, "31-34")], pay: "plusieurs_fois" },
    { days: 290, status: "livree", items: [item("robe-bebe-a-volants", 1, "24 mois · Rose")], pay: "carte" },
    { days: 330, status: "livree", items: [item("chaussures-premiers-pas-cuir-souple", 1, "21 · Blanc")], pay: "orange_money" },
  ];
  return plan.map((p, i) => {
    const created = new Date(DEMO_NOW.getTime() - p.days * DAY_MS);
    created.setUTCHours(9 + (i % 10), 15 + i, 0, 0);
    return makeOrder(8017 - i, created, 0, r, {
      status: p.status,
      items: p.items,
      paymentMethod: p.pay,
      ...(p.days === 0 ? { deliveryMode: "standard", carrier: "MMKids Express (interne)", trackingNumber: "TRK478100217CI", zoneId: "cocody", city: "Abidjan · Cocody" } : {}),
    });
  });
}

export const JEAN_ORDERS = jeanOrders();

export const ORDERS: Order[] = [...GENERATED.filter((o) => o.customerId !== "c001"), ...JEAN_ORDERS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
