// ============================================================================
// AARON MFD — MINING CALCULATOR & ARBITRAGE ENGINE
// Formules de fracturation, analyse économique (Brut vs Raffiné) et stations optimales
// ============================================================================

import { MINERALS, REFINING_METHODS, REFINERY_STATIONS, ROCK_ARCHETYPES, FRONTIER_MINEABLES, getFrontierPreset } from '../../data/index.js';
import { getLaser, getModule, getShip, totalScu } from '../fleet/fleet-service.js';

export { ROCK_ARCHETYPES, FRONTIER_MINEABLES, getFrontierPreset };

export const ROCK_ARCHETYPES_CONFIG = [
  {
    id: 'basalt',
    name: 'Basalte Volcanique',
    baseResistance: 55,
    baseInstability: 40,
    notes_fr: 'Roche volcanique dense et compacte, résistance thermique élevée'
  },
  {
    id: 'granite',
    name: 'Granite Continental',
    baseResistance: 45,
    baseInstability: 25,
    notes_fr: 'Roche magmatique grenue très homogène et stable sous laser'
  },
  {
    id: 'obsidian',
    name: 'Obsidienne Vitreuse',
    baseResistance: 35,
    baseInstability: 75,
    notes_fr: 'Verre volcanique à haute instabilité, très réactif aux chocs thermiques'
  },
  {
    id: 'gneiss',
    name: 'Gneiss Métamorphique',
    baseResistance: 40,
    baseInstability: 30,
    notes_fr: 'Roche rubanée métamorphique aux propriétés physiques équilibrées'
  },
  {
    id: 'felsic',
    name: 'Formation Felsique',
    baseResistance: 25,
    baseInstability: 20,
    notes_fr: 'Roche siliceuse claire docile et facile à fracturer'
  },
  {
    id: 'igneous',
    name: 'Roches Ignées',
    baseResistance: 50,
    baseInstability: 35,
    notes_fr: 'Roche magmatique refroidie à matrice minérale dense'
  },
  {
    id: 'quartzite',
    name: 'Quartzite Crystalline',
    baseResistance: 65,
    baseInstability: 20,
    notes_fr: 'Roche très dure et tenace nécessitant une haute puissance laser'
  },
  {
    id: 'shale',
    name: 'Schiste Fissile',
    baseResistance: 20,
    baseInstability: 45,
    notes_fr: 'Roche feuilletée très friable, faible résistance thermique'
  },
  {
    id: 'atacamite',
    name: 'Matrice d\'Atacamite',
    baseResistance: 30,
    baseInstability: 15,
    notes_fr: 'Matrice minérale hydratée très docile sous faisceau laser'
  },
  {
    id: 'pyroxenite',
    name: 'Pyroxénite Profonde (Pyro)',
    baseResistance: 70,
    baseInstability: 50,
    notes_fr: 'Roche mantellique ultra-dense typique de l\'environnement hostile de Pyro'
  },
  {
    id: 'cryo_ice',
    name: 'Glace Cryo (Astéroïde)',
    baseResistance: 15,
    baseInstability: 60,
    notes_fr: 'Matrice de glace pure hautement instable à bas point de fusion'
  }
];

/**
 * Construit la composition géologique Star Citizen 4.x (jusqu'à 3 minerais liés + le reste en inerte)
 */
export function buildRockComposition(mineral1Id, pct1, mineral2Id = null, pct2 = 0, mineral3Id = null, pct3 = 0) {
  const p1 = Math.max(0, Math.min(100, Number(pct1) || 0));
  const p2 = mineral2Id ? Math.max(0, Math.min(100 - p1, Number(pct2) || 0)) : 0;
  const p3 = mineral3Id ? Math.max(0, Math.min(100 - p1 - p2, Number(pct3) || 0)) : 0;
  const inertePct = Math.max(0, Math.round((100 - p1 - p2 - p3) * 10) / 10);

  const m1 = MINERALS.find(m => m.id === mineral1Id || m.name.toLowerCase() === (mineral1Id || '').toLowerCase()) || MINERALS[0];
  const comp = [
    {
      mineralId: m1.id,
      name: m1.name_fr || m1.name,
      pct: p1,
      color: m1.color || '#a855f7',
      isVolatile: Boolean(m1.isVolatile)
    }
  ];

  if (mineral2Id && p2 > 0) {
    const m2 = MINERALS.find(m => m.id === mineral2Id || m.name.toLowerCase() === (mineral2Id || '').toLowerCase());
    if (m2) {
      comp.push({
        mineralId: m2.id,
        name: m2.name_fr || m2.name,
        pct: p2,
        color: m2.color || '#38bdf8',
        isVolatile: Boolean(m2.isVolatile)
      });
    }
  }

  if (mineral3Id && p3 > 0) {
    const m3 = MINERALS.find(m => m.id === mineral3Id || m.name.toLowerCase() === (mineral3Id || '').toLowerCase());
    if (m3) {
      comp.push({
        mineralId: m3.id,
        name: m3.name_fr || m3.name,
        pct: p3,
        color: m3.color || '#facc15',
        isVolatile: Boolean(m3.isVolatile)
      });
    }
  }

  comp.push({
    mineralId: 'inert',
    name: 'Matériaux Inertes',
    pct: inertePct,
    color: '#3a4c63',
    isVolatile: false
  });

  return comp;
}

export const miningCalc = {
  ROCK_ARCHETYPES_CONFIG,
  FRONTIER_MINEABLES,
  getFrontierPreset,
  buildRockComposition,

  /**
   * Calculer les capacités minières et la puissance laser déployée par le vaisseau actif
   * @param {Object} activeShipEntry - Entrée du vaisseau actif de la flotte
   * @param {string} firingMode - 't1', 't1_t2', ou 'all'
   */
  computeShipMiningCapabilities(activeShipEntry, firingMode = 'all') {
    if (!activeShipEntry) {
      return {
        shipName: 'MISC Prospector',
        nickname: 'Prospector Standard',
        shipId: 'prospector',
        cargoSCU: 32,
        turretCount: 1,
        activeTurretCount: 1,
        totalPowerWatts: 1400,
        resistanceReductionPct: 0,
        instabilityModPct: 0,
        optimalWindowModPct: 0,
        turrets: [],
        isMultiTurret: false,
        firingMode: 'all'
      };
    }

    const ship = getShip(activeShipEntry.shipId);
    const cargoSCU = totalScu(ship) || 32;
    const rawTurrets = activeShipEntry.config?.turrets || [];
    const turretCount = ship?.laserSlots || rawTurrets.length || 1;

    let totalPowerWatts = 0;
    let totalResistanceReduction = 0;
    let totalInstabilityMod = 0;
    let totalOptimalWindowMod = 0;

    const parsedTurrets = rawTurrets.map((t, idx) => {
      const laser = getLaser(t.laserId);
      const basePower = laser?.power || (laser?.size === 2 ? 3150 : (laser?.size === 0 ? 600 : 1400));
      const baseResMod = Math.abs(laser?.resistanceMod ? (laser.resistanceMod * 100) : 0);
      const baseInstMod = laser?.instabilityMod ? (laser.instabilityMod * 100) : 0;
      const baseOptWin = laser?.optimalWindowMod ? (laser.optimalWindowMod * 100) : 0;

      let modResReduction = 0;
      let modPowerBoost = 0;
      let modInstMod = 0;
      let modOptWin = 0;

      (t.modules || []).forEach(modId => {
        const mod = getModule(modId);
        if (mod) {
          if (mod.resistanceMod) modResReduction += Math.abs(mod.resistanceMod * 100);
          if (mod.powerMod) modPowerBoost += (basePower * mod.powerMod);
          if (mod.instabilityMod) modInstMod += (mod.instabilityMod * 100);
          if (mod.optimalWindowMod) modOptWin += (mod.optimalWindowMod * 100);
        }
      });

      const turretPower = Math.round(basePower + modPowerBoost);
      const turretResRed = Math.round(baseResMod + modResReduction);

      const isFiring = firingMode === 'all' ||
                      (firingMode === 't1' && idx === 0) ||
                      (firingMode === 't1_t2' && idx < 2);

      if (isFiring) {
        totalPowerWatts += turretPower;
        totalResistanceReduction += turretResRed;
        totalInstabilityMod += (baseInstMod + modInstMod);
        totalOptimalWindowMod += (baseOptWin + modOptWin);
      }

      return {
        index: idx + 1,
        laserId: t.laserId,
        laserName: laser?.name || 'Laser standard',
        size: laser?.size || 1,
        modules: (t.modules || []).map(mId => getModule(mId)?.name || mId).filter(Boolean),
        operator: t.operator || (idx === 0 ? 'Pilote' : `Opérateur T${idx + 1}`),
        powerWatts: turretPower,
        resistanceReductionPct: turretResRed,
        isFiring
      };
    });

    if (totalPowerWatts <= 0) totalPowerWatts = 1400;

    return {
      shipName: ship?.name || 'Vaisseau Minier',
      nickname: activeShipEntry.nickname || ship?.name || 'Vaisseau actif',
      shipId: activeShipEntry.shipId,
      cargoSCU,
      turretCount,
      activeTurretCount: parsedTurrets.filter(t => t.isFiring).length,
      totalPowerWatts,
      resistanceReductionPct: Math.min(95, Math.round(totalResistanceReduction)),
      instabilityModPct: Math.round(totalInstabilityMod),
      optimalWindowModPct: Math.round(totalOptimalWindowMod),
      turrets: parsedTurrets,
      isMultiTurret: turretCount > 1,
      firingMode
    };
  },

  /**
   * Évaluation complète et dynamique d'un rocher face aux capacités du vaisseau actif
   */
  calculateLiveRockEvaluation(rock, shipCap) {
    const mass = Math.max(1, Number(rock.massKg) || 18420);
    const resistance = Math.max(0, Math.min(100, Number(rock.resistance) || 31));
    const instability = Math.max(0, Math.min(100, Number(rock.instability) || 42.6));

    // Résistance résiduelle après lasers et modules
    const effectiveResistance = Math.max(0, resistance - (shipCap?.resistanceReductionPct || 0));

    // Puissance nécessaire pour la zone verte
    const powerRequired = Math.round((mass * 0.95) * (1 + (effectiveResistance / 75)));
    const laserPower = shipCap?.totalPowerWatts || 1400;
    const powerRatio = Math.round((laserPower / powerRequired) * 100) / 100;

    // Solo vs Fleet chances
    const t1Power = shipCap?.turrets?.[0]?.powerWatts || laserPower;
    const t1ResRed = shipCap?.turrets?.[0]?.resistanceReductionPct || 0;
    const t1EffRes = Math.max(0, resistance - t1ResRed);
    const t1PowerReq = (mass * 0.95) * (1 + (t1EffRes / 75));
    const soloChancePct = Math.min(99, Math.max(8, Math.round((t1Power / t1PowerReq) * 88)));

    // Multi-laser ou multi-crew chance
    const fleetChancePct = Math.min(99, Math.max(soloChancePct, Math.round(Math.min(1.5, powerRatio) * 92)));

    let verdictLabel = 'Fleet conseillée';
    let verdictClass = 'amber';
    let verdictBadge = 'FRACTURE DIFFICILE';

    if (powerRatio >= 1.25) {
      verdictLabel = 'Fracture facile';
      verdictClass = 'green';
      verdictBadge = 'SURPUISSANCE';
    } else if (powerRatio >= 0.95) {
      verdictLabel = 'Solo faisable';
      verdictClass = 'green';
      verdictBadge = 'OPTIMAL';
    } else if (powerRatio >= 0.70) {
      verdictLabel = 'Fleet conseillée';
      verdictClass = 'amber';
      verdictBadge = 'TRÈS DIFFICILE';
    } else {
      verdictLabel = 'Fleet requise';
      verdictClass = 'red';
      verdictBadge = 'HORS DE PORTÉE';
    }

    const summaryText = `${shipCap?.nickname || 'Vaisseau'} seul : ${soloChancePct} % de chance · avec la fleet : ${fleetChancePct} %`;

    // Analyse économique et soute
    const refineryAnalysis = this.compareAllRefineryMethods({ massKg: mass, composition: rock.composition });
    const usefulSCU = refineryAnalysis.usefulSCU;
    const cargoSCU = shipCap?.cargoSCU || 32;
    const cargoFillPct = Math.min(100, Math.round((usefulSCU / cargoSCU) * 100));
    const cargoOverflow = usefulSCU > cargoSCU;

    // Évaluation approfondie de la rentabilité de fracture
    const profitability = this.evaluateRockProfitability({
      massKg: mass,
      composition: rock.composition,
      refineryAnalysis,
      powerRatio,
      shipCap
    });

    // Score de qualité du gisement (0 à 1 000, Star Citizen 4.0)
    const qualityScore = typeof rock.quality === 'number'
      ? Math.max(0, Math.min(1000, Math.round(rock.quality)))
      : (typeof rock.materialQuality === 'number' ? Math.max(0, Math.min(1000, Math.round(rock.materialQuality))) : 750);

    // Arbitrage stratégique basé sur la qualité : Garder pour Craft vs Vendre Brut vs Raffiner & Vendre
    const qualityArbitrage = this.evaluateMaterialQualityAndStrategicArbitrage({
      qualityScore,
      usefulSCU,
      bestRefinedNet: profitability.bestRefinedNet,
      rawGrossUEC: profitability.rawGrossUEC,
      composition: rock.composition,
      hasQuantanium: refineryAnalysis.hasQuantanium
    });

    return {
      massKg: mass,
      resistance,
      effectiveResistance: Math.round(effectiveResistance * 10) / 10,
      instability,
      powerRequiredWatts: powerRequired,
      laserPowerWatts: laserPower,
      powerRatio,
      verdictLabel,
      verdictClass,
      verdictBadge,
      summaryText,
      soloChancePct,
      fleetChancePct,
      usefulSCU,
      cargoSCU,
      cargoFillPct,
      cargoOverflow,
      rawGrossUEC: refineryAnalysis.rawGrossUEC,
      quantaniumRisk: refineryAnalysis.quantaniumRisk,
      refineryMethods: refineryAnalysis.methods,
      profitability,
      qualityScore,
      qualityArbitrage
    };
  },

  /**
   * Arbitrage stratégique d'un gisement selon la qualité des matériaux (Star Citizen 4.0)
   * Guide le joueur : Garder pour le Craft (overclocking) vs Vendre Brut vs Raffiner & Vendre
   * @param {Object} params - { qualityScore, usefulSCU, bestRefinedNet, rawGrossUEC, composition, hasQuantanium }
   */
  evaluateMaterialQualityAndStrategicArbitrage({ qualityScore, usefulSCU, bestRefinedNet, rawGrossUEC, composition, hasQuantanium }) {
    const q = Math.max(0, Math.min(1000, Number(qualityScore) || 500));
    const netDelta = bestRefinedNet - rawGrossUEC;
    const marginPct = rawGrossUEC > 0 ? Math.round((netDelta / rawGrossUEC) * 100) : 0;

    let tierId = 'standard';
    let tierName = 'Standard Usine';
    let tierShort = 'Standard';
    let tierBadgeClass = 'quality-standard';
    let statBonus = '+0 % (Standard Usine)';
    let statBonusPct = 0;

    if (q >= 900) {
      tierId = 'masterwork';
      tierName = '⭐ Maître-Ouvrier / Prototype';
      tierShort = '⭐ Maître';
      tierBadgeClass = 'quality-masterwork';
      statBonusPct = Math.round(28 + 17 * ((q - 900) / 100));
      statBonus = `+${statBonusPct} % aux statistiques de craft (Overclock Prototype)`;
    } else if (q >= 750) {
      tierId = 'high';
      tierName = 'Haute Qualité Industrielle';
      tierShort = 'Haute Qualité';
      tierBadgeClass = 'quality-high';
      statBonusPct = Math.round(15 + 13 * ((q - 750) / 150));
      statBonus = `+${statBonusPct} % aux statistiques de craft (Surcadençage Haute Précision)`;
    } else if (q >= 600) {
      tierId = 'enhanced';
      tierName = 'Supérieur / Militaire';
      tierShort = 'Supérieur';
      tierBadgeClass = 'quality-enhanced';
      statBonusPct = Math.round(5 + 10 * ((q - 600) / 150));
      statBonus = `+${statBonusPct} % aux statistiques de craft (Spécification Militaire)`;
    } else if (q >= 400) {
      tierId = 'standard';
      tierName = 'Standard Usine';
      tierShort = 'Standard';
      tierBadgeClass = 'quality-standard';
      statBonusPct = Math.round(-5 + 10 * ((q - 400) / 200));
      statBonus = `${statBonusPct >= 0 ? '+' : ''}${statBonusPct} % (Rendement Usine Standard)`;
    } else {
      tierId = 'low';
      tierName = 'Rebut / Basse Qualité';
      tierShort = 'Basse Qualité';
      tierBadgeClass = 'quality-low';
      statBonusPct = Math.round(-25 + 20 * (q / 400));
      statBonus = `${statBonusPct} % (Malus Matériau Dégradé)`;
    }

    // Détermination de la recommandation stratégique
    let decision = 'craft';
    let badgeText = '⭐ GARDER POUR LE CRAFT';
    let badgeClass = 'green';
    let icon = '🛠️';
    let title = 'CONSERVER POUR LA FABRICATION D\'ÉQUIPEMENTS';
    let rationale = '';

    if (q >= 750) {
      decision = 'craft';
      badgeText = q >= 900 ? '⭐ MAÎTRE : CONSERVER EN PRIORITÉ' : '⭐ HAUTE QUALITÉ : GARDER CRAFT';
      badgeClass = 'green';
      icon = '🛠️';
      title = 'GARDER EN STOCK D\'ATELIER POUR LE CRAFT';
      rationale = `Ce filon possède une note de qualité rare de Q${q} (${tierName}). En le conservant dans votre inventaire, vous pourrez forger des têtes laser, boucliers et modules de minage hautement surcadencés (${statBonus}). Vendre ce lot au cours standard reviendrait à brader un matériau d'exception.`;
    } else if (q >= 600) {
      if (netDelta >= 25000 && marginPct >= 20) {
        decision = 'refine_and_sell';
        badgeText = '💎 RAFFINER PUIS VENDRE';
        badgeClass = 'cyan';
        icon = '🏭';
        title = 'RAFFINAGE OPTIMAL AVANT REVENTE';
        rationale = `Matériau supérieur (Q${q}). La plus-value nette en raffinerie (+${netDelta.toLocaleString('fr-FR')} aUEC · +${marginPct} %) offre un excellent retour sur investissement. Vous pouvez aussi choisir d'en garder une partie pour vos crafts militaires.`;
      } else {
        decision = 'craft';
        badgeText = '🛠️ INTÉRESSANT POUR LE CRAFT';
        badgeClass = 'green';
        icon = '🛠️';
        title = 'GARDER POUR CRAFT DE GRADE MILITAIRE';
        rationale = `Grade supérieur (Q${q} · ${statBonus}). Recommandé à conserver si vous assemblez prochainement des équipements renforcés pour la flotte.`;
      }
    } else if (netDelta >= 15000 && marginPct >= 15) {
      decision = 'refine_and_sell';
      badgeText = '🏭 RAFFINER AVANT VENTE';
      badgeClass = 'cyan';
      icon = '🏭';
      title = 'VENDRE APRÈS RAFFINAGE (PLAFOND DE GAIN)';
      rationale = `Qualité standard (Q${q}). Aucun intérêt majeur à bloquer ce lot pour le craft. Le passage en raffinerie maximise votre profit financier net (+${netDelta.toLocaleString('fr-FR')} aUEC de plus-value par rapport à la vente brute).`;
    } else {
      decision = 'sell_raw';
      badgeText = '💰 VENDRE BRUT IMMÉDIATEMENT';
      badgeClass = 'amber';
      icon = '💰';
      title = 'VENDRE BRUT SANS ATTENDRE';
      rationale = `Qualité courante (Q${q}). Le gain additionnel du raffinage est trop faible pour justifier les frais et le temps d'attente. Vendez immédiatement au comptoir brut pour empocher +${rawGrossUEC.toLocaleString('fr-FR')} aUEC cash et libérer la soute.`;
    }

    return {
      qualityScore: q,
      tierId,
      tierName,
      tierShort,
      tierBadgeClass,
      statBonus,
      statBonusPct,
      decision,
      badgeText,
      badgeClass,
      icon,
      title,
      rationale,
      actions: {
        keepForCraft: {
          label: 'Garder pour le Craft',
          desc: `Stocker en inventaire réservé atelier (Q${q})`,
          badge: `⭐ Q${q}`
        },
        sellRaw: {
          label: 'Vendre Brut Immédiatement',
          desc: 'Vente directe au comptoir marchandise (sans frais ni délai)',
          revenueUEC: rawGrossUEC
        },
        refineAndSell: {
          label: 'Raffiner & Vendre',
          desc: 'Raffinage Dinyx et vente optimale au cours raffiné',
          revenueUEC: bestRefinedNet,
          netDeltaUEC: netDelta
        }
      }
    };
  },

  /**
   * Évalue précisément la rentabilité économique d'un rocher et sa pertinence de fracture
   * @param {Object} params - { massKg, composition, refineryAnalysis, powerRatio, shipCap }
   */
  evaluateRockProfitability({ massKg, composition, refineryAnalysis, powerRatio, shipCap }) {
    const usefulSCU = refineryAnalysis?.usefulSCU || 0;
    const rawGrossUEC = refineryAnalysis?.rawGrossUEC || 0;
    const hasQuantanium = Boolean(refineryAnalysis?.hasQuantanium);

    // Meilleur gain net en raffinage (ou vente brute si aucun minerai)
    const bestMethod = (refineryAnalysis?.methods || []).find(m => m.highlight) || refineryAnalysis?.methods?.[0];
    const bestRefinedNet = bestMethod ? bestMethod.net : rawGrossUEC;

    // Rentabilité unitaire par SCU de minerai utile
    const unitValuePerSCU = usefulSCU > 0 ? Math.round(bestRefinedNet / usefulSCU) : 0;

    // Détection des minerais nobles et des pourcentages
    const comp = composition || [];
    const quantaniumItem = comp.find(c => c.mineralId === 'quantainium' || c.name.toLowerCase().includes('quanta'));
    const quantaniumPct = quantaniumItem ? quantaniumItem.pct : 0;

    // Minerais Tier S / Pyro
    const tierSItem = comp.find(c => {
      const min = MINERALS.find(m => m.id === c.mineralId);
      return min && min.rarity === 'tier-s' && min.id !== 'quantainium';
    });

    // Minerais Tier A (Bexalite, Taranite, Borase, Laranite, Platine, Agricium)
    const tierAItem = comp.find(c => {
      const min = MINERALS.find(m => m.id === c.mineralId);
      return min && min.rarity === 'tier-a';
    });

    // Minerais Tier B (Hephaestanite, Gold, Titanium)
    const tierBItem = comp.find(c => {
      const min = MINERALS.find(m => m.id === c.mineralId);
      return min && (min.rarity === 'tier-b' || min.id === 'gold' || min.id === 'hephaestanite');
    });

    // Pureté totale utile
    const purityPct = Math.round(comp.reduce((acc, c) => (c.mineralId !== 'inert' ? acc + (Number(c.pct) || 0) : acc), 0) * 10) / 10;

    // Calcul du score de rentabilité (0 à 100)
    const gainPoints = Math.min(50, Math.round((bestRefinedNet / 150000) * 50));
    const unitPoints = Math.min(30, Math.round((unitValuePerSCU / 25000) * 30));
    const purityPoints = Math.min(20, Math.round((purityPct / 50) * 20));
    let profitScore = Math.min(99, Math.max(5, gainPoints + unitPoints + purityPoints));

    let status = 'good'; // 'great', 'good', 'meh', 'bad'
    let decision = 'FRACTURER'; // 'FRACTURER', 'SITUATIONNEL', 'IGNORER'
    let title = 'RENTABLE — FRACTURE CONSEILLÉE';
    let badgeText = 'GO FRACTURE';
    let badgeClass = 'green';
    let icon = '💎';
    let desc = '';
    let isProfitable = true;

    // 1. Gisement avec Quantainium
    if (hasQuantanium && quantaniumPct > 0) {
      if (quantaniumPct >= 12 || bestRefinedNet >= 100000) {
        status = 'great';
        decision = 'FRACTURER';
        title = 'TRÈS RENTABLE — FRACTURE PRIORITAIRE';
        badgeText = '💎 GO PRIORITAIRE';
        badgeClass = 'green';
        icon = '💎';
        desc = `Filon d'exception à très haute teneur en Quantainium (${quantaniumPct} %). Gain net raffiné estimé à +${bestRefinedNet.toLocaleString('fr-FR')} aUEC (${unitValuePerSCU.toLocaleString('fr-FR')} aUEC / SCU utile). Extraction hautement prioritaire (minuteur de dégradation 15 min actif dès extraction).`;
        profitScore = Math.max(88, profitScore);
      } else if (quantaniumPct >= 6 && bestRefinedNet >= 30000) {
        status = 'good';
        decision = 'FRACTURER';
        title = 'RENTABLE — EXTRACTION VALABLE';
        badgeText = '✅ GO RENTABLE';
        badgeClass = 'green';
        icon = '⚡';
        desc = `Teneur honorable en Quantainium (${quantaniumPct} % · ~${usefulSCU} SCU utiles). Rentable à extraire si votre soute est disponible.`;
        profitScore = Math.max(68, profitScore);
      } else {
        status = 'bad';
        decision = 'IGNORER';
        title = 'PEU RENTABLE — TROP DE DÉCHETS';
        badgeText = '⛔ SKIP / TROP D\'INERTE';
        badgeClass = 'red';
        icon = '⚠️';
        desc = `Seulement ${quantaniumPct} % de Quantainium avec ${Math.round(100 - purityPct)} % d'inertes. Le faible volume de gain ne justifie pas le risque de transport instable.`;
        profitScore = Math.min(35, profitScore);
        isProfitable = false;
      }
    } else if (tierSItem || (tierAItem && (tierAItem.pct >= 18 || bestRefinedNet >= 80000))) {
      // 2. Minerais Tier S exotiques ou Tier A abondant
      status = 'great';
      decision = 'FRACTURER';
      title = 'TRÈS RENTABLE — FRACTURE RECOMMANDÉE';
      badgeText = '💎 GO EXCELLENT';
      badgeClass = 'green';
      icon = '🔥';
      const mainName = tierSItem?.name || tierAItem?.name || 'Minerai précieux';
      desc = `Gisement riche en ${mainName} (${(tierSItem || tierAItem).pct} %). Très forte marge marchande (+${bestRefinedNet.toLocaleString('fr-FR')} aUEC net après raffinage).`;
      profitScore = Math.max(82, profitScore);
    } else if (bestRefinedNet >= 35000 || (tierAItem && tierAItem.pct >= 8) || (tierBItem && tierBItem.pct >= 20)) {
      // 3. Minerais nobles intermédiaires ou valeur marchande décente
      status = 'good';
      decision = 'FRACTURER';
      title = 'RENTABLE — BON FILON';
      badgeText = '✅ GO CONSEILLÉ';
      badgeClass = 'green';
      icon = '💰';
      const oreName = tierAItem?.name || tierBItem?.name || comp[0]?.name || 'Minerai utile';
      desc = `Concentration satisfaisante en ${oreName} (~${usefulSCU} SCU utiles). Rentable pour remplir la soute et rentabiliser votre rotation (+${bestRefinedNet.toLocaleString('fr-FR')} aUEC net).`;
      profitScore = Math.max(60, profitScore);
    } else if (bestRefinedNet >= 15000 || purityPct >= 20) {
      // 4. Rentabilité modérée / situationnelle
      status = 'meh';
      decision = 'SITUATIONNEL';
      title = 'RENTABILITÉ MOYENNE — OPPORTUNITÉ';
      badgeText = '⚠️ OPPORTUNITÉ';
      badgeClass = 'amber';
      icon = '📦';
      desc = `Marge nette modeste (+${bestRefinedNet.toLocaleString('fr-FR')} aUEC). À fracturer uniquement si votre soute est vide ou en l'absence de meilleur filon dans la zone.`;
      profitScore = Math.max(40, Math.min(59, profitScore));
    } else {
      // 5. Non rentable / Inerte massif / Minerais pauvres
      status = 'bad';
      decision = 'IGNORER';
      title = 'NON RENTABLE — PASSER CE ROCHER';
      badgeText = '⛔ SKIP / NON RENTABLE';
      badgeClass = 'red';
      icon = '⛔';
      desc = `Rocher pauvre (${Math.round(100 - purityPct)} % inerte / minerais à très faible valeur). Gain net négligeable (+${bestRefinedNet.toLocaleString('fr-FR')} aUEC). Ignorez ce rocher pour préserver votre temps de jeu et votre soute.`;
      profitScore = Math.min(35, profitScore);
      isProfitable = false;
    }

    // Diagnostic tactique croisé : Rentabilité Économique + Faisabilité Laser du vaisseau
    let tacticalDiagnostic = '';
    const ratio = Number(powerRatio) || 1.0;
    if (isProfitable) {
      if (ratio >= 0.95) {
        tacticalDiagnostic = 'Rentable & Solo faisable (Laser OK)';
      } else if (ratio >= 0.70) {
        tacticalDiagnostic = 'Rentable mais laser limite (Surge ou Ailier)';
      } else {
        tacticalDiagnostic = 'Rentable mais TROP DUR solo (Gadget Sabir ou MOLE requis)';
      }
    } else {
      if (ratio >= 0.95) {
        tacticalDiagnostic = 'Fracture facile mais INUTILE (Gain trop faible)';
      } else {
        tacticalDiagnostic = 'Inutile & Roche trop dure (Skip total)';
      }
    }

    return {
      status,
      decision,
      title,
      badgeText,
      badgeClass,
      icon,
      desc,
      profitScore,
      isProfitable,
      bestRefinedNet,
      rawGrossUEC,
      unitValuePerSCU,
      tacticalDiagnostic
    };
  },
  /**
   * Calculer la faisabilité de fracture d'un rocher
   * @param {Object} rock - { massKg, resistance, instability }
   * @param {Object} laserConfig - { totalPowerWatts, resistanceReductionPct }
   */
  calculateFractureFeasibility(rock, laserConfig) {
    const mass = Math.max(1, Number(rock.massKg) || 5000);
    const baseResistance = Math.max(0, Math.min(100, Number(rock.resistance) || 0));
    const instability = Math.max(0, Math.min(100, Number(rock.instability) || 0));

    const laserPower = Math.max(100, Number(laserConfig.totalPowerWatts) || 1400);
    const reduction = Math.max(0, Number(laserConfig.resistanceReductionPct) || 0);

    // Résistance résiduelle après atténuation par les lasers Lancet et modules
    const effectiveResistance = Math.max(0, baseResistance - reduction);

    // Estimation de l'énergie nécessaire pour entrer dans la zone verte
    // Formule calibrée sur les comportements de Star Citizen 4.0
    const powerRequired = (mass * 0.95) * (1 + (effectiveResistance / 75));
    const powerRatio = laserPower / powerRequired;

    let verdict = 'impossible';
    let label_fr = 'IMPOSSIBLE';
    let label_en = 'IMPOSSIBLE';
    let advice_fr = 'Puissance insuffisante. Combinez plusieurs lasers ou posez un gadget Sabir/Optimax.';
    let advice_en = 'Insufficient power. Combine multiple lasers or place a Sabir/Optimax gadget.';

    if (powerRatio >= 1.25) {
      verdict = 'easy';
      label_fr = 'FRACTURE FACILE';
      label_en = 'EASY BREAK';
      advice_fr = 'Puissance excédentaire. Attention aux montées en surchauffe rapide.';
      advice_en = 'Excess power. Beware of rapid catastrophic overheating.';
    } else if (powerRatio >= 0.95) {
      verdict = 'optimal';
      label_fr = 'FRACTURE POSSIBLE';
      label_en = 'FEASIBLE';
      advice_fr = 'Équilibre parfait. Maintenez le laser stable dans la fenêtre verte.';
      advice_en = 'Ideal balance. Keep laser steady inside the green window.';
    } else if (powerRatio >= 0.70) {
      verdict = 'hard';
      label_fr = 'TRÈS DIFFICILE';
      label_en = 'DIFFICULT';
      advice_fr = 'Fracturation lente. Nécessite des modules Surge/Stampede ou un ailier.';
      advice_en = 'Slow fracturing. Requires Surge/Stampede modules or an escort wingman.';
    }

    return {
      verdict,
      label_fr,
      label_en,
      advice_fr,
      advice_en,
      powerRatio: Math.round(powerRatio * 100) / 100,
      effectiveResistance: Math.round(effectiveResistance * 10) / 10,
      powerRequiredWatts: Math.round(powerRequired),
      laserPowerWatts: Math.round(laserPower)
    };
  },

  /**
   * Calcul de faisabilité comparative Solo vs Escadre (idée aaron-mfd/src/screens/MinageScreen.js)
   * @param {Object} rock - { massKg, resistance, instability }
   */
  calculateSoloVsFleetFeasibility(rock) {
    const mass = Math.max(1, Number(rock.massKg) || 18420);
    const resistance = Math.max(0, Math.min(100, Number(rock.resistance) || 31));

    // Puissance requise théorique
    const powerRequired = (mass * 0.95) * (1 + (resistance / 75));

    // Solo Prospector avec Helix II (3 150 W, -35% rés)
    const soloPower = 3150;
    const soloEffRes = Math.max(0, resistance - 35);
    const soloPowerReq = (mass * 0.95) * (1 + (soloEffRes / 75));
    const soloRatio = soloPower / soloPowerReq;
    const soloChancePct = Math.min(99, Math.max(10, Math.round(soloRatio * 85)));

    // Multi-crew avec +1 MOLE (3 150 + 4 200 + 4 200 = 11 550 W)
    const fleetPower = 11550;
    const fleetEffRes = Math.max(0, resistance - 65);
    const fleetPowerReq = (mass * 0.95) * (1 + (fleetEffRes / 75));
    const fleetRatio = fleetPower / fleetPowerReq;
    const fleetChancePct = Math.min(99, Math.max(50, Math.round(fleetRatio * 90)));

    const isFleetRecommended = soloChancePct < 75;

    return {
      verdictLabel: isFleetRecommended ? 'Fleet conseillée' : 'Solo faisable',
      verdictClass: isFleetRecommended ? 'amber' : 'green',
      soloChancePct,
      fleetChancePct,
      summaryText: `Prospector seul : ${soloChancePct} % de chance · avec 1 MOLE : ${fleetChancePct} %`
    };
  },

  /**
   * Comparaison simultanée de toutes les méthodes de raffinage vs vente brute (idée aaron-mfd)
   * @param {Object} scan - { massKg, composition: [{ name, pct, mineralId }] }
   */
  compareAllRefineryMethods(scan) {
    // Calcul du minerai utile total en SCU et valeur brute
    const mass = Number(scan.massKg) || 18420;
    const comp = scan.composition || [
      { name: 'Quantanium', pct: 24, mineralId: 'quantainium' },
      { name: 'Laranite', pct: 18, mineralId: 'laranite' },
      { name: 'Copper', pct: 11, mineralId: 'copper' },
      { name: 'Inerte', pct: 47, mineralId: 'inert' }
    ];

    let totalUsefulSCU = 0;
    let rawGrossUEC = 0;
    let refinedGrossUEC = 0;
    let hasQuantanium = false;

    comp.forEach(item => {
      if (item.mineralId === 'inert' || item.name.toLowerCase().includes('inerte')) return;
      if (item.name.toLowerCase().includes('quanta') || item.mineralId === 'quantainium') {
        hasQuantanium = true;
      }
      const mineral = MINERALS.find(m => m.id === item.mineralId) || { rawPrice: 40, refinedPrice: 85, density: 2.2 };
      const mineralSCU = Math.round(((mass * (item.pct / 100)) / ((mineral.density || 2.0) * 100)) * 10) / 10;
      totalUsefulSCU += mineralSCU;
      rawGrossUEC += mineralSCU * (mineral.rawPrice || 40) * 100;
      refinedGrossUEC += mineralSCU * (mineral.refinedPrice || (mineral.rawPrice * 2.1)) * 100;
    });

    totalUsefulSCU = Math.round(totalUsefulSCU * 10) / 10;
    rawGrossUEC = Math.round(rawGrossUEC);

    // Coûts et durées calculés dynamiquement selon le volume de minerai utile (SCU)
    const dinyxCost = totalUsefulSCU > 0 ? Math.max(300, Math.round(totalUsefulSCU * 190)) : 0;
    const ferronCost = totalUsefulSCU > 0 ? Math.max(400, Math.round(totalUsefulSCU * 320)) : 0;
    const cormackCost = totalUsefulSCU > 0 ? Math.max(500, Math.round(totalUsefulSCU * 450)) : 0;

    const dinyxDuration = totalUsefulSCU > 0 ? `${Math.max(1, Math.floor(totalUsefulSCU * 0.55))} h ${Math.round((totalUsefulSCU * 33) % 60).toString().padStart(2, '0')}` : '0 h 00';
    const ferronDuration = totalUsefulSCU > 0 ? `${Math.max(0, Math.floor(totalUsefulSCU * 0.22))} h ${Math.round((totalUsefulSCU * 13) % 60).toString().padStart(2, '0')}` : '0 h 00';
    const cormackDuration = totalUsefulSCU > 0 ? `${Math.max(0, Math.floor(totalUsefulSCU * 0.11))} h ${Math.round((totalUsefulSCU * 7) % 60).toString().padStart(2, '0')}` : '0 h 00';

    const dinyxNet = totalUsefulSCU > 0 ? Math.max(0, Math.round(refinedGrossUEC * 0.93 - dinyxCost)) : 0;
    const ferronNet = totalUsefulSCU > 0 ? Math.max(0, Math.round(refinedGrossUEC * 0.88 - ferronCost)) : 0;
    const cormackNet = totalUsefulSCU > 0 ? Math.max(0, Math.round(refinedGrossUEC * 0.84 - cormackCost)) : 0;

    // Les 3 méthodes majeures de raffinage
    const methods = [
      {
        option: 'Raffiner · Dinyx Solventation',
        location: 'CRU-L1',
        yieldPct: 93,
        durationText: dinyxDuration,
        cost: -dinyxCost,
        net: dinyxNet,
        tag: 'Meilleur',
        tagClass: 'green',
        highlight: true
      },
      {
        option: 'Raffiner · Ferron Exchange',
        location: 'ARC-L1',
        yieldPct: 88,
        durationText: ferronDuration,
        cost: -ferronCost,
        net: ferronNet,
        tag: 'Rapide',
        tagClass: 'cyan',
        highlight: false
      },
      {
        option: 'Raffiner · Cormack',
        location: 'HUR-L2',
        yieldPct: 84,
        durationText: cormackDuration,
        cost: -cormackCost,
        net: cormackNet,
        tag: '',
        tagClass: '',
        highlight: false
      },
      {
        option: 'Vendre brut',
        location: 'ARC-L1',
        yieldPct: 100,
        durationText: 'Immédiat',
        cost: 0,
        net: rawGrossUEC,
        tag: '',
        tagClass: '',
        highlight: false
      }
    ];

    return {
      usefulSCU: totalUsefulSCU,
      rawGrossUEC,
      hasQuantanium,
      quantaniumRisk: hasQuantanium ? {
        label: 'Instable',
        class: 'red',
        sub: 'à vendre ou raffiner sous ~15 min'
      } : {
        label: 'Stable',
        class: 'green',
        sub: 'minerai non volatil'
      },
      methods
    };
  },

  /**
   * Arbitrage économique classique : Comparaison détaillée Vente Brute vs Raffinage
   * @param {Object} scan - { massKg, mineralId, orePercentage }
   * @param {string} methodId - 'dinyx', 'cormack', 'ferron', 'gencore'
   * @param {string} stationName - Station de raffinage visée
   */
  calculateOreArbitrage(scan, methodId = 'dinyx', stationName = 'ARC-L1') {
    const mineral = MINERALS.find(m => m.id === scan.mineralId) || MINERALS[0];
    const method = REFINING_METHODS.find(m => m.id === methodId) || REFINING_METHODS[0];

    const mass = Number(scan.massKg) || 5000;
    const orePct = Math.max(0.1, Math.min(100, Number(scan.orePercentage) || 30.0));
    const density = mineral.density || 2.0;

    const rawVolumeSCU = Math.round(((mass * (orePct / 100)) / (density * 100)) * 10) / 10;
    const rawPricePerSCU = (mineral.rawPrice || 50) * 100;
    const rawTotalValueUEC = Math.round(rawVolumeSCU * rawPricePerSCU);

    let stationBonusPct = 0;
    const station = REFINERY_STATIONS.find(s => s.name.toLowerCase().includes(stationName.toLowerCase()));
    if (station && station.bonuses && station.bonuses[mineral.id]) {
      stationBonusPct = station.bonuses[mineral.id];
    }

    const methodYieldPct = (method.yieldPercent || 90) + stationBonusPct;
    const refinedVolumeSCU = Math.round((rawVolumeSCU * (methodYieldPct / 100)) * 10) / 10;
    const refinedPricePerSCU = (mineral.refinedPrice || 100) * 100;
    const grossRefinedValueUEC = Math.round(refinedVolumeSCU * refinedPricePerSCU);

    const refiningCostUEC = Math.round(rawVolumeSCU * (method.costPerSCU || 250));
    const netRefinedValueUEC = grossRefinedValueUEC - refiningCostUEC;

    const netProfitDeltaUEC = netRefinedValueUEC - rawTotalValueUEC;
    const profitIncreasePct = rawTotalValueUEC > 0 ? Math.round((netProfitDeltaUEC / rawTotalValueUEC) * 100) : 0;
    const shouldRefine = netProfitDeltaUEC > 15000 && profitIncreasePct > 20;

    let bestStationName = 'ARC-L1 Wide Forest';
    let maxBonus = -999;
    REFINERY_STATIONS.forEach(st => {
      const b = (st.bonuses && st.bonuses[mineral.id]) || 0;
      if (b > maxBonus) {
        maxBonus = b;
        bestStationName = st.name;
      }
    });

    return {
      mineralName: mineral.name,
      rawVolumeSCU,
      rawTotalValueUEC,
      methodYieldPct,
      refinedVolumeSCU,
      refiningCostUEC,
      netRefinedValueUEC,
      netProfitDeltaUEC,
      profitIncreasePct,
      shouldRefine,
      recommendedStation: bestStationName,
      stationBonusPct: maxBonus,
      verdict_fr: shouldRefine
        ? `Raffiner recommandé : Gain net de +${netProfitDeltaUEC.toLocaleString()} aUEC (+${profitIncreasePct}%) à ${bestStationName}`
        : `Vente brute conseillée : Raffinage peu rentable pour ce lot (+${netProfitDeltaUEC.toLocaleString()} aUEC)`
    };
  }
};

