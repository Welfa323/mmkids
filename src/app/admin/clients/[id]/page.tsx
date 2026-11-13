"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Coins, Gift, Mail, MessageCircle, Phone, ShoppingBag, StickyNote } from "lucide-react";
import { useState } from "react";
import { CUSTOMER_BY_ID, SEGMENT_META } from "@/modules/crm";
import { getCustomerOrders, ORDER_STATUS } from "@/modules/orders";
import { tierForSpent } from "@/modules/loyalty";
import { KpiCard, Panel } from "@/modules/admin/components/ui";
import { ToneBadge } from "@/shared/ui/badge";
import { Avatar, EmptyState } from "@/shared/ui/misc";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatNumber, formatPrice, formatShortDate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export default function CustomerFile() {
  const { id } = useParams<{ id: string }>();
  const c = CUSTOMER_BY_ID[id];
  const [note, setNote] = useState(id === "c001" ? "Client VIP fidèle depuis 2024. Préfère être contacté sur WhatsApp. 2 enfants : Kevin (8 ans, pointure 32) et Emma (3 ans)." : "");
  if (!c) return <EmptyState icon={<ShoppingBag className="size-7" />} title="Client introuvable" />;
  const orders = getCustomerOrders(c.id);
  const tier = tierForSpent(c.totalSpent);

  return (
    <div className="space-y-5">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="size-4" /> Clients
      </Link>
      <div className="card flex flex-wrap items-center gap-5 p-5">
        <Avatar name={c.name} size="xl" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Client</p>
          <h1 className="text-2xl font-extrabold tracking-tight">{c.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", SEGMENT_META[c.segment].tone)}>{SEGMENT_META[c.segment].label}</span>
            <span className={cn("rounded-full bg-gradient-to-r px-2 py-0.5 text-xs font-bold text-white", tier.gradient)}>{tier.name}</span>
            <span>
              {c.commune}, {c.city}
            </span>
            <span>· client depuis le {formatDate(c.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${c.phone}`} className="chip">
            <Phone className="size-4" /> Appeler
          </a>
          <a href="https://wa.me/2250700000000" className="chip">
            <MessageCircle className="size-4" /> WhatsApp
          </a>
          <a href={`mailto:${c.email}`} className="chip">
            <Mail className="size-4" /> Email
          </a>
          <Button size="sm" onClick={() => toast.success("Coupon personnel envoyé", { description: `−10 % envoyé à ${c.name} par WhatsApp` })}>
            <Gift className="size-4" /> Offrir un coupon
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <KpiCard label="Commandes" value={String(c.ordersCount)} tone="ink" />
        <KpiCard label="CA généré" value={formatPrice(c.totalSpent)} />
        <KpiCard label="Panier moyen" value={formatPrice(c.avgBasket)} tone="gold" />
        <KpiCard label="Dernier achat" value={formatShortDate(c.lastOrderAt)} tone="ink" />
        <KpiCard label="Points" value={formatNumber(c.points)} icon={<Coins className="size-4" />} tone="gold" />
        <KpiCard label="Valeur client (CLV)" value={formatPrice(c.lifetimeValue)} hint={`Risque de départ ${c.churnRisk} %`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Panel title="Historique des commandes" bodyClassName="pt-2">
          {orders.length ? (
            <ul className="divide-y divide-ink-100">
              {orders.slice(0, 12).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/commandes/${o.id}`} className="flex flex-wrap items-center gap-3 py-2.5 hover:bg-ink-50/60">
                    <span className="font-mono text-xs font-semibold">{o.number}</span>
                    <span className="text-xs text-ink-400">{formatDate(o.createdAt)}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink-600">{o.items.map((i) => i.name).join(", ")}</span>
                    <span className="text-sm font-semibold">{formatPrice(o.total)}</span>
                    <ToneBadge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</ToneBadge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">Historique détaillé disponible pour {c.ordersCount} commandes (archives).</p>
          )}
        </Panel>
        <div className="space-y-5">
          <Panel title="Produits préférés">
            <div className="flex flex-wrap gap-2">
              {c.favoriteCategories.map((f) => (
                <span key={f} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800">
                  {f}
                </span>
              ))}
            </div>
          </Panel>
          <Panel title="Coordonnées">
            <p className="text-sm">{c.email}</p>
            <p className="text-sm">{c.phone}</p>
            <p className="mt-2 text-xs text-ink-500">Canal d&apos;acquisition : {c.channel}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {c.tags.map((t) => (
                <span key={t} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-600">
                  #{t}
                </span>
              ))}
            </div>
          </Panel>
          <Panel title={<span className="flex items-center gap-2"><StickyNote className="size-4" /> Notes internes</span>}>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input h-24 py-2.5" placeholder="Préférences, remarques…" />
            <Button size="sm" className="mt-2" onClick={() => toast.success("Note enregistrée")}>
              Enregistrer
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
}
