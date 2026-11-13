import { CheckCircle2, CircleDot, PackageCheck, Truck, Home, ClipboardCheck, XCircle, Undo2 } from "lucide-react";
import type { Order } from "../types";
import { CUSTOMER_TRACKING_STEPS, ORDER_STATUS, trackingStepIndex } from "../status";
import { ToneBadge } from "@/shared/ui/badge";
import { formatDateTime } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const ICONS = [ClipboardCheck, PackageCheck, Truck, Truck, Home];

/** Suivi visuel : Confirmée → Préparée → Expédiée → En route → Livrée */
export function OrderTrackingBar({ order }: { order: Order }) {
  const idx = trackingStepIndex(order.status);
  const terminal = ["annulee", "echec_paiement", "retour", "remboursee"].includes(order.status);
  if (terminal) {
    const Icon = order.status === "retour" || order.status === "remboursee" ? Undo2 : XCircle;
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl p-4", order.status === "remboursee" ? "bg-fuchsia-50" : "bg-ink-100")}>
        <Icon className="size-6 text-ink-600" />
        <div>
          <p className="font-semibold">{ORDER_STATUS[order.status].customerLabel}</p>
          <p className="text-sm text-ink-500">{order.history[order.history.length - 1]?.note}</p>
        </div>
      </div>
    );
  }
  return (
    <ol className="grid grid-cols-5 gap-1">
      {CUSTOMER_TRACKING_STEPS.map((s, i) => {
        const Icon = ICONS[i];
        const done = i <= idx;
        const current = i === idx;
        return (
          <li key={s.label} className="relative flex flex-col items-center text-center">
            {i > 0 && <span className={cn("absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 rounded-full", i <= idx ? "bg-brand-500" : "bg-ink-200")} />}
            <span className={cn("relative z-10 grid size-10 place-items-center rounded-full transition", done ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-400", current && "ring-4 ring-brand-500/25")}>
              <Icon className="size-5" />
              {current && order.status !== "livree" && <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/30" />}
            </span>
            <span className={cn("mt-2 text-[11px] font-semibold leading-tight sm:text-xs", done ? "text-ink-900" : "text-ink-400")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderHistoryTimeline({ order, showActors }: { order: Order; showActors?: boolean }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-ink-100 pl-5">
      {[...order.history].reverse().map((e, i) => (
        <li key={i} className="relative">
          <span className={cn("absolute -left-[27px] top-0.5 grid size-4 place-items-center rounded-full ring-4 ring-white", i === 0 ? ORDER_STATUS[e.status].dot : "bg-ink-300")}>
            {i === 0 ? <CircleDot className="size-3 text-white" /> : <CheckCircle2 className="size-3 text-white" />}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <ToneBadge tone={ORDER_STATUS[e.status].tone}>{showActors ? ORDER_STATUS[e.status].label : ORDER_STATUS[e.status].customerLabel}</ToneBadge>
            <span className="text-xs text-ink-400">{formatDateTime(e.at)}</span>
          </div>
          {(e.note || showActors) && (
            <p className="mt-1 text-sm text-ink-600">
              {e.note}
              {showActors && <span className="text-ink-400"> {e.note ? "·" : ""} par {e.by}</span>}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
