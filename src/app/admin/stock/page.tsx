"use client";

import Image from "next/image";
import { AlertTriangle, ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Boxes, ChevronDown, ClipboardCheck, PackagePlus, Search, SlidersHorizontal, Truck } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { MOVEMENTS, MOVEMENT_LABEL, stockForStore, type MovementType, type StockMovement, type StockRow } from "@/modules/inventory";
import { STORES, storeName } from "@/modules/stores";
import { getAllProducts } from "@/modules/catalog";
import { useAdminSession } from "@/modules/admin/store/admin-session.store";
import { ExportButton, KpiCard, PageHeader, Tabs } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/sheet";
import { toast } from "@/shared/ui/toast";
import { DEMO_NOW } from "@/shared/lib/clock";
import { formatCompact, formatDateTime, formatNumber, formatPrice } from "@/shared/lib/format";
import { cn, normalize } from "@/shared/lib/utils";

const STATUS: Record<StockRow["status"], { label: string; tone: string }> = {
  ok: { label: "OK", tone: "bg-brand-50 text-brand-700" },
  faible: { label: "Stock faible", tone: "bg-amber-50 text-amber-700" },
  rupture: { label: "Rupture", tone: "bg-red-50 text-red-700" },
  surstock: { label: "Surstock", tone: "bg-sky-50 text-sky-700" },
};
const MV_ICON: Record<MovementType, typeof ArrowUpRight> = { entree: ArrowDownLeft, sortie: ArrowUpRight, ajustement: SlidersHorizontal, transfert: ArrowRightLeft, retour: ArrowDownLeft };

export default function StockPage() {
  const storeId = useAdminSession((s) => s.storeId);
  const rows = useMemo(() => stockForStore(storeId), [storeId]);
  const [tab, setTab] = useState<"etat" | "alertes" | "mouvements" | "inventaire" | "multi">("etat");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [moves, setMoves] = useState<StockMovement[]>(MOVEMENTS);
  const [newMove, setNewMove] = useState(false);
  const [mv, setMv] = useState({ type: "entree" as MovementType, productId: getAllProducts()[0].id, storeId: "entrepot-abidjan", qty: 10, reason: "" });
  const [counts, setCounts] = useState<Record<string, string>>({});

  const filtered = rows.filter((r) => !q || normalize(`${r.product.name} ${r.product.sku}`).includes(normalize(q)));
  const value = rows.reduce((s, r) => s + r.available * r.product.costPrice, 0);
  const alerts = rows.filter((r) => r.status === "rupture" || r.status === "faible");

  return (
    <div>
      <PageHeader
        title="Stock & inventaire"
        description={`${storeId === "all" ? "Tous les emplacements" : storeName(storeId)} · stock en temps réel : disponible, réservé, vendu, entrant`}
        actions={
          <>
            <ExportButton rows={rows.map((r) => ({ sku: r.product.sku, produit: r.product.name, disponible: r.available, reserve: r.reserved, vendu30j: r.sold30, entrant: r.incoming, minimum: r.minimum }))} filename="stock" />
            <Button onClick={() => setNewMove(true)}>
              <PackagePlus className="size-4" /> Mouvement de stock
            </Button>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Valeur du stock (coût)" value={formatPrice(value)} icon={<Boxes className="size-4" />} />
        <KpiCard label="Unités disponibles" value={formatNumber(rows.reduce((s, r) => s + r.available, 0))} tone="ink" hint={`${formatNumber(rows.reduce((s, r) => s + r.reserved, 0))} réservées`} />
        <KpiCard label="Ruptures" value={String(rows.filter((r) => r.status === "rupture").length)} tone="accent" icon={<AlertTriangle className="size-4" />} />
        <KpiCard label="Stock faible" value={String(rows.filter((r) => r.status === "faible").length)} tone="gold" />
        <KpiCard label="Stock entrant" value={formatNumber(rows.reduce((s, r) => s + r.incoming, 0))} tone="ink" icon={<Truck className="size-4" />} hint="commandes fournisseurs" />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "etat", label: "État du stock" },
          { id: "alertes", label: <>Alertes <span className="ml-1 rounded-full bg-red-100 px-1.5 text-[11px] text-red-700">{alerts.length}</span></> },
          { id: "mouvements", label: "Entrées / sorties / ajustements" },
          { id: "inventaire", label: "Inventaire" },
          { id: "multi", label: "Multi-stock" },
        ]}
      />

      {(tab === "etat" || tab === "inventaire") && (
        <label className="relative mb-3 block w-fit">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Produit ou référence…" className="input h-10 w-72 pl-9" />
        </label>
      )}

      {tab === "etat" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3 text-right">Disponible</th>
                <th className="px-4 py-3 text-right">Réservé</th>
                <th className="px-4 py-3 text-right">Vendu (30 j)</th>
                <th className="px-4 py-3 text-right">Entrant</th>
                <th className="px-4 py-3 text-right">Minimum</th>
                <th className="px-4 py-3 text-right">Couverture</th>
                <th className="px-4 py-3">Statut</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((r) => (
                <Fragment key={r.product.id}>
                  <tr className="hover:bg-ink-50/60">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                          <Image src={r.product.images[0]} alt="" fill sizes="36px" className="object-contain p-0.5" />
                        </span>
                        <span>
                          <span className="line-clamp-1 font-medium">{r.product.name}</span>
                          <span className="text-xs text-ink-400">{r.product.sku}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-base font-bold tabular-nums">{r.available}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{r.reserved}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{r.sold30}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-sky-700">{r.incoming ? `+${r.incoming}` : "—"}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-400">{r.minimum}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{r.available === 0 ? "—" : r.daysOfCover >= 999 ? "∞" : `${r.daysOfCover} j`}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS[r.status].tone)}>{STATUS[r.status].label}</span>
                    </td>
                    <td className="pr-3">
                      {storeId === "all" && (
                        <button onClick={() => setOpen(open === r.product.id ? null : r.product.id)} className="grid size-8 place-items-center rounded-lg hover:bg-ink-100" aria-label="Détail par emplacement">
                          <ChevronDown className={cn("size-4 transition", open === r.product.id && "rotate-180")} />
                        </button>
                      )}
                    </td>
                  </tr>
                  {open === r.product.id && (
                    <tr className="bg-ink-50/70">
                      <td colSpan={9} className="px-4 py-3">
                        <div className="grid gap-2 sm:grid-cols-5">
                          {r.levels.map((l) => (
                            <div key={l.storeId} className="rounded-xl bg-white p-3 text-xs ring-1 ring-ink-100">
                              <p className="font-semibold text-ink-800">{storeName(l.storeId)}</p>
                              <p className="mt-1 text-ink-500">
                                Dispo <b className="text-ink-900">{l.available}</b> · Réservé {l.reserved}
                              </p>
                              <p className="text-ink-500">
                                Vendu 30 j {l.sold30} · Entrant {l.incoming}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "alertes" && (
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((r) => (
            <div key={r.product.id} className="card flex items-center gap-3 p-4">
              <span className={cn("grid size-10 place-items-center rounded-xl", r.status === "rupture" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600")}>
                <AlertTriangle className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">{r.product.name}</p>
                <p className="text-xs text-ink-500">
                  {r.status === "rupture" ? "Rupture" : `Plus que ${r.available} unité(s)`} · minimum {r.minimum} {r.incoming ? `· ${r.incoming} en commande` : ""}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success("Bon de commande fournisseur créé", { description: `${Math.max(r.minimum * 4, 10)} × ${r.product.name}` })}>
                Réapprovisionner
              </Button>
            </div>
          ))}
        </div>
      )}

      {tab === "mouvements" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Emplacement</th>
                <th className="px-4 py-3 text-right">Quantité</th>
                <th className="px-4 py-3">Motif</th>
                <th className="px-4 py-3">Par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {moves
                .filter((m) => storeId === "all" || m.storeId === storeId)
                .map((m) => {
                  const I = MV_ICON[m.type];
                  return (
                    <tr key={m.id}>
                      <td className="px-4 py-2.5 text-xs text-ink-500">{formatDateTime(m.at)}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <I className={cn("size-3.5", m.qty > 0 ? "text-brand-600" : "text-accent-600")} /> {MOVEMENT_LABEL[m.type]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{m.productName}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-600">{storeName(m.storeId)}</td>
                      <td className={cn("px-4 py-2.5 text-right font-bold tabular-nums", m.qty > 0 ? "text-brand-700" : "text-accent-600")}>
                        {m.qty > 0 ? "+" : ""}
                        {m.qty}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-ink-600">{m.reason}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-500">{m.by}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "inventaire" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
            <ClipboardCheck className="size-5" />
            <span className="flex-1">Saisissez les quantités comptées : les écarts sont calculés automatiquement puis enregistrés comme ajustements.</span>
            <Button
              size="sm"
              onClick={() => {
                const n = Object.keys(counts).length;
                toast.success("Inventaire validé", { description: `${n} ajustement(s) enregistré(s) dans l'historique du stock` });
                setCounts({});
              }}
            >
              Valider l&apos;inventaire
            </Button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3 text-right">Théorique</th>
                  <th className="px-4 py-3">Compté</th>
                  <th className="px-4 py-3 text-right">Écart</th>
                  <th className="px-4 py-3 text-right">Valeur écart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.slice(0, 40).map((r) => {
                  const c = counts[r.product.id];
                  const diff = c === undefined || c === "" ? null : Number(c) - r.available;
                  return (
                    <tr key={r.product.id}>
                      <td className="px-4 py-2">{r.product.name}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{r.available}</td>
                      <td className="px-4 py-2">
                        <input value={c ?? ""} onChange={(e) => setCounts({ ...counts, [r.product.id]: e.target.value.replace(/\D/g, "") })} className="input h-9 w-24" inputMode="numeric" placeholder="—" />
                      </td>
                      <td className={cn("px-4 py-2 text-right font-bold tabular-nums", diff == null ? "text-ink-300" : diff < 0 ? "text-red-600" : diff > 0 ? "text-brand-700" : "text-ink-500")}>{diff == null ? "—" : diff > 0 ? `+${diff}` : diff}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-ink-600">{diff == null ? "—" : formatPrice(diff * r.product.costPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "multi" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Produit</th>
                {STORES.map((s) => (
                  <th key={s.id} className="px-3 py-3 text-right">
                    {s.name.replace("Boutique ", "").replace("Entrepôt ", "Ent. ")}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {stockForStore("all")
                .slice(0, 40)
                .map((r) => (
                  <tr key={r.product.id}>
                    <td className="px-4 py-2">{r.product.name}</td>
                    {r.levels.map((l) => (
                      <td key={l.storeId} className={cn("px-3 py-2 text-right tabular-nums", l.available === 0 ? "text-red-500" : l.available <= l.minimum ? "font-semibold text-amber-600" : "")}>
                        {l.available}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-bold tabular-nums">{r.available}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="border-t border-ink-100 px-4 py-3 text-xs text-ink-500">Valeur totale : {formatCompact(value)} FCFA · chaque emplacement est géré séparément (stock, réservations, transferts).</p>
        </div>
      )}

      <Modal open={newMove} onClose={() => setNewMove(false)} title="Nouveau mouvement de stock">
        <form
          className="space-y-3 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const p = getAllProducts().find((x) => x.id === mv.productId)!;
            const qty = mv.type === "sortie" ? -Math.abs(mv.qty) : mv.qty;
            setMoves([{ id: `mv-new-${moves.length}`, at: DEMO_NOW.toISOString(), type: mv.type, productId: p.id, productName: p.name, storeId: mv.storeId, qty, reason: mv.reason || MOVEMENT_LABEL[mv.type], by: "Melaine" }, ...moves]);
            setNewMove(false);
            setTab("mouvements");
            toast.success("Mouvement enregistré", { description: `${qty > 0 ? "+" : ""}${qty} × ${p.name}` });
          }}
        >
          <div className="grid grid-cols-4 gap-2">
            {(["entree", "sortie", "ajustement", "transfert"] as MovementType[]).map((t) => (
              <button type="button" key={t} onClick={() => setMv({ ...mv, type: t })} className={cn("rounded-xl border p-2 text-xs font-semibold", mv.type === t ? "border-brand-600 bg-brand-50 text-brand-800" : "border-ink-200")}>
                {MOVEMENT_LABEL[t]}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Produit</label>
            <select className="input" value={mv.productId} onChange={(e) => setMv({ ...mv, productId: e.target.value })}>
              {getAllProducts().map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Emplacement</label>
              <select className="input" value={mv.storeId} onChange={(e) => setMv({ ...mv, storeId: e.target.value })}>
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Quantité</label>
              <input className="input" type="number" value={mv.qty} onChange={(e) => setMv({ ...mv, qty: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="label">Motif</label>
            <input className="input" value={mv.reason} onChange={(e) => setMv({ ...mv, reason: e.target.value })} placeholder="Ex. réception fournisseur BL-F2026-120" />
          </div>
          <Button className="w-full">Enregistrer</Button>
        </form>
      </Modal>
    </div>
  );
}
