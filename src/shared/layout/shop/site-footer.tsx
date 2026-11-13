import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, RotateCcw, ShieldCheck, Truck, Headphones } from "lucide-react";
import { CATEGORIES } from "@/modules/catalog";
import { Logo } from "@/shared/ui/logo";
import { SITE } from "@/shared/lib/site";

const PAY = [
  { label: "Orange Money", cls: "bg-[#ff7900] text-white" },
  { label: "MTN MoMo", cls: "bg-[#ffcb05] text-ink-900" },
  { label: "Wave", cls: "bg-[#1dc8f2] text-white" },
  { label: "Moov", cls: "bg-[#0066b3] text-white" },
  { label: "Visa", cls: "bg-white text-[#1a1f71]" },
  { label: "Mastercard", cls: "bg-white text-ink-900" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink-950 pb-24 text-ink-300 lg:pb-0">
      <div className="border-b border-white/5">
        <div className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {[
            { icon: Truck, title: "Livraison rapide", text: "En 3 h à Abidjan, partout en CI" },
            { icon: ShieldCheck, title: "Paiement sécurisé", text: "Mobile Money, carte, à la livraison" },
            { icon: RotateCcw, title: "Échange de taille gratuit", text: "Pendant 15 jours, en boutique ou par livreur" },
            { icon: Headphones, title: "Service client 7j/7", text: "Téléphone, WhatsApp, chat" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-300">
                <f.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-ink-400">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-ink-400">{SITE.description}</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-brand-400" /> {SITE.address}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-brand-400" /> {SITE.phone}
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4 text-brand-400" /> WhatsApp {SITE.whatsapp}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-brand-400" /> {SITE.email}
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Catégories</p>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Aide</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/suivi" className="hover:text-white">Suivre ma commande</Link></li>
            <li><Link href="/compte/commandes" className="hover:text-white">Retours & remboursements</Link></li>
            <li><Link href="/aide/tailles" className="hover:text-white">Guide des tailles</Link></li>
            <li><Link href="/aide/livraison" className="hover:text-white">Livraison & tarifs</Link></li>
            <li><Link href="/aide/paiement" className="hover:text-white">Moyens de paiement</Link></li>
            <li><Link href="/blog" className="hover:text-white">Le Mag MMKids</Link></li>
            <li><Link href="/marques" className="hover:text-white">Toutes les marques</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold text-white">Restez informé</p>
          <p className="mb-3 text-sm text-ink-400">Nouvelles collections, bons plans et ventes flash en avant-première.</p>
          <form className="flex gap-2">
            <input type="email" placeholder="Votre email" className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-ink-500 focus:border-brand-400" />
            <button type="button" className="h-11 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-400">
              OK
            </button>
          </form>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, MessageCircle].map((I, i) => (
              <a key={i} href="#" className="grid size-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10" aria-label="Réseau social">
                <I className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink-500 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {PAY.map((p) => (
              <span key={p.label} className={`rounded-md px-2 py-1 text-[10px] font-bold ${p.cls}`}>
                {p.label}
              </span>
            ))}
          </div>
          <p>
            © 2026 {SITE.legal.company} · RCCM {SITE.legal.rccm} · Prototype de démonstration — données fictives
          </p>
        </div>
      </div>
    </footer>
  );
}
