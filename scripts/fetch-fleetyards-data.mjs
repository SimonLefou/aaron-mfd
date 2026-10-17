// ============================================================================
// FleetYards.net Data Extractor for AARON MFD
// Récupération complète & structurée des Blueprints, Composants, Équipements,
// Commodities et Lieux (Locations & Shops) depuis l'API officielle FleetYards v1.
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, '../data/fleetyards');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const BASE_URL = 'https://api.fleetyards.net/v1';

async function fetchJson(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Aaron-MFD-Companion/3.0 (Star Citizen Mining & Logistics)'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${url.pathname}: ${res.statusText}`);
  }
  return res.json();
}

async function fetchAllPages(endpoint, perPage = 100, maxPages = 100) {
  let page = 1;
  const items = [];
  let totalCount = 0;

  while (page <= maxPages) {
    const json = await fetchJson(endpoint, { perPage, page });
    const batch = json.items || [];
    items.push(...batch);
    totalCount = json.meta?.pagination?.totalCount || items.length;
    const totalPages = json.meta?.pagination?.totalPages || 1;

    process.stdout.write(`\r  [${endpoint}] Page ${page}/${totalPages} (${items.length}/${totalCount} items)`);

    if (page >= totalPages || batch.length === 0) break;
    page++;
    // Respect rate limits
    await new Promise(r => setTimeout(r, 60));
  }
  process.stdout.write('\n');
  return { items, totalCount };
}

async function main() {
  console.log('🛸 === DÉMARRAGE DE L\'EXTRACTION FLEETYARDS.NET ===');
  console.log(`Dossier cible : ${OUT_DIR}\n`);

  const summary = {
    extractedAt: new Date().toISOString(),
    source: 'https://fleetyards.net',
    api: 'https://api.fleetyards.net/v1',
    counts: {}
  };

  // 1. COMMODITIES
  console.log('1. Récupération des Commodities (Marchandises & Minerais)...');
  const commoditiesData = await fetchAllPages('commodities', 100);
  const commoditiesPath = path.join(OUT_DIR, 'commodities.json');
  fs.writeFileSync(commoditiesPath, JSON.stringify(commoditiesData.items, null, 2), 'utf8');
  summary.counts.commodities = commoditiesData.items.length;
  console.log(`  ✓ ${commoditiesData.items.length} marchandises enregistrées dans commodities.json`);

  // 2. BLUEPRINTS (Schémas de fabrication)
  console.log('\n2. Récupération des Blueprints (Schémas d\'artisanat)...');
  const blueprintsData = await fetchAllPages('blueprints', 100);
  const blueprintsPath = path.join(OUT_DIR, 'blueprints.json');
  fs.writeFileSync(blueprintsPath, JSON.stringify(blueprintsData.items, null, 2), 'utf8');
  summary.counts.blueprints = blueprintsData.items.length;
  console.log(`  ✓ ${blueprintsData.items.length} blueprints enregistrés dans blueprints.json`);

  // 3. LOCATIONS (Stations, planètes, lunes, outposts)
  console.log('\n3. Récupération des Lieux (Locations & Outposts)...');
  // 1900+ locations, let's fetch with perPage=100
  const locationsData = await fetchAllPages('locations', 100);
  const locationsPath = path.join(OUT_DIR, 'locations.json');
  fs.writeFileSync(locationsPath, JSON.stringify(locationsData.items, null, 2), 'utf8');
  summary.counts.locations = locationsData.items.length;
  console.log(`  ✓ ${locationsData.items.length} lieux enregistrés dans locations.json`);

  // 4. COMPOSANTS (Quantum Drives, Boucliers, Refroidisseurs, Centrales, Modules...)
  console.log('\n4. Récupération des Composants Vaisseaux (Ship Components)...');
  const componentsData = await fetchAllPages('components', 144);
  const componentsPath = path.join(OUT_DIR, 'components.json');
  fs.writeFileSync(componentsPath, JSON.stringify(componentsData.items, null, 2), 'utf8');
  summary.counts.components = componentsData.items.length;
  console.log(`  ✓ ${componentsData.items.length} composants enregistrés dans components.json`);

  // 5. ÉQUIPEMENTS (Armures, Gadgets de minage, Armes FPS, Accessoires...)
  console.log('\n5. Récupération des Équipements FPS & Industriels...');
  const equipmentData = await fetchAllPages('equipment', 100);
  const equipmentPath = path.join(OUT_DIR, 'equipment.json');
  fs.writeFileSync(equipmentPath, JSON.stringify(equipmentData.items, null, 2), 'utf8');
  summary.counts.equipment = equipmentData.items.length;
  console.log(`  ✓ ${equipmentData.items.length} équipements enregistrés dans equipment.json`);

  // 6. TRADE ROUTES (Prix & routes commerciales live)
  console.log('\n6. Récupération des Routes Commerciales (Trade Routes)...');
  let tradeRoutes = [];
  try {
    const trData = await fetchAllPages('trade-routes', 100);
    tradeRoutes = trData.items;
  } catch (err) {
    console.warn('  ⚠️ Trade routes fetch warning:', err.message);
  }
  const tradeRoutesPath = path.join(OUT_DIR, 'trade-routes.json');
  fs.writeFileSync(tradeRoutesPath, JSON.stringify(tradeRoutes, null, 2), 'utf8');
  summary.counts.tradeRoutes = tradeRoutes.length;
  console.log(`  ✓ ${tradeRoutes.length} routes commerciales enregistrées dans trade-routes.json`);

  // 7. RÉSUMÉ & INDEXATION CROISÉE
  const summaryPath = path.join(OUT_DIR, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n🎉 === EXTRACTION FLEETYARDS TERMINÉE AVEC SUCCÈS ===');
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error('\n❌ Erreur fatale durant l\'extraction :', err);
  process.exit(1);
});
