import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent, Bell, Clock3, Sparkles, Truck, Zap } from "lucide-react";
import {
  CATEGORIES,
  getBestSellers,
  getBrands,
  getComingSoon,
  getFlashSales,
  getNewArrivals,
  getPopular,
  getProductBySlug,
  getPromotions,
} from "@/modules/catalog";
import { CategoryIcon } from "@/modules/catalog/components/category-icon";
import { ProductCard } from "@/modules/catalog/components/product-card";
import { ProductRail } from "@/modules/catalog/components/product-rail";
import { HeroCarousel, type HeroSlide } from "@/modules/storefront/components/hero-carousel";
import { RecentlyViewed } from "@/modules/storefront/components/recently-viewed";
import { Countdown } from "@/shared/ui/countdown";
import { SectionHeader } from "@/shared/ui/misc";
import { SITE } from "@/shared/lib/site";
import { formatDate, formatPrice } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";

const CATEGORY_COVERS: Record<string, string> = {
  bebe: "grenouillere-zippee-lapin",
  fille: "robe-d-ete-fleurie",
  garcon: "t-shirt-garcon-dinosaure",
  ceremonie: "robe-de-ceremonie-satin-et-tulle",
  chaussures: "baskets-lumineuses-led",
  nuit: "pyjama-long-garcon-dinosaures",
  "sport-plage": "maillot-de-bain-fille-une-piece",
  ecole: "sac-a-dos-maternelle",
  accessoires: "casquette-enfant-brodee",
};

const img = (slug: string, i = 0) => getProductBySlug(slug)?.images[i] ?? "";

const SLIDES: HeroSlide[] = [
  {
    id: "collection",
    eyebrow: "Nouvelle collection",
    title: "Des couleurs plein les placards",
    subtitle: "Robes, t-shirts, shorts et ensembles de 2 à 14 ans, en coton doux et respirant.",
    cta: "Découvrir",
    href: "/collection/nouveautes",
    bg: "from-brand-600 via-brand-700 to-brand-900",
    images: [img("robe-d-ete-fleurie"), img("ensemble-garcon-t-shirt-et-short"), img("t-shirt-fille-licorne")],
  },
  {
    id: "bebe",
    eyebrow: "Spécial bébé 0-24 mois",
    title: "Tout doux pour les tout-petits",
    subtitle: "Bodies en coton bio, grenouillères, ensembles naissance et chaussons. Livrés en 24 h.",
    cta: "Voir l'univers bébé",
    href: "/c/bebe",
    bg: "from-sky-500 via-sky-600 to-indigo-700",
    images: [img("lot-de-3-bodies-coton-bio"), img("grenouillere-zippee-lapin"), img("chaussons-bebe-tricotes")],
  },
  {
    id: "chaussures",
    eyebrow: "Code CHAUSSURES20",
    title: "−20 % sur toutes les chaussures",
    subtitle: "Jusqu'au 15 novembre : baskets lumineuses, sandales, ballerines et premiers pas.",
    cta: "Voir les chaussures",
    href: "/c/chaussures",
    bg: "from-ink-800 via-ink-900 to-ink-950",
    images: [img("baskets-lumineuses-led"), img("sandales-fille-a-fleurs"), img("chaussures-premiers-pas-cuir-souple")],
    badge: "−20 %",
  },
  {
    id: "ceremonie",
    eyebrow: "Fêtes & cérémonies",
    title: "Les plus beaux pour les grands jours",
    subtitle: "Mariages, baptêmes, Noël : robes en tulle, costumes, boubous et tenues en wax.",
    cta: "Voir la collection",
    href: "/c/ceremonie",
    bg: "from-accent-500 via-accent-600 to-rose-700",
    images: [img("robe-de-ceremonie-satin-et-tulle"), img("costume-garcon-3-pieces"), img("robe-kita-fille")],
  },
];

export default function HomePage() {
  const flash = getFlashSales();
  const brands = getBrands().filter((b) => b.productCount >= 2).slice(0, 14);
  const comingSoon = getComingSoon();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/icon.svg`,
      contactPoint: { "@type": "ContactPoint", telephone: SITE.phone, contactType: "customer service", areaServed: "CI", availableLanguage: "French" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
      potentialAction: { "@type": "SearchAction", target: `${SITE.url}/recherche?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Catégories rapides (mobile) */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pt-4 lg:hidden">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/c/${c.slug}`} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5 text-center">
            <span className={cn("grid size-14 place-items-center rounded-2xl", c.tone)}>
              <CategoryIcon slug={c.slug} className="size-6" />
            </span>
            <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink-700">{c.shortName}</span>
          </Link>
        ))}
      </div>

      {/* Hero */}
      <section className="container-page mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[240px_1fr_280px]">
        <aside className="card hidden overflow-hidden py-2 lg:block">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="group flex items-center gap-3 px-4 py-[9px] text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-800">
              <CategoryIcon slug={c.slug} className="size-[18px] text-ink-400 group-hover:text-brand-600" />
              {c.name}
            </Link>
          ))}
        </aside>
        <HeroCarousel slides={SLIDES} />
        <div className="hidden flex-col gap-4 lg:flex">
          <Link href="/collection/made-in-ci" className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-gold-100 to-gold-50 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold-600">Made in Côte d&apos;Ivoire 🇨🇮</p>
              <p className="mt-1 text-lg font-extrabold leading-snug text-ink-900">Wax, pagne & ateliers ivoiriens</p>
            </div>
            <span className="flex items-center gap-1 text-sm font-semibold text-ink-800 group-hover:gap-2">
              Explorer <ArrowRight className="size-4" />
            </span>
            <Image src={img("robe-en-wax-fille")} alt="" width={110} height={110} className="absolute -bottom-2 -right-2 object-contain transition group-hover:scale-110" />
          </Link>
          <div className="flex flex-1 flex-col justify-between rounded-3xl bg-ink-900 p-5 text-white">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">
                <Truck className="size-4" /> Livraison
              </p>
              <p className="mt-1 text-lg font-extrabold leading-snug">Gratuite dès {formatPrice(SITE.freeShippingThreshold)}</p>
              <p className="mt-1 text-xs text-ink-300">Express en 3 h · Retrait gratuit en boutique · Point relais</p>
            </div>
            <Link href="/aide/livraison" className="text-sm font-semibold text-brand-300 hover:text-brand-200">
              Voir les zones →
            </Link>
          </div>
        </div>
      </section>

      {/* Ventes flash */}
      <section className="container-page mt-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-ink-100">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-accent-500 via-accent-600 to-rose-600 px-4 py-3 text-white sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                <Zap className="size-5 text-gold-400" fill="currentColor" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold sm:text-xl">Ventes flash</h2>
                <p className="text-xs text-white/80">Stocks limités · se termine dans</p>
              </div>
              <Countdown className="ml-1" />
            </div>
            <Link href="/collection/ventes-flash" className="text-sm font-semibold hover:underline">
              Tout voir →
            </Link>
          </div>
          <div className="p-3 sm:p-4">
            <ProductRail products={flash} variant="flash" />
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="container-page mt-10">
        <SectionHeader title="Explorer par catégorie" subtitle="Plus de 130 articles, de la naissance à 14 ans" href="/categories" />
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
          {CATEGORIES.map((c) => {
            const cover = getProductBySlug(CATEGORY_COVERS[c.slug]);
            return (
              <Link key={c.slug} href={`/c/${c.slug}`} className="group flex flex-col items-center rounded-2xl border border-ink-100 bg-white p-3 text-center transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="relative mb-2 size-16 overflow-hidden rounded-2xl bg-ink-50 sm:size-20">
                  {cover && <Image src={cover.images[0]} alt="" fill sizes="80px" className="object-contain p-2 transition group-hover:scale-110" />}
                </span>
                <span className="line-clamp-2 text-xs font-semibold text-ink-800 sm:text-sm">{c.shortName}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="container-page mt-10">
        <SectionHeader
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="size-5 text-brand-600" /> Nouveautés
            </span>
          }
          subtitle="Fraîchement arrivés chez MMKids"
          href="/collection/nouveautes"
        />
        <ProductRail products={getNewArrivals(14)} />
      </section>

      {/* Bannières */}
      <section className="container-page mt-10 grid gap-4 md:grid-cols-2">
        <Link href="/c/ecole" className="group relative flex min-h-44 items-center overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-white p-6">
          <div className="relative z-10 max-w-[55%]">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Rentrée scolaire</p>
            <p className="mt-1 text-xl font-extrabold text-ink-900 sm:text-2xl">Uniformes, sacs & vestes à petit prix</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-800 group-hover:gap-2">
              Découvrir <ArrowRight className="size-4" />
            </span>
          </div>
          <Image src={img("pack-uniforme-chemise-et-short")} alt="" width={200} height={200} className="absolute -right-4 bottom-0 object-contain transition duration-500 group-hover:scale-105" />
        </Link>
        <Link href="/collection/promotions" className="group relative flex min-h-44 items-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100 via-brand-50 to-white p-6">
          <div className="relative z-10 max-w-[55%]">
            <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-700">
              <BadgePercent className="size-4" /> Bons plans
            </p>
            <p className="mt-1 text-xl font-extrabold text-ink-900 sm:text-2xl">−5 000 FCFA dès 30 000 FCFA</p>
            <p className="mt-1 text-sm text-ink-600">
              avec le code <b className="rounded bg-white px-1.5 py-0.5 font-mono text-brand-800">AKWABA5000</b>
            </p>
          </div>
          <Image src={img("robe-tutu-a-paillettes")} alt="" width={180} height={180} className="absolute -right-2 bottom-0 object-contain transition duration-500 group-hover:scale-105" />
        </Link>
      </section>

      {/* Populaires */}
      <section className="container-page mt-10">
        <SectionHeader title="Produits populaires" subtitle="Ce que les parents regardent en ce moment" href="/collection/populaires" />
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {getPopular(10).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Meilleures ventes */}
      <section className="container-page mt-10">
        <SectionHeader title="Meilleures ventes" subtitle="Le top des ventes cette semaine" href="/collection/meilleures-ventes" />
        <ProductRail products={getBestSellers(14)} />
      </section>

      {/* Promotions */}
      <section className="container-page mt-10">
        <SectionHeader title="Les plus fortes remises" subtitle="Jusqu'à −45 % sur une sélection" href="/collection/promotions" />
        <ProductRail products={getPromotions(14)} />
      </section>

      {/* Bientôt disponibles */}
      <section className="container-page mt-10">
        <SectionHeader
          title={
            <span className="flex items-center gap-2">
              <Clock3 className="size-5 text-ink-400" /> Bientôt disponibles
            </span>
          }
          subtitle="Activez une alerte pour être prévenu dès l'arrivée"
          href="/collection/bientot-disponibles"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {comingSoon.map((p) => (
            <Link key={p.id} href={`/p/${p.slug}`} className="card group flex items-center gap-3 p-3 transition hover:shadow-lift lg:flex-col lg:items-start">
              <span className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-50 lg:aspect-square lg:size-auto lg:w-full">
                <Image src={p.images[0]} alt={p.name} fill sizes="200px" className="object-contain p-3 transition group-hover:scale-105" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-2 text-sm font-semibold text-ink-800">{p.name}</span>
                <span className="mt-1 flex items-center gap-1 text-xs font-medium text-brand-700">
                  <Bell className="size-3.5" /> Le {formatDate(p.availableAt!)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Marques */}
      <section className="container-page mt-10">
        <SectionHeader title="Nos marques" href="/marques" linkLabel="Toutes les marques" />
        <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-7">
          {brands.map((b) => (
            <Link key={b.slug} href={`/marque/${b.slug}`} className="flex h-16 min-w-32 shrink-0 flex-col items-center justify-center rounded-2xl border border-ink-100 bg-white px-3 text-center transition hover:border-brand-200 hover:shadow-soft">
              <span className="text-sm font-extrabold tracking-tight text-ink-800">{b.name}</span>
              <span className="text-[11px] text-ink-400">{b.productCount} produits</span>
            </Link>
          ))}
        </div>
      </section>

      <RecentlyViewed />
    </>
  );
}
