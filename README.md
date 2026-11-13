# MMKids (MelaineMarketKids) — prototype e-commerce mode enfant (frontend)

Prototype fonctionnel **frontend uniquement**, avec **données fictives**, d'une boutique en ligne ivoirienne
**spécialisée dans les vêtements pour enfants** (de la naissance à 14 ans) :
boutique client + espace client + back-office commerçant complet.

> Projet dérivé du socle SidibeMarket-ci : même architecture et mêmes fonctionnalités, catalogue et données
> entièrement adaptés à la mode enfant. Couleurs et identité visuelle à affiner.

- **Stack** : Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS v4
- **Librairies** : Zustand (état + persistance locale), Fuse.js (recherche floue), Recharts (graphiques), Lucide (icônes)
- **Architecture** : monolithe modulaire (voir plus bas)

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # version de production
```

Node.js ≥ 20.9 requis.

## Parcours de démonstration

| Où | Quoi tester |
|---|---|
| `/` | Carrousel, ventes flash (compte à rebours), 9 univers enfant, nouveautés, populaires, bientôt disponibles, marques |
| Barre de recherche | Autocomplétion instantanée, tolérance aux fautes (`unifrome`, `pijama`), synonymes (`survet`, `cartable`, `bapteme`, `pagne`), plusieurs mots (`robe wax`), référence (`MK-FIL-1019` → fiche directe) |
| `/c/fille` | Filtres avancés (prix, marque, couleur, **taille par âge**, note, stock, promo), tri, sous-catégories, URL partageables |
| `/p/robe-en-wax-fille` | Galerie + zoom + vidéo, tailles 2–14 ans × couleurs, fiche (âge, matière, entretien), livraison par commune, avis de parents, associés/similaires |
| `/aide/tailles` | Guide des tailles (âge ↔ stature) et des pointures (17 → 35), lié depuis chaque fiche produit |
| `/panier` | Codes `AKWABA5000`, `BIENVENUE10`, `CHAUSSURES20`, `LIVRAISON0`, `ANNIV15`, bons `BON-10000` / `BON-25000`, points fidélité, livraison gratuite dès 30 000 FCFA |
| `/commande` | 5 modes de livraison, 9 moyens de paiement (3× sans frais dès 30 000 FCFA). **Un numéro / une carte finissant par `00` simule un échec de paiement** |
| `/connexion` | Compte démo pré-rempli : **Jean Kouassi**, papa de Kevin (8 ans) et Emma (3 ans) — niveau Or, 1 250 points, 17 commandes |
| `/compte` | Suivi, facture, annulation, échange/retour, remboursement, rachat, fidélité, adresses, profil, 2FA, appareils |
| Bulle « Besoin d'aide ? » | Assistante Awa : « une robe pour 4 ans à moins de 15 000 », « des chaussures pointure 28 », « tenue de cérémonie garçon », « guide des tailles », « MK-261026-8017 » |
| `/admin` | Back-office (connectée en tant que **Melaine**, Super Admin). Le **sélecteur de boutique** (haut gauche) filtre toutes les stats ; le **menu utilisateur** permet de changer de rôle pour tester les permissions |

Les commandes passées sur la boutique apparaissent dans l'espace client **et** dans le back-office (surlignées « Passée en démo »).
Le panier en cours du navigateur apparaît en temps réel dans **Paniers abandonnés**.

## Couverture du cahier des charges

| # | Module | Où |
|---|---|---|
| 1 | Catalogue, variantes, photos, vidéo, zoom, associés/similaires/récents, populaires, nouveautés, promos, bientôt dispo, ruptures, comparateur, favoris | boutique |
| — | Recherche intelligente : instantanée, autocomplétion, référence, catégorie, marque, fautes, filtres, tris | `modules/search`, `/recherche` |
| 2 | Compte client complet, Google/Apple, mot de passe oublié, historique, factures, retours, fidélité | `/compte/*` |
| 3 | Panier intelligent persistant, codes, bons, points, estimation livraison, suggestions, sauvegarde | `/panier` |
| — | Paniers abandonnés + relance automatique | `/admin/paniers-abandonnes` |
| 4 | Paiements : Mobile Money, carte, COD, virement, acompte, 3×, échecs, remboursements, multi-agrégateurs | `modules/payment`, `/admin/paiements` |
| 5 | Commandes : 12 statuts, historique, commentaire interne, documents, transporteur, suivi | `/admin/commandes` |
| 6 | Livraison : zones (communes, villes, international), tarifs, gratuité, express, retrait, relais, programmée | `modules/delivery`, `/admin/livraison` |
| 7–8 | Stock (dispo, réservé, vendu, entrant, minimum, alertes, mouvements, inventaire) & multi-boutiques | `/admin/stock`, `/admin/boutiques` |
| 9–10 | Gestion commerciale & dashboard dirigeant (périodes, CA par jour/mois/catégorie/produit/ville/canal) | `/admin`, `/admin/ventes` |
| 11 | Rentabilité : prix − achat − commission − livraison − remise − frais = marge | `/admin/rentabilite` |
| 12–13 | Moteur promotionnel & marketing (segments, Email/SMS/WhatsApp/push) | `/admin/promotions`, `/admin/marketing` |
| 14 | Avis : note, photos, vérifiés, réponse, modération, analyse | fiche produit, `/admin/avis` |
| 15 | Notifications centralisées client & commerçant | `/admin/notifications`, `/compte/notifications` |
| 16 | Facturation : facture, BC, BL, reçu, avoir, numérotation, TVA 18 % | `/facture/[n°]`, `/admin/facturation` |
| 17 | Employés : 6 rôles, matrice de permissions module × action | `/admin/employes` |
| 18 | Sécurité : 2FA, sessions, journal, anti-brute-force, rate limiting, sauvegardes | `/admin/securite` |
| 19 | SEO : URLs propres, sitemap, robots, meta, Open Graph, Schema.org Product/Breadcrumb, canonical, blog, 301, 404 | `app/sitemap.ts`, `app/robots.ts`, `/admin/seo` |
| 20 | Mobile-first + PWA installable (manifest, service worker, bannière d'installation) | `app/manifest.ts`, `public/sw.js` |
| 21 | IA : assistant commerçant, prévisions, recommandations, génération de contenus, chatbot client | `/admin/assistant-ia`, bulle « Besoin d'aide ? » |
| 22 | CRM : fiche client, valeur client, segments VIP / à risque / inactifs / nouveaux | `/admin/clients` |

## Architecture : monolithe modulaire

```
src/
├── app/                      # Routes (fines) : elles assemblent les modules
│   ├── (shop)/               # Boutique + espace client
│   ├── (checkout)/           # Tunnel de commande sans distraction
│   ├── admin/                # Back-office
│   ├── facture/[id]/         # Documents imprimables
│   └── sitemap.ts · robots.ts · manifest.ts · not-found.tsx
├── modules/                  # Un dossier = un domaine métier
│   ├── catalog/  search/  cart/  checkout/  payment/  orders/  delivery/
│   ├── customer/ loyalty/  promotions/  reviews/  billing/  content/
│   ├── inventory/  stores/  analytics/  crm/  marketing/  notifications/
│   ├── staff/  security/  ai/  storefront/  admin/
│   └── <module>/
│       ├── index.ts          # API publique du module (seul point d'entrée)
│       ├── types.ts · data/  # Modèle + données fictives (déterministes)
│       ├── services/         # Logique métier pure (testable)
│       ├── store/ hooks/     # État client (Zustand)
│       └── components/       # UI propre au module
└── shared/                   # UI kit, layouts, formatage, utilitaires
```

Règles :
- un module n'importe un autre module **que via son `index.ts`** ;
- la logique métier vit dans `services/` (fonctions pures) — les composants ne calculent pas ;
- les données fictives sont isolées dans `data/` : brancher une vraie API revient à remplacer ces fichiers par des appels, sans toucher à l'UI ;
- **paiement** : chaque agrégateur implémente l'interface `PaymentProvider` (`modules/payment/types.ts`) et s'enregistre dans le registre avec un routage par moyen de paiement et bascule automatique — ajouter un agrégateur ne réécrit rien d'autre.

## Design

- Palette : vert « lagune » (marque), corail (promotions), or (fidélité) — tokens dans `src/app/globals.css`
- Police Plus Jakarta Sans, cartes arrondies, ombres douces, animations courtes
- Mobile : barre d'onglets, recherche plein écran, filtres en bottom-sheet, barre d'achat collante, swipe sur les carrousels
- Graphiques : palette validée daltonisme (vert / bleu / orange), légende dès 2 séries, info-bulles au survol

## Limites du prototype

- Aucune donnée n'est envoyée à un serveur : panier, compte, favoris et commandes de démo sont stockés dans le navigateur (localStorage).
- Les modifications du back-office (statuts, stock, promotions…) sont conservées pendant la session uniquement.
- Les paiements, SMS, WhatsApp et emails sont simulés.
- Visuels produits : **illustrations provisoires générées** (une par couleur + une vue détail), stockées dans `public/images/products/<slug>/N.webp`.

## Catalogue enfant

137 articles fictifs répartis en 9 univers : Bébé (0-24 mois) · Fille (2-14 ans) · Garçon (2-14 ans) · Fêtes & cérémonies
(dont wax, pagne, boubou, kita) · Chaussures (17 → 35) · Pyjamas & sous-vêtements · Sport & plage · Rentrée scolaire
(uniformes kaki / bleu ciel, sacs) · Accessoires. Marques fictives, dont des ateliers « Made in CI » (Akwaba Kids, Wax Junior, Petit Baobab…).

Grilles de tailles (`src/modules/catalog/data/products.ts` → `SIZE_SETS`) : Naissance → 24 mois, 2 → 14 ans,
pointures 17 → 23 (premiers pas) et 24 → 35, sous-vêtements, chaussettes, chapeaux.

Le catalogue et ses visuels sont produits par un script :

```bash
node scripts/generate-catalog.mjs   # réécrit seed.json + public/images/products/
```

Pour passer aux **vraies photos** : remplacez simplement les fichiers `.webp` d'un produit (même nom, même dossier),
ou modifiez la liste `PRODUCTS` du script (nom, prix, couleurs, tailles, matière) puis relancez-le.
⚠️ Relancer le script régénère toutes les illustrations : faites-le avant d'ajouter les vraies photos, ou retirez-le ensuite.
