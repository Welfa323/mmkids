"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/utils";

/** Compte à rebours jusqu'à minuit (heure locale) — ventes flash */
function msToMidnight() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(24, 0, 0, 0);
  return end.getTime() - now.getTime();
}

export function Countdown({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMs(msToMidnight());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const parts = ms == null ? ["--", "--", "--"] : [ms / 3_600_000, (ms / 60_000) % 60, (ms / 1000) % 60].map((n) => String(Math.floor(n)).padStart(2, "0"));
  return (
    <div className={cn("flex items-center gap-1 font-mono text-sm font-bold tabular-nums", className)} aria-label="Temps restant">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className={cn("rounded-lg px-1.5 py-1", tone === "light" ? "bg-white/20 text-white" : "bg-ink-900 text-white")}>{p}</span>
          {i < 2 && <span className={tone === "light" ? "text-white/70" : "text-ink-400"}>:</span>}
        </span>
      ))}
    </div>
  );
}
