"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, GitCompareArrows, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getProductsByIds } from "@/modules/catalog";
import { useEngagement } from "@/modules/customer/store/engagement.store";
import { useHydrated } from "@/shared/hooks/use-hydrated";
import { LogoMark } from "@/shared/ui/logo";
import { cn } from "@/shared/lib/utils";

/** Barre « Comparer (n) » visible dès qu'un produit est ajouté au comparateur */
export function CompareBar() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const ids = useEngagement((s) => s.compare);
  const toggle = useEngagement((s) => s.toggleCompare);
  const clear = useEngagement((s) => s.clearCompare);
  if (!hydrated || ids.length === 0 || pathname.startsWith("/comparer") || pathname.startsWith("/commande")) return null;
  const products = getProductsByIds(ids);
  return (
    <div className={cn("fixed inset-x-3 bottom-[5.25rem] z-[44] mx-auto max-w-xl animate-slide-up rounded-2xl border border-ink-100 bg-white/95 p-2 shadow-lift backdrop-blur max-sm:right-[4.5rem] lg:bottom-6", pathname.startsWith("/p/") && "max-lg:hidden")}>
      <div className="flex items-center gap-2">
        <GitCompareArrows className="ml-1 size-5 shrink-0 text-brand-600" />
        <div className="flex flex-1 gap-1.5 overflow-hidden">
          {products.map((p) => (
            <span key={p.id} className="relative size-11 shrink-0 rounded-xl border border-ink-100 bg-ink-50">
              <Image src={p.images[0]} alt={p.name} fill sizes="44px" className="object-contain p-1" />
              <button onClick={() => toggle(p.id)} className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-ink-800 text-white" aria-label={`Retirer ${p.name}`}>
                <X className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
        <button onClick={clear} className="hidden px-2 text-xs font-medium text-ink-500 hover:text-ink-800 sm:block">
          Vider
        </button>
        <Link href="/comparer" className="flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700">
          Comparer ({ids.length})
        </Link>
      </div>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

/** Bannière PWA : installer la boutique sur l'écran d'accueil, sans passer par le Play Store */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("mmk-pwa-dismissed") === "1";
    } catch {}
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    // Démo : afficher la bannière sur mobile même si le navigateur n'a pas émis l'événement
    const t = setTimeout(() => {
      if (!dismissed && window.innerWidth < 1024 && !window.matchMedia("(display-mode: standalone)").matches) setVisible(true);
    }, 6000);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(t);
    };
  }, []);
  if (!visible) return null;
  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem("mmk-pwa-dismissed", "1");
    } catch {}
  };
  return (
    <div className="fixed inset-x-3 top-3 z-[70] mx-auto flex max-w-md animate-slide-up items-center gap-3 rounded-2xl bg-ink-900 p-3 text-white shadow-lift lg:hidden">
      <LogoMark className="size-11" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Installez MMKids</p>
        <p className="text-xs text-ink-300">Accès rapide, notifications de livraison, hors connexion.</p>
      </div>
      <button
        onClick={async () => {
          if (evt) await evt.prompt();
          else alert("Sur iPhone : touchez « Partager » puis « Sur l'écran d'accueil ». Sur Android : menu ⋮ puis « Installer l'application ».");
          dismiss();
        }}
        className="flex h-9 items-center gap-1 rounded-xl bg-brand-500 px-3 text-xs font-bold"
      >
        <Download className="size-3.5" /> Installer
      </button>
      <button onClick={dismiss} className="text-ink-400" aria-label="Fermer">
        <X className="size-4" />
      </button>
    </div>
  );
}
