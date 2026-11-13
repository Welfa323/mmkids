/**
 * Module Stock : stock par emplacement (multi-stock), réservé, vendu, entrant, minimum,
 * alertes, mouvements (entrées / sorties / ajustements) et prévision de rupture.
 */
import { getAllProducts, type Product } from "@/modules/catalog";
import { STORES } from "@/modules/stores";
import { daysAgo } from "@/shared/lib/clock";
import { seeded } from "@/shared/lib/utils";

export interface StockLevel {
  productId: string;
  storeId: string;
  available: number;
  reserved: number;
  sold30: number;
  incoming: number;
  minimum: number;
}

export interface StockRow {
  product: Product;
  levels: StockLevel[];
  available: number;
  reserved: number;
  sold30: number;
  incoming: number;
  minimum: number;
  /** ventes moyennes / jour */
  velocity: number;
  /** jours de couverture avant rupture */
  daysOfCover: number;
  status: "ok" | "faible" | "rupture" | "surstock";
}

function build(): StockRow[] {
  return getAllProducts().map((p, i) => {
    const r = seeded(i * 31 + 5);
    const weights = STORES.map((s) => s.share * (0.6 + r.next()));
    const sumW = weights.reduce((a, b) => a + b, 0);
    let remaining = p.stock;
    const levels = STORES.map((s, k) => {
      const available = k === STORES.length - 1 ? remaining : Math.min(remaining, Math.round((p.stock * weights[k]) / sumW));
      remaining -= available;
      return {
        productId: p.id,
        storeId: s.id,
        available,
        reserved: available > 0 && r.chance(0.4) ? r.int(1, Math.max(1, Math.floor(available / 3))) : 0,
        sold30: Math.round((p.soldCount / 30) * (weights[k] / sumW) * (0.7 + r.next() * 0.6)),
        incoming: p.availability === "coming_soon" || p.availability === "out_of_stock" || r.chance(0.12) ? r.int(5, 40) : 0,
        minimum: p.price > 500_000 ? 1 : p.price > 50_000 ? 3 : 8,
      };
    });
    const sum = (k: keyof Omit<StockLevel, "productId" | "storeId">) => levels.reduce((s, l) => s + l[k], 0);
    const available = sum("available");
    const sold30 = sum("sold30");
    const velocity = sold30 / 30;
    const daysOfCover = velocity > 0 ? Math.max(available > 0 ? 1 : 0, Math.floor(available / velocity)) : 999;
    const minimum = sum("minimum");
    return {
      product: p,
      levels,
      available,
      reserved: sum("reserved"),
      sold30,
      incoming: sum("incoming"),
      minimum,
      velocity,
      daysOfCover: Math.max(0, daysOfCover),
      status: available === 0 ? "rupture" : available <= minimum ? "faible" : daysOfCover > 180 ? "surstock" : "ok",
    };
  });
}

export const STOCK = build();

export function stockForStore(storeId: string): StockRow[] {
  if (storeId === "all") return STOCK;
  return STOCK.map((row) => {
    const l = row.levels.find((x) => x.storeId === storeId)!;
    const velocity = l.sold30 / 30;
    const daysOfCover = velocity > 0 ? Math.max(l.available > 0 ? 1 : 0, Math.floor(l.available / velocity)) : 999;
    return {
      ...row,
      available: l.available,
      reserved: l.reserved,
      sold30: l.sold30,
      incoming: l.incoming,
      minimum: l.minimum,
      velocity,
      daysOfCover: Math.max(0, daysOfCover),
      status: l.available === 0 ? "rupture" : l.available <= l.minimum ? "faible" : daysOfCover > 180 ? "surstock" : "ok",
    };
  });
}

/** Produits qui risquent la rupture dans les N prochains jours */
export function stockoutRisk(days = 15, storeId = "all") {
  return stockForStore(storeId)
    .filter((r) => r.available > 0 && r.velocity > 0 && r.daysOfCover <= days && r.product.availability !== "coming_soon")
    .sort((a, b) => a.daysOfCover - b.daysOfCover);
}

export type MovementType = "entree" | "sortie" | "ajustement" | "transfert" | "retour";

export interface StockMovement {
  id: string;
  at: string;
  type: MovementType;
  productId: string;
  productName: string;
  storeId: string;
  qty: number;
  reason: string;
  by: string;
}

export const MOVEMENT_LABEL: Record<MovementType, string> = {
  entree: "Entrée",
  sortie: "Sortie",
  ajustement: "Ajustement",
  transfert: "Transfert",
  retour: "Retour client",
};

export const MOVEMENTS: StockMovement[] = (() => {
  const r = seeded(404);
  const products = getAllProducts();
  const reasons: Record<MovementType, string[]> = {
    entree: ["Réception fournisseur BL-F2026-118", "Réception conteneur Port d'Abidjan", "Réassort fournisseur local"],
    sortie: ["Vente en ligne", "Vente en boutique", "Commande WhatsApp"],
    ajustement: ["Inventaire mensuel", "Produit endommagé", "Écart de comptage"],
    transfert: ["Transfert vers Boutique Cocody", "Transfert vers Entrepôt Bouaké", "Réassort Boutique Yopougon"],
    retour: ["Retour client — taille", "Retour client — défaut"],
  };
  const types: MovementType[] = ["sortie", "sortie", "sortie", "sortie", "entree", "entree", "ajustement", "transfert", "retour"];
  return Array.from({ length: 60 }, (_, i) => {
    const p = r.pick(products);
    const type = r.pick(types);
    const qty = type === "entree" ? r.int(10, 60) : type === "ajustement" ? -r.int(1, 3) : type === "retour" ? 1 : type === "transfert" ? r.int(3, 15) : -r.int(1, 4);
    return {
      id: `mv${i}`,
      at: daysAgo(Math.floor(i / 6), 18 - (i % 6) * 2, (i * 17) % 60).toISOString(),
      type,
      productId: p.id,
      productName: p.name,
      storeId: r.pick(STORES).id,
      qty,
      reason: r.pick(reasons[type]),
      by: r.pick(["Ibrahim Ouattara", "Konan Yao", "Awa Touré", "Système"]),
    };
  });
})();
