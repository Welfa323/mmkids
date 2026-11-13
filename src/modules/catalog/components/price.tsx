import { formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

export function Price({ price, compareAt, size = "md", className }: { price: number; compareAt?: number; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const main = { sm: "text-sm", md: "text-base", lg: "text-xl", xl: "text-3xl" }[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-extrabold tracking-tight text-ink-900", main)}>{formatPrice(price)}</span>
      {compareAt && compareAt > price && <span className={cn("text-ink-400 line-through", size === "xl" ? "text-base" : "text-xs")}>{formatPrice(compareAt)}</span>}
    </div>
  );
}
