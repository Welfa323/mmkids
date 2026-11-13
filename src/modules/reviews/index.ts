/**
 * Module Avis clients : note /5, commentaire, photos, avis vérifiés, réponse et modération.
 */
import { getAllProducts, type Product } from "@/modules/catalog";
import { CUSTOMERS } from "@/modules/crm";
import { daysAgo } from "@/shared/lib/clock";
import { seeded } from "@/shared/lib/utils";

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  author: string;
  city: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  hasVideo: boolean;
  verified: boolean;
  helpful: number;
  createdAt: string;
  status: "publie" | "en_attente" | "masque";
  reply?: { author: string; message: string; at: string };
  flagged?: boolean;
}

const POSITIVE: [string, string][] = [
  ["Ma fille adore !", "Tissu très doux, conforme à la photo. Elle ne veut plus l'enlever 😄 Livré en moins de 24 h à Cocody."],
  ["Top qualité", "Après plusieurs lavages, les couleurs n'ont pas bougé. Très bonne qualité pour le prix."],
  ["Livraison rapide", "Commandé le matin, reçu l'après-midi pour l'anniversaire de mon fils. Merci MMKids !"],
  ["Taille parfaite", "J'ai suivi le guide des tailles, ça tombe pile. J'ai payé avec Wave, aucun souci."],
  ["Je recommande", "Troisième commande pour mes enfants, toujours aussi sérieux. Le suivi de commande est très pratique."],
  ["Excellent rapport qualité/prix", "Acheté pendant les ventes flash pour toute la fratrie, une vraie affaire."],
  ["Superbe pour la cérémonie", "Mon petit était le plus beau du mariage ! Finitions soignées."],
];
const MIXED: [string, string][] = [
  ["Bien mais taille petit", "Joli article, mais ça taille un peu petit : prenez une taille au-dessus."],
  ["Correct", "Conforme dans l'ensemble, la couleur est un peu plus claire que sur la photo."],
  ["Bon produit", "Rien à redire sur la qualité, la livraison a pris un jour de plus à Yopougon."],
];
const NEGATIVE: [string, string][] = [
  ["Trop petit", "La taille ne correspondait pas, j'ai dû faire un échange. Le nouvel article est arrivé rapidement par contre."],
  ["Pas terrible", "Le tissu bouloche après quelques lavages. Le service client a quand même été réactif."],
];

function build(): Review[] {
  const reviews: Review[] = [];
  getAllProducts().forEach((p, pi) => {
    const r = seeded(pi * 97 + 3);
    const n = Math.min(7, Math.max(p.reviewCount > 0 ? 2 : 0, Math.round(p.reviewCount / 12)));
    for (let k = 0; k < n; k++) {
      const roll = r.next();
      const rating = p.rating >= 4.4 ? (roll < 0.75 ? 5 : roll < 0.93 ? 4 : 3) : roll < 0.45 ? 5 : roll < 0.75 ? 4 : roll < 0.9 ? 3 : r.pick([1, 2]);
      const [title, comment] = rating >= 4 ? r.pick(POSITIVE) : rating === 3 ? r.pick(MIXED) : r.pick(NEGATIVE);
      const c = CUSTOMERS[r.int(1, CUSTOMERS.length - 1)];
      const withPhoto = r.chance(0.3) && p.images.length > 1;
      const status: Review["status"] = r.chance(0.06) ? "en_attente" : rating <= 2 && r.chance(0.2) ? "masque" : "publie";
      const at = daysAgo(r.int(1, 200), r.int(8, 22));
      reviews.push({
        id: `rv-${p.id}-${k}`,
        productId: p.id,
        productName: p.name,
        productImage: p.images[0],
        author: `${c.name.split(" ")[0]} ${c.name.split(" ")[1]?.[0] ?? ""}.`,
        city: c.commune,
        rating,
        title,
        comment,
        photos: withPhoto ? [p.images[1]] : [],
        hasVideo: r.chance(0.05),
        verified: r.chance(0.85),
        helpful: r.int(0, 42),
        createdAt: at.toISOString(),
        status,
        flagged: status === "masque",
        reply:
          rating <= 3 || r.chance(0.15)
            ? {
                author: "Service client MMKids",
                message: rating <= 3 ? `Merci pour votre retour ${c.name.split(" ")[0]}. Nous sommes désolés pour ce désagrément, notre équipe vous contacte sur WhatsApp pour trouver une solution.` : "Merci beaucoup pour votre confiance, à très bientôt sur MMKids !",
                at: new Date(at.getTime() + 86_400_000).toISOString(),
              }
            : undefined,
      });
    }
  });
  return reviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const REVIEWS = build();

export function getProductReviews(product: Product) {
  return REVIEWS.filter((r) => r.productId === product.id && r.status === "publie");
}

export function ratingDistribution(product: Product) {
  // Distribution cohérente avec la note moyenne et le nombre d'avis du produit
  const total = product.reviewCount;
  const avg = product.rating;
  const weights = [1, 2, 3, 4, 5].map((s) => Math.exp(-Math.pow(s - avg, 2) * 1.4));
  const sumW = weights.reduce((a, b) => a + b, 0);
  return [5, 4, 3, 2, 1].map((s) => ({ stars: s, count: Math.round((weights[s - 1] / sumW) * total) }));
}
