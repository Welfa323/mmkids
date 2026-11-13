import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // SEO — redirections 301 (anciennes URLs -> nouvelles)
  async redirects() {
    return [
      { source: "/produit/:slug", destination: "/p/:slug", permanent: true },
      { source: "/categorie/:slug", destination: "/c/:slug", permanent: true },
      { source: "/search", destination: "/recherche", permanent: true },
      { source: "/cart", destination: "/panier", permanent: true },
      { source: "/promos", destination: "/collection/promotions", permanent: true },
    ];
  },
};

export default nextConfig;
