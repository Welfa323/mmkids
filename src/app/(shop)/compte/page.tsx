"use client";

import Link from "next/link";
import { ArrowRight, Coins, Gift, Heart, Package, Truck, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/modules/customer/store/auth.store";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { useMyOrders } from "@/modules/customer/hooks/use-my-orders";
import { getAllProducts, sortProducts } from "@/modules/catalog";
import { ProductRail } from "@/modules/catalog/components/product-rail";
import { OrderTrackingBar } from "@/modules/orders/components/order-tracking";
import { nextTier, PERSONAL_COUPONS, pointsValue, tierForSpent } from "@/modules/loyalty";
import { ProgressBar, SectionHeader } from "@/shared/ui/misc";
import { formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export default function AccountHome() {
  const user = useAuth((s) => s.user)!;
  const orders = useMyOrders();
  const wishCount = useEngagement((s) => s.wishlist.length);
  const tier = tierForSpent(user.totalSpent);
  const next = nextTier(user.totalSpent);
  const active = orders.filter((o) => ["nouvelle", "paiement_en_attente", "payee", "en_preparation", "prete", "expediee", "en_livraison"].includes(o.status));
  const tracking = active[0];

  // Recommandations personnalisées : catégories préférées (garçon 8 ans, chaussures, école)
  const recos = useMemo(() => {
    const bought = new Set(orders.flatMap((o) => o.items.map((i) => i.productId)));
    return sortProducts(
      getAllProducts().filter((p) => ["tshirts-garcon", "bas-garcon", "baskets-enfant", "sacs-scolaires", "uniformes", "robes-fille"].includes(p.subcategory) && !bought.has(p.id) && p.availability !== "coming_soon"),
      "popularite",
    ).slice(0, 12);
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white", tier.gradient)}>
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10" />
          <p className="text-sm opacity-90">Bonjour {user.firstName} 👋</p>
          <p className="mt-1 text-2xl font-extrabold">Niveau {tier.name}</p>
          <p className="mt-4 text-4xl font-extrabold tracking-tight">
            {formatNumber(user.points)} <span className="text-lg font-semibold">points</span>
          </p>
          <p className="text-sm opacity-90">soit {formatPrice(pointsValue(user.points))} à utiliser dans votre panier</p>
          {next && (
            <div className="mt-5">
              <ProgressBar value={(user.totalSpent / next.tier.minSpent) * 100} className="bg-white/25" barClassName="bg-white" />
              <p className="mt-1.5 text-xs opacity-90">
                Plus que {formatPrice(next.remaining)} d&apos;achats pour le niveau {next.tier.name}
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Package, label: "Commandes", value: orders.length, href: "/compte/commandes" },
            { icon: Truck, label: "En cours", value: active.length, href: "/compte/commandes?filtre=en-cours" },
            { icon: Heart, label: "Favoris", value: wishCount, href: "/favoris" },
            { icon: Wallet, label: "Cashback", value: formatPrice(Math.round(user.totalSpent * 0.02 * 0.12)), href: "/compte/fidelite" },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="card flex flex-col justify-between p-4 transition hover:shadow-lift">
              <s.icon className="size-5 text-brand-600" />
              <div className="mt-3">
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-xs text-ink-500">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {tracking && (
        <div className="card p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Livraison en cours</p>
              <p className="font-semibold">
                Commande <span className="font-mono">{tracking.number}</span>
              </p>
            </div>
            <Link href={`/compte/commandes/${tracking.id}`} className="flex items-center gap-1 text-sm font-semibold text-brand-700">
              Suivre <ArrowRight className="size-4" />
            </Link>
          </div>
          <OrderTrackingBar order={tracking} />
          {tracking.status === "en_livraison" && <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-900">🚚 Votre livreur arrive aujourd&apos;hui entre 15 h et 17 h. Il vous appellera avant de passer.</p>}
        </div>
      )}

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 font-bold">
            <Gift className="size-5 text-accent-500" /> Mes coupons
          </p>
          <Link href="/compte/fidelite" className="text-sm font-semibold text-brand-700">
            Tout voir
          </Link>
        </div>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
          {PERSONAL_COUPONS.map((c) => (
            <div key={c.code} className="relative w-56 shrink-0 rounded-2xl border border-dashed border-accent-300 bg-accent-50 p-4">
              <p className="text-lg font-extrabold text-accent-700">{c.amount}</p>
              <p className="text-xs text-ink-600">{c.label}</p>
              <p className="mt-2 font-mono text-sm font-bold">{c.code}</p>
              <p className="text-[11px] text-ink-400">Expire le {c.expiresAt.split("-").reverse().join("/")}</p>
            </div>
          ))}
          <div className="flex w-56 shrink-0 items-center gap-3 rounded-2xl bg-gold-50 p-4">
            <Coins className="size-8 text-gold-600" />
            <p className="text-sm text-ink-700">Gagnez 25 points pour chaque avis publié</p>
          </div>
        </div>
      </div>

      <section>
        <SectionHeader title="Recommandé pour vous" subtitle="Selon vos achats : Kevin (8 ans), Emma (3 ans), chaussures et école" />
        <ProductRail products={recos} />
      </section>
    </div>
  );
}
