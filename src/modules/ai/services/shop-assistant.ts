/**
 * Assistant client (chatbot) — moteur à intentions + recommandations personnalisées.
 * Interface prête à être branchée sur un LLM : seule `answerCustomer` change.
 */
import { getAllProducts, getPopular, sortProducts, type Product } from "@/modules/catalog";
import { searchProducts } from "@/modules/search";
import { ZONES } from "@/modules/delivery";
import { getOrder } from "@/modules/orders";
import { ORDER_STATUS } from "@/modules/orders/status";
import { formatPrice } from "@/shared/lib/format";
import { normalize } from "@/shared/lib/utils";
import { SITE } from "@/shared/lib/site";

export interface AssistantReply {
  text: string;
  products?: Product[];
  links?: { label: string; href: string }[];
  quickReplies?: string[];
}

const CATEGORY_HINTS: [RegExp, string][] = [
  [/cadeau|anniversaire|offrir/, "cadeau"],
  [/ceremonie|mariage|bapteme|communion|costume/, "ceremonie"],
  [/wax|pagne|boubou|kita|tradition/, "wax"],
  [/bebe|naissance|nourrisson|layette|body/, "bebe"],
  [/uniforme|ecole|rentree|cartable/, "ecole"],
  [/pyjama|nuit|dodo/, "pyjamas"],
  [/plage|piscine|maillot de bain|bain/, "maillots-bain"],
  [/chaussure|basket|sandale|ballerine|premiers pas/, "chaussures"],
  [/robe/, "robe"],
  [/fille|fillette/, "fille"],
  [/garcon|garconnet/, "garcon"],
];

/** « 3 ans », « 6 mois », « pointure 30 » -> tailles compatibles */
function parseAge(t: string): string | undefined {
  const m = t.match(/(\d{1,2})\s*(ans|an|mois)\b/);
  if (!m) return undefined;
  return `${m[1]} ${m[2] === "mois" ? "mois" : "ans"}`;
}

function parseBudget(t: string): number | undefined {
  const m = t.replace(/\d{1,2}\s*(ans|an|mois)\b/g, "").match(/(\d[\d\s.]*)\s*(k|mille|000|fcfa|f\b|cfa)?/);
  if (!m) return undefined;
  let n = Number(m[1].replace(/[\s.]/g, ""));
  if (m[2] === "k" || m[2] === "mille") n *= 1000;
  return n >= 1000 ? n : undefined;
}

export function answerCustomer(message: string): AssistantReply {
  const t = normalize(message);

  if (/^(bonjour|bonsoir|salut|hello|coucou|akwaba|bjr)/.test(t))
    return {
      text: "Akwaba 👋 Je suis Awa, l'assistante MMKids. Je peux vous aider à trouver une tenue pour votre enfant, choisir la bonne taille, suivre une commande ou répondre à vos questions sur la livraison et le paiement.",
      quickReplies: ["Une robe pour 4 ans à moins de 15 000", "Guide des tailles", "Où est ma commande ?", "Frais de livraison"],
    };

  const orderRef = message.match(/MK-\d{6}-\d{4}/i)?.[0];
  if (orderRef) {
    const o = getOrder(orderRef.toUpperCase());
    if (!o) return { text: `Je ne trouve pas la commande ${orderRef}. Vérifiez le numéro reçu par SMS ou consultez « Mes commandes ».`, links: [{ label: "Mes commandes", href: "/compte/commandes" }] };
    return {
      text: `La commande ${o.number} est actuellement : **${ORDER_STATUS[o.status].customerLabel}**.${o.carrier ? ` Transporteur : ${o.carrier}.` : ""}${o.trackingNumber ? ` N° de suivi : ${o.trackingNumber}.` : ""}`,
      links: [{ label: "Voir le suivi détaillé", href: `/suivi?commande=${o.number}` }],
    };
  }
  if (/suivi|ou est|commande|livre quand|colis/.test(t))
    return {
      text: "Pour suivre une commande, donnez-moi son numéro (ex. MK-261026-8017) ou consultez votre espace client : vous y verrez chaque étape (préparée → expédiée → en route → livrée).",
      links: [{ label: "Suivre ma commande", href: "/suivi" }, { label: "Mes commandes", href: "/compte/commandes" }],
      quickReplies: ["MK-261026-8017"],
    };

  if (/livraison|frais|delai|livrez|livrer/.test(t)) {
    const zone = ZONES.find((z) => t.includes(normalize(z.name)));
    if (zone)
      return {
        text: `Livraison à ${zone.name} : ${formatPrice(zone.fee)} en standard (${zone.maxDays <= 1 ? "24 h" : `${zone.minDays} à ${zone.maxDays} jours`})${zone.expressAvailable ? ", express en 3 h disponible (+2 000 FCFA)" : ""}. Gratuite dès ${formatPrice(zone.group === "abidjan" ? SITE.freeShippingThreshold : 50000)} d'achat.`,
      };
    return {
      text: "À Abidjan : 1 500 FCFA (Cocody, Plateau, Marcory…) à 2 000 FCFA (Yopougon, Abobo…), gratuite dès 30 000 FCFA. Intérieur : 2 500 à 4 500 FCFA selon la ville. Express en 3 h, livraison programmée, point relais et retrait gratuit en boutique sont aussi disponibles.",
      links: [{ label: "Tous les tarifs", href: "/aide/livraison" }],
      quickReplies: ["Livraison à Yopougon", "Livraison à Bouaké"],
    };
  }

  if (/paiement|payer|orange|wave|momo|moov|carte|plusieurs fois|acompte/.test(t))
    return {
      text: "Vous pouvez payer par Orange Money, MTN MoMo, Wave, Moov Money, carte bancaire (Visa/Mastercard), en 3 fois sans frais dès 30 000 FCFA, avec un acompte de 30 %, par virement ou à la livraison. Le paiement Mobile Money est confirmé automatiquement.",
      links: [{ label: "En savoir plus", href: "/aide/paiement" }],
    };

  if (/taille|mesure|guide|grandit|quelle pointure/.test(t) && !/\d/.test(t))
    return {
      text: "Mesurez votre enfant debout, sans chaussures : c'est la stature qui compte plus que l'âge. Exemple : 102 cm = 4 ans, 114 cm = 6 ans, 126 cm = 8 ans. En cas de doute, prenez la taille au-dessus — et l'échange est gratuit pendant 15 jours.",
      links: [{ label: "Guide des tailles complet", href: "/aide/tailles" }],
      quickReplies: ["Un pyjama pour 6 ans", "Des chaussures pointure 28"],
    };

  if (/retour|rembourse|echange|annul/.test(t))
    return {
      text: "La taille ne va pas ? L'échange est gratuit pendant 15 jours, en boutique ou par livreur. Pour un remboursement, vous disposez de 7 jours après livraison. Depuis « Mes commandes », cliquez sur « Demander un retour » ; le remboursement est effectué sous 48 h en Mobile Money ou en bon d'achat. Une commande non expédiée peut être annulée en un clic.",
      links: [{ label: "Mes commandes", href: "/compte/commandes" }],
    };

  if (/code|promo|reduction|coupon|bon plan/.test(t))
    return {
      text: "Codes du moment : BIENVENUE10 (−10 % première commande), AKWABA5000 (−5 000 FCFA dès 30 000), CHAUSSURES20 (−20 % sur les chaussures enfant jusqu'au 15 novembre), LIVRAISON0 (livraison offerte jusqu'au 31 octobre), ANNIV15 (−15 % le mois de l'anniversaire de votre enfant).",
      links: [{ label: "Voir les promotions", href: "/collection/promotions" }],
    };

  if (/boutique|magasin|horaire|adresse/.test(t))
    return {
      text: "Nos boutiques : Cocody (Riviera 2, lun–sam 8h30–20h), Marcory (Zone 4, lun–sam 9h–20h) et Yopougon (Siporex, 7j/7 8h–21h). Le retrait en boutique est gratuit et prêt en 2 h.",
    };

  // Recommandations
  const budget = parseBudget(t);
  const age = parseAge(t);
  const shoeSize = t.match(/pointure\s*(\d{2})/)?.[1];
  const hint = CATEGORY_HINTS.find(([re]) => re.test(t))?.[1];
  if (hint || budget || age || shoeSize || /cherche|recommand|conseil|idee|besoin|veux|voudrais/.test(t)) {
    let pool: Product[];
    const all = getAllProducts();
    if (hint === "cadeau") pool = all.filter((p) => ["robes-ceremonie", "ensembles-bebe", "pyjamas", "baskets-enfant", "lunettes-montres", "tenues-traditionnelles", "sacs-scolaires"].includes(p.subcategory));
    else if (hint === "wax") pool = all.filter((p) => p.tags.some((x) => x.includes("wax") || x.includes("pagne") || x.includes("bazin")));
    else if (hint === "robe") pool = all.filter((p) => normalize(p.name).includes("robe"));
    else if (hint) pool = all.filter((p) => p.category === hint || p.subcategory.includes(hint));
    else pool = searchProducts(message).products;
    if (/fille|fillette/.test(t) && hint !== "fille") pool = pool.filter((p) => !p.tags.includes("garcon"));
    if (/garcon/.test(t) && hint !== "garcon") pool = pool.filter((p) => !p.tags.includes("fille"));
    if (!pool.length) pool = getPopular(30);
    pool = pool.filter((p) => p.availability !== "out_of_stock" && p.availability !== "coming_soon");
    if (budget) pool = pool.filter((p) => p.price <= budget);
    if (age) pool = pool.filter((p) => !p.sizes.length || p.sizes.includes(age) || p.options.every((o) => o.name !== "Taille"));
    if (shoeSize) pool = pool.filter((p) => p.sizes.includes(shoeSize));
    const picks = sortProducts(pool, "popularite").slice(0, 4);
    if (!picks.length) return { text: `Je n'ai rien trouvé${budget ? ` sous ${formatPrice(budget)}` : ""}. Voulez-vous élargir votre budget ?`, quickReplies: ["Les meilleures ventes", "Les promotions"] };
    return {
      text: `Voici ${picks.length} suggestion${picks.length > 1 ? "s" : ""}${age ? ` disponible${picks.length > 1 ? "s" : ""} en ${age}` : ""}${shoeSize ? ` en pointure ${shoeSize}` : ""}${budget ? ` à moins de ${formatPrice(budget)}` : ""}, choisies selon les avis des parents et les ventes :`,
      products: picks,
      quickReplies: ["Moins cher", "Guide des tailles", "Livraison à Cocody"],
    };
  }

  if (/meilleure|top|populaire/.test(t)) return { text: "Les produits les plus populaires en ce moment :", products: getPopular(4) };

  return {
    text: "Je n'ai pas bien compris 🙏 Vous pouvez me demander par exemple : « une robe pour 4 ans à moins de 15 000 », « un uniforme pour 8 ans », « livraison à Yopougon » ou « où est ma commande ? ». Un conseiller est aussi joignable sur WhatsApp.",
    quickReplies: ["Une idée cadeau d'anniversaire", "Tenue de cérémonie garçon", "Parler à un conseiller"],
  };
}
