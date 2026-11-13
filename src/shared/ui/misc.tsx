import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export function RatingStars({ rating, size = "sm", className }: { rating: number; size?: "xs" | "sm" | "md"; className?: string }) {
  const s = { xs: "size-3", sm: "size-3.5", md: "size-5" }[size];
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Note ${rating} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i + 1));
        return (
          <span key={i} className={cn("relative inline-block", s)}>
            <Star className={cn("absolute inset-0 text-ink-200", s)} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("text-gold-400", s)} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function SectionHeader({ title, subtitle, href, linkLabel = "Voir tout", action, className }: { title: ReactNode; subtitle?: ReactNode; href?: string; linkLabel?: string; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-extrabold tracking-tight text-ink-900 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {action}
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
          {linkLabel}
          <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbs({ items, className }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("no-scrollbar overflow-x-auto", className)}>
      <ol className="flex items-center gap-1 whitespace-nowrap text-xs text-ink-500 sm:text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 text-ink-300" />}
            {it.href ? (
              <Link href={it.href} className="hover:text-brand-700">
                {it.label}
              </Link>
            ) : (
              <span className="font-medium text-ink-800">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function EmptyState({ icon, title, description, action, className }: { icon: ReactNode; title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center", className)}>
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="text-lg font-bold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}>
      <div className={cn("h-full rounded-full bg-brand-500 transition-all duration-500", barClassName)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Avatar({ name, src, size = "md", className }: { name: string; src?: string; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const s = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg", xl: "size-20 text-2xl" }[size];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const hue = [...name].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn("shrink-0 rounded-full object-cover", s, className)} />;
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full font-bold text-white", s, className)} style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 45%), hsl(${(hue + 40) % 360} 60% 35%))` }}>
      {initials}
    </span>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50", checked ? "bg-brand-600" : "bg-ink-200")}
    >
      <span className={cn("inline-block size-5 rounded-full bg-white shadow transition", checked ? "translate-x-5.5" : "translate-x-0.5")} />
    </button>
  );
}
