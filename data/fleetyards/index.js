// ============================================================================
// AARON MFD — FLEETYARDS FULL DATASET FACADE
// Accès haute performance aux 1618 blueprints, 3310 composants, 4656 équipements,
// 232 commodities, 1909 lieux et 7506 routes commerciales.
// ============================================================================

import BLUEPRINTS_RAW from './blueprints.json' with { type: 'json' };
import COMPONENTS_RAW from './components.json' with { type: 'json' };
import EQUIPMENT_RAW from './equipment.json' with { type: 'json' };
import COMMODITIES_RAW from './commodities.json' with { type: 'json' };
import LOCATIONS_RAW from './locations.json' with { type: 'json' };
import TRADE_ROUTES_RAW from './trade-routes.json' with { type: 'json' };

export const FLEETYARDS_DATA = {
  blueprints: BLUEPRINTS_RAW,
  components: COMPONENTS_RAW,
  equipment: EQUIPMENT_RAW,
  commodities: COMMODITIES_RAW,
  locations: LOCATIONS_RAW,
  tradeRoutes: TRADE_ROUTES_RAW
};

export const fleetyardsService = {
  // Recherche rapide de composant
  findComponent(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    return COMPONENTS_RAW.filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q));
  },

  // Recherche de blueprint par ingrédient minéral
  findBlueprintsByMineral(mineralSlug) {
    if (!mineralSlug) return [];
    const s = mineralSlug.toLowerCase();
    return BLUEPRINTS_RAW.filter(b => (b.materials || []).some(m => m.slug === s || m.name.toLowerCase().includes(s)));
  },

  // Trouver les magasins et terminaux d'un lieu
  getLocationsByParent(parentName) {
    if (!parentName) return [];
    const p = parentName.toLowerCase();
    return LOCATIONS_RAW.filter(l => (l.parentName || '').toLowerCase().includes(p));
  },

  // Trouver les routes pour une marchandise donnée
  getRoutesForCommodity(commoditySlug) {
    if (!commoditySlug) return [];
    return TRADE_ROUTES_RAW.filter(r => r.commodity?.slug === commoditySlug);
  }
};
