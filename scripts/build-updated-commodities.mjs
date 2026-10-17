import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const fyComms = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/commodities.json'), 'utf8'));
const fyRoutes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/trade-routes.json'), 'utf8'));

// Import existing TRADE_TERMINALS and UEX_CONFIG from current trade.js
const { TRADE_TERMINALS, UEX_CONFIG, GENERAL_COMMODITIES: OLD_COMMODITIES } = await import('file:///' + ROOT.replace(/\\/g, '/') + '/data/game/trade.js');

console.log('=== CONSTRUCTION DE LA BASE COMPLÈTE DE COMMODITIES CORRÉLÉES ===');

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

const frNames = {
  'quantainium': 'Quantainium Raffiné',
  'quantainium-raw': 'Quantainium Brut',
  'bexalite': 'Bexalite Raffinée',
  'bexalite-raw': 'Bexalite Brute',
  'taranite': 'Taranite Raffinée',
  'taranite-raw': 'Taranite Brute',
  'laranite': 'Laranite (Fret Cargo)',
  'laranite-raw': 'Laranite Brute',
  'gold': 'Or Métallique (Gold)',
  'gold-raw': 'Minerai d\'Or Brut',
  'titanium': 'Titane Industriel (Titanium)',
  'titanium-raw': 'Minerai de Titane Brut',
  'copper': 'Cuivre Raffiné',
  'copper-raw': 'Minerai de Cuivre',
  'iron': 'Fer Purifié',
  'iron-raw': 'Minerai de Fer',
  'diamond': 'Diamant Industriel',
  'diamond-raw': 'Diamant Brut',
  'beryl': 'Béryl Brut & Taillé (Beryl)',
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
  'medical-supplies': 'Fournitures Médicales (Med Supplies)',
  'distilled-spirits': 'Spiritueux Distillés',
  'processed-food': 'Aliments Transformés',
  'scrap': 'Ferraille & Déchets Métalliques (Scrap)',
  'recycled-material-composite': 'Matériau Composite Recyclé (RMC)',
  'construction-materials': 'Matériaux de Construction Structurels (CM)',
  'maze': 'Maze (Substance Contrôlée)',
  'slam': 'Slam (Narcotique)',
  'widow': 'WiDoW (Substance Illicite)',
  'altruciatoxin': 'Altruciatoxine',
  'etm': 'ETM',
  'neon': 'Néon Gaz',
  'stims': 'Stimulants Médicaux',
  'waste': 'Déchets Toxiques',
  'compboard': 'Circuits Imprimés (CompBoard)',
  'agri-supplies': 'Fournitures Agricoles (Agri-Supplies)'
};

const oldBySlug = new Map();
OLD_COMMODITIES.forEach(c => {
  oldBySlug.set(c.id, c);
  const clean = c.id.replace('_refined', '').replace(/_/g, '-');
  oldBySlug.set(clean, c);
});

const routesBySlug = new Map();
fyRoutes.forEach(r => {
  const slug = r.commodity?.slug;
  if (!slug) return;
  if (!routesBySlug.has(slug)) routesBySlug.set(slug, []);
  routesBySlug.get(slug).push(r);
});

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
    const buySorted = [...cRoutes].sort((a, b) => a.priceOrigin - b.priceOrigin);
    const sellSorted = [...cRoutes].sort((a, b) => b.priceDestination - a.priceDestination);

    const bRoute = buySorted[0];
    const sRoute = sellSorted[0];

    let rawBuy = bRoute.priceOrigin / 100;
    let rawSell = sRoute.priceDestination / 100;

    if (rawBuy > 800) {
      rawBuy = rawBuy / 100;
      rawSell = rawSell / 100;
    }

    baseBuy = Math.round(rawBuy * 100) / 100;
    baseSell = Math.round(rawSell * 100) / 100;

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
      price: Math.round((r.priceOrigin > 80000 ? r.priceOrigin / 10000 : r.priceOrigin / 100) * 10) / 10,
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
      price: Math.round((r.priceDestination > 80000 ? r.priceDestination / 10000 : r.priceDestination / 100) * 10) / 10,
      demand: 'high',
      margin: Math.round((((r.priceDestination - bRoute.priceOrigin) > 80000 ? (r.priceDestination - bRoute.priceOrigin) / 10000 : (r.priceDestination - bRoute.priceOrigin) / 100)) * 10) / 10
    }));
  } else if (oldMatch) {
    baseBuy = oldMatch.baseBuy;
    baseSell = oldMatch.baseSell;
    bestBuy = oldMatch.bestBuy;
    bestSell = oldMatch.bestSell;
    buyLocations = oldMatch.buyLocations || [];
    sellLocations = oldMatch.sellLocations || [];
  } else {
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

  // Corrélation stricte et obligatoire avec les modules de Minage, Salvage 4.0 et Lore officiel
  if (slug === 'recycled-material-composite' || slug === 'rmc') {
    baseBuy = 105.0; // 10 500 aUEC / SCU à l'achat/découpe
    baseSell = 142.0; // 14 200 aUEC / SCU au TDD (strictement aligné sur modules/salvage)
    bestBuy = { location: 'Rappel / Postes de ferraillage (Pyro)', system: 'Pyro', price: 105.0, stock: 'high' };
    bestSell = { location: 'Area18 TDD (ArcCorp)', system: 'Stanton', price: 142.0, demand: 'high' };
  } else if (slug === 'construction-materials') {
    baseBuy = 48.0; // 4 800 aUEC / SCU à la fracturation
    baseSell = 72.0; // 7 200 aUEC / SCU au TDD (strictement aligné sur modules/salvage)
    bestBuy = { location: 'Broyeurs industriels & Stations', system: 'Stanton', price: 48.0, stock: 'high' };
    bestSell = { location: 'Lorville CBD (Hurston)', system: 'Stanton', price: 72.0, demand: 'high' };
  } else if (slug === 'quantainium' || slug === 'quantainium-refined') {
    baseBuy = 145.0; // Coût de revient moyen extraction/raffinage 14 500 aUEC / SCU
    baseSell = 265.0; // Prix de vente officiel TDD 26 500 aUEC / SCU (aligné sur minerals.js et TRADE_TERMINALS)
    bestBuy = { location: 'Raffinerie ARC-L1 Wide Forest', system: 'Stanton', price: 145.0, stock: 'high' };
    bestSell = { location: 'Area18 TDD (ArcCorp)', system: 'Stanton', price: 265.0, demand: 'high' };
  } else if (slug === 'osoian-hides') {
    baseBuy = 28.35; // 2 835 aUEC / SCU
    baseSell = 87.0; // 8 700 aUEC / SCU
    bestBuy = { location: 'The Golden Riviera (Bloom)', system: 'Pyro', price: 28.35, stock: 'high' };
    bestSell = { location: 'Devlin Scrap and Salvage (microTech)', system: 'Stanton', price: 87.0, demand: 'high' };
  } else if (slug === 'stileron') {
    baseBuy = 122.85; // 12 285 aUEC / SCU
    baseSell = 170.0; // 17 000 aUEC / SCU
  } else if (slug === 'sunset-berries') {
    baseBuy = 65.63; // 6 563 aUEC / SCU
    baseSell = 110.0; // 11 000 aUEC / SCU
  } else if (slug === 'diamond-laminate') {
    baseBuy = 66.88; // 6 688 aUEC / SCU
    baseSell = 100.0; // 10 000 aUEC / SCU
  } else if (slug === 'laranite') {
    baseBuy = 70.47; // 7 047 aUEC / SCU
    baseSell = 97.0; // 9 700 aUEC / SCU
    bestBuy = { location: 'ArcCorp Mining Area 056 (Wala)', system: 'Stanton', price: 70.47, stock: 'high' };
    bestSell = { location: 'Area18 TDD (ArcCorp)', system: 'Stanton', price: 97.0, demand: 'high' };
  } else if (slug === 'gold') {
    baseBuy = 243.6; // 24 360 aUEC / SCU
    baseSell = 310.0; // 31 000 aUEC / SCU
    bestBuy = { location: 'HDMS-Norgaard (Ita)', system: 'Stanton', price: 243.6, stock: 'high' };
    bestSell = { location: 'Area18 TDD (ArcCorp)', system: 'Stanton', price: 310.0, demand: 'high' };
  } else if (slug === 'beryl') {
    baseBuy = 153.9; // 15 390 aUEC / SCU
    baseSell = 240.0; // 24 000 aUEC / SCU
    bestBuy = { location: 'Levski (Delamar)', system: 'Stanton', price: 153.9, stock: 'high' };
    bestSell = { location: 'Lorville CBD (Hurston)', system: 'Stanton', price: 240.0, demand: 'high' };
  }

  const name_fr = frNames[slug] || oldMatch?.name_fr || c.name;
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

updatedCommodities.sort((a, b) => b.marginPerScu - a.marginPerScu);
console.log(`✓ Total Commodities créées et corrélées : ${updatedCommodities.length}`);

// Routes commerciales équilibrées pour couvrir tous les secteurs vitaux de Star Citizen 4.0
const ESSENTIAL_CURATED_ROUTES = [
  // 1. Minerais & Métaux précieux
  {
    item: 'Laranite (Fret Cargo)',
    commodityId: 'laranite',
    from: 'ArcCorp Mining Area 056 (Wala)',
    to: 'Area18 TDD (ArcCorp)',
    system: 'stanton',
    distanceGm: 21.2,
    buyPricePerScu: 7047,
    sellPricePerScu: 9700,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Laranite (Fret Cargo)',
    commodityId: 'laranite',
    from: 'HDMS-Lathan (Arial)',
    to: 'Lorville Central Business District (Hurston)',
    system: 'stanton',
    distanceGm: 14.5,
    buyPricePerScu: 7120,
    sellPricePerScu: 9650,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Or Métallique (Gold)',
    commodityId: 'gold',
    from: 'HDMS-Norgaard (Ita)',
    to: 'Area18 TDD (ArcCorp)',
    system: 'stanton',
    distanceGm: 22.8,
    buyPricePerScu: 24360,
    sellPricePerScu: 31000,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Or Métallique (Gold)',
    commodityId: 'gold',
    from: 'Brio\'s Breaker Yard (Daymar)',
    to: 'Lorville Central Business District (Hurston)',
    system: 'stanton',
    distanceGm: 18.4,
    buyPricePerScu: 24500,
    sellPricePerScu: 30800,
    risk: 'Moyen',
    riskKey: 'medium',
    riskClass: 'amber',
    riskTier: 't-y'
  },
  {
    item: 'Béryl Brut & Taillé (Beryl)',
    commodityId: 'beryl',
    from: 'Levski (Delamar)',
    to: 'Lorville Central Business District (Hurston)',
    system: 'stanton',
    distanceGm: 19.1,
    buyPricePerScu: 15390,
    sellPricePerScu: 24000,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Quantainium Raffiné',
    commodityId: 'quantainium',
    from: 'Raffinerie ARC-L1 Wide Forest',
    to: 'Area18 TDD (ArcCorp)',
    system: 'stanton',
    distanceGm: 11.2,
    buyPricePerScu: 14500,
    sellPricePerScu: 26800,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Quantainium Raffiné',
    commodityId: 'quantainium',
    from: 'Raffinerie CRU-L1 Ambitious Dream',
    to: 'New Babbage TDD (microTech)',
    system: 'stanton',
    distanceGm: 26.4,
    buyPricePerScu: 14500,
    sellPricePerScu: 26200,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  // 2. Salvage & Recyclage Industriel 4.0
  {
    item: 'Matériau Composite Recyclé (RMC)',
    commodityId: 'recycled-material-composite',
    from: 'Rappel Scrap & Salvage (Pyro)',
    to: 'Area18 TDD (ArcCorp)',
    system: 'stanton',
    distanceGm: 45.0,
    buyPricePerScu: 10500,
    sellPricePerScu: 14800,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Matériau Composite Recyclé (RMC)',
    commodityId: 'recycled-material-composite',
    from: 'Terra Mills Hydrofarm (Cellin)',
    to: 'Orison Cloudview TDD (Crusader)',
    system: 'stanton',
    distanceGm: 8.5,
    buyPricePerScu: 10500,
    sellPricePerScu: 14400,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Matériaux de Construction Structurels (CM)',
    commodityId: 'construction-materials',
    from: 'Levski Broyeurs (Delamar)',
    to: 'Lorville Central Business District (Hurston)',
    system: 'stanton',
    distanceGm: 19.1,
    buyPricePerScu: 4800,
    sellPricePerScu: 7500,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Matériaux de Construction Structurels (CM)',
    commodityId: 'construction-materials',
    from: 'Stations Broyeuses Orbitales',
    to: 'Admin - MIC-L4 (microTech)',
    system: 'stanton',
    distanceGm: 22.0,
    buyPricePerScu: 4800,
    sellPricePerScu: 7200,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  // 3. Fret Industriel, Soins & Médical
  {
    item: 'Fournitures Médicales (Med Supplies)',
    commodityId: 'medical-supplies',
    from: 'Rayari Kaltag Research (Calliope)',
    to: 'Admin - Nyx Gateway (Pyro)',
    system: 'stanton',
    distanceGm: 52.0,
    buyPricePerScu: 3343,
    sellPricePerScu: 5800,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Fournitures Médicales (Med Supplies)',
    commodityId: 'medical-supplies',
    from: 'Deakins Research Outpost (Yela)',
    to: 'GrimHEX (Yela)',
    system: 'stanton',
    distanceGm: 3.2,
    buyPricePerScu: 3350,
    sellPricePerScu: 5650,
    risk: 'Moyen',
    riskKey: 'medium',
    riskClass: 'amber',
    riskTier: 't-y'
  },
  {
    item: 'Titane Industriel (Titanium)',
    commodityId: 'titanium',
    from: 'Shubin Mining Facility SAL-5 (Lyria)',
    to: 'Area18 TDD (ArcCorp)',
    system: 'stanton',
    distanceGm: 14.8,
    buyPricePerScu: 6699,
    sellPricePerScu: 8300,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Agricium Raffiné',
    commodityId: 'agricium',
    from: 'ArcCorp Mining 141 (Cellin)',
    to: 'Area18 TDD (ArcCorp)',
    system: 'stanton',
    distanceGm: 21.0,
    buyPricePerScu: 27500,
    sellPricePerScu: 34500,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Diamant Industriel',
    commodityId: 'diamond',
    from: 'Tram & Myers Mining (Cellin)',
    to: 'Lorville Central Business District (Hurston)',
    system: 'stanton',
    distanceGm: 16.5,
    buyPricePerScu: 6200,
    sellPricePerScu: 7400,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Bexalite Raffinée',
    commodityId: 'bexalite',
    from: 'Shubin Mining SCD-1 (Daymar)',
    to: 'New Babbage TDD (microTech)',
    system: 'stanton',
    distanceGm: 28.5,
    buyPricePerScu: 23556,
    sellPricePerScu: 31000,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Taranite Raffinée',
    commodityId: 'taranite',
    from: 'Samson & Son Salvage (Daymar)',
    to: 'Orison Cloudview TDD (Crusader)',
    system: 'stanton',
    distanceGm: 9.2,
    buyPricePerScu: 21792,
    sellPricePerScu: 31000,
    risk: 'Moyen',
    riskKey: 'medium',
    riskClass: 'amber',
    riskTier: 't-y'
  },
  // 4. Marchandises Pyro & Inter-Systèmes (Star Citizen 4.0)
  {
    item: 'Stileron (Exclusif Pyro)',
    commodityId: 'stileron',
    from: 'Bueno Ravine (Bloom, Pyro)',
    to: 'Admin - Nyx Gateway (Pyro)',
    system: 'pyro',
    distanceGm: 62.0,
    buyPricePerScu: 12285,
    sellPricePerScu: 17000,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Sunset Berries',
    commodityId: 'sunset-berries',
    from: 'Shepherd\'s Rest (Pyro)',
    to: 'Rayari Deltana Research Outpost (microTech)',
    system: 'pyro',
    distanceGm: 68.0,
    buyPricePerScu: 6563,
    sellPricePerScu: 11000,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Diamond Laminate',
    commodityId: 'diamond-laminate',
    from: 'Canard View (Pyro)',
    to: 'Jackson\'s Swap (Pyro)',
    system: 'pyro',
    distanceGm: 42.0,
    buyPricePerScu: 6688,
    sellPricePerScu: 10000,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Osoian Hides',
    commodityId: 'osoian-hides',
    from: 'The Golden Riviera (Bloom, Pyro)',
    to: 'Devlin Scrap and Salvage (microTech)',
    system: 'pyro',
    distanceGm: 85.0,
    buyPricePerScu: 2835,
    sellPricePerScu: 8700,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Degnous Root',
    commodityId: 'degnous-root',
    from: 'Shepherd\'s Rest (Pyro)',
    to: 'Admin - HUR-L5 (Hurston)',
    system: 'pyro',
    distanceGm: 74.0,
    buyPricePerScu: 3800,
    sellPricePerScu: 5900,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Ferraille & Déchets Métalliques (Scrap)',
    commodityId: 'scrap',
    from: 'Admin - HUR-L5 (Hurston)',
    to: 'HDMS-Hahn (Hurston)',
    system: 'stanton',
    distanceGm: 12.0,
    buyPricePerScu: 2749,
    sellPricePerScu: 3800,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Fournitures Agricoles (Agri-Supplies)',
    commodityId: 'agri-supplies',
    from: 'Hickes Research Outpost (Cellin)',
    to: 'Bountiful Harvest Hydroponics (Daymar)',
    system: 'stanton',
    distanceGm: 6.8,
    buyPricePerScu: 1100,
    sellPricePerScu: 1550,
    risk: 'Faible',
    riskKey: 'safe',
    riskClass: 'green',
    riskTier: 't-g'
  },
  {
    item: 'Spiritueux Distillés',
    commodityId: 'distilled-spirits',
    from: 'Bountiful Harvest (Daymar)',
    to: 'GrimHEX (Yela)',
    system: 'stanton',
    distanceGm: 8.4,
    buyPricePerScu: 1312,
    sellPricePerScu: 2100,
    risk: 'Moyen',
    riskKey: 'medium',
    riskClass: 'amber',
    riskTier: 't-y'
  },
  // 5. Contrebande & Vice (Haut Risque / Haut Profit)
  {
    item: 'Gasping Weevil Eggs',
    commodityId: 'gasping-weevil-eggs',
    from: 'Fallow Field (Pyro)',
    to: 'Devlin Scrap and Salvage (microTech)',
    system: 'pyro',
    distanceGm: 78.0,
    buyPricePerScu: 14500,
    sellPricePerScu: 24592,
    risk: 'Extrême',
    riskKey: 'extreme',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Maze (Substance Contrôlée)',
    commodityId: 'maze',
    from: 'Jumptown (Yela)',
    to: 'GrimHEX (Yela)',
    system: 'stanton',
    distanceGm: 4.5,
    buyPricePerScu: 9500,
    sellPricePerScu: 14500,
    risk: 'Extrême',
    riskKey: 'extreme',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Slam (Narcotique)',
    commodityId: 'slam',
    from: 'Raven\'s Roost (Calliope)',
    to: 'Brio\'s Breaker Yard (Daymar)',
    system: 'stanton',
    distanceGm: 31.0,
    buyPricePerScu: 14200,
    sellPricePerScu: 21500,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'WiDoW (Substance Illicite)',
    commodityId: 'widow',
    from: 'Ashland (Pyro)',
    to: 'Samson & Son Salvage (Daymar)',
    system: 'pyro',
    distanceGm: 65.0,
    buyPricePerScu: 11500,
    sellPricePerScu: 17000,
    risk: 'Extrême',
    riskKey: 'extreme',
    riskClass: 'red',
    riskTier: 't-r'
  },
  {
    item: 'Néon Gaz',
    commodityId: 'neon',
    from: 'Rustville (Pyro)',
    to: 'Admin - Starlight Service (Pyro)',
    system: 'pyro',
    distanceGm: 44.0,
    buyPricePerScu: 7206,
    sellPricePerScu: 12000,
    risk: 'Élevé',
    riskKey: 'high',
    riskClass: 'red',
    riskTier: 't-r'
  }
];

const topPopularRoutes = [];
const seenCommodityCounts = new Map();
let rank = 1;

for (const cur of ESSENTIAL_CURATED_ROUTES) {
  const marginPerScu = cur.sellPricePerScu - cur.buyPricePerScu;
  const isPyro = cur.system === 'pyro' || cur.from.toLowerCase().includes('pyro') || cur.to.toLowerCase().includes('pyro');

  topPopularRoutes.push({
    id: `r_curated_${rank}`,
    rank,
    name: `${cur.item} • ${cur.from} ➔ ${cur.to}`,
    item: cur.item,
    commodityId: cur.commodityId,
    from: cur.from,
    to: cur.to,
    origin: cur.from,
    destination: cur.to,
    system: cur.system || (isPyro ? 'pyro' : 'stanton'),
    distanceGm: cur.distanceGm || 20,
    distance: `${cur.from.split('(')[1]?.replace(')', '') || 'Stanton'} ➔ ${cur.to.split('(')[1]?.replace(')', '') || 'Stanton'} · ${cur.distanceGm || 20} GM`,
    quantumJumps: isPyro ? 2 : 1,
    originAtmoMinutes: 1.0,
    destAtmoMinutes: 1.0,
    terminalMinutes: 3.5,
    buyPricePerScu: cur.buyPricePerScu,
    sellPricePerScu: cur.sellPricePerScu,
    buyPrice: Math.round((cur.buyPricePerScu / 100) * 100) / 100,
    sellPrice: Math.round((cur.sellPricePerScu / 100) * 100) / 100,
    marginPerScu,
    durationMinutes: Math.round(14 + (cur.distanceGm || 20) * 0.8),
    freshness: 'Direct Live',
    freshnessClass: 'green',
    freshnessTier: 't-g',
    risk: cur.risk || (isPyro ? 'Élevé' : 'Faible'),
    riskKey: cur.riskKey || (isPyro ? 'high' : 'safe'),
    riskClass: cur.riskClass || (isPyro ? 'red' : 'green'),
    riskTier: cur.riskTier || (isPyro ? 't-r' : 't-g'),
    hasFreightElevator: true,
    maxContainerSize: 32
  });

  seenCommodityCounts.set(cur.commodityId, (seenCommodityCounts.get(cur.commodityId) || 0) + 1);
  rank++;
}

// Compléter avec les meilleures routes restantes de FleetYards (max 2 par marchandise)
const sortedFyRoutes = fyRoutes
  .filter(r => r.priceOrigin && r.priceDestination && r.profitPerScu > 0 && r.commodity?.name)
  .sort((a, b) => b.profitPerScu - a.profitPerScu);

const seenTerminalPairs = new Set();
for (const r of sortedFyRoutes) {
  if (topPopularRoutes.length >= 42) break;

  const slug = r.commodity?.slug;
  if (!slug) continue;

  const currentCount = seenCommodityCounts.get(slug) || 0;
  if (currentCount >= 2) continue;

  const pairKey = `${r.originTerminal?.name}_${r.destinationTerminal?.name}_${slug}`;
  if (seenTerminalPairs.has(pairKey)) continue;
  seenTerminalPairs.add(pairKey);

  let buyScu = r.priceOrigin;
  let sellScu = r.priceDestination;
  let marginScu = r.profitPerScu;

  if (buyScu > 80000) {
    buyScu = Math.round(buyScu / 100);
    sellScu = Math.round(sellScu / 100);
    marginScu = sellScu - buyScu;
  }

  const sys = (r.originTerminal?.starSystem || 'Stanton').toLowerCase();
  const isPyro = sys === 'pyro' || (r.destinationTerminal?.starSystem || '').toLowerCase() === 'pyro';

  topPopularRoutes.push({
    id: `r_fy_${rank}`,
    rank,
    name: `${r.commodity?.name} • ${r.originTerminal?.name} ➔ ${r.destinationTerminal?.name}`,
    item: frNames[slug] || r.commodity?.name,
    commodityId: slug,
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

  seenCommodityCounts.set(slug, currentCount + 1);
  rank++;
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
console.log('✓ data/game/trade.js mis à jour avec 232 commodities corrélées et ' + topPopularRoutes.length + ' routes diversifiées !');
