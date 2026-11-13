import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Tone = "brand" | "accent" | "gold" | "neutral" | "danger" | "info" | "success" | "warning" | "dark";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-600/15",
  accent: "bg-accent-500 text-white ring-transparent",
  gold: "bg-gold-100 text-gold-600 ring-gold-500/20",
  neutral: "bg-ink-100 text-ink-600 ring-ink-500/10",
  danger: "bg-red-50 text-red-700 ring-red-600/15",
  info: "bg-sky-50 text-sky-700 ring-sky-600/15",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  dark: "bg-ink-900 text-white ring-transparent",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", TONES[tone], className)}>
      {children}
    </span>
  );
}

/** Badge à partir de classes déjà composées (ex. statut de commande) */
export function ToneBadge({ tone, dot, children, className }: { tone: string; dot?: string; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tone, className)}>
      {dot && <span className={cn("size-1.5 rounded-full", dot)} />}
      {children}
    </span>
  );
}
