"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { answerCustomer, type AssistantReply } from "../services/shop-assistant";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

interface Msg extends Partial<AssistantReply> {
  from: "bot" | "me";
  text: string;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => (p.startsWith("**") ? <b key={i}>{p.slice(2, -2)}</b> : <span key={i}>{p}</span>))}</>;
}

export function ShopChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ from: "bot", ...answerCustomer("bonjour") }]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, typing]);

  if (pathname.startsWith("/commande")) return null;

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = /conseiller|humain|whatsapp/i.test(text)
        ? { text: "Je vous mets en relation avec un conseiller sur WhatsApp (7j/7, 8h–21h). Il aura accès à notre échange.", links: [{ label: "Ouvrir WhatsApp", href: "https://wa.me/2250700000000" }] }
        : answerCustomer(text);
      setMsgs((m) => [...m, { from: "bot", ...reply }]);
      setTyping(false);
    }, 650);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn("fixed bottom-[5.5rem] right-4 z-[45] flex items-center gap-2 rounded-full bg-ink-900 p-3.5 text-sm font-semibold text-white shadow-lift transition hover:scale-105 lg:bottom-6 lg:right-6 lg:py-3 lg:pl-3.5 lg:pr-4", (open || pathname.startsWith("/p/") || pathname.startsWith("/panier")) && "max-lg:hidden")}
        aria-label="Assistant"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5 text-gold-400" />}
        <span className="hidden lg:inline">{open ? "Fermer" : "Besoin d'aide ?"}</span>
      </button>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[60] flex h-[80dvh] animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:inset-x-auto sm:right-6 sm:bottom-24 sm:h-[600px] sm:w-[400px] sm:rounded-3xl">
          <div className="flex items-center gap-3 bg-gradient-to-br from-brand-700 to-brand-900 p-4 text-white">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/15">
              <Sparkles className="size-5 text-gold-400" />
            </span>
            <div className="flex-1">
              <p className="font-bold">Awa · Assistante IA</p>
              <p className="flex items-center gap-1.5 text-xs text-brand-100">
                <span className="size-2 rounded-full bg-brand-300" /> En ligne · répond en quelques secondes
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-ink-50 p-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-2", m.from === "me" ? "items-end" : "items-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", m.from === "me" ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-white text-ink-800 shadow-soft")}>
                  <RichText text={m.text} />
                </div>
                {m.products && (
                  <div className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4">
                    {m.products.map((p) => (
                      <Link key={p.id} href={`/p/${p.slug}`} onClick={() => setOpen(false)} className="w-36 shrink-0 rounded-2xl bg-white p-2 shadow-soft">
                        <span className="relative block aspect-square overflow-hidden rounded-xl bg-ink-50">
                          <Image src={p.images[0]} alt={p.name} fill sizes="144px" className="object-contain p-2" />
                        </span>
                        <span className="mt-1.5 line-clamp-2 text-xs font-medium">{p.name}</span>
                        <span className="text-xs font-bold text-brand-700">{formatPrice(p.price)}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {m.links && (
                  <div className="flex flex-wrap gap-2">
                    {m.links.map((l) => (
                      <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-100">
                        {l.label} →
                      </Link>
                    ))}
                  </div>
                )}
                {m.quickReplies && i === msgs.length - 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.quickReplies.map((q) => (
                      <button key={q} onClick={() => send(q)} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-400 hover:text-brand-700">
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex w-16 items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-soft">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-1.5 animate-bounce rounded-full bg-ink-400" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-ink-100 p-3 pb-safe"
          >
            <MessageCircle className="size-5 shrink-0 text-ink-300" />
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écrivez votre message…" className="h-11 min-w-0 flex-1 rounded-xl bg-ink-50 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/30" />
            <button type="submit" className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700" aria-label="Envoyer">
              <Send className="size-[18px]" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
