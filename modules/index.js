// ============================================================================
// AARON MFD — UNIFIED MODULAR ARCHITECTURE (FAÇADE CENTRALE)
// Point d'entrée unique vers l'ensemble des services métiers découpés
// ============================================================================

// Core Infrastructure
export { eventBus, EVENTS } from './core/event-bus.js';
export { store } from './core/state.js';
export { storage } from './core/storage.js';
export * from './core/models.js';
export { authService } from './auth/auth-service.js';

// Services Métiers
export {
  fleetService,
  ALL_SHIPS,
  getShip,
  totalScu,
  hardpointsOf,
  moduleSlotsFor,
  configState,
  getLaser,
  getModule
} from './fleet/fleet-service.js';
export { inventoryService } from './inventory/inventory-service.js';
export { miningCalc, ROCK_ARCHETYPES_CONFIG, buildRockComposition } from './mining/mining-calc.js';
export {
  craftingService,
  BLUEPRINT_CATEGORIES,
  resolveBlueprintCategory,
  QUALITY_TIERS,
  getQualityTier,
  calculateCompositeQuality,
  calculateCraftedStats
} from './crafting/crafting-service.js';

export { tradeService } from './trade/trade-service.js';
export { uexService } from './trade/uex-service.js';
export {
  coopService,
  FleetCoopManager,
  MULTICREW_ROLES,
  FLEET_SHIP_ROLES,
  FLEET_SESSION_PRESETS
} from './coop/coop-service.js';
export { guildService } from './guild/guild-service.js';
export { salvageService } from './salvage/salvage-service.js';
export { calculateSalvageYield, evaluateBufferState } from './salvage/salvage-calc.js';
export { starmapService, STANTON_SYSTEM_COORDINATES, PYRO_SYSTEM_COORDINATES } from './starmap/starmap-service.js';
export { calculateQuantumDrop, evaluateDropCountdownProgress, AARON_HALO_RING_ZONES } from './starmap/aaron-halo-calc.js';
