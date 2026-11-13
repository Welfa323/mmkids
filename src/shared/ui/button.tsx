import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "dark";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-glow hover:bg-brand-700 active:bg-brand-800",
  accent: "bg-accent-500 text-white shadow-[0_10px_30px_-10px_rgb(249_90_38/0.55)] hover:bg-accent-600",
  secondary: "bg-brand-50 text-brand-800 hover:bg-brand-100",
  outline: "border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50",
  ghost: "text-ink-700 hover:bg-ink-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-6 text-base gap-2 rounded-2xl",
  icon: "size-11 rounded-xl",
  "icon-sm": "size-9 rounded-lg",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
  loading?: boolean;
}

export function buttonClass({ variant = "primary", size = "md", className }: Pick<BaseProps, "variant" | "size" | "className">) {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({ variant, size, className, children, loading, disabled, ...props }: BaseProps & ComponentProps<"button">) {
  return (
    <button className={buttonClass({ variant, size, className })} disabled={disabled || loading} {...props}>
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, children, ...props }: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
