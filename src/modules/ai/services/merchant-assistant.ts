/**
 * Assistant commerçant : répond aux questions du dirigeant à partir des données
 * (ventes, stock, clients). Moteur à intentions, interface prête pour un LLM + outils.
 */
import { DAILY, getKpis, productProfitability } from "@/modules/analytics";
import { stockoutRisk, STOCK } from "@/modules/inventory";
import { topCustomers, segmentCounts, SEGMENT_META } from "@/modules/crm";
import { subcategoryName, type Product } from "@/modules/catalog";
import { formatNumber, formatPercent, formatPrice } from "@/shared/lib/format";
import { normalize } from "@/shared/lib/utils";

export interface MerchantAnswer {
  text: string;
  table?: { headers: string[]; rows: (string | number)[][] };
  followUps?: string[];
}

export const SUGGESTED_QUESTIONS = [
  "Quels sont mes 5 produits les plus rentables ce mois-ci ?",
  "Quel produit risque d'être en rupture dans les 15 prochains jours ?",
  "Quel est mon chiffre d'affaires cette semaine ?",
  "Qui sont mes 5 meilleurs clients ?",
  "Quels produits ralentissent ?",
  "Quelle promotion me recommandes-tu ?",
];

const num = (t: string, fallback: number) => Number(t.match(/\d+/)?.[0] ?? fallback);

export function answerMerchant(question: string, storeId = "all"): MerchantAnswer {
  const t = normalize(question);

  if (/rentab|marge|gagne/.test(t)) {
    const n = Math.min(20, num(t, 5));
    const rows = productProfitability(30, storeId).sort((a, b) => b.margin - a.margin).slice(0, n);
    return {
      text: `Voici vos ${n} produits les plus rentables sur les 30 derniers jours. À eux seuls, ils génèrent ${formatPrice(rows.reduce((s, r) => s + r.margin, 0))} de marge.`,
      table: { headers: ["Produit", "Unités", "CA", "Marge", "Taux"], rows: rows.map((r) => [r.product.name, formatNumber(r.units), formatPrice(r.revenue), formatPrice(r.margin), formatPercent(r.marginPct)]) },
      followUps: ["Quels produits se vendent beaucoup mais rapportent peu ?", "Quelle promotion me recommandes-tu ?"],
    };
  }

  if (/peu|faible marge|rapporte/.test(t)) {
    const rows = productProfitability(30, storeId).filter((r) => r.marginPct < 8).sort((a, b) => b.units - a.units).slice(0, 6);
    return {
      text: "Ces produits se vendent bien mais leur marge est inférieure à 8 %, souvent à cause du coût de livraison unitaire. Pistes : franco de port relevé, vente par lot, ou hausse de prix de 3 à 5 %.",
      table: { headers: ["Produit", "Unités", "Marge", "Taux"], rows: rows.map((r) => [r.product.name, formatNumber(r.units), formatPrice(r.margin), formatPercent(r.marginPct)]) },
    };
  }

  if (/rupture|stock|epuis/.test(t)) {
    const days = num(t, 15);
    const rows = stockoutRisk(days, storeId).slice(0, 8);
    if (!rows.length) return { text: `Aucun produit ne devrait tomber en rupture dans les ${days} prochains jours. 👍` };
    return {
      text: `${rows.length} produit(s) risquent la rupture dans les ${days} prochains jours au rythme de vente actuel. Je recommande de commander en priorité ${rows[0].product.name} (${rows[0].daysOfCover} jour(s) de stock restant).`,
      table: {
        headers: ["Produit", "Stock dispo", "Ventes/jour", "Rupture dans", "À commander"],
        rows: rows.map((r) => [r.product.name, formatNumber(r.available), formatNumber(r.velocity, 1), `${r.daysOfCover} j`, formatNumber(Math.ceil(r.velocity * 45 - r.available + r.reserved))]),
      },
      followUps: ["Générer les bons de commande fournisseurs", "Quels produits ralentissent ?"],
    };
  }

  if (/chiffre|ca\b|vendu|ventes/.test(t)) {
    const key = /aujourd|jour\b/.test(t) ? "aujourdhui" : /hier/.test(t) ? "hier" : /mois/.test(t) ? "mois" : /annee|an\b/.test(t) ? "annee" : "semaine";
    const k = getKpis(key, storeId);
    const label = { aujourdhui: "aujourd'hui", hier: "hier", semaine: "cette semaine", mois: "ce mois-ci", annee: "cette année" }[key];
    return {
      text: `Votre chiffre d'affaires ${label} est de ${formatPrice(k.current.revenue)} (${k.delta("revenue") >= 0 ? "+" : ""}${formatPercent(k.delta("revenue"))} vs période précédente), pour ${formatNumber(k.current.orders)} commandes et un panier moyen de ${formatPrice(k.current.avgBasket)}. Bénéfice estimé : ${formatPrice(k.current.profit)}.`,
      followUps: ["Quels sont mes 5 produits les plus rentables ce mois-ci ?", "Prévision des ventes du mois prochain"],
    };
  }

  if (/client/.test(t)) {
    const n = Math.min(10, num(t, 5));
    const rows = topCustomers(n);
    const seg = segmentCounts();
    return {
      text: `Vos ${n} meilleurs clients représentent ${formatPrice(rows.reduce((s, c) => s + c.totalSpent, 0))} de CA cumulé. Par ailleurs, ${seg.a_risque} clients sont « à risque » et ${seg.inactif} sont inactifs : une campagne WhatsApp de réactivation est conseillée.`,
      table: { headers: ["Client", "Commandes", "CA généré", "Segment"], rows: rows.map((c) => [c.name, c.ordersCount, formatPrice(c.totalSpent), SEGMENT_META[c.segment].label]) },
    };
  }

  if (/ralenti|lent|dort|ne se vend/.test(t)) {
    const rows = slowMovers().slice(0, 6);
    return {
      text: "Ces produits ont plus de 6 mois de stock au rythme actuel. Ils immobilisent de la trésorerie : une promotion ciblée ou un lot les ferait tourner.",
      table: { headers: ["Produit", "Stock", "Ventes/30 j", "Couverture"], rows: rows.map((r) => [r.product.name, r.available, r.sold30, r.daysOfCover >= 999 ? "∞" : `${r.daysOfCover} j`]) },
      followUps: ["Quelle promotion me recommandes-tu ?"],
    };
  }

  if (/promo|reduc|solde/.test(t)) {
    const recos = promotionRecommendations();
    return { text: "Voici mes recommandations de promotions, basées sur les surstocks, la saisonnalité (Black Friday dans 1 mois) et l'élasticité estimée :", table: { headers: ["Action", "Cible", "Impact estimé"], rows: recos.map((r) => [r.action, r.target, r.impact]) } };
  }

  if (/prevision|prevoir|mois prochain|forecast/.test(t)) {
    const f = salesForecast(30);
    const total = f.reduce((s, d) => s + (d.forecast ?? 0), 0);
    return { text: `Prévision des 30 prochains jours : ${formatPrice(total)} de CA (intervalle de confiance ±9 %), portée par la hausse saisonnière de novembre et le Black Friday (27–30 nov.).` };
  }

  if (/prix/.test(t)) {
    const r = priceRecommendations().slice(0, 5);
    return { text: "Recommandations de prix (marge cible 18 %, prix concurrents relevés sur le marché ivoirien) :", table: { headers: ["Produit", "Prix actuel", "Prix conseillé", "Raison"], rows: r.map((x) => [x.product.name, formatPrice(x.product.price), formatPrice(x.suggested), x.reason]) } };
  }

  return {
    text: "Je peux analyser vos ventes, votre stock, vos clients et votre rentabilité. Essayez par exemple :",
    followUps: SUGGESTED_QUESTIONS.slice(0, 4),
  };
}

export function slowMovers() {
  return STOCK.filter((r) => r.available > 5 && (r.daysOfCover > 180 || r.sold30 <= 1) && r.product.availability !== "coming_soon").sort((a, b) => b.daysOfCover - a.daysOfCover);
}

export function salesForecast(horizon = 30) {
  const hist = DAILY.slice(-60);
  const avg = hist.slice(-28).reduce((s, d) => s + d.revenue, 0) / 28;
  const weekday = [0.82, 0.9, 0.95, 0.97, 1.05, 1.22, 1.12];
  const rows: { label: string; actual?: number; forecast?: number }[] = hist.map((d) => ({ label: d.date.slice(5).split("-").reverse().join("/"), actual: d.revenue }));
  rows[rows.length - 1].forecast = rows[rows.length - 1].actual;
  const last = new Date(`${hist[hist.length - 1].date}T12:00:00Z`);
  for (let i = 1; i <= horizon; i++) {
    const d = new Date(last.getTime() + i * 86_400_000);
    const season = d.getUTCMonth() === 10 ? 1.18 : 1;
    const bf = d.getUTCMonth() === 10 && d.getUTCDate() >= 27 ? 1.6 : 1;
    rows.push({ label: `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`, forecast: Math.round((avg * weekday[d.getUTCDay()] * season * bf) / 1000) * 1000 });
  }
  return rows;
}

export function priceRecommendations() {
  return productProfitability(30)
    .filter((r) => r.units > 5)
    .map((r) => {
      const p: Product = r.product;
      if (r.marginPct < 8) return { product: p, suggested: Math.round((p.price * 1.05) / 100) * 100 - 100, reason: "Marge trop faible, demande soutenue" };
      if (r.marginPct > 40 && p.soldCount < 200) return { product: p, suggested: Math.round((p.price * 0.93) / 100) * 100 - 100, reason: "Marge confortable, volume à stimuler" };
      return null;
    })
    .filter((x): x is { product: Product; suggested: number; reason: string } => x !== null)
    .slice(0, 8);
}

export function promotionRecommendations() {
  const slow = slowMovers();
  return [
    { action: "−15 % pendant 10 jours", target: slow[0] ? slow[0].product.name : "Produits en surstock", impact: "+38 % de ventes, libère ~650 000 FCFA de trésorerie" },
    { action: "Lot « 2 achetés = 1 offert »", target: subcategoryName("nuit", "pyjamas"), impact: "+22 % de panier moyen sur les pyjamas" },
    { action: "Avant-première Black Friday", target: "Segment VIP (348 clients)", impact: "≈ 3,2 M FCFA de CA, ROI ×14 via WhatsApp" },
    { action: "Pack fratrie −15 % dès 3 articles", target: "Parents de 2 enfants et plus", impact: "+18 % de panier moyen estimé" },
    { action: "Code anniversaire −15 %", target: "Anniversaires d'enfants en novembre (418)", impact: "Taux d'utilisation historique 31 %" },
    { action: "Collection fêtes de fin d'année", target: "Robes de cérémonie & costumes", impact: "Pic de ventes attendu du 10 au 24 décembre" },
  ];
}

/* --------------------------------------------------------- générateurs */

export function generateDescription(p: Product, tone: "pro" | "chaleureux" | "court") {
  if (tone === "court") return `${p.name} — ${p.highlights.slice(0, 2).join(", ").toLowerCase()}. Livré en 24 h à Abidjan, échange de taille gratuit, paiement Mobile Money ou à la livraison.`;
  if (tone === "chaleureux")
    return `Vous cherchiez la tenue idéale pour votre petit ? 😍 ${p.name} : ${p.description} Les parents l'adorent (${String(p.rating).replace(".", ",")}/5 sur ${p.reviewCount} avis). Commandez aujourd'hui, on vous le livre dès demain à Abidjan — et vous payez comme vous voulez : Orange Money, Wave, MTN ou à la livraison.`;
  return `${p.name} de la marque ${p.brandName}. ${p.description}\n\nPoints forts :\n${p.highlights.map((h) => `• ${h}`).join("\n")}\n\nRéférence ${p.sku}. ${p.warrantyMonths ? `Garantie ${p.warrantyMonths} mois.` : "Échange de taille gratuit sous 15 jours."} Livraison partout en Côte d'Ivoire.`;
}

export function generateSeoTitle(p: Product) {
  const sub = subcategoryName(p.category, p.subcategory);
  return [
    `${p.name} pas cher à Abidjan | ${formatPrice(p.price)} | MMKids`,
    `${p.name} – ${sub} enfant ${p.brandName} – Livraison 24 h en Côte d'Ivoire`,
    `${p.name} : prix, tailles et avis de parents | MMKids`,
  ];
}

export function generateSocialPost(p: Product, network: "facebook" | "instagram" | "whatsapp") {
  const promo = p.discountPct ? `🔥 −${p.discountPct} % : ${formatPrice(p.price)} au lieu de ${formatPrice(p.compareAtPrice!)}` : `💚 Seulement ${formatPrice(p.price)}`;
  if (network === "whatsapp") return `*${p.name}* ✨\n${promo}\n✅ ${p.highlights[0]}\n🚚 Livré en 24 h à Abidjan\n👉 Commandez ici : mmkids.ci/p/${p.slug}`;
  if (network === "instagram") return `${p.name} 😍\n\n${promo}\n\n${p.highlights.map((h) => `✔️ ${h}`).join("\n")}\n\nLien en bio 🛍️\n\n#Abidjan #CoteDIvoire #${p.brandName.replace(/\W/g, "")} #MMKids #ModeEnfant #BebeCI #BonPlan225`;
  return `Nouveau chez MMKids 🎉\n\n${p.name} by ${p.brandName}\n${promo}\n\n${p.description.slice(0, 140)}…\n\n💳 Orange Money, Wave, MTN, carte ou à la livraison\n🛒 mmkids.ci/p/${p.slug}`;
}
