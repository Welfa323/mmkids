"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Heart, LayoutGrid, LogOut, Menu, Package, Phone, ShoppingCart, Truck, User, Zap, Gift, Store, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/modules/catalog";
import { CategoryIcon } from "@/modules/catalog/components/category-icon";
import { SearchBox } from "@/modules/search/components/search-box";
import { useCart } from "@/modules/cart/store/cart.store";
import { useCartCount } from "@/modules/cart/hooks/use-cart-summary";
import { useAuth } from "@/modules/customer/store/auth.store";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { Logo } from "@/shared/ui/logo";
import { Sheet } from "@/shared/ui/sheet";
import { Avatar } from "@/shared/ui/misc";
import { cn } from "@/shared/lib/utils";
import { SITE } from "@/shared/lib/site";
import { formatNumber } from "@/shared/lib/format";

const QUICK_LINKS = [
  { href: "/collection/ventes-flash", label: "Ventes flash", icon: Zap, accent: true },
  { href: "/collection/nouveautes", label: "Nouveautés" },
  { href: "/collection/promotions", label: "Promotions" },
  { href: "/c/bebe", label: "Bébé" },
  { href: "/c/fille", label: "Fille" },
  { href: "/c/garcon", label: "Garçon" },
  { href: "/c/ceremonie", label: "Cérémonie" },
  { href: "/c/ecole", label: "Rentrée" },
  { href: "/marques", label: "Marques" },
  { href: "/collection/made-in-ci", label: "Made in CI 🇨🇮" },
];

function CountBubble({ n }: { n: number }) {
  if (!n) return null;
  return <span className="absolute -right-1 -top-1 grid min-w-5 animate-pop place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-white">{n > 99 ? "99+" : n}</span>;
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(CATEGORIES[0].slug);
  const cat = CATEGORIES.find((c) => c.slug === active)!;
  return (
    <div className="absolute left-0 top-full z-50 mt-2 flex w-[760px] animate-slide-up overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift" onMouseLeave={onClose}>
      <ul className="w-64 shrink-0 border-r border-ink-100 bg-ink-50/60 py-2">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/c/${c.slug}`}
              onMouseEnter={() => setActive(c.slug)}
              onClick={onClose}
              className={cn("flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition", active === c.slug ? "bg-white text-brand-700" : "text-ink-700 hover:text-ink-900")}
            >
              <CategoryIcon slug={c.slug} className="size-[18px]" />
              <span className="flex-1">{c.name}</span>
              <ChevronRight className="size-4 text-ink-300" />
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex-1 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{cat.name}</h3>
          <Link href={`/c/${cat.slug}`} onClick={onClose} className="text-sm font-semibold text-brand-700 hover:underline">
            Tout voir
          </Link>
        </div>
        <p className="mb-5 text-sm text-ink-500">{cat.description}</p>
        <div className="grid grid-cols-2 gap-2">
          {cat.subcategories.map((s) => (
            <Link key={s.slug} href={`/c/${cat.slug}?sous=${s.slug}`} onClick={onClose} className="rounded-xl border border-ink-100 px-4 py-3 text-sm font-medium text-ink-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800">
              {s.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const count = useCartCount();
  const wishCount = useEngagement((s) => s.wishlist.length);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMenu(false);
    setMega(false);
    setAccountOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => !accountRef.current?.contains(e.target as Node) && setAccountOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const u = hydrated ? user : null;

  return (
    <>
      {/* Bandeau d'annonces */}
      <div className="bg-brand-900 text-brand-50">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
          <div className="no-scrollbar flex items-center gap-5 overflow-x-auto whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3.5 text-brand-300" /> Livraison gratuite dès 50 000 FCFA à Abidjan
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <ShieldCheck className="size-3.5 text-brand-300" /> Paiement sécurisé Mobile Money & carte
            </span>
            <span className="hidden items-center gap-1.5 md:flex">
              <Gift className="size-3.5 text-brand-300" /> −10 % sur votre 1re commande : <b className="font-bold text-white">BIENVENUE10</b>
            </span>
          </div>
          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            <a href={`tel:${SITE.phone}`} className="flex items-center gap-1.5 hover:text-white">
              <Phone className="size-3.5" /> {SITE.phone}
            </a>
            <Link href="/suivi" className="hover:text-white">
              Suivre ma commande
            </Link>
            <Link href="/admin" className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 font-semibold hover:bg-white/20">
              <Store className="size-3.5" /> Espace commerçant
            </Link>
          </div>
        </div>
      </div>

      <header className={cn("sticky top-0 z-40 border-b bg-white/90 backdrop-blur-xl transition-shadow", scrolled ? "border-ink-100 shadow-soft" : "border-transparent")}>
        <div className="container-page flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
          <button onClick={() => setMenu(true)} className="-ml-2 grid size-10 place-items-center rounded-xl text-ink-700 hover:bg-ink-100 lg:hidden" aria-label="Menu">
            <Menu className="size-6" />
          </button>
          <Logo />
          <SearchBox variant="desktop" className="hidden flex-1 lg:block" />
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            {/* Compte */}
            <div ref={accountRef} className="relative hidden lg:block">
              <button onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-ink-100">
                {u ? <Avatar name={`${u.firstName} ${u.lastName}`} src={u.avatar} size="sm" /> : <User className="size-6 text-ink-700" />}
                <span className="leading-tight">
                  <span className="block text-[11px] text-ink-500">{u ? `Bonjour ${u.firstName}` : "Bonjour"}</span>
                  <span className="flex items-center gap-0.5 text-sm font-semibold text-ink-900">
                    {u ? "Mon compte" : "Se connecter"} <ChevronDown className="size-3.5" />
                  </span>
                </span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 animate-slide-up rounded-2xl border border-ink-100 bg-white p-2 shadow-lift">
                  {!u ? (
                    <div className="p-2">
                      <Link href="/connexion" className="flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700">
                        Se connecter
                      </Link>
                      <p className="mt-3 text-center text-xs text-ink-500">
                        Nouveau client ?{" "}
                        <Link href="/inscription" className="link">
                          Créer un compte
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div className="mb-1 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 p-3 text-white">
                      <p className="text-xs opacity-90">Niveau Or</p>
                      <p className="text-lg font-bold">{formatNumber(u.points)} points</p>
                    </div>
                  )}
                  <div className="mt-1 border-t border-ink-100 pt-1">
                    {[
                      { href: "/compte", label: "Mon espace", icon: User },
                      { href: "/compte/commandes", label: "Mes commandes", icon: Package },
                      { href: "/favoris", label: "Mes favoris", icon: Heart },
                      { href: "/compte/fidelite", label: "Fidélité & coupons", icon: Gift },
                    ].map((l) => (
                      <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
                        <l.icon className="size-[18px] text-ink-400" /> {l.label}
                      </Link>
                    ))}
                    {u && (
                      <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
                        <LogOut className="size-[18px] text-ink-400" /> Se déconnecter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Link href="/favoris" className="relative hidden size-11 place-items-center rounded-xl text-ink-700 hover:bg-ink-100 sm:grid" aria-label="Favoris">
              <Heart className="size-6" />
              {hydrated && <CountBubble n={wishCount} />}
            </Link>
            <button onClick={() => setDrawerOpen(true)} className="relative flex h-11 items-center gap-2 rounded-xl px-2.5 text-ink-700 hover:bg-ink-100" aria-label="Panier">
              <span className="relative">
                <ShoppingCart className="size-6" />
                {hydrated && <CountBubble n={count} />}
              </span>
              <span className="hidden text-sm font-semibold xl:inline">Panier</span>
            </button>
          </div>
        </div>
        <div className="container-page pb-3 lg:hidden">
          <SearchBox variant="mobile" />
        </div>

        {/* Navigation catégories (desktop) */}
        <nav className="hidden border-t border-ink-100 lg:block">
          <div className="container-page relative flex h-12 items-center gap-1">
            <div className="relative" onMouseEnter={() => setMega(true)}>
              <button onClick={() => setMega((v) => !v)} className={cn("flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition", mega ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-800 hover:bg-brand-100")}>
                <LayoutGrid className="size-4" /> Toutes les catégories <ChevronDown className={cn("size-4 transition", mega && "rotate-180")} />
              </button>
              {mega && <MegaMenu onClose={() => setMega(false)} />}
            </div>
            <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto">
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex h-9 items-center gap-1 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition",
                    pathname === l.href ? "bg-ink-100 text-ink-900" : l.accent ? "text-accent-600 hover:bg-accent-50" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                  )}
                >
                  {l.icon && <l.icon className="size-4" fill="currentColor" />} {l.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Menu mobile */}
      <Sheet open={menu} onClose={() => setMenu(false)} side="left" title={<Logo />}>
        <div className="p-4">
          {u ? (
            <Link href="/compte" className="mb-4 flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
              <Avatar name={`${u.firstName} ${u.lastName}`} />
              <div>
                <p className="font-semibold">Bonjour {u.firstName} 👋</p>
                <p className="text-xs text-brand-700">{u.points} points · Niveau Or</p>
              </div>
            </Link>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Link href="/connexion" className="flex h-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white">
                Connexion
              </Link>
              <Link href="/inscription" className="flex h-11 items-center justify-center rounded-xl border border-ink-200 text-sm font-semibold">
                Inscription
              </Link>
            </div>
          )}
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-400">Catégories</p>
          <ul className="space-y-0.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-50">
                  <span className={cn("grid size-9 place-items-center rounded-xl", c.tone)}>
                    <CategoryIcon slug={c.slug} className="size-[18px]" />
                  </span>
                  {c.name}
                  <ChevronRight className="ml-auto size-4 text-ink-300" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mb-2 mt-5 px-1 text-xs font-bold uppercase tracking-wider text-ink-400">Raccourcis</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.slice(0, 3).concat({ href: "/marques", label: "Marques" }, { href: "/suivi", label: "Suivre ma commande" }, { href: "/blog", label: "Le Mag" }).map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl border border-ink-100 px-3 py-2.5 text-sm font-medium text-ink-700">
                {l.label}
              </Link>
            ))}
          </div>
          <Link href="/admin" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-ink-900 py-3 text-sm font-semibold text-white">
            <Store className="size-4" /> Espace commerçant (démo)
          </Link>
        </div>
      </Sheet>
    </>
  );
}
