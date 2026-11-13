import type { MetadataRoute } from "next";
import { CATEGORIES, COLLECTIONS, getAllProducts, getBrands } from "@/modules/catalog";
import { POSTS, HELP_PAGES } from "@/modules/content";
import { SITE } from "@/shared/lib/site";
import { DEMO_NOW } from "@/shared/lib/clock";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string) => `${SITE.url}${path}`;
  return [
    { url: u("/"), lastModified: DEMO_NOW, changeFrequency: "daily", priority: 1 },
    { url: u("/categories"), changeFrequency: "weekly", priority: 0.6 },
    { url: u("/marques"), changeFrequency: "weekly", priority: 0.5 },
    { url: u("/blog"), changeFrequency: "weekly", priority: 0.5 },
    ...CATEGORIES.map((c) => ({ url: u(`/c/${c.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...CATEGORIES.flatMap((c) => c.subcategories.map((s) => ({ url: u(`/c/${c.slug}?sous=${s.slug}`), changeFrequency: "daily" as const, priority: 0.7 }))),
    ...COLLECTIONS.map((c) => ({ url: u(`/collection/${c.slug}`), changeFrequency: "daily" as const, priority: 0.7 })),
    ...getBrands().map((b) => ({ url: u(`/marque/${b.slug}`), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...getAllProducts().map((p) => ({ url: u(`/p/${p.slug}`), lastModified: new Date(p.createdAt), changeFrequency: "weekly" as const, priority: 0.9, images: [u(p.images[0])] })),
    ...POSTS.map((p) => ({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly" as const, priority: 0.5 })),
    ...Object.keys(HELP_PAGES).map((k) => ({ url: u(`/aide/${k}`), changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
