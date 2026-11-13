"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Hash, Search, Sparkles, Tag, TrendingUp, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSuggestions, TRENDING_SEARCHES } from "../services/search.service";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const RECENT_KEY = "mmk-recent-searches";

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveRecent(q: string) {
  try {
    const list = [q, ...readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {}
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const i = norm(text).indexOf(norm(q));
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-brand-100 px-0.5 text-brand-900">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Results({ query, onGo, activeIndex }: { query: string; onGo: (href: string, term?: string) => void; activeIndex: number }) {
  const deferred = useDeferredValue(query);
  const s = useMemo(() => getSuggestions(deferred), [deferred]);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    setRecent(readRecent());
  }, []);

  if (!deferred.trim()) {
    return (
      <div className="space-y-5 p-4">
        {recent.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400">Recherches récentes</p>
              <button
                className="text-xs font-medium text-ink-500 hover:text-ink-800"
                onClick={() => {
                  localStorage.removeItem(RECENT_KEY);
                  setRecent([]);
                }}
              >
                Effacer
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button key={r} onClick={() => onGo(`/recherche?q=${encodeURIComponent(r)}`, r)} className="chip h-8 text-xs">
                  <Clock className="size-3.5 text-ink-400" /> {r}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-400">Tendances à Abidjan</p>
          <div className="flex flex-wrap gap-2">
            {TRENDING_SEARCHES.map((t) => (
              <button key={t} onClick={() => onGo(`/recherche?q=${encodeURIComponent(t)}`, t)} className="chip h-8 text-xs">
                <TrendingUp className="size-3.5 text-brand-600" /> {t}
              </button>
            ))}
          </div>
        </div>
        <p className="flex items-center gap-1.5 rounded-xl bg-ink-50 px-3 py-2 text-xs text-ink-500">
          <Hash className="size-3.5" /> Astuce : tapez une référence (ex. <b className="font-semibold text-ink-700">MK-FIL-1019</b>) pour accéder directement au produit.
        </p>
      </div>
    );
  }

  const total = s.products.length;
  return (
    <div className="divide-y divide-ink-100">
      {s.fuzzy && s.didYouMean && (
        <p className="flex items-center gap-2 px-4 py-2.5 text-xs text-ink-500">
          <Sparkles className="size-3.5 text-accent-500" /> Résultats approchants pour «&nbsp;{deferred}&nbsp;» — vouliez-vous dire <b className="text-ink-800">{s.didYouMean}</b> ?
        </p>
      )}
      {(s.categories.length > 0 || s.brands.length > 0) && (
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {s.categories.map((c) => (
            <button key={`${c.slug}-${c.sub}`} onClick={() => onGo(c.sub ? `/c/${c.slug}?sous=${c.sub}` : `/c/${c.slug}`)} className="chip h-8 text-xs">
              <Tag className="size-3.5 text-brand-600" /> {c.subName ?? c.name}
              {c.subName && <span className="text-ink-400">· {c.name}</span>}
            </button>
          ))}
          {s.brands.map((b) => (
            <button key={b.slug} onClick={() => onGo(`/marque/${b.slug}`)} className="chip h-8 text-xs">
              Marque <b className="font-semibold">{b.name}</b> <span className="text-ink-400">({b.productCount})</span>
            </button>
          ))}
        </div>
      )}
      {total > 0 ? (
        <ul className="py-1.5">
          {s.products.map((p, i) => (
            <li key={p.id}>
              <button
                onClick={() => onGo(`/p/${p.slug}`, deferred)}
                className={cn("flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-ink-50", activeIndex === i && "bg-brand-50")}
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                  <Image src={p.images[0]} alt="" fill sizes="48px" className="object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium text-ink-800">
                    <Highlight text={p.name} query={deferred} />
                  </span>
                  <span className="text-xs text-ink-400">
                    {p.brandName} · {p.sku}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-bold text-ink-900">{formatPrice(p.price)}</span>
                  {p.discountPct && <span className="text-[11px] font-semibold text-accent-600">−{p.discountPct}%</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-ink-500">
          Aucun produit pour «&nbsp;{deferred}&nbsp;». Essayez un autre mot-clé ou une marque.
        </div>
      )}
      {total > 0 && (
        <button onClick={() => onGo(`/recherche?q=${encodeURIComponent(deferred)}`, deferred)} className={cn("flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50", activeIndex === total && "bg-brand-50")}>
          Voir tous les résultats pour «&nbsp;{deferred}&nbsp;»
          <ArrowUpRight className="size-4" />
        </button>
      )}
    </div>
  );
}

export function SearchBox({ className, initialQuery = "", variant }: { className?: string; initialQuery?: string; variant: "desktop" | "mobile" }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => mobileInput.current?.focus(), 50);
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileOpen]);

  const go = (href: string, term?: string) => {
    if (term) saveRecent(term);
    setOpen(false);
    setMobileOpen(false);
    setActive(-1);
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    if (active >= 0) {
      const sugg = getSuggestions(q);
      if (active < sugg.products.length) return go(`/p/${sugg.products[active].slug}`, q);
    }
    go(`/recherche?q=${encodeURIComponent(q.trim())}`, q.trim());
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = getSuggestions(q).products.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(n, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(-1, a - 1));
    } else if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      {/* Desktop */}
      {variant === "desktop" && (
      <div ref={wrapRef} className={cn("relative", className)}>
        <form onSubmit={submit} role="search">
          <label className="group flex h-12 items-center gap-2 rounded-2xl border border-ink-200 bg-ink-50 pl-4 pr-1.5 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-500/15">
            <Search className="size-5 shrink-0 text-ink-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setActive(-1);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Rechercher un produit, une marque, une référence…"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
              aria-label="Rechercher"
              autoComplete="off"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="grid size-7 place-items-center rounded-full text-ink-400 hover:bg-ink-100" aria-label="Effacer">
                <X className="size-4" />
              </button>
            )}
            <button type="submit" className="h-9 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
              Rechercher
            </button>
          </label>
        </form>
        {open && (
          <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] animate-slide-up overflow-y-auto rounded-2xl border border-ink-100 bg-white shadow-lift">
            <Results query={q} onGo={go} activeIndex={active} />
          </div>
        )}
      </div>
      )}

      {/* Mobile : faux champ qui ouvre une recherche plein écran */}
      {variant === "mobile" && (
      <button onClick={() => setMobileOpen(true)} className={cn("flex h-11 w-full items-center gap-2 rounded-2xl border border-ink-200 bg-ink-50 px-3.5 text-left text-sm text-ink-400", className)}>
        <Search className="size-[18px]" />
        <span className="truncate">{q || "Rechercher sur MMKids"}</span>
      </button>
      )}
      {mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-[85] flex animate-fade-in flex-col bg-white lg:hidden">
            <form onSubmit={submit} className="flex items-center gap-2 border-b border-ink-100 p-3" role="search">
              <button type="button" onClick={() => setMobileOpen(false)} className="grid size-10 place-items-center rounded-full text-ink-600 hover:bg-ink-100" aria-label="Retour">
                <ArrowLeft className="size-5" />
              </button>
              <label className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-brand-500 bg-white px-3 ring-4 ring-brand-500/15">
                <Search className="size-[18px] text-ink-400" />
                <input
                  ref={mobileInput}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Produit, marque, référence…"
                  className="h-full min-w-0 flex-1 bg-transparent text-base outline-none"
                  enterKeyHint="search"
                  autoComplete="off"
                />
                {q && (
                  <button type="button" onClick={() => setQ("")} aria-label="Effacer">
                    <X className="size-4 text-ink-400" />
                  </button>
                )}
              </label>
            </form>
            <div className="flex-1 overflow-y-auto">
              <Results query={q} onGo={go} activeIndex={-1} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

