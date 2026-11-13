import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  {
    slug: "bebe",
    name: "Bébé (0-24 mois)",
    shortName: "Bébé",
    description: "Bodies, grenouillères, ensembles naissance et accessoires tout doux pour les tout-petits.",
    tone: "bg-sky-50 text-sky-700",
    subcategories: [
      { slug: "bodies-grenouilleres", name: "Bodies & grenouillères" },
      { slug: "ensembles-bebe", name: "Ensembles & robes bébé" },
      { slug: "accessoires-bebe", name: "Bonnets, bavoirs & chaussons" },
    ],
  },
  {
    slug: "fille",
    name: "Fille (2-14 ans)",
    shortName: "Fille",
    description: "Robes, t-shirts, jupes, shorts et ensembles pour les filles de 2 à 14 ans.",
    tone: "bg-pink-50 text-pink-700",
    subcategories: [
      { slug: "robes-fille", name: "Robes" },
      { slug: "hauts-fille", name: "T-shirts & hauts" },
      { slug: "bas-fille", name: "Jupes, shorts & pantalons" },
      { slug: "ensembles-fille", name: "Ensembles & combinaisons" },
    ],
  },
  {
    slug: "garcon",
    name: "Garçon (2-14 ans)",
    shortName: "Garçon",
    description: "T-shirts, polos, chemises, shorts, jeans et ensembles pour les garçons de 2 à 14 ans.",
    tone: "bg-blue-50 text-blue-700",
    subcategories: [
      { slug: "tshirts-garcon", name: "T-shirts & polos" },
      { slug: "chemises-garcon", name: "Chemises" },
      { slug: "bas-garcon", name: "Shorts & pantalons" },
      { slug: "ensembles-garcon", name: "Ensembles" },
    ],
  },
  {
    slug: "ceremonie",
    name: "Fêtes & cérémonies",
    shortName: "Cérémonie",
    description: "Robes de cérémonie, costumes, boubous et tenues en wax pour les mariages, baptêmes et fêtes.",
    tone: "bg-amber-50 text-amber-700",
    subcategories: [
      { slug: "robes-ceremonie", name: "Robes de cérémonie" },
      { slug: "costumes-garcon", name: "Costumes & tenues chic" },
      { slug: "tenues-traditionnelles", name: "Tenues wax & traditionnelles" },
    ],
  },
  {
    slug: "chaussures",
    name: "Chaussures",
    shortName: "Chaussures",
    description: "Baskets, sandales, ballerines et chaussures premiers pas, du 17 au 35.",
    tone: "bg-orange-50 text-orange-700",
    subcategories: [
      { slug: "baskets-enfant", name: "Baskets" },
      { slug: "sandales-enfant", name: "Sandales & claquettes" },
      { slug: "chaussures-habillees", name: "Ballerines & chaussures habillées" },
      { slug: "premiers-pas", name: "Premiers pas" },
    ],
  },
  {
    slug: "nuit",
    name: "Pyjamas & sous-vêtements",
    shortName: "Pyjamas",
    description: "Pyjamas, chemises de nuit, sous-vêtements, chaussettes et collants.",
    tone: "bg-violet-50 text-violet-700",
    subcategories: [
      { slug: "pyjamas", name: "Pyjamas & chemises de nuit" },
      { slug: "sous-vetements", name: "Sous-vêtements" },
      { slug: "chaussettes-collants", name: "Chaussettes & collants" },
    ],
  },
  {
    slug: "sport-plage",
    name: "Sport & plage",
    shortName: "Sport & plage",
    description: "Survêtements, maillots de foot, tenues de danse et maillots de bain anti-UV.",
    tone: "bg-teal-50 text-teal-700",
    subcategories: [
      { slug: "survetements", name: "Survêtements & joggings" },
      { slug: "maillots-sport", name: "Tenues de sport" },
      { slug: "maillots-bain", name: "Maillots de bain & plage" },
    ],
  },
  {
    slug: "ecole",
    name: "Rentrée scolaire",
    shortName: "École",
    description: "Uniformes scolaires, sacs à dos, sweats et vestes pour une rentrée sereine.",
    tone: "bg-lime-50 text-lime-700",
    subcategories: [
      { slug: "uniformes", name: "Uniformes scolaires" },
      { slug: "sacs-scolaires", name: "Sacs à dos & cartables" },
      { slug: "sweats-gilets", name: "Sweats, gilets & vestes" },
    ],
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    shortName: "Accessoires",
    description: "Casquettes, chapeaux, accessoires cheveux, lunettes de soleil et montres enfant.",
    tone: "bg-rose-50 text-rose-700",
    subcategories: [
      { slug: "chapeaux-casquettes", name: "Chapeaux & casquettes" },
      { slug: "accessoires-cheveux", name: "Accessoires cheveux" },
      { slug: "lunettes-montres", name: "Lunettes, montres & ceintures" },
    ],
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export function subcategoryName(category: string, sub: string): string {
  return CATEGORY_BY_SLUG[category]?.subcategories.find((s) => s.slug === sub)?.name ?? sub;
}
