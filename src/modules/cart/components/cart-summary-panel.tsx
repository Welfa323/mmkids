"use client";

import { Check, ChevronDown, Coins, Gift, Lock, Tag, X } from "lucide-react";
import { useState } from "react";
import type { CartSummary } from "../services/cart-pricing";
import { useCart } from "../store/cart.store";
import { useAuth } from "@/modules/customer/store/auth.store";
import { pointsValue } from "@/modules/loyalty";
import { Switch } from "@/shared/ui/misc";
import { formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

function CodeInput({ placeholder, applied, onApply, onRemove, message, ok, icon: Icon }: { placeholder: string; applied?: string; onApply: (c: string) => void; onRemove: () => void; message?: string; ok?: boolean; icon: typeof Tag }) {
  const [value, setValue] = useState("");
  if (applied)
    return (
      <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm", ok ? "bg-brand-50 text-brand-800" : "bg-red-50 text-red-700")}>
        {ok ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
        <span className="min-w-0 flex-1">
          <b className="font-mono">{applied}</b> — {message}
        </span>
        <button onClick={onRemove} className="text-xs font-semibold underline">
          Retirer
        </button>
      </div>
    );
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onApply(value.trim().toUpperCase());
        setValue("");
      }}
    >
      <label className="relative flex-1">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="input h-10 pl-9 font-mono uppercase placeholder:font-sans placeholder:normal-case" />
      </label>
      <button className="h-10 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white hover:bg-ink-800">Appliquer</button>
    </form>
  );
}

export function CartSummaryPanel({ summary, cta, compact }: { summary: CartSummary; cta?: React.ReactNode; compact?: boolean }) {
  const { promoCode, voucherCode, usePoints, setPromoCode, setVoucherCode, setUsePoints } = useCart();
  const user = useAuth((s) => s.user);
  const [showVoucher, setShowVoucher] = useState(Boolean(voucherCode));

  return (
    <div className="card space-y-4 p-5">
      <h2 className="text-lg font-extrabold">Récapitulatif</h2>

      {!compact && (
        <div className="space-y-2">
          <CodeInput placeholder="Code promo (ex. AKWABA5000)" icon={Tag} applied={promoCode} ok={summary.promo?.ok} message={summary.promo?.message} onApply={setPromoCode} onRemove={() => setPromoCode(undefined)} />
          {showVoucher ? (
            <CodeInput placeholder="Bon d'achat (ex. BON-25000)" icon={Gift} applied={voucherCode} ok={summary.voucher?.ok} message={summary.voucher?.message} onApply={setVoucherCode} onRemove={() => setVoucherCode(undefined)} />
          ) : (
            <button onClick={() => setShowVoucher(true)} className="flex items-center gap-1 text-xs font-semibold text-brand-700">
              <Gift className="size-3.5" /> J&apos;ai un bon d&apos;achat ou une carte cadeau <ChevronDown className="size-3.5" />
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-3 rounded-xl bg-gold-50 px-3 py-2.5">
              <Coins className="size-5 shrink-0 text-gold-600" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-ink-800">Utiliser mes points</p>
                <p className="text-xs text-ink-500">
                  {formatNumber(user.points)} pts = {formatPrice(pointsValue(user.points))} (max. 30 % du panier)
                </p>
              </div>
              <Switch checked={usePoints} onChange={setUsePoints} label="Utiliser mes points fidélité" />
            </div>
          ) : (
            <p className="rounded-xl bg-ink-50 px-3 py-2.5 text-xs text-ink-500">
              <a href="/connexion" className="link">
                Connectez-vous
              </a>{" "}
              pour utiliser vos points fidélité et coupons personnels.
            </p>
          )}
        </div>
      )}

      <dl className="space-y-2.5 border-t border-ink-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-500">Sous-total ({summary.itemCount} article{summary.itemCount > 1 ? "s" : ""})</dt>
          <dd className="font-semibold">{formatPrice(summary.subtotal)}</dd>
        </div>
        {summary.savings > 0 && (
          <div className="flex justify-between text-brand-700">
            <dt>Remises produits</dt>
            <dd className="font-semibold">inclus (−{formatPrice(summary.savings)})</dd>
          </div>
        )}
        {summary.promoDiscount > 0 && (
          <div className="flex justify-between text-brand-700">
            <dt>Code {promoCode}</dt>
            <dd className="font-semibold">−{formatPrice(summary.promoDiscount)}</dd>
          </div>
        )}
        {summary.voucherDiscount > 0 && (
          <div className="flex justify-between text-brand-700">
            <dt>Bon d&apos;achat</dt>
            <dd className="font-semibold">−{formatPrice(summary.voucherDiscount)}</dd>
          </div>
        )}
        {summary.pointsDiscount > 0 && (
          <div className="flex justify-between text-gold-600">
            <dt>Points fidélité ({formatNumber(summary.pointsUsed)} pts)</dt>
            <dd className="font-semibold">−{formatPrice(summary.pointsDiscount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-500">Livraison</dt>
          <dd className="font-semibold">{!summary.shipping.available ? "—" : summary.shipping.fee === 0 ? <span className="text-brand-700">Gratuite</span> : formatPrice(summary.shipping.fee)}</dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between border-t border-ink-100 pt-4">
        <span className="font-bold">Total TTC</span>
        <span className="text-2xl font-extrabold tracking-tight">{formatPrice(summary.total)}</span>
      </div>
      {user && summary.total > 0 && <p className="-mt-2 text-right text-xs text-gold-600">+{formatNumber(Math.floor((summary.total / 1000) * 1.5))} points fidélité avec cette commande</p>}
      {cta}
      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <Lock className="size-3.5" /> Paiement 100 % sécurisé · Mobile Money · Carte · À la livraison
      </p>
    </div>
  );
}
