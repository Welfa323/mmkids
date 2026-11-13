"use client";

import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { buildDocuments, DOCUMENT_META, taxBreakdown, type DocumentType } from "@/modules/billing";
import { ExportButton, KpiCard, PageHeader, Panel, Tabs } from "@/modules/admin/components/ui";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/misc";
import { toast } from "@/shared/ui/toast";
import { SITE } from "@/shared/lib/site";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { cn, normalize } from "@/shared/lib/utils";

const STATUS_TONE = { emis: "bg-ink-100 text-ink-600", envoye: "bg-sky-50 text-sky-700", paye: "bg-brand-50 text-brand-700", annule: "bg-red-50 text-red-700" };
const STATUS_LABEL = { emis: "Émis", envoye: "Envoyé", paye: "Payé", annule: "Annulé" };

export default function BillingPage() {
  const docs = useMemo(() => buildDocuments(), []);
  const [tab, setTab] = useState<"documents" | "parametres">("documents");
  const [type, setType] = useState<DocumentType | "">("");
  const [q, setQ] = useState("");
  const shown = docs.filter((d) => (!type || d.type === type) && (!q || normalize(`${d.number} ${d.orderNumber} ${d.customer}`).includes(normalize(q))));
  const invoiced = docs.filter((d) => d.type === "facture").reduce((s, d) => s + d.amount, 0);
  const tax = taxBreakdown(invoiced);

  return (
    <div>
      <PageHeader title="Facturation" description="Factures automatiques, numérotation, avoirs et informations fiscales" actions={<ExportButton rows={shown.map((d) => ({ numero: d.number, type: DOCUMENT_META[d.type].label, commande: d.orderNumber, client: d.customer, montant: d.amount, date: d.date }))} filename="documents" />} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Facturé TTC" value={formatPrice(tax.ttc)} />
        <KpiCard label="Total HT" value={formatPrice(tax.ht)} tone="ink" />
        <KpiCard label="TVA collectée (18 %)" value={formatPrice(tax.tva)} tone="gold" />
        <KpiCard label="Avoirs émis" value={formatPrice(Math.abs(docs.filter((d) => d.type === "avoir").reduce((s, d) => s + d.amount, 0)))} tone="accent" />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "documents", label: "Historique des documents" }, { id: "parametres", label: "Numérotation & informations fiscales" }]} />

      {tab === "documents" ? (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N° document, commande, client…" className="input h-10 w-72 pl-9" />
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setType("")} className={cn("chip h-10", !type && "chip-active")}>
                Tous
              </button>
              {(Object.keys(DOCUMENT_META) as DocumentType[]).map((t) => (
                <button key={t} onClick={() => setType(t)} className={cn("chip h-10", type === t && "chip-active")}>
                  {DOCUMENT_META[t].label}
                </button>
              ))}
            </div>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {shown.slice(0, 60).map((d) => (
                  <tr key={d.id} className="hover:bg-ink-50/60">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold">{d.number}</td>
                    <td className="px-4 py-2.5">{DOCUMENT_META[d.type].label}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{d.orderNumber}</td>
                    <td className="px-4 py-2.5">{d.customer}</td>
                    <td className="px-4 py-2.5 text-ink-500">{formatDate(d.date)}</td>
                    <td className={cn("px-4 py-2.5 text-right font-semibold tabular-nums", d.amount < 0 && "text-red-600")}>{formatPrice(d.amount)}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_TONE[d.status])}>{STATUS_LABEL[d.status]}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/facture/${d.orderNumber}?type=${d.type}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                        <FileText className="size-3.5" /> PDF
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Numérotation automatique">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-ink-100">
                {(Object.keys(DOCUMENT_META) as DocumentType[]).map((t) => (
                  <tr key={t}>
                    <td className="py-2.5">{DOCUMENT_META[t].label}</td>
                    <td className="py-2.5 font-mono text-xs text-ink-600">
                      {DOCUMENT_META[t].prefix}-AAAA-NNNN
                    </td>
                    <td className="py-2.5 text-right text-xs text-ink-400">prochain : {DOCUMENT_META[t].prefix}-2026-8018</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 space-y-3 border-t border-ink-100 pt-4 text-sm">
              {["Générer la facture automatiquement au paiement", "Envoyer la facture PDF par email", "Joindre le bon de livraison au colis", "Émettre un avoir à chaque remboursement"].map((l) => (
                <div key={l} className="flex items-center justify-between gap-3">
                  <span>{l}</span>
                  <Switch checked onChange={() => toast.info("Paramètre enregistré")} label={l} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Informations fiscales">
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Informations fiscales enregistrées");
              }}
            >
              {[
                ["Raison sociale", SITE.legal.company],
                ["RCCM", SITE.legal.rccm],
                ["N° compte contribuable (NCC)", SITE.legal.ncc],
                ["Régime d'imposition", "Réel normal d'imposition (RNI)"],
                ["Taux de TVA", "18 %"],
                ["Adresse du siège", SITE.address],
                ["Mentions de pied de facture", "Capital 10 000 000 FCFA — Paiement à réception"],
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="label">{label}</label>
                  <input className="input h-10" defaultValue={value} />
                </div>
              ))}
              <Button className="mt-1">Enregistrer</Button>
            </form>
          </Panel>
        </div>
      )}
    </div>
  );
}
