/**
 * MMKids — récupère des photos libres de droits (Pixabay) pour chaque produit du catalogue.
 *
 *   node scripts/fetch-pixabay-images.mjs --selection   # applique la sélection validée (recommandé)
 *   node scripts/fetch-pixabay-images.mjs            # recherche automatique, tous les produits
 *   node scripts/fetch-pixabay-images.mjs robe-en-wax-fille costume-garcon-3-pieces   # seulement ceux-là
 *
 * Clé API : PIXABAY_API_KEY dans .env.local (jamais commitée).
 * Licence Pixabay : usage commercial autorisé, sans attribution obligatoire ; les images doivent être
 * hébergées sur notre serveur (pas de hotlink) — d'où le téléchargement dans public/images/products.
 *
 * Résultat :
 *   - public/images/products/<slug>/1.webp, 2.webp, 3.webp  (800 × 800)
 *   - src/modules/catalog/data/seed.json : chemins d'images mis à jour
 *   - scripts/image-credits.json : source de chaque photo (page Pixabay, auteur)
 *
 * Pour imposer une photo précise : ajoutez son identifiant Pixabay dans PINNED ci-dessous.
 * Pour exclure une photo : ajoutez son identifiant dans BANNED_IDS.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = path.join(ROOT, "public", "images", "products");
const SEED_FILE = path.join(ROOT, "src", "modules", "catalog", "data", "seed.json");
const CREDITS_FILE = path.join(ROOT, "scripts", "image-credits.json");
const CACHE_FILE = path.join(ROOT, "scripts", ".pixabay-cache.json");
const RAW_DIR = path.join(os.tmpdir(), "mmkids-pixabay-raw");
const PER_PRODUCT = 3;

const env = fs.existsSync(path.join(ROOT, ".env.local")) ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8") : "";
const KEY = process.env.PIXABAY_API_KEY ?? env.match(/^PIXABAY_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) {
  console.error("PIXABAY_API_KEY manquante (.env.local)");
  process.exit(1);
}

/* ------------------------------------------------------------------ requêtes par produit */
// Chaque entrée : requêtes de la plus précise à la plus large. Les mots de la requête servent aussi au score.
const Q = {
  "lot-de-3-bodies-coton-bio": ["baby bodysuit", "baby clothes flat lay", "onesie"],
  "body-manches-courtes-etoiles": ["baby onesie stars", "baby bodysuit", "onesie"],
  "body-mariniere-a-rayures": ["baby striped bodysuit", "baby stripes clothes", "striped onesie"],
  "grenouillere-velours-nuages": ["baby sleepsuit", "baby pajamas", "baby romper"],
  "grenouillere-zippee-lapin": ["baby romper bunny", "baby sleepsuit", "baby clothes"],
  "lot-de-3-bodies-manches-longues": ["baby clothes long sleeve", "baby bodysuit", "baby clothes"],
  "body-wax-bebe": ["african print baby", "baby african fabric", "baby colorful clothes"],
  "barboteuse-bebe-fleurie": ["baby romper floral", "baby girl floral dress", "baby romper"],
  "gigoteuse-turbulette-0-6-mois": ["baby sleeping bag", "baby sleep sack", "baby sleeping"],
  "ensemble-naissance-3-pieces": ["newborn clothes set", "baby clothes flat lay", "newborn outfit"],
  "robe-bebe-a-volants": ["baby girl dress", "baby dress", "toddler dress"],
  "salopette-bebe-en-jean": ["baby denim overalls", "baby overalls", "toddler overalls"],
  "ensemble-bebe-short-et-t-shirt": ["baby outfit shorts", "baby clothes summer", "baby clothes"],
  "combinaison-bebe-imprime-safari": ["baby jumpsuit", "baby romper", "baby animal print"],
  "kimono-bebe-en-wax": ["baby african outfit", "african print clothes", "baby kimono"],
  "lot-de-2-bonnets-naissance": ["baby hat newborn", "baby beanie", "knitted baby hat"],
  "lot-de-5-bavoirs-impermeables": ["baby bib", "bib baby", "baby feeding bib"],
  "chaussons-bebe-tricotes": ["knitted baby booties", "baby booties", "baby socks knitted"],
  "bandeau-bebe-a-noeud": ["baby headband bow", "baby girl headband", "baby bow"],

  "robe-d-ete-fleurie": ["girl floral dress", "girl summer dress", "child dress flowers"],
  "robe-en-wax-fille": ["african print dress girl", "african girl dress", "ankara dress"],
  "robe-tutu-a-paillettes": ["tutu dress girl", "girl tutu", "ballerina girl tutu"],
  "robe-chasuble-en-jean": ["girl denim dress", "denim dress child", "girl jeans dress"],
  "robe-t-shirt-a-rayures": ["girl striped dress", "striped dress child", "girl dress"],
  "robe-a-smocks-en-coton": ["girl white dress", "girl cotton dress", "child white dress"],
  "robe-longue-bohème": ["girl long dress", "girl boho dress", "girl maxi dress"],
  "robe-longue-boheme": ["girl long dress", "girl boho dress", "girl maxi dress"],
  "t-shirt-fille-licorne": ["unicorn t-shirt", "girl pink t-shirt", "girl t-shirt"],
  "t-shirt-sequins-reversibles": ["girl sequin", "sequin shirt", "girl t-shirt glitter"],
  "blouse-fille-col-claudine": ["girl blouse", "girl white blouse", "girl shirt"],
  "lot-de-2-debardeurs-fille": ["girl tank top", "child tank top", "girl top summer"],
  "top-fille-coeur-brode": ["girl heart t-shirt", "girl top", "girl t-shirt"],
  "jupe-plissee-fille": ["girl pleated skirt", "girl skirt", "child skirt"],
  "jupe-en-jean-brodee": ["girl denim skirt", "denim skirt", "girl skirt"],
  "short-fille-en-coton": ["girl shorts", "child shorts summer", "girl summer outfit"],
  "lot-de-2-leggings-fille": ["girl leggings", "child leggings", "girl pants"],
  "pantalon-large-wax-fille": ["african print pants", "ankara pants", "african fabric girl"],
  "jean-slim-fille": ["girl jeans", "child jeans", "kids jeans"],
  "ensemble-fille-t-shirt-et-jupe": ["girl outfit skirt", "girl clothes set", "girl outfit"],
  "combishort-fille-fleuri": ["girl jumpsuit", "girl romper floral", "girl playsuit"],
  "ensemble-legging-et-tunique": ["girl tunic leggings", "girl outfit", "girl clothes"],
  "salopette-fille-en-velours": ["girl overalls", "girl dungarees", "child overalls"],

  "t-shirt-garcon-dinosaure": ["dinosaur t-shirt kid", "boy dinosaur shirt", "boy t-shirt"],
  "t-shirt-garcon-voiture-de-course": ["boy t-shirt car", "boy t-shirt", "kids t-shirt"],
  "lot-de-3-t-shirts-basiques": ["kids t-shirts", "children t-shirts", "boy t-shirt"],
  "polo-garcon-en-pique": ["boy polo shirt", "polo shirt kid", "boy shirt"],
  "t-shirt-raye-garcon": ["boy striped shirt", "striped t-shirt child", "boy t-shirt"],
  "debardeur-garcon-ballon": ["boy tank top", "boy sleeveless shirt", "boy basketball"],
  "chemise-garcon-a-carreaux": ["boy plaid shirt", "boy checkered shirt", "boy shirt"],
  "chemise-wax-garcon": ["african print shirt boy", "boy african shirt", "ankara shirt"],
  "chemise-en-lin-manches-courtes": ["boy linen shirt", "boy white shirt", "boy shirt"],
  "chemise-en-jean-garcon": ["boy denim shirt", "denim shirt kid", "boy shirt"],
  "short-cargo-garcon": ["boy shorts", "boy cargo shorts", "kids shorts"],
  "bermuda-en-jean-garcon": ["boy denim shorts", "kids denim shorts", "boy shorts"],
  "pantalon-chino-garcon": ["boy chinos", "boy pants", "boy trousers"],
  "jean-regular-garcon": ["boy jeans", "kids jeans", "child jeans"],
  "jogging-molleton-garcon": ["boy sweatpants", "boy joggers", "kids sweatpants"],
  "ensemble-garcon-t-shirt-et-short": ["boy outfit shorts", "boy summer outfit", "boy outfit"],
  "ensemble-chemise-et-bermuda": ["boy shirt shorts outfit", "boy smart outfit", "boy outfit"],
  "salopette-courte-garcon": ["boy overalls", "boy dungarees", "toddler overalls"],
  "ensemble-wax-garcon": ["boy african outfit", "african print boy", "ankara boy"],

  "robe-de-ceremonie-satin-et-tulle": ["flower girl dress", "girl white tulle dress", "girl ceremony dress"],
  "robe-demoiselle-d-honneur": ["flower girl", "bridesmaid girl", "girl wedding dress"],
  "robe-princesse-a-noeud": ["girl princess dress", "princess dress child", "girl party dress"],
  "robe-de-bapteme-brodee": ["baptism dress baby", "christening gown", "baby white dress"],
  "costume-garcon-3-pieces": ["boy suit", "boy suit tie", "boy formal wear"],
  "chemise-blanche-et-noeud-papillon": ["boy bow tie", "boy white shirt bow tie", "bow tie child"],
  "gilet-de-costume-garcon": ["boy vest suit", "boy waistcoat", "boy formal"],
  "boubou-garcon-brode": ["african boy traditional", "boy kaftan", "african traditional clothes child"],
  "ensemble-pagne-fille-haut-et-jupe": ["african girl traditional", "african print girl", "ankara girl"],
  "robe-kita-fille": ["kente cloth", "kente dress", "african girl dress"],
  "tenue-traditionnelle-garcon-tunique-et-pantalon": ["african boy outfit", "african traditional boy", "boy kaftan"],
  "robe-sirene-wax-fille": ["african print dress", "ankara dress", "african fabric dress"],

  "baskets-lumineuses-led": ["kids light up shoes", "kids sneakers", "children sneakers"],
  "baskets-a-scratch-enfant": ["kids sneakers velcro", "children shoes", "kids sneakers"],
  "baskets-montantes-en-toile": ["kids canvas shoes", "high top sneakers kids", "canvas sneakers"],
  "baskets-running-junior": ["kids running shoes", "children sports shoes", "kids sneakers"],
  "tennis-blanches-a-scratch": ["white sneakers kids", "white children shoes", "white sneakers"],
  "sandales-fille-a-fleurs": ["girl sandals", "children sandals", "kids sandals"],
  "sandales-garcon-sport": ["boy sandals", "kids sport sandals", "children sandals"],
  "claquettes-enfant": ["kids slides", "flip flops kids", "children flip flops"],
  "sandales-meduses": ["jelly sandals", "plastic sandals kids", "kids sandals"],
  "ballerines-vernies-fille": ["girl ballet flats", "girl shoes", "child dress shoes"],
  "mocassins-garcon": ["boy dress shoes", "boy loafers", "kids leather shoes"],
  "ballerines-a-paillettes": ["glitter shoes girl", "girl sparkly shoes", "girl shoes"],
  "chaussures-premiers-pas-cuir-souple": ["baby first shoes", "baby shoes", "toddler shoes"],
  "chaussons-antiderapants-bebe": ["baby slippers", "baby soft shoes", "baby booties"],
  "bottines-premiers-pas": ["toddler boots", "baby boots", "kids boots"],
  "sandales-premiers-pas": ["baby sandals", "toddler sandals", "baby shoes summer"],

  "pyjama-court-fille-licorne": ["girl pajamas", "kids pajamas", "child pyjamas"],
  "pyjama-long-garcon-dinosaures": ["boy pajamas", "kids pajamas", "child sleepwear"],
  "pyjama-coton-a-etoiles": ["kids pajamas stars", "children pajamas", "kids sleepwear"],
  "chemise-de-nuit-fille": ["girl nightgown", "girl nightdress", "girl pajamas"],
  "pyjama-combinaison-enfant": ["kids onesie pajamas", "child onesie", "kids pajamas"],
  "lot-de-5-slips-garcon": ["kids underwear", "children underwear", "boy underwear"],
  "lot-de-5-culottes-fille": ["girl underwear", "kids underwear", "children underwear"],
  "lot-de-3-boxers-garcon": ["boy boxers", "kids underwear", "children underwear"],
  "lot-de-2-maillots-de-corps": ["kids undershirt", "child white tank top", "white tank top"],
  "lot-de-7-paires-de-chaussettes": ["kids socks", "children socks colorful", "colorful socks"],
  "chaussettes-antiderapantes-bebe": ["baby socks", "baby feet socks", "baby socks cute"],
  "lot-de-2-collants-fille": ["girl tights", "children tights", "girl stockings"],

  "survetement-enfant-2-pieces": ["kids tracksuit", "boy tracksuit", "children sportswear"],
  "veste-de-survetement-zippee": ["kids track jacket", "kids zip jacket", "child sports jacket"],
  "jogging-enfant-a-bandes": ["kids sweatpants", "child track pants", "kids joggers"],
  "maillot-de-foot-enfant-orange-et-vert": ["kids football jersey", "child soccer jersey", "boy soccer"],
  "ensemble-de-foot-maillot-et-short": ["kids soccer uniform", "children football kit", "boy soccer"],
  "t-shirt-de-sport-respirant": ["kids sports t-shirt", "child sport shirt", "kids running"],
  "tenue-de-danse-justaucorps-et-tutu": ["girl ballet tutu", "little ballerina", "ballet girl"],
  "kimono-de-judo-enfant": ["kids judo", "child karate uniform", "judo child"],
  "maillot-de-bain-fille-une-piece": ["girl swimsuit", "child swimsuit", "girl swimwear"],
  "maillot-de-bain-fille-2-pieces": ["girl bikini child", "girl swimwear beach", "girl swimsuit"],
  "short-de-bain-garcon": ["boy swim shorts", "boy swimwear", "boy beach"],
  "t-shirt-anti-uv-manches-longues": ["kids rash guard", "child swim shirt", "kids swimwear"],
  "bob-de-plage-anti-uv": ["kids sun hat", "child bucket hat", "child beach hat"],

  "chemise-d-uniforme-kaki": ["school uniform shirt", "khaki shirt", "school uniform boy"],
  "chemise-d-uniforme-bleu-ciel": ["school uniform blue shirt", "light blue shirt", "school uniform"],
  "short-d-uniforme-garcon": ["school uniform shorts", "boy school uniform", "navy shorts"],
  "jupe-d-uniforme-plissee": ["school uniform skirt", "pleated skirt navy", "school girl uniform"],
  "robe-d-uniforme-fille": ["school uniform dress", "school girl uniform", "school uniform"],
  "pantalon-d-uniforme": ["school uniform trousers", "boy school uniform", "navy trousers"],
  "pack-uniforme-chemise-et-short": ["school uniform", "school uniform children", "students uniform"],
  "sac-a-dos-maternelle": ["kids backpack", "children backpack", "school backpack"],
  "cartable-primaire-a-roulettes": ["school bag", "school backpack", "kids school bag"],
  "sac-a-dos-imprime-wax": ["african print bag", "colorful backpack", "backpack"],
  "sweat-a-capuche-enfant": ["kids hoodie", "child hoodie", "boy hoodie"],
  "gilet-en-maille-boutonne": ["kids cardigan", "child knitted cardigan", "knitted sweater child"],
  "veste-coupe-vent-legere": ["kids raincoat", "child rain jacket", "kids jacket"],
  "veste-en-jean-enfant": ["kids denim jacket", "child jean jacket", "denim jacket"],

  "casquette-enfant-brodee": ["kids cap", "child baseball cap", "boy cap"],
  "bob-reversible-enfant": ["kids bucket hat", "child bucket hat", "child hat"],
  "chapeau-de-paille-fille": ["girl straw hat", "child straw hat", "straw hat"],
  "lot-de-10-barrettes-fantaisie": ["hair clips", "kids hair clips", "hair accessories"],
  "serre-tete-a-noeud": ["girl headband bow", "hair bow headband", "girl hair bow"],
  "lot-de-4-chouchous-wax": ["scrunchies", "hair scrunchie", "hair ties colorful"],
  "lunettes-de-soleil-enfant-uv400": ["kids sunglasses", "child sunglasses", "sunglasses colorful"],
  "montre-enfant-pedagogique": ["kids watch", "child wrist watch", "children watch"],
  "ceinture-elastique-enfant": ["kids belt", "child belt", "belt"],
  "bretelles-et-noeud-papillon": ["suspenders bow tie boy", "boy suspenders", "bow tie"],
};

/** Sélection manuelle (identifiants Pixabay validés à l'œil) : scripts/pixabay-selection.json */
const SELECTION_FILE = path.join(ROOT, "scripts", "pixabay-selection.json");
const PINNED = fs.existsSync(SELECTION_FILE) ? JSON.parse(fs.readFileSync(SELECTION_FILE, "utf8")) : {};
/** Photos exclues après relecture */
const BANNED_IDS = new Set([]);

/* ------------------------------------------------------------------ score */

const PRODUCT_BONUS = ["clothes", "clothing", "flat lay", "flatlay", "fashion", "outfit", "apparel", "garment", "hanger", "shoes", "footwear", "product", "isolated", "white background", "mockup", "mock up", "wardrobe", "dress", "kids fashion", "children's clothing", "baby clothes"];
const CHILD_TAGS = ["child", "children", "kid", "kids", "baby", "toddler", "girl", "boy", "infant", "newborn", "little", "children's", "kid's", "school", "student"];
const PENALTY = ["adult", "woman", "women", "man", "men", "pregnant", "pregnancy", "bride", "groom", "couple", "lingerie", "sexy", "wallpaper", "model woman", "lady", "beard", "senior", "elderly", "business", "nude", "bikini woman", "beach woman"];

function score(hit, query) {
  const tags = hit.tags.toLowerCase();
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  let s = 0;
  for (const w of words) if (tags.includes(w.replace(/s$/, ""))) s += 3;
  for (const b of PRODUCT_BONUS) if (tags.includes(b)) s += 1.5;
  if (CHILD_TAGS.some((c) => tags.includes(c))) s += 2;
  for (const p of PENALTY) if (new RegExp(`(^|, )${p}(,|$)`).test(tags)) s -= 6;
  if (hit.imageWidth < 1200 || hit.imageHeight < 1200) s -= 2;
  s += Math.min(2, Math.log10(1 + hit.likes) / 1.5);
  return s;
}

/* ------------------------------------------------------------------ API */

const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const qs = new URLSearchParams({ key: KEY, image_type: "photo", safesearch: "true", per_page: "40", ...params });
  const cacheKey = qs.toString().replace(KEY, "");
  const hit = cache[cacheKey];
  if (hit && Date.now() - hit.at < 24 * 3600 * 1000) return hit.data; // cache 24 h (exigé par Pixabay)
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`https://pixabay.com/api/?${qs}`, { signal: AbortSignal.timeout(30000) });
    if (r.status === 429) {
      await sleep(15000);
      continue;
    }
    if (!r.ok) throw new Error(`Pixabay ${r.status} : ${await r.text()}`);
    const data = await r.json();
    cache[cacheKey] = { at: Date.now(), data };
    await sleep(700); // 100 requêtes / minute max
    return data;
  }
  throw new Error("Pixabay : trop de requêtes");
}

async function download(url, file) {
  const r = await fetch(url, { signal: AbortSignal.timeout(60000), headers: { "User-Agent": "Mozilla/5.0 (catalog-image-fetcher)" } });
  if (!r.ok) throw new Error(`téléchargement ${r.status}`);
  if (!(r.headers.get("content-type") ?? "").startsWith("image/")) throw new Error(`contenu non image (${r.headers.get("content-type")})`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

/* ------------------------------------------------------------------ main */

async function main() {
  // --selection : n'applique QUE la sélection manuelle (aucune recherche automatique)
  const selectionOnly = process.argv.includes("--selection");
  const only = selectionOnly ? Object.keys(PINNED) : process.argv.slice(2);
  const seed = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
  const credits = fs.existsSync(CREDITS_FILE) ? JSON.parse(fs.readFileSync(CREDITS_FILE, "utf8")) : {};
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  fs.mkdirSync(RAW_DIR, { recursive: true });

  // Photos déjà attribuées aux produits qu'on ne retraite pas : on ne les réutilise pas
  const used = new Set();
  for (const [slug, list] of Object.entries(credits)) if (!only.length || !only.includes(slug)) list.forEach((c) => used.add(c.id));

  let done = 0;
  const missing = [];
  for (const item of seed) {
    if (only.length && !only.includes(item.slug)) continue;
    const queries = Q[item.slug] ?? [item.name];
    // Candidats : photos imposées puis meilleurs résultats de chaque requête
    const candidates = [];
    for (const id of PINNED[item.slug] ?? []) {
      const res = await api({ id: String(id) });
      if (res.hits[0]) candidates.push(res.hits[0]);
    }
    for (const q of selectionOnly ? [] : queries) {
      if (candidates.length >= PER_PRODUCT * 3) break;
      const res = await api({ q });
      res.hits
        .filter((h) => !used.has(h.id) && !BANNED_IDS.has(h.id) && !candidates.some((p) => p.id === h.id))
        .map((h) => ({ h, s: score(h, q) }))
        .filter((x) => x.s >= 4)
        .sort((a, b) => b.s - a.s)
        .slice(0, PER_PRODUCT * 2)
        .forEach(({ h }) => candidates.push(h));
    }

    const picked = [];
    const tmpOut = [];
    for (const h of candidates) {
      if (picked.length >= PER_PRODUCT) break;
      if (used.has(h.id)) continue;
      try {
        const raw = path.join(RAW_DIR, `${h.id}.img`);
        await download(h.largeImageURL, raw);
        const out = path.join(RAW_DIR, `${item.slug}-${picked.length + 1}.webp`);
        await sharp(raw).rotate().resize(800, 800, { fit: "cover", position: sharp.strategy.attention }).webp({ quality: 82 }).toFile(out);
        tmpOut.push(out);
        picked.push(h);
        used.add(h.id);
      } catch (e) {
        console.log(`   (photo ${h.id} ignorée : ${e.message})`);
      }
    }
    if (!picked.length) {
      missing.push(item.slug);
      console.log(`⚠️  ${item.slug} : aucune photo — illustration conservée`);
      continue;
    }

    const dir = path.join(IMG_DIR, item.slug);
    // Remplace le dossier du produit seulement quand toutes les images sont prêtes
    fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f), { force: true, maxRetries: 5 });
    tmpOut.forEach((f, i) => fs.copyFileSync(f, path.join(dir, `${i + 1}.webp`)));
    item.images = tmpOut.map((_, i) => `/images/products/${item.slug}/${i + 1}.webp`);
    credits[item.slug] = picked.map((h) => ({ id: h.id, page: h.pageURL, author: h.user, tags: h.tags }));
    // Sauvegarde au fil de l'eau
    fs.writeFileSync(SEED_FILE, JSON.stringify(seed, null, 1) + "\n");
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(credits, null, 1) + "\n");
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
    done++;
    console.log(`✓ ${item.slug} (${picked.length})`);
  }

  if (selectionOnly) for (const slug of Object.keys(credits)) if (!PINNED[slug]) delete credits[slug];
  fs.writeFileSync(SEED_FILE, JSON.stringify(seed, null, 1) + "\n");
  fs.writeFileSync(CREDITS_FILE, JSON.stringify(credits, null, 1) + "\n");
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  console.log(`\n${done} produits mis à jour${missing.length ? ` · sans photo : ${missing.join(", ")}` : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
