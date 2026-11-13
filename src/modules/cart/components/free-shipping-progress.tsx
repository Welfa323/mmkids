import { PartyPopper, Truck } from "lucide-react";
import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function FreeShippingProgress({ subtotal, threshold, remaining, className }: { subtotal: number; threshold: number | null; remaining: number | null; className?: string }) {
  if (threshold == null || remaining == null) return null;
  const pct = Math.min(100, (subtotal / threshold) * 100);
  const done = remaining <= 0;
  return (
    <div className={cn("rounded-2xl p-3.5", done ? "bg-brand-50" : "bg-gold-50", className)}>
      <p className="flex items-center gap-2 text-sm font-medium text-ink-800">
        {done ? <PartyPopper className="size-[18px] text-brand-600" /> : <Truck className="size-[18px] text-gold-600" />}
        {done ? (
          <span>
            Bravo ! La <b>livraison est gratuite</b> sur cette commande.
          </span>
        ) : (
          <span>
            Il vous manque <b className="text-ink-900">{formatPrice(remaining)}</b> pour bénéficier de la livraison gratuite
          </span>
        )}
      </p>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
        <div className={cn("h-full rounded-full transition-all duration-700", done ? "bg-brand-500" : "bg-gradient-to-r from-gold-400 to-accent-400")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
