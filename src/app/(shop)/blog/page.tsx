import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { POSTS } from "@/modules/content";
import { Breadcrumbs } from "@/shared/ui/misc";
import { formatDate } from "@/shared/lib/format";

export const metadata: Metadata = {
  title: "Le Mag — conseils, guides d'achat et tendances",
  description: "Guides d'achat, tendances mode, astuces maison et conseils pour acheter malin en Côte d'Ivoire.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const [first, ...rest] = POSTS;
  return (
    <div className="container-page py-5">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Le Mag" }]} />
      <h1 className="mb-6 mt-4 text-3xl font-extrabold tracking-tight">Le Mag MMKids</h1>
      <Link href={`/blog/${first.slug}`} className="card group grid overflow-hidden md:grid-cols-2">
        <span className="relative aspect-[16/10] bg-gradient-to-br from-brand-50 to-ink-50 md:aspect-auto">
          <Image src={first.cover} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-10 transition duration-500 group-hover:scale-105" />
        </span>
        <span className="flex flex-col justify-center p-6 sm:p-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{first.category}</span>
          <span className="mt-2 text-2xl font-extrabold leading-tight group-hover:text-brand-700 sm:text-3xl">{first.title}</span>
          <span className="mt-3 text-ink-600">{first.excerpt}</span>
          <span className="mt-4 flex items-center gap-2 text-xs text-ink-400">
            {formatDate(first.date)} · <Clock className="size-3.5" /> {first.readMinutes} min
          </span>
        </span>
      </Link>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card group overflow-hidden">
            <span className="relative block aspect-[16/10] bg-ink-50">
              <Image src={p.cover} alt="" fill sizes="400px" className="object-contain p-8 transition duration-500 group-hover:scale-105" />
            </span>
            <span className="block p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">{p.category}</span>
              <span className="mt-1 line-clamp-2 block font-bold leading-snug group-hover:text-brand-700">{p.title}</span>
              <span className="mt-2 line-clamp-2 block text-sm text-ink-500">{p.excerpt}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
