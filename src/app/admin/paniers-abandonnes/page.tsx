"use client";

import Image from "next/image";
import { Bell, CheckCircle2, Mail, MessageCircle, Send, Smartphone, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { ABANDONED_CARTS, CHANNEL_LABEL, RECOVERY_RULES, type AbandonedCart, type Channel } from "@/modules/marketing";
import { useCart } from "@/modules/cart/store/cart.store";
import { priceLines } from "@/modules/cart/services/cart-pricing";
import { KpiCard, PageHeader, Panel } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { Switch } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { DEMO_NOW } from "@/shared/lib/clock";
import { formatNumber, formatPercent, formatPrice, timeAgo } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const STATUS: Record<AbandonedCart["status"], { label: string; tone: string }> = {
  a_relancer: { label: "À relancer", tone: "bg-accent-50 text-accent-700" },
  relance: { label: "Relancé", tone: "bg-sky-50 text-sky-700" },
  recupere: { label: "Récupéré", tone: "bg-brand-50 text-brand-700" },
  perdu: { label: "Perdu", tone: "bg-ink-100 text-ink-500" },
};
const CH_ICON: Record<Channel, typeof Mail> = { email: Mail, sms: Smartphone, whatsapp: MessageCircle, push: Bell };

export default function AbandonedCartsPage() {
  const demoLines = useCart((s) => s.lines);
  const [carts, setCarts] = useState<AbandonedCart[]>(ABANDONED_CARTS);
  const [rules, setRules] = useState(RECOVERY_RULES);
  const [target, setTarget] = useState<AbandonedCart | null>(null);
  const [channel, setChannel] = useState<Channel>("whatsapp");

  // Le panier de la session de démo (boutique) apparaît ici en temps réel
  const live = useMemo<AbandonedCart | null>(() => {
    const priced = priceLines(demoLines);
    if (!priced.length) return null;
    return {
      id: "live",
      customerName: "Visiteur de la démo (votre navigateur)",
      phone: "—",
      email: "—",
      items: priced.map((l) => ({ productId: l.productId, name: l.product.name, image: l.product.images[0], qty: l.qty, price: l.unitPrice })),
      total: priced.reduce((s, l) => s + l.lineTotal, 0),
      abandonedAt: DEMO_NOW.toISOString(),
      step: "panier",
      status: "a_relancer",
      reminders: [],
    };
  }, [demoLines]);

  const all = live ? [live, ...carts] : carts;
  const pending = all.filter((c) => c.status === "a_relancer");
  const recovered = all.filter((c) => c.status === "recupere");
  const totalValue = all.filter((c) => c.status !== "recupere").reduce((s, c) => s + c.total, 0);
  const message = (c: AbandonedCart) => `Bonjour ${c.customerName.split(" ")[0]} 👋 Vous avez oublié ${c.items.length} article(s) dans votre panier (${formatPrice(c.total)}). Finalisez votre commande ici : mmkids.ci/panier — et profitez de −5 % avec le code RETOUR5 🎁`;

  const send = () => {
    if (!target) return;
    setCarts(carts.map((c) => (c.id === target.id ? { ...c, status: "relance", reminders: [...c.reminders, { channel, at: DEMO_NOW.toISOString() }] } : c)));
    toast.success(`Relance ${CHANNEL_LABEL[channel]} envoyée`, { description: `à ${target.customerName}` });
    setTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Paniers abandonnés" description="Sachez qui n'a pas terminé son achat et relancez automatiquement." actions={<Button onClick={() => (setCarts(carts.map((c) => (c.status === "a_relancer" ? { ...c, status: "relance", reminders: [{ channel: "whatsapp", at: DEMO_NOW.toISOString() }] } : c))), toast.success(`${pending.length} relances WhatsApp envoyées`))}><Send className="size-4" /> Relancer tous ({pending.length})</Button>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Valeur à récupérer" value={formatPrice(totalValue)} tone="accent" />
        <KpiCard label="Paniers à relancer" value={String(pending.length)} tone="gold" />
        <KpiCard label="Récupérés (7 j)" value={formatPrice(recovered.reduce((s, c) => s + c.total, 0))} />
        <KpiCard label="Taux de récupération" value={formatPercent((recovered.length / all.length) * 100)} hint="moyenne secteur : 8–12 %" tone="ink" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {all.map((c) => (
            <div key={c.id} className={cn("card p-4", c.id === "live" && "ring-2 ring-gold-400")}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <b>{c.customerName}</b> a ajouté <b>{c.items.reduce((n, i) => n + i.qty, 0)} produit(s)</b> pour <b>{formatPrice(c.total)}</b> mais n&apos;a pas terminé son achat.
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {timeAgo(c.abandonedAt, DEMO_NOW)} · abandon à l&apos;étape « {c.step} » · {c.phone}
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS[c.status].tone)}>{STATUS[c.status].label}</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {c.items.map((it, i) => (
                    <span key={i} className="relative size-11 overflow-hidden rounded-xl border-2 border-white bg-ink-50" title={it.name}>
                      <Image src={it.image} alt={it.name} fill sizes="44px" className="object-contain p-1" />
                    </span>
                  ))}
                </div>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {c.reminders.map((r, i) => {
                    const I = CH_ICON[r.channel];
                    return (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-ink-100 px-2 py-0.5 text-[11px] text-ink-600">
                        <I className="size-3" /> {CHANNEL_LABEL[r.channel]} · {timeAgo(r.at, DEMO_NOW)}
                      </span>
                    );
                  })}
                  {c.status === "recupere" && (
                    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                      <CheckCircle2 className="size-3" /> Commande passée après relance
                    </span>
                  )}
                </div>
                {c.status !== "recupere" && c.status !== "perdu" && (
                  <Button size="sm" variant={c.status === "a_relancer" ? "primary" : "outline"} onClick={() => setTarget(c)}>
                    <Send className="size-3.5" /> Relancer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Panel title={<span className="flex items-center gap-2"><Zap className="size-4 text-gold-500" /> Relances automatiques</span>} subtitle="Scénario déclenché dès qu'un panier est abandonné" className="xl:sticky xl:top-20 xl:self-start">
          <ol className="space-y-3">
            {rules.map((r, i) => {
              const I = CH_ICON[r.channel];
              return (
                <li key={i} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-700">
                        <I className="size-3.5" />
                      </span>
                      Après {r.delay} · {CHANNEL_LABEL[r.channel]}
                    </span>
                    <Switch checked={r.enabled} onChange={(v) => setRules(rules.map((x, j) => (j === i ? { ...x, enabled: v } : x)))} label="Activer" />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-500">{r.message}</p>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 rounded-xl bg-brand-50 p-3 text-xs text-brand-900">
            Sur 30 jours : <b>{formatNumber(231)}</b> paniers relancés, <b>27</b> commandes récupérées, <b>{formatPrice(640_000)}</b> de CA sauvé.
          </p>
        </Panel>
      </div>

      <Modal open={!!target} onClose={() => setTarget(null)} title="Relancer le client">
        {target && (
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CHANNEL_LABEL) as Channel[]).map((ch) => {
                const I = CH_ICON[ch];
                return (
                  <button key={ch} onClick={() => setChannel(ch)} className={cn("flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold", channel === ch ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200")}>
                    <I className="size-4" /> {CHANNEL_LABEL[ch].split(" ")[0]}
                  </button>
                );
              })}
            </div>
            <div className={cn("rounded-2xl p-4 text-sm", channel === "whatsapp" ? "bg-[#e7f8ee]" : "bg-ink-50")}>
              <p className="mb-1 text-xs font-semibold text-ink-500">Aperçu</p>
              <p className="whitespace-pre-wrap text-ink-800">{message(target)}</p>
            </div>
            <Button className="w-full" onClick={send}>
              <Send className="size-4" /> Envoyer
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
