import seed from "./seed.json";
import type { Availability, Product, VariantOption } from "../types";
import { seeded, slugify } from "@/shared/lib/utils";
import { daysAgo, daysFromNow } from "@/shared/lib/clock";

/** Grilles de tailles enfant */
export type SizeKind = "bebe" | "bebe-acc" | "enfant" | "pointure" | "premiers-pas" | "dessous" | "chaussettes" | "tete";

interface SeedItem {
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  rating: number;
  images: string[];
  colors: string[];
  sizeKind: SizeKind | null;
  material: string;
  gender: "fille" | "garcon" | "mixte";
}

export const SIZE_SETS: Record<SizeKind, string[]> = {
  bebe: ["Naissance", "1 mois", "3 mois", "6 mois", "12 mois", "18 mois", "24 mois"],
  "bebe-acc": ["0-3 mois", "3-6 mois", "6-12 mois", "12-24 mois"],
  enfant: ["2 ans", "3 ans", "4 ans", "5 ans", "6 ans", "8 ans", "10 ans", "12 ans", "14 ans"],
  pointure: ["24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35"],
  "premiers-pas": ["17", "18", "19", "20", "21", "22", "23"],
  dessous: ["2-3 ans", "4-5 ans", "6-8 ans", "10-12 ans"],
  chaussettes: ["15-18", "19-22", "23-26", "27-30", "31-34"],
  tete: ["1-3 ans", "4-7 ans", "8-12 ans"],
};

/** Ordre d'affichage des tailles dans les filtres */
export const SIZE_ORDER: string[] = [...new Set(Object.values(SIZE_SETS).flat())];

const AGE_RANGE: Record<SizeKind, string> = {
  bebe: "0 – 24 mois",
  "bebe-acc": "0 – 24 mois",
  enfant: "2 – 14 ans",
  pointure: "3 – 12 ans",
  "premiers-pas": "9 – 24 mois",
  dessous: "2 – 12 ans",
  chaussettes: "0 – 12 ans",
  tete: "1 – 12 ans",
};

export const COLOR_HEX: Record<string, string> = {
  Blanc: "#f8fafc",
  Rose: "#f9a8d4",
  Fuchsia: "#db2777",
  "Bleu ciel": "#7dd3fc",
  Bleu: "#2563eb",
  "Bleu marine": "#1e3a8a",
  "Bleu jean": "#4a6fa5",
  Jaune: "#facc15",
  "Vert menthe": "#86efac",
  Vert: "#16a34a",
  Rouge: "#dc2626",
  Corail: "#fb7185",
  Lilas: "#c4b5fd",
  Gris: "#9ca3af",
  Beige: "#e7d7b8",
  Kaki: "#a68f5b",
  Orange: "#f97316",
  Noir: "#111827",
  Turquoise: "#2dd4bf",
  Marron: "#92400e",
  Doré: "#d4a72c",
  Argent: "#c0c4cc",
};

const GENDER_LABEL = { fille: "Fille", garcon: "Garçon", mixte: "Mixte" } as const;

/* -------------------------------------------------------------- textes */

const DESCRIPTIONS: Record<string, (p: SeedItem) => string> = {
  "bodies-grenouilleres": (p) =>
    `${p.name} : douceur et confort pour la peau délicate de bébé. Pressions faciles à l'entrejambe pour des changes rapides, coutures plates et tissu respirant adapté à la chaleur d'Abidjan.`,
  "ensembles-bebe": (p) => `${p.name}, une tenue mignonne et pratique pour les sorties, les visites et les photos de famille. Tissu doux, sans étiquette qui gratte.`,
  "accessoires-bebe": (p) => `${p.name} : l'accessoire indispensable de la valise de maternité et du quotidien de bébé. Matières douces et lavables en machine.`,
  "robes-fille": (p) => `${p.name} : une jolie robe facile à porter, pour l'école, les week-ends et les anniversaires. Coupe confortable qui laisse votre fille jouer et courir librement.`,
  "hauts-fille": (p) => `${p.name}, à associer avec une jupe, un short ou un jean. Tissu doux et résistant aux lavages répétés.`,
  "bas-fille": (p) => `${p.name} : taille élastiquée réglable pour suivre la croissance, tissu résistant pour la récréation.`,
  "ensembles-fille": (p) => `${p.name} : la tenue complète, déjà coordonnée. Pratique le matin avant l'école !`,
  "tshirts-garcon": (p) => `${p.name}, le basique que les garçons adorent. Imprimé résistant au lavage, col qui ne se déforme pas.`,
  "chemises-garcon": (p) => `${p.name} : une chemise élégante et respirante, parfaite pour les sorties, l'église ou les fêtes de famille.`,
  "bas-garcon": (p) => `${p.name} : solide, confortable et pensé pour bouger. Taille réglable à l'intérieur.`,
  "ensembles-garcon": (p) => `${p.name}, l'ensemble coordonné pour un look soigné en un instant.`,
  "robes-ceremonie": (p) => `${p.name} : pour briller lors des mariages, baptêmes, communions et anniversaires. Doublure en coton pour plus de confort, fermeture dans le dos.`,
  "costumes-garcon": (p) => `${p.name} : élégance garantie pour les mariages, dots et cérémonies. Coupe ajustée et tissu infroissable.`,
  "tenues-traditionnelles": (p) => `${p.name} : le meilleur de nos tissus ivoiriens, en version enfant. Cousu par nos couturiers partenaires à Abidjan, idéal pour les fêtes, la Tabaski, Noël et les cérémonies traditionnelles.`,
  "baskets-enfant": (p) => `${p.name} : légères, amorties et faciles à enfiler seul. Semelle antidérapante pour la cour de récréation.`,
  "sandales-enfant": (p) => `${p.name}, fraîches et pratiques pour la saison chaude, la plage et les vacances au village.`,
  "chaussures-habillees": (p) => `${p.name} : la touche finale des tenues de fête. Intérieur rembourré pour un confort toute la journée.`,
  "premiers-pas": (p) => `${p.name} : semelle souple et flexible qui respecte le développement du pied de bébé. Recommandées par les pédiatres pour les premiers pas.`,
  pyjamas: (p) => `${p.name} : tout doux pour des nuits paisibles. Coton respirant, élastiques souples qui ne serrent pas.`,
  "sous-vetements": (p) => `${p.name} : coton doux et élastique couvert pour un confort optimal toute la journée.`,
  "chaussettes-collants": (p) => `${p.name}, maille douce et renforts aux talons et aux pointes pour durer plus longtemps.`,
  survetements: (p) => `${p.name} : pour le sport à l'école, le foot entre amis et les week-ends actifs. Tissu respirant à séchage rapide.`,
  "maillots-sport": (p) => `${p.name} : léger et respirant pour bouger sans contrainte.`,
  "maillots-bain": (p) => `${p.name} : protection anti-UV et séchage rapide pour profiter de la plage à Grand-Bassam ou Assinie en toute sécurité.`,
  uniformes: (p) => `${p.name} : conforme aux couleurs des établissements ivoiriens. Tissu résistant, facile à laver et à repasser. Retouches possibles en boutique.`,
  "sacs-scolaires": (p) => `${p.name} : dos rembourré, bretelles réglables et compartiments pour ranger cahiers et goûter.`,
  "sweats-gilets": (p) => `${p.name}, idéal pour les matinées fraîches de l'harmattan et la saison des pluies.`,
  "chapeaux-casquettes": (p) => `${p.name} pour protéger votre enfant du soleil, à la récré comme en vacances.`,
  "accessoires-cheveux": (p) => `${p.name} : pour des coiffures pleines de fantaisie, qui tiennent toute la journée sans tirer les cheveux.`,
  "lunettes-montres": (p) => `${p.name} : l'accessoire qui fait plaisir, solide et adapté aux enfants.`,
};

const HIGHLIGHTS: Record<string, string[]> = {
  bebe: ["Doux pour la peau de bébé", "Lavable en machine à 40 °C", "Échange de taille gratuit"],
  fille: ["Tissu doux et respirant", "Résiste aux lavages", "Échange de taille gratuit 15 jours"],
  garcon: ["Tissu doux et respirant", "Résiste aux lavages", "Échange de taille gratuit 15 jours"],
  ceremonie: ["Finitions soignées", "Doublure en coton", "Retouches possibles en boutique"],
  chaussures: ["Semelle antidérapante", "Facile à enfiler seul", "Échange de pointure gratuit"],
  nuit: ["Coton doux", "Élastiques souples", "Lavable en machine"],
  "sport-plage": ["Séchage rapide", "Respirant", "Idéal pour le sport et la plage"],
  ecole: ["Tissu résistant", "Facile d'entretien", "Retouches possibles en boutique"],
  accessoires: ["Adapté aux enfants", "Solide et léger", "Idée cadeau"],
};

const SUB_HIGHLIGHTS: Record<string, string[]> = {
  "tenues-traditionnelles": ["Tissu ivoirien", "Cousu à Abidjan", "Pièce unique pour les fêtes"],
  "maillots-bain": ["Protection anti-UV 50+", "Séchage rapide", "Résiste au chlore et au sel"],
  "premiers-pas": ["Semelle souple et flexible", "Recommandées par les pédiatres", "Fermeture velcro facile"],
  uniformes: ["Couleurs réglementaires", "Tissu résistant", "Prix spécial dès 3 pièces"],
};

const LOCAL_BRANDS = ["Petit Baobab", "Akwaba Kids", "Wax Junior", "Lagune Kids", "École Plus", "MMKids"];

const CARE: Record<string, string> = {
  chaussures: "Nettoyer avec un chiffon humide",
  accessoires: "Nettoyer avec un chiffon doux",
  ceremonie: "Lavage à la main ou nettoyage à sec",
};

/* -------------------------------------------------------------- variantes */

function buildOptions(p: SeedItem, rnd: ReturnType<typeof seeded>): VariantOption[] {
  const options: VariantOption[] = [];
  if (p.sizeKind) {
    const labels = SIZE_SETS[p.sizeKind];
    const isShoe = p.sizeKind === "pointure" || p.sizeKind === "premiers-pas" || p.sizeKind === "chaussettes";
    options.push({ name: isShoe ? "Pointure" : "Taille", values: labels.map((l) => ({ label: l, stock: rnd.chance(0.15) ? 0 : rnd.int(1, 14) })) });
  }
  if (p.colors.length) {
    options.push({
      name: "Couleur",
      values: p.colors.map((n, i) => ({ label: n, hex: COLOR_HEX[n] ?? "#999", stock: i > 0 && rnd.chance(0.15) ? 0 : rnd.int(3, 25) })),
    });
  }
  return options;
}

/* -------------------------------------------------------------- vidéos */

const VIDEOS = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
];
const WITH_VIDEO = new Set(["robe-de-ceremonie-satin-et-tulle", "baskets-lumineuses-led", "costume-garcon-3-pieces", "robe-en-wax-fille"]);

/** Produits « bientôt disponibles » (précommande / alerte) */
const COMING_SOON: Record<string, number> = {
  "robe-demoiselle-d-honneur": 6,
  "baskets-running-junior": 9,
  "cartable-primaire-a-roulettes": 14,
  "veste-coupe-vent-legere": 21,
  "gigoteuse-turbulette-0-6-mois": 30,
};
const FLASH = new Set([
  "lot-de-3-bodies-coton-bio",
  "robe-d-ete-fleurie",
  "t-shirt-garcon-dinosaure",
  "baskets-lumineuses-led",
  "pyjama-court-fille-licorne",
  "maillot-de-bain-fille-une-piece",
  "sac-a-dos-maternelle",
  "short-cargo-garcon",
  "sandales-fille-a-fleurs",
  "lot-de-7-paires-de-chaussettes",
  "casquette-enfant-brodee",
  "ensemble-garcon-t-shirt-et-short",
]);
const STORES = ["Boutique Cocody", "Boutique Marcory", "Boutique Yopougon", "Entrepôt central Abidjan"];

const COST_RATIO: Record<string, number> = {
  bebe: 0.46,
  fille: 0.45,
  garcon: 0.45,
  ceremonie: 0.5,
  chaussures: 0.55,
  nuit: 0.44,
  "sport-plage": 0.5,
  ecole: 0.58,
  accessoires: 0.4,
};

function enrich(p: SeedItem, index: number): Product {
  const rnd = seeded(index * 7919 + 17);
  const slug = p.slug;
  const price = p.price;
  const isFlash = FLASH.has(slug);
  const hasPromo = isFlash || rnd.chance(0.38);
  const discountPct = hasPromo ? (isFlash ? rnd.int(25, 45) : rnd.pick([10, 15, 20, 25, 30])) : undefined;
  // Prix barré cohérent : prix actuel = prix de référence − remise
  const compareAtPrice = discountPct ? Math.round(price / (1 - discountPct / 100) / 100) * 100 : undefined;

  const comingInDays = COMING_SOON[slug];
  let stock = rnd.chance(0.07) ? 0 : rnd.chance(0.14) ? rnd.int(1, 5) : rnd.int(12, 180);
  if (comingInDays) stock = 0;
  const availability: Availability = comingInDays ? "coming_soon" : stock === 0 ? "out_of_stock" : stock <= 5 ? "low_stock" : "in_stock";

  const options = buildOptions(p, rnd);
  const colorOpt = options.find((o) => o.name === "Couleur");
  const sizeOpt = options.find((o) => o.name === "Taille" || o.name === "Pointure");

  const createdDaysAgo = rnd.chance(0.22) ? rnd.int(1, 25) : rnd.int(30, 420);
  const soldCount = Math.round(rnd.int(20, 900) * (price < 8000 ? 1.8 : price > 20000 ? 0.5 : 1));
  const reviewCount = Math.max(0, Math.round(soldCount * rnd.next() * 0.22));
  const isLocal = LOCAL_BRANDS.includes(p.brand);
  const weightKg = p.category === "chaussures" ? Math.round((0.3 + rnd.next() * 0.4) * 10) / 10 : Math.round((0.1 + rnd.next() * 0.6) * 10) / 10;
  const sku = `MK-${p.category.slice(0, 3).toUpperCase()}-${String(1000 + index).padStart(4, "0")}`;

  const specs = [
    { label: "Marque", value: p.brand },
    { label: "Référence", value: sku },
    { label: "Genre", value: GENDER_LABEL[p.gender] },
    ...(p.sizeKind ? [{ label: "Âge", value: AGE_RANGE[p.sizeKind] }] : []),
    { label: "Matière", value: p.material },
    { label: "Entretien", value: CARE[p.category] ?? "Lavage en machine à 30 °C, à l'envers" },
    { label: "Origine", value: isLocal ? "Côte d'Ivoire" : "Importé" },
    { label: "Poids", value: `${String(weightKg).replace(".", ",")} kg` },
    ...options.map((o) => ({ label: o.name === "Couleur" ? "Couleurs" : o.name === "Taille" ? "Tailles" : "Pointures", value: o.values.map((v) => v.label).join(", ") })),
  ];

  return {
    id: `p${String(index + 1).padStart(3, "0")}`,
    sku,
    slug,
    name: p.name,
    brand: slugify(p.brand),
    brandName: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    price,
    compareAtPrice,
    discountPct,
    costPrice: Math.round((price * (COST_RATIO[p.category] ?? 0.5) * (0.9 + rnd.next() * 0.2)) / 100) * 100,
    images: p.images,
    video: WITH_VIDEO.has(slug) ? VIDEOS[index % VIDEOS.length] : undefined,
    rating: p.rating,
    reviewCount,
    soldCount,
    stock,
    availability,
    availableAt: comingInDays ? daysFromNow(comingInDays).toISOString() : undefined,
    isNew: createdDaysAgo <= 25 || Boolean(comingInDays),
    isFlashSale: isFlash && stock > 0,
    flashSoldPct: isFlash ? rnd.int(35, 92) : undefined,
    createdAt: daysAgo(createdDaysAgo).toISOString(),
    options,
    colors: colorOpt?.values.map((v) => v.label) ?? [],
    sizes: sizeOpt?.values.map((v) => v.label) ?? [],
    description: (DESCRIPTIONS[p.subcategory] ?? ((x: SeedItem) => `${x.name}, sélectionné avec soin par l'équipe MMKids.`))(p),
    highlights: SUB_HIGHLIGHTS[p.subcategory] ?? HIGHLIGHTS[p.category] ?? ["Sélectionné par MMKids", "Livraison rapide", "Échange gratuit 15 jours"],
    specs,
    tags: [p.subcategory, p.category, p.gender, p.brand.toLowerCase(), p.material.toLowerCase(), ...(isLocal ? ["made in ci", "local"] : [])],
    warrantyMonths: 0,
    weightKg,
    sellerStore: STORES[index % STORES.length],
  };
}

export const PRODUCTS: Product[] = (seed as SeedItem[]).map(enrich);
