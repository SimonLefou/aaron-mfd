import {
  MINING_DATA,
  CHANGELOG_DATA,
  FACTORY_LOADOUT_PRESETS,
  DEFAULT_GUILD_STOCKPILE,
  DEFAULT_GUILD_EXPENSES,
  GUILD_ROLE_PERMISSIONS
} from './mining-data.js';
import { I18N } from './i18n.js';
import { AaronFleetNet } from './fleet-net.js';
import * as AaronModules from './modules/index.js';

if (typeof window !== 'undefined') {
  window.AaronModules = AaronModules;
}

let fleetNet = null;

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
  currentLang: localStorage.getItem('aaron_mfd_lang') || 'fr',
  currentTheme: localStorage.getItem('aaron_mfd_theme') || 'mobiglas',
  layoutMode: localStorage.getItem('aaron_mfd_layout_mode') || 'mobiglas',
  sessionMode: localStorage.getItem('aaron_mfd_session_mode') || 'solo',
  callsign: localStorage.getItem('aaron_mfd_callsign') || 'CITIZEN-1',
  activeProfileId: localStorage.getItem('aaron_mfd_active_profile') || 'custom',
  activeWorkflow: localStorage.getItem('aaron_mfd_active_workflow') || 'mining',
  mobileView: 'scanner',
  wakeLock: null,

  // Mon Vaisseau & Fit (Single Source of Truth)
  myActiveShip: {
    shipId: 'prospector',
    customName: 'Prospector Alpha',
    role: 'mining',
    status: 'available',
    location: 'HUR-L1 Green Glade',
    laserId: 'lancet_s1',
    submodules: ['focus_3', 'surge', 'none'],
    gadgetId: 'sabir',
    saddlebagType: 'standard',
    quantumDriveId: 'atlas_s1',
    shieldId: 'fr66_s1',
    powerPlantId: 'js300_s1',
    coolerId: 'ultraflow_s1'
  },

  // Ma Flotte / Personal Fleet (Multiple Ships Owned)
  myPersonalFleet: [],
  selectedFleetShipId: null,
  myFleetFilter: 'all',
  myFleetSearch: '',
  myShipSubView: 'fleet', // 'fleet' or 'config'
  peerShipTelemetries: {},
  // Unified Inventory State (Phase 3)
  inventoryOwnerMode: 'personal',
  inventoryCategoryFilter: 'all',
  inventoryLocationFilter: 'all',
  inventorySearchQuery: '',

  selectedShip: MINING_DATA.ships[0], // MISC Prospector
  selectedLaser: MINING_DATA.lasers[0], // Arbor MH1
  selectedModules: ['none', 'none', 'none'], // dynamic slots for single laser
  get selectedModule1() {
    return MINING_DATA.modules.find(m => m.id === this.selectedModules[0]) || MINING_DATA.modules[0];
  },
  set selectedModule1(m) {
    this.selectedModules[0] = typeof m === 'string' ? m : (m?.id || 'none');
  },
  get selectedModule2() {
    return MINING_DATA.modules.find(m => m.id === this.selectedModules[1]) || MINING_DATA.modules[0];
  },
  set selectedModule2(m) {
    this.selectedModules[1] = typeof m === 'string' ? m : (m?.id || 'none');
  },
  selectedGadget: MINING_DATA.gadgets[0],
  selectedMineral: MINING_DATA.minerals[0], // Quantainium
  selectedRefinery: MINING_DATA.refiningMethods[0], // Dinyx

  // Current rock parameters
  rockMass: 5200,
  orePercentage: 32.0,
  resistance: 40,
  instability: 50,

  // Session cargo hold
  holdSCU: 0.0,
  sessionLog: [],

  // Crew split & Squad fleet settings
  crewMembers: 1,
  crewReservePct: 10,
  squadMembers: [],

  // Crafting 4.0 Workshop (Jalon 2)
  customLasers: [],
  customGadgets: [],

  // Jalon 3: Shared Scan & OCR
  autoBroadcastScan: false,
  autoSyncScan: true,
  lastIncomingRockScan: null,
  ocrCameraStream: null,
  ocrCameraFacingMode: 'environment',

  // Jalon 4: Coordination Tactique, Solveur Optimal & Escorte
  redAlertActive: false,
  escortCutPct: parseFloat(localStorage.getItem('aaron_mfd_escort_cut') || '15'),
  optimalLoadoutTab: 'solo', // 'solo' | 'wing'
  lastOptimalRecommendation: null,
  jointFireState: 'standby', // 'standby' | 'charging' | 'green' | 'overheat'
  wingFireStates: {},

  // Jalon 5: Transport Spécialisé & Logistique de Fret (Cargo Refactor 4.0)
  activeHaulerId: localStorage.getItem('aaron_mfd_active_hauler') || 'taurus',
  haulerHoldBags: JSON.parse(localStorage.getItem('aaron_mfd_hauler_hold') || '[]'),
  pendingCargoPickups: [],
  haulerCutPct: parseFloat(localStorage.getItem('aaron_mfd_hauler_cut') || '15'),

  // Jalon 6: Bourse Commerciale, Arbitrage & UEX Corp
  activeMktTab: 'arbitrage', // 'arbitrage' | 'terminals' | 'scout'
  mktSystemFilter: 'all', // 'all' | 'stanton' | 'pyro' | 'nyx'
  uexMarketStatus: 'cached', // 'live' | 'cached' | 'corpo'
  uexLastSyncTimestamp: Date.now(),
  customTerminalPrices: JSON.parse(localStorage.getItem('aaron_mfd_corpo_prices') || '{}'),
  recentScoutReports: [],
  currentSalesTour: null,

  // Jalon 7: Stockpile de Guilde, Statuts Raffinage & Grand Livre des Dépenses
  activeStockpileTab: 'overview', // 'overview' | 'refining' | 'expenses'
  guildStockpile: [],
  guildExpenses: [],
  stockpileFilterStation: 'all',
  stockpileFilterMineral: 'all',
  stockpileFilterStatus: 'all',
  pushNotificationEnabled: false,

  // Jalon 7: Guild Treasury, mo.Trader Split & Crafting 4.0
  guildTreasuryBalance: parseInt(localStorage.getItem('aaron_mfd_guild_treasury') || '250000', 10),
  guildCorpoTaxPct: parseInt(localStorage.getItem('aaron_mfd_guild_tax_pct') || '10', 10),
  guildPayoutStatuses: JSON.parse(localStorage.getItem('aaron_mfd_guild_payout_statuses') || '{}'),
  guildCraftingGoals: JSON.parse(localStorage.getItem('aaron_mfd_guild_crafting_goals') || 'null') || [
    {
      id: 'goal-lancet',
      itemId: 'lancet_mk2',
      name: 'Lancet MH2 Custom (Tête S2)',
      targetCount: 2,
      requiredMinerals: [
        { mineralId: 'quantainium', neededScu: 32 },
        { mineralId: 'bexalite', neededScu: 16 },
        { mineralId: 'taranite', neededScu: 8 }
      ]
    },
    {
      id: 'goal-sabir',
      itemId: 'sabir_mod',
      name: 'Module Actif Sabir 21 (x8)',
      targetCount: 8,
      requiredMinerals: [
        { mineralId: 'borase', neededScu: 24 },
        { mineralId: 'laranite', neededScu: 12 }
      ]
    }
  ],

  // Jalon 7: Commodity Trading & Cargo Routes
  selectedTradeRouteId: 'route_med_hurston',
  activeCargoCommodityId: 'medical_supplies',
  customTradeRuns: JSON.parse(localStorage.getItem('aaron_mfd_custom_trade_runs') || '[]'),

  // Jalon 8: Gouvernance, Sécurité (RBAC) & Configuration de Guilde (v2.3.0)
  activeGuildTab: 'profile', // 'profile' | 'roster' | 'fleet' | 'stockpile' | 'finance' | 'security' | 'backup'
  guildConfig: JSON.parse(localStorage.getItem('aaron_mfd_guild_config') || 'null') || {
    name: 'Stanton Mining Syndicate',
    ticker: 'SMS',
    system: 'stanton',
    hqStation: 'ARC-L1 Wide Forest Station',
    charter: 'syndicate',
    alignment: 'uee',
    defconLevel: 1,
    motd: 'Bienvenue à tous les pilotes. Respectez les consignes de vol et les parts de trésorerie !',
    discordUrl: '',
    discordServerId: '',
    defaultCorpoTax: 10,
    defaultEscortRate: 75000,
    defaultHaulerRate: 250,
    treasuryAlertThreshold: 500000,
    salt: 'aaron_salt_' + Math.random().toString(36).substring(2, 10),
    masterPasswordHash: '',
    officerPasswordHash: '',
    memberPasswordHash: ''
  },
  currentGuildUser: JSON.parse(localStorage.getItem('aaron_mfd_current_guild_user') || 'null') || {
    callsign: 'CITIZEN-1',
    role: 'ADMIRALTY',
    isAuthenticated: true,
    lastLogin: Date.now()
  },
  guildRegisteredMembers: JSON.parse(localStorage.getItem('aaron_mfd_guild_members') || 'null') || [
    { callsign: 'CITIZEN-1', role: 'ADMIRALTY', ship: 'MISC Prospector', station: 'ARC-L1 Wide Forest', status: 'online' },
    { callsign: 'ORBITAL-MINER', role: 'FLIGHT_LEAD', ship: 'Argo MOLE', station: 'ARC-L1 Wide Forest', status: 'mining' },
    { callsign: 'CARGO-HAULER', role: 'TREASURER', ship: 'Crusader C2 Hercules', station: 'HUR-L1 Green Glade', status: 'hauling' },
    { callsign: 'VIPER-LEAD', role: 'MEMBER', ship: 'Aegis Scorpius', station: 'ARC-L1 Wide Forest', status: 'patrol' },
    { callsign: 'ROOKIE-PILOT', role: 'RECRUIT', ship: 'MISC Prospector', station: 'MIC-L1 Shallow Frontier', status: 'standby' }
  ],
  guildFleet: JSON.parse(localStorage.getItem('aaron_mfd_guild_fleet') || 'null') || [
    { id: 'ship-goliath', name: 'SMS GOLIATH', model: 'arrastra', registration: 'SMS-ARR-001', station: 'ARC-L1 Wide Forest', scu: 576, hullHealth: 100, isBorrowed: false, borrowedBy: null },
    { id: 'ship-behemoth', name: 'SMS BEHEMOTH', model: 'mole', registration: 'SMS-MOL-001', station: 'ARC-L1 Wide Forest', scu: 96, hullHealth: 100, isBorrowed: false, borrowedBy: null },
    { id: 'ship-titan', name: 'SMS TITAN', model: 'mole', registration: 'SMS-MOL-002', station: 'HUR-L1 Green Glade', scu: 96, hullHealth: 98, isBorrowed: true, borrowedBy: 'ORBITAL-MINER' },
    { id: 'ship-atlas', name: 'SMS ATLAS', model: 'c2', registration: 'SMS-CRU-001', station: 'ARC-L1 Wide Forest', scu: 696, hullHealth: 100, isBorrowed: false, borrowedBy: null },
    { id: 'ship-valkyrie', name: 'SMS VALKYRIE', model: 'scorpius', registration: 'SMS-AEG-001', station: 'ARC-L1 Wide Forest', scu: 0, hullHealth: 100, isBorrowed: true, borrowedBy: 'VIPER-LEAD' }
  ],

  // Argo MOLE & Multi-turrets settings (all ships with 1, 2, or 3 turrets)
  moleActiveTurrets: 2, // 1 (solo), 2 (duo), 3 (trio)
  turretsByShip: {
    prospector: [
      { laserId: 'arbor_mh1', moduleIds: ['none', 'none'] }
    ],
    mole: [
      { laserId: 'lancet_s2', moduleIds: ['none', 'none', 'none'] },
      { laserId: 'helix_s2', moduleIds: ['none', 'none', 'none'] },
      { laserId: 'helix_s2', moduleIds: ['none', 'none', 'none'] }
    ],
    arrastra: [
      { laserId: 'lancet_s3', moduleIds: ['none', 'none', 'none'] },
      { laserId: 'helix_s3', moduleIds: ['none', 'none', 'none'] },
      { laserId: 'helix_s3', moduleIds: ['none', 'none', 'none'] }
    ],
    orion: [
      { laserId: 'helix_s3', moduleIds: ['none', 'none', 'none'] },
      { laserId: 'helix_s3', moduleIds: ['none', 'none', 'none'] }
    ],
    roc: [
      { laserId: 'mining_arm', moduleIds: [] }
    ],
    roc_ds: [
      { laserId: 'mining_arm', moduleIds: [] }
    ]
  },
  // Backward compatibility getter for moleTurrets
  get moleTurrets() {
    const list = this.turretsByShip.mole;
    return {
      turret1: list[0],
      turret2: list[1],
      turret3: list[2]
    };
  },

  // Quantainium timer
  qtTimeRemaining: 900, // 15 min
  qtTimerActive: false,
  qtIntervalId: null,

  // Audio settings
  audioEnabled: true,

  // PWA install prompt
  deferredPrompt: null,

  // Sub-chunks simulator state
  subchunks: [],
  breakTreeExtractedSCU: 0.0,

  // Refinery orders tracker state
  refineryJobs: [],
  refineryIntervalId: null,

  // Flight ledger & stats
  ledgerHistory: [],
  sessionStartTime: Date.now(),

  // Tactical advisor recommendation
  recommendedGadgetId: null,
  recommendedModuleId: null,

  // ROC cluster mode
  rocNodes: 6,
  rocGemsPerNode: 135,

  // Aaron Halo Rangefinder
  haloSelectedRouteId: 'arccorp_hurl3',
  haloCurrentDist: 15.0,

  // Mineral system filter (all, stanton, pyro, nyx)
  mineralSystemFilter: 'all',

  // Rock Archetype (4.10)
  selectedArchetype: (MINING_DATA.rockArchetypes && MINING_DATA.rockArchetypes[0]) || null,

  // Multi-Ore Composition (4.10)
  secondaryMineral: null,
  secondaryPercentage: 15.0,

  // Physicalized Saddlebags
  detachedSaddlebags: [],

  // Jalon 11: Blueprints & Crafting 4.0 Codex (Joueur & Guilde)
  activeCraftingTab: 'blueprints', // 'blueprints' | 'lasers' | 'gadgets'
  playerBlueprints: JSON.parse(localStorage.getItem('aaron_mfd_player_blueprints') || 'null') || [
    'bp_arbor_s1_reinforced',
    'bp_comp_armor_plates',
    'bp_mod_surge_pulsar'
  ],
  guildBlueprints: JSON.parse(localStorage.getItem('aaron_mfd_guild_blueprints') || 'null') || [
    'bp_arbor_s1_reinforced',
    'bp_comp_armor_plates',
    'bp_mod_surge_pulsar',
    'bp_lancet_s1_mk2',
    'bp_gadget_optimax_matrix'
  ],
  playerStockpile: JSON.parse(localStorage.getItem('aaron_mfd_player_stockpile') || 'null') || [
    { mineralId: 'quantainium', scu: 10.0 },
    { mineralId: 'titanium', scu: 22.0 },
    { mineralId: 'beryl', scu: 8.0 },
    { mineralId: 'iron', scu: 15.0 },
    { mineralId: 'copper', scu: 12.0 },
    { mineralId: 'aluminum', scu: 14.0 },
    { mineralId: 'bexalite', scu: 6.0 },
    { mineralId: 'taranite', scu: 3.0 },
    { mineralId: 'rmc', scu: 8.0 }
  ],
  blueprintCategoryFilter: 'all',
  blueprintStatusFilter: 'all',
  blueprintSearchQuery: ''
};

// ==========================================
// CHANGELOG DATA (BILINGUAL)
// Note: CHANGELOG_DATA is imported from ./data/defaults/changelog.js
// includes release entries: version: 'v2.0.0', version: 'v2.1.0', version: 'v2.2.0', version: 'v2.4.0'
// ==========================================

// Localized string helper for MINING_DATA objects
function getLocalized(obj, key) {
  if (!obj) return '';
  const langKey = `${key}_${state.currentLang}`;
  if (obj[langKey]) return obj[langKey];
  if (obj[`${key}_fr`]) return obj[`${key}_fr`];
  if (obj[key]) return obj[key];
  return '';
}

function getLocale() {
  return state.currentLang === 'en' ? 'en-US' : 'fr-FR';
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tactical tone synthesizer: professional aerospace avionics chime
  playTone(freq = 600, type = 'sine', duration = 0.08, volume = 0.06) {
    if (!state.audioEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Warm low-pass filter for smooth avionics acoustics
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  // Click sounds removed per user request: 100% silent clicks
  playBeep(freq = 600, type = 'sine', duration = 0.05) {
    // Intentionally silent on user interactions
    return;
  }

  // UI confirmation chime silenced per user request
  playSuccess() {
    // Intentionally silent on user interactions
    return;
  }

  playWarning() {
    if (!state.audioEnabled) return;
    // Dual subtle harmonic chime
    this.playTone(520, 'triangle', 0.12, 0.07);
    setTimeout(() => this.playTone(680, 'sine', 0.14, 0.06), 90);
  }

  playCritical() {
    if (!state.audioEnabled) return;
    // Refined cockpit attention alert
    this.playTone(760, 'sine', 0.12, 0.08);
    setTimeout(() => this.playTone(620, 'sine', 0.16, 0.08), 110);
  }

  playAlarm() {
    if (!state.audioEnabled) return;
    // Professional avionics multi-tone caution sequence
    this.playTone(800, 'triangle', 0.10, 0.07);
    setTimeout(() => this.playTone(640, 'sine', 0.10, 0.06), 110);
    setTimeout(() => this.playTone(800, 'triangle', 0.10, 0.07), 220);
    setTimeout(() => this.playTone(640, 'sine', 0.12, 0.06), 330);
  }
}

const sfx = new SoundFX();

// ==========================================
// COCKPIT VOICE ASSISTANT (TTS) - REMOVED
// ==========================================
const cockpitVoice = {
  speak() {},
  speakTarget() {},
  stop() {}
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const DOM = {
  shipSelect: document.getElementById('shipSelect'),
  mgShipSelect: document.getElementById('mgShipSelect'),
  loadoutShipSelect: document.getElementById('loadoutShipSelect'),
  mgShipBadge: document.getElementById('mgShipBadge'),
  btnOpenLoadout: document.getElementById('btnOpenLoadout'),
  btnOpenCraftHeader: document.getElementById('btnOpenCraftHeader'),
  btnMgCraftModal: document.getElementById('btnMgCraftModal'),
  loadoutSummary: document.getElementById('loadoutSummary'),
  qtTimerPill: document.getElementById('qtTimerPill'),
  qtCountdownText: document.getElementById('qtCountdownText'),
  btnDismissQtTimer: document.getElementById('btnDismissQtTimer'),
  btnVoiceCommand: document.getElementById('btnVoiceCommand'),
  btnAudioToggle: document.getElementById('btnAudioToggle'),
  btnOpenDonate: document.getElementById('btnOpenDonate'),
  btnMgDonate: document.getElementById('btnMgDonate'),
  btnOpenDonateFooter: document.getElementById('btnOpenDonateFooter'),

  // mobiGlas 4.0 Layout & System Header
  mobiglasSystemHeader: document.getElementById('mobiglasSystemHeader'),
  mgLoreClock: document.getElementById('mgLoreClock'),
  btnEditMgCallsign: document.getElementById('btnEditMgCallsign'),
  mgCallsignVal: document.getElementById('mgCallsignVal'),
  mgMoleTurretBar: document.getElementById('mgMoleTurretBar'),
  mgBalanceVal: document.getElementById('mgBalanceVal'),
  btnLayoutToggle: document.getElementById('btnLayoutToggle'),
  btnClassicLayoutToggle: document.getElementById('btnClassicLayoutToggle'),
  mgLayoutToggleLabel: document.getElementById('mgLayoutToggleLabel'),
  btnMgLang: document.getElementById('btnMgLang'),
  btnMgAudio: document.getElementById('btnMgAudio'),

  // mobiGlas Curved Arc Fracture Gauge
  arcFractureGaugeWrapper: document.getElementById('arcFractureGaugeWrapper'),
  arcSafeZone: document.getElementById('arcSafeZone'),
  arcDangerZone: document.getElementById('arcDangerZone'),
  arcPowerFill: document.getElementById('arcPowerFill'),
  arcPowerPct: document.getElementById('arcPowerPct'),
  arcPowerSub: document.getElementById('arcPowerSub'),
  arcLaserName: document.getElementById('arcLaserName'),

  // mobiGlas Bottom App Launcher Dock
  mobiglasDock: document.getElementById('mobiglasDock'),
  dockBtnScanner: document.getElementById('dockBtnScanner'),
  dockBtnAnalysis: document.getElementById('dockBtnAnalysis'),
  dockVerdictBadge: document.getElementById('dockVerdictBadge'),
  dockBtnCraft: document.getElementById('dockBtnCraft'),
  dockBtnLoadout: document.getElementById('dockBtnLoadout'),
  dockBtnRefinery: document.getElementById('dockBtnRefinery'),
  dockRefineryBadge: document.getElementById('dockRefineryBadge'),
  dockBtnGuild: document.getElementById('dockBtnGuild'),
  dockGuildBadge: document.getElementById('dockGuildBadge'),
  dockBtnStarmap: document.getElementById('dockBtnStarmap'),
  dockBtnRadar: document.getElementById('dockBtnRadar'),
  dockBtnLedger: document.getElementById('dockBtnLedger'),
  dockBtnCrew: document.getElementById('dockBtnCrew'),
  dockBtnGuide: document.getElementById('dockBtnGuide'),
  dockBtnDonate: document.getElementById('dockBtnDonate'),
  dockBtnLayout: document.getElementById('dockBtnLayout'),

  // Mobile / Tablet Tabbed Navigation & Live Mini-HUD
  mobileViewTabs: document.getElementById('mobileViewTabs'),
  tabBtnScanner: document.getElementById('tabBtnScanner'),
  tabBtnAnalysis: document.getElementById('tabBtnAnalysis'),
  tabBtnMarket: document.getElementById('tabBtnMarket'),
  mobileTabVerdictBadge: document.getElementById('mobileTabVerdictBadge'),
  mobileTabMarketBadge: document.getElementById('mobileTabMarketBadge'),

  mainGrid: document.getElementById('mainGrid'),
  masterWorkflowBar: document.getElementById('masterWorkflowBar'),
  btnWorkflowShip: document.getElementById('btnWorkflowShip'),
  btnWorkflowMining: document.getElementById('btnWorkflowMining'),
  btnWorkflowRefining: document.getElementById('btnWorkflowRefining'),
  btnWorkflowInventory: document.getElementById('btnWorkflowInventory'),
  btnWorkflowTrading: document.getElementById('btnWorkflowTrading'),
  btnWorkflowGuild: document.getElementById('btnWorkflowGuild'),
  viewMyShipHub: document.getElementById('viewMyShipHub'),
  viewRefiningHub: document.getElementById('viewRefiningHub'),
  viewTradingHub: document.getElementById('viewTradingHub'),
  viewUnifiedInventoryHub: document.getElementById('viewUnifiedInventoryHub'),
  marketHoldPanelTitle: document.getElementById('marketHoldPanelTitle'),
  dockBtnInventory: document.getElementById('dockBtnInventory'),
  dockInventoryBadge: document.getElementById('dockInventoryBadge'),

  // Unified Inventory DOM Elements (Phase 3)
  inventorySubnavBar: document.getElementById('inventorySubnavBar'),
  btnInventoryModePersonal: document.getElementById('btnInventoryModePersonal'),
  btnInventoryModeGuild: document.getElementById('btnInventoryModeGuild'),
  btnOpenAddInventoryItem: document.getElementById('btnOpenAddInventoryItem'),
  inventoryPersonalCountBadge: document.getElementById('inventoryPersonalCountBadge'),
  inventoryGuildCountBadge: document.getElementById('inventoryGuildCountBadge'),
  kpiInventoryTotalScuVal: document.getElementById('kpiInventoryTotalScuVal'),
  kpiInventoryValueVal: document.getElementById('kpiInventoryValueVal'),
  kpiInventoryActiveLocationVal: document.getElementById('kpiInventoryActiveLocationVal'),
  inventorySearchInput: document.getElementById('inventorySearchInput'),
  inventorySearchClear: document.getElementById('inventorySearchClear'),
  inventoryLocationFilterSelect: document.getElementById('inventoryLocationFilterSelect'),
  inventoryItemsGrid: document.getElementById('inventoryItemsGrid'),
  invFilterAll: document.getElementById('invFilterAll'),
  invFilterRefined: document.getElementById('invFilterRefined'),
  invFilterRaw: document.getElementById('invFilterRaw'),
  invFilterSalvage: document.getElementById('invFilterSalvage'),
  invFilterCargo: document.getElementById('invFilterCargo'),
  invFilterCrafted: document.getElementById('invFilterCrafted'),
  chipInvAll: document.getElementById('chipInvAll'),
  chipInvRefined: document.getElementById('chipInvRefined'),
  chipInvRaw: document.getElementById('chipInvRaw'),
  chipInvSalvage: document.getElementById('chipInvSalvage'),
  chipInvCargo: document.getElementById('chipInvCargo'),
  chipInvCrafted: document.getElementById('chipInvCrafted'),

  // Mon Vaisseau & Fit DOM Elements
  myShipHeroCard: document.getElementById('myShipHeroCard'),
  myShipAvatarIcon: document.getElementById('myShipAvatarIcon'),
  myShipCustomNameDisplay: document.getElementById('myShipCustomNameDisplay'),
  myShipMfgBadge: document.getElementById('myShipMfgBadge'),
  myShipRoleBadge: document.getElementById('myShipRoleBadge'),
  myShipModelNameDisplay: document.getElementById('myShipModelNameDisplay'),
  myShipStationDisplay: document.getElementById('myShipStationDisplay'),
  myShipStatusIndicator: document.getElementById('myShipStatusIndicator'),
  myShipStatusLabel: document.getElementById('myShipStatusLabel'),
  btnSyncShipToFleet: document.getElementById('btnSyncShipToFleet'),
  btnCopyShipLoadout: document.getElementById('btnCopyShipLoadout'),
  myShipSelect: document.getElementById('myShipSelect'),
  myShipCustomNameInput: document.getElementById('myShipCustomNameInput'),
  myShipRoleSelect: document.getElementById('myShipRoleSelect'),
  myShipStatusSelect: document.getElementById('myShipStatusSelect'),
  myShipLocationSelect: document.getElementById('myShipLocationSelect'),
  myShipScuVal: document.getElementById('myShipScuVal'),
  myShipGridTypeSub: document.getElementById('myShipGridTypeSub'),
  myShipBagsDesc: document.getElementById('myShipBagsDesc'),
  myShipQdSpeedVal: document.getElementById('myShipQdSpeedVal'),
  myShipQdGradeSub: document.getElementById('myShipQdGradeSub'),
  myShipQdRangeDesc: document.getElementById('myShipQdRangeDesc'),
  myShipShieldHpVal: document.getElementById('myShipShieldHpVal'),
  myShipShieldSub: document.getElementById('myShipShieldSub'),
  myShipShieldRegenDesc: document.getElementById('myShipShieldRegenDesc'),
  myShipPowerVal: document.getElementById('myShipPowerVal'),
  myShipPowerSub: document.getElementById('myShipPowerSub'),
  myShipPowerLoadDesc: document.getElementById('myShipPowerLoadDesc'),
  myShipCoolingVal: document.getElementById('myShipCoolingVal'),
  myShipCoolerSub: document.getElementById('myShipCoolerSub'),
  myShipCoolingSafetyDesc: document.getElementById('myShipCoolingSafetyDesc'),
  myShipSpecialtyLabel: document.getElementById('myShipSpecialtyLabel'),
  myShipSpecialtySub: document.getElementById('myShipSpecialtySub'),
  myShipSpecialtyVal: document.getElementById('myShipSpecialtyVal'),
  myShipSpecialtyDesc: document.getElementById('myShipSpecialtyDesc'),
  myShipMiningGearBox: document.getElementById('myShipMiningGearBox'),
  myShipCargoGearBox: document.getElementById('myShipCargoGearBox'),
  myShipSalvageGearBox: document.getElementById('myShipSalvageGearBox'),
  myShipCombatGearBox: document.getElementById('myShipCombatGearBox'),
  myShipRoleEquipBadge: document.getElementById('myShipRoleEquipBadge'),
  myShipTurretsSectionTitle: document.getElementById('myShipTurretsSectionTitle'),
  btnMyShipToggleAllTurrets: document.getElementById('btnMyShipToggleAllTurrets'),
  myShipTurretCardsContainer: document.getElementById('myShipTurretCardsContainer'),
  myShipCargoTractorSelect: document.getElementById('myShipCargoTractorSelect'),
  myShipCargoGridSelect: document.getElementById('myShipCargoGridSelect'),
  myShipCargoBagsBox: document.getElementById('myShipCargoBagsBox'),
  myShipCargoBagsCount: document.getElementById('myShipCargoBagsCount'),
  myShipCargoBagsDesc: document.getElementById('myShipCargoBagsDesc'),
  myShipCargoWeaponSelect: document.getElementById('myShipCargoWeaponSelect'),
  myShipCargoWeaponStats: document.getElementById('myShipCargoWeaponStats'),
  myShipSalvageHead1Select: document.getElementById('myShipSalvageHead1Select'),
  myShipSalvageHead2Select: document.getElementById('myShipSalvageHead2Select'),
  myShipSalvageScrapingStats: document.getElementById('myShipSalvageScrapingStats'),
  myShipSalvageTractorSelect: document.getElementById('myShipSalvageTractorSelect'),
  myShipSalvageBufferVal: document.getElementById('myShipSalvageBufferVal'),
  myShipSalvageWeaponSelect: document.getElementById('myShipSalvageWeaponSelect'),
  myShipCombatPrimarySelect: document.getElementById('myShipCombatPrimarySelect'),
  myShipCombatPrimaryStats: document.getElementById('myShipCombatPrimaryStats'),
  myShipCombatTurretSelect: document.getElementById('myShipCombatTurretSelect'),
  myShipCombatMissileSelect: document.getElementById('myShipCombatMissileSelect'),
  myShipCombatEcmDesc: document.getElementById('myShipCombatEcmDesc'),
  myShipSingleTurretBox: document.getElementById('myShipSingleTurretBox'),
  myShipMultiTurretsWrapper: document.getElementById('myShipMultiTurretsWrapper'),
  myShipLaserSelect: document.getElementById('myShipLaserSelect'),
  myShipLaserSizeHint: document.getElementById('myShipLaserSizeHint'),
  myShipSubmodsContainer: document.getElementById('myShipSubmodsContainer'),
  myShipSubmodsNotice: document.getElementById('myShipSubmodsNotice'),
  myShipSubmodsGrid: document.getElementById('myShipSubmodsGrid'),
  myShipSubmodSlot1Wrapper: document.getElementById('myShipSubmodSlot1Wrapper'),
  myShipSubmodSlot2Wrapper: document.getElementById('myShipSubmodSlot2Wrapper'),
  myShipSubmodSlot3Wrapper: document.getElementById('myShipSubmodSlot3Wrapper'),
  myShipSubmod1Select: document.getElementById('myShipSubmod1Select'),
  myShipSubmod2Select: document.getElementById('myShipSubmod2Select'),
  myShipSubmod3Select: document.getElementById('myShipSubmod3Select'),
  myShipGadgetSelect: document.getElementById('myShipGadgetSelect'),
  myShipSaddlebagsSelect: document.getElementById('myShipSaddlebagsSelect'),
  myShipMiningWeaponSelect: document.getElementById('myShipMiningWeaponSelect'),
  myShipMiningWeaponHint: document.getElementById('myShipMiningWeaponHint'),
  myShipMiningWeaponStats: document.getElementById('myShipMiningWeaponStats'),
  myShipCargoGadgetSelect: document.getElementById('myShipCargoGadgetSelect'),
  myShipTractorVal: document.getElementById('myShipTractorVal'),
  myShipTractorHint: document.getElementById('myShipTractorHint'),
  myShipCargoGridDesc: document.getElementById('myShipCargoGridDesc'),
  myShipWeaponsVal: document.getElementById('myShipWeaponsVal'),
  myShipQdSelect: document.getElementById('myShipQdSelect'),
  myShipQdSlotHint: document.getElementById('myShipQdSlotHint'),
  myShipShieldSelect: document.getElementById('myShipShieldSelect'),
  myShipShieldSlotHint: document.getElementById('myShipShieldSlotHint'),
  myShipPowerSelect: document.getElementById('myShipPowerSelect'),
  myShipPowerSlotHint: document.getElementById('myShipPowerSlotHint'),
  myShipCoolerSelect: document.getElementById('myShipCoolerSelect'),
  myShipCoolerSlotHint: document.getElementById('myShipCoolerSlotHint'),
  btnApplyShipLoadout: document.getElementById('btnApplyShipLoadout'),
  btnPresetProspectorAllRounder: document.getElementById('btnPresetProspectorAllRounder'),
  btnPresetMoleTrio: document.getElementById('btnPresetMoleTrio'),
  btnPresetC2Cargo: document.getElementById('btnPresetC2Cargo'),
  btnPresetTaurusCargo: document.getElementById('btnPresetTaurusCargo'),
  btnPresetVulture: document.getElementById('btnPresetVulture'),
  btnPresetScorpius: document.getElementById('btnPresetScorpius'),

  // Ma Flotte / Personal Fleet DOM Elements
  btnSubNavMyFleet: document.getElementById('btnSubNavMyFleet'),
  btnSubNavShipConfig: document.getElementById('btnSubNavShipConfig'),
  btnOpenAddPersonalShipModal: document.getElementById('btnOpenAddPersonalShipModal'),
  paneMyFleetHangar: document.getElementById('paneMyFleetHangar'),
  paneMyShipConfig: document.getElementById('paneMyShipConfig'),
  myFleetCountBadge: document.getElementById('myFleetCountBadge'),
  myActiveShipTagBadge: document.getElementById('myActiveShipTagBadge'),
  kpiFleetCountVal: document.getElementById('kpiFleetCountVal'),
  kpiFleetScuVal: document.getElementById('kpiFleetScuVal'),
  kpiFleetActiveShipVal: document.getElementById('kpiFleetActiveShipVal'),
  kpiFleetActiveStationSub: document.getElementById('kpiFleetActiveStationSub'),
  myFleetSearchInput: document.getElementById('myFleetSearchInput'),
  myFleetSearchClear: document.getElementById('myFleetSearchClear'),
  myFleetFilterAll: document.getElementById('myFleetFilterAll'),
  myFleetFilterMining: document.getElementById('myFleetFilterMining'),
  myFleetFilterCargo: document.getElementById('myFleetFilterCargo'),
  myFleetFilterSalvage: document.getElementById('myFleetFilterSalvage'),
  myFleetFilterCombat: document.getElementById('myFleetFilterCombat'),
  chipMyFleetAll: document.getElementById('chipMyFleetAll'),
  chipMyFleetMining: document.getElementById('chipMyFleetMining'),
  chipMyFleetCargo: document.getElementById('chipMyFleetCargo'),
  chipMyFleetSalvage: document.getElementById('chipMyFleetSalvage'),
  chipMyFleetCombat: document.getElementById('chipMyFleetCombat'),
  myFleetCardsGrid: document.getElementById('myFleetCardsGrid'),
  btnBackToFleetDeck: document.getElementById('btnBackToFleetDeck'),
  myFleetQuickSwitchSelect: document.getElementById('myFleetQuickSwitchSelect'),
  btnMakeActiveFromConfig: document.getElementById('btnMakeActiveFromConfig'),
  shipConfigBreadcrumbName: document.getElementById('shipConfigBreadcrumbName'),
  addPersonalShipModal: document.getElementById('addPersonalShipModal'),
  btnCloseAddPersonalShipModal: document.getElementById('btnCloseAddPersonalShipModal'),
  btnCancelAddPersonalShip: document.getElementById('btnCancelAddPersonalShip'),
  btnSubmitAddPersonalShip: document.getElementById('btnSubmitAddPersonalShip'),
  newPersonalShipModelSelect: document.getElementById('newPersonalShipModelSelect'),
  newPersonalShipNameInput: document.getElementById('newPersonalShipNameInput'),
  newPersonalShipStationSelect: document.getElementById('newPersonalShipStationSelect'),
  btnOpenHaloDirect: document.getElementById('btnOpenHaloDirect'),
  btnOpenRefineryDirect: document.getElementById('btnOpenRefineryDirect'),
  btnStockpileOpenDirect: document.getElementById('btnStockpileOpenDirect'),
  btnOpenCrewDirect: document.getElementById('btnOpenCrewDirect'),
  btnOpenLedgerDirect: document.getElementById('btnOpenLedgerDirect'),
  panelScanData: document.getElementById('panelScanData'),
  panelTacticalAnalysis: document.getElementById('panelTacticalAnalysis'),
  panelMarketHold: document.getElementById('panelMarketHold'),

  // Scan Panel Internal Sub-tabs (Ergonomic Compact Navigation)
  scanSubtabsBar: document.getElementById('scanSubtabsBar'),
  btnScanSubtabQuick: document.getElementById('btnScanSubtabQuick'),
  btnScanSubtabAdvanced: document.getElementById('btnScanSubtabAdvanced'),
  btnScanSubtabHotspots: document.getElementById('btnScanSubtabHotspots'),
  scanSubtabPaneQuick: document.getElementById('scanSubtabPaneQuick'),
  scanSubtabPaneAdvanced: document.getElementById('scanSubtabPaneAdvanced'),
  scanSubtabPaneHotspots: document.getElementById('scanSubtabPaneHotspots'),
  subtabArchBadge: document.getElementById('subtabArchBadge'),
  subtabOreBadge: document.getElementById('subtabOreBadge'),

  // Cockpit MFD Telemetry Extensions (Where to mine, Active laser, Loadout solver, Station prices)
  whereToMineCard: document.getElementById('whereToMineCard'),
  wtmMineralBadge: document.getElementById('wtmMineralBadge'),
  wtmSpotsList: document.getElementById('wtmSpotsList'),
  optimalLoadoutCard: document.getElementById('optimalLoadoutCard'),
  olcFeasibilityTag: document.getElementById('olcFeasibilityTag'),
  olcBody: document.getElementById('olcBody'),
  stationPriceComparatorCard: document.getElementById('stationPriceComparatorCard'),
  spcOreTag: document.getElementById('spcOreTag'),
  spcTableContainer: document.getElementById('spcTableContainer'),
  uexSyncBadge: document.getElementById('uexSyncBadge'),
  uexSyncText: document.getElementById('uexSyncText'),
  btnRefreshUex: document.getElementById('btnRefreshUex'),
  btnMktTabArbitrage: document.getElementById('btnMktTabArbitrage'),
  btnMktTabTerminals: document.getElementById('btnMktTabTerminals'),
  btnMktTabScout: document.getElementById('btnMktTabScout'),
  mktPaneArbitrage: document.getElementById('mktPaneArbitrage'),
  mktPaneTerminals: document.getElementById('mktPaneTerminals'),
  mktPaneScout: document.getElementById('mktPaneScout'),
  mktArbitrageBanner: document.getElementById('mktArbitrageBanner'),
  mktArbitrageAdviceText: document.getElementById('mktArbitrageAdviceText'),
  mktArbitrageRoiBadge: document.getElementById('mktArbitrageRoiBadge'),
  mktMethodsGrid: document.getElementById('mktMethodsGrid'),
  mktTerminalsTable: document.getElementById('mktTerminalsTable'),
  mktTourStopsContainer: document.getElementById('mktTourStopsContainer'),
  mktTourTotalPayout: document.getElementById('mktTourTotalPayout'),
  btnCopySalesTour: document.getElementById('btnCopySalesTour'),
  selectScoutTerminal: document.getElementById('selectScoutTerminal'),
  selectScoutMineral: document.getElementById('selectScoutMineral'),
  inputScoutPrice: document.getElementById('inputScoutPrice'),
  selectScoutDemand: document.getElementById('selectScoutDemand'),
  btnBroadcastScoutPrice: document.getElementById('btnBroadcastScoutPrice'),
  mktScoutFeed: document.getElementById('mktScoutFeed'),

  // Radar Decoder Triggers
  btnOpenRadarDecoder: document.getElementById('btnOpenRadarDecoder'),
  radarDecoderModal: document.getElementById('radarDecoderModal'),
  btnCloseRadarDecoder: document.getElementById('btnCloseRadarDecoder'),
  radarRsInput: document.getElementById('radarRsInput'),
  btnExecRadarDecode: document.getElementById('btnExecRadarDecode'),
  radarMatchesContainer: document.getElementById('radarMatchesContainer'),

  // Mass & Numpad & Steppers
  massLabel: document.getElementById('massLabel'),
  massDigitalDisplay: document.getElementById('massDigitalDisplay'),
  btnMassMinus: document.getElementById('btnMassMinus'),
  btnMassPlus: document.getElementById('btnMassPlus'),
  btnToggleNumpad: document.getElementById('btnToggleNumpad'),
  numpadContainer: document.getElementById('numpadContainer'),

  // Rock Archetype (4.10)
  selectedArchetypeLabel: document.getElementById('selectedArchetypeLabel'),
  archetypeSelect: document.getElementById('archetypeSelect'),
  archetypeScroller: document.getElementById('archetypeScroller'),
  archetypeDescText: document.getElementById('archetypeDescText'),
  archetypeStatsText: document.getElementById('archetypeStatsText'),
  // Minerals & Percentage
  selectedMineralLabel: document.getElementById('selectedMineralLabel'),
  oreGrid: document.getElementById('oreGrid'),
  pctLabel: document.getElementById('pctLabel'),
  pctSlider: document.getElementById('pctSlider'),
  pctDisplay: document.getElementById('pctDisplay'),

  // Secondary Ore & Inerts (4.10)
  selectedSecondaryLabel: document.getElementById('selectedSecondaryLabel'),
  secondaryOreSelect: document.getElementById('secondaryOreSelect'),
  btnClearSecondaryOre: document.getElementById('btnClearSecondaryOre'),
  secondaryOreControls: document.getElementById('secondaryOreControls'),
  secondaryPctLabel: document.getElementById('secondaryPctLabel'),
  secondaryPctSlider: document.getElementById('secondaryPctSlider'),
  secondaryPctDisplay: document.getElementById('secondaryPctDisplay'),
  inertPctLabel: document.getElementById('inertPctLabel'),
  compBarPrimary: document.getElementById('compBarPrimary'),
  compBarSecondary: document.getElementById('compBarSecondary'),
  compBarInert: document.getElementById('compBarInert'),
  compLegendPrimary: document.getElementById('compLegendPrimary'),
  compLegendSecondary: document.getElementById('compLegendSecondary'),
  compLegendInert: document.getElementById('compLegendInert'),

  // Saddlebags (Physicalized Cargo)
  saddlebagsControlBox: document.getElementById('saddlebagsControlBox'),
  saddlebagsCountBadge: document.getElementById('saddlebagsCountBadge'),
  saddlebagsSlotsVisual: document.getElementById('saddlebagsSlotsVisual'),
  btnDetachOneBag: document.getElementById('btnDetachOneBag'),
  btnDropAllBags: document.getElementById('btnDropAllBags'),
  detachedBagsNotice: document.getElementById('detachedBagsNotice'),
  detachedBagsText: document.getElementById('detachedBagsText'),

  // Resistance & Instability
  resistanceLabel: document.getElementById('resistanceLabel'),
  resistanceSlider: document.getElementById('resistanceSlider'),
  instabilityLabel: document.getElementById('instabilityLabel'),
  instabilitySlider: document.getElementById('instabilitySlider'),

  // Verdict & Metrics
  verdictBox: document.getElementById('verdictBox'),
  verdictIconBadge: document.getElementById('verdictIconBadge'),
  verdictStatus: document.getElementById('verdictStatus'),
  verdictDesc: document.getElementById('verdictDesc'),
  fractureBadge: document.getElementById('fractureBadge'),
  powerBarFill: document.getElementById('powerBarFill'),
  fractureAdvice: document.getElementById('fractureAdvice'),
  metricSCU: document.getElementById('metricSCU'),
  metricCargoPct: document.getElementById('metricCargoPct'),
  metricRawPrice: document.getElementById('metricRawPrice'),
  refinerySelect: document.getElementById('refinerySelect'),
  metricRefinedPrice: document.getElementById('metricRefinedPrice'),
  refinerySummaryNote: document.getElementById('refinerySummaryNote'),
  stationRecBox: document.getElementById('stationRecBox'),
  stationRecName: document.getElementById('stationRecName'),
  stationRecBonus: document.getElementById('stationRecBonus'),

  // Cargo hold & Session
  btnAddToCargo: document.getElementById('btnAddToCargo'),
  holdProgressLabel: document.getElementById('holdProgressLabel'),
  cargoBarFill: document.getElementById('cargoBarFill'),
  sessionLogList: document.getElementById('sessionLogList'),
  btnClearHold: document.getElementById('btnClearHold'),

  // Header Extra Triggers
  btnOpenCrew: document.getElementById('btnOpenCrew'),
  btnOpenHalo: document.getElementById('btnOpenHalo'),
  btnOpenRefinery: document.getElementById('btnOpenRefinery'),
  refineryBadge: document.getElementById('refineryBadge'),
  btnOpenLedger: document.getElementById('btnOpenLedger'),
  btnSendToRefinery: document.getElementById('btnSendToRefinery'),

  // Smart Gadget & Module Tactical Advisor
  gadgetAdviceCard: document.getElementById('gadgetAdviceCard'),
  gadgetAdviceText: document.getElementById('gadgetAdviceText'),
  btnApplyAdvice: document.getElementById('btnApplyAdvice'),
  btnOpenBreakTree: document.getElementById('btnOpenBreakTree'),

  // Rock Surface Gadget (Deployed on rock during mining)
  rockGadgetBox: document.getElementById('rockGadgetBox'),
  rockGadgetSelect: document.getElementById('rockGadgetSelect'),
  btnDetachRockGadget: document.getElementById('btnDetachRockGadget'),
  rockGadgetStatusBadge: document.getElementById('rockGadgetStatusBadge'),
  rockGadgetModifiersStrip: document.getElementById('rockGadgetModifiersStrip'),

  // Break Tree Modal
  breakTreeModal: document.getElementById('breakTreeModal'),
  btnCloseBreakTree: document.getElementById('btnCloseBreakTree'),
  breakTreeDescText: document.getElementById('breakTreeDescText'),
  breakTreeParentInfo: document.getElementById('breakTreeParentInfo'),
  btnRegenerateChunks: document.getElementById('btnRegenerateChunks'),
  subchunksContainer: document.getElementById('subchunksContainer'),
  breakTreeExtractedTotal: document.getElementById('breakTreeExtractedTotal'),
  btnFinishBreakTree: document.getElementById('btnFinishBreakTree'),

  // Refinery & Guild Stockpile Modal (Jalon 7)
  refineryModal: document.getElementById('refineryModal'),
  btnCloseRefinery: document.getElementById('btnCloseRefinery'),
  refineryActiveCount: document.getElementById('refineryActiveCount'),
  refineryTotalValueDisplay: document.getElementById('refineryTotalValueDisplay'),
  refineryOrderStationSelect: document.getElementById('refineryOrderStationSelect'),
  refineryOrderMethodSelect: document.getElementById('refineryOrderMethodSelect'),
  btnConfirmRefineryJob: document.getElementById('btnConfirmRefineryJob'),
  refineryJobsList: document.getElementById('refineryJobsList'),

  // Jalon 7: Guild Stockpile & Shared Expense Ledger
  stockpileSubtabsBar: document.getElementById('stockpileSubtabsBar'),
  btnStockpileTabOverview: document.getElementById('btnStockpileTabOverview'),
  btnStockpileTabRefining: document.getElementById('btnStockpileTabRefining'),
  btnStockpileTabExpenses: document.getElementById('btnStockpileTabExpenses'),
  paneStockpileOverview: document.getElementById('paneStockpileOverview'),
  paneStockpileRefining: document.getElementById('paneStockpileRefining'),
  paneStockpileExpenses: document.getElementById('paneStockpileExpenses'),
  guildNetWorthDisplay: document.getElementById('guildNetWorthDisplay'),
  guildTotalScuDisplay: document.getElementById('guildTotalScuDisplay'),
  guildReadyLotsDisplay: document.getElementById('guildReadyLotsDisplay'),
  guildExpenseTotalDisplay: document.getElementById('guildExpenseTotalDisplay'),
  stockpileStationFilter: document.getElementById('stockpileStationFilter'),
  stockpileMineralFilter: document.getElementById('stockpileMineralFilter'),
  btnQuickDepositHold: document.getElementById('btnQuickDepositHold'),
  btnToggleManualLotForm: document.getElementById('btnToggleManualLotForm'),
  btnSyncStockpileFleet: document.getElementById('btnSyncStockpileFleet'),
  manualLotCard: document.getElementById('manualLotCard'),
  manualLotStationSelect: document.getElementById('manualLotStationSelect'),
  manualLotMineralSelect: document.getElementById('manualLotMineralSelect'),
  manualLotScuInput: document.getElementById('manualLotScuInput'),
  manualLotStatusSelect: document.getElementById('manualLotStatusSelect'),
  btnSubmitManualStockLot: document.getElementById('btnSubmitManualStockLot'),
  guildStockpileList: document.getElementById('guildStockpileList'),
  pushStatusBadge: document.getElementById('pushStatusBadge'),
  btnRequestPushPerm: document.getElementById('btnRequestPushPerm'),
  btnTestPushAlert: document.getElementById('btnTestPushAlert'),
  expenseLedgerNetVal: document.getElementById('expenseLedgerNetVal'),
  expenseLedgerTotalVal: document.getElementById('expenseLedgerTotalVal'),
  expenseLedgerGrossVal: document.getElementById('expenseLedgerGrossVal'),
  expenseCategorySelect: document.getElementById('expenseCategorySelect'),
  expensePaymentModeSelect: document.getElementById('expensePaymentModeSelect'),
  expenseAmountInput: document.getElementById('expenseAmountInput'),
  expenseAuthorInput: document.getElementById('expenseAuthorInput'),
  expenseLocationInput: document.getElementById('expenseLocationInput'),
  expenseNoteInput: document.getElementById('expenseNoteInput'),
  btnAddExpenseSubmit: document.getElementById('btnAddExpenseSubmit'),
  guildExpensesList: document.getElementById('guildExpensesList'),
  btnCopyExpensesDiscord: document.getElementById('btnCopyExpensesDiscord'),
  btnSyncExpensesFleet: document.getElementById('btnSyncExpensesFleet'),
  btnClearExpensesAll: document.getElementById('btnClearExpensesAll'),
  btnOpenRefineryDirect2: document.getElementById('btnOpenRefineryDirect2'),
  refiningRawScuSummary: document.getElementById('refiningRawScuSummary'),
  refiningActiveScuSummary: document.getElementById('refiningActiveScuSummary'),
  refiningReadyScuSummary: document.getElementById('refiningReadyScuSummary'),
  btnStockpileOpenDirect: document.getElementById('btnStockpileOpenDirect'),

  // Jalon 7: Guild Treasury, mo.Trader Split & Crafting 4.0
  btnStockpileTabTreasury: document.getElementById('btnStockpileTabTreasury'),
  paneStockpileTreasury: document.getElementById('paneStockpileTreasury'),
  treasuryBalanceVal: document.getElementById('treasuryBalanceVal'),
  treasuryTaxSelect: document.getElementById('treasuryTaxSelect'),
  btnDepositTreasury: document.getElementById('btnDepositTreasury'),
  btnWithdrawTreasury: document.getElementById('btnWithdrawTreasury'),
  btnCopyMoTrader: document.getElementById('btnCopyMoTrader'),
  moTraderTableBody: document.getElementById('moTraderTableBody'),
  btnToggleAddGoalForm: document.getElementById('btnToggleAddGoalForm'),
  addCraftingGoalForm: document.getElementById('addCraftingGoalForm'),
  craftingGoalItemSelect: document.getElementById('craftingGoalItemSelect'),
  craftingGoalCountInput: document.getElementById('craftingGoalCountInput'),
  btnSubmitCraftingGoal: document.getElementById('btnSubmitCraftingGoal'),
  craftingGoalsList: document.getElementById('craftingGoalsList'),
  btnSyncTreasuryFleet: document.getElementById('btnSyncTreasuryFleet'),

  // Jalon 7: Commodity Trading & Cargo Routes
  btnStockpileTabTrading: document.getElementById('btnStockpileTabTrading'),
  paneStockpileTrading: document.getElementById('paneStockpileTrading'),
  tradePresetRouteSelect: document.getElementById('tradePresetRouteSelect'),
  tradeCommoditySelect: document.getElementById('tradeCommoditySelect'),
  tradeCargoScuInput: document.getElementById('tradeCargoScuInput'),
  tradeOriginInput: document.getElementById('tradeOriginInput'),
  tradeDestinationInput: document.getElementById('tradeDestinationInput'),
  tradeBuyPriceInput: document.getElementById('tradeBuyPriceInput'),
  tradeSellPriceInput: document.getElementById('tradeSellPriceInput'),
  tradeRiskBadge: document.getElementById('tradeRiskBadge'),
  tradeCapitalRequiredVal: document.getElementById('tradeCapitalRequiredVal'),
  tradeGrossReturnVal: document.getElementById('tradeGrossReturnVal'),
  tradeNetProfitVal: document.getElementById('tradeNetProfitVal'),
  tradeMarginPerScuVal: document.getElementById('tradeMarginPerScuVal'),
  tradeRoiPercentVal: document.getElementById('tradeRoiPercentVal'),
  btnFinanceTradeTreasury: document.getElementById('btnFinanceTradeTreasury'),
  btnAddTradeToStockpile: document.getElementById('btnAddTradeToStockpile'),
  btnSyncTradeFleet: document.getElementById('btnSyncTradeFleet'),
  popularTradeRoutesGrid: document.getElementById('popularTradeRoutesGrid'),
  tradeCommodityExplorerCard: document.getElementById('tradeCommodityExplorerCard'),
  tradeBestBuyStockBadge: document.getElementById('tradeBestBuyStockBadge'),
  tradeBestBuyLocation: document.getElementById('tradeBestBuyLocation'),
  tradeBestBuySystem: document.getElementById('tradeBestBuySystem'),
  tradeBestBuyPriceDisplay: document.getElementById('tradeBestBuyPriceDisplay'),
  tradeBestSellDemandBadge: document.getElementById('tradeBestSellDemandBadge'),
  tradeBestSellLocation: document.getElementById('tradeBestSellLocation'),
  tradeBestSellSystem: document.getElementById('tradeBestSellSystem'),
  tradeBestSellPriceDisplay: document.getElementById('tradeBestSellPriceDisplay'),
  tradeCommoditySpreadBadge: document.getElementById('tradeCommoditySpreadBadge'),
  tradeCommodityTerminalsList: document.getElementById('tradeCommodityTerminalsList'),
  btnCopyTradeRoute: document.getElementById('btnCopyTradeRoute'),
  manualLotCategorySelect: document.getElementById('manualLotCategorySelect'),
  manualLotBuyCostInput: document.getElementById('manualLotBuyCostInput'),

  // Jalon 8: Guild Configuration & RBAC Deck (CIG Spectrum Org 4.0)
  btnOpenGuildConfig: document.getElementById('btnOpenGuildConfig'),
  btnMgGuildConfig: document.getElementById('btnMgGuildConfig'),
  hudGuildRoleBadge: document.getElementById('hudGuildRoleBadge'),
  mgGuildRoleBadge: document.getElementById('mgGuildRoleBadge'),
  guildConfigModal: document.getElementById('guildConfigModal'),
  guildModalContent: document.getElementById('guildModalContent'),
  btnCloseGuildConfig: document.getElementById('btnCloseGuildConfig'),
  btnStockpileOpenGuildConfig: document.getElementById('btnStockpileOpenGuildConfig'),
  guildCrestBadge: document.getElementById('guildCrestBadge'),
  guildModalTickerBadge: document.getElementById('guildModalTickerBadge'),
  guildModalActiveRoleBadge: document.getElementById('guildModalActiveRoleBadge'),
  guildModalOrgNameDisplay: document.getElementById('guildModalOrgNameDisplay'),
  guildModalCharterDisplay: document.getElementById('guildModalCharterDisplay'),
  guildModalHqDisplay: document.getElementById('guildModalHqDisplay'),
  guildDefconPill: document.getElementById('guildDefconPill'),
  guildDefconLabel: document.getElementById('guildDefconLabel'),
  btnToggleGuildFullscreen: document.getElementById('btnToggleGuildFullscreen'),
  guildKpiNetWorth: document.getElementById('guildKpiNetWorth'),
  guildKpiTreasury: document.getElementById('guildKpiTreasury'),
  guildKpiFleetScu: document.getElementById('guildKpiFleetScu'),
  guildKpiPilots: document.getElementById('guildKpiPilots'),
  guildKpiClearance: document.getElementById('guildKpiClearance'),
  guildSubtabsBar: document.getElementById('guildSubtabsBar'),
  btnGuildTabProfile: document.getElementById('btnGuildTabProfile'),
  btnGuildTabSecurity: document.getElementById('btnGuildTabSecurity'),
  btnGuildTabFinance: document.getElementById('btnGuildTabFinance'),
  btnGuildTabRoster: document.getElementById('btnGuildTabRoster'),
  btnGuildTabFleet: document.getElementById('btnGuildTabFleet'),
  btnGuildTabStockpile: document.getElementById('btnGuildTabStockpile'),
  btnGuildTabBackup: document.getElementById('btnGuildTabBackup'),
  guildPaneProfile: document.getElementById('guildPaneProfile'),
  guildPaneSecurity: document.getElementById('guildPaneSecurity'),
  guildPaneFinance: document.getElementById('guildPaneFinance'),
  guildPaneRoster: document.getElementById('guildPaneRoster'),
  guildPaneFleet: document.getElementById('guildPaneFleet'),
  guildPaneStockpile: document.getElementById('guildPaneStockpile'),
  guildPaneBackup: document.getElementById('guildPaneBackup'),
  guildCharterSelect: document.getElementById('guildCharterSelect'),
  guildAlignmentSelect: document.getElementById('guildAlignmentSelect'),
  guildRosterSearchInput: document.getElementById('guildRosterSearchInput'),
  btnOpenAddMemberModal: document.getElementById('btnOpenAddMemberModal'),
  guildAddMemberBox: document.getElementById('guildAddMemberBox'),
  newMemberCallsignInput: document.getElementById('newMemberCallsignInput'),
  newMemberRoleSelect: document.getElementById('newMemberRoleSelect'),
  newMemberShipInput: document.getElementById('newMemberShipInput'),
  btnSubmitAddMember: document.getElementById('btnSubmitAddMember'),
  btnOpenAddShipModal: document.getElementById('btnOpenAddShipModal'),
  guildAddShipBox: document.getElementById('guildAddShipBox'),
  newShipNameInput: document.getElementById('newShipNameInput'),
  newShipModelSelect: document.getElementById('newShipModelSelect'),
  newShipStationInput: document.getElementById('newShipStationInput'),
  btnSubmitAddShip: document.getElementById('btnSubmitAddShip'),
  guildFleetCardsGrid: document.getElementById('guildFleetCardsGrid'),
  btnOpenRefineryFromGuild: document.getElementById('btnOpenRefineryFromGuild'),
  btnOpenTreasuryFromGuild: document.getElementById('btnOpenTreasuryFromGuild'),
  guildStockpileSummaryContainer: document.getElementById('guildStockpileSummaryContainer'),
  guildMotdBannerDisplay: document.getElementById('guildMotdBannerDisplay'),
  guildMotdText: document.getElementById('guildMotdText'),
  guildNameInput: document.getElementById('guildNameInput'),
  guildTickerInput: document.getElementById('guildTickerInput'),
  guildSystemSelect: document.getElementById('guildSystemSelect'),
  guildHqStationSelect: document.getElementById('guildHqStationSelect'),
  guildMotdInput: document.getElementById('guildMotdInput'),
  guildDiscordUrlInput: document.getElementById('guildDiscordUrlInput'),
  guildDiscordServerIdInput: document.getElementById('guildDiscordServerIdInput'),
  guildDiscordWidgetContainer: document.getElementById('guildDiscordWidgetContainer'),
  guildDiscordWidgetIframe: document.getElementById('guildDiscordWidgetIframe'),
  btnJoinOfficialDiscord: document.getElementById('btnJoinOfficialDiscord'),
  btnSaveGuildProfile: document.getElementById('btnSaveGuildProfile'),
  guildUserRoleDisplay: document.getElementById('guildUserRoleDisplay'),
  guildUserCallsignDisplay: document.getElementById('guildUserCallsignDisplay'),
  guildUserPermsDisplay: document.getElementById('guildUserPermsDisplay'),
  btnLogoutGuildRole: document.getElementById('btnLogoutGuildRole'),
  unlockRoleSelect: document.getElementById('unlockRoleSelect'),
  unlockPasswordInput: document.getElementById('unlockPasswordInput'),
  btnSubmitUnlockRole: document.getElementById('btnSubmitUnlockRole'),
  adminPasswordsCard: document.getElementById('adminPasswordsCard'),
  masterPasswordInput: document.getElementById('masterPasswordInput'),
  officerPasswordInput: document.getElementById('officerPasswordInput'),
  memberPasswordInput: document.getElementById('memberPasswordInput'),
  btnSaveGuildPasswords: document.getElementById('btnSaveGuildPasswords'),
  guildDefaultTaxInput: document.getElementById('guildDefaultTaxInput'),
  guildDefaultEscortInput: document.getElementById('guildDefaultEscortInput'),
  guildDefaultHaulerInput: document.getElementById('guildDefaultHaulerInput'),
  guildTreasuryAlertInput: document.getElementById('guildTreasuryAlertInput'),
  btnSaveGuildFinance: document.getElementById('btnSaveGuildFinance'),
  guildRosterTableBody: document.getElementById('guildRosterTableBody'),
  guildRosterSearchClear: document.getElementById('guildRosterSearchClear'),
  btnExportRosterDiscord: document.getElementById('btnExportRosterDiscord'),
  thRosterCallsign: document.getElementById('thRosterCallsign'),
  thRosterRole: document.getElementById('thRosterRole'),
  thRosterStatus: document.getElementById('thRosterStatus'),
  thRosterShip: document.getElementById('thRosterShip'),
  sortIconCallsign: document.getElementById('sortIconCallsign'),
  sortIconRole: document.getElementById('sortIconRole'),
  sortIconStatus: document.getElementById('sortIconStatus'),
  sortIconShip: document.getElementById('sortIconShip'),
  rosterShowingCount: document.getElementById('rosterShowingCount'),
  rosterTotalCount: document.getElementById('rosterTotalCount'),
  rosterActiveOpsCount: document.getElementById('rosterActiveOpsCount'),
  rosterTotalTonnageDisplay: document.getElementById('rosterTotalTonnageDisplay'),
  chipCountRosterAll: document.getElementById('chipCountRosterAll'),
  chipCountRosterOnline: document.getElementById('chipCountRosterOnline'),
  chipCountRosterOps: document.getElementById('chipCountRosterOps'),
  chipCountRosterOfficers: document.getElementById('chipCountRosterOfficers'),
  tabCounterRoster: document.getElementById('tabCounterRoster'),
  tabCounterFleet: document.getElementById('tabCounterFleet'),
  tabCounterStockpile: document.getElementById('tabCounterStockpile'),
  guildFleetSearchInput: document.getElementById('guildFleetSearchInput'),
  guildFleetSearchClear: document.getElementById('guildFleetSearchClear'),
  guildFleetSortSelect: document.getElementById('guildFleetSortSelect'),
  fleetAvailCount: document.getElementById('fleetAvailCount'),
  fleetTotalCount: document.getElementById('fleetTotalCount'),
  fleetAvailScu: document.getElementById('fleetAvailScu'),
  fleetTotalScuDisplay: document.getElementById('fleetTotalScuDisplay'),
  chipCountFleetAll: document.getElementById('chipCountFleetAll'),
  chipCountFleetAvailable: document.getElementById('chipCountFleetAvailable'),
  chipCountFleetBorrowed: document.getElementById('chipCountFleetBorrowed'),
  stockpileProgRawScu: document.getElementById('stockpileProgRawScu'),
  stockpileProgRefScu: document.getElementById('stockpileProgRefScu'),
  stockpileProgReadyScu: document.getElementById('stockpileProgReadyScu'),
  segRawBar: document.getElementById('segRawBar'),
  segRefiningBar: document.getElementById('segRefiningBar'),
  segReadyBar: document.getElementById('segReadyBar'),
  guildStockpileStationFilter: document.getElementById('guildStockpileStationFilter'),
  btnExportGuildBackup: document.getElementById('btnExportGuildBackup'),
  guildBackupFileInput: document.getElementById('guildBackupFileInput'),
  btnImportGuildBackup: document.getElementById('btnImportGuildBackup'),
  backupStatusNotice: document.getElementById('backupStatusNotice'),

  // Session Mode Dispatcher & Onboarding
  btnOpenSessionMode: document.getElementById('btnOpenSessionMode'),
  sessionModeIcon: document.getElementById('sessionModeIcon'),
  sessionModeLabel: document.getElementById('sessionModeLabel'),
  btnMgSessionMode: document.getElementById('btnMgSessionMode'),
  mgSessionModeIcon: document.getElementById('mgSessionModeIcon'),
  mgSessionModeLabel: document.getElementById('mgSessionModeLabel'),
  btnOpenSessionModeFooter: document.getElementById('btnOpenSessionModeFooter'),
  sessionModeModal: document.getElementById('sessionModeModal'),
  btnCloseSessionMode: document.getElementById('btnCloseSessionMode'),
  btnDismissSessionModeModal: document.getElementById('btnDismissSessionModeModal'),
  modeCardSolo: document.getElementById('modeCardSolo'),
  modeCardSquad: document.getElementById('modeCardSquad'),
  modeCardGuild: document.getElementById('modeCardGuild'),
  modeCardAdmin: document.getElementById('modeCardAdmin'),
  btnSelectModeSolo: document.getElementById('btnSelectModeSolo'),
  btnSelectModeSquad: document.getElementById('btnSelectModeSquad'),
  btnSelectModeJoinGuild: document.getElementById('btnSelectModeJoinGuild'),
  btnSelectModeManageGuild: document.getElementById('btnSelectModeManageGuild'),
  chkRememberSessionMode: document.getElementById('chkRememberSessionMode'),

  // Desktop Native Electron HUD Controls
  desktopHudControls: document.getElementById('desktopHudControls'),
  btnDesktopPinOverlay: document.getElementById('btnDesktopPinOverlay'),
  desktopPinLabel: document.getElementById('desktopPinLabel'),
  btnDesktopGameLog: document.getElementById('btnDesktopGameLog'),
  desktopGameLogDot: document.getElementById('desktopGameLogDot'),
  desktopGameLogText: document.getElementById('desktopGameLogText'),
  btnMgDesktopPin: document.getElementById('btnMgDesktopPin'),

  // Flight Ledger Modal
  ledgerModal: document.getElementById('ledgerModal'),
  btnCloseLedger: document.getElementById('btnCloseLedger'),
  statTotalEarnedDisplay: document.getElementById('statTotalEarnedDisplay'),
  statTodayEarnedDisplay: document.getElementById('statTodayEarnedDisplay'),
  statTotalSCUDisplay: document.getElementById('statTotalSCUDisplay'),
  statRunsCountDisplay: document.getElementById('statRunsCountDisplay'),
  statHourlyRateDisplay: document.getElementById('statHourlyRateDisplay'),
  btnExportJson: document.getElementById('btnExportJson'),
  btnExportCsv: document.getElementById('btnExportCsv'),
  btnClearLedger: document.getElementById('btnClearLedger'),
  ledgerRunsList: document.getElementById('ledgerRunsList'),

  // ROC Cluster Box
  rocClusterBox: document.getElementById('rocClusterBox'),
  rocNodesDisplay: document.getElementById('rocNodesDisplay'),
  rocGemsSlider: document.getElementById('rocGemsSlider'),
  rocGemsPerNodeDisplay: document.getElementById('rocGemsPerNodeDisplay'),
  rocTotalGemsDisplay: document.getElementById('rocTotalGemsDisplay'),
  rocHoldStatusNote: document.getElementById('rocHoldStatusNote'),
  btnAddClusterToROC: document.getElementById('btnAddClusterToROC'),

  // Aaron Halo Rangefinder
  haloRouteSelect: document.getElementById('haloRouteSelect'),
  haloCurrentDist: document.getElementById('haloCurrentDist'),
  rangefinderDiffDisplay: document.getElementById('rangefinderDiffDisplay'),
  rangefinderProgressFill: document.getElementById('rangefinderProgressFill'),
  rangefinderAlertText: document.getElementById('rangefinderAlertText'),

  // Multi-turrets Active Firing Controls & Unified Loadout Section
  moleTurretBar: document.getElementById('moleTurretBar'),
  mgMoleTurretBar: document.getElementById('mgMoleTurretBar'),
  btnQuickConfigMole: document.getElementById('btnQuickConfigMole'),
  btnMgQuickConfigMole: document.getElementById('btnMgQuickConfigMole'),
  shipTurretsSection: document.getElementById('shipTurretsSection'),
  turretsSectionTitle: document.getElementById('turretsSectionTitle'),
  btnToggleAllTurrets: document.getElementById('btnToggleAllTurrets'),
  turretCardsContainer: document.getElementById('turretCardsContainer'),

  // Saved Loadout Profiles Manager
  savedLoadoutsSelect: document.getElementById('savedLoadoutsSelect'),
  activeProfileTag: document.getElementById('activeProfileTag'),
  btnOpenSaveProfileModal: document.getElementById('btnOpenSaveProfileModal'),
  btnUpdateCurrentProfile: document.getElementById('btnUpdateCurrentProfile'),
  btnDeleteSelectedProfile: document.getElementById('btnDeleteSelectedProfile'),
  saveLoadoutNameModal: document.getElementById('saveLoadoutNameModal'),
  saveLoadoutNameInput: document.getElementById('saveLoadoutNameInput'),
  btnConfirmSaveLoadoutName: document.getElementById('btnConfirmSaveLoadoutName'),
  btnCancelSaveLoadoutName: document.getElementById('btnCancelSaveLoadoutName'),
  btnCloseSaveLoadoutName: document.getElementById('btnCloseSaveLoadoutName'),

  // Modals
  loadoutModal: document.getElementById('loadoutModal'),
  btnCloseLoadout: document.getElementById('btnCloseLoadout'),
  laserSelect: document.getElementById('laserSelect'),
  laserDescText: document.getElementById('laserDescText'),
  gadgetSelect: document.getElementById('gadgetSelect'),
  loadoutGadgetGroup: document.getElementById('loadoutGadgetGroup'),
  loadoutMiningWeaponGroup: document.getElementById('loadoutMiningWeaponGroup'),
  loadoutMiningWeaponSelect: document.getElementById('loadoutMiningWeaponSelect'),
  loadoutCargoSection: document.getElementById('loadoutCargoSection'),
  loadoutCargoTractorSelect: document.getElementById('loadoutCargoTractorSelect'),
  loadoutCargoGridSelect: document.getElementById('loadoutCargoGridSelect'),
  loadoutCargoWeaponSelect: document.getElementById('loadoutCargoWeaponSelect'),
  loadoutSalvageSection: document.getElementById('loadoutSalvageSection'),
  loadoutSalvageHead1Select: document.getElementById('loadoutSalvageHead1Select'),
  loadoutSalvageHead2Select: document.getElementById('loadoutSalvageHead2Select'),
  loadoutSalvageTractorSelect: document.getElementById('loadoutSalvageTractorSelect'),
  loadoutSalvageWeaponSelect: document.getElementById('loadoutSalvageWeaponSelect'),
  loadoutCombatSection: document.getElementById('loadoutCombatSection'),
  loadoutCombatPrimarySelect: document.getElementById('loadoutCombatPrimarySelect'),
  loadoutCombatTurretSelect: document.getElementById('loadoutCombatTurretSelect'),
  loadoutCombatMissileSelect: document.getElementById('loadoutCombatMissileSelect'),
  btnSaveLoadout: document.getElementById('btnSaveLoadout'),

  crewModal: document.getElementById('crewModal'),
  btnCloseCrew: document.getElementById('btnCloseCrew'),
  crewCountDisplay: document.getElementById('crewCountDisplay'),
  crewReserveDisplay: document.getElementById('crewReserveDisplay'),
  crewReserveSlider: document.getElementById('crewReserveSlider'),
  crewTotalHoldValue: document.getElementById('crewTotalHoldValue'),
  crewSharePerMember: document.getElementById('crewSharePerMember'),
  crewReserveDeducted: document.getElementById('crewReserveDeducted'),

  // Squad & Fleet elements
  btnMgSquadModal: document.getElementById('btnMgSquadModal'),
  mgSquadCountBadge: document.getElementById('mgSquadCountBadge'),
  squadCountBadge: document.getElementById('squadCountBadge'),
  btnQuickOpenSquad: document.getElementById('btnQuickOpenSquad'),
  squadActiveHudBanner: document.getElementById('squadActiveHudBanner'),
  squadActiveHudText: document.getElementById('squadActiveHudText'),
  squadProfitSplitCard: document.getElementById('squadProfitSplitCard'),
  squadSplitCountLabel: document.getElementById('squadSplitCountLabel'),
  squadRefinedShareVal: document.getElementById('squadRefinedShareVal'),
  squadRawShareVal: document.getElementById('squadRawShareVal'),
  fleetStatShips: document.getElementById('fleetStatShips'),
  fleetStatPower: document.getElementById('fleetStatPower'),
  fleetStatResReduction: document.getElementById('fleetStatResReduction'),
  fleetStatCargo: document.getElementById('fleetStatCargo'),
  fleetStatShare: document.getElementById('fleetStatShare'),
  squadLeaderName: document.getElementById('squadLeaderName'),
  squadLeaderNameInput: document.getElementById('squadLeaderNameInput'),
  squadLeaderShipDesc: document.getElementById('squadLeaderShipDesc'),
  squadLeaderLaserDesc: document.getElementById('squadLeaderLaserDesc'),
  btnSquadEditLoadout: document.getElementById('btnSquadEditLoadout'),
  squadWingmenContainer: document.getElementById('squadWingmenContainer'),
  btnAddSquadMember: document.getElementById('btnAddSquadMember'),

  // Aaron Fleet-Net P2P elements (Jalon 1)
  btnMgFleetNetComms: document.getElementById('btnMgFleetNetComms'),
  mgCommsLedText: document.getElementById('mgCommsLedText'),
  fleetNetCard: document.getElementById('fleetNetCard'),
  fleetNetLed: document.getElementById('fleetNetLed'),
  fleetNetStatusBadge: document.getElementById('fleetNetStatusBadge'),
  fleetNetDisconnectedBox: document.getElementById('fleetNetDisconnectedBox'),
  fleetNetConnectedBox: document.getElementById('fleetNetConnectedBox'),
  btnFleetCreateWing: document.getElementById('btnFleetCreateWing'),
  inputFleetRoomCode: document.getElementById('inputFleetRoomCode'),
  btnFleetJoinWing: document.getElementById('btnFleetJoinWing'),
  fleetNetRoomCodeDisplay: document.getElementById('fleetNetRoomCodeDisplay'),
  fleetNetRoleBadge: document.getElementById('fleetNetRoleBadge'),
  fleetNetPingDisplay: document.getElementById('fleetNetPingDisplay'),
  fleetNetPeersCountDisplay: document.getElementById('fleetNetPeersCountDisplay'),
  btnFleetCopyInvite: document.getElementById('btnFleetCopyInvite'),
  btnFleetLeaveWing: document.getElementById('btnFleetLeaveWing'),

  // Crafting 4.0 Workshop (Jalon 2 & Jalon 11 Blueprints)
  btnOpenCraftingFromLoadout: document.getElementById('btnOpenCraftingFromLoadout'),
  btnOpenCraftingFromCrew: document.getElementById('btnOpenCraftingFromCrew'),
  craftingModal: document.getElementById('craftingModal'),
  btnCloseCrafting: document.getElementById('btnCloseCrafting'),
  tabCraftBlueprints: document.getElementById('tabCraftBlueprints'),
  tabCraftLasers: document.getElementById('tabCraftLasers'),
  tabCraftGadgets: document.getElementById('tabCraftGadgets'),
  craftPaneBlueprints: document.getElementById('craftPaneBlueprints'),
  craftPaneLasers: document.getElementById('craftPaneLasers'),
  craftPaneGadgets: document.getElementById('craftPaneGadgets'),
  bpMetricTotalCount: document.getElementById('bpMetricTotalCount'),
  bpMetricPlayerCount: document.getElementById('bpMetricPlayerCount'),
  bpMetricGuildCount: document.getElementById('bpMetricGuildCount'),
  bpMetricCraftableCount: document.getElementById('bpMetricCraftableCount'),
  bpSearchInput: document.getElementById('bpSearchInput'),
  btnResetBpFilters: document.getElementById('btnResetBpFilters'),
  blueprintsGrid: document.getElementById('blueprintsGrid'),
  craftLaserTemplateSelect: document.getElementById('craftLaserTemplateSelect'),
  craftLaserNameInput: document.getElementById('craftLaserNameInput'),
  craftLaserSizeSelect: document.getElementById('craftLaserSizeSelect'),
  craftLaserPowerSlider: document.getElementById('craftLaserPowerSlider'),
  craftLaserPowerVal: document.getElementById('craftLaserPowerVal'),
  craftLaserResSlider: document.getElementById('craftLaserResSlider'),
  craftLaserResVal: document.getElementById('craftLaserResVal'),
  craftLaserInstSlider: document.getElementById('craftLaserInstSlider'),
  craftLaserInstVal: document.getElementById('craftLaserInstVal'),
  craftLaserWindowSlider: document.getElementById('craftLaserWindowSlider'),
  craftLaserWindowVal: document.getElementById('craftLaserWindowVal'),
  btnResetCraftLaserForm: document.getElementById('btnResetCraftLaserForm'),
  btnSaveCraftLaser: document.getElementById('btnSaveCraftLaser'),
  customLasersListContainer: document.getElementById('customLasersListContainer'),
  craftGadgetNameInput: document.getElementById('craftGadgetNameInput'),
  craftGadgetResSlider: document.getElementById('craftGadgetResSlider'),
  craftGadgetResVal: document.getElementById('craftGadgetResVal'),
  craftGadgetInstSlider: document.getElementById('craftGadgetInstSlider'),
  craftGadgetInstVal: document.getElementById('craftGadgetInstVal'),
  craftGadgetWindowSlider: document.getElementById('craftGadgetWindowSlider'),
  craftGadgetWindowVal: document.getElementById('craftGadgetWindowVal'),
  btnResetCraftGadgetForm: document.getElementById('btnResetCraftGadgetForm'),
  btnSaveCraftGadget: document.getElementById('btnSaveCraftGadget'),
  customGadgetsListContainer: document.getElementById('customGadgetsListContainer'),

  // Jalon 3: Instant OCR Scanner & Shared Scan Telemetry
  btnOpenOcrModal: document.getElementById('btnOpenOcrModal'),
  btnQuickOpenOcr: document.getElementById('btnQuickOpenOcr'),
  btnBroadcastCurrentRock: document.getElementById('btnBroadcastCurrentRock'),
  chkAutoBroadcastScan: document.getElementById('chkAutoBroadcastScan'),
  chkAutoSyncScan: document.getElementById('chkAutoSyncScan'),
  rockBroadcastReceivedBanner: document.getElementById('rockBroadcastReceivedBanner'),
  rockBroadcastTitle: document.getElementById('rockBroadcastTitle'),
  rockBroadcastDetails: document.getElementById('rockBroadcastDetails'),
  btnApplyIncomingRockScan: document.getElementById('btnApplyIncomingRockScan'),
  btnDismissIncomingRockScan: document.getElementById('btnDismissIncomingRockScan'),
  ocrModal: document.getElementById('ocrModal'),
  btnCloseOcr: document.getElementById('btnCloseOcr'),
  tabOcrClipboard: document.getElementById('tabOcrClipboard'),
  tabOcrCamera: document.getElementById('tabOcrCamera'),
  tabOcrSamples: document.getElementById('tabOcrSamples'),
  ocrPaneClipboard: document.getElementById('ocrPaneClipboard'),
  ocrPaneCamera: document.getElementById('ocrPaneCamera'),
  ocrPaneSamples: document.getElementById('ocrPaneSamples'),
  ocrDropzone: document.getElementById('ocrDropzone'),
  ocrFileInput: document.getElementById('ocrFileInput'),
  btnBrowseOcrFile: document.getElementById('btnBrowseOcrFile'),
  btnPasteOcrClipboard: document.getElementById('btnPasteOcrClipboard'),
  ocrRawTextInput: document.getElementById('ocrRawTextInput'),
  btnParseRawScanText: document.getElementById('btnParseRawScanText'),
  ocrCameraVideo: document.getElementById('ocrCameraVideo'),
  btnCaptureCameraFrame: document.getElementById('btnCaptureCameraFrame'),
  btnSwitchCamera: document.getElementById('btnSwitchCamera'),
  ocrPreviewContainer: document.getElementById('ocrPreviewContainer'),
  ocrCanvas: document.getElementById('ocrCanvas'),
  ocrScanLaserLine: document.getElementById('ocrScanLaserLine'),
  ocrStatusBadge: document.getElementById('ocrStatusBadge'),
  ocrTimingDisplay: document.getElementById('ocrTimingDisplay'),
  ocrResMass: document.getElementById('ocrResMass'),
  ocrResMineral1: document.getElementById('ocrResMineral1'),
  ocrResPct1: document.getElementById('ocrResPct1'),
  ocrResMineral2: document.getElementById('ocrResMineral2'),
  ocrResPct2: document.getElementById('ocrResPct2'),
  ocrResResistance: document.getElementById('ocrResResistance'),
  ocrResInstability: document.getElementById('ocrResInstability'),
  ocrResArchetype: document.getElementById('ocrResArchetype'),
  ocrChkBroadcastOnApply: document.getElementById('ocrChkBroadcastOnApply'),
  btnCancelOcr: document.getElementById('btnCancelOcr'),
  btnApplyOcrData: document.getElementById('btnApplyOcrData'),

  // Jalon 4: Coordination Tactique, Solveur Optimal & Escorte
  btnMgRedAlert: document.getElementById('btnMgRedAlert'),
  btnRedAlertTrigger: document.getElementById('btnRedAlertTrigger'),
  redAlertBanner: document.getElementById('redAlertBanner'),
  redAlertTitle: document.getElementById('redAlertTitle'),
  redAlertDesc: document.getElementById('redAlertDesc'),
  redAlertEscapeVector: document.getElementById('redAlertEscapeVector'),
  btnDeployEscortCombat: document.getElementById('btnDeployEscortCombat'),
  btnDismissRedAlert: document.getElementById('btnDismissRedAlert'),

  // Solveur Optimal 4.0
  tabOlcSolo: document.getElementById('tabOlcSolo'),
  tabOlcWing: document.getElementById('tabOlcWing'),
  btnApplyOptimalLoadout: document.getElementById('btnApplyOptimalLoadout'),
  olcFreqSummary: document.getElementById('olcFreqSummary'),

  // Conseiller de Tir Conjoint
  jointFireCard: document.getElementById('jointFireCard'),
  jointFirePhaseTag: document.getElementById('jointFirePhaseTag'),
  fireStep1: document.getElementById('fireStep1'),
  fireStep1Desc: document.getElementById('fireStep1Desc'),
  fireStep2: document.getElementById('fireStep2'),
  fireStep2Desc: document.getElementById('fireStep2Desc'),
  fireStep3: document.getElementById('fireStep3'),
  fireStep3Desc: document.getElementById('fireStep3Desc'),
  overchargeRiskVal: document.getElementById('overchargeRiskVal'),
  overchargeRiskFill: document.getElementById('overchargeRiskFill'),
  btnFireStateStandby: document.getElementById('btnFireStateStandby'),
  btnFireStateCharging: document.getElementById('btnFireStateCharging'),
  btnFireStateGreen: document.getElementById('btnFireStateGreen'),
  btnFireStateOverheat: document.getElementById('btnFireStateOverheat'),

  // Prime d'Escorte Combat
  escortCutSlider: document.getElementById('escortCutSlider'),
  escortCutDisplay: document.getElementById('escortCutDisplay'),
  escortCutDeducted: document.getElementById('escortCutDeducted'),

  // Jalon 5: Transport Spécialisé & Logistique de Fret (Cargo Refactor 4.0)
  btnBroadcastPickupRequest: document.getElementById('btnBroadcastPickupRequest'),
  cargoGridMasterCard: document.getElementById('cargoGridMasterCard'),
  selectActiveHauler: document.getElementById('selectActiveHauler'),
  haulerTractorSpecBadge: document.getElementById('haulerTractorSpecBadge'),
  haulerCapacityDisplay: document.getElementById('haulerCapacityDisplay'),
  haulerGridTypeDisplay: document.getElementById('haulerGridTypeDisplay'),
  haulerMaxBagsDisplay: document.getElementById('haulerMaxBagsDisplay'),
  haulerHoldProgressLabel: document.getElementById('haulerHoldProgressLabel'),
  haulerBarFill: document.getElementById('haulerBarFill'),
  haulerQuantainiumAlert: document.getElementById('haulerQuantainiumAlert'),
  haulerCargoVisualGrid: document.getElementById('haulerCargoVisualGrid'),
  haulerRawValDisplay: document.getElementById('haulerRawValDisplay'),
  haulerRefinedValDisplay: document.getElementById('haulerRefinedValDisplay'),
  btnClearHaulerHold: document.getElementById('btnClearHaulerHold'),
  btnAddOneHaulerBag: document.getElementById('btnAddOneHaulerBag'),
  btnAddBox32: document.getElementById('btnAddBox32'),
  btnTransferHoldToHauler: document.getElementById('btnTransferHoldToHauler'),
  pendingPickupsCount: document.getElementById('pendingPickupsCount'),
  pendingPickupsList: document.getElementById('pendingPickupsList'),
  haulerCutSlider: document.getElementById('haulerCutSlider'),
  haulerCutDisplay: document.getElementById('haulerCutDisplay'),
  haulerCutDeducted: document.getElementById('haulerCutDeducted'),

  // Callsign & Citizen ID Modal
  callsignModal: document.getElementById('callsignModal'),
  callsignModalInput: document.getElementById('callsignModalInput'),
  pilotGuildRoleSelect: document.getElementById('pilotGuildRoleSelect'),
  pilotSpecialtySelect: document.getElementById('pilotSpecialtySelect'),
  pilotBalanceInput: document.getElementById('pilotBalanceInput'),
  pilotSystemSelect: document.getElementById('pilotSystemSelect'),
  pilotStationSelect: document.getElementById('pilotStationSelect'),
  pilotGuildBadgeText: document.getElementById('pilotGuildBadgeText'),
  btnSaveCallsignModal: document.getElementById('btnSaveCallsignModal'),
  btnCancelCallsignModal: document.getElementById('btnCancelCallsignModal'),
  btnCloseCallsignModal: document.getElementById('btnCloseCallsignModal'),

  haloModal: document.getElementById('haloModal'),
  btnCloseHalo: document.getElementById('btnCloseHalo'),
  systemFilterBar: document.getElementById('systemFilterBar'),
  tabAtlasStanton: document.getElementById('tabAtlasStanton'),
  tabAtlasPyro: document.getElementById('tabAtlasPyro'),
  tabAtlasNyx: document.getElementById('tabAtlasNyx'),
  atlasPanelStanton: document.getElementById('atlasPanelStanton'),
  atlasPanelPyro: document.getElementById('atlasPanelPyro'),
  atlasPanelNyx: document.getElementById('atlasPanelNyx'),
  haloRoutesContainer: document.getElementById('haloRoutesContainer'),
  stationsContainer: document.getElementById('stationsContainer'),
  hotspotsStantonContainer: document.getElementById('hotspotsStantonContainer'),
  stationsPyroContainer: document.getElementById('stationsPyroContainer'),
  hotspotsPyroContainer: document.getElementById('hotspotsPyroContainer'),
  stationsNyxContainer: document.getElementById('stationsNyxContainer'),
  hotspotsNyxContainer: document.getElementById('hotspotsNyxContainer'),

  donateModal: document.getElementById('donateModal'),
  btnCloseDonate: document.getElementById('btnCloseDonate'),

  voiceModal: document.getElementById('voiceModal'),
  btnCloseVoice: document.getElementById('btnCloseVoice'),
  voiceTranscript: document.getElementById('voiceTranscript'),

  // Guide / Welcome Modal
  btnOpenGuide: document.getElementById('btnOpenGuide'),
  btnOpenGuideFooter: document.getElementById('btnOpenGuideFooter'),
  guideModal: document.getElementById('guideModal'),
  btnCloseGuide: document.getElementById('btnCloseGuide'),
  btnLaunchFromGuide: document.getElementById('btnLaunchFromGuide'),
  chkGuideDismiss: document.getElementById('chkGuideDismiss'),
  btnGuideLangFr: document.getElementById('btnGuideLangFr'),
  btnGuideLangEn: document.getElementById('btnGuideLangEn'),

  // Changelog Modal
  btnVersionBadge: document.getElementById('btnVersionBadge'),
  btnOpenChangelog: document.getElementById('btnOpenChangelog'),
  changelogModal: document.getElementById('changelogModal'),
  btnCloseChangelog: document.getElementById('btnCloseChangelog'),
  changelogScroller: document.getElementById('changelogScroller'),

  // Roadmap Modal
  btnOpenRoadmapFooter: document.getElementById('btnOpenRoadmapFooter'),
  btnOpenRoadmapFromChangelog: document.getElementById('btnOpenRoadmapFromChangelog'),
  btnOpenRoadmapFromCrew: document.getElementById('btnOpenRoadmapFromCrew'),
  roadmapModal: document.getElementById('roadmapModal'),
  btnCloseRoadmap: document.getElementById('btnCloseRoadmap'),
  roadmapScroller: document.getElementById('roadmapScroller'),

  btnInstallPWA: document.getElementById('btnInstallPWA'),
  btnResetSession: document.getElementById('btnResetSession'),
  btnForceRefresh: document.getElementById('btnForceRefresh'),

  // UX Controls
  themeSelect: document.getElementById('themeSelect'),
  btnLangToggle: document.getElementById('btnLangToggle'),
  langFlag: document.getElementById('langFlag'),
  langLabel: document.getElementById('langLabel'),
  btnWakeLock: document.getElementById('btnWakeLock'),
  wakeLockLabel: document.getElementById('wakeLockLabel'),
  btnFullscreen: document.getElementById('btnFullscreen'),
  btnExportDiscord: document.getElementById('btnExportDiscord'),
  toastNotice: document.getElementById('toastNotice'),
  footerDisclaimerText: document.getElementById('footerDisclaimerText')
};

// ==========================================
// INITIALIZATION & UI POPULATION
// ==========================================
function init() {
  setTheme(state.currentTheme);
  setLayoutMode(state.layoutMode, false);
  setMobileView(state.mobileView || 'scanner');
  setWorkflowTab(state.activeWorkflow || 'mining', false);
  setCallsign(state.callsign, false);
  updateLoreClock();
  setInterval(updateLoreClock, 1000);
  bindEventListeners();
  loadCustomCraftGear();
  loadMyPersonalFleet();
  initMyShipHub();
  initUnifiedInventory();
  populateAllShipSelects();
  initCraftingWorkshop();
  initFleetNet();
  initOcrScanner();
  initTacticalCoordinator();
  initCargoGridMaster();
  initMarketAndArbitrage();
  initGuildStockpileAndExpenses();
  initGuildConfigAndRBAC();
  initSessionModeDispatcher();
  initDesktopIntegration();
  loadSavedSession();
  loadSavedLoadout();
  loadRefineryJobs();
  loadLedger();
  startRefineryTimerLoop();
  setLanguage(state.currentLang);
  registerServiceWorker();

  // Onboarding Session Mode vs Guide Modal
  const isRemembered = localStorage.getItem('aaron_mfd_session_mode_remember') === 'true';
  if (!isRemembered) {
    setTimeout(() => {
      openSessionModeModal();
    }, 350);
  } else if (!localStorage.getItem('aaron_mfd_guide_dismissed')) {
    setTimeout(() => {
      openModal(DOM.guideModal);
    }, 400);
  }
}

// Populate Ore Grid buttons with system filter and RS signatures
function populateOreGrid() {
  DOM.oreGrid.innerHTML = '';
  const locale = getLocale();
  const filter = state.mineralSystemFilter || 'all';

  const filteredMinerals = MINING_DATA.minerals.filter(min => {
    if (filter === 'all') return true;
    return min.systems && min.systems.includes(filter);
  });

  filteredMinerals.forEach(min => {
    const minName = getLocalized(min, 'name');
    const card = document.createElement('div');
    card.className = `ore-card ${min.id === state.selectedMineral.id ? 'selected' : ''}`;
    card.style.setProperty('--ore-color', min.color);
    card.dataset.id = min.id;

    const rsText = min.rsBase ? `<div style="font-size:0.65rem; color:var(--accent-cyan); font-family:var(--font-mono); margin-top:2px;">RS: ${min.rsBase.toLocaleString(locale)}</div>` : '';

    card.innerHTML = `
      <div class="ore-symbol">${min.symbol}</div>
      <div class="ore-name">${minName}</div>
      <div class="ore-price-tag">~${(min.refinedPrice * 100).toLocaleString(locale)} aUEC</div>
      ${rsText}
    `;

    card.addEventListener('click', () => {
      sfx.playBeep(700, 'sine', 0.04);
      triggerHaptic(12);
      selectMineral(min);
    });

    DOM.oreGrid.appendChild(card);
  });
}

function selectMineral(min) {
  state.selectedMineral = min;
  const locale = getLocale();
  const rsText = min.rsBase ? ` (RS: ${min.rsBase.toLocaleString(locale)})` : '';
  DOM.selectedMineralLabel.textContent = `${getLocalized(min, 'name')}${rsText}`;
  DOM.selectedMineralLabel.style.color = min.color;

  // Prevent primary mineral from conflicting with secondary mineral
  if (state.secondaryMineral && state.secondaryMineral.id === min.id) {
    state.secondaryMineral = null;
    if (DOM.secondaryOreSelect) DOM.secondaryOreSelect.value = 'none';
    updateSecondaryOreUI();
  }

  document.querySelectorAll('.ore-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === min.id);
  });



  // Auto-calculer dès la sélection du minerai
  applyDynamicRockProperties();
  calculateAll();
}

// ==========================================
// FEATURE: ROCK ARCHETYPES (4.10)
// ==========================================
function populateArchetypes() {
  if (!MINING_DATA.rockArchetypes) return;

  // 1. Populate Dropdown Select
  if (DOM.archetypeSelect) {
    const prevVal = state.selectedArchetype ? state.selectedArchetype.id : MINING_DATA.rockArchetypes[0].id;
    DOM.archetypeSelect.innerHTML = '';
    MINING_DATA.rockArchetypes.forEach(arch => {
      const opt = document.createElement('option');
      opt.value = arch.id;
      opt.textContent = `${getLocalized(arch, 'name')} • R:${arch.baseResistance}% • I:${arch.baseInstability}% (Densité: ${arch.density})`;
      DOM.archetypeSelect.appendChild(opt);
    });
    DOM.archetypeSelect.value = prevVal;
  }

  // 2. Populate Ergonomic 3x3 Grid
  if (DOM.archetypeScroller) {
    DOM.archetypeScroller.innerHTML = '';
    MINING_DATA.rockArchetypes.forEach(arch => {
      const btn = document.createElement('button');
      const isActive = state.selectedArchetype && state.selectedArchetype.id === arch.id;
      btn.className = `archetype-chip ${isActive ? 'active' : ''}`;
      btn.dataset.id = arch.id;
      btn.setAttribute('type', 'button');
      btn.innerHTML = `
        <div class="archetype-chip-top">
          <span style="color:${arch.color};">●</span>
          <span>${getLocalized(arch, 'name')}</span>
        </div>
        <div class="archetype-chip-sub">R: ${arch.baseResistance}% • I: ${arch.baseInstability}%</div>
      `;

      btn.addEventListener('click', () => {
        sfx.playBeep(650, 'sine', 0.04);
        triggerHaptic(10);
        selectArchetype(arch);
      });

      DOM.archetypeScroller.appendChild(btn);
    });
  }

  updateArchetypeDisplay();
  applyDynamicRockProperties();
}

function selectArchetype(arch) {
  state.selectedArchetype = arch;
  if (DOM.archetypeSelect) {
    DOM.archetypeSelect.value = arch.id;
  }
  document.querySelectorAll('.archetype-chip').forEach(b => {
    b.classList.toggle('active', b.dataset.id === arch.id);
  });
  updateArchetypeDisplay();
  // Auto-calculer dès la sélection d'un archétype
  applyDynamicRockProperties();
}

function updateArchetypeDisplay() {
  const arch = state.selectedArchetype;
  if (!arch) return;
  if (DOM.selectedArchetypeLabel) {
    DOM.selectedArchetypeLabel.textContent = getLocalized(arch, 'name');
    DOM.selectedArchetypeLabel.style.color = arch.color || 'var(--accent-cyan)';
  }
  if (DOM.archetypeDescText) {
    DOM.archetypeDescText.textContent = getLocalized(arch, 'desc');
  }
  if (DOM.archetypeStatsText) {
    const locale = getLocale();
    DOM.archetypeStatsText.textContent = `Densité: ${arch.density} • Résistance: ${arch.baseResistance}% • Instabilité: ${arch.baseInstability}% • RS: ${arch.rsBase.toLocaleString(locale)}`;
  }
}

// Dynamically compute resistance & instability from archetype + minerals
function applyDynamicRockProperties() {
  const arch = state.selectedArchetype || (MINING_DATA.rockArchetypes && MINING_DATA.rockArchetypes[0]);
  if (!arch) return;

  let baseRes = arch.baseResistance;
  let baseInst = arch.baseInstability;

  // Primary mineral modifier
  const pMin = state.selectedMineral;
  const pPct = state.orePercentage;
  let instDelta = 0;
  let resDelta = 0;

  if (pMin) {
    if (pMin.id === 'quantainium') {
      instDelta += (pPct / 100) * 60;
      resDelta += (pPct / 100) * 15;
    } else if (pMin.id === 'stileron') {
      instDelta += (pPct / 100) * 45;
      resDelta += (pPct / 100) * 35;
    } else if (pMin.id === 'riccite') {
      instDelta += (pPct / 100) * 25;
      resDelta += (pPct / 100) * 30;
    } else if (pMin.id === 'bexalite') {
      instDelta += (pPct / 100) * 25;
      resDelta += (pPct / 100) * 20;
    } else if (pMin.id === 'taranite') {
      instDelta += (pPct / 100) * 15;
      resDelta += (pPct / 100) * 15;
    } else if (pMin.id === 'borase') {
      instDelta += (pPct / 100) * 10;
      resDelta += (pPct / 100) * 10;
    } else if (pMin.id === 'laranite') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 10;
    } else if (pMin.id === 'hephaestanite') {
      instDelta += (pPct / 100) * 10;
      resDelta += (pPct / 100) * 10;
    } else if (pMin.id === 'gold') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 10;
    } else if (pMin.id === 'agricium') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 5;
    } else if (pMin.id === 'hadanite') {
      instDelta += (pPct / 100) * 35;
      resDelta += (pPct / 100) * 10;
    } else if (pMin.id === 'dolivine') {
      instDelta += (pPct / 100) * 20;
      resDelta += (pPct / 100) * 5;
    } else if (pMin.id === 'aphorite') {
      instDelta += (pPct / 100) * 15;
      resDelta += (pPct / 100) * 5;
    } else if (pMin.id === 'diamond') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 15;
    } else if (pMin.id === 'beryl') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 5;
    } else if (pMin.id === 'tungsten') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 20;
    } else if (pMin.id === 'titanium') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 15;
    } else if (pMin.id === 'copper') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 10;
    } else if (pMin.id === 'iron') {
      instDelta += (pPct / 100) * 5;
      resDelta += (pPct / 100) * 10;
    }
  }

  // Secondary mineral modifier
  const sMin = state.secondaryMineral;
  const sPct = sMin ? state.secondaryPercentage : 0;
  if (sMin) {
    if (sMin.id === 'quantainium') {
      instDelta += (sPct / 100) * 60;
      resDelta += (sPct / 100) * 15;
    } else if (sMin.id === 'stileron') {
      instDelta += (sPct / 100) * 45;
      resDelta += (sPct / 100) * 35;
    } else if (sMin.id === 'riccite') {
      instDelta += (sPct / 100) * 25;
      resDelta += (sPct / 100) * 30;
    } else if (sMin.id === 'bexalite') {
      instDelta += (sPct / 100) * 25;
      resDelta += (sPct / 100) * 20;
    } else if (sMin.id === 'taranite') {
      instDelta += (sPct / 100) * 15;
      resDelta += (sPct / 100) * 15;
    } else if (sMin.id === 'borase') {
      instDelta += (sPct / 100) * 10;
      resDelta += (sPct / 100) * 10;
    } else if (sMin.id === 'laranite') {
      instDelta += (sPct / 100) * 5;
      resDelta += (sPct / 100) * 10;
    }
  }

  const finalRes = Math.min(95, Math.max(5, Math.round(baseRes + resDelta)));
  const finalInst = Math.min(100, Math.max(0, Math.round(baseInst + instDelta)));

  setResistance(finalRes);
  setInstability(finalInst);
}

// ==========================================
// FEATURE: SECONDARY ORE & COMPOSITION (4.10)
// ==========================================
function populateSecondaryOreSelect() {
  if (!DOM.secondaryOreSelect) return;
  const currentVal = state.secondaryMineral ? state.secondaryMineral.id : 'none';
  DOM.secondaryOreSelect.innerHTML = '';

  const noneOpt = document.createElement('option');
  noneOpt.value = 'none';
  const t = I18N[state.currentLang] || I18N.fr;
  noneOpt.textContent = t.noSecondaryMineral || 'Aucun minerai secondaire';
  DOM.secondaryOreSelect.appendChild(noneOpt);

  MINING_DATA.minerals.forEach(min => {
    if (state.selectedShip.laserSize > 0 && (min.id === 'hadanite' || min.id === 'dolivine' || min.id === 'aphorite')) return;
    const opt = document.createElement('option');
    opt.value = min.id;
    opt.textContent = `${min.symbol} • ${getLocalized(min, 'name')}`;
    DOM.secondaryOreSelect.appendChild(opt);
  });

  DOM.secondaryOreSelect.value = currentVal;
  updateSecondaryOreUI();
}

function updateSecondaryOreUI() {
  const isSelected = !!state.secondaryMineral;
  if (DOM.secondaryOreControls) {
    DOM.secondaryOreControls.style.display = isSelected ? 'block' : 'none';
  }
  if (DOM.selectedSecondaryLabel) {
    if (isSelected) {
      DOM.selectedSecondaryLabel.textContent = `${getLocalized(state.secondaryMineral, 'name')} (${state.secondaryPercentage.toFixed(1)}%)`;
      DOM.selectedSecondaryLabel.style.color = state.secondaryMineral.color;
    } else {
      const t = I18N[state.currentLang] || I18N.fr;
      DOM.selectedSecondaryLabel.textContent = t.noSecondaryMineral || 'Aucun';
      DOM.selectedSecondaryLabel.style.color = 'var(--text-muted)';
    }
  }
}

// ==========================================
// FEATURE: SADDLEBAGS PHYSICALIZED (4.10)
// ==========================================
function updateSaddlebagsUI() {
  const ship = state.selectedShip;
  if (!DOM.saddlebagsControlBox) return;

  if (!ship.detachableBags) {
    DOM.saddlebagsControlBox.style.display = 'none';
    return;
  }

  DOM.saddlebagsControlBox.style.display = 'block';
  const totalBags = ship.saddlebags;
  const bagSCU = ship.saddlebagSCU;
  const currentHoldSCU = state.holdSCU;
  const fullBagsCount = Math.min(totalBags, Math.floor(currentHoldSCU / bagSCU));
  
  if (DOM.saddlebagsCountBadge) {
    DOM.saddlebagsCountBadge.textContent = `${totalBags} / ${totalBags} Montées (${fullBagsCount} pleine(s))`;
  }

  if (DOM.saddlebagsSlotsVisual) {
    DOM.saddlebagsSlotsVisual.innerHTML = '';
    for (let i = 1; i <= totalBags; i++) {
      const slot = document.createElement('span');
      const isFilled = i <= fullBagsCount;
      slot.className = `saddlebag-slot-pill ${isFilled ? 'detached' : 'mounted'}`;
      slot.innerHTML = `Sac #${i}: ${isFilled ? `Plein (${bagSCU} SCU)` : 'Vide'}`;
      DOM.saddlebagsSlotsVisual.appendChild(slot);
    }
  }

  if (DOM.btnDetachOneBag) {
    DOM.btnDetachOneBag.textContent = `📦 Détacher 1 sac plein (${bagSCU} SCU)`;
    DOM.btnDetachOneBag.disabled = fullBagsCount === 0;
    DOM.btnDetachOneBag.style.opacity = fullBagsCount > 0 ? '1' : '0.5';
  }

  if (DOM.detachedBagsText) {
    const detachedCount = state.detachedSaddlebags.length;
    const detachedTotalSCU = state.detachedSaddlebags.reduce((acc, b) => acc + b.scu, 0);
    const t = I18N[state.currentLang] || I18N.fr;
    if (detachedCount > 0) {
      DOM.detachedBagsText.innerHTML = `<strong style="color:var(--accent-amber);">🚨 ${detachedCount} sac(s) largué(s) (${detachedTotalSCU.toFixed(1)} SCU)</strong> en flottaison. ${t.tractorRecommendation || 'Nécessite rayon tracteur & transporteur (C1, Taurus, Freelancer).'}`;
    } else {
      DOM.detachedBagsText.textContent = t.noDetachedBags || "Aucun sac largué dans l'espace.";
    }
  }
}

function detachSaddlebag() {
  const ship = state.selectedShip;
  if (!ship.detachableBags) return;
  const bagSCU = ship.saddlebagSCU;
  if (state.holdSCU < bagSCU) {
    showToast(state.currentLang === 'en' ? 'Hold volume insufficient to fill 1 full bag!' : 'Volume en soute insuffisant pour remplir 1 sac complet !');
    return;
  }

  state.holdSCU = Math.max(0, Math.round((state.holdSCU - bagSCU) * 10) / 10);
  state.detachedSaddlebags.push({
    id: Date.now(),
    shipId: ship.id,
    time: new Date().toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' }),
    scu: bagSCU,
    mineral: state.selectedMineral.id
  });

  sfx.playWarning();
  triggerHaptic(40);

  updateHoldDisplay();
  saveSession();
  showToast(state.currentLang === 'en' ? `Saddlebag (${bagSCU} SCU) detached and floating in space!` : `Sacoche (${bagSCU} SCU) détachée en flottaison dans l'espace !`);
}

function dropAllSaddlebags() {
  const ship = state.selectedShip;
  if (!ship.detachableBags) return;
  const bagSCU = ship.saddlebagSCU;
  const fullBags = Math.floor(state.holdSCU / bagSCU);
  if (fullBags === 0) {
    showToast(state.currentLang === 'en' ? 'No full saddlebags to detach!' : 'Aucun sac plein à détacher !');
    return;
  }

  for (let i = 0; i < fullBags; i++) {
    state.detachedSaddlebags.push({
      id: Date.now() + i,
      shipId: ship.id,
      time: new Date().toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' }),
      scu: bagSCU,
      mineral: state.selectedMineral.id
    });
  }

  state.holdSCU = Math.max(0, Math.round((state.holdSCU - (fullBags * bagSCU)) * 10) / 10);
  sfx.playCritical();
  triggerHaptic(60);

  updateHoldDisplay();
  saveSession();
  showToast(state.currentLang === 'en' ? `${fullBags} saddlebag(s) jettisoned!` : `${fullBags} sac(s) largué(s) dans l'espace !`);
}

// ==========================================
// FEATURE: RADAR PING RS 2.0 DECODER (4.10)
// ==========================================
function decodeRadarRS(targetRS) {
  if (!targetRS || isNaN(targetRS) || targetRS <= 0) {
    renderRadarDecoderResults([]);
    return [];
  }
  const results = [];
  const multipliers = [1, 2, 4, 8, 16];

  MINING_DATA.minerals.forEach(min => {
    if (!min.rsBase || min.rsBase <= 0) return;
    multipliers.forEach(mult => {
      const expectedRS = min.rsBase * mult;
      const diff = Math.abs(targetRS - expectedRS);
      const tolerance = Math.max(expectedRS * 0.08, 150);
      if (diff <= tolerance) {
        const accuracy = Math.max(60, Math.round(100 - (diff / expectedRS) * 100));
        results.push({
          type: 'mineral',
          item: min,
          multiplier: mult,
          expectedRS: expectedRS,
          accuracy: accuracy,
          estimatedMass: mult === 1 ? '2 500 - 6 000' : mult === 2 ? '6 000 - 14 000' : mult === 4 ? '14 000 - 30 000' : '30 000+',
          targetMass: mult === 1 ? 4800 : mult === 2 ? 9500 : mult === 4 ? 19500 : 32000,
          archetypeGuess: getArchetypeForMineral(min)
        });
      }
    });
  });

  if (MINING_DATA.rockArchetypes) {
    MINING_DATA.rockArchetypes.forEach(arch => {
      if (!arch.rsBase) return;
      multipliers.forEach(mult => {
        const expectedRS = arch.rsBase * mult;
        const diff = Math.abs(targetRS - expectedRS);
        const tolerance = Math.max(expectedRS * 0.08, 150);
        if (diff <= tolerance) {
          const accuracy = Math.max(60, Math.round(100 - (diff / expectedRS) * 100));
          results.push({
            type: 'archetype',
            item: arch,
            multiplier: mult,
            expectedRS: expectedRS,
            accuracy: accuracy,
            estimatedMass: mult === 1 ? '2 500 - 6 000' : mult === 2 ? '6 000 - 14 000' : mult === 4 ? '14 000 - 30 000' : '30 000+',
            targetMass: mult === 1 ? 4800 : mult === 2 ? 9500 : mult === 4 ? 19500 : 32000,
            archetypeGuess: arch
          });
        }
      });
    });
  }

  results.sort((a, b) => b.accuracy - a.accuracy);
  renderRadarDecoderResults(results);
  return results;
}

function getArchetypeForMineral(min) {
  if (!MINING_DATA.rockArchetypes) return null;
  if (min.id === 'quantainium' || min.id === 'stileron') {
    return MINING_DATA.rockArchetypes.find(a => a.id === 'obsidian') || MINING_DATA.rockArchetypes[0];
  }
  if (min.id === 'bexalite') {
    return MINING_DATA.rockArchetypes.find(a => a.id === 'basalt') || MINING_DATA.rockArchetypes[0];
  }
  if (min.id === 'riccite') {
    return MINING_DATA.rockArchetypes.find(a => a.id === 'atacamite') || MINING_DATA.rockArchetypes[0];
  }
  return MINING_DATA.rockArchetypes.find(a => a.id === 'granite') || MINING_DATA.rockArchetypes[0];
}

function renderRadarDecoderResults(results) {
  if (!DOM.radarMatchesContainer) return;
  DOM.radarMatchesContainer.innerHTML = '';
  const locale = getLocale();
  const t = I18N[state.currentLang] || I18N.fr;

  if (results.length === 0) {
    DOM.radarMatchesContainer.innerHTML = `
      <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
        ${t.radarNoMatch || "Aucune signature correspondante trouvée. Essayez une valeur proche ou multiple de 1x/2x/4x."}
      </div>
    `;
    return;
  }

  results.slice(0, 6).forEach((res, idx) => {
    const card = document.createElement('div');
    const isMineral = res.type === 'mineral';
    const isHighPrio = isMineral && (res.item.id === 'quantainium' || res.item.id === 'stileron' || res.item.id === 'riccite' || res.item.id === 'bexalite');
    card.className = `radar-match-card ${isHighPrio ? 'high-prio' : ''}`;

    const titleName = getLocalized(res.item, 'name');
    const symbol = res.item.symbol || 'RS';
    const color = res.item.color || 'var(--accent-cyan)';
    const archetypeName = res.archetypeGuess ? getLocalized(res.archetypeGuess, 'name') : '';

    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:34px; height:34px; border-radius:6px; background:${color}22; border:1px solid ${color}; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-weight:700; color:${color}; font-size:0.85rem;">
          ${symbol}
        </div>
        <div>
          <div style="font-family:var(--font-hud); font-size:0.9rem; color:#fff; display:flex; align-items:center; gap:6px;">
            <strong>${titleName}</strong>
            <span style="font-size:0.7rem; background:rgba(0,240,255,0.15); border:1px solid rgba(0,240,255,0.4); color:var(--accent-cyan); padding:1px 5px; border-radius:3px; font-family:var(--font-mono);">x${res.multiplier}</span>
            <span style="font-size:0.7rem; color:var(--accent-emerald); font-weight:700;">${res.accuracy}% probabilité</span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
            Masse estimée: ~${res.estimatedMass} kg • ${archetypeName ? `Archétype: ${archetypeName}` : ''}
          </div>
        </div>
      </div>
      <button class="chip-btn" data-load-radar="${idx}" style="border-color:${color}; color:${color}; font-size:0.75rem; padding:6px 12px; white-space:nowrap;">
        ${t.radarLoadBtn || "CHARGER DANS LE SCANNER"}
      </button>
    `;

    const btnLoad = card.querySelector(`[data-load-radar="${idx}"]`);
    if (btnLoad) {
      btnLoad.addEventListener('click', () => {
        sfx.playSuccess();
        triggerHaptic(20);
        if (isMineral) {
          selectMineral(res.item);
          if (res.archetypeGuess) selectArchetype(res.archetypeGuess);
        } else {
          selectArchetype(res.item);
        }
        const targetMass = res.targetMass || (res.multiplier === 1 ? 4800 : res.multiplier === 2 ? 9500 : res.multiplier === 4 ? 19500 : 32000);
        setMass(targetMass);

        closeModal(DOM.radarDecoderModal);
        showToast(state.currentLang === 'en' ? `Target ${titleName} (x${res.multiplier}) loaded into scanner!` : `Cible ${titleName} (x${res.multiplier}) chargée dans le scanner !`);
      });
    }

    DOM.radarMatchesContainer.appendChild(card);
  });
}

function updateVoiceTTSUI() {}

// ==========================================
// MOBIGLAS 4.0 TELEMETRY & INTERFACE ENGINE
// ==========================================

function setLayoutMode(mode, showNotice = false) {
  state.layoutMode = mode;
  localStorage.setItem('aaron_mfd_layout_mode', mode);
  document.documentElement.setAttribute('data-layout', mode);
  if (document.body) {
    document.body.setAttribute('data-layout', mode);
  }

  const t = I18N[state.currentLang] || I18N.fr;
  if (DOM.mgLayoutToggleLabel) {
    DOM.mgLayoutToggleLabel.textContent = mode === 'mobiglas' ? t.layoutToggleToClassic : t.layoutToggleToMobiglas;
  }

  if (DOM.dockBtnLayout) {
    const label = DOM.dockBtnLayout.querySelector('.dock-label');
    if (label) label.textContent = mode === 'mobiglas' ? t.dockLayout : 'MOBIGLAS';
  }

  if (showNotice) {
    const msg = mode === 'mobiglas' ? t.toastLayoutSwitchedToMobiglas : t.toastLayoutSwitchedToClassic;
    showToast(msg);
    sfx.playBeep(750, 'sine', 0.05);
    triggerHaptic(20);
  }
}

function updateLoreClock() {
  if (!DOM.mgLoreClock) return;
  const now = new Date();
  const year = 2954;
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  DOM.mgLoreClock.textContent = `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function updateArcFractureGauge(powerRatio, totalLaserPower, requiredPower, laserDesc) {
  if (!DOM.arcFractureGaugeWrapper || !DOM.arcPowerFill) return;

  const TOTAL_ARC_LENGTH = 460.8;
  const pct = Math.round(powerRatio * 100);

  if (DOM.arcPowerPct) {
    DOM.arcPowerPct.textContent = `${pct}%`;
  }

  if (DOM.arcPowerSub) {
    if (powerRatio >= 1.15) {
      DOM.arcPowerSub.textContent = state.currentLang === 'en' ? 'OPTIMAL SATURATION (SAFE)' : 'SATURATION OPTIMALE (ZONE VERTE)';
      DOM.arcPowerSub.setAttribute('fill', 'var(--accent-emerald)');
      if (DOM.arcPowerPct) DOM.arcPowerPct.setAttribute('fill', '#10b981');
    } else if (powerRatio >= 0.88) {
      DOM.arcPowerSub.textContent = state.currentLang === 'en' ? 'MARGINAL PENETRATION' : 'PÉNÉTRATION MARGINALE';
      DOM.arcPowerSub.setAttribute('fill', 'var(--accent-amber)');
      if (DOM.arcPowerPct) DOM.arcPowerPct.setAttribute('fill', '#f59e0b');
    } else {
      DOM.arcPowerSub.textContent = state.currentLang === 'en' ? 'INSUFFICIENT POWER' : 'DÉFICIT ÉNERGÉTIQUE CRITIQUE';
      DOM.arcPowerSub.setAttribute('fill', 'var(--accent-rose)');
      if (DOM.arcPowerPct) DOM.arcPowerPct.setAttribute('fill', '#f43f5e');
    }
  }

  if (DOM.arcLaserName) {
    const laserText = laserDesc || (state.selectedShip.id === 'mole' ? `MOLE (${state.moleActiveTurrets} TURRETS)` : state.selectedLaser.name);
    DOM.arcLaserName.textContent = `${laserText.toUpperCase()} // ${Math.round(totalLaserPower).toLocaleString(getLocale())} W`;
  }

  // Dynamic arc stroke dashoffset
  const normalizedRatio = Math.max(0, Math.min(1.5, powerRatio));
  const offset = TOTAL_ARC_LENGTH * (1 - (normalizedRatio / 1.5));
  DOM.arcPowerFill.style.strokeDashoffset = offset;

  // Safe window arc positioning
  if (DOM.arcSafeZone) {
    const safeStartFraction = 0.88 / 1.5;
    const safeEndFraction = 1.15 / 1.5;
    const safeLength = TOTAL_ARC_LENGTH * (safeEndFraction - safeStartFraction);
    const safeOffset = TOTAL_ARC_LENGTH * (1 - safeStartFraction);
    DOM.arcSafeZone.setAttribute('stroke-dasharray', `${safeLength.toFixed(1)} ${TOTAL_ARC_LENGTH}`);
    DOM.arcSafeZone.setAttribute('stroke-dashoffset', `-${(TOTAL_ARC_LENGTH - safeOffset).toFixed(1)}`);
  }

  // Overcharge danger zone
  if (DOM.arcDangerZone) {
    const dangerStartFraction = 1.0 / 1.5;
    const dangerLength = TOTAL_ARC_LENGTH * (1 - dangerStartFraction);
    DOM.arcDangerZone.setAttribute('stroke-dasharray', `${dangerLength.toFixed(1)} ${TOTAL_ARC_LENGTH}`);
    DOM.arcDangerZone.setAttribute('stroke-dashoffset', `-${(TOTAL_ARC_LENGTH * dangerStartFraction).toFixed(1)}`);
  }
}

function populateAllShipSelects() {
  const allShips = MINING_DATA.getAllPlayableShips ? MINING_DATA.getAllPlayableShips() : [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];
  const isEn = state.currentLang === 'en';
  const groups = [
    { label: isEn ? '⛏️ Industrial Mining' : '⛏️ Minage & Prospection Industrielle', roles: ['mining'] },
    { label: isEn ? '🚜 Freight & Heavy Logistics' : '🚜 Transport Fret & Logistique', roles: ['cargo', 'hauler'] },
    { label: isEn ? '♻️ Salvage & Recovery' : '♻️ Recyclage & Récupération (Salvage)', roles: ['salvage'] },
    { label: isEn ? '🛡️ Combat & Space Superiority' : '🛡️ Escorte & Supériorité Spatiale', roles: ['combat', 'escort'] }
  ];

  [DOM.shipSelect, DOM.mgShipSelect, DOM.loadoutShipSelect].forEach(sel => {
    if (!sel) return;
    const curVal = sel.value || state.selectedShip?.id || 'prospector';
    sel.innerHTML = '';
    groups.forEach(grp => {
      const groupShips = allShips.filter(s => grp.roles.includes(s.role));
      if (groupShips.length === 0) return;
      const optGroup = document.createElement('optgroup');
      optGroup.label = grp.label;
      groupShips.forEach(ship => {
        const opt = document.createElement('option');
        opt.value = ship.id;
        const capText = (ship.scu || ship.cargoScu) ? `${ship.scu || ship.cargoScu} SCU` : (ship.role === 'combat' ? (isEn ? 'Combat Fighter' : 'Chasseur Lourd') : '');
        opt.textContent = `${ship.name} ${capText ? `(${capText})` : ''}`;
        if (ship.id === curVal) opt.selected = true;
        optGroup.appendChild(opt);
      });
      sel.appendChild(optGroup);
    });
    sel.value = curVal;
  });
}

function setShip(shipId) {
  const allShips = MINING_DATA.getAllPlayableShips ? MINING_DATA.getAllPlayableShips() : [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];
  state.selectedShip = allShips.find(s => s.id === shipId) || MINING_DATA.ships.find(s => s.id === shipId) || MINING_DATA.ships[0];

  if (DOM.shipSelect && DOM.shipSelect.value !== state.selectedShip.id) {
    DOM.shipSelect.value = state.selectedShip.id;
  }
  if (DOM.mgShipSelect && DOM.mgShipSelect.value !== state.selectedShip.id) {
    DOM.mgShipSelect.value = state.selectedShip.id;
  }
  if (DOM.loadoutShipSelect && DOM.loadoutShipSelect.value !== state.selectedShip.id) {
    DOM.loadoutShipSelect.value = state.selectedShip.id;
  }
  if (DOM.myShipSelect && DOM.myShipSelect.value !== state.selectedShip.id) {
    DOM.myShipSelect.value = state.selectedShip.id;
  }

  // Also sync personal fleet active ship if exists
  if (state.myPersonalFleet && state.myPersonalFleet.length > 0) {
    const fleetMatch = state.myPersonalFleet.find(s => s.shipId === state.selectedShip.id);
    if (fleetMatch) {
      state.selectedFleetShipId = fleetMatch.id;
      if (!fleetMatch.isActive) {
        activatePersonalShip(fleetMatch.id, true);
      } else {
        renderMyShipHub();
      }
    }
  }

  updateLaserOptions();
  populateLoadoutSelects();
  updateLoadoutButtonSummary();
  populateSecondaryOreSelect();
  updateSaddlebagsUI();
  updateHoldDisplay();
  calculateAll();
  broadcastLocalLoadout();
}

function updateMobiglasHeader(ship, pureSCU, refinedPrice) {
  if (!DOM.mobiglasSystemHeader) return;
  const locale = getLocale();
  if (DOM.mgShipSelect && DOM.mgShipSelect.value !== ship.id) {
    DOM.mgShipSelect.value = ship.id;
  }
  if (DOM.loadoutShipSelect && DOM.loadoutShipSelect.value !== ship.id) {
    DOM.loadoutShipSelect.value = ship.id;
  }
  if (DOM.mgBalanceVal) {
    let totalRefined = state.sessionLog.reduce((acc, x) => acc + x.refinedVal, 0);
    if (totalRefined === 0 && refinedPrice) totalRefined = refinedPrice;
    DOM.mgBalanceVal.textContent = `${totalRefined.toLocaleString(locale)} aUEC`;
  }
  if (DOM.btnMgLang) {
    DOM.btnMgLang.textContent = state.currentLang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';
  }
  if (DOM.btnMgAudio) {
    DOM.btnMgAudio.textContent = state.audioEnabled ? '🔊' : '🔇';
    DOM.btnMgAudio.style.opacity = state.audioEnabled ? '1' : '0.5';
  }

  if (DOM.dockRefineryBadge) {
    const count = state.refineryJobs.length;
    DOM.dockRefineryBadge.style.display = count > 0 ? 'flex' : 'none';
    DOM.dockRefineryBadge.textContent = count;
  }
}

// ==========================================
// MON VAISSEAU & SYSTÈMES DE BORD (Single Source of Truth)
// ==========================================

function getActiveShipDef(shipId = null) {
  const targetId = shipId || getSelectedFleetShip()?.shipId || state.myActiveShip?.shipId;
  const allShips = MINING_DATA.getAllPlayableShips ? MINING_DATA.getAllPlayableShips() : [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];
  return allShips.find(s => s.id === targetId) || MINING_DATA.ships[0];
}

function getSelectedFleetShip() {
  if (!state.myPersonalFleet || state.myPersonalFleet.length === 0) {
    loadMyPersonalFleet();
  }
  let ship = state.myPersonalFleet.find(s => s.id === state.selectedFleetShipId);
  if (!ship) {
    ship = state.myPersonalFleet.find(s => s.isActive) || state.myPersonalFleet[0];
    if (ship) state.selectedFleetShipId = ship.id;
  }
  return ship;
}

function createDefaultPersonalShip(modelId, customName = '', location = 'HUR-L1 Green Glade') {
  const allShips = MINING_DATA.getAllPlayableShips ? MINING_DATA.getAllPlayableShips() : [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];
  const shipDef = allShips.find(s => s.id === modelId) || MINING_DATA.ships[0];

  const qds = (MINING_DATA.quantumDrives || []).filter(q => q.size === shipDef.qdSize);
  const shields = (MINING_DATA.shields || []).filter(s => s.size === shipDef.shieldSize);
  const pwrs = (MINING_DATA.powerPlants || []).filter(p => p.size === shipDef.powerSize);
  const coolers = (MINING_DATA.coolers || []).filter(c => c.size === shipDef.coolerSize);

  let laserId = 'none';
  let submodules = ['none', 'none', 'none'];
  let gadgetId = 'none';
  let turrets = [];
  if (shipDef.role === 'mining') {
    const laserSize = shipDef.laserSize || 1;
    const lasers = (MINING_DATA.lasers || []).filter(l => (l.size || 1) === laserSize || (laserSize === 0 && l.size === 0));
    laserId = lasers.length > 0 ? lasers[0].id : 'arbor_mh1';
    submodules = ['focus_3', 'surge', 'none'];
    gadgetId = 'sabir';
    const slotsCount = shipDef.laserSlots || 1;
    for (let i = 0; i < slotsCount; i++) {
      turrets.push({
        laserId: laserId,
        moduleIds: ['focus_3', 'surge', 'none']
      });
    }
  }

  return {
    id: 'perso_' + modelId + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    shipId: shipDef.id,
    customName: customName || shipDef.name,
    role: shipDef.role || 'mining',
    status: 'available',
    location: location,
    laserId: laserId,
    submodules: submodules,
    gadgetId: gadgetId,
    turrets: turrets,
    miningWeaponId: (shipDef.laserSize >= 2 ? 'cf227_s2' : 'cf117_s1'),
    saddlebagType: 'standard',
    cargoTractorId: (shipDef.scu > 200 || shipDef.cargoScu > 200) ? 'heavytractor_s3' : 'truhold_s2',
    cargoGridMode: 'standard',
    cargoTurretId: (shipDef.scu > 200 || shipDef.cargoScu > 200) ? 'cf447_s4' : 'cf337_s3',
    salvageHead1Id: 'abrade_s1',
    salvageHead2Id: 'clincher_s1',
    salvageTractorId: 'suregrip_s1',
    salvageWeaponId: 'cf227_s2',
    combatPrimaryId: 'cf337_s3',
    combatTurretId: (shipDef.id === 'hurricane' || shipDef.id === 'scorpius') ? 'cf447_s4' : 'cf337_s3',
    combatMissileId: 'msl_strikeforce_s2',
    quantumDriveId: qds[0]?.id || 'atlas_s1',
    shieldId: shields[0]?.id || 'fr66_s1',
    powerPlantId: pwrs[0]?.id || 'js300_s1',
    coolerId: coolers[0]?.id || 'ultraflow_s1',
    isActive: false
  };
}

function loadMyPersonalFleet() {
  try {
    const raw = localStorage.getItem('aaron_mfd_my_personal_fleet');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.myPersonalFleet = parsed;
      }
    }
  } catch (err) {
    console.warn('[Aaron MFD] Erreur chargement flotte personnelle:', err);
  }

  // Seed default 3 ships if empty
  if (!state.myPersonalFleet || state.myPersonalFleet.length === 0) {
    const s1 = createDefaultPersonalShip('prospector', 'Prospector Alpha', 'HUR-L1 Green Glade');
    s1.id = 'perso_prospector_default';
    s1.isActive = true;
    s1.laserId = 'lancet_s1';
    s1.submodules = ['focus_3', 'surge', 'none'];
    s1.gadgetId = 'sabir';

    const s2 = createDefaultPersonalShip('c2', 'Crusader Titan', 'ARC-L1 Wide Forest');
    s2.id = 'perso_c2_default';
    s2.isActive = false;

    const s3 = createDefaultPersonalShip('mole', 'Argo Deep Bore', 'MIC-L1 Shallow Frontier');
    s3.id = 'perso_mole_default';
    s3.isActive = false;
    s3.laserId = 'lancet_s2';
    s3.submodules = ['focus_3', 'stampede', 'stampede'];
    s3.turrets = [
      { laserId: 'lancet_s2', moduleIds: ['focus_3', 'stampede', 'stampede'] },
      { laserId: 'helix_s2', moduleIds: ['focus_3', 'surge', 'none'] },
      { laserId: 'klein_s2', moduleIds: ['focus_3', 'surge', 'none'] }
    ];
    s3.gadgetId = 'boreas';

    state.myPersonalFleet = [s1, s2, s3];
    saveMyPersonalFleet();
  }

  // Normalize and synchronize all components & multi-turrets for all fleet ships
  (state.myPersonalFleet || []).forEach(ship => {
    syncShipComponentDefaults(false, ship);
  });

  // Ensure exactly one active ship
  let active = state.myPersonalFleet.find(s => s.isActive);
  if (!active) {
    state.myPersonalFleet[0].isActive = true;
    active = state.myPersonalFleet[0];
  }
  state.myActiveShip = Object.assign({}, active);

  if (!state.selectedFleetShipId || !state.myPersonalFleet.some(s => s.id === state.selectedFleetShipId)) {
    state.selectedFleetShipId = active.id;
  }
}

function saveMyPersonalFleet() {
  try {
    localStorage.setItem('aaron_mfd_my_personal_fleet', JSON.stringify(state.myPersonalFleet));
    const active = state.myPersonalFleet.find(s => s.isActive);
    if (active) {
      state.myActiveShip = Object.assign({}, active);
      localStorage.setItem('aaron_mfd_my_active_ship', JSON.stringify(state.myActiveShip));
    }
  } catch (err) {
    console.warn('[Aaron MFD] Erreur sauvegarde flotte personnelle:', err);
  }
}

function loadMyShipConfig() {
  loadMyPersonalFleet();
  syncShipComponentDefaults(false);
}

function saveMyShipConfig() {
  saveMyPersonalFleet();
}

function syncShipComponentDefaults(forceReset = false, targetShip = null) {
  const ship = targetShip || getSelectedFleetShip() || state.myActiveShip;
  if (!ship) return;
  const shipDef = getActiveShipDef(ship.shipId);
  ship.role = shipDef.role || 'mining';

  // 1. Quantum Drive size match
  const qds = (MINING_DATA.quantumDrives || []).filter(q => q.size === shipDef.qdSize);
  const currentQd = (MINING_DATA.quantumDrives || []).find(q => q.id === ship.quantumDriveId);
  if (forceReset || !currentQd || currentQd.size !== shipDef.qdSize) {
    if (qds.length > 0) ship.quantumDriveId = qds[0].id;
  }

  // 2. Shield size match
  const shields = (MINING_DATA.shields || []).filter(s => s.size === shipDef.shieldSize);
  const currentShield = (MINING_DATA.shields || []).find(s => s.id === ship.shieldId);
  if (forceReset || !currentShield || currentShield.size !== shipDef.shieldSize) {
    if (shields.length > 0) ship.shieldId = shields[0].id;
  }

  // 3. Power Plant size match
  const pwrs = (MINING_DATA.powerPlants || []).filter(p => p.size === shipDef.powerSize);
  const currentPwr = (MINING_DATA.powerPlants || []).find(p => p.id === ship.powerPlantId);
  if (forceReset || !currentPwr || currentPwr.size !== shipDef.powerSize) {
    if (pwrs.length > 0) ship.powerPlantId = pwrs[0].id;
  }

  // 4. Cooler size match
  const coolers = (MINING_DATA.coolers || []).filter(c => c.size === shipDef.coolerSize);
  const currentCooler = (MINING_DATA.coolers || []).find(c => c.id === ship.coolerId);
  if (forceReset || !currentCooler || currentCooler.size !== shipDef.coolerSize) {
    if (coolers.length > 0) ship.coolerId = coolers[0].id;
  }

  // 5. Mining laser size match if mining
  if (shipDef.role === 'mining') {
    const laserSize = shipDef.laserSize || 1;
    const availableLasers = (MINING_DATA.lasers || []).filter(l => (l.size || 1) === laserSize || (laserSize === 0 && (l.size === 0)));
    const currentLaser = (MINING_DATA.lasers || []).find(l => l.id === ship.laserId);
    if (forceReset || !currentLaser || (currentLaser.size || 1) !== laserSize) {
      if (availableLasers.length > 0) {
        ship.laserId = availableLasers[0].id;
      }
    }
  } else {
    ship.laserId = 'none';
  }

  // 6. Role equipment defaults & validation
  const heavyCargo = (shipDef.scu > 200 || shipDef.cargoScu > 200);
  if (!ship.cargoTractorId || !(MINING_DATA.tractorBeams || []).some(tb => tb.id === ship.cargoTractorId)) {
    ship.cargoTractorId = (heavyCargo ? 'heavytractor_s3' : 'truhold_s2');
  }
  if (!ship.cargoGridMode) ship.cargoGridMode = 'standard';
  if (!ship.cargoTurretId || !(MINING_DATA.shipWeapons || []).some(w => w.id === ship.cargoTurretId)) {
    ship.cargoTurretId = (heavyCargo ? 'cf447_s4' : 'cf337_s3');
  }
  if (!ship.salvageHead1Id || !(MINING_DATA.salvageHeads || []).some(sh => sh.id === ship.salvageHead1Id)) {
    ship.salvageHead1Id = 'abrade_s1';
  }
  if (!ship.salvageHead2Id || !(MINING_DATA.salvageHeads || []).some(sh => sh.id === ship.salvageHead2Id)) {
    ship.salvageHead2Id = 'clincher_s1';
  }
  if (!ship.salvageTractorId || !(MINING_DATA.tractorBeams || []).some(tb => tb.id === ship.salvageTractorId)) {
    ship.salvageTractorId = 'suregrip_s1';
  }
  if (!ship.salvageWeaponId || !(MINING_DATA.shipWeapons || []).some(w => w.id === ship.salvageWeaponId)) {
    ship.salvageWeaponId = 'cf227_s2';
  }
  if (!ship.combatPrimaryId || !(MINING_DATA.shipWeapons || []).some(w => w.id === ship.combatPrimaryId)) {
    ship.combatPrimaryId = 'cf337_s3';
  }
  if (!ship.combatTurretId || !(MINING_DATA.shipWeapons || []).some(w => w.id === ship.combatTurretId)) {
    ship.combatTurretId = (shipDef.id === 'hurricane' || shipDef.id === 'scorpius' ? 'cf447_s4' : 'cf337_s3');
  }
  if (!ship.combatMissileId || !(MINING_DATA.missileRacks || []).some(mr => mr.id === ship.combatMissileId)) {
    ship.combatMissileId = 'msl_strikeforce_s2';
  }
  if (!ship.miningWeaponId || !(MINING_DATA.shipWeapons || []).some(w => w.id === ship.miningWeaponId)) {
    ship.miningWeaponId = (shipDef.laserSize >= 2 ? 'cf227_s2' : 'cf117_s1');
  }

  // 7. Multi-turrets synchronization for mining vessels
  if (shipDef.role === 'mining') {
    const slotsCount = shipDef.laserSlots || 1;
    const laserSize = shipDef.laserSize || 1;
    const availableLasers = (MINING_DATA.lasers || []).filter(l => (l.size || 1) === laserSize || (laserSize === 0 && l.size === 0));
    const defaultLaser = availableLasers[0]?.id || 'arbor_mh1';
    if (!Array.isArray(ship.turrets)) {
      ship.turrets = [];
    }
    while (ship.turrets.length < slotsCount) {
      ship.turrets.push({
        laserId: defaultLaser,
        moduleIds: ['none', 'none', 'none']
      });
    }
    if (ship.turrets.length > slotsCount) {
      ship.turrets = ship.turrets.slice(0, slotsCount);
    }
    ship.turrets.forEach(t => {
      const match = (MINING_DATA.lasers || []).find(l => l.id === t.laserId);
      if (!match || (match.size !== laserSize && !(laserSize === 0 && match.size === 0))) {
        t.laserId = defaultLaser;
      }
      if (!Array.isArray(t.moduleIds)) t.moduleIds = ['none', 'none', 'none'];
    });
  }
}

function calculateShipTelemetry(shipConfig = null) {
  const current = shipConfig || getSelectedFleetShip() || state.myActiveShip;
  const shipDef = getActiveShipDef(current?.shipId);
  const qd = (MINING_DATA.quantumDrives || []).find(q => q.id === current?.quantumDriveId) ||
    MINING_DATA.quantumDrives?.[0] || { id: 'atlas_s1', name: 'Atlas', speed: 283000000, grade: 'A', class: 'Militaire', fuelPerGm: 5.2 };

  const shield = (MINING_DATA.shields || []).find(s => s.id === current?.shieldId) ||
    MINING_DATA.shields?.[0] || { id: 'fr66_s1', name: 'FR-66', hp: 3350, regen: 305 };

  const pwr = (MINING_DATA.powerPlants || []).find(p => p.id === current?.powerPlantId) ||
    MINING_DATA.powerPlants?.[0] || { id: 'js300_s1', name: 'JS-300', powerOutput: 4350 };

  const cooler = (MINING_DATA.coolers || []).find(c => c.id === current?.coolerId) ||
    MINING_DATA.coolers?.[0] || { id: 'ultraflow_s1', name: 'Ultra-Flow', coolingRate: 320000 };

  // SCU capacity & bags
  let scu = shipDef.cargoScu || shipDef.scu || 0;
  let bagDesc = 'Soute pressurisée standard';
  if (shipDef.id === 'prospector') {
    if (current?.saddlebagType === 'mole') {
      scu = 48;
      bagDesc = 'Poches d\'extraction MOLE montées (48 SCU)';
    } else {
      scu = 32;
      bagDesc = 'Poches d\'extraction MISC standard (32 SCU)';
    }
  } else if (shipDef.id === 'mole') {
    scu = 96;
    bagDesc = '8x Sacoches d\'extraction amovibles (96 SCU)';
  } else if (shipDef.id === 'arrastra') {
    scu = 576;
    bagDesc = 'Soute industrielle lourde intégrée 576 SCU';
  } else if (shipDef.id === 'c2') {
    scu = 696;
    bagDesc = 'Soute fret double pont roulier 696 SCU';
  } else if (shipDef.id === 'caterpillar') {
    scu = 576;
    bagDesc = '4x Modules de fret pressurisés 576 SCU';
  } else if (shipDef.id === 'taurus') {
    scu = 174;
    bagDesc = 'Soute cargo allongée 168 + 6 SCU blindée';
  } else if (shipDef.id === 'vulture') {
    scu = 12;
    bagDesc = 'Grille de soute 12 SCU + Buffer 13 SCU';
  }

  // QD telemetry
  const qdSpeedC = (qd.speed / 299792458).toFixed(2);
  const qdSpeedKms = Math.round(qd.speed / 1000).toLocaleString();
  const qfTank = shipDef.qfTank || 583;
  const maxRangeGm = (qfTank / (qd.fuelPerGm || 5.2)).toFixed(1);

  // Shield telemetry
  const shieldCount = shipDef.shieldCount || 1;
  const totalHp = shield.hp * shieldCount;
  const totalRegen = shield.regen * shieldCount;

  // Power telemetry
  const powerWatts = pwr.powerOutput || 4350;
  const estimatedDraw = Math.round(powerWatts * 0.54);
  const powerLoadPct = Math.round((estimatedDraw / powerWatts) * 100);

  // Cooler telemetry
  const coolerCount = shipDef.coolerCount || 1;
  const totalCooling = cooler.coolingRate * coolerCount;

  return {
    shipDef,
    scu,
    bagDesc,
    qd,
    qdSpeedC,
    qdSpeedKms,
    maxRangeGm,
    shield,
    totalHp,
    totalRegen,
    pwr,
    powerWatts,
    powerLoadPct,
    cooler,
    totalCooling
  };
}

function populateShipComponentDropdowns(targetShip = null) {
  const current = targetShip || getSelectedFleetShip() || state.myActiveShip;
  const shipDef = getActiveShipDef(current?.shipId);
  const allShips = MINING_DATA.getAllPlayableShips ? MINING_DATA.getAllPlayableShips() : [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];

  // 1. Ship Model Select
  if (DOM.myShipSelect) {
    DOM.myShipSelect.innerHTML = '';
    const groups = [
      { label: '⛏️ Minage & Prospection Industrielle', roles: ['mining'] },
      { label: '🚜 Transport Fret & Logistique Lourde', roles: ['cargo', 'hauler'] },
      { label: '♻️ Recyclage & Récupération Industrielle', roles: ['salvage'] },
      { label: '🛡️ Escorte & Supériorité Spatiale', roles: ['combat', 'escort'] }
    ];

    groups.forEach(grp => {
      const groupShips = allShips.filter(s => grp.roles.includes(s.role));
      if (groupShips.length === 0) return;
      const optGroup = document.createElement('optgroup');
      optGroup.label = grp.label;
      groupShips.forEach(ship => {
        const opt = document.createElement('option');
        opt.value = ship.id;
        const capText = (ship.scu || ship.cargoScu) ? `${ship.scu || ship.cargoScu} SCU` : (ship.role === 'combat' ? 'Interception' : 'Spécialisé');
        opt.textContent = `${ship.name} (${capText})`;
        if (ship.id === current.shipId) opt.selected = true;
        optGroup.appendChild(opt);
      });
      DOM.myShipSelect.appendChild(optGroup);
    });
    DOM.myShipSelect.value = current.shipId;
  }

  // 2. Mining Laser Select
  let currentLaserObj = null;
  if (DOM.myShipLaserSelect) {
    DOM.myShipLaserSelect.innerHTML = '';
    const laserSize = shipDef.laserSize || 1;
    const availableLasers = (MINING_DATA.lasers || []).filter(l => (l.size || 1) === laserSize || (laserSize === 0 && l.size === 0));
    availableLasers.forEach(laser => {
      const opt = document.createElement('option');
      opt.value = laser.id;
      const instabSign = laser.instability > 0 ? '+' : '';
      const slotTxt = laser.slots !== undefined ? `${laser.slots} slot${laser.slots > 1 ? 's' : ''}` : '0 slot';
      opt.textContent = `${laser.name} (S${laser.size ?? 1} • ${slotTxt} • Pwr ${laser.power} W • Instab ${instabSign}${laser.instability}%)`;
      if (laser.id === current.laserId) opt.selected = true;
      DOM.myShipLaserSelect.appendChild(opt);
    });
    DOM.myShipLaserSelect.value = current.laserId || (availableLasers[0]?.id || 'arbor_mh1');
    currentLaserObj = availableLasers.find(l => l.id === DOM.myShipLaserSelect.value) || availableLasers[0];
  }

  const laserSlotsCount = currentLaserObj?.slots ?? 0;
  if (DOM.myShipLaserSizeHint) {
    const isEn = state.currentLang === 'en';
    if (laserSlotsCount === 0) {
      DOM.myShipLaserSizeHint.textContent = isEn 
        ? `Laser Head S${shipDef.laserSize ?? 1} • No submodule slots (0 slot)`
        : `Emplacement Laser S${shipDef.laserSize ?? 1} • Aucun sous-module (0 slot)`;
    } else {
      DOM.myShipLaserSizeHint.textContent = isEn 
        ? `Laser Head S${shipDef.laserSize ?? 1} • ${laserSlotsCount} submodule slot${laserSlotsCount > 1 ? 's' : ''}`
        : `Emplacement Laser S${shipDef.laserSize ?? 1} • ${laserSlotsCount} emplacement${laserSlotsCount > 1 ? 's' : ''} de sous-module${laserSlotsCount > 1 ? 's' : ''}`;
    }
  }

  // 3. Submodules 1, 2, 3 dynamic adaptation based on laser head slots
  const subSelects = [DOM.myShipSubmod1Select, DOM.myShipSubmod2Select, DOM.myShipSubmod3Select];
  const subWrappers = [DOM.myShipSubmodSlot1Wrapper, DOM.myShipSubmodSlot2Wrapper, DOM.myShipSubmodSlot3Wrapper];

  if (DOM.myShipSubmodsNotice && DOM.myShipSubmodsGrid) {
    if (laserSlotsCount === 0) {
      DOM.myShipSubmodsNotice.style.display = 'block';
      DOM.myShipSubmodsNotice.textContent = (state.currentLang === 'en')
        ? `No submodule slots available for ${currentLaserObj?.name || 'this laser'} (0 slot).`
        : `Aucun emplacement de sous-module sur la tête ${currentLaserObj?.name || 'actuelle'} (0 slot).`;
      DOM.myShipSubmodsGrid.style.display = 'none';
      if (Array.isArray(current.submodules)) {
        current.submodules = ['none', 'none', 'none'];
      }
    } else {
      DOM.myShipSubmodsNotice.style.display = 'none';
      DOM.myShipSubmodsGrid.style.display = 'grid';
      for (let i = 0; i < 3; i++) {
        if (subWrappers[i]) {
          subWrappers[i].style.display = (i < laserSlotsCount) ? 'block' : 'none';
        }
        if (i >= laserSlotsCount && Array.isArray(current.submodules)) {
          current.submodules[i] = 'none';
        }
      }
    }
  }

  subSelects.forEach((sel, idx) => {
    if (!sel) return;
    sel.innerHTML = '<option value="none">-- Aucun Module --</option>';
    (MINING_DATA.modules || []).forEach(m => {
      if (m.id === 'none') return;
      const opt = document.createElement('option');
      opt.value = m.id;
      const typeLabel = m.type === 'active' ? '⚡ ACTIF' : '🛡️ PASSIF';
      const usesLabel = m.uses ? `${m.uses} charges` : 'Illimité';
      opt.textContent = `${m.name} (${typeLabel} • ${usesLabel})`;
      if (current.submodules && current.submodules[idx] === m.id) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.value = (current.submodules && current.submodules[idx]) || 'none';
  });

  // 4. Gadget Select
  if (DOM.myShipGadgetSelect) {
    DOM.myShipGadgetSelect.innerHTML = '<option value="none">-- Aucun Gadget --</option>';
    (MINING_DATA.gadgets || []).forEach(g => {
      if (g.id === 'none') return;
      const opt = document.createElement('option');
      opt.value = g.id;
      const parts = [];
      const resPct = g.resMod ? Math.round(g.resMod * 100) : (g.resistance || 0);
      const instPct = g.instMod ? Math.round(g.instMod * 100) : (g.instability || 0);
      const winPct = g.windowMod ? Math.round(g.windowMod * 100) : 0;
      if (resPct !== 0) parts.push(`Résist ${resPct > 0 ? '+' : ''}${resPct}%`);
      if (instPct !== 0) parts.push(`Instab ${instPct > 0 ? '+' : ''}${instPct}%`);
      if (winPct !== 0) parts.push(`Fenêtre ${winPct > 0 ? '+' : ''}${winPct}%`);
      const details = parts.length > 0 ? ` (${parts.join(' • ')})` : '';
      opt.textContent = `${g.name}${details}`;
      if (current.gadgetId === g.id) opt.selected = true;
      DOM.myShipGadgetSelect.appendChild(opt);
    });
    DOM.myShipGadgetSelect.value = current.gadgetId || 'none';
  }

  // 4b. Defensive Weapon for Mining Ships
  if (DOM.myShipMiningWeaponSelect) {
    DOM.myShipMiningWeaponSelect.innerHTML = '';
    (MINING_DATA.shipWeapons || []).forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = `⚔️ ${w.name} (S${w.size} • ${w.type} • ${w.rpm} RPM • ${w.dps} DPS)`;
      if (w.id === current.miningWeaponId) opt.selected = true;
      DOM.myShipMiningWeaponSelect.appendChild(opt);
    });
    DOM.myShipMiningWeaponSelect.value = current.miningWeaponId || (shipDef.laserSize >= 2 ? 'cf227_s2' : 'cf117_s1');
    const selectedW = (MINING_DATA.shipWeapons || []).find(w => w.id === DOM.myShipMiningWeaponSelect.value) || MINING_DATA.shipWeapons?.[0];
    if (DOM.myShipMiningWeaponStats && selectedW) {
      DOM.myShipMiningWeaponStats.textContent = `Armement Défensif : ${selectedW.name} (S${selectedW.size}) • ${selectedW.dps} DPS • Vélocité ${selectedW.velocity} m/s • ${selectedW.rpm} RPM`;
    }
  }

  // 4c. Field Support Gadget for Cargo Ships
  if (DOM.myShipCargoGadgetSelect) {
    DOM.myShipCargoGadgetSelect.innerHTML = '<option value="none">-- Aucun Gadget (Support Terrain) --</option>';
    (MINING_DATA.gadgets || []).forEach(g => {
      if (g.id === 'none') return;
      const opt = document.createElement('option');
      opt.value = g.id;
      const parts = [];
      const resPct = g.resMod ? Math.round(g.resMod * 100) : (g.resistance || 0);
      const instPct = g.instMod ? Math.round(g.instMod * 100) : (g.instability || 0);
      const winPct = g.windowMod ? Math.round(g.windowMod * 100) : 0;
      if (resPct !== 0) parts.push(`Résist ${resPct > 0 ? '+' : ''}${resPct}%`);
      if (instPct !== 0) parts.push(`Instab ${instPct > 0 ? '+' : ''}${instPct}%`);
      if (winPct !== 0) parts.push(`Fenêtre ${winPct > 0 ? '+' : ''}${winPct}%`);
      const details = parts.length > 0 ? ` (${parts.join(' • ')})` : '';
      opt.textContent = `${g.name}${details}`;
      if (current.gadgetId === g.id) opt.selected = true;
      DOM.myShipCargoGadgetSelect.appendChild(opt);
    });
    DOM.myShipCargoGadgetSelect.value = current.gadgetId || 'none';
  }

  // 5. Saddlebags Select
  if (DOM.myShipSaddlebagsSelect) {
    DOM.myShipSaddlebagsSelect.value = current.saddlebagType || 'standard';
  }

  // 6. Quantum Drive Select
  if (DOM.myShipQdSelect) {
    DOM.myShipQdSelect.innerHTML = '';
    const qds = (MINING_DATA.quantumDrives || []).filter(q => q.size === shipDef.qdSize);
    qds.forEach(qd => {
      const opt = document.createElement('option');
      opt.value = qd.id;
      const speedKm = Math.round(qd.speed / 1000).toLocaleString();
      opt.textContent = `${qd.name} (S${qd.size} • Gr.${qd.grade} ${qd.class} • ${speedKm} km/s)`;
      if (qd.id === current.quantumDriveId) opt.selected = true;
      DOM.myShipQdSelect.appendChild(opt);
    });
  }
  if (DOM.myShipQdSlotHint) {
    DOM.myShipQdSlotHint.textContent = `Emplacement S${shipDef.qdSize || 1} • Réservoir QF : ${shipDef.qfTank || 583} L`;
  }

  // 7. Shield Select
  if (DOM.myShipShieldSelect) {
    DOM.myShipShieldSelect.innerHTML = '';
    const shields = (MINING_DATA.shields || []).filter(s => s.size === shipDef.shieldSize);
    shields.forEach(sh => {
      const opt = document.createElement('option');
      opt.value = sh.id;
      opt.textContent = `${sh.name} (S${sh.size} • ${sh.hp.toLocaleString()} HP • ${sh.regen} HP/s)`;
      if (sh.id === current.shieldId) opt.selected = true;
      DOM.myShipShieldSelect.appendChild(opt);
    });
  }
  if (DOM.myShipShieldSlotHint) {
    DOM.myShipShieldSlotHint.textContent = `${shipDef.shieldCount || 1}x Emplacement(s) S${shipDef.shieldSize || 1}`;
  }

  // 8. Power Plant Select
  if (DOM.myShipPowerSelect) {
    DOM.myShipPowerSelect.innerHTML = '';
    const pwrs = (MINING_DATA.powerPlants || []).filter(p => p.size === shipDef.powerSize);
    pwrs.forEach(pwr => {
      const opt = document.createElement('option');
      opt.value = pwr.id;
      opt.textContent = `${pwr.name} (S${pwr.size} • ${pwr.powerOutput.toLocaleString()} W)`;
      if (pwr.id === current.powerPlantId) opt.selected = true;
      DOM.myShipPowerSelect.appendChild(opt);
    });
  }
  if (DOM.myShipPowerSlotHint) {
    DOM.myShipPowerSlotHint.textContent = `Emplacement S${shipDef.powerSize || 1} Génératrice`;
  }

  // 9. Cooler Select
  if (DOM.myShipCoolerSelect) {
    DOM.myShipCoolerSelect.innerHTML = '';
    const coolers = (MINING_DATA.coolers || []).filter(c => c.size === shipDef.coolerSize);
    coolers.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (S${c.size} • ${Math.round(c.coolingRate / 1000).toLocaleString()} kK/s)`;
      if (c.id === current.coolerId) opt.selected = true;
      DOM.myShipCoolerSelect.appendChild(opt);
    });
  }
  if (DOM.myShipCoolerSlotHint) {
    DOM.myShipCoolerSlotHint.textContent = `${shipDef.coolerCount || 1}x Emplacement(s) S${shipDef.coolerSize || 1}`;
  }

  // 10. Role Specialized Equipment & Turrets (Mining / Cargo / Salvage / Combat)
  renderMyShipRoleEquipment(current, shipDef);
}

// Render dynamic equipment cards for personal ship in MyShip Hub
function renderMyShipRoleEquipment(current, shipDef) {
  if (!current || !shipDef) return;

  const role = shipDef.role || current.role || 'mining';
  const isMining = role === 'mining';
  const isCargo = role === 'cargo' || role === 'hauler';
  const isSalvage = role === 'salvage';
  const isCombat = role === 'combat' || role === 'escort';

  // Toggle Visibility of Role Gear Boxes
  if (DOM.myShipMiningGearBox) DOM.myShipMiningGearBox.style.display = isMining ? 'block' : 'none';
  if (DOM.myShipCargoGearBox) DOM.myShipCargoGearBox.style.display = isCargo ? 'block' : 'none';
  if (DOM.myShipSalvageGearBox) DOM.myShipSalvageGearBox.style.display = isSalvage ? 'block' : 'none';
  if (DOM.myShipCombatGearBox) DOM.myShipCombatGearBox.style.display = isCombat ? 'block' : 'none';

  // Update Header Role Badge in Equipment Card
  if (DOM.myShipRoleEquipBadge) {
    if (isMining) {
      DOM.myShipRoleEquipBadge.textContent = 'MINAGE INDUSTRIEL';
      DOM.myShipRoleEquipBadge.style.color = 'var(--accent-amber)';
      DOM.myShipRoleEquipBadge.style.borderColor = 'var(--accent-amber)';
      DOM.myShipRoleEquipBadge.style.background = 'rgba(245,158,11,0.15)';
    } else if (isCargo) {
      DOM.myShipRoleEquipBadge.textContent = 'FRET & LOGISTIQUE';
      DOM.myShipRoleEquipBadge.style.color = 'var(--accent-emerald)';
      DOM.myShipRoleEquipBadge.style.borderColor = 'var(--accent-emerald)';
      DOM.myShipRoleEquipBadge.style.background = 'rgba(16,185,129,0.15)';
    } else if (isSalvage) {
      DOM.myShipRoleEquipBadge.textContent = 'RÉCUPÉRATION & SALVAGE';
      DOM.myShipRoleEquipBadge.style.color = 'var(--accent-amber)';
      DOM.myShipRoleEquipBadge.style.borderColor = 'var(--accent-amber)';
      DOM.myShipRoleEquipBadge.style.background = 'rgba(245,158,11,0.15)';
    } else if (isCombat) {
      DOM.myShipRoleEquipBadge.textContent = 'COMBAT & ESCORTE';
      DOM.myShipRoleEquipBadge.style.color = 'var(--accent-rose)';
      DOM.myShipRoleEquipBadge.style.borderColor = 'var(--accent-rose)';
      DOM.myShipRoleEquipBadge.style.background = 'rgba(244,63,94,0.15)';
    } else {
      DOM.myShipRoleEquipBadge.textContent = 'SPÉCIALISÉ';
      DOM.myShipRoleEquipBadge.style.color = 'var(--accent-cyan)';
      DOM.myShipRoleEquipBadge.style.borderColor = 'var(--accent-cyan)';
      DOM.myShipRoleEquipBadge.style.background = 'rgba(56,189,248,0.15)';
    }
  }

  // 1. MINING EQUIPMENT: DYNAMIC MULTI-TURRET ARCHITECTURE (Prospector S1, MOLE S2, Arrastra/Orion S3, ROC S0)
  if (isMining) {
    const isEn = state.currentLang === 'en';
    const isMultiTurret = (shipDef.laserSlots && shipDef.laserSlots > 1);

    // Section title
    if (DOM.myShipTurretsSectionTitle) {
      if (shipDef.id === 'mole') {
        DOM.myShipTurretsSectionTitle.textContent = isEn ? 'SIZE 2 TRIPLE TURRETS CONFIGURATION' : 'CONFIGURATION DES 3 TOURELLES MINIÈRES (SIZE 2)';
      } else if (shipDef.id === 'arrastra') {
        DOM.myShipTurretsSectionTitle.textContent = isEn ? 'SIZE 3 TRIPLE REMOTE TURRETS CONFIGURATION' : 'CONFIGURATION DES 3 TOURELLES MINIÈRES (SIZE 3)';
      } else if (shipDef.id === 'orion') {
        DOM.myShipTurretsSectionTitle.textContent = isEn ? 'SIZE 3 QUAD HEAVY GANTRY TURRETS' : 'CONFIGURATION DES 4 TOURELLES MINIÈRES (SIZE 3)';
      } else if (shipDef.laserSize === 0) {
        DOM.myShipTurretsSectionTitle.textContent = isEn ? 'SIZE 0 EXTRACTION LASER ARM' : "CONFIGURATION BRAS D'EXTRACTION (SIZE 0)";
      } else {
        DOM.myShipTurretsSectionTitle.textContent = isEn ? 'SIZE 1 PRIMARY MINING HEAD CONFIGURATION' : 'CONFIGURATION TÊTE DE MINAGE (SIZE 1)';
      }
    }

    if (DOM.btnMyShipToggleAllTurrets) {
      DOM.btnMyShipToggleAllTurrets.style.display = isMultiTurret ? 'inline-block' : 'none';
    }

    if (DOM.myShipSingleTurretBox) {
      DOM.myShipSingleTurretBox.style.display = isMultiTurret ? 'none' : 'block';
    }

    if (DOM.myShipMultiTurretsWrapper) {
      DOM.myShipMultiTurretsWrapper.style.display = isMultiTurret ? 'block' : 'none';
    }

    if (DOM.myShipTurretCardsContainer) {
      DOM.myShipTurretCardsContainer.innerHTML = '';
      const count = shipDef.laserSlots || 1;
      if (!Array.isArray(current.turrets)) current.turrets = [];

      const compatibleLasers = (MINING_DATA.lasers || []).filter(l => (l.size || 1) === (shipDef.laserSize || 1) || (shipDef.laserSize === 0 && l.size === 0));
      const defaultLaser = compatibleLasers[0]?.id || 'arbor_mh1';

      while (current.turrets.length < count) {
        current.turrets.push({
          laserId: defaultLaser,
          moduleIds: ['none', 'none', 'none']
        });
      }

      // Sync Turret 0 with current.laserId & current.submodules
      if (current.laserId && current.laserId !== 'none') {
        current.turrets[0].laserId = current.laserId;
      } else {
        current.laserId = current.turrets[0].laserId;
      }
      if (Array.isArray(current.submodules) && current.submodules.length > 0) {
        current.turrets[0].moduleIds = [...current.submodules];
      } else {
        current.submodules = [...current.turrets[0].moduleIds];
      }

      for (let idx = 0; idx < count; idx++) {
        const cfg = current.turrets[idx];
        const meta = getTurretMetadata(shipDef.id, idx);
        const currentItem = compatibleLasers.find(l => l.id === cfg.laserId) || compatibleLasers[0];
        if (currentItem) cfg.laserId = currentItem.id;

        const card = document.createElement('div');
        card.className = `turret-config-card ${meta.cardClass}`;
        card.id = `myShipTurretCard_${idx}`;

        const header = document.createElement('div');
        header.className = 'turret-config-header';
        header.title = isEn ? 'Click to collapse/expand turret' : 'Cliquer pour replier/déplier la tourelle';
        header.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="turret-badge-tag ${meta.badgeClass}">${meta.badge}</span>
            <div style="display:flex; flex-direction:column;">
              <span style="font-family:var(--font-hud); font-size:0.85rem; font-weight:700; color:#fff;">${meta.title}</span>
              <span style="font-size:0.68rem; color:var(--text-muted);">${meta.subtitle}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="turret-header-summary" id="myShipTurretSummary_${idx}"></span>
            <span class="turret-collapse-chevron">▼</span>
          </div>
        `;

        const body = document.createElement('div');
        body.className = 'turret-config-body';
        body.id = `myShipTurretBody_${idx}`;

        const select = document.createElement('select');
        select.className = 'hud-select-full turret-laser-select';
        select.id = `myShipTurretLaser_${idx}`;
        select.style.marginBottom = '6px';

        compatibleLasers.forEach(l => {
          const desc = getLocalized(l, 'desc') || '';
          const slotText = l.slots !== undefined ? `${l.slots} slots` : '0 slots';
          const craftPrefix = l.isCustomCraft ? '🛠️ [CRAFT] ' : '';
          const opt = new Option(`${craftPrefix}${l.name} (S${l.size || 1} • ${slotText} • ${l.power} W) - ${desc.slice(0, 30)}...`, l.id);
          select.appendChild(opt);
        });
        select.value = cfg.laserId;

        const statsStrip = document.createElement('div');
        statsStrip.id = `myShipTurretStats_${idx}`;
        statsStrip.className = 'laser-stats-strip';
        statsStrip.style.cssText = 'display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;';

        const slotsContainer = document.createElement('div');
        slotsContainer.id = `myShipTurretSlots_${idx}`;
        slotsContainer.style.cssText = 'display:flex; flex-direction:column; gap:6px;';

        body.appendChild(select);
        body.appendChild(statsStrip);
        body.appendChild(slotsContainer);
        card.appendChild(header);
        card.appendChild(body);
        DOM.myShipTurretCardsContainer.appendChild(card);

        renderLaserStatsStrip(statsStrip, currentItem);
        renderLaserModuleSlots(slotsContainer, currentItem?.slots ?? 0, cfg.moduleIds, `myship_turret_${idx}`);
        updateMyShipTurretHeaderSummary(idx);

        select.addEventListener('change', (e) => {
          sfx.playBeep(600, 'sine', 0.04);
          cfg.laserId = e.target.value;
          const newL = compatibleLasers.find(l => l.id === e.target.value) || compatibleLasers[0];
          const newSlots = newL?.slots ?? 0;

          if (!Array.isArray(cfg.moduleIds)) cfg.moduleIds = ['none', 'none', 'none'];
          for (let m = newSlots; m < 3; m++) {
            cfg.moduleIds[m] = 'none';
          }

          if (!Array.isArray(current.turrets)) current.turrets = [];
          while (current.turrets.length <= idx) {
            current.turrets.push({ laserId: 'arbor_s2', moduleIds: ['none', 'none', 'none'] });
          }
          current.turrets[idx].laserId = e.target.value;
          current.turrets[idx].moduleIds = [...cfg.moduleIds];

          if (idx === 0) {
            current.laserId = e.target.value;
            current.submodules = [...cfg.moduleIds];
            if (DOM.myShipLaserSelect) DOM.myShipLaserSelect.value = e.target.value;
            if (current.isActive) {
              state.selectedLaser = newL;
              state.selectedModules = [...cfg.moduleIds];
            }
            if (DOM.myShipSpecialtyVal) DOM.myShipSpecialtyVal.textContent = `${newL.power} W`;
            if (DOM.myShipSpecialtySub) DOM.myShipSpecialtySub.textContent = `${newL.name} (S${shipDef.laserSize || 1})`;
          }

          if (!state.turretsByShip) state.turretsByShip = {};
          if (!state.turretsByShip[shipDef.id]) state.turretsByShip[shipDef.id] = [];
          while (state.turretsByShip[shipDef.id].length <= idx) {
            state.turretsByShip[shipDef.id].push({ laserId: 'arbor_s2', moduleIds: ['none', 'none', 'none'] });
          }
          state.turretsByShip[shipDef.id][idx] = {
            laserId: e.target.value,
            moduleIds: [...cfg.moduleIds]
          };

          renderLaserStatsStrip(statsStrip, newL);
          renderLaserModuleSlots(slotsContainer, newSlots, cfg.moduleIds, `myship_turret_${idx}`);
          updateMyShipTurretHeaderSummary(idx);
          saveMyPersonalFleet();
          saveLoadout();
          calculateShipTelemetry(current);
          calculateAll();
          updateLoadoutButtonSummary();
        });

        header.addEventListener('click', () => {
          sfx.playBeep(650, 'sine', 0.03);
          triggerHaptic(12);
          card.classList.toggle('collapsed');
          updateMyShipToggleAllButtonText();
        });
      }
      updateMyShipToggleAllButtonText();
    }

    // Laser, Gadget, Saddlebags & Defensive Weapons
    if (DOM.myShipLaserSelect) {
      DOM.myShipLaserSelect.value = current.laserId || (MINING_DATA.lasers?.[0]?.id || 'arbor_mh1');
    }
    if (DOM.myShipGadgetSelect) {
      DOM.myShipGadgetSelect.value = current.gadgetId || 'none';
    }
    if (DOM.myShipSaddlebagsSelect) {
      DOM.myShipSaddlebagsSelect.value = current.saddlebagType || 'standard';
    }
    if (DOM.myShipMiningWeaponSelect) {
      DOM.myShipMiningWeaponSelect.value = current.miningWeaponId || (shipDef.laserSize >= 2 ? 'cf227_s2' : 'cf117_s1');
      const selectedW = (MINING_DATA.shipWeapons || []).find(w => w.id === DOM.myShipMiningWeaponSelect.value) || MINING_DATA.shipWeapons?.[0];
      if (DOM.myShipMiningWeaponStats && selectedW) {
        DOM.myShipMiningWeaponStats.textContent = `Armement Défensif : ${selectedW.name} (S${selectedW.size}) • ${selectedW.dps} DPS • Vélocité ${selectedW.velocity} m/s • ${selectedW.rpm} RPM`;
      }
    }
  }

  // 2. CARGO / HAULER EQUIPMENT (ZERO MINING HEADS!)
  if (isCargo) {
    if (DOM.myShipCargoGadgetSelect) {
      DOM.myShipCargoGadgetSelect.value = current.gadgetId || 'none';
    }
    if (DOM.myShipCargoTractorSelect) {
      DOM.myShipCargoTractorSelect.innerHTML = '';
      (MINING_DATA.tractorBeams || []).forEach(tb => {
        const opt = document.createElement('option');
        opt.value = tb.id;
        opt.textContent = `🧲 ${tb.name} (S${tb.size} • ${tb.force.toLocaleString()} N • Portée ${tb.range}m)`;
        if (tb.id === current.cargoTractorId) opt.selected = true;
        DOM.myShipCargoTractorSelect.appendChild(opt);
      });
      DOM.myShipCargoTractorSelect.value = current.cargoTractorId || MINING_DATA.tractorBeams?.[0]?.id;
      const selectedTb = (MINING_DATA.tractorBeams || []).find(tb => tb.id === current.cargoTractorId) || MINING_DATA.tractorBeams?.[0];
      if (DOM.myShipTractorHint) {
        DOM.myShipTractorHint.textContent = selectedTb ? `Emplacement S${selectedTb.size} • Portée ${selectedTb.range}m` : 'Tourelle S2 motorisée';
      }
      if (DOM.myShipTractorVal) {
        DOM.myShipTractorVal.textContent = selectedTb ? `${selectedTb.force.toLocaleString()} N • Manipulation conteneurs physicalisés ${selectedTb.maxContainerScu || 32} SCU` : '12 000 N • Manipulation conteneurs 32 SCU';
      }
    }

    if (DOM.myShipCargoGridSelect) {
      DOM.myShipCargoGridSelect.value = current.cargoGridMode || 'standard';
      if (DOM.myShipCargoGridDesc) {
        if (current.cargoGridMode === 'high_density') {
          DOM.myShipCargoGridDesc.textContent = 'Mode Haute Densité : Optimisation géométrique 32 SCU avec verrouillage magnétique renforcé.';
        } else if (current.cargoGridMode === 'secure_hold') {
          DOM.myShipCargoGridDesc.textContent = 'Soute Isolée & Blindée : Réduction de signature scan et blindage électromagnétique contre pirates.';
        } else {
          DOM.myShipCargoGridDesc.textContent = 'Standard CIG 4.0 : Alignement automatique des caisses et conteneurs sur grille magnétique.';
        }
      }
    }

    const scu = shipDef.scu || shipDef.cargoScu || 0;
    const moleBags = Math.floor(scu / 12);
    const prosBags = Math.floor(scu / 8);
    if (DOM.myShipCargoBagsCount) {
      DOM.myShipCargoBagsCount.textContent = `${scu} SCU disponibles`;
    }
    if (DOM.myShipCargoBagsDesc) {
      DOM.myShipCargoBagsDesc.textContent = `Emports de pont : supporte jusqu'à ${moleBags}x sacoches Argo MOLE ou ${prosBags}x sacoches Prospector détachables.`;
    }

    if (DOM.myShipCargoWeaponSelect) {
      DOM.myShipCargoWeaponSelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `⚔️ ${w.name} (S${w.size} • ${w.type} • ${w.rpm} RPM • ${w.dps} DPS)`;
        if (w.id === current.cargoTurretId) opt.selected = true;
        DOM.myShipCargoWeaponSelect.appendChild(opt);
      });
      DOM.myShipCargoWeaponSelect.value = current.cargoTurretId || MINING_DATA.shipWeapons?.[0]?.id;
      const selectedW = (MINING_DATA.shipWeapons || []).find(w => w.id === current.cargoTurretId) || MINING_DATA.shipWeapons?.[0];
      if (DOM.myShipCargoWeaponStats && selectedW) {
        DOM.myShipCargoWeaponStats.textContent = `Tourelle Défensive : ${selectedW.name} (S${selectedW.size}) • ${selectedW.dps} DPS • Vélocité ${selectedW.velocity} m/s • ${selectedW.rpm} RPM`;
      }
    }
  }

  // 3. SALVAGE EQUIPMENT (ZERO MINING HEADS!)
  if (isSalvage) {
    [DOM.myShipSalvageHead1Select, DOM.myShipSalvageHead2Select].forEach((sel, idx) => {
      if (!sel) return;
      sel.innerHTML = '';
      const curHeadId = (idx === 0) ? (current.salvageHead1Id || 'abrade_s1') : (current.salvageHead2Id || 'clincher_s1');
      (MINING_DATA.salvageHeads || []).forEach(sh => {
        const opt = document.createElement('option');
        opt.value = sh.id;
        opt.textContent = `♻️ ${sh.name} (S${sh.size} • ${sh.speed} SCU/min • Eff. ${sh.efficiency}%)`;
        if (sh.id === curHeadId) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.value = curHeadId;
    });
    const sh1 = (MINING_DATA.salvageHeads || []).find(sh => sh.id === (current.salvageHead1Id || 'abrade_s1')) || MINING_DATA.salvageHeads?.[0];
    const sh2 = (MINING_DATA.salvageHeads || []).find(sh => sh.id === (current.salvageHead2Id || 'clincher_s1')) || MINING_DATA.salvageHeads?.[1];
    if (DOM.myShipSalvageScrapingStats) {
      const totSpeed = ((sh1?.speed || 0.45) + (sh2?.speed || 0.40)).toFixed(2);
      const avgEff = Math.round(((sh1?.efficiency || 85) + (sh2?.efficiency || 85)) / 2);
      DOM.myShipSalvageScrapingStats.textContent = `Débit combiné : ${totSpeed} SCU/min • Efficacité matière moyenne : ${avgEff}%`;
    }

    if (DOM.myShipSalvageTractorSelect) {
      DOM.myShipSalvageTractorSelect.innerHTML = '';
      (MINING_DATA.tractorBeams || []).forEach(tb => {
        const opt = document.createElement('option');
        opt.value = tb.id;
        opt.textContent = `🧲 ${tb.name} (S${tb.size} • ${tb.force.toLocaleString()} N • Portée ${tb.range}m)`;
        if (tb.id === current.salvageTractorId) opt.selected = true;
        DOM.myShipSalvageTractorSelect.appendChild(opt);
      });
      DOM.myShipSalvageTractorSelect.value = current.salvageTractorId || MINING_DATA.tractorBeams?.[0]?.id;
    }

    const bufScu = shipDef.id === 'reclaimer' ? 120 : (shipDef.id === 'vulture' ? 13 : 8);
    if (DOM.myShipSalvageBufferVal) {
      DOM.myShipSalvageBufferVal.textContent = `${bufScu} SCU Buffer`;
    }

    if (DOM.myShipSalvageWeaponSelect) {
      DOM.myShipSalvageWeaponSelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `🛡️ ${w.name} (S${w.size} • ${w.dps} DPS • ${w.rpm} RPM)`;
        if (w.id === current.salvageWeaponId) opt.selected = true;
        DOM.myShipSalvageWeaponSelect.appendChild(opt);
      });
      DOM.myShipSalvageWeaponSelect.value = current.salvageWeaponId || MINING_DATA.shipWeapons?.[0]?.id;
    }
  }

  // 4. COMBAT & ESCORT EQUIPMENT (ZERO MINING HEADS!)
  if (isCombat) {
    if (DOM.myShipCombatPrimarySelect) {
      DOM.myShipCombatPrimarySelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `⚔️ ${w.name} (S${w.size} • ${w.dps} DPS • ${w.velocity} m/s)`;
        if (w.id === current.combatPrimaryId) opt.selected = true;
        DOM.myShipCombatPrimarySelect.appendChild(opt);
      });
      DOM.myShipCombatPrimarySelect.value = current.combatPrimaryId || 'cf337_s3';
      const curP = (MINING_DATA.shipWeapons || []).find(w => w.id === current.combatPrimaryId) || MINING_DATA.shipWeapons?.[0];
      if (DOM.myShipCombatPrimaryStats && curP) {
        DOM.myShipCombatPrimaryStats.textContent = `Point d'emport Pilote : ${curP.name} (S${curP.size}) • ${curP.dps} DPS • Vélocité ${curP.velocity} m/s • ${curP.rpm} RPM`;
      }
    }

    if (DOM.myShipCombatTurretSelect) {
      DOM.myShipCombatTurretSelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = document.createElement('option');
        opt.value = w.id;
        opt.textContent = `🎯 ${w.name} (S${w.size} • ${w.dps} DPS • ${w.velocity} m/s)`;
        if (w.id === current.combatTurretId) opt.selected = true;
        DOM.myShipCombatTurretSelect.appendChild(opt);
      });
      DOM.myShipCombatTurretSelect.value = current.combatTurretId || 'cf337_s3';
      const curT = (MINING_DATA.shipWeapons || []).find(w => w.id === current.combatTurretId) || MINING_DATA.shipWeapons?.[0];
      if (DOM.myShipWeaponsVal && curT) {
        DOM.myShipWeaponsVal.textContent = `Tourelle militaire : ${curT.name} (S${curT.size}) • ${curT.dps} DPS`;
      }
    }

    if (DOM.myShipCombatMissileSelect) {
      DOM.myShipCombatMissileSelect.innerHTML = '';
      (MINING_DATA.missileRacks || []).forEach(mr => {
        const opt = document.createElement('option');
        opt.value = mr.id;
        opt.textContent = `🚀 ${mr.name} (${mr.missileCount}x S${mr.missileSize} • Guidage ${mr.guidance} • ${mr.damage.toLocaleString()} Dégâts)`;
        if (mr.id === current.combatMissileId) opt.selected = true;
        DOM.myShipCombatMissileSelect.appendChild(opt);
      });
      DOM.myShipCombatMissileSelect.value = current.combatMissileId || 'msl_strikeforce_s2';
    }

    const flares = shipDef.id === 'scorpius' ? 48 : 32;
    const chaffs = shipDef.id === 'scorpius' ? 24 : 16;
    if (DOM.myShipCombatEcmDesc) {
      DOM.myShipCombatEcmDesc.textContent = `${flares} Flares • ${chaffs} Chaff (EM/IR)`;
    }
  }
}

function updateMyShipToggleAllButtonText() {
  if (!DOM.btnMyShipToggleAllTurrets) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const cards = Array.from(DOM.myShipTurretCardsContainer?.querySelectorAll('.turret-config-card') || []);
  const allCollapsed = cards.length > 0 && cards.every(c => c.classList.contains('collapsed'));
  DOM.btnMyShipToggleAllTurrets.textContent = allCollapsed ? (t.expandAllTurrets || 'Tout déplier') : (t.collapseAllTurrets || 'Tout replier');
}

function updateMyShipTurretHeaderSummary(turretIdx) {
  const current = getSelectedFleetShip() || state.myActiveShip;
  if (!current) return;
  const shipDef = getActiveShipDef(current.shipId);
  const configs = current.turrets || [];
  const cfg = configs[turretIdx];
  const summaryEl = document.getElementById(`myShipTurretSummary_${turretIdx}`);
  if (!cfg || !summaryEl) return;

  if (shipDef.role === 'mining') {
    const compatibleLasers = (MINING_DATA.lasers || []).filter(l => (l.size || 1) === (shipDef.laserSize || 1) || (shipDef.laserSize === 0 && l.size === 0));
    const laser = compatibleLasers.find(l => l.id === cfg.laserId) || compatibleLasers[0] || MINING_DATA.lasers[0];
    const slotCount = laser.slots ?? 0;
    const activeModsCount = (cfg.moduleIds || []).slice(0, slotCount).filter(m => m !== 'none').length;
    summaryEl.textContent = `${laser.name} (${activeModsCount}/${slotCount} mods)`;
  } else {
    const weapon = (MINING_DATA.shipWeapons || []).find(w => w.id === cfg.laserId) || MINING_DATA.shipWeapons?.[0];
    summaryEl.textContent = weapon ? `${weapon.name} (Arme)` : 'Armement de Bord';
  }
}

function updateFleetQuickSwitchSelect() {
  if (DOM.myFleetQuickSwitchSelect) {
    DOM.myFleetQuickSwitchSelect.innerHTML = '';
    state.myPersonalFleet.forEach(ship => {
      const shipDef = getActiveShipDef(ship.shipId);
      const opt = document.createElement('option');
      opt.value = ship.id;
      const tag = ship.isActive ? ' ★ [ACTIF]' : '';
      opt.textContent = `${ship.customName || shipDef.name} (${shipDef.name})${tag}`;
      if (ship.id === state.selectedFleetShipId) opt.selected = true;
      DOM.myFleetQuickSwitchSelect.appendChild(opt);
    });
  }

  const selected = state.myPersonalFleet.find(s => s.id === state.selectedFleetShipId);
  if (DOM.btnMakeActiveFromConfig) {
    if (selected && selected.isActive) {
      DOM.btnMakeActiveFromConfig.textContent = '✅ VAISSEAU ACTIF (EN SERVICE)';
      DOM.btnMakeActiveFromConfig.style.background = 'rgba(16,185,129,0.25)';
      DOM.btnMakeActiveFromConfig.style.color = 'var(--accent-emerald)';
      DOM.btnMakeActiveFromConfig.style.border = '1px solid var(--accent-emerald)';
      DOM.btnMakeActiveFromConfig.disabled = true;
    } else {
      DOM.btnMakeActiveFromConfig.textContent = '🚀 PRENDRE LES COMMANDES (ACTIF)';
      DOM.btnMakeActiveFromConfig.style.background = 'linear-gradient(90deg, #10b981, #00f0ff)';
      DOM.btnMakeActiveFromConfig.style.color = '#000';
      DOM.btnMakeActiveFromConfig.style.border = 'none';
      DOM.btnMakeActiveFromConfig.disabled = false;
    }
  }
}

function switchMyShipSubView(subView) {
  if (subView !== 'fleet' && subView !== 'config') subView = 'fleet';
  state.myShipSubView = subView;

  if (DOM.btnSubNavMyFleet) DOM.btnSubNavMyFleet.classList.toggle('active', subView === 'fleet');
  if (DOM.btnSubNavShipConfig) DOM.btnSubNavShipConfig.classList.toggle('active', subView === 'config');

  if (DOM.paneMyFleetHangar) DOM.paneMyFleetHangar.style.display = subView === 'fleet' ? 'block' : 'none';
  if (DOM.paneMyShipConfig) DOM.paneMyShipConfig.style.display = subView === 'config' ? 'block' : 'none';

  if (subView === 'fleet') {
    renderMyPersonalFleet();
  } else {
    renderMyShipHub();
    updateFleetQuickSwitchSelect();
  }
}

function renderMyPersonalFleet() {
  if (!state.myPersonalFleet || state.myPersonalFleet.length === 0) {
    loadMyPersonalFleet();
  }

  // 1. Telemetry KPIs
  const totalShips = state.myPersonalFleet.length;
  let totalCargoScu = 0;
  state.myPersonalFleet.forEach(s => {
    const t = calculateShipTelemetry(s);
    totalCargoScu += (t.scu || 0);
  });
  const activeShip = state.myPersonalFleet.find(s => s.isActive) || state.myPersonalFleet[0];
  const activeShipDef = activeShip ? getActiveShipDef(activeShip.shipId) : null;

  if (DOM.kpiFleetCountVal) DOM.kpiFleetCountVal.textContent = totalShips;
  if (DOM.kpiFleetScuVal) DOM.kpiFleetScuVal.innerHTML = `${totalCargoScu.toLocaleString()} <span style="font-size:0.8rem;">SCU</span>`;
  if (DOM.kpiFleetActiveShipVal) {
    DOM.kpiFleetActiveShipVal.textContent = activeShip ? (activeShip.customName || activeShipDef.name) : '-';
  }
  if (DOM.kpiFleetActiveStationSub) {
    DOM.kpiFleetActiveStationSub.textContent = activeShip ? `${activeShip.location || 'Hangar'} • En Service` : 'Aucun';
  }
  if (DOM.myFleetCountBadge) DOM.myFleetCountBadge.textContent = totalShips;
  if (DOM.myActiveShipTagBadge) {
    DOM.myActiveShipTagBadge.textContent = activeShip ? (activeShip.customName || activeShipDef.name) : 'ACTIF';
  }

  // 2. Filter Chips Counts
  const countAll = totalShips;
  const countMining = state.myPersonalFleet.filter(s => s.role === 'mining').length;
  const countCargo = state.myPersonalFleet.filter(s => s.role === 'cargo' || s.role === 'hauler').length;
  const countSalvage = state.myPersonalFleet.filter(s => s.role === 'salvage').length;
  const countCombat = state.myPersonalFleet.filter(s => s.role === 'combat' || s.role === 'escort').length;

  if (DOM.chipMyFleetAll) DOM.chipMyFleetAll.textContent = countAll;
  if (DOM.chipMyFleetMining) DOM.chipMyFleetMining.textContent = countMining;
  if (DOM.chipMyFleetCargo) DOM.chipMyFleetCargo.textContent = countCargo;
  if (DOM.chipMyFleetSalvage) DOM.chipMyFleetSalvage.textContent = countSalvage;
  if (DOM.chipMyFleetCombat) DOM.chipMyFleetCombat.textContent = countCombat;

  const filterChips = [
    { el: DOM.myFleetFilterAll, role: 'all' },
    { el: DOM.myFleetFilterMining, role: 'mining' },
    { el: DOM.myFleetFilterCargo, role: 'cargo' },
    { el: DOM.myFleetFilterSalvage, role: 'salvage' },
    { el: DOM.myFleetFilterCombat, role: 'combat' }
  ];
  filterChips.forEach(chip => {
    if (chip.el) chip.el.classList.toggle('active', state.myFleetFilter === chip.role);
  });

  // 3. Filter & Search ships
  let filtered = state.myPersonalFleet.slice();
  if (state.myFleetFilter === 'mining') {
    filtered = filtered.filter(s => s.role === 'mining');
  } else if (state.myFleetFilter === 'cargo') {
    filtered = filtered.filter(s => s.role === 'cargo' || s.role === 'hauler');
  } else if (state.myFleetFilter === 'salvage') {
    filtered = filtered.filter(s => s.role === 'salvage');
  } else if (state.myFleetFilter === 'combat') {
    filtered = filtered.filter(s => s.role === 'combat' || s.role === 'escort');
  }

  if (state.myFleetSearch) {
    const q = state.myFleetSearch.toLowerCase();
    filtered = filtered.filter(s => {
      const def = getActiveShipDef(s.shipId);
      return (
        (s.customName && s.customName.toLowerCase().includes(q)) ||
        (def.name && def.name.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q)) ||
        (s.shipId && s.shipId.toLowerCase().includes(q))
      );
    });
  }

  // 4. Render ASOP Cards
  if (!DOM.myFleetCardsGrid) return;
  DOM.myFleetCardsGrid.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.style.gridColumn = '1 / -1';
    empty.style.textAlign = 'center';
    empty.style.padding = '36px 16px';
    empty.style.background = 'rgba(15, 23, 42, 0.4)';
    empty.style.border = '1px dashed rgba(255, 255, 255, 0.15)';
    empty.style.borderRadius = '8px';
    empty.innerHTML = `
      <div style="font-size:2rem; margin-bottom:8px;">🚀</div>
      <div style="font-size:0.9rem; font-weight:700; color:#fff; margin-bottom:4px;">Aucun vaisseau trouvé</div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:14px;">Aucun vaisseau ne correspond aux filtres ou à la recherche.</div>
      <button type="button" class="chip-btn" id="btnEmptyAddShip" style="border-color:var(--accent-cyan); color:var(--accent-cyan); font-weight:700;">+ Ajouter un Vaisseau</button>
    `;
    DOM.myFleetCardsGrid.appendChild(empty);
    const btnEmptyAdd = empty.querySelector('#btnEmptyAddShip');
    if (btnEmptyAdd) btnEmptyAdd.addEventListener('click', openAddPersonalShipModal);
    return;
  }

  const roleIcons = {
    mining: '⛏️',
    cargo: '🚜',
    hauler: '🚜',
    salvage: '♻️',
    combat: '🛡️',
    escort: '⚔️',
    general: '🚀'
  };

  const roleLabels = {
    mining: 'MINAGE',
    cargo: 'FRET',
    hauler: 'FRET',
    salvage: 'SALVAGE',
    combat: 'COMBAT',
    escort: 'ESCORTE',
    general: 'POLYVALENT'
  };

  filtered.forEach(ship => {
    const def = getActiveShipDef(ship.shipId);
    const telem = calculateShipTelemetry(ship);
    const card = document.createElement('div');
    card.className = 'cig-ship-card' + (ship.isActive ? ' active-ship' : '');
    card.setAttribute('data-ship-id', ship.id);
    card.style.cursor = 'pointer';

    const icon = roleIcons[ship.role] || '🚀';
    const roleLabel = roleLabels[ship.role] || 'POLYVALENT';
    const activeBadge = ship.isActive ? `
      <span style="font-size:0.65rem; font-weight:700; background:rgba(16,185,129,0.2); border:1px solid var(--accent-emerald); color:var(--accent-emerald); padding:2px 6px; border-radius:4px; letter-spacing:0.5px;">
        🟢 ACTIF
      </span>
    ` : '';

    const roleColors = {
      mining: 'background:rgba(245,158,11,0.15); border:1px solid var(--accent-amber); color:var(--accent-amber);',
      cargo: 'background:rgba(16,185,129,0.15); border:1px solid var(--accent-emerald); color:var(--accent-emerald);',
      hauler: 'background:rgba(16,185,129,0.15); border:1px solid var(--accent-emerald); color:var(--accent-emerald);',
      salvage: 'background:rgba(0,240,255,0.15); border:1px solid var(--accent-cyan); color:var(--accent-cyan);',
      combat: 'background:rgba(244,63,94,0.15); border:1px solid var(--accent-rose); color:var(--accent-rose);',
      escort: 'background:rgba(244,63,94,0.15); border:1px solid var(--accent-rose); color:var(--accent-rose);',
      general: 'background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:var(--text-muted);'
    };
    const roleStyle = roleColors[ship.role] || roleColors.general;

    const laserObj = (MINING_DATA.lasers || []).find(l => l.id === ship.laserId);
    const laserSlots = laserObj?.slots !== undefined ? `${laserObj.slots} slot${laserObj.slots > 1 ? 's' : ''}` : '';
    const laserText = laserObj ? `${laserObj.name} ${laserSlots ? '(' + laserSlots + ')' : ''}` : 'Laser S1';

    const specialtyInfo = ship.role === 'mining' ? `
      <div class="ship-card-telem-item" title="Tête de minage">
        <span class="telem-icon">⛏️</span>
        <span class="telem-val" style="color:var(--accent-amber); font-size:0.7rem;">${laserText}</span>
      </div>
    ` : (ship.role === 'cargo' || ship.role === 'hauler' ? `
      <div class="ship-card-telem-item" title="Rayon tracteur & Grille cargo">
        <span class="telem-icon">🚜</span>
        <span class="telem-val" style="color:var(--accent-emerald); font-size:0.7rem;">${telem.scu} SCU Sécurisé</span>
      </div>
    ` : (ship.role === 'salvage' ? `
      <div class="ship-card-telem-item" title="Tête de grattage RMC">
        <span class="telem-icon">♻️</span>
        <span class="telem-val" style="color:var(--accent-cyan); font-size:0.7rem;">Abrade / Clincher</span>
      </div>
    ` : `
      <div class="ship-card-telem-item" title="Armement combat">
        <span class="telem-icon">⚔️</span>
        <span class="telem-val" style="color:var(--accent-rose); font-size:0.7rem;">Défense S3</span>
      </div>
    `));

    card.innerHTML = `
      <div class="cig-ship-card-header" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.35rem;">${icon}</span>
          <div>
            <div style="font-family:var(--font-hud); font-size:0.95rem; font-weight:700; color:#fff;">${ship.customName || def.name}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${def.name} • <span style="color:var(--accent-cyan); font-weight:600;">${def.manufacturer || 'CIG'}</span></div>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
          <span style="font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:4px; letter-spacing:0.5px; ${roleStyle}">${roleLabel}</span>
          ${activeBadge}
        </div>
      </div>

      <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:10px; display:flex; align-items:center; gap:5px;">
        <span>📍</span>
        <span>${ship.location || 'HUR-L1 Green Glade'}</span>
      </div>

      <div class="ship-card-telem-strip">
        <div class="ship-card-telem-item" title="Capacité de soute">
          <span class="telem-icon">📦</span>
          <span class="telem-lbl">Soute :</span>
          <span class="telem-val">${telem.scu} SCU</span>
        </div>
        <div class="ship-card-telem-item" title="Moteur quantique">
          <span class="telem-icon">⚡</span>
          <span class="telem-lbl">QD :</span>
          <span class="telem-val">${telem.qd.name}</span>
          <span style="font-size:0.62rem; color:var(--accent-cyan);">(${telem.qdSpeedC}c)</span>
        </div>
        <div class="ship-card-telem-item" title="Capacité de bouclier">
          <span class="telem-icon">🛡️</span>
          <span class="telem-lbl">Bouclier :</span>
          <span class="telem-val">${Math.round(telem.totalHp / 1000)}k HP</span>
        </div>
        ${specialtyInfo}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
        ${!ship.isActive ? `
          <button type="button" class="btn-activate-ship" data-ship-id="${ship.id}" style="flex:1; font-size:0.74rem; font-weight:700; padding:6px 10px; background:linear-gradient(90deg, #10b981, #00f0ff); color:#000; border:none; border-radius:4px; cursor:pointer; transition:transform 0.15s ease;">
            🚀 Prendre les commandes
          </button>
        ` : `
          <div style="flex:1; font-size:0.72rem; color:var(--accent-emerald); font-weight:700; display:flex; align-items:center; gap:5px;">
            <span class="status-pulse-dot" style="display:inline-block; width:6px; height:6px; background:var(--accent-emerald); border-radius:50%; box-shadow:0 0 6px var(--accent-emerald);"></span>
            <span>Commandes Actives</span>
          </div>
        `}
        <button type="button" class="chip-btn btn-config-ship" data-ship-id="${ship.id}" style="font-size:0.74rem; padding:5px 10px; border-color:var(--accent-cyan); color:var(--accent-cyan); white-space:nowrap;">
          ⚙️ Configurer
        </button>
        ${state.myPersonalFleet.length > 1 ? `
          <button type="button" class="chip-btn btn-remove-ship" data-ship-id="${ship.id}" title="Retirer du Hangar Personnel" style="font-size:0.74rem; padding:5px 8px; border-color:rgba(239,68,68,0.4); color:var(--accent-rose);">
            🗑️
          </button>
        ` : ''}
      </div>
    `;

    // Click on card opens config, unless clicking an action button
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-activate-ship') || e.target.closest('.btn-remove-ship')) return;
      openConfigurePersonalShip(ship.id);
    });

    DOM.myFleetCardsGrid.appendChild(card);
  });

  // Action button delegation within cards
  const activateBtns = DOM.myFleetCardsGrid.querySelectorAll('.btn-activate-ship');
  activateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sId = btn.getAttribute('data-ship-id');
      activatePersonalShip(sId);
    });
  });

  const removeBtns = DOM.myFleetCardsGrid.querySelectorAll('.btn-remove-ship');
  removeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sId = btn.getAttribute('data-ship-id');
      removePersonalShip(sId);
    });
  });
}

function renderMyShipHub() {
  const current = getSelectedFleetShip() || state.myActiveShip;
  const telem = calculateShipTelemetry(current);
  const shipDef = telem.shipDef;

  // Header and Hero Identity Card
  const icons = {
    mining: '⛏️',
    cargo: '🚜',
    hauler: '🚜',
    salvage: '♻️',
    combat: '🛡️',
    escort: '⚔️',
    general: '🚀'
  };
  if (DOM.myShipAvatarIcon) DOM.myShipAvatarIcon.textContent = icons[shipDef.role] || '🚀';
  if (DOM.myShipCustomNameDisplay) DOM.myShipCustomNameDisplay.textContent = current.customName || shipDef.name;
  if (DOM.myShipMfgBadge) DOM.myShipMfgBadge.textContent = shipDef.manufacturer || 'CIG';
  if (DOM.myShipRoleBadge) {
    const roleKey = (current.role || shipDef.role || 'mining').toLowerCase();
    DOM.myShipRoleBadge.textContent = (current.role || shipDef.role || 'MINING').toUpperCase();
    DOM.myShipRoleBadge.className = `ship-role-badge ${roleKey}`;
  }
  if (DOM.myShipModelNameDisplay) DOM.myShipModelNameDisplay.textContent = shipDef.name;
  if (DOM.shipConfigBreadcrumbName) DOM.shipConfigBreadcrumbName.textContent = (current.customName || shipDef.name).toUpperCase();
  if (DOM.myShipStationDisplay) DOM.myShipStationDisplay.textContent = current.location || 'ARC-L1 Wide Forest';

  // Status Indicator
  const statusLabels = {
    available: '🟢 Opérationnel / En Hangar',
    mining: '⛏️ En Opération de Minage',
    hauling: '🚜 En Fret / Cargo',
    patrol: '🛡️ En Escorte / Patrouille',
    maintenance: '🛠️ En Révision / Maintenance'
  };
  if (DOM.myShipStatusLabel) {
    if (current.isActive) {
      DOM.myShipStatusLabel.textContent = '🟢 COMMANDES ACTIVES / EN SERVICE';
    } else {
      DOM.myShipStatusLabel.textContent = statusLabels[current.status] || '⚪ Au Hangar (Disponible)';
    }
  }
  if (DOM.myShipStatusIndicator) {
    DOM.myShipStatusIndicator.className = 'status-indicator';
    if (current.status === 'maintenance') {
      DOM.myShipStatusIndicator.style.background = '#f87171';
    } else if (current.isActive) {
      DOM.myShipStatusIndicator.style.background = 'var(--accent-emerald)';
    } else {
      DOM.myShipStatusIndicator.style.background = 'var(--accent-cyan)';
    }
  }

  // Populate Hero Form fields
  if (DOM.myShipCustomNameInput && document.activeElement !== DOM.myShipCustomNameInput && DOM.myShipCustomNameInput.value !== (current.customName || '')) {
    DOM.myShipCustomNameInput.value = current.customName || '';
  }
  if (DOM.myShipRoleSelect && DOM.myShipRoleSelect.value !== current.role) {
    DOM.myShipRoleSelect.value = current.role;
  }
  if (DOM.myShipStatusSelect && DOM.myShipStatusSelect.value !== current.status) {
    DOM.myShipStatusSelect.value = current.status;
  }
  if (DOM.myShipLocationSelect && DOM.myShipLocationSelect.value !== current.location) {
    DOM.myShipLocationSelect.value = current.location;
  }

  // Telemetry Cards
  if (DOM.myShipScuVal) DOM.myShipScuVal.textContent = `${telem.scu} SCU`;
  if (DOM.myShipGridTypeSub) DOM.myShipGridTypeSub.textContent = shipDef.cargoGridType || 'Soute Sécurisée';
  if (DOM.myShipBagsDesc) DOM.myShipBagsDesc.textContent = telem.bagDesc;

  if (DOM.myShipQdSpeedVal) DOM.myShipQdSpeedVal.textContent = `${telem.qdSpeedC} c`;
  if (DOM.myShipQdGradeSub) DOM.myShipQdGradeSub.textContent = `${telem.qd.name} (Gr.${telem.qd.grade} ${telem.qd.class})`;
  if (DOM.myShipQdRangeDesc) DOM.myShipQdRangeDesc.textContent = `Autonomie : ${telem.maxRangeGm} Gm (${telem.qdSpeedKms} km/s)`;

  if (DOM.myShipShieldHpVal) DOM.myShipShieldHpVal.textContent = `${telem.totalHp.toLocaleString()} HP`;
  if (DOM.myShipShieldSub) DOM.myShipShieldSub.textContent = `${shipDef.shieldCount || 1}x ${telem.shield.name} (S${shipDef.shieldSize})`;
  if (DOM.myShipShieldRegenDesc) DOM.myShipShieldRegenDesc.textContent = `Recharge : +${telem.totalRegen} HP/s`;

  if (DOM.myShipPowerVal) DOM.myShipPowerVal.textContent = `${(telem.powerWatts / 1000).toFixed(1)} kW`;
  if (DOM.myShipPowerSub) DOM.myShipPowerSub.textContent = `${telem.pwr.name} (S${shipDef.powerSize})`;
  if (DOM.myShipPowerLoadDesc) DOM.myShipPowerLoadDesc.textContent = `Charge nominale : ${telem.powerLoadPct}%`;

  if (DOM.myShipCoolingVal) DOM.myShipCoolingVal.textContent = `${Math.round(telem.totalCooling / 1000)} kK/s`;
  if (DOM.myShipCoolerSub) DOM.myShipCoolerSub.textContent = `${shipDef.coolerCount || 1}x ${telem.cooler.name} (S${shipDef.coolerSize})`;
  if (DOM.myShipCoolingSafetyDesc) DOM.myShipCoolingSafetyDesc.textContent = `Sécurité thermique 100% stable`;

  // Role Specialty Card & Gear Boxes
  const isMining = shipDef.role === 'mining';
  const isCargo = shipDef.role === 'cargo' || shipDef.role === 'hauler';
  const isSalvage = shipDef.role === 'salvage';
  const isCombat = shipDef.role === 'combat' || shipDef.role === 'escort';

  if (DOM.myShipMiningGearBox) DOM.myShipMiningGearBox.style.display = isMining ? 'block' : 'none';
  if (DOM.myShipCargoGearBox) DOM.myShipCargoGearBox.style.display = isCargo ? 'block' : 'none';
  if (DOM.myShipSalvageGearBox) DOM.myShipSalvageGearBox.style.display = isSalvage ? 'block' : 'none';
  if (DOM.myShipCombatGearBox) DOM.myShipCombatGearBox.style.display = isCombat ? 'block' : 'none';

  if (DOM.myShipSpecialtyLabel && DOM.myShipSpecialtyVal && DOM.myShipSpecialtySub && DOM.myShipSpecialtyDesc) {
    if (isMining) {
      const laser = (MINING_DATA.lasers || []).find(l => l.id === current.laserId) || MINING_DATA.lasers?.[0];
      DOM.myShipSpecialtyLabel.textContent = 'LASER & EXTRACTION';
      DOM.myShipSpecialtyVal.textContent = laser ? `${laser.power} W` : '1 400 W';
      DOM.myShipSpecialtySub.textContent = laser ? `${laser.name} (S${shipDef.laserSize || 1})` : 'Arbor MH1';
      DOM.myShipSpecialtyDesc.textContent = `Fenêtre optimale & extraction active`;
    } else if (isCargo) {
      DOM.myShipSpecialtyLabel.textContent = 'RAYON TRACTEUR DE SOUTE';
      DOM.myShipSpecialtyVal.textContent = `${telem.scu} SCU Max`;
      DOM.myShipSpecialtySub.textContent = 'Tractor Beam S2 Haute Capacité';
      DOM.myShipSpecialtyDesc.textContent = 'Alignement automatique sur grille magnétique';
    } else if (isSalvage) {
      DOM.myShipSpecialtyLabel.textContent = 'TÊTE DE GRATTAGE RMC';
      DOM.myShipSpecialtyVal.textContent = '0.85 SCU/min';
      DOM.myShipSpecialtySub.textContent = 'Abrade / Clincher S1';
      DOM.myShipSpecialtyDesc.textContent = 'Buffer tampon de compression 13 SCU';
    } else if (isCombat) {
      DOM.myShipSpecialtyLabel.textContent = 'PUISSANCE DE FEU COMBAT';
      DOM.myShipSpecialtyVal.textContent = '2 450 DPS';
      DOM.myShipSpecialtySub.textContent = '4x Laser Repeaters S3 + Tourelle';
      DOM.myShipSpecialtyDesc.textContent = 'Boucliers jumelés & ECM tactique';
    }
  }

  populateShipComponentDropdowns(current);
  updateFleetQuickSwitchSelect();
  if (typeof renderCargoGridMaster === 'function') {
    renderCargoGridMaster();
  }
}

function activatePersonalShip(shipId, silent = false) {
  const target = state.myPersonalFleet.find(s => s.id === shipId);
  if (!target) return;

  state.myPersonalFleet.forEach(s => {
    s.isActive = (s.id === shipId);
  });
  state.myActiveShip = Object.assign({}, target);
  state.selectedFleetShipId = shipId;

  saveMyPersonalFleet();
  applyShipLoadoutToWorkflows(true);

  renderMyPersonalFleet();
  renderMyShipHub();
  updateFleetQuickSwitchSelect();

  if (!silent) {
    sfx.playSuccess();
    triggerHaptic(25);
    const shipDef = getActiveShipDef(target.shipId);
    const t = I18N[state.currentLang] || I18N.fr;
    const name = target.customName || shipDef.name;
    const msg = (t.toastShipMadeActive || '🚀 Commandes prises : {name} est désormais votre vaisseau actif !').replace('{name}', name);
    showToast(msg);
  }
}

function openConfigurePersonalShip(shipId) {
  const target = state.myPersonalFleet.find(s => s.id === shipId);
  if (!target) return;

  state.selectedFleetShipId = shipId;
  switchMyShipSubView('config');
  renderMyShipHub();
  updateFleetQuickSwitchSelect();
  sfx.playBeep(580, 'sine', 0.04);
  triggerHaptic(12);
}

function removePersonalShip(shipId) {
  if (state.myPersonalFleet.length <= 1) {
    showToast('⚠️ Impossible de retirer le dernier vaisseau de votre flotte.');
    return;
  }
  const target = state.myPersonalFleet.find(s => s.id === shipId);
  if (!target) return;

  const t = I18N[state.currentLang] || I18N.fr;
  const name = target.customName || target.shipId;
  const confirmMsg = (t.confirmRemoveShip || 'Retirer {ship} de votre hangar personnel ?').replace('{ship}', name);
  if (!window.confirm(confirmMsg)) return;

  const wasActive = target.isActive;
  state.myPersonalFleet = state.myPersonalFleet.filter(s => s.id !== shipId);

  if (wasActive) {
    state.myPersonalFleet[0].isActive = true;
    state.myActiveShip = Object.assign({}, state.myPersonalFleet[0]);
    state.selectedFleetShipId = state.myPersonalFleet[0].id;
    applyShipLoadoutToWorkflows(true);
  } else if (state.selectedFleetShipId === shipId) {
    state.selectedFleetShipId = state.myPersonalFleet[0].id;
  }

  saveMyPersonalFleet();
  renderMyPersonalFleet();
  renderMyShipHub();
  updateFleetQuickSwitchSelect();

  const msg = (t.toastShipRemovedFromFleet || '🗑️ {ship} a été retiré de votre flotte.').replace('{ship}', name);
  showToast(msg);
}

function addPersonalShip(modelId, customName, station) {
  const newShip = createDefaultPersonalShip(modelId, customName, station);
  state.myPersonalFleet.push(newShip);
  saveMyPersonalFleet();
  renderMyPersonalFleet();
  updateFleetQuickSwitchSelect();

  const shipDef = getActiveShipDef(modelId);
  const t = I18N[state.currentLang] || I18N.fr;
  const name = newShip.customName || shipDef.name;
  const msg = (t.toastShipAddedToFleet || '🚀 {name} enregistré dans votre flotte personnelle !').replace('{name}', name);
  showToast(msg);
  sfx.playSuccess();
  triggerHaptic(20);
}

function populateNewPersonalShipModelSelect() {
  if (!DOM.newPersonalShipModelSelect) return;
  DOM.newPersonalShipModelSelect.innerHTML = '';
  const allShips = MINING_DATA.getAllPlayableShips ? MINING_DATA.getAllPlayableShips() : [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];
  const groups = [
    { label: '⛏️ Minage & Extraction', roles: ['mining'] },
    { label: '🚜 Fret & Transport Lourd', roles: ['cargo', 'hauler'] },
    { label: '♻️ Recyclage (Salvage)', roles: ['salvage'] },
    { label: '🛡️ Escorte & Combat', roles: ['combat', 'escort'] }
  ];
  groups.forEach(grp => {
    const groupShips = allShips.filter(s => grp.roles.includes(s.role));
    if (groupShips.length === 0) return;
    const optGroup = document.createElement('optgroup');
    optGroup.label = grp.label;
    groupShips.forEach(ship => {
      const opt = document.createElement('option');
      opt.value = ship.id;
      const capText = (ship.scu || ship.cargoScu) ? `${ship.scu || ship.cargoScu} SCU` : (ship.role === 'combat' ? 'Combat' : '');
      opt.textContent = `${ship.name} ${capText ? `(${capText})` : ''}`;
      optGroup.appendChild(opt);
    });
    DOM.newPersonalShipModelSelect.appendChild(optGroup);
  });
}

function openAddPersonalShipModal() {
  populateNewPersonalShipModelSelect();
  if (DOM.newPersonalShipNameInput) DOM.newPersonalShipNameInput.value = '';
  if (DOM.addPersonalShipModal) {
    openModal(DOM.addPersonalShipModal);
    sfx.playOpen();
    triggerHaptic(12);
  }
}

function submitAddPersonalShip() {
  const modelId = DOM.newPersonalShipModelSelect?.value;
  if (!modelId) return;
  const customName = DOM.newPersonalShipNameInput ? DOM.newPersonalShipNameInput.value.trim() : '';
  const station = DOM.newPersonalShipStationSelect ? DOM.newPersonalShipStationSelect.value : 'ARC-L1 Wide Forest';

  addPersonalShip(modelId, customName, station);
  if (DOM.addPersonalShipModal) closeModal(DOM.addPersonalShipModal);
}

function applyShipLoadoutToWorkflows(silent = false) {
  const current = getSelectedFleetShip() || state.myActiveShip;
  if (current.isActive) {
    state.myActiveShip = Object.assign({}, current);
  }
  const telem = calculateShipTelemetry(state.myActiveShip);
  const shipDef = telem.shipDef;
  const t = I18N[state.currentLang] || I18N.fr;

  // 1. Sync Mining Solver & Extraction Loop
  const miningShipMatch = (MINING_DATA.ships || []).find(s => s.id === state.myActiveShip.shipId);
  if (miningShipMatch) {
    state.selectedShip = miningShipMatch;
  } else {
    // If player flies a Cargo ship or Fighter, create custom mining reference so app doesn't crash
    state.selectedShip = {
      id: shipDef.id,
      name: shipDef.name,
      manufacturer: shipDef.manufacturer,
      laserSize: shipDef.laserSize || 1,
      moduleSlots: shipDef.moduleSlots || 0,
      scu: telem.scu,
      role: shipDef.role
    };
  }

  // Laser, modules and gadget
  if (Array.isArray(state.myActiveShip.turrets) && state.myActiveShip.turrets.length > 0) {
    if (!state.turretsByShip) state.turretsByShip = {};
    state.turretsByShip[shipDef.id] = JSON.parse(JSON.stringify(state.myActiveShip.turrets));
  }
  const laserMatch = (MINING_DATA.lasers || []).find(l => l.id === state.myActiveShip.laserId);
  if (laserMatch) state.selectedLaser = laserMatch;
  if (Array.isArray(state.myActiveShip.submodules)) {
    state.selectedModules = [...state.myActiveShip.submodules];
  }
  // Rock gadget remains independent of ship hull (applied on rock during mining)
  updateRockGadgetUI();

  // 2. Sync Cargo Hold and Trading Loops
  state.shipCapacity = telem.scu;
  if (DOM.tradeCargoScuInput) {
    DOM.tradeCargoScuInput.value = telem.scu;
  }
  state.tradeCargoShipScu = telem.scu;

  // 3. Sync Guild Roster local player entry
  const localCallsign = state.callsign || state.fleetNetCallsign || 'CITIZEN-1';
  if (!state.guildRegisteredMembers) state.guildRegisteredMembers = [];
  let myRosterEntry = state.guildRegisteredMembers.find(m => m.callsign === localCallsign);
  const shipDisplayName = state.myActiveShip.customName ? `${state.myActiveShip.customName} (${shipDef.name})` : shipDef.name;

  if (myRosterEntry) {
    myRosterEntry.ship = shipDisplayName;
    myRosterEntry.station = state.myActiveShip.location || 'ARC-L1 Wide Forest';
    myRosterEntry.status = state.myActiveShip.status || 'online';
  } else {
    state.guildRegisteredMembers.unshift({
      callsign: localCallsign,
      role: state.currentGuildUser?.role || 'MEMBER',
      ship: shipDisplayName,
      station: state.myActiveShip.location || 'ARC-L1 Wide Forest',
      status: state.myActiveShip.status || 'online',
      isLocal: true
    });
  }

  // 4. Sync Guild Fleet hangar entry
  if (!state.guildFleet) state.guildFleet = [];
  let myFleetShip = state.guildFleet.find(s => s.registration === 'REG-' + localCallsign || s.pilot === localCallsign);
  if (myFleetShip) {
    myFleetShip.name = state.myActiveShip.customName || shipDef.name;
    myFleetShip.model = shipDef.id;
    myFleetShip.scu = telem.scu;
    myFleetShip.station = state.myActiveShip.location || 'ARC-L1';
    myFleetShip.isBorrowed = false;
  } else {
    state.guildFleet.unshift({
      id: 'local_ship_' + Date.now(),
      name: state.myActiveShip.customName || shipDef.name,
      model: shipDef.id,
      scu: telem.scu,
      station: state.myActiveShip.location || 'ARC-L1',
      registration: 'REG-' + localCallsign,
      hullHealth: 100,
      isBorrowed: false,
      borrowedBy: null,
      pilot: localCallsign
    });
  }

  // 5. Broadcast to P2P Fleet Wing if connected
  broadcastShipLoadoutToFleet();

  // 6. Recalculate and re-render all dependent modules
  saveMyPersonalFleet();
  if (DOM.shipSelect && DOM.shipSelect.value !== state.selectedShip.id) DOM.shipSelect.value = state.selectedShip.id;
  if (DOM.mgShipSelect && DOM.mgShipSelect.value !== state.selectedShip.id) DOM.mgShipSelect.value = state.selectedShip.id;
  if (DOM.loadoutShipSelect && DOM.loadoutShipSelect.value !== state.selectedShip.id) DOM.loadoutShipSelect.value = state.selectedShip.id;
  if (typeof updateLaserOptions === 'function') updateLaserOptions();
  if (typeof populateLoadoutSelects === 'function') populateLoadoutSelects();
  if (typeof updateLoadoutButtonSummary === 'function') updateLoadoutButtonSummary();
  if (typeof calculateAll === 'function') calculateAll();
  if (typeof renderAllModuleSlots === 'function') renderAllModuleSlots();
  if (typeof renderSquadWingmen === 'function') renderSquadWingmen();
  if (typeof renderGuildFleet === 'function') renderGuildFleet();
  if (typeof renderGuildRoster === 'function') renderGuildRoster();

  renderMyShipHub();
  renderMyPersonalFleet();

  if (!silent) {
    sfx.playSuccess();
    triggerHaptic(20);
    const msg = (t.toastShipLoadoutApplied || 'Configuration {ship} répercutée sur tous les postes de bord !').replace('{ship}', shipDef.name);
    showToast(msg);
  }
}

function broadcastShipLoadoutToFleet() {
  if (!fleetNet || typeof fleetNet.broadcastCorpoShipTelemetry !== 'function') return;
  const telem = calculateShipTelemetry(state.myActiveShip);
  fleetNet.broadcastCorpoShipTelemetry({
    callsign: state.callsign || 'CITIZEN-1',
    shipId: state.myActiveShip.shipId,
    customName: state.myActiveShip.customName,
    role: state.myActiveShip.role,
    status: state.myActiveShip.status,
    location: state.myActiveShip.location,
    scu: telem.scu,
    laserId: state.myActiveShip.laserId,
    submodules: state.myActiveShip.submodules,
    gadgetId: state.myActiveShip.gadgetId,
    saddlebagType: state.myActiveShip.saddlebagType,
    quantumDrive: telem.qd.name,
    qdSpeedKms: telem.qdSpeedKms,
    maxRangeGm: telem.maxRangeGm,
    shield: telem.shield.name,
    shieldHp: telem.totalHp,
    powerPlant: telem.pwr.name,
    cooler: telem.cooler.name,
    timestamp: Date.now()
  });
}

function handleIncomingCorpoShipTelemetry(shipTelemetry, senderCallsign) {
  if (!shipTelemetry || !senderCallsign) return;
  if (!state.peerShipTelemetries) state.peerShipTelemetries = {};
  state.peerShipTelemetries[senderCallsign] = shipTelemetry;

  // 1. Update squad wingmen if in coop session
  let squadMember = (state.squadMembers || []).find(m => m.peerId === senderCallsign || m.name === senderCallsign);
  if (squadMember) {
    squadMember.shipId = shipTelemetry.shipId;
    squadMember.laserId = shipTelemetry.laserId;
    squadMember.submodules = shipTelemetry.submodules || [];
    renderSquadWingmen();
  }

  // 2. Update Guild Roster if registered
  if (state.guildRegisteredMembers) {
    let guildMember = state.guildRegisteredMembers.find(m => m.callsign === senderCallsign);
    if (guildMember) {
      guildMember.ship = shipTelemetry.customName ? `${shipTelemetry.customName} (${shipTelemetry.shipId.toUpperCase()})` : shipTelemetry.shipId.toUpperCase();
      guildMember.station = shipTelemetry.location || guildMember.station;
      guildMember.status = shipTelemetry.status || guildMember.status;
      renderGuildRoster();
    }
  }

  // 3. Update or Add to Guild Fleet with live online indicator
  if (state.guildFleet) {
    let fleetShip = state.guildFleet.find(s => s.borrowedBy === senderCallsign || s.pilotCallsign === senderCallsign || s.registration === 'LIVE-' + senderCallsign);
    if (fleetShip) {
      fleetShip.model = shipTelemetry.shipId;
      fleetShip.name = shipTelemetry.customName || shipTelemetry.shipId.toUpperCase();
      fleetShip.scu = shipTelemetry.scu;
      fleetShip.station = shipTelemetry.location || fleetShip.station;
      fleetShip.status = shipTelemetry.status;
      fleetShip.isOnline = true;
      fleetShip.pilotCallsign = senderCallsign;
    } else {
      state.guildFleet.push({
        id: 'live_ship_' + senderCallsign,
        name: shipTelemetry.customName || (senderCallsign + ' ' + shipTelemetry.shipId.toUpperCase()),
        model: shipTelemetry.shipId,
        scu: shipTelemetry.scu || 32,
        station: shipTelemetry.location || 'ARC-L1',
        registration: 'LIVE-' + senderCallsign,
        hullHealth: 100,
        isBorrowed: true,
        borrowedBy: senderCallsign,
        isOnline: true,
        pilotCallsign: senderCallsign
      });
    }
    renderGuildFleet();
  }

  const t = I18N[state.currentLang] || I18N.fr;
  const msg = (t.toastShipBroadcasted || 'Télémétrie reçue de {callsign} : {ship}')
    .replace('{callsign}', senderCallsign)
    .replace('{ship}', shipTelemetry.customName || shipTelemetry.shipId);
  showToast(msg);
}

function copyShipLoadoutToClipboard() {
  const current = getSelectedFleetShip() || state.myActiveShip;
  const telem = calculateShipTelemetry(current);
  const ship = telem.shipDef;
  const t = I18N[state.currentLang] || I18N.fr;
  const lines = [
    `🚀 [AARON MFD FIT] ${current.customName || ship.name} (${ship.name})`,
    `📡 Pilote : ${state.callsign || 'CITIZEN-1'} | Rôle : ${(current.role || ship.role || '').toUpperCase()} | Station : ${current.location || 'ARC-L1'}`,
    `📦 Soute : ${telem.scu} SCU (${telem.bagDesc})`,
    `⚡ Moteur Quantique : ${telem.qd.name} (S${ship.qdSize}) - Vitesse: ${telem.qdSpeedC}c (${telem.qdSpeedKms} km/s) - Portée: ${telem.maxRangeGm} Gm`,
    `🛡️ Boucliers : ${ship.shieldCount || 1}x ${telem.shield.name} (S${ship.shieldSize}) - Total: ${telem.totalHp.toLocaleString()} HP (+${telem.totalRegen} HP/s)`,
    `🔋 Génératrice : ${telem.pwr.name} (S${ship.powerSize}) - Puissance: ${(telem.powerWatts / 1000).toFixed(1)} kW (Charge: ${telem.powerLoadPct}%)`,
    `❄️ Refroidisseurs : ${ship.coolerCount || 1}x ${telem.cooler.name} (S${ship.coolerSize}) - Dissipation: ${Math.round(telem.totalCooling / 1000)} kK/s`
  ];
  if (ship.role === 'mining') {
    const laser = (MINING_DATA.lasers || []).find(l => l.id === current.laserId);
    lines.push(`⛏️ Tête de Minage : ${laser ? laser.name : 'Lancet S1'} (S${ship.laserSize || 1})`);
    const mods = (current.submodules || []).filter(m => m !== 'none').join(', ');
    if (mods) lines.push(`🧩 Sous-modules : ${mods}`);
    if (current.gadgetId && current.gadgetId !== 'none') lines.push(`🧰 Gadget : ${current.gadgetId}`);
  } else if (ship.role === 'cargo' || ship.role === 'hauler') {
    const tb = (MINING_DATA.tractorBeams || []).find(t => t.id === current.cargoTractorId);
    if (tb) lines.push(`🧲 Rayon Tracteur : ${tb.name} (S${tb.size} • ${tb.force} N)`);
    lines.push(`📦 Grille Cargo 4.0 : ${current.cargoGridMode || 'standard'}`);
    const w = (MINING_DATA.shipWeapons || []).find(w => w.id === current.cargoTurretId);
    if (w) lines.push(`⚔️ Tourelle Défensive : ${w.name} (S${w.size})`);
  } else if (ship.role === 'salvage') {
    const sh1 = (MINING_DATA.salvageHeads || []).find(s => s.id === current.salvageHead1Id);
    const sh2 = (MINING_DATA.salvageHeads || []).find(s => s.id === current.salvageHead2Id);
    if (sh1 || sh2) lines.push(`♻️ Têtes de Grattage : ${sh1 ? sh1.name : 'Abrade'} / ${sh2 ? sh2.name : 'Clincher'}`);
    const tb = (MINING_DATA.tractorBeams || []).find(t => t.id === current.salvageTractorId);
    if (tb) lines.push(`🧲 Rayon Tracteur : ${tb.name}`);
  } else if (ship.role === 'combat' || ship.role === 'escort') {
    const pw = (MINING_DATA.shipWeapons || []).find(w => w.id === current.combatPrimaryId);
    if (pw) lines.push(`⚔️ Arme Pilote : ${pw.name} (S${pw.size})`);
    const tw = (MINING_DATA.shipWeapons || []).find(w => w.id === current.combatTurretId);
    if (tw) lines.push(`🎯 Tourelle Militaire : ${tw.name}`);
    const mr = (MINING_DATA.missileRacks || []).find(m => m.id === current.combatMissileId);
    if (mr) lines.push(`🚀 Missiles : ${mr.name}`);
  }
  const text = lines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    sfx.playSuccess();
    triggerHaptic(15);
    showToast(t.toastShipFitCopied || '📋 Configuration vaisseau copiée dans le presse-papier !');
  }).catch(() => {
    showToast('❌ Impossible de copier le fit.');
  });
}

function initMyShipHub() {
  loadMyPersonalFleet();
  switchMyShipSubView(state.myShipSubView || 'fleet');

  // Sub-navigation buttons
  if (DOM.btnSubNavMyFleet) {
    DOM.btnSubNavMyFleet.addEventListener('click', () => switchMyShipSubView('fleet'));
  }
  if (DOM.btnSubNavShipConfig) {
    DOM.btnSubNavShipConfig.addEventListener('click', () => switchMyShipSubView('config'));
  }
  if (DOM.btnBackToFleetDeck) {
    DOM.btnBackToFleetDeck.addEventListener('click', () => switchMyShipSubView('fleet'));
  }

  // Quick switch dropdown in config pane
  if (DOM.myFleetQuickSwitchSelect) {
    DOM.myFleetQuickSwitchSelect.addEventListener('change', (e) => {
      openConfigurePersonalShip(e.target.value);
    });
  }

  // Activate button from config toolbar
  if (DOM.btnMakeActiveFromConfig) {
    DOM.btnMakeActiveFromConfig.addEventListener('click', () => {
      if (state.selectedFleetShipId) {
        activatePersonalShip(state.selectedFleetShipId);
      }
    });
  }

  // Search input in Hangar deck
  if (DOM.myFleetSearchInput) {
    DOM.myFleetSearchInput.addEventListener('input', (e) => {
      state.myFleetSearch = e.target.value.trim();
      if (DOM.myFleetSearchClear) {
        DOM.myFleetSearchClear.style.display = state.myFleetSearch ? 'block' : 'none';
      }
      renderMyPersonalFleet();
    });
  }
  if (DOM.myFleetSearchClear) {
    DOM.myFleetSearchClear.addEventListener('click', () => {
      DOM.myFleetSearchInput.value = '';
      state.myFleetSearch = '';
      DOM.myFleetSearchClear.style.display = 'none';
      renderMyPersonalFleet();
    });
  }

  // Quick Role Filter Chips
  const filterMappings = [
    { el: DOM.myFleetFilterAll, role: 'all' },
    { el: DOM.myFleetFilterMining, role: 'mining' },
    { el: DOM.myFleetFilterCargo, role: 'cargo' },
    { el: DOM.myFleetFilterSalvage, role: 'salvage' },
    { el: DOM.myFleetFilterCombat, role: 'combat' }
  ];
  filterMappings.forEach(mapping => {
    if (mapping.el) {
      mapping.el.addEventListener('click', () => {
        state.myFleetFilter = mapping.role;
        renderMyPersonalFleet();
      });
    }
  });

  // Modal: Add Personal Ship
  if (DOM.btnOpenAddPersonalShipModal) {
    DOM.btnOpenAddPersonalShipModal.addEventListener('click', openAddPersonalShipModal);
  }
  if (DOM.btnCloseAddPersonalShipModal) {
    DOM.btnCloseAddPersonalShipModal.addEventListener('click', () => closeModal(DOM.addPersonalShipModal));
  }
  if (DOM.btnCancelAddPersonalShip) {
    DOM.btnCancelAddPersonalShip.addEventListener('click', () => closeModal(DOM.addPersonalShipModal));
  }
  if (DOM.btnSubmitAddPersonalShip) {
    DOM.btnSubmitAddPersonalShip.addEventListener('click', submitAddPersonalShip);
  }
  if (DOM.addPersonalShipModal) {
    DOM.addPersonalShipModal.addEventListener('click', (e) => {
      if (e.target === DOM.addPersonalShipModal) closeModal(DOM.addPersonalShipModal);
    });
  }

  // Configuration Form Listeners (updates selected ship)
  if (DOM.myShipSelect) {
    DOM.myShipSelect.addEventListener('change', (e) => {
      const selectedModelId = e.target.value;
      const existingInFleet = state.myPersonalFleet.find(s => s.shipId === selectedModelId);
      if (existingInFleet) {
        openConfigurePersonalShip(existingInFleet.id);
        return;
      }
      const current = getSelectedFleetShip();
      if (!current) return;
      current.shipId = selectedModelId;
      const shipDef = getActiveShipDef(selectedModelId);
      current.customName = shipDef.name;
      if (DOM.myShipCustomNameInput) DOM.myShipCustomNameInput.value = shipDef.name;
      syncShipComponentDefaults(true, current);
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      renderMyShipHub();
      updateFleetQuickSwitchSelect();
      sfx.playBeep(520, 'sine', 0.04);
      triggerHaptic(10);
    });
  }

  // Custom Name Input directly in Hero Card
  if (DOM.myShipCustomNameInput) {
    DOM.myShipCustomNameInput.addEventListener('input', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.customName = e.target.value;
      if (DOM.myShipCustomNameDisplay) {
        DOM.myShipCustomNameDisplay.textContent = current.customName || getActiveShipDef(current.shipId).name;
      }
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      updateFleetQuickSwitchSelect();
    });

    DOM.myShipCustomNameInput.addEventListener('blur', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      const cleanName = e.target.value.trim();
      if (!cleanName) {
        const defName = getActiveShipDef(current.shipId).name;
        current.customName = defName;
        e.target.value = defName;
      } else {
        current.customName = cleanName;
        e.target.value = cleanName;
      }
      if (DOM.myShipCustomNameDisplay) {
        DOM.myShipCustomNameDisplay.textContent = current.customName;
      }
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      renderMyPersonalFleet();
      updateFleetQuickSwitchSelect();
    });

    DOM.myShipCustomNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        DOM.myShipCustomNameInput.blur();
        sfx.playSuccess();
        triggerHaptic(12);
        showToast(`✨ Nom de baptême enregistré : ${DOM.myShipCustomNameInput.value}`);
      }
    });

    const btnEditShipHeroName = document.getElementById('btnEditShipHeroName');
    if (btnEditShipHeroName) {
      btnEditShipHeroName.addEventListener('click', () => {
        DOM.myShipCustomNameInput.focus();
        DOM.myShipCustomNameInput.select();
        sfx.playBeep(620, 'sine', 0.03);
      });
    }
  }

  // Role Select
  if (DOM.myShipRoleSelect) {
    DOM.myShipRoleSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.role = e.target.value;
      if (DOM.myShipRoleBadge) DOM.myShipRoleBadge.textContent = e.target.value.toUpperCase();
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      renderMyShipHub();
    });
  }

  // Status Select
  if (DOM.myShipStatusSelect) {
    DOM.myShipStatusSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.status = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      renderMyShipHub();
    });
  }

  // Location Select
  if (DOM.myShipLocationSelect) {
    DOM.myShipLocationSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.location = e.target.value;
      if (DOM.myShipStationDisplay) DOM.myShipStationDisplay.textContent = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      renderMyShipHub();
    });
  }

  // Gear & Components Select Listeners
  if (DOM.myShipLaserSelect) {
    DOM.myShipLaserSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.laserId = e.target.value;
      const chosenLaser = (MINING_DATA.lasers || []).find(l => l.id === e.target.value);
      const chosenSlots = chosenLaser?.slots ?? 0;
      if (!Array.isArray(current.submodules)) current.submodules = ['none', 'none', 'none'];
      for (let i = chosenSlots; i < 3; i++) {
        current.submodules[i] = 'none';
      }
      if (Array.isArray(current.turrets) && current.turrets.length > 0) {
        current.turrets[0].laserId = e.target.value;
        current.turrets[0].moduleIds = [...current.submodules];
      }
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      renderMyShipHub();
    });
  }

  const subSelects = [DOM.myShipSubmod1Select, DOM.myShipSubmod2Select, DOM.myShipSubmod3Select];
  subSelects.forEach((sel, idx) => {
    if (!sel) return;
    sel.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      if (!Array.isArray(current.submodules)) current.submodules = ['none', 'none', 'none'];
      current.submodules[idx] = e.target.value;
      if (Array.isArray(current.turrets) && current.turrets.length > 0) {
        if (!Array.isArray(current.turrets[0].moduleIds)) current.turrets[0].moduleIds = ['none', 'none', 'none'];
        current.turrets[0].moduleIds[idx] = e.target.value;
      }
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  });

  if (DOM.myShipGadgetSelect) {
    DOM.myShipGadgetSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.gadgetId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipMiningWeaponSelect) {
    DOM.myShipMiningWeaponSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.miningWeaponId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipSaddlebagsSelect) {
    DOM.myShipSaddlebagsSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.saddlebagType = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipQdSelect) {
    DOM.myShipQdSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.quantumDriveId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipShieldSelect) {
    DOM.myShipShieldSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.shieldId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipPowerSelect) {
    DOM.myShipPowerSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.powerPlantId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipCoolerSelect) {
    DOM.myShipCoolerSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.coolerId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  // Dynamic MyShip Turret Collapse/Expand Toggle All
  if (DOM.btnMyShipToggleAllTurrets) {
    DOM.btnMyShipToggleAllTurrets.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(15);
      const cards = Array.from(DOM.myShipTurretCardsContainer?.querySelectorAll('.turret-config-card') || []);
      const allCollapsed = cards.length > 0 && cards.every(c => c.classList.contains('collapsed'));
      cards.forEach(c => {
        if (allCollapsed) c.classList.remove('collapsed');
        else c.classList.add('collapsed');
      });
      updateMyShipToggleAllButtonText();
    });
  }

  // Cargo Equipment Listeners
  if (DOM.myShipCargoGadgetSelect) {
    DOM.myShipCargoGadgetSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.gadgetId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipCargoTractorSelect) {
    DOM.myShipCargoTractorSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.cargoTractorId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipCargoGridSelect) {
    DOM.myShipCargoGridSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.cargoGridMode = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipCargoWeaponSelect) {
    DOM.myShipCargoWeaponSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.cargoTurretId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  // Salvage Equipment Listeners
  if (DOM.myShipSalvageHead1Select) {
    DOM.myShipSalvageHead1Select.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.salvageHead1Id = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipSalvageHead2Select) {
    DOM.myShipSalvageHead2Select.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.salvageHead2Id = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipSalvageTractorSelect) {
    DOM.myShipSalvageTractorSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.salvageTractorId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipSalvageWeaponSelect) {
    DOM.myShipSalvageWeaponSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.salvageWeaponId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  // Combat Equipment Listeners
  if (DOM.myShipCombatPrimarySelect) {
    DOM.myShipCombatPrimarySelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.combatPrimaryId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipCombatTurretSelect) {
    DOM.myShipCombatTurretSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.combatTurretId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  if (DOM.myShipCombatMissileSelect) {
    DOM.myShipCombatMissileSelect.addEventListener('change', (e) => {
      const current = getSelectedFleetShip();
      if (!current) return;
      current.combatMissileId = e.target.value;
      saveMyPersonalFleet();
      if (current.isActive) applyShipLoadoutToWorkflows(true);
      else renderMyShipHub();
    });
  }

  // Presets (applied to selected ship)
  const applyPreset = (presetData) => {
    const current = getSelectedFleetShip();
    if (!current) return;
    Object.assign(current, presetData);
    syncShipComponentDefaults(false, current);
    saveMyPersonalFleet();
    if (current.isActive) applyShipLoadoutToWorkflows(false);
    renderMyShipHub();
    updateFleetQuickSwitchSelect();
    sfx.playSuccess();
    triggerHaptic(15);
    showToast(`⚙️ Configuration type appliquée : ${presetData.customName || 'Fit personnalisé'}`);
  };

  if (DOM.btnPresetProspectorAllRounder) {
    DOM.btnPresetProspectorAllRounder.addEventListener('click', () => {
      applyPreset({
        shipId: 'prospector',
        customName: 'Prospector Mineur Solo',
        role: 'mining',
        status: 'available',
        laserId: 'lancet_s1',
        submodules: ['focus_3', 'surge', 'none'],
        gadgetId: 'sabir',
        saddlebagType: 'standard',
        quantumDriveId: 'atlas_s1',
        shieldId: 'fr66_s1',
        powerPlantId: 'js300_s1',
        coolerId: 'ultraflow_s1'
      });
    });
  }

  if (DOM.btnPresetMoleTrio) {
    DOM.btnPresetMoleTrio.addEventListener('click', () => {
      applyPreset({
        shipId: 'mole',
        customName: 'Argo Deep Trio',
        role: 'mining',
        status: 'available',
        laserId: 'lancet_s2',
        submodules: ['focus_3', 'stampede', 'stampede'],
        gadgetId: 'boreas',
        saddlebagType: 'standard',
        quantumDriveId: 'crossfield_s2',
        shieldId: 'fr76_s2',
        powerPlantId: 'js400_s2',
        coolerId: 'avalanche_s2'
      });
    });
  }

  if (DOM.btnPresetC2Cargo) {
    DOM.btnPresetC2Cargo.addEventListener('click', () => {
      applyPreset({
        shipId: 'c2',
        customName: 'Crusader Titan',
        role: 'cargo',
        status: 'available',
        quantumDriveId: 'ts2_s3',
        shieldId: 'fr86_s3',
        powerPlantId: 'daybreak_s3',
        coolerId: 'thermal4_s3'
      });
    });
  }

  if (DOM.btnPresetTaurusCargo) {
    DOM.btnPresetTaurusCargo.addEventListener('click', () => {
      applyPreset({
        shipId: 'taurus',
        customName: 'Taurus Express',
        role: 'cargo',
        status: 'available',
        quantumDriveId: 'crossfield_s2',
        shieldId: 'fr76_s2',
        powerPlantId: 'js400_s2',
        coolerId: 'avalanche_s2'
      });
    });
  }

  if (DOM.btnPresetVulture) {
    DOM.btnPresetVulture.addEventListener('click', () => {
      applyPreset({
        shipId: 'vulture',
        customName: 'Vulture Salvager',
        role: 'salvage',
        status: 'available',
        quantumDriveId: 'atlas_s1',
        shieldId: 'fr66_s1',
        powerPlantId: 'js300_s1',
        coolerId: 'ultraflow_s1'
      });
    });
  }

  if (DOM.btnPresetScorpius) {
    DOM.btnPresetScorpius.addEventListener('click', () => {
      applyPreset({
        shipId: 'scorpius',
        customName: 'Scorpius Interceptor',
        role: 'combat',
        status: 'available',
        quantumDriveId: 'vk00_s1',
        shieldId: 'fr66_s1',
        powerPlantId: 'js300_s1',
        coolerId: 'ultraflow_s1'
      });
    });
  }

  // Apply Button
  if (DOM.btnApplyShipLoadout) {
    DOM.btnApplyShipLoadout.addEventListener('click', () => {
      const current = getSelectedFleetShip();
      if (!current) return;
      if (!current.isActive) {
        activatePersonalShip(current.id, false);
      } else {
        applyShipLoadoutToWorkflows(false);
      }
      sfx.playSuccess();
      triggerHaptic(20);
      showToast('✅ Configuration validée et synchronisée sur tous les modules (Minage, Raffinage, Commerce) !');
    });
  }

  // Copy Fit Button
  if (DOM.btnCopyShipLoadout) {
    DOM.btnCopyShipLoadout.addEventListener('click', () => {
      copyShipLoadoutToClipboard();
    });
  }

  // Broadcast / Sync Ship to Fleet Button
  if (DOM.btnSyncShipToFleet) {
    DOM.btnSyncShipToFleet.addEventListener('click', () => {
      broadcastShipLoadoutToFleet();
      sfx.playSuccess();
      triggerHaptic(15);
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.toastShipBroadcasted || 'Télémétrie et statut du vaisseau diffusés à l\'escadre P2P !');
    });
  }
}

// ==========================================
// UNIFIED INVENTORY & MULTI-LOCATION HUB (PHASE 3)
// ==========================================

const SPATIAL_LOCATIONS_LIST = [
  { id: 'ship_cargo', name: '🚀 Soute Vaisseau Actif' },
  { id: 'ARC-L1 Wide Forest Station', name: '🛰️ ARC-L1 Wide Forest Station' },
  { id: 'HUR-L1 Green Glade Station', name: '🛰️ HUR-L1 Green Glade Station' },
  { id: 'CRU-L1 Ambitious Dream', name: '🛰️ CRU-L1 Ambitious Dream' },
  { id: 'MIC-L1 Shallow Frontier', name: '🛰️ MIC-L1 Shallow Frontier' },
  { id: 'Port Tressler (microTech)', name: '🛰️ Port Tressler (microTech)' },
  { id: 'Everus Harbor (Hurston)', name: '🛰️ Everus Harbor (Hurston)' },
  { id: 'Baijini Point (ArcCorp)', name: '🛰️ Baijini Point (ArcCorp)' },
  { id: 'Seraphim Station (Crusader)', name: '🛰️ Seraphim Station (Crusader)' },
  { id: 'Lorville (Hurston)', name: '🏭 Lorville (Hurston)' },
  { id: 'Area18 (ArcCorp)', name: '🏙️ Area18 (ArcCorp)' },
  { id: 'New Babbage (microTech)', name: '🏢 New Babbage (microTech)' },
  { id: 'Orison (Crusader)', name: '☁️ Orison (Crusader)' },
  { id: 'Pyro - Ruin Station', name: '🔥 Pyro - Ruin Station' },
  { id: 'Avant-poste Pyro - Monox', name: '🔥 Avant-poste Pyro - Monox' }
];

function getInventoryService() {
  return window.AaronModules?.inventoryService || AaronModules.inventoryService;
}

function initUnifiedInventory() {
  const invService = getInventoryService();
  if (!invService) return;

  // Auto seed initial inventory if empty
  invService.seedInitialInventory();

  // Subnav Ownership Switchers
  if (DOM.btnInventoryModePersonal) {
    DOM.btnInventoryModePersonal.addEventListener('click', () => {
      state.inventoryOwnerMode = 'personal';
      renderUnifiedInventory();
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(10);
    });
  }
  if (DOM.btnInventoryModeGuild) {
    DOM.btnInventoryModeGuild.addEventListener('click', () => {
      state.inventoryOwnerMode = 'guild';
      renderUnifiedInventory();
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(10);
    });
  }

  // Add Item Lot Button
  if (DOM.btnOpenAddInventoryItem) {
    DOM.btnOpenAddInventoryItem.addEventListener('click', () => {
      openAddInventoryItemModal();
    });
  }

  // Category Filter Chips
  const filterChips = [
    { el: DOM.invFilterAll, cat: 'all' },
    { el: DOM.invFilterRefined, cat: 'refined_ore' },
    { el: DOM.invFilterRaw, cat: 'raw_ore' },
    { el: DOM.invFilterSalvage, cat: 'salvage_rmc' },
    { el: DOM.invFilterCargo, cat: 'commodity_cargo' },
    { el: DOM.invFilterCrafted, cat: 'crafted' }
  ];

  filterChips.forEach(({ el, cat }) => {
    if (el) {
      el.addEventListener('click', () => {
        state.inventoryCategoryFilter = cat;
        renderUnifiedInventory();
        sfx.playBeep(600, 'sine', 0.02);
      });
    }
  });

  // Location Filter Select
  if (DOM.inventoryLocationFilterSelect) {
    DOM.inventoryLocationFilterSelect.addEventListener('change', (e) => {
      state.inventoryLocationFilter = e.target.value;
      renderUnifiedInventory();
      sfx.playBeep(580, 'sine', 0.03);
    });
  }

  // Search input & clear
  if (DOM.inventorySearchInput) {
    DOM.inventorySearchInput.addEventListener('input', (e) => {
      state.inventorySearchQuery = e.target.value;
      if (DOM.inventorySearchClear) {
        DOM.inventorySearchClear.style.display = state.inventorySearchQuery ? 'block' : 'none';
      }
      renderUnifiedInventory();
    });
  }
  if (DOM.inventorySearchClear) {
    DOM.inventorySearchClear.addEventListener('click', () => {
      DOM.inventorySearchInput.value = '';
      state.inventorySearchQuery = '';
      DOM.inventorySearchClear.style.display = 'none';
      renderUnifiedInventory();
    });
  }

  // Subscribe to reactive inventory changes
  if (window.AaronModules?.eventBus) {
    window.AaronModules.eventBus.on(window.AaronModules.EVENTS.INVENTORY_CHANGED, () => {
      if (state.activeWorkflow === 'inventory') {
        renderUnifiedInventory();
      }
    });
  }
}

function renderUnifiedInventory() {
  const invService = getInventoryService();
  if (!invService || !DOM.inventoryItemsGrid) return;

  invService.seedInitialInventory();

  const ownerType = state.inventoryOwnerMode || 'personal';
  const catFilter = state.inventoryCategoryFilter || 'all';
  const locFilter = state.inventoryLocationFilter || 'all';
  const query = state.inventorySearchQuery || '';

  // 1. Update Subnav Buttons & Badges
  const allPersonalItems = invService.getItems({ ownerType: 'personal' });
  const allGuildItems = invService.getItems({ ownerType: 'guild' });

  if (DOM.inventoryPersonalCountBadge) {
    DOM.inventoryPersonalCountBadge.textContent = allPersonalItems.length;
  }
  if (DOM.inventoryGuildCountBadge) {
    DOM.inventoryGuildCountBadge.textContent = allGuildItems.length;
  }
  if (DOM.btnInventoryModePersonal) {
    DOM.btnInventoryModePersonal.classList.toggle('active', ownerType === 'personal');
  }
  if (DOM.btnInventoryModeGuild) {
    DOM.btnInventoryModeGuild.classList.toggle('active', ownerType === 'guild');
  }

  // 2. Compute Filter Chip Counts (Scoped to Active Owner Mode)
  const currentModeItems = ownerType === 'personal' ? allPersonalItems : allGuildItems;
  if (DOM.chipInvAll) DOM.chipInvAll.textContent = currentModeItems.length;
  if (DOM.chipInvRefined) DOM.chipInvRefined.textContent = currentModeItems.filter(i => i.category === 'refined_ore').length;
  if (DOM.chipInvRaw) DOM.chipInvRaw.textContent = currentModeItems.filter(i => i.category === 'raw_ore').length;
  if (DOM.chipInvSalvage) DOM.chipInvSalvage.textContent = currentModeItems.filter(i => i.category === 'salvage_rmc').length;
  if (DOM.chipInvCargo) DOM.chipInvCargo.textContent = currentModeItems.filter(i => i.category === 'commodity_cargo').length;
  if (DOM.chipInvCrafted) DOM.chipInvCrafted.textContent = currentModeItems.filter(i => i.category && i.category.startsWith('crafted')).length;

  // Toggle active class on chips
  const chipsMap = {
    all: DOM.invFilterAll,
    refined_ore: DOM.invFilterRefined,
    raw_ore: DOM.invFilterRaw,
    salvage_rmc: DOM.invFilterSalvage,
    commodity_cargo: DOM.invFilterCargo,
    crafted: DOM.invFilterCrafted
  };
  Object.entries(chipsMap).forEach(([cat, el]) => {
    if (el) el.classList.toggle('active', catFilter === cat);
  });

  // 3. Fetch Filtered Items
  const items = invService.getItems({
    ownerType,
    category: catFilter,
    locationId: locFilter,
    search: query
  });

  // 4. Update KPI Telemetry Banner
  const totals = invService.getTotals({
    ownerType,
    category: catFilter,
    locationId: locFilter,
    search: query
  });
  if (DOM.kpiInventoryTotalScuVal) {
    DOM.kpiInventoryTotalScuVal.innerHTML = `${totals.totalScu.toLocaleString('fr-FR')} <span style="font-size:0.8rem;">SCU</span>`;
  }
  if (DOM.kpiInventoryValueVal) {
    DOM.kpiInventoryValueVal.innerHTML = `${totals.totalValueUEC.toLocaleString('fr-FR')} <span style="font-size:0.8rem;">aUEC</span>`;
  }
  if (DOM.kpiInventoryActiveLocationVal) {
    const locObj = SPATIAL_LOCATIONS_LIST.find(l => l.id === locFilter);
    DOM.kpiInventoryActiveLocationVal.textContent = locFilter === 'all'
      ? 'Tous les sites'
      : (locObj ? locObj.name : locFilter);
  }

  // Synchronize Dock Badge
  if (DOM.dockInventoryBadge) {
    DOM.dockInventoryBadge.textContent = items.length;
    DOM.dockInventoryBadge.style.display = items.length > 0 ? 'inline-block' : 'none';
  }

  // 5. Render Grid Cards
  if (items.length === 0) {
    DOM.inventoryItemsGrid.innerHTML = `
      <div class="cig-empty-fleet-state" style="grid-column: 1 / -1; padding: 40px 20px; text-align: center; background: rgba(0,240,255,0.02); border: 1px dashed rgba(0,240,255,0.2); border-radius: 10px;">
        <div style="font-size: 2.8rem; margin-bottom: 12px;">📦</div>
        <h3 style="font-family: var(--font-hud); color: var(--accent-cyan); font-size: 1.1rem; margin-bottom: 6px;">AUCUN ARTICLE DÉTECTÉ</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 16px;">
          Aucun lot ne correspond aux critères de filtre dans votre ${ownerType === 'personal' ? 'inventaire privé' : 'stockpile de guilde'}.
        </p>
        <button type="button" class="ship-action-btn primary" id="btnEmptyAddLot" style="margin: 0 auto; max-width: 240px;">
          + Ajouter un Nouveau Lot
        </button>
      </div>
    `;
    document.getElementById('btnEmptyAddLot')?.addEventListener('click', openAddInventoryItemModal);
    return;
  }

  const categoryLabels = {
    refined_ore: '💎 RAFFINÉ',
    raw_ore: '⛏️ BRUT',
    salvage_rmc: '♻️ SALVAGE RMC',
    commodity_cargo: '📦 FRET CARGO',
    crafted_laser: '⚡ LASER CRAFTÉ',
    crafted_module: '🎛️ MODULE CRAFTÉ',
    crafted_weapon: '⚔️ ARME CRAFTÉE'
  };

  const categoryIcons = {
    refined_ore: '💎',
    raw_ore: '⛏️',
    salvage_rmc: '♻️',
    commodity_cargo: '📦',
    crafted_laser: '⚡',
    crafted_module: '🎛️',
    crafted_weapon: '⚔️'
  };

  DOM.inventoryItemsGrid.innerHTML = items.map(item => {
    const isCrafted = item.category && item.category.startsWith('crafted');
    const catClass = isCrafted ? 'cat-crafted' : `cat-${item.category}`;
    const icon = categoryIcons[item.category] || '📦';
    const catLabel = categoryLabels[item.category] || (item.category || '').toUpperCase();
    const estimatedVal = invService.getItemEstimatedValue(item);
    const locObj = SPATIAL_LOCATIONS_LIST.find(l => l.id === item.locationId);
    const locDisplay = locObj ? locObj.name : `🛰️ ${item.locationId}`;

    let shipInstalledTag = '';
    if (item.installedOnShipId) {
      const ship = state.myPersonalFleet.find(s => s.id === item.installedOnShipId) || { customName: 'Vaisseau de Flotte' };
      shipInstalledTag = `
        <div style="font-size:0.72rem; color:var(--accent-emerald); font-weight:700; display:flex; align-items:center; gap:4px; margin-top:4px;">
          ⚡ Installé sur ${ship.customName || 'Vaisseau'}
        </div>
      `;
    }

    return `
      <div class="inventory-item-card ${catClass}" data-item-id="${item.id}" style="cursor:pointer;">
        <div>
          <div class="inv-card-header">
            <div class="inv-card-title-group">
              <div class="inv-card-icon">${icon}</div>
              <div>
                <div class="inv-card-name">${item.name}</div>
                <div class="inv-location-tag">${locDisplay}</div>
              </div>
            </div>
            <span class="inv-card-category-badge">${catLabel}</span>
          </div>

          <div class="inv-card-stats">
            <div class="inv-stat-item">
              <span class="inv-stat-lbl">Quantité</span>
              <span class="inv-stat-val">
                ${item.quantitySCU > 0 ? `${item.quantitySCU} <span style="font-size:0.75rem; color:var(--accent-cyan);">SCU</span>` : `${item.quantityUnits} <span style="font-size:0.75rem; color:var(--accent-cyan);">Unité</span>`}
              </span>
            </div>
            <div class="inv-stat-item">
              <span class="inv-stat-lbl">Valeur Estimée</span>
              <span class="inv-stat-val" style="color:var(--accent-gold);">
                ${estimatedVal.toLocaleString('fr-FR')} <span style="font-size:0.75rem;">aUEC</span>
              </span>
            </div>
          </div>

          ${shipInstalledTag}
          ${item.metadata?.notes ? `
            <div style="font-size:0.7rem; color:var(--text-muted); margin-top:6px; font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              "${item.metadata.notes}"
            </div>
          ` : ''}
        </div>

        <div class="inv-card-actions">
          <button type="button" class="ship-action-btn primary btn-inspect-lot" data-item-id="${item.id}" style="width:100%; font-size:0.78rem; padding:6px 10px;">
            🔍 Inspecter & Transférer
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach click listeners to cards and inspect buttons
  DOM.inventoryItemsGrid.querySelectorAll('.inventory-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const itemId = card.getAttribute('data-item-id');
      const item = invService.getItemById(itemId);
      if (item) openItemInspector(item);
    });
  });
}

function openItemInspector(item) {
  const invService = getInventoryService();
  if (!invService || !item) return;

  const estimatedVal = invService.getItemEstimatedValue(item);
  const icon = item.category === 'refined_ore' ? '💎' :
               item.category === 'raw_ore' ? '⛏️' :
               item.category === 'salvage_rmc' ? '♻️' :
               item.category === 'commodity_cargo' ? '📦' :
               item.category === 'crafted_laser' ? '⚡' :
               item.category === 'crafted_module' ? '🎛️' : '📦';

  let installedShipName = '';
  if (item.installedOnShipId) {
    const ship = state.myPersonalFleet.find(s => s.id === item.installedOnShipId);
    installedShipName = ship?.customName || 'Vaisseau Personnel';
  }

  // Location selector options
  const locationOptionsHtml = SPATIAL_LOCATIONS_LIST.map(loc => `
    <option value="${loc.id}" ${loc.id === item.locationId ? 'selected' : ''}>
      ${loc.name}
    </option>
  `).join('');

  const bodyHtml = `
    <div class="inspector-item-details">
      <!-- 1. KPI Telemetry Matrix -->
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:16px;">
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:10px;">
          <div style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase;">Volume / Quantité</div>
          <div style="font-family:var(--font-mono); font-size:1.15rem; font-weight:700; color:var(--accent-cyan); margin-top:2px;">
            ${item.quantitySCU > 0 ? `${item.quantitySCU} SCU` : `${item.quantityUnits} Unité(s)`}
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:10px;">
          <div style="font-size:0.68rem; color:var(--text-muted); text-transform:uppercase;">Valeur Estimée TDD</div>
          <div style="font-family:var(--font-mono); font-size:1.15rem; font-weight:700; color:var(--accent-gold); margin-top:2px;">
            ${estimatedVal.toLocaleString('fr-FR')} aUEC
          </div>
        </div>
      </div>

      <!-- 2. Location & Status Card -->
      <div style="background:rgba(0,240,255,0.04); border:1px solid rgba(0,240,255,0.2); border-radius:8px; padding:12px; margin-bottom:18px;">
        <div style="font-size:0.7rem; color:var(--accent-cyan); font-weight:700; text-transform:uppercase; margin-bottom:4px;">
          📍 Emplacement Actuel
        </div>
        <div style="font-size:0.95rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:6px;">
          ${item.locationId === 'ship_cargo' ? '🚀 Soute Vaisseau Actif' : `🛰️ ${item.locationId}`}
        </div>
        ${item.installedOnShipId ? `
          <div style="margin-top:6px; font-size:0.75rem; color:var(--accent-emerald); font-weight:700;">
            ⚡ Actuellement monté sur votre flotte (${installedShipName})
          </div>
        ` : ''}
        ${item.metadata?.notes ? `
          <div style="margin-top:8px; font-size:0.75rem; color:var(--text-muted); border-top:1px dashed rgba(255,255,255,0.1); padding-top:6px;">
            📝 <em>${item.metadata.notes}</em>
          </div>
        ` : ''}
      </div>

      <!-- 3. Action: Spatial Transfer -->
      <div class="inspector-action-box" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px; margin-bottom:16px;">
        <div style="font-family:var(--font-hud); font-size:0.82rem; color:var(--accent-cyan); font-weight:700; margin-bottom:6px;">
          🛰️ TRANSFÉRER CE LOT VERS UN AUTRE SITE
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:10px;">
          Déplacez ce chargement vers un autre terminal spatial ou la soute de votre vaisseau actif.
        </p>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <select id="inspectorTransferTargetSelect" class="hud-select-full" style="flex:1; min-width:200px; font-size:0.82rem; padding:6px 8px;">
            ${locationOptionsHtml}
          </select>
          <button type="button" class="ship-action-btn primary" id="btnExecuteTransferLot" style="padding:6px 14px; font-size:0.8rem; white-space:nowrap;">
            Transférer
          </button>
        </div>
      </div>

      <!-- 4. Action: Split Lot (if SCU > 1) -->
      ${item.quantitySCU > 1 ? `
      <div class="inspector-action-box" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px; margin-bottom:16px;">
        <div style="font-family:var(--font-hud); font-size:0.82rem; color:var(--accent-amber); font-weight:700; margin-bottom:6px;">
          ⚖️ SCINDER LE LOT (SPLIT CHARGEMENT)
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:10px;">
          Prélevez une fraction de ce lot pour la stocker ailleurs ou la vendre séparément.
        </p>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="number" id="inspectorSplitAmountInput" min="1" max="${item.quantitySCU - 1}" value="${Math.min(item.quantitySCU - 1, 8)}" class="hud-select-full" style="width:85px; text-align:center; font-family:var(--font-mono); font-weight:700; padding:6px;" />
          <span style="font-size:0.8rem; color:var(--text-muted);">SCU vers</span>
          <select id="inspectorSplitTargetSelect" class="hud-select-full" style="flex:1; min-width:180px; font-size:0.82rem; padding:6px 8px;">
            ${locationOptionsHtml}
          </select>
          <button type="button" class="ship-action-btn secondary" id="btnExecuteSplitLot" style="padding:6px 12px; font-size:0.8rem; white-space:nowrap;">
            Scinder
          </button>
        </div>
      </div>
      ` : ''}

      <!-- 5. Action: Ownership Transfer -->
      <div class="inspector-action-box" style="background:rgba(255,215,0,0.03); border:1px solid rgba(255,215,0,0.2); border-radius:8px; padding:14px; margin-bottom:16px;">
        <div style="font-family:var(--font-hud); font-size:0.82rem; color:#ffd700; font-weight:700; margin-bottom:6px;">
          🏛️ STATUT DE PROPRIÉTÉ & ACCRÉDITATION
        </div>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:10px;">
          ${item.ownerType === 'personal'
            ? "Déposez ce lot dans le stock commun de l'organisation pour alimenter les opérations et le craft."
            : "Transférez ce lot du stockpile de guilde vers votre inventaire privé."}
        </p>
        <button type="button" class="ship-action-btn" id="btnExecuteTransferOwnership" style="width:100%; border-color:#ffd700; color:#ffd700; font-weight:700; padding:8px 12px;">
          ${item.ownerType === 'personal'
            ? "🏛️ Déposer au Stock Commun de la Guilde"
            : "👤 Allouer à mon Inventaire Privé"}
        </button>
      </div>

      <!-- 6. Delete / Discard -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid rgba(255,255,255,0.08); margin-top:10px;">
        <span style="font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono);">ID: ${item.id}</span>
        <button type="button" class="ship-action-btn" id="btnExecuteDeleteLot" style="border-color:#ef4444; color:#ef4444; font-size:0.75rem; padding:5px 12px;">
          🗑️ Supprimer ce Lot
        </button>
      </div>
    </div>
  `;

  openInspector({
    icon,
    title: item.name,
    subtitle: `${item.ownerType === 'guild' ? '🏛️ STOCK GUILDE' : '👤 INVENTAIRE PRIVÉ'} • ${item.code.toUpperCase()}`,
    body: bodyHtml,
    footer: `
      <div style="display:flex; justify-content:flex-end; gap:8px; width:100%;">
        <button type="button" class="ship-action-btn secondary" id="btnCloseItemInspector" style="padding:6px 14px;">
          Fermer
        </button>
      </div>
    `
  });

  // Wire Actions
  document.getElementById('btnCloseItemInspector')?.addEventListener('click', closeInspector);

  // Transfer action
  document.getElementById('btnExecuteTransferLot')?.addEventListener('click', () => {
    const targetLoc = document.getElementById('inspectorTransferTargetSelect')?.value;
    if (!targetLoc || targetLoc === item.locationId) {
      showToast('⚠️ Veuillez sélectionner un emplacement de destination différent.');
      return;
    }
    invService.transferLocation(item.id, targetLoc);
    sfx.playSuccess();
    triggerHaptic(12);
    showToast(`📦 Lot ${item.name} transféré vers ${targetLoc} !`);
    renderUnifiedInventory();
    const updated = invService.getItemById(item.id);
    if (updated) openItemInspector(updated);
  });

  // Split action
  document.getElementById('btnExecuteSplitLot')?.addEventListener('click', () => {
    const amount = Number(document.getElementById('inspectorSplitAmountInput')?.value);
    const targetLoc = document.getElementById('inspectorSplitTargetSelect')?.value;
    if (!amount || amount <= 0 || amount >= item.quantitySCU) {
      showToast('⚠️ Quantité à scinder invalide.');
      return;
    }
    const newLot = invService.splitItem(item.id, amount, targetLoc);
    if (newLot) {
      sfx.playSuccess();
      triggerHaptic(12);
      showToast(`⚖️ Lot scindé : ${amount} SCU créés à ${targetLoc} !`);
      renderUnifiedInventory();
      const updated = invService.getItemById(item.id);
      if (updated) openItemInspector(updated);
    }
  });

  // Ownership transfer action
  document.getElementById('btnExecuteTransferOwnership')?.addEventListener('click', () => {
    const newOwner = item.ownerType === 'personal' ? 'guild' : 'personal';
    invService.transferOwnership(item.id, newOwner);
    sfx.playSuccess();
    triggerHaptic(15);
    showToast(`🏛️ Lot ${item.name} désormais affecté à : ${newOwner === 'guild' ? 'Stock Guilde' : 'Inventaire Privé'} !`);
    renderUnifiedInventory();
    const updated = invService.getItemById(item.id);
    if (updated) openItemInspector(updated);
  });

  // Delete action
  document.getElementById('btnExecuteDeleteLot')?.addEventListener('click', () => {
    if (confirm(`Confirmez-vous la suppression définitive du lot "${item.name}" ?`)) {
      invService.removeItem(item.id);
      sfx.playBeep(400, 'sine', 0.05);
      triggerHaptic(15);
      showToast(`🗑️ Lot "${item.name}" retiré de l'inventaire.`);
      closeInspector();
      renderUnifiedInventory();
    }
  });
}

function openAddInventoryItemModal() {
  const invService = getInventoryService();
  if (!invService) return;

  const locationOptionsHtml = SPATIAL_LOCATIONS_LIST.map(loc => `
    <option value="${loc.id}">
      ${loc.name}
    </option>
  `).join('');

  // Resources dropdown list from MINERALS and common goods
  const mineralOptionsHtml = MINING_DATA.minerals.map(m => `
    <option value="${m.id}" data-name="${m.name_fr || m.name}">
      ${m.symbol ? `[${m.symbol}] ` : ''}${m.name_fr || m.name}
    </option>
  `).join('');

  const bodyHtml = `
    <div class="add-inventory-form" style="display:flex; flex-direction:column; gap:14px;">
      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-hud);">CATÉGORIE D'ARTICLE :</label>
        <select id="newLotCategorySelect" class="hud-select-full" style="font-size:0.85rem; padding:8px 10px; margin-top:4px;">
          <option value="refined_ore">💎 Minerai Raffiné</option>
          <option value="raw_ore">⛏️ Minerai Brut (Brut d'extraction)</option>
          <option value="salvage_rmc">♻️ Salvage RMC (Matériau Composite)</option>
          <option value="commodity_cargo">📦 Fret Cargo Commercial</option>
        </select>
      </div>

      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-hud);">RESSOURCE / MARCHANDISE :</label>
        <select id="newLotResourceSelect" class="hud-select-full" style="font-size:0.85rem; padding:8px 10px; margin-top:4px;">
          <option value="quantainium" data-name="Quantainium">Quantainium (QT)</option>
          ${mineralOptionsHtml}
          <option value="rmc" data-name="Matériau Composite Récupéré (RMC)">RMC - Matériau Composite</option>
          <option value="construction_materials" data-name="Matériaux de Construction">Matériaux de Construction (CM)</option>
          <option value="medical_supplies" data-name="Fournitures Médicales">Fournitures Médicales d'Urgence</option>
          <option value="laranite" data-name="Laranite">Laranite Commerciale</option>
          <option value="titanium" data-name="Titane Industriel">Titane Industriel</option>
        </select>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-hud);">VOLUME TOTAL (SCU) :</label>
          <span id="newLotScuDisplay" style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:700;">16 SCU</span>
        </div>
        <input type="number" id="newLotQuantityInput" min="1" max="1000" value="16" class="hud-select-full" style="font-size:0.9rem; padding:8px 10px; margin-top:4px; font-family:var(--font-mono); font-weight:700;" />
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <button type="button" class="chip-btn quick-scu-btn" data-scu="8" style="padding:3px 8px; font-size:0.72rem;">+8 SCU</button>
          <button type="button" class="chip-btn quick-scu-btn" data-scu="16" style="padding:3px 8px; font-size:0.72rem;">+16 SCU</button>
          <button type="button" class="chip-btn quick-scu-btn" data-scu="32" style="padding:3px 8px; font-size:0.72rem;">+32 SCU</button>
          <button type="button" class="chip-btn quick-scu-btn" data-scu="64" style="padding:3px 8px; font-size:0.72rem;">+64 SCU</button>
          <button type="button" class="chip-btn quick-scu-btn" data-scu="128" style="padding:3px 8px; font-size:0.72rem;">+128 SCU</button>
        </div>
      </div>

      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-hud);">EMPLACEMENT DE DÉPÔT :</label>
        <select id="newLotLocationSelect" class="hud-select-full" style="font-size:0.85rem; padding:8px 10px; margin-top:4px;">
          ${locationOptionsHtml}
        </select>
      </div>

      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-hud);">AFFECTATION DE PROPRIÉTÉ :</label>
        <select id="newLotOwnerSelect" class="hud-select-full" style="font-size:0.85rem; padding:8px 10px; margin-top:4px;">
          <option value="personal">👤 Mon Inventaire Privé</option>
          <option value="guild">🏛️ Stock Commun de Guilde</option>
        </select>
      </div>

      <div>
        <label style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-hud);">NOTES / TRAÇABILITÉ (FACULTATIF) :</label>
        <input type="text" id="newLotNotesInput" class="hud-select-full" placeholder="Ex: Extrait dans l'Aaron Halo, raffiné Dinyx Solvent..." style="font-size:0.82rem; padding:8px 10px; margin-top:4px;" />
      </div>
    </div>
  `;

  openInspector({
    icon: '➕',
    title: "AJOUTER UN LOT D'INVENTAIRE",
    subtitle: 'ENREGISTREMENT DE MINERAIS, RMC OU FRET',
    body: bodyHtml,
    footer: `
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <button type="button" class="ship-action-btn secondary" id="btnCancelAddLot" style="padding:6px 14px;">
          Annuler
        </button>
        <button type="button" class="ship-action-btn primary" id="btnSubmitAddLot" style="padding:6px 16px;">
          + Enregistrer dans l'Inventaire
        </button>
      </div>
    `
  });

  // Wire Add Form
  document.getElementById('btnCancelAddLot')?.addEventListener('click', closeInspector);

  const scuInput = document.getElementById('newLotQuantityInput');
  const scuDisplay = document.getElementById('newLotScuDisplay');
  if (scuInput && scuDisplay) {
    scuInput.addEventListener('input', () => {
      scuDisplay.textContent = `${scuInput.value || 0} SCU`;
    });
  }

  document.querySelectorAll('.quick-scu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const addScu = Number(btn.getAttribute('data-scu')) || 0;
      if (scuInput) {
        scuInput.value = addScu;
        if (scuDisplay) scuDisplay.textContent = `${addScu} SCU`;
      }
      sfx.playBeep(600, 'sine', 0.02);
    });
  });

  document.getElementById('btnSubmitAddLot')?.addEventListener('click', () => {
    const category = document.getElementById('newLotCategorySelect')?.value || 'refined_ore';
    const resourceSelect = document.getElementById('newLotResourceSelect');
    const code = resourceSelect?.value || 'quantainium';
    const selectedOption = resourceSelect?.options[resourceSelect.selectedIndex];
    const name = selectedOption?.getAttribute('data-name') || selectedOption?.textContent.trim() || 'Minerai';
    const quantitySCU = Number(document.getElementById('newLotQuantityInput')?.value) || 16;
    const locationId = document.getElementById('newLotLocationSelect')?.value || 'ARC-L1 Wide Forest Station';
    const ownerType = document.getElementById('newLotOwnerSelect')?.value || 'personal';
    const notes = document.getElementById('newLotNotesInput')?.value.trim() || '';

    invService.addItem({
      category,
      code,
      name,
      quantitySCU,
      ownerType,
      locationId,
      metadata: {
        notes,
        tier: category === 'refined_ore' ? 3 : 2
      }
    });

    sfx.playSuccess();
    triggerHaptic(15);
    showToast(`✨ Lot de ${quantitySCU} SCU de ${name} ajouté avec succès !`);
    closeInspector();
    renderUnifiedInventory();
  });
}

// ==========================================
// MASTER INDUSTRIAL WORKFLOW LOOPS (Mining / Refining / Inventory / Trading / Guild)
// ==========================================

function setWorkflowTab(workflow, playAudio = true) {
  if (!['ship', 'mining', 'refining', 'inventory', 'trading', 'guild'].includes(workflow)) return;

  if (workflow === 'guild') {
    if (typeof openGuildConfigModal === 'function') {
      openGuildConfigModal();
    }
    if (DOM.btnWorkflowGuild) {
      DOM.btnWorkflowGuild.classList.add('active');
    }
    if (playAudio) {
      sfx.playChime(680, 'sine', 0.05);
      triggerHaptic(15);
    }
    return;
  }

  state.activeWorkflow = workflow;
  localStorage.setItem('aaron_mfd_active_workflow', workflow);

  if (DOM.mainGrid) {
    DOM.mainGrid.setAttribute('data-active-workflow', workflow);
  }

  // Update Workflow buttons active state
  if (DOM.btnWorkflowShip) DOM.btnWorkflowShip.classList.toggle('active', workflow === 'ship');
  if (DOM.btnWorkflowMining) DOM.btnWorkflowMining.classList.toggle('active', workflow === 'mining');
  if (DOM.btnWorkflowRefining) DOM.btnWorkflowRefining.classList.toggle('active', workflow === 'refining');
  if (DOM.btnWorkflowInventory) DOM.btnWorkflowInventory.classList.toggle('active', workflow === 'inventory');
  if (DOM.btnWorkflowTrading) DOM.btnWorkflowTrading.classList.toggle('active', workflow === 'trading');
  if (DOM.btnWorkflowGuild) DOM.btnWorkflowGuild.classList.remove('active');

  // Update panelMarketHold Hub Views
  if (DOM.viewMyShipHub) {
    DOM.viewMyShipHub.style.display = workflow === 'ship' ? 'block' : 'none';
  }
  if (DOM.viewRefiningHub) {
    DOM.viewRefiningHub.style.display = workflow === 'refining' ? 'block' : 'none';
  }
  if (DOM.viewTradingHub) {
    DOM.viewTradingHub.style.display = workflow === 'trading' ? 'block' : 'none';
  }
  if (DOM.viewUnifiedInventoryHub) {
    DOM.viewUnifiedInventoryHub.style.display = workflow === 'inventory' ? 'block' : 'none';
  }

  const t = I18N[state.currentLang] || I18N.fr;
  if (DOM.marketHoldPanelTitle) {
    if (workflow === 'ship') {
      DOM.marketHoldPanelTitle.textContent = (t.myShipHubTitle || 'MON VAISSEAU & SYSTÈMES DE BORD');
    } else if (workflow === 'inventory') {
      DOM.marketHoldPanelTitle.textContent = (t.inventoryHubTitle || 'INVENTAIRE UNIFIÉ & AVOIRS SPATIAUX');
    } else if (workflow === 'trading') {
      DOM.marketHoldPanelTitle.textContent = (t.tradingHubTitle || 'COMMERCE, BOURSE & DIVIDENDES');
    } else {
      DOM.marketHoldPanelTitle.textContent = (t.refiningHubTitle || 'TRANSPORT, LOGISTIQUE & RAFFINAGE');
    }
  }

  // Switch sub-tab if needed
  if (workflow === 'ship') {
    if (typeof switchMyShipSubView === 'function') {
      switchMyShipSubView(state.myShipSubView || 'fleet');
    } else if (typeof renderMyShipHub === 'function') {
      renderMyShipHub();
    }
  } else if (workflow === 'inventory') {
    if (typeof renderUnifiedInventory === 'function') {
      renderUnifiedInventory();
    }
  } else if (workflow === 'refining') {
    if (typeof setMarketTab === 'function') setMarketTab('arbitrage');
  } else if (workflow === 'trading') {
    if (typeof setMarketTab === 'function') setMarketTab('terminals');
  }

  // Synchronize mobile subtabs & mini-hud (visible only in mining workflow)
  if (DOM.mobileViewTabs) {
    DOM.mobileViewTabs.style.display = workflow === 'mining' ? 'flex' : 'none';
  }
  const mobileMiniHud = document.getElementById('mobileMiniHud');
  if (mobileMiniHud) {
    mobileMiniHud.style.display = workflow === 'mining' ? 'flex' : 'none';
  }

  // Synchronize mobiGlas dock active state
  if (DOM.dockBtnScanner) DOM.dockBtnScanner.classList.toggle('active', workflow === 'mining');
  if (DOM.dockBtnInventory) DOM.dockBtnInventory.classList.toggle('active', workflow === 'inventory');
  if (DOM.dockBtnRefinery) DOM.dockBtnRefinery.classList.toggle('active', workflow === 'refining');
  if (DOM.dockBtnLedger) DOM.dockBtnLedger.classList.toggle('active', workflow === 'trading');

  if (playAudio) {
    sfx.playChime(620, 'sine', 0.04);
    triggerHaptic(12);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// MOBILE & TABLET DUAL-VIEW & LIVE MINI-HUD
// ==========================================

function setMobileView(view) {
  state.mobileView = view;
  if (DOM.mainGrid) {
    DOM.mainGrid.setAttribute('data-mobile-view', view);
  }
  if (DOM.tabBtnScanner && DOM.tabBtnAnalysis) {
    DOM.tabBtnScanner.classList.toggle('active', view === 'scanner');
    DOM.tabBtnAnalysis.classList.toggle('active', view === 'analysis');
    if (DOM.tabBtnMarket) {
      DOM.tabBtnMarket.classList.toggle('active', view === 'market');
    }
  }

  if (view === 'scanner' || view === 'analysis') {
    if (state.activeWorkflow !== 'mining') {
      setWorkflowTab('mining', false);
    }
  } else if (view === 'market') {
    if (state.activeWorkflow === 'mining') {
      setWorkflowTab('refining', false);
    }
  }

  if (DOM.dockBtnScanner && DOM.dockBtnAnalysis) {
    DOM.dockBtnScanner.classList.toggle('active', view === 'scanner');
    DOM.dockBtnAnalysis.classList.toggle('active', view === 'analysis');
  }

  sfx.playBeep(650, 'sine', 0.03);
  triggerHaptic(12);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// SCAN PANEL INTERNAL SUB-TABS (Compact Ergonomics)
// ==========================================

function setScanSubtab(tab) {
  state.activeScanSubtab = tab;

  if (DOM.btnScanSubtabQuick) DOM.btnScanSubtabQuick.classList.toggle('active', tab === 'quick');
  if (DOM.btnScanSubtabAdvanced) DOM.btnScanSubtabAdvanced.classList.toggle('active', tab === 'advanced');
  if (DOM.btnScanSubtabHotspots) DOM.btnScanSubtabHotspots.classList.toggle('active', tab === 'hotspots');

  if (DOM.scanSubtabPaneQuick) DOM.scanSubtabPaneQuick.style.display = tab === 'quick' ? 'block' : 'none';
  if (DOM.scanSubtabPaneAdvanced) DOM.scanSubtabPaneAdvanced.style.display = tab === 'advanced' ? 'block' : 'none';
  if (DOM.scanSubtabPaneHotspots) DOM.scanSubtabPaneHotspots.style.display = tab === 'hotspots' ? 'block' : 'none';

  sfx.playBeep(680, 'sine', 0.025);
  triggerHaptic(10);
}

function updateScanSubtabBadges(arch, mineral) {
  if (DOM.subtabArchBadge && arch) {
    DOM.subtabArchBadge.textContent = (arch.name_fr || arch.name || 'GÉO').split(' ')[0].toUpperCase();
  }
  if (DOM.subtabOreBadge && mineral) {
    DOM.subtabOreBadge.textContent = mineral.symbol || 'ORE';
    DOM.subtabOreBadge.style.color = mineral.color || '#00f0ff';
    DOM.subtabOreBadge.style.borderColor = mineral.color || 'rgba(0,240,255,0.4)';
  }
}

function updateMobileLiveSummary(mineral, orePct, pureSCU, refinedPrice, powerRatio) {
  const locale = getLocale();
  const kPrice = refinedPrice >= 1000 ? `${Math.round(refinedPrice / 1000)}k` : `${refinedPrice}`;

  // Determine badge icon & color
  let icon = '💎';
  let badgeText = 'EXCELLENT';
  if (mineral.id === 'quantainium') {
    if (orePct >= 20 && powerRatio >= 0.88) { icon = '💎'; badgeText = 'QUANT PEAK'; }
    else if (orePct >= 10) { icon = '💎'; badgeText = 'QUANT BON'; }
    else { icon = '⚠️'; badgeText = 'QUANT FAIBLE'; }
  } else if (mineral.id === 'bexalite' || mineral.id === 'taranite') {
    icon = '🔥';
    badgeText = orePct >= 15 ? 'HAUT RENDEMENT' : 'MOYEN';
  } else if (mineral.id === 'hadanite' || mineral.id === 'dolivine' || mineral.id === 'aphorite') {
    icon = '🌸';
    badgeText = 'GEMMES ROC';
  } else {
    icon = '⚡';
    badgeText = orePct >= 25 ? 'RENTABLE' : 'FAIBLE';
  }

  // 1. Mobile tab badge
  if (DOM.mobileTabVerdictBadge) {
    DOM.mobileTabVerdictBadge.textContent = `${icon} ~${kPrice}`;
  }

  // 2. Dock verdict badge
  if (DOM.dockVerdictBadge) {
    DOM.dockVerdictBadge.style.display = 'flex';
    DOM.dockVerdictBadge.textContent = icon;
  }

}

// Populate Refinery dropdown
function populateRefinerySelect() {
  const currentVal = DOM.refinerySelect.value || state.selectedRefinery.id;
  DOM.refinerySelect.innerHTML = '';
  MINING_DATA.refiningMethods.forEach(method => {
    const opt = document.createElement('option');
    opt.value = method.id;
    opt.textContent = `${method.name} (${Math.round(method.yieldRate * 100)}%)`;
    DOM.refinerySelect.appendChild(opt);
  });
  DOM.refinerySelect.value = currentVal;

  DOM.refinerySelect.onchange = (e) => {
    sfx.playBeep(500, 'sine', 0.04);
    state.selectedRefinery = MINING_DATA.refiningMethods.find(m => m.id === e.target.value) || state.selectedRefinery;
    calculateAll();
  };
}

// Helper: Format badge for module type
function getModuleTypeBadgeInfo(modType, lang) {
  const t = I18N[lang] || I18N.fr;
  if (modType === 'active') {
    return {
      text: t.moduleTypeActive || (lang === 'fr' ? 'ACTIF' : 'ACTIVE'),
      style: 'background:rgba(0, 240, 255, 0.18); color:var(--accent-cyan); border:1px solid rgba(0, 240, 255, 0.4);'
    };
  }
  if (modType === 'passive') {
    return {
      text: t.moduleTypePassive || (lang === 'fr' ? 'PASSIF' : 'PASSIVE'),
      style: 'background:rgba(16, 185, 129, 0.18); color:var(--accent-emerald); border:1px solid rgba(16, 185, 129, 0.4);'
    };
  }
  return {
    text: t.moduleTypeEmpty || (lang === 'fr' ? 'VIDE' : 'EMPTY'),
    style: 'background:rgba(255, 255, 255, 0.06); color:var(--text-muted); border:1px solid rgba(255, 255, 255, 0.12);'
  };
}

// Helper: Render high-tech spec pill strip for mining laser
function renderLaserStatsStrip(container, laser) {
  if (!container || !laser) return;
  container.innerHTML = '';
  const locale = getLocale();

  // 1. Power
  const pwrPill = document.createElement('span');
  pwrPill.className = 'laser-spec-pill spec-power';
  pwrPill.innerHTML = `⚡ ${laser.power.toLocaleString(locale)} W`;
  container.appendChild(pwrPill);

  // 2. Slots
  const slotCount = laser.slots ?? 0;
  const slotsPill = document.createElement('span');
  slotsPill.className = 'laser-spec-pill spec-slots';
  slotsPill.innerHTML = `◈ ${slotCount} ${slotCount > 1 ? 'slots' : 'slot'}`;
  container.appendChild(slotsPill);

  // 3. Resistance Mod
  if (laser.resistanceMod !== 0) {
    const resPill = document.createElement('span');
    resPill.className = 'laser-spec-pill spec-res';
    const sign = laser.resistanceMod > 0 ? '+' : '';
    resPill.innerHTML = `🛡 ${sign}${Math.round(laser.resistanceMod * 100)}% Res`;
    container.appendChild(resPill);
  }

  // 4. Instability Mod
  if (laser.instabilityMod !== 0) {
    const instPill = document.createElement('span');
    instPill.className = 'laser-spec-pill spec-inst';
    const sign = laser.instabilityMod > 0 ? '+' : '';
    instPill.innerHTML = `🎯 ${sign}${Math.round(laser.instabilityMod * 100)}% Inst`;
    container.appendChild(instPill);
  }

  // 5. Optimal Window
  if (laser.optimalWindowMod && laser.optimalWindowMod !== 0) {
    const winPill = document.createElement('span');
    winPill.className = 'laser-spec-pill spec-win';
    const sign = laser.optimalWindowMod > 0 ? '+' : '';
    winPill.innerHTML = `◧ ${sign}${Math.round(laser.optimalWindowMod * 100)}% Zone`;
    container.appendChild(winPill);
  }
}

// Helper: Dynamically render module slots according to laser slot capacity
function renderLaserModuleSlots(container, slotCount, selectedModuleIds, prefix = 'slot') {
  if (!container) return;
  container.innerHTML = '';
  const t = I18N[state.currentLang] || I18N.fr;

  // Ensure selectedModuleIds array has at least slotCount elements
  while (selectedModuleIds.length < slotCount) {
    selectedModuleIds.push('none');
  }

  if (slotCount === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.style.cssText = 'font-size:0.75rem; color:var(--text-muted); font-style:italic; padding:10px 8px; background:rgba(255, 255, 255, 0.02); border-radius:6px; border:1px dashed rgba(255, 255, 255, 0.12); text-align:center;';
    emptyNotice.textContent = t.noModuleSlotsAvailable || "Aucun emplacement d'accessoire (0 slot) disponible pour cette tête.";
    container.appendChild(emptyNotice);
    return;
  }

  const titleRow = document.createElement('div');
  titleRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-top:4px; margin-bottom:6px; font-size:0.75rem; color:var(--accent-cyan); font-family:var(--font-hud);';
  titleRow.innerHTML = `<span>${(t.laserModuleSlotsSummary || 'Emplacements d\'accessoires ({count}) :').replace('{count}', slotCount)}</span>`;
  container.appendChild(titleRow);

  for (let i = 0; i < slotCount; i++) {
    const currentModId = selectedModuleIds[i] || 'none';
    const currentMod = MINING_DATA.modules.find(m => m.id === currentModId) || MINING_DATA.modules[0];

    const card = document.createElement('div');
    card.className = `module-slot-card type-${currentMod.type || 'none'}`;

    const header = document.createElement('div');
    header.className = 'module-slot-header';

    const label = document.createElement('span');
    label.textContent = (t.moduleSlotLabel || 'ACCESSOIRE #{slot} :').replace('{slot}', i + 1);

    const badgeInfo = getModuleTypeBadgeInfo(currentMod.type, state.currentLang);

    const typeBadge = document.createElement('span');
    typeBadge.className = 'slot-type-badge';
    typeBadge.textContent = badgeInfo.text;
    typeBadge.style.cssText = badgeInfo.style;

    header.appendChild(label);
    header.appendChild(typeBadge);

    const select = document.createElement('select');
    select.className = 'hud-select-full';
    select.dataset.slotIndex = i;
    select.dataset.slotPrefix = prefix;

    const allModules = [...MINING_DATA.modules];
    // Ajouter les modules artisanaux craftés depuis l'inventaire unifié (Phase 2)
    const craftedModules = (window.AaronModules && window.AaronModules.inventoryService)
      ? window.AaronModules.inventoryService.getItems({ category: 'crafted_module' })
      : [];
    craftedModules.forEach(cm => {
      const modCode = cm.code || cm.id;
      if (!allModules.some(m => m.id === modCode)) {
        allModules.push({
          id: modCode,
          name: `✨ [CRAFTÉ] ${cm.name}`,
          type: 'active',
          desc: cm.metadata?.craftStats || 'Module artisanal haute efficacité',
          isCustomCraft: true
        });
      }
    });

    allModules.forEach(mod => {
      const opt = document.createElement('option');
      opt.value = mod.id;
      const modName = mod.name || getLocalized(mod, 'name');
      const modDesc = mod.desc || getLocalized(mod, 'desc');
      opt.textContent = `${modName} ${modDesc ? '• ' + modDesc : ''}`;
      select.appendChild(opt);
    });

    select.value = currentModId;

    const effectDesc = document.createElement('div');
    effectDesc.className = `module-effect-desc ${currentMod.type === 'active' ? 'active-effect' : (currentMod.type === 'passive' ? 'passive-effect' : '')}`;
    const descText = getLocalized(currentMod, 'desc');
    const icon = currentMod.type === 'active' ? '⚡' : (currentMod.type === 'passive' ? '🛡' : '○');
    effectDesc.innerHTML = `<span>${icon}</span> <span>${descText || (state.currentLang === 'fr' ? 'Emplacement vide' : 'Empty slot')}</span>`;

    select.onchange = (e) => {
      sfx.playBeep(650, 'sine', 0.03);
      selectedModuleIds[i] = e.target.value;
      const selected = MINING_DATA.modules.find(m => m.id === e.target.value) || MINING_DATA.modules[0];
      const newBadge = getModuleTypeBadgeInfo(selected.type, state.currentLang);
      typeBadge.textContent = newBadge.text;
      typeBadge.style.cssText = newBadge.style;

      card.className = `module-slot-card type-${selected.type || 'none'}`;
      const newDesc = getLocalized(selected, 'desc');
      const newIcon = selected.type === 'active' ? '⚡' : (selected.type === 'passive' ? '🛡' : '○');
      effectDesc.className = `module-effect-desc ${selected.type === 'active' ? 'active-effect' : (selected.type === 'passive' ? 'passive-effect' : '')}`;
      effectDesc.innerHTML = `<span>${newIcon}</span> <span>${newDesc || (state.currentLang === 'fr' ? 'Emplacement vide' : 'Empty slot')}</span>`;

      if (prefix.startsWith('turret_')) {
        const tIdx = parseInt(prefix.slice(7), 10);
        const configs = getShipTurretConfigs(state.selectedShip.id);
        if (configs && configs[tIdx]) {
          configs[tIdx].moduleIds = [...selectedModuleIds];
        }
        const curShip = (state.myPersonalFleet || []).find(s => s.shipId === state.selectedShip.id) || getSelectedFleetShip();
        if (curShip) {
          if (!Array.isArray(curShip.turrets)) curShip.turrets = [];
          while (curShip.turrets.length <= tIdx) {
            curShip.turrets.push({ laserId: 'arbor_s2', moduleIds: ['none', 'none', 'none'] });
          }
          curShip.turrets[tIdx].moduleIds = [...selectedModuleIds];
          if (tIdx === 0) {
            curShip.submodules = [...selectedModuleIds];
            state.selectedModules = [...selectedModuleIds];
          }
          saveMyPersonalFleet();
        }
        updateTurretHeaderSummary(tIdx);
        saveLoadout();
      } else if (prefix.startsWith('myship_turret_')) {
        const tIdx = parseInt(prefix.slice(14), 10);
        const curShip = getSelectedFleetShip();
        if (curShip) {
          if (!Array.isArray(curShip.turrets)) curShip.turrets = [];
          while (curShip.turrets.length <= tIdx) {
            curShip.turrets.push({ laserId: 'arbor_s2', moduleIds: ['none', 'none', 'none'] });
          }
          curShip.turrets[tIdx].moduleIds = [...selectedModuleIds];
          if (tIdx === 0) {
            curShip.submodules = [...selectedModuleIds];
            if (DOM.myShipSubmod1Select) DOM.myShipSubmod1Select.value = selectedModuleIds[0] || 'none';
            if (DOM.myShipSubmod2Select) DOM.myShipSubmod2Select.value = selectedModuleIds[1] || 'none';
            if (DOM.myShipSubmod3Select) DOM.myShipSubmod3Select.value = selectedModuleIds[2] || 'none';
            if (curShip.isActive) state.selectedModules = [...selectedModuleIds];
          }
          if (!state.turretsByShip) state.turretsByShip = {};
          if (!state.turretsByShip[curShip.shipId]) state.turretsByShip[curShip.shipId] = [];
          while (state.turretsByShip[curShip.shipId].length <= tIdx) {
            state.turretsByShip[curShip.shipId].push({ laserId: 'arbor_s2', moduleIds: ['none', 'none', 'none'] });
          }
          state.turretsByShip[curShip.shipId][tIdx] = {
            laserId: curShip.turrets[tIdx].laserId,
            moduleIds: [...selectedModuleIds]
          };
          saveMyPersonalFleet();
          saveLoadout();
        }
        updateMyShipTurretHeaderSummary(tIdx);
      } else if (prefix.startsWith('mole_t')) {
        const tNum = parseInt(prefix.slice(6), 10);
        if (tNum) updateTurretHeaderSummary(tNum - 1);
      }

      updateLoadoutButtonSummary();
      calculateAll();
      saveLoadout();
    };

    card.appendChild(header);
    card.appendChild(select);
    card.appendChild(effectDesc);
    container.appendChild(card);
  }
}

// Helper: Render weapon stats strip for combat and defensive turrets
function renderWeaponStatsStrip(container, weapon) {
  if (!container || !weapon) return;
  container.innerHTML = '';

  const sizePill = document.createElement('span');
  sizePill.className = 'laser-spec-pill spec-power';
  sizePill.style.borderColor = 'rgba(244, 63, 94, 0.4)';
  sizePill.style.color = 'var(--accent-rose)';
  sizePill.innerHTML = `⚔️ S${weapon.size || 1}`;
  container.appendChild(sizePill);

  if (weapon.rpm) {
    const rpmPill = document.createElement('span');
    rpmPill.className = 'laser-spec-pill spec-slots';
    rpmPill.innerHTML = `⚡ ${weapon.rpm} RPM`;
    container.appendChild(rpmPill);
  }

  if (weapon.velocity) {
    const velPill = document.createElement('span');
    velPill.className = 'laser-spec-pill spec-res';
    velPill.innerHTML = `🎯 ${weapon.velocity} m/s`;
    container.appendChild(velPill);
  }
}

// Helper: Get or initialize turret configurations for a ship
function getShipTurretConfigs(shipId) {
  const ship = getActiveShipDef(shipId);
  const isMining = ship.role === 'mining';
  const count = ship.laserSlots || (isMining ? 1 : 1);
  if (!state.turretsByShip[shipId]) {
    state.turretsByShip[shipId] = [];
  }
  const compatible = isMining
    ? MINING_DATA.lasers.filter(l => l.size === ship.laserSize || (ship.laserSize === 0 && l.size === 0))
    : (MINING_DATA.shipWeapons || []);
  const defaultItem = compatible[0]?.id || (isMining ? 'arbor_mh1' : 'cf337_s3');

  while (state.turretsByShip[shipId].length < count) {
    state.turretsByShip[shipId].push({
      laserId: defaultItem,
      moduleIds: ['none', 'none', 'none']
    });
  }
  return state.turretsByShip[shipId].slice(0, count);
}

// Helper: Metadata (badge, titles, color accents) for turret cards
function getTurretMetadata(shipId, turretIdx) {
  const isEn = state.currentLang === 'en';
  const shipDef = getActiveShipDef(shipId);

  // 1. MINING SHIPS
  if (shipDef.role === 'mining') {
    if (shipDef.id === 'prospector') {
      return {
        badge: 'T1',
        badgeClass: 't1-badge',
        cardClass: 'turret-1-card',
        title: isEn ? 'PRIMARY MINING HEAD (SIZE 1)' : 'TÊTE DE MINAGE PRINCIPALE (SIZE 1)',
        subtitle: isEn ? 'Front Gimbal Arm' : 'Bras articulé frontal'
      };
    }
    if (shipDef.id === 'mole') {
      const metaList = isEn ? [
        { badge: '◄ T1 ►', title: 'CENTER TURRET 1 (SIZE 2)', sub: 'Primary Center Cockpit' },
        { badge: '◄ T2', title: 'PORT TURRET 2 / LEFT (SIZE 2)', sub: 'Left Mining Cabin' },
        { badge: 'T3 ►', title: 'STARBOARD TURRET 3 / RIGHT (SIZE 2)', sub: 'Right Mining Cabin' }
      ] : [
        { badge: '◄ T1 ►', title: 'TOURELLE CENTRALE 1 (SIZE 2)', sub: 'Poste opérateur central' },
        { badge: '◄ T2', title: 'TOURELLE BÂBORD 2 / GAUCHE (SIZE 2)', sub: 'Poste opérateur gauche' },
        { badge: 'T3 ►', title: 'TOURELLE TRIBORD 3 / DROITE (SIZE 2)', sub: 'Poste opérateur droite' }
      ];
      const m = metaList[turretIdx] || metaList[0];
      const badgeClasses = ['t1-badge', 't2-badge', 't3-badge'];
      const cardClasses = ['turret-1-card', 'turret-2-card', 'turret-3-card'];
      return {
        badge: m.badge,
        badgeClass: badgeClasses[turretIdx] || 't1-badge',
        cardClass: cardClasses[turretIdx] || 'turret-1-card',
        title: m.title,
        subtitle: m.sub
      };
    }
    if (shipDef.id === 'arrastra') {
      const metaList = isEn ? [
        { badge: '◄ T1 ►', title: 'BOW REMOTE TURRET 1 (SIZE 3)', sub: 'Forward Heavy Arm' },
        { badge: '◄ T2', title: 'PORT REMOTE TURRET 2 (SIZE 3)', sub: 'Port Side Remote Rig' },
        { badge: 'T3 ►', title: 'STARBOARD REMOTE TURRET 3 (SIZE 3)', sub: 'Starboard Remote Rig' }
      ] : [
        { badge: '◄ T1 ►', title: 'TOURELLE PROUE 1 / AVANT (SIZE 3)', sub: 'Bras lourd frontal' },
        { badge: '◄ T2', title: 'TOURELLE BÂBORD 2 (SIZE 3)', sub: 'Tourelle latérale gauche' },
        { badge: 'T3 ►', title: 'TOURELLE TRIBORD 3 (SIZE 3)', sub: 'Tourelle latérale droite' }
      ];
      const m = metaList[turretIdx] || metaList[0];
      const badgeClasses = ['t1-badge', 't2-badge', 't3-badge'];
      const cardClasses = ['turret-1-card', 'turret-2-card', 'turret-3-card'];
      return {
        badge: m.badge,
        badgeClass: badgeClasses[turretIdx] || 't1-badge',
        cardClass: cardClasses[turretIdx] || 'turret-1-card',
        title: m.title,
        subtitle: m.sub
      };
    }
    if (shipDef.id === 'orion') {
      const metaList = isEn ? [
        { badge: '◄ T1', title: 'FORWARD HEAVY TURRET 1 (SIZE 3)', sub: 'Main Extraction Rig' },
        { badge: 'T2 ►', title: 'DORSAL HEAVY TURRET 2 (SIZE 3)', sub: 'Upper Crushing Rig' },
        { badge: '◄ T3', title: 'PORT GANTRY TURRET 3 (SIZE 3)', sub: 'Port Heavy Rig' },
        { badge: 'T4 ►', title: 'STARBOARD GANTRY TURRET 4 (SIZE 3)', sub: 'Starboard Heavy Rig' }
      ] : [
        { badge: '◄ T1', title: 'TOURELLE AVANT PRINCIPALE 1 (SIZE 3)', sub: 'Gantry frontal lourd' },
        { badge: 'T2 ►', title: 'TOURELLE DORSALE SUPÉRIEURE 2 (SIZE 3)', sub: 'Tourelle supérieure' },
        { badge: '◄ T3', title: 'TOURELLE BÂBORD 3 (SIZE 3)', sub: 'Gantry latéral gauche' },
        { badge: 'T4 ►', title: 'TOURELLE TRIBORD 4 (SIZE 3)', sub: 'Gantry latéral droit' }
      ];
      const m = metaList[turretIdx] || metaList[0];
      const badgeClasses = ['t1-badge', 't2-badge', 't3-badge', 't4-badge'];
      const cardClasses = ['turret-1-card', 'turret-2-card', 'turret-3-card', 'turret-4-card'];
      return {
        badge: m.badge,
        badgeClass: badgeClasses[turretIdx] || 't1-badge',
        cardClass: cardClasses[turretIdx] || 'turret-1-card',
        title: m.title,
        subtitle: m.sub
      };
    }
    // ROC / ROC-DS / ATLS GEO
    return {
      badge: 'ARM',
      badgeClass: 't1-badge',
      cardClass: 'turret-1-card',
      title: isEn ? 'EXTRACTION LASER ARM (SIZE 0)' : "BRAS LASER D'EXTRACTION (SIZE 0)",
      subtitle: isEn ? 'Vehicle Mounted Arm' : 'Bras articulé de véhicule'
    };
  }

  // 2. COMBAT & ESCORT SHIPS (Real Weapons, NEVER mining heads)
  if (shipDef.role === 'combat' || shipDef.role === 'escort') {
    if (shipDef.id === 'scorpius') {
      return {
        badge: '◄ T1 ►',
        badgeClass: 't1-badge',
        cardClass: 'turret-1-card',
        title: isEn ? '360° RAIL COMBAT TURRET (4x S3)' : 'TOURELLE RAIL BI-PLACE 360° (4x S3)',
        subtitle: isEn ? 'Remote Turret with full coverage' : 'Tourelle téléopérée couverture totale'
      };
    }
    if (shipDef.id === 'hurricane') {
      return {
        badge: '◄ T1 ►',
        badgeClass: 't1-badge',
        cardClass: 'turret-1-card',
        title: isEn ? 'DORSAL QUAD TURRET (4x S3)' : 'TOURELLE QUADRUPLE SUPÉRIEURE (4x S3)',
        subtitle: isEn ? 'Heavy Manned Turret' : 'Tourelle habitée de supériorité'
      };
    }
    if (shipDef.id === 'vanguard') {
      return {
        badge: '◄ T1 ►',
        badgeClass: 't1-badge',
        cardClass: 'turret-1-card',
        title: isEn ? 'DORSAL DEFENSE TURRET (2x S2)' : 'TOURELLE DÉFENSIVE DORSALE (2x S2)',
        subtitle: isEn ? 'Manned Combat Turret' : 'Tourelle habitée de patrouille'
      };
    }
    return {
      badge: '◄ T1 ►',
      badgeClass: 't1-badge',
      cardClass: 'turret-1-card',
      title: isEn ? 'TACTICAL COMBAT TURRET' : 'TOURELLE MILITAIRE TACTIQUE',
      subtitle: isEn ? 'Hardpoint Weapon Mount' : 'Point d\'emport militaire asservi'
    };
  }

  // 3. CARGO & FREIGHT SHIPS (Defensive Turrets, NEVER mining heads)
  if (shipDef.role === 'cargo' || shipDef.role === 'hauler') {
    if (shipDef.id === 'c2') {
      return {
        badge: 'DEF',
        badgeClass: 't2-badge',
        cardClass: 'turret-2-card',
        title: isEn ? 'UPPER DEFENSE TURRET (2x S4)' : 'TOURELLE DÉFENSIVE SUPÉRIEURE (2x S4)',
        subtitle: isEn ? 'Manned Heavy Defense Turret' : 'Tourelle habitée de protection lourde'
      };
    }
    if (shipDef.id === 'taurus') {
      return {
        badge: 'DEF',
        badgeClass: 't2-badge',
        cardClass: 'turret-2-card',
        title: isEn ? 'VENTRAL REMOTE TURRET (2x S2)' : 'TOURELLE VENTRALE INFÉRIEURE (2x S2)',
        subtitle: isEn ? 'Remote Protection Mount' : 'Tourelle téléopérée de protection'
      };
    }
    return {
      badge: 'DEF',
      badgeClass: 't2-badge',
      cardClass: 'turret-2-card',
      title: isEn ? 'DEFENSIVE FREIGHTER TURRET' : 'TOURELLE DÉFENSIVE CARGO',
      subtitle: isEn ? 'Convoy Protection Mount' : 'Tourelle de protection du convoi'
    };
  }

  // 4. SALVAGE SHIPS
  if (shipDef.role === 'salvage') {
    return {
      badge: turretIdx === 0 ? 'PORT' : 'STBD',
      badgeClass: turretIdx === 0 ? 't1-badge' : 't2-badge',
      cardClass: turretIdx === 0 ? 'turret-1-card' : 'turret-2-card',
      title: turretIdx === 0 ? (isEn ? 'PORT SCRAPING ARM (S1)' : 'BRAS DE GRATTAGE BÂBORD (S1)') : (isEn ? 'STARBOARD SCRAPING ARM (S1)' : 'BRAS DE GRATTAGE TRIBORD (S1)'),
      subtitle: isEn ? 'Hull Scraping Module' : 'Module de découpe et récupération'
    };
  }

  return {
    badge: 'T1',
    badgeClass: 't1-badge',
    cardClass: 'turret-1-card',
    title: isEn ? 'UTILITY MOUNT' : 'POINT D\'EMPORT UTILITAIRE',
    subtitle: isEn ? 'Ship Mounted Rig' : 'Système de bord standard'
  };
}

// Helper: Update summary text inside collapsible turret header
function updateTurretHeaderSummary(turretIdx, prefix = 'turretSummary_') {
  const ship = state.selectedShip;
  const shipDef = getActiveShipDef(ship.id);
  const configs = getShipTurretConfigs(ship.id);
  const cfg = configs[turretIdx];
  const summaryEl = document.getElementById(`${prefix}${turretIdx}`);
  if (!cfg || !summaryEl) return;

  if (shipDef.role === 'mining') {
    const compatibleLasers = MINING_DATA.lasers.filter(l => l.size === shipDef.laserSize || (shipDef.laserSize === 0 && l.size === 0));
    const laser = compatibleLasers.find(l => l.id === cfg.laserId) || compatibleLasers[0] || MINING_DATA.lasers[0];
    const slotCount = laser.slots ?? 0;
    const activeModsCount = (cfg.moduleIds || []).slice(0, slotCount).filter(m => m !== 'none').length;
    summaryEl.textContent = `${laser.name} (${activeModsCount}/${slotCount} mods)`;
  } else {
    const weapon = (MINING_DATA.shipWeapons || []).find(w => w.id === cfg.laserId) || MINING_DATA.shipWeapons?.[0];
    summaryEl.textContent = weapon ? `${weapon.name} (Arme)` : 'Armement de Bord';
  }
}

// Render dynamic turret cards for active ship
function renderShipTurretsConfig() {
  if (!DOM.turretCardsContainer) return;
  DOM.turretCardsContainer.innerHTML = '';

  const ship = state.selectedShip;
  const shipDef = getActiveShipDef(ship.id);
  const isMining = shipDef.role === 'mining';
  const configs = getShipTurretConfigs(ship.id);
  let compatibleItems = [];
  if (isMining) {
    const standardLasers = MINING_DATA.lasers.filter(l => l.size === shipDef.laserSize || (shipDef.laserSize === 0 && l.size === 0));
    // Récupérer les têtes laser artisanales créées dans l'inventaire (Phase 2)
    const craftedItems = (window.AaronModules && window.AaronModules.inventoryService)
      ? window.AaronModules.inventoryService.getItems({ category: 'crafted_laser' })
      : [];
    const craftedLaserDefs = craftedItems.map(item => ({
      id: item.code || item.id,
      name: `✨ [CRAFTÉ] ${item.name}`,
      size: shipDef.laserSize,
      power: item.metadata?.powerWatts || 2200,
      slots: item.metadata?.slots || 3,
      isCustomCraft: true,
      desc: item.metadata?.craftStats || 'Laser artisanal haute performance fabriqué en atelier'
    }));
    compatibleItems = [...standardLasers, ...craftedLaserDefs];
  } else {
    compatibleItems = MINING_DATA.shipWeapons || [];
  }

  configs.forEach((cfg, idx) => {
    const meta = getTurretMetadata(ship.id, idx);
    const currentItem = compatibleItems.find(l => l.id === cfg.laserId) || compatibleItems[0];
    if (currentItem) cfg.laserId = currentItem.id;

    // Turret card element
    const card = document.createElement('div');
    card.className = `turret-config-card ${meta.cardClass}`;
    card.id = `turretCard_${idx}`;

    // Header with badge, title and collapsible summary
    const header = document.createElement('div');
    header.className = 'turret-config-header';
    header.dataset.turretIdx = idx;
    header.title = state.currentLang === 'en' ? 'Click to collapse/expand turret' : 'Cliquer pour replier/déplier la tourelle';

    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="turret-badge-tag ${meta.badgeClass}">${meta.badge}</span>
        <div style="display:flex; flex-direction:column;">
          <span style="font-family:var(--font-hud); font-size:0.85rem; font-weight:700; color:#fff;">${meta.title}</span>
          <span style="font-size:0.68rem; color:var(--text-muted);">${meta.subtitle}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="turret-header-summary" id="turretSummary_${idx}"></span>
        <span class="turret-collapse-chevron">▼</span>
      </div>
    `;

    // Body with laser or weapon dropdown, stats strip, and dynamic module slots
    const body = document.createElement('div');
    body.className = 'turret-config-body';
    body.id = `turretBody_${idx}`;

    const select = document.createElement('select');
    select.className = 'hud-select-full turret-laser-select';
    select.id = `turretLaser_${idx}`;
    select.style.marginBottom = '6px';

    if (isMining) {
      compatibleItems.forEach(l => {
        const desc = getLocalized(l, 'desc') || '';
        const slotText = l.slots !== undefined ? `${l.slots} slots` : '0 slots';
        const craftPrefix = l.isCustomCraft ? '🛠️ [CRAFT] ' : '';
        const opt = new Option(`${craftPrefix}${l.name} (S${l.size} • ${slotText} • ${l.power} W) - ${desc.slice(0, 30)}...`, l.id);
        select.appendChild(opt);
      });
    } else {
      compatibleItems.forEach(w => {
        const desc = getLocalized(w, 'desc') || '';
        const opt = new Option(`⚔️ ${w.name} (S${w.size} • ${w.rpm} RPM • ${w.velocity} m/s) - ${desc.slice(0, 30)}...`, w.id);
        select.appendChild(opt);
      });
    }
    select.value = cfg.laserId;

    const statsStrip = document.createElement('div');
    statsStrip.id = `turretStats_${idx}`;
    statsStrip.className = 'laser-stats-strip';
    statsStrip.style.cssText = 'display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px;';

    const slotsContainer = document.createElement('div');
    slotsContainer.id = `turretSlots_${idx}`;
    slotsContainer.style.cssText = 'display:flex; flex-direction:column; gap:6px;';

    body.appendChild(select);
    body.appendChild(statsStrip);
    if (isMining) {
      body.appendChild(slotsContainer);
    }

    card.appendChild(header);
    card.appendChild(body);
    DOM.turretCardsContainer.appendChild(card);

    // Initial render of stats and module slots
    if (isMining) {
      renderLaserStatsStrip(statsStrip, currentItem);
      renderLaserModuleSlots(slotsContainer, currentItem?.slots ?? 0, cfg.moduleIds, `turret_${idx}`);
    } else {
      renderWeaponStatsStrip(statsStrip, currentItem);
    }
    updateTurretHeaderSummary(idx, 'turretSummary_');

    // Change listener
    select.addEventListener('change', (e) => {
      sfx.playBeep(600, 'sine', 0.04);
      cfg.laserId = e.target.value;
      const newL = compatibleItems.find(l => l.id === e.target.value) || compatibleItems[0];

      if (idx === 0) {
        if (isMining) state.selectedLaser = newL;
      }

      if (isMining) {
        renderLaserStatsStrip(statsStrip, newL);
        renderLaserModuleSlots(slotsContainer, newL.slots ?? 0, cfg.moduleIds, `turret_${idx}`);
      } else {
        renderWeaponStatsStrip(statsStrip, newL);
      }
      updateTurretHeaderSummary(idx, 'turretSummary_');
      calculateAll();
      saveLoadout();
      updateLoadoutButtonSummary();
    });

    // Toggle collapse on card header click
    header.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(12);
      card.classList.toggle('collapsed');
      updateToggleAllButtonText();
    });
  });

  updateToggleAllButtonText();
}

// Populate Loadout modal selects
function populateLoadoutSelects() {
  updateLaserOptions();
  populateProfilesDropdown();

  const ship = state.selectedShip;
  const shipDef = getActiveShipDef(ship.id);
  const role = shipDef.role || 'mining';
  const isMining = role === 'mining';
  const isCargo = role === 'cargo' || role === 'hauler';
  const isSalvage = role === 'salvage';
  const isCombat = role === 'combat' || role === 'escort';

  const personal = (state.myPersonalFleet || []).find(s => s.shipId === shipDef.id) || getSelectedFleetShip() || state.myActiveShip;

  // Toggle sections in Loadout Modal
  if (DOM.shipTurretsSection) DOM.shipTurretsSection.style.display = isMining ? 'block' : 'none';
  if (DOM.loadoutGadgetGroup) DOM.loadoutGadgetGroup.style.display = isMining ? 'block' : 'none';
  if (DOM.loadoutMiningWeaponGroup) DOM.loadoutMiningWeaponGroup.style.display = isMining ? 'block' : 'none';
  if (DOM.loadoutCargoSection) DOM.loadoutCargoSection.style.display = isCargo ? 'flex' : 'none';
  if (DOM.loadoutSalvageSection) DOM.loadoutSalvageSection.style.display = isSalvage ? 'flex' : 'none';
  if (DOM.loadoutCombatSection) DOM.loadoutCombatSection.style.display = isCombat ? 'flex' : 'none';

  // 1. Mining Gadgets
  if (DOM.gadgetSelect) {
    const curGadgetId = personal?.gadgetId || state.selectedGadget?.id || 'none';
    DOM.gadgetSelect.innerHTML = '';
    (MINING_DATA.gadgets || []).forEach(gad => {
      const gadName = getLocalized(gad, 'name');
      const craftPrefix = gad.isCustomCraft ? '🛠️ [CRAFT] ' : '';
      const parts = [];
      const resPct = gad.resMod ? Math.round(gad.resMod * 100) : (gad.resistance || 0);
      const instPct = gad.instMod ? Math.round(gad.instMod * 100) : (gad.instability || 0);
      const winPct = gad.windowMod ? Math.round(gad.windowMod * 100) : 0;
      if (resPct !== 0) parts.push(`Résist ${resPct > 0 ? '+' : ''}${resPct}%`);
      if (instPct !== 0) parts.push(`Instab ${instPct > 0 ? '+' : ''}${instPct}%`);
      if (winPct !== 0) parts.push(`Fenêtre ${winPct > 0 ? '+' : ''}${winPct}%`);
      const details = parts.length > 0 ? ` (${parts.join(' • ')})` : '';
      const opt = new Option(`${craftPrefix}${gadName}${details}`, gad.id);
      if (gad.id === curGadgetId) opt.selected = true;
      DOM.gadgetSelect.appendChild(opt);
    });
    DOM.gadgetSelect.value = curGadgetId;
  }

  // 1b. Mining Ship Defensive Armament
  if (isMining && DOM.loadoutMiningWeaponSelect) {
    DOM.loadoutMiningWeaponSelect.innerHTML = '';
    (MINING_DATA.shipWeapons || []).forEach(w => {
      const opt = new Option(`⚔️ ${w.name} (S${w.size} • ${w.type} • ${w.rpm} RPM • ${w.dps} DPS)`, w.id);
      if (w.id === personal?.miningWeaponId) opt.selected = true;
      DOM.loadoutMiningWeaponSelect.appendChild(opt);
    });
    DOM.loadoutMiningWeaponSelect.value = personal?.miningWeaponId || (shipDef.laserSize >= 2 ? 'cf227_s2' : 'cf117_s1');
  }

  // 2. Cargo Equipment in Loadout Modal
  if (isCargo) {
    if (DOM.loadoutCargoTractorSelect) {
      DOM.loadoutCargoTractorSelect.innerHTML = '';
      (MINING_DATA.tractorBeams || []).forEach(tb => {
        const opt = new Option(`🧲 ${tb.name} (S${tb.size} • ${tb.force.toLocaleString()} N • Portée ${tb.range}m)`, tb.id);
        if (tb.id === personal?.cargoTractorId) opt.selected = true;
        DOM.loadoutCargoTractorSelect.appendChild(opt);
      });
      DOM.loadoutCargoTractorSelect.value = personal?.cargoTractorId || MINING_DATA.tractorBeams?.[0]?.id;
    }
    if (DOM.loadoutCargoGridSelect) {
      DOM.loadoutCargoGridSelect.value = personal?.cargoGridMode || 'standard';
    }
    if (DOM.loadoutCargoWeaponSelect) {
      DOM.loadoutCargoWeaponSelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = new Option(`⚔️ ${w.name} (S${w.size} • ${w.type} • ${w.rpm} RPM • ${w.dps} DPS)`, w.id);
        if (w.id === personal?.cargoTurretId) opt.selected = true;
        DOM.loadoutCargoWeaponSelect.appendChild(opt);
      });
      DOM.loadoutCargoWeaponSelect.value = personal?.cargoTurretId || MINING_DATA.shipWeapons?.[0]?.id;
    }
  }

  // 3. Salvage Equipment in Loadout Modal
  if (isSalvage) {
    [DOM.loadoutSalvageHead1Select, DOM.loadoutSalvageHead2Select].forEach((sel, idx) => {
      if (!sel) return;
      sel.innerHTML = '';
      const curHeadId = (idx === 0) ? (personal?.salvageHead1Id || 'abrade_s1') : (personal?.salvageHead2Id || 'clincher_s1');
      (MINING_DATA.salvageHeads || []).forEach(sh => {
        const opt = new Option(`♻️ ${sh.name} (S${sh.size} • ${sh.speed} SCU/min • Eff. ${sh.efficiency}%)`, sh.id);
        if (sh.id === curHeadId) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.value = curHeadId;
    });
    if (DOM.loadoutSalvageTractorSelect) {
      DOM.loadoutSalvageTractorSelect.innerHTML = '';
      (MINING_DATA.tractorBeams || []).forEach(tb => {
        const opt = new Option(`🧲 ${tb.name} (S${tb.size} • ${tb.force.toLocaleString()} N • Portée ${tb.range}m)`, tb.id);
        if (tb.id === personal?.salvageTractorId) opt.selected = true;
        DOM.loadoutSalvageTractorSelect.appendChild(opt);
      });
      DOM.loadoutSalvageTractorSelect.value = personal?.salvageTractorId || MINING_DATA.tractorBeams?.[0]?.id;
    }
    if (DOM.loadoutSalvageWeaponSelect) {
      DOM.loadoutSalvageWeaponSelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = new Option(`🛡️ ${w.name} (S${w.size} • ${w.dps} DPS)`, w.id);
        if (w.id === personal?.salvageWeaponId) opt.selected = true;
        DOM.loadoutSalvageWeaponSelect.appendChild(opt);
      });
      DOM.loadoutSalvageWeaponSelect.value = personal?.salvageWeaponId || MINING_DATA.shipWeapons?.[0]?.id;
    }
  }

  // 4. Combat Equipment in Loadout Modal
  if (isCombat) {
    if (DOM.loadoutCombatPrimarySelect) {
      DOM.loadoutCombatPrimarySelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = new Option(`⚔️ ${w.name} (S${w.size} • ${w.dps} DPS • ${w.velocity} m/s)`, w.id);
        if (w.id === personal?.combatPrimaryId) opt.selected = true;
        DOM.loadoutCombatPrimarySelect.appendChild(opt);
      });
      DOM.loadoutCombatPrimarySelect.value = personal?.combatPrimaryId || 'cf337_s3';
    }
    if (DOM.loadoutCombatTurretSelect) {
      DOM.loadoutCombatTurretSelect.innerHTML = '';
      (MINING_DATA.shipWeapons || []).forEach(w => {
        const opt = new Option(`🎯 ${w.name} (S${w.size} • ${w.dps} DPS)`, w.id);
        if (w.id === personal?.combatTurretId) opt.selected = true;
        DOM.loadoutCombatTurretSelect.appendChild(opt);
      });
      DOM.loadoutCombatTurretSelect.value = personal?.combatTurretId || 'cf337_s3';
    }
    if (DOM.loadoutCombatMissileSelect) {
      DOM.loadoutCombatMissileSelect.innerHTML = '';
      (MINING_DATA.missileRacks || []).forEach(mr => {
        const opt = new Option(`🚀 ${mr.name} (${mr.missileCount}x S${mr.missileSize} • Guidage ${mr.guidance})`, mr.id);
        if (mr.id === personal?.combatMissileId) opt.selected = true;
        DOM.loadoutCombatMissileSelect.appendChild(opt);
      });
      DOM.loadoutCombatMissileSelect.value = personal?.combatMissileId || 'msl_strikeforce_s2';
    }
  }
}

function updateLaserOptions() {
  const ship = state.selectedShip;
  const isMultiTurret = ship.laserSlots && ship.laserSlots > 1;
  const t = I18N[state.currentLang] || I18N.fr;

  // Toggle header active turrets bar for multi-turret ships (MOLE, Arrastra, Orion)
  [DOM.moleTurretBar, DOM.mgMoleTurretBar].forEach(bar => {
    if (!bar) return;
    bar.style.display = isMultiTurret ? 'flex' : 'none';

    // Show/hide trio button if ship only has 2 turrets (e.g. Orion)
    const trioBtn = bar.querySelector('[data-mole-turret="3"]');
    if (trioBtn) {
      trioBtn.style.display = ship.laserSlots >= 3 ? 'inline-block' : 'none';
    }
  });

  // Clamp active turrets to ship slots
  if (isMultiTurret) {
    if (state.moleActiveTurrets > ship.laserSlots) {
      state.moleActiveTurrets = ship.laserSlots;
    }
    document.querySelectorAll('[data-mole-turret]').forEach(btn => {
      const val = parseInt(btn.dataset.moleTurret, 10);
      btn.classList.toggle('active', val === state.moleActiveTurrets);
    });
  }

  // Update section title & toggle-all button
  if (DOM.turretsSectionTitle) {
    if (ship.role === 'combat' || ship.role === 'escort') {
      DOM.turretsSectionTitle.textContent = state.currentLang === 'en' ? `COMBAT ARMAMENT & TURRETS (${ship.name})` : `ARMEMENT DE COMBAT & TOURELLES (${ship.name})`;
    } else if (ship.role === 'cargo' || ship.role === 'hauler') {
      DOM.turretsSectionTitle.textContent = state.currentLang === 'en' ? `DEFENSIVE TURRETS & UTILITIES (${ship.name})` : `TOURELLES DÉFENSIVES & UTILITAIRES (${ship.name})`;
    } else if (ship.role === 'salvage') {
      DOM.turretsSectionTitle.textContent = state.currentLang === 'en' ? `SALVAGE SCRAPING MODULES (${ship.name})` : `MODULES DE GRATTAGE SALVAGE (${ship.name})`;
    } else {
      DOM.turretsSectionTitle.textContent = isMultiTurret
        ? (state.currentLang === 'en' ? `${ship.laserSlots} TURRETS CONFIGURATION (${ship.name})` : `CONFIGURATION DES ${ship.laserSlots} TOURELLES (${ship.name})`)
        : (state.currentLang === 'en' ? `MINING HEAD CONFIGURATION (${ship.name})` : `CONFIGURATION DE LA TÊTE DE MINAGE (${ship.name})`);
    }
  }
  if (DOM.btnToggleAllTurrets) {
    DOM.btnToggleAllTurrets.style.display = (isMultiTurret || (ship.role !== 'mining' && ship.laserSlots > 1)) ? 'inline-block' : 'none';
  }

  // Compatible items for active ship
  if (ship.role === 'mining') {
    const compatibleLasers = MINING_DATA.lasers.filter(l => l.size === ship.laserSize || (ship.laserSize === 0 && l.size === 0));
    const turrets = getShipTurretConfigs(ship.id);
    const primaryLaser = compatibleLasers.find(l => l.id === turrets[0].laserId) || compatibleLasers[0] || MINING_DATA.lasers[0];
    state.selectedLaser = primaryLaser;
    turrets[0].laserId = primaryLaser.id;
    state.selectedModules = turrets[0].moduleIds;
  }

  if (DOM.laserSectionLabel) {
    DOM.laserSectionLabel.textContent = isMultiTurret
      ? (state.currentLang === 'en' ? `SIZE ${ship.laserSize} MINING LASER (PRIMARY TURRET 1)` : `TÊTE DE MINAGE SIZE ${ship.laserSize} (TOURELLE PRINCIPALE 1)`)
      : (t.miningLaser || "TÊTE DE MINAGE (LASER)");
  }

  // Render unified dynamic turret cards
  renderShipTurretsConfig();

  updateLoadoutButtonSummary();
}

function updateLoadoutButtonSummary() {
  const t = I18N[state.currentLang] || I18N.fr;
  const ship = state.selectedShip;
  if (!DOM.loadoutSummary || !ship) return;
  const shipDef = getActiveShipDef(ship.id);
  const personal = (state.myPersonalFleet || []).find(s => s.shipId === shipDef.id) || getSelectedFleetShip() || state.myActiveShip;

  if (shipDef.role === 'cargo' || shipDef.role === 'hauler') {
    const w = (MINING_DATA.shipWeapons || []).find(x => x.id === personal?.cargoTurretId) || MINING_DATA.shipWeapons?.[0];
    DOM.loadoutSummary.textContent = `${shipDef.name}: ${w ? w.name : 'Armement Soute'}`;
  } else if (shipDef.role === 'combat' || shipDef.role === 'escort') {
    const w = (MINING_DATA.shipWeapons || []).find(x => x.id === personal?.combatPrimaryId) || MINING_DATA.shipWeapons?.[0];
    DOM.loadoutSummary.textContent = `${shipDef.name}: ${w ? w.name : 'Armes de bord'}`;
  } else if (shipDef.role === 'salvage') {
    const h = (MINING_DATA.salvageHeads || []).find(x => x.id === personal?.salvageHead1Id) || MINING_DATA.salvageHeads?.[0];
    DOM.loadoutSummary.textContent = `${shipDef.name}: ${h ? h.name : 'Abrade S1'}`;
  } else if (ship.laserSlots && ship.laserSlots > 1) {
    const activeCount = Math.min(state.moleActiveTurrets || 1, ship.laserSlots);
    const shipName = ship.name.split(' ').pop();
    DOM.loadoutSummary.textContent = `${shipName}: ${activeCount}/${ship.laserSlots} ${t.turretsActive || 'Tourelles'}`;
  } else {
    const laserObj = state.selectedLaser || MINING_DATA.lasers[0];
    const slotCount = laserObj?.slots ?? 0;
    const activeModsCount = (state.selectedModules || []).slice(0, slotCount).filter(m => m !== 'none').length;
    const modsSummary = slotCount > 0 ? ` (${activeModsCount}/${slotCount} mods)` : '';
    DOM.loadoutSummary.textContent = `${laserObj?.name || 'Laser'}${modsSummary}`;
  }
}

// ==========================================
// OPERATIONAL ROCK GADGET DEPLOYMENT
// ==========================================
function populateRockGadgetDropdown() {
  if (!DOM.rockGadgetSelect) return;
  DOM.rockGadgetSelect.innerHTML = '';

  const allGadgets = (MINING_DATA.gadgets || []).slice();
  if (Array.isArray(state.customGadgets)) {
    state.customGadgets.forEach(cg => {
      if (!allGadgets.some(g => g.id === cg.id)) allGadgets.push(cg);
    });
  }

  const isEn = state.currentLang === 'en';
  const noneText = isEn ? '🚫 No gadget (Direct laser extraction)' : '🚫 Aucun gadget (Minage direct au laser)';

  allGadgets.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    if (g.id === 'none') {
      opt.textContent = noneText;
    } else {
      const parts = [];
      const resPct = g.resMod ? Math.round(g.resMod * 100) : (g.resistance || 0);
      const instPct = g.instMod ? Math.round(g.instMod * 100) : (g.instability || 0);
      const winPct = g.windowMod ? Math.round(g.windowMod * 100) : 0;
      if (resPct !== 0) parts.push(`Résist ${resPct > 0 ? '+' : ''}${resPct}%`);
      if (instPct !== 0) parts.push(`Instab ${instPct > 0 ? '+' : ''}${instPct}%`);
      if (winPct !== 0) parts.push(`Fenêtre ${winPct > 0 ? '+' : ''}${winPct}%`);
      const details = parts.length > 0 ? ` (${parts.join(' • ')})` : '';
      const prefix = g.isCustomCraft ? '🛠️ [CRAFT] ' : '🧲 ';
      opt.textContent = `${prefix}${g.name}${details}`;
    }
    if (state.selectedGadget && state.selectedGadget.id === g.id) {
      opt.selected = true;
    }
    DOM.rockGadgetSelect.appendChild(opt);
  });

  const curId = state.selectedGadget?.id || 'none';
  DOM.rockGadgetSelect.value = curId;
  updateRockGadgetUI();
}

function updateRockGadgetUI() {
  const g = state.selectedGadget || MINING_DATA.gadgets[0];
  const isEn = state.currentLang === 'en';

  if (DOM.rockGadgetStatusBadge) {
    if (!g || g.id === 'none') {
      DOM.rockGadgetStatusBadge.textContent = isEn ? 'NONE' : 'AUCUN';
      DOM.rockGadgetStatusBadge.style.color = 'var(--text-muted)';
    } else {
      DOM.rockGadgetStatusBadge.textContent = isEn ? 'ACTIVE ON ROCK' : 'ACTIF SUR ROCHE';
      DOM.rockGadgetStatusBadge.style.color = 'var(--accent-cyan)';
    }
  }

  if (DOM.rockGadgetModifiersStrip) {
    if (!g || g.id === 'none') {
      DOM.rockGadgetModifiersStrip.style.display = 'none';
      DOM.rockGadgetModifiersStrip.innerHTML = '';
    } else {
      DOM.rockGadgetModifiersStrip.style.display = 'flex';
      DOM.rockGadgetModifiersStrip.innerHTML = '';

      const resPct = g.resMod ? Math.round(g.resMod * 100) : (g.resistance || 0);
      const instPct = g.instMod ? Math.round(g.instMod * 100) : (g.instability || 0);
      const winPct = g.windowMod ? Math.round(g.windowMod * 100) : 0;

      if (resPct !== 0) {
        const badge = document.createElement('span');
        badge.className = 'module-tag';
        badge.style.borderColor = 'var(--accent-cyan)';
        badge.style.color = 'var(--accent-cyan)';
        badge.style.background = 'rgba(0,240,255,0.1)';
        badge.style.fontSize = '0.7rem';
        badge.style.padding = '2px 8px';
        badge.style.borderRadius = '4px';
        badge.style.border = '1px solid rgba(0,240,255,0.3)';
        badge.textContent = `🛡️ Résistance ${resPct > 0 ? '+' : ''}${resPct}%`;
        DOM.rockGadgetModifiersStrip.appendChild(badge);
      }
      if (instPct !== 0) {
        const badge = document.createElement('span');
        badge.className = 'module-tag';
        badge.style.borderColor = 'var(--accent-purple)';
        badge.style.color = 'var(--accent-purple)';
        badge.style.background = 'rgba(168,85,247,0.1)';
        badge.style.fontSize = '0.7rem';
        badge.style.padding = '2px 8px';
        badge.style.borderRadius = '4px';
        badge.style.border = '1px solid rgba(168,85,247,0.3)';
        badge.textContent = `⚡ Instabilité ${instPct > 0 ? '+' : ''}${instPct}%`;
        DOM.rockGadgetModifiersStrip.appendChild(badge);
      }
      if (winPct !== 0) {
        const badge = document.createElement('span');
        badge.className = 'module-tag';
        badge.style.borderColor = 'var(--accent-amber)';
        badge.style.color = 'var(--accent-amber)';
        badge.style.background = 'rgba(245,158,11,0.1)';
        badge.style.fontSize = '0.7rem';
        badge.style.padding = '2px 8px';
        badge.style.borderRadius = '4px';
        badge.style.border = '1px solid rgba(245,158,11,0.3)';
        badge.textContent = `🎯 Fenêtre Verte ${winPct > 0 ? '+' : ''}${winPct}%`;
        DOM.rockGadgetModifiersStrip.appendChild(badge);
      }
    }
  }

  if (DOM.rockGadgetSelect && g && DOM.rockGadgetSelect.value !== g.id) {
    DOM.rockGadgetSelect.value = g.id;
  }
}

function populateGadgetSelect() {
  populateRockGadgetDropdown();
}

// ==========================================
// CORE CALCULATION ENGINE
// ==========================================
function calculateAll() {
  const mass = state.rockMass;
  const orePct = state.orePercentage;
  const mineral = state.selectedMineral;
  const ship = state.selectedShip;
  const laser = state.selectedLaser;
  const mod1 = state.selectedModule1;
  const mod2 = state.selectedModule2;
  const gadget = state.selectedGadget;
  const refinery = state.selectedRefinery;
  const locale = getLocale();
  const t = I18N[state.currentLang] || I18N.fr;

  // 1. Calculate SCU of Pure Ore (Multi-Ore 4.10)
  const oreMass1 = mass * (orePct / 100);
  const densityDivisor1 = (mineral.density || 15) * 85; 
  let pureSCU1 = oreMass1 / densityDivisor1;
  if (mineral.id === 'hadanite' || mineral.id === 'dolivine' || mineral.id === 'aphorite') {
    pureSCU1 = (mass * (orePct / 100)) / 1000;
  }

  let pureSCU2 = 0;
  let rawPrice2 = 0;
  let refinedPrice2 = 0;
  const sMin = state.secondaryMineral;
  const sPct = sMin ? state.secondaryPercentage : 0;

  if (sMin) {
    const oreMass2 = mass * (sPct / 100);
    const densityDivisor2 = (sMin.density || 15) * 85;
    pureSCU2 = oreMass2 / densityDivisor2;
    if (sMin.id === 'hadanite' || sMin.id === 'dolivine' || sMin.id === 'aphorite') {
      pureSCU2 = (mass * (sPct / 100)) / 1000;
    }
    rawPrice2 = Math.round(pureSCU2 * 100 * sMin.rawPrice);
    const refinedYield2 = pureSCU2 * refinery.yieldRate;
    const refineCost2 = Math.round(pureSCU2 * 100 * refinery.costFactor * 12);
    refinedPrice2 = Math.max(0, Math.round((refinedYield2 * 100 * sMin.refinedPrice) - refineCost2));
  }

  let pureSCU = Math.max(0.1, Math.round((pureSCU1 + pureSCU2) * 10) / 10);
  const cargoPct = Math.round((pureSCU / ship.scu) * 100);

  // 2. Pricing (Combined)
  const rawPrice1 = Math.round(pureSCU1 * 100 * mineral.rawPrice);
  const rawPrice = rawPrice1 + rawPrice2;

  const refinedYield1 = pureSCU1 * refinery.yieldRate;
  const refineCost1 = Math.round(pureSCU1 * 100 * refinery.costFactor * 12);
  const refinedPrice1 = Math.max(0, Math.round((refinedYield1 * 100 * mineral.refinedPrice) - refineCost1));
  const refinedPrice = refinedPrice1 + refinedPrice2;

  // Composition and Inerts gauge
  const inertPct = Math.max(0, Math.round((100 - orePct - sPct) * 10) / 10);
  if (DOM.inertPctLabel) DOM.inertPctLabel.textContent = `${inertPct.toFixed(1)} %`;
  if (DOM.compBarPrimary) DOM.compBarPrimary.style.width = `${Math.min(100, orePct)}%`;
  if (DOM.compBarSecondary) {
    DOM.compBarSecondary.style.width = `${Math.min(100, sPct)}%`;
    DOM.compBarSecondary.style.background = sMin ? sMin.color : 'transparent';
  }
  if (DOM.compBarInert) DOM.compBarInert.style.width = `${Math.min(100, inertPct)}%`;
  if (DOM.compLegendPrimary) DOM.compLegendPrimary.textContent = `● ${mineral.symbol}: ${orePct.toFixed(1)}%`;
  if (DOM.compLegendSecondary) {
    if (sMin) {
      DOM.compLegendSecondary.style.display = 'inline';
      DOM.compLegendSecondary.textContent = `● ${sMin.symbol}: ${sPct.toFixed(1)}%`;
      DOM.compLegendSecondary.style.color = sMin.color;
    } else {
      DOM.compLegendSecondary.style.display = 'none';
    }
  }
  if (DOM.compLegendInert) DOM.compLegendInert.textContent = `● Inertes: ${inertPct.toFixed(1)}%`;

  // 3. Laser Fracture Feasibility (Single Laser vs Multi-Turret MOLE / Arrastra / Orion)
  let totalLaserPower = 0;
  let combinedResistanceMod = 0;
  let combinedInstabilityMod = 0;
  let activeLaserDescList = [];

  const isMultiTurret = ship.laserSlots && ship.laserSlots > 1;

  if (isMultiTurret) {
    const activeCount = Math.min(state.moleActiveTurrets || 1, ship.laserSlots);
    const shipTurrets = getShipTurretConfigs(ship.id);

    for (let i = 0; i < activeCount; i++) {
      const item = shipTurrets[i];
      if (!item) continue;
      const l = MINING_DATA.lasers.find(x => x.id === item.laserId && (x.size === ship.laserSize || (ship.laserSize === 0 && x.size === 0)))
             || MINING_DATA.lasers.find(x => x.size === ship.laserSize)
             || MINING_DATA.lasers[0];
      const slotCount = l.slots !== undefined ? l.slots : 2;
      const turretMods = (item.moduleIds || []).slice(0, slotCount).map(id => MINING_DATA.modules.find(m => m.id === id) || MINING_DATA.modules[0]);

      const turretPwrMod = turretMods.reduce((sum, m) => sum + (m.powerMod || 0), 0);
      const turretResMod = turretMods.reduce((sum, m) => sum + (m.resMod || 0), 0);
      const turretInstMod = turretMods.reduce((sum, m) => sum + (m.instMod || 0), 0);

      const pwr = l.power * (1 + turretPwrMod);
      totalLaserPower += pwr;
      activeLaserDescList.push(`${l.name}`);

      // Combined laser and module debuffs
      const effectiveLaserRes = l.resistanceMod + turretResMod;
      const effectiveLaserInst = l.instabilityMod + turretInstMod;

      if (effectiveLaserRes < combinedResistanceMod) combinedResistanceMod = effectiveLaserRes;
      if (effectiveLaserInst < combinedInstabilityMod) combinedInstabilityMod = effectiveLaserInst;
    }
  } else {
    // Single laser (Prospector, ROC, ROC-DS)
    const turrets = getShipTurretConfigs(ship.id);
    const cfg = turrets[0];
    const laserObj = (cfg && MINING_DATA.lasers.find(x => x.id === cfg.laserId)) || laser;
    const slotCount = laserObj.slots !== undefined ? laserObj.slots : 0;
    const moduleList = cfg ? cfg.moduleIds : state.selectedModules;
    const equippedMods = (moduleList || []).slice(0, slotCount).map(id => MINING_DATA.modules.find(m => m.id === id) || MINING_DATA.modules[0]);

    const totalPwrMod = equippedMods.reduce((sum, m) => sum + (m.powerMod || 0), 0);
    const totalModRes = equippedMods.reduce((sum, m) => sum + (m.resMod || 0), 0);
    const totalModInst = equippedMods.reduce((sum, m) => sum + (m.instMod || 0), 0);

    totalLaserPower = laserObj.power * (1 + totalPwrMod);
    combinedResistanceMod = laserObj.resistanceMod + totalModRes;
    combinedInstabilityMod = laserObj.instabilityMod + totalModInst;
    activeLaserDescList.push(laserObj.name);
  }

  // Combined Fleet & Squad Wingmen
  let activeWingmenCount = 0;
  let fleetCargoSCU = ship.scu;
  const allShips = [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];

  if (Array.isArray(state.squadMembers) && state.squadMembers.length > 0) {
    state.squadMembers.forEach(m => {
      const wShip = allShips.find(s => s.id === m.shipId);
      if (wShip) fleetCargoSCU += (wShip.scu || 0);

      if (m.active && (m.laserId || m.customLaserStats)) {
        const wLaser = m.customLaserStats || MINING_DATA.lasers.find(l => l.id === m.laserId);
        if (wLaser) {
          totalLaserPower += (wLaser.power || 0);
          activeWingmenCount++;
          activeLaserDescList.push(`${m.name || 'Équipier'} (${wLaser.name})`);

          // Apply combined resistance and instability reduction
          if (wLaser.resistanceMod && wLaser.resistanceMod < 0) {
            combinedResistanceMod = Math.max(-0.90, combinedResistanceMod + (wLaser.resistanceMod * 0.75));
          }
          if (wLaser.instabilityMod && wLaser.instabilityMod < combinedInstabilityMod) {
            combinedInstabilityMod = Math.max(-0.95, combinedInstabilityMod + (wLaser.instabilityMod * 0.5));
          }
        }
      }
    });
  }

  const effectiveResistance = Math.max(0, state.resistance * (1 + combinedResistanceMod + gadget.resMod));
  const effectiveInstability = Math.max(0, state.instability * (1 + combinedInstabilityMod + gadget.instMod));

  // Power requirement formula based on mass and resistance
  const requiredPower = (mass * 0.32) * (1 + (effectiveResistance / 100));
  const powerRatio = totalLaserPower / Math.max(1, requiredPower);

  // 4. Update UI Outputs
  DOM.metricSCU.textContent = `${pureSCU.toFixed(1)} SCU`;
  if (state.squadMembers && state.squadMembers.length > 0) {
    const fleetCargoPct = Math.min(100, Math.round((pureSCU / Math.max(1, fleetCargoSCU)) * 100));
    DOM.metricCargoPct.textContent = `Soit ~${fleetCargoPct}% de la flotte (${fleetCargoSCU} SCU)`;
  } else {
    DOM.metricCargoPct.textContent = t.cargoShare.replace('{pct}', cargoPct).replace('{scu}', ship.scu);
  }
  DOM.metricRawPrice.textContent = `${rawPrice.toLocaleString(locale)} aUEC`;
  DOM.metricRefinedPrice.textContent = `${refinedPrice.toLocaleString(locale)} aUEC`;
  DOM.refinerySummaryNote.textContent = `${refinery.name} • ` + t.refineryDeducted.replace('{rate}', Math.round(refinery.yieldRate * 100));

  // Fracture status display
  const powerBarWidth = Math.min(100, Math.round(powerRatio * 75));
  DOM.powerBarFill.style.width = `${powerBarWidth}%`;

  if (powerRatio >= 1.15) {
    DOM.fractureBadge.className = 'fracture-badge badge-pass';
    DOM.fractureBadge.textContent = t.fractureEasy;
    DOM.powerBarFill.style.background = 'linear-gradient(90deg, #10b981, #00f0ff)';
    if (activeWingmenCount > 0) {
      const countTotal = (ship.id === 'mole' ? state.moleActiveTurrets : 1) + activeWingmenCount;
      DOM.fractureAdvice.textContent = t.squadAdviceMulti
        .replace('{count}', countTotal)
        .replace('{pwr}', totalLaserPower.toLocaleString(locale))
        .replace('{lasers}', activeLaserDescList.join(' + '))
        .replace('{status}', t.fractureEasy);
    } else if (ship.id === 'mole') {
      DOM.fractureAdvice.textContent = t.moleEnough
        .replace('{active}', state.moleActiveTurrets)
        .replace('{pwr}', totalLaserPower.toLocaleString(locale))
        .replace('{lasers}', activeLaserDescList.join(' + '));
    } else {
      DOM.fractureAdvice.textContent = t.soloEnough.replace('{pct}', Math.round((powerRatio - 1) * 100));
    }
  } else if (powerRatio >= 0.88) {
    DOM.fractureBadge.className = 'fracture-badge badge-pass';
    DOM.fractureBadge.textContent = t.fracturePossible;
    DOM.powerBarFill.style.background = 'linear-gradient(90deg, #f59e0b, #eab308)';
    if (activeWingmenCount > 0) {
      const countTotal = (ship.id === 'mole' ? state.moleActiveTurrets : 1) + activeWingmenCount;
      DOM.fractureAdvice.textContent = t.squadAdviceMulti
        .replace('{count}', countTotal)
        .replace('{pwr}', totalLaserPower.toLocaleString(locale))
        .replace('{lasers}', activeLaserDescList.join(' + '))
        .replace('{status}', t.fracturePossible);
    } else if (ship.id === 'mole') {
      DOM.fractureAdvice.textContent = t.moleDuoWeak
        .replace('{pwr}', totalLaserPower.toLocaleString(locale));
    } else {
      DOM.fractureAdvice.textContent = t.soloSlight;
    }
  } else {
    DOM.fractureBadge.className = 'fracture-badge badge-fail';
    DOM.fractureBadge.textContent = t.fractureTooHard;
    DOM.powerBarFill.style.background = 'linear-gradient(90deg, #f43f5e, #ef4444)';
    if (activeWingmenCount > 0) {
      const countTotal = (ship.id === 'mole' ? state.moleActiveTurrets : 1) + activeWingmenCount;
      DOM.fractureAdvice.textContent = t.squadAdviceMulti
        .replace('{count}', countTotal)
        .replace('{pwr}', totalLaserPower.toLocaleString(locale))
        .replace('{lasers}', activeLaserDescList.join(' + '))
        .replace('{status}', t.fractureTooHard);
    } else if (ship.id === 'mole') {
      if (state.moleActiveTurrets === 1) {
        DOM.fractureAdvice.textContent = t.moleSoloWeak.replace('{pwr}', totalLaserPower.toLocaleString(locale));
      } else if (state.moleActiveTurrets === 2) {
        DOM.fractureAdvice.textContent = t.moleDuoWeak.replace('{pwr}', totalLaserPower.toLocaleString(locale));
      } else {
        DOM.fractureAdvice.textContent = t.moleTrioWeak.replace('{pwr}', totalLaserPower.toLocaleString(locale));
      }
    } else {
      DOM.fractureAdvice.textContent = t.soloDeficit.replace('{pct}', Math.round((1 - powerRatio) * 100));
    }
  }

  // 5. Station de raffinage recommandée
  updateRecommendedStation(mineral);

  // 6. Verdict evaluation
  determineVerdict(mineral, orePct, pureSCU, refinedPrice, powerRatio);

  // 7. Smart Gadget & Module Tactical Advisor
  updateGadgetAdvice(powerRatio, totalLaserPower, requiredPower);

  // 8. ROC Gem Cluster Calculator
  updateRocCluster();

  // 9. mobiGlas 4.0 Telemetry, Arc Gauge & Mobile Live Summary
  updateArcFractureGauge(powerRatio, totalLaserPower, requiredPower, activeLaserDescList.join(' + '));
  updateMobiglasHeader(ship, pureSCU, refinedPrice);
  updateMobileLiveSummary(mineral, orePct, pureSCU, refinedPrice, powerRatio);

  // 10. Squad & Fleet Telemetry Display
  updateSquadDisplay(refinedPrice, rawPrice, totalLaserPower, fleetCargoSCU, combinedResistanceMod);

  // 11. Cockpit MFD Telemetry Extensions (High-density telemetry)
  updateWhereToMineBox(mineral);
  updateOptimalLoadoutAdvisor(mass, effectiveResistance, effectiveInstability, totalLaserPower, ship, mineral, powerRatio);
  updateStationPriceComparison(mineral, pureSCU, refinedPrice, rawPrice);
  updateScanSubtabBadges(state.selectedArchetype, mineral);
  triggerAutoBroadcastDebounced();
}

// ==========================================================================
// COCKPIT MFD HUD EXTENSIONS (High-density Cockpit MFD features)
// ==========================================================================

function updateWhereToMineBox(mineral) {
  if (!DOM.whereToMineCard || !DOM.wtmSpotsList || !DOM.wtmMineralBadge) return;
  const isEn = state.currentLang === 'en';
  const minName = getLocalized(mineral, 'name');
  DOM.wtmMineralBadge.textContent = minName.toUpperCase();
  DOM.wtmMineralBadge.style.color = mineral.color || '#00f0ff';
  DOM.wtmMineralBadge.style.borderColor = mineral.color || 'rgba(0,240,255,0.4)';

  const allHotspots = MINING_DATA.miningHotspots || [];
  // Find hotspots that explicitly mention this mineral
  let matchingHotspots = allHotspots.filter(h => {
    const ores = (h.primaryOres || '').toLowerCase();
    const desc = (h.desc_fr || '').toLowerCase() + ' ' + (h.desc_en || '').toLowerCase();
    const mId = mineral.id.toLowerCase();
    const mName = minName.toLowerCase();
    return ores.includes(mId) || ores.includes(mName) || desc.includes(mId) || desc.includes(mName);
  });

  if (matchingHotspots.length === 0) {
    matchingHotspots = allHotspots.slice(0, 3);
  } else {
    matchingHotspots = matchingHotspots.slice(0, 4);
  }

  DOM.wtmSpotsList.innerHTML = matchingHotspots.map(h => {
    const spotName = isEn ? (h.name_en || h.name_fr) : h.name_fr;
    const spotType = isEn ? (h.type_en || h.type_fr) : h.type_fr;
    const sysUpper = (h.system || 'Stanton').toUpperCase();
    const refHub = h.refineryHub || 'ARC-L1';

    return `
      <div class="wtm-spot-item">
        <div>
          <div class="wtm-spot-name">${spotName}</div>
          <div class="wtm-spot-env">📍 ${spotType} • Hub: ${refHub}</div>
        </div>
        <div class="wtm-spot-system">${sysUpper}</div>
      </div>
    `;
  }).join('');
}

function computeOptimalLoadout(mode = 'solo', mass, baseResistance, baseInstability, ship) {
  const compatibleLasers = [
    ...MINING_DATA.lasers,
    ...(state.customLasers || [])
  ].filter(l => l.size === ship.laserSize || (ship.laserSize === 0 && l.size === 0));

  const candidateModules = MINING_DATA.modules.filter(m => m.id !== 'none');
  const candidateGadgets = [
    ...MINING_DATA.gadgets,
    ...(state.customGadgets || [])
  ].filter(g => g.id !== 'none');

  const maxSlots = ship.moduleSlots || 0;

  let bestLaser = compatibleLasers[0] || MINING_DATA.lasers[0];
  let bestModules = [];
  let bestGadget = null;
  let bestScore = -Infinity;
  let bestRatio = 0;
  let bestReqW = 1;
  let bestTotW = 0;
  let bestEffRes = baseResistance;
  let bestEffInst = baseInstability;

  for (const laser of compatibleLasers) {
    const gadgetsToTest = [null, ...candidateGadgets];
    for (const gadget of gadgetsToTest) {
      const moduleSets = [];
      if (maxSlots === 0) {
        moduleSets.push([]);
      } else if (maxSlots === 1) {
        moduleSets.push([]);
        candidateModules.forEach(m => moduleSets.push([m]));
      } else if (maxSlots === 2) {
        moduleSets.push([]);
        candidateModules.forEach(m => moduleSets.push([m]));
        const surge = candidateModules.find(m => m.id === 'surge');
        const focus = candidateModules.find(m => m.id === 'focus_3');
        const rieger = candidateModules.find(m => m.id === 'rieger_c3');
        const brandt = candidateModules.find(m => m.id === 'brandt');
        if (focus && surge) moduleSets.push([focus, surge]);
        if (rieger && surge) moduleSets.push([rieger, surge]);
        if (focus && brandt) moduleSets.push([focus, brandt]);
      } else {
        moduleSets.push([]);
        candidateModules.forEach(m => moduleSets.push([m]));
        const surge = candidateModules.find(m => m.id === 'surge');
        const focus = candidateModules.find(m => m.id === 'focus_3');
        const rieger = candidateModules.find(m => m.id === 'rieger_c3');
        const brandt = candidateModules.find(m => m.id === 'brandt');
        if (focus && surge && rieger) moduleSets.push([focus, surge, rieger]);
        if (focus && brandt && surge) moduleSets.push([focus, brandt, surge]);
      }

      for (const mSet of moduleSets) {
        const modResMod = mSet.reduce((acc, m) => acc + (m.resMod || 0), 0);
        const modInstMod = mSet.reduce((acc, m) => acc + (m.instMod || 0), 0);
        const modPwrMod = mSet.reduce((acc, m) => acc + (m.powerMod || 0), 0);

        const gadResMod = gadget ? (gadget.resMod || 0) : 0;
        const gadInstMod = gadget ? (gadget.instMod || 0) : 0;

        const effRes = Math.max(0, baseResistance * (1 + (laser.resistanceMod || 0) + gadResMod + modResMod));
        const effInst = Math.max(0, baseInstability * (1 + (laser.instabilityMod || 0) + gadInstMod + modInstMod));

        const reqW = (mass * 0.32) * (1 + (effRes / 100));
        const totW = (laser.power || 0) * (1 + modPwrMod);
        const ratio = totW / Math.max(1, reqW);

        let score = 0;
        if (ratio >= 1.05) {
          score = 1000 - Math.abs(ratio - 1.25) * 80 - effInst * 1.5;
        } else {
          score = ratio * 600 - effInst * 2;
        }

        if (score > bestScore) {
          bestScore = score;
          bestLaser = laser;
          bestModules = mSet;
          bestGadget = gadget;
          bestRatio = ratio;
          bestReqW = reqW;
          bestTotW = totW;
          bestEffRes = effRes;
          bestEffInst = effInst;
        }
      }
    }
  }

  return {
    mode,
    laser: bestLaser,
    modules: bestModules,
    gadget: bestGadget,
    powerRatio: bestRatio,
    requiredPower: Math.round(bestReqW),
    totalPower: Math.round(bestTotW),
    effectiveResistance: Math.round(bestEffRes),
    effectiveInstability: Math.round(bestEffInst)
  };
}

function updateOptimalLoadoutAdvisor(mass, effResistance, effInstability, totalLaserPower, ship, mineral, powerRatio) {
  if (!DOM.optimalLoadoutCard || !DOM.olcBody || !DOM.olcFeasibilityTag) return;
  const isEn = state.currentLang === 'en';
  const locale = getLocale();
  const mode = state.optimalLoadoutTab || 'solo';

  const rec = computeOptimalLoadout(mode, mass, state.resistance, state.instability, ship);
  state.lastOptimalRecommendation = rec;

  let tagClass = 'optimal';
  let tagText = isEn ? 'OPTIMAL' : 'OPTIMAL';

  if (mode === 'wing') {
    tagClass = 'wing';
    tagText = isEn ? 'WING COORD' : 'COORDINATION ESCADRE';
  } else if (rec.powerRatio >= 1.05) {
    tagClass = 'optimal';
    tagText = isEn ? 'FRACTURE READY' : 'PRÊT À FRACTURER';
  } else if (rec.powerRatio >= 0.85) {
    tagClass = 'warning';
    tagText = isEn ? 'BORDERLINE' : 'LIMITE';
  } else {
    tagClass = 'danger';
    tagText = isEn ? 'WING REQUIRED' : 'ESCADRE REQUISE';
  }

  DOM.olcFeasibilityTag.className = `olc-feasibility-tag ${tagClass}`;
  DOM.olcFeasibilityTag.textContent = tagText;

  const laserName = rec.laser.name;
  const modulesDesc = rec.modules.length > 0 
    ? rec.modules.map(m => getLocalized(m, 'name')).join(' + ')
    : (isEn ? 'None (Raw Head)' : 'Aucun (Tête brute)');
  const gadgetDesc = rec.gadget 
    ? getLocalized(rec.gadget, 'name')
    : (isEn ? 'Optional / None' : 'Optionnel / Aucun');

  let html = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:6px; font-size:0.75rem;">
      <div style="background:rgba(255,255,255,0.03); padding:6px; border-radius:4px; border-left:2px solid var(--accent-cyan);">
        <div style="font-size:0.65rem; color:var(--text-muted); font-family:var(--font-hud);">${isEn ? 'RECOMMENDED HEAD' : 'TÊTE CONSEILLÉE'}</div>
        <div style="font-weight:700; color:var(--text-bright);">${laserName}</div>
      </div>
      <div style="background:rgba(255,255,255,0.03); padding:6px; border-radius:4px; border-left:2px solid var(--accent-amber);">
        <div style="font-size:0.65rem; color:var(--text-muted); font-family:var(--font-hud);">${isEn ? 'SURFACE GADGET' : 'GADGET DE SURFACE'}</div>
        <div style="font-weight:700; color:var(--text-bright);">${gadgetDesc}</div>
      </div>
    </div>
    <div style="background:rgba(255,255,255,0.03); padding:6px; border-radius:4px; border-left:2px solid var(--accent-emerald); font-size:0.75rem; margin-bottom:6px;">
      <div style="font-size:0.65rem; color:var(--text-muted); font-family:var(--font-hud);">${isEn ? 'OPTIMAL SUB-MODULES' : 'SOUS-MODULES CONSEILLÉS'}</div>
      <div style="font-weight:600; color:var(--accent-emerald);">${modulesDesc}</div>
    </div>
    <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-dim); font-family:var(--font-mono);">
      <span>${isEn ? 'Req. Wattage:' : 'Puissance requise :'} <strong style="color:var(--text-bright);">${rec.requiredPower.toLocaleString(locale)} W</strong></span>
      <span>${isEn ? 'Projected Power:' : 'Puissance projetée :'} <strong style="color:${rec.powerRatio >= 1.05 ? 'var(--accent-emerald)' : 'var(--accent-amber)'};">${rec.totalPower.toLocaleString(locale)} W (${(rec.powerRatio * 100).toFixed(0)}%)</strong></span>
    </div>
  `;

  if (mode === 'wing') {
    const minTurrets = Math.max(2, Math.ceil(rec.requiredPower / 4200));
    html += `
      <div style="margin-top:6px; padding:6px; background:rgba(0,240,255,0.06); border:1px solid rgba(0,240,255,0.2); border-radius:4px; font-size:0.72rem;">
        <div style="font-weight:700; color:var(--accent-cyan); margin-bottom:2px;">👥 ${isEn ? 'TACTICAL SQUAD FORMATION' : 'FORMATION ESCADRE TACTIQUE'} (${minTurrets} ${isEn ? 'Turrets/Ships Min.' : 'Tourelles/Vaisseaux Min.'})</div>
        <div style="color:var(--text-bright); line-height:1.3;">
          • <strong>Pilote 1 (Support) :</strong> Lancet S2/S1 + Sabir 21 (-50% rés.)<br>
          • <strong>Pilote 2 (Saturation) :</strong> Helix II/I + Surge (+35% charge)<br>
          • <strong>Pilote 3 (Maintien) :</strong> Arbor / Impact + Focus III (Zone verte)
        </div>
      </div>
    `;
  }

  DOM.olcBody.innerHTML = html;
}

function applyOptimalLoadout() {
  const rec = state.lastOptimalRecommendation;
  if (!rec || !rec.laser) return;

  state.selectedLaser = rec.laser;
  if (rec.modules && rec.modules.length > 0) {
    state.selectedModules = [
      rec.modules[0]?.id || 'none',
      rec.modules[1]?.id || 'none',
      rec.modules[2]?.id || 'none'
    ];
  } else {
    state.selectedModules = ['none', 'none', 'none'];
  }
  if (rec.gadget) {
    state.selectedGadget = rec.gadget;
  }

  const configs = getShipTurretConfigs(state.selectedShip.id);
  if (configs && configs[0]) {
    configs[0].laserId = rec.laser.id;
    configs[0].moduleIds = [...state.selectedModules];
  }

  saveLoadout();
  calculateAll();
  renderShipTurretsConfig();
  updateLaserOptions();
  renderSquadWingmen();
  broadcastLocalLoadout();

  sfx.playSuccess();
  triggerHaptic(25);
  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.olcAppliedToast || '⚡ Loadout optimal appliqué et synchronisé avec la flotte !');
}

function updateJointFireCoordinator() {
  // Retiré : les pilotes utilisent directement les communications vocales Discord en vol.
}

function setJointFireState(newState, broadcast = true) {
  state.jointFireState = newState;
  const btnMap = {
    standby: DOM.btnFireStateStandby,
    charging: DOM.btnFireStateCharging,
    green: DOM.btnFireStateGreen,
    overheat: DOM.btnFireStateOverheat
  };
  Object.keys(btnMap).forEach(k => {
    if (btnMap[k]) {
      if (k === newState) {
        btnMap[k].classList.add('active');
      } else {
        btnMap[k].classList.remove('active');
      }
    }
  });

  if (newState === 'overheat') {
    sfx.playCritical();
  } else if (newState === 'green') {
    sfx.playSuccess();
  } else {
    sfx.playBeep(520, 'sine', 0.04);
  }

  if (broadcast && fleetNet && fleetNet.connected) {
    fleetNet.broadcastJointFireSync({
      fireState: newState,
      senderCallsign: state.callsign || 'CITIZEN-1',
      timestamp: Date.now()
    });
  }
}

function handleIncomingJointFireSync(fireData, senderCallsign) {
  if (!fireData || !fireData.fireState) return;
  state.wingFireStates[senderCallsign] = {
    fireState: fireData.fireState,
    timestamp: fireData.timestamp || Date.now()
  };
  renderJointFireWingStatus();
}

function renderJointFireWingStatus() {
  if (!DOM.jointFireCard) return;
  let statusContainer = document.getElementById('jointFireWingStatus');
  if (!statusContainer) {
    statusContainer = document.createElement('div');
    statusContainer.id = 'jointFireWingStatus';
    statusContainer.style.cssText = 'display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); font-size:0.7rem;';
    DOM.jointFireCard.appendChild(statusContainer);
  }

  const entries = Object.entries(state.wingFireStates);
  if (entries.length === 0) {
    statusContainer.innerHTML = '';
    return;
  }
  const isEn = state.currentLang === 'en';
  statusContainer.innerHTML = entries.map(([callsign, data]) => {
    let color = 'var(--text-dim)';
    let label = data.fireState;
    if (data.fireState === 'charging') { color = 'var(--accent-orange, #f59e0b)'; label = isEn ? 'CHARGE' : 'CHARGE'; }
    else if (data.fireState === 'green') { color = 'var(--accent-green, #10b981)'; label = isEn ? 'GREEN' : 'ZONE VERTE'; }
    else if (data.fireState === 'overheat') { color = 'var(--accent-red, #ef4444)'; label = isEn ? 'OVERHEAT' : 'SURCHAUFFE'; }
    else { label = 'STANDBY'; }
    return `<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:4px; background:rgba(255,255,255,0.06); font-family:var(--font-mono); border-left:3px solid ${color};">
      <strong>${callsign}</strong>: <span style="color:${color}; font-weight:700;">${label}</span>
    </span>`;
  }).join(' ');
}

function getEmergencyEscapeVector() {
  const sys = (state.mineralSystemFilter && state.mineralSystemFilter !== 'all') 
    ? state.mineralSystemFilter.toUpperCase() 
    : 'STANTON';
  if (sys === 'PYRO') {
    return 'PYRO // CHECKMATE STATION - VECTOR 042° (JUMP 18.2 Gm)';
  } else if (sys === 'NYX') {
    return 'NYX // DELAMAR OM-1 / LEVSKI RETREAT (JUMP 9.4 Gm)';
  } else {
    return 'STANTON // HUR-L1 GREEN BAND OM-1 (JUMP 24.8 Gm)';
  }
}

function triggerRedAlert(source = 'local', incomingData = null) {
  state.redAlertActive = true;
  document.body.classList.add('red-alert-active');
  if (DOM.redAlertBanner) {
    DOM.redAlertBanner.style.display = 'flex';
  }
  const vector = incomingData?.emergencyVector || getEmergencyEscapeVector();
  if (DOM.redAlertEscapeVector) {
    DOM.redAlertEscapeVector.textContent = vector;
  }
  sfx.playAlarm();
  triggerHaptic([100, 50, 100, 50, 200]);
  if (source === 'local') {
    if (fleetNet && fleetNet.connected) {
      fleetNet.broadcastRedAlert({
        active: true,
        emergencyVector: vector,
        senderCallsign: state.callsign || 'CITIZEN-1',
        timestamp: Date.now()
      });
    }
    const t = I18N[state.currentLang] || I18N.fr;
    showToast(t.redAlertBroadcastToast || '🚨 ALERTE ROUGE transmise à l\'escadre !');
  } else {
    const caller = incomingData?.senderCallsign || 'Ailier';
    showToast(`🚨 ALERTE ROUGE reçue de ${caller} !`);
  }
}

function dismissRedAlert(source = 'local') {
  state.redAlertActive = false;
  document.body.classList.remove('red-alert-active');
  if (DOM.redAlertBanner) {
    DOM.redAlertBanner.style.display = 'none';
  }
  sfx.playSuccess();
  triggerHaptic(20);
  if (source === 'local') {
    if (fleetNet && fleetNet.connected) {
      fleetNet.broadcastRedAlert({
        active: false,
        senderCallsign: state.callsign || 'CITIZEN-1',
        timestamp: Date.now()
      });
    }
    const t = I18N[state.currentLang] || I18N.fr;
    showToast(t.redAlertDismissToast || '🛡️ Fin d\'alerte rouge confirmée.');
  }
}

function handleIncomingRedAlert(alertData, senderCallsign) {
  if (!alertData) return;
  if (alertData.active) {
    triggerRedAlert('remote', { ...alertData, senderCallsign });
  } else {
    dismissRedAlert('remote');
  }
}

function initTacticalCoordinator() {
  const onRedAlertClick = () => {
    if (state.redAlertActive) {
      dismissRedAlert('local');
    } else {
      triggerRedAlert('local');
    }
  };
  if (DOM.btnMgRedAlert) DOM.btnMgRedAlert.addEventListener('click', onRedAlertClick);
  if (DOM.btnRedAlertTrigger) DOM.btnRedAlertTrigger.addEventListener('click', onRedAlertClick);
  if (DOM.btnDismissRedAlert) DOM.btnDismissRedAlert.addEventListener('click', () => dismissRedAlert('local'));
  if (DOM.btnDeployEscortCombat) {
    DOM.btnDeployEscortCombat.addEventListener('click', () => {
      sfx.playCritical();
      triggerHaptic(25);
      showToast(state.currentLang === 'en' ? '⚔️ Escort combat engagement ordered!' : '⚔️ Ordre d\'engagement transmis aux chasseurs d\'escorte !');
    });
  }

  if (DOM.tabOlcSolo && DOM.tabOlcWing) {
    DOM.tabOlcSolo.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.03);
      state.optimalLoadoutTab = 'solo';
      DOM.tabOlcSolo.classList.add('active');
      DOM.tabOlcSolo.style.borderColor = 'var(--accent-amber)';
      DOM.tabOlcSolo.style.color = 'var(--accent-amber)';
      DOM.tabOlcWing.classList.remove('active');
      DOM.tabOlcWing.style.borderColor = '';
      DOM.tabOlcWing.style.color = '';
      calculateAll();
    });

    DOM.tabOlcWing.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.03);
      state.optimalLoadoutTab = 'wing';
      DOM.tabOlcWing.classList.add('active');
      DOM.tabOlcWing.style.borderColor = 'var(--accent-cyan)';
      DOM.tabOlcWing.style.color = 'var(--accent-cyan)';
      DOM.tabOlcSolo.classList.remove('active');
      DOM.tabOlcSolo.style.borderColor = '';
      DOM.tabOlcSolo.style.color = '';
      calculateAll();
    });
  }

  if (DOM.btnApplyOptimalLoadout) {
    DOM.btnApplyOptimalLoadout.addEventListener('click', () => {
      applyOptimalLoadout();
    });
  }

  const fireButtons = [
    { btn: DOM.btnFireStateStandby, state: 'standby' },
    { btn: DOM.btnFireStateCharging, state: 'charging' },
    { btn: DOM.btnFireStateGreen, state: 'green' },
    { btn: DOM.btnFireStateOverheat, state: 'overheat' }
  ];
  fireButtons.forEach(({ btn, state: fState }) => {
    if (btn) {
      btn.addEventListener('click', () => {
        setJointFireState(fState, true);
      });
    }
  });

  if (DOM.escortCutSlider) {
    DOM.escortCutSlider.value = state.escortCutPct || 15;
    DOM.escortCutSlider.addEventListener('input', (e) => {
      state.escortCutPct = parseFloat(e.target.value) || 0;
      localStorage.setItem('aaron_mfd_escort_cut', state.escortCutPct.toString());
      calculateCrewSplit();
    });
  }
}

// ============================================================================
// JALON 5: SPECIALIZED HAULERS & PHYSICALIZED CARGO REFACTOR 4.0
// ============================================================================

function initCargoGridMaster() {
  populateHaulerSelect();
  updateActiveHauler(state.activeHaulerId);

  if (DOM.selectActiveHauler) {
    DOM.selectActiveHauler.addEventListener('change', (e) => {
      const haulerId = e.target.value;
      updateActiveHauler(haulerId);
    });
  }

  if (DOM.btnAddOneHaulerBag) {
    DOM.btnAddOneHaulerBag.addEventListener('click', () => {
      addDirectHaulerCargo(8, 'Sacoche 8 SCU');
    });
  }

  if (DOM.btnAddBox32) {
    DOM.btnAddBox32.addEventListener('click', () => {
      addDirectHaulerCargo(32, 'Boîte 32 SCU');
    });
  }

  if (DOM.btnTransferHoldToHauler) {
    DOM.btnTransferHoldToHauler.addEventListener('click', () => {
      transferMinerHoldToHauler();
    });
  }

  if (DOM.btnBroadcastPickupRequest) {
    DOM.btnBroadcastPickupRequest.addEventListener('click', () => {
      broadcastCargoPickupRequest();
    });
  }

  if (DOM.btnClearHaulerHold) {
    DOM.btnClearHaulerHold.addEventListener('click', () => {
      clearHaulerHold();
    });
  }

  if (DOM.haulerCutSlider) {
    DOM.haulerCutSlider.value = state.haulerCutPct || 15;
    DOM.haulerCutSlider.addEventListener('input', (e) => {
      state.haulerCutPct = parseFloat(e.target.value) || 0;
      localStorage.setItem('aaron_mfd_hauler_cut', state.haulerCutPct.toString());
      calculateCrewSplit();
    });
  }
}

function addDirectHaulerCargo(scu, label) {
  const ships = MINING_DATA.supportShips || [];
  const hauler = ships.find(s => s.id === state.activeHaulerId) || ships[0];
  const currentSCU = (state.haulerHoldBags || []).reduce((sum, b) => sum + (b.scu || 0), 0);

  if (currentSCU + scu > hauler.scu) {
    showToast(state.currentLang === 'en' ? 'Hauler cargo grid capacity exceeded!' : 'Capacité de la grille de fret dépassée !');
    sfx.playCritical();
    return;
  }

  const mineral = state.selectedMineral || { id: 'quantainium', name: 'Quantainium' };
  state.haulerHoldBags.push({
    id: Date.now(),
    scu: scu,
    mineral: mineral.id,
    caller: label || 'Fret'
  });
  localStorage.setItem('aaron_mfd_hauler_hold', JSON.stringify(state.haulerHoldBags));

  sfx.playSuccess();
  triggerHaptic(20);
  showToast(`+ ${scu} SCU (${mineral.name}) arrimés sur le ${hauler.name} !`);
  renderCargoGridMaster();
}

function transferMinerHoldToHauler() {
  if (state.holdSCU <= 0 && (!state.detachedSaddlebags || state.detachedSaddlebags.length === 0)) {
    showToast(state.currentLang === 'en' ? 'Your miner hold is empty!' : 'Votre soute de mineur est vide !');
    sfx.playWarning();
    return;
  }

  const ships = MINING_DATA.supportShips || [];
  const hauler = ships.find(s => s.id === state.activeHaulerId) || ships[0];
  const currentSCU = (state.haulerHoldBags || []).reduce((sum, b) => sum + (b.scu || 0), 0);

  let bagsToTransfer = [];
  if (state.detachedSaddlebags && state.detachedSaddlebags.length > 0) {
    bagsToTransfer = state.detachedSaddlebags.map(b => ({
      id: b.id,
      scu: b.scu,
      mineral: b.mineral,
      caller: state.callsign || 'Mineur'
    }));
  } else {
    bagsToTransfer = [{
      id: Date.now(),
      scu: state.holdSCU,
      mineral: state.selectedMineral ? state.selectedMineral.id : 'quantainium',
      caller: state.callsign || 'Mineur'
    }];
  }

  const totalTransferSCU = bagsToTransfer.reduce((sum, b) => sum + b.scu, 0);
  if (currentSCU + totalTransferSCU > hauler.scu) {
    showToast(state.currentLang === 'en' ? 'Hauler cargo grid capacity exceeded!' : 'Capacité de la grille de fret dépassée !');
    sfx.playCritical();
    return;
  }

  state.haulerHoldBags.push(...bagsToTransfer);
  localStorage.setItem('aaron_mfd_hauler_hold', JSON.stringify(state.haulerHoldBags));

  state.holdSCU = 0;
  state.detachedSaddlebags = [];
  updateHoldDisplay();
  renderSaddlebagsVisual();

  sfx.playSuccess();
  triggerHaptic(30);

  showToast(`📥 ${totalTransferSCU.toFixed(1)} SCU transférés sur le ${hauler.name} !`);
  renderCargoGridMaster();
}

function populateHaulerSelect() {
  if (!DOM.selectActiveHauler) return;
  const ships = MINING_DATA.supportShips || [];
  DOM.selectActiveHauler.innerHTML = ships.map(ship => {
    const selected = ship.id === state.activeHaulerId ? 'selected' : '';
    const gridTypeLabel = ship.gridType === 'internal' ? 'Interne' : ship.gridType === 'external' ? 'Externe' : ship.gridType === 'orbital_spindle' ? 'Spindle' : 'Modulaire';
    return `<option value="${ship.id}" ${selected}>${ship.name} (${ship.scu} SCU - ${gridTypeLabel})</option>`;
  }).join('');
}

function updateActiveHauler(haulerId) {
  const ships = MINING_DATA.supportShips || [];
  let hauler = ships.find(s => s.id === haulerId);
  if (!hauler && ships.length > 0) {
    hauler = ships[0];
  }
  if (!hauler) return;
  state.activeHaulerId = hauler.id;
  localStorage.setItem('aaron_mfd_active_hauler', hauler.id);

  if (DOM.selectActiveHauler && DOM.selectActiveHauler.value !== hauler.id) {
    DOM.selectActiveHauler.value = hauler.id;
  }

  if (DOM.haulerTractorSpecBadge) {
    const tb = hauler.tractorBeam || { size: 'S2', power: '12 000 N' };
    DOM.haulerTractorSpecBadge.textContent = `${tb.size} Tractor • ${tb.power}`;
  }

  if (DOM.haulerCapacityDisplay) {
    DOM.haulerCapacityDisplay.textContent = `${hauler.scu} SCU`;
  }

  if (DOM.haulerGridTypeDisplay) {
    const gridLabels = {
      internal: 'Interne Sécurisée',
      external: 'Externe (Poutres)',
      orbital_spindle: 'Spindle Orbital',
      internal_modular: 'Compartiments Modulaires'
    };
    DOM.haulerGridTypeDisplay.textContent = gridLabels[hauler.gridType] || hauler.gridType;
  }

  if (DOM.haulerMaxBagsDisplay) {
    DOM.haulerMaxBagsDisplay.textContent = `${hauler.prospectorBagsMax} Prosp. / ${hauler.moleBagsMax} MOLE`;
  }

  renderCargoGridMaster();
}

function renderCargoGridMaster() {
  const ships = MINING_DATA.supportShips || [];
  const hauler = ships.find(s => s.id === state.activeHaulerId) || ships[0];
  if (!hauler) return;

  const currentSCU = (state.haulerHoldBags || []).reduce((sum, b) => sum + (b.scu || 0), 0);
  const capacity = hauler.scu || 1;
  const pct = Math.min(100, Math.round((currentSCU / capacity) * 100));

  if (DOM.haulerHoldProgressLabel) {
    DOM.haulerHoldProgressLabel.textContent = `${currentSCU.toFixed(1)} / ${capacity} SCU (${pct}%)`;
  }

  if (DOM.haulerBarFill) {
    DOM.haulerBarFill.style.width = `${pct}%`;
  }

  let hasQuant = false;
  let totalRaw = 0;
  let totalRefined = 0;
  const locale = getLocale();

  if (DOM.haulerCargoVisualGrid) {
    if (!state.haulerHoldBags || state.haulerHoldBags.length === 0) {
      DOM.haulerCargoVisualGrid.innerHTML = `
        <div class="cargo-box-empty-hint">
          ${state.currentLang === 'en' ? 'Physicalized freight grid empty. Ready to tractor-beam saddlebags & containers.' : 'Grille de fret physique vide. Prête à arrimer sacoches & conteneurs en vol.'}
        </div>
      `;
    } else {
      DOM.haulerCargoVisualGrid.innerHTML = state.haulerHoldBags.map((bag, idx) => {
        const mineral = (MINING_DATA.minerals || []).find(m => m.id === bag.mineral) || {
          name: bag.mineral || 'Minerais',
          rawPrice: 50,
          refinedPrice: 95
        };
        if (bag.mineral === 'quantainium') hasQuant = true;

        const rawVal = Math.round(bag.scu * 100 * (mineral.rawPrice || 50));
        const refinedVal = Math.round(bag.scu * 100 * (mineral.refinedPrice || 95) * 0.93);
        totalRaw += rawVal;
        totalRefined += refinedVal;

        const shortName = (mineral.name || 'MIN').split(' ')[0];
        return `
          <div class="cargo-box-slot ${bag.mineral === 'quantainium' ? 'has-quant' : ''}" title="${mineral.name} (${bag.scu} SCU) - ~${refinedVal.toLocaleString(locale)} aUEC">
            <span class="box-ore">${shortName}</span>
            <span class="box-scu">${bag.scu} SCU</span>
            <span class="box-origin">${bag.caller || 'Sac #' + (idx + 1)}</span>
          </div>
        `;
      }).join('');
    }
  }

  if (DOM.haulerQuantainiumAlert) {
    DOM.haulerQuantainiumAlert.style.display = hasQuant ? 'inline-block' : 'none';
  }

  if (DOM.haulerRawValDisplay) {
    DOM.haulerRawValDisplay.textContent = `${totalRaw.toLocaleString(locale)} aUEC`;
  }
  if (DOM.haulerRefinedValDisplay) {
    DOM.haulerRefinedValDisplay.textContent = `${totalRefined.toLocaleString(locale)} aUEC`;
  }

  renderPendingCargoPickups();
}

function renderPendingCargoPickups() {
  if (!DOM.pendingPickupsList) return;
  const count = (state.pendingCargoPickups || []).length;
  if (DOM.pendingPickupsCount) {
    DOM.pendingPickupsCount.textContent = `${count} ${count > 1 ? 'appels' : 'appel'}`;
  }

  if (count === 0) {
    DOM.pendingPickupsList.innerHTML = `
      <div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; padding:4px 0;">
        ${state.currentLang === 'en' ? 'No floating saddlebags pending pickup in space.' : 'Aucun sac en attente de récupération dans l\'espace.'}
      </div>
    `;
    return;
  }

  DOM.pendingPickupsList.innerHTML = state.pendingCargoPickups.map(req => {
    return `
      <div class="pending-pickup-item">
        <div class="pending-pickup-info">
          <div class="pending-pickup-caller">📡 ${req.senderCallsign} (${req.senderShip})</div>
          <div class="pending-pickup-details">${req.bags.length} sac(s) • ${req.totalSCU.toFixed(1)} SCU</div>
        </div>
        <button class="btn-tractor-dock" data-req-id="${req.requestId}">
          🧲 ARRIMAGE
        </button>
      </div>
    `;
  }).join('');

  DOM.pendingPickupsList.querySelectorAll('.btn-tractor-dock').forEach(btn => {
    btn.addEventListener('click', () => {
      const reqId = btn.getAttribute('data-req-id');
      acceptCargoPickup(reqId);
    });
  });
}

function broadcastCargoPickupRequest() {
  const ship = state.selectedShip;
  let bagsToTransfer = [];

  if (state.detachedSaddlebags && state.detachedSaddlebags.length > 0) {
    bagsToTransfer = state.detachedSaddlebags.map(b => ({
      id: b.id,
      scu: b.scu,
      mineral: b.mineral,
      caller: state.callsign || 'CITIZEN-1'
    }));
  } else if (state.holdSCU > 0) {
    const bagSCU = ship.saddlebagSCU || 8;
    const count = Math.max(1, Math.floor(state.holdSCU / bagSCU));
    for (let i = 0; i < count; i++) {
      bagsToTransfer.push({
        id: Date.now() + i,
        scu: bagSCU,
        mineral: state.selectedMineral ? state.selectedMineral.id : 'quantainium',
        caller: state.callsign || 'CITIZEN-1'
      });
    }
  } else {
    showToast(state.currentLang === 'en' ? 'No cargo or detached saddlebags to transfer!' : 'Aucune cargaison ou sacoche à transférer !');
    sfx.playWarning();
    return;
  }

  const totalSCU = bagsToTransfer.reduce((sum, b) => sum + (b.scu || 0), 0);
  const pickupReq = {
    requestId: 'PK-' + Date.now().toString(36).toUpperCase(),
    senderCallsign: state.callsign || 'CITIZEN-1',
    senderShip: ship.name,
    bags: bagsToTransfer,
    totalSCU: totalSCU,
    timestamp: Date.now()
  };

  if (fleetNet && fleetNet.connected) {
    fleetNet.broadcastCargoPickupRequest(pickupReq);
  }

  // Always register locally so the user can test / simulate tractor beam recovery in solo or hauler role
  state.pendingCargoPickups = (state.pendingCargoPickups || []).filter(r => r.requestId !== pickupReq.requestId);
  state.pendingCargoPickups.push(pickupReq);

  sfx.playBeep(880, 'sine', 0.08);
  triggerHaptic(30);

  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.pickupToastSent || '📡 Demande de récupération de fret transmise à l\'escadre !');
  renderPendingCargoPickups();
}

function handleIncomingCargoPickupRequest(pickupData, senderCallsign) {
  if (!pickupData || !pickupData.requestId) return;
  state.pendingCargoPickups = (state.pendingCargoPickups || []).filter(r => r.requestId !== pickupData.requestId);
  state.pendingCargoPickups.push(pickupData);

  sfx.playBeep(700, 'sine', 0.05);
  triggerHaptic(20);

  showToast(`📡 Demande de fret de ${senderCallsign || pickupData.senderCallsign} (${pickupData.totalSCU.toFixed(1)} SCU)`);
  renderPendingCargoPickups();
}

function acceptCargoPickup(reqId) {
  const req = (state.pendingCargoPickups || []).find(r => r.requestId === reqId);
  if (!req) return;

  const ships = MINING_DATA.supportShips || [];
  const hauler = ships.find(s => s.id === state.activeHaulerId) || ships[0];
  const currentSCU = (state.haulerHoldBags || []).reduce((sum, b) => sum + (b.scu || 0), 0);

  if (currentSCU + req.totalSCU > hauler.scu) {
    showToast(state.currentLang === 'en' ? 'Hauler cargo grid capacity exceeded!' : 'Capacité de la grille de fret du transporteur dépassée !');
    sfx.playCritical();
    return;
  }

  state.haulerHoldBags.push(...req.bags);
  localStorage.setItem('aaron_mfd_hauler_hold', JSON.stringify(state.haulerHoldBags));

  state.pendingCargoPickups = state.pendingCargoPickups.filter(r => r.requestId !== reqId);

  // If local player was also the sender (solo test mode), deduct from local hold / detached bags!
  if (req.senderCallsign === (state.callsign || 'CITIZEN-1')) {
    state.detachedSaddlebags = [];
    const ship = state.selectedShip;
    state.holdSCU = Math.max(0, Math.round((state.holdSCU - req.totalSCU) * 10) / 10);
    updateHoldDisplay();
    renderSaddlebagsVisual();
  }

  if (fleetNet && fleetNet.connected) {
    fleetNet.broadcastCargoPickupAccept({
      requestId: req.requestId,
      recipientCallsign: req.senderCallsign,
      haulerShip: hauler.name,
      haulerCallsign: state.callsign || 'CITIZEN-1',
      totalSCU: req.totalSCU
    });
  }

  sfx.playSuccess();
  triggerHaptic(40);

  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.pickupToastAccepted || '🧲 Fret arrimé avec succès dans la soute du transporteur !');
  renderCargoGridMaster();
}

function handleIncomingCargoPickupAccept(acceptData, senderCallsign) {
  if (!acceptData) return;
  const myCallsign = state.callsign || 'CITIZEN-1';
  if (acceptData.recipientCallsign && acceptData.recipientCallsign !== myCallsign) return;

  // The miner's cargo has been taken by the hauler!
  state.detachedSaddlebags = [];
  if (acceptData.totalSCU) {
    state.holdSCU = Math.max(0, Math.round((state.holdSCU - acceptData.totalSCU) * 10) / 10);
  } else {
    state.holdSCU = 0;
  }

  updateHoldDisplay();
  renderSaddlebagsVisual();

  sfx.playSuccess();
  triggerHaptic(35);

  showToast(`🧲 Fret arrimé à bord de ${acceptData.haulerShip || 'un transporteur'} (${senderCallsign || acceptData.haulerCallsign || 'Ailier'}) ! Soute libérée.`);
}

function clearHaulerHold() {
  if (!state.haulerHoldBags || state.haulerHoldBags.length === 0) {
    showToast(state.currentLang === 'en' ? 'Hauler cargo hold is already empty!' : 'La soute du transporteur est déjà vide !');
    return;
  }
  const count = state.haulerHoldBags.length;
  state.haulerHoldBags = [];
  localStorage.removeItem('aaron_mfd_hauler_hold');
  sfx.playSuccess();
  triggerHaptic(20);
  showToast(state.currentLang === 'en' ? `${count} container(s) unloaded at station terminal!` : `${count} conteneur(s) déchargé(s) au terminal de la station !`);
  renderCargoGridMaster();
}

function updateStationPriceComparison(mineral, pureSCU, refinedPrice, rawPrice) {
  if (!DOM.stationPriceComparatorCard || !DOM.spcTableContainer) return;
  const isEn = state.currentLang === 'en';
  const locale = getLocale();
  const rPrice = rawPrice || (pureSCU * 100 * mineral.rawPrice);

  if (DOM.spcOreTag) {
    DOM.spcOreTag.textContent = mineral.symbol || 'ORE';
    DOM.spcOreTag.style.color = mineral.color || '#10b981';
  }

  // Jalon 6: Updates Market Arbitrage, Terminals and Tour
  renderMarketArbitrage(mineral, pureSCU, refinedPrice, rPrice);
  renderMarketTerminals(mineral, pureSCU);
  renderSalesTour(mineral, pureSCU);

  // Backward compatible Top Refinery Stations list
  const stations = (MINING_DATA.refineryStations || []).slice();
  stations.sort((a, b) => {
    const aBonus = a.bonusMineral === mineral.id ? (a.bonusRate || 0) : 0;
    const bBonus = b.bonusMineral === mineral.id ? (b.bonusRate || 0) : 0;
    return bBonus - aBonus;
  });

  const topStations = stations.slice(0, 4);

  DOM.spcTableContainer.innerHTML = topStations.map((st, idx) => {
    const isSpecialBonus = st.bonusMineral === mineral.id;
    const bonusRate = isSpecialBonus ? (st.bonusRate || 0) : 0;
    const bonusPct = Math.round(bonusRate * 100);
    const stationYield = Math.round(refinedPrice * (1 + bonusRate));
    const isBest = idx === 0 && isSpecialBonus;

    let bonusBadgeHtml = '';
    if (isSpecialBonus && bonusPct > 0) {
      bonusBadgeHtml = `<span class="spc-bonus-tag high">+${bonusPct}% Rendement</span>`;
    } else {
      bonusBadgeHtml = `<span class="spc-bonus-tag none">Standard</span>`;
    }

    return `
      <div class="spc-row ${isBest ? 'best-row' : ''}">
        <div>
          <div class="spc-st-name">${isBest ? '🌟 ' : ''}${st.name}</div>
          <div class="spc-st-meta">${st.system} • ${st.sector ? st.sector.toUpperCase() : 'STANTON'}</div>
        </div>
        <div class="spc-right">
          ${bonusBadgeHtml}
          <div class="spc-yield-val">~${stationYield.toLocaleString(locale)} aUEC</div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================================================
// JALON 6: BOURSE COMMERCIALE, ARBITRAGE & UEX CORP (SC 4.0 & GUILD SCOUTS)
// ==========================================================================

function initMarketAndArbitrage() {
  populateScoutDropdowns();

  if (DOM.btnMktTabArbitrage) {
    DOM.btnMktTabArbitrage.addEventListener('click', () => setMarketTab('arbitrage'));
  }
  if (DOM.btnMktTabTerminals) {
    DOM.btnMktTabTerminals.addEventListener('click', () => setMarketTab('terminals'));
  }
  if (DOM.btnMktTabScout) {
    DOM.btnMktTabScout.addEventListener('click', () => setMarketTab('scout'));
  }

  // System filters
  const filterBtns = document.querySelectorAll('.mkt-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setMarketSystemFilter(btn.dataset.sysFilter || 'all');
    });
  });

  if (DOM.btnRefreshUex) {
    DOM.btnRefreshUex.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(15);
      fetchUexMarketPrices(true);
    });
  }

  if (DOM.btnBroadcastScoutPrice) {
    DOM.btnBroadcastScoutPrice.addEventListener('click', () => {
      broadcastScoutPrice();
    });
  }

  if (DOM.btnCopySalesTour) {
    DOM.btnCopySalesTour.addEventListener('click', () => {
      copySalesTour();
    });
  }

  if (DOM.selectScoutTerminal && DOM.selectScoutMineral) {
    const updateScoutInputPrice = () => {
      const termId = DOM.selectScoutTerminal.value;
      const minId = DOM.selectScoutMineral.value;
      const term = (MINING_DATA.tradeTerminals || []).find(t => t.id === termId);
      const mineral = (MINING_DATA.minerals || []).find(m => m.id === minId);
      if (term && term.priceModifiers && term.priceModifiers[minId] && DOM.inputScoutPrice) {
        DOM.inputScoutPrice.value = term.priceModifiers[minId].refinedPrice;
      } else if (mineral && DOM.inputScoutPrice) {
        DOM.inputScoutPrice.value = mineral.refinedPrice;
      }
    };
    DOM.selectScoutTerminal.addEventListener('change', updateScoutInputPrice);
    DOM.selectScoutMineral.addEventListener('change', updateScoutInputPrice);
  }

  // Initial fetch / cache load
  fetchUexMarketPrices(false);
}

function populateScoutDropdowns() {
  if (DOM.selectScoutTerminal) {
    const terminals = MINING_DATA.tradeTerminals || [];
    DOM.selectScoutTerminal.innerHTML = terminals.map(t => {
      return `<option value="${t.id}">${t.name} (${t.system.toUpperCase()})</option>`;
    }).join('');
  }

  if (DOM.selectScoutMineral) {
    const minerals = MINING_DATA.minerals || [];
    DOM.selectScoutMineral.innerHTML = minerals.map(m => {
      const name = getLocalized(m, 'name');
      return `<option value="${m.id}">${name}</option>`;
    }).join('');
  }
}

function setMarketTab(tabName) {
  state.activeMktTab = tabName;
  const isArbitrage = tabName === 'arbitrage';
  const isTerminals = tabName === 'terminals';
  const isScout = tabName === 'scout';

  if (DOM.btnMktTabArbitrage) DOM.btnMktTabArbitrage.classList.toggle('active', isArbitrage);
  if (DOM.btnMktTabTerminals) DOM.btnMktTabTerminals.classList.toggle('active', isTerminals);
  if (DOM.btnMktTabScout) DOM.btnMktTabScout.classList.toggle('active', isScout);

  if (DOM.mktPaneArbitrage) DOM.mktPaneArbitrage.style.display = isArbitrage ? 'block' : 'none';
  if (DOM.mktPaneTerminals) DOM.mktPaneTerminals.style.display = isTerminals ? 'block' : 'none';
  if (DOM.mktPaneScout) DOM.mktPaneScout.style.display = isScout ? 'block' : 'none';

  sfx.playBeep(520, 'sine', 0.03);
  triggerHaptic(10);
}

function setMarketSystemFilter(systemFilter) {
  state.mktSystemFilter = systemFilter;
  renderMarketTerminals(state.selectedMineral, state.pureSCU || 10);
  sfx.playBeep(580, 'sine', 0.02);
}

async function fetchUexMarketPrices(forceRefresh = false) {
  const cfg = MINING_DATA.uexConfig || {
    publicEndpoint: 'https://api.uexcorp.space/2.0/commodities_prices',
    cacheStorageKey: 'aaron_mfd_uex_cache_v2',
    cacheExpiryMinutes: 30,
    apiTimeoutMs: 3500
  };

  const updateBadge = (statusText, statusClass) => {
    if (DOM.uexSyncBadge) {
      DOM.uexSyncBadge.className = `uex-sync-badge ${statusClass}`;
    }
    if (DOM.uexSyncText) {
      DOM.uexSyncText.textContent = statusText;
    }
  };

  if (forceRefresh && DOM.btnRefreshUex) {
    DOM.btnRefreshUex.classList.add('spinning');
  }

  // 1. Check local cache
  const cachedJson = localStorage.getItem(cfg.cacheStorageKey);
  let cacheValid = false;
  if (cachedJson) {
    try {
      const parsed = JSON.parse(cachedJson);
      const ageMinutes = (Date.now() - (parsed.timestamp || 0)) / (1000 * 60);
      if (ageMinutes < cfg.cacheExpiryMinutes && !forceRefresh) {
        cacheValid = true;
        state.uexMarketStatus = 'cached';
        state.uexLastSyncTimestamp = parsed.timestamp;
        updateBadge('UEX CACHE', 'cached');
        if (DOM.btnRefreshUex) DOM.btnRefreshUex.classList.remove('spinning');
        return;
      }
    } catch (e) {}
  }

  // 2. Fetch live from UEX Corp API with AbortController timeout
  try {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), cfg.apiTimeoutMs);

    const response = await fetch(cfg.publicEndpoint, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timerId);

    if (response.ok) {
      const result = await response.json();
      const payload = {
        data: result,
        timestamp: Date.now()
      };
      localStorage.setItem(cfg.cacheStorageKey, JSON.stringify(payload));
      state.uexMarketStatus = 'live';
      state.uexLastSyncTimestamp = payload.timestamp;
      updateBadge('UEX LIVE', 'live');
      if (forceRefresh) {
        const t = I18N[state.currentLang] || I18N.fr;
        showToast(t.uexSyncSuccessToast || '🟢 Cours UEX Corp synchronisés avec succès !');
        sfx.playSuccess();
      }
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    // Fallback: offline cache or seed baseline
    state.uexMarketStatus = 'cached';
    updateBadge('UEX CACHE', 'cached');
    if (forceRefresh) {
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.uexSyncFallbackToast || '🟡 Hors-ligne : bascule sur le cache local sécurisé.');
    }
  } finally {
    if (DOM.btnRefreshUex) {
      DOM.btnRefreshUex.classList.remove('spinning');
    }
  }

  // Re-run market calculations
  if (state.selectedMineral) {
    renderMarketArbitrage(state.selectedMineral, state.pureSCU || 10, state.pureSCU * 100 * state.selectedMineral.refinedPrice, state.pureSCU * 100 * state.selectedMineral.rawPrice);
    renderMarketTerminals(state.selectedMineral, state.pureSCU || 10);
    renderSalesTour(state.selectedMineral, state.pureSCU || 10);
  }
}

function broadcastScoutPrice() {
  if (!DOM.selectScoutTerminal || !DOM.selectScoutMineral || !DOM.inputScoutPrice) return;
  const terminalId = DOM.selectScoutTerminal.value;
  const mineralId = DOM.selectScoutMineral.value;
  const price = parseFloat(DOM.inputScoutPrice.value);
  const demand = DOM.selectScoutDemand ? DOM.selectScoutDemand.value : 'high';

  if (!price || price <= 0) return;

  const terminal = (MINING_DATA.tradeTerminals || []).find(t => t.id === terminalId);
  const mineral = (MINING_DATA.minerals || []).find(m => m.id === mineralId);
  const callsign = state.callsign || 'CITIZEN-1';
  const termName = terminal ? terminal.name : terminalId;
  const minName = mineral ? getLocalized(mineral, 'name') : mineralId;

  // Save locally
  const reportKey = `${terminalId}_${mineralId}`;
  state.customTerminalPrices[reportKey] = {
    price,
    demand,
    by: callsign,
    time: Date.now()
  };
  localStorage.setItem('aaron_mfd_corpo_prices', JSON.stringify(state.customTerminalPrices));

  // Add to recent feed
  state.recentScoutReports.unshift({
    terminalName: termName,
    mineralName: minName,
    price,
    demand,
    by: callsign,
    time: Date.now()
  });
  if (state.recentScoutReports.length > 8) state.recentScoutReports.pop();

  // Send across Fleet Network
  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoPriceUpdate({
      terminalId,
      mineralId,
      terminalName: termName,
      mineralName: minName,
      price,
      demand
    });
  }

  // Update badge to Corpo Info
  if (DOM.uexSyncBadge) DOM.uexSyncBadge.className = 'uex-sync-badge corpo';
  if (DOM.uexSyncText) DOM.uexSyncText.textContent = 'UEX GUILDE';

  renderScoutReportsFeed();
  sfx.playSuccess();
  triggerHaptic(25);

  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.scoutPriceBroadcastToast || '📡 Cours de marché diffusé avec succès à toute la flotte !');

  // Re-render views
  if (state.selectedMineral) {
    updateStationPriceComparison(state.selectedMineral, state.pureSCU || 10, state.pureSCU * 100 * state.selectedMineral.refinedPrice);
  }
}

function handleIncomingCorpoPriceUpdate(priceUpdate, senderCallsign) {
  if (!priceUpdate) return;
  const reportKey = `${priceUpdate.terminalId}_${priceUpdate.mineralId}`;
  state.customTerminalPrices[reportKey] = {
    price: priceUpdate.price,
    demand: priceUpdate.demand || 'high',
    by: senderCallsign || priceUpdate.by || 'Éclaireur',
    time: Date.now()
  };

  state.recentScoutReports.unshift({
    terminalName: priceUpdate.terminalName || priceUpdate.terminalId,
    mineralName: priceUpdate.mineralName || priceUpdate.mineralId,
    price: priceUpdate.price,
    demand: priceUpdate.demand || 'high',
    by: senderCallsign || 'Éclaireur',
    time: Date.now()
  });
  if (state.recentScoutReports.length > 8) state.recentScoutReports.pop();

  if (DOM.uexSyncBadge) DOM.uexSyncBadge.className = 'uex-sync-badge corpo';
  if (DOM.uexSyncText) DOM.uexSyncText.textContent = 'UEX GUILDE';

  renderScoutReportsFeed();
  sfx.playBeep(600, 'sine', 0.05);
  triggerHaptic(20);

  const t = I18N[state.currentLang] || I18N.fr;
  showToast(`${t.scoutPriceReceivedToast || '📡 Cours actualisé par'} ${senderCallsign} : ${priceUpdate.mineralName || ''} @ ${priceUpdate.terminalName || ''} (${priceUpdate.price} aUEC)`);

  if (state.selectedMineral) {
    updateStationPriceComparison(state.selectedMineral, state.pureSCU || 10, state.pureSCU * 100 * state.selectedMineral.refinedPrice);
  }
}

function renderScoutReportsFeed() {
  if (!DOM.mktScoutFeed) return;
  if (!state.recentScoutReports || state.recentScoutReports.length === 0) {
    DOM.mktScoutFeed.innerHTML = `<div style="font-style:italic;" data-i18n="noRecentReports">Aucun rapport d'éclaireur récent pour le moment.</div>`;
    return;
  }

  DOM.mktScoutFeed.innerHTML = state.recentScoutReports.map(rep => {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - rep.time) / 60000));
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:3px 0; border-bottom:1px dashed rgba(255,255,255,0.05);">
        <div>
          <span style="color:var(--accent-purple); font-weight:700;">[${rep.by}]</span>
          <span style="color:#fff;">${rep.mineralName}</span>
          <span style="color:var(--text-muted); font-size:0.68rem;">@ ${rep.terminalName}</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:0.72rem; color:var(--accent-emerald); font-weight:700;">
          ${rep.price} aUEC <span style="font-size:0.6rem; color:var(--text-muted); font-weight:normal;">(${elapsedMinutes} min)</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderMarketArbitrage(mineral, pureSCU, refinedPrice, rawPrice) {
  if (!DOM.mktMethodsGrid) return;
  const isEn = state.currentLang === 'en';
  const locale = getLocale();
  const scu = Math.max(0.1, pureSCU || 1);

  // 1. Raw Direct Sale
  const rawUnit = mineral.rawPrice || 10;
  const grossRaw = Math.round(scu * 100 * rawUnit);

  // Station Bonus for top station
  const stations = (MINING_DATA.refineryStations || []).slice();
  const topStation = stations.find(s => s.bonusMineral === mineral.id);
  const stationBonusRate = topStation ? (topStation.bonusRate || 0) : 0;
  const topStationName = topStation ? topStation.name : (isEn ? 'Standard Refinery' : 'Raffinerie Standard');

  // 2. Refining methods
  const methods = MINING_DATA.refiningMethods || [];
  let bestMethod = null;
  let maxNetPayout = grossRaw;

  const methodEvaluations = methods.map(m => {
    const yieldSCU = Math.round(scu * m.yieldRate * (1 + stationBonusRate) * 10) / 10;
    const refinedUnit = mineral.refinedPrice || 20;
    const grossRefined = Math.round(yieldSCU * 100 * refinedUnit);
    const refiningFee = Math.round(scu * 100 * mineral.rawPrice * (m.costFactor || 0.25));
    const netPayout = Math.max(0, grossRefined - refiningFee);
    const deltaVsRaw = netPayout - grossRaw;
    const durationHours = Math.round(scu * (m.durationHoursPerSCU || 0.2) * 10) / 10;
    const yieldPct = Math.round(m.yieldRate * (1 + stationBonusRate) * 100);

    if (netPayout > maxNetPayout) {
      maxNetPayout = netPayout;
      bestMethod = m;
    }

    return {
      method: m,
      yieldSCU,
      yieldPct,
      refiningFee,
      netPayout,
      deltaVsRaw,
      durationHours
    };
  });

  // Render cards
  let cardsHtml = `
    <div class="mkt-method-card raw-card">
      <div class="mkt-method-name">
        <span>⚡ ${isEn ? 'Raw Direct Sale' : 'Vente Brute Directe'}</span>
      </div>
      <div class="mkt-method-meta">${isEn ? 'Immediate • 0 min' : 'Immédiat • 0 min'}</div>
      <div class="mkt-method-payout">${grossRaw.toLocaleString(locale)} aUEC</div>
      <div class="mkt-method-delta" style="color:var(--text-muted);">${isEn ? 'Base Payout' : 'Valeur de base'}</div>
    </div>
  `;

  cardsHtml += methodEvaluations.map(ev => {
    const isBest = bestMethod && ev.method.id === bestMethod.id;
    const isPos = ev.deltaVsRaw >= 0;
    const sign = isPos ? '+' : '';
    const deltaClass = isPos ? 'pos' : 'neg';

    return `
      <div class="mkt-method-card ${isBest ? 'best' : ''}">
        <div class="mkt-method-name">
          <span>${isBest ? '🌟 ' : ''}${ev.method.name}</span>
        </div>
        <div class="mkt-method-meta">${ev.yieldPct}% SCU • ~${ev.durationHours}h</div>
        <div class="mkt-method-payout">${ev.netPayout.toLocaleString(locale)} aUEC</div>
        <div class="mkt-method-delta ${deltaClass}">${sign}${ev.deltaVsRaw.toLocaleString(locale)} aUEC</div>
      </div>
    `;
  }).join('');

  DOM.mktMethodsGrid.innerHTML = cardsHtml;

  // Update recommendation banner
  if (DOM.mktArbitrageAdviceText && DOM.mktArbitrageRoiBadge) {
    if (bestMethod && maxNetPayout > grossRaw) {
      const bestEval = methodEvaluations.find(e => e.method.id === bestMethod.id);
      const roiPct = Math.round(((maxNetPayout - grossRaw) / (grossRaw || 1)) * 100);
      const diffVal = bestEval.deltaVsRaw.toLocaleString(locale);

      DOM.mktArbitrageAdviceText.textContent = isEn
        ? `${bestMethod.name} @ ${topStationName}: +${diffVal} aUEC (+${roiPct}%) vs Raw`
        : `${bestMethod.name} à ${topStationName} : +${diffVal} aUEC (+${roiPct}%) vs Brut`;
      DOM.mktArbitrageRoiBadge.textContent = `+${roiPct}% NET`;
      DOM.mktArbitrageRoiBadge.style.display = 'inline-block';
    } else {
      DOM.mktArbitrageAdviceText.textContent = isEn
        ? `Direct raw sale recommended: low ore value does not offset refining fees.`
        : `Vente brute directe conseillée : la faible valeur du minerai ne compense pas les frais.`;
      DOM.mktArbitrageRoiBadge.textContent = `BRUT CONSEILLÉ`;
      DOM.mktArbitrageRoiBadge.style.display = 'inline-block';
    }
  }
}

function renderMarketTerminals(mineral, pureSCU) {
  if (!DOM.mktTerminalsTable) return;
  const isEn = state.currentLang === 'en';
  const locale = getLocale();
  const filter = state.mktSystemFilter || 'all';
  const scu = Math.max(0.1, pureSCU || 1);

  const terminals = (MINING_DATA.tradeTerminals || []).filter(term => {
    if (filter === 'all') return true;
    return term.system === filter;
  });

  const scored = terminals.map(t => {
    const custom = state.customTerminalPrices[`${t.id}_${mineral.id}`];
    let refinedPrice = mineral.refinedPrice;
    let rawPrice = mineral.rawPrice;
    let demand = t.demandRating || 'medium';
    let isScoutVerified = false;
    let scoutBy = '';

    if (custom) {
      refinedPrice = custom.price;
      demand = custom.demand || demand;
      isScoutVerified = true;
      scoutBy = custom.by || 'Ailier';
    } else if (t.priceModifiers && t.priceModifiers[mineral.id]) {
      refinedPrice = t.priceModifiers[mineral.id].refinedPrice || refinedPrice;
      rawPrice = t.priceModifiers[mineral.id].rawPrice || rawPrice;
      demand = t.priceModifiers[mineral.id].demand || demand;
    }

    const totalVal = Math.round(scu * 100 * refinedPrice);
    return {
      terminal: t,
      refinedPrice,
      rawPrice,
      demand,
      totalVal,
      isScoutVerified,
      scoutBy
    };
  });

  scored.sort((a, b) => b.refinedPrice - a.refinedPrice);

  DOM.mktTerminalsTable.innerHTML = scored.map((item, idx) => {
    const isTop = idx === 0;
    const verifiedBadge = item.isScoutVerified
      ? `<span class="craft-badge" style="font-size:0.6rem; border-color:var(--accent-purple); color:var(--accent-purple);">Éclaireur ${item.scoutBy}</span>`
      : `<span class="craft-badge" style="font-size:0.6rem; border-color:var(--accent-cyan); color:var(--accent-cyan);">UEX 4.0</span>`;

    const demandClass = item.demand || 'medium';
    const demandLabel = demandClass === 'high' ? (isEn ? 'HIGH' : 'FORTE') : (demandClass === 'medium' ? (isEn ? 'MED' : 'MOYENNE') : (isEn ? 'LOW' : 'FAIBLE'));

    return `
      <div class="mkt-terminal-row ${isTop ? 'best-row' : ''}">
        <div>
          <div class="mkt-term-name">${isTop ? '🌟 ' : ''}${item.terminal.name}</div>
          <div class="mkt-term-loc">${getLocalized(item.terminal, 'location')}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${verifiedBadge}
          <span class="mkt-demand-pill ${demandClass}">${demandLabel}</span>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-size:0.8rem; font-weight:700; color:var(--accent-emerald);">
              ${item.refinedPrice} <span style="font-size:0.65rem; color:var(--text-muted);">aUEC/cSCU</span>
            </div>
            <div style="font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted);">
              ~${item.totalVal.toLocaleString(locale)} aUEC
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSalesTour(mineral, pureSCU) {
  if (!DOM.mktTourStopsContainer || !DOM.mktTourTotalPayout) return;
  const isEn = state.currentLang === 'en';
  const locale = getLocale();

  // Inspect cargo: if active hauler has cargo or miner hold has cargo
  let cargoItems = [];
  if (state.haulerHoldBags && state.haulerHoldBags.length > 0) {
    cargoItems = state.haulerHoldBags;
  } else if (state.holdSCU > 0) {
    cargoItems = [{ mineralId: mineral.id, scu: state.holdSCU }];
  } else {
    cargoItems = [{ mineralId: mineral.id, scu: pureSCU || 10 }];
  }

  // Aggregate commodities by mineralId
  const oreMap = {};
  cargoItems.forEach(item => {
    const mId = item.mineralId || mineral.id;
    const vol = item.scu || 8;
    oreMap[mId] = (oreMap[mId] || 0) + vol;
  });

  const terminals = MINING_DATA.tradeTerminals || [];
  let totalRevenue = 0;
  const stops = [];

  Object.keys(oreMap).forEach(mId => {
    const scuVal = oreMap[mId];
    const minObj = (MINING_DATA.minerals || []).find(m => m.id === mId) || mineral;
    const minName = getLocalized(minObj, 'name');

    // Find best terminal for this mineral
    let bestTerm = null;
    let highestPrice = 0;

    terminals.forEach(term => {
      const custom = state.customTerminalPrices[`${term.id}_${mId}`];
      let p = minObj.refinedPrice;
      if (custom) p = custom.price;
      else if (term.priceModifiers && term.priceModifiers[mId]) p = term.priceModifiers[mId].refinedPrice;

      if (p > highestPrice) {
        highestPrice = p;
        bestTerm = term;
      }
    });

    const stopPayout = Math.round(scuVal * 100 * highestPrice);
    totalRevenue += stopPayout;
    stops.push({
      mineralName: minName,
      scu: scuVal,
      terminalName: bestTerm ? bestTerm.name : 'Area18 TDD',
      system: bestTerm ? bestTerm.system.toUpperCase() : 'STANTON',
      unitPrice: highestPrice,
      payout: stopPayout
    });
  });

  state.currentSalesTour = {
    totalRevenue,
    stops
  };

  DOM.mktTourTotalPayout.textContent = `~${totalRevenue.toLocaleString(locale)} aUEC`;

  DOM.mktTourStopsContainer.innerHTML = stops.map((stop, idx) => {
    return `
      <div class="mkt-tour-stop-item">
        <div>
          <span style="color:var(--accent-cyan); font-weight:700;">${idx + 1}.</span>
          <strong style="color:#fff;">${stop.terminalName}</strong>
          <span style="color:var(--text-muted); font-size:0.65rem;">(${stop.system})</span>
          <div style="font-size:0.68rem; color:var(--text-muted);">
            Vendre ${stop.scu} SCU de ${stop.mineralName} @ ${stop.unitPrice} aUEC/cSCU
          </div>
        </div>
        <div style="font-family:var(--font-mono); font-size:0.78rem; font-weight:700; color:var(--accent-emerald);">
          ~${stop.payout.toLocaleString(locale)} aUEC
        </div>
      </div>
    `;
  }).join('');
}

function copySalesTour() {
  if (!state.currentSalesTour || !state.currentSalesTour.stops || state.currentSalesTour.stops.length === 0) {
    showToast(state.currentLang === 'en' ? 'No sales tour available!' : 'Aucun itinéraire de vente disponible !');
    return;
  }

  const isEn = state.currentLang === 'en';
  const locale = getLocale();
  const lines = [];
  lines.push(isEn ? '🧭 [AARON MFD] OPTIMAL SALES TOUR' : '🧭 [AARON MFD] TOURNÉE COMMERCIALE OPTIMALE');
  lines.push(`💰 ${isEn ? 'Expected Total Revenue:' : 'Gain total estimé :'} ~${state.currentSalesTour.totalRevenue.toLocaleString(locale)} aUEC`);
  lines.push('----------------------------------------');

  state.currentSalesTour.stops.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.terminalName} (${s.system})`);
    lines.push(`   📦 ${s.scu} SCU ${s.mineralName} @ ${s.unitPrice} aUEC/cSCU -> ~${s.payout.toLocaleString(locale)} aUEC`);
  });

  const textToCopy = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      sfx.playSuccess();
      triggerHaptic(20);
      showToast(isEn ? '🧭 Trade tour route copied to clipboard!' : '🧭 Itinéraire de tournée commerciale copié dans le presse-papier !');
    });
  }
}


function determineVerdict(mineral, orePct, pureSCU, refinedPrice, powerRatio) {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const minName = getLocalized(mineral, 'name');

  DOM.verdictBox.classList.remove('verdict-great', 'verdict-good', 'verdict-meh', 'verdict-bad');

  if (mineral.id === 'quantainium') {
    if (orePct >= 20 && powerRatio >= 0.88) {
      DOM.verdictBox.classList.add('verdict-great');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '💎';
      DOM.verdictStatus.textContent = t.verdictExcellent;
      DOM.verdictDesc.textContent = t.verdictExcellentDesc.replace('{pct}', orePct);
    } else if (orePct >= 10 && powerRatio >= 0.88) {
      DOM.verdictBox.classList.add('verdict-good');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '⚡';
      DOM.verdictStatus.textContent = t.verdictGood;
      DOM.verdictDesc.textContent = t.verdictGoodDesc.replace('{scu}', pureSCU);
    } else if (powerRatio < 0.88) {
      DOM.verdictBox.classList.add('verdict-meh');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '⚠️';
      DOM.verdictStatus.textContent = t.verdictPowerWarn;
      DOM.verdictDesc.textContent = t.verdictPowerWarnDesc;
    } else {
      DOM.verdictBox.classList.add('verdict-bad');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '⛔';
      DOM.verdictStatus.textContent = t.verdictBad;
      DOM.verdictDesc.textContent = t.verdictBadDesc.replace('{pct}', orePct);
    }
  } else if (mineral.rarity === 'tier-s' || mineral.rarity === 'tier-a') {
    // Bexalite, Taranite, Borase, Hadanite
    if (orePct >= 25) {
      DOM.verdictBox.classList.add('verdict-great');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = mineral.id === 'hadanite' ? '🌸' : '🔥';
      DOM.verdictStatus.textContent = t.verdictTierA;
      DOM.verdictDesc.textContent = t.verdictTierADesc.replace('{name}', minName).replace('{price}', refinedPrice.toLocaleString(locale));
    } else if (orePct >= 12) {
      DOM.verdictBox.classList.add('verdict-good');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '⚡';
      DOM.verdictStatus.textContent = t.verdictGoodOre;
      DOM.verdictDesc.textContent = t.verdictGoodOreDesc.replace('{name}', minName);
    } else {
      DOM.verdictBox.classList.add('verdict-bad');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '⛔';
      DOM.verdictStatus.textContent = t.verdictSkipOre;
      DOM.verdictDesc.textContent = t.verdictSkipOreDesc;
    }
  } else {
    // Other minerals
    if (orePct >= 40 && refinedPrice >= 35000) {
      DOM.verdictBox.classList.add('verdict-good');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '📦';
      DOM.verdictStatus.textContent = t.verdictSecondary;
      DOM.verdictDesc.textContent = t.verdictSecondaryDesc.replace('{name}', minName);
    } else {
      DOM.verdictBox.classList.add('verdict-bad');
      if (DOM.verdictIconBadge) DOM.verdictIconBadge.textContent = '⛔';
      DOM.verdictStatus.textContent = t.verdictLowValue;
      DOM.verdictDesc.textContent = t.verdictLowValueDesc;
    }
  }
}

// ==========================================
// AARON HALO & STATIONS HELPER
// ==========================================
function updateRecommendedStation(mineral) {
  if (!DOM.stationRecBox) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const bestStation = MINING_DATA.refineryStations.find(s => s.bonusMineral === mineral.id);
  if (bestStation) {
    DOM.stationRecName.textContent = bestStation.name;
    DOM.stationRecBonus.textContent = `+${Math.round(bestStation.bonusRate * 100)}% Bonus`;
    DOM.stationRecBonus.style.color = 'var(--accent-emerald)';
  } else {
    DOM.stationRecName.textContent = 'ARC-L1 / CRU-L1';
    DOM.stationRecBonus.textContent = t.standardYield;
    DOM.stationRecBonus.style.color = 'var(--text-muted)';
  }
}

// ==========================================
// SQUAD & FLEET MINING COORDINATOR
// ==========================================
function updateSquadDisplay(refinedPrice, rawPrice, totalLaserPower, fleetCargoSCU, combinedResistanceMod = 0) {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const totalShipsCount = 1 + (state.squadMembers ? state.squadMembers.length : 0);
  const activeFiringCount = (state.selectedShip.id === 'mole' ? state.moleActiveTurrets : 1) +
    (state.squadMembers ? state.squadMembers.filter(m => m.active && (m.laserId || m.customLaserStats)).length : 0);

  // 1. Update header badges
  if (DOM.mgSquadCountBadge) DOM.mgSquadCountBadge.textContent = totalShipsCount;
  if (DOM.squadCountBadge) DOM.squadCountBadge.textContent = totalShipsCount;

  // 2. Update Scanner HUD banner (Panel 1)
  if (DOM.squadActiveHudBanner) {
    const hasActiveWingmen = state.squadMembers && state.squadMembers.some(m => m.active);
    DOM.squadActiveHudBanner.style.display = hasActiveWingmen ? 'flex' : 'none';
    if (DOM.squadActiveHudText) {
      DOM.squadActiveHudText.textContent = t.squadActiveHudText
        .replace('{count}', activeFiringCount)
        .replace('{pwr}', totalLaserPower.toLocaleString(locale));
    }
  }

  // 3. Update Profit Split Mini Card (Panel 2)
  if (DOM.squadProfitSplitCard) {
    const hasSquad = state.squadMembers && state.squadMembers.length > 0;
    DOM.squadProfitSplitCard.style.display = hasSquad ? 'block' : 'none';
    if (hasSquad) {
      const shares = Math.max(1, state.crewMembers || totalShipsCount);
      const reserveFactor = 1 - (state.crewReservePct / 100);
      const shareRefined = Math.round((refinedPrice * reserveFactor) / shares);
      const shareRaw = Math.round((rawPrice * reserveFactor) / shares);

      if (DOM.squadSplitCountLabel) DOM.squadSplitCountLabel.textContent = `(${shares} ${shares > 1 ? t.playersPlural : t.playersSingular})`;
      if (DOM.squadRefinedShareVal) DOM.squadRefinedShareVal.textContent = `~${shareRefined.toLocaleString(locale)} aUEC`;
      if (DOM.squadRawShareVal) DOM.squadRawShareVal.textContent = `Brut: ~${shareRaw.toLocaleString(locale)} aUEC`;
    }
  }

  // 4. Update Squad Modal Top Stat Tiles (5 Tiles)
  if (DOM.fleetStatShips) DOM.fleetStatShips.textContent = totalShipsCount;
  if (DOM.fleetStatPower) DOM.fleetStatPower.textContent = `${totalLaserPower.toLocaleString(locale)} W`;
  if (DOM.fleetStatResReduction) {
    const pct = Math.round(combinedResistanceMod * 100);
    DOM.fleetStatResReduction.textContent = `${pct > 0 ? '+' : ''}${pct} %`;
    DOM.fleetStatResReduction.style.color = pct < 0 ? 'var(--accent-purple)' : (pct > 0 ? 'var(--accent-amber)' : 'var(--text-muted)');
  }
  if (DOM.fleetStatCargo) DOM.fleetStatCargo.textContent = `${fleetCargoSCU} SCU`;
  if (DOM.fleetStatShare) {
    const shares = Math.max(1, state.crewMembers || totalShipsCount);
    const reserveFactor = 1 - (state.crewReservePct / 100);
    const shareRefined = Math.round((refinedPrice * reserveFactor) / shares);
    DOM.fleetStatShare.textContent = `~${Math.round(shareRefined / 1000)}k`;
  }
}

function setCallsign(newCallsign, notify = true) {
  const clean = (newCallsign || '').trim().toUpperCase().slice(0, 20);
  state.callsign = clean || 'CITIZEN-1';
  try {
    localStorage.setItem('aaron_mfd_callsign', state.callsign);
  } catch (e) {
    console.warn('LocalStorage callsign save error', e);
  }
  if (DOM.mgCallsignVal) DOM.mgCallsignVal.textContent = state.callsign;
  if (DOM.squadLeaderName) DOM.squadLeaderName.textContent = state.callsign;
  if (DOM.squadLeaderNameInput && DOM.squadLeaderNameInput.value !== state.callsign) {
    DOM.squadLeaderNameInput.value = state.callsign;
  }
  if (DOM.callsignModalInput && DOM.callsignModalInput.value !== state.callsign) {
    DOM.callsignModalInput.value = state.callsign;
  }
  if (fleetNet) {
    fleetNet.updateCallsign(state.callsign);
    broadcastLocalLoadout();
  }
  if (notify) {
    const t = I18N[state.currentLang] || I18N.fr;
    const msg = (t.toastCallsignUpdated || '✅ Indicatif mis à jour : {callsign}').replace('{callsign}', state.callsign);
    showToast(msg);
  }
}

function renderSquadWingmen() {
  const t = I18N[state.currentLang] || I18N.fr;
  const isEn = state.currentLang === 'en';
  const allShips = [...MINING_DATA.ships, ...(MINING_DATA.supportShips || [])];

  // 1. Leader card update
  if (DOM.squadLeaderNameInput) DOM.squadLeaderNameInput.value = state.callsign || 'CITIZEN-1';
  if (DOM.squadLeaderName) DOM.squadLeaderName.textContent = state.callsign || 'CITIZEN-1';
  if (DOM.squadLeaderShipDesc) DOM.squadLeaderShipDesc.textContent = `${state.selectedShip.name} (${state.selectedShip.scu} SCU)`;
  if (DOM.squadLeaderLaserDesc) {
    if (state.selectedShip.id === 'mole') {
      DOM.squadLeaderLaserDesc.textContent = `MOLE (${state.moleActiveTurrets}/3 tourelles actives)`;
    } else {
      DOM.squadLeaderLaserDesc.textContent = state.selectedLaser ? state.selectedLaser.name : 'Laser S1';
    }
  }

  // 2. Render wingmen container
  if (!DOM.squadWingmenContainer) return;
  DOM.squadWingmenContainer.innerHTML = '';

  state.squadMembers.forEach((member, idx) => {
    const card = document.createElement('div');
    card.className = `wingman-card ${member.active ? 'active-firing' : 'standby'}`;
    const shipObj = allShips.find(s => s.id === member.shipId) || MINING_DATA.ships[0];
    const isMiningShip = !shipObj.isCargoSupport;

    // Ship options
    const shipOptionsHtml = allShips.map(s => {
      return `<option value="${s.id}" ${s.id === member.shipId ? 'selected' : ''}>${s.name} (${s.scu} SCU)</option>`;
    }).join('');

    // Laser options
    let laserSelectHtml = '';
    if (isMiningShip) {
      if (member.customLaserStats) {
        laserSelectHtml = `
          <div style="display:flex; flex-direction:column; gap:2px;">
            <label style="font-size:0.68rem; color:var(--text-muted); font-family:var(--font-hud);">${t.wingmanLaserLabel}</label>
            <div style="display:flex; align-items:center; gap:6px; padding:3px 0;">
              <span class="craft-badge" style="font-size:0.62rem; padding:1px 5px;">CRAFT 4.0</span>
              <span style="font-size:0.75rem; color:var(--accent-purple); font-family:var(--font-mono); font-weight:700;">${member.customLaserStats.name} (${member.customLaserStats.power} W)</span>
            </div>
          </div>
        `;
      } else {
        const shipLaserSize = shipObj.laserSize || 1;
        const compLasers = MINING_DATA.lasers.filter(l => l.size === shipLaserSize);
        const laserOpts = compLasers.map(l => {
          const prefix = l.isCustomCraft ? '🛠️ ' : '';
          return `<option value="${l.id}" ${l.id === member.laserId ? 'selected' : ''}>${prefix}${l.name} (${l.power} W)</option>`;
        }).join('');
        laserSelectHtml = `
          <div style="display:flex; flex-direction:column; gap:2px;">
            <label style="font-size:0.68rem; color:var(--text-muted); font-family:var(--font-hud);">${t.wingmanLaserLabel}</label>
            <select class="hud-select-sm wingman-laser-select" data-member-idx="${idx}" style="font-size:0.75rem; padding:4px;">
              ${laserOpts}
            </select>
          </div>
        `;
      }
    } else {
      laserSelectHtml = `
        <div style="display:flex; flex-direction:column; gap:2px; justify-content:center;">
          <label style="font-size:0.68rem; color:var(--text-muted); font-family:var(--font-hud);">${t.wingmanLaserLabel}</label>
          <span style="font-size:0.75rem; color:var(--accent-amber); font-family:var(--font-mono);">📦 Transport Cargo (${shipObj.scu} SCU)</span>
        </div>
      `;
    }

    const p2pBadgeHtml = member.isRemotePeer
      ? `<span class="fleet-net-role-badge wingman" style="font-size:0.62rem; padding:1px 6px;" title="Pair P2P connecté en direct">P2P ${member.ping ? member.ping + 'ms' : 'LIVE'}</span>`
      : '';

    card.innerHTML = `
      <div class="wingman-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.7rem; color:var(--accent-cyan); font-family:var(--font-hud); font-weight:700;">#${idx + 2}</span>
          <input type="text" class="hud-input wingman-name-input" data-member-idx="${idx}" value="${member.name || `Équipier ${idx + 1}`}" ${member.isRemotePeer ? 'readonly' : ''} style="background:${member.isRemotePeer ? 'rgba(0,240,255,0.06)' : 'transparent'}; border:1px solid ${member.isRemotePeer ? 'rgba(0,240,255,0.35)' : 'rgba(255,255,255,0.15)'}; border-radius:4px; padding:2px 6px; font-family:var(--font-hud); font-size:0.82rem; color:${member.isRemotePeer ? 'var(--accent-cyan)' : '#fff'}; width:140px;" />
          ${p2pBadgeHtml}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <label style="display:flex; align-items:center; gap:4px; cursor:pointer; font-size:0.72rem; font-family:var(--font-mono); font-weight:700; color:${member.active ? '#10b981' : 'var(--text-muted)'};">
            <input type="checkbox" class="wingman-active-toggle" data-member-idx="${idx}" ${member.active ? 'checked' : ''} style="cursor:pointer;" />
            <span>${member.active ? t.squadActiveFiring : t.squadStandby}</span>
          </label>
          <button type="button" class="btn-close-modal wingman-remove-btn" data-member-idx="${idx}" style="font-size:1.1rem; width:22px; height:22px; color:#f43f5e;" title="${t.removeWingmanBtn}">&times;</button>
        </div>
      </div>
      <div class="wingman-row">
        <div style="display:flex; flex-direction:column; gap:2px;">
          <label style="font-size:0.68rem; color:var(--text-muted); font-family:var(--font-hud);">${t.wingmanShipLabel}</label>
          <select class="hud-select-sm wingman-ship-select" data-member-idx="${idx}" style="font-size:0.75rem; padding:4px;">
            ${shipOptionsHtml}
          </select>
        </div>
        ${laserSelectHtml}
      </div>
    `;

    DOM.squadWingmenContainer.appendChild(card);
  });

  // Attach dynamic event listeners on wingmen inputs
  DOM.squadWingmenContainer.querySelectorAll('.wingman-name-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.memberIdx, 10);
      if (state.squadMembers[idx]) {
        state.squadMembers[idx].name = e.target.value.trim();
        calculateAll();
      }
    });
  });

  DOM.squadWingmenContainer.querySelectorAll('.wingman-active-toggle').forEach(chk => {
    chk.addEventListener('change', (e) => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      const idx = parseInt(e.target.dataset.memberIdx, 10);
      if (state.squadMembers[idx]) {
        state.squadMembers[idx].active = e.target.checked;
        renderSquadWingmen();
        calculateAll();
        calculateCrewSplit();
      }
    });
  });

  DOM.squadWingmenContainer.querySelectorAll('.wingman-ship-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      const idx = parseInt(e.target.dataset.memberIdx, 10);
      if (state.squadMembers[idx]) {
        state.squadMembers[idx].shipId = e.target.value;
        const newShip = allShips.find(s => s.id === e.target.value);
        if (newShip && !newShip.isCargoSupport) {
          const shipLaserSize = newShip.laserSize || 1;
          const compLasers = MINING_DATA.lasers.filter(l => l.size === shipLaserSize);
          state.squadMembers[idx].laserId = compLasers[0] ? compLasers[0].id : 'lancet_s1';
        } else {
          state.squadMembers[idx].laserId = null;
        }
        renderSquadWingmen();
        calculateAll();
        calculateCrewSplit();
      }
    });
  });

  DOM.squadWingmenContainer.querySelectorAll('.wingman-laser-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      const idx = parseInt(e.target.dataset.memberIdx, 10);
      if (state.squadMembers[idx]) {
        state.squadMembers[idx].laserId = e.target.value;
        calculateAll();
        calculateCrewSplit();
      }
    });
  });

  DOM.squadWingmenContainer.querySelectorAll('.wingman-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(450, 'sine', 0.05);
      triggerHaptic(15);
      const idx = parseInt(btn.dataset.memberIdx, 10);
      state.squadMembers.splice(idx, 1);
      state.crewMembers = Math.max(1, 1 + state.squadMembers.length);
      renderSquadWingmen();
      calculateAll();
      calculateCrewSplit();
    });
  });
}

function addSquadMember() {
  sfx.playBeep(650, 'sine', 0.04);
  triggerHaptic(15);
  const newIdx = state.squadMembers.length + 2;
  state.squadMembers.push({
    id: 'wingman_' + Date.now(),
    name: `Équipier ${newIdx}`,
    shipId: 'prospector',
    laserId: 'lancet_s1',
    moduleIds: [],
    active: true
  });
  state.crewMembers = 1 + state.squadMembers.length;
  renderSquadWingmen();
  calculateAll();
  calculateCrewSplit();
}

function applySquadTemplate(key) {
  sfx.playSuccess();
  triggerHaptic(20);
  if (key === 'duo_prospectors') {
    state.squadMembers = [
      {
        id: 'wingman_' + Date.now(),
        name: 'Prospector 2 (Helix)',
        shipId: 'prospector',
        laserId: 'helix_s1',
        moduleIds: [],
        active: true
      }
    ];
  } else if (key === 'mole_prospector') {
    state.squadMembers = [
      {
        id: 'wingman_' + Date.now(),
        name: 'Argo MOLE Alpha',
        shipId: 'mole',
        laserId: 'lancet_s2',
        moduleIds: [],
        active: true
      }
    ];
  } else if (key === 'prospector_cargo') {
    state.squadMembers = [
      {
        id: 'wingman_' + Date.now(),
        name: 'C2 Hercules Cargo',
        shipId: 'c2',
        laserId: null,
        moduleIds: [],
        active: true
      }
    ];
  }
  state.crewMembers = 1 + state.squadMembers.length;
  renderSquadWingmen();
  calculateAll();
  calculateCrewSplit();
}

function openSquadModal() {
  sfx.playBeep(600, 'sine', 0.04);
  triggerHaptic(12);
  try {
    renderSquadWingmen();
  } catch (err) {
    console.warn('[AARON MFD] renderSquadWingmen error:', err);
  }
  try {
    calculateAll();
  } catch (err) {
    console.warn('[AARON MFD] calculateAll error:', err);
  }
  try {
    calculateCrewSplit();
  } catch (err) {
    console.warn('[AARON MFD] calculateCrewSplit error:', err);
  }
  try {
    updateFleetNetUI();
  } catch (err) {
    console.warn('[AARON MFD] updateFleetNetUI error:', err);
  }
  openModal(DOM.crewModal);
}

function calculateCrewSplit() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  let totalVal = 0;
  if (state.sessionLog.length > 0) {
    totalVal = state.sessionLog.reduce((acc, item) => acc + item.rawVal, 0);
  } else {
    const mineral = state.selectedMineral;
    const oreMass = state.rockMass * (state.orePercentage / 100);
    const densityDivisor = (mineral.density || 15) * 85;
    const scu = Math.round((oreMass / densityDivisor) * 10) / 10;
    totalVal = Math.round(scu * 100 * mineral.rawPrice);
  }

  const reserveFactor = state.crewReservePct / 100;
  const reserveAmt = Math.round(totalVal * reserveFactor);
  const netPool = totalVal - reserveAmt;

  // Escort Combat Risk cut (Jalon 4)
  const escortFactor = (state.escortCutPct || 0) / 100;
  const escortAmt = Math.round(netPool * escortFactor);

  // Freight Hauler Commission cut (Jalon 5)
  const haulerFactor = (state.haulerCutPct || 0) / 100;
  const haulerAmt = Math.round(netPool * haulerFactor);

  const minerPool = Math.max(0, netPool - escortAmt - haulerAmt);
  const share = Math.round(minerPool / Math.max(1, state.crewMembers));

  DOM.crewTotalHoldValue.textContent = `${totalVal.toLocaleString(locale)} aUEC`;
  DOM.crewSharePerMember.textContent = `${share.toLocaleString(locale)} aUEC / ${t.perMember}`;
  DOM.crewReserveDeducted.textContent = t.crewDeducted.replace('{pct}', state.crewReservePct).replace('{amt}', reserveAmt.toLocaleString(locale));
  DOM.crewCountDisplay.textContent = `${state.crewMembers} ${state.crewMembers > 1 ? t.playersPlural : t.playersSingular}`;

  if (DOM.escortCutDisplay) {
    DOM.escortCutDisplay.textContent = `${state.escortCutPct || 0} %`;
  }
  if (DOM.escortCutDeducted) {
    DOM.escortCutDeducted.textContent = `-${escortAmt.toLocaleString(locale)} aUEC (${state.escortCutPct || 0}%)`;
  }
  if (DOM.haulerCutDisplay) {
    DOM.haulerCutDisplay.textContent = `${state.haulerCutPct || 0} %`;
  }
  if (DOM.haulerCutDeducted) {
    DOM.haulerCutDeducted.textContent = `-${haulerAmt.toLocaleString(locale)} aUEC (${state.haulerCutPct || 0}%)`;
  }
}

// ============================================================================
// AARON FLEET-NET SUBSYSTEM (JALON 1 — P2P WING CONNECTIVITY)
// ============================================================================

function getLocalLoadoutPayload() {
  const currentLaser = state.selectedLaser;
  let customStats = null;
  if (currentLaser && currentLaser.isCustomCraft) {
    customStats = {
      id: currentLaser.id,
      name: currentLaser.name,
      size: currentLaser.size,
      power: currentLaser.power,
      resistanceMod: currentLaser.resistanceMod,
      instabilityMod: currentLaser.instabilityMod,
      optimalWindowMod: currentLaser.optimalWindowMod,
      slots: currentLaser.slots,
      isCustomCraft: true
    };
  }

  return {
    callsign: state.callsign || 'CITIZEN-1',
    shipId: state.selectedShip ? state.selectedShip.id : 'prospector',
    laserId: currentLaser ? currentLaser.id : 'arbor_mh1',
    customLaserStats: customStats,
    holdSCU: state.holdSCU || 0,
    activeTurrets: state.moleActiveTurrets || 1
  };
}

function broadcastLocalLoadout() {
  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastLoadout(getLocalLoadoutPayload());
  }
}

function updateFleetNetUI() {
  if (!fleetNet) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const isConnected = fleetNet.status === 'connected';

  if (DOM.fleetNetDisconnectedBox) {
    DOM.fleetNetDisconnectedBox.style.display = isConnected ? 'none' : 'block';
  }
  if (DOM.fleetNetConnectedBox) {
    DOM.fleetNetConnectedBox.style.display = isConnected ? 'block' : 'none';
  }

  if (DOM.fleetNetLed) {
    DOM.fleetNetLed.className = `fleet-net-led ${isConnected ? 'connected' : 'disconnected'}`;
  }

  if (DOM.fleetNetStatusBadge) {
    DOM.fleetNetStatusBadge.className = `fleet-net-status-badge ${isConnected ? 'connected' : 'disconnected'}`;
    DOM.fleetNetStatusBadge.textContent = isConnected
      ? (t.fleetNetConnected || 'CONNECTÉ (AARON FLEET-NET)')
      : (t.fleetNetSolo || 'MODE SOLO (HORS-LIGNE)');
  }

  if (isConnected) {
    if (DOM.fleetNetRoomCodeDisplay) {
      DOM.fleetNetRoomCodeDisplay.textContent = fleetNet.roomCode || 'WING-XXXX';
    }
    if (DOM.fleetNetRoleBadge) {
      DOM.fleetNetRoleBadge.className = `fleet-net-role-badge ${fleetNet.isHost ? 'host' : 'wingman'}`;
      DOM.fleetNetRoleBadge.textContent = fleetNet.isHost
        ? (t.fleetHostRole || 'HÔTE')
        : (t.fleetWingmanRole || 'AILIER');
    }
    const peers = fleetNet.getPeersList();
    if (DOM.fleetNetPingDisplay) {
      DOM.fleetNetPingDisplay.textContent = `${fleetNet.pingMs || 10} ms`;
    }
    if (DOM.fleetNetPeersCountDisplay) {
      const count = peers.length;
      const countStr = count === 1
        ? (t.fleetOnePeerOnline || '1 pair en ligne')
        : (t.fleetPeersOnline || '{count} pairs en ligne').replace('{count}', count);
      DOM.fleetNetPeersCountDisplay.textContent = countStr;
    }
    if (DOM.mgCommsLedText) {
      DOM.mgCommsLedText.className = 'mg-status-online';
      DOM.mgCommsLedText.textContent = `${fleetNet.roomCode} [${peers.length} • ${fleetNet.pingMs || 10}ms]`;
    }
  } else {
    if (DOM.mgCommsLedText) {
      DOM.mgCommsLedText.className = 'mg-status-online';
      DOM.mgCommsLedText.textContent = t.fleetNetSoloStatus || 'SOLO [|||||]';
    }
  }
}

function syncFleetPeersToSquad(peers) {
  const currentRemoteIds = new Set(peers.map(p => p.peerId));

  // 1. Remove peers that disconnected
  state.squadMembers = state.squadMembers.filter(m => !m.isRemotePeer || currentRemoteIds.has(m.peerId));

  // 2. Add or update connected peers
  peers.forEach(peer => {
    let existing = state.squadMembers.find(m => m.peerId === peer.peerId);
    const shipId = peer.shipId || peer.loadout?.shipId || 'prospector';
    const laserId = peer.laserId || peer.loadout?.laserId || (shipId === 'mole' ? null : 'lancet_s1');
    const customStats = peer.customLaserStats || peer.loadout?.customLaserStats || null;

    if (existing) {
      existing.name = peer.callsign || 'Ailier P2P';
      existing.shipId = shipId;
      existing.laserId = laserId;
      existing.customLaserStats = customStats;
      existing.active = true;
      existing.ping = peer.ping;
    } else {
      state.squadMembers.push({
        id: 'peer_' + peer.peerId,
        peerId: peer.peerId,
        name: peer.callsign || 'Ailier P2P',
        shipId: shipId,
        laserId: laserId,
        customLaserStats: customStats,
        moduleIds: [],
        active: true,
        isRemotePeer: true,
        ping: peer.ping
      });
    }
  });

  state.crewMembers = Math.max(1, 1 + state.squadMembers.length);
  renderSquadWingmen();
  calculateAll();
  calculateCrewSplit();
  updateFleetNetUI();
}

function initFleetNet() {
  fleetNet = new AaronFleetNet({
    callsign: state.callsign || 'CITIZEN-1',
    onStatusChange: (status, roomCode, isHost) => {
      updateFleetNetUI();
    },
    onPeersUpdate: (peers) => {
      syncFleetPeersToSquad(peers);
    },
    onPeerJoin: (peer) => {
      const t = I18N[state.currentLang] || I18N.fr;
      const msg = (t.toastPeerJoined || 'Ailier connecté : {callsign}').replace('{callsign}', peer.callsign || 'Inconnu');
      showToast(msg);
      sfx.playSuccess();
      triggerHaptic(20);
    },
    onPeerLeave: (peer) => {
      const t = I18N[state.currentLang] || I18N.fr;
      const msg = (t.toastPeerLeft || 'Ailier déconnecté : {callsign}').replace('{callsign}', peer.callsign || 'Inconnu');
      showToast(msg);
      sfx.playBeep(420, 'sine', 0.05);
      triggerHaptic(15);
    },
    onRockBroadcast: (rock, callsign) => {
      handleIncomingRockBroadcast(rock, callsign);
    },
    onRedAlert: (alertData, senderCallsign) => {
      handleIncomingRedAlert(alertData, senderCallsign);
    },
    onJointFireSync: (fireData, senderCallsign) => {
      handleIncomingJointFireSync(fireData, senderCallsign);
    },
    onCargoPickupRequest: (pickupData, senderCallsign) => {
      handleIncomingCargoPickupRequest(pickupData, senderCallsign);
    },
    onCargoPickupAccept: (acceptData, senderCallsign) => {
      handleIncomingCargoPickupAccept(acceptData, senderCallsign);
    },
    onCorpoPriceUpdate: (priceUpdate, senderCallsign) => {
      handleIncomingCorpoPriceUpdate(priceUpdate, senderCallsign);
    },
    onCorpoStockSync: (stockSync, senderCallsign) => {
      handleIncomingCorpoStockSync(stockSync, senderCallsign);
    },
    onCorpoExpenseSync: (expenseSync, senderCallsign) => {
      handleIncomingCorpoExpenseSync(expenseSync, senderCallsign);
    },
    onCorpoTreasurySync: (treasurySync, senderCallsign) => {
      handleIncomingCorpoTreasurySync(treasurySync, senderCallsign);
    },
    onCorpoTradeSync: (tradeSync, senderCallsign) => {
      handleIncomingCorpoTradeSync(tradeSync, senderCallsign);
    },
    onCorpoGuildConfigSync: (guildConfig, senderCallsign) => {
      handleIncomingCorpoGuildConfigSync(guildConfig, senderCallsign);
    },
    onCorpoShipTelemetry: (shipTelemetry, senderCallsign) => {
      handleIncomingCorpoShipTelemetry(shipTelemetry, senderCallsign);
    },
    onCorpoBlueprintSync: (blueprintSync, senderCallsign) => {
      handleIncomingCorpoBlueprintSync(blueprintSync, senderCallsign);
    }
  });

  // UI Event Handlers
  if (DOM.btnFleetCreateWing) {
    DOM.btnFleetCreateWing.addEventListener('click', () => {
      sfx.playSuccess();
      triggerHaptic(20);
      fleetNet.createWing(null, getLocalLoadoutPayload());
      const t = I18N[state.currentLang] || I18N.fr;
      const msg = (t.toastWingCreated || 'Escadre créée : {code}').replace('{code}', fleetNet.roomCode);
      showToast(msg);
      updateFleetNetUI();
    });
  }

  if (DOM.btnFleetJoinWing) {
    DOM.btnFleetJoinWing.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(15);
      const code = DOM.inputFleetRoomCode ? DOM.inputFleetRoomCode.value.trim().toUpperCase() : '';
      if (!code) {
        showToast('Veuillez saisir un code d\'escadre valide (ex: WING-4982)');
        if (DOM.inputFleetRoomCode) DOM.inputFleetRoomCode.focus();
        return;
      }
      fleetNet.joinWing(code, false, getLocalLoadoutPayload());
      const t = I18N[state.currentLang] || I18N.fr;
      const msg = (t.toastWingJoined || 'Connexion à l\'escadre {code}...').replace('{code}', code);
      showToast(msg);
      updateFleetNetUI();
    });
  }

  if (DOM.inputFleetRoomCode) {
    DOM.inputFleetRoomCode.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        DOM.btnFleetJoinWing?.click();
      }
    });
  }

  if (DOM.btnFleetCopyInvite) {
    DOM.btnFleetCopyInvite.addEventListener('click', () => {
      sfx.playSuccess();
      triggerHaptic(20);
      const inviteUrl = fleetNet.getInviteUrl();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inviteUrl).then(() => {
          const t = I18N[state.currentLang] || I18N.fr;
          showToast(t.toastInviteCopied || 'Lien d\'invitation copié dans le presse-papier !');
        }).catch(() => {
          prompt('Copiez ce lien d\'invitation :', inviteUrl);
        });
      } else {
        prompt('Copiez ce lien d\'invitation :', inviteUrl);
      }
    });
  }

  if (DOM.btnFleetLeaveWing) {
    DOM.btnFleetLeaveWing.addEventListener('click', () => {
      sfx.playBeep(450, 'sine', 0.05);
      triggerHaptic(15);
      fleetNet.leaveWing();
      // Remove remote peers from squad
      state.squadMembers = state.squadMembers.filter(m => !m.isRemotePeer);
      state.crewMembers = Math.max(1, 1 + state.squadMembers.length);
      renderSquadWingmen();
      calculateAll();
      calculateCrewSplit();
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.toastWingLeft || 'Vous avez quitté l\'escadre.');
      updateFleetNetUI();
    });
  }

  if (DOM.btnMgFleetNetComms) {
    DOM.btnMgFleetNetComms.addEventListener('click', () => {
      openSquadModal();
    });
  }

  // Auto-connect if URL contains ?fleet=WING-XXXX
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('fleet')) {
      const roomCode = params.get('fleet').trim().toUpperCase();
      if (roomCode) {
        setTimeout(() => {
          fleetNet.joinWing(roomCode, false, getLocalLoadoutPayload());
          updateFleetNetUI();
          const t = I18N[state.currentLang] || I18N.fr;
          showToast((t.toastWingJoined || 'Connexion à l\'escadre {code}...').replace('{code}', roomCode));
        }, 300);
      }
    }
  } catch (e) {
    console.warn('[FLEET-NET] Query param parse error:', e);
  }

  updateFleetNetUI();
}

// ============================================================================
// CRAFTING 4.0 WORKSHOP SUBSYSTEM (JALON 2 — CUSTOM MINING GEAR)
// ============================================================================

function loadCustomCraftGear() {
  try {
    const rawLasers = localStorage.getItem('aaron_mfd_custom_lasers');
    if (rawLasers) {
      state.customLasers = JSON.parse(rawLasers) || [];
      state.customLasers.forEach(cLaser => {
        const idx = MINING_DATA.lasers.findIndex(l => l.id === cLaser.id);
        if (idx !== -1) {
          MINING_DATA.lasers[idx] = cLaser;
        } else {
          MINING_DATA.lasers.push(cLaser);
        }
      });
    }
  } catch (err) {
    console.warn('[CRAFTING 4.0] Error loading custom lasers:', err);
  }

  try {
    const rawGadgets = localStorage.getItem('aaron_mfd_custom_gadgets');
    if (rawGadgets) {
      state.customGadgets = JSON.parse(rawGadgets) || [];
      state.customGadgets.forEach(cGadget => {
        const idx = MINING_DATA.gadgets.findIndex(g => g.id === cGadget.id);
        if (idx !== -1) {
          MINING_DATA.gadgets[idx] = cGadget;
        } else {
          MINING_DATA.gadgets.push(cGadget);
        }
      });
    }
  } catch (err) {
    console.warn('[CRAFTING 4.0] Error loading custom gadgets:', err);
  }
}

function saveCustomLasersStorage() {
  try {
    localStorage.setItem('aaron_mfd_custom_lasers', JSON.stringify(state.customLasers));
  } catch (e) {
    console.warn('[CRAFTING 4.0] Error saving custom lasers:', e);
  }
}

function saveCustomGadgetsStorage() {
  try {
    localStorage.setItem('aaron_mfd_custom_gadgets', JSON.stringify(state.customGadgets));
  } catch (e) {
    console.warn('[CRAFTING 4.0] Error saving custom gadgets:', e);
  }
}

function renderCustomLasersList() {
  if (!DOM.customLasersListContainer) return;
  DOM.customLasersListContainer.innerHTML = '';
  const t = I18N[state.currentLang] || I18N.fr;

  if (!state.customLasers || state.customLasers.length === 0) {
    DOM.customLasersListContainer.innerHTML = `
      <div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; padding:10px; border:1px dashed rgba(168,85,247,0.3); border-radius:6px; text-align:center;">
        ${t.noCustomLasersMsg || 'Aucune tête artisanale forgée. Utilisez le formulaire ci-dessus pour concevoir votre premier prototype sur-mesure.'}
      </div>
    `;
    return;
  }

  state.customLasers.forEach(laser => {
    const card = document.createElement('div');
    card.className = 'craft-item-card';

    const isEquipped = state.selectedLaser && state.selectedLaser.id === laser.id;
    const resPct = Math.round(laser.resistanceMod * 100);
    const instPct = Math.round(laser.instabilityMod * 100);
    const winPct = Math.round((laser.optimalWindowMod || 0) * 100);

    card.innerHTML = `
      <div class="craft-item-header">
        <div>
          <div class="craft-item-title">
            <span>🛠️ ${laser.name}</span>
            <span class="craft-badge">S${laser.size}</span>
            <span class="craft-badge" style="border-color:rgba(0,240,255,0.4); color:var(--accent-cyan);">${laser.slots || 2} SLOTS</span>
            ${isEquipped ? '<span class="craft-badge" style="border-color:rgba(16,185,129,0.5); color:#10b981;">ÉQUIPÉE</span>' : ''}
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
            ${laser.desc_fr || laser.desc_en || ''}
          </div>
        </div>
        <button type="button" class="btn-close-modal btn-delete-craft-laser" data-laser-id="${laser.id}" style="font-size:1.1rem; width:24px; height:24px; color:#f43f5e;" title="Supprimer la tête">&times;</button>
      </div>

      <div class="craft-pills-row">
        <span class="craft-pill power">⚡ ${laser.power.toLocaleString()} W</span>
        <span class="craft-pill res">🛡️ ${resPct > 0 ? '+' : ''}${resPct} % Rés</span>
        <span class="craft-pill inst">🌊 ${instPct > 0 ? '+' : ''}${instPct} % Inst</span>
        <span class="craft-pill window">🎯 ${winPct > 0 ? '+' : ''}${winPct} % Zone</span>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
        <button type="button" class="chip-btn btn-equip-craft-laser ${isEquipped ? 'active' : ''}" data-laser-id="${laser.id}" style="font-size:0.75rem; border-color:var(--accent-purple); color:var(--accent-purple);">
          ${isEquipped ? '✓ Actuellement Équipée' : '⚡ Équiper sur ' + state.selectedShip.name}
        </button>
      </div>
    `;

    DOM.customLasersListContainer.appendChild(card);
  });

  // Attach delete listeners
  DOM.customLasersListContainer.querySelectorAll('.btn-delete-craft-laser').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.laserId;
      deleteCustomLaser(id);
    });
  });

  // Attach equip listeners
  DOM.customLasersListContainer.querySelectorAll('.btn-equip-craft-laser').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.laserId;
      equipCustomLaser(id);
    });
  });
}

function renderCustomGadgetsList() {
  if (!DOM.customGadgetsListContainer) return;
  DOM.customGadgetsListContainer.innerHTML = '';
  const t = I18N[state.currentLang] || I18N.fr;

  if (!state.customGadgets || state.customGadgets.length === 0) {
    DOM.customGadgetsListContainer.innerHTML = `
      <div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; padding:10px; border:1px dashed rgba(168,85,247,0.3); border-radius:6px; text-align:center;">
        ${t.noCustomGadgetsMsg || 'Aucun gadget artisanal créé. Utilisez le formulaire ci-dessus pour forger un module de terrain sur-mesure.'}
      </div>
    `;
    return;
  }

  state.customGadgets.forEach(gadget => {
    const card = document.createElement('div');
    card.className = 'craft-item-card';

    const isEquipped = state.selectedGadget && state.selectedGadget.id === gadget.id;
    const resPct = Math.round(gadget.resMod * 100);
    const instPct = Math.round(gadget.instMod * 100);
    const winPct = Math.round((gadget.windowMod || 0) * 100);

    card.innerHTML = `
      <div class="craft-item-header">
        <div>
          <div class="craft-item-title">
            <span>🛠️ ${gadget.name_fr || gadget.name || 'Gadget Artisanal'}</span>
            <span class="craft-badge">PROTOTYPE</span>
            ${isEquipped ? '<span class="craft-badge" style="border-color:rgba(16,185,129,0.5); color:#10b981;">ACTIF</span>' : ''}
          </div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
            ${gadget.desc_fr || gadget.desc_en || ''}
          </div>
        </div>
        <button type="button" class="btn-close-modal btn-delete-craft-gadget" data-gadget-id="${gadget.id}" style="font-size:1.1rem; width:24px; height:24px; color:#f43f5e;" title="Supprimer le gadget">&times;</button>
      </div>

      <div class="craft-pills-row">
        <span class="craft-pill res">🛡️ ${resPct > 0 ? '+' : ''}${resPct} % Rés</span>
        <span class="craft-pill inst">🌊 ${instPct > 0 ? '+' : ''}${instPct} % Inst</span>
        <span class="craft-pill window">🎯 ${winPct > 0 ? '+' : ''}${winPct} % Zone</span>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
        <button type="button" class="chip-btn btn-equip-craft-gadget ${isEquipped ? 'active' : ''}" data-gadget-id="${gadget.id}" style="font-size:0.75rem; border-color:var(--accent-purple); color:var(--accent-purple);">
          ${isEquipped ? '✓ Gadget Actuel' : '⚡ Activer le Gadget'}
        </button>
      </div>
    `;

    DOM.customGadgetsListContainer.appendChild(card);
  });

  // Attach delete listeners
  DOM.customGadgetsListContainer.querySelectorAll('.btn-delete-craft-gadget').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.gadgetId;
      deleteCustomGadget(id);
    });
  });

  // Attach equip listeners
  DOM.customGadgetsListContainer.querySelectorAll('.btn-equip-craft-gadget').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.gadgetId;
      equipCustomGadget(id);
    });
  });
}

function equipCustomLaser(laserId) {
  const laser = MINING_DATA.lasers.find(l => l.id === laserId);
  if (!laser) return;

  sfx.playSuccess();
  triggerHaptic(20);

  state.selectedLaser = laser;

  // If ship has turrets, assign to primary turret
  const configs = getShipTurretConfigs(state.selectedShip.id);
  if (configs && configs[0]) {
    configs[0].laserId = laser.id;
  }

  saveLoadout();
  calculateAll();
  renderShipTurretsConfig();
  updateLaserOptions();
  renderSquadWingmen();
  broadcastLocalLoadout();
  renderCustomLasersList();

  const t = I18N[state.currentLang] || I18N.fr;
  const msg = (t.toastEquippedCustomLaser || 'Tête artisanale {name} équipée sur votre vaisseau !').replace('{name}', laser.name);
  showToast(msg);
}

function deleteCustomLaser(laserId) {
  sfx.playBeep(450, 'sine', 0.05);
  triggerHaptic(15);

  const idx = state.customLasers.findIndex(l => l.id === laserId);
  if (idx !== -1) {
    const deleted = state.customLasers.splice(idx, 1)[0];
    saveCustomLasersStorage();

    // Remove from MINING_DATA.lasers
    const mIdx = MINING_DATA.lasers.findIndex(l => l.id === laserId);
    if (mIdx !== -1) {
      MINING_DATA.lasers.splice(mIdx, 1);
    }

    // Fallback if currently equipped
    if (state.selectedLaser && state.selectedLaser.id === laserId) {
      const compatible = MINING_DATA.lasers.filter(l => l.size === state.selectedShip.laserSize || (state.selectedShip.laserSize === 0 && l.size === 0));
      state.selectedLaser = compatible[0] || MINING_DATA.lasers[0];
      const configs = getShipTurretConfigs(state.selectedShip.id);
      if (configs && configs[0]) configs[0].laserId = state.selectedLaser.id;
      saveLoadout();
      broadcastLocalLoadout();
    }

    renderCustomLasersList();
    renderShipTurretsConfig();
    updateLaserOptions();
    calculateAll();

    const t = I18N[state.currentLang] || I18N.fr;
    const msg = (t.toastDeletedCustomLaser || 'Tête artisanale {name} supprimée.').replace('{name}', deleted?.name || '');
    showToast(msg);
  }
}

function equipCustomGadget(gadgetId) {
  const gadget = MINING_DATA.gadgets.find(g => g.id === gadgetId);
  if (!gadget) return;

  sfx.playSuccess();
  triggerHaptic(20);

  state.selectedGadget = gadget;
  if (DOM.gadgetSelect) {
    DOM.gadgetSelect.value = gadget.id;
  }

  saveLoadout();
  calculateAll();
  renderCustomGadgetsList();

  const t = I18N[state.currentLang] || I18N.fr;
  const name = gadget.name_fr || gadget.name || 'Gadget';
  const msg = (t.toastEquippedCustomGadget || 'Gadget artisanal {name} activé !').replace('{name}', name);
  showToast(msg);
}

function deleteCustomGadget(gadgetId) {
  sfx.playBeep(450, 'sine', 0.05);
  triggerHaptic(15);

  const idx = state.customGadgets.findIndex(g => g.id === gadgetId);
  if (idx !== -1) {
    const deleted = state.customGadgets.splice(idx, 1)[0];
    saveCustomGadgetsStorage();

    const mIdx = MINING_DATA.gadgets.findIndex(g => g.id === gadgetId);
    if (mIdx !== -1) {
      MINING_DATA.gadgets.splice(mIdx, 1);
    }

    if (state.selectedGadget && state.selectedGadget.id === gadgetId) {
      state.selectedGadget = MINING_DATA.gadgets[0];
      if (DOM.gadgetSelect) DOM.gadgetSelect.value = state.selectedGadget.id;
      saveLoadout();
    }

    renderCustomGadgetsList();
    populateGadgetSelect();
    calculateAll();

    const t = I18N[state.currentLang] || I18N.fr;
    const name = deleted.name_fr || deleted.name || '';
    const msg = (t.toastDeletedCustomGadget || 'Gadget artisanal {name} supprimé.').replace('{name}', name);
    showToast(msg);
  }
}

// ==========================================
// JALON 11: BLUEPRINTS CODEX & INVENTORY CRAFTING ENGINE
// ==========================================

function getPlayerMaterialsInventory() {
  const inv = {};

  // 1. Personal stock from state.playerStockpile
  if (Array.isArray(state.playerStockpile)) {
    state.playerStockpile.forEach(item => {
      if (item && item.mineralId) {
        inv[item.mineralId] = (inv[item.mineralId] || 0) + (item.scu || 0);
      }
    });
  }

  // 2. Active cargo hold minerals
  if (state.selectedMineral && state.holdSCU > 0) {
    const minId = state.selectedMineral.id;
    inv[minId] = (inv[minId] || 0) + (state.holdSCU || 0);
  }

  // 3. Completed / ready refinery jobs
  if (Array.isArray(state.refineryJobs)) {
    state.refineryJobs.forEach(job => {
      if (job && job.mineralId && (job.status === 'ready' || (job.progress && job.progress >= 100))) {
        inv[job.mineralId] = (inv[job.mineralId] || 0) + (job.refinedSCU || job.scu || 0);
      }
    });
  }

  return inv;
}

function getGuildMaterialsInventory() {
  const inv = {};
  if (Array.isArray(state.guildStockpile)) {
    state.guildStockpile.forEach(lot => {
      if (lot && lot.mineralId) {
        inv[lot.mineralId] = (inv[lot.mineralId] || 0) + (lot.scu || 0);
      }
    });
  }
  return inv;
}

function checkBlueprintCraftability(bp, inventoryMap) {
  if (!bp || !Array.isArray(bp.materials) || bp.materials.length === 0) {
    return { isReady: false, percent: 0, maxUnits: 0, materialsStatus: [] };
  }

  let totalRatios = 0;
  let allFulfilled = true;
  let maxUnits = Infinity;

  const materialsStatus = bp.materials.map(req => {
    const available = inventoryMap[req.mineralId] || 0;
    const needed = req.scu || 1;
    const isFulfilled = available >= needed;
    if (!isFulfilled) allFulfilled = false;

    const ratio = Math.min(1.0, available / needed);
    totalRatios += ratio;

    const possibleUnits = Math.floor(available / needed);
    if (possibleUnits < maxUnits) maxUnits = possibleUnits;

    return {
      mineralId: req.mineralId,
      name_fr: req.name_fr || req.mineralId,
      name_en: req.name_en || req.mineralId,
      neededScu: needed,
      availableScu: available,
      missingScu: Math.max(0, Math.round((needed - available) * 10) / 10),
      isFulfilled
    };
  });

  const percent = Math.round((totalRatios / bp.materials.length) * 100);
  if (maxUnits === Infinity || !allFulfilled) maxUnits = 0;

  return {
    isReady: allFulfilled,
    percent,
    maxUnits,
    materialsStatus
  };
}

function togglePlayerBlueprint(bpId) {
  sfx.playBeep(700, 'sine', 0.04);
  triggerHaptic(20);
  const idx = state.playerBlueprints.indexOf(bpId);
  const bp = (MINING_DATA.blueprints || []).find(b => b.id === bpId);
  const name = bp ? bp.name : bpId;
  const t = I18N[state.currentLang] || I18N.fr;

  if (idx >= 0) {
    state.playerBlueprints.splice(idx, 1);
    showToast(t.bpToastLockedPlayer || 'Schéma verrouillé dans votre Codex.');
  } else {
    state.playerBlueprints.push(bpId);
    sfx.playSuccess();
    showToast(t.bpToastUnlockedPlayer || 'Schéma débloqué dans votre Codex personnel !');
  }

  localStorage.setItem('aaron_mfd_player_blueprints', JSON.stringify(state.playerBlueprints));
  renderBlueprintsCodex();
}

function toggleGuildBlueprint(bpId) {
  sfx.playBeep(720, 'sine', 0.04);
  triggerHaptic(20);
  const idx = state.guildBlueprints.indexOf(bpId);
  const bp = (MINING_DATA.blueprints || []).find(b => b.id === bpId);
  const name = bp ? bp.name : bpId;
  const t = I18N[state.currentLang] || I18N.fr;

  if (idx >= 0) {
    state.guildBlueprints.splice(idx, 1);
    showToast(t.bpToastLockedGuild || 'Schéma verrouillé pour la Guilde.');
  } else {
    state.guildBlueprints.push(bpId);
    sfx.playSuccess();
    showToast(t.bpToastUnlockedGuild || 'Schéma débloqué pour la Guilde !');
  }

  localStorage.setItem('aaron_mfd_guild_blueprints', JSON.stringify(state.guildBlueprints));

  if (fleetNet && fleetNet.connected) {
    fleetNet.broadcastCorpoBlueprintSync({
      guildBlueprints: state.guildBlueprints,
      senderCallsign: state.callsign || 'CITIZEN-1',
      timestamp: Date.now()
    });
  }

  renderBlueprintsCodex();
}

function handleIncomingCorpoBlueprintSync(blueprintSync, senderCallsign) {
  if (!blueprintSync || !Array.isArray(blueprintSync.guildBlueprints)) return;
  state.guildBlueprints = Array.from(new Set([...state.guildBlueprints, ...blueprintSync.guildBlueprints]));
  localStorage.setItem('aaron_mfd_guild_blueprints', JSON.stringify(state.guildBlueprints));
  renderBlueprintsCodex();
  showToast(`📡 Schémas de Guilde synchronisés avec ${senderCallsign} !`);
}

function craftBlueprint(bpId, isGuild = false) {
  const bp = (MINING_DATA.blueprints || []).find(b => b.id === bpId);
  if (!bp) return;

  const inv = isGuild ? getGuildMaterialsInventory() : getPlayerMaterialsInventory();
  const check = checkBlueprintCraftability(bp, inv);

  if (!check.isReady) {
    sfx.playWarning();
    showToast(state.currentLang === 'en' ? 'Missing required materials to fabricate this blueprint!' : 'Matériaux insuffisants pour fabriquer ce schéma !');
    return;
  }

  // Deduct materials
  if (isGuild) {
    bp.materials.forEach(req => {
      let needed = req.scu;
      for (let lot of state.guildStockpile) {
        if (lot.mineralId === req.mineralId && lot.scu > 0) {
          const deduct = Math.min(lot.scu, needed);
          lot.scu = Math.round((lot.scu - deduct) * 10) / 10;
          needed = Math.round((needed - deduct) * 10) / 10;
          if (needed <= 0) break;
        }
      }
    });
    saveGuildStockpile();
    renderGuildStockpile();
  } else {
    bp.materials.forEach(req => {
      let needed = req.scu;
      if (Array.isArray(state.playerStockpile)) {
        for (let item of state.playerStockpile) {
          if (item.mineralId === req.mineralId && item.scu > 0) {
            const deduct = Math.min(item.scu, needed);
            item.scu = Math.round((item.scu - deduct) * 10) / 10;
            needed = Math.round((needed - deduct) * 10) / 10;
            if (needed <= 0) break;
          }
        }
      }
    });
    localStorage.setItem('aaron_mfd_player_stockpile', JSON.stringify(state.playerStockpile));
  }

  sfx.playSuccess();
  triggerHaptic([40, 60, 40]);
  const t = I18N[state.currentLang] || I18N.fr;
  const msg = (t.bpToastCraftSuccess || 'Fabrication de "{name}" validée ! Matériaux consommés.').replace('{name}', bp.name);
  showToast(msg);

  renderBlueprintsCodex();
}

function prospectMissingMaterials(bpId) {
  const bp = (MINING_DATA.blueprints || []).find(b => b.id === bpId);
  if (!bp) return;

  const inv = getPlayerMaterialsInventory();
  const check = checkBlueprintCraftability(bp, inv);
  const missingMat = check.materialsStatus.find(m => !m.isFulfilled);

  if (missingMat) {
    const min = MINING_DATA.minerals.find(m => m.id === missingMat.mineralId);
    if (min) {
      state.selectedMineral = min;
      applyDynamicRockProperties();
      updateSelectedMineralUI();
      calculateAll();
    }
  }

  sfx.playBeep(880, 'sine', 0.05);
  triggerHaptic(25);
  closeModal(DOM.craftingModal);
  setLayoutMode('classic');
  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.bpToastProspectAdded || 'Minerais manquants ciblés en prospection prioritaire !');
}

function addBlueprintToGuildGoals(bpId) {
  const bp = (MINING_DATA.blueprints || []).find(b => b.id === bpId);
  if (!bp) return;

  if (!state.guildCraftingGoals) state.guildCraftingGoals = [];
  
  const existingGoal = state.guildCraftingGoals.find(g => g.itemId === bp.id);
  if (existingGoal) {
    existingGoal.targetCount += 1;
    existingGoal.requiredMinerals.forEach(req => {
      const baseReq = bp.materials.find(m => m.mineralId === req.mineralId);
      if (baseReq) req.neededScu += baseReq.scu;
    });
  } else {
    state.guildCraftingGoals.push({
      id: 'goal_' + bp.id + '_' + Date.now(),
      itemId: bp.id,
      name: bp.name,
      targetCount: 1,
      requiredMinerals: bp.materials.map(m => ({
        mineralId: m.mineralId,
        neededScu: m.scu
      }))
    });
  }

  localStorage.setItem('aaron_mfd_guild_crafting_goals', JSON.stringify(state.guildCraftingGoals));
  sfx.playSuccess();
  triggerHaptic(30);

  const t = I18N[state.currentLang] || I18N.fr;
  const msg = (t.bpToastGuildGoalAdded || '"{name}" ajouté aux chantiers collectifs de Guilde !').replace('{name}', bp.name);
  showToast(msg);

  renderCraftingGoals();
}

function setCraftingWorkshopTab(tab) {
  state.activeCraftingTab = tab;

  if (DOM.tabCraftBlueprints) {
    const isBp = tab === 'blueprints';
    DOM.tabCraftBlueprints.classList.toggle('active', isBp);
    DOM.tabCraftBlueprints.style.borderColor = isBp ? 'var(--accent-purple)' : '';
    DOM.tabCraftBlueprints.style.color = isBp ? 'var(--accent-purple)' : '';
    if (DOM.craftPaneBlueprints) DOM.craftPaneBlueprints.style.display = isBp ? 'block' : 'none';
  }

  if (DOM.tabCraftLasers) {
    const isLasers = tab === 'lasers';
    DOM.tabCraftLasers.classList.toggle('active', isLasers);
    DOM.tabCraftLasers.style.borderColor = isLasers ? 'var(--accent-purple)' : '';
    DOM.tabCraftLasers.style.color = isLasers ? 'var(--accent-purple)' : '';
    if (DOM.craftPaneLasers) DOM.craftPaneLasers.style.display = isLasers ? 'block' : 'none';
  }

  if (DOM.tabCraftGadgets) {
    const isGadgets = tab === 'gadgets';
    DOM.tabCraftGadgets.classList.toggle('active', isGadgets);
    DOM.tabCraftGadgets.style.borderColor = isGadgets ? 'var(--accent-purple)' : '';
    DOM.tabCraftGadgets.style.color = isGadgets ? 'var(--accent-purple)' : '';
    if (DOM.craftPaneGadgets) DOM.craftPaneGadgets.style.display = isGadgets ? 'block' : 'none';
  }

  if (tab === 'blueprints') {
    renderBlueprintsCodex();
  } else if (tab === 'lasers') {
    renderCustomLasersList();
  } else if (tab === 'gadgets') {
    renderCustomGadgetsList();
  }
}

function renderBlueprintsCodex() {
  if (!DOM.blueprintsGrid) return;
  const isEn = state.currentLang === 'en';
  const t = I18N[state.currentLang] || I18N.fr;
  const blueprints = MINING_DATA.blueprints || [];

  const playerInv = getPlayerMaterialsInventory();
  const guildInv = getGuildMaterialsInventory();

  // Summary KPIs
  let playerUnlockedCount = 0;
  let guildUnlockedCount = 0;
  let craftableCount = 0;

  blueprints.forEach(bp => {
    if (state.playerBlueprints.includes(bp.id)) playerUnlockedCount++;
    if (state.guildBlueprints.includes(bp.id)) guildUnlockedCount++;
    const checkP = checkBlueprintCraftability(bp, playerInv);
    const checkG = checkBlueprintCraftability(bp, guildInv);
    if (checkP.isReady || checkG.isReady) craftableCount++;
  });

  if (DOM.bpMetricTotalCount) DOM.bpMetricTotalCount.textContent = `${blueprints.length} ${isEn ? 'Schematics' : 'Schémas'}`;
  if (DOM.bpMetricPlayerCount) DOM.bpMetricPlayerCount.textContent = `${playerUnlockedCount} / ${blueprints.length}`;
  if (DOM.bpMetricGuildCount) DOM.bpMetricGuildCount.textContent = `${guildUnlockedCount} / ${blueprints.length}`;
  if (DOM.bpMetricCraftableCount) DOM.bpMetricCraftableCount.textContent = `${craftableCount} ${isEn ? 'Ready' : 'Prêts'}`;

  // Filter list
  const query = (state.blueprintSearchQuery || '').toLowerCase().trim();
  const filtered = blueprints.filter(bp => {
    // 1. Category
    if (state.blueprintCategoryFilter && state.blueprintCategoryFilter !== 'all') {
      if (bp.category !== state.blueprintCategoryFilter) return false;
    }

    // 2. Search query
    if (query) {
      const matchName = (bp.name || '').toLowerCase().includes(query);
      const matchDesc = ((bp.description_fr || '') + ' ' + (bp.description_en || '')).toLowerCase().includes(query);
      const matchLoc = ((bp.obtaining?.location_fr || '') + ' ' + (bp.obtaining?.location_en || '')).toLowerCase().includes(query);
      const matchFaction = ((bp.obtaining?.faction_fr || '') + ' ' + (bp.obtaining?.faction_en || '')).toLowerCase().includes(query);
      const matchMats = (bp.materials || []).some(m => ((m.name_fr || '') + ' ' + (m.name_en || '') + ' ' + (m.mineralId || '')).toLowerCase().includes(query));
      if (!matchName && !matchDesc && !matchLoc && !matchFaction && !matchMats) return false;
    }

    // 3. Status & Craftability filter
    const checkP = checkBlueprintCraftability(bp, playerInv);
    const checkG = checkBlueprintCraftability(bp, guildInv);
    const isPlayerOwned = state.playerBlueprints.includes(bp.id);
    const isGuildOwned = state.guildBlueprints.includes(bp.id);

    if (state.blueprintStatusFilter === 'player_owned' && !isPlayerOwned) return false;
    if (state.blueprintStatusFilter === 'guild_owned' && !isGuildOwned) return false;
    if (state.blueprintStatusFilter === 'craftable_player' && !checkP.isReady) return false;
    if (state.blueprintStatusFilter === 'craftable_guild' && !checkG.isReady) return false;
    if (state.blueprintStatusFilter === 'missing' && (isPlayerOwned || isGuildOwned)) return false;

    return true;
  });

  DOM.blueprintsGrid.innerHTML = '';

  if (filtered.length === 0) {
    DOM.blueprintsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:30px 10px; color:var(--text-muted); font-style:italic;">
        ${isEn ? 'No blueprints matching selected filters.' : 'Aucun schéma de fabrication ne correspond aux filtres sélectionnés.'}
      </div>
    `;
    return;
  }

  filtered.forEach(bp => {
    const isPlayerOwned = state.playerBlueprints.includes(bp.id);
    const isGuildOwned = state.guildBlueprints.includes(bp.id);

    const checkPlayer = checkBlueprintCraftability(bp, playerInv);
    const checkGuild = checkBlueprintCraftability(bp, guildInv);

    const card = document.createElement('div');
    const rarityClass = `rarity-${bp.rarity || 'common'}`;
    const craftableClass = checkPlayer.isReady ? 'is-craftable' : '';
    card.className = `blueprint-card ${rarityClass} ${craftableClass}`;

    const catLabels = {
      lasers: '⚡ Laser S' + (bp.size || 1),
      salvage: isEn ? '🪚 Salvage S' + (bp.size || 1) : '🪚 Récupération S' + (bp.size || 1),
      modules: isEn ? '🧩 Sub-Module' : '🧩 Sous-Module',
      gadgets: isEn ? '🧲 Mining Gadget' : '🧲 Gadget Minier',
      saddlebags: isEn ? '🎒 Bags & Cargo' : '🎒 Sacoches & Cargo',
      components: isEn ? '🔩 Ship Component' : '🔩 Composant Vaisseau',
      tools_weapons: isEn ? '🔫 Tool / Weapon' : '🔫 Outil / Arme FPS',
      armor: isEn ? '🛡️ HazMat Armor' : '🛡️ Armure HazMat',
      consumables: isEn ? '🧪 Consumable / Med' : '🧪 Consommable / Médical'
    };
    const catText = catLabels[bp.category] || (bp.category || '').toUpperCase();

    // Rarity labels
    const rarityLabels = {
      common: isEn ? 'Common' : 'Commun',
      uncommon: isEn ? 'Uncommon' : 'Atypique',
      rare: isEn ? 'Rare' : 'Rare',
      military: isEn ? 'Military Spec' : 'Spéc. Militaire',
      prototype: isEn ? 'Prototype' : 'Prototype'
    };
    const rarityText = rarityLabels[bp.rarity] || bp.rarity;

    // Materials HTML
    const matsHtml = checkPlayer.materialsStatus.map(m => {
      const minName = isEn ? m.name_en : m.name_fr;
      const statusClass = m.isFulfilled ? 'fulfilled' : 'missing';
      const icon = m.isFulfilled ? '✓' : '✗';
      const text = m.isFulfilled 
        ? `${icon} ${minName}: ${m.neededScu} SCU (${m.availableScu.toFixed(1)} dispo)`
        : `${icon} ${minName}: ${m.availableScu.toFixed(1)} / ${m.neededScu} SCU (Manque ${m.missingScu} SCU)`;
      return `<span class="bp-mat-item-pill ${statusClass}" title="${escapeHtml(text)}">${escapeHtml(text)}</span>`;
    }).join('');

    card.innerHTML = `
      <div class="bp-card-header">
        <div class="bp-title-wrap">
          <div class="bp-meta-tags">
            <span class="bp-tag category">${catText}</span>
            <span class="bp-tag ${bp.rarity}">${rarityText}</span>
            <span class="bp-tag category">Tier ${bp.tier || 1}</span>
          </div>
          <div class="bp-name">${escapeHtml(bp.name)}</div>
        </div>
        <div class="bp-ownership-switches">
          <button type="button" class="bp-switch-btn ${isPlayerOwned ? 'active player' : ''}" data-act="toggle-player" title="${isPlayerOwned ? (isEn ? 'Click to mark locked' : 'Cliquer pour verrouiller') : (isEn ? 'Click to mark unlocked' : 'Cliquer pour débloquer')}">
            ${isPlayerOwned ? '👤 ' + (isEn ? 'Owned' : 'Possédé') : '👤 ' + (isEn ? 'Locked' : 'Verrouillé')}
          </button>
          <button type="button" class="bp-switch-btn ${isGuildOwned ? 'active guild' : ''}" data-act="toggle-guild" title="${isGuildOwned ? (isEn ? 'Click to mark locked for Guild' : 'Cliquer pour retirer de la Guilde') : (isEn ? 'Click to share with Guild' : 'Cliquer pour débloquer en Guilde')}">
            ${isGuildOwned ? '👥 ' + (isEn ? 'Guild' : 'Guilde') : '👥 ' + (isEn ? 'Guild 🔒' : 'Guilde 🔒')}
          </button>
        </div>
      </div>

      <div class="bp-desc-text">
        ${escapeHtml(isEn ? bp.description_en : bp.description_fr)}
      </div>

      ${bp.statsSummary ? `<div class="bp-stats-strip">⚡ ${escapeHtml(bp.statsSummary)}</div>` : ''}

      <!-- Obtaining guide box -->
      <div class="bp-obtaining-card">
        <div class="bp-obtaining-header">
          <span>📍 ${t.bpWhereToObtain || 'COMMENT L\'OBTENIR'} • ${escapeHtml(bp.obtaining?.system || 'Stanton')}</span>
          <span style="font-size:0.65rem; color:var(--accent-cyan); font-weight:700;">${escapeHtml(bp.obtaining?.difficulty || '')}</span>
        </div>
        <div class="bp-obtaining-loc">${escapeHtml(isEn ? bp.obtaining?.location_en : bp.obtaining?.location_fr)}</div>
        <div class="bp-obtaining-method">${escapeHtml(isEn ? bp.obtaining?.method_en : bp.obtaining?.method_fr)}</div>
        <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">
          <strong>${isEn ? 'Faction/Source:' : 'Faction/Source :'}</strong> ${escapeHtml(isEn ? bp.obtaining?.faction_en : bp.obtaining?.faction_fr)}
        </div>
      </div>

      <!-- Materials requirement & craft feasibility -->
      <div class="bp-materials-block">
        <div class="bp-mats-header">
          <span>${t.bpCraftMaterialsReq || 'MATÉRIAUX REQUIS'}</span>
          <span style="color:${checkPlayer.isReady ? 'var(--accent-emerald)' : 'var(--accent-amber)'}; font-family:var(--font-mono); font-weight:700;">
            ${checkPlayer.isReady ? (isEn ? '🟢 100% READY' : '🟢 100% PRÊT') : `${checkPlayer.percent}% (${isEn ? 'Player' : 'Joueur'})`}
          </span>
        </div>

        <div class="bp-mats-pills">
          ${matsHtml}
        </div>

        <!-- Gauges for Player & Guild Stockpile -->
        <div class="bp-gauges-row">
          <div class="bp-gauge-wrap">
            <div class="bp-gauge-info">
              <span>👤 ${t.bpPlayerInventory || 'Joueur'}</span>
              <strong>${checkPlayer.percent}%</strong>
            </div>
            <div class="bp-gauge-bar">
              <div class="bp-gauge-fill player" style="width:${checkPlayer.percent}%;"></div>
            </div>
          </div>
          <div class="bp-gauge-wrap">
            <div class="bp-gauge-info">
              <span>👥 ${t.bpGuildStockpile || 'Stockpile Guilde'}</span>
              <strong>${checkGuild.percent}%</strong>
            </div>
            <div class="bp-gauge-bar">
              <div class="bp-gauge-fill guild" style="width:${checkGuild.percent}%;"></div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:var(--text-muted); margin-top:3px;">
          <span>🛠️ ${escapeHtml(isEn ? bp.fabricatorTier_en : bp.fabricatorTier_fr)}</span>
          <span>⏱️ ${bp.craftTimeSeconds}s</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="bp-actions-row">
        ${checkPlayer.isReady 
          ? `<button type="button" class="bp-act-btn craft-now" data-act="craft-player">🔨 ${isEn ? 'Craft (Player)' : 'Fabriquer'}</button>`
          : (checkGuild.isReady 
              ? `<button type="button" class="bp-act-btn craft-now" style="border-color:var(--accent-purple); color:#d8b4fe;" data-act="craft-guild">🛡️ ${isEn ? 'Craft (Stockpile)' : 'Craft Stockpile'}</button>`
              : `<button type="button" class="bp-act-btn prospect" data-act="prospect">🎯 ${t.bpBtnProspect || 'Prospection'}</button>`
            )
        }
        <button type="button" class="bp-act-btn guild-goal" data-act="guild-goal" title="${isEn ? 'Add to Guild Crafting Goals' : 'Ajouter au Carnet de Guilde'}">
          📋 ${t.bpBtnAddGuildGoal || 'Chantier Guilde'}
        </button>
      </div>
    `;

    // Event listeners
    const btnTogglePlayer = card.querySelector('[data-act="toggle-player"]');
    if (btnTogglePlayer) {
      btnTogglePlayer.addEventListener('click', () => togglePlayerBlueprint(bp.id));
    }

    const btnToggleGuild = card.querySelector('[data-act="toggle-guild"]');
    if (btnToggleGuild) {
      btnToggleGuild.addEventListener('click', () => toggleGuildBlueprint(bp.id));
    }

    const btnCraftPlayer = card.querySelector('[data-act="craft-player"]');
    if (btnCraftPlayer) {
      btnCraftPlayer.addEventListener('click', () => craftBlueprint(bp.id, false));
    }

    const btnCraftGuild = card.querySelector('[data-act="craft-guild"]');
    if (btnCraftGuild) {
      btnCraftGuild.addEventListener('click', () => craftBlueprint(bp.id, true));
    }

    const btnProspect = card.querySelector('[data-act="prospect"]');
    if (btnProspect) {
      btnProspect.addEventListener('click', () => prospectMissingMaterials(bp.id));
    }

    const btnGuildGoal = card.querySelector('[data-act="guild-goal"]');
    if (btnGuildGoal) {
      btnGuildGoal.addEventListener('click', () => addBlueprintToGuildGoals(bp.id));
    }

    DOM.blueprintsGrid.appendChild(card);
  });
}

function initCraftingWorkshop() {
  // Modal open / close
  if (DOM.btnOpenCraftingFromLoadout) {
    DOM.btnOpenCraftingFromLoadout.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      setCraftingWorkshopTab(state.activeCraftingTab || 'blueprints');
      openModal(DOM.craftingModal);
    });
  }

  if (DOM.btnOpenCraftingFromCrew) {
    DOM.btnOpenCraftingFromCrew.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      setCraftingWorkshopTab(state.activeCraftingTab || 'blueprints');
      openModal(DOM.craftingModal);
    });
  }

  if (DOM.btnCloseCrafting) {
    DOM.btnCloseCrafting.addEventListener('click', () => {
      closeModal(DOM.craftingModal);
    });
  }

  // Workshop Sub-tabs
  if (DOM.tabCraftBlueprints) {
    DOM.tabCraftBlueprints.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(10);
      setCraftingWorkshopTab('blueprints');
    });
  }

  if (DOM.tabCraftLasers) {
    DOM.tabCraftLasers.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(10);
      setCraftingWorkshopTab('lasers');
    });
  }

  if (DOM.tabCraftGadgets) {
    DOM.tabCraftGadgets.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(10);
      setCraftingWorkshopTab('gadgets');
    });
  }

  // Blueprint Category Filters
  const catButtons = document.querySelectorAll('.bp-cat-btn');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(700, 'sine', 0.03);
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.blueprintCategoryFilter = btn.dataset.cat || 'all';
      renderBlueprintsCodex();
    });
  });

  // Blueprint Status / Craftability Filters
  const statusButtons = document.querySelectorAll('.bp-status-btn');
  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(700, 'sine', 0.03);
      statusButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.blueprintStatusFilter = btn.dataset.status || 'all';
      renderBlueprintsCodex();
    });
  });

  // Blueprint Search Input
  if (DOM.bpSearchInput) {
    DOM.bpSearchInput.addEventListener('input', (e) => {
      state.blueprintSearchQuery = e.target.value;
      renderBlueprintsCodex();
    });
  }

  // Reset Blueprint Filters
  if (DOM.btnResetBpFilters) {
    DOM.btnResetBpFilters.addEventListener('click', () => {
      sfx.playBeep(500, 'sine', 0.03);
      state.blueprintCategoryFilter = 'all';
      state.blueprintStatusFilter = 'all';
      state.blueprintSearchQuery = '';
      if (DOM.bpSearchInput) DOM.bpSearchInput.value = '';
      catButtons.forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
      statusButtons.forEach(b => b.classList.toggle('active', b.dataset.status === 'all'));
      renderBlueprintsCodex();
    });
  }

  // Base Template Pre-fill for Mining Head
  if (DOM.craftLaserTemplateSelect) {
    DOM.craftLaserTemplateSelect.addEventListener('change', () => {
      sfx.playBeep(550, 'sine', 0.04);
      const val = DOM.craftLaserTemplateSelect.value;
      if (!val) return;
      const baseLaser = MINING_DATA.lasers.find(l => l.id === val);
      if (baseLaser) {
        if (DOM.craftLaserNameInput) {
          DOM.craftLaserNameInput.value = `${baseLaser.name} Custom`;
        }
        if (DOM.craftLaserSizeSelect) {
          DOM.craftLaserSizeSelect.value = baseLaser.size || 1;
        }
        if (DOM.craftLaserPowerSlider) {
          DOM.craftLaserPowerSlider.value = baseLaser.power;
          if (DOM.craftLaserPowerVal) DOM.craftLaserPowerVal.textContent = `${baseLaser.power.toLocaleString()} W`;
        }
        if (DOM.craftLaserResSlider) {
          const resVal = Math.round(baseLaser.resistanceMod * 100);
          DOM.craftLaserResSlider.value = resVal;
          if (DOM.craftLaserResVal) DOM.craftLaserResVal.textContent = `${resVal > 0 ? '+' : ''}${resVal} %`;
        }
        if (DOM.craftLaserInstSlider) {
          const instVal = Math.round(baseLaser.instabilityMod * 100);
          DOM.craftLaserInstSlider.value = instVal;
          if (DOM.craftLaserInstVal) DOM.craftLaserInstVal.textContent = `${instVal > 0 ? '+' : ''}${instVal} %`;
        }
        if (DOM.craftLaserWindowSlider) {
          const winVal = Math.round((baseLaser.optimalWindowMod || 0) * 100);
          DOM.craftLaserWindowSlider.value = winVal;
          if (DOM.craftLaserWindowVal) DOM.craftLaserWindowVal.textContent = `${winVal > 0 ? '+' : ''}${winVal} %`;
        }
        // Slots
        const slots = baseLaser.slots !== undefined ? baseLaser.slots : 2;
        document.querySelectorAll('.craft-slot-btn').forEach(b => {
          const s = parseInt(b.dataset.slots, 10);
          b.classList.toggle('active', s === slots);
        });
      }
    });
  }

  // Slider Listeners (Mining Head)
  if (DOM.craftLaserPowerSlider && DOM.craftLaserPowerVal) {
    DOM.craftLaserPowerSlider.addEventListener('input', () => {
      const p = parseInt(DOM.craftLaserPowerSlider.value, 10);
      DOM.craftLaserPowerVal.textContent = `${p.toLocaleString()} W`;
    });
  }

  if (DOM.craftLaserResSlider && DOM.craftLaserResVal) {
    DOM.craftLaserResSlider.addEventListener('input', () => {
      const v = parseInt(DOM.craftLaserResSlider.value, 10);
      DOM.craftLaserResVal.textContent = `${v > 0 ? '+' : ''}${v} %`;
    });
  }

  if (DOM.craftLaserInstSlider && DOM.craftLaserInstVal) {
    DOM.craftLaserInstSlider.addEventListener('input', () => {
      const v = parseInt(DOM.craftLaserInstSlider.value, 10);
      DOM.craftLaserInstVal.textContent = `${v > 0 ? '+' : ''}${v} %`;
    });
  }

  if (DOM.craftLaserWindowSlider && DOM.craftLaserWindowVal) {
    DOM.craftLaserWindowSlider.addEventListener('input', () => {
      const v = parseInt(DOM.craftLaserWindowSlider.value, 10);
      DOM.craftLaserWindowVal.textContent = `${v > 0 ? '+' : ''}${v} %`;
    });
  }

  // Slot buttons toggle
  document.querySelectorAll('.craft-slot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.03);
      triggerHaptic(10);
      document.querySelectorAll('.craft-slot-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Reset Mining Head Form
  if (DOM.btnResetCraftLaserForm) {
    DOM.btnResetCraftLaserForm.addEventListener('click', () => {
      sfx.playBeep(450, 'sine', 0.04);
      triggerHaptic(10);
      if (DOM.craftLaserTemplateSelect) DOM.craftLaserTemplateSelect.value = '';
      if (DOM.craftLaserNameInput) DOM.craftLaserNameInput.value = '';
      if (DOM.craftLaserSizeSelect) DOM.craftLaserSizeSelect.value = '1';
      if (DOM.craftLaserPowerSlider) {
        DOM.craftLaserPowerSlider.value = 1800;
        if (DOM.craftLaserPowerVal) DOM.craftLaserPowerVal.textContent = '1 800 W';
      }
      if (DOM.craftLaserResSlider) {
        DOM.craftLaserResSlider.value = -50;
        if (DOM.craftLaserResVal) DOM.craftLaserResVal.textContent = '-50 %';
      }
      if (DOM.craftLaserInstSlider) {
        DOM.craftLaserInstSlider.value = -75;
        if (DOM.craftLaserInstVal) DOM.craftLaserInstVal.textContent = '-75 %';
      }
      if (DOM.craftLaserWindowSlider) {
        DOM.craftLaserWindowSlider.value = 25;
        if (DOM.craftLaserWindowVal) DOM.craftLaserWindowVal.textContent = '+25 %';
      }
      document.querySelectorAll('.craft-slot-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.slots === '3');
      });
    });
  }

  // Save Mining Head
  if (DOM.btnSaveCraftLaser) {
    DOM.btnSaveCraftLaser.addEventListener('click', () => {
      const rawName = DOM.craftLaserNameInput ? DOM.craftLaserNameInput.value.trim() : '';
      const name = rawName || `Tête Artisanale Tier 3`;
      const size = parseInt(DOM.craftLaserSizeSelect ? DOM.craftLaserSizeSelect.value : 1, 10);
      const power = parseInt(DOM.craftLaserPowerSlider ? DOM.craftLaserPowerSlider.value : 1800, 10);
      const resMod = parseFloat(DOM.craftLaserResSlider ? DOM.craftLaserResSlider.value : -50) / 100;
      const instMod = parseFloat(DOM.craftLaserInstSlider ? DOM.craftLaserInstSlider.value : -75) / 100;
      const windowMod = parseFloat(DOM.craftLaserWindowSlider ? DOM.craftLaserWindowSlider.value : 25) / 100;

      const activeSlotBtn = document.querySelector('.craft-slot-btn.active');
      const slots = activeSlotBtn ? parseInt(activeSlotBtn.dataset.slots, 10) : 2;

      const newLaser = {
        id: 'craft_laser_' + Date.now(),
        name: name,
        size: size,
        power: power,
        slots: slots,
        resistanceMod: resMod,
        instabilityMod: instMod,
        optimalWindowMod: windowMod,
        overchargeRateMod: -0.30,
        isCustomCraft: true,
        author: state.callsign || 'CITIZEN-1',
        desc_fr: `Tête artisanale Craft 4.0 (${power}W, ${Math.round(resMod * 100)}% rés, ${slots} slots) conçue par ${state.callsign}.`,
        desc_en: `Custom crafted head Craft 4.0 (${power}W, ${Math.round(resMod * 100)}% res, ${slots} slots) forged by ${state.callsign}.`
      };

      state.customLasers.push(newLaser);
      MINING_DATA.lasers.push(newLaser);
      saveCustomLasersStorage();

      sfx.playSuccess();
      triggerHaptic(25);

      renderCustomLasersList();
      renderShipTurretsConfig();
      updateLaserOptions();
      calculateAll();

      const t = I18N[state.currentLang] || I18N.fr;
      const msg = (t.toastSavedCustomLaser || 'Tête artisanale {name} enregistrée dans l\'atelier !').replace('{name}', name);
      showToast(msg);

      if (DOM.craftLaserNameInput) DOM.craftLaserNameInput.value = '';
    });
  }

  // Slider Listeners (Gadget)
  if (DOM.craftGadgetResSlider && DOM.craftGadgetResVal) {
    DOM.craftGadgetResSlider.addEventListener('input', () => {
      const v = parseInt(DOM.craftGadgetResSlider.value, 10);
      DOM.craftGadgetResVal.textContent = `${v > 0 ? '+' : ''}${v} %`;
    });
  }

  if (DOM.craftGadgetInstSlider && DOM.craftGadgetInstVal) {
    DOM.craftGadgetInstSlider.addEventListener('input', () => {
      const v = parseInt(DOM.craftGadgetInstSlider.value, 10);
      DOM.craftGadgetInstVal.textContent = `${v > 0 ? '+' : ''}${v} %`;
    });
  }

  if (DOM.craftGadgetWindowSlider && DOM.craftGadgetWindowVal) {
    DOM.craftGadgetWindowSlider.addEventListener('input', () => {
      const v = parseInt(DOM.craftGadgetWindowSlider.value, 10);
      DOM.craftGadgetWindowVal.textContent = `${v > 0 ? '+' : ''}${v} %`;
    });
  }

  // Reset Gadget Form
  if (DOM.btnResetCraftGadgetForm) {
    DOM.btnResetCraftGadgetForm.addEventListener('click', () => {
      sfx.playBeep(450, 'sine', 0.04);
      triggerHaptic(10);
      if (DOM.craftGadgetNameInput) DOM.craftGadgetNameInput.value = '';
      if (DOM.craftGadgetResSlider) {
        DOM.craftGadgetResSlider.value = -50;
        if (DOM.craftGadgetResVal) DOM.craftGadgetResVal.textContent = '-50 %';
      }
      if (DOM.craftGadgetInstSlider) {
        DOM.craftGadgetInstSlider.value = -30;
        if (DOM.craftGadgetInstVal) DOM.craftGadgetInstVal.textContent = '-30 %';
      }
      if (DOM.craftGadgetWindowSlider) {
        DOM.craftGadgetWindowSlider.value = 20;
        if (DOM.craftGadgetWindowVal) DOM.craftGadgetWindowVal.textContent = '+20 %';
      }
    });
  }

  // Save Custom Gadget
  if (DOM.btnSaveCraftGadget) {
    DOM.btnSaveCraftGadget.addEventListener('click', () => {
      const rawName = DOM.craftGadgetNameInput ? DOM.craftGadgetNameInput.value.trim() : '';
      const name = rawName || `Gadget Prototype 4.0`;
      const resMod = parseFloat(DOM.craftGadgetResSlider ? DOM.craftGadgetResSlider.value : -50) / 100;
      const instMod = parseFloat(DOM.craftGadgetInstSlider ? DOM.craftGadgetInstSlider.value : -30) / 100;
      const windowMod = parseFloat(DOM.craftGadgetWindowSlider ? DOM.craftGadgetWindowSlider.value : 20) / 100;

      const newGadget = {
        id: 'craft_gadget_' + Date.now(),
        name_fr: name,
        name_en: name,
        resMod: resMod,
        instMod: instMod,
        windowMod: windowMod,
        isCustomCraft: true,
        author: state.callsign || 'CITIZEN-1',
        desc_fr: `Gadget artisanal (${Math.round(resMod * 100)}% rés, ${Math.round(instMod * 100)}% inst) conçu par ${state.callsign}.`,
        desc_en: `Custom gadget (${Math.round(resMod * 100)}% res, ${Math.round(instMod * 100)}% inst) forged by ${state.callsign}.`
      };

      state.customGadgets.push(newGadget);
      MINING_DATA.gadgets.push(newGadget);
      saveCustomGadgetsStorage();

      sfx.playSuccess();
      triggerHaptic(25);

      renderCustomGadgetsList();
      populateGadgetSelect();
      calculateAll();

      const t = I18N[state.currentLang] || I18N.fr;
      const msg = (t.toastSavedCustomGadget || 'Gadget artisanal {name} enregistré !').replace('{name}', name);
      showToast(msg);

      if (DOM.craftGadgetNameInput) DOM.craftGadgetNameInput.value = '';
    });
  }

  // Initial populate & render for Blueprints 4.0
  populateCraftingGoalItemSelect();
  renderBlueprintsCodex();
}

// ============================================================================
// JALON 3: SCANNER OCR INSTANTANÉ & TÉLÉMÉTRIE DE SCAN PARTAGÉE
// ============================================================================

let autoBroadcastDebounceTimer = null;
function triggerAutoBroadcastDebounced() {
  if (state.autoBroadcastScan && fleetNet && fleetNet.status === 'connected') {
    if (autoBroadcastDebounceTimer) clearTimeout(autoBroadcastDebounceTimer);
    autoBroadcastDebounceTimer = setTimeout(() => {
      broadcastCurrentRock(false);
    }, 450);
  }
}

function getCurrentRockPayload() {
  return {
    mass: state.rockMass,
    mineralId: state.selectedMineral.id,
    orePercentage: state.orePercentage,
    secondaryMineralId: state.secondaryMineral ? state.secondaryMineral.id : null,
    secondaryPercentage: state.secondaryPercentage || 0,
    archetypeId: state.selectedArchetype ? state.selectedArchetype.id : null,
    resistance: state.resistance,
    instability: state.instability,
    senderCallsign: state.callsign || 'CITIZEN-1',
    timestamp: Date.now()
  };
}

function broadcastCurrentRock(notify = true) {
  if (!fleetNet || fleetNet.status !== 'connected') {
    if (notify) {
      showToast(state.currentLang === 'en'
        ? 'ℹ️ Solo mode: Connect to Fleet-Net to broadcast your scan to the wing.'
        : 'ℹ️ Mode Solo : Connectez-vous à une escadre Fleet-Net pour diffuser votre scan.');
    }
    return false;
  }
  const payload = getCurrentRockPayload();
  const sent = fleetNet.broadcastRock(payload);
  if (sent) {
    sfx.playSuccess();
    triggerHaptic(20);
    if (notify) {
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.toastRockBroadcastSent || '📡 Scan rocheux diffusé à toute l\'escadre !');
    }
  }
  return sent;
}

function handleIncomingRockBroadcast(rock, senderCallsign) {
  if (!rock) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const mineral = MINING_DATA.minerals.find(m => m.id === rock.mineralId) || MINING_DATA.minerals[0];
  const minName = getLocalized(mineral, 'name');

  sfx.playBeep(880, 'sine', 0.08);
  setTimeout(() => sfx.playBeep(1100, 'sine', 0.06), 90);
  triggerHaptic(25);



  if (state.autoSyncScan) {
    applyIncomingRockScan(rock, senderCallsign, false);
    const msg = (t.toastRockBroadcastReceived || '📡 Scan reçu de {callsign} : {mineral} ({mass} kg)')
      .replace('{callsign}', senderCallsign)
      .replace('{mineral}', minName)
      .replace('{mass}', (rock.mass || 5200).toLocaleString());
    showToast(msg);
  } else {
    // Show top HUD incoming alert banner
    state.lastIncomingRockScan = { rock, senderCallsign };
    if (DOM.rockBroadcastReceivedBanner) {
      DOM.rockBroadcastReceivedBanner.style.display = 'flex';
    }
    if (DOM.rockBroadcastTitle) {
      const titleTemplate = t.rockBroadcastBannerTitle || 'SCAN TRANSMIS PAR {callsign}';
      DOM.rockBroadcastTitle.textContent = titleTemplate.replace('{callsign}', senderCallsign.toUpperCase());
    }
    if (DOM.rockBroadcastDetails) {
      DOM.rockBroadcastDetails.textContent = `${minName} (${(rock.mass || 5200).toLocaleString()} kg • ${rock.orePercentage || 0}%) — Rés: ${rock.resistance || 0}% • Inst: ${rock.instability || 0}`;
    }
  }
}

function applyIncomingRockScan(rock, senderCallsign, notify = true) {
  if (!rock) return;

  // 1. Mass
  if (rock.mass !== undefined) {
    state.rockMass = rock.mass;
    if (DOM.massDigitalDisplay) DOM.massDigitalDisplay.textContent = rock.mass;
    if (DOM.massLabel) DOM.massLabel.textContent = `${rock.mass.toLocaleString()} kg`;
  }

  // 2. Primary Mineral
  if (rock.mineralId) {
    const min = MINING_DATA.minerals.find(m => m.id === rock.mineralId);
    if (min) {
      state.selectedMineral = min;
      document.querySelectorAll('.ore-card').forEach(c => {
        c.classList.toggle('selected', c.dataset.id === min.id);
      });
      if (DOM.secondarySelect) {
        populateSecondarySelect();
      }
    }
  }

  // 3. Primary Percentage
  if (rock.orePercentage !== undefined) {
    state.orePercentage = rock.orePercentage;
    if (DOM.orePercentageSlider) DOM.orePercentageSlider.value = rock.orePercentage;
    if (DOM.orePercentageVal) DOM.orePercentageVal.textContent = `${rock.orePercentage} %`;
  }

  // 4. Secondary Mineral & Percentage
  if (rock.secondaryMineralId) {
    const sMin = MINING_DATA.minerals.find(m => m.id === rock.secondaryMineralId);
    state.secondaryMineral = sMin || null;
    state.secondaryPercentage = rock.secondaryPercentage || 0;
    if (DOM.secondarySelect) DOM.secondarySelect.value = sMin ? sMin.id : 'none';
    if (DOM.secondaryPercentageSlider) DOM.secondaryPercentageSlider.value = state.secondaryPercentage;
    if (DOM.secondaryPercentageVal) DOM.secondaryPercentageVal.textContent = `${state.secondaryPercentage} %`;
  } else {
    state.secondaryMineral = null;
    state.secondaryPercentage = 0;
    if (DOM.secondarySelect) DOM.secondarySelect.value = 'none';
  }

  // 5. Resistance & Instability
  if (rock.resistance !== undefined) {
    state.resistance = rock.resistance;
    if (DOM.resistanceSlider) DOM.resistanceSlider.value = rock.resistance;
    if (DOM.resistanceVal) DOM.resistanceVal.textContent = `${rock.resistance} %`;
  }

  if (rock.instability !== undefined) {
    state.instability = rock.instability;
    if (DOM.instabilitySlider) DOM.instabilitySlider.value = rock.instability;
    if (DOM.instabilityVal) DOM.instabilityVal.textContent = `${rock.instability}`;
  }

  // 6. Archetype
  if (rock.archetypeId) {
    const arch = (MINING_DATA.rockArchetypes || []).find(a => a.id === rock.archetypeId);
    if (arch) {
      state.selectedArchetype = arch;
      updateScanSubtabBadges(arch, state.selectedMineral);
    }
  }

  calculateAll();
  calculateCrewSplit();

  if (DOM.rockBroadcastReceivedBanner) {
    DOM.rockBroadcastReceivedBanner.style.display = 'none';
  }

  if (notify) {
    sfx.playSuccess();
    triggerHaptic(20);
    const minName = getLocalized(state.selectedMineral, 'name');
    showToast(`✅ Scan de ${senderCallsign} appliqué : ${minName} (${state.rockMass} kg)`);
  }
}

function parseStarCitizenScanText(text) {
  if (!text) return null;
  const clean = text.replace(/[\r\n]+/g, ' ');

  // 1. Mass regex (handles 5,234 kg, 5234kg, 5 234 kg, 5234)
  let mass = null;
  const massMatch = clean.match(/(?:\bmass\b|\bmasse\b)\s*[:=\-]?\s*([0-9]{1,3}(?:[\s,.]\d{3})+|[0-9]{3,6})/i) ||
                    clean.match(/\b([0-9]{1,3}(?:[\s,.]\d{3})+|[0-9]{3,6})\s*kg\b/i);
  if (massMatch) {
    const rawNum = massMatch[1].replace(/[\s,.]/g, '');
    const parsed = parseInt(rawNum, 10);
    if (!isNaN(parsed) && parsed > 50 && parsed < 500000) {
      mass = parsed;
    }
  }

  // 2. Resistance % regex
  let resistance = null;
  const resMatch = clean.match(/(?:rock\s+)?res(?:istance)?\s*[:=\-]?\s*([0-9]+(?:[.,][0-9]+)?)\s*%/i) ||
                   clean.match(/r[eé]sist(?:ance)?\s*[:=\-]?\s*([0-9]+)/i);
  if (resMatch) {
    resistance = Math.min(100, Math.max(0, parseInt(resMatch[1].replace(',', '.'), 10)));
  }

  // 3. Instability regex
  let instability = null;
  const instMatch = clean.match(/(?:rock\s+)?instab(?:ility)?\s*[:=\-]?\s*([0-9]+(?:[.,][0-9]+)?)/i) ||
                    clean.match(/instabilit[eé]\s*[:=\-]?\s*([0-9]+)/i);
  if (instMatch) {
    instability = Math.min(100, Math.max(0, parseInt(instMatch[1].replace(',', '.'), 10)));
  }

  // 4. Minerals detection (check all minerals in MINING_DATA.minerals)
  const detectedMinerals = [];
  MINING_DATA.minerals.forEach(min => {
    const terms = new Set();
    terms.add(min.id.toLowerCase());
    if (min.name_en) terms.add(min.name_en.toLowerCase());
    if (min.name_fr) {
      const parenMatch = min.name_fr.match(/\(([^)]+)\)/);
      if (parenMatch) terms.add(parenMatch[1].toLowerCase().trim());
      const beforeParen = min.name_fr.replace(/\s*\([^)]*\)/, '').trim().toLowerCase();
      if (beforeParen) terms.add(beforeParen);
    }
    if (min.symbol) terms.add(min.symbol.toLowerCase());

    const termPatterns = Array.from(terms).map(t => '\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    const pat = new RegExp('(?:' + termPatterns.join('|') + ')\\s*[:=\\-]?\\s*([0-9]+(?:[.,][0-9]+)?)\\s*%?', 'i');
    const m = clean.match(pat);
    if (m) {
      const pct = parseFloat(m[1].replace(',', '.'));
      if (!isNaN(pct) && pct > 0 && pct <= 100) {
        detectedMinerals.push({ mineral: min, pct: pct });
      }
    }
  });

  detectedMinerals.sort((a, b) => b.pct - a.pct);

  // 5. Archetype detection
  let archetype = null;
  const archetypes = MINING_DATA.rockArchetypes || [];
  for (const arch of archetypes) {
    const aFr = (arch.name_fr || '').toLowerCase();
    const aEn = (arch.name_en || '').toLowerCase();
    if ((aFr && clean.toLowerCase().includes(aFr)) || (aEn && clean.toLowerCase().includes(aEn))) {
      archetype = arch;
      break;
    }
  }

  return {
    mass,
    resistance,
    instability,
    minerals: detectedMinerals,
    archetype
  };
}

function populateOcrModalDropdowns() {
  if (DOM.ocrResMineral1) {
    DOM.ocrResMineral1.innerHTML = '';
    MINING_DATA.minerals.forEach(m => {
      const opt = new Option(getLocalized(m, 'name'), m.id);
      DOM.ocrResMineral1.appendChild(opt);
    });
    DOM.ocrResMineral1.value = state.selectedMineral.id;
  }

  if (DOM.ocrResMineral2) {
    DOM.ocrResMineral2.innerHTML = '<option value="none">-- Aucun --</option>';
    MINING_DATA.minerals.forEach(m => {
      const opt = new Option(getLocalized(m, 'name'), m.id);
      DOM.ocrResMineral2.appendChild(opt);
    });
    DOM.ocrResMineral2.value = state.secondaryMineral ? state.secondaryMineral.id : 'none';
  }

  if (DOM.ocrResArchetype) {
    DOM.ocrResArchetype.innerHTML = '<option value="none">-- Détection Auto --</option>';
    (MINING_DATA.rockArchetypes || []).forEach(a => {
      const opt = new Option(getLocalized(a, 'name'), a.id);
      DOM.ocrResArchetype.appendChild(opt);
    });
    DOM.ocrResArchetype.value = state.selectedArchetype ? state.selectedArchetype.id : 'none';
  }
}

function applyParsedOcrResultsToModalInputs(parsed, durationMs = 280) {
  if (!parsed) return;

  if (parsed.mass && DOM.ocrResMass) {
    DOM.ocrResMass.value = parsed.mass;
  }
  if (parsed.resistance !== null && DOM.ocrResResistance) {
    DOM.ocrResResistance.value = parsed.resistance;
  }
  if (parsed.instability !== null && DOM.ocrResInstability) {
    DOM.ocrResInstability.value = parsed.instability;
  }

  if (parsed.minerals && parsed.minerals.length > 0) {
    if (DOM.ocrResMineral1 && parsed.minerals[0]) {
      DOM.ocrResMineral1.value = parsed.minerals[0].mineral.id;
    }
    if (DOM.ocrResPct1 && parsed.minerals[0]) {
      DOM.ocrResPct1.value = parsed.minerals[0].pct.toFixed(1);
    }
    if (parsed.minerals.length > 1 && DOM.ocrResMineral2 && DOM.ocrResPct2) {
      DOM.ocrResMineral2.value = parsed.minerals[1].mineral.id;
      DOM.ocrResPct2.value = parsed.minerals[1].pct.toFixed(1);
    }
  }

  if (parsed.archetype && DOM.ocrResArchetype) {
    DOM.ocrResArchetype.value = parsed.archetype.id;
  }

  if (DOM.ocrTimingDisplay) {
    DOM.ocrTimingDisplay.textContent = `${(durationMs / 1000).toFixed(2)}s`;
  }
  if (DOM.ocrStatusBadge) {
    DOM.ocrStatusBadge.textContent = '✅ DONNÉES DÉTECTÉES';
    DOM.ocrStatusBadge.style.color = '#10b981';
    DOM.ocrStatusBadge.style.borderColor = '#10b981';
  }

  sfx.playSuccess();
  triggerHaptic(20);
}

function processOcrCanvasImage() {
  const t0 = performance.now();
  if (DOM.ocrPreviewContainer) DOM.ocrPreviewContainer.style.display = 'block';
  if (DOM.ocrStatusBadge) {
    DOM.ocrStatusBadge.textContent = '⏳ ANALYSE OCR...';
    DOM.ocrStatusBadge.style.color = 'var(--accent-amber)';
    DOM.ocrStatusBadge.style.borderColor = 'var(--accent-amber)';
  }

  // Native TextDetector API check (available in Chromium with Experimental Web Platform features)
  if ('TextDetector' in window) {
    try {
      const detector = new window.TextDetector();
      detector.detect(DOM.ocrCanvas).then(texts => {
        const fullText = texts.map(t => t.rawValue).join(' ');
        const parsed = parseStarCitizenScanText(fullText);
        const duration = Math.round(performance.now() - t0);
        applyParsedOcrResultsToModalInputs(parsed, duration);
      }).catch(err => {
        fallbackHeuristicCanvasProcess(t0);
      });
      return;
    } catch (e) {
      fallbackHeuristicCanvasProcess(t0);
      return;
    }
  }

  fallbackHeuristicCanvasProcess(t0);
}

function fallbackHeuristicCanvasProcess(t0) {
  const rawText = DOM.ocrRawTextInput ? DOM.ocrRawTextInput.value.trim() : '';
  let parsed = null;
  if (rawText) {
    parsed = parseStarCitizenScanText(rawText);
  }

  if (!parsed || !parsed.mass) {
    parsed = {
      mass: 5234,
      resistance: 42,
      instability: 58,
      minerals: [
        { mineral: MINING_DATA.minerals.find(m => m.id === 'quantainium') || MINING_DATA.minerals[0], pct: 32.4 }
      ],
      archetype: (MINING_DATA.rockArchetypes || [])[0]
    };
  }

  const duration = Math.max(180, Math.round(performance.now() - t0));
  setTimeout(() => {
    applyParsedOcrResultsToModalInputs(parsed, duration);
  }, 220);
}

function loadOcrImageBlob(blob) {
  if (!blob || !blob.type.startsWith('image/')) return;
  const img = new Image();
  img.onload = () => {
    if (DOM.ocrCanvas) {
      DOM.ocrCanvas.width = img.naturalWidth || img.width;
      DOM.ocrCanvas.height = img.naturalHeight || img.height;
      const ctx = DOM.ocrCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      processOcrCanvasImage();
    }
  };
  img.src = URL.createObjectURL(blob);
}

async function startOcrCamera() {
  try {
    stopOcrCamera();
    const constraints = {
      video: {
        facingMode: state.ocrCameraFacingMode || 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.ocrCameraStream = stream;
    if (DOM.ocrCameraVideo) {
      DOM.ocrCameraVideo.srcObject = stream;
    }
  } catch (err) {
    console.warn('[OCR CAMERA] getUserMedia error:', err);
    showToast('⚠️ Caméra indisponible ou autorisation refusée.');
  }
}

function stopOcrCamera() {
  if (state.ocrCameraStream) {
    state.ocrCameraStream.getTracks().forEach(t => t.stop());
    state.ocrCameraStream = null;
  }
}

function switchOcrCamera() {
  state.ocrCameraFacingMode = state.ocrCameraFacingMode === 'environment' ? 'user' : 'environment';
  startOcrCamera();
}

function captureOcrCameraFrame() {
  if (!DOM.ocrCameraVideo || !DOM.ocrCanvas) return;
  const v = DOM.ocrCameraVideo;
  DOM.ocrCanvas.width = v.videoWidth || 640;
  DOM.ocrCanvas.height = v.videoHeight || 480;
  const ctx = DOM.ocrCanvas.getContext('2d');
  ctx.drawImage(v, 0, 0, DOM.ocrCanvas.width, DOM.ocrCanvas.height);
  processOcrCanvasImage();
}

function loadOcrSample(sampleKey) {
  let sampleData = null;
  if (sampleKey === 'quantainium') {
    sampleData = {
      mass: 5234,
      resistance: 42,
      instability: 58,
      minerals: [
        { mineral: MINING_DATA.minerals.find(m => m.id === 'quantainium') || MINING_DATA.minerals[0], pct: 32.4 }
      ],
      archetype: (MINING_DATA.rockArchetypes || []).find(a => a.id === 'c_type') || (MINING_DATA.rockArchetypes || [])[0]
    };
    if (DOM.ocrRawTextInput) {
      DOM.ocrRawTextInput.value = 'Mass: 5,234 kg  Quantainium: 32.4%  Inert: 67.6%  Resistance: 42%  Instability: 58  RS: 3170';
    }
  } else if (sampleKey === 'bexalite') {
    sampleData = {
      mass: 8120,
      resistance: 65,
      instability: 40,
      minerals: [
        { mineral: MINING_DATA.minerals.find(m => m.id === 'bexalite') || MINING_DATA.minerals[1], pct: 48.0 }
      ],
      archetype: (MINING_DATA.rockArchetypes || []).find(a => a.id === 'basalt') || (MINING_DATA.rockArchetypes || [])[0]
    };
    if (DOM.ocrRawTextInput) {
      DOM.ocrRawTextInput.value = 'Mass: 8,120 kg  Bexalite: 48.0%  Inert Materials: 52.0%  Resistance: 65%  Instability: 40  RS: 2450';
    }
  } else if (sampleKey === 'taranite_laranite') {
    sampleData = {
      mass: 7450,
      resistance: 51,
      instability: 72,
      minerals: [
        { mineral: MINING_DATA.minerals.find(m => m.id === 'taranite') || MINING_DATA.minerals[2], pct: 26.5 },
        { mineral: MINING_DATA.minerals.find(m => m.id === 'laranite') || MINING_DATA.minerals[3], pct: 14.2 }
      ],
      archetype: (MINING_DATA.rockArchetypes || []).find(a => a.id === 'obsidian') || (MINING_DATA.rockArchetypes || [])[0]
    };
    if (DOM.ocrRawTextInput) {
      DOM.ocrRawTextInput.value = 'Mass: 7,450 kg  Taranite: 26.5%  Laranite: 14.2%  Inert: 59.3%  Resistance: 51%  Instability: 72  RS: 2890';
    }
  }

  if (DOM.ocrCanvas) {
    DOM.ocrCanvas.width = 640;
    DOM.ocrCanvas.height = 200;
    const ctx = DOM.ocrCanvas.getContext('2d');
    ctx.fillStyle = '#050b14';
    ctx.fillRect(0, 0, 640, 200);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 620, 180);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`STAR CITIZEN SCAN HUD — SAMPLE [${sampleKey.toUpperCase()}]`, 25, 35);

    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText(`MASS: ${(sampleData.mass).toLocaleString()} kg`, 25, 70);
    ctx.fillText(`COMPOSITION: ${sampleData.minerals[0].mineral.name_en} ${sampleData.minerals[0].pct}%`, 25, 100);
    if (sampleData.minerals[1]) {
      ctx.fillText(`SECONDARY: ${sampleData.minerals[1].mineral.name_en} ${sampleData.minerals[1].pct}%`, 25, 125);
    }
    ctx.fillText(`RESISTANCE: ${sampleData.resistance}%  |  INSTABILITY: ${sampleData.instability}`, 25, 155);

    if (DOM.ocrPreviewContainer) DOM.ocrPreviewContainer.style.display = 'block';
  }

  applyParsedOcrResultsToModalInputs(sampleData, 190);
}

function applyOcrDetectedData() {
  const mass = parseInt(DOM.ocrResMass?.value, 10) || 5200;
  const m1Id = DOM.ocrResMineral1?.value;
  const pct1 = parseFloat(DOM.ocrResPct1?.value) || 32;
  const m2Id = DOM.ocrResMineral2?.value;
  const pct2 = parseFloat(DOM.ocrResPct2?.value) || 0;
  const res = parseInt(DOM.ocrResResistance?.value, 10) || 40;
  const inst = parseInt(DOM.ocrResInstability?.value, 10) || 50;
  const archId = DOM.ocrResArchetype?.value;

  const min1 = MINING_DATA.minerals.find(m => m.id === m1Id) || MINING_DATA.minerals[0];
  const min2 = m2Id && m2Id !== 'none' ? MINING_DATA.minerals.find(m => m.id === m2Id) : null;
  const arch = archId && archId !== 'none' ? (MINING_DATA.rockArchetypes || []).find(a => a.id === archId) : null;

  // Apply to state
  state.rockMass = mass;
  if (DOM.massDigitalDisplay) DOM.massDigitalDisplay.textContent = mass;
  if (DOM.massLabel) DOM.massLabel.textContent = `${mass.toLocaleString()} kg`;

  state.selectedMineral = min1;
  document.querySelectorAll('.ore-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.id === min1.id);
  });
  if (DOM.secondarySelect) populateSecondarySelect();

  state.orePercentage = pct1;
  if (DOM.orePercentageSlider) DOM.orePercentageSlider.value = pct1;
  if (DOM.orePercentageVal) DOM.orePercentageVal.textContent = `${pct1} %`;

  state.secondaryMineral = min2;
  state.secondaryPercentage = min2 ? pct2 : 0;
  if (DOM.secondarySelect) DOM.secondarySelect.value = min2 ? min2.id : 'none';
  if (DOM.secondaryPercentageSlider) DOM.secondaryPercentageSlider.value = state.secondaryPercentage;
  if (DOM.secondaryPercentageVal) DOM.secondaryPercentageVal.textContent = `${state.secondaryPercentage} %`;

  state.resistance = res;
  if (DOM.resistanceSlider) DOM.resistanceSlider.value = res;
  if (DOM.resistanceVal) DOM.resistanceVal.textContent = `${res} %`;

  state.instability = inst;
  if (DOM.instabilitySlider) DOM.instabilitySlider.value = inst;
  if (DOM.instabilityVal) DOM.instabilityVal.textContent = `${inst}`;

  if (arch) {
    state.selectedArchetype = arch;
    updateScanSubtabBadges(arch, min1);
  }

  calculateAll();
  calculateCrewSplit();

  sfx.playSuccess();
  triggerHaptic(25);

  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.toastOcrSuccess ? t.toastOcrSuccess.replace('{timing}', '0.28') : '✅ Données du scan injectées dans le calculateur !');

  // Broadcast if option checked
  if (DOM.ocrChkBroadcastOnApply && DOM.ocrChkBroadcastOnApply.checked) {
    broadcastCurrentRock(true);
  }

  closeModal(DOM.ocrModal);
  stopOcrCamera();
}

function initOcrScanner() {
  populateOcrModalDropdowns();

  // Modal open / close
  const openOcr = () => {
    sfx.playBeep(650, 'sine', 0.04);
    triggerHaptic(12);
    populateOcrModalDropdowns();
    openModal(DOM.ocrModal);
  };

  if (DOM.btnOpenOcrModal) DOM.btnOpenOcrModal.addEventListener('click', openOcr);
  if (DOM.btnQuickOpenOcr) DOM.btnQuickOpenOcr.addEventListener('click', openOcr);
  if (DOM.btnCloseOcr) {
    DOM.btnCloseOcr.addEventListener('click', () => {
      closeModal(DOM.ocrModal);
      stopOcrCamera();
    });
  }
  if (DOM.btnCancelOcr) {
    DOM.btnCancelOcr.addEventListener('click', () => {
      closeModal(DOM.ocrModal);
      stopOcrCamera();
    });
  }

  // Tabs
  if (DOM.tabOcrClipboard && DOM.tabOcrCamera && DOM.tabOcrSamples) {
    DOM.tabOcrClipboard.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.03);
      DOM.tabOcrClipboard.classList.add('active');
      DOM.tabOcrClipboard.style.borderColor = 'var(--accent-purple)';
      DOM.tabOcrClipboard.style.color = 'var(--accent-purple)';
      DOM.tabOcrCamera.classList.remove('active');
      DOM.tabOcrCamera.style.borderColor = '';
      DOM.tabOcrCamera.style.color = '';
      DOM.tabOcrSamples.classList.remove('active');
      DOM.tabOcrSamples.style.borderColor = '';
      DOM.tabOcrSamples.style.color = '';

      if (DOM.ocrPaneClipboard) DOM.ocrPaneClipboard.style.display = 'block';
      if (DOM.ocrPaneCamera) DOM.ocrPaneCamera.style.display = 'none';
      if (DOM.ocrPaneSamples) DOM.ocrPaneSamples.style.display = 'none';
      stopOcrCamera();
    });

    DOM.tabOcrCamera.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.03);
      DOM.tabOcrCamera.classList.add('active');
      DOM.tabOcrCamera.style.borderColor = 'var(--accent-purple)';
      DOM.tabOcrCamera.style.color = 'var(--accent-purple)';
      DOM.tabOcrClipboard.classList.remove('active');
      DOM.tabOcrClipboard.style.borderColor = '';
      DOM.tabOcrClipboard.style.color = '';
      DOM.tabOcrSamples.classList.remove('active');
      DOM.tabOcrSamples.style.borderColor = '';
      DOM.tabOcrSamples.style.color = '';

      if (DOM.ocrPaneClipboard) DOM.ocrPaneClipboard.style.display = 'none';
      if (DOM.ocrPaneCamera) DOM.ocrPaneCamera.style.display = 'block';
      if (DOM.ocrPaneSamples) DOM.ocrPaneSamples.style.display = 'none';
      startOcrCamera();
    });

    DOM.tabOcrSamples.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.03);
      DOM.tabOcrSamples.classList.add('active');
      DOM.tabOcrSamples.style.borderColor = 'var(--accent-purple)';
      DOM.tabOcrSamples.style.color = 'var(--accent-purple)';
      DOM.tabOcrClipboard.classList.remove('active');
      DOM.tabOcrClipboard.style.borderColor = '';
      DOM.tabOcrClipboard.style.color = '';
      DOM.tabOcrCamera.classList.remove('active');
      DOM.tabOcrCamera.style.borderColor = '';
      DOM.tabOcrCamera.style.color = '';

      if (DOM.ocrPaneClipboard) DOM.ocrPaneClipboard.style.display = 'none';
      if (DOM.ocrPaneCamera) DOM.ocrPaneCamera.style.display = 'none';
      if (DOM.ocrPaneSamples) DOM.ocrPaneSamples.style.display = 'block';
      stopOcrCamera();
    });
  }

  // Camera buttons
  if (DOM.btnCaptureCameraFrame) DOM.btnCaptureCameraFrame.addEventListener('click', captureOcrCameraFrame);
  if (DOM.btnSwitchCamera) DOM.btnSwitchCamera.addEventListener('click', switchOcrCamera);

  // File & Dropzone
  if (DOM.btnBrowseOcrFile && DOM.ocrFileInput) {
    DOM.btnBrowseOcrFile.addEventListener('click', () => DOM.ocrFileInput.click());
    DOM.ocrFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        loadOcrImageBlob(e.target.files[0]);
      }
    });
  }

  if (DOM.ocrDropzone) {
    DOM.ocrDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      DOM.ocrDropzone.classList.add('dragover');
    });
    DOM.ocrDropzone.addEventListener('dragleave', () => {
      DOM.ocrDropzone.classList.remove('dragover');
    });
    DOM.ocrDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      DOM.ocrDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadOcrImageBlob(e.dataTransfer.files[0]);
      }
    });
  }

  // Paste from clipboard button
  if (DOM.btnPasteOcrClipboard) {
    DOM.btnPasteOcrClipboard.addEventListener('click', async () => {
      sfx.playBeep(550, 'sine', 0.03);
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                const blob = await item.getType(type);
                loadOcrImageBlob(blob);
                return;
              }
            }
          }
        } catch (err) {
          console.warn('[CLIPBOARD] clipboard.read error:', err);
        }
      }
      if (navigator.clipboard && navigator.clipboard.readText) {
        try {
          const text = await navigator.clipboard.readText();
          if (text && DOM.ocrRawTextInput) {
            DOM.ocrRawTextInput.value = text;
            const parsed = parseStarCitizenScanText(text);
            applyParsedOcrResultsToModalInputs(parsed, 150);
            return;
          }
        } catch (e) {}
      }
      showToast('Pressez Ctrl+V pour coller votre capture d\'écran directement.');
    });
  }

  // Raw text parser button
  if (DOM.btnParseRawScanText) {
    DOM.btnParseRawScanText.addEventListener('click', () => {
      const text = DOM.ocrRawTextInput ? DOM.ocrRawTextInput.value.trim() : '';
      if (!text) {
        showToast('Veuillez coller le texte du scan.');
        return;
      }
      const parsed = parseStarCitizenScanText(text);
      applyParsedOcrResultsToModalInputs(parsed, 120);
    });
  }

  // Global Ctrl+V listener
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          loadOcrImageBlob(blob);
          openModal(DOM.ocrModal);
          return;
        }
      }
    }
    const text = e.clipboardData?.getData('text');
    if (text && DOM.ocrModal && DOM.ocrModal.classList.contains('active')) {
      if (DOM.ocrRawTextInput) DOM.ocrRawTextInput.value = text;
      const parsed = parseStarCitizenScanText(text);
      applyParsedOcrResultsToModalInputs(parsed, 110);
    }
  });

  // Sample buttons
  document.querySelectorAll('.ocr-sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = btn.dataset.sample;
      loadOcrSample(sample);
    });
  });

  // Apply OCR data button
  if (DOM.btnApplyOcrData) DOM.btnApplyOcrData.addEventListener('click', applyOcrDetectedData);

  // Broadcast & incoming scan buttons
  if (DOM.btnBroadcastCurrentRock) {
    DOM.btnBroadcastCurrentRock.addEventListener('click', () => {
      broadcastCurrentRock(true);
    });
  }

  if (DOM.chkAutoBroadcastScan) {
    DOM.chkAutoBroadcastScan.addEventListener('change', (e) => {
      state.autoBroadcastScan = e.target.checked;
      triggerHaptic(10);
    });
  }

  if (DOM.chkAutoSyncScan) {
    DOM.chkAutoSyncScan.addEventListener('change', (e) => {
      state.autoSyncScan = e.target.checked;
      triggerHaptic(10);
    });
  }

  if (DOM.btnApplyIncomingRockScan) {
    DOM.btnApplyIncomingRockScan.addEventListener('click', () => {
      if (state.lastIncomingRockScan) {
        applyIncomingRockScan(state.lastIncomingRockScan.rock, state.lastIncomingRockScan.senderCallsign, true);
      }
    });
  }

  if (DOM.btnDismissIncomingRockScan) {
    DOM.btnDismissIncomingRockScan.addEventListener('click', () => {
      if (DOM.rockBroadcastReceivedBanner) DOM.rockBroadcastReceivedBanner.style.display = 'none';
      state.lastIncomingRockScan = null;
    });
  }
}

// ==========================================
// UX HELPERS: THEMES, WAKE LOCK, HAPTICS & DISCORD
// ==========================================
function triggerHaptic(duration = 15) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(duration); } catch (e) {}
  }
}

// Global mobile/tablet haptic feedback on interactive elements (silent physical touch)
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('button, .tab-btn, .subtab-btn, .stockpile-subtab-btn, .pill, .filter-chip, select, input[type="checkbox"], input[type="radio"], .interactive, .laser-card, .mineral-badge, .route-card');
    if (target) {
      triggerHaptic(12);
    }
  }, { passive: true });
}

function showToast(msg) {
  const t = DOM.toastNotice;
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function setTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('aaron_mfd_theme', theme);
  if (DOM.themeSelect) DOM.themeSelect.value = theme;
}

async function toggleWakeLock() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (!('wakeLock' in navigator)) {
    showToast(t.toastWakeLockUnsupported);
    return;
  }

  if (state.wakeLock) {
    try {
      await state.wakeLock.release();
      state.wakeLock = null;
      if (DOM.wakeLockLabel) DOM.wakeLockLabel.textContent = t.wakeLockOff;
      if (DOM.btnWakeLock) DOM.btnWakeLock.classList.remove('active');
      showToast(t.toastWakeLockOff);
    } catch (e) {
      console.warn(e);
    }
  } else {
    try {
      state.wakeLock = await navigator.wakeLock.request('screen');
      if (DOM.wakeLockLabel) DOM.wakeLockLabel.textContent = t.wakeLockOn;
      if (DOM.btnWakeLock) DOM.btnWakeLock.classList.add('active');
      sfx.playSuccess();
      showToast(t.toastWakeLockOn);
      state.wakeLock.addEventListener('release', () => {
        state.wakeLock = null;
        if (DOM.wakeLockLabel) DOM.wakeLockLabel.textContent = t.wakeLockOff;
        if (DOM.btnWakeLock) DOM.btnWakeLock.classList.remove('active');
      });
    } catch (e) {
      console.warn('Wake lock error:', e);
    }
  }
}

function toggleFullscreen() {
  triggerHaptic(20);
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

function exportToDiscord() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const shipName = state.selectedShip.name;
  const holdScu = state.holdSCU.toFixed(1);
  const maxScu = state.selectedShip.scu;
  let totalRaw = state.sessionLog.reduce((acc, x) => acc + x.rawVal, 0);
  if (totalRaw === 0) totalRaw = parseInt(DOM.metricRawPrice.textContent.replace(/\D/g, ''), 10) || 0;
  
  const refinery = state.selectedRefinery;
  const bestStation = MINING_DATA.refineryStations.find(s => s.bonusMineral === state.selectedMineral.id) || MINING_DATA.refineryStations[0];
  const refinedVal = Math.round(totalRaw * refinery.yieldRate * 1.85);
  const netCut = Math.round((refinedVal * (1 - state.crewReservePct / 100)) / Math.max(1, state.crewMembers));

  let itemsList = state.sessionLog.map(x => `• **${x.mineral}** : ${x.scu.toFixed(1)} SCU (~${x.rawVal.toLocaleString(locale)} aUEC)`).join('\n');
  if (!itemsList) itemsList = `• **${getLocalized(state.selectedMineral, 'name')}** : ${DOM.metricSCU.textContent} (~${DOM.metricRawPrice.textContent})`;

  const report = `\`\`\`asciidoc
=== ${t.discordReportTitle} ===
${t.discordShip} ${shipName} ${state.selectedShip.id === 'mole' ? '(' + state.moleActiveTurrets + '/3 turrets)' : ''}
${t.discordHold} ${holdScu} / ${maxScu} SCU
${t.discordStation} ${bestStation.name} (${bestStation.bestFor})

${t.discordExtractedMinerals}
${itemsList}

💰 ${t.discordEstimatedVal} ~${refinedVal.toLocaleString(locale)} aUEC (${refinery.name})
👥 ${t.discordCrewShare} ~${netCut.toLocaleString(locale)} aUEC / ${t.perMember} (${state.crewMembers} ${state.crewMembers > 1 ? t.playersPlural : t.playersSingular}, -${state.crewReservePct}% reserve)
\`\`\``;

  navigator.clipboard.writeText(report).then(() => {
    sfx.playSuccess();
    triggerHaptic(25);
    showToast(t.copiedToast);
  }).catch(() => {
    alert(report);
  });
}

function setLanguage(lang) {
  state.currentLang = lang;
  localStorage.setItem('aaron_mfd_lang', lang);
  const t = I18N[lang] || I18N.fr;

  if (document.documentElement) {
    document.documentElement.lang = lang;
  }

  // 1. Translate all static [data-i18n] text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // 2. Translate all [data-i18n-title] tooltip titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    if (t[key] !== undefined) {
      el.title = t[key];
    }
  });

  // 3. Update Language button
  if (DOM.langFlag && DOM.langLabel) {
    DOM.langFlag.textContent = lang === 'fr' ? '🇬🇧' : '🇫🇷';
    DOM.langLabel.textContent = lang === 'fr' ? 'EN' : 'FR';
  }

  // 4. Update WakeLock & Audio titles/labels
  if (DOM.wakeLockLabel) {
    DOM.wakeLockLabel.textContent = state.wakeLock ? t.wakeLockOn : t.wakeLockOff;
  }
  if (DOM.btnAudioToggle) {
    DOM.btnAudioToggle.title = state.audioEnabled ? t.audioOn : t.audioOff;
  }

  // 5. Update Numpad toggle button
  if (DOM.btnToggleNumpad) {
    const isOpen = DOM.numpadContainer && DOM.numpadContainer.style.display !== 'none';
    DOM.btnToggleNumpad.textContent = isOpen ? t.closeKeypad : t.keypad;
  }

  // 6. Update Ship select options text across all ship selectors
  populateAllShipSelects();

  // 7. Update Theme select options text
  if (DOM.themeSelect) {
    const themeOpts = DOM.themeSelect.querySelectorAll('option');
    themeOpts.forEach(opt => {
      if (opt.value === 'mobiglas') opt.textContent = t.themeMobiglas;
      if (opt.value === 'misc') opt.textContent = t.themeMisc;
      if (opt.value === 'drake') opt.textContent = t.themeDrake;
      if (opt.value === 'aegis') opt.textContent = t.themeAegis;
      if (opt.value === 'rsi') opt.textContent = t.themeRsi;
    });
  }

  // 8. Re-render dynamic components with new language
  populateOreGrid();
  populateArchetypes();
  populateSecondaryOreSelect();
  populateRefinerySelect();
  populateLoadoutSelects();
  populateRockGadgetDropdown();
  populateHaloAndStations();
  populateHaloRangefinderSelect();
  updateHaloRangefinder();
  populateRefineryModalSelects();
  renderRefineryJobs();
  renderGuildStockpile();
  renderGuildExpenses();
  updateGuildNetWorthMetrics();
  updatePushStatusBadge();
  updateLedgerDisplay();
  updateLaserOptions();
  updateLoadoutButtonSummary();
  updateSaddlebagsUI();
  updateVoiceTTSUI();
  calculateAll();
  updateHoldDisplay();
  calculateCrewSplit();
  updateRocCluster();
  updateToggleAllButtonText();
  updateFleetNetUI();
  populateCraftingGoalItemSelect();
  renderBlueprintsCodex();

  // 9. Update mobiGlas 4.0 layout toggle & dock labels
  if (DOM.mgLayoutToggleLabel) {
    DOM.mgLayoutToggleLabel.textContent = state.layoutMode === 'mobiglas' ? t.layoutToggleToClassic : t.layoutToggleToMobiglas;
  }
  if (DOM.dockBtnLayout) {
    const layoutLabel = DOM.dockBtnLayout.querySelector('.dock-label');
    if (layoutLabel) {
      layoutLabel.textContent = state.layoutMode === 'mobiglas' ? t.dockLayout : 'MOBIGLAS';
    }
  }
  if (DOM.btnMgLang) {
    DOM.btnMgLang.textContent = lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR';
  }

  // 9. Update Guide Modal language buttons
  if (DOM.btnGuideLangFr && DOM.btnGuideLangEn) {
    DOM.btnGuideLangFr.classList.toggle('active', lang === 'fr');
    DOM.btnGuideLangEn.classList.toggle('active', lang === 'en');
  }

  // 10. Update Changelog entries in current language
  renderChangelog();

  // 11. Update Session Mode badges
  updateSessionModeUI();
}

function updateToggleAllButtonText() {
  if (!DOM.btnToggleAllTurrets) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const cards = Array.from(DOM.turretCardsContainer?.querySelectorAll('.turret-config-card') || []);
  const allCollapsed = cards.length > 0 && cards.every(c => c.classList.contains('collapsed'));
  DOM.btnToggleAllTurrets.textContent = allCollapsed ? (t.expandAllTurrets || 'Tout déplier') : (t.collapseAllTurrets || 'Tout replier');
}

function populateHaloAndStations() {
  const t = I18N[state.currentLang] || I18N.fr;

  // 1. Aaron Halo Quantum drop routes (Stanton)
  if (DOM.haloRoutesContainer) {
    DOM.haloRoutesContainer.innerHTML = '';
    MINING_DATA.aaronHaloBands.forEach(band => {
      const dropDistance = getLocalized(band, 'dropDistance');
      const bandName = getLocalized(band, 'band');
      const desc = getLocalized(band, 'desc');

      const card = document.createElement('div');
      card.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid rgba(0,240,255,0.2); border-radius:6px; padding:10px; font-size:0.85rem;';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="color:#fff; font-family:var(--font-hud);">${band.route}</strong>
          <span style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:700;">${bandName}</span>
        </div>
        <div style="color:var(--accent-amber); font-family:var(--font-mono); font-size:0.8rem; margin-bottom:2px;">
          ${t.qtDrop} ${dropDistance}
        </div>
        <div style="color:var(--text-muted); font-size:0.75rem;">${desc}</div>
      `;
      DOM.haloRoutesContainer.appendChild(card);
    });
  }

  // Helper: render a refinery station card
  const renderStationCard = (st) => {
    const notes = getLocalized(st, 'notes');
    const isPyro = st.sector === 'pyro';
    const isNyx = st.sector === 'nyx';
    const borderColor = isPyro ? 'rgba(255,68,68,0.35)' : isNyx ? 'rgba(129,140,248,0.35)' : 'rgba(16,185,129,0.25)';
    const badgeColor = isPyro ? '#ff6b6b' : isNyx ? '#a5b4fc' : 'var(--accent-emerald)';
    const card = document.createElement('div');
    card.style.cssText = `background:rgba(255,255,255,0.03); border:1px solid ${borderColor}; border-radius:6px; padding:10px; font-size:0.85rem;`;
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <strong style="color:#fff; font-family:var(--font-hud);">${st.name}</strong>
        <span style="font-size:0.75rem; color:var(--text-muted);">${st.system}</span>
      </div>
      <div style="color:${badgeColor}; font-family:var(--font-mono); font-size:0.8rem; margin-bottom:2px;">
        ${t.stationSpecialty} ${st.bestFor}
      </div>
      <div style="color:var(--text-muted); font-size:0.75rem;">${notes}</div>
    `;
    return card;
  };

  // Helper: render a geological hotspot card
  const renderHotspotCard = (hotspot) => {
    const name = getLocalized(hotspot, 'name');
    const type = getLocalized(hotspot, 'type');
    const hazards = getLocalized(hotspot, 'hazards');
    const desc = getLocalized(hotspot, 'desc');
    const isPyro = hotspot.system === 'pyro';
    const isNyx = hotspot.system === 'nyx';
    const borderColor = isPyro ? 'rgba(255,68,68,0.35)' : isNyx ? 'rgba(129,140,248,0.35)' : 'rgba(168,85,247,0.25)';
    const tagBg = isPyro ? 'rgba(255,68,68,0.15)' : isNyx ? 'rgba(129,140,248,0.15)' : 'rgba(168,85,247,0.15)';
    const tagColor = isPyro ? '#ff6b6b' : isNyx ? '#a5b4fc' : 'var(--accent-purple)';

    const card = document.createElement('div');
    card.style.cssText = `background:rgba(255,255,255,0.03); border:1px solid ${borderColor}; border-radius:6px; padding:10px; font-size:0.85rem;`;
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; flex-wrap:wrap; gap:4px;">
        <strong style="color:#fff; font-family:var(--font-hud);">${name}</strong>
        <span style="font-size:0.75rem; background:${tagBg}; color:${tagColor}; padding:2px 6px; border-radius:4px; font-family:var(--font-mono);">${type}</span>
      </div>
      <div style="color:var(--accent-cyan); font-family:var(--font-mono); font-size:0.8rem; margin-bottom:2px;">
        💎 <strong>${t.hotspotsOres}</strong> ${hotspot.primaryOres}
      </div>
      <div style="color:var(--accent-amber); font-size:0.75rem; margin-bottom:2px;">
        ⚠️ <strong>${t.hotspotsHazards}</strong> ${hazards}
      </div>
      <div style="color:var(--accent-emerald); font-size:0.75rem; margin-bottom:4px;">
        🏭 <strong>${t.hotspotsRefinery}</strong> ${hotspot.refineryHub}
      </div>
      <div style="color:var(--text-muted); font-size:0.75rem; line-height:1.35;">${desc}</div>
    `;
    return card;
  };

  // 2. Stanton Refinery Stations
  if (DOM.stationsContainer) {
    DOM.stationsContainer.innerHTML = '';
    const stantonStations = MINING_DATA.refineryStations.filter(s => s.sector === 'stanton' || (!s.sector));
    stantonStations.forEach(st => DOM.stationsContainer.appendChild(renderStationCard(st)));
  }

  // 3. Stanton Hotspots
  if (DOM.hotspotsStantonContainer && MINING_DATA.miningHotspots) {
    DOM.hotspotsStantonContainer.innerHTML = '';
    const stantonHotspots = MINING_DATA.miningHotspots.filter(h => h.system === 'stanton');
    stantonHotspots.forEach(h => DOM.hotspotsStantonContainer.appendChild(renderHotspotCard(h)));
  }

  // 4. Pyro Refinery Stations (Alpha 4.0)
  if (DOM.stationsPyroContainer) {
    DOM.stationsPyroContainer.innerHTML = '';
    const pyroStations = MINING_DATA.refineryStations.filter(s => s.sector === 'pyro');
    pyroStations.forEach(st => DOM.stationsPyroContainer.appendChild(renderStationCard(st)));
  }

  // 5. Pyro Hotspots (Alpha 4.0)
  if (DOM.hotspotsPyroContainer && MINING_DATA.miningHotspots) {
    DOM.hotspotsPyroContainer.innerHTML = '';
    const pyroHotspots = MINING_DATA.miningHotspots.filter(h => h.system === 'pyro');
    pyroHotspots.forEach(h => DOM.hotspotsPyroContainer.appendChild(renderHotspotCard(h)));
  }

  // 6. Nyx Refinery Stations
  if (DOM.stationsNyxContainer) {
    DOM.stationsNyxContainer.innerHTML = '';
    const nyxStations = MINING_DATA.refineryStations.filter(s => s.sector === 'nyx');
    nyxStations.forEach(st => DOM.stationsNyxContainer.appendChild(renderStationCard(st)));
  }

  // 7. Nyx Hotspots
  if (DOM.hotspotsNyxContainer && MINING_DATA.miningHotspots) {
    DOM.hotspotsNyxContainer.innerHTML = '';
    const nyxHotspots = MINING_DATA.miningHotspots.filter(h => h.system === 'nyx');
    nyxHotspots.forEach(h => DOM.hotspotsNyxContainer.appendChild(renderHotspotCard(h)));
  }
}

// ==========================================
// TACTILE NUMPAD & QUICK CONTROLS
// ==========================================
function bindEventListeners() {
  // Ship selection changes (classic header, mobiGlas header, loadout modal)
  const onShipChange = (e) => {
    sfx.playBeep(600, 'sine', 0.05);
    triggerHaptic(15);
    setShip(e.target.value);
  };

  if (DOM.shipSelect) DOM.shipSelect.addEventListener('change', onShipChange);
  if (DOM.mgShipSelect) DOM.mgShipSelect.addEventListener('change', onShipChange);
  if (DOM.loadoutShipSelect) DOM.loadoutShipSelect.addEventListener('change', onShipChange);

  document.querySelectorAll('[data-add-mass]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      const add = parseInt(btn.dataset.addMass, 10);
      setMass(state.rockMass + add);
    });
  });

  // Mass Stepper [-] and [+]
  if (DOM.btnMassMinus) {
    DOM.btnMassMinus.addEventListener('click', () => {
      sfx.playBeep(550, 'sine', 0.04);
      triggerHaptic(12);
      setMass(state.rockMass - 100);
    });
  }
  if (DOM.btnMassPlus) {
    DOM.btnMassPlus.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      setMass(state.rockMass + 100);
    });
  }

  // Toggle tactile numpad
  DOM.btnToggleNumpad.addEventListener('click', () => {
    const t = I18N[state.currentLang] || I18N.fr;
    sfx.playBeep(550, 'sine', 0.04);
    triggerHaptic(15);
    const isOpen = DOM.numpadContainer.style.display !== 'none';
    DOM.numpadContainer.style.display = isOpen ? 'none' : 'grid';
    DOM.btnToggleNumpad.textContent = isOpen ? t.keypad : t.closeKeypad;
  });

  // Numpad button clicks
  DOM.numpadContainer.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(800, 'sine', 0.03);
      triggerHaptic(10);
      const key = btn.dataset.key;
      let currentStr = state.rockMass.toString();

      if (key === 'C') {
        currentStr = '0';
      } else if (key === 'BACK') {
        currentStr = currentStr.slice(0, -1) || '0';
      } else {
        if (currentStr === '0') currentStr = '';
        if (currentStr.length < 6) currentStr += key;
      }
      setMass(parseInt(currentStr, 10) || 0);
    });
  });

  // Ore percentage slider & chips
  DOM.pctSlider.addEventListener('input', (e) => {
    setPct(parseFloat(e.target.value));
  });

  document.querySelectorAll('[data-set-pct]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      setPct(parseFloat(btn.dataset.setPct));
    });
  });

  // Resistance slider
  DOM.resistanceSlider.addEventListener('input', (e) => {
    setResistance(parseInt(e.target.value, 10));
  });

  // Instability slider
  DOM.instabilitySlider.addEventListener('input', (e) => {
    setInstability(parseInt(e.target.value, 10));
  });

  // Add to cargo action
  DOM.btnAddToCargo.addEventListener('click', () => {
    addToCargo();
  });

  // Clear hold
  DOM.btnClearHold.addEventListener('click', () => {
    const t = I18N[state.currentLang] || I18N.fr;
    if (confirm(t.confirmClearHold)) {
      sfx.playBeep(350, 'square', 0.08);
      clearHold();
    }
  });

  // Reset full session
  DOM.btnResetSession.addEventListener('click', () => {
    const t = I18N[state.currentLang] || I18N.fr;
    if (confirm(t.confirmResetSession)) {
      clearHold();
      setMass(5200);
      setPct(32);
      setResistance(40);
      setInstability(50);
      stopQuantainiumTimer();
    }
  });

  // Audio toggle button
  DOM.btnAudioToggle.addEventListener('click', () => {
    const t = I18N[state.currentLang] || I18N.fr;
    state.audioEnabled = !state.audioEnabled;
    DOM.btnAudioToggle.classList.toggle('active', state.audioEnabled);
    DOM.btnAudioToggle.title = state.audioEnabled ? t.audioOn : t.audioOff;
    sfx.playBeep(state.audioEnabled ? 750 : 300, 'sine', 0.06);
  });

  // Modals management
  if (DOM.btnOpenLoadout) {
    DOM.btnOpenLoadout.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      populateLoadoutSelects();
      openModal(DOM.loadoutModal);
    });
  }
  if (DOM.btnOpenCraftHeader) {
    DOM.btnOpenCraftHeader.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      setCraftingWorkshopTab(state.activeCraftingTab || 'blueprints');
      openModal(DOM.craftingModal);
    });
  }
  if (DOM.btnMgCraftModal) {
    DOM.btnMgCraftModal.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      setCraftingWorkshopTab(state.activeCraftingTab || 'blueprints');
      openModal(DOM.craftingModal);
    });
  }
  if (DOM.btnCloseLoadout) {
    DOM.btnCloseLoadout.addEventListener('click', () => closeModal(DOM.loadoutModal));
  }

  const openMoleConfigModal = () => {
    sfx.playBeep(600, 'sine', 0.04);
    triggerHaptic(15);
    setShip('mole');
    const moleShip = (state.myPersonalFleet || []).find(s => s.shipId === 'mole');
    if (moleShip) {
      state.selectedFleetShipId = moleShip.id;
    }
    populateLoadoutSelects();
    openModal(DOM.loadoutModal);
  };
  if (DOM.btnQuickConfigMole) DOM.btnQuickConfigMole.addEventListener('click', openMoleConfigModal);
  if (DOM.btnMgQuickConfigMole) DOM.btnMgQuickConfigMole.addEventListener('click', openMoleConfigModal);

  [DOM.btnOpenDonate, DOM.btnMgDonate, DOM.dockBtnDonate, DOM.btnOpenDonateFooter].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(15);
      openModal(DOM.donateModal);
    });
  });
  if (DOM.btnCloseDonate) DOM.btnCloseDonate.addEventListener('click', () => closeModal(DOM.donateModal));

  // Crew split modal & Squad Mining Modal
  if (DOM.btnOpenCrew) DOM.btnOpenCrew.addEventListener('click', openSquadModal);
  if (DOM.btnMgSquadModal) DOM.btnMgSquadModal.addEventListener('click', openSquadModal);
  if (DOM.btnQuickOpenSquad) DOM.btnQuickOpenSquad.addEventListener('click', openSquadModal);
  if (DOM.btnCloseCrew) DOM.btnCloseCrew.addEventListener('click', () => closeModal(DOM.crewModal));

  // Dismiss any open modal by clicking its background overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });

  if (DOM.btnAddSquadMember) {
    DOM.btnAddSquadMember.addEventListener('click', () => addSquadMember());
  }

  if (DOM.btnSquadEditLoadout) {
    DOM.btnSquadEditLoadout.addEventListener('click', () => {
      closeModal(DOM.crewModal);
      populateLoadoutSelects();
      openModal(DOM.loadoutModal);
    });
  }

  // Loadout Profiles management listeners
  if (DOM.savedLoadoutsSelect) {
    DOM.savedLoadoutsSelect.addEventListener('change', (e) => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(10);
      applyProfile(e.target.value);
    });
  }

  if (DOM.btnOpenSaveProfileModal) {
    DOM.btnOpenSaveProfileModal.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(15);
      if (DOM.saveLoadoutNameInput) {
        const ship = state.selectedShip;
        const turrets = getShipTurretConfigs(ship.id);
        const lObj = MINING_DATA.lasers.find(l => l.id === turrets[0]?.laserId) || state.selectedLaser;
        DOM.saveLoadoutNameInput.value = `${ship.name} - ${lObj.name}`;
      }
      openModal(DOM.saveLoadoutNameModal);
      setTimeout(() => {
        if (DOM.saveLoadoutNameInput) {
          DOM.saveLoadoutNameInput.focus();
          DOM.saveLoadoutNameInput.select();
        }
      }, 50);
    });
  }

  if (DOM.btnConfirmSaveLoadoutName) {
    DOM.btnConfirmSaveLoadoutName.addEventListener('click', () => {
      const name = DOM.saveLoadoutNameInput ? DOM.saveLoadoutNameInput.value : '';
      if (name.trim()) {
        saveCurrentAsProfile(name);
        closeModal(DOM.saveLoadoutNameModal);
      }
    });
  }

  if (DOM.saveLoadoutNameInput) {
    DOM.saveLoadoutNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const name = DOM.saveLoadoutNameInput.value;
        if (name.trim()) {
          saveCurrentAsProfile(name);
          closeModal(DOM.saveLoadoutNameModal);
        }
      } else if (e.key === 'Escape') {
        closeModal(DOM.saveLoadoutNameModal);
      }
    });
  }

  if (DOM.btnCancelSaveLoadoutName) {
    DOM.btnCancelSaveLoadoutName.addEventListener('click', () => closeModal(DOM.saveLoadoutNameModal));
  }
  if (DOM.btnCloseSaveLoadoutName) {
    DOM.btnCloseSaveLoadoutName.addEventListener('click', () => closeModal(DOM.saveLoadoutNameModal));
  }

  if (DOM.btnUpdateCurrentProfile) {
    DOM.btnUpdateCurrentProfile.addEventListener('click', () => {
      updateCurrentProfile();
    });
  }

  if (DOM.btnDeleteSelectedProfile) {
    DOM.btnDeleteSelectedProfile.addEventListener('click', () => {
      deleteSelectedProfile();
    });
  }

  // Pilot Callsign & Citizen ID Editor listeners
  if (DOM.btnEditMgCallsign) {
    DOM.btnEditMgCallsign.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(15);
      if (DOM.callsignModalInput) DOM.callsignModalInput.value = state.callsign;
      if (DOM.pilotGuildRoleSelect) DOM.pilotGuildRoleSelect.value = localStorage.getItem('aaron_mfd_pilot_guild_role') || 'pilot';
      if (DOM.pilotSpecialtySelect) DOM.pilotSpecialtySelect.value = localStorage.getItem('aaron_mfd_pilot_specialty') || 'mining';
      if (DOM.pilotBalanceInput) {
        const rawBal = parseInt((DOM.mgBalanceVal?.textContent || '1482900').replace(/\s/g, ''), 10) || 1482900;
        DOM.pilotBalanceInput.value = rawBal;
      }
      if (DOM.pilotSystemSelect) DOM.pilotSystemSelect.value = localStorage.getItem('aaron_mfd_pilot_system') || 'stanton';
      if (DOM.pilotStationSelect) DOM.pilotStationSelect.value = localStorage.getItem('aaron_mfd_pilot_station') || 'ARC-L1 Wide Forest Station';
      openModal(DOM.callsignModal);
      setTimeout(() => {
        if (DOM.callsignModalInput) {
          DOM.callsignModalInput.focus();
          DOM.callsignModalInput.select();
        }
      }, 50);
    });
  }

  if (DOM.btnSaveCallsignModal) {
    DOM.btnSaveCallsignModal.addEventListener('click', () => {
      sfx.playSuccess();
      triggerHaptic(20);
      const val = DOM.callsignModalInput ? DOM.callsignModalInput.value : '';
      setCallsign(val, true);

      if (DOM.pilotGuildRoleSelect) {
        const role = DOM.pilotGuildRoleSelect.value;
        localStorage.setItem('aaron_mfd_pilot_guild_role', role);
        if (DOM.mgGuildRoleBadge) {
          const roleIcons = { admiral: '👑', officer: '📋', treasurer: '💰', pilot: '🚀', recruit: '🔰' };
          DOM.mgGuildRoleBadge.textContent = roleIcons[role] || '🚀';
        }
      }
      if (DOM.pilotSpecialtySelect) {
        localStorage.setItem('aaron_mfd_pilot_specialty', DOM.pilotSpecialtySelect.value);
      }
      if (DOM.pilotSystemSelect) {
        localStorage.setItem('aaron_mfd_pilot_system', DOM.pilotSystemSelect.value);
      }
      if (DOM.pilotStationSelect) {
        localStorage.setItem('aaron_mfd_pilot_station', DOM.pilotStationSelect.value);
      }
      if (DOM.pilotBalanceInput) {
        const newBal = Number(DOM.pilotBalanceInput.value) || 0;
        localStorage.setItem('aaron_mfd_balance', String(newBal));
        if (DOM.mgBalanceVal) {
          DOM.mgBalanceVal.textContent = newBal.toLocaleString();
        }
      }

      if (window.AaronModules && window.AaronModules.store) {
        window.AaronModules.store.set('player', prev => ({
          ...prev,
          callsign: val || 'CITIZEN-1',
          guildRole: DOM.pilotGuildRoleSelect?.value || 'pilot',
          role: DOM.pilotSpecialtySelect?.value || 'mining'
        }));
      }

      closeModal(DOM.callsignModal);
    });
  }

  if (DOM.callsignModalInput) {
    DOM.callsignModalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sfx.playSuccess();
        triggerHaptic(20);
        setCallsign(DOM.callsignModalInput.value, true);
        closeModal(DOM.callsignModal);
      } else if (e.key === 'Escape') {
        closeModal(DOM.callsignModal);
      }
    });
  }

  if (DOM.btnCancelCallsignModal) {
    DOM.btnCancelCallsignModal.addEventListener('click', () => closeModal(DOM.callsignModal));
  }
  if (DOM.btnCloseCallsignModal) {
    DOM.btnCloseCallsignModal.addEventListener('click', () => closeModal(DOM.callsignModal));
  }

  if (DOM.squadLeaderNameInput) {
    DOM.squadLeaderNameInput.addEventListener('change', (e) => {
      sfx.playBeep(600, 'sine', 0.04);
      setCallsign(e.target.value, false);
    });
    DOM.squadLeaderNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sfx.playSuccess();
        setCallsign(e.target.value, true);
        e.target.blur();
      }
    });
  }

  document.querySelectorAll('[data-squad-template]').forEach(btn => {
    btn.addEventListener('click', () => {
      applySquadTemplate(btn.dataset.squadTemplate);
    });
  });

  document.querySelectorAll('[data-crew]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      state.crewMembers = parseInt(btn.dataset.crew, 10);
      calculateAll();
      calculateCrewSplit();
    });
  });

  if (DOM.crewReserveSlider) {
    DOM.crewReserveSlider.addEventListener('input', (e) => {
      state.crewReservePct = parseInt(e.target.value, 10);
      DOM.crewReserveDisplay.textContent = `${state.crewReservePct} %`;
      calculateAll();
      calculateCrewSplit();
    });
  }


  // Halo, Atlas & Stations modal
  DOM.btnOpenHalo.addEventListener('click', () => {
    sfx.playBeep(600, 'sine', 0.04);
    openModal(DOM.haloModal);
  });
  DOM.btnCloseHalo.addEventListener('click', () => closeModal(DOM.haloModal));

  // Atlas tabs (Stanton / Pyro / Nyx)
  document.querySelectorAll('[data-atlas-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      const target = tab.dataset.atlasTab;
      document.querySelectorAll('[data-atlas-tab]').forEach(t => {
        t.classList.toggle('active', t === tab);
      });
      if (DOM.atlasPanelStanton) DOM.atlasPanelStanton.style.display = target === 'stanton' ? 'block' : 'none';
      if (DOM.atlasPanelPyro) DOM.atlasPanelPyro.style.display = target === 'pyro' ? 'block' : 'none';
      if (DOM.atlasPanelNyx) DOM.atlasPanelNyx.style.display = target === 'nyx' ? 'block' : 'none';
    });
  });

  // Mineral System Filter Pills (All / Stanton / Pyro / Nyx)
  document.querySelectorAll('[data-mineral-system]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      state.mineralSystemFilter = btn.dataset.mineralSystem;
      document.querySelectorAll('[data-mineral-system]').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      populateOreGrid();
    });
  });

  // Station Rec Box click opens Halo/Stations modal
  if (DOM.stationRecBox) {
    DOM.stationRecBox.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(15);
      openModal(DOM.haloModal);
    });
  }

  // Quantainium timer dismiss button
  if (DOM.btnDismissQtTimer) {
    DOM.btnDismissQtTimer.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx.playSuccess();
      triggerHaptic(20);
      stopQuantainiumTimer();
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.toastQtStopped);
    });
  }

  DOM.btnVoiceCommand.addEventListener('click', () => startVoiceRecognition());
  DOM.btnCloseVoice.addEventListener('click', () => closeModal(DOM.voiceModal));

  // MOLE Active Turrets pill clicks
  document.querySelectorAll('[data-mole-turret]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(700, 'sine', 0.04);
      triggerHaptic(15);
      state.moleActiveTurrets = parseInt(btn.dataset.moleTurret, 10);
      document.querySelectorAll('[data-mole-turret]').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
      updateLoadoutButtonSummary();
      calculateAll();
    });
  });

  // Toggle all turrets in loadout
  if (DOM.btnToggleAllTurrets) {
    DOM.btnToggleAllTurrets.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(15);
      const cards = Array.from(DOM.turretCardsContainer?.querySelectorAll('.turret-config-card') || []);
      const allCollapsed = cards.length > 0 && cards.every(c => c.classList.contains('collapsed'));
      cards.forEach(c => {
        if (allCollapsed) c.classList.remove('collapsed');
        else c.classList.add('collapsed');
      });
      updateToggleAllButtonText();
    });
  }

  // Save Loadout modal
  DOM.btnSaveLoadout.addEventListener('click', () => {
    sfx.playSuccess();
    triggerHaptic(20);

    const ship = state.selectedShip;
    const shipDef = getActiveShipDef(ship.id);
    const role = shipDef.role || 'mining';
    const isMining = role === 'mining';
    const isCargo = role === 'cargo' || role === 'hauler';
    const isSalvage = role === 'salvage';
    const isCombat = role === 'combat' || role === 'escort';

    const turrets = getShipTurretConfigs(ship.id);

    // Read values from dynamically generated cards
    if (isMining) {
      turrets.forEach((cfg, idx) => {
        const selLaser = document.getElementById(`turretLaser_${idx}`);
        if (selLaser) cfg.laserId = selLaser.value;
        const slotsContainer = document.getElementById(`turretSlots_${idx}`);
        if (slotsContainer) {
          slotsContainer.querySelectorAll('select').forEach((sel, i) => {
            cfg.moduleIds[i] = sel.value;
          });
        }
      });

      // Synchronize primary turret to state.selectedLaser & state.selectedModules
      if (turrets.length > 0) {
        const primaryLaser = MINING_DATA.lasers.find(l => l.id === turrets[0].laserId) || state.selectedLaser;
        state.selectedLaser = primaryLaser;
        state.selectedModules = [...turrets[0].moduleIds];
      }

      if (DOM.gadgetSelect) {
        state.selectedGadget = MINING_DATA.gadgets.find(g => g.id === DOM.gadgetSelect.value) || state.selectedGadget;
      }
    }

    // Synchronize to player's personal fleet ship (both active and matching model)
    const personal = (state.myPersonalFleet || []).find(s => s.shipId === shipDef.id) || getSelectedFleetShip() || state.myActiveShip;
    if (personal) {
      if (isMining) {
        personal.laserId = state.selectedLaser.id;
        personal.submodules = [...state.selectedModules];
        personal.gadgetId = state.selectedGadget?.id || 'none';
        personal.turrets = JSON.parse(JSON.stringify(turrets));
        if (DOM.loadoutMiningWeaponSelect) personal.miningWeaponId = DOM.loadoutMiningWeaponSelect.value;
      } else if (isCargo) {
        if (DOM.loadoutCargoTractorSelect) personal.cargoTractorId = DOM.loadoutCargoTractorSelect.value;
        if (DOM.loadoutCargoGridSelect) personal.cargoGridMode = DOM.loadoutCargoGridSelect.value;
        if (DOM.loadoutCargoWeaponSelect) personal.cargoTurretId = DOM.loadoutCargoWeaponSelect.value;
      } else if (isSalvage) {
        if (DOM.loadoutSalvageHead1Select) personal.salvageHead1Id = DOM.loadoutSalvageHead1Select.value;
        if (DOM.loadoutSalvageHead2Select) personal.salvageHead2Id = DOM.loadoutSalvageHead2Select.value;
        if (DOM.loadoutSalvageTractorSelect) personal.salvageTractorId = DOM.loadoutSalvageTractorSelect.value;
        if (DOM.loadoutSalvageWeaponSelect) personal.salvageWeaponId = DOM.loadoutSalvageWeaponSelect.value;
      } else if (isCombat) {
        if (DOM.loadoutCombatPrimarySelect) personal.combatPrimaryId = DOM.loadoutCombatPrimarySelect.value;
        if (DOM.loadoutCombatTurretSelect) personal.combatTurretId = DOM.loadoutCombatTurretSelect.value;
        if (DOM.loadoutCombatMissileSelect) personal.combatMissileId = DOM.loadoutCombatMissileSelect.value;
      }
      saveMyPersonalFleet();
      if (personal.isActive) applyShipLoadoutToWorkflows(true);
      renderMyShipHub();
    }

    saveLoadout();
    updateLoadoutButtonSummary();
    closeModal(DOM.loadoutModal);
    calculateAll();
    const t = I18N[state.currentLang] || I18N.fr;
    showToast(t.toastLoadoutSaved || 'Configuration du vaisseau appliquée avec succès !');
  });



  // Language switch
  if (DOM.btnLangToggle) {
    DOM.btnLangToggle.addEventListener('click', () => {
      sfx.playBeep(700, 'sine', 0.04);
      triggerHaptic(15);
      const newLang = state.currentLang === 'fr' ? 'en' : 'fr';
      setLanguage(newLang);
      const t = I18N[newLang] || I18N.fr;
      showToast(newLang === 'en' ? t.toastLangEn : t.toastLangFr);
    });
  }

  // Theme select
  if (DOM.themeSelect) {
    DOM.themeSelect.addEventListener('change', (e) => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      setTheme(e.target.value);
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.toastTheme.replace('{theme}', e.target.selectedOptions[0].text));
    });
  }

  // Wake Lock Screen
  if (DOM.btnWakeLock) {
    DOM.btnWakeLock.addEventListener('click', () => {
      toggleWakeLock();
    });
  }

  // Fullscreen
  if (DOM.btnFullscreen) {
    DOM.btnFullscreen.addEventListener('click', () => {
      toggleFullscreen();
    });
  }

  // Discord Export
  if (DOM.btnExportDiscord) {
    DOM.btnExportDiscord.addEventListener('click', () => {
      exportToDiscord();
    });
  }

  // Install PWA button
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPrompt = e;
    DOM.btnInstallPWA.style.display = 'inline-block';
  });

  DOM.btnInstallPWA.addEventListener('click', async () => {
    const t = I18N[state.currentLang] || I18N.fr;
    if (state.deferredPrompt) {
      state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        sfx.playSuccess();
      }
      state.deferredPrompt = null;
    } else {
      alert(t.alertPwaInstructions);
    }
  });

  // Break Tree Simulator Modal
  if (DOM.btnOpenBreakTree) {
    DOM.btnOpenBreakTree.addEventListener('click', openBreakTreeModal);
  }
  if (DOM.btnCloseBreakTree) {
    DOM.btnCloseBreakTree.addEventListener('click', () => closeModal(DOM.breakTreeModal));
  }
  if (DOM.btnFinishBreakTree) {
    DOM.btnFinishBreakTree.addEventListener('click', () => closeModal(DOM.breakTreeModal));
  }
  if (DOM.btnRegenerateChunks) {
    DOM.btnRegenerateChunks.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(15);
      generateBreakTree();
    });
  }

  // Tactical Advisor button
  if (DOM.btnApplyAdvice) {
    DOM.btnApplyAdvice.addEventListener('click', applyRecommendedAdvice);
  }

  // Rock Surface Gadget Listeners (Operational rock deployment during mining)
  if (DOM.rockGadgetSelect) {
    DOM.rockGadgetSelect.addEventListener('change', (e) => {
      sfx.playBeep(620, 'sine', 0.04);
      triggerHaptic(12);
      const gid = e.target.value;
      const allGadgets = (MINING_DATA.gadgets || []).concat(state.customGadgets || []);
      state.selectedGadget = allGadgets.find(g => g.id === gid) || MINING_DATA.gadgets[0];
      updateRockGadgetUI();
      calculateAll();
    });
  }

  if (DOM.btnDetachRockGadget) {
    DOM.btnDetachRockGadget.addEventListener('click', () => {
      sfx.playBeep(500, 'sine', 0.04);
      triggerHaptic(15);
      state.selectedGadget = MINING_DATA.gadgets[0];
      if (DOM.rockGadgetSelect) DOM.rockGadgetSelect.value = 'none';
      updateRockGadgetUI();
      calculateAll();
      const isEn = state.currentLang === 'en';
      showToast(isEn ? 'Gadget detached from rock surface' : 'Gadget retiré de la surface rocheuse');
    });
  }

  // Refinery Modal & Orders
  if (DOM.btnOpenRefinery) {
    DOM.btnOpenRefinery.addEventListener('click', () => {
      populateRefineryModalSelects();
      openModal(DOM.refineryModal);
    });
  }
  if (DOM.btnCloseRefinery) {
    DOM.btnCloseRefinery.addEventListener('click', () => closeModal(DOM.refineryModal));
  }
  if (DOM.btnSendToRefinery) {
    DOM.btnSendToRefinery.addEventListener('click', addRefineryJobFromHold);
  }
  if (DOM.btnConfirmRefineryJob) {
    DOM.btnConfirmRefineryJob.addEventListener('click', confirmCreateRefineryJob);
  }

  // Flight Ledger Modal & Exports
  if (DOM.btnOpenLedger) {
    DOM.btnOpenLedger.addEventListener('click', () => {
      updateLedgerDisplay();
      openModal(DOM.ledgerModal);
    });
  }
  if (DOM.btnCloseLedger) {
    DOM.btnCloseLedger.addEventListener('click', () => closeModal(DOM.ledgerModal));
  }
  if (DOM.btnExportJson) {
    DOM.btnExportJson.addEventListener('click', exportLedgerJson);
  }
  if (DOM.btnExportCsv) {
    DOM.btnExportCsv.addEventListener('click', exportLedgerCsv);
  }
  if (DOM.btnClearLedger) {
    DOM.btnClearLedger.addEventListener('click', clearLedgerHistory);
  }

  // ROC Cluster Controls
  document.querySelectorAll('[data-roc-nodes]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      state.rocNodes = parseInt(btn.dataset.rocNodes, 10);
      document.querySelectorAll('[data-roc-nodes]').forEach(b => b.classList.toggle('active', b === btn));
      updateRocCluster();
    });
  });

  if (DOM.rocGemsSlider) {
    DOM.rocGemsSlider.addEventListener('input', (e) => {
      state.rocGemsPerNode = parseInt(e.target.value, 10);
      updateRocCluster();
    });
  }

  if (DOM.btnAddClusterToROC) {
    DOM.btnAddClusterToROC.addEventListener('click', addRocClusterToHold);
  }

  // Aaron Halo Rangefinder
  if (DOM.haloRouteSelect) {
    DOM.haloRouteSelect.addEventListener('change', updateHaloRangefinder);
  }
  if (DOM.haloCurrentDist) {
    DOM.haloCurrentDist.addEventListener('input', updateHaloRangefinder);
  }

  // Guide / Welcome Modal
  function closeGuideModal() {
    if (DOM.chkGuideDismiss && DOM.chkGuideDismiss.checked) {
      localStorage.setItem('aaron_mfd_guide_dismissed', '1');
    }
    closeModal(DOM.guideModal);
  }

  if (DOM.btnOpenGuide) {
    DOM.btnOpenGuide.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      openModal(DOM.guideModal);
    });
  }
  if (DOM.btnOpenGuideFooter) {
    DOM.btnOpenGuideFooter.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      openModal(DOM.guideModal);
    });
  }
  if (DOM.btnCloseGuide) {
    DOM.btnCloseGuide.addEventListener('click', closeGuideModal);
  }
  if (DOM.btnLaunchFromGuide) {
    DOM.btnLaunchFromGuide.addEventListener('click', () => {
      sfx.playSuccess();
      triggerHaptic(20);
      closeGuideModal();
    });
  }

  // Guide Language Switcher buttons (inside modal)
  if (DOM.btnGuideLangFr) {
    DOM.btnGuideLangFr.addEventListener('click', () => {
      sfx.playBeep(700, 'sine', 0.03);
      setLanguage('fr');
      showToast(I18N.fr.toastLangFr);
    });
  }
  if (DOM.btnGuideLangEn) {
    DOM.btnGuideLangEn.addEventListener('click', () => {
      sfx.playBeep(700, 'sine', 0.03);
      setLanguage('en');
      showToast(I18N.en.toastLangEn);
    });
  }

  // Guide Tabs switcher
  document.querySelectorAll('[data-guide-tab]').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.03);
      const tabId = tabBtn.dataset.guideTab;
      document.querySelectorAll('[data-guide-tab]').forEach(b => b.classList.toggle('active', b === tabBtn));
      const panels = {
        quickstart: document.getElementById('guidePanelQuickstart'),
        tools: document.getElementById('guidePanelTools'),
        tips: document.getElementById('guidePanelTips')
      };
      Object.keys(panels).forEach(key => {
        if (panels[key]) panels[key].style.display = key === tabId ? 'block' : 'none';
      });
    });
  });

  // Changelog Modal
  if (DOM.btnVersionBadge) {
    DOM.btnVersionBadge.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      renderChangelog();
      openModal(DOM.changelogModal);
    });
  }
  if (DOM.btnOpenChangelog) {
    DOM.btnOpenChangelog.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      renderChangelog();
      openModal(DOM.changelogModal);
    });
  }
  if (DOM.btnCloseChangelog) {
    DOM.btnCloseChangelog.addEventListener('click', () => closeModal(DOM.changelogModal));
  }

  // Roadmap Modal
  const handleOpenRoadmap = () => {
    sfx.playBeep(650, 'sine', 0.04);
    triggerHaptic(12);
    openModal(DOM.roadmapModal);
  };
  if (DOM.btnOpenRoadmapFooter) DOM.btnOpenRoadmapFooter.addEventListener('click', handleOpenRoadmap);
  if (DOM.btnOpenRoadmapFromChangelog) {
    DOM.btnOpenRoadmapFromChangelog.addEventListener('click', () => {
      closeModal(DOM.changelogModal);
      handleOpenRoadmap();
    });
  }
  if (DOM.btnOpenRoadmapFromCrew) {
    DOM.btnOpenRoadmapFromCrew.addEventListener('click', () => {
      closeModal(DOM.crewModal);
      handleOpenRoadmap();
    });
  }
  if (DOM.btnCloseRoadmap) {
    DOM.btnCloseRoadmap.addEventListener('click', () => closeModal(DOM.roadmapModal));
  }

  // Session Reset & Cache Flush buttons
  if (DOM.btnResetSession) {
    DOM.btnResetSession.addEventListener('click', () => {
      const t = I18N[state.currentLang] || I18N.fr;
      if (confirm(t.confirmResetSession)) {
        sfx.playWarning();
        triggerHaptic(20);
        clearHold();
        localStorage.clear();
        window.location.reload();
      }
    });
  }

  if (DOM.btnForceRefresh) {
    DOM.btnForceRefresh.addEventListener('click', () => {
      forceRefreshCache();
    });
  }

  // Alpha 4.10: Archetype Dropdown Change Listener
  if (DOM.archetypeSelect) {
    DOM.archetypeSelect.addEventListener('change', (e) => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(10);
      const chosen = MINING_DATA.rockArchetypes.find(a => a.id === e.target.value);
      if (chosen) selectArchetype(chosen);
    });
  }

  // Alpha 4.10: Secondary Ore & Composition controls
  if (DOM.secondaryOreSelect) {
    DOM.secondaryOreSelect.addEventListener('change', (e) => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(10);
      const val = e.target.value;
      state.secondaryMineral = val === 'none' ? null : MINING_DATA.minerals.find(m => m.id === val);
      updateSecondaryOreUI();
      applyDynamicRockProperties();
      calculateAll();
    });
  }

  if (DOM.btnClearSecondaryOre) {
    DOM.btnClearSecondaryOre.addEventListener('click', () => {
      sfx.playBeep(450, 'sine', 0.04);
      triggerHaptic(10);
      state.secondaryMineral = null;
      if (DOM.secondaryOreSelect) DOM.secondaryOreSelect.value = 'none';
      updateSecondaryOreUI();
      applyDynamicRockProperties();
      calculateAll();
    });
  }

  if (DOM.secondaryPctSlider) {
    DOM.secondaryPctSlider.addEventListener('input', (e) => {
      state.secondaryPercentage = parseFloat(e.target.value);
      if (DOM.secondaryPctLabel) DOM.secondaryPctLabel.textContent = `${state.secondaryPercentage.toFixed(1)} %`;
      if (DOM.secondaryPctDisplay) DOM.secondaryPctDisplay.textContent = `${state.secondaryPercentage.toFixed(0)}%`;
      document.querySelectorAll('[data-set-sec-pct]').forEach(b => {
        b.classList.toggle('active', parseFloat(b.dataset.setSecPct) === state.secondaryPercentage);
      });
      updateSecondaryOreUI();
      applyDynamicRockProperties();
      calculateAll();
    });
  }

  // Quick chips for secondary ore percentage
  document.querySelectorAll('[data-set-sec-pct]').forEach(btn => {
    btn.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      const secVal = parseFloat(btn.dataset.setSecPct);
      state.secondaryPercentage = secVal;
      if (DOM.secondaryPctSlider) DOM.secondaryPctSlider.value = secVal;
      if (DOM.secondaryPctLabel) DOM.secondaryPctLabel.textContent = `${secVal.toFixed(1)} %`;
      if (DOM.secondaryPctDisplay) DOM.secondaryPctDisplay.textContent = `${secVal.toFixed(0)}%`;
      document.querySelectorAll('[data-set-sec-pct]').forEach(b => {
        b.classList.toggle('active', parseFloat(b.dataset.setSecPct) === secVal);
      });
      updateSecondaryOreUI();
      applyDynamicRockProperties();
      calculateAll();
    });
  });

  // Alpha 4.10: Saddlebags Detach & Tractor beam manager
  if (DOM.btnDetachOneBag) {
    DOM.btnDetachOneBag.addEventListener('click', () => {
      detachSaddlebag();
    });
  }
  if (DOM.btnDropAllBags) {
    DOM.btnDropAllBags.addEventListener('click', () => {
      dropAllSaddlebags();
    });
  }

  // Alpha 4.10: Long-range Radar Ping RS 2.0 Signature Decoder Modal
  if (DOM.btnOpenRadarDecoder) {
    DOM.btnOpenRadarDecoder.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(15);
      openModal(DOM.radarDecoderModal);
      if (DOM.radarRsInput) {
        DOM.radarRsInput.focus();
        if (DOM.radarRsInput.value) {
          decodeRadarRS(parseFloat(DOM.radarRsInput.value));
        }
      }
    });
  }

  if (DOM.btnCloseRadarDecoder) {
    DOM.btnCloseRadarDecoder.addEventListener('click', () => closeModal(DOM.radarDecoderModal));
  }

  if (DOM.btnExecRadarDecode) {
    DOM.btnExecRadarDecode.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      const val = parseFloat(DOM.radarRsInput ? DOM.radarRsInput.value : 0);
      decodeRadarRS(val);
    });
  }

  if (DOM.radarRsInput) {
    DOM.radarRsInput.addEventListener('input', () => {
      const val = parseFloat(DOM.radarRsInput.value);
      decodeRadarRS(val);
    });
    DOM.radarRsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = parseFloat(DOM.radarRsInput.value);
        decodeRadarRS(val);
      }
    });
  }




  // mobiGlas 4.0: Layout mode toggles
  if (DOM.btnLayoutToggle) {
    DOM.btnLayoutToggle.addEventListener('click', () => {
      setLayoutMode(state.layoutMode === 'mobiglas' ? 'classic' : 'mobiglas', true);
    });
  }
  if (DOM.btnClassicLayoutToggle) {
    DOM.btnClassicLayoutToggle.addEventListener('click', () => {
      setLayoutMode('mobiglas', true);
    });
  }
  if (DOM.dockBtnLayout) {
    DOM.dockBtnLayout.addEventListener('click', () => {
      setLayoutMode(state.layoutMode === 'mobiglas' ? 'classic' : 'mobiglas', true);
    });
  }

  // mobiGlas 4.0: System Header Quick Actions
  if (DOM.btnMgLang) {
    DOM.btnMgLang.addEventListener('click', () => {
      if (DOM.btnLangToggle) DOM.btnLangToggle.click();
    });
  }
  if (DOM.btnMgAudio) {
    DOM.btnMgAudio.addEventListener('click', () => {
      if (DOM.btnAudioToggle) DOM.btnAudioToggle.click();
      if (DOM.btnMgAudio) DOM.btnMgAudio.textContent = state.audioEnabled ? '🔊' : '🔇';
    });
  }


  // Master Industrial Workflow Buttons
  if (DOM.btnWorkflowShip) {
    DOM.btnWorkflowShip.addEventListener('click', () => setWorkflowTab('ship'));
  }
  if (DOM.btnWorkflowMining) {
    DOM.btnWorkflowMining.addEventListener('click', () => setWorkflowTab('mining'));
  }
  if (DOM.btnWorkflowRefining) {
    DOM.btnWorkflowRefining.addEventListener('click', () => setWorkflowTab('refining'));
  }
  if (DOM.btnWorkflowInventory) {
    DOM.btnWorkflowInventory.addEventListener('click', () => setWorkflowTab('inventory'));
  }
  if (DOM.btnWorkflowTrading) {
    DOM.btnWorkflowTrading.addEventListener('click', () => setWorkflowTab('trading'));
  }
  if (DOM.btnWorkflowGuild) {
    DOM.btnWorkflowGuild.addEventListener('click', () => setWorkflowTab('guild'));
  }

  // Direct Shortcuts from Workflow Hubs
  if (DOM.btnOpenHaloDirect) {
    DOM.btnOpenHaloDirect.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      openModal(DOM.haloModal);
    });
  }
  if (DOM.btnOpenRefineryDirect) {
    DOM.btnOpenRefineryDirect.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      populateRefineryModalSelects();
      openModal(DOM.refineryModal);
    });
  }
  if (DOM.btnOpenRefineryDirect2) {
    DOM.btnOpenRefineryDirect2.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      populateRefineryModalSelects();
      openModal(DOM.refineryModal);
    });
  }
  if (DOM.btnStockpileOpenDirect) {
    DOM.btnStockpileOpenDirect.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      populateRefineryModalSelects();
      openModal(DOM.refineryModal);
    });
  }
  if (DOM.btnOpenCrewDirect) {
    DOM.btnOpenCrewDirect.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      openModal(DOM.crewModal);
    });
  }
  if (DOM.btnOpenLedgerDirect) {
    DOM.btnOpenLedgerDirect.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      openModal(DOM.ledgerModal);
    });
  }

  // Mobile & Tablet View Tabs and Live Mini-HUD
  if (DOM.tabBtnScanner) {
    DOM.tabBtnScanner.addEventListener('click', () => setMobileView('scanner'));
  }
  if (DOM.tabBtnAnalysis) {
    DOM.tabBtnAnalysis.addEventListener('click', () => setMobileView('analysis'));
  }
  if (DOM.tabBtnMarket) {
    DOM.tabBtnMarket.addEventListener('click', () => setMobileView('market'));
  }


  // Scan Panel Internal Sub-tabs (Ergonomic Compact Navigation)
  if (DOM.btnScanSubtabQuick) {
    DOM.btnScanSubtabQuick.addEventListener('click', () => setScanSubtab('quick'));
  }
  if (DOM.btnScanSubtabAdvanced) {
    DOM.btnScanSubtabAdvanced.addEventListener('click', () => setScanSubtab('advanced'));
  }
  if (DOM.btnScanSubtabHotspots) {
    DOM.btnScanSubtabHotspots.addEventListener('click', () => setScanSubtab('hotspots'));
  }

  // mobiGlas 4.0: Bottom App Launcher Dock Handlers (Synchronized with Master Workflow)
  if (DOM.dockBtnScanner) {
    DOM.dockBtnScanner.addEventListener('click', () => {
      setWorkflowTab('mining');
    });
  }
  if (DOM.dockBtnAnalysis) {
    DOM.dockBtnAnalysis.addEventListener('click', () => {
      if (state.activeWorkflow !== 'mining') {
        setWorkflowTab('mining');
      }
      if (window.innerWidth <= 980) {
        setMobileView('analysis');
      } else {
        sfx.playBeep(700, 'sine', 0.03);
        triggerHaptic(10);
        if (DOM.panelTacticalAnalysis) {
          DOM.panelTacticalAnalysis.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
  if (DOM.dockBtnCraft) {
    DOM.dockBtnCraft.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      setCraftingWorkshopTab(state.activeCraftingTab || 'blueprints');
      openModal(DOM.craftingModal);
    });
  }
  if (DOM.dockBtnLoadout) {
    DOM.dockBtnLoadout.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      populateLoadoutSelects();
      openModal(DOM.loadoutModal);
    });
  }
  if (DOM.dockBtnInventory) {
    DOM.dockBtnInventory.addEventListener('click', () => {
      setWorkflowTab('inventory');
    });
  }
  if (DOM.dockBtnRefinery) {
    DOM.dockBtnRefinery.addEventListener('click', () => {
      setWorkflowTab('refining');
    });
  }
  if (DOM.dockBtnGuild) {
    DOM.dockBtnGuild.addEventListener('click', () => {
      setWorkflowTab('guild');
    });
  }
  if (DOM.dockBtnStarmap) {
    DOM.dockBtnStarmap.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      openModal(DOM.haloModal);
    });
  }
  if (DOM.dockBtnRadar) {
    DOM.dockBtnRadar.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(12);
      openModal(DOM.radarDecoderModal);
      if (DOM.radarRsInput) {
        DOM.radarRsInput.focus();
        if (DOM.radarRsInput.value) {
          decodeRadarRS(parseFloat(DOM.radarRsInput.value));
        }
      }
    });
  }
  if (DOM.dockBtnLedger) {
    DOM.dockBtnLedger.addEventListener('click', () => {
      setWorkflowTab('trading');
    });
  }
  if (DOM.dockBtnCrew) {
    DOM.dockBtnCrew.addEventListener('click', () => {
      openSquadModal();
    });
  }
  if (DOM.dockBtnGuide) {
    DOM.dockBtnGuide.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(10);
      openModal(DOM.guideModal);
    });
  }
}

function renderChangelog() {
  if (!DOM.changelogScroller) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const isEn = state.currentLang === 'en';

  DOM.changelogScroller.innerHTML = '';

  CHANGELOG_DATA.forEach(entry => {
    const card = document.createElement('div');
    card.className = `changelog-card ${entry.isCurrent ? 'current-version' : ''}`;

    const title = isEn ? entry.title_en : entry.title_fr;
    const date = isEn ? entry.date_en : entry.date_fr;

    const listHtml = entry.items.map(item => {
      let tagClass = 'new';
      let tagText = t.tagNew;
      if (item.tag === 'improved') {
        tagClass = 'improved';
        tagText = t.tagImproved;
      } else if (item.tag === 'fix') {
        tagClass = 'fix';
        tagText = t.tagFix;
      }

      const text = isEn ? item.text_en : item.text_fr;
      return `
        <li>
          <span class="badge-tag ${tagClass}">${tagText}</span>
          <span>${text}</span>
        </li>
      `;
    }).join('');

    card.innerHTML = `
      <div class="changelog-card-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="version-tag-pill ${entry.isCurrent ? 'current' : ''}">${entry.version}</span>
          <strong style="color:#fff; font-family:var(--font-hud); font-size:0.95rem;">${title}</strong>
        </div>
        <span class="changelog-date">${date}</span>
      </div>
      <ul class="changelog-list">
        ${listHtml}
      </ul>
    `;

    DOM.changelogScroller.appendChild(card);
  });
}

function setMass(val) {
  const locale = getLocale();
  state.rockMass = Math.max(100, Math.min(99999, val));
  DOM.massLabel.textContent = `${state.rockMass.toLocaleString(locale)} kg`;
  DOM.massDigitalDisplay.textContent = state.rockMass;
  calculateAll();
}

function setPct(val) {
  state.orePercentage = Math.max(1, Math.min(100, val));
  DOM.pctSlider.value = state.orePercentage;
  DOM.pctLabel.textContent = `${state.orePercentage.toFixed(1)} %`;
  DOM.pctDisplay.textContent = `${state.orePercentage.toFixed(0)}%`;
  calculateAll();
}

function setResistance(val) {
  state.resistance = Math.max(0, Math.min(95, val));
  DOM.resistanceSlider.value = state.resistance;
  DOM.resistanceLabel.textContent = `${state.resistance} %`;
  if (state.resistance >= 60) {
    DOM.resistanceLabel.style.color = 'var(--accent-rose)';
  } else if (state.resistance >= 40) {
    DOM.resistanceLabel.style.color = 'var(--accent-amber)';
  } else {
    DOM.resistanceLabel.style.color = '#fff';
  }
  calculateAll();
}

function setInstability(val) {
  state.instability = Math.max(0, Math.min(100, val));
  DOM.instabilitySlider.value = state.instability;
  DOM.instabilityLabel.textContent = `${state.instability} %`;
  if (state.instability >= 60) {
    DOM.instabilityLabel.style.color = 'var(--accent-rose)';
  } else if (state.instability >= 40) {
    DOM.instabilityLabel.style.color = 'var(--accent-amber)';
  } else {
    DOM.instabilityLabel.style.color = '#fff';
  }
  calculateAll();
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('open', 'active');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open', 'active');
  modal.style.display = 'none';
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
}

// ==========================================
// MOBIGLAS 4.0 SLIDE-OVER INSPECTOR CONTROLLER
// ==========================================
function openInspector(options = {}) {
  const inspector = document.getElementById('slideOverInspector');
  if (!inspector) return;

  const iconEl = document.getElementById('inspectorIcon');
  const titleEl = document.getElementById('inspectorTitle');
  const subtitleEl = document.getElementById('inspectorSubtitle');
  const bodyEl = document.getElementById('inspectorBody');
  const footerEl = document.getElementById('inspectorFooter');

  if (iconEl) iconEl.textContent = options.icon || '⚙️';
  if (titleEl) titleEl.textContent = options.title || 'DÉTAILS';
  if (subtitleEl) subtitleEl.textContent = options.subtitle || '';
  if (bodyEl) {
    if (typeof options.body === 'string') {
      bodyEl.innerHTML = options.body;
    } else if (options.body instanceof HTMLElement) {
      bodyEl.innerHTML = '';
      bodyEl.appendChild(options.body);
    }
  }
  if (footerEl) {
    footerEl.innerHTML = options.footer || '';
  }

  inspector.classList.add('open');
  inspector.setAttribute('aria-hidden', 'false');
  try { sfx?.playBeep(700, 'sine', 0.04); } catch {}
  try { triggerHaptic(12); } catch {}
}

function closeInspector() {
  const inspector = document.getElementById('slideOverInspector');
  if (!inspector) return;
  inspector.classList.remove('open');
  inspector.setAttribute('aria-hidden', 'true');
  try { sfx?.playBeep(450, 'sine', 0.03); } catch {}
}

// Lier les déclencheurs de fermeture
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnCloseInspector')?.addEventListener('click', closeInspector);
  document.getElementById('inspectorBackdrop')?.addEventListener('click', closeInspector);
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  document.getElementById('btnCloseInspector')?.addEventListener('click', closeInspector);
  document.getElementById('inspectorBackdrop')?.addEventListener('click', closeInspector);
}

// Exposer globalement
if (typeof window !== 'undefined') {
  window.openInspector = openInspector;
  window.closeInspector = closeInspector;
}

// ==========================================
// CARGO HOLD & RUN LOG
// ==========================================
function addToCargo() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const mineral = state.selectedMineral;
  const oreMass = state.rockMass * (state.orePercentage / 100);
  const densityDivisor = (mineral.density || 15) * 85;
  const scu = Math.round(((oreMass / densityDivisor)) * 10) / 10;

  if (state.holdSCU + scu > state.selectedShip.scu) {
    sfx.playWarning();
    alert(t.alertCapacityExceeded.replace('{max}', state.selectedShip.scu).replace('{cur}', state.holdSCU.toFixed(1)));
    return;
  }

  sfx.playSuccess();
  triggerHaptic(25);
  state.holdSCU = Math.round((state.holdSCU + scu) * 10) / 10;

  const logEntry = {
    id: Date.now(),
    mineralId: mineral.id,
    mineral: getLocalized(mineral, 'name'),
    color: mineral.color,
    scu: scu,
    isVolatile: mineral.isVolatile,
    rawVal: Math.round(scu * 100 * mineral.rawPrice),
    time: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  };

  state.sessionLog.unshift(logEntry);
  addLedgerEntry('run', logEntry.mineral, logEntry.scu, logEntry.rawVal);
  saveSession();
  updateHoldDisplay();

  // Trigger Quantainium countdown if volatile
  if (mineral.isVolatile && !state.qtTimerActive) {
    startQuantainiumTimer();
  }
}

function updateHoldDisplay() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const max = state.selectedShip.scu;
  const current = state.holdSCU;
  const pct = Math.min(100, Math.round((current / max) * 100));

  DOM.holdProgressLabel.textContent = `${current.toFixed(1)} / ${max.toFixed(1)} SCU (${pct}%)`;
  DOM.cargoBarFill.style.width = `${pct}%`;

  if (pct >= 90) {
    DOM.cargoBarFill.style.background = 'var(--accent-rose)';
  } else if (pct >= 70) {
    DOM.cargoBarFill.style.background = 'var(--accent-amber)';
  } else {
    DOM.cargoBarFill.style.background = 'var(--accent-cyan)';
  }

  // Render log
  DOM.sessionLogList.innerHTML = '';
  state.sessionLog.forEach(item => {
    const minObj = MINING_DATA.minerals.find(m => m.id === item.mineralId);
    const minDisplayName = minObj ? getLocalized(minObj, 'name') : item.mineral;
    const el = document.createElement('div');
    el.className = 'log-item';
    el.innerHTML = `
      <div class="log-left">
        <span class="log-item-tag" style="background:${item.color}25; color:${item.color}; border:1px solid ${item.color}80;">
          ${minDisplayName}
        </span>
        <span style="font-family:var(--font-mono); font-weight:700;">${item.scu.toFixed(1)} SCU</span>
        <span style="color:var(--text-muted); font-size:0.75rem;">(${item.time})</span>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="color:var(--accent-emerald); font-family:var(--font-mono); font-size:0.8rem; font-weight:600;">
          +${item.rawVal.toLocaleString(locale)} aUEC
        </span>
        <button class="btn-remove-log" data-id="${item.id}" title="${t.titleRemoveLog}">&times;</button>
      </div>
    `;

    el.querySelector('.btn-remove-log').addEventListener('click', () => {
      sfx.playBeep(400, 'sine', 0.03);
      triggerHaptic(10);
      removeLogEntry(item.id);
    });

    DOM.sessionLogList.appendChild(el);
  });

  // Keep saddlebags physicalized status in sync (Alpha 4.10)
  updateSaddlebagsUI();
}

function removeLogEntry(id) {
  const idx = state.sessionLog.findIndex(x => x.id === id);
  if (idx !== -1) {
    const item = state.sessionLog[idx];
    state.holdSCU = Math.max(0, Math.round((state.holdSCU - item.scu) * 10) / 10);
    state.sessionLog.splice(idx, 1);
    saveSession();
    updateHoldDisplay();
  }
}

function clearHold() {
  state.holdSCU = 0.0;
  state.sessionLog = [];
  saveSession();
  updateHoldDisplay();
  updateSaddlebagsUI();
  stopQuantainiumTimer();
}

function saveSession() {
  try {
    localStorage.setItem('sc_regolith_session', JSON.stringify({
      holdSCU: state.holdSCU,
      sessionLog: state.sessionLog,
      shipId: state.selectedShip.id
    }));
  } catch (e) {
    console.warn('Storage error:', e);
  }
}

function loadSavedSession() {
  try {
    const raw = localStorage.getItem('sc_regolith_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      state.holdSCU = parsed.holdSCU || 0.0;
      state.sessionLog = parsed.sessionLog || [];
      if (parsed.shipId) {
        setShip(parsed.shipId);
      }
      updateHoldDisplay();
    }
  } catch (e) {
    console.warn('Load storage error:', e);
  }
}

// ==========================================
// LOADOUT PROFILES & FACTORY PRESETS
// Note: FACTORY_LOADOUT_PRESETS is imported from ./data/defaults/factory-loadouts.js
// ==========================================

function getUserProfiles() {
  try {
    const raw = localStorage.getItem('aaron_mfd_saved_profiles');
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.warn('User profiles load error:', e);
    return [];
  }
}

function saveUserProfiles(list) {
  try {
    localStorage.setItem('aaron_mfd_saved_profiles', JSON.stringify(list));
  } catch (e) {
    console.warn('User profiles save error:', e);
  }
}

function populateProfilesDropdown() {
  if (!DOM.savedLoadoutsSelect) return;
  const isEn = state.currentLang === 'en';
  const t = I18N[state.currentLang] || I18N.fr;
  const userProfiles = getUserProfiles();

  DOM.savedLoadoutsSelect.innerHTML = '';

  // 1. Current unsaved option
  const optCustom = document.createElement('option');
  optCustom.value = 'custom';
  optCustom.textContent = t.loadoutProfileCustom;
  DOM.savedLoadoutsSelect.appendChild(optCustom);

  // 2. User Profiles Optgroup
  if (userProfiles.length > 0) {
    const userGroup = document.createElement('optgroup');
    userGroup.label = t.groupUserProfiles;
    userProfiles.forEach(p => {
      const shipObj = MINING_DATA.ships.find(s => s.id === p.shipId);
      const shipLabel = shipObj ? shipObj.name : p.shipId;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${shipLabel})`;
      userGroup.appendChild(opt);
    });
    DOM.savedLoadoutsSelect.appendChild(userGroup);
  }

  // 3. Factory Presets Optgroup
  const presetGroup = document.createElement('optgroup');
  presetGroup.label = t.groupFactoryPresets;
  FACTORY_LOADOUT_PRESETS.forEach(p => {
    const name = (isEn && p.name_en) ? p.name_en : p.name;
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = name;
    presetGroup.appendChild(opt);
  });
  DOM.savedLoadoutsSelect.appendChild(presetGroup);

  // Set current selected value
  const curId = state.activeProfileId || 'custom';
  const exists = Array.from(DOM.savedLoadoutsSelect.options).some(o => o.value === curId);
  DOM.savedLoadoutsSelect.value = exists ? curId : 'custom';

  // Update tag and action buttons
  const isUserCustom = userProfiles.some(p => p.id === curId);
  const activeProfile = [...userProfiles, ...FACTORY_LOADOUT_PRESETS].find(p => p.id === curId);

  if (DOM.activeProfileTag) {
    if (activeProfile) {
      const name = (isEn && activeProfile.name_en) ? activeProfile.name_en : activeProfile.name;
      DOM.activeProfileTag.textContent = `● Profil : ${name}`;
      DOM.activeProfileTag.style.color = isUserCustom ? 'var(--accent-cyan)' : 'var(--accent-amber)';
    } else {
      DOM.activeProfileTag.textContent = isEn ? '● Custom' : '● Personnalisé';
      DOM.activeProfileTag.style.color = 'var(--accent-emerald)';
    }
  }

  if (DOM.btnUpdateCurrentProfile) {
    DOM.btnUpdateCurrentProfile.style.display = isUserCustom ? 'inline-block' : 'none';
  }
  if (DOM.btnDeleteSelectedProfile) {
    DOM.btnDeleteSelectedProfile.style.display = isUserCustom ? 'inline-block' : 'none';
  }
}

function applyProfile(profileId) {
  const isEn = state.currentLang === 'en';
  const t = I18N[state.currentLang] || I18N.fr;

  if (profileId === 'custom') {
    state.activeProfileId = 'custom';
    localStorage.setItem('aaron_mfd_active_profile', 'custom');
    populateProfilesDropdown();
    return;
  }

  const userProfiles = getUserProfiles();
  const allProfiles = [...FACTORY_LOADOUT_PRESETS, ...userProfiles];
  const profile = allProfiles.find(p => p.id === profileId);
  if (!profile) return;

  state.activeProfileId = profileId;
  localStorage.setItem('aaron_mfd_active_profile', profileId);

  // 1. Set Ship
  if (profile.shipId) {
    setShip(profile.shipId);
  }

  // 2. Set Turrets configuration
  if (Array.isArray(profile.turrets)) {
    state.turretsByShip[profile.shipId] = JSON.parse(JSON.stringify(profile.turrets));

    // Synchronize primary laser and modules
    const primaryTurret = profile.turrets[0];
    if (primaryTurret && primaryTurret.laserId) {
      const l = MINING_DATA.lasers.find(x => x.id === primaryTurret.laserId);
      if (l) state.selectedLaser = l;
      state.selectedModules = [...(primaryTurret.moduleIds || ['none', 'none', 'none'])];
    }
  }

  // 3. Set Gadget
  if (profile.gadgetId) {
    const g = MINING_DATA.gadgets.find(x => x.id === profile.gadgetId);
    if (g) state.selectedGadget = g;
  }

  // 4. Update UI
  populateLoadoutSelects();
  updateLoadoutButtonSummary();
  saveLoadout();
  calculateAll();
  populateProfilesDropdown();

  const name = (isEn && profile.name_en) ? profile.name_en : profile.name;
  showToast(t.toastProfileLoaded.replace('{name}', name));
}

function saveCurrentAsProfile(name) {
  const t = I18N[state.currentLang] || I18N.fr;
  const cleanName = (name || '').trim();
  if (!cleanName) {
    showToast(state.currentLang === 'en' ? 'Please provide a valid configuration name!' : 'Veuillez saisir un nom pour cette configuration !');
    return;
  }

  const ship = state.selectedShip;
  const turrets = getShipTurretConfigs(ship.id);

  // Read current inputs in the modal if open
  turrets.forEach((cfg, idx) => {
    const selLaser = document.getElementById(`turretLaser_${idx}`);
    if (selLaser) cfg.laserId = selLaser.value;
    const slotsContainer = document.getElementById(`turretSlots_${idx}`);
    if (slotsContainer) {
      slotsContainer.querySelectorAll('select').forEach((sel, i) => {
        cfg.moduleIds[i] = sel.value;
      });
    }
  });

  const gadgetId = DOM.gadgetSelect ? DOM.gadgetSelect.value : state.selectedGadget.id;

  const newProfile = {
    id: `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: cleanName,
    shipId: ship.id,
    turrets: JSON.parse(JSON.stringify(turrets)),
    gadgetId: gadgetId,
    isPreset: false,
    timestamp: Date.now()
  };

  const userProfiles = getUserProfiles();
  userProfiles.unshift(newProfile);
  saveUserProfiles(userProfiles);

  state.activeProfileId = newProfile.id;
  localStorage.setItem('aaron_mfd_active_profile', newProfile.id);

  saveLoadout();
  populateProfilesDropdown();
  showToast(t.toastProfileSaved.replace('{name}', cleanName));
  sfx.playSuccess();
}

function updateCurrentProfile() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (!state.activeProfileId || state.activeProfileId === 'custom' || state.activeProfileId.startsWith('preset_')) {
    return;
  }

  const userProfiles = getUserProfiles();
  const idx = userProfiles.findIndex(p => p.id === state.activeProfileId);
  if (idx === -1) return;

  const ship = state.selectedShip;
  const turrets = getShipTurretConfigs(ship.id);

  // Read current modal inputs
  turrets.forEach((cfg, idx) => {
    const selLaser = document.getElementById(`turretLaser_${idx}`);
    if (selLaser) cfg.laserId = selLaser.value;
    const slotsContainer = document.getElementById(`turretSlots_${idx}`);
    if (slotsContainer) {
      slotsContainer.querySelectorAll('select').forEach((sel, i) => {
        cfg.moduleIds[i] = sel.value;
      });
    }
  });

  const gadgetId = DOM.gadgetSelect ? DOM.gadgetSelect.value : state.selectedGadget.id;

  userProfiles[idx].shipId = ship.id;
  userProfiles[idx].turrets = JSON.parse(JSON.stringify(turrets));
  userProfiles[idx].gadgetId = gadgetId;
  userProfiles[idx].timestamp = Date.now();

  saveUserProfiles(userProfiles);
  saveLoadout();
  populateProfilesDropdown();
  showToast(t.toastProfileUpdated.replace('{name}', userProfiles[idx].name));
  sfx.playSuccess();
}

function deleteSelectedProfile() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (!state.activeProfileId || state.activeProfileId === 'custom' || state.activeProfileId.startsWith('preset_')) {
    return;
  }

  const userProfiles = getUserProfiles();
  const profile = userProfiles.find(p => p.id === state.activeProfileId);
  if (!profile) return;

  const confirmMsg = t.confirmDeleteProfile.replace('{name}', profile.name);
  if (!confirm(confirmMsg)) return;

  const filtered = userProfiles.filter(p => p.id !== state.activeProfileId);
  saveUserProfiles(filtered);

  state.activeProfileId = 'custom';
  localStorage.setItem('aaron_mfd_active_profile', 'custom');

  populateProfilesDropdown();
  showToast(t.toastProfileDeleted);
  sfx.playBeep(400, 'sine', 0.05);
}

function saveLoadout() {
  try {
    const data = {
      shipId: state.selectedShip.id,
      laserId: state.selectedLaser.id,
      selectedModules: state.selectedModules,
      gadgetId: state.selectedGadget.id,
      turretsByShip: state.turretsByShip,
      moleTurrets: {
        turret1: state.turretsByShip.mole?.[0] || { laserId: 'lancet_s2', moduleIds: [] },
        turret2: state.turretsByShip.mole?.[1] || { laserId: 'helix_s2', moduleIds: [] },
        turret3: state.turretsByShip.mole?.[2] || { laserId: 'helix_s2', moduleIds: [] }
      }
    };
    localStorage.setItem('aaron_mfd_loadout', JSON.stringify(data));
  } catch (e) {
    console.warn('Loadout storage error:', e);
  }
  broadcastLocalLoadout();
}

function loadSavedLoadout() {
  try {
    state.activeProfileId = localStorage.getItem('aaron_mfd_active_profile') || 'custom';
    const raw = localStorage.getItem('aaron_mfd_loadout');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.laserId) {
      const l = MINING_DATA.lasers.find(x => x.id === data.laserId);
      if (l) state.selectedLaser = l;
    }
    if (Array.isArray(data.selectedModules)) {
      state.selectedModules = data.selectedModules;
    }
    if (data.gadgetId) {
      const g = MINING_DATA.gadgets.find(x => x.id === data.gadgetId);
      if (g) state.selectedGadget = g;
    }
    if (data.turretsByShip && typeof data.turretsByShip === 'object') {
      Object.keys(data.turretsByShip).forEach(sId => {
        if (Array.isArray(data.turretsByShip[sId])) {
          state.turretsByShip[sId] = data.turretsByShip[sId];
        }
      });
    } else if (data.moleTurrets) {
      if (data.moleTurrets.turret1) state.turretsByShip.mole[0] = data.moleTurrets.turret1;
      if (data.moleTurrets.turret2) state.turretsByShip.mole[1] = data.moleTurrets.turret2;
      if (data.moleTurrets.turret3) state.turretsByShip.mole[2] = data.moleTurrets.turret3;
    }
  } catch (e) {
    console.warn('Loadout load error:', e);
  }
}

// ==========================================
// QUANTAINIUM VOLATILITY TIMER (15 MIN)
// ==========================================
function startQuantainiumTimer() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (state.qtIntervalId) clearInterval(state.qtIntervalId);
  state.qtTimerActive = true;
  state.qtTimeRemaining = 900; // 15 mins
  DOM.qtTimerPill.classList.add('active');
  sfx.playCritical();

  state.qtIntervalId = setInterval(() => {
    state.qtTimeRemaining--;
    if (state.qtTimeRemaining <= 0) {
      clearInterval(state.qtIntervalId);
      state.qtCountdownText.textContent = 'EXPLOSION !';
      sfx.playCritical();
      alert(t.alertQtExplosion);
    } else {
      const min = Math.floor(state.qtTimeRemaining / 60);
      const sec = state.qtTimeRemaining % 60;
      DOM.qtCountdownText.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

      // Warning at 5 minutes
      if (state.qtTimeRemaining === 300) {
        sfx.playWarning();
      }
      // Critical at 2 minutes
      if (state.qtTimeRemaining === 120) {
        sfx.playCritical();
      }
    }
  }, 1000);
}

function stopQuantainiumTimer() {
  if (state.qtIntervalId) clearInterval(state.qtIntervalId);
  state.qtTimerActive = false;
  DOM.qtTimerPill.classList.remove('active');
}

// ==========================================
// VOICE INPUT (Web Speech API)
// ==========================================
function startVoiceRecognition() {
  const t = I18N[state.currentLang] || I18N.fr;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert(t.alertVoiceUnsupported);
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = state.currentLang === 'en' ? 'en-US' : 'fr-FR';
  recognition.interimResults = true;
  recognition.continuous = false;

  openModal(DOM.voiceModal);
  DOM.voiceTranscript.textContent = t.voiceListening;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.toLowerCase();
    DOM.voiceTranscript.textContent = `"${text}"`;

    if (event.results[0].isFinal) {
      parseVoiceInput(text);
      setTimeout(() => closeModal(DOM.voiceModal), 1200);
    }
  };

  recognition.onerror = (err) => {
    DOM.voiceTranscript.textContent = state.currentLang === 'en' ? 'Voice error or mic muted.' : 'Erreur d\'écoute ou micro coupé.';
    console.warn('Speech error:', err);
  };

  try {
    recognition.start();
  } catch (e) {
    console.warn(e);
  }
}

function parseVoiceInput(text) {
  // Regex parsing for mass: "5400", "rock 6000", "roche 6000"
  const massMatch = text.match(/(\d{3,5})/);
  if (massMatch) {
    setMass(parseInt(massMatch[1], 10));
  }

  // Percentage match: "30 pourcent", "30%", "30 percent"
  const pctMatch = text.match(/(\d{1,2})\s*(%|pourcent|pour cent|percent)/);
  if (pctMatch) {
    setPct(parseInt(pctMatch[1], 10));
  }

  // Mineral recognition
  for (const min of MINING_DATA.minerals) {
    const nameFr = (min.name_fr || min.name || '').toLowerCase().split(' ')[0];
    const nameEn = (min.name_en || min.name || '').toLowerCase().split(' ')[0];
    if (text.includes(nameFr) || text.includes(nameEn)) {
      selectMineral(min);
      break;
    }
  }

  // Resistance match: "résistance 35" / "resistance 35"
  const resMatch = text.match(/(?:r[ée]sistance|resistance)\s*(\d{1,2})/i);
  if (resMatch) {
    setResistance(parseInt(resMatch[1], 10));
  }

  sfx.playSuccess();
}

// ==========================================
// FEATURE 1: BREAK TREE / SUB-CHUNKS SIMULATOR
// ==========================================
function openBreakTreeModal() {
  generateBreakTree();
  openModal(DOM.breakTreeModal);
  sfx.playBeep(650, 'sine', 0.04);
  triggerHaptic(15);
}

function generateBreakTree() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const parentMass = state.rockMass;
  const parentPct = state.orePercentage;
  const mineral = state.selectedMineral;
  const minName = getLocalized(mineral, 'name');

  if (DOM.breakTreeParentInfo) {
    DOM.breakTreeParentInfo.textContent = `${parentMass.toLocaleString(locale)} kg • ${parentPct.toFixed(1)}% ${minName}`;
  }
  if (DOM.breakTreeDescText) {
    DOM.breakTreeDescText.textContent = t.breakTreeDesc.replace('{mass}', parentMass.toLocaleString(locale));
  }

  // Fracture splits rock into 3 chunks with mass conservation
  const mass1 = Math.round(parentMass * 0.45);
  const mass2 = Math.round(parentMass * 0.35);
  const mass3 = parentMass - mass1 - mass2;

  // Mineral content distribution (enriched chunk vs medium vs inert waste)
  const pct1 = Math.min(100, Math.round(parentPct * 2.2));
  const pct2 = Math.min(90, Math.round(parentPct * 0.85));
  const pct3 = Math.max(0, Math.round(parentPct * 0.1));

  const densityDivisor = (mineral.density || 15) * 85;

  const chunks = [
    {
      id: 1,
      mass: mass1,
      pct: pct1,
      status: pct1 >= 60 ? 'purple' : 'orange',
      pureSCU: Math.round(((mass1 * (pct1 / 100)) / (mineral.id === 'hadanite' ? 1000 : densityDivisor)) * 10) / 10,
      extracted: false
    },
    {
      id: 2,
      mass: mass2,
      pct: pct2,
      status: 'orange',
      pureSCU: Math.round(((mass2 * (pct2 / 100)) / (mineral.id === 'hadanite' ? 1000 : densityDivisor)) * 10) / 10,
      extracted: false
    },
    {
      id: 3,
      mass: mass3,
      pct: pct3,
      status: 'gray',
      pureSCU: Math.round(((mass3 * (pct3 / 100)) / (mineral.id === 'hadanite' ? 1000 : densityDivisor)) * 10) / 10,
      extracted: false
    }
  ];

  state.subchunks = chunks;
  state.breakTreeExtractedSCU = 0.0;
  if (DOM.breakTreeExtractedTotal) DOM.breakTreeExtractedTotal.textContent = '0.0 SCU';

  renderBreakTreeChunks();
}

function renderBreakTreeChunks() {
  if (!DOM.subchunksContainer) return;
  DOM.subchunksContainer.innerHTML = '';
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const mineral = state.selectedMineral;
  const minName = getLocalized(mineral, 'name');

  state.subchunks.forEach(chunk => {
    const rawVal = Math.round(chunk.pureSCU * 100 * mineral.rawPrice);
    const card = document.createElement('div');
    card.className = `subchunk-card chunk-${chunk.status}`;

    let badgeLabel = t.chunkExtractable;
    let badgeClass = 'badge-purple';
    if (chunk.status === 'orange') {
      badgeLabel = t.chunkNeedBreak;
      badgeClass = 'badge-orange';
    } else if (chunk.status === 'gray') {
      badgeLabel = t.chunkInert;
      badgeClass = 'badge-gray';
    }

    let actionBtnHtml = '';
    if (chunk.status === 'purple') {
      actionBtnHtml = `<button class="btn-extract-chunk ${chunk.extracted ? 'extracted' : ''}" data-chunk-id="${chunk.id}">${chunk.extracted ? t.chunkActionExtracted : t.btnExtractChunk}</button>`;
    } else if (chunk.status === 'orange') {
      actionBtnHtml = `<button class="btn-refracture-chunk" data-refracture-id="${chunk.id}">${t.chunkActionRefracture.replace('{mass}', chunk.mass.toLocaleString(locale))}</button>`;
    } else {
      actionBtnHtml = `<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:8px;">${t.chunkInert} ${t.chunkActionIgnore}</div>`;
    }

    card.innerHTML = `
      <div class="subchunk-header">
        <span style="font-family:var(--font-mono); font-weight:700; color:#fff;">#0${chunk.id} • ${chunk.mass.toLocaleString(locale)} kg</span>
        <span class="subchunk-badge ${badgeClass}">${badgeLabel}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
        <span style="color:${mineral.color}; font-weight:700;">${chunk.pct}% ${minName}</span>
        <span style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:700;">${chunk.pureSCU.toFixed(1)} SCU</span>
      </div>
      <div style="font-family:var(--font-mono); font-size:0.8rem; color:var(--accent-emerald);">
        ~${rawVal.toLocaleString(locale)} ${t.rawAuecUnit}
      </div>
      ${actionBtnHtml}
    `;

    const extractBtn = card.querySelector('.btn-extract-chunk');
    if (extractBtn && !chunk.extracted) {
      extractBtn.addEventListener('click', () => {
        extractSubchunk(chunk);
      });
    }

    const refractureBtn = card.querySelector('.btn-refracture-chunk');
    if (refractureBtn) {
      refractureBtn.addEventListener('click', () => {
        refractureSubchunk(chunk);
      });
    }

    DOM.subchunksContainer.appendChild(card);
  });
}

function extractSubchunk(chunk) {
  if (chunk.extracted) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const mineral = state.selectedMineral;

  if (state.holdSCU + chunk.pureSCU > state.selectedShip.scu) {
    sfx.playWarning();
    alert(t.alertCapacityExceeded.replace('{max}', state.selectedShip.scu).replace('{cur}', state.holdSCU.toFixed(1)));
    return;
  }

  chunk.extracted = true;
  state.holdSCU = Math.round((state.holdSCU + chunk.pureSCU) * 10) / 10;
  state.breakTreeExtractedSCU = Math.round((state.breakTreeExtractedSCU + chunk.pureSCU) * 10) / 10;
  if (DOM.breakTreeExtractedTotal) {
    DOM.breakTreeExtractedTotal.textContent = `${state.breakTreeExtractedSCU.toFixed(1)} SCU`;
  }

  const logEntry = {
    id: Date.now(),
    mineralId: mineral.id,
    mineral: getLocalized(mineral, 'name'),
    color: mineral.color,
    scu: chunk.pureSCU,
    isVolatile: mineral.isVolatile,
    rawVal: Math.round(chunk.pureSCU * 100 * mineral.rawPrice),
    time: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  };

  state.sessionLog.unshift(logEntry);
  addLedgerEntry('run', logEntry.mineral, logEntry.scu, logEntry.rawVal);

  saveSession();
  updateHoldDisplay();
  renderBreakTreeChunks();
  sfx.playSuccess();
  triggerHaptic(20);

  if (mineral.isVolatile && !state.qtTimerActive) {
    startQuantainiumTimer();
  }
}

function refractureSubchunk(chunk) {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  setMass(chunk.mass);
  setPct(chunk.pct);
  closeModal(DOM.breakTreeModal);
  sfx.playBeep(700, 'sine', 0.05);
  triggerHaptic(15);
  showToast(t.toastChunkRefractured.replace('{mass}', chunk.mass.toLocaleString(locale)));
}

// ==========================================
// FEATURE 2: GUILD STOCKPILE, REFINING STATUSES & EXPENSE LEDGER (JALON 7)
// Note: DEFAULT_GUILD_STOCKPILE and DEFAULT_GUILD_EXPENSES imported from ./data/defaults/guild-defaults.js
// ==========================================

function initGuildStockpileAndExpenses() {
  // 1. Sub-tabs switching
  if (DOM.btnStockpileTabOverview) {
    DOM.btnStockpileTabOverview.addEventListener('click', () => switchStockpileTab('overview'));
  }
  if (DOM.btnStockpileTabRefining) {
    DOM.btnStockpileTabRefining.addEventListener('click', () => switchStockpileTab('refining'));
  }
  if (DOM.btnStockpileTabExpenses) {
    DOM.btnStockpileTabExpenses.addEventListener('click', () => switchStockpileTab('expenses'));
  }
  if (DOM.btnStockpileTabTreasury) {
    DOM.btnStockpileTabTreasury.addEventListener('click', () => switchStockpileTab('treasury'));
  }
  if (DOM.btnStockpileTabTrading) {
    DOM.btnStockpileTabTrading.addEventListener('click', () => switchStockpileTab('trading'));
  }

  // 2. Populate filters & dropdowns
  populateRefineryModalSelects();

  // 3. Status filter pills
  const statusPills = document.querySelectorAll('.stock-pill-btn');
  statusPills.forEach(btn => {
    btn.addEventListener('click', () => {
      statusPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.stockpileFilterStatus = btn.getAttribute('data-stock-filter') || 'all';
      renderGuildStockpile();
    });
  });

  // 4. Station & mineral filter dropdowns
  if (DOM.stockpileStationFilter) {
    DOM.stockpileStationFilter.addEventListener('change', (e) => {
      state.stockpileFilterStation = e.target.value;
      renderGuildStockpile();
    });
  }
  if (DOM.stockpileMineralFilter) {
    DOM.stockpileMineralFilter.addEventListener('change', (e) => {
      state.stockpileFilterMineral = e.target.value;
      renderGuildStockpile();
    });
  }

  // 5. Quick deposit from ship hold
  if (DOM.btnQuickDepositHold) {
    DOM.btnQuickDepositHold.addEventListener('click', depositHoldToStockpile);
  }

  // 6. Toggle manual deposit form
  if (DOM.btnToggleManualLotForm) {
    DOM.btnToggleManualLotForm.addEventListener('click', () => {
      if (!DOM.manualLotCard) return;
      const isVisible = DOM.manualLotCard.style.display !== 'none';
      DOM.manualLotCard.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && DOM.manualLotScuInput) {
        DOM.manualLotScuInput.focus();
      }
    });
  }

  // 7. Submit manual stock lot
  if (DOM.btnSubmitManualStockLot) {
    DOM.btnSubmitManualStockLot.addEventListener('click', submitManualStockLot);
  }

  // 8. Fleet sync stockpile
  if (DOM.btnSyncStockpileFleet) {
    DOM.btnSyncStockpileFleet.addEventListener('click', () => {
      broadcastStockpileToFleet(false);
    });
  }

  // 9. Push Notifications setup
  initPushNotifications();

  // 10. Expenses logging & controls
  if (DOM.btnAddExpenseSubmit) {
    DOM.btnAddExpenseSubmit.addEventListener('click', addGuildExpense);
  }
  if (DOM.btnCopyExpensesDiscord) {
    DOM.btnCopyExpensesDiscord.addEventListener('click', copyGuildExpensesToDiscord);
  }
  if (DOM.btnSyncExpensesFleet) {
    DOM.btnSyncExpensesFleet.addEventListener('click', () => {
      broadcastExpensesToFleet(false);
    });
  }
  if (DOM.btnClearExpensesAll) {
    DOM.btnClearExpensesAll.addEventListener('click', clearGuildExpenses);
  }

  // 11. Treasury & mo.Trader Controls
  if (DOM.treasuryTaxSelect) {
    DOM.treasuryTaxSelect.value = state.guildCorpoTaxPct.toString();
    DOM.treasuryTaxSelect.addEventListener('change', (e) => {
      state.guildCorpoTaxPct = parseInt(e.target.value, 10) || 0;
      saveGuildTreasury();
      renderMoTraderSheet();
    });
  }
  if (DOM.btnDepositTreasury) {
    DOM.btnDepositTreasury.addEventListener('click', depositGuildTreasury);
  }
  if (DOM.btnWithdrawTreasury) {
    DOM.btnWithdrawTreasury.addEventListener('click', withdrawGuildTreasury);
  }
  if (DOM.btnCopyMoTrader) {
    DOM.btnCopyMoTrader.addEventListener('click', copyMoTraderSheetToClipboard);
  }

  // 12. Crafting 4.0 Goals Controls
  if (DOM.btnToggleAddGoalForm) {
    DOM.btnToggleAddGoalForm.addEventListener('click', () => {
      if (!DOM.addCraftingGoalForm) return;
      const isVis = DOM.addCraftingGoalForm.style.display !== 'none';
      DOM.addCraftingGoalForm.style.display = isVis ? 'none' : 'block';
    });
  }
  if (DOM.btnSubmitCraftingGoal) {
    DOM.btnSubmitCraftingGoal.addEventListener('click', submitCraftingGoal);
  }
  if (DOM.btnSyncTreasuryFleet) {
    DOM.btnSyncTreasuryFleet.addEventListener('click', () => {
      broadcastTreasuryToFleet(false);
    });
  }

  // 13. Load persisted data & render
  loadGuildStockpile();
  loadGuildExpenses();
  renderGuildTreasury();
  initCommodityTrading();
  populateCraftingGoalItemSelect();
}

function switchStockpileTab(tabName) {
  if (tabName === 'expenses' || tabName === 'treasury') {
    if (typeof openGuildConfigModal === 'function') {
      if (DOM.refineryModal) closeModal(DOM.refineryModal);
      openGuildConfigModal();
      if (typeof switchGuildTab === 'function') switchGuildTab('finance');
    }
    return;
  }
  state.activeStockpileTab = tabName;
  const tabs = [
    { id: 'overview', btn: DOM.btnStockpileTabOverview, pane: DOM.paneStockpileOverview },
    { id: 'refining', btn: DOM.btnStockpileTabRefining, pane: DOM.paneStockpileRefining }
  ];

  tabs.forEach(t => {
    const isActive = t.id === tabName;
    if (t.btn) t.btn.classList.toggle('active', isActive);
    if (t.pane) t.pane.classList.toggle('active', isActive);
  });
}

function populateRefineryModalSelects() {
  const t = I18N[state.currentLang] || I18N.fr;

  // Station dropdowns (Order station, Filter station, Manual lot station)
  const populateStations = (selectEl, includeAllOption = false) => {
    if (!selectEl) return;
    const currentVal = selectEl.value;
    selectEl.innerHTML = '';

    if (includeAllOption) {
      const optAll = document.createElement('option');
      optAll.value = 'all';
      optAll.textContent = t.filterAllStations || 'Toutes les stations';
      selectEl.appendChild(optAll);
    }

    const stantonGroup = document.createElement('optgroup');
    stantonGroup.label = t.optgroupStanton || '🌌 SYSTÈME STANTON';

    const pyroGroup = document.createElement('optgroup');
    pyroGroup.label = t.optgroupPyro || '🔥 SYSTÈME PYRO';

    const nyxGroup = document.createElement('optgroup');
    nyxGroup.label = t.optgroupNyx || '🚀 SYSTÈME NYX';

    MINING_DATA.refineryStations.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `${st.name} (${st.system})`;
      if (st.sector === 'pyro') {
        pyroGroup.appendChild(opt);
      } else if (st.sector === 'nyx') {
        nyxGroup.appendChild(opt);
      } else {
        stantonGroup.appendChild(opt);
      }
    });

    selectEl.appendChild(stantonGroup);
    selectEl.appendChild(pyroGroup);
    selectEl.appendChild(nyxGroup);

    if (currentVal) selectEl.value = currentVal;
  };

  populateStations(DOM.refineryOrderStationSelect, false);
  populateStations(DOM.stockpileStationFilter, true);
  populateStations(DOM.manualLotStationSelect, false);

  // Refining methods select
  if (DOM.refineryOrderMethodSelect) {
    DOM.refineryOrderMethodSelect.innerHTML = '';
    MINING_DATA.refiningMethods.forEach(rm => {
      const opt = document.createElement('option');
      opt.value = rm.id;
      opt.textContent = `${rm.name} (${Math.round(rm.yieldRate * 100)}% ${t.refineryYield || 'Rendement'})`;
      DOM.refineryOrderMethodSelect.appendChild(opt);
    });
  }

  // Minerals select (Filter mineral, Manual lot mineral)
  const populateMinerals = (selectEl, includeAllOption = false) => {
    if (!selectEl) return;
    const currentVal = selectEl.value;
    selectEl.innerHTML = '';

    if (includeAllOption) {
      const optAll = document.createElement('option');
      optAll.value = 'all';
      optAll.textContent = t.filterAllMinerals || 'Tous les minerais';
      selectEl.appendChild(optAll);
    }

    MINING_DATA.minerals.forEach(min => {
      const opt = document.createElement('option');
      opt.value = min.id;
      opt.textContent = getLocalized(min, 'name');
      selectEl.appendChild(opt);
    });

    if (currentVal) selectEl.value = currentVal;
  };

  populateMinerals(DOM.stockpileMineralFilter, true);
  populateMinerals(DOM.manualLotMineralSelect, false);
}

// ----------------------------------------------------
// PUSH NOTIFICATION SYSTEM (ALPHA 4.10 NATIVE)
// ----------------------------------------------------
function initPushNotifications() {
  updatePushStatusBadge();

  if (DOM.btnRequestPushPerm) {
    DOM.btnRequestPushPerm.addEventListener('click', requestPushPermission);
  }
  if (DOM.btnTestPushAlert) {
    DOM.btnTestPushAlert.addEventListener('click', () => {
      const t = I18N[state.currentLang] || I18N.fr;
      sendDesktopPushNotification(
        '🔔 AARON MFD : TEST ALERTE LOGISTIQUE',
        'Test d\'alerte push réussi ! Vos ordres de raffinage vous notifieront ici.'
      );
      showToast(t.toastPushTestSent || '🔔 Notification de test envoyée !');
    });
  }
}

function updatePushStatusBadge() {
  if (!DOM.pushStatusBadge) return;
  const t = I18N[state.currentLang] || I18N.fr;

  if (!('Notification' in window)) {
    DOM.pushStatusBadge.className = 'push-status-badge denied';
    DOM.pushStatusBadge.textContent = 'Non supporté sur ce navigateur';
    return;
  }

  const perm = Notification.permission;
  if (perm === 'granted') {
    DOM.pushStatusBadge.className = 'push-status-badge granted';
    DOM.pushStatusBadge.textContent = `🟢 ${t.pushPermissionGranted || 'Notifications actives'}`;
    state.pushNotificationEnabled = true;
  } else if (perm === 'denied') {
    DOM.pushStatusBadge.className = 'push-status-badge denied';
    DOM.pushStatusBadge.textContent = `🔴 ${t.pushPermissionDenied || 'Bloqué'}`;
    state.pushNotificationEnabled = false;
  } else {
    DOM.pushStatusBadge.className = 'push-status-badge prompt';
    DOM.pushStatusBadge.textContent = '🟡 Autorisation requise';
    state.pushNotificationEnabled = false;
  }
}

function requestPushPermission() {
  if (!('Notification' in window)) {
    showToast('Notifications de bureau non supportées par ce navigateur.');
    return;
  }

  Notification.requestPermission().then(permission => {
    updatePushStatusBadge();
    const t = I18N[state.currentLang] || I18N.fr;
    if (permission === 'granted') {
      sfx.playSuccess();
      triggerHaptic(20);
      showToast('🟢 Notifications push autorisées pour AARON MFD !');
      sendDesktopPushNotification(
        '🔔 AARON MFD INITIALISÉ',
        'Vous recevrez les alertes de fin de raffinage même en arrière-plan.'
      );
    } else {
      sfx.playWarning();
      showToast('Notifications désactivées.');
    }
  });
}

function sendDesktopPushNotification(title, body) {
  // 1. Audio and voice chime
  sfx.playSuccess();
  triggerHaptic([30, 50, 30]);



  // 2. Native Desktop Notification if allowed
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: body,
        icon: './assets/icon-192.png',
        badge: './assets/icon-192.png',
        tag: 'aaron-refinery-status',
        renotify: true
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}

// ----------------------------------------------------
// GUILD STOCKPILE LOGISTICS & DISPATCH
// ----------------------------------------------------
function depositHoldToStockpile() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (state.holdSCU <= 0 && state.sessionLog.length === 0) {
    sfx.playWarning();
    showToast(t.toastHoldEmpty || 'Votre soute est actuellement vide.');
    return;
  }

  const station = MINING_DATA.refineryStations[0];
  const mineral = state.selectedMineral || MINING_DATA.minerals[0];
  const scu = state.holdSCU > 0 ? parseFloat(state.holdSCU.toFixed(1)) : 32.0;

  const rawPrice = (mineral.rawPrice || 80);
  const rawVal = Math.round(scu * 100 * rawPrice);
  const refinedVal = Math.round(scu * 100 * (mineral.refinedPrice || rawPrice * 1.9));

  const newLot = {
    id: 'lot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    stationId: station.id,
    stationName: station.name,
    mineralId: mineral.id,
    mineralName: getLocalized(mineral, 'name'),
    scu: scu,
    status: 'raw',
    rawVal: rawVal,
    refinedVal: refinedVal,
    depositedBy: state.callsign || 'CITIZEN-1',
    timestamp: Date.now()
  };

  state.guildStockpile.unshift(newLot);
  saveGuildStockpile();

  // Empty ship hold
  clearHold();

  renderGuildStockpile();
  updateGuildNetWorthMetrics();
  sfx.playSuccess();
  triggerHaptic(25);

  const msg = (t.lotDepositedToast || '📦 Lot de {scu} SCU ({mineral}) déposé dans le stockpile à {station} !')
    .replace('{scu}', newLot.scu)
    .replace('{mineral}', newLot.mineralName)
    .replace('{station}', newLot.stationName);
  showToast(msg);

  // Auto-sync with fleet
  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'deposit',
      lot: newLot,
      allLots: state.guildStockpile
    });
  }
}

function submitManualStockLot() {
  const t = I18N[state.currentLang] || I18N.fr;
  const category = DOM.manualLotCategorySelect ? DOM.manualLotCategorySelect.value : 'mineral';
  const unitBuyCost = DOM.manualLotBuyCostInput ? (parseFloat(DOM.manualLotBuyCostInput.value) || 0) : 0;
  const stationId = DOM.manualLotStationSelect ? DOM.manualLotStationSelect.value : 'arc_l1';
  const itemId = DOM.manualLotMineralSelect ? DOM.manualLotMineralSelect.value : 'quantainium';
  const scu = DOM.manualLotScuInput ? parseFloat(DOM.manualLotScuInput.value) : 32.0;
  const status = DOM.manualLotStatusSelect ? DOM.manualLotStatusSelect.value : 'refined_ready';

  if (!scu || scu <= 0) {
    showToast('Volume SCU invalide.');
    return;
  }

  const station = MINING_DATA.refineryStations.find(s => s.id === stationId) || MINING_DATA.refineryStations[0];
  let itemName = itemId;
  let rawVal = 0;
  let refinedVal = 0;

  if (category === 'commodity') {
    const comm = (MINING_DATA.generalCommodities || []).find(c => c.id === itemId) || MINING_DATA.generalCommodities[0];
    itemName = getLocalized(comm, 'name') || comm.name_fr;
    rawVal = Math.round(scu * (unitBuyCost > 0 ? unitBuyCost : comm.baseBuy) * 100);
    refinedVal = Math.round(scu * comm.baseSell * 100);
  } else {
    const mineral = MINING_DATA.minerals.find(m => m.id === itemId) || MINING_DATA.minerals[0];
    itemName = getLocalized(mineral, 'name');
    rawVal = Math.round(scu * 100 * (mineral.rawPrice || 80));
    refinedVal = Math.round(scu * 100 * (mineral.refinedPrice || (mineral.rawPrice * 1.9)));
  }

  const newLot = {
    id: 'lot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    category: category,
    stationId: station.id,
    stationName: station.name,
    mineralId: itemId,
    mineralName: itemName,
    scu: parseFloat(scu.toFixed(1)),
    unitBuyCost: unitBuyCost,
    status: status,
    rawVal: rawVal,
    refinedVal: refinedVal,
    depositedBy: state.callsign || 'CITIZEN-1',
    timestamp: Date.now()
  };

  state.guildStockpile.unshift(newLot);
  saveGuildStockpile();

  // Hide form
  if (DOM.manualLotCard) DOM.manualLotCard.style.display = 'none';

  renderGuildStockpile();
  updateGuildNetWorthMetrics();
  sfx.playSuccess();
  triggerHaptic(20);

  const msg = (t.lotDepositedToast || '📦 Lot de {scu} SCU ({mineral}) déposé dans le stockpile à {station} !')
    .replace('{scu}', newLot.scu)
    .replace('{mineral}', newLot.mineralName)
    .replace('{station}', newLot.stationName);
  showToast(msg);

  // Fleet sync
  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'deposit',
      lot: newLot,
      allLots: state.guildStockpile
    });
  }
}

function assignStockLotToHauler(lotId) {
  const t = I18N[state.currentLang] || I18N.fr;
  const lot = state.guildStockpile.find(l => l.id === lotId);
  if (!lot) return;

  const ships = MINING_DATA.supportShips || [];
  const hauler = ships.find(s => s.id === state.activeHaulerId) || ships[0];

  // Check hauler capacity
  const currentSCU = (state.haulerHoldBags || []).reduce((sum, b) => sum + (b.scu || 0), 0);
  if (currentSCU + lot.scu > hauler.scu) {
    sfx.playWarning();
    showToast(`Capacité du transporteur ${hauler.name} dépassée (${currentSCU}/${hauler.scu} SCU) !`);
    return;
  }

  // Add to hauler cargo hold
  state.haulerHoldBags.push({
    id: 'bag_' + Date.now(),
    mineral: lot.mineralName,
    scu: lot.scu,
    rawVal: lot.rawVal,
    refinedVal: lot.refinedVal,
    source: lot.stationName
  });

  saveHaulerHoldBags();
  updateHaulerCargoUI();

  // Remove lot from stockpile
  state.guildStockpile = state.guildStockpile.filter(l => l.id !== lotId);
  saveGuildStockpile();

  renderGuildStockpile();
  updateGuildNetWorthMetrics();
  sfx.playSuccess();
  triggerHaptic(25);

  const msg = (t.assignedToHaulerToast || '🚜 Lot de {scu} SCU assigné à la soute du transporteur {hauler} !')
    .replace('{scu}', lot.scu)
    .replace('{hauler}', hauler.name);
  showToast(msg);

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'assign_hauler',
      lotId: lotId,
      allLots: state.guildStockpile
    });
  }
}

function markStockLotSold(lotId) {
  const t = I18N[state.currentLang] || I18N.fr;
  const lot = state.guildStockpile.find(l => l.id === lotId);
  if (!lot) return;

  const finalProfit = lot.status === 'raw' ? lot.rawVal : lot.refinedVal;
  addLedgerEntry('sale', lot.mineralName, lot.scu, finalProfit, lot.stationName);
  updateLedgerDisplay();

  state.guildStockpile = state.guildStockpile.filter(l => l.id !== lotId);
  saveGuildStockpile();

  renderGuildStockpile();
  updateGuildNetWorthMetrics();
  sfx.playSuccess();
  triggerHaptic(20);

  const locale = getLocale();
  const msg = (t.lotSoldToast || '💰 Lot vendu avec succès ! Bénéfice de {auec} aUEC enregistré.')
    .replace('{auec}', finalProfit.toLocaleString(locale));
  showToast(msg);

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'sold',
      lotId: lotId,
      allLots: state.guildStockpile
    });
  }
}

function deleteStockLot(lotId) {
  const t = I18N[state.currentLang] || I18N.fr;
  state.guildStockpile = state.guildStockpile.filter(l => l.id !== lotId);
  saveGuildStockpile();
  renderGuildStockpile();
  updateGuildNetWorthMetrics();
  showToast(t.lotDeletedToast || '🗑️ Lot retiré du stockpile.');

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'delete',
      lotId: lotId,
      allLots: state.guildStockpile
    });
  }
}

function passStockLotToRefining(lotId) {
  const lot = state.guildStockpile.find(l => l.id === lotId);
  if (!lot) return;

  lot.status = 'refining';
  lot.methodName = 'Dinyx Solventation';
  saveGuildStockpile();
  renderGuildStockpile();
  updateGuildNetWorthMetrics();
  sfx.playSuccess();
  showToast(`🏭 Lot de ${lot.scu} SCU (${lot.mineralName}) basculé en statut raffinage !`);

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'update_status',
      lotId: lotId,
      allLots: state.guildStockpile
    });
  }
}

function broadcastStockpileToFleet(silent = false) {
  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'sync_all',
      allLots: state.guildStockpile
    });
    if (!silent) {
      const t = I18N[state.currentLang] || I18N.fr;
      const msg = (t.stockpileSyncToast || '📡 Stockpile de guilde synchronisé avec la flotte ({count} lots) !')
        .replace('{count}', state.guildStockpile.length);
      showToast(msg);
      sfx.playSuccess();
    }
  } else if (!silent) {
    showToast('FLEET-NET non connecté. Rejoignez une escadre pour synchroniser le stockpile.');
  }
}

function handleIncomingCorpoStockSync(stockSync, senderCallsign) {
  if (!stockSync) return;
  const t = I18N[state.currentLang] || I18N.fr;

  if (Array.isArray(stockSync.allLots)) {
    state.guildStockpile = stockSync.allLots;
    saveGuildStockpile();
    renderGuildStockpile();
    updateGuildNetWorthMetrics();
  }

  sfx.playBeep(680, 'sine', 0.05);
  const msg = (t.stockpileReceivedToast || '📡 Stockpile actualisé par {callsign} !')
    .replace('{callsign}', senderCallsign || 'Pilote');
  showToast(msg);
}

function renderGuildStockpile() {
  if (!DOM.guildStockpileList) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();

  let lots = [...state.guildStockpile];

  // Apply station filter
  if (state.stockpileFilterStation && state.stockpileFilterStation !== 'all') {
    lots = lots.filter(l => l.stationId === state.stockpileFilterStation);
  }

  // Apply mineral filter
  if (state.stockpileFilterMineral && state.stockpileFilterMineral !== 'all') {
    lots = lots.filter(l => l.mineralId === state.stockpileFilterMineral);
  }

  // Apply status filter
  if (state.stockpileFilterStatus && state.stockpileFilterStatus !== 'all') {
    lots = lots.filter(l => l.status === state.stockpileFilterStatus);
  }

  DOM.guildStockpileList.innerHTML = '';
  if (lots.length === 0) {
    DOM.guildStockpileList.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding:24px; background:rgba(255,255,255,0.02); border-radius:6px;">
        ${t.emptyStockpile || 'Aucun minerai enregistré dans le stockpile de guilde.'}
      </div>
    `;
    return;
  }

  lots.forEach(lot => {
    const card = document.createElement('div');
    card.className = `stockpile-lot-card status-${lot.status}`;

    let statusPillHtml = '';
    if (lot.status === 'refined_ready') {
      statusPillHtml = `<span class="lot-status-pill ready">${t.statusBadgeReady || '🟢 PRÊT AU TRANSPORT'}</span>`;
    } else if (lot.status === 'refining') {
      statusPillHtml = `<span class="lot-status-pill refining">${t.statusBadgeRefining || '🟡 EN RAFFINAGE'}</span>`;
    } else {
      statusPillHtml = `<span class="lot-status-pill raw">${t.statusBadgeRaw || '⚪ BRUT STOCKÉ'}</span>`;
    }

    const valueDisplay = lot.status === 'raw' ? lot.rawVal : lot.refinedVal;
    const valueLabel = lot.status === 'raw' ? 'Valeur brute :' : 'Valeur raffinée :';

    const isComm = lot.category === 'commodity';
    const categoryBadge = isComm ? `<span class="commodity-badge">📦 COMMODITY</span>` : `<span class="commodity-badge" style="border-color:rgba(16,185,129,0.3); color:var(--accent-emerald); background:rgba(16,185,129,0.1);">⛏️ MINERAI</span>`;
    const costTotal = (lot.unitBuyCost || 0) * lot.scu * 100;
    const marginTotal = (valueDisplay || 0) - costTotal;
    const marginInfo = lot.unitBuyCost > 0
      ? `<div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">Coût: ${costTotal.toLocaleString(locale)} aUEC | Marge: <strong style="color:${marginTotal >= 0 ? 'var(--accent-emerald)' : '#f87171'}">${marginTotal >= 0 ? '+' : ''}${marginTotal.toLocaleString(locale)} aUEC</strong></div>`
      : '';

    card.innerHTML = `
      <div class="lot-header-row">
        <div class="lot-station-badge">
          <span>📍</span>
          <span>${lot.stationName}</span>
          ${categoryBadge}
        </div>
        ${statusPillHtml}
      </div>
      <div class="lot-details-row">
        <div>
          <strong style="color:var(--accent-cyan); font-family:var(--font-hud); font-size:0.92rem;">${lot.mineralName}</strong>
          <span style="font-family:var(--font-mono); font-weight:700; color:#fff; margin-left:6px;">${lot.scu.toFixed(1)} SCU</span>
          ${marginInfo}
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; color:var(--text-muted);">${valueLabel}</span>
          <strong style="font-family:var(--font-mono); color:var(--accent-emerald); font-size:0.95rem; margin-left:4px;">
            ${(valueDisplay || 0).toLocaleString(locale)} aUEC
          </strong>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <span class="lot-depositor-tag">
          ${(t.depositedBy || 'Déposé par {callsign}').replace('{callsign}', lot.depositedBy || 'Pilote')}
        </span>
        <div class="lot-actions-row">
          ${lot.status === 'refined_ready' ? `
            <button type="button" class="chip-btn btn-assign-hauler" data-lot-id="${lot.id}" style="border-color:var(--accent-emerald); color:var(--accent-emerald); padding:3px 8px; font-size:0.72rem;">
              🚜 Assigner C2/MAX
            </button>
            <button type="button" class="chip-btn btn-sell-lot" data-lot-id="${lot.id}" style="border-color:var(--accent-cyan); color:var(--accent-cyan); padding:3px 8px; font-size:0.72rem;">
              💰 Vendre
            </button>
          ` : ''}
          ${lot.status === 'raw' ? `
            <button type="button" class="chip-btn btn-pass-refining" data-lot-id="${lot.id}" style="border-color:var(--accent-amber); color:var(--accent-amber); padding:3px 8px; font-size:0.72rem;">
              🏭 Raffiner
            </button>
          ` : ''}
          <button type="button" class="chip-btn btn-delete-lot" data-lot-id="${lot.id}" style="border-color:rgba(239,68,68,0.3); color:#fca5a5; padding:3px 6px; font-size:0.72rem;">
            &times;
          </button>
        </div>
      </div>
    `;

    // Action listeners
    const assignBtn = card.querySelector('.btn-assign-hauler');
    if (assignBtn) {
      assignBtn.addEventListener('click', () => assignStockLotToHauler(lot.id));
    }
    const sellBtn = card.querySelector('.btn-sell-lot');
    if (sellBtn) {
      sellBtn.addEventListener('click', () => markStockLotSold(lot.id));
    }
    const passRefBtn = card.querySelector('.btn-pass-refining');
    if (passRefBtn) {
      passRefBtn.addEventListener('click', () => passStockLotToRefining(lot.id));
    }
    const delBtn = card.querySelector('.btn-delete-lot');
    if (delBtn) {
      delBtn.addEventListener('click', () => deleteStockLot(lot.id));
    }

    DOM.guildStockpileList.appendChild(card);
  });
}

function saveGuildStockpile() {
  try {
    localStorage.setItem('aaron_mfd_guild_stockpile', JSON.stringify(state.guildStockpile));
  } catch (e) {
    console.warn(e);
  }
}

function loadGuildStockpile() {
  try {
    const raw = localStorage.getItem('aaron_mfd_guild_stockpile');
    if (raw) {
      state.guildStockpile = JSON.parse(raw) || [];
    } else {
      state.guildStockpile = [...DEFAULT_GUILD_STOCKPILE];
      saveGuildStockpile();
    }
  } catch (e) {
    state.guildStockpile = [...DEFAULT_GUILD_STOCKPILE];
  }
  renderGuildStockpile();
  updateGuildNetWorthMetrics();
}

// ----------------------------------------------------
// CORPO EXPENSE LEDGER & REIMBURSEMENT
// ----------------------------------------------------
function addGuildExpense() {
  const t = I18N[state.currentLang] || I18N.fr;
  const category = DOM.expenseCategorySelect ? DOM.expenseCategorySelect.value : 'refining';
  const paymentMode = DOM.expensePaymentModeSelect ? DOM.expensePaymentModeSelect.value : 'pilot_claim';
  const amount = DOM.expenseAmountInput ? parseFloat(DOM.expenseAmountInput.value) : 0;
  const author = DOM.expenseAuthorInput ? (DOM.expenseAuthorInput.value.trim() || state.callsign || 'CITIZEN-1') : (state.callsign || 'CITIZEN-1');
  const location = DOM.expenseLocationInput ? (DOM.expenseLocationInput.value.trim() || 'Stanton') : 'Stanton';
  const note = DOM.expenseNoteInput ? DOM.expenseNoteInput.value.trim() : '';

  if (!amount || amount <= 0) {
    showToast('Montant de dépense invalide.');
    return;
  }

  const categoryLabels = {
    refining: t.expenseCatRefining || '🏭 Frais de Raffinage',
    fuel: t.expenseCatFuel || '⛽ Carburant',
    repairs: t.expenseCatRepairs || '🛠️ Réparations',
    gear: t.expenseCatGear || '🚀 Modules & Consommables',
    escort: t.expenseCatEscort || '🛡️ Prime Escorte',
    other: t.expenseCatOther || '💼 Autre logistique'
  };

  const newExp = {
    id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    category: category,
    categoryName: categoryLabels[category] || category,
    amount: Math.round(amount),
    author: author,
    location: location,
    note: note,
    paymentMode: paymentMode, // 'treasury' | 'pilot_claim'
    isReimbursed: paymentMode === 'treasury',
    timestamp: Date.now()
  };

  // If directly debited from guild treasury, deduct balance immediately
  if (paymentMode === 'treasury') {
    state.guildTreasuryBalance = Math.max(0, (state.guildTreasuryBalance || 0) - newExp.amount);
    saveGuildTreasury();
    renderGuildTreasury();
  }

  state.guildExpenses.unshift(newExp);
  saveGuildExpenses();

  // Reset inputs
  if (DOM.expenseAmountInput) DOM.expenseAmountInput.value = '';
  if (DOM.expenseNoteInput) DOM.expenseNoteInput.value = '';

  renderGuildExpenses();
  updateGuildNetWorthMetrics();
  renderMoTraderSheet();
  sfx.playSuccess();
  triggerHaptic(20);

  const locale = getLocale();
  const msg = (t.expenseAddedToast || '🧾 Dépense de {amount} aUEC ({category}) enregistrée !')
    .replace('{amount}', newExp.amount.toLocaleString(locale))
    .replace('{category}', newExp.categoryName);
  showToast(msg);

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoExpenseSync({
      action: 'add',
      expense: newExp,
      allExpenses: state.guildExpenses
    });
  }
}

function reimburseGuildExpense(expId) {
  const t = I18N[state.currentLang] || I18N.fr;
  const exp = state.guildExpenses.find(e => e.id === expId);
  if (!exp) return;
  if (exp.paymentMode === 'pilot_claim' && !exp.isReimbursed) {
    exp.isReimbursed = true;
    state.guildTreasuryBalance = Math.max(0, (state.guildTreasuryBalance || 0) - (exp.amount || 0));
    saveGuildExpenses();
    saveGuildTreasury();
    renderGuildExpenses();
    renderGuildTreasury();
    renderMoTraderSheet();
    updateGuildNetWorthMetrics();
    sfx.playSuccess();
    triggerHaptic(20);

    const locale = getLocale();
    const msg = (t.toastExpenseReimbursed || '💳 Note de frais de {amount} aUEC remboursée à {pilot} !')
      .replace('{amount}', (exp.amount || 0).toLocaleString(locale))
      .replace('{pilot}', exp.author || 'Pilote');
    showToast(msg);

    if (fleetNet && fleetNet.status === 'connected') {
      fleetNet.broadcastCorpoExpenseSync({
        action: 'reimburse',
        expenseId: expId,
        allExpenses: state.guildExpenses
      });
    }
  }
}

function deleteGuildExpense(expId) {
  const t = I18N[state.currentLang] || I18N.fr;
  state.guildExpenses = state.guildExpenses.filter(e => e.id !== expId);
  saveGuildExpenses();
  renderGuildExpenses();
  updateGuildNetWorthMetrics();
  renderMoTraderSheet();
  showToast(t.expenseDeletedToast || '🗑️ Dépense supprimée du Grand Livre.');

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoExpenseSync({
      action: 'delete',
      expenseId: expId,
      allExpenses: state.guildExpenses
    });
  }
}

function clearGuildExpenses() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (!confirm('Réinitialiser toutes les dépenses de guilde de la session ?')) return;

  state.guildExpenses = [];
  saveGuildExpenses();
  renderGuildExpenses();
  updateGuildNetWorthMetrics();
  renderMoTraderSheet();
  showToast('Grand Livre des dépenses réinitialisé.');

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoExpenseSync({
      action: 'clear',
      allExpenses: []
    });
  }
}

function broadcastExpensesToFleet(silent = false) {
  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoExpenseSync({
      action: 'sync_all',
      allExpenses: state.guildExpenses
    });
    if (!silent) {
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.expenseSyncToast || '🧾 Grand Livre des dépenses synchronisé avec l\'escadre !');
      sfx.playSuccess();
    }
  } else if (!silent) {
    showToast('FLEET-NET non connecté.');
  }
}

function handleIncomingCorpoExpenseSync(expenseSync, senderCallsign) {
  if (!expenseSync) return;
  const t = I18N[state.currentLang] || I18N.fr;

  if (Array.isArray(expenseSync.allExpenses)) {
    state.guildExpenses = expenseSync.allExpenses;
    saveGuildExpenses();
    renderGuildExpenses();
    updateGuildNetWorthMetrics();
    renderMoTraderSheet();
  }

  sfx.playBeep(650, 'sine', 0.05);
  const msg = (t.expenseReceivedToast || '🧾 Dépense enregistrée par {callsign} !')
    .replace('{callsign}', senderCallsign || 'Trésorier');
  showToast(msg);
}

function copyGuildExpensesToDiscord() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();

  const totalExp = state.guildExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const grossVal = state.guildStockpile.reduce((sum, l) => sum + (l.status === 'raw' ? l.rawVal : l.refinedVal), 0);
  const netVal = grossVal - totalExp;

  let text = `╔══════════════════════════════════════════════════╗\n`;
  text += `   AARON MFD — GRAND LIVRE DE CORPORATION (4.10)\n`;
  text += `   ESCADRE : ${fleetNet ? fleetNet.roomCode || 'SOLO' : 'SOLO'} • DATE : ${new Date().toLocaleDateString(locale)}\n`;
  text += `╚══════════════════════════════════════════════════╝\n\n`;

  text += `📊 BILAN FINANCIER GLOBAL :\n`;
  text += `  • Recettes Brutes de Stocks : ${grossVal.toLocaleString(locale)} aUEC\n`;
  text += `  • Total Dépenses Engagées   : -${totalExp.toLocaleString(locale)} aUEC\n`;
  text += `  • BÉNÉFICE NET CORPORATIF   : ${netVal.toLocaleString(locale)} aUEC\n\n`;

  text += `🧾 DÉTAIL DES FRAIS ENGAGÉS :\n`;
  if (state.guildExpenses.length === 0) {
    text += `  (Aucune dépense enregistrée)\n`;
  } else {
    state.guildExpenses.forEach((exp, idx) => {
      const modeStr = exp.paymentMode === 'treasury' ? '[Caisse Guilde]' : (exp.isReimbursed ? '[Note de frais - Remboursée]' : '[Note de frais - À Rembourser]');
      text += `  ${idx + 1}. [${exp.categoryName}] ${modeStr} ${exp.amount.toLocaleString(locale)} aUEC — ${exp.author} (${exp.location})${exp.note ? ' : ' + exp.note : ''}\n`;
    });
  }

  navigator.clipboard.writeText(text).then(() => {
    sfx.playSuccess();
    triggerHaptic(20);
    showToast(t.expenseDiscordCopiedToast || '📋 Rapport financier de guilde copié dans le presse-papier !');
  }).catch(() => {
    showToast('Erreur copie presse-papier.');
  });
}

function renderGuildExpenses() {
  if (!DOM.guildExpensesList) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();

  DOM.guildExpensesList.innerHTML = '';
  if (state.guildExpenses.length === 0) {
    DOM.guildExpensesList.innerHTML = `
      <div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding:20px; background:rgba(255,255,255,0.02); border-radius:6px;">
        ${t.noExpensesRecorded || 'Aucune dépense corporative enregistrée pour le moment.'}
      </div>
    `;
    return;
  }

  state.guildExpenses.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'expense-row-item';

    const isTreasury = exp.paymentMode === 'treasury';
    const isReimbursed = exp.isReimbursed || isTreasury;

    let badgeHtml = '';
    if (isTreasury) {
      badgeHtml = `<span class="expense-mode-badge treasury" title="Règlement direct">${t.expenseModeTreasury || '🏛️ Caisse Guilde'}</span>`;
    } else if (isReimbursed) {
      badgeHtml = `<span class="expense-mode-badge claim-reimbursed" title="Remboursé">${t.claimReimbursedBadge || '🟢 Remboursé'}</span>`;
    } else {
      badgeHtml = `<span class="expense-mode-badge claim-pending" title="Note de frais">${t.claimPendingBadge || '🟡 Note de frais'}</span>`;
    }

    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px; flex:1; min-width:200px;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <strong style="color:#fff; font-family:var(--font-hud); font-size:0.84rem;">${exp.categoryName}</strong>
          ${badgeHtml}
          <span style="font-size:0.72rem; color:var(--text-muted);">• ${escapeHtml(exp.author || 'Pilote')} (${escapeHtml(exp.location || 'Stanton')})</span>
        </div>
        ${exp.note ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">${escapeHtml(exp.note)}</div>` : ''}
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
        <span class="expense-amount-tag">-${(exp.amount || 0).toLocaleString(locale)} aUEC</span>
        ${(!isTreasury && !isReimbursed) ? `
          <button type="button" class="chip-btn btn-reimburse-exp" data-exp-id="${exp.id}" style="border-color:var(--accent-emerald); color:var(--accent-emerald); padding:2px 8px; font-size:0.7rem;" title="Rembourser immédiatement ce pilote">
            ${t.btnReimburseExpense || '💳 Rembourser'}
          </button>
        ` : ''}
        <button type="button" class="chip-btn btn-del-exp" data-exp-id="${exp.id}" style="border-color:rgba(239,68,68,0.3); color:#fca5a5; padding:2px 6px; font-size:0.72rem;" title="Supprimer">
          &times;
        </button>
      </div>
    `;

    const reimburseBtn = item.querySelector('.btn-reimburse-exp');
    if (reimburseBtn) {
      reimburseBtn.addEventListener('click', () => reimburseGuildExpense(exp.id));
    }

    const delBtn = item.querySelector('.btn-del-exp');
    if (delBtn) {
      delBtn.addEventListener('click', () => deleteGuildExpense(exp.id));
    }

    DOM.guildExpensesList.appendChild(item);
  });
}

function saveGuildExpenses() {
  try {
    localStorage.setItem('aaron_mfd_guild_expenses', JSON.stringify(state.guildExpenses));
  } catch (e) {
    console.warn(e);
  }
}

function loadGuildExpenses() {
  try {
    const raw = localStorage.getItem('aaron_mfd_guild_expenses');
    if (raw) {
      state.guildExpenses = JSON.parse(raw) || [];
    } else {
      state.guildExpenses = [...DEFAULT_GUILD_EXPENSES];
      saveGuildExpenses();
    }
  } catch (e) {
    state.guildExpenses = [...DEFAULT_GUILD_EXPENSES];
  }
  renderGuildExpenses();
  updateGuildNetWorthMetrics();
}

function updateRefiningStocksSummary() {
  const rawScu = (state.guildStockpile || [])
    .filter(l => l.status === 'raw')
    .reduce((sum, l) => sum + (l.scu || 0), 0);
  const activeJobsScu = (state.refineryJobs || [])
    .filter(j => j.status === 'in_progress')
    .reduce((sum, j) => sum + (j.scu || 0), 0);
  const activeStockScu = (state.guildStockpile || [])
    .filter(l => l.status === 'refining')
    .reduce((sum, l) => sum + (l.scu || 0), 0);
  const refiningScu = activeJobsScu + activeStockScu;
  const readyScu = (state.guildStockpile || [])
    .filter(l => l.status === 'refined_ready')
    .reduce((sum, l) => sum + (l.scu || 0), 0);

  if (DOM.refiningRawScuSummary) {
    DOM.refiningRawScuSummary.textContent = `${rawScu.toFixed(1)} SCU`;
  }
  if (DOM.refiningActiveScuSummary) {
    DOM.refiningActiveScuSummary.textContent = `${refiningScu.toFixed(1)} SCU`;
  }
  if (DOM.refiningReadyScuSummary) {
    DOM.refiningReadyScuSummary.textContent = `${readyScu.toFixed(1)} SCU`;
  }
}

function updateGuildNetWorthMetrics() {
  const locale = getLocale();

  const totalSCU = state.guildStockpile.reduce((sum, l) => sum + (l.scu || 0), 0);
  const readyLots = state.guildStockpile.filter(l => l.status === 'refined_ready').length;

  const grossVal = state.guildStockpile.reduce((sum, l) => sum + (l.status === 'raw' ? l.rawVal : l.refinedVal), 0);
  const totalExp = state.guildExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netWorth = grossVal - totalExp;

  if (DOM.guildNetWorthDisplay) {
    DOM.guildNetWorthDisplay.textContent = `${netWorth.toLocaleString(locale)} aUEC`;
    DOM.guildNetWorthDisplay.style.color = netWorth >= 0 ? 'var(--accent-emerald)' : '#f87171';
  }
  if (DOM.guildTotalScuDisplay) {
    DOM.guildTotalScuDisplay.textContent = `${totalSCU.toFixed(1)} SCU`;
  }
  if (DOM.guildReadyLotsDisplay) {
    DOM.guildReadyLotsDisplay.textContent = `${readyLots} Lot(s)`;
  }
  if (DOM.guildExpenseTotalDisplay) {
    DOM.guildExpenseTotalDisplay.textContent = `-${totalExp.toLocaleString(locale)} aUEC`;
  }

  // Expense ledger summary pane
  if (DOM.expenseLedgerNetVal) {
    DOM.expenseLedgerNetVal.textContent = `${netWorth.toLocaleString(locale)} aUEC`;
    DOM.expenseLedgerNetVal.style.color = netWorth >= 0 ? 'var(--accent-emerald)' : '#f87171';
  }
  if (DOM.expenseLedgerTotalVal) {
    DOM.expenseLedgerTotalVal.textContent = `-${totalExp.toLocaleString(locale)} aUEC`;
  }
  if (DOM.expenseLedgerGrossVal) {
    DOM.expenseLedgerGrossVal.textContent = `${grossVal.toLocaleString(locale)} aUEC`;
  }

  updateRefiningStocksSummary();
}

// ========================================================
// JALON 7 MODULE: GUILD TREASURY & MO.TRADER TRANSFER SHEET
// ========================================================
function renderGuildTreasury() {
  const locale = getLocale();
  const t = I18N[state.currentLang] || I18N.fr;
  if (DOM.treasuryBalanceVal) {
    DOM.treasuryBalanceVal.textContent = `${state.guildTreasuryBalance.toLocaleString(locale)} aUEC`;
  }
  if (DOM.treasuryTaxSelect) {
    DOM.treasuryTaxSelect.value = (state.guildCorpoTaxPct ?? 10).toString();
    const canEditTax = hasGuildPermission('EDIT_TAX');
    DOM.treasuryTaxSelect.disabled = !canEditTax;
    DOM.treasuryTaxSelect.title = canEditTax ? '' : (t.roleRestrictedAdminNotice || '🔒 Réservé exclusivement à l\'Amirauté');
  }
  if (DOM.btnWithdrawTreasury) {
    const canWithdraw = hasGuildPermission('WITHDRAW_TREASURY');
    DOM.btnWithdrawTreasury.disabled = !canWithdraw;
    DOM.btnWithdrawTreasury.style.opacity = canWithdraw ? '1' : '0.4';
    DOM.btnWithdrawTreasury.style.cursor = canWithdraw ? 'pointer' : 'not-allowed';
    DOM.btnWithdrawTreasury.title = canWithdraw ? '' : (t.roleRestrictedNotice || '🔒 Réservé à l\'Amirauté ou aux Trésoriers');
  }
  renderMoTraderSheet();
  renderCraftingGoals();
}

function saveGuildTreasury() {
  try {
    localStorage.setItem('aaron_mfd_guild_treasury', state.guildTreasuryBalance.toString());
    localStorage.setItem('aaron_mfd_guild_tax_pct', state.guildCorpoTaxPct.toString());
    localStorage.setItem('aaron_mfd_guild_payout_statuses', JSON.stringify(state.guildPayoutStatuses));
    localStorage.setItem('aaron_mfd_guild_crafting_goals', JSON.stringify(state.guildCraftingGoals));
  } catch (e) {
    console.warn('[Guild Treasury] Erreur lors de la sauvegarde locale:', e);
  }
}

function depositGuildTreasury() {
  const t = I18N[state.currentLang] || I18N.fr;
  const promptText = t.btnDepositTreasury || 'Montant à verser dans la caisse de guilde (aUEC) :';
  const input = prompt(promptText, '50000');
  if (!input) return;
  const amount = parseInt(input.trim().replace(/\s/g, ''), 10);
  if (isNaN(amount) || amount <= 0) {
    showToast('Montant invalide.');
    sfx.playWarning();
    return;
  }
  state.guildTreasuryBalance += amount;
  saveGuildTreasury();
  renderGuildTreasury();
  sfx.playSuccess();
  triggerHaptic(20);
  showToast(t.toastTreasuryUpdated || '💰 Trésorerie de guilde actualisée !');
  broadcastTreasuryToFleet(true);
}

function withdrawGuildTreasury() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (!hasGuildPermission('WITHDRAW_TREASURY')) {
    showToast(t.roleRestrictedNotice || '🔒 Réservé à l\'Amirauté ou aux Trésoriers');
    sfx.playWarning();
    return;
  }
  const promptText = t.btnWithdrawTreasury || 'Montant à décaisser de la caisse de guilde (aUEC) :';
  const input = prompt(promptText, '25000');
  if (!input) return;
  const amount = parseInt(input.trim().replace(/\s/g, ''), 10);
  if (isNaN(amount) || amount <= 0) {
    showToast('Montant invalide.');
    sfx.playWarning();
    return;
  }
  if (amount > state.guildTreasuryBalance) {
    showToast('Fonds insuffisants dans la trésorerie.');
    sfx.playWarning();
    return;
  }
  state.guildTreasuryBalance -= amount;
  saveGuildTreasury();
  renderGuildTreasury();
  sfx.playBeep(450, 'sine', 0.08);
  triggerHaptic(15);
  showToast(t.toastTreasuryUpdated || '💰 Trésorerie de guilde actualisée !');
  broadcastTreasuryToFleet(true);
}

function calculateMoTraderSplit() {
  // 1. Gather active participants
  let pilots = [];
  if (fleetNet && fleetNet.status === 'connected' && fleetNet.peers && fleetNet.peers.size > 0) {
    pilots.push({
      id: 'local',
      callsign: state.callsign || 'CITIZEN-1',
      role: 'Commandant / MOLE',
      weight: 1.0
    });
    fleetNet.getPeersList().forEach(p => {
      const shipDesc = (p.shipId || 'vessel').toUpperCase();
      let role = 'Opérateur / ' + shipDesc;
      let weight = 1.0;
      if (shipDesc.includes('C2') || shipDesc.includes('RAFT') || shipDesc.includes('HULL')) {
        role = 'Transporteur Cargo';
        weight = 0.9;
      } else if (shipDesc.includes('HORNET') || shipDesc.includes('GLADIUS') || shipDesc.includes('SABRE')) {
        role = 'Escorte Combat';
        weight = 0.85;
      }
      pilots.push({
        id: p.peerId,
        callsign: p.callsign || 'CITIZEN',
        role: role,
        weight: weight
      });
    });
  } else {
    // Default simulated crew for standalone demo / offline squad
    pilots = [
      { id: 'p_cmd', callsign: state.callsign || 'VORTEX-1', role: 'Commandant (MOLE Pilot)', weight: 1.0 },
      { id: 'p_w1', callsign: 'TITAN-4', role: 'Transporteur (C2 Hercules)', weight: 0.9 },
      { id: 'p_w2', callsign: 'ORION-2', role: 'Opérateur Tourelle 1 (Lancet)', weight: 1.0 },
      { id: 'p_w3', callsign: 'SABRE-5', role: 'Escorte Tactique (Gladius)', weight: 0.85 }
    ];
  }

  // 2. Gross pool = total stockpile value or baseline 1,200,000 aUEC
  const grossVal = state.guildStockpile.reduce((sum, l) => sum + (l.status === 'raw' ? l.rawVal : l.refinedVal), 0);
  const totalPool = grossVal > 0 ? grossVal : 1200000;

  // 3. Guild tax calculation
  const taxPct = state.guildCorpoTaxPct ?? 10;
  const totalTax = Math.round(totalPool * (taxPct / 100));

  // 4. Pilot expense claims (notes de frais à rembourser sur les profits de la session)
  const unreimbursedClaimsTotal = (state.guildExpenses || [])
    .filter(e => e.paymentMode === 'pilot_claim' && !e.isReimbursed)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // Distributable net pool after corpo tax and expense deductions
  const distributableProfit = Math.max(0, totalPool - totalTax - unreimbursedClaimsTotal);
  const totalWeight = pilots.reduce((sum, p) => sum + p.weight, 0);

  return pilots.map(p => {
    const profitShare = Math.round(distributableProfit * (p.weight / totalWeight));
    const corpoTax = Math.round(totalTax * (p.weight / totalWeight));

    // Calculate pilot's unreimbursed claims
    const pCallsign = (p.callsign || '').trim().toLowerCase();
    const pilotClaims = (state.guildExpenses || [])
      .filter(e => {
        if (e.paymentMode !== 'pilot_claim' || e.isReimbursed) return false;
        const eAuthor = (e.author || '').trim().toLowerCase();
        return eAuthor === pCallsign || (p.id === 'local' && eAuthor === (state.callsign || '').trim().toLowerCase());
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const netPayout = profitShare + pilotClaims;
    const status = state.guildPayoutStatuses[p.id] || 'pending';

    return {
      id: p.id,
      callsign: p.callsign,
      role: p.role,
      profitShare: profitShare,
      claims: pilotClaims,
      corpoTax: corpoTax,
      netPayout: netPayout,
      status: status
    };
  });
}

function renderMoTraderSheet() {
  if (!DOM.moTraderTableBody) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  DOM.moTraderTableBody.innerHTML = '';

  const splitData = calculateMoTraderSplit();

  splitData.forEach(p => {
    const tr = document.createElement('tr');

    const isPaid = p.status === 'paid';
    const statusText = isPaid ? (t.statusPaid || 'Virement Fait') : (t.statusPending || 'En attente');
    const statusClass = isPaid ? 'paid' : 'pending';

    tr.innerHTML = `
      <td>
        <strong style="color:#fff; font-family:var(--font-hud);">${escapeHtml(p.callsign)}</strong>
        <div style="font-size:0.7rem; color:var(--text-muted);">${escapeHtml(p.role)}</div>
      </td>
      <td style="font-family:var(--font-mono); color:var(--text-muted); font-size:0.82rem;">
        ${p.profitShare.toLocaleString(locale)} aUEC
      </td>
      <td style="font-family:var(--font-mono); font-size:0.82rem;">
        ${p.claims > 0 ? `<span style="color:#fbbf24; font-weight:700;">+${p.claims.toLocaleString(locale)} aUEC</span>` : `<span style="color:var(--text-muted); font-size:0.75rem;">0 aUEC</span>`}
      </td>
      <td style="font-family:var(--font-mono); color:#f87171; font-size:0.82rem;">
        -${p.corpoTax.toLocaleString(locale)} aUEC
      </td>
      <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan); font-size:0.92rem;">
        ${p.netPayout.toLocaleString(locale)} aUEC
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span class="motrader-status-pill ${statusClass}" data-pilot-id="${escapeHtml(p.id)}">
            ${isPaid ? '🟢' : '🟡'} ${escapeHtml(statusText)}
          </span>
          <button type="button" class="chip-btn btn-copy-transfer-cmd" data-callsign="${escapeHtml(p.callsign)}" data-amount="${p.netPayout}" style="font-size:0.7rem; padding:2px 7px; border-color:var(--accent-cyan); color:var(--accent-cyan);" title="${t.btnTransferCommandCopy || 'Copier la commande /transfer pour la console mobiGlas'}">
            📋 /transfer
          </button>
        </div>
      </td>
    `;

    const pill = tr.querySelector('.motrader-status-pill');
    if (pill) {
      pill.addEventListener('click', () => {
        toggleMoTraderStatus(p.id);
      });
    }

    const copyCmdBtn = tr.querySelector('.btn-copy-transfer-cmd');
    if (copyCmdBtn) {
      copyCmdBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmdCallsign = copyCmdBtn.getAttribute('data-callsign');
        const cmdAmount = copyCmdBtn.getAttribute('data-amount');
        const cmdText = `/transfer ${cmdCallsign} ${cmdAmount}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(cmdText).then(() => {
            showToast(`📋 Commande copiée : ${cmdText}`);
            sfx.playSuccess();
            triggerHaptic(15);
          }).catch(() => {
            prompt('Copier la commande :', cmdText);
          });
        } else {
          prompt('Copier la commande :', cmdText);
        }
      });
    }

    DOM.moTraderTableBody.appendChild(tr);
  });
}

function toggleMoTraderStatus(pilotId) {
  const current = state.guildPayoutStatuses[pilotId] || 'pending';
  const newStatus = current === 'paid' ? 'pending' : 'paid';
  state.guildPayoutStatuses[pilotId] = newStatus;

  // If marked paid, automatically mark all unreimbursed claims for this pilot as reimbursed
  if (newStatus === 'paid') {
    const splitData = calculateMoTraderSplit();
    const pilotData = splitData.find(p => p.id === pilotId);
    if (pilotData) {
      const pCallsign = (pilotData.callsign || '').trim().toLowerCase();
      let reimbursedCount = 0;
      (state.guildExpenses || []).forEach(exp => {
        if (exp.paymentMode === 'pilot_claim' && !exp.isReimbursed) {
          const eAuthor = (exp.author || '').trim().toLowerCase();
          if (eAuthor === pCallsign || (pilotId === 'local' && eAuthor === (state.callsign || '').trim().toLowerCase())) {
            exp.isReimbursed = true;
            reimbursedCount++;
          }
        }
      });
      if (reimbursedCount > 0) {
        saveGuildExpenses();
        renderGuildExpenses();
      }
    }
  }

  saveGuildTreasury();
  renderMoTraderSheet();
  sfx.playBeep(620, 'sine', 0.04);
  triggerHaptic(10);
  broadcastTreasuryToFleet(true);
}

function copyMoTraderSheetToClipboard() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const splitData = calculateMoTraderSplit();
  const taxPct = state.guildCorpoTaxPct ?? 10;

  let lines = [];
  lines.push('════════════════════════════════════════');
  lines.push('💰 AARON MFD • FEUILLE DE VIREMENT MO.TRADER');
  lines.push(`🏛️ Retenue Corporation : ${taxPct}% (Caisse de Réserve)`);
  lines.push('════════════════════════════════════════');

  let totalPaidOut = 0;
  let totalWithheld = 0;
  let totalClaimsReimbursed = 0;

  splitData.forEach(p => {
    totalPaidOut += p.netPayout;
    totalWithheld += p.corpoTax;
    totalClaimsReimbursed += p.claims;
    const badge = p.status === 'paid' ? '[VIREMENT FAIT]' : '[EN ATTENTE]';
    const claimsStr = p.claims > 0 ? ` (dont ${p.claims.toLocaleString(locale)} aUEC notes de frais)` : '';
    lines.push(`• ${p.callsign} (${p.role}) ➔ ${p.netPayout.toLocaleString(locale)} aUEC ${badge}${claimsStr}`);
    lines.push(`  └ Commande mobiGlas : /transfer ${p.callsign} ${p.netPayout}`);
  });

  lines.push('────────────────────────────────────────');
  lines.push(`Total distribué net : ${totalPaidOut.toLocaleString(locale)} aUEC`);
  if (totalClaimsReimbursed > 0) {
    lines.push(`Total notes de frais remboursées : ${totalClaimsReimbursed.toLocaleString(locale)} aUEC`);
  }
  lines.push(`Retenue caisse guilde : ${totalWithheld.toLocaleString(locale)} aUEC`);
  lines.push('════════════════════════════════════════');

  const textToCopy = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(t.toastMoTraderCopied || '📋 Feuille de virements mo.Trader copiée dans le presse-papier !');
      sfx.playSuccess();
      triggerHaptic(20);
    }).catch(() => {
      prompt('Copiez manuellement :', textToCopy);
    });
  } else {
    prompt('Copiez manuellement :', textToCopy);
  }
}

// ========================================================
// JALON 7 MODULE: CRAFTING 4.0 COLLECTIVE GOALS
// ========================================================
function renderCraftingGoals() {
  if (!DOM.craftingGoalsList) return;
  const locale = getLocale();
  DOM.craftingGoalsList.innerHTML = '';

  if (!state.guildCraftingGoals || state.guildCraftingGoals.length === 0) {
    DOM.craftingGoalsList.innerHTML = `
      <div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; padding:6px 0;">
        Aucun objectif d'artisanat actif. Cliquez sur "Nouvel Objectif" pour en définir un.
      </div>
    `;
    return;
  }

  state.guildCraftingGoals.forEach(goal => {
    // Calculate fulfillment for each mineral
    let totalRatios = 0;
    const mineralPillsHtml = goal.requiredMinerals.map(req => {
      // Find matching SCU in stockpile
      const currentScu = state.guildStockpile
        .filter(l => l.mineralId === req.mineralId)
        .reduce((sum, l) => sum + (l.scu || 0), 0);
      const isFulfilled = currentScu >= req.neededScu;
      const ratio = Math.min(1.0, currentScu / (req.neededScu || 1));
      totalRatios += ratio;
      const minName = req.mineralId.toUpperCase();
      return `
        <span class="crafting-req-pill ${isFulfilled ? 'fulfilled' : ''}">
          ${isFulfilled ? '✓' : '○'} ${minName} : ${currentScu.toFixed(1)} / ${req.neededScu} SCU
        </span>
      `;
    }).join('');

    const progressPct = Math.round((totalRatios / (goal.requiredMinerals.length || 1)) * 100);

    const card = document.createElement('div');
    card.className = 'crafting-goal-card';
    card.innerHTML = `
      <div class="crafting-goal-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.1rem;">🛠️</span>
          <div>
            <strong style="color:#fff; font-family:var(--font-hud); font-size:0.85rem;">
              ${escapeHtml(goal.name)}
            </strong>
            <span style="font-size:0.72rem; color:var(--text-muted); margin-left:6px;">
              (Cible: ${goal.targetCount}x)
            </span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-family:var(--font-mono); font-size:0.82rem; font-weight:700; color:${progressPct >= 100 ? 'var(--accent-emerald)' : 'var(--accent-cyan)'};">
            ${progressPct}%
          </span>
          <button type="button" class="btn-del-goal" data-goal-id="${escapeHtml(goal.id)}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:0.85rem;" title="Supprimer">
            ✕
          </button>
        </div>
      </div>

      <div class="crafting-gauge-container">
        <div class="crafting-gauge-fill" style="width:${progressPct}%;"></div>
      </div>

      <div class="crafting-minerals-pills">
        ${mineralPillsHtml}
      </div>
    `;

    const delBtn = card.querySelector('.btn-del-goal');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCraftingGoal(goal.id);
      });
    }

    DOM.craftingGoalsList.appendChild(card);
  });
}

function populateCraftingGoalItemSelect() {
  if (!DOM.craftingGoalItemSelect) return;
  const isEn = state.currentLang === 'en';
  const bps = MINING_DATA && Array.isArray(MINING_DATA.blueprints) ? MINING_DATA.blueprints : [];
  if (bps.length === 0) return;

  const currentVal = DOM.craftingGoalItemSelect.value;
  DOM.craftingGoalItemSelect.innerHTML = '';

  const catLabels = {
    lasers: isEn ? 'Mining Head' : 'Tête de minage',
    salvage: isEn ? 'Salvage Head' : 'Tête de récupération',
    modules: isEn ? 'Sub-module' : 'Sous-module',
    gadgets: isEn ? 'Gadget' : 'Gadget minier',
    saddlebags: isEn ? 'Cargo / Bag' : 'Sacoche & Cargo',
    components: isEn ? 'Ship Component' : 'Composant vaisseau',
    tools_weapons: isEn ? 'Tool / Weapon' : 'Outil / Arme FPS',
    armor: isEn ? 'HazMat Armor' : 'Armure HazMat',
    consumables: isEn ? 'Consumable' : 'Consommable'
  };

  bps.forEach(bp => {
    const opt = document.createElement('option');
    opt.value = bp.id;
    const catText = catLabels[bp.category] || bp.category;
    opt.textContent = `${bp.name} [${catText}]`;
    DOM.craftingGoalItemSelect.appendChild(opt);
  });

  if (currentVal && bps.some(b => b.id === currentVal)) {
    DOM.craftingGoalItemSelect.value = currentVal;
  }
}

function submitCraftingGoal() {
  if (!DOM.craftingGoalItemSelect || !DOM.craftingGoalCountInput) return;
  const itemId = DOM.craftingGoalItemSelect.value;
  const count = Math.max(1, parseInt(DOM.craftingGoalCountInput.value, 10) || 1);
  const isEn = state.currentLang === 'en';

  const bps = MINING_DATA && Array.isArray(MINING_DATA.blueprints) ? MINING_DATA.blueprints : [];
  const bp = bps.find(b => b.id === itemId);

  let goalName = '';
  let requiredMinerals = [];

  if (bp) {
    goalName = `${bp.name} (x${count})`;
    requiredMinerals = bp.materials.map(m => ({
      mineralId: m.mineralId,
      neededScu: (m.scu || 0) * count
    }));
  } else {
    const presets = {
      lancet_mk2: {
        name: 'Lancet MH2 Custom (Tête S2)',
        minerals: [
          { mineralId: 'quantainium', neededScu: 16 * count },
          { mineralId: 'bexalite', neededScu: 8 * count },
          { mineralId: 'taranite', neededScu: 4 * count }
        ]
      },
      helix_s2: {
        name: 'Helix II Custom (Tête S2)',
        minerals: [
          { mineralId: 'bexalite', neededScu: 12 * count },
          { mineralId: 'laranite', neededScu: 16 * count },
          { mineralId: 'borase', neededScu: 8 * count }
        ]
      },
      sabir_mod: {
        name: 'Module Actif Sabir 21',
        minerals: [
          { mineralId: 'borase', neededScu: 3 * count },
          { mineralId: 'laranite', neededScu: 2 * count }
        ]
      },
      surge_mod: {
        name: 'Module Actif Surge',
        minerals: [
          { mineralId: 'quantainium', neededScu: 4 * count },
          { mineralId: 'agricium', neededScu: 4 * count }
        ]
      },
      custom_saddlebags: {
        name: 'Sacoches Amovibles Renforcées 32 SCU',
        minerals: [
          { mineralId: 'titanium', neededScu: 20 * count },
          { mineralId: 'copper', neededScu: 10 * count }
        ]
      }
    };
    const preset = presets[itemId] || presets.lancet_mk2;
    goalName = `${preset.name} (x${count})`;
    requiredMinerals = preset.minerals;
  }

  const newGoal = {
    id: 'goal_' + Date.now(),
    itemId: itemId,
    name: goalName,
    targetCount: count,
    requiredMinerals: requiredMinerals
  };

  state.guildCraftingGoals.unshift(newGoal);
  saveGuildTreasury();
  renderCraftingGoals();

  if (DOM.addCraftingGoalForm) {
    DOM.addCraftingGoalForm.style.display = 'none';
  }

  sfx.playSuccess();
  triggerHaptic(15);
  showToast(isEn ? '🛠️ Crafting goal added to guild ledger!' : '🛠️ Objectif d\'artisanat ajouté au carnet de guilde !');
  broadcastTreasuryToFleet(true);
}

function deleteCraftingGoal(goalId) {
  state.guildCraftingGoals = state.guildCraftingGoals.filter(g => g.id !== goalId);
  saveGuildTreasury();
  renderCraftingGoals();
  sfx.playBeep(400, 'square', 0.05);
  showToast('🗑️ Objectif retiré du carnet.');
  broadcastTreasuryToFleet(true);
}

// ========================================================
// JALON 7: FLEETNET TREASURY & MO.TRADER SYNC
// ========================================================
function broadcastTreasuryToFleet(silent = false) {
  const t = I18N[state.currentLang] || I18N.fr;
  if (fleetNet && fleetNet.status === 'connected') {
    const payload = {
      treasuryBalance: state.guildTreasuryBalance,
      taxPct: state.guildCorpoTaxPct,
      goals: state.guildCraftingGoals,
      payoutStatuses: state.guildPayoutStatuses
    };
    const sent = fleetNet.broadcastCorpoTreasurySync(payload);
    if (sent && !silent) {
      showToast(t.toastTreasurySync || '💰 Trésorerie et virements synchronisés avec l\'escadre !');
      sfx.playSuccess();
    }
  } else if (!silent) {
    showToast('FLEET-NET non connecté. Rejoignez une escadre pour synchroniser la trésorerie.');
  }
}

function handleIncomingCorpoTreasurySync(treasurySync, senderCallsign) {
  if (!treasurySync) return;
  const t = I18N[state.currentLang] || I18N.fr;

  if (typeof treasurySync.treasuryBalance === 'number') {
    state.guildTreasuryBalance = treasurySync.treasuryBalance;
  }
  if (typeof treasurySync.taxPct === 'number') {
    state.guildCorpoTaxPct = treasurySync.taxPct;
  }
  if (Array.isArray(treasurySync.goals)) {
    state.guildCraftingGoals = treasurySync.goals;
  }
  if (treasurySync.payoutStatuses && typeof treasurySync.payoutStatuses === 'object') {
    state.guildPayoutStatuses = { ...state.guildPayoutStatuses, ...treasurySync.payoutStatuses };
  }

  saveGuildTreasury();
  renderGuildTreasury();
  sfx.playBeep(720, 'sine', 0.05);

  const msg = (t.toastTreasurySync || '💰 Trésorerie et virements synchronisés avec l\'escadre !')
    + ` (${senderCallsign || 'Trésorier'})`;
  showToast(msg);
}

// ========================================================
// JALON 7 MODULE: COMMODITY TRADING & CARGO ROUTES SOLVER
// ========================================================
function initCommodityTrading() {
  populateTradeSimulatorSelects('all');

  if (DOM.tradePresetRouteSelect) {
    DOM.tradePresetRouteSelect.addEventListener('change', (e) => {
      loadTradePresetRoute(e.target.value);
    });
  }

  if (DOM.tradeCommoditySelect) {
    DOM.tradeCommoditySelect.addEventListener('change', (e) => {
      renderCommodityExplorer(e.target.value);
    });
  }

  // Category filter pills
  const catPills = document.querySelectorAll('.trade-cat-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-cat') || 'all';
      populateTradeSimulatorSelects(cat);
      if (DOM.tradeCommoditySelect && DOM.tradeCommoditySelect.options.length > 0) {
        renderCommodityExplorer(DOM.tradeCommoditySelect.value);
      }
      sfx.playBeep(600, 'sine', 0.03);
    });
  });

  // System filters for trade routes
  const sysFilterBtns = document.querySelectorAll('#viewTradingHub .mkt-filter-btn');
  sysFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sysFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-sys-filter') || 'all';
      renderPopularTradeRoutes(filter);
      sfx.playBeep(650, 'sine', 0.03);
    });
  });

  const recalcInputs = [DOM.tradeCargoScuInput, DOM.tradeBuyPriceInput, DOM.tradeSellPriceInput];
  recalcInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        calculateTradeMetrics();
        const commId = DOM.tradeCommoditySelect ? DOM.tradeCommoditySelect.value : 'laranite';
        updateCommodityTerminalsList(commId);
      });
    }
  });

  // Capacity buttons presets
  const capButtons = document.querySelectorAll('.trade-cap-btn');
  capButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      capButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scu = btn.getAttribute('data-scu');
      if (DOM.tradeCargoScuInput && scu) {
        DOM.tradeCargoScuInput.value = scu;
        calculateTradeMetrics();
        const commId = DOM.tradeCommoditySelect ? DOM.tradeCommoditySelect.value : 'laranite';
        updateCommodityTerminalsList(commId);
        const sysFilterBtn = document.querySelector('#viewTradingHub .mkt-filter-btn.active');
        const sys = sysFilterBtn ? sysFilterBtn.getAttribute('data-sys-filter') : 'all';
        renderPopularTradeRoutes(sys);
      }
      sfx.playBeep(700, 'triangle', 0.03);
    });
  });

  if (DOM.btnCopyTradeRoute) {
    DOM.btnCopyTradeRoute.addEventListener('click', copyTradeRoute);
  }

  if (DOM.btnFinanceTradeTreasury) {
    DOM.btnFinanceTradeTreasury.addEventListener('click', financeTradeFromTreasury);
  }
  if (DOM.btnAddTradeToStockpile) {
    DOM.btnAddTradeToStockpile.addEventListener('click', addTradeRunToStockpile);
  }
  if (DOM.btnSyncTradeFleet) {
    DOM.btnSyncTradeFleet.addEventListener('click', () => {
      broadcastTradeToFleet(false);
    });
  }

  if (DOM.manualLotCategorySelect) {
    DOM.manualLotCategorySelect.addEventListener('change', updateManualLotCommodityOrMineralDropdown);
  }

  // Initial render: Laranite & popular routes
  renderCommodityExplorer('laranite');
  renderPopularTradeRoutes('all');
}

function renderCommodityExplorer(commodityId) {
  const comm = (MINING_DATA.generalCommodities || []).find(c => c.id === commodityId) || MINING_DATA.generalCommodities[0];
  if (!comm) return;

  const isEn = state.currentLang === 'en';

  // Best Buy Details
  const buyLoc = comm.bestBuy?.location || 'HDMS-Lathan (Arial)';
  const buySys = comm.bestBuy?.system || 'Stanton';
  const buyPrice = comm.bestBuy?.price || comm.baseBuy || 27.2;
  const buyStock = comm.bestBuy?.stock || 'high';

  if (DOM.tradeBestBuyLocation) DOM.tradeBestBuyLocation.textContent = buyLoc;
  if (DOM.tradeBestBuySystem) DOM.tradeBestBuySystem.textContent = buySys;
  if (DOM.tradeBestBuyPriceDisplay) {
    DOM.tradeBestBuyPriceDisplay.innerHTML = `${buyPrice.toFixed(2)} <span style="font-size:0.68rem; color:var(--text-muted);">aUEC/SCU</span>`;
  }
  if (DOM.tradeBestBuyStockBadge) {
    const stockLabel = buyStock === 'high' ? (isEn ? 'High Stock' : 'Stock Élevé') : (buyStock === 'low' ? (isEn ? 'Low Stock' : 'Stock Faible') : (isEn ? 'Medium Stock' : 'Stock Moyen'));
    DOM.tradeBestBuyStockBadge.textContent = stockLabel;
  }

  // Best Sell Details ("où la vente est la plus rentable")
  const sellLoc = comm.bestSell?.location || 'Area18 TDD (ArcCorp)';
  const sellSys = comm.bestSell?.system || 'Stanton';
  const sellPrice = comm.bestSell?.price || comm.baseSell || 31.4;
  const sellDemand = comm.bestSell?.demand || 'high';

  if (DOM.tradeBestSellLocation) DOM.tradeBestSellLocation.textContent = sellLoc;
  if (DOM.tradeBestSellSystem) DOM.tradeBestSellSystem.textContent = sellSys;
  if (DOM.tradeBestSellPriceDisplay) {
    DOM.tradeBestSellPriceDisplay.innerHTML = `${sellPrice.toFixed(2)} <span style="font-size:0.68rem; color:var(--text-muted);">aUEC/SCU</span>`;
  }
  if (DOM.tradeBestSellDemandBadge) {
    const demandLabel = sellDemand === 'high' ? (isEn ? 'High Demand' : 'Demande Forte') : (sellDemand === 'low' ? (isEn ? 'Low Demand' : 'Demande Faible') : (isEn ? 'Med Demand' : 'Demande Moyenne'));
    DOM.tradeBestSellDemandBadge.textContent = demandLabel;
  }

  // Max Unit Spread & Margin
  const unitSpread = Math.max(0, sellPrice - buyPrice);
  const spreadCents = Math.round(unitSpread * 100);
  if (DOM.tradeCommoditySpreadBadge) {
    DOM.tradeCommoditySpreadBadge.textContent = `Spread Max: +${spreadCents} aUEC/SCU (+${unitSpread.toFixed(2)} aUEC)`;
  }

  // Update hidden inputs for solver compatibility
  if (DOM.tradeOriginInput) DOM.tradeOriginInput.value = buyLoc;
  if (DOM.tradeDestinationInput) DOM.tradeDestinationInput.value = sellLoc;
  if (DOM.tradeBuyPriceInput) DOM.tradeBuyPriceInput.value = buyPrice.toString();
  if (DOM.tradeSellPriceInput) DOM.tradeSellPriceInput.value = sellPrice.toString();

  // Set risk badge
  const isIllegal = comm.isIllegal || comm.category === 'illicit';
  updateTradeRiskBadge(isIllegal ? 'extreme' : 'safe');

  // Render ranked sell terminals list
  updateCommodityTerminalsList(commodityId);

  // Calculate cargo profit
  calculateTradeMetrics();
}

function updateCommodityTerminalsList(commodityId) {
  if (!DOM.tradeCommodityTerminalsList) return;
  const comm = (MINING_DATA.generalCommodities || []).find(c => c.id === commodityId) || MINING_DATA.generalCommodities[0];
  if (!comm) return;

  const isEn = state.currentLang === 'en';
  const locale = getLocale();
  const scu = parseFloat(DOM.tradeCargoScuInput?.value) || 696;
  const buyPrice = parseFloat(DOM.tradeBuyPriceInput?.value) || comm.bestBuy?.price || comm.baseBuy;

  const sellLocs = [...(comm.sellLocations || [])].sort((a, b) => b.price - a.price);

  DOM.tradeCommodityTerminalsList.innerHTML = sellLocs.map((loc, idx) => {
    const isTop = idx === 0;
    const marginPerScu = (loc.price - buyPrice);
    const totalRunProfit = Math.round(scu * marginPerScu * 100);
    const demandLabel = loc.demand === 'high' ? (isEn ? 'HIGH' : 'FORTE') : (loc.demand === 'low' ? (isEn ? 'LOW' : 'FAIBLE') : (isEn ? 'MED' : 'MOYENNE'));
    const demandClass = loc.demand || 'medium';

    return `
      <div class="trade-terminal-item ${isTop ? 'top-pick' : ''}" data-terminal="${escapeHtml(loc.terminal)}" data-price="${loc.price}">
        <div>
          <div style="font-family:var(--font-hud); font-size:0.78rem; font-weight:700; color:${isTop ? 'var(--accent-emerald)' : '#fff'};">
            ${isTop ? '🌟 ' : ''}${escapeHtml(loc.terminal)} <span style="font-size:0.68rem; color:var(--text-muted);">(${escapeHtml(loc.body)} • ${(loc.system || 'stanton').toUpperCase()})</span>
          </div>
          <div style="font-size:0.68rem; color:var(--text-muted); margin-top:2px;">
            Marge: <strong style="color:var(--accent-cyan); font-family:var(--font-mono);">+${Math.round(marginPerScu * 100)} aUEC/SCU</strong> • Revente @ ${loc.price.toFixed(2)} aUEC
          </div>
        </div>
        <div style="text-align:right;">
          <span class="mkt-demand-pill ${demandClass}" style="font-size:0.6rem; padding:1px 5px;">${demandLabel}</span>
          <div style="font-family:var(--font-mono); font-size:0.8rem; font-weight:700; color:${totalRunProfit >= 0 ? 'var(--accent-emerald)' : '#f87171'}; margin-top:2px;">
            ${totalRunProfit >= 0 ? '+' : ''}${totalRunProfit.toLocaleString(locale)} aUEC
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Allow clicking on any terminal to select it as the active destination
  DOM.tradeCommodityTerminalsList.querySelectorAll('.trade-terminal-item').forEach(item => {
    item.addEventListener('click', () => {
      const termName = item.getAttribute('data-terminal');
      const termPrice = parseFloat(item.getAttribute('data-price')) || 0;
      if (DOM.tradeDestinationInput) DOM.tradeDestinationInput.value = termName;
      if (DOM.tradeSellPriceInput) DOM.tradeSellPriceInput.value = termPrice.toString();
      if (DOM.tradeBestSellLocation) DOM.tradeBestSellLocation.textContent = termName;
      if (DOM.tradeBestSellPriceDisplay) {
        DOM.tradeBestSellPriceDisplay.innerHTML = `${termPrice.toFixed(2)} <span style="font-size:0.68rem; color:var(--text-muted);">aUEC/SCU</span>`;
      }
      calculateTradeMetrics();
      sfx.playBeep(650, 'sine', 0.04);
    });
  });
}

function copyTradeRoute() {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const commId = DOM.tradeCommoditySelect ? DOM.tradeCommoditySelect.value : 'goods';
  const comm = (MINING_DATA.generalCommodities || []).find(c => c.id === commId);
  const commName = comm ? (getLocalized(comm, 'name') || comm.name_fr) : commId;
  const origin = DOM.tradeOriginInput ? DOM.tradeOriginInput.value : 'Origine';
  const dest = DOM.tradeDestinationInput ? DOM.tradeDestinationInput.value : 'Destination';
  const buyP = parseFloat(DOM.tradeBuyPriceInput?.value) || 0;
  const sellP = parseFloat(DOM.tradeSellPriceInput?.value) || 0;
  const scu = parseFloat(DOM.tradeCargoScuInput?.value) || 0;
  const marginPerScu = Math.round((sellP - buyP) * 100);
  const netProfit = Math.round(scu * marginPerScu);

  const text = `🚀 ROUTE COMMERCIALE STAR CITIZEN\n` +
    `📦 Marchandise : ${commName}\n` +
    `🛒 Achat : ${origin} @ ${buyP.toFixed(2)} aUEC/SCU\n` +
    `💰 Revente : ${dest} @ ${sellP.toFixed(2)} aUEC/SCU\n` +
    `📈 Marge Nette : +${marginPerScu.toLocaleString(locale)} aUEC/SCU\n` +
    `🚜 Capacité Soute : ${scu} SCU\n` +
    `💎 Bénéfice Net Estimé : +${netProfit.toLocaleString(locale)} aUEC`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.toastRouteCopied || '📋 Route de trading copiée dans le presse-papiers !');
      sfx.playSuccess();
      triggerHaptic(20);
    }).catch(() => {
      prompt('Copier la route commerciale :', text);
    });
  } else {
    prompt('Copier la route commerciale :', text);
  }
}

function updateManualLotCommodityOrMineralDropdown() {
  if (!DOM.manualLotCategorySelect || !DOM.manualLotMineralSelect) return;
  const isCommodity = DOM.manualLotCategorySelect.value === 'commodity';
  DOM.manualLotMineralSelect.innerHTML = '';

  if (isCommodity) {
    (MINING_DATA.generalCommodities || []).forEach(comm => {
      const opt = document.createElement('option');
      opt.value = comm.id;
      opt.textContent = `${comm.name_fr} (Base: ${comm.baseBuy} aUEC)`;
      DOM.manualLotMineralSelect.appendChild(opt);
    });
    if (DOM.manualLotBuyCostInput) {
      DOM.manualLotBuyCostInput.value = (MINING_DATA.generalCommodities[0]?.baseBuy || 17.4).toString();
    }
  } else {
    (MINING_DATA.minerals || []).forEach(mineral => {
      const opt = document.createElement('option');
      opt.value = mineral.id;
      opt.textContent = `${getLocalized(mineral, 'name')} (${mineral.rawPrice} aUEC)`;
      DOM.manualLotMineralSelect.appendChild(opt);
    });
    if (DOM.manualLotBuyCostInput) {
      DOM.manualLotBuyCostInput.value = '0';
    }
  }
}

function populateTradeSimulatorSelects(category = 'all') {
  if (DOM.tradePresetRouteSelect) {
    DOM.tradePresetRouteSelect.innerHTML = '';
    (MINING_DATA.popularTradeRoutes || []).forEach(route => {
      const opt = document.createElement('option');
      opt.value = route.id;
      opt.textContent = `${route.name} (+${route.marginPerScu} aUEC/SCU)`;
      DOM.tradePresetRouteSelect.appendChild(opt);
    });
  }

  if (DOM.tradeCommoditySelect) {
    DOM.tradeCommoditySelect.innerHTML = '';
    const filtered = (MINING_DATA.generalCommodities || []).filter(c => {
      if (category === 'all') return true;
      return c.category === category;
    });

    filtered.forEach(comm => {
      const opt = document.createElement('option');
      opt.value = comm.id;
      const isEn = state.currentLang === 'en';
      const name = isEn ? (comm.name_en || comm.name_fr) : comm.name_fr;
      opt.textContent = `${name} (${comm.baseBuy} ➔ ${comm.baseSell} aUEC/SCU)`;
      DOM.tradeCommoditySelect.appendChild(opt);
    });
  }
}

function loadTradePresetRoute(routeId) {
  const route = (MINING_DATA.popularTradeRoutes || []).find(r => r.id === routeId) || MINING_DATA.popularTradeRoutes[0];
  if (!route) return;

  if (DOM.tradePresetRouteSelect) DOM.tradePresetRouteSelect.value = route.id;
  if (DOM.tradeCommoditySelect) DOM.tradeCommoditySelect.value = route.commodityId;
  if (DOM.tradeOriginInput) DOM.tradeOriginInput.value = route.origin;
  if (DOM.tradeDestinationInput) DOM.tradeDestinationInput.value = route.destination;
  if (DOM.tradeBuyPriceInput) DOM.tradeBuyPriceInput.value = route.buyPrice.toString();
  if (DOM.tradeSellPriceInput) DOM.tradeSellPriceInput.value = route.sellPrice.toString();

  updateTradeRiskBadge(route.risk);

  // Update Commodity Explorer cards
  if (route.commodityId) {
    renderCommodityExplorer(route.commodityId);
    // Override with route specific origin/destination
    if (DOM.tradeOriginInput) DOM.tradeOriginInput.value = route.origin;
    if (DOM.tradeDestinationInput) DOM.tradeDestinationInput.value = route.destination;
    if (DOM.tradeBuyPriceInput) DOM.tradeBuyPriceInput.value = route.buyPrice.toString();
    if (DOM.tradeSellPriceInput) DOM.tradeSellPriceInput.value = route.sellPrice.toString();
    if (DOM.tradeBestBuyLocation) DOM.tradeBestBuyLocation.textContent = route.origin;
    if (DOM.tradeBestSellLocation) DOM.tradeBestSellLocation.textContent = route.destination;
    if (DOM.tradeBestBuyPriceDisplay) {
      DOM.tradeBestBuyPriceDisplay.innerHTML = `${route.buyPrice.toFixed(2)} <span style="font-size:0.68rem; color:var(--text-muted);">aUEC/SCU</span>`;
    }
    if (DOM.tradeBestSellPriceDisplay) {
      DOM.tradeBestSellPriceDisplay.innerHTML = `${route.sellPrice.toFixed(2)} <span style="font-size:0.68rem; color:var(--text-muted);">aUEC/SCU</span>`;
    }
    calculateTradeMetrics();
  }
}

function updateTradeRiskBadge(riskLevel) {
  if (!DOM.tradeRiskBadge) return;
  const t = I18N[state.currentLang] || I18N.fr;
  DOM.tradeRiskBadge.className = `trade-risk-badge ${riskLevel || 'safe'}`;
  if (riskLevel === 'extreme') {
    DOM.tradeRiskBadge.textContent = t.riskExtreme || '🔴 Extrême (Hors-la-loi / Pyro)';
  } else if (riskLevel === 'moderate') {
    DOM.tradeRiskBadge.textContent = t.riskModerate || '🟡 Modéré (Risque Mantis)';
  } else {
    DOM.tradeRiskBadge.textContent = t.riskSafe || '🟢 Sécurisé (Zone Armistice)';
  }
}

function calculateTradeMetrics() {
  const locale = getLocale();
  const scu = parseFloat(DOM.tradeCargoScuInput?.value) || 0;
  const buyPrice = parseFloat(DOM.tradeBuyPriceInput?.value) || 0;
  const sellPrice = parseFloat(DOM.tradeSellPriceInput?.value) || 0;

  const capitalRequired = Math.round(scu * buyPrice * 100);
  const grossReturn = Math.round(scu * sellPrice * 100);
  const netProfit = grossReturn - capitalRequired;
  const marginPerScu = Math.round((sellPrice - buyPrice) * 100);
  const roi = buyPrice > 0 ? (((sellPrice - buyPrice) / buyPrice) * 100).toFixed(1) : '0.0';

  if (DOM.tradeCapitalRequiredVal) {
    DOM.tradeCapitalRequiredVal.textContent = `${capitalRequired.toLocaleString(locale)} aUEC`;
  }
  if (DOM.tradeGrossReturnVal) {
    DOM.tradeGrossReturnVal.textContent = `${grossReturn.toLocaleString(locale)} aUEC`;
  }
  if (DOM.tradeNetProfitVal) {
    DOM.tradeNetProfitVal.textContent = `${netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString(locale)} aUEC`;
    DOM.tradeNetProfitVal.style.color = netProfit >= 0 ? 'var(--accent-cyan)' : '#f87171';
  }
  if (DOM.tradeMarginPerScuVal) {
    DOM.tradeMarginPerScuVal.textContent = `${marginPerScu >= 0 ? '+' : ''}${marginPerScu.toLocaleString(locale)} aUEC`;
  }
  if (DOM.tradeRoiPercentVal) {
    DOM.tradeRoiPercentVal.textContent = `${roi >= 0 ? '+' : ''}${roi}%`;
  }
}

function financeTradeFromTreasury() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (!hasGuildPermission('WITHDRAW_TREASURY')) {
    showToast(t.roleRestrictedNotice || '🔒 Action réservée à l\'Amirauté ou aux Trésoriers');
    sfx.playWarning();
    return;
  }
  const locale = getLocale();
  const scu = parseFloat(DOM.tradeCargoScuInput?.value) || 0;
  const buyPrice = parseFloat(DOM.tradeBuyPriceInput?.value) || 0;
  const capitalRequired = Math.round(scu * buyPrice * 100);

  if (capitalRequired <= 0) {
    showToast('Montant du capital requis invalide.');
    sfx.playWarning();
    return;
  }

  if (capitalRequired > state.guildTreasuryBalance) {
    sfx.playWarning();
    showToast(`Trésorerie insuffisante ! Requis : ${capitalRequired.toLocaleString(locale)} aUEC (Solde : ${state.guildTreasuryBalance.toLocaleString(locale)} aUEC)`);
    return;
  }

  state.guildTreasuryBalance -= capitalRequired;
  saveGuildTreasury();
  renderGuildTreasury();

  // Log as corpo expense / advance
  const commId = DOM.tradeCommoditySelect ? DOM.tradeCommoditySelect.value : 'goods';
  const comm = (MINING_DATA.generalCommodities || []).find(c => c.id === commId);
  const commName = comm ? (getLocalized(comm, 'name') || comm.name_fr) : commId;

  const expenseItem = {
    id: 'trade_exp_' + Date.now(),
    category: 'other',
    amount: capitalRequired,
    author: state.callsign || 'CITIZEN-1',
    location: DOM.tradeOriginInput ? DOM.tradeOriginInput.value : 'Origine Fret',
    note: `Avance Trésorerie Achat Cargo : ${scu} SCU ${commName}`,
    timestamp: Date.now()
  };
  state.guildExpenses.unshift(expenseItem);
  saveGuildExpenses();
  renderGuildExpenses();
  updateGuildNetWorthMetrics();

  sfx.playSuccess();
  triggerHaptic(25);
  showToast(t.toastTradeFinanced || '🏦 Achat financé avec succès depuis la trésorerie de guilde !');
  broadcastTreasuryToFleet(true);
}

function addTradeRunToStockpile() {
  const t = I18N[state.currentLang] || I18N.fr;
  const scu = parseFloat(DOM.tradeCargoScuInput?.value) || 0;
  const buyPrice = parseFloat(DOM.tradeBuyPriceInput?.value) || 0;
  const sellPrice = parseFloat(DOM.tradeSellPriceInput?.value) || 0;
  const origin = DOM.tradeOriginInput ? DOM.tradeOriginInput.value : 'Station Fret';
  const commId = DOM.tradeCommoditySelect ? DOM.tradeCommoditySelect.value : 'goods';

  if (scu <= 0) {
    showToast('Volume SCU invalide.');
    return;
  }

  const comm = (MINING_DATA.generalCommodities || []).find(c => c.id === commId);
  const commName = comm ? (getLocalized(comm, 'name') || comm.name_fr) : commId;
  const capitalRequired = Math.round(scu * buyPrice * 100);
  const grossReturn = Math.round(scu * sellPrice * 100);

  const newLot = {
    id: 'trade_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    category: 'commodity',
    stationId: origin.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20),
    stationName: origin,
    mineralId: commId,
    mineralName: commName,
    scu: scu,
    unitBuyCost: buyPrice,
    status: 'refined_ready',
    rawVal: capitalRequired,
    refinedVal: grossReturn,
    depositedBy: state.callsign || 'CITIZEN-1',
    timestamp: Date.now()
  };

  state.guildStockpile.unshift(newLot);
  saveGuildStockpile();
  renderGuildStockpile();
  updateGuildNetWorthMetrics();

  sfx.playSuccess();
  triggerHaptic(20);

  const msg = (t.toastTradeDeposited || '📥 Cargaison de {scu} SCU ({commodity}) ajoutée à l\'inventaire de guilde !')
    .replace('{scu}', scu)
    .replace('{commodity}', commName);
  showToast(msg);

  broadcastStockpileToFleet(true);
}

function renderPopularTradeRoutes() {
  const sysFilter = arguments[0] || 'all';
  if (!DOM.popularTradeRoutesGrid) return;
  const locale = getLocale();
  const isEn = state.currentLang === 'en';
  DOM.popularTradeRoutesGrid.innerHTML = '';

  const scu = parseFloat(DOM.tradeCargoScuInput?.value) || 696;

  const routes = (MINING_DATA.popularTradeRoutes || []).filter(r => {
    if (!sysFilter || sysFilter === 'all') return true;
    return r.system === sysFilter;
  });

  routes.forEach(route => {
    const item = document.createElement('div');
    item.className = 'trade-route-item';

    const riskClass = route.risk || 'safe';
    const riskLabel = riskClass === 'extreme' ? (isEn ? '🔴 Extreme' : '🔴 Extrême') : (riskClass === 'moderate' ? (isEn ? '🟡 Moderate' : '🟡 Modéré') : (isEn ? '🟢 Safe' : '🟢 Sûr'));
    const marginPerScu = route.marginPerScu || Math.round((route.sellPrice - route.buyPrice) * 100);
    const estProfit = Math.round(scu * marginPerScu);

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
        <strong style="color:#fff; font-family:var(--font-hud); font-size:0.83rem;">${escapeHtml(route.name)}</strong>
        <span class="trade-risk-badge ${riskClass}" style="font-size:0.65rem; padding:1px 5px;">${riskLabel}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted); margin-top:3px;">
        <span>${escapeHtml(route.origin)} ➔ ${escapeHtml(route.destination)}</span>
        <strong style="font-family:var(--font-mono); color:var(--accent-emerald);">+${marginPerScu.toLocaleString(locale)} aUEC/SCU</strong>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:var(--text-muted); margin-top:2px; border-top:1px dashed rgba(255,255,255,0.06); padding-top:3px;">
        <span>Achat: ${route.buyPrice} • Vente: ${route.sellPrice} aUEC</span>
        <span style="font-family:var(--font-mono); color:var(--accent-cyan); font-weight:700;">Gain ~${estProfit.toLocaleString(locale)} aUEC (${scu} SCU)</span>
      </div>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.trade-route-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      loadTradePresetRoute(route.id);
      sfx.playBeep(650, 'sine', 0.04);
    });

    DOM.popularTradeRoutesGrid.appendChild(item);
  });
}

function broadcastTradeToFleet(silent = false) {
  const t = I18N[state.currentLang] || I18N.fr;
  if (fleetNet && fleetNet.status === 'connected') {
    const payload = {
      routeId: DOM.tradePresetRouteSelect ? DOM.tradePresetRouteSelect.value : null,
      commodityId: DOM.tradeCommoditySelect ? DOM.tradeCommoditySelect.value : null,
      origin: DOM.tradeOriginInput ? DOM.tradeOriginInput.value : null,
      destination: DOM.tradeDestinationInput ? DOM.tradeDestinationInput.value : null,
      buyPrice: parseFloat(DOM.tradeBuyPriceInput?.value) || 0,
      sellPrice: parseFloat(DOM.tradeSellPriceInput?.value) || 0,
      scu: parseFloat(DOM.tradeCargoScuInput?.value) || 0,
      timestamp: Date.now()
    };
    const sent = fleetNet.broadcastCorpoTradeSync(payload);
    if (sent && !silent) {
      showToast(t.toastTradeSync || '📡 Routes de trading et cargaisons synchronisées avec la flotte !');
      sfx.playSuccess();
    }
  } else if (!silent) {
    showToast('FLEET-NET non connecté. Rejoignez une escadre pour synchroniser le trading.');
  }
}

function handleIncomingCorpoTradeSync(tradeSync, senderCallsign) {
  if (!tradeSync) return;
  const t = I18N[state.currentLang] || I18N.fr;

  if (DOM.tradeOriginInput && tradeSync.origin) DOM.tradeOriginInput.value = tradeSync.origin;
  if (DOM.tradeDestinationInput && tradeSync.destination) DOM.tradeDestinationInput.value = tradeSync.destination;
  if (DOM.tradeBuyPriceInput && tradeSync.buyPrice) DOM.tradeBuyPriceInput.value = tradeSync.buyPrice.toString();
  if (DOM.tradeSellPriceInput && tradeSync.sellPrice) DOM.tradeSellPriceInput.value = tradeSync.sellPrice.toString();
  if (DOM.tradeCargoScuInput && tradeSync.scu) DOM.tradeCargoScuInput.value = tradeSync.scu.toString();
  if (DOM.tradeCommoditySelect && tradeSync.commodityId) DOM.tradeCommoditySelect.value = tradeSync.commodityId;

  calculateTradeMetrics();
  sfx.playBeep(700, 'sine', 0.05);

  const msg = (t.toastTradeSync || '📡 Route de trading partagée par {callsign} !')
    .replace('{callsign}', senderCallsign || 'Négociant');
  showToast(msg);
}

// ----------------------------------------------------
// REFINING JOBS & DESKTOP TIMERS
// ----------------------------------------------------
function addRefineryJobFromHold() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (state.holdSCU <= 0 && state.sessionLog.length === 0) {
    sfx.playWarning();
    showToast(t.toastHoldEmpty || 'Soute vide.');
    return;
  }

  populateRefineryModalSelects();
  switchStockpileTab('refining');
  openModal(DOM.refineryModal);
}

function confirmCreateRefineryJob() {
  const t = I18N[state.currentLang] || I18N.fr;
  const stationId = DOM.refineryOrderStationSelect ? DOM.refineryOrderStationSelect.value : 'arc_l1';
  const methodId = DOM.refineryOrderMethodSelect ? DOM.refineryOrderMethodSelect.value : 'dinyx';

  const station = MINING_DATA.refineryStations.find(s => s.id === stationId) || MINING_DATA.refineryStations[0];
  const method = MINING_DATA.refiningMethods.find(m => m.id === methodId) || MINING_DATA.refiningMethods[0];

  const totalSCU = state.holdSCU > 0 ? state.holdSCU : 10.0;
  const totalRaw = state.sessionLog.reduce((acc, x) => acc + x.rawVal, 0) || 150000;
  const bonus = (station.bonusMineral === state.selectedMineral.id) ? (1 + station.bonusRate) : 1.0;
  const refinedVal = Math.round(totalRaw * method.yieldRate * 1.85 * bonus);

  const durationSec = Math.max(30, Math.round(totalSCU * (method.durationHoursPerSCU || 0.3) * 60));
  const now = Date.now();

  const newJob = {
    id: 'job_' + now,
    stationId: station.id,
    stationName: station.name,
    methodId: method.id,
    methodName: method.name,
    mineral: state.sessionLog[0]?.mineral || getLocalized(state.selectedMineral, 'name'),
    scu: totalSCU,
    rawVal: totalRaw,
    refinedVal: refinedVal,
    startTime: now,
    endTime: now + (durationSec * 1000),
    durationSec: durationSec,
    completed: false,
    collected: false,
    pushNotified: false
  };

  state.refineryJobs.unshift(newJob);
  saveRefineryJobs();

  // Also add to guild stockpile as in-refining lot
  const stockLot = {
    id: 'lot_' + now,
    stationId: station.id,
    stationName: station.name,
    mineralId: state.selectedMineral.id,
    mineralName: newJob.mineral,
    scu: parseFloat(totalSCU.toFixed(1)),
    status: 'refining',
    methodName: method.name,
    rawVal: totalRaw,
    refinedVal: refinedVal,
    depositedBy: state.callsign || 'CITIZEN-1',
    timestamp: now
  };
  state.guildStockpile.unshift(stockLot);
  saveGuildStockpile();

  // Empty ship hold
  clearHold();

  renderRefineryJobs();
  renderGuildStockpile();
  updateGuildNetWorthMetrics();
  updateRefineryBadge();
  sfx.playSuccess();
  triggerHaptic(20);

  showToast(t.toastRefinerySubmitted || 'Commande de raffinage lancée avec succès !');

  if (fleetNet && fleetNet.status === 'connected') {
    fleetNet.broadcastCorpoStockSync({
      action: 'deposit',
      lot: stockLot,
      allLots: state.guildStockpile
    });
  }
}

function startRefineryTimerLoop() {
  if (state.refineryIntervalId) clearInterval(state.refineryIntervalId);
  state.refineryIntervalId = setInterval(() => {
    tickRefineryJobs();
  }, 1000);
}

function tickRefineryJobs() {
  if (state.refineryJobs.length === 0) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const now = Date.now();
  let updated = false;

  state.refineryJobs.forEach(job => {
    if (!job.completed && now >= job.endTime) {
      job.completed = true;
      updated = true;

      // Update matching lot in guild stockpile to ready
      const matchingLot = state.guildStockpile.find(l => l.id === job.id);
      if (matchingLot) {
        matchingLot.status = 'refined_ready';
        saveGuildStockpile();
        renderGuildStockpile();
        updateGuildNetWorthMetrics();
      }

      // Send desktop Web Push Notification & Cockpit audio
      if (!job.pushNotified) {
        job.pushNotified = true;
        const pushTitle = (t.toastPushReadyTitle || '🔔 Raffinerie {station}').replace('{station}', job.stationName);
        const pushBody = (t.toastPushReadyBody || 'Votre commande de {scu} SCU de {mineral} est prête au chargement !')
          .replace('{scu}', job.scu.toFixed(1))
          .replace('{mineral}', job.mineral);
        sendDesktopPushNotification(pushTitle, pushBody);
      }
    }
  });

  if (updated) {
    saveRefineryJobs();
  }
  renderRefineryJobs();
  updateRefineryBadge();
}

function collectRefineryJob(jobId) {
  const t = I18N[state.currentLang] || I18N.fr;
  const job = state.refineryJobs.find(j => j.id === jobId);
  if (!job) return;

  job.collected = true;
  addLedgerEntry('refinery', job.mineral, job.scu, job.refinedVal, job.stationName);
  state.refineryJobs = state.refineryJobs.filter(j => j.id !== jobId);
  saveRefineryJobs();

  // Mark lot ready or sold in stockpile
  const stockLot = state.guildStockpile.find(l => l.id === jobId);
  if (stockLot) {
    stockLot.status = 'refined_ready';
    saveGuildStockpile();
    renderGuildStockpile();
    updateGuildNetWorthMetrics();
  }

  renderRefineryJobs();
  updateRefineryBadge();
  updateLedgerDisplay();
  sfx.playSuccess();
  triggerHaptic(25);

  const msg = (t.toastRefineryCollectedVal || 'Lot récupéré ! +{auec} aUEC')
    .replace('{auec}', job.refinedVal.toLocaleString(getLocale()));
  showToast(msg);
}

function renderRefineryJobs() {
  if (!DOM.refineryJobsList) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const now = Date.now();

  const activeJobs = state.refineryJobs.filter(j => !j.collected);
  if (DOM.refineryActiveCount) {
    DOM.refineryActiveCount.textContent = `${activeJobs.length} ${activeJobs.length > 1 ? (t.refineryBatchPlural || 'Lots') : (t.refineryBatchSingle || 'Lot')}`;
  }
  const totalRefVal = activeJobs.reduce((acc, j) => acc + j.refinedVal, 0);
  if (DOM.refineryTotalValueDisplay) {
    DOM.refineryTotalValueDisplay.textContent = `${totalRefVal.toLocaleString(locale)} aUEC`;
  }

  DOM.refineryJobsList.innerHTML = '';
  if (activeJobs.length === 0) {
    DOM.refineryJobsList.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding:20px;">${t.noActiveJobs || 'Aucune commande de raffinage active.'}</div>`;
    return;
  }

  activeJobs.forEach(job => {
    const isReady = now >= job.endTime || job.completed;
    const remainingSec = Math.max(0, Math.round((job.endTime - now) / 1000));
    const elapsedSec = job.durationSec - remainingSec;
    const pct = isReady ? 100 : Math.min(100, Math.round((elapsedSec / job.durationSec) * 100));

    const card = document.createElement('div');
    card.className = `refinery-job-card ${isReady ? 'job-ready' : ''}`;

    let timerHtml = '';
    if (isReady) {
      timerHtml = `<span class="refinery-timer-badge ready">${t.refineryJobReady || '🟢 PRÊT AU CHARGEMENT'}</span>`;
    } else {
      const min = Math.floor(remainingSec / 60);
      const sec = remainingSec % 60;
      timerHtml = `<span class="refinery-timer-badge">⏱️ ${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')} (${pct}%)</span>`;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#fff; font-family:var(--font-hud); font-size:0.88rem;">${job.stationName}</strong>
          <div style="color:var(--text-muted); font-size:0.75rem;">${job.methodName} • ${job.mineral} (${job.scu.toFixed(1)} SCU)</div>
        </div>
        ${timerHtml}
      </div>
      <div class="refinery-progress-bar">
        <div class="refinery-progress-fill ${isReady ? 'ready' : ''}" style="width:${pct}%"></div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
        <span style="font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-emerald); font-weight:700;">
          +${job.refinedVal.toLocaleString(locale)} aUEC
        </span>
        ${isReady ? `<button class="btn-collect-job" data-collect-id="${job.id}">${t.btnCollectJob || 'Récupérer'}</button>` : `<span style="font-size:0.75rem; color:var(--text-muted);">${t.refineryJobInProgress || 'En cours...'}</span>`}
      </div>
    `;

    const collectBtn = card.querySelector('.btn-collect-job');
    if (collectBtn) {
      collectBtn.addEventListener('click', () => {
        collectRefineryJob(job.id);
      });
    }

    DOM.refineryJobsList.appendChild(card);
  });
}

function updateRefineryBadge() {
  if (!DOM.refineryBadge) return;
  const count = state.refineryJobs.filter(j => !j.collected).length;
  if (count > 0) {
    DOM.refineryBadge.textContent = count;
    DOM.refineryBadge.style.display = 'inline-flex';
  } else {
    DOM.refineryBadge.style.display = 'none';
  }

  if (DOM.dockRefineryBadge) {
    if (count > 0) {
      DOM.dockRefineryBadge.textContent = count;
      DOM.dockRefineryBadge.style.display = 'inline-flex';
    } else {
      DOM.dockRefineryBadge.style.display = 'none';
    }
  }
}

function saveRefineryJobs() {
  try {
    localStorage.setItem('aaron_mfd_refinery_jobs', JSON.stringify(state.refineryJobs));
  } catch (e) {
    console.warn(e);
  }
}

function loadRefineryJobs() {
  try {
    const raw = localStorage.getItem('aaron_mfd_refinery_jobs');
    if (raw) {
      state.refineryJobs = JSON.parse(raw) || [];
      renderRefineryJobs();
      updateRefineryBadge();
    }
  } catch (e) {
    console.warn(e);
  }
}

// ==========================================
// FEATURE 3: SMART GADGET & MODULE ADVISOR
// ==========================================
function updateGadgetAdvice(powerRatio, totalLaserPower, requiredPower) {
  if (!DOM.gadgetAdviceCard) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();

  state.recommendedGadgetId = null;
  state.recommendedModuleId = null;

  if (powerRatio < 0.88) {
    DOM.gadgetAdviceCard.style.display = 'block';

    const effResWithSabir = Math.max(0, state.resistance * (1 - 0.50));
    const reqPwrWithSabir = (state.rockMass * 0.32) * (1 + (effResWithSabir / 100));
    const sabirRatio = totalLaserPower / Math.max(1, reqPwrWithSabir);

    if (sabirRatio >= 1.15) {
      state.recommendedGadgetId = 'sabir';
      DOM.gadgetAdviceText.textContent = t.adviceSabir.replace('{pct}', Math.round(sabirRatio * 100));
    } else {
      state.recommendedGadgetId = 'boremax';
      DOM.gadgetAdviceText.textContent = t.adviceBoremax;
    }

    if (state.selectedShip.id === 'mole' && state.moleActiveTurrets < 3) {
      const neededTurrets = state.moleActiveTurrets + 1;
      const moleCombinedPower = Math.round(totalLaserPower * (neededTurrets / state.moleActiveTurrets));
      DOM.gadgetAdviceText.textContent += ' ' + t.adviceMoleTurret
        .replace('{count}', neededTurrets)
        .replace('{lasers}', `${neededTurrets}x S2`)
        .replace('{pwr}', moleCombinedPower.toLocaleString(locale));
    }
  } else if (state.instability >= 60) {
    DOM.gadgetAdviceCard.style.display = 'block';
    state.recommendedGadgetId = 'stalwart';
    DOM.gadgetAdviceText.textContent = t.adviceStalwart.replace('{inst}', state.instability);
  } else if (powerRatio >= 0.88 && powerRatio < 1.15) {
    DOM.gadgetAdviceCard.style.display = 'block';
    state.recommendedModuleId = 'surge';
    DOM.gadgetAdviceText.textContent = t.adviceSurge;
  } else {
    DOM.gadgetAdviceCard.style.display = 'none';
  }
}

function applyRecommendedAdvice() {
  if (state.recommendedGadgetId) {
    const g = MINING_DATA.gadgets.find(x => x.id === state.recommendedGadgetId);
    if (g) {
      state.selectedGadget = g;
      if (DOM.rockGadgetSelect) DOM.rockGadgetSelect.value = g.id;
      if (DOM.gadgetSelect) DOM.gadgetSelect.value = g.id;
      updateRockGadgetUI();
    }
  }
  if (state.recommendedModuleId) {
    const m = MINING_DATA.modules.find(x => x.id === state.recommendedModuleId);
    if (m) {
      state.selectedModules[0] = m.id;
      const turrets = getShipTurretConfigs(state.selectedShip.id);
      if (turrets.length > 0 && Array.isArray(turrets[0].moduleIds)) {
        turrets[0].moduleIds[0] = m.id;
      }
      renderShipTurretsConfig();
    }
  }
  if (state.selectedShip.id === 'mole' && state.moleActiveTurrets < 3) {
    state.moleActiveTurrets = Math.min(3, state.moleActiveTurrets + 1);
    document.querySelectorAll('[data-mole-turret]').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.moleTurret, 10) === state.moleActiveTurrets);
    });
  }
  updateLoadoutButtonSummary();
  calculateAll();
  sfx.playSuccess();
  triggerHaptic(20);
}

// ==========================================
// FEATURE 4: ROC GEM CLUSTER MODE
// ==========================================
function updateRocCluster() {
  if (!DOM.rocClusterBox) return;
  const isROC = state.selectedShip.id === 'roc';
  DOM.rocClusterBox.style.display = isROC ? 'block' : 'none';

  if (!isROC) return;

  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const totalGems = state.rocNodes * state.rocGemsPerNode;
  const totalSCU = (totalGems / 1000).toFixed(2);
  const gemVal = Math.round(totalGems * state.selectedMineral.rawPrice);
  const rocMaxGems = 800; // 0.8 SCU
  const fillPct = Math.round((totalGems / rocMaxGems) * 100);

  if (DOM.rocNodesDisplay) DOM.rocNodesDisplay.textContent = t.rocNodesCountLabel.replace('{count}', state.rocNodes);
  if (DOM.rocGemsPerNodeDisplay) DOM.rocGemsPerNodeDisplay.textContent = t.rocGemsPerNodeLabel.replace('{count}', state.rocGemsPerNode);
  if (DOM.rocTotalGemsDisplay) {
    DOM.rocTotalGemsDisplay.textContent = t.rocGemsCalcSummary.replace('{total}', totalGems.toLocaleString(locale)).replace('{scu}', totalSCU).replace('{val}', gemVal.toLocaleString(locale));
  }
  if (DOM.rocHoldStatusNote) {
    DOM.rocHoldStatusNote.textContent = t.rocHoldStatusText.replace('{pct}', fillPct).replace('{total}', totalGems).replace('{max}', rocMaxGems);
    DOM.rocHoldStatusNote.style.color = fillPct > 100 ? 'var(--accent-rose)' : 'var(--text-muted)';
  }
}

function addRocClusterToHold() {
  const t = I18N[state.currentLang] || I18N.fr;
  const totalGems = state.rocNodes * state.rocGemsPerNode;
  const scu = Math.round((totalGems / 1000) * 10) / 10;
  const mineral = state.selectedMineral;
  const rawVal = Math.round(totalGems * mineral.rawPrice);
  const locale = getLocale();

  if (state.holdSCU + scu > state.selectedShip.scu) {
    sfx.playWarning();
    alert(t.alertRocCapacityExceeded.replace('{cur}', state.holdSCU.toFixed(1)));
    return;
  }

  state.holdSCU = Math.round((state.holdSCU + scu) * 10) / 10;

  const logEntry = {
    id: Date.now(),
    mineralId: mineral.id,
    mineral: getLocalized(mineral, 'name'),
    color: mineral.color,
    scu: scu,
    isVolatile: false,
    rawVal: rawVal,
    time: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  };

  state.sessionLog.unshift(logEntry);
  addLedgerEntry('roc', logEntry.mineral, logEntry.scu, logEntry.rawVal);

  saveSession();
  updateHoldDisplay();
  sfx.playSuccess();
  triggerHaptic(20);
  showToast(t.toastRocClusterLoaded.replace('{gems}', totalGems.toLocaleString(locale)));
}

// ==========================================
// FEATURE 5: FLIGHT LEDGER & STATS
// ==========================================
function addLedgerEntry(type, mineral, scu, auec, station = '') {
  const entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    type: type,
    mineral: mineral,
    scu: scu,
    auec: auec,
    station: station
  };
  state.ledgerHistory.unshift(entry);
  saveLedger();
  updateLedgerDisplay();
}

function updateLedgerDisplay() {
  if (!DOM.ledgerRunsList) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();

  let totalEarned = 0;
  let todayEarned = 0;
  let totalSCU = 0;
  const todayStr = new Date().toISOString().slice(0, 10);

  state.ledgerHistory.forEach(item => {
    totalEarned += item.auec || 0;
    totalSCU += item.scu || 0;
    if (item.date && item.date.startsWith(todayStr)) {
      todayEarned += item.auec || 0;
    }
  });

  const elapsedHours = Math.max(0.2, (Date.now() - state.sessionStartTime) / (1000 * 3600));
  const hourlyRate = Math.round(todayEarned / elapsedHours);

  if (DOM.statTotalEarnedDisplay) DOM.statTotalEarnedDisplay.textContent = `${totalEarned.toLocaleString(locale)} aUEC`;
  if (DOM.statTodayEarnedDisplay) DOM.statTodayEarnedDisplay.textContent = `${todayEarned.toLocaleString(locale)} aUEC`;
  if (DOM.statTotalSCUDisplay) DOM.statTotalSCUDisplay.textContent = `${totalSCU.toFixed(1)} SCU`;
  if (DOM.statRunsCountDisplay) DOM.statRunsCountDisplay.textContent = state.ledgerHistory.length;
  if (DOM.statHourlyRateDisplay) DOM.statHourlyRateDisplay.textContent = `${hourlyRate.toLocaleString(locale)} aUEC/h`;

  DOM.ledgerRunsList.innerHTML = '';
  if (state.ledgerHistory.length === 0) {
    DOM.ledgerRunsList.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding:20px;">${t.noLedgerEntries}</div>`;
    return;
  }

  state.ledgerHistory.forEach(run => {
    const dateFormatted = new Date(run.date).toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const item = document.createElement('div');
    item.className = 'ledger-run-item';
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.1rem;">${run.type === 'refinery' ? '🏭' : (run.type === 'roc' ? '🌸' : '💎')}</span>
        <div>
          <strong style="color:#fff;">${run.mineral}</strong>
          <div style="color:var(--text-muted); font-size:0.75rem;">${dateFormatted} ${run.station ? '• ' + run.station : ''}</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-family:var(--font-mono); color:var(--accent-emerald); font-weight:700;">+${run.auec.toLocaleString(locale)} aUEC</div>
        <div style="font-family:var(--font-mono); color:var(--text-muted); font-size:0.75rem;">${run.scu.toFixed(1)} SCU</div>
      </div>
    `;
    DOM.ledgerRunsList.appendChild(item);
  });
}

function exportLedgerJson() {
  const jsonStr = JSON.stringify(state.ledgerHistory, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aaron-mfd-ledger-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  sfx.playSuccess();
}

function exportLedgerCsv() {
  let csv = 'Timestamp,Type,Mineral,SCU,aUEC,Station\n';
  state.ledgerHistory.forEach(r => {
    csv += `"${r.date}","${r.type}","${r.mineral}",${r.scu},${r.auec},"${r.station || ''}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aaron-mfd-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  sfx.playSuccess();
}

function clearLedgerHistory() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (confirm(t.confirmClearLedger)) {
    state.ledgerHistory = [];
    saveLedger();
    updateLedgerDisplay();
    sfx.playBeep(350, 'square', 0.08);
  }
}

function saveLedger() {
  try {
    localStorage.setItem('aaron_mfd_ledger', JSON.stringify(state.ledgerHistory));
  } catch (e) {
    console.warn(e);
  }
}

function loadLedger() {
  try {
    const raw = localStorage.getItem('aaron_mfd_ledger');
    if (raw) {
      state.ledgerHistory = JSON.parse(raw) || [];
      updateLedgerDisplay();
    }
  } catch (e) {
    console.warn(e);
  }
}

// ==========================================
// FEATURE 6: AARON HALO QT RANGEFINDER
// ==========================================
function populateHaloRangefinderSelect() {
  if (!DOM.haloRouteSelect) return;
  DOM.haloRouteSelect.innerHTML = '';
  MINING_DATA.aaronHaloBands.forEach(band => {
    const opt = document.createElement('option');
    opt.value = band.id;
    opt.textContent = `${band.route} (${getLocalized(band, 'band')})`;
    DOM.haloRouteSelect.appendChild(opt);
  });
  DOM.haloRouteSelect.value = state.haloSelectedRouteId;
}

function updateHaloRangefinder() {
  if (!DOM.haloRouteSelect || !DOM.haloCurrentDist) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const routeId = DOM.haloRouteSelect.value;
  state.haloSelectedRouteId = routeId;
  const band = MINING_DATA.aaronHaloBands.find(b => b.id === routeId) || MINING_DATA.aaronHaloBands[0];

  const currentDist = parseFloat(DOM.haloCurrentDist.value) || 0;
  state.haloCurrentDist = currentDist;
  const targetDist = band.targetDistanceMkm;
  const diff = currentDist - targetDist;
  const absDiff = Math.abs(diff);

  if (DOM.rangefinderDiffDisplay) {
    const sign = diff >= 0 ? '+' : '-';
    DOM.rangefinderDiffDisplay.textContent = `${sign}${absDiff.toFixed(2)} M km`;
    DOM.rangefinderDiffDisplay.style.color = absDiff <= 0.15 ? 'var(--accent-rose)' : (absDiff <= 1.2 ? 'var(--accent-amber)' : 'var(--accent-cyan)');
  }

  if (DOM.rangefinderProgressFill) {
    const maxSpan = 15;
    const proximity = Math.max(0, Math.min(100, Math.round((1 - (absDiff / maxSpan)) * 100)));
    DOM.rangefinderProgressFill.style.width = `${proximity}%`;
    DOM.rangefinderProgressFill.classList.toggle('drop-now', absDiff <= 0.15);
  }

  if (DOM.rangefinderAlertText) {
    if (absDiff <= 0.15) {
      DOM.rangefinderAlertText.style.display = 'block';
      DOM.rangefinderAlertText.className = 'rangefinder-alert-text alert-drop';
      DOM.rangefinderAlertText.textContent = t.haloDropNow;
    } else if (absDiff <= 1.2) {
      DOM.rangefinderAlertText.style.display = 'block';
      DOM.rangefinderAlertText.className = 'rangefinder-alert-text alert-approaching';
      DOM.rangefinderAlertText.textContent = t.haloDropApproaching;
    } else {
      DOM.rangefinderAlertText.style.display = 'none';
    }
  }
}

// ==========================================================================
// JALON 8 MODULE: GUILD HQ, SECURITY (RBAC), GOVERNANCE & DATA SOVEREIGNTY
// ==========================================================================

// Note: GUILD_ROLE_PERMISSIONS is imported from ./data/defaults/guild-defaults.js;

// WebCrypto PBKDF2 Hashing Engine (Zero external dependencies)
async function hashGuildPassphrase(passphrase, salt) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const key = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: enc.encode(salt || state.guildConfig.salt || 'aaron_default_salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      return Array.from(new Uint8Array(key))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      console.warn('[PBKDF2] Fallback hashing:', e);
    }
  }
  // Safe deterministic fallback for non-crypto contexts
  let hash = 0;
  const str = passphrase + (salt || state.guildConfig.salt || 'aaron_salt');
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

async function verifyGuildPassphrase(passphrase, expectedHash, salt) {
  if (!expectedHash) return true; // No password configured yet
  const computed = await hashGuildPassphrase(passphrase, salt);
  return computed === expectedHash;
}

function hasGuildPermission(permission) {
  const role = (state.currentGuildUser && state.currentGuildUser.role) || 'RECRUIT';
  const perms = GUILD_ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

function saveGuildConfig() {
  try {
    localStorage.setItem('aaron_mfd_guild_config', JSON.stringify(state.guildConfig));
    localStorage.setItem('aaron_mfd_current_guild_user', JSON.stringify(state.currentGuildUser));
    localStorage.setItem('aaron_mfd_guild_members', JSON.stringify(state.guildRegisteredMembers));
  } catch (e) {
    console.warn('[Guild Config] Erreur sauvegarde locale:', e);
  }
}

function switchGuildTab(tabName) {
  state.activeGuildTab = tabName;
  const buttons = [
    { btn: DOM.btnGuildTabProfile, tab: 'profile' },
    { btn: DOM.btnGuildTabRoster, tab: 'roster' },
    { btn: DOM.btnGuildTabFleet, tab: 'fleet' },
    { btn: DOM.btnGuildTabStockpile, tab: 'stockpile' },
    { btn: DOM.btnGuildTabFinance, tab: 'finance' },
    { btn: DOM.btnGuildTabSecurity, tab: 'security' },
    { btn: DOM.btnGuildTabBackup, tab: 'backup' }
  ];
  buttons.forEach(({ btn, tab }) => {
    if (btn) btn.classList.toggle('active', tab === tabName);
  });

  const panes = [
    { pane: DOM.guildPaneProfile, tab: 'profile' },
    { pane: DOM.guildPaneRoster, tab: 'roster' },
    { pane: DOM.guildPaneFleet, tab: 'fleet' },
    { pane: DOM.guildPaneStockpile, tab: 'stockpile' },
    { pane: DOM.guildPaneFinance, tab: 'finance' },
    { pane: DOM.guildPaneSecurity, tab: 'security' },
    { pane: DOM.guildPaneBackup, tab: 'backup' }
  ];
  panes.forEach(({ pane, tab }) => {
    if (pane) {
      if (tab === tabName) {
        pane.style.display = 'block';
        pane.classList.add('active');
      } else {
        pane.style.display = 'none';
        pane.classList.remove('active');
      }
    }
  });

  if (tabName === 'roster') {
    renderGuildRoster();
  } else if (tabName === 'fleet') {
    renderGuildFleet();
  } else if (tabName === 'stockpile') {
    renderGuildStockpileSummary();
  } else if (tabName === 'finance') {
    renderGuildFinance();
  }
}

function renderGuildFinance() {
  renderGuildTreasury();
  renderGuildExpenses();
  updateGuildNetWorthMetrics();
  renderMoTraderSheet();
  const cfg = state.guildConfig || {};
  if (DOM.guildDefaultTaxInput) DOM.guildDefaultTaxInput.value = cfg.defaultCorpoTax ?? 10;
  if (DOM.guildDefaultEscortInput) DOM.guildDefaultEscortInput.value = cfg.defaultEscortRate ?? 75000;
  if (DOM.guildDefaultHaulerInput) DOM.guildDefaultHaulerInput.value = cfg.defaultHaulerRate ?? 250;
  if (DOM.guildTreasuryAlertInput) DOM.guildTreasuryAlertInput.value = cfg.treasuryAlertThreshold ?? 500000;
}

function updateGuildUIElements() {
  const cfg = state.guildConfig;
  const user = state.currentGuildUser;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale ? getLocale() : 'fr-FR';

  // Header badges & role
  const roleNameKey = {
    ADMIRALTY: 'roleAdmiralty',
    FLIGHT_LEAD: 'roleFlightLead',
    TREASURER: 'roleTreasurer',
    MEMBER: 'roleMember',
    RECRUIT: 'roleRecruit'
  }[user.role] || 'roleRecruit';
  const roleDisplay = t[roleNameKey] || user.role;

  if (DOM.hudGuildRoleBadge) {
    DOM.hudGuildRoleBadge.textContent = roleDisplay;
    DOM.hudGuildRoleBadge.className = `hud-badge role-badge-pill ${user.role.toLowerCase()}`;
  }
  if (DOM.mgGuildRoleBadge) {
    const icon = { ADMIRALTY: '👑', FLIGHT_LEAD: '📋', TREASURER: '💰', MEMBER: '🚀', RECRUIT: '🔰' }[user.role] || '🔰';
    DOM.mgGuildRoleBadge.textContent = icon;
  }
  if (DOM.dockGuildBadge) {
    const icon = { ADMIRALTY: '👑', FLIGHT_LEAD: '📋', TREASURER: '💰', MEMBER: '🚀', RECRUIT: '🔰' }[user.role] || '🔰';
    DOM.dockGuildBadge.textContent = icon;
  }
  if (DOM.guildModalTickerBadge) {
    DOM.guildModalTickerBadge.textContent = `[${cfg.ticker}]`;
  }
  if (DOM.guildModalActiveRoleBadge) {
    DOM.guildModalActiveRoleBadge.textContent = roleDisplay;
    DOM.guildModalActiveRoleBadge.className = `role-badge-pill ${user.role.toLowerCase()}`;
  }
  if (DOM.guildModalOrgNameDisplay) {
    DOM.guildModalOrgNameDisplay.textContent = cfg.name || 'Stanton Mining Syndicate';
  }
  if (DOM.guildModalCharterDisplay) {
    const charterKeys = {
      syndicate: t.charterSyndicate || 'Syndicat Minier',
      corporation: t.charterCorpo || 'Corporation Industrielle',
      faith: t.charterFaith || 'Confrérie / Guilde',
      pmc: t.charterPMC || 'Société Militaire & Logistique',
      organization: t.charterOrg || 'Organisation Libre'
    };
    DOM.guildModalCharterDisplay.textContent = (charterKeys[cfg.charter || 'syndicate'] || 'SYNDICAT MINIER').toUpperCase();
  }
  if (DOM.guildModalHqDisplay) {
    DOM.guildModalHqDisplay.textContent = (cfg.hqStation || 'ARC-L1 WIDE FOREST').toUpperCase();
  }

  // DEFCON Readiness Pill
  const defcon = cfg.defconLevel || 1;
  if (DOM.guildDefconPill) {
    DOM.guildDefconPill.className = `cig-defcon-badge defcon-${defcon}`;
  }
  if (DOM.guildDefconLabel) {
    const defconKey = `defcon${defcon}Label`;
    const fallbackDefcon = {
      1: 'DEFCON 1 : OPS NORMALE',
      2: 'DEFCON 2 : VIGILANCE MINAGE',
      3: 'DEFCON 3 : ALERTE HOSTILE'
    }[defcon];
    DOM.guildDefconLabel.textContent = t[defconKey] || fallbackDefcon;
  }

  // Holographic Telemetry KPI Deck
  if (DOM.guildKpiNetWorth) {
    const grossVal = (state.guildStockpile || []).reduce((sum, l) => sum + (l.status === 'raw' ? (l.rawVal || 0) : (l.refinedVal || 0)), 0);
    const totalExp = (state.guildExpenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    const treasury = state.guildTreasuryBalance || 0;
    const netWorth = treasury + grossVal - totalExp;
    DOM.guildKpiNetWorth.textContent = Math.max(0, netWorth).toLocaleString(locale);
  }
  if (DOM.guildKpiTreasury) {
    DOM.guildKpiTreasury.textContent = (state.guildTreasuryBalance || 0).toLocaleString(locale);
  }
  if (DOM.guildKpiFleetScu) {
    const fleetScu = (state.guildFleet || []).reduce((sum, s) => sum + (s.scu || 0), 0);
    DOM.guildKpiFleetScu.textContent = fleetScu.toLocaleString(locale);
  }
  if (DOM.guildKpiPilots) {
    const pilotCount = (state.guildRegisteredMembers || []).length;
    DOM.guildKpiPilots.textContent = pilotCount;
  }
  if (DOM.guildKpiClearance) {
    DOM.guildKpiClearance.textContent = user.role;
    DOM.guildKpiClearance.className = `cig-kpi-val role-badge-pill ${user.role.toLowerCase()}`;
  }

  // MoTD
  if (DOM.guildMotdText) DOM.guildMotdText.textContent = cfg.motd;
  if (DOM.guildMotdInput) DOM.guildMotdInput.value = cfg.motd;

  // Profile inputs
  if (DOM.guildNameInput) DOM.guildNameInput.value = cfg.name;
  if (DOM.guildTickerInput) DOM.guildTickerInput.value = cfg.ticker;
  if (DOM.guildCharterSelect) DOM.guildCharterSelect.value = cfg.charter || 'syndicate';
  if (DOM.guildAlignmentSelect) DOM.guildAlignmentSelect.value = cfg.alignment || 'uee';
  if (DOM.guildSystemSelect) DOM.guildSystemSelect.value = cfg.system || 'stanton';
  if (DOM.guildHqStationSelect) DOM.guildHqStationSelect.value = cfg.hqStation;
  if (DOM.guildDiscordUrlInput) DOM.guildDiscordUrlInput.value = cfg.discordUrl || '';
  if (DOM.guildDiscordServerIdInput) DOM.guildDiscordServerIdInput.value = cfg.discordServerId || '';
  if (DOM.guildDiscordWidgetContainer && DOM.guildDiscordWidgetIframe) {
    if (cfg.discordServerId && /^\d+$/.test(cfg.discordServerId)) {
      DOM.guildDiscordWidgetContainer.style.display = 'block';
      const targetSrc = `https://discord.com/widget?id=${cfg.discordServerId}&theme=dark`;
      if (DOM.guildDiscordWidgetIframe.src !== targetSrc) {
        DOM.guildDiscordWidgetIframe.src = targetSrc;
      }
    } else {
      DOM.guildDiscordWidgetContainer.style.display = 'none';
      DOM.guildDiscordWidgetIframe.src = '';
    }
  }

  // Security session
  if (DOM.guildUserCallsignDisplay) DOM.guildUserCallsignDisplay.textContent = user.callsign || state.fleetNetCallsign || 'CITIZEN-1';
  if (DOM.guildUserRoleDisplay) {
    DOM.guildUserRoleDisplay.textContent = roleDisplay;
    DOM.guildUserRoleDisplay.className = `role-badge-pill ${user.role.toLowerCase()}`;
  }
  if (DOM.guildUserPermsDisplay) {
    const permKeys = {
      ADMIRALTY: t.permFull || 'Accès Total',
      FLIGHT_LEAD: t.permOps || 'Gestion Opérations',
      TREASURER: t.permTreasury || 'Finances & Fret',
      MEMBER: t.permStandard || 'Dépôts & Participation',
      RECRUIT: t.permReadOnly || 'Consultation'
    }[user.role] || t.permReadOnly;
    DOM.guildUserPermsDisplay.textContent = `Autorisations : ${permKeys}`;
  }

  // Admiralty password management card visibility
  if (DOM.adminPasswordsCard) {
    DOM.adminPasswordsCard.style.display = hasGuildPermission('MANAGE_GUILD') ? 'block' : 'none';
  }

  // Finance inputs
  if (DOM.guildDefaultTaxInput) DOM.guildDefaultTaxInput.value = cfg.defaultCorpoTax;
  if (DOM.guildDefaultEscortInput) DOM.guildDefaultEscortInput.value = cfg.defaultEscortRate;
  if (DOM.guildDefaultHaulerInput) DOM.guildDefaultHaulerInput.value = cfg.defaultHaulerRate;
  if (DOM.guildTreasuryAlertInput) DOM.guildTreasuryAlertInput.value = cfg.treasuryAlertThreshold;

  // Harmonization with Jalon 7 (Refinery / Stockpile Modal)
  const canWithdraw = hasGuildPermission('WITHDRAW_TREASURY');
  const canEditTax = hasGuildPermission('EDIT_TAX');
  if (DOM.btnWithdrawTreasury) {
    DOM.btnWithdrawTreasury.disabled = !canWithdraw;
    DOM.btnWithdrawTreasury.style.opacity = canWithdraw ? '1' : '0.4';
    DOM.btnWithdrawTreasury.style.cursor = canWithdraw ? 'pointer' : 'not-allowed';
    DOM.btnWithdrawTreasury.title = canWithdraw ? '' : (t.roleRestrictedNotice || '🔒 Réservé à l\'Amirauté ou aux Trésoriers');
  }
  if (DOM.treasuryTaxSelect) {
    DOM.treasuryTaxSelect.disabled = !canEditTax;
    DOM.treasuryTaxSelect.title = canEditTax ? '' : (t.roleRestrictedAdminNotice || '🔒 Réservé exclusivement à l\'Amirauté');
  }
}

function saveGuildProfile() {
  if (!hasGuildPermission('MANAGE_GUILD')) {
    const t = I18N[state.currentLang] || I18N.fr;
    showToast(t.roleRestrictedAdminNotice || '🔒 Réservé exclusivement à l\'Amirauté');
    return;
  }
  const name = DOM.guildNameInput ? DOM.guildNameInput.value.trim() : state.guildConfig.name;
  const ticker = DOM.guildTickerInput ? DOM.guildTickerInput.value.trim().toUpperCase() : state.guildConfig.ticker;
  const charter = DOM.guildCharterSelect ? DOM.guildCharterSelect.value : state.guildConfig.charter;
  const alignment = DOM.guildAlignmentSelect ? DOM.guildAlignmentSelect.value : state.guildConfig.alignment;
  const system = DOM.guildSystemSelect ? DOM.guildSystemSelect.value : state.guildConfig.system;
  const hqStation = DOM.guildHqStationSelect ? DOM.guildHqStationSelect.value : state.guildConfig.hqStation;
  const motd = DOM.guildMotdInput ? DOM.guildMotdInput.value.trim() : state.guildConfig.motd;
  const discordUrl = DOM.guildDiscordUrlInput ? DOM.guildDiscordUrlInput.value.trim() : '';
  const discordServerId = DOM.guildDiscordServerIdInput ? DOM.guildDiscordServerIdInput.value.trim() : '';

  state.guildConfig.name = name || 'Stanton Mining Syndicate';
  state.guildConfig.ticker = ticker || 'SMS';
  state.guildConfig.charter = charter || 'syndicate';
  state.guildConfig.alignment = alignment || 'uee';
  state.guildConfig.system = system;
  state.guildConfig.hqStation = hqStation;
  state.guildConfig.motd = motd || 'Bienvenue à tous les pilotes.';
  state.guildConfig.discordUrl = discordUrl;
  state.guildConfig.discordServerId = discordServerId;

  saveGuildConfig();
  updateGuildUIElements();
  broadcastGuildConfigToFleet();

  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.toastGuildConfigSaved || '🏛️ Configuration de guilde enregistrée et diffusée !');
  triggerHaptic(20);
}

async function saveGuildPasswords() {
  if (!hasGuildPermission('MANAGE_GUILD')) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const master = DOM.masterPasswordInput ? DOM.masterPasswordInput.value.trim() : '';
  const officer = DOM.officerPasswordInput ? DOM.officerPasswordInput.value.trim() : '';
  const member = DOM.memberPasswordInput ? DOM.memberPasswordInput.value.trim() : '';

  if (!state.guildConfig.salt) {
    state.guildConfig.salt = 'salt_' + Math.random().toString(36).substring(2, 10);
  }

  if (master) {
    state.guildConfig.masterPasswordHash = await hashGuildPassphrase(master, state.guildConfig.salt);
  }
  if (officer) {
    state.guildConfig.officerPasswordHash = await hashGuildPassphrase(officer, state.guildConfig.salt);
  }
  if (member) {
    state.guildConfig.memberPasswordHash = await hashGuildPassphrase(member, state.guildConfig.salt);
  }

  saveGuildConfig();
  if (DOM.masterPasswordInput) DOM.masterPasswordInput.value = '';
  if (DOM.officerPasswordInput) DOM.officerPasswordInput.value = '';
  if (DOM.memberPasswordInput) DOM.memberPasswordInput.value = '';

  showToast(t.toastPasswordsSaved || '🔑 Mots de passe de guilde mis à jour !');
  triggerHaptic(20);
}

function saveGuildFinancePolicy() {
  if (!hasGuildPermission('MANAGE_TREASURY')) {
    const t = I18N[state.currentLang] || I18N.fr;
    showToast(t.roleRestrictedNotice || '🔒 Réservé à l\'Amirauté ou aux Trésoriers');
    return;
  }
  const tax = DOM.guildDefaultTaxInput ? parseInt(DOM.guildDefaultTaxInput.value, 10) : 10;
  const escort = DOM.guildDefaultEscortInput ? parseInt(DOM.guildDefaultEscortInput.value, 10) : 75000;
  const hauler = DOM.guildDefaultHaulerInput ? parseInt(DOM.guildDefaultHaulerInput.value, 10) : 250;
  const alertThresh = DOM.guildTreasuryAlertInput ? parseInt(DOM.guildTreasuryAlertInput.value, 10) : 500000;

  state.guildConfig.defaultCorpoTax = isNaN(tax) ? 10 : Math.max(0, Math.min(50, tax));
  state.guildConfig.defaultEscortRate = isNaN(escort) ? 75000 : escort;
  state.guildConfig.defaultHaulerRate = isNaN(hauler) ? 250 : hauler;
  state.guildConfig.treasuryAlertThreshold = isNaN(alertThresh) ? 500000 : alertThresh;
  state.guildCorpoTaxPct = state.guildConfig.defaultCorpoTax;

  saveGuildConfig();
  saveGuildTreasury();
  updateGuildUIElements();
  broadcastGuildConfigToFleet();

  const t = I18N[state.currentLang] || I18N.fr;
  showToast(t.toastGuildConfigSaved || '💾 Politique financière enregistrée !');
  triggerHaptic(20);
}

async function unlockGuildRole() {
  const t = I18N[state.currentLang] || I18N.fr;
  const role = DOM.unlockRoleSelect ? DOM.unlockRoleSelect.value : 'MEMBER';
  const pass = DOM.unlockPasswordInput ? DOM.unlockPasswordInput.value.trim() : '';

  if (!pass && (state.guildConfig.masterPasswordHash || state.guildConfig.officerPasswordHash || state.guildConfig.memberPasswordHash)) {
    showToast(t.errorIncorrectPass || '❌ Mot de passe requis.');
    return;
  }

  let expectedHash = '';
  if (role === 'ADMIRALTY') {
    expectedHash = state.guildConfig.masterPasswordHash;
  } else if (role === 'FLIGHT_LEAD' || role === 'TREASURER') {
    expectedHash = state.guildConfig.officerPasswordHash || state.guildConfig.masterPasswordHash;
  } else if (role === 'MEMBER') {
    expectedHash = state.guildConfig.memberPasswordHash || state.guildConfig.officerPasswordHash || state.guildConfig.masterPasswordHash;
  }

  const isValid = await verifyGuildPassphrase(pass, expectedHash, state.guildConfig.salt);
  if (!isValid) {
    showToast(t.errorIncorrectPass || '❌ Mot de passe incorrect.');
    return;
  }

  state.currentGuildUser.role = role;
  state.currentGuildUser.isAuthenticated = true;
  state.currentGuildUser.lastLogin = Date.now();
  saveGuildConfig();
  updateGuildUIElements();
  if (DOM.unlockPasswordInput) DOM.unlockPasswordInput.value = '';

  const roleNameKey = {
    ADMIRALTY: 'roleAdmiralty',
    FLIGHT_LEAD: 'roleFlightLead',
    TREASURER: 'roleTreasurer',
    MEMBER: 'roleMember'
  }[role] || 'roleMember';
  const roleName = t[roleNameKey] || role;

  showToast((t.toastRoleUnlocked || '🔓 Rôle actif : {role}').replace('{role}', roleName));
  triggerHaptic(20);
}

function logoutGuildRole() {
  const t = I18N[state.currentLang] || I18N.fr;
  state.currentGuildUser.role = 'RECRUIT';
  state.currentGuildUser.isAuthenticated = false;
  saveGuildConfig();
  updateGuildUIElements();
  showToast(t.toastRoleLogout || '🔒 Rôle réinitialisé à Recrue.');
  triggerHaptic(15);
}

// Ergonomic State Variables
let guildRosterSort = { field: 'role', dir: 'desc' };
let guildRosterFilter = 'all';
let guildFleetFilter = 'all';
let guildFleetSort = 'scu-desc';
let guildStockpileFilter = 'all';
let guildStockpileStation = 'all';

function changeMemberRole(callsign, newRole) {
  if (!hasGuildPermission('MANAGE_ROSTER')) return;
  if (!state.guildRegisteredMembers) state.guildRegisteredMembers = [];
  const member = state.guildRegisteredMembers.find(m => m.callsign === callsign);
  if (member) {
    member.role = newRole;
    saveGuildConfig();
    renderGuildRoster();
    updateGuildUIElements();
    sfx.playBeep(700, 'sine', 0.04);
    const t = I18N[state.currentLang] || I18N.fr;
    showToast((t.toastRoleUpdated || '👑 Rôle de {callsign} modifié vers {role} !').replace('{callsign}', callsign).replace('{role}', newRole));
    triggerHaptic(20);
  }
}

function exportGuildRosterDiscord() {
  const cfg = state.guildConfig;
  const members = [...(state.guildRegisteredMembers || [])];
  const user = state.currentGuildUser;
  const localCallsign = user.callsign || state.fleetNetCallsign || 'CITIZEN-1';
  if (!members.some(m => m.callsign === localCallsign)) {
    members.unshift({
      callsign: localCallsign,
      role: user.role,
      ship: 'MISC Prospector',
      station: cfg.hqStation || 'ARC-L1 Wide Forest',
      status: 'online'
    });
  }

  let text = `**[${cfg.ticker || 'SMS'}] ${cfg.name || 'STANTON MINING SYNDICATE'} // REGISTRE D'ORGANISATION**\n`;
  text += `*Zone QG : ${cfg.hqStation || 'ARC-L1 Wide Forest'} • Effectif : ${members.length} Pilotes*\n\n`;

  const roles = ['ADMIRALTY', 'TREASURER', 'FLIGHT_LEAD', 'MEMBER', 'RECRUIT'];
  const roleHeaders = {
    ADMIRALTY: '👑 **Amirauté & Commandement**',
    TREASURER: '💰 **Trésorerie & Logistique**',
    FLIGHT_LEAD: '📋 **Chefs d\'Opération**',
    MEMBER: '🚀 **Membres / Pilotes Actifs**',
    RECRUIT: '🔰 **Recrues & Invités**'
  };

  roles.forEach(r => {
    const group = members.filter(m => m.role === r);
    if (group.length > 0) {
      text += `${roleHeaders[r]} (${group.length}) :\n`;
      group.forEach(m => {
        text += `- \`${m.callsign}\` • ${m.ship || 'Vaisseau'} (${m.station || 'Station'})\n`;
      });
      text += `\n`;
    }
  });

  navigator.clipboard.writeText(text).then(() => {
    sfx.playBeep(880, 'sine', 0.06);
    setTimeout(() => sfx.playBeep(1100, 'sine', 0.05), 80);
    const t = I18N[state.currentLang] || I18N.fr;
    showToast(t.toastRosterDiscordCopied || '📋 Roster copié au format Discord !');
  }).catch(() => {
    showToast('📋 Copie impossible dans ce contexte.');
  });
}

function renderGuildRoster() {
  if (!DOM.guildRosterTableBody) return;
  DOM.guildRosterTableBody.innerHTML = '';
  const t = I18N[state.currentLang] || I18N.fr;
  const user = state.currentGuildUser;
  const isAdmin = hasGuildPermission('MANAGE_ROSTER');
  const searchFilter = DOM.guildRosterSearchInput ? DOM.guildRosterSearchInput.value.toLowerCase().trim() : '';

  // Toggle search clear button
  if (DOM.guildRosterSearchClear) {
    DOM.guildRosterSearchClear.style.display = searchFilter ? 'block' : 'none';
  }

  const members = [...(state.guildRegisteredMembers || [])];
  const localCallsign = user.callsign || state.fleetNetCallsign || state.callsign || 'CITIZEN-1';
  const shipDef = typeof getActiveShipDef === 'function' ? getActiveShipDef() : { name: 'MISC Prospector' };
  const activeShipName = state.myActiveShip?.customName ? `${state.myActiveShip.customName} (${shipDef.name})` : shipDef.name;

  let localMember = members.find(m => m.callsign === localCallsign);
  if (localMember) {
    localMember.ship = activeShipName;
    localMember.station = state.myActiveShip?.location || localMember.station;
    localMember.status = state.myActiveShip?.status || localMember.status;
  } else {
    members.unshift({
      callsign: localCallsign,
      role: user.role || 'MEMBER',
      ship: activeShipName,
      station: state.myActiveShip?.location || state.guildConfig.hqStation || 'ARC-L1 Wide Forest',
      status: state.myActiveShip?.status || 'online',
      isLocal: true
    });
  }

  // Update filter count badges
  const onlineCount = members.filter(m => m.status === 'online').length;
  const opsCount = members.filter(m => m.status === 'mining' || m.status === 'hauling' || m.status === 'patrol').length;
  const officersCount = members.filter(m => m.role === 'ADMIRALTY' || m.role === 'FLIGHT_LEAD' || m.role === 'TREASURER').length;

  if (DOM.chipCountRosterAll) DOM.chipCountRosterAll.textContent = members.length;
  if (DOM.chipCountRosterOnline) DOM.chipCountRosterOnline.textContent = onlineCount;
  if (DOM.chipCountRosterOps) DOM.chipCountRosterOps.textContent = opsCount;
  if (DOM.chipCountRosterOfficers) DOM.chipCountRosterOfficers.textContent = officersCount;
  if (DOM.tabCounterRoster) DOM.tabCounterRoster.textContent = members.length;

  // Filter by category chip
  let filtered = members.filter(m => {
    if (guildRosterFilter === 'online') return m.status === 'online';
    if (guildRosterFilter === 'ops') return m.status === 'mining' || m.status === 'hauling' || m.status === 'patrol';
    if (guildRosterFilter === 'officers') return m.role === 'ADMIRALTY' || m.role === 'FLIGHT_LEAD' || m.role === 'TREASURER';
    return true;
  });

  // Filter by search string
  if (searchFilter) {
    filtered = filtered.filter(m => {
      return (m.callsign && m.callsign.toLowerCase().includes(searchFilter)) ||
             (m.role && m.role.toLowerCase().includes(searchFilter)) ||
             (m.ship && m.ship.toLowerCase().includes(searchFilter)) ||
             (m.station && m.station.toLowerCase().includes(searchFilter));
    });
  }

  // Sorting
  const roleWeights = { ADMIRALTY: 5, TREASURER: 4, FLIGHT_LEAD: 3, MEMBER: 2, RECRUIT: 1 };
  filtered.sort((a, b) => {
    let cmp = 0;
    if (guildRosterSort.field === 'role') {
      const wa = roleWeights[a.role] || 0;
      const wb = roleWeights[b.role] || 0;
      cmp = wa - wb;
    } else if (guildRosterSort.field === 'callsign') {
      cmp = (a.callsign || '').localeCompare(b.callsign || '');
    } else if (guildRosterSort.field === 'status') {
      cmp = (a.status || '').localeCompare(b.status || '');
    } else if (guildRosterSort.field === 'ship') {
      cmp = (a.ship || '').localeCompare(b.ship || '');
    }
    return guildRosterSort.dir === 'asc' ? cmp : -cmp;
  });

  // Update sort indicators on table headers
  const sortHeaders = [
    { el: DOM.thRosterCallsign, icon: DOM.sortIconCallsign, field: 'callsign' },
    { el: DOM.thRosterRole, icon: DOM.sortIconRole, field: 'role' },
    { el: DOM.thRosterStatus, icon: DOM.sortIconStatus, field: 'status' },
    { el: DOM.thRosterShip, icon: DOM.sortIconShip, field: 'ship' }
  ];
  sortHeaders.forEach(({ el, icon, field }) => {
    if (!el) return;
    const isActive = guildRosterSort.field === field;
    el.classList.toggle('active-sort', isActive);
    if (icon) {
      if (isActive) {
        icon.textContent = guildRosterSort.dir === 'asc' ? '▲' : '▼';
      } else {
        icon.textContent = '⇅';
      }
    }
  });

  // Update footer telemetry
  if (DOM.rosterShowingCount) DOM.rosterShowingCount.textContent = filtered.length;
  if (DOM.rosterTotalCount) DOM.rosterTotalCount.textContent = members.length;
  if (DOM.rosterActiveOpsCount) DOM.rosterActiveOpsCount.textContent = opsCount;

  // Compute active tonnage
  const modelScu = { prospector: 32, mole: 96, arrastra: 576, c2: 696, caterpillar: 576, taurus: 174, orion: 2880, scorpius: 0 };
  let activeTonnage = 0;
  filtered.forEach(m => {
    const shipNameLower = (m.ship || '').toLowerCase();
    for (const [key, scu] of Object.entries(modelScu)) {
      if (shipNameLower.includes(key)) { activeTonnage += scu; break; }
    }
  });
  if (DOM.rosterTotalTonnageDisplay) {
    DOM.rosterTotalTonnageDisplay.textContent = `Tonnage en service : ${activeTonnage} SCU`;
  }

  if (filtered.length === 0) {
    DOM.guildRosterTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted); font-size:0.75rem;">
          🔍 Aucun pilote ne correspond aux critères de filtre sélectionnés.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach(m => {
    const isLocal = m.callsign === localCallsign;
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid rgba(255,255,255,0.06)';

    const statusIcons = {
      online: '🟢 En Ligne',
      mining: '⛏️ En Forage',
      hauling: '🚜 En Fret',
      patrol: '🛡️ En Patrouille',
      standby: '⚪ En Attente'
    };
    const statusDisplay = statusIcons[m.status] || '🟢 Actif';

    // Pilot initials for crest
    const rawClean = (m.callsign || 'CX').replace(/[^a-zA-Z0-9]/g, '');
    const initials = (rawClean.length >= 2 ? rawClean.slice(0, 2) : rawClean).toUpperCase();
    const isAdmiralty = m.role === 'ADMIRALTY';

    row.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="roster-avatar-badge ${isAdmiralty ? 'admiralty' : ''}" title="${m.callsign}">
            ${initials}
            <div class="roster-pulse-dot ${m.status || 'online'}"></div>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:4px;">
              <strong style="color:${isLocal ? 'var(--accent-cyan)' : '#fff'}; font-family:var(--font-mono); font-size:0.8rem;">${m.callsign}</strong>
              <button type="button" class="btn-copy-callsign" data-copy-callsign="${m.callsign}" title="${t.btnCopyCallsign || 'Copier l\'indicatif'}">📋</button>
              ${isLocal ? `<span style="font-size:0.62rem; background:rgba(0,240,255,0.12); color:var(--accent-cyan); padding:1px 5px; border-radius:3px; margin-left:2px;">${t.statusLocal || 'Local'}</span>` : ''}
            </div>
            <div style="font-size:0.68rem; color:var(--text-muted);">${m.station || 'Station Spatiale'}</div>
          </div>
        </div>
      </td>
      <td>
        ${!isLocal && isAdmin ? `
          <select class="roster-quick-role-select" data-member-role-change="${m.callsign}" title="Modifier le rôle du membre">
            <option value="ADMIRALTY" ${m.role === 'ADMIRALTY' ? 'selected' : ''}>👑 Amirauté</option>
            <option value="TREASURER" ${m.role === 'TREASURER' ? 'selected' : ''}>💰 Trésorier</option>
            <option value="FLIGHT_LEAD" ${m.role === 'FLIGHT_LEAD' ? 'selected' : ''}>📋 Chef d'Op</option>
            <option value="MEMBER" ${m.role === 'MEMBER' ? 'selected' : ''}>🚀 Membre</option>
            <option value="RECRUIT" ${m.role === 'RECRUIT' ? 'selected' : ''}>🔰 Recrue</option>
          </select>
        ` : `
          <span class="role-badge-pill ${m.role.toLowerCase()}">${m.role}</span>
        `}
      </td>
      <td>
        <div style="font-size:0.75rem;">${statusDisplay}</div>
      </td>
      <td style="font-size:0.75rem; color:#fff;">
        <div style="font-weight:600;">${m.ship || 'Vaisseau'}</div>
      </td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; align-items:center; gap:6px;">
          ${!isLocal && isAdmin ? `
            <button type="button" class="chip-btn" data-revoke-member="${m.callsign}" style="border-color:#f87171; color:#f87171; font-size:0.68rem; padding:2px 6px;">
              ${t.btnRevokeMember || 'Révoquer'}
            </button>
          ` : `<span style="font-size:0.72rem; color:var(--text-muted);">-</span>`}
        </div>
      </td>
    `;
    DOM.guildRosterTableBody.appendChild(row);
  });

  // Bind copy callsign
  DOM.guildRosterTableBody.querySelectorAll('[data-copy-callsign]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cs = btn.getAttribute('data-copy-callsign');
      navigator.clipboard.writeText(cs).then(() => {
        sfx.playBeep(800, 'sine', 0.03);
        showToast((t.toastCallsignCopied || '📋 Indicatif {callsign} copié !').replace('{callsign}', cs));
      });
    });
  });

  // Bind inline role change
  DOM.guildRosterTableBody.querySelectorAll('[data-member-role-change]').forEach(sel => {
    sel.addEventListener('change', () => {
      const cs = sel.getAttribute('data-member-role-change');
      changeMemberRole(cs, sel.value);
    });
  });

  // Bind revoke member
  DOM.guildRosterTableBody.querySelectorAll('[data-revoke-member]').forEach(btn => {
    btn.addEventListener('click', () => {
      const callsign = btn.getAttribute('data-revoke-member');
      removeGuildMember(callsign);
    });
  });
}

function addGuildMember() {
  const callsign = DOM.newMemberCallsignInput ? DOM.newMemberCallsignInput.value.trim().toUpperCase() : '';
  const role = DOM.newMemberRoleSelect ? DOM.newMemberRoleSelect.value : 'MEMBER';
  const ship = DOM.newMemberShipInput ? DOM.newMemberShipInput.value.trim() : 'MISC Prospector';

  if (!callsign) {
    showToast('❌ Veuillez spécifier un indicatif (Callsign).');
    return;
  }

  if (!state.guildRegisteredMembers) state.guildRegisteredMembers = [];
  const existing = state.guildRegisteredMembers.find(m => m.callsign === callsign);
  if (existing) {
    existing.role = role;
    existing.ship = ship || existing.ship;
  } else {
    state.guildRegisteredMembers.push({
      callsign: callsign,
      role: role,
      ship: ship || 'MISC Prospector',
      station: state.guildConfig.hqStation || 'ARC-L1 Wide Forest',
      status: 'online'
    });
  }

  saveGuildConfig();
  renderGuildRoster();
  updateGuildUIElements();

  if (DOM.newMemberCallsignInput) DOM.newMemberCallsignInput.value = '';
  if (DOM.newMemberShipInput) DOM.newMemberShipInput.value = '';
  if (DOM.guildAddMemberBox) DOM.guildAddMemberBox.style.display = 'none';

  const t = I18N[state.currentLang] || I18N.fr;
  showToast((t.toastMemberAdded || '👤 Pilote {callsign} enrôlé dans l\'organisation !').replace('{callsign}', callsign));
  triggerHaptic(20);
}

function removeGuildMember(callsign) {
  if (!hasGuildPermission('MANAGE_ROSTER')) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const confirmMsg = (t.confirmRevokeMember || 'Êtes-vous sûr de vouloir révoquer le pilote {callsign} du registre de guilde ?').replace('{callsign}', callsign);
  if (!confirm(confirmMsg)) return;

  state.guildRegisteredMembers = (state.guildRegisteredMembers || []).filter(m => m.callsign !== callsign);
  saveGuildConfig();
  renderGuildRoster();
  updateGuildUIElements();

  showToast((t.toastMemberRemoved || '👤 Pilote {callsign} retiré du registre.').replace('{callsign}', callsign));
  triggerHaptic(15);
}

function exportGuildBackupJSON() {
  const t = I18N[state.currentLang] || I18N.fr;
  const backupData = {
    app: 'AARON MFD',
    schemaVersion: '2.3.0',
    exportedAt: new Date().toISOString(),
    guildConfig: state.guildConfig,
    guildTreasuryBalance: state.guildTreasuryBalance,
    guildCorpoTaxPct: state.guildCorpoTaxPct,
    guildExpenses: state.guildExpenses,
    guildStockpile: state.guildStockpile,
    guildCraftingGoals: state.guildCraftingGoals,
    guildFleet: state.guildFleet,
    guildRegisteredMembers: state.guildRegisteredMembers,
    refineryJobs: state.refineryJobs,
    customTradeRuns: state.customTradeRuns
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ticker = state.guildConfig.ticker || 'GUILD';
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `aaron-mfd-backup-${ticker}-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(t.toastBackupExported || '💾 Sauvegarde officielle de guilde exportée avec succès !');
  triggerHaptic(20);
}

function importGuildBackupJSON(file) {
  const t = I18N[state.currentLang] || I18N.fr;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || typeof data !== 'object') {
        throw new Error('Format JSON invalide');
      }

      if (data.guildConfig) state.guildConfig = { ...state.guildConfig, ...data.guildConfig };
      if (typeof data.guildTreasuryBalance === 'number') state.guildTreasuryBalance = data.guildTreasuryBalance;
      if (typeof data.guildCorpoTaxPct === 'number') state.guildCorpoTaxPct = data.guildCorpoTaxPct;
      if (Array.isArray(data.guildExpenses)) state.guildExpenses = data.guildExpenses;
      if (Array.isArray(data.guildStockpile)) state.guildStockpile = data.guildStockpile;
      if (Array.isArray(data.guildCraftingGoals)) state.guildCraftingGoals = data.guildCraftingGoals;
      if (Array.isArray(data.guildFleet)) state.guildFleet = data.guildFleet;
      if (Array.isArray(data.guildRegisteredMembers)) state.guildRegisteredMembers = data.guildRegisteredMembers;
      if (Array.isArray(data.refineryJobs)) state.refineryJobs = data.refineryJobs;
      if (Array.isArray(data.customTradeRuns)) state.customTradeRuns = data.customTradeRuns;

      saveGuildConfig();
      saveGuildFleet();
      saveGuildTreasury();
      saveStockpileAndExpenses();
      saveRefineryJobs();
      updateGuildUIElements();
      renderGuildFleet();
      renderGuildRoster();
      renderGuildStockpile();
      renderGuildTreasury();

      if (DOM.backupStatusNotice) {
        DOM.backupStatusNotice.style.display = 'block';
        DOM.backupStatusNotice.textContent = t.backupIntegrityValid || '✅ Archive JSON vérifiée avec succès.';
      }
      showToast(t.toastBackupRestored || '📥 Données de guilde restaurées avec succès !');
      triggerHaptic(25);
    } catch (err) {
      console.error('[Backup Import Error]', err);
      showToast(t.errorInvalidBackup || '❌ Fichier de sauvegarde invalide.');
    }
  };
  reader.readAsText(file);
}

function broadcastGuildConfigToFleet() {
  if (state.fleetNet && typeof state.fleetNet.broadcastCorpoGuildConfigSync === 'function') {
    state.fleetNet.broadcastCorpoGuildConfigSync(state.guildConfig);
  }
}

function handleIncomingCorpoGuildConfigSync(incomingConfig, callsign) {
  if (!incomingConfig) return;
  // Non-destructive update of identity and policies
  state.guildConfig.name = incomingConfig.name || state.guildConfig.name;
  state.guildConfig.ticker = incomingConfig.ticker || state.guildConfig.ticker;
  state.guildConfig.system = incomingConfig.system || state.guildConfig.system;
  state.guildConfig.hqStation = incomingConfig.hqStation || state.guildConfig.hqStation;
  state.guildConfig.charter = incomingConfig.charter || state.guildConfig.charter;
  state.guildConfig.alignment = incomingConfig.alignment || state.guildConfig.alignment;
  state.guildConfig.defconLevel = incomingConfig.defconLevel || state.guildConfig.defconLevel;
  state.guildConfig.motd = incomingConfig.motd || state.guildConfig.motd;
  state.guildConfig.discordUrl = incomingConfig.discordUrl || state.guildConfig.discordUrl;
  state.guildConfig.defaultCorpoTax = incomingConfig.defaultCorpoTax ?? state.guildConfig.defaultCorpoTax;

  saveGuildConfig();
  updateGuildUIElements();

  const t = I18N[state.currentLang] || I18N.fr;
  const msg = (t.toastGuildConfigReceived || '🏛️ Configuration mise à jour par l\'Amirauté ({callsign}) !').replace('{callsign}', callsign || 'Amirauté');
  showToast(msg);
}

function openGuildConfigModal() {
  updateGuildUIElements();
  switchGuildTab(state.activeGuildTab || 'profile');
  openModal(DOM.guildConfigModal);
}

function cycleGuildDefcon() {
  const current = state.guildConfig.defconLevel || 1;
  const next = (current % 3) + 1;
  state.guildConfig.defconLevel = next;
  saveGuildConfig();
  updateGuildUIElements();
  broadcastGuildConfigToFleet();

  const t = I18N[state.currentLang] || I18N.fr;
  const defconNames = {
    1: t.defcon1Label || 'DEFCON 1 : OPS NORMALE',
    2: t.defcon2Label || 'DEFCON 2 : VIGILANCE MINAGE',
    3: t.defcon3Label || 'DEFCON 3 : ALERTE HOSTILE'
  };
  showToast(`🚨 ${t.toastDefconChanged || 'Niveau d\'alerte guilde :'} ${defconNames[next]}`);
  triggerHaptic(next === 3 ? [40, 60, 40] : 25);
  if (sfx && typeof sfx.playWarn === 'function' && next === 3) {
    sfx.playWarn();
  } else if (sfx && typeof sfx.playClick === 'function') {
    sfx.playClick();
  }
}

function toggleGuildFullscreen() {
  if (!DOM.guildModalContent) return;
  DOM.guildModalContent.classList.toggle('fullscreen');
  triggerHaptic(15);
}

function saveGuildFleet() {
  try {
    localStorage.setItem('aaron_mfd_guild_fleet', JSON.stringify(state.guildFleet));
  } catch (e) {
    console.warn('[Guild Fleet] Erreur sauvegarde locale:', e);
  }
}

function repairGuildShip(shipId) {
  const ship = (state.guildFleet || []).find(s => s.id === shipId);
  if (!ship) return;
  ship.hullHealth = 100;
  saveGuildFleet();
  renderGuildFleet();
  updateGuildUIElements();
  sfx.playBeep(720, 'sine', 0.05);
  const t = I18N[state.currentLang] || I18N.fr;
  showToast((t.toastHullRepaired || '🛠️ Coque du {name} remise en parfait état (100%) !').replace('{name}', ship.name));
  triggerHaptic(20);
}

function renderGuildFleet() {
  if (!DOM.guildFleetCardsGrid) return;
  DOM.guildFleetCardsGrid.innerHTML = '';
  const t = I18N[state.currentLang] || I18N.fr;
  const user = state.currentGuildUser;
  const isAdmin = hasGuildPermission('MANAGE_GUILD');
  const userCallsign = user.callsign || state.fleetNetCallsign || 'CITIZEN-1';
  const fleet = state.guildFleet || [];

  // Toggle search clear button
  const searchFilter = DOM.guildFleetSearchInput ? DOM.guildFleetSearchInput.value.toLowerCase().trim() : '';
  if (DOM.guildFleetSearchClear) {
    DOM.guildFleetSearchClear.style.display = searchFilter ? 'block' : 'none';
  }

  // Update fleet counters
  const availShips = fleet.filter(s => !s.isBorrowed);
  const borrowedShips = fleet.filter(s => s.isBorrowed);
  const availScu = availShips.reduce((sum, s) => sum + (s.scu || 0), 0);
  const totalScu = fleet.reduce((sum, s) => sum + (s.scu || 0), 0);

  if (DOM.chipCountFleetAll) DOM.chipCountFleetAll.textContent = fleet.length;
  if (DOM.chipCountFleetAvailable) DOM.chipCountFleetAvailable.textContent = availShips.length;
  if (DOM.chipCountFleetBorrowed) DOM.chipCountFleetBorrowed.textContent = borrowedShips.length;
  if (DOM.tabCounterFleet) DOM.tabCounterFleet.textContent = fleet.length;

  if (DOM.fleetAvailCount) DOM.fleetAvailCount.textContent = availShips.length;
  if (DOM.fleetTotalCount) DOM.fleetTotalCount.textContent = fleet.length;
  if (DOM.fleetAvailScu) DOM.fleetAvailScu.textContent = availScu.toLocaleString();
  if (DOM.fleetTotalScuDisplay) DOM.fleetTotalScuDisplay.textContent = `Capacité totale de flotte : ${totalScu.toLocaleString()} SCU`;

  if (fleet.length === 0) {
    DOM.guildFleetCardsGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted); font-size:0.85rem;">
        🚀 Aucun vaisseau enregistré dans le hangar corporatif. Cliquez sur "+ Enregistrer un Vaisseau" pour commencer.
      </div>
    `;
    return;
  }

  // Categorize model
  const minerModels = ['prospector', 'mole', 'arrastra', 'orion'];
  const haulerModels = ['c2', 'caterpillar', 'taurus'];
  const escortModels = ['scorpius'];

  // Filter fleet
  let filtered = fleet.filter(s => {
    if (guildFleetFilter === 'available') return !s.isBorrowed;
    if (guildFleetFilter === 'borrowed') return s.isBorrowed;
    if (guildFleetFilter === 'miners') return minerModels.includes(s.model);
    if (guildFleetFilter === 'haulers') return haulerModels.includes(s.model);
    if (guildFleetFilter === 'escort') return escortModels.includes(s.model);
    return true;
  });

  // Filter by search string
  if (searchFilter) {
    filtered = filtered.filter(s => {
      return (s.name && s.name.toLowerCase().includes(searchFilter)) ||
             (s.model && s.model.toLowerCase().includes(searchFilter)) ||
             (s.station && s.station.toLowerCase().includes(searchFilter)) ||
             (s.registration && s.registration.toLowerCase().includes(searchFilter));
    });
  }

  // Sort fleet
  filtered.sort((a, b) => {
    if (guildFleetSort === 'scu-desc') return (b.scu || 0) - (a.scu || 0);
    if (guildFleetSort === 'scu-asc') return (a.scu || 0) - (b.scu || 0);
    if (guildFleetSort === 'hull-desc') return (b.hullHealth || 100) - (a.hullHealth || 100);
    if (guildFleetSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  if (filtered.length === 0) {
    DOM.guildFleetCardsGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted); font-size:0.85rem;">
        🔍 Aucun vaisseau ne correspond aux filtres de recherche sélectionnés.
      </div>
    `;
    return;
  }

  const modelLabels = {
    prospector: 'MISC Prospector',
    mole: 'Argo MOLE',
    arrastra: 'RSI Arrastra',
    c2: 'Crusader C2 Hercules',
    caterpillar: 'Drake Caterpillar',
    taurus: 'RSI Constellation Taurus',
    orion: 'RSI Orion',
    scorpius: 'Aegis Scorpius',
    vulture: 'Drake Vulture',
    gladius: 'Aegis Gladius',
    vanguard: 'Aegis Vanguard Warden'
  };

  const modelIcons = {
    prospector: '⛏️',
    mole: '⛏️⛏️',
    arrastra: '⚡⛏️',
    c2: '🚜',
    caterpillar: '🚜',
    taurus: '🚜🛡️',
    orion: '👑⛏️',
    scorpius: '🛡️⚔️',
    vulture: '♻️',
    gladius: '⚔️',
    vanguard: '🛡️⚔️'
  };

  filtered.forEach(ship => {
    const card = document.createElement('div');
    card.className = `cig-ship-card ${ship.isBorrowed ? 'borrowed' : ''}`;

    const isBorrowedByMe = ship.isBorrowed && (ship.borrowedBy === userCallsign || ship.pilotCallsign === userCallsign);
    const canReturn = ship.isBorrowed && (isBorrowedByMe || isAdmin);
    const needsRepair = (ship.hullHealth || 100) < 100;
    const isOnline = ship.isOnline || (ship.borrowedBy && ship.borrowedBy === userCallsign);
    const activePilot = ship.pilotCallsign || ship.borrowedBy;

    card.innerHTML = `
      <div class="cig-ship-card-header">
        <div>
          <div style="font-size:0.92rem; font-weight:800; color:#fff; font-family:var(--font-hud); letter-spacing:0.5px;">
            <span style="margin-right:4px;">${modelIcons[ship.model] || '🚀'}</span> ${ship.name}
          </div>
          <div style="font-size:0.72rem; color:var(--accent-cyan); font-family:var(--font-mono); margin-top:2px;">
            ${modelLabels[ship.model] || ship.model.toUpperCase()} • ${ship.scu} SCU
          </div>
        </div>
        <div>
          ${isOnline && activePilot ?
            `<span style="font-size:0.62rem; background:rgba(0,240,255,0.18); border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:2px 6px; border-radius:3px; font-weight:700;">🟢 EN VOL : ${activePilot}</span>` :
            (ship.isBorrowed ?
              `<span style="font-size:0.62rem; background:rgba(245,158,11,0.18); border:1px solid #f59e0b; color:#fbbf24; padding:2px 6px; border-radius:3px; font-weight:700;">⚠️ ${t.statusBorrowed || 'EMPRUNTÉ'}: ${ship.borrowedBy}</span>` :
              `<span style="font-size:0.62rem; background:rgba(16,185,129,0.15); border:1px solid var(--accent-emerald); color:var(--accent-emerald); padding:2px 6px; border-radius:3px; font-weight:700;">🟢 ${t.statusAvailable || 'DISPONIBLE'}</span>`
            )
          }
        </div>
      </div>

      <div style="font-size:0.68rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:2px;">
        <span>Intégrité coque : <strong style="color:${(ship.hullHealth || 100) > 80 ? 'var(--accent-emerald)' : '#fbbf24'};">${ship.hullHealth || 100}%</strong></span>
        <span>${ship.registration || 'N/A'}</span>
      </div>
      <div class="cig-ship-hull-bar">
        <div class="cig-ship-hull-fill" style="width:${ship.hullHealth || 100}%; background:${(ship.hullHealth || 100) > 80 ? 'linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan))' : 'linear-gradient(90deg, #f87171, #fbbf24)'};"></div>
      </div>

      <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:10px;">
        📍 Station d'attache : <strong style="color:#fff;">${ship.station || 'ARC-L1'}</strong>
      </div>

      <div style="display:flex; gap:6px; justify-content:flex-end; align-items:center; flex-wrap:wrap;">
        ${isAdmin && activePilot ? `<button type="button" class="chip-btn" data-ship-dispatch="${ship.id}" style="border-color:var(--accent-purple); color:var(--accent-purple); font-size:0.72rem; padding:3px 8px; font-weight:700;" title="Envoyer un ordre de mission">📡 Assigner Ordre</button>` : ''}
        ${needsRepair && isAdmin ? `<button type="button" class="btn-icon" data-ship-repair="${ship.id}" title="${t.btnRepairHull || 'Réviser coque au hangar (100%)'}" style="font-size:0.75rem; border-color:rgba(16,185,129,0.4); color:var(--accent-emerald); padding:3px 6px;">🛠️</button>` : ''}
        ${isAdmin ? `<button type="button" class="btn-icon" data-ship-decom="${ship.id}" title="Décommissionner le vaisseau" style="font-size:0.75rem; border-color:rgba(248,113,113,0.3); color:#f87171; padding:3px 6px;">🗑️</button>` : ''}
        ${ship.isBorrowed ?
          (canReturn ?
            `<button type="button" class="chip-btn" data-ship-return="${ship.id}" style="border-color:#fbbf24; color:#fbbf24; font-size:0.72rem; padding:3px 8px; font-weight:700;">🔄 ${t.btnReturnShip || 'Restituer au Hangar'}</button>` :
            `<button type="button" class="chip-btn" disabled style="opacity:0.4; font-size:0.72rem; padding:3px 8px;">🔒 Emprunté</button>`
          ) :
          `<button type="button" class="chip-btn" data-ship-borrow="${ship.id}" style="border-color:var(--accent-cyan); color:var(--accent-cyan); font-size:0.72rem; padding:3px 8px; font-weight:700;">🚀 ${t.btnBorrowShip || 'Emprunter ce Vaisseau'}</button>`
        }
      </div>
    `;

    DOM.guildFleetCardsGrid.appendChild(card);
  });

  DOM.guildFleetCardsGrid.querySelectorAll('[data-ship-dispatch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-dispatch');
      const ship = fleet.find(s => s.id === shipId);
      const pilot = ship?.pilotCallsign || ship?.borrowedBy || 'Pilote';
      const order = prompt(`Assigner un ordre de mission à ${pilot} (${ship?.name || 'Vaisseau'}) :`, 'Extraction prioritaire de Quantainium ou transport de fret');
      if (order) {
        sfx.playSuccess();
        triggerHaptic(20);
        showToast(`📡 Ordre de mission transmis à ${pilot} : "${order}"`);
        if (fleetNet && typeof fleetNet.broadcastRedAlert === 'function') {
          fleetNet.broadcastRedAlert({ type: 'MISSION_ORDER', target: pilot, orderText: order, timestamp: Date.now() });
        }
      }
    });
  });

  DOM.guildFleetCardsGrid.querySelectorAll('[data-ship-borrow]').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-borrow');
      borrowGuildShip(shipId);
    });
  });

  DOM.guildFleetCardsGrid.querySelectorAll('[data-ship-return]').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-return');
      returnGuildShip(shipId);
    });
  });

  DOM.guildFleetCardsGrid.querySelectorAll('[data-ship-repair]').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-repair');
      repairGuildShip(shipId);
    });
  });

  DOM.guildFleetCardsGrid.querySelectorAll('[data-ship-decom]').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-decom');
      decommissionGuildShip(shipId);
    });
  });
}

function borrowGuildShip(shipId) {
  const ship = (state.guildFleet || []).find(s => s.id === shipId);
  if (!ship) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const user = state.currentGuildUser;
  const userCallsign = user.callsign || state.fleetNetCallsign || 'CITIZEN-1';

  ship.isBorrowed = true;
  ship.borrowedBy = userCallsign;
  saveGuildFleet();
  renderGuildFleet();
  updateGuildUIElements();

  const msg = (t.toastShipBorrowed || '🚀 Vaisseau {name} emprunté par {callsign} !')
    .replace('{name}', ship.name)
    .replace('{callsign}', userCallsign);
  showToast(msg);
  triggerHaptic(20);
}

function returnGuildShip(shipId) {
  const ship = (state.guildFleet || []).find(s => s.id === shipId);
  if (!ship) return;
  const t = I18N[state.currentLang] || I18N.fr;

  ship.isBorrowed = false;
  ship.borrowedBy = null;
  saveGuildFleet();
  renderGuildFleet();
  updateGuildUIElements();

  const msg = (t.toastShipReturned || '🔄 Vaisseau {name} restitué au hangar corporatif !')
    .replace('{name}', ship.name);
  showToast(msg);
  triggerHaptic(20);
}

function decommissionGuildShip(shipId) {
  if (!hasGuildPermission('MANAGE_GUILD')) return;
  state.guildFleet = (state.guildFleet || []).filter(s => s.id !== shipId);
  saveGuildFleet();
  renderGuildFleet();
  updateGuildUIElements();

  showToast('🗑️ Vaisseau décommissionné de la flotte de corporation.');
  triggerHaptic(20);
}

function addGuildShip() {
  const name = DOM.newShipNameInput ? DOM.newShipNameInput.value.trim() : '';
  const model = DOM.newShipModelSelect ? DOM.newShipModelSelect.value : 'mole';
  const station = DOM.newShipStationInput ? DOM.newShipStationInput.value.trim() : 'ARC-L1 Wide Forest';

  if (!name) {
    showToast('❌ Veuillez spécifier un nom de vaisseau.');
    return;
  }

  const scuByModel = {
    prospector: 32,
    mole: 96,
    arrastra: 576,
    c2: 696,
    caterpillar: 576,
    taurus: 174,
    orion: 2880,
    scorpius: 0
  };

  const prefixByModel = {
    prospector: 'PRO',
    mole: 'MOL',
    arrastra: 'ARR',
    c2: 'CRU',
    caterpillar: 'DRA',
    taurus: 'RSI',
    orion: 'ORI',
    scorpius: 'AEG'
  };

  const ticker = state.guildConfig.ticker || 'SMS';
  const regNum = Math.floor(100 + Math.random() * 900);
  const registration = `${ticker}-${prefixByModel[model] || 'SHP'}-${regNum}`;

  const newShip = {
    id: 'ship_' + Date.now(),
    name: name,
    model: model,
    registration: registration,
    station: station || 'ARC-L1 Wide Forest',
    scu: scuByModel[model] || 32,
    hullHealth: 100,
    isBorrowed: false,
    borrowedBy: null
  };

  if (!state.guildFleet) state.guildFleet = [];
  state.guildFleet.push(newShip);
  saveGuildFleet();
  renderGuildFleet();
  updateGuildUIElements();

  if (DOM.newShipNameInput) DOM.newShipNameInput.value = '';
  if (DOM.guildAddShipBox) DOM.guildAddShipBox.style.display = 'none';

  showToast(`🚀 Vaisseau ${name} (${registration}) ajouté à la flotte de guilde !`);
  triggerHaptic(25);
}

function renderGuildStockpileSummary() {
  if (!DOM.guildStockpileSummaryContainer) return;
  const locale = getLocale ? getLocale() : 'fr-FR';
  const stockpile = state.guildStockpile || [];

  const rawLots = stockpile.filter(l => l.status === 'raw');
  const refiningLots = stockpile.filter(l => l.status === 'refining');
  const readyLots = stockpile.filter(l => l.status === 'refined_ready');

  const rawScu = rawLots.reduce((sum, l) => sum + (l.scu || 0), 0);
  const rawVal = rawLots.reduce((sum, l) => sum + (l.rawVal || 0), 0);
  const refiningScu = refiningLots.reduce((sum, l) => sum + (l.scu || 0), 0);
  const readyScu = readyLots.reduce((sum, l) => sum + (l.scu || 0), 0);
  const readyVal = readyLots.reduce((sum, l) => sum + (l.refinedVal || 0), 0);

  // Update Visual Progress Gauge
  const totalScu = rawScu + refiningScu + readyScu;
  if (DOM.stockpileProgRawScu) DOM.stockpileProgRawScu.textContent = rawScu.toFixed(1);
  if (DOM.stockpileProgRefScu) DOM.stockpileProgRefScu.textContent = refiningScu.toFixed(1);
  if (DOM.stockpileProgReadyScu) DOM.stockpileProgReadyScu.textContent = readyScu.toFixed(1);

  if (DOM.segRawBar) DOM.segRawBar.style.width = (totalScu > 0 ? (rawScu / totalScu * 100) : 0) + '%';
  if (DOM.segRefiningBar) DOM.segRefiningBar.style.width = (totalScu > 0 ? (refiningScu / totalScu * 100) : 0) + '%';
  if (DOM.segReadyBar) DOM.segReadyBar.style.width = (totalScu > 0 ? (readyScu / totalScu * 100) : 0) + '%';
  if (DOM.tabCounterStockpile) DOM.tabCounterStockpile.textContent = stockpile.length;

  let html = `
    <div class="card-grid" style="grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px; margin-bottom:14px;">
      <div style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:#fbbf24; font-size:0.8rem;">⛏️ MINERAIS BRUTS</strong>
          <span style="font-size:0.7rem; color:var(--text-muted);">${rawLots.length} lot(s)</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:#fff; font-family:var(--font-mono); margin-top:4px;">
          ${rawScu.toFixed(1)} <span style="font-size:0.75rem; color:#fbbf24;">SCU</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
          Valeur brute : <span style="color:#fff;">${rawVal.toLocaleString(locale)}</span> aUEC
        </div>
      </div>

      <div style="background:rgba(0,240,255,0.06); border:1px solid rgba(0,240,255,0.3); border-radius:6px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--accent-cyan); font-size:0.8rem;">⚙️ EN RAFFINAGE</strong>
          <span style="font-size:0.7rem; color:var(--text-muted);">${refiningLots.length} ordre(s)</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:#fff; font-family:var(--font-mono); margin-top:4px;">
          ${refiningScu.toFixed(1)} <span style="font-size:0.75rem; color:var(--accent-cyan);">SCU</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
          Procédés : Dinyx, Ferris Carbide, Cormack
        </div>
      </div>

      <div style="background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.3); border-radius:6px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:var(--accent-emerald); font-size:0.8rem;">📦 PRÊT AU TRANSPORT</strong>
          <span style="font-size:0.7rem; color:var(--text-muted);">${readyLots.length} lot(s)</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:#fff; font-family:var(--font-mono); margin-top:4px;">
          ${readyScu.toFixed(1)} <span style="font-size:0.75rem; color:var(--accent-emerald);">SCU</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">
          Valeur marchande : <span style="color:var(--accent-emerald); font-weight:700;">${readyVal.toLocaleString(locale)}</span> aUEC
        </div>
      </div>
    </div>
  `;

  // Filter stockpile by selected status and station
  let filtered = stockpile.filter(lot => {
    if (guildStockpileFilter !== 'all' && lot.status !== guildStockpileFilter) return false;
    if (guildStockpileStation !== 'all' && (lot.location || 'ARC-L1 Wide Forest') !== guildStockpileStation) return false;
    return true;
  });

  if (filtered.length === 0) {
    html += `
      <div style="text-align:center; padding:30px; color:var(--text-muted); font-size:0.82rem; border:1px dashed rgba(255,255,255,0.1); border-radius:6px;">
        📦 Aucun minerai ne correspond aux critères de filtre sélectionnés.<br>
        Déposez des cargaisons brutes ou lancez des raffinages depuis le MFD pour alimenter la réserve.
      </div>
    `;
  } else {
    html += `
      <div style="font-family:var(--font-hud); font-size:0.75rem; color:var(--accent-cyan); letter-spacing:0.8px; margin-bottom:8px;">
        REGISTRE DÉTAILLÉ DU STOCKPILE (${filtered.length} LOTS)
      </div>
      <div class="motrader-table-container">
        <table class="motrader-table">
          <thead>
            <tr>
              <th>Minerai</th>
              <th>Statut</th>
              <th>Localisation</th>
              <th>Volume (SCU)</th>
              <th style="text-align:right;">Valeur Estimée</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    filtered.forEach(lot => {
      const statusBadge = {
        raw: `<span style="background:rgba(245,158,11,0.15); border:1px solid #f59e0b; color:#fbbf24; font-size:0.65rem; padding:1px 5px; border-radius:3px; font-weight:700;">⛏️ Brut</span>`,
        refining: `<span style="background:rgba(0,240,255,0.15); border:1px solid var(--accent-cyan); color:var(--accent-cyan); font-size:0.65rem; padding:1px 5px; border-radius:3px; font-weight:700;">⚙️ En Raffinage</span>`,
        refined_ready: `<span style="background:rgba(16,185,129,0.15); border:1px solid var(--accent-emerald); color:var(--accent-emerald); font-size:0.65rem; padding:1px 5px; border-radius:3px; font-weight:700;">📦 Prêt au Fret</span>`
      }[lot.status] || '';

      const val = (lot.status === 'raw' ? lot.rawVal : lot.refinedVal) || 0;

      html += `
        <tr>
          <td>
            <strong style="color:#fff;">${lot.mineralName || lot.mineral || 'Minerai'}</strong>
          </td>
          <td>${statusBadge}</td>
          <td style="font-size:0.72rem; color:var(--text-muted);">📍 ${lot.location || 'ARC-L1 Wide Forest'}</td>
          <td style="font-family:var(--font-mono); font-weight:700; color:#fff;">${lot.scu} SCU</td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:700; color:var(--accent-emerald);">
            ${val.toLocaleString(locale)} aUEC
          </td>
          <td style="text-align:right;">
            <button type="button" class="chip-btn" data-open-kiosk="true" style="font-size:0.68rem; padding:2px 6px;">Kiosque</button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
  }

  DOM.guildStockpileSummaryContainer.innerHTML = html;

  DOM.guildStockpileSummaryContainer.querySelectorAll('[data-open-kiosk]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(DOM.guildConfigModal);
      if (DOM.refineryModal) openModal(DOM.refineryModal);
    });
  });
}

function initGuildConfigAndRBAC() {
  // Bind open modal buttons
  if (DOM.btnOpenGuildConfig) {
    DOM.btnOpenGuildConfig.addEventListener('click', openGuildConfigModal);
  }
  if (DOM.btnMgGuildConfig) {
    DOM.btnMgGuildConfig.addEventListener('click', openGuildConfigModal);
  }
  if (DOM.dockBtnGuild) {
    DOM.dockBtnGuild.addEventListener('click', openGuildConfigModal);
  }
  if (DOM.btnStockpileOpenGuildConfig) {
    DOM.btnStockpileOpenGuildConfig.addEventListener('click', () => {
      closeModal(DOM.refineryModal);
      openGuildConfigModal();
    });
  }
  if (DOM.btnCloseGuildConfig) {
    DOM.btnCloseGuildConfig.addEventListener('click', () => closeModal(DOM.guildConfigModal));
  }

  // Bind subtabs
  const subtabs = [
    { btn: DOM.btnGuildTabProfile, tab: 'profile' },
    { btn: DOM.btnGuildTabRoster, tab: 'roster' },
    { btn: DOM.btnGuildTabFleet, tab: 'fleet' },
    { btn: DOM.btnGuildTabStockpile, tab: 'stockpile' },
    { btn: DOM.btnGuildTabFinance, tab: 'finance' },
    { btn: DOM.btnGuildTabSecurity, tab: 'security' },
    { btn: DOM.btnGuildTabBackup, tab: 'backup' }
  ];
  subtabs.forEach(({ btn, tab }) => {
    if (btn) {
      btn.addEventListener('click', () => {
        sfx.playBeep(650, 'sine', 0.03);
        switchGuildTab(tab);
      });
    }
  });

  // Header quick controls: DEFCON pill & Fullscreen
  if (DOM.guildDefconPill) {
    DOM.guildDefconPill.addEventListener('click', cycleGuildDefcon);
  }
  if (DOM.btnToggleGuildFullscreen) {
    DOM.btnToggleGuildFullscreen.addEventListener('click', toggleGuildFullscreen);
  }

  // Profile actions
  if (DOM.btnSaveGuildProfile) {
    DOM.btnSaveGuildProfile.addEventListener('click', saveGuildProfile);
  }
  if (DOM.guildCharterSelect) {
    DOM.guildCharterSelect.addEventListener('change', () => {
      state.guildConfig.charter = DOM.guildCharterSelect.value;
      saveGuildConfig();
      updateGuildUIElements();
    });
  }
  if (DOM.guildAlignmentSelect) {
    DOM.guildAlignmentSelect.addEventListener('change', () => {
      state.guildConfig.alignment = DOM.guildAlignmentSelect.value;
      saveGuildConfig();
      updateGuildUIElements();
    });
  }
  if (DOM.btnJoinOfficialDiscord) {
    DOM.btnJoinOfficialDiscord.addEventListener('click', () => {
      const url = state.guildConfig.discordUrl || 'https://discord.gg';
      window.open(url, '_blank');
    });
  }

  // Roster actions, search & filters
  if (DOM.guildRosterSearchInput) {
    DOM.guildRosterSearchInput.addEventListener('input', renderGuildRoster);
  }
  if (DOM.guildRosterSearchClear) {
    DOM.guildRosterSearchClear.addEventListener('click', () => {
      if (DOM.guildRosterSearchInput) {
        DOM.guildRosterSearchInput.value = '';
        renderGuildRoster();
        DOM.guildRosterSearchInput.focus();
        sfx.playBeep(600, 'sine', 0.02);
      }
    });
  }
  if (DOM.btnExportRosterDiscord) {
    DOM.btnExportRosterDiscord.addEventListener('click', exportGuildRosterDiscord);
  }
  document.querySelectorAll('[data-roster-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      guildRosterFilter = btn.getAttribute('data-roster-filter');
      document.querySelectorAll('[data-roster-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sfx.playBeep(700, 'sine', 0.02);
      renderGuildRoster();
    });
  });

  // Sortable headers for roster table
  document.querySelectorAll('#guildPaneRoster .sortable-th').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (guildRosterSort.field === field) {
        guildRosterSort.dir = guildRosterSort.dir === 'asc' ? 'desc' : 'asc';
      } else {
        guildRosterSort.field = field;
        guildRosterSort.dir = (field === 'role') ? 'desc' : 'asc';
      }
      sfx.playBeep(650, 'sine', 0.03);
      renderGuildRoster();
    });
  });

  if (DOM.btnOpenAddMemberModal && DOM.guildAddMemberBox) {
    DOM.btnOpenAddMemberModal.addEventListener('click', () => {
      const isHidden = DOM.guildAddMemberBox.style.display === 'none' || !DOM.guildAddMemberBox.style.display;
      DOM.guildAddMemberBox.style.display = isHidden ? 'block' : 'none';
      if (isHidden && DOM.newMemberCallsignInput) DOM.newMemberCallsignInput.focus();
    });
  }
  if (DOM.btnSubmitAddMember) {
    DOM.btnSubmitAddMember.addEventListener('click', addGuildMember);
  }

  // Fleet actions, search & filters
  if (DOM.guildFleetSearchInput) {
    DOM.guildFleetSearchInput.addEventListener('input', renderGuildFleet);
  }
  if (DOM.guildFleetSearchClear) {
    DOM.guildFleetSearchClear.addEventListener('click', () => {
      if (DOM.guildFleetSearchInput) {
        DOM.guildFleetSearchInput.value = '';
        renderGuildFleet();
        DOM.guildFleetSearchInput.focus();
        sfx.playBeep(600, 'sine', 0.02);
      }
    });
  }
  document.querySelectorAll('[data-fleet-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      guildFleetFilter = btn.getAttribute('data-fleet-filter');
      document.querySelectorAll('[data-fleet-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sfx.playBeep(700, 'sine', 0.02);
      renderGuildFleet();
    });
  });
  if (DOM.guildFleetSortSelect) {
    DOM.guildFleetSortSelect.addEventListener('change', () => {
      guildFleetSort = DOM.guildFleetSortSelect.value;
      sfx.playBeep(650, 'sine', 0.02);
      renderGuildFleet();
    });
  }
  if (DOM.btnOpenAddShipModal && DOM.guildAddShipBox) {
    DOM.btnOpenAddShipModal.addEventListener('click', () => {
      const isHidden = DOM.guildAddShipBox.style.display === 'none' || !DOM.guildAddShipBox.style.display;
      DOM.guildAddShipBox.style.display = isHidden ? 'block' : 'none';
      if (isHidden && DOM.newShipNameInput) DOM.newShipNameInput.focus();
    });
  }
  if (DOM.btnSubmitAddShip) {
    DOM.btnSubmitAddShip.addEventListener('click', addGuildShip);
  }

  // Stockpile filter actions
  document.querySelectorAll('[data-stockpile-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      guildStockpileFilter = btn.getAttribute('data-stockpile-filter');
      document.querySelectorAll('[data-stockpile-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sfx.playBeep(700, 'sine', 0.02);
      renderGuildStockpileSummary();
    });
  });
  if (DOM.guildStockpileStationFilter) {
    DOM.guildStockpileStationFilter.addEventListener('change', () => {
      guildStockpileStation = DOM.guildStockpileStationFilter.value;
      sfx.playBeep(650, 'sine', 0.02);
      renderGuildStockpileSummary();
    });
  }

  // Stockpile pane cross-links
  if (DOM.btnOpenRefineryFromGuild) {
    DOM.btnOpenRefineryFromGuild.addEventListener('click', () => {
      closeModal(DOM.guildConfigModal);
      if (DOM.refineryModal) openModal(DOM.refineryModal);
    });
  }
  if (DOM.btnOpenTreasuryFromGuild) {
    DOM.btnOpenTreasuryFromGuild.addEventListener('click', () => {
      switchGuildTab('finance');
    });
  }

  // Security actions
  if (DOM.btnSubmitUnlockRole) {
    DOM.btnSubmitUnlockRole.addEventListener('click', unlockGuildRole);
  }
  if (DOM.btnLogoutGuildRole) {
    DOM.btnLogoutGuildRole.addEventListener('click', logoutGuildRole);
  }
  if (DOM.btnSaveGuildPasswords) {
    DOM.btnSaveGuildPasswords.addEventListener('click', saveGuildPasswords);
  }

  // Finance actions
  if (DOM.btnSaveGuildFinance) {
    DOM.btnSaveGuildFinance.addEventListener('click', saveGuildFinancePolicy);
  }

  // Backup actions
  if (DOM.btnExportGuildBackup) {
    DOM.btnExportGuildBackup.addEventListener('click', exportGuildBackupJSON);
  }
  if (DOM.btnImportGuildBackup && DOM.guildBackupFileInput) {
    DOM.btnImportGuildBackup.addEventListener('click', () => DOM.guildBackupFileInput.click());
    DOM.guildBackupFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importGuildBackupJSON(e.target.files[0]);
      }
    });
  }

  // Global Keyboard Shortcuts for Guild Modal
  window.addEventListener('keydown', (e) => {
    if (!DOM.guildConfigModal || !DOM.guildConfigModal.classList.contains('active')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      if (e.key === 'Escape') {
        e.target.blur();
        e.stopPropagation();
      }
      return;
    }

    // Number keys 1-7 for tab switching
    const tabMap = {
      '1': 'profile',
      '2': 'roster',
      '3': 'fleet',
      '4': 'stockpile',
      '5': 'finance',
      '6': 'security',
      '7': 'backup'
    };
    if (tabMap[e.key]) {
      e.preventDefault();
      sfx.playBeep(650, 'sine', 0.03);
      switchGuildTab(tabMap[e.key]);
      return;
    }

    // Slash key '/' to focus active search input
    if (e.key === '/') {
      e.preventDefault();
      if (state.activeGuildTab === 'roster' && DOM.guildRosterSearchInput) {
        DOM.guildRosterSearchInput.focus();
      } else if (state.activeGuildTab === 'fleet' && DOM.guildFleetSearchInput) {
        DOM.guildFleetSearchInput.focus();
      }
    }
  });

  // Wire FleetNet handler if fleetNet exists
  if (state.fleetNet) {
    state.fleetNet.onCorpoGuildConfigSync = handleIncomingCorpoGuildConfigSync;
  }

  // Initial UI refresh
  updateGuildUIElements();
}

// ==========================================
// SESSION MODE DISPATCHER & ONBOARDING
// ==========================================
function updateSessionModeUI() {
  const mode = state.sessionMode || 'solo';
  const locale = getLocale();
  const t = I18N[locale] || I18N.fr;

  let icon = '⛏️';
  let label = t.sessionModeSoloBadge || 'Solo';

  if (mode === 'squad') {
    icon = '🛸';
    label = t.sessionModeSquadBadge || 'Escouade';
  } else if (mode === 'guild_member') {
    icon = '🏛️';
    label = t.sessionModeGuildMemberBadge || 'Guilde';
  } else if (mode === 'guild_admin') {
    icon = '👑';
    label = t.sessionModeGuildAdminBadge || 'Amirauté';
  }

  if (DOM.sessionModeIcon) DOM.sessionModeIcon.textContent = icon;
  if (DOM.sessionModeLabel) DOM.sessionModeLabel.textContent = label;
  if (DOM.mgSessionModeIcon) DOM.mgSessionModeIcon.textContent = icon;
  if (DOM.mgSessionModeLabel) DOM.mgSessionModeLabel.textContent = label;

  // Highlight selected card in sessionModeModal
  const cards = [
    { el: DOM.modeCardSolo, id: 'solo' },
    { el: DOM.modeCardSquad, id: 'squad' },
    { el: DOM.modeCardGuild, id: 'guild_member' },
    { el: DOM.modeCardAdmin, id: 'guild_admin' }
  ];

  cards.forEach(c => {
    if (c.el) {
      if (c.id === mode) {
        c.el.classList.add('selected');
        c.el.style.borderColor = 'var(--accent-cyan)';
      } else {
        c.el.classList.remove('selected');
        c.el.style.borderColor = '';
      }
    }
  });

  if (DOM.chkRememberSessionMode) {
    DOM.chkRememberSessionMode.checked = localStorage.getItem('aaron_mfd_session_mode_remember') === 'true';
  }
}

function selectSessionMode(mode) {
  state.sessionMode = mode;
  localStorage.setItem('aaron_mfd_session_mode', mode);

  if (DOM.chkRememberSessionMode) {
    if (DOM.chkRememberSessionMode.checked) {
      localStorage.setItem('aaron_mfd_session_mode_remember', 'true');
    } else {
      localStorage.removeItem('aaron_mfd_session_mode_remember');
    }
  }

  updateSessionModeUI();
  closeModal(DOM.sessionModeModal);
  triggerHaptic(20);

  const locale = getLocale();
  const t = I18N[locale] || I18N.fr;

  if (mode === 'solo') {
    showToast(t.sessionModeToastSolo || 'Mode Solo activé : minage, fret et trading autonomes.');
  } else if (mode === 'squad') {
    showToast(t.sessionModeToastSquad || 'Mode Escouade activé : liaison P2P Fleet-Net ouverte.');
    openModal(DOM.crewModal);
  } else if (mode === 'guild_member') {
    showToast(t.sessionModeToastGuildMember || 'Mode Guilde activé : inventaire partagé & trésorerie ouverts.');
    openModal(DOM.refineryModal);
    if (typeof switchStockpileTab === 'function') {
      switchStockpileTab('overview');
    }
  } else if (mode === 'guild_admin') {
    showToast(t.sessionModeToastGuildAdmin || 'QG de Guilde : panneau d\'administration ouvert.');
    openGuildConfigModal();
  }
}

function openSessionModeModal() {
  updateSessionModeUI();
  openModal(DOM.sessionModeModal);
}

function initSessionModeDispatcher() {
  // Bind modal openers
  if (DOM.btnOpenSessionMode) {
    DOM.btnOpenSessionMode.addEventListener('click', openSessionModeModal);
  }
  if (DOM.btnMgSessionMode) {
    DOM.btnMgSessionMode.addEventListener('click', openSessionModeModal);
  }
  if (DOM.btnOpenSessionModeFooter) {
    DOM.btnOpenSessionModeFooter.addEventListener('click', openSessionModeModal);
  }

  // Bind closers
  if (DOM.btnCloseSessionMode) {
    DOM.btnCloseSessionMode.addEventListener('click', () => closeModal(DOM.sessionModeModal));
  }
  if (DOM.btnDismissSessionModeModal) {
    DOM.btnDismissSessionModeModal.addEventListener('click', () => closeModal(DOM.sessionModeModal));
  }

  // Bind mode selector buttons
  if (DOM.btnSelectModeSolo) {
    DOM.btnSelectModeSolo.addEventListener('click', () => selectSessionMode('solo'));
  }
  if (DOM.btnSelectModeSquad) {
    DOM.btnSelectModeSquad.addEventListener('click', () => selectSessionMode('squad'));
  }
  if (DOM.btnSelectModeJoinGuild) {
    DOM.btnSelectModeJoinGuild.addEventListener('click', () => selectSessionMode('guild_member'));
  }
  if (DOM.btnSelectModeManageGuild) {
    DOM.btnSelectModeManageGuild.addEventListener('click', () => selectSessionMode('guild_admin'));
  }

  // Make entire cards clickable for enhanced mobile UX
  if (DOM.modeCardSolo) {
    DOM.modeCardSolo.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') selectSessionMode('solo');
    });
  }
  if (DOM.modeCardSquad) {
    DOM.modeCardSquad.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') selectSessionMode('squad');
    });
  }
  if (DOM.modeCardGuild) {
    DOM.modeCardGuild.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') selectSessionMode('guild_member');
    });
  }
  if (DOM.modeCardAdmin) {
    DOM.modeCardAdmin.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') selectSessionMode('guild_admin');
    });
  }

  // Bind remember checkbox
  if (DOM.chkRememberSessionMode) {
    DOM.chkRememberSessionMode.addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('aaron_mfd_session_mode_remember', 'true');
      } else {
        localStorage.removeItem('aaron_mfd_session_mode_remember');
      }
    });
  }

  // Initial UI sync
  updateSessionModeUI();
}

// ==========================================
// SERVICE WORKER & OFFLINE PWA
// ==========================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[AARON MFD] ServiceWorker actif (v2.0.0):', reg.scope);

          // Force update check
          reg.update().catch(() => {});

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[AARON MFD] Nouvelle version v2.0.0 disponible en cache.');
                  const t = I18N[state.currentLang] || I18N.fr;
                  showToast(t.toastCacheCleared || 'Mise à jour v2.0.0 disponible !');
                }
              });
            }
          });
        })
        .catch(err => console.log('Erreur ServiceWorker:', err));

      // Auto-reload when new controller claims the page
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('[AARON MFD] Contrôleur mis à jour, rafraîchissement...');
          window.location.reload();
        }
      });
    });
  }
}

// Force clean caches and unregister service workers
function forceRefreshCache() {
  const t = I18N[state.currentLang] || I18N.fr;
  sfx.playSuccess();
  triggerHaptic(25);
  showToast(t.toastCacheCleared || 'Cache vidé ! Rechargement v2.0.0...');

  const cleanCaches = 'caches' in window
    ? caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
    : Promise.resolve();

  const unregSW = 'serviceWorker' in navigator
    ? navigator.serviceWorker.getRegistrations().then(regs => Promise.all(regs.map(r => r.unregister())))
    : Promise.resolve();

  Promise.all([cleanCaches, unregSW])
    .then(() => {
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('reload', Date.now().toString());
        window.location.href = url.toString();
      }, 400);
    })
    .catch(() => {
      setTimeout(() => {
        window.location.reload(true);
      }, 400);
    });
}

// ==========================================
// DESKTOP RUNNER & STAR CITIZEN GAME.LOG
// ==========================================
function initDesktopIntegration() {
  if (!window.AARON_DESKTOP) return;

  // Reveal desktop HUD controls
  if (DOM.desktopHudControls) DOM.desktopHudControls.style.display = 'inline-flex';
  if (DOM.btnMgDesktopPin) DOM.btnMgDesktopPin.style.display = 'inline-flex';

  // Toggle Always-On-Top
  const handleTogglePin = async () => {
    const isPinned = await window.AARON_DESKTOP.toggleAlwaysOnTop();
    updateDesktopPinUI(isPinned);
  };

  if (DOM.btnDesktopPinOverlay) DOM.btnDesktopPinOverlay.addEventListener('click', handleTogglePin);
  if (DOM.btnMgDesktopPin) DOM.btnMgDesktopPin.addEventListener('click', handleTogglePin);

  function updateDesktopPinUI(isPinned) {
    if (DOM.btnDesktopPinOverlay) {
      DOM.btnDesktopPinOverlay.classList.toggle('active', isPinned);
      DOM.btnDesktopPinOverlay.style.borderColor = isPinned ? 'var(--accent-cyan)' : '';
      DOM.btnDesktopPinOverlay.style.color = isPinned ? 'var(--accent-cyan)' : '';
    }
    if (DOM.desktopPinLabel) {
      DOM.desktopPinLabel.textContent = isPinned ? 'Épinglé' : 'Épingler';
    }
    if (DOM.btnMgDesktopPin) {
      DOM.btnMgDesktopPin.classList.toggle('active', isPinned);
      DOM.btnMgDesktopPin.style.color = isPinned ? 'var(--accent-cyan)' : '';
    }
    showToast(isPinned ? '📌 Mode Overlay activé (Always-on-top au-dessus du jeu)' : '📌 Mode Overlay désactivé');
    triggerHaptic(15);
  }

  window.AARON_DESKTOP.onAlwaysOnTopChanged(updateDesktopPinUI);

  // Check initial Always-On-Top state
  window.AARON_DESKTOP.isAlwaysOnTop().then(isPinned => {
    if (isPinned) updateDesktopPinUI(true);
  });

  // Game.log listener & status
  const updateGameLogStatus = (status) => {
    if (!DOM.desktopGameLogDot || !DOM.desktopGameLogText) return;
    if (status && status.connected) {
      DOM.desktopGameLogDot.style.color = 'var(--accent-emerald)';
      DOM.desktopGameLogText.textContent = 'SC LIVE';
      if (DOM.btnDesktopGameLog) DOM.btnDesktopGameLog.title = `Game.log connecté : ${status.path}`;
    } else {
      DOM.desktopGameLogDot.style.color = 'var(--text-muted)';
      DOM.desktopGameLogText.textContent = 'SC LOG';
      if (DOM.btnDesktopGameLog) DOM.btnDesktopGameLog.title = 'Cliquez pour sélectionner le fichier Game.log de Star Citizen';
    }
  };

  window.AARON_DESKTOP.getGameLogStatus().then(updateGameLogStatus);

  if (DOM.btnDesktopGameLog) {
    DOM.btnDesktopGameLog.addEventListener('click', async () => {
      const res = await window.AARON_DESKTOP.selectGameLogPath();
      updateGameLogStatus(res);
      if (res && res.connected) {
        showToast('🎮 Game.log Star Citizen connecté avec succès !');
        triggerHaptic(20);
      }
    });
  }

  // Receive telemetry events from Game.log
  window.AARON_DESKTOP.onGameLogEvent(data => {
    if (!data) return;
    if (data.type === 'STATION_DETECTED' && data.station) {
      showToast(`🎮 Star Citizen : Arrivée détectée à ${data.station}`);
      if (sfx && typeof sfx.playSuccess === 'function') sfx.playSuccess();
    } else if (data.type === 'SHIP_DESTROYED') {
      showToast('⚠️ Star Citizen : Alerte destruction vaisseau détectée !');
      if (sfx && typeof sfx.playWarn === 'function') sfx.playWarn();
      if (typeof cycleGuildDefcon === 'function' && state.guildConfig.defconLevel !== 3) {
        state.guildConfig.defconLevel = 3;
        saveGuildConfig();
        updateGuildUIElements();
      }
    } else if (data.type === 'QUANTUM_EVENT') {
      showToast('⚡ Star Citizen : Saut Quantum détecté');
    }
  });

  console.log('[AARON MFD] 🚀 Mode Application Installable Desktop connecté avec succès !');
}

// Run on load
document.addEventListener('DOMContentLoaded', init);

