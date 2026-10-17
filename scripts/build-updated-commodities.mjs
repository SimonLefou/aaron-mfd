import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TRADE_TERMINALS, UEX_CONFIG, GENERAL_COMMODITIES as OLD_COMMODITIES } from '../data/game/trade.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const fyComms = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/commodities.json'), 'utf8'));
const fyRoutes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/trade-routes.json'), 'utf8'));

console.log('=== CONSTRUCTION DE LA BASE COMPLÈTE DE COMMODITIES ===');

// Mapper les types FleetYards vers nos catégories Star Citizen 4.x
const categoryMapping = {
  mineral: 'metals',
  metal: 'metals',
  alloy: 'metals',
  gas: 'gases',
  medical_supply: 'medical',
  food: 'consumables',
  agricultural_supply: 'consumables',
  consumer_goods: 'industrial',
  processed_goods: 'industrial',
  manmade: 'industrial',
  scrap: 'industrial',
  natural: 'industrial',
  nonmetals: 'industrial',
  waste: 'industrial',
  vice: 'illicit'
};

// Dictionnaire des noms français soignés
const frNames = {
  'quantainium': 'Quantainium Raffiné',
  'quantainium-raw': 'Quantainium Brut',
  'bexalite': 'Bexalite Raffinée',
  'bexalite-raw': 'Bexalite Brute',
  'taranite': 'Taranite Raffinée',
  'taranite-raw': 'Taranite Brute',
  'laranite': 'Laranite Raffinée',
  'laranite-raw': 'Laranite Brute',
  'gold': 'Or Raffiné (Gold)',
  'gold-raw': 'Minerai d\'Or Brut',
  'titanium': 'Titane Raffiné',
  'titanium-raw': 'Minerai de Titane Brut',
  'copper': 'Cuivre Raffiné',
  'copper-raw': 'Minerai de Cuivre',
  'iron': 'Fer Purifié',
  'iron-raw': 'Minerai de Fer',
  'diamond': 'Diamant Industriel',
  'diamond-raw': 'Diamant Brut',
  'beryl': 'Béryl Purifié',
  'beryl-raw': 'Béryl Brut',
  'borase': 'Borase Pure',
  'borase-raw': 'Borase Brute',
  'agricium': 'Agricium Raffiné',
  'agricium-raw': 'Agricium Brut',
  'aluminum': 'Aluminium Électrolytique',
  'aluminum-raw': 'Bauxite / Aluminium Brut',
  'tungsten': 'Tungstène',
  'tungsten-raw': 'Minerai de Tungstène',
  'corundum': 'Corindon Industriel',
  'corundum-raw': 'Corindon Brut',
  'quartz': 'Quartz Purifié',
  'quartz-raw': 'Quartz Brut',
  'tin': 'Étain',
  'zinc': 'Zinc',
  'lead': 'Plomb',
  'hydrogen': 'Hydrogène Purifié',
  'chlorine': 'Chlore Liquéfié',
  'fluorine': 'Fluor Industriel',
  'iodine': 'Iode Purifiée',
  'helium': 'Hélium',
  'nitrogen': 'Azote Liquide',
  'medical-supplies': 'Fournitures Médicales',
  'distilled-spirits': 'Spiritueux Distillés',
  'processed-food': 'Aliments Transformés',
  'scrap': 'Ferraille & Déchets Métalliques',
  'recycled-material-composite': 'Matériau Composite Recyclé (RMC)',
  'maze': 'Maze (Substance Contrôlée)',
  'slam': 'Slam',
  'widow': 'WiDoW',
  'altruciatoxin': 'Altruciatoxine',
  'etm': 'ETM',
  'neon': 'Néon Gaz',
  'stims': 'Stimulants Médicaux',
  'waste': 'Déchets Toxiques',
  'compboard': 'Circuits Imprimés (CompBoard)'
};

// Dictionnaire des anciens mappings
const oldBySlug = new Map();
OLD_COMMODITIES.forEach(c => {
  oldBySlug.set(c.id, c);
  const clean = c.id.replace('_refined', '').replace(/_/g, '-');
  oldBySlug.set(clean, c);
});

// Grouper routes par commodity slug
const routesBySlug = new Map();
fyRoutes.forEach(r => {
  const slug = r.commodity?.slug;
  if (!slug) return;
  if (!routesBySlug.has(slug)) routesBySlug.set(slug, []);
  routesBySlug.get(slug).push(r);
});

// Générer les 232 commodities enrichies
const updatedCommodities = fyComms.map(c => {
  const slug = c.slug;
  const oldMatch = oldBySlug.get(slug) || oldBySlug.get(slug.replace(/-/g, '_'));
  const cRoutes = routesBySlug.get(slug) || [];

  const category = categoryMapping[c.commodityType] || oldMatch?.category || 'industrial';
  const isIllegal = c.commodityType === 'vice' || oldMatch?.isIllegal || false;

  let baseBuy = 10.0;
  let baseSell = 15.0;
  let bestBuy = null;
  let bestSell = null;
  let buyLocations = [];
  let sellLocations = [];

  if (cRoutes.length > 0) {
    // Trier par prix d'achat
    const buySorted = [...cRoutes].sort((a, b) => a.priceOrigin - b.priceOrigin);
    // Trier par prix de vente
    const sellSorted = [...cRoutes].sort((a, b) => b.priceDestination - a.priceDestination);

    const bRoute = buySorted[0];
    const sRoute = sellSorted[0];

    // Prix par cSCU (1 SCU = 100 cSCU)
    baseBuy = Math.round((bRoute.priceOrigin / 100) * 100) / 100;
    baseSell = Math.round((sRoute.priceDestination / 100) * 100) / 100;

    bestBuy = {
      location: bRoute.originTerminal?.name || 'Terminal de chargement',
      system: bRoute.originTerminal?.starSystem || 'Stanton',
      price: baseBuy,
      stock: 'high'
    };

    bestSell = {
      location: sRoute.destinationTerminal?.name || 'TDD Centre',
      system: sRoute.destinationTerminal?.starSystem || 'Stanton',
      price: baseSell,
      demand: 'high'
    };

    // Extraire les lieux distincts
    const seenBuy = new Set();
    buyLocations = buySorted.filter(r => {
      const name = r.originTerminal?.name;
      if (!name || seenBuy.has(name)) return false;
      seenBuy.add(name);
      return true;
    }).slice(0, 4).map(r => ({
      terminal: r.originTerminal?.name || '',
      body: r.originTerminal?.planet || r.originTerminal?.moon || r.originTerminal?.starSystem || 'Stanton',
      system: (r.originTerminal?.starSystem || 'stanton').toLowerCase(),
      price: Math.round((r.priceOrigin / 100) * 10) / 10,
      stock: 'high'
    }));

    const seenSell = new Set();
    sellLocations = sellSorted.filter(r => {
      const name = r.destinationTerminal?.name;
      if (!name || seenSell.has(name)) return false;
      seenSell.add(name);
      return true;
    }).slice(0, 4).map(r => ({
      terminal: r.destinationTerminal?.name || '',
      body: r.destinationTerminal?.planet || r.destinationTerminal?.moon || r.destinationTerminal?.starSystem || 'Stanton',
      system: (r.destinationTerminal?.starSystem || 'stanton').toLowerCase(),
      price: Math.round((r.priceDestination / 100) * 10) / 10,
      demand: 'high',
      margin: Math.round(((r.priceDestination - bRoute.priceOrigin) / 100) * 10) / 10
    }));
  } else if (oldMatch) {
    baseBuy = oldMatch.baseBuy;
    baseSell = oldMatch.baseSell;
    bestBuy = oldMatch.bestBuy;
    bestSell = oldMatch.bestSell;
    buyLocations = oldMatch.buyLocations || [];
    sellLocations = oldMatch.sellLocations || [];
  } else {
    // Estimations réalistes selon catégorie
    const defaults = {
      metals: { buy: 65.0, sell: 88.0 },
      gases: { buy: 1.2, sell: 2.1 },
      medical: { buy: 34.0, sell: 49.0 },
      consumables: { buy: 1.5, sell: 3.2 },
      industrial: { buy: 12.0, sell: 19.5 },
      illicit: { buy: 95.0, sell: 145.0 }
    }[category] || { buy: 10.0, sell: 15.0 };

    baseBuy = defaults.buy;
    baseSell = defaults.sell;
    bestBuy = { location: 'Comptoir de commerce spatial', system: 'Stanton', price: baseBuy, stock: 'medium' };
    bestSell = { location: 'TDD Place Commerciale', system: 'Stanton', price: baseSell, demand: 'medium' };
  }

  const name_fr = oldMatch?.name_fr || frNames[slug] || c.name;
  const name_en = c.name;

  return {
    id: slug,
    slug: slug,
    name_fr,
    name_en,
    category,
    commodityType: c.commodityType,
    baseBuy,
    baseSell,
    marginPerScu: Math.round((baseSell - baseBuy) * 100),
    isIllegal,
    unitWeightKg: oldMatch?.unitWeightKg || 100,
    containerSizes: c.containerSizes || [1, 2, 4, 8, 16, 24, 32],
    consumable: Boolean(c.consumable),
    description: c.description || oldMatch?.desc_fr || '',
    bestBuy,
    bestSell,
    buyLocations,
    sellLocations
  };
});

// Trier les commodities par marge décroissante
updatedCommodities.sort((a, b) => b.marginPerScu - a.marginPerScu);

console.log(`✓ Total Commodities créées : ${updatedCommodities.length}`);
console.log('Catégories :');
const catCounts = {};
updatedCommodities.forEach(c => catCounts[c.category] = (catCounts[c.category] || 0) + 1);
console.log(catCounts);

// ----------------------------------------------------------------------------
// Créer les 30 routes commerciales populaires les plus rentables
// ----------------------------------------------------------------------------
console.log('\nCréation des routes commerciales populaires (POPULAR_TRADE_ROUTES)...');
const sortedFyRoutes = fyRoutes
  .filter(r => r.priceOrigin && r.priceDestination && r.profitPerScu > 0 && r.commodity?.name)
  .sort((a, b) => b.profitPerScu - a.profitPerScu);

// Prendre les routes uniques par paire (origine - destination - marchandise)
const seenRoutes = new Set();
const topPopularRoutes = [];
let rank = 1;

for (const r of sortedFyRoutes) {
  const key = `${r.originTerminal?.name}_${r.destinationTerminal?.name}_${r.commodity?.slug}`;
  if (seenRoutes.has(key)) continue;
  seenRoutes.add(key);

  const buyScu = r.priceOrigin;
  const sellScu = r.priceDestination;
  const marginScu = r.profitPerScu;
  const sys = (r.originTerminal?.starSystem || 'Stanton').toLowerCase();
  const isPyro = sys === 'pyro' || (r.destinationTerminal?.starSystem || '').toLowerCase() === 'pyro';

  topPopularRoutes.push({
    id: `r_fy_${rank}`,
    rank,
    name: `${r.commodity?.name} • ${r.originTerminal?.name} ➔ ${r.destinationTerminal?.name}`,
    item: r.commodity?.name,
    commodityId: r.commodity?.slug,
    from: r.originTerminal?.name || '',
    to: r.destinationTerminal?.name || '',
    origin: `${r.originTerminal?.name} (${r.originTerminal?.starSystem || 'Stanton'})`,
    destination: `${r.destinationTerminal?.name} (${r.destinationTerminal?.starSystem || 'Stanton'})`,
    system: sys,
    distanceGm: r.distance || (isPyro ? 65 : 20),
    distance: `${r.originTerminal?.starSystem || 'Stanton'} ➔ ${r.destinationTerminal?.starSystem || 'Stanton'} · ${r.distance || 25} GM`,
    quantumJumps: isPyro ? 2 : 1,
    originAtmoMinutes: 1.0,
    destAtmoMinutes: 1.0,
    terminalMinutes: 3.5,
    buyPricePerScu: buyScu,
    sellPricePerScu: sellScu,
    buyPrice: Math.round((buyScu / 100) * 100) / 100,
    sellPrice: Math.round((sellScu / 100) * 100) / 100,
    marginPerScu: marginScu,
    durationMinutes: Math.round(15 + (r.distance || 20) * 1.5),
    freshness: 'Direct Live',
    freshnessClass: 'green',
    freshnessTier: 't-g',
    risk: isPyro ? 'Élevé' : 'Faible',
    riskKey: isPyro ? 'high' : 'safe',
    riskClass: isPyro ? 'red' : 'green',
    riskTier: isPyro ? 't-r' : 't-g',
    hasFreightElevator: Boolean(r.originTerminal?.hasFreightElevator),
    maxContainerSize: r.originTerminal?.maxContainerSize || 32
  });

  rank++;
  if (topPopularRoutes.length >= 35) break;
}

console.log(`✓ Total Routes Populaires créées : ${topPopularRoutes.length}`);

// Écrire les nouvelles données dans data/game/trade.js
const tradeFileContent = `// Star Citizen Commodity Trading, Terminals, UEXcorp Config & Trade Routes
// Données officielles 4.x enrichies depuis FleetYards.net & UEX Corp

export const TRADE_TERMINALS = ${JSON.stringify(TRADE_TERMINALS, null, 2)};

export const UEX_CONFIG = ${JSON.stringify(UEX_CONFIG, null, 2)};

export const GENERAL_COMMODITIES = ${JSON.stringify(updatedCommodities, null, 2)};

export const POPULAR_TRADE_ROUTES = ${JSON.stringify(topPopularRoutes, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, 'data/game/trade.js'), tradeFileContent, 'utf8');
console.log('✓ data/game/trade.js mis à jour avec 232 commodities et 35 routes populaires !');
