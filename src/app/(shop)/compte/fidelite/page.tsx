"use client";

import { Check, Coins, Copy, Gift, Percent, Ticket, Wallet } from "lucide-react";
import { useAuth } from "@/modules/customer/store/auth.store";
import { nextTier, PERSONAL_COUPONS, POINTS_HISTORY, pointsValue, tierForSpent, TIERS } from "@/modules/loyalty";
import { ProgressBar } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export default function LoyaltyPage() {
  const user = useAuth((s) => s.user)!;
  const tier = tierForSpent(user.totalSpent);
  const next = nextTier(user.totalSpent);
  const cashback = Math.round(user.totalSpent * 0.02 * 0.12);
  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success(`Code ${code} copié`, { description: "Collez-le dans votre panier." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Fidélité & avantages</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className={cn("rounded-3xl bg-gradient-to-br p-5 text-white md:col-span-2", tier.gradient)}>
          <p className="text-sm opacity-90">Votre niveau</p>
          <p className="text-3xl font-extrabold">{tier.name}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="opacity-80">Points</p>
              <p className="text-xl font-extrabold">{formatNumber(user.points)}</p>
            </div>
            <div>
              <p className="opacity-80">Valeur</p>
              <p className="text-xl font-extrabold">{formatPrice(pointsValue(user.points))}</p>
            </div>
            <div>
              <p className="opacity-80">Dépensé</p>
              <p className="text-xl font-extrabold">{formatPrice(user.totalSpent)}</p>
            </div>
          </div>
          {next && (
            <div className="mt-5">
              <ProgressBar value={(user.totalSpent / next.tier.minSpent) * 100} className="bg-white/25" barClassName="bg-white" />
              <p className="mt-1.5 text-xs opacity-90">Encore {formatPrice(next.remaining)} pour atteindre {next.tier.name}</p>
            </div>
          )}
        </div>
        <div className="card flex flex-col justify-between p-5">
          <Wallet className="size-6 text-brand-600" />
          <div>
            <p className="text-sm text-ink-500">Cagnotte cashback ({tier.cashbackPct} %)</p>
            <p className="text-2xl font-extrabold">{formatPrice(cashback)}</p>
            <p className="text-xs text-ink-400">Utilisable dès 5 000 FCFA, crédité 7 jours après livraison</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t) => (
          <div key={t.id} className={cn("card p-4", t.id === tier.id && "ring-2 ring-brand-500")}>
            <div className="flex items-center justify-between">
              <span className={cn("rounded-full bg-gradient-to-r px-2.5 py-0.5 text-xs font-bold text-white", t.gradient)}>{t.name}</span>
              {t.id === tier.id && <span className="text-[11px] font-bold text-brand-700">VOTRE NIVEAU</span>}
            </div>
            <p className="mt-2 text-xs text-ink-500">Dès {formatPrice(t.minSpent)} dépensés</p>
            <ul className="mt-3 space-y-1.5">
              {t.perks.map((p) => (
                <li key={p} className="flex items-start gap-1.5 text-xs text-ink-700">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-brand-600" /> {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Ticket className="size-5 text-accent-500" /> Coupons personnels & bons d&apos;achat
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PERSONAL_COUPONS.map((c) => (
            <div key={c.code} className="flex items-center gap-3 rounded-2xl border border-dashed border-ink-300 p-4">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl", c.kind === "bon" ? "bg-brand-50 text-brand-700" : "bg-accent-50 text-accent-600")}>{c.kind === "bon" ? <Gift className="size-5" /> : <Percent className="size-5" />}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{c.label}</p>
                <p className="text-xs text-ink-400">Valable jusqu&apos;au {c.expiresAt.split("-").reverse().join("/")}</p>
              </div>
              <button onClick={() => copy(c.code)} className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-2.5 py-1.5 font-mono text-xs font-bold text-white">
                {c.code} <Copy className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Coins className="size-5 text-gold-600" /> Historique des points
        </h2>
        <ul className="divide-y divide-ink-100">
          {POINTS_HISTORY.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">{p.label}</p>
                <p className="text-xs text-ink-400">{formatDate(p.date)}</p>
              </div>
              <span className={cn("font-bold", p.points > 0 ? "text-brand-700" : "text-red-600")}>
                {p.points > 0 ? "+" : ""}
                {formatNumber(p.points)} pts
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
