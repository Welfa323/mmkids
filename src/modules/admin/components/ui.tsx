"use client";

import { ArrowDownRight, ArrowUpRight, CalendarRange, Download } from "lucide-react";
import { useState } from "react";
import { PERIODS, type PeriodKey, type PeriodRange } from "@/modules/analytics";
import { cn } from "@/shared/lib/utils";
import { formatNumber, formatPercent } from "@/shared/lib/format";
import { toast } from "@/shared/ui/toast";

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, actions, children, className, bodyClassName }: { title?: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("card min-w-0", className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-2 px-5 pt-4">
          <div>
            {title && <h2 className="font-bold text-ink-900">{title}</h2>}
            {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Tuile KPI : chiffre principal + variation vs période précédente */
export function KpiCard({ label, value, delta, hint, icon, tone = "brand", invert }: { label: string; value: React.ReactNode; delta?: number; hint?: string; icon?: React.ReactNode; tone?: "brand" | "accent" | "gold" | "ink"; invert?: boolean }) {
  const up = (delta ?? 0) >= 0;
  const good = invert ? !up : up;
  return (
    <div className="card flex min-w-0 flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-bold uppercase tracking-wider text-ink-500">{label}</p>
        {icon && (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", tone === "brand" ? "bg-brand-50 text-brand-700" : tone === "accent" ? "bg-accent-50 text-accent-600" : tone === "gold" ? "bg-gold-50 text-gold-600" : "bg-ink-100 text-ink-600")}>{icon}</span>
        )}
      </div>
      <p className="text-xl font-extrabold leading-tight tracking-tight text-ink-900 [overflow-wrap:anywhere] 2xl:text-2xl">{value}</p>
      {delta != null && Number.isFinite(delta) ? (
        <p className="flex min-w-0 items-center gap-1.5 text-xs">
          <span className={cn("inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 font-bold", good ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-700")}>
            {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {up ? "+" : ""}
            {formatPercent(delta)}
          </span>
          <span className="truncate text-ink-400">{hint ?? "vs période préc."}</span>
        </p>
      ) : (
        hint && <p className="text-xs text-ink-400">{hint}</p>
      )}
    </div>
  );
}

export function PeriodPicker({ value, onChange, custom, onCustom }: { value: PeriodKey; onChange: (p: PeriodKey) => void; custom?: PeriodRange; onCustom?: (r: PeriodRange) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="no-scrollbar flex max-w-full overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-ink-200">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => onChange(p.key)} className={cn("h-8 shrink-0 rounded-lg px-3 text-xs font-semibold transition", value === p.key ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-100")}>
            {p.label}
          </button>
        ))}
      </div>
      {value === "perso" && custom && onCustom && (
        <div className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-1 ring-1 ring-ink-200">
          <CalendarRange className="size-4 text-ink-400" />
          <input type="date" value={custom.from} max={custom.to} onChange={(e) => onCustom({ ...custom, from: e.target.value })} className="h-7 text-xs outline-none" />
          <span className="text-ink-300">→</span>
          <input type="date" value={custom.to} min={custom.from} max="2026-10-26" onChange={(e) => onCustom({ ...custom, to: e.target.value })} className="h-7 text-xs outline-none" />
        </div>
      )}
    </div>
  );
}

export function ExportButton({ label = "Exporter", rows, filename = "export" }: { label?: string; rows?: Record<string, unknown>[]; filename?: string }) {
  return (
    <button
      onClick={() => {
        if (rows?.length) {
          const headers = Object.keys(rows[0]);
          const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n");
          const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
        toast.success("Export généré", { description: rows?.length ? `${formatNumber(rows.length)} lignes (CSV)` : "Le fichier sera envoyé par email." });
      }}
      className="flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
    >
      <Download className="size-4" /> {label}
    </button>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: React.ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b border-ink-200">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={cn("-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition", value === t.id ? "border-brand-600 text-brand-800" : "border-transparent text-ink-500 hover:text-ink-800")}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input h-10 w-full sm:w-72" />;
}

export function usePeriod(initial: PeriodKey = "aujourdhui") {
  const [period, setPeriod] = useState<PeriodKey>(initial);
  const [custom, setCustom] = useState<PeriodRange>({ from: "2026-10-01", to: "2026-10-26" });
  return { period, setPeriod, custom, setCustom };
}
