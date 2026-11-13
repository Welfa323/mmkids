"use client";

import Image from "next/image";
import { BadgeCheck, Camera, EyeOff, Flag, MessageSquareReply, Star, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { REVIEWS, type Review } from "@/modules/reviews";
import { getProductById, CATEGORY_BY_SLUG } from "@/modules/catalog";
import { KpiCard, PageHeader, Panel } from "@/modules/admin/components/ui";
import { BarList } from "@/shared/ui/charts";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { RatingStars } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatNumber, formatPercent } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const STATUS = { publie: { label: "Publié", tone: "bg-brand-50 text-brand-700" }, en_attente: { label: "En attente", tone: "bg-amber-50 text-amber-700" }, masque: { label: "Masqué", tone: "bg-ink-100 text-ink-600" } };

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [filter, setFilter] = useState<"tous" | Review["status"] | "negatifs">("en_attente");
  const [replyTo, setReplyTo] = useState<Review | null>(null);
  const [reply, setReply] = useState("");
  const update = (id: string, p: Partial<Review>) => setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const shown = reviews.filter((r) => (filter === "tous" ? true : filter === "negatifs" ? r.rating <= 2 : r.status === filter)).slice(0, 40);
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((s) => ({ label: `${s} ★`, value: reviews.filter((r) => r.rating === s).length }));
  const byCat = useMemo(() => {
    const m = new Map<string, number[]>();
    reviews.forEach((r) => {
      const c = getProductById(r.productId)?.category ?? "";
      m.set(c, [...(m.get(c) ?? []), r.rating]);
    });
    return [...m.entries()].map(([c, rs]) => ({ label: CATEGORY_BY_SLUG[c]?.shortName ?? c, value: rs.reduce((a, b) => a + b, 0) / rs.length })).sort((a, b) => b.value - a.value);
  }, [reviews]);

  return (
    <div className="space-y-6">
      <PageHeader title="Avis clients" description="Modérez, répondez et analysez les notes — uniquement des achats vérifiés" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Note moyenne" value={<span className="flex items-center gap-2">{formatNumber(avg, 2)} <RatingStars rating={avg} /></span>} />
        <KpiCard label="Avis publiés" value={formatNumber(reviews.filter((r) => r.status === "publie").length)} tone="ink" />
        <KpiCard label="À modérer" value={String(reviews.filter((r) => r.status === "en_attente").length)} tone="gold" />
        <KpiCard label="Taux de réponse" value={formatPercent((reviews.filter((r) => r.reply).length / reviews.length) * 100)} tone="ink" hint="objectif 100 % sur avis ≤ 3★" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Répartition des notes">
          <BarList items={dist} color="#d49b1c" />
        </Panel>
        <Panel title="Note moyenne par catégorie">
          <BarList items={byCat} format={(v) => `${formatNumber(v, 2)} / 5`} max={5} />
        </Panel>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {[
            { id: "en_attente", label: "À modérer" },
            { id: "negatifs", label: "Négatifs (≤ 2★)" },
            { id: "publie", label: "Publiés" },
            { id: "masque", label: "Masqués" },
            { id: "tous", label: "Tous" },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id as typeof filter)} className={cn("chip h-9", filter === f.id && "chip-active")}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {shown.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  <Image src={r.productImage} alt="" fill sizes="48px" className="object-contain p-1" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink-400">{r.productName}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingStars rating={r.rating} size="xs" />
                    <b className="text-sm">{r.title}</b>
                    <span className="text-xs text-ink-400">
                      par {r.author} ({r.city}) · {formatDate(r.createdAt)}
                    </span>
                    {r.verified && (
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-brand-700">
                        <BadgeCheck className="size-3.5" /> Vérifié
                      </span>
                    )}
                    {r.photos.length > 0 && <Camera className="size-3.5 text-ink-400" />}
                  </div>
                  <p className="mt-1 text-sm text-ink-700">{r.comment}</p>
                  {r.reply && (
                    <p className="mt-2 rounded-lg border-l-4 border-brand-500 bg-brand-50/60 px-3 py-2 text-xs text-ink-700">
                      <b>Votre réponse :</b> {r.reply.message}
                    </p>
                  )}
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS[r.status].tone)}>{STATUS[r.status].label}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                {r.status !== "publie" && (
                  <Button size="sm" onClick={() => (update(r.id, { status: "publie" }), toast.success("Avis publié"))}>
                    <Check className="size-3.5" /> Publier
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => (setReplyTo(r), setReply(r.reply?.message ?? ""))}>
                  <MessageSquareReply className="size-3.5" /> Répondre
                </Button>
                {r.status !== "masque" && (
                  <Button size="sm" variant="ghost" onClick={() => (update(r.id, { status: "masque" }), toast.info("Avis masqué", { description: "Motif : contenu abusif" }))}>
                    <EyeOff className="size-3.5" /> Masquer (abusif)
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => toast.info("Signalé à la modération")}>
                  <Flag className="size-3.5" /> Signaler
                </Button>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="card p-8 text-center text-sm text-ink-500">Rien à afficher.</p>}
        </div>
      </div>

      <Modal open={!!replyTo} onClose={() => setReplyTo(null)} title="Répondre publiquement">
        {replyTo && (
          <div className="space-y-3 p-5">
            <p className="flex items-center gap-1 text-sm text-ink-600">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={cn("size-4", i <= replyTo.rating ? "text-gold-400" : "text-ink-200")} fill="currentColor" strokeWidth={0} />
              ))}
              <span className="ml-1">« {replyTo.comment} »</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Merci beaucoup pour votre confiance 🙏", "Nous sommes désolés, notre équipe vous contacte sur WhatsApp.", "Le retour est gratuit sous 7 jours depuis votre espace client."].map((t) => (
                <button key={t} onClick={() => setReply(t)} className="chip h-auto py-1.5 text-left text-xs">
                  {t}
                </button>
              ))}
            </div>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="input h-28 py-2.5" />
            <Button className="w-full" disabled={!reply} onClick={() => (update(replyTo.id, { reply: { author: "Service client MMKids", message: reply, at: new Date().toISOString() } }), setReplyTo(null), toast.success("Réponse publiée"))}>
              Publier la réponse
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
