// ============================================================================
// Script de mise à jour des données de jeu (data/game/) à partir des données FleetYards
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const fyBlueprints = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/blueprints.json'), 'utf8'));
const fyComps = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/components.json'), 'utf8'));
const fyEquip = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/equipment.json'), 'utf8'));
const fyComms = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/commodities.json'), 'utf8'));
const fyLocs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/locations.json'), 'utf8'));
const fyRoutes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/fleetyards/trade-routes.json'), 'utf8'));

console.log('=== PRÉPARATION DE LA MISE À JOUR DES DONNÉES DE JEU ===');
console.log(`Blueprints FleetYards: ${fyBlueprints.length}`);
console.log(`Composants FleetYards: ${fyComps.length}`);
console.log(`Équipements FleetYards: ${fyEquip.length}`);
console.log(`Commodities FleetYards: ${fyComms.length}`);
console.log(`Locations FleetYards: ${fyLocs.length}`);
console.log(`Routes Commerciales FleetYards: ${fyRoutes.length}`);
