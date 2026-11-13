import Link from "next/link";
import { SearchX } from "lucide-react";
import { getPopular } from "@/modules/catalog";
import { ProductRail } from "@/modules/catalog/components/product-rail";
import { Logo } from "@/shared/ui/logo";
import { ButtonLink } from "@/shared/ui/button";

/** Gestion des pages supprimées / introuvables (404) avec rebond vers le catalogue */
export default function NotFound() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-ink-100 bg-white">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <div className="container-page py-14 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-50 text-accent-600">
          <SearchX className="size-8" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-wider text-accent-600">Erreur 404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Cette page n&apos;existe plus</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-500">Le produit a peut-être été retiré ou l&apos;adresse a changé. Pas de panique, il y a plein d&apos;autres trésors à découvrir.</p>
        <div className="mt-6 flex justify-center gap-2">
          <ButtonLink href="/">Retour à l&apos;accueil</ButtonLink>
          <ButtonLink href="/collection/promotions" variant="outline">
            Voir les promotions
          </ButtonLink>
        </div>
        <p className="mt-4 text-sm text-ink-400">
          Ou <Link href="/recherche" className="link">lancez une recherche</Link>
        </p>
      </div>
      <section className="container-page pb-16">
        <h2 className="mb-4 text-xl font-extrabold">Nos produits populaires</h2>
        <ProductRail products={getPopular(12)} />
      </section>
    </div>
  );
}
