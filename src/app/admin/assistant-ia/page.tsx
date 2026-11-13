"use client";

import { Bot, Copy, Send, Sparkles, TrendingDown, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  answerMerchant,
  generateDescription,
  generateSeoTitle,
  generateSocialPost,
  priceRecommendations,
  promotionRecommendations,
  salesForecast,
  slowMovers,
  SUGGESTED_QUESTIONS,
  type MerchantAnswer,
} from "@/modules/ai/services/merchant-assistant";
import { getAllProducts } from "@/modules/catalog";
import { stockoutRisk } from "@/modules/inventory";
import { segmentCounts, SEGMENT_META, type CustomerSegment } from "@/modules/crm";
import { useAdminSession } from "@/modules/admin/store/admin-session.store";
import { PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { TrendChart } from "@/shared/ui/charts";
import { toast } from "@/shared/ui/toast";
import { formatNumber, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

interface Msg extends Partial<MerchantAnswer> {
  from: "me" | "ai";
  text: string;
}

function useTypewriter(text: string) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i += 4;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 12);
    return () => clearInterval(id);
  }, [text]);
  return out;
}

function Generated({ text }: { text: string }) {
  const out = useTypewriter(text);
  return (
    <div className="relative rounded-2xl bg-ink-50 p-4">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-800">{out}</pre>
      <button onClick={() => (navigator.clipboard?.writeText(text), toast.success("Copié"))} className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg bg-white text-ink-500 shadow-soft hover:text-ink-900" aria-label="Copier">
        <Copy className="size-4" />
      </button>
    </div>
  );
}

export default function AiAssistantPage() {
  const storeId = useAdminSession((s) => s.storeId);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "ai", text: "Bonjour Melaine 👋 Je suis votre assistant commercial. Posez-moi une question sur vos ventes, votre stock, vos clients ou votre rentabilité.", followUps: SUGGESTED_QUESTIONS }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [tab, setTab] = useState<"previsions" | "recos" | "generateurs" | "segments">("previsions");
  const [genProduct, setGenProduct] = useState(getAllProducts()[86]?.id ?? getAllProducts()[0].id);
  const [genKind, setGenKind] = useState<"description" | "seo" | "social">("description");
  const [genOption, setGenOption] = useState("pro");
  const [genText, setGenText] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, thinking]);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const a = q.includes("bons de commande") ? { text: "3 bons de commande fournisseurs ont été préparés en brouillon (Coton Câlin Distribution, Wax Junior, P'tits Pas). Vous pouvez les valider depuis Stock & inventaire." } : answerMerchant(q, storeId);
      setMsgs((m) => [...m, { from: "ai", ...a }]);
      setThinking(false);
    }, 700);
  };

  const forecast = useMemo(() => salesForecast(30), []);
  const risk = useMemo(() => stockoutRisk(30, storeId).slice(0, 8), [storeId]);
  const product = getAllProducts().find((p) => p.id === genProduct)!;
  const seg = segmentCounts();

  const generate = () => {
    if (genKind === "description") setGenText(generateDescription(product, genOption as "pro"));
    else if (genKind === "seo") setGenText(generateSeoTitle(product).map((t, i) => `${i + 1}. ${t} (${t.length} car.)`).join("\n"));
    else setGenText(generateSocialPost(product, genOption as "facebook"));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Assistant IA" description="Posez vos questions en langage naturel · prévisions · recommandations · génération de contenus" />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <section className="card flex h-[620px] flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-ink-100 bg-gradient-to-r from-ink-900 to-brand-950 px-5 py-3.5 text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-white/10">
              <Bot className="size-5 text-gold-400" />
            </span>
            <div>
              <p className="text-sm font-bold">Assistant commerçant</p>
              <p className="text-xs text-ink-300">Connecté à vos ventes, stocks et clients en temps réel</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-ink-50/60 p-5">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-2", m.from === "me" ? "items-end" : "items-start")}>
                <div className={cn("max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", m.from === "me" ? "rounded-br-md bg-ink-900 text-white" : "rounded-bl-md bg-white text-ink-800 shadow-soft")}>{m.text}</div>
                {m.table && (
                  <div className="w-full max-w-[95%] overflow-x-auto rounded-2xl bg-white shadow-soft">
                    <table className="w-full text-xs">
                      <thead className="bg-ink-50 text-left text-ink-500">
                        <tr>
                          {m.table.headers.map((h) => (
                            <th key={h} className="px-3 py-2 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-100">
                        {m.table.rows.map((r, j) => (
                          <tr key={j}>
                            {r.map((c, k) => (
                              <td key={k} className={cn("px-3 py-2", k === 0 ? "min-w-40 font-medium" : "whitespace-nowrap tabular-nums")}>
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {m.followUps && i === msgs.length - 1 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.followUps.map((q) => (
                      <button key={q} onClick={() => ask(q)} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-400 hover:text-brand-700">
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Sparkles className="size-4 animate-pulse text-gold-500" /> Analyse de vos données…
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-ink-100 p-3"
          >
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ex. Quels sont mes 5 produits les plus rentables ce mois-ci ?" className="input" />
            <button className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700" aria-label="Envoyer">
              <Send className="size-4" />
            </button>
          </form>
        </section>

        <div className="min-w-0">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "previsions", label: "Prévisions" },
              { id: "recos", label: "Recommandations" },
              { id: "generateurs", label: "Générateurs" },
              { id: "segments", label: "Segmentation" },
            ]}
          />
          {tab === "previsions" && (
            <div className="space-y-4">
              <Panel title="Prévision des ventes" subtitle="60 derniers jours + 30 jours prévus (Black Friday inclus)">
                <TrendChart data={forecast as unknown as Record<string, unknown>[]} series={[{ key: "actual", label: "Réel" }, { key: "forecast", label: "Prévision", color: "#2a78d6" }]} format={formatPrice} height={220} />
              </Panel>
              <Panel title="Prévision du stock" subtitle="Ruptures probables sous 30 jours" bodyClassName="pt-2">
                <ul className="divide-y divide-ink-100">
                  {risk.map((r) => (
                    <li key={r.product.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="line-clamp-1">{r.product.name}</span>
                      <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-xs font-bold", r.daysOfCover <= 7 ? "bg-red-50 text-red-700" : r.daysOfCover <= 15 ? "bg-amber-50 text-amber-700" : "bg-ink-100 text-ink-600")}>{r.daysOfCover} j</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}
          {tab === "recos" && (
            <div className="space-y-4">
              <Panel title="Recommandations de promotions" bodyClassName="space-y-2 pt-3">
                {promotionRecommendations().map((r) => (
                  <div key={r.action} className="rounded-xl border border-ink-100 p-3">
                    <p className="text-sm font-semibold">{r.action}</p>
                    <p className="text-xs text-ink-500">{r.target}</p>
                    <p className="mt-1 text-xs font-medium text-brand-700">{r.impact}</p>
                  </div>
                ))}
              </Panel>
              <Panel title="Recommandations de prix" bodyClassName="pt-2">
                <ul className="divide-y divide-ink-100">
                  {priceRecommendations().map((r) => (
                    <li key={r.product.id} className="py-2 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="line-clamp-1 font-medium">{r.product.name}</span>
                        <span className="shrink-0 tabular-nums">
                          <span className="text-ink-400 line-through">{formatPrice(r.product.price)}</span> → <b>{formatPrice(r.suggested)}</b>
                        </span>
                      </div>
                      <p className="text-xs text-ink-500">{r.reason}</p>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title={<span className="flex items-center gap-2"><TrendingDown className="size-4 text-accent-500" /> Produits qui ralentissent</span>} bodyClassName="pt-2">
                <ul className="divide-y divide-ink-100">
                  {slowMovers().slice(0, 6).map((r) => (
                    <li key={r.product.id} className="flex justify-between gap-2 py-2 text-sm">
                      <span className="line-clamp-1">{r.product.name}</span>
                      <span className="shrink-0 text-xs text-ink-500">
                        {r.available} en stock · {r.sold30} vendus / 30 j
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}
          {tab === "generateurs" && (
            <Panel title={<span className="flex items-center gap-2"><Wand2 className="size-4 text-brand-600" /> Génération de contenus</span>} bodyClassName="space-y-4">
              <div>
                <label className="label">Produit</label>
                <select value={genProduct} onChange={(e) => (setGenProduct(e.target.value), setGenText(null))} className="input">
                  {getAllProducts().map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "description", label: "Description produit", opt: "pro" },
                  { id: "seo", label: "Titres SEO", opt: "" },
                  { id: "social", label: "Post réseaux sociaux", opt: "facebook" },
                ].map((k) => (
                  <button key={k.id} onClick={() => (setGenKind(k.id as typeof genKind), setGenOption(k.opt), setGenText(null))} className={cn("rounded-xl border p-2.5 text-xs font-semibold", genKind === k.id ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200")}>
                    {k.label}
                  </button>
                ))}
              </div>
              {genKind !== "seo" && (
                <div className="flex flex-wrap gap-2">
                  {(genKind === "description" ? ["pro", "chaleureux", "court"] : ["facebook", "instagram", "whatsapp"]).map((o) => (
                    <button key={o} onClick={() => setGenOption(o)} className={cn("chip h-8 text-xs capitalize", genOption === o && "chip-active")}>
                      {o}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={generate} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink-900 text-sm font-semibold text-white hover:bg-ink-800">
                <Sparkles className="size-4 text-gold-400" /> Générer
              </button>
              {genText && <Generated text={genText} />}
            </Panel>
          )}
          {tab === "segments" && (
            <Panel title="Segmentation automatique" subtitle="Calculée chaque nuit à partir de la récence, la fréquence et le montant (RFM)" bodyClassName="space-y-2 pt-3">
              {(Object.keys(seg) as CustomerSegment[]).map((s) => (
                <div key={s} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3">
                  <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", SEGMENT_META[s].tone)}>{SEGMENT_META[s].label}</span>
                  <span className="flex-1 text-xs text-ink-500">{SEGMENT_META[s].description}</span>
                  <span className="text-sm font-bold">{formatNumber(seg[s] * 29)}</span>
                </div>
              ))}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
