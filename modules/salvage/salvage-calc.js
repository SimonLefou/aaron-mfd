// Moteur de calcul tactique et économique de Salvage & Démantèlement (Star Citizen 4.0+)
import { SALVAGE_SHIPS, SALVAGE_SCRAPERS, SALVAGE_WRECKS, SALVAGE_COMMODITIES } from '../../data/game/salvage.js';

/**
 * Calcule le rendement d'extraction de RMC et de Matériaux de Construction d'une épave
 */
export function calculateSalvageYield({
  wreckId = 'wreck_cutlass_black',
  hullIntegrity = 85,
  scraperId = 'abrade_s1',
  shipId = 'vulture',
  customRmcPrice = null,
  customCmPrice = null
}) {
  const wreck = SALVAGE_WRECKS.find(w => w.id === wreckId) || SALVAGE_WRECKS[0];
  const scraper = SALVAGE_SCRAPERS.find(s => s.id === scraperId) || SALVAGE_SCRAPERS[0];
  const ship = SALVAGE_SHIPS.find(s => s.id === shipId) || SALVAGE_SHIPS[0];

  const rmcCommodity = SALVAGE_COMMODITIES.find(c => c.id === 'rmc');
  const cmCommodity = SALVAGE_COMMODITIES.find(c => c.id === 'construction_materials');

  const rmcPrice = customRmcPrice || (rmcCommodity ? rmcCommodity.basePriceAuec : 14200);
  const cmPrice = customCmPrice || (cmCommodity ? cmCommodity.basePriceAuec : 7200);

  // Intégrité de la coque (0 à 100%)
  const integrityFactor = Math.max(0.1, Math.min(1.0, hullIntegrity / 100));

  // Rendement RMC tenant compte de l'efficacité de la tête et du nombre de têtes actives
  const scraperEfficiency = scraper.efficiencyPct / 100;
  const numScrapers = Math.max(1, ship.scraperSlots || 1);
  const rmcSCU = Number((wreck.potentialRMC * integrityFactor * scraperEfficiency).toFixed(2));

  // Rendement Construction Materials (CM) via fracturation structurelle
  const hasClaw = ship.clawDisintegration || ship.id === 'reclaimer';
  const cmEfficiency = hasClaw ? 1.0 : 0.82; // Le Reclaimer a 100% d'efficacité de broyage, les autres un peu moins
  const cmSCU = Number((wreck.potentialCM * integrityFactor * cmEfficiency).toFixed(2));

  // Estimation du temps de grattage (en minutes)
  const combinedScrapingSpeed = (scraper.speedScuMin || 0.9) * numScrapers;
  const estimatedScrapingMinutes = Number((rmcSCU / combinedScrapingSpeed).toFixed(1));

  // Valorisation financière brute
  const revenueRMC = Math.round(rmcSCU * rmcPrice);
  const revenueCM = Math.round(cmSCU * cmPrice);
  const totalRevenue = revenueRMC + revenueCM;

  // Analyse de la capacité de soute & du buffer
  const bufferSCU = ship.bufferSCU || 12;
  const cargoGridSCU = ship.scu || 13;
  const totalVolumeSCU = Number((rmcSCU + cmSCU).toFixed(2));
  const requiresMultipleRuns = totalVolumeSCU > (bufferSCU + cargoGridSCU);
  const runsNeeded = Math.max(1, Math.ceil(totalVolumeSCU / (bufferSCU + cargoGridSCU)));

  // Arbitrage Stratégique
  const canCraftArmor = rmcSCU >= 5.0;
  let strategicRecommendation = {
    action: 'sell_tdd',
    badge_fr: '💰 Vente TDD Recommandée',
    badge_en: '💰 TDD Sale Recommended',
    title_fr: 'VENTE DIRECTE EN TERMINAL TDD',
    title_en: 'DIRECT TDD TERMINAL SALE',
    detail_fr: `Rendement financier élevé : +${totalRevenue.toLocaleString()} aUEC en station majeure.`,
    detail_en: `High financial payout: +${totalRevenue.toLocaleString()} aUEC at major hubs.`
  };

  if (rmcSCU >= 12.0) {
    strategicRecommendation = {
      action: 'split_craft_sell',
      badge_fr: '🛠️ Mixte : Réserver 6 SCU Craft + Vendre Solde',
      badge_en: '🛠️ Mixed: Reserve 6 SCU Craft + Sell Balance',
      title_fr: 'ARBITRAGE STRATÉGIQUE MIXTE',
      title_en: 'STRATEGIC SPLIT ARBITRAGE',
      detail_fr: `Conservez 6 SCU de RMC pour forger du blindage et vendez le reste pour +${(revenueRMC - (6 * rmcPrice) + revenueCM).toLocaleString()} aUEC.`,
      detail_en: `Reserve 6 SCU RMC to forge heavy plates and sell remainder for +${(revenueRMC - (6 * rmcPrice) + revenueCM).toLocaleString()} aUEC.`
    };
  }

  return {
    wreck,
    scraper,
    ship,
    hullIntegrity,
    rmcSCU,
    cmSCU,
    totalVolumeSCU,
    revenueRMC,
    revenueCM,
    totalRevenue,
    estimatedScrapingMinutes,
    bufferSCU,
    cargoGridSCU,
    requiresMultipleRuns,
    runsNeeded,
    strategicRecommendation,
    rmcPrice,
    cmPrice
  };
}

/**
 * Simule l'état du tampon de broyage interne (Buffer)
 */
export function evaluateBufferState({
  currentBufferSCU = 0,
  bufferCapacitySCU = 12
}) {
  const percentage = Math.min(100, Math.round((currentBufferSCU / bufferCapacitySCU) * 100));
  const isNearFull = percentage >= 90;
  const isFull = percentage >= 100;

  let alertLevel = 'normal'; // 'normal' | 'warning' | 'critical'
  let alertText = 'Buffer opérationnel';

  if (isFull) {
    alertLevel = 'critical';
    alertText = '🛑 BUFFER PLEIN : BROYAGE SUSPENDU (VIDER VERS SOUTE)';
  } else if (isNearFull) {
    alertLevel = 'warning';
    alertText = '⚠️ BUFFER À 90% : PRÉPARER ÉJECTION SCU';
  }

  return {
    currentBufferSCU: Number(currentBufferSCU.toFixed(2)),
    bufferCapacitySCU,
    percentage,
    isNearFull,
    isFull,
    alertLevel,
    alertText
  };
}
