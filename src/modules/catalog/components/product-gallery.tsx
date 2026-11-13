"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Play, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/lib/utils";

type Media = { type: "image"; src: string } | { type: "video"; src: string; poster: string };

export function ProductGallery({ images, video, name, badge }: { images: string[]; video?: string; name: string; badge?: React.ReactNode }) {
  const media: Media[] = [...images.map((src) => ({ type: "image" as const, src })), ...(video ? [{ type: "video" as const, src: video, poster: images[0] }] : [])];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const touch = useRef<number | null>(null);
  const current = media[index];
  const go = (d: number) => setIndex((i) => (i + d + media.length) % media.length);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox]);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {/* Vignettes */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto lg:max-h-[520px] lg:w-20 lg:flex-col lg:overflow-y-auto">
        {media.map((m, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            onMouseEnter={() => setIndex(i)}
            className={cn("relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition lg:size-20", i === index ? "border-brand-500" : "border-ink-100 hover:border-ink-300")}
            aria-label={m.type === "video" ? "Vidéo du produit" : `Photo ${i + 1}`}
          >
            <Image src={m.type === "video" ? m.poster : m.src} alt="" fill sizes="80px" className="object-contain p-1.5" />
            {m.type === "video" && (
              <span className="absolute inset-0 grid place-items-center bg-ink-900/40">
                <Play className="size-6 text-white" fill="currentColor" />
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Visuel principal */}
      <div
        className="relative aspect-square flex-1 overflow-hidden rounded-3xl border border-ink-100 bg-white"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        {current.type === "image" ? (
          <button
            className="absolute inset-0 cursor-zoom-in"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
            onClick={() => setLightbox(true)}
            aria-label="Agrandir l'image"
          >
            <Image
              src={current.src}
              alt={name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-contain p-6 transition-transform duration-200 ease-out sm:p-10"
              style={zoom ? { transform: "scale(2.2)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </button>
        ) : (
          <video src={current.src} poster={current.poster} controls autoPlay muted playsInline className="absolute inset-0 size-full bg-ink-950 object-contain" />
        )}
        <div className="pointer-events-none absolute left-4 top-4">{badge}</div>
        {current.type === "image" && (
          <span className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink-600 shadow-soft lg:flex">
            <ZoomIn className="size-3.5" /> Survolez pour zoomer · cliquez pour agrandir
          </span>
        )}
        <button onClick={() => setLightbox(true)} className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-ink-700 shadow-soft lg:hidden" aria-label="Plein écran">
          <Expand className="size-4" />
        </button>
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
            {media.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-brand-600" : "w-1.5 bg-ink-300")} />
            ))}
          </div>
        )}
      </div>

      {lightbox &&
        createPortal(
          <div className="fixed inset-0 z-[95] flex animate-fade-in flex-col bg-white">
            <div className="flex items-center justify-between p-4">
              <p className="text-sm font-medium text-ink-500">
                {index + 1} / {media.length}
              </p>
              <button onClick={() => setLightbox(false)} className="grid size-11 place-items-center rounded-full bg-ink-100" aria-label="Fermer">
                <X className="size-5" />
              </button>
            </div>
            <div className="relative flex-1">
              {current.type === "image" ? (
                <Image src={current.src} alt={name} fill sizes="100vw" className="object-contain p-4" />
              ) : (
                <video src={current.src} controls autoPlay className="absolute inset-0 size-full object-contain" />
              )}
              <button onClick={() => go(-1)} className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lift" aria-label="Précédent">
                <ChevronLeft />
              </button>
              <button onClick={() => go(1)} className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lift" aria-label="Suivant">
                <ChevronRight />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
