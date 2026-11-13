/**
 * MMKids — générateur du catalogue fictif (vêtements enfants).
 *
 *   node scripts/generate-catalog.mjs
 *
 * Produit :
 *   - src/modules/catalog/data/seed.json   (liste des produits)
 *   - public/images/products/<slug>/N.webp  (illustrations générées : 1 par couleur + 1 vue détail)
 *
 * Les illustrations sont des visuels provisoires : remplacez simplement les fichiers .webp
 * par les vraies photos de la boutique (même nom, même dossier) — aucun code à modifier.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = path.join(ROOT, "public", "images", "products");
const SEED_FILE = path.join(ROOT, "src", "modules", "catalog", "data", "seed.json");

/* ------------------------------------------------------------------ couleurs */

const HEX = {
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
  Noir: "#1f2937",
  Turquoise: "#2dd4bf",
  Marron: "#92400e",
  Doré: "#d4a72c",
  Argent: "#c0c4cc",
};
const MULTI = ["Bleu ciel", "Rose", "Jaune", "Vert menthe", "Lilas", "Orange"];

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((x, i) => x + (B[i] - x) * t));
}
function lum(h) {
  const [r, g, b] = hexToRgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function palette(name) {
  const base = HEX[name] ?? "#9ca3af";
  const L = lum(base);
  return {
    base,
    dark: L > 0.9 ? "#94a3b8" : mix(base, "#000000", 0.35),
    light: mix(base, "#ffffff", 0.55),
    ink: L > 0.62 ? mix(base, "#000000", 0.4) : "#ffffff",
    tint: L > 0.9 ? "#eef2f7" : mix(base, "#ffffff", 0.84),
  };
}

/* ------------------------------------------------------------------ motifs (patterns) */

function patternDef(kind, c) {
  const ink = c.ink;
  switch (kind) {
    case "rayures":
      return `<pattern id="pat" width="14" height="14" patternUnits="userSpaceOnUse"><rect y="0" width="14" height="5.5" fill="${ink}" opacity=".85"/></pattern>`;
    case "pois":
      return `<pattern id="pat" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.6" fill="${ink}" opacity=".9"/><circle cx="12" cy="12" r="2.6" fill="${ink}" opacity=".9"/></pattern>`;
    case "etoiles":
      return `<pattern id="pat" width="24" height="24" patternUnits="userSpaceOnUse"><path d="${starPath(12, 12, 5, 2.2)}" fill="${lum(c.base) > 0.62 ? "#f59e0b" : "#fde047"}"/></pattern>`;
    case "fleurs":
      return `<pattern id="pat" width="26" height="26" patternUnits="userSpaceOnUse">${flower(13, 13, 3.4, lum(c.base) > 0.75 ? "#ec4899" : "#ffffff")}</pattern>`;
    case "wax":
      return `<pattern id="pat" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="8.5" fill="none" stroke="${mix(c.base, "#000", 0.55)}" stroke-width="3"/><circle cx="14" cy="14" r="4" fill="#fbbf24"/><path d="M0 0 L5 5 L0 10 Z M28 18 L23 23 L28 28 Z" fill="${mix(c.base, "#000", 0.55)}"/><circle cx="0" cy="28" r="3" fill="#ffffff" opacity=".8"/><circle cx="28" cy="0" r="3" fill="#ffffff" opacity=".8"/></pattern>`;
    case "kente":
      return `<pattern id="pat" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#16a34a"/><rect x="12" y="8" width="12" height="8" fill="#dc2626"/><rect y="16" width="24" height="3" fill="#111827"/><rect x="4" y="0" width="3" height="24" fill="#111827" opacity=".7"/></pattern>`;
    case "carreaux":
      return `<pattern id="pat" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="8" fill="#000" opacity=".28"/><rect width="8" height="20" fill="#000" opacity=".28"/><path d="M14 0 V20 M0 14 H20" stroke="#fff" stroke-width="1" opacity=".7"/></pattern>`;
    case "safari":
      return `<pattern id="pat" width="30" height="30" patternUnits="userSpaceOnUse"><ellipse cx="8" cy="8" rx="4" ry="3" fill="#92400e" opacity=".7"/><ellipse cx="22" cy="22" rx="3" ry="4" fill="#92400e" opacity=".7"/><circle cx="22" cy="7" r="2" fill="#16a34a" opacity=".7"/></pattern>`;
    case "paillettes":
      return `<pattern id="pat" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="#ffffff" opacity=".9"/><circle cx="8" cy="7" r="1" fill="#fde68a"/></pattern>`;
    case "palmiers":
      return `<pattern id="pat" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M15 26 Q16 18 15 12 M15 12 Q8 8 5 12 M15 12 Q22 8 25 12 M15 12 Q12 5 8 4 M15 12 Q18 5 22 4" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/></pattern>`;
    default:
      return "";
  }
}

function starPath(cx, cy, R, r) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    d += `${i ? "L" : "M"}${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)} `;
  }
  return d + "Z";
}
function flower(cx, cy, r, color) {
  let s = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5;
    s += `<circle cx="${(cx + r * Math.cos(a)).toFixed(2)}" cy="${(cy + r * Math.sin(a)).toFixed(2)}" r="${r * 0.85}" fill="${color}"/>`;
  }
  return s + `<circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="#facc15"/>`;
}

/* ------------------------------------------------------------------ dessin */

const SW = 2.4;
function shape(d, c, pattern, extra = "") {
  return `<path d="${d}" fill="${c.base}" stroke="${c.dark}" stroke-width="${SW}" stroke-linejoin="round" ${extra}/>` + (pattern ? `<path d="${d}" fill="url(#pat)" stroke="none"/>` : "");
}
const line = (d, color, w = 2.4, extra = "") => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const bow = (x, y, color, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L-14 -9 L-14 9 Z M0 0 L14 -9 L14 9 Z" fill="${color}" stroke="${mix(color, "#000", 0.3)}" stroke-width="1.5" stroke-linejoin="round"/><circle r="3.5" fill="${mix(color, "#000", 0.2)}"/></g>`;

function motif(kind, c) {
  switch (kind) {
    case "etoile":
      return `<path d="${starPath(100, 102, 16, 7)}" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>`;
    case "coeur":
      return `<path d="M100 118 C78 104 80 88 92 88 C97 88 100 92 100 95 C100 92 103 88 108 88 C120 88 122 104 100 118 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>`;
    case "dino":
      return `<g fill="#22c55e" stroke="#15803d" stroke-width="1.5" stroke-linejoin="round"><path d="M78 116 Q80 100 96 100 L104 100 Q108 90 114 88 Q122 86 124 92 Q124 98 118 100 L114 102 Q116 116 104 118 L102 124 L97 124 L97 118 L88 118 L88 124 L83 124 L83 116 Z"/><path d="M90 100 L93 94 L96 100 M97 100 L100 93 L103 100" fill="#16a34a"/></g><circle cx="118" cy="92" r="1.6" fill="#111"/>`;
    case "voiture":
      return `<g stroke="#7f1d1d" stroke-width="1.5"><path d="M76 110 L80 100 Q82 96 88 96 L106 96 Q112 96 116 102 L124 104 Q128 106 128 110 L128 114 L76 114 Z" fill="#ef4444"/><path d="M88 98 L104 98 L110 104 L86 104 Z" fill="#bae6fd"/></g><circle cx="88" cy="115" r="5" fill="#111827"/><circle cx="116" cy="115" r="5" fill="#111827"/>`;
    case "licorne":
      return `<g fill="none" stroke-width="4" stroke-linecap="round"><path d="M80 116 Q100 84 120 116" stroke="#ef4444"/><path d="M85 116 Q100 92 115 116" stroke="#facc15"/><path d="M90 116 Q100 100 110 116" stroke="#3b82f6"/></g><circle cx="80" cy="117" r="5" fill="#fff" stroke="#cbd5e1"/><circle cx="120" cy="117" r="5" fill="#fff" stroke="#cbd5e1"/><path d="${starPath(100, 84, 6, 2.6)}" fill="#f59e0b"/>`;
    case "ballon":
      return `<circle cx="100" cy="104" r="14" fill="#fff" stroke="#111827" stroke-width="1.6"/><path d="${starPath(100, 104, 6, 4.5).replace(/L/g, "L")}" fill="#111827"/>`;
    case "soleil":
      return `<circle cx="100" cy="104" r="10" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>` + Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return line(`M${100 + 14 * Math.cos(a)} ${104 + 14 * Math.sin(a)} L${100 + 19 * Math.cos(a)} ${104 + 19 * Math.sin(a)}`, "#ca8a04", 2.4); }).join("");
    case "lapin":
      return `<g fill="#fff" stroke="#cbd5e1" stroke-width="1.5"><ellipse cx="93" cy="88" rx="4" ry="11"/><ellipse cx="107" cy="88" rx="4" ry="11"/><circle cx="100" cy="106" r="12"/></g><circle cx="96" cy="104" r="1.5" fill="#111"/><circle cx="104" cy="104" r="1.5" fill="#111"/><circle cx="100" cy="109" r="1.8" fill="#f472b6"/>`;
    default:
      return "";
  }
}

/* Chemins de base (viewBox 200 × 200) */
const P = {
  tshirt: "M70 46 L88 38 Q100 50 112 38 L130 46 L158 68 L145 90 L131 81 L131 160 Q100 166 69 160 L69 81 L55 90 L42 68 Z",
  chemise: "M70 44 L90 36 L100 46 L110 36 L130 44 L158 66 L145 88 L131 79 L131 162 Q100 166 69 162 L69 79 L55 88 L42 66 Z",
  debardeur: "M80 40 Q84 64 70 74 L70 160 Q100 166 130 160 L130 74 Q116 64 120 40 L110 40 Q100 60 90 40 Z",
  ml: "M70 42 L90 34 Q100 42 110 34 L130 42 L152 62 L165 146 L149 150 L134 88 L134 162 Q100 166 66 162 L66 88 L51 150 L35 146 L48 62 Z",
  robe: "M86 36 Q100 46 114 36 L124 40 L127 70 Q126 84 120 92 L152 160 Q100 172 48 160 L80 92 Q74 84 73 70 L76 40 Z",
  bodice: "M86 36 Q100 46 114 36 L124 40 L126 70 Q124 84 120 92 L80 92 Q76 84 74 70 L76 40 Z",
  tier1: "M80 92 L120 92 L134 118 Q100 126 66 118 Z",
  tier2: "M68 114 L132 114 L146 142 Q100 152 54 142 Z",
  tier3: "M56 138 L144 138 L158 166 Q100 178 42 166 Z",
  jupe: "M70 70 L130 70 L156 150 Q100 162 44 150 Z",
  short: "M62 56 L138 56 L143 128 L106 132 L100 90 L94 132 L57 128 Z",
  pantalon: "M66 36 L134 36 L141 166 L109 168 L100 74 L91 168 L59 166 Z",
  legging: "M74 36 L126 36 L125 166 L106 166 L100 76 L94 166 L75 166 Z",
  salopette: "M80 54 L120 54 L122 92 L137 96 L142 160 L108 162 L100 118 L92 162 L58 160 L63 96 L78 92 Z",
  salopetteCourte: "M80 54 L120 54 L122 92 L137 96 L140 132 L106 134 L100 112 L94 134 L60 132 L63 96 L78 92 Z",
  body: "M76 40 L90 34 Q100 44 110 34 L124 40 L146 58 L136 76 L125 70 L127 118 Q122 148 108 156 L92 156 Q78 148 73 118 L75 70 L64 76 L54 58 Z",
  bodyML: "M76 40 L90 34 Q100 44 110 34 L124 40 L148 58 L162 104 L148 110 L126 72 L127 118 Q122 148 108 156 L92 156 Q78 148 73 118 L74 72 L52 110 L38 104 L52 58 Z",
  grenouillere: "M76 34 L90 30 Q100 38 110 30 L124 34 L150 54 L162 102 L148 106 L132 68 L132 112 L134 160 Q134 172 122 172 L108 172 L104 122 L96 122 L92 172 L78 172 Q66 172 66 160 L68 112 L68 68 L52 106 L38 102 L50 54 Z",
  gigoteuse: "M84 36 Q100 46 116 36 L128 42 L134 72 L144 160 Q100 176 56 160 L66 72 L72 42 Z",
  combinaison: "M82 36 Q100 46 118 36 L126 40 L128 94 L140 148 L106 150 L100 116 L94 150 L60 148 L72 94 L74 40 Z",
  costume: "M70 40 L92 34 L100 82 L108 34 L130 40 L152 60 L162 150 L146 153 L136 92 L136 164 Q100 168 64 164 L64 92 L54 153 L38 150 L48 60 Z",
  gilet: "M80 36 L94 36 L100 80 L106 36 L120 36 L134 58 L134 150 L104 162 L100 152 L96 162 L66 150 L66 58 Z",
  boubou: "M84 34 Q100 44 116 34 L170 62 L160 110 L134 98 L138 166 Q100 172 62 166 L66 98 L40 110 L30 62 Z",
  slip: "M56 70 L144 70 L139 92 Q117 100 108 132 L92 132 Q83 100 61 92 Z",
  boxer: "M60 64 L140 64 L145 132 L106 134 L100 104 L94 134 L55 132 Z",
  chaussette: "M84 36 L112 36 L112 116 Q112 128 124 134 L142 144 Q154 152 148 165 Q142 176 127 170 L90 150 Q80 144 82 128 Z",
  collants: "M72 36 L128 36 L126 150 Q128 170 112 170 L104 170 L102 88 L98 88 L96 170 L88 170 Q72 170 74 150 Z",
  maillot: "M80 40 L92 40 Q95 70 100 72 Q105 70 108 40 L120 40 Q119 70 130 88 Q122 118 122 138 Q110 148 100 160 Q90 148 78 138 Q78 118 70 88 Q81 70 80 40 Z",
  sac: "M62 66 Q62 44 84 44 L116 44 Q138 44 138 66 L140 158 Q140 168 130 168 L70 168 Q60 168 60 158 Z",
  bavoir: "M60 72 Q60 40 84 40 Q88 64 100 64 Q112 64 116 40 Q140 40 140 72 L140 130 Q140 170 100 170 Q60 170 60 130 Z",
  bonnetDome: "M56 128 Q56 60 100 58 Q144 60 144 128 Z",
  bootie: "M70 66 L106 66 L108 114 Q142 114 152 132 Q158 152 136 152 L78 152 Q64 152 64 138 Z",
  basket: "M30 128 Q30 100 50 98 L78 96 Q96 76 118 80 L128 86 Q150 108 170 116 Q180 122 178 134 L32 136 Z",
  basketHaute: "M34 130 Q32 70 52 64 L86 62 Q100 80 118 84 L128 88 Q150 108 170 116 Q180 122 178 134 L32 136 Z",
  semelle: "M28 134 L180 134 Q182 150 168 154 L42 154 Q28 154 28 140 Z",
  ballerine: "M34 132 Q38 108 70 106 Q100 116 132 106 Q172 106 174 132 Q174 148 150 150 L56 150 Q34 150 34 132 Z",
  derby: "M30 132 Q30 104 56 100 L96 98 Q120 90 140 104 Q172 110 178 132 Q178 148 158 150 L48 150 Q30 150 30 132 Z",
  premiersPas: "M62 74 L104 70 Q110 104 122 112 Q154 118 158 136 Q160 152 140 152 L72 152 Q56 152 56 136 Z",
  bottine: "M62 46 L104 44 Q108 100 122 110 Q154 118 158 136 Q160 152 140 152 L72 152 Q56 152 56 136 Z",
};

function drawTop(kind, c, pat, opts = {}) {
  switch (kind) {
    case "tshirt":
      return shape(P.tshirt, c, pat) + line("M88 38 Q100 50 112 38", c.dark, 3) + line("M70 152 Q100 158 130 152", c.dark, 1.6, 'opacity=".5"') + motif(opts.motif, c);
    case "polo":
      return shape(P.tshirt, c, pat) + `<path d="M88 38 L100 52 L92 62 L82 44 Z M112 38 L100 52 L108 62 L118 44 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="2" stroke-linejoin="round"/>` + `<rect x="97" y="52" width="6" height="24" fill="${c.dark}" opacity=".25"/>` + circle(100, 60, 2.2, c.dark) + circle(100, 70, 2.2, c.dark) + motif(opts.motif, c);
    case "debardeur":
      return shape(P.debardeur, c, pat) + line("M90 40 Q100 60 110 40", c.dark, 3) + motif(opts.motif, c);
    case "chemise": {
      let s = shape(P.chemise, c, pat) + `<path d="M90 36 L100 46 L92 58 L82 42 Z M110 36 L100 46 L108 58 L118 42 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="2" stroke-linejoin="round"/>` + line("M100 46 L100 162", c.dark, 1.8);
      for (const y of [62, 82, 102, 122, 142]) s += circle(102.5, y, 2.2, c.dark);
      s += `<rect x="110" y="66" width="15" height="15" rx="2" fill="none" stroke="${c.dark}" stroke-width="1.6" opacity=".7"/>`;
      if (opts.noeud) s += bow(100, 46, opts.noeud, 0.75);
      return s;
    }
    case "ml":
      return shape(P.ml, c, pat) + line("M90 34 Q100 42 110 34", c.dark, 3) + line("M51 150 L35 146 M149 150 L165 146", c.dark, 4);
    default:
      return "";
  }
}

function drawBottom(kind, c, pat) {
  switch (kind) {
    case "short":
      return shape(P.short, c, pat) + line("M62 66 L138 66", c.dark, 2) + line("M100 66 L100 88", c.dark, 1.6) + line("M66 68 Q76 80 80 68 M134 68 Q124 80 120 68", c.dark, 1.6);
    case "jupe":
      return `<rect x="70" y="58" width="60" height="12" rx="3" fill="${c.dark}"/>` + shape(P.jupe, c, pat) + line("M86 70 L74 154 M100 70 L100 158 M114 70 L126 154", c.dark, 1.5, 'opacity=".55"');
    case "pantalon":
      return shape(P.pantalon, c, pat) + line("M66 46 L134 46", c.dark, 2) + line("M100 46 L100 70", c.dark, 1.6) + line("M80 36 L80 46 M120 36 L120 46", c.dark, 2.4);
    case "legging":
      return shape(P.legging, c, pat) + line("M74 44 L126 44", c.dark, 2);
    default:
      return "";
  }
}

function denimStitch(d) {
  return line(d, "#e0a84a", 1.6, 'stroke-dasharray="3 3"');
}

function draw(type, c, pat, o = {}) {
  const m = o.motif;
  switch (type) {
    case "tshirt":
    case "polo":
    case "debardeur":
    case "chemise":
    case "ml":
      return drawTop(type, c, pat, o);
    case "maillot-foot":
      return shape(P.tshirt, c, pat) + `<path d="M69 92 L131 92 L131 106 L69 106 Z" fill="${o.accent ?? "#16a34a"}" opacity=".9"/>` + line("M88 38 L100 56 L112 38", c.dark, 3) + line("M55 90 L45 72 M145 90 L155 72", "#ffffff", 3) + circle(118, 72, 6, "#ffffff", `stroke="${c.dark}" stroke-width="1.5"`);
    case "rashguard":
      return shape(P.ml, c, pat) + line("M90 34 Q100 42 110 34", c.dark, 3) + line("M70 90 L130 90", "#ffffff", 4, 'opacity=".6"') + motif(m, c);
    case "robe":
      return `<ellipse cx="72" cy="46" rx="11" ry="9" fill="${c.base}" stroke="${c.dark}" stroke-width="${SW}"/><ellipse cx="128" cy="46" rx="11" ry="9" fill="${c.base}" stroke="${c.dark}" stroke-width="${SW}"/>` + shape(P.robe, c, pat) + line("M80 92 L120 92", c.dark, 3) + line("M86 36 Q100 46 114 36", c.dark, 3) + (o.noeud ? bow(100, 92, o.noeud, 0.9) : "") + motif(m, c);
    case "robe-volants":
      return `<ellipse cx="72" cy="46" rx="11" ry="9" fill="${c.base}" stroke="${c.dark}" stroke-width="${SW}"/><ellipse cx="128" cy="46" rx="11" ry="9" fill="${c.base}" stroke="${c.dark}" stroke-width="${SW}"/>` +
        shape(P.tier3, c, pat) + shape(P.tier2, c, pat) + shape(P.tier1, c, pat) + shape(P.bodice, c, pat) + line("M86 36 Q100 46 114 36", c.dark, 3) + bow(100, 92, o.noeud ?? c.light, 1);
    case "jupe":
    case "short":
    case "pantalon":
    case "legging":
      return drawBottom(type, c, pat) + (o.bandes ? line("M64 50 L60 164 M136 50 L140 164", "#ffffff", 4) : "") + (o.cuffs ? `<rect x="59" y="156" width="32" height="10" fill="${c.dark}" opacity=".55"/><rect x="109" y="156" width="32" height="10" fill="${c.dark}" opacity=".55"/>` : "");
    case "jean":
      return drawBottom("pantalon", c, pat) + denimStitch("M66 50 L134 50") + denimStitch("M70 54 Q80 66 88 54 M130 54 Q120 66 112 54") + denimStitch("M64 60 L60 164 M136 60 L140 164");
    case "bermuda-jean":
      return drawBottom("short", c, pat) + denimStitch("M62 70 L138 70") + denimStitch("M60 120 L96 124 M104 124 L140 120");
    case "short-bain":
      return drawBottom("short", c, pat) + line("M92 66 L88 82 M108 66 L112 82", "#ffffff", 2.4);
    case "salopette":
    case "salopette-courte":
      return line("M82 56 L74 26 M118 56 L126 26", c.dark, 11) + line("M82 56 L74 26 M118 56 L126 26", c.base, 7) + shape(type === "salopette" ? P.salopette : P.salopetteCourte, c, pat) + `<rect x="88" y="62" width="24" height="18" rx="3" fill="none" stroke="${c.dark}" stroke-width="1.8"/>` + circle(82, 60, 3.4, "#f59e0b") + circle(118, 60, 3.4, "#f59e0b") + (o.jean ? denimStitch("M80 90 L122 90") : "") + motif(m, c);
    case "body":
      return shape(P.body, c, pat) + line("M90 34 Q100 44 110 34", c.dark, 3) + circle(92, 150, 2.4, c.dark) + circle(100, 152, 2.4, c.dark) + circle(108, 150, 2.4, c.dark) + motif(m, c);
    case "body-ml":
      return shape(P.bodyML, c, pat) + line("M90 34 Q100 44 110 34", c.dark, 3) + circle(92, 150, 2.4, c.dark) + circle(100, 152, 2.4, c.dark) + circle(108, 150, 2.4, c.dark) + motif(m, c);
    case "grenouillere":
      return shape(P.grenouillere, c, pat) + line("M100 38 L100 120", c.dark, 2, 'stroke-dasharray="3 2.5"') + circle(100, 42, 3, c.dark) + `<path d="M78 172 Q66 172 66 160 L67 152 L93 152 L92 172 Z M122 172 Q134 172 134 160 L133 152 L107 152 L108 172 Z" fill="${c.dark}" opacity=".45"/>` + motif(m, c);
    case "gigoteuse":
      return shape(P.gigoteuse, c, pat) + line("M124 48 L136 156", c.dark, 2, 'stroke-dasharray="3 2.5"') + line("M84 36 Q100 46 116 36", c.dark, 3) + motif(m, c);
    case "combinaison":
      return shape(P.combinaison, c, pat) + `<rect x="71" y="90" width="58" height="8" fill="${c.dark}" opacity=".7"/>` + line("M82 36 Q100 46 118 36", c.dark, 3);
    case "ensemble": {
      const top = `<g transform="translate(6 2) scale(.68)">${draw(o.top ?? "tshirt", c, pat, o)}</g>`;
      const c2 = o.bottomColor ? palette(o.bottomColor) : c;
      const bottom = `<g transform="translate(66 52) scale(.76)">${draw(o.bottom ?? "short", c2, o.bottomPattern === false ? null : pat, {})}</g>`;
      return bottom + top;
    }
    case "pyjama": {
      const top = `<g transform="translate(4 0) scale(.68)">${draw("ml", c, pat)}</g>`;
      const bottom = `<g transform="translate(66 50) scale(.74)">${draw(o.bottom ?? "pantalon", c, pat, { cuffs: (o.bottom ?? "pantalon") === "pantalon" })}</g>`;
      return bottom + top + `<g transform="translate(4 0) scale(.68)">${motif(m, c)}</g>`;
    }
    case "costume":
      return shape(P.costume, c, pat) + `<path d="M92 34 L108 34 L100 82 Z" fill="#ffffff" stroke="${c.dark}" stroke-width="1.6"/>` + `<path d="M92 34 L84 62 L100 82 Z M108 34 L116 62 L100 82 Z" fill="${c.dark}" opacity=".35"/>` + bow(100, 42, o.noeud ?? "#dc2626", 0.6) + circle(100, 112, 2.6, c.dark) + circle(100, 130, 2.6, c.dark) + `<path d="M112 92 L128 92 L128 98 L112 98 Z" fill="#ffffff" opacity=".8"/>`;
    case "gilet-costume":
      return draw("chemise", palette("Blanc"), null, { noeud: o.noeud }) + shape(P.gilet, c, pat) + circle(100, 104, 2.6, c.dark) + circle(100, 120, 2.6, c.dark) + circle(100, 136, 2.6, c.dark) + (o.noeud ? bow(100, 46, o.noeud, 0.75) : "");
    case "boubou":
      return shape(P.boubou, c, pat) + line("M84 34 Q100 44 116 34 L111 72 Q100 82 89 72 Z", "#d4a72c", 3) + line("M92 50 L92 66 M108 50 L108 66 M100 78 L100 120", "#d4a72c", 2.2, 'stroke-dasharray="2 3"') + line("M62 166 Q100 172 138 166", "#d4a72c", 3);
    case "slip":
    case "culotte":
      return shape(P.slip, c, pat) + `<rect x="56" y="70" width="88" height="8" fill="${c.dark}" opacity=".35"/>` + (type === "culotte" ? bow(100, 80, "#f472b6", 0.45) : "");
    case "boxer":
      return shape(P.boxer, c, pat) + `<rect x="60" y="64" width="80" height="12" fill="${c.dark}" opacity=".5"/>`;
    case "chaussette":
      return shape(P.chaussette, c, pat) + `<rect x="84" y="36" width="28" height="14" fill="${c.light}" stroke="${c.dark}" stroke-width="1.6"/>` + `<path d="M127 170 Q142 176 148 165 Q154 152 142 144 L136 141 Q130 156 127 170 Z" fill="${c.dark}" opacity=".35"/>`;
    case "chaussettes":
      return `<g transform="translate(-24 4)">${draw("chaussette", c, pat)}</g><g transform="translate(14 -6)">${draw("chaussette", c, pat)}</g>`;
    case "collants":
      return shape(P.collants, c, pat) + `<rect x="72" y="36" width="56" height="9" fill="${c.dark}" opacity=".35"/>`;
    case "survetement":
      return shape(P.ml, c, pat) + line("M100 40 L100 162", c.dark, 2.4) + `<rect x="96" y="46" width="8" height="12" rx="2" fill="#e5e7eb" stroke="${c.dark}"/>` + line("M60 52 L42 146 M140 52 L158 146", "#ffffff", 4) + `<path d="M86 34 L114 34 L112 44 L88 44 Z" fill="${c.dark}" opacity=".6"/>`;
    case "sweat":
      return `<path d="M78 46 Q76 16 100 14 Q124 16 122 46 Z" fill="${c.dark}" stroke="${c.dark}" stroke-width="2"/>` + shape(P.ml, c, pat) + `<path d="M76 122 L124 122 L132 152 L68 152 Z" fill="none" stroke="${c.dark}" stroke-width="2"/>` + line("M94 44 L92 70 M106 44 L108 70", "#ffffff", 2.2) + motif(m, c);
    case "gilet":
      return shape(P.ml, c, pat) + `<path d="M90 34 L110 34 L100 72 Z" fill="#ffffff" stroke="${c.dark}" stroke-width="1.6"/>` + line("M100 72 L100 162", c.dark, 1.8) + [86, 104, 122, 140].map((y) => circle(103, y, 2.6, c.dark)).join("") + `<rect x="66" y="150" width="68" height="12" fill="${c.dark}" opacity=".25"/>`;
    case "veste":
      return shape(P.ml, c, pat) + `<path d="M88 34 L100 48 L90 62 L78 44 Z M112 34 L100 48 L110 62 L122 44 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="2"/>` + line("M100 48 L100 162", c.dark, 2.2) + `<rect x="74" y="72" width="18" height="14" rx="2" fill="none" stroke="${c.dark}" stroke-width="1.8"/><rect x="108" y="72" width="18" height="14" rx="2" fill="none" stroke="${c.dark}" stroke-width="1.8"/>` + (o.jean ? denimStitch("M74 92 L92 92 M108 92 L126 92 M66 150 L134 150") : "");
    case "kimono":
      return shape(P.ml, c, pat) + line("M90 34 L120 116 M110 34 L82 100", c.dark, 2.6) + `<rect x="66" y="108" width="68" height="10" fill="${o.ceinture ?? "#111827"}"/>` + line("M104 118 L98 142 M110 118 L116 140", o.ceinture ?? "#111827", 6);
    case "maillot-bain":
      return shape(P.maillot, c, pat) + line("M86 40 L86 30 M114 40 L114 30", c.dark, 3);
    case "bikini":
      return shape("M70 64 Q84 52 98 64 L98 84 Q84 92 70 84 Z", c, pat) + shape("M102 64 Q116 52 130 64 L130 84 Q116 92 102 84 Z", c, pat) + line("M74 62 L82 36 M126 62 L118 36 M98 72 L102 72", c.dark, 2.4) + shape("M70 112 L130 112 L124 126 Q108 132 104 152 L96 152 Q92 132 76 126 Z", c, pat) + bow(100, 116, c.light, 0.5);
    case "justaucorps":
      return shape(P.maillot, c, pat) + `<path d="M46 120 Q100 98 154 120 Q160 140 100 146 Q40 140 46 120 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="1.6" opacity=".92"/><path d="M54 114 Q100 96 146 114 Q150 130 100 134 Q50 130 54 114 Z" fill="${mix(c.light, "#fff", 0.4)}" stroke="${c.dark}" stroke-width="1.2" opacity=".9"/>`;
    case "sac": {
      let s = line("M86 46 Q86 28 100 28 Q114 28 114 46", c.dark, 6) + shape(P.sac, c, pat) + `<path d="M74 110 L126 110 Q132 110 132 116 L132 150 Q132 158 124 158 L76 158 Q68 158 68 150 L68 116 Q68 110 74 110 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="2"/>` + line("M66 72 Q100 56 134 72", c.dark, 1.8, 'stroke-dasharray="3 3"');
      if (m) s += `<g transform="translate(0 30)">${motif(m, c)}</g>`;
      if (o.roulettes) s += line("M76 44 L76 18 L124 18 L124 44", "#6b7280", 4) + circle(74, 172, 7, "#111827") + circle(126, 172, 7, "#111827");
      return s;
    }
    case "casquette":
      return shape(P.bonnetDome.replace("M56 128", "M52 124").replace("144 128", "148 124"), c, pat) + `<path d="M118 120 Q168 112 182 128 Q156 140 118 132 Z" fill="${c.dark}" stroke="${c.dark}" stroke-width="2"/>` + circle(100, 60, 4, c.dark) + line("M100 62 Q86 90 84 124 M100 62 Q114 90 116 124", c.dark, 1.4, 'opacity=".5"') + `<g transform="translate(-2 0) scale(.7) translate(43 38)">${motif(m, c)}</g>`;
    case "bob":
      return shape("M36 114 Q100 98 164 114 Q170 132 100 136 Q30 132 36 114 Z", c, pat) + shape("M64 112 Q66 66 100 64 Q134 66 136 112 Z", c, pat) + `<path d="M64 104 Q100 96 136 104 L136 112 Q100 104 64 112 Z" fill="${o.ruban ?? c.dark}"/>`;
    case "serre-tete":
      return line("M50 140 Q50 58 100 56 Q150 58 150 140", c.dark, 15) + line("M50 140 Q50 58 100 56 Q150 58 150 140", c.base, 11) + (pat ? line("M50 140 Q50 58 100 56 Q150 58 150 140", "url(#pat)", 11) : "") + bow(100, 58, o.noeud ?? c.base, 1.7);
    case "barrettes": {
      const cols = ["#f472b6", "#60a5fa", "#facc15", "#a78bfa", "#34d399"];
      return cols.map((col, i) => `<g transform="translate(${44 + (i % 3) * 52} ${70 + Math.floor(i / 3) * 56}) rotate(${i % 2 ? 18 : -14})"><rect x="-22" y="-5" width="44" height="10" rx="5" fill="#e5e7eb" stroke="#9ca3af"/>${i % 2 ? `<path d="${starPath(0, 0, 11, 5)}" fill="${col}" stroke="${mix(col, "#000", 0.3)}" stroke-width="1.2"/>` : bow(0, 0, col, 0.9)}</g>`).join("");
    }
    case "chouchous":
      return [[70, 80], [130, 80], [100, 132]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${mix(c.base, "#000", 0.25)}" stroke-width="20"/><circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${i === 1 ? "#16a34a" : c.base}" stroke-width="17"/><circle cx="${x}" cy="${y}" r="24" fill="none" stroke="url(#pat)" stroke-width="17"/>`).join("");
    case "lunettes":
      return line("M56 96 L34 88 M144 96 L166 88", c.base, 5) + `<rect x="54" y="86" width="40" height="32" rx="13" fill="#1f2937" fill-opacity=".85" stroke="${c.base}" stroke-width="6"/><rect x="106" y="86" width="40" height="32" rx="13" fill="#1f2937" fill-opacity=".85" stroke="${c.base}" stroke-width="6"/>` + line("M94 96 Q100 90 106 96", c.base, 5) + line("M62 94 L70 90 M114 94 L122 90", "#ffffff", 2.4, 'opacity=".6"');
    case "montre":
      return `<rect x="88" y="26" width="24" height="148" rx="10" fill="${c.base}" stroke="${c.dark}" stroke-width="2"/>` + [44, 56, 144, 156].map((y) => circle(100, y, 2, c.dark)).join("") + circle(100, 100, 28, "#ffffff", `stroke="${c.dark}" stroke-width="8"`) + [0, 1, 2, 3].map((i) => { const a = (i * Math.PI) / 2; return circle(100 + 19 * Math.cos(a), 100 + 19 * Math.sin(a), 2, "#111827"); }).join("") + line("M100 100 L100 86 M100 100 L110 106", "#111827", 2.6);
    case "ceinture":
      return `<rect x="34" y="90" width="134" height="20" rx="10" fill="${c.base}" stroke="${c.dark}" stroke-width="2"/>` + [120, 134, 148].map((x) => circle(x, 100, 2.2, c.dark)).join("") + `<rect x="40" y="84" width="30" height="32" rx="6" fill="none" stroke="#d4a72c" stroke-width="5"/>` + line("M55 86 L55 114", "#d4a72c", 3);
    case "noeud-papillon":
      return line("M70 18 L86 104 M130 18 L114 104", c.base, 9) + `<rect x="64" y="14" width="12" height="10" rx="2" fill="#9ca3af"/><rect x="124" y="14" width="12" height="10" rx="2" fill="#9ca3af"/>` + bow(100, 124, c.base, 2.4);
    case "bonnet":
      return shape(P.bonnetDome, c, pat) + `<path d="M50 118 L150 118 L150 144 Q100 152 50 144 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="2"/>` + [64, 78, 92, 106, 120, 134].map((x) => line(`M${x} 122 L${x} 144`, c.dark, 1.2, 'opacity=".5"')).join("") + (o.pompon ? circle(100, 54, 13, c.light, `stroke="${c.dark}" stroke-width="1.6"`) : "");
    case "bavoir":
      return shape(P.bavoir, c, pat) + `<path d="M84 40 Q88 64 100 64 Q112 64 116 40" fill="none" stroke="${c.dark}" stroke-width="3"/>` + `<g transform="translate(0 16)">${motif(m ?? "coeur", c)}</g>`;
    case "chausson":
      return shape(P.bootie, c, pat) + `<path d="M68 66 L108 66 L108 84 L68 84 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="2"/>` + (o.pompon ? circle(118, 110, 8, c.light, `stroke="${c.dark}"`) : bow(116, 112, c.light, 0.7)) + line("M66 146 L150 146", c.dark, 3, 'opacity=".5"');
    case "chaussons":
      return `<g transform="translate(-30 -16) scale(.92)">${draw("chausson", c, pat, o)}</g><g transform="translate(18 18) scale(.92)">${draw("chausson", c, pat, o)}</g>`;
    case "basket": {
      const sole = o.semelle ?? "#ffffff";
      let s = shape(o.haute ? P.basketHaute : P.basket, c, pat) + `<path d="M150 108 Q172 116 178 134 L146 134 Q144 120 150 108 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="1.8"/>` + `<path d="${P.semelle}" fill="${sole}" stroke="#94a3b8" stroke-width="2"/>` + line("M36 120 Q90 110 140 124", c.light, 5, 'opacity=".9"');
      if (o.velcro) s += `<path d="M86 92 L120 86 L126 100 L92 106 Z M98 108 L134 102 L140 116 L104 122 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="1.8"/>`;
      else s += line("M98 86 L108 96 M106 82 L118 92 M114 80 L124 90", "#ffffff", 3) + line("M98 86 L108 96 M106 82 L118 92 M114 80 L124 90", c.dark, 1, 'opacity=".4"');
      if (o.led) s += ["#ef4444", "#facc15", "#22c55e", "#3b82f6", "#a855f7"].map((col, i) => `<rect x="${46 + i * 25}" y="140" width="14" height="6" rx="3" fill="${col}"/>`).join("");
      return s;
    }
    case "sandale":
      return `<path d="M28 140 Q28 130 42 130 L166 130 Q180 130 180 140 L178 150 Q170 154 160 154 L40 154 Q28 154 28 146 Z" fill="${o.semelle ?? "#e7d7b8"}" stroke="#a16207" stroke-width="2"/>` + line("M64 130 Q76 92 108 100 L118 130", c.dark, 13) + line("M64 130 Q76 92 108 100 L118 130", c.base, 9) + line("M42 130 Q38 104 58 100", c.dark, 11) + line("M42 130 Q38 104 58 100", c.base, 7) + (o.fleur ? flower(96, 102, 5, "#ffffff") : "") + (o.velcro ? `<rect x="80" y="104" width="26" height="12" rx="3" fill="${c.light}" stroke="${c.dark}" transform="rotate(-12 93 110)"/>` : "");
    case "claquette":
      return `<path d="M28 140 Q28 130 42 130 L166 130 Q180 130 180 140 L178 150 Q170 154 160 154 L40 154 Q28 154 28 146 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="2"/>` + shape("M68 132 Q72 96 110 94 Q148 96 152 132 Z", c, pat) + `<rect x="92" y="106" width="36" height="12" rx="4" fill="#ffffff" opacity=".8"/>`;
    case "meduse":
      return `<path d="M28 140 Q28 130 42 130 L166 130 Q180 130 180 140 L178 150 Q170 154 160 154 L40 154 Q28 154 28 146 Z" fill="${c.base}" stroke="${c.dark}" stroke-width="2" fill-opacity=".9"/>` + [70, 90, 110, 130].map((x) => line(`M${x} 130 Q${x + 8} 100 ${x + 18} 130`, c.base, 7, 'opacity=".9"')).join("") + line("M60 110 Q110 92 156 118", c.base, 7, 'opacity=".9"') + line("M42 130 Q38 104 58 100", c.base, 7);
    case "ballerine":
      return shape(P.ballerine, c, pat) + `<path d="M74 112 Q104 122 134 112 Q128 126 104 128 Q80 126 74 112 Z" fill="${c.dark}"/>` + bow(84, 116, o.noeud ?? c.light, 0.8) + line("M38 144 L170 144", c.dark, 2.4, 'opacity=".5"');
    case "derby":
      return shape(P.derby, c, pat) + `<path d="M30 140 L178 140 Q178 150 158 152 L48 152 Q30 152 30 140 Z" fill="${c.dark}"/>` + line("M90 100 L112 96 M92 108 L116 102 M94 116 L120 108", c.light, 2.4) + line("M40 132 Q100 124 170 130", c.light, 1.6, 'stroke-dasharray="3 3"');
    case "premiers-pas":
      return shape(o.haute ? P.bottine : P.premiersPas, c, pat) + `<path d="M56 140 L160 140 Q160 152 140 154 L72 154 Q56 154 56 140 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>` + (o.haute ? line("M80 64 L104 60 M80 78 L106 74 M82 92 L110 88", c.light, 3) : `<path d="M76 100 L116 92 L118 108 L80 116 Z" fill="${c.light}" stroke="${c.dark}" stroke-width="1.8"/>`) + (o.fleur ? flower(132, 126, 4, "#ffffff") : "");
    case "sandale-bebe":
      return `<path d="M56 140 L160 140 Q160 152 140 154 L72 154 Q56 154 56 140 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>` + line("M70 140 Q66 100 104 94 L124 140", c.dark, 12) + line("M70 140 Q66 100 104 94 L124 140", c.base, 8) + line("M94 118 L150 132", c.base, 8) + flower(100, 110, 4, "#ffffff");
    default:
      throw new Error(`Type inconnu : ${type}`);
  }
}

/** Plusieurs exemplaires (lots) */
function drawLot(type, colors, pat, o) {
  const pos = [
    [-30, -4, -8],
    [30, -4, 8],
    [0, 8, 0],
  ];
  return pos
    .map(([dx, dy, rot], i) => {
      const c = palette(colors[i % colors.length]);
      return `<g transform="translate(${100 + dx} ${100 + dy}) rotate(${rot}) scale(.66) translate(-100 -100)">${draw(type, c, pat ? pat : null, o)}</g>`;
    })
    .join("");
}

function renderSvg(prod, colorName, { detail = false } = {}) {
  const c = palette(colorName);
  const pat = prod.pat ? patternDef(prod.pat, c) : "";
  const lotColors = prod.lot ? (prod.col.length >= 2 ? prod.col : MULTI) : null;
  let inner = lotColors ? drawLot(prod.t, colorName === prod.col[0] ? lotColors : [colorName, ...lotColors.filter((x) => x !== colorName)], Boolean(pat), prod.o ?? {}) : draw(prod.t, c, pat ? true : null, prod.o ?? {});
  if (detail) inner = `<g transform="translate(100 100) scale(1.85) translate(-100 -96)">${inner}</g>`;
  const tint = lotColors ? "#f1f5f9" : c.tint;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="800" height="800">
<defs>${pat}<radialGradient id="bg" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="${tint}"/><stop offset="1" stop-color="#ffffff"/></radialGradient></defs>
<rect width="200" height="200" fill="#ffffff"/>
<circle cx="100" cy="100" r="86" fill="url(#bg)"/>
${detail ? "" : `<ellipse cx="100" cy="182" rx="56" ry="6" fill="#0f172a" opacity=".06"/>`}
${inner}
</svg>`;
}

/* ------------------------------------------------------------------ catalogue */

// n: nom · c: catégorie · s: sous-catégorie · b: marque · p: prix FCFA · r: note
// t: type de visuel · col: couleurs · pat: motif · o: options du visuel · sz: grille de tailles
// mat: matière · g: fille | garcon | mixte · lot: visuel « lot »
const PRODUCTS = [
  // ——— BÉBÉ
  { n: "Lot de 3 bodies coton bio", c: "bebe", s: "bodies-grenouilleres", b: "Coton Câlin", p: 9900, r: 4.8, t: "body", col: ["Blanc", "Bleu ciel", "Rose"], lot: true, sz: "bebe", mat: "Coton bio certifié", g: "mixte" },
  { n: "Body manches courtes étoiles", c: "bebe", s: "bodies-grenouilleres", b: "MMKids", p: 3500, r: 4.5, t: "body", col: ["Jaune", "Gris"], pat: "etoiles", sz: "bebe", mat: "100 % coton", g: "mixte" },
  { n: "Body marinière à rayures", c: "bebe", s: "bodies-grenouilleres", b: "Petit Baobab", p: 4200, r: 4.6, t: "body", col: ["Bleu marine", "Rouge"], pat: "rayures", sz: "bebe", mat: "100 % coton", g: "mixte" },
  { n: "Grenouillère velours nuages", c: "bebe", s: "bodies-grenouilleres", b: "Dodo Doux", p: 8900, r: 4.7, t: "grenouillere", col: ["Bleu ciel", "Rose"], pat: "pois", sz: "bebe", mat: "Velours coton", g: "mixte" },
  { n: "Grenouillère zippée lapin", c: "bebe", s: "bodies-grenouilleres", b: "Coton Câlin", p: 9500, r: 4.6, t: "grenouillere", col: ["Jaune", "Vert menthe"], o: { motif: "lapin" }, sz: "bebe", mat: "Coton bio", g: "mixte" },
  { n: "Lot de 3 bodies manches longues", c: "bebe", s: "bodies-grenouilleres", b: "MMKids", p: 10900, r: 4.4, t: "body-ml", col: ["Blanc", "Gris", "Bleu ciel"], lot: true, sz: "bebe", mat: "100 % coton", g: "mixte" },
  { n: "Body wax bébé", c: "bebe", s: "bodies-grenouilleres", b: "Akwaba Kids", p: 5500, r: 4.8, t: "body", col: ["Orange", "Bleu"], pat: "wax", sz: "bebe", mat: "Tissu wax 100 % coton", g: "mixte" },
  { n: "Barboteuse bébé fleurie", c: "bebe", s: "bodies-grenouilleres", b: "Petit Baobab", p: 6900, r: 4.7, t: "body", col: ["Rose", "Lilas"], pat: "fleurs", sz: "bebe", mat: "Coton léger", g: "fille" },
  { n: "Gigoteuse turbulette 0-6 mois", c: "bebe", s: "bodies-grenouilleres", b: "Dodo Doux", p: 15900, r: 4.9, t: "gigoteuse", col: ["Gris", "Rose"], pat: "etoiles", sz: "bebe", mat: "Coton ouatiné", g: "mixte" },
  { n: "Ensemble naissance 3 pièces", c: "bebe", s: "ensembles-bebe", b: "Coton Câlin", p: 14900, r: 4.8, t: "ensemble", col: ["Blanc", "Beige"], o: { top: "body", bottom: "pantalon" }, sz: "bebe", mat: "Coton bio", g: "mixte" },
  { n: "Robe bébé à volants", c: "bebe", s: "ensembles-bebe", b: "Petit Baobab", p: 9900, r: 4.7, t: "robe-volants", col: ["Rose", "Jaune"], o: { noeud: "#ffffff" }, sz: "bebe", mat: "Coton et tulle", g: "fille" },
  { n: "Salopette bébé en jean", c: "bebe", s: "ensembles-bebe", b: "MMKids", p: 11500, r: 4.5, t: "salopette", col: ["Bleu jean"], o: { jean: true }, sz: "bebe", mat: "Denim coton souple", g: "mixte" },
  { n: "Ensemble bébé short et t-shirt", c: "bebe", s: "ensembles-bebe", b: "Lagune Kids", p: 7900, r: 4.5, t: "ensemble", col: ["Vert menthe", "Bleu ciel"], o: { top: "tshirt", bottom: "short", motif: "soleil" }, sz: "bebe", mat: "100 % coton", g: "mixte" },
  { n: "Combinaison bébé imprimé safari", c: "bebe", s: "ensembles-bebe", b: "Petit Baobab", p: 10500, r: 4.6, t: "combinaison", col: ["Beige", "Vert menthe"], pat: "safari", sz: "bebe", mat: "Coton léger", g: "mixte" },
  { n: "Kimono bébé en wax", c: "bebe", s: "ensembles-bebe", b: "Akwaba Kids", p: 8900, r: 4.8, t: "boubou", col: ["Orange", "Vert"], pat: "wax", sz: "bebe", mat: "Tissu wax 100 % coton", g: "mixte" },
  { n: "Lot de 2 bonnets naissance", c: "bebe", s: "accessoires-bebe", b: "Coton Câlin", p: 3500, r: 4.6, t: "bonnet", col: ["Blanc", "Gris"], sz: "bebe-acc", mat: "Maille coton", g: "mixte" },
  { n: "Lot de 5 bavoirs imperméables", c: "bebe", s: "accessoires-bebe", b: "MMKids", p: 5900, r: 4.4, t: "bavoir", col: [], lot: true, sz: null, mat: "Coton éponge et doublure imperméable", g: "mixte" },
  { n: "Chaussons bébé tricotés", c: "bebe", s: "accessoires-bebe", b: "Coton Câlin", p: 4500, r: 4.7, t: "chaussons", col: ["Rose", "Bleu ciel", "Blanc"], o: { pompon: true }, sz: "bebe-acc", mat: "Maille tricot", g: "mixte" },
  { n: "Bandeau bébé à nœud", c: "bebe", s: "accessoires-bebe", b: "Petit Baobab", p: 2500, r: 4.5, t: "serre-tete", col: ["Rose", "Blanc"], sz: null, mat: "Élasthanne doux", g: "fille" },

  // ——— FILLE
  { n: "Robe d'été fleurie", c: "fille", s: "robes-fille", b: "MMKids", p: 9900, r: 4.7, t: "robe", col: ["Jaune", "Rose"], pat: "fleurs", sz: "enfant", mat: "Coton léger", g: "fille" },
  { n: "Robe en wax fille", c: "fille", s: "robes-fille", b: "Wax Junior", p: 14500, r: 4.9, t: "robe", col: ["Orange", "Bleu"], pat: "wax", sz: "enfant", mat: "Tissu wax 100 % coton", g: "fille" },
  { n: "Robe tutu à paillettes", c: "fille", s: "robes-fille", b: "MMKids", p: 12900, r: 4.6, t: "robe-volants", col: ["Lilas", "Rose"], pat: "paillettes", sz: "enfant", mat: "Tulle et coton", g: "fille" },
  { n: "Robe chasuble en jean", c: "fille", s: "robes-fille", b: "Lagune Kids", p: 11900, r: 4.5, t: "robe", col: ["Bleu jean"], sz: "enfant", mat: "Denim coton", g: "fille" },
  { n: "Robe t-shirt à rayures", c: "fille", s: "robes-fille", b: "MMKids", p: 7500, r: 4.4, t: "robe", col: ["Rouge", "Bleu marine"], pat: "rayures", sz: "enfant", mat: "Jersey coton", g: "fille" },
  { n: "Robe à smocks en coton", c: "fille", s: "robes-fille", b: "Petit Baobab", p: 10900, r: 4.6, t: "robe", col: ["Blanc", "Corail"], o: { noeud: "#fb7185" }, sz: "enfant", mat: "Coton popeline", g: "fille" },
  { n: "Robe longue bohème", c: "fille", s: "robes-fille", b: "MMKids", p: 13500, r: 4.5, t: "robe", col: ["Turquoise", "Corail"], pat: "fleurs", sz: "enfant", mat: "Viscose fluide", g: "fille" },
  { n: "T-shirt fille licorne", c: "fille", s: "hauts-fille", b: "MMKids", p: 4900, r: 4.7, t: "tshirt", col: ["Rose", "Blanc"], o: { motif: "licorne" }, sz: "enfant", mat: "100 % coton", g: "fille" },
  { n: "T-shirt sequins réversibles", c: "fille", s: "hauts-fille", b: "Lagune Kids", p: 6500, r: 4.6, t: "tshirt", col: ["Lilas", "Gris"], pat: "paillettes", sz: "enfant", mat: "Coton et sequins", g: "fille" },
  { n: "Blouse fille col Claudine", c: "fille", s: "hauts-fille", b: "Mini Chic", p: 8500, r: 4.5, t: "chemise", col: ["Blanc", "Rose"], sz: "enfant", mat: "Coton popeline", g: "fille" },
  { n: "Lot de 2 débardeurs fille", c: "fille", s: "hauts-fille", b: "MMKids", p: 5500, r: 4.3, t: "debardeur", col: ["Jaune", "Vert menthe"], lot: true, sz: "enfant", mat: "Coton côtelé", g: "fille" },
  { n: "Top fille cœur brodé", c: "fille", s: "hauts-fille", b: "MMKids", p: 5900, r: 4.4, t: "tshirt", col: ["Corail", "Blanc"], o: { motif: "coeur" }, sz: "enfant", mat: "100 % coton", g: "fille" },
  { n: "Jupe plissée fille", c: "fille", s: "bas-fille", b: "MMKids", p: 7900, r: 4.5, t: "jupe", col: ["Bleu marine", "Rose"], sz: "enfant", mat: "Polyester recyclé", g: "fille" },
  { n: "Jupe en jean brodée", c: "fille", s: "bas-fille", b: "Lagune Kids", p: 8900, r: 4.4, t: "jupe", col: ["Bleu jean"], sz: "enfant", mat: "Denim coton", g: "fille" },
  { n: "Short fille en coton", c: "fille", s: "bas-fille", b: "MMKids", p: 4900, r: 4.5, t: "short", col: ["Rose", "Jaune", "Bleu ciel"], sz: "enfant", mat: "100 % coton", g: "fille" },
  { n: "Lot de 2 leggings fille", c: "fille", s: "bas-fille", b: "MMKids", p: 6900, r: 4.6, t: "legging", col: ["Noir", "Rose"], lot: true, sz: "enfant", mat: "Coton et élasthanne", g: "fille" },
  { n: "Pantalon large wax fille", c: "fille", s: "bas-fille", b: "Wax Junior", p: 9500, r: 4.7, t: "pantalon", col: ["Vert", "Orange"], pat: "wax", sz: "enfant", mat: "Tissu wax 100 % coton", g: "fille" },
  { n: "Jean slim fille", c: "fille", s: "bas-fille", b: "Lagune Kids", p: 11500, r: 4.4, t: "jean", col: ["Bleu jean"], sz: "enfant", mat: "Denim stretch", g: "fille" },
  { n: "Ensemble fille t-shirt et jupe", c: "fille", s: "ensembles-fille", b: "MMKids", p: 12500, r: 4.6, t: "ensemble", col: ["Rose", "Lilas"], o: { top: "tshirt", bottom: "jupe", motif: "coeur" }, sz: "enfant", mat: "100 % coton", g: "fille" },
  { n: "Combishort fille fleuri", c: "fille", s: "ensembles-fille", b: "Lagune Kids", p: 10900, r: 4.5, t: "combinaison", col: ["Jaune", "Turquoise"], pat: "fleurs", sz: "enfant", mat: "Coton léger", g: "fille" },
  { n: "Ensemble legging et tunique", c: "fille", s: "ensembles-fille", b: "MMKids", p: 11900, r: 4.4, t: "ensemble", col: ["Turquoise", "Rose"], o: { top: "tshirt", bottom: "legging", motif: "etoile" }, sz: "enfant", mat: "Coton et élasthanne", g: "fille" },
  { n: "Salopette fille en velours", c: "fille", s: "ensembles-fille", b: "Petit Baobab", p: 13900, r: 4.6, t: "salopette", col: ["Rose", "Beige"], o: { motif: "coeur" }, sz: "enfant", mat: "Velours côtelé", g: "fille" },

  // ——— GARÇON
  { n: "T-shirt garçon dinosaure", c: "garcon", s: "tshirts-garcon", b: "MMKids", p: 4900, r: 4.8, t: "tshirt", col: ["Gris", "Bleu ciel"], o: { motif: "dino" }, sz: "enfant", mat: "100 % coton", g: "garcon" },
  { n: "T-shirt garçon voiture de course", c: "garcon", s: "tshirts-garcon", b: "MMKids", p: 4900, r: 4.6, t: "tshirt", col: ["Blanc", "Jaune"], o: { motif: "voiture" }, sz: "enfant", mat: "100 % coton", g: "garcon" },
  { n: "Lot de 3 t-shirts basiques", c: "garcon", s: "tshirts-garcon", b: "MMKids", p: 9900, r: 4.5, t: "tshirt", col: ["Blanc", "Bleu marine", "Gris"], lot: true, sz: "enfant", mat: "100 % coton", g: "mixte" },
  { n: "Polo garçon en piqué", c: "garcon", s: "tshirts-garcon", b: "Lagune Kids", p: 7500, r: 4.5, t: "polo", col: ["Bleu marine", "Blanc", "Rouge"], sz: "enfant", mat: "Piqué de coton", g: "garcon" },
  { n: "T-shirt rayé garçon", c: "garcon", s: "tshirts-garcon", b: "Petit Baobab", p: 5500, r: 4.4, t: "tshirt", col: ["Bleu marine", "Vert"], pat: "rayures", sz: "enfant", mat: "100 % coton", g: "garcon" },
  { n: "Débardeur garçon ballon", c: "garcon", s: "tshirts-garcon", b: "Kidsport", p: 3900, r: 4.3, t: "debardeur", col: ["Gris", "Bleu"], o: { motif: "ballon" }, sz: "enfant", mat: "Coton respirant", g: "garcon" },
  { n: "Chemise garçon à carreaux", c: "garcon", s: "chemises-garcon", b: "MMKids", p: 8900, r: 4.5, t: "chemise", col: ["Rouge", "Bleu"], pat: "carreaux", sz: "enfant", mat: "Coton flanelle légère", g: "garcon" },
  { n: "Chemise wax garçon", c: "garcon", s: "chemises-garcon", b: "Wax Junior", p: 11900, r: 4.9, t: "chemise", col: ["Orange", "Bleu"], pat: "wax", sz: "enfant", mat: "Tissu wax 100 % coton", g: "garcon" },
  { n: "Chemise en lin manches courtes", c: "garcon", s: "chemises-garcon", b: "Lagune Kids", p: 9900, r: 4.6, t: "chemise", col: ["Blanc", "Beige"], sz: "enfant", mat: "Lin et coton", g: "garcon" },
  { n: "Chemise en jean garçon", c: "garcon", s: "chemises-garcon", b: "MMKids", p: 10500, r: 4.4, t: "chemise", col: ["Bleu jean"], sz: "enfant", mat: "Denim léger", g: "garcon" },
  { n: "Short cargo garçon", c: "garcon", s: "bas-garcon", b: "MMKids", p: 6900, r: 4.6, t: "short", col: ["Kaki", "Beige"], sz: "enfant", mat: "Toile de coton", g: "garcon" },
  { n: "Bermuda en jean garçon", c: "garcon", s: "bas-garcon", b: "Lagune Kids", p: 7900, r: 4.5, t: "bermuda-jean", col: ["Bleu jean"], sz: "enfant", mat: "Denim coton", g: "garcon" },
  { n: "Pantalon chino garçon", c: "garcon", s: "bas-garcon", b: "MMKids", p: 9900, r: 4.4, t: "pantalon", col: ["Beige", "Bleu marine"], sz: "enfant", mat: "Twill de coton", g: "garcon" },
  { n: "Jean regular garçon", c: "garcon", s: "bas-garcon", b: "Lagune Kids", p: 11500, r: 4.5, t: "jean", col: ["Bleu jean"], sz: "enfant", mat: "Denim coton", g: "garcon" },
  { n: "Jogging molleton garçon", c: "garcon", s: "bas-garcon", b: "MMKids", p: 7900, r: 4.6, t: "pantalon", col: ["Gris", "Bleu marine"], o: { cuffs: true }, sz: "enfant", mat: "Molleton coton", g: "garcon" },
  { n: "Ensemble garçon t-shirt et short", c: "garcon", s: "ensembles-garcon", b: "MMKids", p: 9900, r: 4.7, t: "ensemble", col: ["Bleu ciel", "Vert"], o: { top: "tshirt", bottom: "short", motif: "dino" }, sz: "enfant", mat: "100 % coton", g: "garcon" },
  { n: "Ensemble chemise et bermuda", c: "garcon", s: "ensembles-garcon", b: "Lagune Kids", p: 15900, r: 4.6, t: "ensemble", col: ["Blanc", "Bleu ciel"], o: { top: "chemise", bottom: "short", bottomColor: "Beige", bottomPattern: false }, sz: "enfant", mat: "Lin et coton", g: "garcon" },
  { n: "Salopette courte garçon", c: "garcon", s: "ensembles-garcon", b: "Petit Baobab", p: 11900, r: 4.5, t: "salopette-courte", col: ["Bleu jean"], o: { jean: true }, sz: "enfant", mat: "Denim coton", g: "garcon" },
  { n: "Ensemble wax garçon", c: "garcon", s: "ensembles-garcon", b: "Wax Junior", p: 16900, r: 4.8, t: "ensemble", col: ["Orange", "Vert"], pat: "wax", o: { top: "chemise", bottom: "pantalon" }, sz: "enfant", mat: "Tissu wax 100 % coton", g: "garcon" },

  // ——— CÉRÉMONIE
  { n: "Robe de cérémonie satin et tulle", c: "ceremonie", s: "robes-ceremonie", b: "Mini Chic", p: 24900, r: 4.9, t: "robe-volants", col: ["Blanc", "Rose"], o: { noeud: "#d4a72c" }, sz: "enfant", mat: "Satin et tulle", g: "fille" },
  { n: "Robe demoiselle d'honneur", c: "ceremonie", s: "robes-ceremonie", b: "Mini Chic", p: 27900, r: 4.8, t: "robe-volants", col: ["Lilas", "Blanc"], pat: "paillettes", sz: "enfant", mat: "Mousseline et tulle", g: "fille" },
  { n: "Robe princesse à nœud", c: "ceremonie", s: "robes-ceremonie", b: "Mini Chic", p: 21900, r: 4.7, t: "robe", col: ["Rouge", "Bleu ciel"], o: { noeud: "#ffffff" }, sz: "enfant", mat: "Satin doublé coton", g: "fille" },
  { n: "Robe de baptême brodée", c: "ceremonie", s: "robes-ceremonie", b: "Mini Chic", p: 19900, r: 4.9, t: "robe-volants", col: ["Blanc", "Beige"], o: { noeud: "#fde68a" }, sz: "bebe", mat: "Coton brodé", g: "fille" },
  { n: "Costume garçon 3 pièces", c: "ceremonie", s: "costumes-garcon", b: "Mini Chic", p: 32900, r: 4.8, t: "costume", col: ["Bleu marine", "Gris", "Noir"], sz: "enfant", mat: "Polyester et viscose", g: "garcon" },
  { n: "Chemise blanche et nœud papillon", c: "ceremonie", s: "costumes-garcon", b: "Mini Chic", p: 13900, r: 4.6, t: "chemise", col: ["Blanc"], o: { noeud: "#dc2626" }, sz: "enfant", mat: "Coton popeline", g: "garcon" },
  { n: "Gilet de costume garçon", c: "ceremonie", s: "costumes-garcon", b: "Mini Chic", p: 9900, r: 4.5, t: "gilet-costume", col: ["Gris", "Bleu marine"], o: { noeud: "#1e3a8a" }, sz: "enfant", mat: "Polyester et viscose", g: "garcon" },
  { n: "Boubou garçon brodé", c: "ceremonie", s: "tenues-traditionnelles", b: "Akwaba Kids", p: 18900, r: 4.9, t: "boubou", col: ["Blanc", "Bleu ciel"], sz: "enfant", mat: "Bazin brodé", g: "garcon" },
  { n: "Ensemble pagne fille haut et jupe", c: "ceremonie", s: "tenues-traditionnelles", b: "Akwaba Kids", p: 16500, r: 4.8, t: "ensemble", col: ["Orange", "Vert"], pat: "wax", o: { top: "tshirt", bottom: "jupe" }, sz: "enfant", mat: "Tissu wax 100 % coton", g: "fille" },
  { n: "Robe kita fille", c: "ceremonie", s: "tenues-traditionnelles", b: "Akwaba Kids", p: 19900, r: 4.9, t: "robe", col: ["Jaune"], pat: "kente", sz: "enfant", mat: "Pagne tissé kita", g: "fille" },
  { n: "Tenue traditionnelle garçon tunique et pantalon", c: "ceremonie", s: "tenues-traditionnelles", b: "Wax Junior", p: 17900, r: 4.7, t: "boubou", col: ["Vert", "Bleu"], pat: "wax", sz: "enfant", mat: "Tissu wax 100 % coton", g: "garcon" },
  { n: "Robe sirène wax fille", c: "ceremonie", s: "tenues-traditionnelles", b: "Wax Junior", p: 15900, r: 4.6, t: "robe", col: ["Bleu", "Fuchsia"], pat: "wax", sz: "enfant", mat: "Tissu wax 100 % coton", g: "fille" },

  // ——— CHAUSSURES
  { n: "Baskets lumineuses LED", c: "chaussures", s: "baskets-enfant", b: "Kidstep", p: 14900, r: 4.8, t: "basket", col: ["Rose", "Noir"], o: { led: true, velcro: true }, sz: "pointure", mat: "Synthétique et semelle caoutchouc", g: "mixte" },
  { n: "Baskets à scratch enfant", c: "chaussures", s: "baskets-enfant", b: "P'tits Pas", p: 11900, r: 4.6, t: "basket", col: ["Bleu marine", "Blanc"], o: { velcro: true }, sz: "pointure", mat: "Cuir synthétique", g: "mixte" },
  { n: "Baskets montantes en toile", c: "chaussures", s: "baskets-enfant", b: "Kidstep", p: 12500, r: 4.5, t: "basket", col: ["Rouge", "Noir"], o: { haute: true }, sz: "pointure", mat: "Toile et caoutchouc", g: "mixte" },
  { n: "Baskets running junior", c: "chaussures", s: "baskets-enfant", b: "Kidstep", p: 16900, r: 4.7, t: "basket", col: ["Gris", "Bleu ciel"], sz: "pointure", mat: "Mesh respirant", g: "mixte" },
  { n: "Tennis blanches à scratch", c: "chaussures", s: "baskets-enfant", b: "P'tits Pas", p: 9900, r: 4.4, t: "basket", col: ["Blanc"], o: { velcro: true }, sz: "pointure", mat: "Cuir synthétique", g: "mixte" },
  { n: "Sandales fille à fleurs", c: "chaussures", s: "sandales-enfant", b: "P'tits Pas", p: 7900, r: 4.6, t: "sandale", col: ["Rose", "Jaune"], o: { fleur: true }, sz: "pointure", mat: "Cuir synthétique", g: "fille" },
  { n: "Sandales garçon sport", c: "chaussures", s: "sandales-enfant", b: "Kidstep", p: 8500, r: 4.5, t: "sandale", col: ["Bleu marine", "Kaki"], o: { velcro: true, semelle: "#374151" }, sz: "pointure", mat: "Textile et mousse EVA", g: "garcon" },
  { n: "Claquettes enfant", c: "chaussures", s: "sandales-enfant", b: "MMKids", p: 3500, r: 4.3, t: "claquette", col: ["Bleu ciel", "Rose", "Noir"], sz: "pointure", mat: "Mousse EVA", g: "mixte" },
  { n: "Sandales méduses", c: "chaussures", s: "sandales-enfant", b: "MMKids", p: 4500, r: 4.2, t: "meduse", col: ["Rose", "Turquoise"], sz: "pointure", mat: "Plastique souple sans BPA", g: "fille" },
  { n: "Ballerines vernies fille", c: "chaussures", s: "chaussures-habillees", b: "Mini Chic", p: 11900, r: 4.6, t: "ballerine", col: ["Noir", "Rouge", "Rose"], sz: "pointure", mat: "Synthétique verni", g: "fille" },
  { n: "Mocassins garçon", c: "chaussures", s: "chaussures-habillees", b: "Mini Chic", p: 14900, r: 4.5, t: "derby", col: ["Marron", "Noir"], sz: "pointure", mat: "Cuir", g: "garcon" },
  { n: "Ballerines à paillettes", c: "chaussures", s: "chaussures-habillees", b: "P'tits Pas", p: 9900, r: 4.7, t: "ballerine", col: ["Doré", "Argent"], pat: "paillettes", sz: "pointure", mat: "Synthétique pailleté", g: "fille" },
  { n: "Chaussures premiers pas cuir souple", c: "chaussures", s: "premiers-pas", b: "P'tits Pas", p: 13900, r: 4.9, t: "premiers-pas", col: ["Blanc", "Rose", "Bleu ciel"], sz: "premiers-pas", mat: "Cuir souple", g: "mixte" },
  { n: "Chaussons antidérapants bébé", c: "chaussures", s: "premiers-pas", b: "P'tits Pas", p: 5900, r: 4.6, t: "chaussons", col: ["Gris", "Rose"], sz: "premiers-pas", mat: "Textile et semelle antidérapante", g: "mixte" },
  { n: "Bottines premiers pas", c: "chaussures", s: "premiers-pas", b: "P'tits Pas", p: 15900, r: 4.7, t: "premiers-pas", col: ["Marron", "Beige"], o: { haute: true }, sz: "premiers-pas", mat: "Cuir", g: "mixte" },
  { n: "Sandales premiers pas", c: "chaussures", s: "premiers-pas", b: "P'tits Pas", p: 9500, r: 4.5, t: "sandale-bebe", col: ["Blanc", "Rose"], sz: "premiers-pas", mat: "Cuir souple", g: "mixte" },

  // ——— PYJAMAS & DESSOUS
  { n: "Pyjama court fille licorne", c: "nuit", s: "pyjamas", b: "Dodo Doux", p: 7900, r: 4.8, t: "pyjama", col: ["Rose", "Lilas"], o: { bottom: "short", motif: "licorne" }, sz: "enfant", mat: "100 % coton", g: "fille" },
  { n: "Pyjama long garçon dinosaures", c: "nuit", s: "pyjamas", b: "Dodo Doux", p: 9500, r: 4.7, t: "pyjama", col: ["Bleu marine", "Vert"], o: { motif: "dino" }, sz: "enfant", mat: "Coton interlock", g: "garcon" },
  { n: "Pyjama coton à étoiles", c: "nuit", s: "pyjamas", b: "Dodo Doux", p: 8500, r: 4.6, t: "pyjama", col: ["Bleu ciel", "Gris"], pat: "etoiles", sz: "enfant", mat: "100 % coton", g: "mixte" },
  { n: "Chemise de nuit fille", c: "nuit", s: "pyjamas", b: "Dodo Doux", p: 6900, r: 4.5, t: "robe", col: ["Rose", "Blanc"], pat: "pois", sz: "enfant", mat: "Coton léger", g: "fille" },
  { n: "Pyjama combinaison enfant", c: "nuit", s: "pyjamas", b: "Dodo Doux", p: 11900, r: 4.6, t: "grenouillere", col: ["Gris", "Rose"], pat: "etoiles", sz: "enfant", mat: "Molleton doux", g: "mixte" },
  { n: "Lot de 5 slips garçon", c: "nuit", s: "sous-vetements", b: "MMKids", p: 6500, r: 4.4, t: "slip", col: [], lot: true, sz: "dessous", mat: "Coton et élasthanne", g: "garcon" },
  { n: "Lot de 5 culottes fille", c: "nuit", s: "sous-vetements", b: "MMKids", p: 6500, r: 4.5, t: "culotte", col: [], lot: true, sz: "dessous", mat: "Coton et élasthanne", g: "fille" },
  { n: "Lot de 3 boxers garçon", c: "nuit", s: "sous-vetements", b: "MMKids", p: 6900, r: 4.5, t: "boxer", col: ["Bleu marine", "Gris", "Vert"], lot: true, sz: "dessous", mat: "Coton et élasthanne", g: "garcon" },
  { n: "Lot de 2 maillots de corps", c: "nuit", s: "sous-vetements", b: "Coton Câlin", p: 4500, r: 4.3, t: "debardeur", col: ["Blanc"], lot: true, sz: "dessous", mat: "Coton côtelé", g: "mixte" },
  { n: "Lot de 7 paires de chaussettes", c: "nuit", s: "chaussettes-collants", b: "MMKids", p: 5500, r: 4.6, t: "chaussette", col: [], lot: true, pat: "rayures", sz: "chaussettes", mat: "Coton peigné", g: "mixte" },
  { n: "Chaussettes antidérapantes bébé", c: "nuit", s: "chaussettes-collants", b: "Coton Câlin", p: 3900, r: 4.5, t: "chaussettes", col: ["Rose", "Bleu ciel"], pat: "pois", sz: "chaussettes", mat: "Coton et picots silicone", g: "mixte" },
  { n: "Lot de 2 collants fille", c: "nuit", s: "chaussettes-collants", b: "MMKids", p: 4900, r: 4.4, t: "collants", col: ["Blanc", "Rose", "Bleu marine"], sz: "enfant", mat: "Coton et polyamide", g: "fille" },

  // ——— SPORT & PLAGE
  { n: "Survêtement enfant 2 pièces", c: "sport-plage", s: "survetements", b: "Kidsport", p: 15900, r: 4.7, t: "survetement", col: ["Bleu marine", "Rouge", "Noir"], sz: "enfant", mat: "Polyester recyclé", g: "mixte" },
  { n: "Veste de survêtement zippée", c: "sport-plage", s: "survetements", b: "Kidsport", p: 10900, r: 4.5, t: "survetement", col: ["Gris", "Vert"], sz: "enfant", mat: "Molleton léger", g: "mixte" },
  { n: "Jogging enfant à bandes", c: "sport-plage", s: "survetements", b: "Kidsport", p: 8500, r: 4.6, t: "pantalon", col: ["Noir", "Bleu marine"], o: { bandes: true, cuffs: true }, sz: "enfant", mat: "Polyester recyclé", g: "mixte" },
  { n: "Maillot de foot enfant orange et vert", c: "sport-plage", s: "maillots-sport", b: "Kidsport", p: 9900, r: 4.9, t: "maillot-foot", col: ["Orange"], o: { accent: "#16a34a" }, sz: "enfant", mat: "Polyester respirant", g: "mixte" },
  { n: "Ensemble de foot maillot et short", c: "sport-plage", s: "maillots-sport", b: "Kidsport", p: 12900, r: 4.6, t: "ensemble", col: ["Bleu", "Rouge"], o: { top: "maillot-foot", bottom: "short", accent: "#ffffff" }, sz: "enfant", mat: "Polyester respirant", g: "mixte" },
  { n: "T-shirt de sport respirant", c: "sport-plage", s: "maillots-sport", b: "Kidsport", p: 5900, r: 4.4, t: "tshirt", col: ["Vert menthe", "Orange"], sz: "enfant", mat: "Polyester respirant", g: "mixte" },
  { n: "Tenue de danse justaucorps et tutu", c: "sport-plage", s: "maillots-sport", b: "Kidsport", p: 11900, r: 4.7, t: "justaucorps", col: ["Rose", "Noir"], sz: "enfant", mat: "Lycra et tulle", g: "fille" },
  { n: "Kimono de judo enfant", c: "sport-plage", s: "maillots-sport", b: "Kidsport", p: 14900, r: 4.6, t: "kimono", col: ["Blanc"], o: { ceinture: "#facc15" }, sz: "enfant", mat: "Coton grain de riz", g: "mixte" },
  { n: "Maillot de bain fille une pièce", c: "sport-plage", s: "maillots-bain", b: "Sunny Kids", p: 7900, r: 4.7, t: "maillot-bain", col: ["Corail", "Turquoise"], pat: "fleurs", sz: "enfant", mat: "Polyamide anti-UV 50+", g: "fille" },
  { n: "Maillot de bain fille 2 pièces", c: "sport-plage", s: "maillots-bain", b: "Sunny Kids", p: 6900, r: 4.5, t: "bikini", col: ["Rose", "Jaune"], pat: "pois", sz: "enfant", mat: "Polyamide anti-UV 50+", g: "fille" },
  { n: "Short de bain garçon", c: "sport-plage", s: "maillots-bain", b: "Sunny Kids", p: 6500, r: 4.6, t: "short-bain", col: ["Bleu ciel", "Orange"], pat: "palmiers", sz: "enfant", mat: "Polyester séchage rapide", g: "garcon" },
  { n: "T-shirt anti-UV manches longues", c: "sport-plage", s: "maillots-bain", b: "Sunny Kids", p: 9900, r: 4.8, t: "rashguard", col: ["Turquoise", "Bleu marine"], o: { motif: "soleil" }, sz: "enfant", mat: "Polyamide anti-UV 50+", g: "mixte" },
  { n: "Bob de plage anti-UV", c: "sport-plage", s: "maillots-bain", b: "Sunny Kids", p: 4900, r: 4.6, t: "bob", col: ["Jaune", "Bleu ciel"], pat: "palmiers", sz: "tete", mat: "Polyester anti-UV 50+", g: "mixte" },

  // ——— ÉCOLE
  { n: "Chemise d'uniforme kaki", c: "ecole", s: "uniformes", b: "École Plus", p: 5500, r: 4.5, t: "chemise", col: ["Kaki"], sz: "enfant", mat: "Polycoton résistant", g: "mixte" },
  { n: "Chemise d'uniforme bleu ciel", c: "ecole", s: "uniformes", b: "École Plus", p: 5500, r: 4.5, t: "chemise", col: ["Bleu ciel", "Blanc"], sz: "enfant", mat: "Polycoton résistant", g: "mixte" },
  { n: "Short d'uniforme garçon", c: "ecole", s: "uniformes", b: "École Plus", p: 4900, r: 4.4, t: "short", col: ["Bleu marine", "Kaki"], sz: "enfant", mat: "Polycoton résistant", g: "garcon" },
  { n: "Jupe d'uniforme plissée", c: "ecole", s: "uniformes", b: "École Plus", p: 5500, r: 4.4, t: "jupe", col: ["Bleu marine", "Kaki"], sz: "enfant", mat: "Polycoton résistant", g: "fille" },
  { n: "Robe d'uniforme fille", c: "ecole", s: "uniformes", b: "École Plus", p: 7900, r: 4.5, t: "robe", col: ["Bleu ciel", "Kaki"], sz: "enfant", mat: "Polycoton résistant", g: "fille" },
  { n: "Pantalon d'uniforme", c: "ecole", s: "uniformes", b: "École Plus", p: 6500, r: 4.3, t: "pantalon", col: ["Bleu marine", "Kaki"], sz: "enfant", mat: "Polycoton résistant", g: "garcon" },
  { n: "Pack uniforme chemise et short", c: "ecole", s: "uniformes", b: "École Plus", p: 9900, r: 4.7, t: "ensemble", col: ["Kaki", "Bleu ciel"], o: { top: "chemise", bottom: "short", bottomColor: "Bleu marine", bottomPattern: false }, sz: "enfant", mat: "Polycoton résistant", g: "garcon" },
  { n: "Sac à dos maternelle", c: "ecole", s: "sacs-scolaires", b: "MMKids", p: 8900, r: 4.7, t: "sac", col: ["Rose", "Bleu ciel", "Vert menthe"], o: { motif: "etoile" }, sz: null, mat: "Polyester déperlant", g: "mixte" },
  { n: "Cartable primaire à roulettes", c: "ecole", s: "sacs-scolaires", b: "École Plus", p: 18900, r: 4.6, t: "sac", col: ["Bleu marine", "Rose"], o: { roulettes: true }, sz: null, mat: "Polyester renforcé", g: "mixte" },
  { n: "Sac à dos imprimé wax", c: "ecole", s: "sacs-scolaires", b: "Akwaba Kids", p: 12900, r: 4.8, t: "sac", col: ["Orange", "Bleu"], pat: "wax", sz: null, mat: "Tissu wax doublé", g: "mixte" },
  { n: "Sweat à capuche enfant", c: "ecole", s: "sweats-gilets", b: "MMKids", p: 9900, r: 4.6, t: "sweat", col: ["Gris", "Rose", "Bleu marine"], o: { motif: "etoile" }, sz: "enfant", mat: "Molleton coton", g: "mixte" },
  { n: "Gilet en maille boutonné", c: "ecole", s: "sweats-gilets", b: "Petit Baobab", p: 8900, r: 4.5, t: "gilet", col: ["Bleu marine", "Beige"], sz: "enfant", mat: "Maille coton", g: "mixte" },
  { n: "Veste coupe-vent légère", c: "ecole", s: "sweats-gilets", b: "Lagune Kids", p: 13900, r: 4.6, t: "veste", col: ["Jaune", "Bleu"], sz: "enfant", mat: "Polyester déperlant", g: "mixte" },
  { n: "Veste en jean enfant", c: "ecole", s: "sweats-gilets", b: "Lagune Kids", p: 14500, r: 4.5, t: "veste", col: ["Bleu jean"], o: { jean: true }, sz: "enfant", mat: "Denim coton", g: "mixte" },

  // ——— ACCESSOIRES
  { n: "Casquette enfant brodée", c: "accessoires", s: "chapeaux-casquettes", b: "MMKids", p: 3900, r: 4.5, t: "casquette", col: ["Rouge", "Bleu marine", "Rose"], o: { motif: "etoile" }, sz: "tete", mat: "Coton sergé", g: "mixte" },
  { n: "Bob réversible enfant", c: "accessoires", s: "chapeaux-casquettes", b: "Lagune Kids", p: 4500, r: 4.4, t: "bob", col: ["Vert", "Jaune"], sz: "tete", mat: "100 % coton", g: "mixte" },
  { n: "Chapeau de paille fille", c: "accessoires", s: "chapeaux-casquettes", b: "Mini Chic", p: 5900, r: 4.6, t: "bob", col: ["Beige"], o: { ruban: "#f472b6" }, sz: "tete", mat: "Paille naturelle", g: "fille" },
  { n: "Lot de 10 barrettes fantaisie", c: "accessoires", s: "accessoires-cheveux", b: "MMKids", p: 2900, r: 4.5, t: "barrettes", col: [], sz: null, mat: "Métal et résine", g: "fille" },
  { n: "Serre-tête à nœud", c: "accessoires", s: "accessoires-cheveux", b: "Mini Chic", p: 2500, r: 4.4, t: "serre-tete", col: ["Rose", "Rouge", "Blanc"], sz: null, mat: "Satin", g: "fille" },
  { n: "Lot de 4 chouchous wax", c: "accessoires", s: "accessoires-cheveux", b: "Akwaba Kids", p: 2500, r: 4.7, t: "chouchous", col: ["Orange"], pat: "wax", sz: null, mat: "Tissu wax", g: "fille" },
  { n: "Lunettes de soleil enfant UV400", c: "accessoires", s: "lunettes-montres", b: "Sunny Kids", p: 4900, r: 4.5, t: "lunettes", col: ["Rose", "Bleu", "Noir"], sz: null, mat: "Monture flexible, verres UV400", g: "mixte" },
  { n: "Montre enfant pédagogique", c: "accessoires", s: "lunettes-montres", b: "MMKids", p: 7900, r: 4.6, t: "montre", col: ["Rose", "Bleu ciel", "Vert"], sz: null, mat: "Silicone et ABS", g: "mixte" },
  { n: "Ceinture élastique enfant", c: "accessoires", s: "lunettes-montres", b: "MMKids", p: 2900, r: 4.3, t: "ceinture", col: ["Noir", "Marron"], sz: null, mat: "Élastique tressé", g: "mixte" },
  { n: "Bretelles et nœud papillon", c: "accessoires", s: "lunettes-montres", b: "Mini Chic", p: 4500, r: 4.6, t: "noeud-papillon", col: ["Rouge", "Bleu marine"], sz: null, mat: "Polyester", g: "garcon" },
];

/* ------------------------------------------------------------------ génération */

function slugify(s) {
  return s.replace(/œ/g, "oe").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " et ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  const seen = new Set();
  fs.mkdirSync(IMG_DIR, { recursive: true });
  for (const e of fs.readdirSync(IMG_DIR)) fs.rmSync(path.join(IMG_DIR, e), { recursive: true, force: true, maxRetries: 5 });
  const seed = [];
  let count = 0;
  for (const prod of PRODUCTS) {
    const slug = slugify(prod.n);
    if (seen.has(slug)) throw new Error(`Slug en double : ${slug}`);
    seen.add(slug);
    const dir = path.join(IMG_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });
    const colorsForImages = prod.col.length ? prod.col.slice(0, 3) : [MULTI[0]];
    const renders = colorsForImages.map((col) => renderSvg(prod, col));
    renders.push(renderSvg(prod, colorsForImages[0], { detail: true }));
    const images = [];
    for (let i = 0; i < renders.length; i++) {
      const file = path.join(dir, `${i + 1}.webp`);
      await sharp(Buffer.from(renders[i])).webp({ quality: 86 }).toFile(file);
      images.push(`/images/products/${slug}/${i + 1}.webp`);
      count++;
    }
    seed.push({
      slug,
      name: prod.n,
      category: prod.c,
      subcategory: prod.s,
      brand: prod.b,
      price: prod.p,
      rating: prod.r,
      images,
      colors: prod.col,
      sizeKind: prod.sz,
      material: prod.mat,
      gender: prod.g,
    });
  }
  fs.writeFileSync(SEED_FILE, JSON.stringify(seed, null, 1) + "\n");
  console.log(`${seed.length} produits · ${count} images générées`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
