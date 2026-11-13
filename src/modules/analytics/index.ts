/**
 * Module Analytics : séries quotidiennes fictives (365 j), KPI par période et par boutique,
 * ventilations (catégorie, produit, ville, canal) et analyse de rentabilité.
 */
import { CATEGORIES, getAllProducts, type Product } from "@/modules/catalog";
import { STORES } from "@/modules/stores";
import { DEMO_NOW, DAY_MS, isoDay } from "@/shared/lib/clock";
import { seeded } from "@/shared/lib/utils";
import { formatDayMonth, monthLabel } from "@/shared/lib/format";

export interface DayStat {
  date: string;
  revenue: number;
  orders: number;
  units: number;
  newCustomers: number;
  cost: number;
}

const DAYS = 400;

function buildSeries(): DayStat[] {
  const r = seeded(77);
  const out: DayStat[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(DEMO_NOW.getTime() - i * DAY_MS);
    const growth = 1 + ((DAYS - i) / DAYS) * 0.55;
    const weekday = [0.82, 0.9, 0.95, 0.97, 1.05, 1.22, 1.12][d.getUTCDay()];
    const month = d.getUTCMonth();
    const season = month === 11 ? 1.45 : month === 10 ? 1.15 : month === 7 || month === 8 ? 1.35 : month === 5 || month === 6 ? 1.1 : 1;
    const revenue = Math.round((620_000 * growth * weekday * season * (0.85 + r.next() * 0.3)) / 100) * 100;
    const basket = 19_000 + r.int(0, 8_000);
    const orders = Math.max(8, Math.round(revenue / basket));
    out.push({
      date: isoDay(d),
      revenue,
      orders,
      units: Math.round(orders * (2.6 + r.next() * 0.9)),
      newCustomers: Math.round(orders * (0.5 + r.next() * 0.25)),
      cost: Math.round(revenue * (0.58 + r.next() * 0.06)),
    });
  }
  // Aujourd'hui (journée en cours) — valeurs du cahier des charges
  out[out.length - 1] = { date: isoDay(DEMO_NOW), revenue: 985_000, orders: 41, units: 118, newCustomers: 27, cost: 590_000 };
  return out;
}

export const DAILY = buildSeries();

export type PeriodKey = "aujourdhui" | "hier" | "semaine" | "mois" | "annee" | "perso";

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "aujourdhui", label: "Aujourd'hui" },
  { key: "hier", label: "Hier" },
  { key: "semaine", label: "Cette semaine" },
  { key: "mois", label: "Ce mois" },
  { key: "annee", label: "Cette année" },
  { key: "perso", label: "Personnalisée" },
];

export interface PeriodRange {
  from: string;
  to: string;
}

export function rangeFor(key: PeriodKey, custom?: PeriodRange): PeriodRange {
  const today = isoDay(DEMO_NOW);
  const shift = (n: number) => isoDay(new Date(DEMO_NOW.getTime() - n * DAY_MS));
  switch (key) {
    case "aujourdhui":
      return { from: today, to: today };
    case "hier":
      return { from: shift(1), to: shift(1) };
    case "semaine": {
      const dow = (DEMO_NOW.getUTCDay() + 6) % 7; // lundi = 0
      return { from: shift(dow), to: today };
    }
    case "mois":
      return { from: `${today.slice(0, 7)}-01`, to: today };
    case "annee":
      return { from: `${today.slice(0, 4)}-01-01`, to: today };
    case "perso":
      return custom ?? { from: shift(29), to: today };
  }
}

function previousRange(r: PeriodRange): PeriodRange {
  const len = (new Date(r.to).getTime() - new Date(r.from).getTime()) / DAY_MS + 1;
  const to = new Date(new Date(r.from).getTime() - DAY_MS);
  const from = new Date(to.getTime() - (len - 1) * DAY_MS);
  return { from: isoDay(from), to: isoDay(to) };
}

/** Facteur boutique : chaque point de vente porte une part du CA global */
export function storeFactor(storeId: string): number {
  if (storeId === "all") return 1;
  return STORES.find((s) => s.id === storeId)?.share ?? 1;
}

export function sliceDays(r: PeriodRange, storeId = "all"): DayStat[] {
  const f = storeFactor(storeId);
  return DAILY.filter((d) => d.date >= r.from && d.date <= r.to).map((d) =>
    f === 1 ? d : { ...d, revenue: Math.round(d.revenue * f), orders: Math.max(1, Math.round(d.orders * f)), units: Math.round(d.units * f), newCustomers: Math.round(d.newCustomers * f), cost: Math.round(d.cost * f) },
  );
}

export interface Kpis {
  revenue: number;
  orders: number;
  avgBasket: number;
  units: number;
  newCustomers: number;
  profit: number;
  pendingOrders: number;
  deliveredOrders: number;
  returns: number;
  payments: number;
}

function aggregate(days: DayStat[]): Kpis {
  const revenue = days.reduce((s, d) => s + d.revenue, 0);
  const orders = days.reduce((s, d) => s + d.orders, 0);
  const cost = days.reduce((s, d) => s + d.cost, 0);
  return {
    revenue,
    orders,
    avgBasket: orders ? Math.round(revenue / orders) : 0,
    units: days.reduce((s, d) => s + d.units, 0),
    newCustomers: days.reduce((s, d) => s + d.newCustomers, 0),
    profit: revenue - cost,
    pendingOrders: Math.round(orders * (days.length <= 1 ? 0.42 : 0.08)),
    deliveredOrders: Math.round(orders * (days.length <= 1 ? 0.31 : 0.84)),
    returns: Math.max(0, Math.round(orders * 0.025)),
    payments: Math.round(revenue * 0.93),
  };
}

export function getKpis(key: PeriodKey, storeId = "all", custom?: PeriodRange) {
  const range = rangeFor(key, custom);
  const days = sliceDays(range, storeId);
  const prevDays = sliceDays(previousRange(range), storeId);
  const current = aggregate(days);
  const previous = aggregate(prevDays);
  const delta = (k: keyof Kpis) => (previous[k] ? ((current[k] - previous[k]) / previous[k]) * 100 : 0);
  return { range, days, current, previous, delta };
}

/** Série pour un graphique : jours (≤ 62 j) ou mois (au-delà) */
export function chartSeries(days: DayStat[], prev?: DayStat[]) {
  if (days.length <= 62) {
    return days.map((d, i) => ({ label: formatDayMonth(d.date), date: d.date, revenue: d.revenue, orders: d.orders, profit: d.revenue - d.cost, previous: prev?.[i]?.revenue }));
  }
  const byMonth = new Map<string, { revenue: number; orders: number; profit: number }>();
  days.forEach((d) => {
    const k = d.date.slice(0, 7);
    const m = byMonth.get(k) ?? { revenue: 0, orders: 0, profit: 0 };
    m.revenue += d.revenue;
    m.orders += d.orders;
    m.profit += d.revenue - d.cost;
    byMonth.set(k, m);
  });
  return [...byMonth.entries()].map(([k, v]) => ({ label: `${monthLabel(Number(k.slice(5)) - 1)} ${k.slice(2, 4)}`, date: k, ...v, previous: undefined as number | undefined }));
}

export function monthlySeries(storeId = "all") {
  const days = sliceDays({ from: isoDay(new Date(DEMO_NOW.getTime() - 364 * DAY_MS)), to: isoDay(DEMO_NOW) }, storeId);
  return chartSeries(days);
}

/** Intraday : répartition horaire de la journée */
export function hourlySeries(total: number) {
  const w = [0, 0, 0, 0, 0, 0, 0.5, 1.5, 3, 5, 6.5, 7, 7.5, 7, 6, 5.5, 5.5, 6, 7, 8, 7.5, 6, 4, 2];
  const nowH = DEMO_NOW.getUTCHours();
  const sumW = w.slice(0, nowH + 1).reduce((a, b) => a + b, 0);
  return w.slice(0, nowH + 1).map((x, h) => ({ label: `${h}h`, revenue: Math.round((total * x) / sumW) }));
}

/* --------------------------------------------------------- ventilations */

const PRODUCT_WEIGHT = (p: Product) => p.price * p.soldCount;

export function salesByCategory(revenue: number) {
  const products = getAllProducts();
  const total = products.reduce((s, p) => s + PRODUCT_WEIGHT(p), 0);
  return CATEGORIES.map((c) => {
    const w = products.filter((p) => p.category === c.slug).reduce((s, p) => s + PRODUCT_WEIGHT(p), 0) / total;
    return { slug: c.slug, label: c.shortName, value: Math.round(revenue * w) };
  }).sort((a, b) => b.value - a.value);
}

export const CITY_SHARES = [
  { label: "Cocody", share: 0.24 },
  { label: "Yopougon", share: 0.15 },
  { label: "Marcory", share: 0.11 },
  { label: "Plateau", share: 0.09 },
  { label: "Abobo", share: 0.08 },
  { label: "Koumassi", share: 0.06 },
  { label: "Bouaké", share: 0.07 },
  { label: "Yamoussoukro", share: 0.05 },
  { label: "San-Pédro", share: 0.04 },
  { label: "Autres villes", share: 0.11 },
];

export const CHANNEL_SHARES = [
  { label: "Site web", share: 0.38 },
  { label: "Application (PWA)", share: 0.24 },
  { label: "WhatsApp", share: 0.17 },
  { label: "Boutiques physiques", share: 0.15 },
  { label: "Facebook / Instagram", share: 0.06 },
];

export const PAYMENT_SHARES = [
  { label: "Orange Money", share: 0.29 },
  { label: "Wave", share: 0.22 },
  { label: "Paiement à la livraison", share: 0.19 },
  { label: "MTN MoMo", share: 0.13 },
  { label: "Carte bancaire", share: 0.1 },
  { label: "Moov Money", share: 0.04 },
  { label: "Virement / 3× / acompte", share: 0.03 },
];

export function split(revenue: number, shares: { label: string; share: number }[]) {
  return shares.map((s) => ({ label: s.label, value: Math.round(revenue * s.share) }));
}

/* --------------------------------------------------------- rentabilité */

export const PAYMENT_COMMISSION = 0.022;

export interface ProductProfit {
  product: Product;
  units: number;
  revenue: number;
  purchaseCost: number;
  commission: number;
  delivery: number;
  discount: number;
  otherFees: number;
  margin: number;
  marginPct: number;
}

/** Marge = prix de vente − coût d'achat − commission paiement − coût livraison − remise − autres frais */
export function productProfitability(periodDays = 30, storeId = "all"): ProductProfit[] {
  const f = storeFactor(storeId) * (periodDays / 365);
  return getAllProducts()
    .filter((p) => p.availability !== "coming_soon")
    .map((p) => {
      const units = Math.max(1, Math.round(p.soldCount * f * 1.6));
      const revenue = units * p.price;
      const purchaseCost = units * p.costPrice;
      const commission = Math.round(revenue * PAYMENT_COMMISSION);
      const perUnitDelivery = p.category === "chaussures" ? 900 : 600;
      const delivery = units * perUnitDelivery;
      const discount = Math.round(revenue * (p.discountPct ? p.discountPct / 100 / 4 : 0.01));
      const otherFees = Math.round(revenue * 0.015);
      const margin = revenue - purchaseCost - commission - delivery - discount - otherFees;
      return { product: p, units, revenue, purchaseCost, commission, delivery, discount, otherFees, margin, marginPct: revenue ? (margin / revenue) * 100 : 0 };
    });
}

export function profitWaterfall(rows: ProductProfit[]) {
  const sum = (k: keyof Omit<ProductProfit, "product" | "marginPct">) => rows.reduce((s, r) => s + (r[k] as number), 0);
  return {
    revenue: sum("revenue"),
    purchaseCost: sum("purchaseCost"),
    commission: sum("commission"),
    delivery: sum("delivery"),
    discount: sum("discount"),
    otherFees: sum("otherFees"),
    margin: sum("margin"),
  };
}

export function marginByCategory(rows: ProductProfit[]) {
  return CATEGORIES.map((c) => {
    const rs = rows.filter((r) => r.product.category === c.slug);
    const revenue = rs.reduce((s, r) => s + r.revenue, 0);
    const margin = rs.reduce((s, r) => s + r.margin, 0);
    return { label: c.shortName, revenue, margin, marginPct: revenue ? (margin / revenue) * 100 : 0 };
  }).sort((a, b) => b.margin - a.margin);
}

export function monthlyMargin(storeId = "all") {
  return monthlySeries(storeId).map((m) => ({ ...m, marginPct: m.revenue ? (m.profit / m.revenue) * 100 : 0 }));
}
