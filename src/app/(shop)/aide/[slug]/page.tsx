import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HELP_PAGES } from "@/modules/content";
import { DELIVERY_MODES, PICKUP_STORES, RELAY_POINTS, ZONES, ZONE_GROUP_LABEL, estimateDelivery, type ZoneGroup } from "@/modules/delivery";
import { PAYMENT_METHODS } from "@/modules/payment";
import { SIZE_GUIDE, SHOE_GUIDE } from "@/modules/content";
import { Breadcrumbs } from "@/shared/ui/misc";
import { formatPrice } from "@/shared/lib/format";
import { SITE } from "@/shared/lib/site";
import { cn } from "@/shared/lib/utils";

export function generateStaticParams() {
  return Object.keys(HELP_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/aide/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const p = HELP_PAGES[slug];
  return p ? { title: p.title, description: p.intro, alternates: { canonical: `/aide/${slug}` } } : {};
}

export default async function HelpPage(props: PageProps<"/aide/[slug]">) {
  const { slug } = await props.params;
  const page = HELP_PAGES[slug];
  if (!page) notFound();
  return (
    <div className="container-page max-w-4xl py-5">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Aide" }, { label: page.title }]} />
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{page.title}</h1>
      <p className="mt-2 text-ink-600">{page.intro}</p>
      <nav className="mt-5 flex gap-2">
        {Object.entries(HELP_PAGES).map(([k, v]) => (
          <Link key={k} href={`/aide/${k}`} className={cn("chip", k === slug && "chip-active")}>
            {v.title}
          </Link>
        ))}
      </nav>

      {slug === "livraison" && (
        <div className="mt-8 space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DELIVERY_MODES.map((m) => (
              <div key={m.id} className="card p-4">
                <p className="font-bold">{m.label}</p>
                <p className="text-sm text-ink-500">{m.description}</p>
                <p className="mt-2 text-sm font-semibold text-brand-700">{m.id === "retrait" ? "Gratuit" : m.id === "relais" ? "500 à 1 000 FCFA" : m.surcharge ? `Tarif zone + ${formatPrice(m.surcharge)}` : "Tarif de la zone"}</p>
              </div>
            ))}
          </div>
          <p className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
            🎁 Livraison standard <b>gratuite dès {formatPrice(SITE.freeShippingThreshold)}</b> à Abidjan et dès <b>50 000 FCFA</b> à l&apos;intérieur du pays.
          </p>
          {(["abidjan", "interieur", "international"] as ZoneGroup[]).map((g) => (
            <section key={g}>
              <h2 className="mb-3 text-lg font-extrabold">{ZONE_GROUP_LABEL[g]}</h2>
              <div className="card overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                    <tr>
                      <th className="px-4 py-2.5">Zone</th>
                      <th className="px-4 py-2.5">Tarif</th>
                      <th className="px-4 py-2.5">Délai standard</th>
                      <th className="px-4 py-2.5">Express 3 h</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {ZONES.filter((z) => z.group === g).map((z) => (
                      <tr key={z.id}>
                        <td className="px-4 py-2.5 font-medium">
                          {z.name} {z.region && <span className="text-xs text-ink-400">({z.region})</span>}
                        </td>
                        <td className="px-4 py-2.5 font-semibold">{formatPrice(z.fee)}</td>
                        <td className="px-4 py-2.5 text-ink-600">{z.maxDays <= 1 ? "24 h" : `${z.minDays} à ${z.maxDays} jours`}</td>
                        <td className="px-4 py-2.5">{z.expressAvailable ? "✓" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <h3 className="mb-2 font-bold">Nos boutiques (retrait gratuit)</h3>
              {PICKUP_STORES.map((s) => (
                <p key={s.id} className="text-sm text-ink-600">
                  <b className="text-ink-800">{s.name}</b> — {s.address} · {s.hours}
                </p>
              ))}
            </div>
            <div className="card p-4">
              <h3 className="mb-2 font-bold">Points relais</h3>
              {RELAY_POINTS.map((r) => (
                <p key={r.id} className="text-sm text-ink-600">
                  <b className="text-ink-800">{r.name}</b> — {r.address}
                </p>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-400">Exemple d&apos;estimation pour Bouaké : {estimateDelivery(ZONES.find((z) => z.id === "bouake")!)}.</p>
        </div>
      )}

      {slug === "tailles" && (
        <div className="mt-8 space-y-8">
          <p className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
            📏 Mesurez votre enfant sans chaussures, debout contre un mur. En cas d&apos;hésitation entre deux tailles, prenez la plus grande : les enfants grandissent vite ! L&apos;<b>échange de taille est gratuit pendant 15 jours</b>.
          </p>
          <section>
            <h2 className="mb-3 text-lg font-extrabold">Vêtements bébé et enfant</h2>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-4 py-2.5">Taille</th>
                    <th className="px-4 py-2.5">Âge</th>
                    <th className="px-4 py-2.5">Stature</th>
                    <th className="px-4 py-2.5">Tour de poitrine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {SIZE_GUIDE.map((r) => (
                    <tr key={r.size}>
                      <td className="px-4 py-2.5 font-semibold">{r.size}</td>
                      <td className="px-4 py-2.5 text-ink-600">{r.age}</td>
                      <td className="px-4 py-2.5 text-ink-600">{r.height}</td>
                      <td className="px-4 py-2.5 text-ink-600">{r.chest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-extrabold">Chaussures</h2>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[400px] text-sm">
                <thead className="bg-ink-50 text-left text-xs uppercase tracking-wider text-ink-500">
                  <tr>
                    <th className="px-4 py-2.5">Pointure</th>
                    <th className="px-4 py-2.5">Longueur du pied</th>
                    <th className="px-4 py-2.5">Âge indicatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {SHOE_GUIDE.map((r) => (
                    <tr key={r.size}>
                      <td className="px-4 py-2.5 font-semibold">{r.size}</td>
                      <td className="px-4 py-2.5 text-ink-600">{r.foot}</td>
                      <td className="px-4 py-2.5 text-ink-600">{r.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink-400">Astuce : posez le pied de votre enfant sur une feuille, tracez le contour et mesurez du talon au plus grand orteil, puis ajoutez 1 cm d&apos;aisance.</p>
          </section>
        </div>
      )}

      {slug === "paiement" && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PAYMENT_METHODS.map((m) => (
            <div key={m.id} className="card flex items-center gap-3 p-4">
              <span className={cn("grid h-10 min-w-14 place-items-center rounded-xl px-2 text-xs font-extrabold", m.color)}>{m.short}</span>
              <div>
                <p className="font-bold">{m.label}</p>
                <p className="text-sm text-ink-500">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {slug === "retours" && (
        <ol className="mt-8 space-y-3">
          {["Depuis « Mes commandes », cliquez sur « Demander un retour ».", "Choisissez les articles et le motif.", "Un livreur récupère le colis gratuitement sous 48 h (ou déposez-le en boutique).", "Échange de taille immédiat, ou remboursement en Mobile Money ou en bon d'achat (+5 %) sous 48 h après contrôle."].map((s, i) => (
            <li key={i} className="card flex items-center gap-4 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
              <span className="text-sm text-ink-700">{s}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
