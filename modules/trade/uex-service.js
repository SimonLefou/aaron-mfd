// ============================================================================
// AARON MFD — UEX CORP LIVE MARKET SERVICE (STAR CITIZEN 4.x)
// Synchronisation temps réel avec l'API publique UEX Corp & Cache local hors-ligne
// ============================================================================

import { UEX_CONFIG, GENERAL_COMMODITIES, TRADE_TERMINALS, POPULAR_TRADE_ROUTES } from '../../data/index.js';

class UexService {
  constructor() {
    this.status = 'cached'; // 'live' | 'cached' | 'corpo'
    this.lastSyncTimestamp = Date.now();
    this.cachedPrices = {};
    this.isSyncing = false;
    this.initCache();
  }

  /**
   * Initialise ou charge le cache local sécurisé depuis localStorage
   */
  initCache() {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem('price_cache') || localStorage.getItem(UEX_CONFIG.cacheStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data && parsed.version === '4.1_correlated' && Object.keys(parsed.data).length >= 200) {
          this.cachedPrices = parsed.data;
          this.lastSyncTimestamp = parsed.timestamp || (Date.now() - 1000 * 60 * 15);
          const ageMinutes = (Date.now() - this.lastSyncTimestamp) / (1000 * 60);
          this.status = ageMinutes < (UEX_CONFIG.cacheExpiryMinutes || 30) ? 'cached' : 'cached';
          return;
        }
      }
    } catch (e) {
      console.warn('[UEX Service] Erreur lors du chargement du cache local:', e);
    }

    // Si pas de cache ou cache obsolète (< 200 commodités), réamorcer avec les 232 cours corrélés de Star Citizen 4.x
    this.seedDefaultCache();
  }

  /**
   * Alimente le cache initial avec les prix officiels SC 4.x
   */
  seedDefaultCache() {
    this.cachedPrices = {};
    GENERAL_COMMODITIES.forEach(c => {
      this.cachedPrices[c.id] = {
        id: c.id,
        name: c.name_fr || c.name_en,
        category: c.category,
        baseBuy: c.baseBuy,
        baseSell: c.baseSell,
        margin: Math.round((c.baseSell - c.baseBuy) * 100) / 100,
        bestBuy: c.bestBuy,
        bestSell: c.bestSell,
        isIllegal: !!c.isIllegal,
        updatedAt: Date.now() - 1000 * 60 * 12 // ~12 min ago
      };
    });

    this.saveToStorage(this.cachedPrices, Date.now() - 1000 * 60 * 12);
  }

  /**
   * Sauvegarde les cours dans les clés de cache local
   */
  saveToStorage(data, timestamp = Date.now()) {
    if (typeof localStorage === 'undefined') return;
    try {
      const payload = JSON.stringify({
        data,
        timestamp,
        version: '4.1_correlated',
        server: 'Stanton/Pyro Live'
      });
      localStorage.setItem('price_cache', payload);
      localStorage.setItem(UEX_CONFIG.cacheStorageKey, payload);
    } catch (e) {
      console.warn('[UEX Service] Impossible de sauvegarder dans localStorage:', e);
    }
  }

  /**
   * Synchronise les cours avec l'API publique UEX Corp
   * En cas d'absence de connexion Internet, bascule automatiquement et immédiatement sur le cache hors-ligne
   * @param {boolean} forceRefresh - Forcer l'appel réseau même si le cache est récent
   * @returns {Promise<{ status: string, timestamp: number, count: number, isFallback: boolean }>}
   */
  async syncPrices(forceRefresh = false) {
    if (this.isSyncing) {
      return { status: this.status, timestamp: this.lastSyncTimestamp, count: Object.keys(this.cachedPrices).length, isFallback: false };
    }

    const ageMinutes = (Date.now() - this.lastSyncTimestamp) / (1000 * 60);

    // Si le cache est encore frais et qu'on ne force pas l'actualisation
    if (!forceRefresh && ageMinutes < (UEX_CONFIG.cacheExpiryMinutes || 30) && Object.keys(this.cachedPrices).length > 0) {
      return {
        status: this.status,
        timestamp: this.lastSyncTimestamp,
        count: Object.keys(this.cachedPrices).length,
        isFallback: false
      };
    }

    this.isSyncing = true;

    try {
      // Tentative de connexion à l'API publique UEX Corp
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UEX_CONFIG.apiTimeoutMs || 3500);

      const response = await fetch(UEX_CONFIG.publicEndpoint, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      }).catch(err => {
        // En vol ou hors-ligne : AbortError, Failed to fetch, CORS, etc.
        return null;
      });

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const json = await response.json();
        const liveItems = Array.isArray(json) ? json : (json.data || []);

        if (liveItems.length > 0) {
          // Fusionner les données reçues de l'API UEX Corp avec notre base de commodities
          const updated = { ...this.cachedPrices };
          liveItems.forEach(item => {
            const code = (item.code || item.commodity_code || item.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
            const match = GENERAL_COMMODITIES.find(c => c.id === code || c.name_en.toLowerCase().includes(code));
            const id = match ? match.id : code;

            const buy = Number(item.price_buy || item.buy || (match ? match.baseBuy : 10));
            const sell = Number(item.price_sell || item.sell || (match ? match.baseSell : 12));

            updated[id] = {
              id,
              name: match ? (match.name_fr || match.name_en) : (item.name || code),
              category: match ? match.category : 'general',
              baseBuy: buy,
              baseSell: sell,
              margin: Math.round((sell - buy) * 100) / 100,
              bestBuy: match?.bestBuy || { location: item.terminal_buy || 'TDD Stanton', price: buy },
              bestSell: match?.bestSell || { location: item.terminal_sell || 'CBD Hurston', price: sell },
              isIllegal: match ? !!match.isIllegal : false,
              updatedAt: Date.now()
            };
          });

          this.cachedPrices = updated;
          this.lastSyncTimestamp = Date.now();
          this.status = 'live';
          this.saveToStorage(updated, this.lastSyncTimestamp);

          this.isSyncing = false;
          return {
            status: 'live',
            timestamp: this.lastSyncTimestamp,
            count: Object.keys(updated).length,
            isFallback: false
          };
        }
      }

      // Si l'API ne renvoie pas de réponse ou en cas d'erreur de réseau / vol hors-ligne :
      // BASCULE AUTOMATIQUE SUR LE CACHE LOCAL SANS BLOQUER
      this.status = 'cached';
      this.isSyncing = false;
      return {
        status: 'cached',
        timestamp: this.lastSyncTimestamp,
        count: Object.keys(this.cachedPrices).length,
        isFallback: true
      };
    } catch (err) {
      // Sécurité absolue : bascule transparente sur le cache local
      this.status = 'cached';
      this.isSyncing = false;
      return {
        status: 'cached',
        timestamp: this.lastSyncTimestamp,
        count: Object.keys(this.cachedPrices).length,
        isFallback: true
      };
    }
  }

  /**
   * Retourne l'état de synchronisation UEX pour les badges visuels
   */
  getSyncStatus() {
    const ageMs = Date.now() - this.lastSyncTimestamp;
    const ageMinutes = Math.floor(ageMs / (1000 * 60));
    let timeAgoText = 'à l\'instant';
    if (ageMinutes >= 60) {
      const hours = Math.floor(ageMinutes / 60);
      timeAgoText = `il y a ${hours} h`;
    } else if (ageMinutes > 0) {
      timeAgoText = `il y a ${ageMinutes} min`;
    }

    return {
      status: this.status, // 'live', 'cached', 'corpo'
      badgeText: this.status === 'live' ? 'UEX LIVE' : (this.status === 'corpo' ? 'UEX GUILDE' : 'UEX CACHE'),
      badgeClass: this.status === 'live' ? 'live' : (this.status === 'corpo' ? 'corpo' : 'cached'),
      lastSyncTimestamp: this.lastSyncTimestamp,
      timeAgoText,
      totalCommodities: Object.keys(this.cachedPrices).length || GENERAL_COMMODITIES.length
    };
  }

  /**
   * Liste complète de tous les produits de trade disponibles dans Star Citizen 4.x
   * Enrichie avec les cours UEX Corp (directs ou cache)
   * @param {Object} filters - { category, search, legalOnly, illicitOnly }
   */
  getCommoditiesList(filters = {}) {
    let list = GENERAL_COMMODITIES.map(c => {
      const live = this.cachedPrices[c.id];
      const buyPrice = live ? live.baseBuy : c.baseBuy;
      const sellPrice = live ? live.baseSell : c.baseSell;
      const margin = Math.round((sellPrice - buyPrice) * 100) / 100;
      const marginPerScu = Math.round(margin * 100); // 1 SCU = 100 cSCU

      return {
        ...c,
        currentBuy: buyPrice,
        currentSell: sellPrice,
        margin,
        marginPerScu,
        bestBuy: live?.bestBuy || c.bestBuy,
        bestSell: live?.bestSell || c.bestSell,
        lastUpdated: live?.updatedAt || this.lastSyncTimestamp
      };
    });

    if (filters.category && filters.category !== 'all') {
      list = list.filter(c => c.category === filters.category);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(c =>
        (c.name_fr || '').toLowerCase().includes(q) ||
        (c.name_en || '').toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q)
      );
    }

    if (filters.legalOnly) {
      list = list.filter(c => !c.isIllegal);
    } else if (filters.illicitOnly) {
      list = list.filter(c => !!c.isIllegal);
    }

    // Trier par marge par défaut décroissante
    return list.sort((a, b) => b.marginPerScu - a.marginPerScu);
  }

  /**
   * Retourne les catégories de marchandises avec icônes et compteurs
   */
  getCategories() {
    const all = GENERAL_COMMODITIES;
    return [
      { id: 'all', label_fr: 'Toutes les marchandises', icon: '📦', count: all.length },
      { id: 'metals', label_fr: 'Minerais & Métaux précieux', icon: '💎', count: all.filter(c => c.category === 'metals').length },
      { id: 'industrial', label_fr: 'Matériaux industriels & Recyclage', icon: '⚙️', count: all.filter(c => c.category === 'industrial').length },
      { id: 'medical', label_fr: 'Fournitures médicales & Soins', icon: '💉', count: all.filter(c => c.category === 'medical').length },
      { id: 'consumables', label_fr: 'Vivres, Alcools & Consommables', icon: '🥫', count: all.filter(c => c.category === 'consumables').length },
      { id: 'gases', label_fr: 'Gaz & Carburants de propulsion', icon: '⛽', count: all.filter(c => c.category === 'gases').length },
      { id: 'illicit', label_fr: 'Contrebande & Vice (Pyro/Outlaw)', icon: '☠️', count: all.filter(c => c.category === 'illicit').length }
    ];
  }

  /**
   * Actualise dynamiquement les cours d'achat/vente des routes populaires à partir d'UEX Corp
   * @param {Array} routes
   */
  applyUexPricesToRoutes(routes) {
    if (!routes || !Array.isArray(routes)) return [];

    return routes.map(route => {
      // 1. Prix par SCU définis sur la route
      let buyPricePerScu = Number(route.buyPricePerScu);
      let sellPricePerScu = Number(route.sellPricePerScu);

      // Si la route n'a pas encore ses prix SCU (ou si flux Live UEX disponible)
      if (!buyPricePerScu || !sellPricePerScu || this.status === 'live') {
        const commId = route.commodityId || route.item?.toLowerCase();
        const liveComm = this.cachedPrices[commId] || GENERAL_COMMODITIES.find(c => c.id === commId);

        if (liveComm && liveComm.baseBuy && liveComm.baseSell) {
          if (this.status === 'live' || !buyPricePerScu) {
            buyPricePerScu = Math.round(liveComm.baseBuy * 100);
            sellPricePerScu = Math.round(liveComm.baseSell * 100);
          }
        }
      }

      // Sécurité fallback si toujours indéfini
      if (!buyPricePerScu) buyPricePerScu = Math.round((route.buyPrice || 10) * 100);
      if (!sellPricePerScu) sellPricePerScu = Math.round((route.sellPrice || 15) * 100);

      const marginPerScu = sellPricePerScu - buyPricePerScu;

      return {
        ...route,
        buyPrice: Math.round((buyPricePerScu / 100) * 100) / 100,
        sellPrice: Math.round((sellPricePerScu / 100) * 100) / 100,
        buyPricePerScu,
        sellPricePerScu,
        marginPerScu,
        freshness: this.status === 'live' ? 'Direct Live' : 'Cache UEX'
      };
    });
  }
}

export const uexService = new UexService();
