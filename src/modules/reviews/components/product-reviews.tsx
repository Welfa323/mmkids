"use client";

import Image from "next/image";
import { BadgeCheck, Camera, MessageSquareReply, Star, ThumbsUp, Video } from "lucide-react";
import { useState } from "react";
import type { Review } from "../index";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { Avatar, RatingStars } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { formatDate, formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function ProductReviews({ reviews, rating, reviewCount, distribution, productName }: { reviews: Review[]; rating: number; reviewCount: number; distribution: { stars: number; count: number }[]; productName: string }) {
  const [filter, setFilter] = useState<number | "photos" | null>(null);
  const [open, setOpen] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [helpful, setHelpful] = useState<string[]>([]);
  const max = Math.max(1, ...distribution.map((d) => d.count));
  const shown = reviews.filter((r) => (filter === "photos" ? r.photos.length > 0 : filter ? r.rating === filter : true));

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <div className="lg:sticky lg:top-36 lg:self-start">
        <div className="flex items-end gap-3">
          <span className="text-5xl font-extrabold tracking-tight">{String(rating).replace(".", ",")}</span>
          <div className="pb-1.5">
            <RatingStars rating={rating} size="md" />
            <p className="text-xs text-ink-500">{formatNumber(reviewCount)} avis</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          {distribution.map((d) => (
            <button key={d.stars} onClick={() => setFilter(filter === d.stars ? null : d.stars)} className={cn("flex w-full items-center gap-2 rounded-lg px-1 py-0.5 text-xs transition", filter === d.stars ? "bg-brand-50" : "hover:bg-ink-50")}>
              <span className="flex w-7 items-center gap-0.5 font-semibold text-ink-700">
                {d.stars} <Star className="size-3 text-gold-400" fill="currentColor" strokeWidth={0} />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                <span className="block h-full rounded-full bg-gold-400" style={{ width: `${(d.count / max) * 100}%` }} />
              </span>
              <span className="w-8 text-right text-ink-500">{d.count}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-ink-50 p-4">
          <p className="text-sm font-semibold">Vous avez acheté ce produit ?</p>
          <p className="mt-0.5 text-xs text-ink-500">Partagez votre avis et gagnez 25 points fidélité.</p>
          <Button variant="outline" className="mt-3 w-full" onClick={() => setOpen(true)}>
            Rédiger un avis
          </Button>
        </div>
      </div>

      <div>
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          <button onClick={() => setFilter(null)} className={cn("chip shrink-0", filter === null && "chip-active")}>
            Tous
          </button>
          <button onClick={() => setFilter("photos")} className={cn("chip shrink-0", filter === "photos" && "chip-active")}>
            <Camera className="size-4" /> Avec photos
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn("chip shrink-0", filter === s && "chip-active")}>
              {s} ★
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="rounded-2xl bg-ink-50 p-6 text-center text-sm text-ink-500">Aucun avis pour ce filtre.</p>
        ) : (
          <ul className="space-y-4">
            {shown.map((r) => (
              <li key={r.id} className="rounded-2xl border border-ink-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={r.author} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <p className="text-sm font-semibold">{r.author}</p>
                      <span className="text-xs text-ink-400">
                        {r.city} · {formatDate(r.createdAt)}
                      </span>
                      {r.verified && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-brand-700">
                          <BadgeCheck className="size-3.5" /> Achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <RatingStars rating={r.rating} size="xs" />
                      <p className="text-sm font-semibold">{r.title}</p>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{r.comment}</p>
                    {(r.photos.length > 0 || r.hasVideo) && (
                      <div className="mt-2.5 flex gap-2">
                        {r.photos.map((p) => (
                          <span key={p} className="relative size-20 overflow-hidden rounded-xl bg-ink-50">
                            <Image src={p} alt="Photo client" fill sizes="80px" className="object-contain p-1" />
                          </span>
                        ))}
                        {r.hasVideo && (
                          <span className="grid size-20 place-items-center rounded-xl bg-ink-900 text-white">
                            <Video className="size-6" />
                          </span>
                        )}
                      </div>
                    )}
                    {r.reply && (
                      <div className="mt-3 rounded-xl border-l-4 border-brand-500 bg-brand-50/60 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-800">
                          <MessageSquareReply className="size-3.5" /> {r.reply.author}
                        </p>
                        <p className="mt-1 text-sm text-ink-700">{r.reply.message}</p>
                      </div>
                    )}
                    <button
                      onClick={() => setHelpful((h) => (h.includes(r.id) ? h.filter((x) => x !== r.id) : [...h, r.id]))}
                      className={cn("mt-3 flex items-center gap-1.5 text-xs font-medium", helpful.includes(r.id) ? "text-brand-700" : "text-ink-500 hover:text-ink-800")}
                    >
                      <ThumbsUp className="size-3.5" /> Utile ({r.helpful + (helpful.includes(r.id) ? 1 : 0)})
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Comment évaluez-vous votre achat ?">
        <form
          className="space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            setMyRating(0);
            toast.success("Merci pour votre avis !", { description: "Il sera publié après modération. +25 points fidélité 🎉" });
          }}
        >
          <p className="text-sm text-ink-500">{productName}</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button type="button" key={s} onClick={() => setMyRating(s)} aria-label={`${s} étoiles`}>
                <Star className={cn("size-10 transition", s <= myRating ? "text-gold-400" : "text-ink-200")} fill="currentColor" strokeWidth={0} />
              </button>
            ))}
          </div>
          <div>
            <label className="label">Titre</label>
            <input className="input" placeholder="Résumez votre expérience" required />
          </div>
          <div>
            <label className="label">Commentaire</label>
            <textarea className="input h-28 py-3" placeholder="Qualité, livraison, conformité…" required />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink-300 p-4 text-sm text-ink-600 hover:bg-ink-50">
            <Camera className="size-5 text-brand-600" /> Ajouter des photos ou une vidéo
            <input type="file" accept="image/*,video/*" multiple className="hidden" />
          </label>
          <Button className="w-full" size="lg" disabled={!myRating}>
            Publier mon avis
          </Button>
        </form>
      </Modal>
    </div>
  );
}
