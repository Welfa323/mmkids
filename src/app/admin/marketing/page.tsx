"use client";

import { Bell, Bot, Mail, MessageCircle, Plus, Send, Smartphone, Users } from "lucide-react";
import { useState } from "react";
import { CAMPAIGNS, CHANNEL_LABEL, SEGMENTS, type Campaign, type Channel } from "@/modules/marketing";
import { KpiCard, PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { Sheet } from "@/shared/ui/sheet";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatNumber, formatPercent, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const ICON: Record<Channel, typeof Mail> = { email: Mail, sms: Smartphone, whatsapp: MessageCircle, push: Bell };
const STATUS = { envoyee: "bg-brand-50 text-brand-700", planifiee: "bg-sky-50 text-sky-700", brouillon: "bg-amber-50 text-amber-700", en_cours: "bg-gold-50 text-gold-600" };
const STATUS_LABEL = { envoyee: "Envoyée", planifiee: "Planifiée", brouillon: "Brouillon", en_cours: "En cours" };

export default function MarketingPage() {
  const [tab, setTab] = useState<"campagnes" | "segments">("campagnes");
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "Week-end robes −25 %", channel: "whatsapp" as Channel, segment: SEGMENTS[2].id, message: "Bonjour {prénom} 👋 Ce week-end, −25 % sur toutes les robes fille avec le code ROBES25 ! 👗✨\n👉 mmkids.ci/c/fille", coupon: "ROBES25", when: "maintenant" });
  const seg = SEGMENTS.find((s) => s.id === draft.segment)!;
  const sent = campaigns.filter((c) => c.sent > 0);
  const revenue = sent.reduce((s, c) => s + c.revenue, 0);
  const cost = sent.reduce((s, c) => s + c.cost, 0);
  const costPer: Record<Channel, number> = { email: 5, sms: 25, whatsapp: 20, push: 0 };

  return (
    <div>
      <PageHeader
        title="Marketing"
        description="Segmentez vos clients et lancez des campagnes Email, SMS, WhatsApp et notifications push depuis le back-office"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Nouvelle campagne
          </Button>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Messages envoyés (90 j)" value={formatNumber(sent.reduce((s, c) => s + c.sent, 0))} tone="ink" />
        <KpiCard label="Commandes générées" value={formatNumber(sent.reduce((s, c) => s + c.orders, 0))} />
        <KpiCard label="CA attribué" value={formatPrice(revenue)} tone="gold" />
        <KpiCard label="ROI moyen" value={`×${formatNumber(revenue / Math.max(1, cost), 0)}`} hint={`coût total ${formatPrice(cost)}`} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "campagnes", label: "Campagnes" }, { id: "segments", label: "Segments" }]} />

      {tab === "campagnes" ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Campagne</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3 text-right">Envoyés</th>
                <th className="px-4 py-3 text-right">Ouverture</th>
                <th className="px-4 py-3 text-right">Clics</th>
                <th className="px-4 py-3 text-right">Commandes</th>
                <th className="px-4 py-3 text-right">CA</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {campaigns.map((c) => {
                const I = ICON[c.channel];
                return (
                  <tr key={c.id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-ink-400">{formatDate(c.sentAt)}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                        <I className="size-3.5 text-brand-600" /> {CHANNEL_LABEL[c.channel]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-600">{c.segment}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.sent ? formatNumber(c.sent) : "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.sent ? formatPercent((c.opened / c.sent) * 100, 0) : "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.sent ? formatPercent((c.clicked / c.sent) * 100, 1) : "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.orders || "—"}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{c.revenue ? formatPrice(c.revenue) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS[c.status])}>{STATUS_LABEL[c.status]}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {SEGMENTS.map((s) => (
            <Panel key={s.id} title={<span className="flex items-center gap-2">{s.auto ? <Bot className="size-4 text-gold-500" /> : <Users className="size-4 text-brand-600" />} {s.name}</span>} subtitle={s.auto ? "Segment automatique (IA)" : "Segment manuel"}>
              <p className="text-3xl font-extrabold">{formatNumber(s.count)}</p>
              <p className="text-xs text-ink-500">clients</p>
              <p className="mt-3 rounded-lg bg-ink-50 px-2.5 py-1.5 font-mono text-[11px] text-ink-600">{s.rule}</p>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => (setDraft({ ...draft, segment: s.id }), setOpen(true))}>
                <Send className="size-3.5" /> Cibler ce segment
              </Button>
            </Panel>
          ))}
        </div>
      )}

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle campagne"
        footer={
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              const now = draft.when === "maintenant";
              setCampaigns([{ id: `cp-new-${campaigns.length}`, name: draft.name, channel: draft.channel, segment: seg.name, status: now ? "en_cours" : "planifiee", sentAt: "2026-10-26T14:30:00Z", sent: now ? seg.count : 0, opened: 0, clicked: 0, orders: 0, revenue: 0, cost: seg.count * costPer[draft.channel] }, ...campaigns]);
              setOpen(false);
              setTab("campagnes");
              toast.success(now ? "Campagne lancée 🚀" : "Campagne planifiée", { description: `${formatNumber(seg.count)} destinataires · ${CHANNEL_LABEL[draft.channel]}` });
            }}
          >
            {draft.when === "maintenant" ? `Envoyer à ${formatNumber(seg.count)} clients` : "Planifier"}
          </Button>
        }
      >
        <div className="space-y-4 p-5">
          <div>
            <label className="label">Nom</label>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Canal</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CHANNEL_LABEL) as Channel[]).map((ch) => {
                const I = ICON[ch];
                return (
                  <button key={ch} onClick={() => setDraft({ ...draft, channel: ch })} className={cn("flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold", draft.channel === ch ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200")}>
                    <I className="size-4" /> {CHANNEL_LABEL[ch].split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Audience</label>
            <select className="input" value={draft.segment} onChange={(e) => setDraft({ ...draft, segment: e.target.value })}>
              {SEGMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatNumber(s.count)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input h-32 py-2.5" value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />
            <p className="mt-1 text-xs text-ink-400">Variables : {"{prénom}"}, {"{points}"}, {"{lien}"} · {draft.channel === "sms" && `${draft.message.length} caractères (${Math.ceil(draft.message.length / 160)} SMS)`}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Coupon associé</label>
              <input className="input font-mono" value={draft.coupon} onChange={(e) => setDraft({ ...draft, coupon: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="label">Envoi</label>
              <select className="input" value={draft.when} onChange={(e) => setDraft({ ...draft, when: e.target.value })}>
                <option value="maintenant">Maintenant</option>
                <option value="planifie">Planifier (meilleur moment IA : 19 h)</option>
              </select>
            </div>
          </div>
          <div>
            <p className="label">Aperçu</p>
            <div className={cn("rounded-2xl p-4", draft.channel === "whatsapp" ? "bg-[#e7f8ee]" : draft.channel === "push" ? "bg-ink-900 text-white" : "bg-ink-50")}>
              <p className={cn("mb-1 text-[11px] font-bold uppercase", draft.channel === "push" ? "text-ink-400" : "text-ink-500")}>{draft.channel === "push" ? "MMKids · maintenant" : CHANNEL_LABEL[draft.channel]}</p>
              <p className="whitespace-pre-wrap text-sm">{draft.message.replace("{prénom}", "Aya")}</p>
            </div>
          </div>
          <p className="rounded-xl bg-gold-50 p-3 text-xs text-ink-700">
            Coût estimé : <b>{formatPrice(seg.count * costPer[draft.channel])}</b> · CA attendu : <b>{formatPrice(seg.count * 0.04 * 62_000)}</b> (taux de conversion historique 4 %)
          </p>
        </div>
      </Sheet>
    </div>
  );
}
