"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function QuantityStepper({ value, onChange, max = 10, size = "md", allowRemove = true }: { value: number; onChange: (v: number) => void; max?: number; size?: "sm" | "md"; allowRemove?: boolean }) {
  const h = size === "sm" ? "h-9" : "h-11";
  const w = size === "sm" ? "w-9" : "w-11";
  return (
    <div className={cn("inline-flex items-center rounded-xl border border-ink-200 bg-white", h)}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={!allowRemove && value <= 1} className={cn("grid h-full place-items-center text-ink-600 transition hover:text-ink-900 disabled:opacity-30", w)} aria-label="Diminuer la quantité">
        {value <= 1 && allowRemove ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} className={cn("grid h-full place-items-center text-ink-600 transition hover:text-ink-900 disabled:opacity-30", w)} aria-label="Augmenter la quantité">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
