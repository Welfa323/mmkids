/**
 * Calcul du panier : sous-total, remises, code promo, bon d'achat, points fidélité, livraison.
 * Fonction pure, testable, utilisée par le panier, le tiroir et le tunnel de commande.
 */
import { getProductById, priceForSelection, type Product } from "@/modules/catalog";
import { quoteShipping, type DeliveryMode, type ShippingQuote } from "@/modules/delivery";
import { evaluatePromoCode, evaluateVoucher, type PromoEvaluation } from "@/modules/promotions";
import { pointsValue } from "@/modules/loyalty";
import type { CartLine } from "../store/cart.store";

export interface PricedCartLine extends CartLine {
  product: Product;
  unitPrice: number;
  compareAtUnit?: number;
  lineTotal: number;
  maxQty: number;
  unavailable: boolean;
}

export interface CartSummary {
  lines: PricedCartLine[];
  itemCount: number;
  subtotal: number;
  /** économies réalisées grâce aux prix barrés */
  savings: number;
  promo?: PromoEvaluation;
  promoDiscount: number;
  voucher?: { ok: boolean; amount: number; message: string };
  voucherDiscount: number;
  pointsUsed: number;
  pointsDiscount: number;
  shipping: ShippingQuote;
  total: number;
}

export function priceLines(lines: CartLine[]): PricedCartLine[] {
  return lines
    .map((l): PricedCartLine | null => {
      const product = getProductById(l.productId);
      if (!product) return null;
      const unitPrice = priceForSelection(product, l.selection);
      const ratio = product.compareAtPrice ? product.compareAtPrice / product.price : undefined;
      const unavailable = product.availability === "out_of_stock" || product.availability === "coming_soon";
      return {
        ...l,
        product,
        unitPrice,
        compareAtUnit: ratio ? Math.round((unitPrice * ratio) / 100) * 100 : undefined,
        lineTotal: unitPrice * l.qty,
        maxQty: Math.max(1, Math.min(10, product.stock || 10)),
        unavailable,
      };
    })
    .filter((l): l is PricedCartLine => l !== null);
}

export function computeCart(
  lines: CartLine[],
  opts: {
    promoCode?: string;
    voucherCode?: string;
    usePoints?: boolean;
    availablePoints?: number;
    zoneId: string;
    mode: DeliveryMode;
    relayId?: string;
  },
): CartSummary {
  const priced = priceLines(lines).filter((l) => !l.unavailable);
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);
  const savings = priced.reduce((s, l) => s + (l.compareAtUnit ? (l.compareAtUnit - l.unitPrice) * l.qty : 0), 0);

  const promo = opts.promoCode
    ? evaluatePromoCode(
        opts.promoCode,
        priced.map((l) => ({ productId: l.productId, category: l.product.category, subcategory: l.product.subcategory, brand: l.product.brand, unitPrice: l.unitPrice, qty: l.qty })),
      )
    : undefined;
  const promoDiscount = promo?.ok ? promo.discount : 0;

  const voucher = opts.voucherCode ? evaluateVoucher(opts.voucherCode) : undefined;
  const afterPromo = Math.max(0, subtotal - promoDiscount);
  const voucherDiscount = voucher?.ok ? Math.min(voucher.amount, afterPromo) : 0;

  // Les points couvrent au maximum 30 % du montant restant
  const afterVoucher = afterPromo - voucherDiscount;
  const maxPointsValue = Math.floor(afterVoucher * 0.3);
  const availablePointsValue = pointsValue(opts.availablePoints ?? 0);
  const pointsDiscount = opts.usePoints ? Math.min(availablePointsValue, maxPointsValue) : 0;
  const pointsUsed = Math.ceil(pointsDiscount / 5);

  const shipping = quoteShipping({
    zoneId: opts.zoneId,
    mode: opts.mode,
    subtotal: afterPromo,
    relayId: opts.relayId,
    forceFree: promo?.ok && promo.freeShipping,
  });

  const total = Math.max(0, afterVoucher - pointsDiscount) + (shipping.available ? shipping.fee : 0);

  return {
    lines: priceLines(lines),
    itemCount: lines.reduce((s, l) => s + l.qty, 0),
    subtotal,
    savings,
    promo,
    promoDiscount,
    voucher,
    voucherDiscount,
    pointsUsed,
    pointsDiscount,
    shipping,
    total,
  };
}
