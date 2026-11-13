"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Gift, Heart, LayoutDashboard, LogOut, MapPin, Package, ShieldCheck, UserRound, Lock } from "lucide-react";
import { useAuth } from "../store/auth.store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { Avatar } from "@/shared/ui/misc";
import { Button, ButtonLink } from "@/shared/ui/button";
import { tierForSpent } from "@/modules/loyalty";
import { cn } from "@/shared/lib/utils";

const NAV = [
  { href: "/compte", label: "Aperçu", icon: LayoutDashboard },
  { href: "/compte/commandes", label: "Mes commandes", icon: Package },
  { href: "/compte/fidelite", label: "Fidélité & coupons", icon: Gift },
  { href: "/favoris", label: "Mes favoris", icon: Heart },
  { href: "/compte/adresses", label: "Adresses", icon: MapPin },
  { href: "/compte/profil", label: "Informations", icon: UserRound },
  { href: "/compte/notifications", label: "Notifications", icon: Bell },
  { href: "/compte/securite", label: "Sécurité", icon: ShieldCheck },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const login = useAuth((s) => s.login);
  const logout = useAuth((s) => s.logout);

  if (!hydrated)
    return (
      <div className="container-page py-8">
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );

  if (!user)
    return (
      <div className="container-page py-12">
        <div className="card mx-auto max-w-md p-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Lock className="size-6" />
          </span>
          <h1 className="mt-4 text-xl font-extrabold">Connectez-vous à votre espace</h1>
          <p className="mt-1 text-sm text-ink-500">Suivez vos commandes, gérez vos adresses et profitez de vos avantages fidélité.</p>
          <div className="mt-6 grid gap-2">
            <ButtonLink href={`/connexion?retour=${pathname}`} size="lg">
              Se connecter
            </ButtonLink>
            <Button variant="outline" onClick={() => login()}>
              Accès rapide au compte démo (Jean Kouassi)
            </Button>
          </div>
        </div>
      </div>
    );

  const tier = tierForSpent(user.totalSpent);
  const isActive = (href: string) => (href === "/compte" ? pathname === href : pathname.startsWith(href));

  return (
    <div className="container-page grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="card hidden overflow-hidden lg:block">
          <div className="flex items-center gap-3 p-4">
            <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-bold">
                {user.firstName} {user.lastName}
              </p>
              <span className={cn("mt-1 inline-flex rounded-full bg-gradient-to-r px-2 py-0.5 text-[11px] font-bold text-white", tier.gradient)}>Niveau {tier.name}</span>
            </div>
          </div>
          <nav className="border-t border-ink-100 p-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", isActive(n.href) ? "bg-brand-50 text-brand-800" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900")}>
                <n.icon className="size-[18px]" /> {n.label}
              </Link>
            ))}
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-red-50 hover:text-red-600">
              <LogOut className="size-[18px]" /> Déconnexion
            </button>
          </nav>
        </div>
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("chip shrink-0", isActive(n.href) && "chip-active")}>
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
