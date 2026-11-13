"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
  images: string[];
  badge?: string;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 5500);
    return () => clearInterval(id);
  }, [paused, slides.length]);
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);

  return (
    <div
      className="relative h-full min-h-[220px] overflow-hidden rounded-3xl sm:min-h-[300px] lg:min-h-[380px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      {slides.map((s, idx) => (
        <Link
          key={s.id}
          href={s.href}
          aria-hidden={idx !== i}
          tabIndex={idx === i ? 0 : -1}
          className={cn("absolute inset-0 flex items-center bg-gradient-to-br transition-opacity duration-700", s.bg, idx === i ? "opacity-100" : "pointer-events-none opacity-0")}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-96 rounded-full bg-black/10 blur-3xl" />
          <div className="relative z-10 flex w-full items-center gap-4 p-5 sm:p-10">
            <div className={cn("max-w-[58%] text-white transition-all duration-700 sm:max-w-md", idx === i ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
              <p className="mb-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur sm:text-xs">{s.eyebrow}</p>
              <h2 className="text-balance text-xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.6rem]">{s.title}</h2>
              <p className="mt-2 hidden text-sm text-white/85 sm:block sm:text-base">{s.subtitle}</p>
              <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-ink-900 shadow-lift transition hover:gap-3 sm:mt-6 sm:h-12 sm:px-5">
                {s.cta} <ArrowRight className="size-4" />
              </span>
            </div>
            <div className="relative ml-auto h-36 w-[42%] sm:h-64 sm:w-[46%]">
              {s.images.slice(0, 3).map((img, k) => (
                <div
                  key={img}
                  className={cn(
                    "absolute overflow-hidden rounded-2xl bg-white shadow-lift transition-all duration-700 sm:rounded-3xl",
                    k === 0 && "right-0 top-1/2 size-28 -translate-y-1/2 sm:size-56",
                    k === 1 && "bottom-0 left-0 hidden size-28 -rotate-6 sm:block",
                    k === 2 && "right-[58%] top-0 hidden size-24 rotate-6 lg:block",
                    idx === i ? "opacity-100" : "opacity-0",
                  )}
                >
                  <Image src={img} alt="" fill sizes="(max-width: 640px) 112px, 224px" className="object-contain p-3" priority={idx === 0 && k === 0} />
                </div>
              ))}
              {s.badge && <span className="absolute -top-1 right-0 z-10 rounded-full bg-gold-400 px-2.5 py-1 text-xs font-extrabold text-ink-900 shadow-lift sm:right-4 sm:top-2 sm:text-sm">{s.badge}</span>}
            </div>
          </div>
        </Link>
      ))}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, idx) => (
          <button key={s.id} onClick={() => setI(idx)} className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-6 bg-white" : "w-1.5 bg-white/50")} aria-label={`Diapositive ${idx + 1}`} />
        ))}
      </div>
      <button onClick={() => go(-1)} className="absolute left-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:grid" aria-label="Précédent">
        <ChevronLeft className="size-5" />
      </button>
      <button onClick={() => go(1)} className="absolute right-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 sm:grid" aria-label="Suivant">
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
