import type { MetadataRoute } from "next";
import { SITE } from "@/shared/lib/site";

/** PWA : installable sur l'écran d'accueil, sans passer par le Play Store */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f9",
    theme_color: "#0c805e",
    lang: "fr-CI",
    orientation: "portrait",
    categories: ["shopping"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Ventes flash", url: "/collection/ventes-flash" },
      { name: "Mes commandes", url: "/compte/commandes" },
      { name: "Panier", url: "/panier" },
    ],
  };
}
