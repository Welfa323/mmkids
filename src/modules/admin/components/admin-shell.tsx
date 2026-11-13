"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  Boxes,
  Building2,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageSquareText,
  Package,
  PanelLeftClose,
  PercentCircle,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAdminSession } from "../store/admin-session.store";
import { can, ROLES, ROLE_BY_ID, type ModuleId } from "@/modules/staff";
import { STORES } from "@/modules/stores";
import { MERCHANT_FEED } from "@/modules/notifications";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { LogoMark } from "@/shared/ui/logo";
import { Sheet } from "@/shared/ui/sheet";
import { Avatar } from "@/shared/ui/misc";
import { DEMO_NOW } from "@/shared/lib/clock";
import { timeAgo } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  module: ModuleId;
  badge?: string;
}

export const ADMIN_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Pilotage",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, module: "dashboard" },
      { href: "/admin/ventes", label: "Gestion commerciale", icon: BarChart3, module: "ventes" },
      { href: "/admin/rentabilite", label: "Rentabilité", icon: Wallet, module: "rentabilite" },
      { href: "/admin/assistant-ia", label: "Assistant IA", icon: Bot, module: "ia", badge: "IA" },
    ],
  },
  {
    group: "Ventes",
    items: [
      { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart, module: "commandes", badge: "16" },
      { href: "/admin/paiements", label: "Paiements", icon: CreditCard, module: "paiements" },
      { href: "/admin/paniers-abandonnes", label: "Paniers abandonnés", icon: AlertTriangle, module: "paniers", badge: "5" },
      { href: "/admin/facturation", label: "Facturation", icon: Receipt, module: "facturation" },
    ],
  },
  {
    group: "Catalogue",
    items: [
      { href: "/admin/produits", label: "Produits", icon: Package, module: "produits" },
      { href: "/admin/stock", label: "Stock & inventaire", icon: Boxes, module: "stock" },
      { href: "/admin/avis", label: "Avis clients", icon: MessageSquareText, module: "avis" },
    ],
  },
  {
    group: "Clients & marketing",
    items: [
      { href: "/admin/clients", label: "Clients (CRM)", icon: Users, module: "clients" },
      { href: "/admin/promotions", label: "Promotions", icon: PercentCircle, module: "promotions" },
      { href: "/admin/marketing", label: "Marketing", icon: Megaphone, module: "marketing" },
    ],
  },
  {
    group: "Opérations",
    items: [
      { href: "/admin/livraison", label: "Livraison", icon: Truck, module: "livraison" },
      { href: "/admin/boutiques", label: "Boutiques", icon: Building2, module: "boutiques" },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/employes", label: "Employés & rôles", icon: UserCog, module: "employes" },
      { href: "/admin/securite", label: "Sécurité", icon: ShieldCheck, module: "securite" },
      { href: "/admin/notifications", label: "Notifications", icon: Bell, module: "notifications" },
      { href: "/admin/seo", label: "SEO", icon: Globe, module: "seo" },
    ],
  },
];

function NavLinks({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  const role = useAdminSession((s) => s.role);
  return (
    <nav className="space-y-5 px-3 py-4">
      {ADMIN_NAV.map((g) => {
        const items = g.items.filter((i) => can(role, i.module));
        if (!items.length) return null;
        return (
          <div key={g.group}>
            {!collapsed && <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-500">{g.group}</p>}
            <ul className="space-y-0.5">
              {items.map((i) => {
                const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      onClick={onNavigate}
                      title={collapsed ? i.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                        active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <i.icon className={cn("size-[18px] shrink-0", active && "text-brand-300")} />
                      {!collapsed && <span className="flex-1">{i.label}</span>}
                      {!collapsed && i.badge && <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", i.badge === "IA" ? "bg-gold-400 text-ink-900" : "bg-accent-500 text-white")}>{i.badge}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Dropdown({ trigger, children, align = "right" }: { trigger: React.ReactNode; children: (close: () => void) => React.ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);
  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && <div className={cn("absolute top-full z-50 mt-2 animate-slide-up rounded-2xl border border-ink-100 bg-white p-2 shadow-lift", align === "right" ? "right-0" : "left-0")}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const { role, storeId, setRole, setStore, sidebarCollapsed, toggleSidebar } = useAdminSession();
  const [mobileNav, setMobileNav] = useState(false);
  const [feed, setFeed] = useState(MERCHANT_FEED);
  const unread = feed.filter((f) => !f.read).length;

  if (!hydrated)
    return (
      <div className="flex min-h-dvh">
        <div className="hidden w-64 bg-ink-950 lg:block" />
        <div className="flex-1 p-6">
          <div className="skeleton h-10 w-64 rounded-xl" />
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );

  const currentModule = ADMIN_NAV.flatMap((g) => g.items).find((i) => (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)));
  const allowed = !currentModule || can(role, currentModule.module);
  const roleInfo = ROLE_BY_ID[role];

  return (
    <div className="flex min-h-dvh bg-ink-50">
      <aside className={cn("sticky top-0 hidden h-dvh shrink-0 flex-col bg-ink-950 transition-[width] lg:flex", sidebarCollapsed ? "w-[72px]" : "w-64")}>
        <div className={cn("flex h-16 items-center gap-2 border-b border-white/5 px-4", sidebarCollapsed && "justify-center px-0")}>
          <LogoMark className="size-8" />
          {!sidebarCollapsed && (
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-white">MMKids</p>
              <p className="text-[11px] text-ink-400">Back-office</p>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks collapsed={sidebarCollapsed} />
        </div>
        <button onClick={toggleSidebar} className="flex h-12 items-center justify-center gap-2 border-t border-white/5 text-xs text-ink-400 hover:text-white">
          <PanelLeftClose className={cn("size-4 transition", sidebarCollapsed && "rotate-180")} /> {!sidebarCollapsed && "Réduire"}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-ink-100 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
          <button onClick={() => setMobileNav(true)} className="-ml-1 grid size-10 place-items-center rounded-xl hover:bg-ink-100 lg:hidden" aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <Dropdown
            align="left"
            trigger={
              <button className="flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold hover:bg-ink-50">
                <Store className="size-4 text-brand-600" />
                <span className="max-w-36 truncate sm:max-w-none">{storeId === "all" ? "Toutes les boutiques" : STORES.find((s) => s.id === storeId)?.name}</span>
                <ChevronDown className="size-4 text-ink-400" />
              </button>
            }
          >
            {(close) => (
              <div className="w-72">
                <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">Vue direction</p>
                <button onClick={() => (setStore("all"), close())} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-ink-50", storeId === "all" && "bg-brand-50 font-semibold text-brand-800")}>
                  Toutes les boutiques <span className="text-xs text-ink-400">Consolidé</span>
                </button>
                <p className="px-3 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">Points de vente</p>
                {STORES.map((s) => (
                  <button key={s.id} onClick={() => (setStore(s.id), close())} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-ink-50", storeId === s.id && "bg-brand-50 font-semibold text-brand-800")}>
                    {s.name} <span className="text-xs capitalize text-ink-400">{s.kind}</span>
                  </button>
                ))}
              </div>
            )}
          </Dropdown>

          <div className="ml-auto flex items-center gap-1">
            <Link href="/" target="_blank" className="hidden h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-ink-600 hover:bg-ink-100 md:flex">
              <ExternalLink className="size-4" /> Voir la boutique
            </Link>
            <Dropdown
              trigger={
                <button className="relative grid size-10 place-items-center rounded-xl text-ink-600 hover:bg-ink-100" aria-label="Notifications">
                  <Bell className="size-5" />
                  {unread > 0 && <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-white">{unread}</span>}
                </button>
              }
            >
              {(close) => (
                <div className="w-[min(22rem,calc(100vw-2rem))]">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="font-bold">Notifications</p>
                    <button onClick={() => setFeed(feed.map((f) => ({ ...f, read: true })))} className="text-xs font-semibold text-brand-700">
                      Tout lire
                    </button>
                  </div>
                  <ul className="max-h-96 overflow-y-auto">
                    {feed.map((f) => (
                      <li key={f.id}>
                        <Link href={f.href ?? "#"} onClick={() => (setFeed(feed.map((x) => (x.id === f.id ? { ...x, read: true } : x))), close())} className={cn("flex gap-3 rounded-xl px-3 py-2.5 hover:bg-ink-50", !f.read && "bg-brand-50/50")}>
                          <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", f.kind === "rupture" || f.kind === "echec" || f.kind === "livraison" ? "bg-red-500" : f.kind === "stock" || f.kind === "retour" ? "bg-amber-500" : "bg-brand-500")} />
                          <span className="min-w-0 flex-1">
                            <span className="flex justify-between gap-2 text-sm font-semibold">
                              {f.title} <span className="shrink-0 text-xs font-normal text-ink-400">{timeAgo(f.at, DEMO_NOW)}</span>
                            </span>
                            <span className="block text-xs text-ink-500">{f.body}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Dropdown>
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-ink-100">
                  <Avatar name="Melaine" size="sm" />
                  <span className="hidden text-left leading-tight sm:block">
                    <span className="block text-sm font-semibold">Melaine</span>
                    <span className="block text-[11px] text-ink-500">{roleInfo.label}</span>
                  </span>
                  <ChevronDown className="size-4 text-ink-400" />
                </button>
              }
            >
              {(close) => (
                <div className="w-72">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">Tester un rôle (démo des permissions)</p>
                  {ROLES.map((r) => (
                    <button key={r.id} onClick={() => (setRole(r.id), close())} className={cn("flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left hover:bg-ink-50", role === r.id && "bg-brand-50")}>
                      <span className={cn("mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold", r.tone)}>{r.label}</span>
                      <span className="text-xs text-ink-500">{r.description}</span>
                    </button>
                  ))}
                  <div className="mt-1 border-t border-ink-100 pt-1">
                    <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                      <FileText className="size-4" /> Retour à la boutique
                    </Link>
                  </div>
                </div>
              )}
            </Dropdown>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          {allowed ? (
            children
          ) : (
            <div className="card mx-auto mt-10 max-w-md p-8 text-center">
              <ShieldCheck className="mx-auto size-10 text-ink-300" />
              <h1 className="mt-3 text-lg font-bold">Accès restreint</h1>
              <p className="mt-1 text-sm text-ink-500">
                Le rôle <b>{roleInfo.label}</b> n&apos;a pas la permission « {currentModule?.label} ». Changez de rôle depuis le menu utilisateur pour tester.
              </p>
            </div>
          )}
        </main>
      </div>

      <Sheet open={mobileNav} onClose={() => setMobileNav(false)} side="left" className="bg-ink-950" title={<span className="text-white">Back-office</span>}>
        <div className="bg-ink-950">
          <NavLinks onNavigate={() => setMobileNav(false)} />
        </div>
      </Sheet>
    </div>
  );
}
