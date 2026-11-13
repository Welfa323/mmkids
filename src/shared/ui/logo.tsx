import Link from "next/link";
import { cn } from "@/shared/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <defs>
        <linearGradient id="mmk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#189e74" />
          <stop offset="1" stopColor="#0a4335" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#mmk-g)" />
      {/* petit t-shirt d'enfant + cœur */}
      <path d="M14.5 11.5 18 10a2.2 2.2 0 0 0 4 0l3.5 1.5 5 4-2.6 3.6-2.4-1.5V29a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 14.5 29V17.6l-2.4 1.5-2.6-3.6 5-4Z" fill="#fff" />
      <path d="M20 26.2c-2.9-1.9-3.8-3.4-3.3-4.7.5-1.3 2.2-1.4 3.3-.1 1.1-1.3 2.8-1.2 3.3.1.5 1.3-.4 2.8-3.3 4.7Z" fill="#f95a26" />
    </svg>
  );
}

export function Logo({ className, tone = "dark", href = "/" }: { className?: string; tone?: "dark" | "light"; href?: string }) {
  return (
    <Link href={href} className={cn("flex shrink-0 items-center gap-2", className)} aria-label="MMKids — accueil">
      <LogoMark />
      <span className="flex items-baseline font-display text-[1.15rem] font-extrabold leading-none tracking-tight">
        <span className={tone === "dark" ? "text-ink-900" : "text-white"}>MM</span>
        <span className={tone === "dark" ? "text-brand-600" : "text-brand-300"}>Kids</span>
      </span>
    </Link>
  );
}
