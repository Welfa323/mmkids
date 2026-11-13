/**
 * Module Contenu : blog (SEO), pages d'aide et guide des tailles.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readMinutes: number;
  cover: string;
  body: { heading?: string; text: string }[];
  productSlugs: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "choisir-la-bonne-taille-pour-son-enfant",
    title: "Comment choisir la bonne taille de vêtement pour son enfant ?",
    excerpt: "Âge, stature, morphologie : nos conseils pour commander en ligne sans se tromper (et sans racheter tous les 3 mois).",
    category: "Guides pratiques",
    author: "Équipe MMKids",
    date: "2026-10-18",
    readMinutes: 5,
    cover: "/images/products/ensemble-garcon-t-shirt-et-short/1.webp",
    body: [
      { text: "Commander des vêtements pour enfants en ligne inquiète souvent les parents : « Et si c'est trop petit ? ». Bonne nouvelle : avec quelques repères simples, on vise juste presque à chaque fois." },
      { heading: "1. Fiez-vous à la stature plutôt qu'à l'âge", text: "Deux enfants de 4 ans peuvent avoir 10 cm d'écart. Mesurez votre enfant debout contre un mur, sans chaussures, et comparez avec notre guide des tailles : c'est la stature qui compte." },
      { heading: "2. En cas de doute, prenez la taille au-dessus", text: "Les enfants grandissent vite, surtout avant 3 ans. Une manche un peu longue se retrousse ; un body trop petit ne se porte plus." },
      { heading: "3. Pour les chaussures, ajoutez 1 cm", text: "Tracez le contour du pied sur une feuille, mesurez du talon au plus grand orteil, puis ajoutez 1 cm d'aisance pour que les orteils ne touchent pas le bout." },
      { heading: "Et si ça ne va pas ?", text: "L'échange de taille est gratuit pendant 15 jours chez MMKids, en boutique ou par livreur. Gardez simplement l'étiquette." },
    ],
    productSlugs: ["ensemble-garcon-t-shirt-et-short", "robe-d-ete-fleurie", "chaussures-premiers-pas-cuir-souple", "baskets-a-scratch-enfant"],
  },
  {
    slug: "tenues-ceremonie-enfants",
    title: "Mariages, baptêmes, dots : habiller ses enfants pour les cérémonies",
    excerpt: "Robes en tulle, costumes 3 pièces, boubous brodés et pagnes : nos idées pour des petits invités élégants et à l'aise.",
    category: "Tendances",
    author: "Aïcha, styliste partenaire",
    date: "2026-10-05",
    readMinutes: 4,
    cover: "/images/products/robe-de-ceremonie-satin-et-tulle/1.webp",
    body: [
      { text: "La saison des cérémonies bat son plein et les enfants sont souvent les stars des photos de famille. Le secret : une tenue élégante, mais dans laquelle ils peuvent danser et s'asseoir par terre !" },
      { heading: "Le wax et le pagne, version enfant", text: "Les ateliers ivoiriens comme Akwaba Kids et Wax Junior proposent des coupes modernes : robe kita, ensemble pagne haut + jupe, boubou brodé. Parfait pour coordonner toute la famille." },
      { heading: "Pour les garçons", text: "Un costume 3 pièces ou un simple gilet avec chemise blanche et nœud papillon : effet garanti. Prévoyez des mocassins confortables, déjà portés une fois à la maison." },
      { heading: "Pour les filles", text: "Robe en tulle, ballerines vernies et serre-tête à nœud. Choisissez une doublure en coton : sous la chaleur, c'est indispensable." },
    ],
    productSlugs: ["robe-de-ceremonie-satin-et-tulle", "costume-garcon-3-pieces", "boubou-garcon-brode", "robe-kita-fille"],
  },
  {
    slug: "liste-rentree-scolaire-uniformes",
    title: "Rentrée scolaire : la liste complète des uniformes et indispensables",
    excerpt: "Chemises kaki ou bleu ciel, shorts, jupes plissées, sac à dos : comment tout préparer sans exploser le budget.",
    category: "Rentrée",
    author: "Équipe MMKids",
    date: "2026-08-21",
    readMinutes: 5,
    cover: "/images/products/pack-uniforme-chemise-et-short/1.webp",
    body: [
      { text: "Chaque année, la rentrée est un gros budget pour les familles. Voici la liste type pour un enfant du primaire, pour moins de 40 000 FCFA." },
      { heading: "Les uniformes : prévoyez-en 3", text: "Un sur l'enfant, un au lavage, un de rechange. Nos chemises d'uniforme en polycoton sèchent vite et se repassent facilement. Le pack chemise + short est le plus économique." },
      { heading: "Le sac à dos", text: "Choisissez un dos rembourré et des bretelles réglables. Pour les petits du primaire, le cartable à roulettes soulage le dos." },
      { heading: "Pour la saison des pluies", text: "Une veste coupe-vent légère et un sweat à capuche pour les matinées fraîches de l'harmattan." },
    ],
    productSlugs: ["pack-uniforme-chemise-et-short", "chemise-d-uniforme-kaki", "jupe-d-uniforme-plissee", "sac-a-dos-maternelle"],
  },
  {
    slug: "payer-mobile-money-en-securite",
    title: "Payer en ligne avec Mobile Money en toute sécurité",
    excerpt: "Orange Money, MTN MoMo, Wave, Moov : comment fonctionne le paiement et comment éviter les arnaques.",
    category: "Conseils",
    author: "Service client",
    date: "2026-09-02",
    readMinutes: 3,
    cover: "/images/products/sac-a-dos-imprime-wax/1.webp",
    body: [
      { text: "Sur MMKids, le paiement Mobile Money est confirmé automatiquement : vous validez la transaction sur votre téléphone, et c'est tout." },
      { heading: "Ne communiquez jamais votre code secret", text: "Aucun conseiller MMKids ne vous demandera votre code PIN. La validation se fait uniquement sur votre téléphone." },
      { heading: "En cas d'échec", text: "Si le paiement échoue, aucun montant n'est débité et votre panier est conservé. Vous pouvez réessayer ou payer à la livraison." },
    ],
    productSlugs: [],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

export const HELP_PAGES: Record<string, { title: string; intro: string }> = {
  tailles: { title: "Guide des tailles", intro: "Trouvez la bonne taille pour votre enfant, de la naissance à 14 ans, et la bonne pointure du 17 au 35." },
  livraison: { title: "Livraison & tarifs", intro: "Nous livrons à Abidjan en 3 h (express) ou 24 h, partout en Côte d'Ivoire sous 2 à 5 jours, et à l'international." },
  paiement: { title: "Moyens de paiement", intro: "Payez comme vous voulez : Mobile Money, carte bancaire, en plusieurs fois, par acompte, par virement ou à la livraison." },
  retours: { title: "Échanges & retours", intro: "La taille ne va pas ? L'échange est gratuit pendant 15 jours. Vous pouvez aussi demander un remboursement sous 7 jours après la livraison." },
};

/** Correspondance taille ↔ âge ↔ stature (indicative) */
export const SIZE_GUIDE = [
  { size: "Naissance", age: "0 mois", height: "50 cm", chest: "41 cm" },
  { size: "1 mois", age: "1 mois", height: "54 cm", chest: "42 cm" },
  { size: "3 mois", age: "3 mois", height: "60 cm", chest: "44 cm" },
  { size: "6 mois", age: "6 mois", height: "67 cm", chest: "46 cm" },
  { size: "12 mois", age: "12 mois", height: "74 cm", chest: "48 cm" },
  { size: "18 mois", age: "18 mois", height: "81 cm", chest: "50 cm" },
  { size: "24 mois", age: "2 ans", height: "86 cm", chest: "52 cm" },
  { size: "3 ans", age: "3 ans", height: "94 cm", chest: "54 cm" },
  { size: "4 ans", age: "4 ans", height: "102 cm", chest: "56 cm" },
  { size: "5 ans", age: "5 ans", height: "108 cm", chest: "58 cm" },
  { size: "6 ans", age: "6 ans", height: "114 cm", chest: "60 cm" },
  { size: "8 ans", age: "7 – 8 ans", height: "126 cm", chest: "64 cm" },
  { size: "10 ans", age: "9 – 10 ans", height: "138 cm", chest: "69 cm" },
  { size: "12 ans", age: "11 – 12 ans", height: "150 cm", chest: "74 cm" },
  { size: "14 ans", age: "13 – 14 ans", height: "162 cm", chest: "80 cm" },
];

export const SHOE_GUIDE = [
  { size: "17 – 18", foot: "10,5 – 11 cm", age: "6 – 9 mois" },
  { size: "19 – 20", foot: "11,5 – 12,5 cm", age: "9 – 15 mois" },
  { size: "21 – 23", foot: "13 – 14,5 cm", age: "15 – 24 mois" },
  { size: "24 – 26", foot: "15 – 16,5 cm", age: "2 – 4 ans" },
  { size: "27 – 29", foot: "17 – 18,5 cm", age: "4 – 6 ans" },
  { size: "30 – 32", foot: "19 – 20,5 cm", age: "6 – 9 ans" },
  { size: "33 – 35", foot: "21 – 22,5 cm", age: "9 – 12 ans" },
];
