import type { MetadataRoute } from "next";
import { SITE } from "@/shared/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/compte", "/panier", "/commande", "/facture", "/recherche?"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
