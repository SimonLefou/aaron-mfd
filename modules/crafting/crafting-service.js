// ============================================================================
// AARON MFD — CRAFTING SERVICE (STAR CITIZEN 4.0+)
// Suivi des blueprints, vérification de nomenclature (BOM), tri « proche du craft »
// et atelier de fabrication multi-exemplaires
// ============================================================================

import { store } from '../core/state.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { inventoryService } from '../inventory/inventory-service.js';
import { BLUEPRINTS } from '../../data/index.js';

/**
 * Calcul de craftabilité pur (compatible stock Map ou inventaire direct)
 * @param {object} blueprint { id, materials | ingredients: [{ mineralId|itemId, scu|quantity }] }
 * @param {Map<string, number>} stock Map de ressource -> quantité
 * @param {Map<string, object>} recipesByOutput Map de ressource -> blueprint qui le produit
 * @param {number} depth Profondeur de récursion pour sous-recettes
 * @returns {{ maxQty: number, missing: Array<{ mineralId: string, needed: number, have: number }> }}
 */
export function calculateCraftability(blueprint, stock, recipesByOutput = new Map(), depth = 0) {
  let maxQty = Infinity;
  const missing = [];
  const ingredients = blueprint.materials || blueprint.ingredients || [];

  for (const ing of ingredients) {
    const resId = (ing.mineralId || ing.itemId || ing.code || '').toString().toLowerCase();
    const req = Number(ing.scu || ing.quantity || 1);
    const have = stock.get(resId) ?? 0;
    let possible = Math.floor(have / req);

    // Si on manque de cet ingrédient mais qu'on sait le crafter, inspection sous-recette
    if (possible < 1 && depth < 3 && recipesByOutput.has(resId)) {
      const subBp = recipesByOutput.get(resId);
      const sub = calculateCraftability(subBp, stock, recipesByOutput, depth + 1);
      const outputQty = Number(subBp.outputQty || 1);
      if (sub.maxQty * outputQty >= req - have) {
        possible = 1;
      }
    }

    if (possible < 1) {
      missing.push({
        mineralId: resId,
        needed: req,
        have
      });
    }

    maxQty = Math.min(maxQty, possible);
  }

  return {
    maxQty: maxQty === Infinity ? 0 : maxQty,
    missing
  };
}

/**
 * Statut d'affichage d'un blueprint
 * @returns {{ key: 'g'|'a'|'b'|'r', label: string }}
 */
export function getCraftStatus({ owned, maxQty, missing }) {
  if (!owned) return { key: 'r', label: 'Non possédé' };
  if (maxQty > 0) return { key: 'g', label: 'Craftable' };
  return { key: 'a', label: `Il manque ${missing?.length || 0}` };
}

/**
 * Tri « proche du craft » (idée aaron-mfd/src/lib/craftability.js) :
 * 1. Craftables immédiatement (0)
 * 2. Triés par nombre croissant d'ingrédients manquants (1, 2, 3...)
 * 3. Non possédés en dernier (1000)
 */
export function closeness(bp) {
  if (!bp.owned && !bp.isUnlocked) return 1000;
  if (bp.maxQty > 0 || bp.isFullyCraftable) return 0;
  return bp.missing ? bp.missing.length : (bp.ingredients ? bp.ingredients.filter(i => !i.isMet).length : 99);
}

/**
 * Référentiel des catégories industrielles et d'équipement officiel (Star Citizen 4.0+)
 */
export const BLUEPRINT_CATEGORIES = [
  { id: 'lasers', name: 'Tête de minage', label: '⛏️ Têtes de minage', icon: '⛏️', description: 'Têtes laser de forage S1 et S2 (Lancet, Helix, Hofstede, Klein...)' },
  { id: 'modules', name: 'Module de minage', label: '⚡ Modules de minage', icon: '⚡', description: 'Sous-modules de stabilisation et d’extraction laser (Surge, Stampede, Focus...)' },
  { id: 'gadgets', name: 'Gadget de minage', label: '🧲 Gadgets de minage', icon: '🧲', description: 'Dispositifs miniers déployables sur rocher (Sabir, Waverider, Optimax...)' },
  { id: 'saddlebags', name: 'Sacs & Conteneurs SCU', label: '🎒 Sacs & Conteneurs SCU', icon: '🎒', description: 'Sacs miniers détachables Prospector et MOLE, pods cargo' },
  { id: 'salvage', name: 'Tête de recyclage', label: '♻️ Têtes de recyclage', icon: '♻️', description: 'Outils de raclage et désossage d’épaves (Abrade, Trawler...)' },
  { id: 'shields', name: 'Bouclier vaisseau', label: '🛡️ Boucliers vaisseau', icon: '🛡️', description: 'Générateurs de bouclier énergétique et balistique (FR-66, FR-76, Sukoran...)' },
  { id: 'quantum_drives', name: 'Moteur quantique', label: '🌌 Moteurs quantiques', icon: '🌌', description: 'Propulseurs de saut interstellaire (Atlas, Crossfield, Voyage, Siren...)' },
  { id: 'power_plants', name: 'Générateur d’énergie', label: '🔋 Générateurs d’énergie', icon: '🔋', description: 'Centrales électriques de vaisseau (JS-300, JS-400, Quadracell...)' },
  { id: 'coolers', name: 'Refroidisseur vaisseau', label: '❄️ Refroidisseurs vaisseau', icon: '❄️', description: 'Dissipateurs thermiques haute capacité (UltraFlow, Glacier, IceFlush...)' },
  { id: 'ship_weapons', name: 'Arme vaisseau', label: '🚀 Armes de vaisseau', icon: '🚀', description: 'Canons laser, répéteurs balistiques et tourelles de bord' },
  { id: 'fps_weapons', name: 'Arme FPS', label: '🔫 Armes FPS', icon: '🔫', description: 'Pistolets, fusils d’assaut, snipers, SMG et fusils de précision' },
  { id: 'tools_tractors', name: 'Outil & Rayon tracteur', label: '🔧 Outils & Rayons tracteurs', icon: '🔧', description: 'Multi-Tool Pyro RYT, fusils tracteurs MaxLift et embouts' },
  { id: 'armor', name: 'Armure & Combinaison', label: '🦺 Armures & Combinaisons', icon: '🦺', description: 'Combinaisons environnementales (Novikov, Morozov) et armures de combat' },
  { id: 'consumables', name: 'Munitions & Consommables', label: '💊 Munitions & Consommables', icon: '💊', description: 'Chargeurs balistiques, cartouches d’énergie, MedPens et filtres de survie' },
  { id: 'components', name: 'Composant vaisseau', label: '⚙️ Autres composants vaisseau', icon: '⚙️', description: 'Modules et pièces détachées pour l’aéronavale' },
  { id: 'accessories', name: 'Équipement & Accessoire', label: '📦 Équipements & Accessoires', icon: '📦', description: 'Accessoires, optiques et modules utilitaires' }
];

/**
 * Résolution automatique de la catégorie fine d'un blueprint
 * @param {Object} blueprint 
 * @returns {string} Nom de catégorie normalisé
 */
export function resolveBlueprintCategory(blueprint) {
  if (!blueprint) return 'Équipement & Accessoire';
  const rawCat = (blueprint.category || '').toLowerCase();
  const name = (blueprint.name || '').toLowerCase();

  // 1. Têtes laser de minage
  if (rawCat === 'lasers' || (name.includes('laser') && (name.includes('minage') || name.includes('lancet') || name.includes('helix') || name.includes('hofstede') || name.includes('klein') || name.includes('arbor') || name.includes('mh1') || name.includes('mh2')))) {
    return 'Tête de minage';
  }
  // 2. Têtes de recyclage & Salvage
  if (rawCat === 'salvage' || name.includes('salvage') || name.includes('recyclage') || name.includes('abrade') || name.includes('trawler')) {
    return 'Tête de recyclage';
  }
  // 3. Modules de minage
  if (rawCat === 'modules' || (name.includes('module') && !name.includes('smg')) || name.includes('surge') || name.includes('stampede') || name.includes('focus') || name.includes('torpid') || name.includes('rieger') || name.includes('brandt')) {
    return 'Module de minage';
  }
  // 4. Gadgets de minage
  if (rawCat === 'gadgets' || name.includes('gadget') || name.includes('sabir') || name.includes('waverider') || name.includes('optimax') || name.includes('boreas')) {
    return 'Gadget de minage';
  }
  // 5. Sacs miniers & Conteneurs cargo
  if (rawCat === 'saddlebags' || name.includes('saddlebag') || name.includes('sac ') || name.includes('conteneur') || name.includes('pod')) {
    return 'Sacs & Conteneurs SCU';
  }
  // 6. Boucliers de vaisseau
  if (name.includes('bouclier') || name.includes('shield') || name.includes('fr-66') || name.includes('fr-76') || name.includes('fr-86') || name.includes('sukoran') || name.includes('rampart') || /\b\d+sa\b/i.test(name) || name.includes('allstop') || name.includes('forcewall') || name.includes('palisade')) {
    return 'Bouclier vaisseau';
  }
  // 7. Moteurs quantiques
  if (name.includes('quantique') || name.includes('quantum') || name.includes('atlas') || name.includes('crossfield') || name.includes('voyage') || name.includes('beacon') || name.includes('siren') || name.includes('colossus') || name.includes('pontes') || name.includes('expedition') || name.includes('goliath') || name.includes('tsunami')) {
    return 'Moteur quantique';
  }
  // 8. Générateurs d’énergie
  if (name.includes('énergie') || name.includes('power plant') || name.includes('générateur d’énergie') || name.includes('js-300') || name.includes('js-400') || name.includes('quadracell') || name.includes('daybreak') || name.includes('supernova') || name.includes('overdrive') || name.includes('recharger')) {
    return 'Générateur d’énergie';
  }
  // 9. Refroidisseurs de vaisseau
  if (name.includes('refroidisseur') || name.includes('cooler') || name.includes('ultra-flow') || name.includes('ultraflow') || name.includes('glacier') || name.includes('iceflush') || name.includes('zero-g') || name.includes('avalanche') || name.includes('snowpack') || name.includes('chill')) {
    return 'Refroidisseur vaisseau';
  }
  // 10. Munitions & chargeurs & consommables
  if (rawCat === 'consumables' || name.includes('munition') || name.includes('ammo') || name.includes('magazine') || name.includes('mag ') || name.includes('medpen') || name.includes('oxypen') || name.includes('hemozal') || name.includes('filtre')) {
    return 'Munitions & Consommables';
  }
  // 11. Outils & Rayons tracteurs
  if (name.includes('outil') || name.includes('tool') || name.includes('multitool') || name.includes('tracteur') || name.includes('tractor') || name.includes('maxlift') || name.includes('cutter') || name.includes('scraper')) {
    return 'Outil & Rayon tracteur';
  }
  // 12. Armures, casques, combinaisons FPS
  if (rawCat === 'armor' || name.includes('armure') || name.includes('armor') || name.includes('combinaison') || name.includes('suit') || name.includes('casque') || name.includes('helmet') || name.includes('arms') || name.includes('legs') || name.includes('core') || name.includes('novikov') || name.includes('morozov') || name.includes('adp ') || name.includes('defiance') || name.includes('undermuit') || name.includes('undersuit')) {
    return 'Armure & Combinaison';
  }
  // 13. Armes de vaisseau (Canons, répéteurs, gatlings)
  if (rawCat === 'weapons' || name.includes('cannon') || name.includes('repeater') || name.includes('gatling') || name.includes('canon') || name.includes('répéteur') || name.includes('laser cannon') || name.includes('deadbolt') || name.includes('omnisky') || name.includes('attrition') || name.includes('tarantula') || name.includes('mantis') || name.includes('broadsword') || name.includes('greatsword') || /\bcf-\d+/i.test(name) || name.includes('rhino') || name.includes('panther') || name.includes('badger') || name.includes('bulldog') || name.includes('dominance') || name.includes('quarreler') || name.includes('galdreen') || name.includes('scorpio')) {
    return 'Arme vaisseau';
  }
  // 14. Armes FPS
  if (name.includes('fusil') || name.includes('pistolet') || name.includes('pistol') || name.includes('rifle') || name.includes('smg') || name.includes('sniper') || name.includes('shotgun') || name.includes('mitrailleur') || name.includes('c54') || name.includes('p6-lr') || name.includes('fs-9') || name.includes('p4-ar') || name.includes('karna') || name.includes('custodian') || name.includes('devastator') || name.includes('gallant') || name.includes('demeco') || name.includes('a03') || name.includes('lh86') || name.includes('arc') || name.includes('kallrath') || name.includes('salvo') || name.includes('yubarev') || name.includes('s71') || name.includes('p8-sc') || name.includes('lumin') || name.includes('arrowhead') || name.includes('atls')) {
    return 'Arme FPS';
  }
  // 15. Composants vaisseau divers
  if (rawCat === 'components' || /\b\d+[ca|ma|sa]\b/i.test(name)) {
    return 'Composant vaisseau';
  }
  return 'Équipement & Accessoire';
}

/**
 * Échelle officielle de Qualité des Matériaux & Composants (Star Citizen 4.0+)
 * 0 à 1 000 : 500 = Standard Usine (Retail de base)
 */
export const QUALITY_TIERS = [
  {
    id: 'low',
    min: 0,
    max: 399,
    name: 'Rebut / Basse Qualité',
    shortName: 'Basse Qualité',
    color: '#ef4444',
    badgeClass: 'quality-low',
    statBonusRange: [-25, -5],
    valueMultiplier: 0.7
  },
  {
    id: 'standard',
    min: 400,
    max: 599,
    name: 'Standard Usine',
    shortName: 'Standard',
    color: '#38bdf8',
    badgeClass: 'quality-standard',
    statBonusRange: [-5, 5],
    valueMultiplier: 1.0
  },
  {
    id: 'enhanced',
    min: 600,
    max: 749,
    name: 'Supérieur / Militaire',
    shortName: 'Supérieur',
    color: '#818cf8',
    badgeClass: 'quality-enhanced',
    statBonusRange: [5, 15],
    valueMultiplier: 1.35
  },
  {
    id: 'high',
    min: 750,
    max: 899,
    name: 'Haute Qualité Industrielle',
    shortName: 'Haute Qualité',
    color: '#22c55e',
    badgeClass: 'quality-high',
    statBonusRange: [15, 28],
    valueMultiplier: 1.95
  },
  {
    id: 'masterwork',
    min: 900,
    max: 1000,
    name: '⭐ Maître-Ouvrier / Prototype',
    shortName: '⭐ Maître',
    color: '#f59e0b',
    badgeClass: 'quality-masterwork',
    statBonusRange: [28, 45],
    valueMultiplier: 3.2
  }
];

/**
 * Obtenir le tier correspondant à une note de qualité (0 à 1000)
 * @param {number} rating 
 * @returns {Object} Tier de qualité
 */
export function getQualityTier(rating = 500) {
  const r = Math.max(0, Math.min(1000, Number(rating) || 500));
  return QUALITY_TIERS.find(t => r >= t.min && r <= t.max) || QUALITY_TIERS[1];
}

/**
 * Calcul de la qualité composite pondérée des ingrédients injectés
 * @param {Array<{ scu?: number, quantity?: number, quality?: number }>} ingredientsWithQuality 
 * @returns {number} Score pondéré arrondi entre 0 et 1 000
 */
export function calculateCompositeQuality(ingredientsWithQuality = []) {
  if (!ingredientsWithQuality || ingredientsWithQuality.length === 0) return 500;
  let totalWeight = 0;
  let weightedSum = 0;

  for (const item of ingredientsWithQuality) {
    const weight = Math.max(0.1, Number(item.scu || item.quantity || 1));
    const quality = typeof item.quality === 'number' ? Math.max(0, Math.min(1000, item.quality)) : 500;
    totalWeight += weight;
    weightedSum += quality * weight;
  }

  if (totalWeight === 0) return 500;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Moteur de calcul des caractéristiques dynamiques selon la qualité des matériaux
 * @param {Object} blueprint Blueprint de référence
 * @param {number} compositeQuality Score composite (0 à 1000, standard 500)
 * @returns {Object} Analyse détaillée des stats et deltas de performance
 */
export function calculateCraftedStats(blueprint, compositeQuality = 500) {
  const q = Math.max(0, Math.min(1000, Number(compositeQuality) || 500));
  const tier = getQualityTier(q);
  // Facteur delta : -1.0 (Q0) à 0 (Q500) à +1.0 (Q1000)
  const delta = (q - 500) / 500;
  const deltaPct = Math.round(delta * 100);

  // Multiplicateur de valeur marchande économique
  let valueMultiplier = 1.0;
  if (q < 500) {
    valueMultiplier = Math.round((0.5 + 0.5 * (q / 500)) * 100) / 100;
  } else {
    valueMultiplier = Math.round((1.0 + 2.5 * Math.pow((q - 500) / 500, 1.2)) * 100) / 100;
  }

  const category = (blueprint?.category || '').toLowerCase();
  const summary = blueprint?.statsSummary || '';

  // 1. TÊTES LASERS DE MINAGE
  if (category === 'lasers' || category.includes('laser') || category.includes('minage')) {
    // Puissance Laser (W)
    let basePower = 1950;
    const powerMatch = summary.match(/([\d\s]+)\s*W/i);
    if (powerMatch) {
      const parsed = parseInt(powerMatch[1].replace(/\s/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) basePower = parsed;
    } else if (blueprint?.size === 2 || blueprint?.size === '2' || blueprint?.size === 'S2') {
      basePower = 4200;
    }

    // Réduction de Résistance (%)
    let baseResReduction = 55;
    const resMatch = summary.match(/-(\d+(?:\.\d+)?)%/i);
    if (resMatch) {
      const parsed = parseFloat(resMatch[1]);
      if (!isNaN(parsed)) baseResReduction = parsed;
    }

    // Fenêtre de Charge Optimale / Zone Verte (%)
    let baseGreenZone = 30;
    const greenMatch = summary.match(/\+(\d+(?:\.\d+)?)%/i);
    if (greenMatch) {
      const parsed = parseFloat(greenMatch[1]);
      if (!isNaN(parsed)) baseGreenZone = parsed;
    }

    // Scaling basé sur la qualité
    const powerVariance = 0.28; // ±28%
    const resVariance = 0.35;   // ±35%
    const greenVariance = 0.40; // ±40%

    const laserPowerWatts = Math.round(basePower * (1 + delta * powerVariance));
    const resistanceReductionPct = Math.round(baseResReduction * (1 + delta * resVariance) * 10) / 10;
    const greenZoneBonusPct = Math.round(baseGreenZone * (1 + delta * greenVariance) * 10) / 10;

    const powerDeltaPct = Math.round(delta * powerVariance * 100);
    const resDeltaPct = Math.round(delta * resVariance * 100);
    const greenDeltaPct = Math.round(delta * greenVariance * 100);

    const statsSummary = `-${resistanceReductionPct}% Résistance (${resDeltaPct >= 0 ? '+' : ''}${resDeltaPct}%) | +${greenZoneBonusPct}% Fenêtre (${greenDeltaPct >= 0 ? '+' : ''}${greenDeltaPct}%) | ${laserPowerWatts.toLocaleString('fr-FR')} W (${powerDeltaPct >= 0 ? '+' : ''}${powerDeltaPct}%)`;

    return {
      compositeQuality: q,
      qualityTier: tier,
      deltaPct,
      valueMultiplier,
      baseStats: {
        laserPowerWatts: basePower,
        resistanceReductionPct: baseResReduction,
        greenZoneBonusPct: baseGreenZone
      },
      craftedStats: {
        laserPowerWatts,
        resistanceReductionPct,
        greenZoneBonusPct
      },
      statDeltas: {
        powerDeltaPct,
        resDeltaPct,
        greenDeltaPct
      },
      statsSummary
    };
  }

  // 2. MODULES LASERS DE MINAGE
  if (category === 'modules' || category.includes('module')) {
    const baseInstab = 40;
    const baseExtraction = 25;
    const instabVariance = 0.35;
    const extractVariance = 0.35;

    const instabReductionPct = Math.round(baseInstab * (1 + delta * instabVariance));
    const extractionSpeedBonusPct = Math.round(baseExtraction * (1 + delta * extractVariance));
    const chargesCount = q >= 900 ? 7 : (q >= 700 ? 6 : (q < 400 ? 3 : 5));

    const statsSummary = `-${instabReductionPct}% Instabilité | +${extractionSpeedBonusPct}% Extraction | ${chargesCount} Charges`;

    return {
      compositeQuality: q,
      qualityTier: tier,
      deltaPct,
      valueMultiplier,
      baseStats: { instabReductionPct: baseInstab, extractionSpeedBonusPct: baseExtraction, chargesCount: 5 },
      craftedStats: { instabReductionPct, extractionSpeedBonusPct, chargesCount },
      statDeltas: {
        instabDeltaPct: Math.round(delta * instabVariance * 100),
        extractDeltaPct: Math.round(delta * extractVariance * 100)
      },
      statsSummary
    };
  }

  // 3. ARMES DE VAISSEAU & FPS
  if (category === 'weapons' || category.includes('arme')) {
    const baseDps = 420;
    const dpsVariance = 0.25;
    const heatVariance = 0.30;

    const craftedDps = Math.round(baseDps * (1 + delta * dpsVariance));
    const heatDissipationBonusPct = Math.round(delta * heatVariance * 100);

    const statsSummary = `${craftedDps} DPS (${deltaPct >= 0 ? '+' : ''}${Math.round(delta * dpsVariance * 100)}%) | Refroidissement ${heatDissipationBonusPct >= 0 ? '+' : ''}${heatDissipationBonusPct}%`;

    return {
      compositeQuality: q,
      qualityTier: tier,
      deltaPct,
      valueMultiplier,
      baseStats: { dps: baseDps },
      craftedStats: { dps: craftedDps, heatBonusPct: heatDissipationBonusPct },
      statDeltas: { dpsDeltaPct: Math.round(delta * dpsVariance * 100) },
      statsSummary
    };
  }

  // 4. AUTRES COMPOSANTS (BOUCLIERS, PROPULSION, RECYCLAGE)
  const generalBonusPct = Math.round(delta * 25);
  const statsSummary = `Efficacité opérationnelle : ${generalBonusPct >= 0 ? '+' : ''}${generalBonusPct}% (${tier.name} · Q${q})`;

  return {
    compositeQuality: q,
    qualityTier: tier,
    deltaPct,
    valueMultiplier,
    baseStats: { efficiencyPct: 100 },
    craftedStats: { efficiencyPct: 100 + generalBonusPct },
    statDeltas: { generalBonusPct },
    statsSummary
  };
}

export const craftingService = {
  BLUEPRINT_CATEGORIES,
  resolveBlueprintCategory,

  /**
   * Obtenir l'ensemble du catalogue de blueprints officiels avec filtrage multi-catégories
   * @param {string|null} category - Identifiant ou libellé de catégorie
   */
  getBlueprints(category = null) {
    if (!category || category === 'all' || category === 'toutes') {
      return BLUEPRINTS;
    }
    const catLower = category.toLowerCase().trim();
    return BLUEPRINTS.filter(b => {
      const resolved = resolveBlueprintCategory(b);
      return (
        resolved.toLowerCase() === catLower ||
        (b.category && b.category.toLowerCase() === catLower) ||
        resolved.toLowerCase().includes(catLower)
      );
    });
  },

  /**
   * Trouver un blueprint par son identifiant
   * @param {string} id 
   */
  getBlueprintById(id) {
    return BLUEPRINTS.find(b => b.id === id) || null;
  },

  /**
   * Vérifier si le joueur a débloqué ce blueprint
   * @param {string} blueprintId 
   */
  isUnlocked(blueprintId) {
    const craftingState = store.get('crafting');
    return (craftingState.unlockedBlueprintIds || []).includes(blueprintId);
  },

  /**
   * Marquer un blueprint comme débloqué par le joueur
   * @param {string} blueprintId 
   */
  unlockBlueprint(blueprintId) {
    if (this.isUnlocked(blueprintId)) return false;

    store.set('crafting', prev => ({
      ...prev,
      unlockedBlueprintIds: [...(prev.unlockedBlueprintIds || []), blueprintId]
    }));

    eventBus.emit(EVENTS.BLUEPRINT_UNLOCKED, { blueprintId });
    return true;
  },

  /**
   * Verrouiller / retirer un blueprint
   * @param {string} blueprintId 
   */
  lockBlueprint(blueprintId) {
    store.set('crafting', prev => ({
      ...prev,
      unlockedBlueprintIds: (prev.unlockedBlueprintIds || []).filter(id => id !== blueprintId)
    }));
    return true;
  },

  /**
   * Construit une Map de stock { resourceCode -> totalSCU } pour calculs rapides
   * @param {string} ownerType - 'personal' ou 'guild' ou null
   */
  getStockMap(ownerType = 'personal') {
    const items = inventoryService.getItems({ ownerType: ownerType === 'all' ? null : ownerType });
    const stock = new Map();
    items.forEach(item => {
      const code = (item.code || '').toLowerCase();
      const current = stock.get(code) || 0;
      stock.set(code, current + (Number(item.quantitySCU) || Number(item.quantityUnits) || 0));
    });
    return stock;
  },

  /**
   * Obtenir le catalogue complet enrichi et trié par « proche du craft »
   * @param {Object} options - { category, search, filterKey, ownerType }
   */
  getRankedBlueprints(options = {}) {
    const ownerType = options.ownerType || 'personal';
    const stockMap = this.getStockMap(ownerType);
    let list = this.getBlueprints(options.category);

    const evaluated = list.map(bp => {
      const owned = this.isUnlocked(bp.id);
      const c = calculateCraftability(bp, stockMap);
      const status = getCraftStatus({ owned, maxQty: c.maxQty, missing: c.missing });
      return {
        ...bp,
        owned,
        maxQty: c.maxQty,
        missing: c.missing,
        status,
        closenessScore: closeness({ owned, maxQty: c.maxQty, missing: c.missing })
      };
    });

    // Tri « proche du craft »
    evaluated.sort((a, b) => a.closenessScore - b.closenessScore);
    return evaluated;
  },

  /**
   * Vérifier la disponibilité des ressources pour un blueprint (BOM Checker)
   * Compare les ingrédients requis avec l'inventaire actuel
   * @param {string} blueprintId 
   * @param {string} ownerType - 'personal' ou 'guild'
   * @param {number} multiplier - Nombre d'exemplaires à crafter
   */
  checkBOM(blueprintId, ownerType = 'personal', multiplier = 1) {
    const bp = this.getBlueprintById(blueprintId);
    if (!bp) {
      throw new Error(`Blueprint "${blueprintId}" introuvable.`);
    }

    const qtyMultiplier = Math.max(1, Number(multiplier) || 1);
    const stockMap = this.getStockMap(ownerType);

    const ingredientsAnalysis = (bp.materials || bp.ingredients || []).map(mat => {
      const resCode = (mat.mineralId || mat.itemId || mat.code || '').toLowerCase();
      const availableSCU = stockMap.get(resCode) || 0;
      const unitRequired = Number(mat.scu || mat.quantity || 1);
      const requiredSCU = Math.round(unitRequired * qtyMultiplier * 10) / 10;
      const isMet = availableSCU >= requiredSCU;
      const missingSCU = isMet ? 0 : Math.round((requiredSCU - availableSCU) * 10) / 10;
      const coveragePct = requiredSCU > 0 ? Math.min(100, Math.round((availableSCU / requiredSCU) * 100)) : 100;

      return {
        mineralId: resCode,
        name_fr: mat.name_fr || mat.name || resCode,
        name_en: mat.name_en || resCode,
        requiredSCU,
        availableSCU,
        missingSCU,
        coveragePct,
        isMet
      };
    });

    const isFullyCraftable = ingredientsAnalysis.every(ing => ing.isMet);
    const overallProgressPct = Math.round(
      ingredientsAnalysis.reduce((sum, ing) => sum + ing.coveragePct, 0) / (ingredientsAnalysis.length || 1)
    );

    // Calcul de la quantité maximale fabricable avec le stock actuel
    const craftable = calculateCraftability(bp, stockMap);

    return {
      blueprint: bp,
      isUnlocked: this.isUnlocked(blueprintId),
      isFullyCraftable,
      maxQty: craftable.maxQty,
      requestedQty: qtyMultiplier,
      overallProgressPct,
      ingredients: ingredientsAnalysis
    };
  },

  // Méthodes et référentiels de qualité exposés sur le service
  QUALITY_TIERS,
  getQualityTier,
  calculateCompositeQuality,
  calculateCraftedStats,

  /**
   * Exécuter la fabrication artisanale d'un blueprint en tenant compte de la qualité des matériaux
   * @param {string} blueprintId 
   * @param {string} ownerType - 'personal' ou 'guild'
   * @param {string} targetLocation - Emplacement de l'atelier
   * @param {number} quantity - Nombre d'unités à crafter
   * @param {Object} materialQualities - Map { resourceCode -> qualityRating (0-1000) }
   */
  executeCraft(blueprintId, ownerType = 'personal', targetLocation = 'ARC-L1 Wide Forest Station', quantity = 1, materialQualities = {}) {
    const qty = Math.max(1, Number(quantity) || 1);
    const bom = this.checkBOM(blueprintId, ownerType, qty);

    if (!bom.isFullyCraftable) {
      return {
        success: false,
        message: `Ressources insuffisantes pour crafter ×${qty}.`,
        missing: bom.ingredients.filter(i => !i.isMet)
      };
    }

    const bp = bom.blueprint;

    // 1. Déduction de chaque ingrédient multiplié par la quantité
    for (const ing of bom.ingredients) {
      inventoryService.consumeResource(ing.mineralId, ing.requiredSCU, ownerType);
    }

    // 2. Calcul de la qualité composite et des stats dynamiques
    const ingredientsWithQuality = bom.ingredients.map(ing => ({
      scu: ing.requiredSCU,
      quality: typeof materialQualities[ing.mineralId] === 'number'
        ? materialQualities[ing.mineralId]
        : (typeof materialQualities[ing.mineralId.toLowerCase()] === 'number' ? materialQualities[ing.mineralId.toLowerCase()] : 500)
    }));

    const compositeQuality = calculateCompositeQuality(ingredientsWithQuality);
    const tier = getQualityTier(compositeQuality);
    const statsAnalysis = calculateCraftedStats(bp, compositeQuality);

    // 3. Déterminer la catégorie d'article dans l'inventaire
    let itemCategory = 'crafted_laser';
    let subCategory = 'mining_laser';
    if (bp.category === 'modules') { itemCategory = 'crafted_module'; subCategory = 'mining_module'; }
    if (bp.category === 'weapons') { itemCategory = 'crafted_weapon'; subCategory = 'ship_weapon'; }
    if (bp.category === 'gadgets') { itemCategory = 'gadget'; subCategory = 'mining_gadget'; }
    if (bp.category === 'components' || bp.category === 'bouclier') { itemCategory = 'component'; subCategory = 'shield'; }

    // 4. Prix de référence catalogue de base
    let baseRefPrice = 145000;
    if (bp.category === 'modules') baseRefPrice = 38000;
    if (bp.category === 'weapons') baseRefPrice = 85000;
    if (bp.category === 'gadgets') baseRefPrice = 24000;
    if (bp.category === 'components') baseRefPrice = 65000;

    const estimatedValueUEC = Math.round(baseRefPrice * statsAnalysis.valueMultiplier);

    // 5. Création des objets dans l'inventaire unifié
    const craftedItem = inventoryService.addItem({
      category: itemCategory,
      subCategory,
      code: bp.id,
      name: `${bp.name} [Q${compositeQuality}]`,
      size: bp.size ? String(bp.size) : '1',
      grade: tier.id === 'masterwork' ? 'A+' : (tier.id === 'high' ? 'A' : (tier.id === 'enhanced' ? 'B' : (tier.id === 'standard' ? 'C' : 'D'))),
      quantitySCU: 0,
      quantityUnits: qty,
      ownerType,
      locationId: targetLocation,
      origin: 'crafted',
      craftBlueprintId: bp.id,
      materialQuality: compositeQuality,
      qualityTier: tier.id,
      qualityTierLabel: tier.name,
      catalogReferencePriceUEC: baseRefPrice,
      forSale: false,
      metadata: {
        tier: bp.tier || 3,
        materialQuality: compositeQuality,
        qualityTier: tier.id,
        qualityTierLabel: tier.name,
        qualityShortName: tier.shortName,
        valueMultiplier: statsAnalysis.valueMultiplier,
        craftStats: statsAnalysis.statsSummary,
        detailedStats: statsAnalysis.craftedStats,
        statDeltas: statsAnalysis.statDeltas,
        deltaPct: statsAnalysis.deltaPct,
        craftedAt: Date.now(),
        sourceBlueprintId: bp.id,
        craftedUnits: qty,
        estimatedValueUEC,
        notes: `Fabriqué avec matériaux ${tier.name} (Q${compositeQuality}/1000).`
      }
    });

    eventBus.emit(EVENTS.ITEM_CRAFTED, { blueprintId, item: craftedItem, quantity: qty, compositeQuality });

    return {
      success: true,
      item: craftedItem,
      quantity: qty,
      compositeQuality,
      qualityTier: tier,
      statsAnalysis,
      message: `Fabrication réussie : ${qty} × ${bp.name} (${tier.name} · Q${compositeQuality}) ajouté à l'inventaire !`
    };
  }
};

