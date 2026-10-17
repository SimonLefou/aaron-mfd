// AARON MFD Data Layer - Unified Facade (Enrichie avec FleetYards.net)
import { SHIPS, SUPPORT_SHIPS, getAllPlayableShips } from './game/ships.js';
import { LASERS } from './game/lasers.js';
import { MODULES } from './game/modules.js';
import { GADGETS } from './game/gadgets.js';
import { QUANTUM_DRIVES, SHIELDS, POWER_PLANTS, COOLERS, TRACTOR_BEAMS, SALVAGE_HEADS, SHIP_WEAPONS, MISSILE_RACKS } from './game/components.js';
import { MINERALS } from './game/minerals.js';
import { REFINING_METHODS, REFINERY_STATIONS } from './game/refining.js';
import { AARON_HALO_BANDS, MINING_HOTSPOTS, ROCK_ARCHETYPES } from './game/locations.js';
import { FRONTIER_MINEABLES, getFrontierPreset } from './game/frontier-mineables.js';
import { SALVAGE_SHIPS, SALVAGE_SCRAPERS, SALVAGE_WRECKS, SALVAGE_COMMODITIES } from './game/salvage.js';
import { TRADE_TERMINALS, UEX_CONFIG, GENERAL_COMMODITIES, POPULAR_TRADE_ROUTES } from './game/trade.js';
import { BLUEPRINTS, MINING_SPECIALIZED_BLUEPRINTS, getBlueprintsByCategory, getBlueprintById } from './game/blueprints.js';
import { FACTORY_LOADOUT_PRESETS } from './defaults/factory-loadouts.js';
import { DEFAULT_GUILD_STOCKPILE, DEFAULT_GUILD_EXPENSES, GUILD_ROLE_PERMISSIONS } from './defaults/guild-defaults.js';
import { CHANGELOG_DATA } from './defaults/changelog.js';
import { FLEETYARDS_DATA, fleetyardsService } from './fleetyards/index.js';

export {
  SHIPS,
  SUPPORT_SHIPS,
  getAllPlayableShips,
  LASERS,
  MODULES,
  GADGETS,
  QUANTUM_DRIVES,
  SHIELDS,
  POWER_PLANTS,
  COOLERS,
  TRACTOR_BEAMS,
  SALVAGE_HEADS,
  SHIP_WEAPONS,
  MISSILE_RACKS,
  MINERALS,
  REFINING_METHODS,
  REFINERY_STATIONS,
  AARON_HALO_BANDS,
  MINING_HOTSPOTS,
  ROCK_ARCHETYPES,
  FRONTIER_MINEABLES,
  getFrontierPreset,
  SALVAGE_SHIPS,
  SALVAGE_SCRAPERS,
  SALVAGE_WRECKS,
  SALVAGE_COMMODITIES,
  TRADE_TERMINALS,
  UEX_CONFIG,
  GENERAL_COMMODITIES,
  POPULAR_TRADE_ROUTES,
  BLUEPRINTS,
  MINING_SPECIALIZED_BLUEPRINTS,
  getBlueprintsByCategory,
  getBlueprintById,
  FACTORY_LOADOUT_PRESETS,
  DEFAULT_GUILD_STOCKPILE,
  DEFAULT_GUILD_EXPENSES,
  GUILD_ROLE_PERMISSIONS,
  CHANGELOG_DATA,
  FLEETYARDS_DATA,
  fleetyardsService
};

export const MINING_DATA = {
  ships: SHIPS,
  supportShips: SUPPORT_SHIPS,
  lasers: LASERS,
  modules: MODULES,
  gadgets: GADGETS,
  blueprints: BLUEPRINTS,
  quantumDrives: QUANTUM_DRIVES,
  shields: SHIELDS,
  powerPlants: POWER_PLANTS,
  coolers: COOLERS,
  minerals: MINERALS,
  refiningMethods: REFINING_METHODS,
  refineryStations: REFINERY_STATIONS,
  aaronHaloBands: AARON_HALO_BANDS,
  miningHotspots: MINING_HOTSPOTS,
  rockArchetypes: ROCK_ARCHETYPES,
  salvageShips: SALVAGE_SHIPS,
  salvageScrapers: SALVAGE_SCRAPERS,
  salvageWrecks: SALVAGE_WRECKS,
  salvageCommodities: SALVAGE_COMMODITIES,
  fleetyards: FLEETYARDS_DATA
};
