"use client";

/**
 * Graphiques (recharts) — palette validée (CVD) : vert marque, bleu, orange.
 * Marques fines, grille discrète, info-bulle au survol, légende dès 2 séries.
 */
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart } from "recharts";
import { formatCompact, formatNumber } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export const SERIES_COLORS = ["#0c805e", "#2a78d6", "#eb6834"] as const;
const GRID = "#eceef2";
const AXIS = "#8c95a6";
const PREVIOUS = "#b8bfcb";

export interface SeriesDef {
  key: string;
  label: string;
  color?: string;
  /** série de référence (période précédente) : pointillés gris */
  reference?: boolean;
}

type Fmt = (v: number) => string;

interface TooltipPayloadItem {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
}

function ChartTooltip({ active, payload, label, format }: { active?: boolean; payload?: readonly TooltipPayloadItem[]; label?: string | number; format: Fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-xl border border-ink-100 bg-white px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-semibold text-ink-900">{label}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex items-center justify-between gap-4 text-ink-600">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: p.color }} /> {p.name}
          </span>
          <span className="font-semibold tabular-nums text-ink-900">{typeof p.value === "number" ? format(p.value) : "—"}</span>
        </p>
      ))}
    </div>
  );
}

export function Legend({ series }: { series: SeriesDef[] }) {
  if (series.length < 2) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600">
      {series.map((s, i) => (
        <span key={s.key} className="flex items-center gap-1.5">
          {s.reference ? <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: PREVIOUS }} /> : <span className="h-0.5 w-4 rounded-full" style={{ background: s.color ?? SERIES_COLORS[i] }} />}
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function TrendChart({ data, xKey = "label", series, height = 260, format = (v) => formatNumber(v), axisFormat = formatCompact }: { data: Record<string, unknown>[]; xKey?: string; series: SeriesDef[]; height?: number; format?: Fmt; axisFormat?: Fmt }) {
  const main = series.filter((s) => !s.reference);
  const ref = series.filter((s) => s.reference);
  return (
    <div>
      <Legend series={series} />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {main.map((s, i) => (
                <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color ?? SERIES_COLORS[i]} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={s.color ?? SERIES_COLORS[i]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} minTickGap={18} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={(v: number) => axisFormat(v)} width={64} />
            <Tooltip content={(p) => <ChartTooltip active={p.active} payload={p.payload as readonly TooltipPayloadItem[]} label={p.label as string} format={format} />} cursor={{ stroke: AXIS, strokeDasharray: "3 3" }} />
            {ref.map((s) => (
              <Line key={s.key} dataKey={s.key} name={s.label} stroke={PREVIOUS} strokeWidth={2} strokeDasharray="5 4" dot={false} type="monotone" isAnimationActive={false} />
            ))}
            {main.map((s, i) => (
              <Area key={s.key} dataKey={s.key} name={s.label} stroke={s.color ?? SERIES_COLORS[i]} strokeWidth={2} fill={`url(#fill-${s.key})`} type="monotone" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }} />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ColumnChart({ data, xKey = "label", series, height = 240, format = (v) => formatNumber(v), axisFormat = formatCompact }: { data: Record<string, unknown>[]; xKey?: string; series: SeriesDef[]; height?: number; format?: Fmt; axisFormat?: Fmt }) {
  return (
    <div>
      <Legend series={series} />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} interval="preserveStartEnd" minTickGap={8} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={(v: number) => axisFormat(v)} width={64} />
            <Tooltip content={(p) => <ChartTooltip active={p.active} payload={p.payload as readonly TooltipPayloadItem[]} label={p.label as string} format={format} />} cursor={{ fill: "#f6f7f9" }} />
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? SERIES_COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={36} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Sparkline({ data, color = SERIES_COLORS[0], height = 40 }: { data: number[]; color?: string; height?: number }) {
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color.slice(1)})`} type="monotone" dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Barres horizontales en HTML : libellés et valeurs directement lisibles, une seule teinte (magnitude) */
export function BarList({ items, format = (v) => formatNumber(v), color = SERIES_COLORS[0], className, max }: { items: { label: React.ReactNode; value: number; sub?: React.ReactNode; key?: string }[]; format?: Fmt; color?: string; className?: string; max?: number }) {
  const top = max ?? Math.max(1, ...items.map((i) => Math.abs(i.value)));
  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((it, idx) => (
        <li key={it.key ?? idx} className="group" title={`${typeof it.label === "string" ? it.label : ""} : ${format(it.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink-700">{it.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink-900">
              {format(it.value)}
              {it.sub && <span className="ml-1.5 text-xs font-normal text-ink-400">{it.sub}</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full transition-all duration-500 group-hover:opacity-80" style={{ width: `${(Math.abs(it.value) / top) * 100}%`, background: it.value < 0 ? "#e34948" : color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
