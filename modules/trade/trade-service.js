// ============================================================================
// AARON MFD — TRADE & CARGO SERVICE
// Calculateur bidirectionnel : Vaisseau ➔ Meilleures Routes OU Route ➔ Meilleur Vaisseau
// ============================================================================

import { POPULAR_TRADE_ROUTES, GENERAL_COMMODITIES, SHIPS, SUPPORT_SHIPS } from '../../data/index.js';
import { uexService } from './uex-service.js';
import { fleetService, getShip } from '../fleet/fleet-service.js';

export const tradeService = {
  /**
   * Obtenir l'ensemble des routes commerciales populaires
   * Enrichies dynamiquement avec les cours en direct UEX Corp ou le cache local
   * @param {Object} filters - { system, risk, commodityId, avoidHighRisk }
   */
  getRoutes(filters = {}) {
    let routes = [...POPULAR_TRADE_ROUTES];

    // Application des cours réels UEX Corp (Live / Cache)
    routes = uexService.applyUexPricesToRoutes(routes);

    if (filters.system) {
      routes = routes.filter(r => (r.system || '').toLowerCase() === filters.system.toLowerCase());
    }
    if (filters.risk) {
      routes = routes.filter(r => (r.riskKey || r.risk || '').toLowerCase() === filters.risk.toLowerCase());
    }
    if (filters.avoidHighRisk) {
      routes = routes.filter(r => {
        const k = (r.riskKey || r.risk || '').toLowerCase();
        return k !== 'high' && k !== 'extreme' && k !== 'élevé' && k !== 'extrême';
      });
    }
    if (filters.commodityId) {
      routes = routes.filter(r => r.commodityId === filters.commodityId);
    }

    return routes;
  },

  /**
   * Récupère la liste de toutes les marchandises de commerce SC 4.x
   */
  getCommodities(filters = {}) {
    return uexService.getCommoditiesList(filters);
  },

  /**
   * Récupère les catégories de marchandises
   */
  getCategories() {
    return uexService.getCategories();
  },

  /**
   * Récupère le statut de synchronisation UEX
   */
  getSyncStatus() {
    return uexService.getSyncStatus();
  },

  /**
   * Synchronise les cours avec l'API UEX Corp ou le cache
   */
  async syncPrices(force = false) {
    return await uexService.syncPrices(force);
  },

  /**
   * Calcul précis de la route en Quantum Full aller-retour
   * Prend en compte la distance en GM, le moteur quantique, l'atmosphère et les escales TDD
   * @param {Object} route
   * @param {Object|number} shipOrQd
   */
  computeQuantumFullRoute(route, shipOrQd) {
    const cargoScu = typeof shipOrQd === 'object'
      ? (Number(shipOrQd.cargoScu) || Number(shipOrQd.scu) || 696)
      : 696;

    let qdSize = 2;
    if (typeof shipOrQd === 'object' && shipOrQd.qdSize) {
      qdSize = Number(shipOrQd.qdSize);
    } else if (cargoScu >= 500) {
      qdSize = 3;
    } else if (cargoScu <= 50) {
      qdSize = 1; // Ou 2 selon modèle, S1 typique petits vaisseaux
    }

    // Vitesse de croisière du Quantum Drive selon sa taille (Star Citizen PTU 4.x)
    let qdSpeedKmS = 235000; // S3 TS-2 / Pontes
    let qdName = 'TS-2 / Pontes S3';
    let spoolAccelMinutes = 1.2;
    let atmoMassFactor = 1.35; // Gros porteurs lents en atmosphère dense

    if (qdSize === 1) {
      qdSpeedKmS = 152000; // S1 Atlas
      qdName = 'Atlas S1';
      spoolAccelMinutes = 0.6;
      atmoMassFactor = 0.85; // Vaisseaux légers très agiles
    } else if (qdSize === 2) {
      qdSpeedKmS = 260000; // S2 XL-1
      qdName = 'XL-1 S2';
      spoolAccelMinutes = 0.8;
      atmoMassFactor = 1.0; // Vaisseaux moyens standard
    }

    const distanceGm = Number(route.distanceGm) || 25.0;
    const distanceKm = distanceGm * 1000000;

    // 1. Temps Quantum aller-retour (Croisière à vitesse max + spool/accélération/décélération)
    const quantumTimeMinutesOneWay = (distanceKm / qdSpeedKmS) / 60 + spoolAccelMinutes;
    const quantumMinutesRoundTrip = Math.round(quantumTimeMinutesOneWay * 2 * 10) / 10;

    // 2. Temps atmosphérique aller-retour (Lorville, Orison, New Babbage, Area18...)
    const originAtmo = Number(route.originAtmoMinutes) || 2.0;
    const destAtmo = Number(route.destAtmoMinutes) || 2.0;
    const atmoMinutesRoundTrip = Math.round((originAtmo + destAtmo) * atmoMassFactor * 2 * 10) / 10;

    // 3. Transactions et transit urbain / spatioport TDD (tramways, ascenseurs, terminaux A/R)
    const terminalMinutesRoundTrip = Math.round((Number(route.terminalMinutes) || 5.0) * 2 * 10) / 10;

    // 4. Durée totale de la rotation en Quantum Full
    const totalRotationMinutes = Math.round((quantumMinutesRoundTrip + atmoMinutesRoundTrip + terminalMinutesRoundTrip) * 10) / 10;
    const rotationHours = totalRotationMinutes / 60;
    const rotationsPerHour = Math.round((60 / totalRotationMinutes) * 10) / 10;

    return {
      distanceGm,
      distanceKm,
      qdSize,
      qdName,
      qdSpeedKmS,
      quantumMinutesRoundTrip,
      atmoMinutesRoundTrip,
      terminalMinutesRoundTrip,
      totalRotationMinutes,
      rotationHours,
      rotationsPerHour
    };
  },

  /**
   * MODE 1 : Calculer les meilleures routes pour le vaisseau actif
   * @param {number|Object} shipOrCargoSCU - Capacité en SCU ou instance de Vaisseau
   * @param {number} userCapitalUEC - Capital disponible pour acheter la cargaison
   * @param {number} maxResults - Nombre max de routes retournées
   * @param {Object} options - { avoidHighRisk: boolean, shipName: string, qdSize: number }
   */
  findBestRoutesForShip(shipOrCargoSCU, userCapitalUEC = 1284500, maxResults = 10, options = {}) {
    const cargoSCU = typeof shipOrCargoSCU === 'number'
      ? shipOrCargoSCU
      : (Number(shipOrCargoSCU?.cargoScu) || Number(shipOrCargoSCU?.scu) || 696);

    const shipName = typeof shipOrCargoSCU === 'object' ? (shipOrCargoSCU.name || 'Vaisseau') : (options.shipName || 'Vaisseau');
    const routes = this.getRoutes({ avoidHighRisk: options.avoidHighRisk });

    const evaluatedRoutes = routes.map(route => {
      // Coût et prix de vente par SCU (1 SCU = 100 cSCU)
      const costPerSCU = route.buyPricePerScu || Math.round((route.buyPrice || 10) * 100);
      const revenuePerSCU = route.sellPricePerScu || Math.round((route.sellPrice || 12) * 100);
      const marginPerSCU = revenuePerSCU - costPerSCU;

      // Calcul précis de la navigation en Quantum Full pour ce vaisseau sur cette route
      const quantumRoute = this.computeQuantumFullRoute(route, shipOrCargoSCU);

      // Déterminer combien de SCU le joueur peut acheter avec son capital
      const maxAffordableSCU = costPerSCU > 0 ? Math.floor(userCapitalUEC / costPerSCU) : cargoSCU;
      const actualCargoSCU = Math.min(cargoSCU, maxAffordableSCU);

      // Calculs financiers par rotation
      const fullHoldProfitPerRotation = Math.round(cargoSCU * marginPerSCU);
      const actualProfitPerRotation = Math.round(actualCargoSCU * marginPerSCU);

      const totalInvestmentUEC = Math.round(actualCargoSCU * costPerSCU);
      const totalRevenueUEC = Math.round(actualCargoSCU * revenuePerSCU);
      const netProfitUEC = actualProfitPerRotation;
      const roiPct = totalInvestmentUEC > 0 ? Math.round((netProfitUEC / totalInvestmentUEC) * 100) : 0;
      const isHoldFull = actualCargoSCU >= cargoSCU;

      // Taux de remplissage et détection de surdimensionnement (ex: C2 pour seulement 4 SCU)
      const fillRatePct = cargoSCU > 0 ? Math.round((actualCargoSCU / cargoSCU) * 1000) / 10 : 0;
      const isOversized = actualCargoSCU <= 10 || (fillRatePct < 15 && cargoSCU >= 100);

      // Profit horaire réel basé sur le nombre réel de rotations Quantum Full par heure
      const actualProfitPerHourUEC = Math.round(actualProfitPerRotation * quantumRoute.rotationsPerHour);
      const fullHoldProfitPerHourUEC = Math.round(fullHoldProfitPerRotation * quantumRoute.rotationsPerHour);

      // Alertes contextuelles basées sur le capital alloué
      const isCapitalConstrained = actualCargoSCU < cargoSCU;
      const capitalWarning = isCapitalConstrained
        ? (actualCargoSCU === 0
            ? `⚠ Capital alloué (${userCapitalUEC.toLocaleString('fr-FR')} aUEC) insuffisant pour financer ne serait-ce qu'1 SCU (${costPerSCU.toLocaleString('fr-FR')} aUEC/SCU)`
            : `⚠ Capital alloué : ${actualCargoSCU} SCU financés sur les ${cargoSCU} SCU du vaisseau (${fillRatePct} % de soute)`)
        : null;

      const oversizedWarning = isOversized
        ? `⚠️ Vaisseau surdimensionné : seulement ${actualCargoSCU} SCU sur ${cargoSCU} (${fillRatePct} %). Mobiliser un ${shipName} pour ce volume en Quantum Full génère un profit dérisoire de +${actualProfitPerHourUEC.toLocaleString('fr-FR')} aUEC/h.`
        : null;

      return {
        ...route,
        shipCapacitySCU: cargoSCU,
        costPerSCU,
        revenuePerSCU,
        marginPerSCU,
        quantumRoute,
        actualCargoSCU,
        actualProfit: actualProfitPerRotation,
        profit: actualProfitPerRotation,
        fullHoldProfit: fullHoldProfitPerRotation,
        fillRatePct,
        isHoldFull,
        isCapitalConstrained,
        isOversized,
        capitalWarning,
        oversizedWarning,
        totalInvestmentUEC,
        totalRevenueUEC,
        netProfitUEC,
        profitPerHourUEC: actualProfitPerHourUEC,
        actualProfitPerHourUEC,
        fullHoldProfitPerHourUEC,
        roiPct
      };
    });

    // Trier par profit/heure réel (prenant en compte le capital alloué) décroissant
    return evaluatedRoutes
      .sort((a, b) => b.profitPerHourUEC - a.profitPerHourUEC)
      .slice(0, maxResults);
  },

  /**
   * Vérifie dynamiquement si un vaisseau est présent dans la flotte du joueur
   * @param {Object|string} candidate
   * @param {Array} [playerFleet]
   * @returns {boolean}
   */
  isShipOwnedInFleet(candidate, playerFleet = null) {
    if (!candidate) return false;
    const fleet = playerFleet || (typeof fleetService !== 'undefined' ? fleetService.getShips() : []);
    if (!Array.isArray(fleet) || fleet.length === 0) return false;

    const candName = (typeof candidate === 'string' ? candidate : (candidate.name || candidate.shipName || '')).toLowerCase().trim();
    const candId = (typeof candidate === 'object' && candidate.id ? candidate.id : '').toLowerCase().trim();

    return fleet.some(entry => {
      if (!entry || !entry.shipId) return false;
      const def = typeof getShip === 'function' ? getShip(entry.shipId) : null;
      const defId = (entry.shipId || '').toLowerCase().trim();
      const defName = (def?.name || '').toLowerCase().trim();

      // Correspondance exacte par ID
      if (candId && (candId === defId || candId.replace(/_/g, '') === defId.replace(/_/g, ''))) {
        return true;
      }

      // Correspondance par nom direct
      if (candName && defName) {
        if (candName === defName || defName.includes(candName) || candName.includes(defName)) {
          return true;
        }
      }

      // Nettoyage constructeurs RSI, MISC, Drake, Crusader...
      const clean = (s) => s.replace(/^(crusader|drake|misc|rsi|anvil|aegis|argo|origin|gatac|cnou)\s+/i, '').trim();
      const cleanCand = clean(candName);
      const cleanDef = clean(defName);
      if (cleanCand && cleanDef && (cleanCand === cleanDef || cleanDef.includes(cleanCand) || cleanCand.includes(cleanDef))) {
        return true;
      }

      return false;
    });
  },

  /**
   * MODE 2 : Recommander et comparer les meilleurs vaisseaux pour une route donnée
   * Prend en compte la capacité, le quantum drive et l'adéquation au volume de fret
   * Détermine l'appartenance à la flotte de façon 100% dynamique
   * @param {Object|string} routeOrId
   * @param {number} userCapitalUEC
   * @param {Array} [playerFleet]
   */
  getBestShipsForRoute(routeOrId, userCapitalUEC = 1284500, playerFleet = null) {
    const route = typeof routeOrId === 'string'
      ? (POPULAR_TRADE_ROUTES.find(r => r.id === routeOrId) || POPULAR_TRADE_ROUTES[0])
      : routeOrId;

    const costPerSCU = route.buyPricePerScu || Math.round((route.buyPrice || 10) * 100);
    const revenuePerSCU = route.sellPricePerScu || Math.round((route.sellPrice || 12) * 100);
    const marginPerSCU = revenuePerSCU - costPerSCU;

    const fleet = playerFleet || (typeof fleetService !== 'undefined' ? fleetService.getShips() : []);

    // Vaisseaux cargos de référence pour le comparatif de marché
    const baseCandidates = [
      { id: 'cutlass_black', name: 'Drake Cutlass Black', cargoScu: 46, qdSize: 2, desc: 'Transport léger très agile' },
      { id: 'taurus', name: 'RSI Constellation Taurus', cargoScu: 174, qdSize: 2, desc: 'Transporteur moyen blindé' },
      { id: 'caterpillar', name: 'Drake Caterpillar', cargoScu: 576, qdSize: 3, desc: 'Cargo lourd modulaire' },
      { id: 'c2', name: 'C2 Hercules', cargoScu: 696, qdSize: 3, desc: 'Super-transporteur stantonien' },
      { id: 'hull_c', name: 'Hull C', cargoScu: 4608, qdSize: 3, desc: 'Cargo géant spatial (amarrage station)' }
    ];

    // Inclure dynamiquement tout vaisseau de fret possédé par le joueur qui ne serait pas dans les 5 de base
    const candidates = [...baseCandidates];
    if (Array.isArray(fleet)) {
      fleet.forEach(entry => {
        if (!entry || !entry.shipId) return;
        const def = typeof getShip === 'function' ? getShip(entry.shipId) : null;
        if (!def || def.role === 'mining' || !def.scu || def.scu <= 0) return;

        const isAlreadyInList = candidates.some(c =>
          c.id === entry.shipId ||
          c.name.toLowerCase().includes(def.name.toLowerCase()) ||
          def.name.toLowerCase().includes(c.name.toLowerCase())
        );

        if (!isAlreadyInList) {
          candidates.push({
            id: entry.shipId,
            name: def.name,
            cargoScu: def.scu,
            qdSize: def.qdSize || 2,
            desc: `Vaisseau de votre flotte (« ${entry.nickname || def.name} »)`
          });
        }
      });
    }

    return candidates.map(s => {
      const isOwned = this.isShipOwnedInFleet(s, fleet);
      const affordableSCU = Math.min(s.cargoScu, Math.floor(userCapitalUEC / costPerSCU));
      const qRoute = this.computeQuantumFullRoute(route, s);
      const fullProfit = s.cargoScu * marginPerSCU;
      const actualProfit = affordableSCU * marginPerSCU;

      // Profit par heure réel basé sur la somme allouée et les rotations Quantum Full
      const profitPerHour = Math.round(actualProfit * qRoute.rotationsPerHour);
      const fullProfitPerHour = Math.round(fullProfit * qRoute.rotationsPerHour);

      const fillRatePct = s.cargoScu > 0 ? Math.round((affordableSCU / s.cargoScu) * 1000) / 10 : 0;
      const isOversized = affordableSCU <= 10 || (fillRatePct < 15 && s.cargoScu >= 100);

      return {
        id: s.id,
        shipName: s.name,
        cargoScu: s.cargoScu,
        affordableScu: affordableSCU,
        fillRatePct,
        isOversized,
        owned: isOwned,
        quantumRoute: qRoute,
        netProfitUEC: Math.round(actualProfit),
        fullProfitUEC: Math.round(fullProfit),
        profitPerHourUEC: profitPerHour,
        fullHoldProfitPerHourUEC: fullProfitPerHour,
        isFull: affordableSCU >= s.cargoScu
      };
    }).sort((a, b) => b.profitPerHourUEC - a.profitPerHourUEC);
  },

  /**
   * Recommander le meilleur vaisseau pour une route donnée
   * Privilégie un vaisseau POSSÉDÉ dans la flotte du joueur.
   * Si aucun vaisseau n'est possédé, propose le meilleur choix du marché en précisant que c'est une simulation.
   * Si la quantité finançable est faible (ex. 4 SCU), évite les mastodontes inefficaces
   * @param {string|Object} routeOrId 
   * @param {number} userCapitalUEC 
   * @param {Array} [playerFleet]
   */
  recommendBestShipForRoute(routeOrId, userCapitalUEC = 1284500, playerFleet = null) {
    const route = typeof routeOrId === 'string'
      ? (POPULAR_TRADE_ROUTES.find(r => r.id === routeOrId) || POPULAR_TRADE_ROUTES[0])
      : routeOrId;

    const scoredShips = this.getBestShipsForRoute(route, userCapitalUEC, playerFleet);
    const costPerSCU = route.buyPricePerScu || Math.round((route.buyPrice || 10) * 100);
    const maxAffordable = Math.floor(userCapitalUEC / costPerSCU);

    const ownedShips = scoredShips.filter(s => s.owned);
    const hasOwned = ownedShips.length > 0;

    // Détection de volume faible (ex: 4 SCU)
    if (maxAffordable <= 10) {
      const agileShip = (hasOwned ? ownedShips.find(s => s.cargoScu <= 100) : null)
        || scoredShips.find(s => s.cargoScu <= 100)
        || scoredShips[0];

      return {
        route,
        recommendedShip: agileShip,
        allEvaluatedShips: scoredShips,
        hasOwnedShip: agileShip.owned,
        rationale_fr: `⚠️ Attention volume faible (${maxAffordable} SCU finançables) : mobiliser un transporteur lourd pour seulement ${maxAffordable} SCU en Quantum Full n'est pas rentable en temps de vol et d'atmosphère. Le ${agileShip.shipName} (${agileShip.cargoScu} SCU${agileShip.owned ? ' · Dans votre flotte' : ' · Non possédé'}) est bien plus adapté pour cette rotation.`
      };
    }

    // Si le joueur possède des cargos dans sa flotte, on recommande le meilleur cargo possédé
    // Sinon, on recommande le meilleur vaisseau du marché en mode simulation
    let recommendedShip;
    let rationale_fr;

    if (hasOwned) {
      recommendedShip = ownedShips[0];
      const q = recommendedShip.quantumRoute;
      rationale_fr = `Le ${recommendedShip.shipName} (${recommendedShip.cargoScu} SCU) est le choix optimal de votre flotte : ` +
        `avec votre capital, il génère un profit estimé de +${recommendedShip.profitPerHourUEC.toLocaleString('fr-FR')} aUEC/h ` +
        `sur la rotation Quantum Full (~${q.totalRotationMinutes} min A/R, ${q.rotationsPerHour} rot/h · ${recommendedShip.isFull ? 'Soute pleine' : `${recommendedShip.affordableScu}/${recommendedShip.cargoScu} SCU financés`}).`;
    } else {
      recommendedShip = scoredShips[0];
      const q = recommendedShip.quantumRoute;
      rationale_fr = `💡 Simulation Marché (Aucun cargo dans votre flotte) : ` +
        `Le ${recommendedShip.shipName} (${recommendedShip.cargoScu} SCU) représente le choix de marché le plus rentable ` +
        `avec un profit estimé de +${recommendedShip.profitPerHourUEC.toLocaleString('fr-FR')} aUEC/h ` +
        `sur la rotation Quantum Full (~${q.totalRotationMinutes} min A/R, ${q.rotationsPerHour} rot/h). ` +
        `Pour vos calculs réels, ajoutez un transporteur à votre flotte depuis l'onglet Flotte.`;
    }

    return {
      route,
      recommendedShip,
      allEvaluatedShips: scoredShips,
      hasOwnedShip: recommendedShip.owned,
      rationale_fr
    };
  }
};



