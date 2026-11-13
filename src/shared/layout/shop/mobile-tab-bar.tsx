"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCartCount } from "@/modules/cart/hooks/use-cart-summary";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { href: "/", label: "Accueil", icon: Home, match: (p: string) => p === "/" },
  { href: "/categories", label: "Catégories", icon: LayoutGrid, match: (p: string) => p.startsWith("/categories") || p.startsWith("/c/") },
  { href: "/panier", label: "Panier", icon: ShoppingCart, match: (p: string) => p.startsWith("/panier") },
  { href: "/favoris", label: "Favoris", icon: Heart, match: (p: string) => p.startsWith("/favoris") },
  { href: "/compte", label: "Compte", icon: User, match: (p: string) => p.startsWith("/compte") || p.startsWith("/connexion") },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const count = useCartCount();
  const hydrated = useHydrated();
  if (pathname.startsWith("/commande")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 pb-safe backdrop-blur-xl lg:hidden" aria-label="Navigation principale">
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href}>
              <Link href={t.href} className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition", active ? "text-brand-700" : "text-ink-500")}>
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand-600" />}
                <span className="relative">
                  <t.icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.8} />
                  {t.href === "/panier" && hydrated && count > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">{count}</span>
                  )}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
