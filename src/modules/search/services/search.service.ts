/**
 * Recherche intelligente : instantanée, tolérante aux fautes (Fuse.js),
 * par référence (SKU), par catégorie, par marque et par synonymes.
 */
import Fuse from "fuse.js";
import { CATEGORIES, getAllProducts, getBrands, subcategoryName, type Product } from "@/modules/catalog";
import { normalize } from "@/shared/lib/utils";

/** Synonymes / termes courants en Côte d'Ivoire -> sous-catégories */
const SYNONYMS: Record<string, string[]> = {
  "bodies-grenouilleres": ["bebe", "nourrisson", "naissance", "body", "dors-bien", "barboteuse"],
  "ensembles-bebe": ["bebe", "naissance", "layette", "tenue bebe"],
  "accessoires-bebe": ["bebe", "layette", "bonnet", "bavoir", "chausson"],
  "robes-fille": ["robe", "fillette", "princesse"],
  "hauts-fille": ["haut", "tshirt", "tee shirt", "top", "fillette"],
  "bas-fille": ["jupe", "short", "pantalon", "legging", "jean", "fillette"],
  "ensembles-fille": ["ensemble", "tenue", "fillette", "combinaison"],
  "tshirts-garcon": ["tshirt", "tee shirt", "polo", "maillot", "garconnet"],
  "chemises-garcon": ["chemise", "garconnet"],
  "bas-garcon": ["short", "bermuda", "pantalon", "jean", "jogging", "garconnet"],
  "ensembles-garcon": ["ensemble", "tenue", "garconnet"],
  "robes-ceremonie": ["ceremonie", "mariage", "bapteme", "communion", "fete", "princesse", "demoiselle"],
  "costumes-garcon": ["costume", "ceremonie", "mariage", "fete", "noeud papillon", "chic"],
  "tenues-traditionnelles": ["wax", "pagne", "boubou", "kita", "tradition", "tabaski", "fete", "bazin"],
  "baskets-enfant": ["chaussure", "basket", "sneakers", "tennis", "godasse"],
  "sandales-enfant": ["chaussure", "sandale", "claquette", "tapette", "nu pieds", "plage"],
  "chaussures-habillees": ["chaussure", "ballerine", "mocassin", "ceremonie"],
  "premiers-pas": ["chaussure", "bebe", "premiers pas", "chausson"],
  pyjamas: ["pyjama", "nuit", "dodo", "chemise de nuit"],
  "sous-vetements": ["slip", "culotte", "boxer", "dessous", "caleçon"],
  "chaussettes-collants": ["chaussette", "collant", "socquette"],
  survetements: ["survet", "survetement", "jogging", "sport"],
  "maillots-sport": ["sport", "foot", "football", "danse", "judo", "maillot"],
  "maillots-bain": ["plage", "piscine", "maillot de bain", "bain", "anti uv"],
  uniformes: ["uniforme", "ecole", "rentree", "tenue scolaire", "kaki"],
  "sacs-scolaires": ["sac", "cartable", "ecole", "rentree", "sac a dos"],
  "sweats-gilets": ["sweat", "pull", "gilet", "veste", "blouson", "capuche"],
  "chapeaux-casquettes": ["casquette", "chapeau", "bob", "soleil"],
  "accessoires-cheveux": ["barrette", "chouchou", "serre tete", "cheveux", "coiffure"],
  "lunettes-montres": ["lunettes", "montre", "ceinture", "bretelles"],
};

const STOP_WORDS = new Set(["de", "du", "des", "le", "la", "les", "un", "une", "pour", "en", "et", "a", "au", "aux"]);

interface SearchDoc {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  subcategory: string;
  keywords: string;
}

let fuse: Fuse<SearchDoc> | null = null;
const productsById = new Map<string, Product>();

function index() {
  if (fuse) return fuse;
  const docs: SearchDoc[] = getAllProducts().map((p) => {
    productsById.set(p.id, p);
    const cat = CATEGORIES.find((c) => c.slug === p.category)!;
    return {
      id: p.id,
      name: p.name,
      brand: p.brandName,
      sku: p.sku,
      category: cat.name,
      subcategory: subcategoryName(p.category, p.subcategory),
      keywords: [...(SYNONYMS[p.subcategory] ?? []), ...p.colors, ...p.tags].join(" "),
    };
  });
  fuse = new Fuse(docs, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "brand", weight: 0.2 },
      { name: "subcategory", weight: 0.12 },
      { name: "category", weight: 0.08 },
      { name: "keywords", weight: 0.08 },
      { name: "sku", weight: 0.02 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    ignoreDiacritics: true,
    includeScore: true,
    minMatchCharLength: 2,
  });
  return fuse;
}

export interface SearchResult {
  products: Product[];
  /** Vrai si aucun résultat exact : résultats issus de la tolérance aux fautes */
  fuzzy: boolean;
  /** Suggestion orthographique (« Vouliez-vous dire … ») */
  didYouMean?: string;
  matchedSku?: boolean;
}

export function searchProducts(query: string, limit = 200): SearchResult {
  const q = query.trim();
  if (!q) return { products: [], fuzzy: false };
  const nq = normalize(q);
  index();

  // 1) Référence exacte (SKU)
  const compact = nq.replace(/[-\s]/g, "");
  const skuHit = getAllProducts().find((p) => {
    const sku = normalize(p.sku);
    return sku === nq || sku.replace(/-/g, "") === compact || (/^\d{4}$/.test(compact) && sku.endsWith(compact));
  });
  if (skuHit) return { products: [skuHit], fuzzy: false, matchedSku: true };

  // 2) Correspondance exacte de sous-chaîne
  // Tous les mots de la requête doivent être présents ; les produits dont le nom correspond passent en premier
  const tokens = nq.split(/\s+/).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const haystack = (p: Product) => normalize(`${p.name} ${p.brandName} ${subcategoryName(p.category, p.subcategory)} ${(SYNONYMS[p.subcategory] ?? []).join(" ")}`);
  const exact = (tokens.length ? getAllProducts().filter((p) => tokens.every((w) => haystack(p).includes(w))) : [])
    .map((p) => ({ p, score: tokens.filter((w) => normalize(p.name).includes(w)).length }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  // 3) Recherche floue
  const fuzzyHits = index()
    .search(q, { limit })
    .map((r) => productsById.get(r.item.id)!)
    .filter(Boolean);

  const seen = new Set<string>();
  const merged = [...exact, ...fuzzyHits].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  const fuzzy = exact.length === 0 && merged.length > 0;
  return {
    products: merged.slice(0, limit),
    fuzzy,
    didYouMean: fuzzy ? suggestTerm(merged[0], nq) : undefined,
  };
}

function suggestTerm(top: Product, nq: string): string {
  const words = normalize(`${top.name} ${top.brandName}`).split(/\s+/);
  // Mot le plus proche (distance de Levenshtein) de la requête
  let best = top.brandName;
  let bestD = Infinity;
  for (const w of words) {
    const d = levenshtein(w, nq);
    if (d < bestD && w.length > 2) {
      bestD = d;
      best = w;
    }
  }
  return best;
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export interface Suggestions {
  products: Product[];
  categories: { slug: string; name: string; sub?: string; subName?: string }[];
  brands: { slug: string; name: string; productCount: number }[];
  fuzzy: boolean;
  didYouMean?: string;
}

/** Autocomplétion : produits, catégories et marques */
export function getSuggestions(query: string): Suggestions {
  const nq = normalize(query);
  if (nq.length < 1) return { products: [], categories: [], brands: [], fuzzy: false };
  const res = searchProducts(query, 6);
  const categories: Suggestions["categories"] = [];
  for (const c of CATEGORIES) {
    if (normalize(c.name).includes(nq)) categories.push({ slug: c.slug, name: c.name });
    for (const s of c.subcategories) {
      if (normalize(s.name).includes(nq) || (SYNONYMS[s.slug] ?? []).some((syn) => syn.startsWith(nq) || nq.startsWith(syn)))
        categories.push({ slug: c.slug, name: c.name, sub: s.slug, subName: s.name });
    }
  }
  const brands = getBrands()
    .filter((b) => normalize(b.name).includes(nq) || (nq.length >= 3 && levenshtein(normalize(b.name).slice(0, nq.length), nq) <= 1))
    .slice(0, 4);
  return { products: res.products, categories: categories.slice(0, 4), brands, fuzzy: res.fuzzy, didYouMean: res.didYouMean };
}

export const TRENDING_SEARCHES = ["Robe wax", "Body bébé", "Uniforme", "Baskets LED", "Pyjama", "Robe de cérémonie", "Maillot de bain", "Sac à dos"];
