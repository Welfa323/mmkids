import Link from "next/link";
import { ArrowLeft, Lock, Phone } from "lucide-react";
import { Logo } from "@/shared/ui/logo";
import { SITE } from "@/shared/lib/site";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink-50">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center gap-3">
          <Link href="/panier" className="-ml-2 grid size-10 place-items-center rounded-xl text-ink-600 hover:bg-ink-100" aria-label="Retour au panier">
            <ArrowLeft className="size-5" />
          </Link>
          <Logo />
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-800">
            <Lock className="size-3.5" /> Paiement sécurisé
          </span>
          <a href={`tel:${SITE.phone}`} className="hidden items-center gap-1.5 text-sm text-ink-600 sm:flex">
            <Phone className="size-4" /> Besoin d&apos;aide ? {SITE.phone}
          </a>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
