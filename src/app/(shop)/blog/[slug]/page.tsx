import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { getPost, POSTS } from "@/modules/content";
import { getProductBySlug, type Product } from "@/modules/catalog";
import { ProductCard } from "@/modules/catalog/components/product-card";
import { Breadcrumbs } from "@/shared/ui/misc";
import { SITE } from "@/shared/lib/site";
import { formatDate } from "@/shared/lib/format";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: [post.cover], publishedTime: post.date },
  };
}

export default async function PostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();
  const products = post.productSlugs.map(getProductBySlug).filter((p): p is Product => Boolean(p));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
    image: `${SITE.url}${post.cover}`,
  };
  return (
    <article className="container-page max-w-3xl py-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Le Mag", href: "/blog" }, { label: post.category }]} />
      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-brand-700">{post.category}</p>
      <h1 className="mt-2 text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
        {post.author} · {formatDate(post.date, { long: true })} · <Clock className="size-4" /> {post.readMinutes} min de lecture
      </p>
      <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-ink-50">
        <Image src={post.cover} alt="" fill sizes="768px" className="object-contain p-12" priority />
      </div>
      <div className="mt-8 space-y-5 text-[17px] leading-8 text-ink-700">
        {post.body.map((b, i) => (
          <div key={i}>
            {b.heading && <h2 className="mb-2 text-xl font-extrabold text-ink-900">{b.heading}</h2>}
            <p>{b.text}</p>
          </div>
        ))}
      </div>
      {products.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-extrabold">Les produits de l&apos;article</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
