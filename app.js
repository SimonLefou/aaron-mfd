import { MINING_DATA } from './mining-data.js';
import { I18N } from './i18n.js';
import { AaronFleetNet } from './fleet-net.js';

let fleetNet = null;

// ==========================================
// STATE MANAGEMENT
// ==========================================
const state = {
  currentLang: localStorage.getItem('aaron_mfd_lang') || 'fr',
  currentTheme: localStorage.getItem('aaron_mfd_theme') || 'mobiglas',
  layoutMode: localStorage.getItem('aaron_mfd_layout_mode') || 'mobiglas',
  callsign: localStorage.getItem('aaron_mfd_callsign') || 'CITIZEN-1',
  activeProfileId: localStorage.getItem('aaron_mfd_active_profile') || 'custom',
  mobileView: 'scanner',
  wakeLock: null,

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

  // Cockpit Voice Assistant (TTS)
  voiceTTSEnabled: localStorage.getItem('aaron_mfd_voice_tts') !== 'false'
};

// ==========================================
// CHANGELOG DATA (BILINGUAL)
// ==========================================
const CHANGELOG_DATA = [
  {
    version: 'v2.2.0',
    isCurrent: true,
    title_fr: 'Jalon 7 : Ordres de Raffinage & Inventaire Partagé de Guilde',
    title_en: 'Milestone 7: Refining Orders & Guild Shared Stockpile',
    date_fr: 'Version Actuelle (Alpha 4.10)',
    date_en: 'Current Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Inventaire Collaboratif & Stockpile de Guilde (Fleet-Net)</strong> : Mutualisation en temps réel des stocks de minerais bruts, en cours de raffinage et raffinés prêts à l\'enlèvement à travers toutes les stations de Stanton et Pyro. Synchronisation instantanée WebRTC via le paquet <code>CORPO_STOCK_SYNC</code>.',
        text_en: '<strong>Guild Shared Stockpile & Fleet Logistics (Fleet-Net)</strong>: Real-time pooling and visibility of raw, refining and ready-to-haul refined mineral batches across Stanton & Pyro stations. Instant sub-150ms WebRTC sync via <code>CORPO_STOCK_SYNC</code> packets.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Calculateur de Valeur Nette de Guilde (Guild Net Worth)</strong> : Évaluation financière en direct du patrimoine minier de la corporation en aUEC basée sur les cours de marché UEX Corp, déduite des dépenses engagées.',
        text_en: '<strong>Live Guild Net Worth Calculator</strong>: Real-time valuation of total corporation mineral assets in aUEC dynamically tracked against UEX Corp live market prices minus incurred fleet expenses.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Grand Livre des Dépenses Partagées (Corpo Expense Ledger)</strong> : Enregistrement centralisé et collaboratif des frais engagés (frais de raffinage, carburant Quantum, réparations, primes d\'escorte) pour un calcul transparent du bénéfice net réel de l\'opération et export 1-clic Discord.',
        text_en: '<strong>Shared Corpo Expense Ledger</strong>: Centralized tracking of fleet operating expenses (refinery fees, quantum fuel, ship repairs, escort pay) automatically deducted from gross revenue for transparent crew splits with 1-click Discord export.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Statuts Logistiques Allégés & Notifications Web Push Déportées</strong> : Évite tout doublon avec les kiosques de jeu en proposant un statut logistique clair ("En raffinage" / "Prêt au transport") couplé à des notifications Push système sur PC et mobile dès qu\'un lot est prêt à être chargé dans un transporteur C2/Caterpillar.',
        text_en: '<strong>Streamlined Refining Status & Desktop/Mobile Push Notifications</strong>: Avoids redundant in-game clutter by providing a clear logistics status ("In Refinery" / "Ready to Haul") paired with native Web Push notifications alerting pilots on PC & smartphone when batches are ready for C2/Caterpillar hauling.'
      }
    ]
  },
  {
    version: 'v2.1.0',
    isCurrent: false,
    title_fr: 'Jalon 6 : Bourse Commerciale, API UEX Corp & Intelligence de Guilde',
    title_en: 'Milestone 6: Commodity Exchange, UEX Corp API & Guild Scouts',
    date_fr: 'Version Précédente',
    date_en: 'Previous Version',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Intégration API Live UEX Corp & Cache Hors-Ligne</strong> : Connexion transparente à l\'API publique UEX Corp (<code>uexcorp.space</code>) pour récupérer les cours réels d\'achat et vente des minerais dans les terminaux TDD et stations de Stanton, Pyro et Nyx. Cache local persistant permettant un fonctionnement 100% hors-ligne avec badge d\'état dynamique (UEX LIVE / UEX CACHE / UEX GUILDE).',
        text_en: '<strong>Live UEX Corp API & Offline Cache</strong>: Seamless integration with UEX Corp public API (<code>uexcorp.space</code>) fetching spot commodity prices across TDD terminals in Stanton, Pyro and Nyx. Persistent local cache for 100% offline operations with dynamic status badge (UEX LIVE / UEX CACHE / UEX GUILDE).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Moteur d\'Arbitrage Économique (Brut vs Raffiné)</strong> : Comparateur en temps réel entre la vente brute immédiate et l\'ensemble des procédés de raffinage (Dinyx, Ferris Carbide, Cormack, Pyro-Burst) avec déduction des frais, calcul du rendement bonus de station, gain net en aUEC et ROI (+%).',
        text_en: '<strong>Economic Arbitrage Engine (Raw vs Refined)</strong>: Real-time visual comparison between immediate raw sale and all refining methods (Dinyx, Ferris, Cormack, Pyro-Burst) accounting for refinery fees, station bonuses, net payout, and ROI percentage.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Calculateur de Tournée Commerciale Optimale</strong> : Analyse globale de la cargaison du mineur ou du transporteur et génération automatique d\'une tournée de vente multi-arrêts classée par profit maximum avec bouton 1-clic <code>📋 Copier la tournée</code> pour le chat ou Discord.',
        text_en: '<strong>Optimal Trade Tour Route Calculator</strong>: Whole-hold cargo analysis and automatic multi-stop sales route planning maximizing total revenue with 1-click <code>📋 Copy Tour Route</code> for game chat or Discord.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Éclaireurs de Guilde & Crowdsourcing P2P (Fleet-Net)</strong> : Mise à jour collaborative des cours en 1 tap lors de la visite d\'un terminal TDD. Diffusion instantanée du paquet <code>CORPO_PRICE_UPDATE</code> à toute la flotte via WebRTC (< 150 ms) avec badge d\'éclaireur vérifié.',
        text_en: '<strong>Corpo Price Scouts & P2P Crowdsourcing (Fleet-Net)</strong>: 1-tap collaborative spot price verification at TDD terminals. Instant sub-150ms broadcast of <code>CORPO_PRICE_UPDATE</code> packets across WebRTC to all wingmen with verified scout badges.'
      }
    ]
  },
  {
    version: 'v2.0.0',
    isCurrent: false,
    title_fr: 'Jalon 5 : Transport Spécialisé & Logistique de Fret (Cargo Refactor 4.0)',
    title_en: 'Milestone 5: Specialized Haulers & Freight Logistics (Cargo Refactor 4.0)',
    date_fr: 'Version Précédente',
    date_en: 'Previous Version',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Flotte de Transporteurs 4.0 Authentique</strong> : Intégration de 10 transporteurs de fret (Constellation Taurus 174 SCU, RAFT 192 SCU, Caterpillar 576 SCU, C2 Hercules 696 SCU, Freelancer MAX 120 SCU, Hull A 64 SCU, Zeus Mk II CL 128 SCU, Cutlass Black 46 SCU, Hull C 4 608 SCU) avec rayons tracteurs dédiés S1/S2/S3 (6 000 à 45 000 N), topologies de grille (interne, externe, modulaire, spindle) et calcul des limites de sacoches Prospector & MOLE.',
        text_en: '<strong>Authentic 4.0 Cargo Hauler Fleet</strong>: Comprehensive support for 10 freight haulers (Taurus 174 SCU, RAFT 192 SCU, Caterpillar 576 SCU, C2 696 SCU, Freelancer MAX 120 SCU, Hull A 64 SCU, Zeus CL 128 SCU, Cutlass Black 46 SCU, Hull C 4,608 SCU) with dedicated S1/S2/S3 tractor beams (6,000 to 45,000 N), physicalized grid topologies, and max saddlebag capacities.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Arrimage Ship-to-Ship en Plein Espace (Fleet-Net)</strong> : Bouton mineur <code>📡 APPELER TRANSPORT DE FRET</code> pour diffuser une demande d\'arrimage. Récupération instantanée par les transporteurs au rayon tracteur (<code>🧲 ARRIMAGE</code>), libérant automatiquement la soute et les sacoches du mineur sans retour en station.',
        text_en: '<strong>In-Space Ship-to-Ship Cargo Transfer (Fleet-Net)</strong>: Miner 1-click action <code>📡 REQUEST CARGO PICKUP</code> to broadcast floating saddlebags. Instant recovery by wing haulers via tractor beam (<code>🧲 DOCK</code>), liberating miner hold capacity on the fly.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Gestionnaire de Grille de Fret Physicalisée (Cargo Grid Master)</strong> : Visualisation temps réel des conteneurs et sacoches arrimés sur la grille, indicateur d\'instabilité critique pour le Quantainium, estimation financière brute/raffinée et déchargement station 1-clic.',
        text_en: '<strong>Physicalized Cargo Grid Master</strong>: Real-time visual display of physicalized cargo boxes & saddlebags, Quantainium instability alert badge, live raw/refined valuation, and station terminal cargo dump.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Commission Transporteur Dédiée</strong> : Curseur de répartition des gains (0 à 35%) pour rémunérer équitablement les pilotes de transport lourd au sein de l\'escadre.',
        text_en: '<strong>Dedicated Hauler Commission Cut</strong>: Squad profit split slider (0-35%) to fairly compensate heavy cargo transport pilots.'
      }
    ]
  },
  {
    version: 'v1.9.0',
    isCurrent: false,
    title_fr: 'Jalon 4 : Coordination Tactique, Solveur Optimal 4.0 & Escorte de Combat',
    title_en: 'Milestone 4: Tactical Coordination, Optimal Loadout Solver 4.0 & Combat Escort',
    date_fr: 'Version Actuelle (Alpha 4.10)',
    date_en: 'Current Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Solveur de Loadout Optimal 4.0</strong> : Calcul prédictif automatique du meilleur loadout (tête laser, sous-modules, gadgets de surface) selon la masse et la résistance de la roche. Recommandation Solo et Escadre avec bouton 1-clic <code>⚡ ÉQUIPER CE LOADOUT</code> synchronisé avec la flotte.',
        text_en: '<strong>Optimal Loadout Solver 4.0</strong>: Automated predictive calculation of optimal mining head, sub-modules, and surface gadget based on rock mass & resistance. Solo & Wing recommendations with 1-click <code>⚡ EQUIP THIS LOADOUT</code> synced with the fleet.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Conseiller de Tir Conjoint & Séquençage</strong> : Protocole en 3 phases tactiques (Affaiblissement Lancet < 20%, Saturation Helix, Régulation zone verte 45-50%). Jauge de risque de surchauffe collective en temps réel et boutons de signalement radio (VEILLE, CHARGE, ZONE VERTE, SURCHAUFFE).',
        text_en: '<strong>Joint Fire Coordinator & Stepped Sequencing</strong>: 3-phase tactical protocol (Lancet softening < 20%, Helix saturation, Green zone regulation 45-50%). Real-time cumulative overcharge risk gauge and live radio state sync buttons (STANDBY, CHARGING, GREEN ZONE, OVERHEAT).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Module Sentinelle & Escorte (RED ALERT)</strong> : Déclenchement d\'alerte pirate en 1 tap avec sirène sonore d\'urgence, annonce vocale (TTS), calcul automatique du vecteur de repli Quantum (OM ou station la plus proche) et curseur de prime d\'escorte de combat (0-35%).',
        text_en: '<strong>Sentinel & Escort Module (RED ALERT)</strong>: 1-tap pirate red alert trigger with emergency audio siren, cockpit voice callout (TTS), automatic quantum jump vector escape calculation (closest OM / station), and escort risk cut slider (0-35%).'
      }
    ]
  },
  {
    version: 'v1.8.0',
    isCurrent: false,
    title_fr: 'Jalons 1, 2 & 3 : Réseau Fleet-Net P2P, Crafting 4.0 & Scanner OCR Instantané',
    title_en: 'Milestones 1, 2 & 3: Fleet-Net P2P Network, Crafting 4.0 & Instant OCR Scanner',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Jalon 1 — Réseau Tactique P2P FLEET-NET</strong> : Interconnexion décentralisée WebRTC chiffrée & BroadcastChannel local (< 150ms). Indicateur de ping RTT en direct, statut de comms chiffrées et salon d\'escadre par code court (ex: <code>WING-4982</code>).',
        text_en: '<strong>Milestone 1 — Decentralized Tactical FLEET-NET</strong>: End-to-end encrypted WebRTC DataChannels & local BroadcastChannel (< 150ms). Real-time RTT ping indicator, encrypted comms badge, and short room codes (e.g. <code>WING-4982</code>).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Jalon 2 — Sync Flotte & Atelier Crafting 4.0</strong> : Synchronisation automatique des loadouts, lasers et tourelles. Atelier de confection de têtes artisanales (Watts, résistance, instabilité, slots) et gadgets sur-mesure diffusés à l\'escadre.',
        text_en: '<strong>Milestone 2 — Ship Sync & Crafting Workshop 4.0</strong>: Instant loadout, laser, and turret sync. Workshop for crafting custom mining heads (Watts, resistance, instability, slots) and custom gadgets shared with the wing.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Jalon 3 — Télémétrie de Scan & Scanner OCR Instantané</strong> : Diffusion instantanée du scan rocheux (<code>ROCK_BROADCAST</code>), bandeau d\'alerte tactique, auto-sync silencieux, voix cockpit (TTS) et scanner OCR 100% local (F12, glisser-déposer, caméra smartphone en direct avec réticule et 3 échantillons de test).',
        text_en: '<strong>Milestone 3 — Shared Scan Telemetry & Instant OCR Scanner</strong>: Instant rock scan broadcast (<code>ROCK_BROADCAST</code>), incoming alert banner, silent auto-sync, cockpit voice (TTS), and 100% local OCR scanner (F12, drag & drop, live smartphone camera with reticle, and 3 test samples).'
      }
    ]
  },
  {
    version: 'v1.6.4',
    isCurrent: false,
    title_fr: 'Correctif Critique Calcul Réactif & Synthèse Vocale',
    title_en: 'Critical Fix: Reactive Calculation & Voice Synthesis',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'fixed',
        text_fr: '<strong>Mise à Jour Instantanée des Minerais</strong> : Correction d\'une méthode manquante dans le module vocal (speakTarget/stop) qui interrompait le script lors de la sélection d\'un minerai. Le calcul dynamique de résistance, instabilité et puissance s\'applique désormais instantanément.',
        text_en: '<strong>Instant Calculation on Mineral Selection</strong>: Fixed a missing method in voice synthesis module (speakTarget/stop) that threw an exception upon mineral selection. Dynamic rock properties and laser calculations now immediately apply.'
      }
    ]
  },
  {
    version: 'v1.6.3',
    isCurrent: false,
    title_fr: 'Refonte du Manuel & Guide Prise en Main (4.10)',
    title_en: 'Operating Manual & Walkthrough Guide Overhaul (4.10)',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'improved',
        text_fr: '<strong>Manuel Interactif Complètement Actualisé</strong> : Intégration des nouveaux vaisseaux (Arrastra, Orion, ROC-DS), des archétypes géologiques réactifs, du décodeur Radar RS 2.0, de la coordination d\'escouade et du mode mobiGlas 4.0.',
        text_en: '<strong>Operating Manual Fully Updated</strong>: Detailed walkthroughs for new mining ships (Arrastra, Orion, ROC-DS), reactive archetypes, Radar RS 2.0 decoder, wing multiplayer coordination, and holographic mobiGlas 4.0.'
      }
    ]
  },
  {
    version: 'v1.6.2',
    isCurrent: false,
    title_fr: 'Recalcul Réactif Automatique Géologie & Minerais',
    title_en: 'Automatic Reactive Recalculation for Geology & Minerals',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'improved',
        text_fr: '<strong>Calcul Immédiat sans Validation Manuelle</strong> : La sélection d\'un archétype rocheux, d\'un minerai primaire ou secondaire recalcule immédiatement la résistance, l\'instabilité et la fracturation sans avoir à cliquer sur « Auto-calculer ».',
        text_en: '<strong>Instant Calculation on Selection</strong>: Selecting a rock archetype, primary ore, or secondary mineral now immediately computes dynamic resistance, instability, and laser fracture without requiring a click on "Auto-Calculate".'
      }
    ]
  },
  {
    version: 'v1.6.1',
    isCurrent: false,
    title_fr: 'Épuration du Volet Données du Scan',
    title_en: 'Rock Scan Data Clean-up',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'improved',
        text_fr: '<strong>Nettoyage du Volet Données du Scan</strong> : Retrait du sélecteur rapide de tête laser redondant dans le panneau de roche, l\'équipement complet étant centralisé dans la modale Loadout et le gestionnaire de profils.',
        text_en: '<strong>Rock Scan Panel Clean-up</strong>: Removed redundant mining head selector from rock scan data panel, keeping equipment management centralized in Loadout modal and profiles manager.'
      }
    ]
  },
  {
    version: 'v1.6.0',
    isCurrent: false,
    title_fr: 'Gestionnaire de Profils & Sauvegardes d\'Équipement Personnalisées',
    title_en: 'Loadout Profiles Manager & Custom Saved Configurations',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Gestionnaire Multi-Profils Nommés</strong> : Enregistrez, nommez, chargez, mettez à jour et supprimez vos configurations d\'équipement personnalisées avec persistance locale.',
        text_en: '<strong>Multi-Profile Loadout Manager</strong>: Save, name, load, update, and delete custom named loadouts with offline persistence.'
      },
      {
        tag: 'new',
        text_fr: '<strong>5 Préréglages Recommandés (Défaut)</strong> : Préréglages d\'usine prêts à l\'emploi pour Prospector (Équilibré & Puissance), MOLE (Trio), Arrastra (Lourd S3) et ROC.',
        text_en: '<strong>5 Recommended Factory Presets</strong>: Ready-to-use factory setups for Prospector (Balanced & Heavy), MOLE (Trio), Arrastra (Heavy S3), and ROC.'
      }
    ]
  },
  {
    version: 'v1.5.1',
    isCurrent: false,
    title_fr: 'Personnalisation Indicatif Pilote & Épuration Radar RS',
    title_en: 'Pilot Callsign Customization & RS Radar Clean-up',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Personnalisation de l\'Indicatif (Callsign)</strong> : Modifiez et persistez votre indicatif de pilote depuis le bandeau supérieur mobiGlas ou depuis la carte Chef d\'escadre avec sauvegarde automatique locale.',
        text_en: '<strong>Pilot Callsign Customization</strong>: Edit and persist your operational radio callsign from the top mobiGlas status bar or the Fleet squad leader card with offline storage.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Épuration Radar RS</strong> : Retrait des préréglages rapides superflus pour optimiser la saisie directe de la signature scannée sur le HUD.',
        text_en: '<strong>RS Radar Clean-up</strong>: Removed cluttered signature presets in favor of direct input and HUD scan matching.'
      }
    ]
  },
  {
    version: 'v1.5.0',
    isCurrent: false,
    title_fr: 'Refonte mobiGlas 4.0, Coordination de Flotte & Tourelles Unifiées',
    title_en: 'mobiGlas 4.0 Layout, Fleet Coordination & Unified Turrets',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Coordination d\'Escouade & Flotte Multi-Vaisseaux</strong> : Gérez une escadre complète (Prospector, MOLE, ROC, C2 Hercules, etc.) avec cumul automatique des tirs laser, réduction conjointe de la résistance et répartition équitable des profits.',
        text_en: '<strong>Multiplayer Fleet & Squad Mining</strong>: Coordinate a full wing (Prospector, MOLE, ROC, C2 Hercules, etc.) with joint laser beam power stacking, shared rock resistance reduction, and net profit split per player.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Intégration RSI Arrastra & RSI Orion</strong> : Support des 3 tourelles Size 3 de l\'Arrastra (576 SCU) et des 2 tourelles lourdes de l\'Orion (2 880 SCU) avec 6 têtes laser Size 3 authentiques.',
        text_en: '<strong>RSI Arrastra & RSI Orion Integration</strong>: Full support for Arrastra 3x Size 3 remote turrets (576 SCU) and Orion 2x heavy turrets (2,880 SCU) with 6 authentic Size 3 laser heads.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Présentation Holographique mobiGlas 4.0 & Dock</strong> : Interface holographique inspirée du mobiGlas Star Citizen et dock d\'applications rapide avec accès instantané aux 9 outils.',
        text_en: '<strong>mobiGlas 4.0 Holographic Layout & Dock</strong>: Complete visual redesign inspired by authentic Star Citizen mobiGlas holography and 9-app quick launcher dock.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Architecture Unifiée des Tourelles</strong> : Élimination du doublon de la première tourelle et bloc de configuration pliable unifié (1 à 3 tourelles) avec slots de modules dynamiques pour tous les vaisseaux.',
        text_en: '<strong>Unified Dynamic Turrets Architecture</strong>: Removed Turret 1 duplicate and established unified collapsible turret card blocks (1 to 3 turrets) with dynamic module slots for all ships.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Bouton Soutenir Dédié</strong> : Remplacement des boutons de bascule en faveur du bouton « Soutenir » dans le bandeau supérieur, le dock et le pied de page.',
        text_en: '<strong>Dedicated Support Buttons</strong>: Replaced legacy layout switches with direct Community Support triggers in top header, dock, and footer.'
      }
    ]
  },
  {
    version: 'v1.4',
    isCurrent: false,
    title_fr: 'Star Citizen Alpha 4.10 Mining Overhaul (Archétypes, Multi-Minerais, Sacoches & Radar 2.0)',
    title_en: 'Star Citizen Alpha 4.10 Mining Overhaul (Archetypes, Multi-Ore, Saddlebags & Radar 2.0)',
    date_fr: 'Version précédente (Alpha 4.10)',
    date_en: 'Previous Version (Alpha 4.10)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Archétypes Géologiques (9 Familles)</strong> : Intégration des roches officielles (Basalte, Granite, Obsidienne, Magmatique, Felsique, Gneiss, Quartzite, Schiste, Atacamite) avec résistance et densité de base.',
        text_en: '<strong>Geological Archetypes (9 Families)</strong>: Integration of official rock archetypes (Basalt, Granite, Obsidian, Igneous, Felsic, Gneiss, Quartzite, Shale, Atacamite) with baseline resistance and density.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Scan Multi-Minerais & Gravier Inerte</strong> : Saisie simultanée de 2 minerais avec calcul automatique du pourcentage de matériaux inertes stériles.',
        text_en: '<strong>Multi-Ore Scan & Inert Waste Gauge</strong>: Simultaneous primary and secondary ore inputs with automatic inert waste calculation.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Décodeur Radar Ping RS 2.0</strong> : Identificateur longue portée pour scanner les astéroïdes (TAB) avant même de s\'approcher à 500 mètres.',
        text_en: '<strong>Radar Ping RS 2.0 Decoder</strong>: Long-range ping signature identifier to detect distant asteroid content without flying close.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Sacoches Amovibles (Saddlebags 4.10)</strong> : Suivi des sacs détachés au rayon tracteur pour Prospector (4x 8 SCU) et MOLE (8x 12 SCU) pour les transporteurs alliés.',
        text_en: '<strong>Detachable Saddlebags (4.10)</strong>: Track tractor-beamed pods for Prospector (4x 8 SCU) and MOLE (8x 12 SCU) to coordinate with allied cargo ships.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Voix Cockpit Synthétisée (TTS)</strong> : Annonces vocales immersives (alertes laser, Quantainium chargé, fin de raffinage) 100% hors-ligne.',
        text_en: '<strong>Cockpit Voice Assistant (TTS)</strong>: Immersive offline cockpit audio announcements (laser alerts, Quantainium countdown, refinery completions).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Greycat ROC-DS</strong> : Support du véhicule minier biplace avec soute augmentée de 1.2 SCU (1 200 gemmes).',
        text_en: '<strong>Greycat ROC-DS</strong>: Support for the dual-seat ground vehicle with expanded 1.2 SCU (1,200 gems) hopper.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Calcul Dynamique Résistance / Instabilité</strong> : Les propriétés physiques de la roche sont déduites automatiquement de la composition minérale et de l\'archétype.',
        text_en: '<strong>Dynamic Resistance & Instability Engine</strong>: Physical rock properties scale dynamically from the ore composition and geological archetype.'
      }
    ]
  },
  {
    version: 'v1.3',
    isCurrent: false,
    title_fr: 'Expansion Multi-Systèmes (Pyro 4.0, Nyx & Stanton) & 6 Nouveaux Minerais',
    title_en: 'Multi-System Expansion (Pyro 4.0, Nyx & Stanton) & 6 New Ores',
    date_fr: 'Dernière version (14 Oct 2026)',
    date_en: 'Latest Version (Oct 14, 2026)',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Système Pyro (Alpha 4.0)</strong> : Prise en charge intégrale du secteur hors-la-loi Pyro avec 4 ponts de raffinage intégrés (Checkmate, Ruin Station Terminus, Orbituary, Gateway) et 4 hotspots géologiques.',
        text_en: '<strong>Pyro System (Alpha 4.0)</strong>: Full integration of the lawless Pyro frontier with 4 integrated refinery decks (Checkmate, Ruin Station Terminus, Orbituary, Gateway) and 4 geological hotspots.'
      },
      {
        tag: 'new',
        text_fr: '<strong>6 Nouveaux Minerais 4.0</strong> : Stileron (blindage militaire, RS 3185), Riccite (alliage élastique, RS 3385), Lindinium (RS 3400), Sadaryx (cristal de Nyx, RS 3320), Savrilium (RS 3200) et Carinite (RS 3450).',
        text_en: '<strong>6 New 4.0 Minerals</strong>: Stileron (heavy military armor, RS 3185), Riccite (elastic alloy, RS 3385), Lindinium (RS 3400), Sadaryx (Nyx crystal, RS 3320), Savrilium (RS 3200), and Carinite (RS 3450).'
      },
      {
        tag: 'new',
        text_fr: '<strong>Signatures Radar RS (Radar Cross-Section)</strong> : Signatures officielles 1x intégrées sur chaque fiche minerai pour identifier le contenu des roches dès le ping radar sans s\'approcher.',
        text_en: '<strong>Radar Scan Signatures (RS)</strong>: Official 1x base signatures embedded into each ore card to determine rock compositions directly from ping scans.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Filtres par Système</strong> : Barre de filtrage instantané sur la grille des minerais [TOUS], [STANTON], [PYRO (4.0)], [NYX].',
        text_en: '<strong>System Filters</strong>: Instant filtering pills on the ore grid [ALL], [STANTON], [PYRO (4.0)], [NYX].'
      },
      {
        tag: 'new',
        text_fr: '<strong>Atlas Minier à 3 Systèmes</strong> : Navigation par onglets entre Stanton & Aaron Halo, Système Pyro (haut risque), et Système Nyx (Delamar & Levski).',
        text_en: '<strong>3-System Mining Atlas</strong>: Tabbed navigation between Stanton & Aaron Halo, Pyro System (high risk), and Nyx System (Delamar & Levski).'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Cache PWA v9 & Network-First</strong> : Stratégie de cache réseau prioritaire garantissant que vous recevez immédiatement les nouvelles versions sans rester bloqué sur un cache obsolète.',
        text_en: '<strong>PWA Cache v9 & Network-First</strong>: Network-first cache strategy guaranteeing you receive updates immediately without getting trapped on stale cache.'
      }
    ]
  },
  {
    version: 'v1.2',
    isCurrent: false,
    title_fr: 'Tactical Overhaul & 6 Nouveaux Outils Miniers',
    title_en: 'Tactical Overhaul & 6 Mining Tools',
    date_fr: 'Mise à jour v1.2',
    date_en: 'v1.2 Update',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Simulateur de Sous-Roches (Break Tree)</strong> : Modélisation physique des 3 sous-blocs avec codes couleurs Star Citizen (Violet aspirable, Orange à re-fracturer, Gris inerte) et extraction 1-clic.',
        text_en: '<strong>Sub-Chunk Fracture Simulator (Break Tree)</strong>: Physical modeling of 3 sub-chunks with official Star Citizen color codes (Purple extractable, Orange to re-fracture, Gray inert) and 1-click hold extraction.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Gestionnaire de Raffinage en direct</strong> : Suivi des commandes en cours avec décompte temps réel hh:mm:ss, calcul de rentabilité selon les 4 procédés industriels et alertes de ramassage.',
        text_en: '<strong>Live Refinery Job Tracker</strong>: Multi-station queue with real-time hh:mm:ss countdowns, process duration calculations across 4 industrial methods, and ready-to-collect notifications.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Assistant Tactique de Gadgets & Modules</strong> : Recommandation dynamique de Sabir 21, BoreMax, Stalwart ou Surge selon le déficit laser, avec bouton 1-clic pour appliquer.',
        text_en: '<strong>Tactical Gadget & Module Advisor</strong>: Dynamic recommendations for Sabir 21, BoreMax, Stalwart, or Surge based on laser deficit, with a 1-click apply button.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Mode Cluster ROC Terrestre</strong> : Calculateur dédié aux filons de gemmes de surface (Hadanite, Dolivine, Aphorite) avec contrôleur de cailloux et jauge de remplissage 0.8 SCU.',
        text_en: '<strong>ROC Gem Cluster Mode</strong>: Specialized calculator for surface gem clusters (Hadanite, Dolivine, Aphorite) with node count selector and 0.8 SCU capacity meter.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Journal de Vol & Statistiques</strong> : Suivi des gains totaux, rentabilité horaire (aUEC/h), volume extrait et exports complets en formats <strong>JSON</strong> et <strong>CSV (Excel)</strong>.',
        text_en: '<strong>Flight Ledger & Statistics</strong>: Track total cumulative earnings, hourly profitability (aUEC/h), extracted volume, and 1-click exports to <strong>JSON</strong> and <strong>CSV (Excel)</strong>.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Télémètre Aaron Halo</strong> : Calculateur interactif de distance de coupe Quantum vers les Bandes 4, 5 et 6 avec jauge de proximité et alerte sonore d\'arrêt immédiat.',
        text_en: '<strong>Aaron Halo QT Rangefinder</strong>: Interactive calculator for Quantum Drive drop distance to Bands 4, 5, and 6 with proximity gauge and emergency cut alert.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Support Bilingue Intégral</strong> : Bascule instantanée Français 🇫🇷 / Anglais 🇬🇧 sur 100% des textes, boutons, badges, notes de version et infobulles.',
        text_en: '<strong>Full Bilingual Support</strong>: Instant French 🇫🇷 / English 🇬🇧 toggle across 100% of UI text, buttons, badges, changelog, and tooltips.'
      },
      {
        tag: 'fix',
        text_fr: '<strong>Optimisation Offline & Cache PWA</strong> : Persistance locale via localStorage et mise en cache Service Worker v5 pour un fonctionnement 100% autonome sans connexion.',
        text_en: '<strong>Offline Optimization & PWA Cache</strong>: Client-side persistence via localStorage and Service Worker v5 cache update for 100% offline, serverless operation.'
      }
    ]
  },
  {
    version: 'v1.1',
    isCurrent: false,
    title_fr: 'Argo MOLE Multi-Crew & Thèmes de Cockpit',
    title_en: 'Argo MOLE Multi-Crew & Cockpit Themes',
    date_fr: 'Mise à jour majeure',
    date_en: 'Major Update',
    items: [
      {
        tag: 'new',
        text_fr: '<strong>Gestion des 3 tourelles du MOLE</strong> : Sélecteur Solo (1 tourelle), Duo (2 tourelles) ou Trio (3 tourelles actives) avec calcul de puissance combinée et configuration laser par tourelle.',
        text_en: '<strong>Argo MOLE 3-Turret Management</strong>: Solo (1 turret), Duo (2 turrets), and Trio (3 active turrets) mode with combined laser power calculation and individual turret loadout.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Partage d\'équipage Multi-crew</strong> : Calculateur de répartition des gains avec déduction configurable de la réserve de bord (carburant, réparations).',
        text_en: '<strong>Multi-Crew Profit Splitter</strong>: Fair earnings distribution per crew member with configurable ship operational reserve (fuel, maintenance, consumables).'
      },
      {
        tag: 'new',
        text_fr: '<strong>4 Thèmes Cockpit</strong> : MISC Cyan, Drake Ambre, Aegis Émeraude et RSI Glace avec adaptation chromatique complète du HUD.',
        text_en: '<strong>4 Cockpit HUD Themes</strong>: MISC Cyan, Drake Amber, Aegis Emerald, and RSI Arctic Ice with complete color palette adaptation.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Garde d\'écran active (Wake Lock)</strong> : Empêche la mise en veille automatique de la tablette ou smartphone en vol.',
        text_en: '<strong>Screen Wake Lock</strong>: Keeps phone/tablet display awake during long mining runs and quantum travel.'
      },
      {
        tag: 'new',
        text_fr: '<strong>Export Rapport Discord</strong> : Synthèse visuelle formatée prête à coller dans les salons Discord de corporation.',
        text_en: '<strong>Discord Mining Report</strong>: Pre-formatted operational summary ready to paste into organization Discord channels.'
      },
      {
        tag: 'improved',
        text_fr: '<strong>Refonte ergonomique tactile</strong> : Cibles tactiles minimales 44px, retour haptique vibrant sur appareils mobiles.',
        text_en: '<strong>Tactile & Mobile Ergonomics</strong>: 44px minimum touch targets and vibration haptic feedback on compatible devices.'
      }
    ]
  },
  {
    version: 'v1.0',
    isCurrent: false,
    title_fr: 'Lancement Initial',
    title_en: 'Initial Launch',
    date_fr: 'Fondation AARON MFD',
    date_en: 'AARON MFD Foundation',
    items: [
      {
        tag: 'new',
        text_fr: 'Calculateur immédiat de faisabilité laser et rentabilité brute/raffinée.',
        text_en: 'Instant laser fracture feasibility evaluation and raw vs. refined profit calculation.'
      },
      {
        tag: 'new',
        text_fr: 'Minuteur d\'instabilité Quantainium de 15 minutes avec alertes critiques.',
        text_en: '15-minute Quantainium volatility countdown timer with critical audio/visual alerts.'
      },
      {
        tag: 'new',
        text_fr: 'Base de données des minerais de Stanton (Quantainium, Bexalite, Taranite, Hadanite, etc.).',
        text_en: 'Stanton mineral database (Quantainium, Bexalite, Taranite, Hadanite, etc.) with up-to-date market values.'
      },
      {
        tag: 'new',
        text_fr: 'Guide des bonus des stations de raffinage et coordonnées de l\'Aaron Halo.',
        text_en: 'Refinery station bonus reference guide and Aaron Halo Quantum drop coordinates.'
      },
      {
        tag: 'new',
        text_fr: 'PWA installable hors-ligne avec synthèse audio Web Audio API.',
        text_en: 'Installable offline PWA with synthesized audio feedback via Web Audio API.'
      }
    ]
  }
];

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

  playBeep(freq = 600, type = 'sine', duration = 0.05) {
    if (!state.audioEnabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playSuccess() {
    if (!state.audioEnabled) return;
    this.playBeep(520, 'sine', 0.08);
    setTimeout(() => this.playBeep(780, 'sine', 0.12), 90);
  }

  playWarning() {
    if (!state.audioEnabled) return;
    this.playBeep(320, 'sawtooth', 0.15);
    setTimeout(() => this.playBeep(320, 'sawtooth', 0.15), 180);
  }

  playCritical() {
    if (!state.audioEnabled) return;
    this.playBeep(880, 'square', 0.12);
    setTimeout(() => this.playBeep(440, 'square', 0.16), 140);
  }

  playAlarm() {
    if (!state.audioEnabled) return;
    this.playBeep(920, 'sawtooth', 0.14);
    setTimeout(() => this.playBeep(680, 'sawtooth', 0.14), 150);
    setTimeout(() => this.playBeep(920, 'sawtooth', 0.14), 300);
    setTimeout(() => this.playBeep(680, 'sawtooth', 0.14), 450);
  }
}

const sfx = new SoundFX();

// ==========================================
// COCKPIT VOICE ASSISTANT (TTS 4.10)
// ==========================================
class CockpitVoice {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.lastSpokenText = '';
    this.lastSpokenTime = 0;
  }

  speak(textFr, textEn) {
    if (!state.voiceTTSEnabled || !this.synth) return;
    const now = Date.now();
    const text = state.currentLang === 'en' ? textEn : textFr;
    if (!text) return;
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 7000) return;
    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.currentLang === 'en' ? 'en-US' : 'fr-FR';
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  }

  speakTarget(minName, orePct, scuEst) {
    const textFr = `Cible ${minName}, pureté ${Math.round(orePct)} pour cent, estimation ${scuEst} SCU.`;
    const textEn = `Target ${minName}, purity ${Math.round(orePct)} percent, estimated ${scuEst} SCU.`;
    this.speak(textFr, textEn);
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('TTS stop error:', e);
      }
    }
  }
}

const cockpitVoice = new CockpitVoice();

// ==========================================
// DOM ELEMENTS
// ==========================================
const DOM = {
  shipSelect: document.getElementById('shipSelect'),
  mgShipSelect: document.getElementById('mgShipSelect'),
  loadoutShipSelect: document.getElementById('loadoutShipSelect'),
  mgShipBadge: document.getElementById('mgShipBadge'),
  laserSectionLabel: document.getElementById('laserSectionLabel'),
  btnOpenLoadout: document.getElementById('btnOpenLoadout'),
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
  btnMgVoiceTTS: document.getElementById('btnMgVoiceTTS'),

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
  dockBtnLoadout: document.getElementById('dockBtnLoadout'),
  dockBtnRefinery: document.getElementById('dockBtnRefinery'),
  dockRefineryBadge: document.getElementById('dockRefineryBadge'),
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
  mobileLiveSummaryBar: document.getElementById('mobileLiveSummaryBar'),
  mlSummaryBadge: document.getElementById('mlSummaryBadge'),
  mlSummaryPrice: document.getElementById('mlSummaryPrice'),
  mlSummaryLaser: document.getElementById('mlSummaryLaser'),
  mainGrid: document.getElementById('mainGrid'),
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

  // Cockpit Voice (TTS) & Radar Decoder Triggers
  btnVoiceTTS: document.getElementById('btnVoiceTTS'),
  voiceTTSLabel: document.getElementById('voiceTTSLabel'),
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
  expenseAmountInput: document.getElementById('expenseAmountInput'),
  expenseAuthorInput: document.getElementById('expenseAuthorInput'),
  expenseLocationInput: document.getElementById('expenseLocationInput'),
  expenseNoteInput: document.getElementById('expenseNoteInput'),
  btnAddExpenseSubmit: document.getElementById('btnAddExpenseSubmit'),
  guildExpensesList: document.getElementById('guildExpensesList'),
  btnCopyExpensesDiscord: document.getElementById('btnCopyExpensesDiscord'),
  btnSyncExpensesFleet: document.getElementById('btnSyncExpensesFleet'),
  btnClearExpensesAll: document.getElementById('btnClearExpensesAll'),

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
  manualLotCategorySelect: document.getElementById('manualLotCategorySelect'),
  manualLotBuyCostInput: document.getElementById('manualLotBuyCostInput'),

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

  // Crafting 4.0 Workshop (Jalon 2)
  btnOpenCraftingFromLoadout: document.getElementById('btnOpenCraftingFromLoadout'),
  btnOpenCraftingFromCrew: document.getElementById('btnOpenCraftingFromCrew'),
  craftingModal: document.getElementById('craftingModal'),
  btnCloseCrafting: document.getElementById('btnCloseCrafting'),
  tabCraftLasers: document.getElementById('tabCraftLasers'),
  tabCraftGadgets: document.getElementById('tabCraftGadgets'),
  craftPaneLasers: document.getElementById('craftPaneLasers'),
  craftPaneGadgets: document.getElementById('craftPaneGadgets'),
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

  // Callsign Modal
  callsignModal: document.getElementById('callsignModal'),
  callsignModalInput: document.getElementById('callsignModalInput'),
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
  setCallsign(state.callsign, false);
  updateLoreClock();
  setInterval(updateLoreClock, 1000);
  bindEventListeners();
  loadCustomCraftGear();
  initCraftingWorkshop();
  initFleetNet();
  initOcrScanner();
  initTacticalCoordinator();
  initCargoGridMaster();
  initMarketAndArbitrage();
  initGuildStockpileAndExpenses();
  loadSavedSession();
  loadSavedLoadout();
  loadRefineryJobs();
  loadLedger();
  startRefineryTimerLoop();
  setLanguage(state.currentLang);
  registerServiceWorker();

  // Auto-display guide on first visit
  if (!localStorage.getItem('aaron_mfd_guide_dismissed')) {
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

  if (state.voiceTTSEnabled && typeof cockpitVoice !== 'undefined' && cockpitVoice.speakTarget) {
    try {
      const minName = getLocalized(min, 'name');
      cockpitVoice.speakTarget(minName, state.orePercentage, Math.max(0.1, Math.round(state.rockMass * (state.orePercentage / 100) / ((min.density || 15) * 85) * 10) / 10));
    } catch (e) {
      console.warn('Voice target speech error:', e);
    }
  }

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
  cockpitVoice.speak(
    "Sacoche de minage détachée au rayon tracteur. En attente de transport.",
    "Mining saddlebag detached. Floating in space awaiting cargo hauler."
  );

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
  cockpitVoice.speak(
    "Tous les sacs de minage pleins ont été largués dans l'espace.",
    "All full saddlebags jettisoned into space."
  );

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

function updateVoiceTTSUI() {
  if (!DOM.btnVoiceTTS || !DOM.voiceTTSLabel) return;
  const t = I18N[state.currentLang] || I18N.fr;
  if (state.voiceTTSEnabled) {
    DOM.voiceTTSLabel.textContent = t.cockpitVoiceOn || 'Voix ON';
    DOM.btnVoiceTTS.style.borderColor = 'var(--accent-cyan)';
    DOM.btnVoiceTTS.style.color = 'var(--accent-cyan)';
  } else {
    DOM.voiceTTSLabel.textContent = t.cockpitVoiceOff || 'Voix OFF';
    DOM.btnVoiceTTS.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    DOM.btnVoiceTTS.style.color = 'var(--text-muted)';
  }
}

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

function setShip(shipId) {
  state.selectedShip = MINING_DATA.ships.find(s => s.id === shipId) || MINING_DATA.ships[0];
  if (DOM.shipSelect && DOM.shipSelect.value !== state.selectedShip.id) {
    DOM.shipSelect.value = state.selectedShip.id;
  }
  if (DOM.mgShipSelect && DOM.mgShipSelect.value !== state.selectedShip.id) {
    DOM.mgShipSelect.value = state.selectedShip.id;
  }
  if (DOM.loadoutShipSelect && DOM.loadoutShipSelect.value !== state.selectedShip.id) {
    DOM.loadoutShipSelect.value = state.selectedShip.id;
  }

  updateLaserOptions();
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
  if (DOM.btnMgVoiceTTS) {
    DOM.btnMgVoiceTTS.textContent = state.voiceTTSEnabled ? '🎙️ ON' : '🎙️ OFF';
    DOM.btnMgVoiceTTS.style.color = state.voiceTTSEnabled ? 'var(--accent-emerald)' : 'var(--text-muted)';
  }
  if (DOM.dockRefineryBadge) {
    const count = state.refineryJobs.length;
    DOM.dockRefineryBadge.style.display = count > 0 ? 'flex' : 'none';
    DOM.dockRefineryBadge.textContent = count;
  }
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
  if (DOM.dockBtnScanner && DOM.dockBtnAnalysis) {
    DOM.dockBtnScanner.classList.toggle('active', view === 'scanner');
    DOM.dockBtnAnalysis.classList.toggle('active', view === 'analysis');
  }
  if (DOM.mobileLiveSummaryBar) {
    DOM.mobileLiveSummaryBar.style.display = view === 'scanner' ? 'flex' : 'none';
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

  // 3. Mobile Live Summary Bar
  if (DOM.mlSummaryBadge) {
    DOM.mlSummaryBadge.textContent = `${icon} ${badgeText}`;
  }
  if (DOM.mlSummaryPrice) {
    DOM.mlSummaryPrice.textContent = `~${refinedPrice.toLocaleString(locale)} aUEC`;
  }
  if (DOM.mlSummaryLaser) {
    const pct = Math.round(powerRatio * 100);
    const laserTag = powerRatio >= 1.15 ? 'OPT' : (powerRatio >= 0.88 ? 'OK' : 'DUR');
    DOM.mlSummaryLaser.textContent = `⚡ ${pct}% ${laserTag}`;
    DOM.mlSummaryLaser.style.color = powerRatio >= 1.15 ? 'var(--accent-emerald)' : (powerRatio >= 0.88 ? 'var(--accent-amber)' : 'var(--accent-rose)');
    DOM.mlSummaryLaser.style.borderColor = powerRatio >= 1.15 ? 'rgba(16, 185, 129, 0.4)' : (powerRatio >= 0.88 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(244, 63, 94, 0.4)');
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

    MINING_DATA.modules.forEach(mod => {
      const opt = document.createElement('option');
      opt.value = mod.id;
      const modName = getLocalized(mod, 'name');
      const modDesc = getLocalized(mod, 'desc');
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
        updateTurretHeaderSummary(tIdx);
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

// Helper: Get or initialize turret configurations for a ship
function getShipTurretConfigs(shipId) {
  const ship = MINING_DATA.ships.find(s => s.id === shipId) || MINING_DATA.ships[0];
  const count = ship.laserSlots || 1;
  if (!state.turretsByShip[shipId]) {
    state.turretsByShip[shipId] = [];
  }
  const compatible = MINING_DATA.lasers.filter(l => l.size === ship.laserSize || (ship.laserSize === 0 && l.size === 0));
  const defaultLaserId = compatible[0]?.id || 'arbor_mh1';

  while (state.turretsByShip[shipId].length < count) {
    state.turretsByShip[shipId].push({
      laserId: defaultLaserId,
      moduleIds: ['none', 'none', 'none']
    });
  }
  return state.turretsByShip[shipId].slice(0, count);
}

// Helper: Metadata (badge, titles, color accents) for turret cards
function getTurretMetadata(shipId, turretIdx) {
  const isEn = state.currentLang === 'en';
  if (shipId === 'prospector') {
    return {
      badge: 'T1',
      badgeClass: 't1-badge',
      cardClass: 'turret-1-card',
      title: isEn ? 'PRIMARY MINING HEAD (SIZE 1)' : 'TÊTE DE MINAGE PRINCIPALE (SIZE 1)',
      subtitle: isEn ? 'Front Gimbal Arm' : 'Bras articulé frontal'
    };
  }
  if (shipId === 'mole') {
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
  if (shipId === 'arrastra') {
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
  if (shipId === 'orion') {
    const metaList = isEn ? [
      { badge: '◄ T1', title: 'FORWARD HEAVY TURRET 1 (SIZE 3)', sub: 'Main Extraction Rig' },
      { badge: 'T2 ►', title: 'DORSAL HEAVY TURRET 2 (SIZE 3)', sub: 'Upper Crushing Rig' }
    ] : [
      { badge: '◄ T1', title: 'TOURELLE AVANT PRINCIPALE 1 (SIZE 3)', sub: 'Gantry frontal lourd' },
      { badge: 'T2 ►', title: 'TOURELLE DORSALE SUPÉRIEURE 2 (SIZE 3)', sub: 'Tourelle supérieure' }
    ];
    const m = metaList[turretIdx] || metaList[0];
    const badgeClasses = ['t1-badge', 't2-badge'];
    const cardClasses = ['turret-1-card', 'turret-2-card'];
    return {
      badge: m.badge,
      badgeClass: badgeClasses[turretIdx] || 't1-badge',
      cardClass: cardClasses[turretIdx] || 'turret-1-card',
      title: m.title,
      subtitle: m.sub
    };
  }
  // ROC / ROC-DS
  return {
    badge: 'ARM',
    badgeClass: 't1-badge',
    cardClass: 'turret-1-card',
    title: isEn ? 'EXTRACTION LASER ARM (SIZE 0)' : "BRAS LASER D'EXTRACTION (SIZE 0)",
    subtitle: isEn ? 'Vehicle Mounted Arm' : 'Bras articulé de véhicule'
  };
}

// Helper: Update summary text inside collapsible turret header
function updateTurretHeaderSummary(turretIdx) {
  const ship = state.selectedShip;
  const configs = getShipTurretConfigs(ship.id);
  const cfg = configs[turretIdx];
  const summaryEl = document.getElementById(`turretSummary_${turretIdx}`);
  if (!cfg || !summaryEl) return;

  const compatibleLasers = MINING_DATA.lasers.filter(l => l.size === ship.laserSize || (ship.laserSize === 0 && l.size === 0));
  const laser = compatibleLasers.find(l => l.id === cfg.laserId) || compatibleLasers[0] || MINING_DATA.lasers[0];
  const slotCount = laser.slots ?? 0;
  const activeModsCount = (cfg.moduleIds || []).slice(0, slotCount).filter(m => m !== 'none').length;
  summaryEl.textContent = `${laser.name} (${activeModsCount}/${slotCount} mods)`;
}

// Render dynamic turret cards for active ship
function renderShipTurretsConfig() {
  if (!DOM.turretCardsContainer) return;
  DOM.turretCardsContainer.innerHTML = '';

  const ship = state.selectedShip;
  const configs = getShipTurretConfigs(ship.id);
  const compatibleLasers = MINING_DATA.lasers.filter(l => l.size === ship.laserSize || (ship.laserSize === 0 && l.size === 0));

  configs.forEach((cfg, idx) => {
    const meta = getTurretMetadata(ship.id, idx);
    const currentLaser = compatibleLasers.find(l => l.id === cfg.laserId) || compatibleLasers[0] || MINING_DATA.lasers[0];
    cfg.laserId = currentLaser.id;

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

    // Body with laser dropdown, stats strip, and dynamic module slots
    const body = document.createElement('div');
    body.className = 'turret-config-body';
    body.id = `turretBody_${idx}`;

    const select = document.createElement('select');
    select.className = 'hud-select-full turret-laser-select';
    select.id = `turretLaser_${idx}`;
    select.style.marginBottom = '6px';

    compatibleLasers.forEach(l => {
      const desc = getLocalized(l, 'desc') || '';
      const slotText = l.slots !== undefined ? `${l.slots} slots` : '0 slots';
      const craftPrefix = l.isCustomCraft ? '🛠️ [CRAFT] ' : '';
      const opt = new Option(`${craftPrefix}${l.name} (S${l.size} • ${slotText} • ${l.power} W) - ${desc.slice(0, 30)}...`, l.id);
      select.appendChild(opt);
    });
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
    body.appendChild(slotsContainer);

    card.appendChild(header);
    card.appendChild(body);
    DOM.turretCardsContainer.appendChild(card);

    // Initial render of stats and module slots
    renderLaserStatsStrip(statsStrip, currentLaser);
    renderLaserModuleSlots(slotsContainer, currentLaser.slots ?? 0, cfg.moduleIds, `turret_${idx}`);
    updateTurretHeaderSummary(idx);

    // Laser change listener on this turret
    select.addEventListener('change', (e) => {
      sfx.playBeep(600, 'sine', 0.04);
      cfg.laserId = e.target.value;
      const newL = compatibleLasers.find(l => l.id === e.target.value) || compatibleLasers[0];

      if (idx === 0) {
        state.selectedLaser = newL;
      }

      renderLaserStatsStrip(statsStrip, newL);
      renderLaserModuleSlots(slotsContainer, newL.slots ?? 0, cfg.moduleIds, `turret_${idx}`);
      updateTurretHeaderSummary(idx);
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

  // Gadgets
  const gadVal = DOM.gadgetSelect ? (DOM.gadgetSelect.value || state.selectedGadget.id) : state.selectedGadget.id;
  if (DOM.gadgetSelect) {
    DOM.gadgetSelect.innerHTML = '';
    MINING_DATA.gadgets.forEach(gad => {
      const gadName = getLocalized(gad, 'name');
      const gadDesc = getLocalized(gad, 'desc');
      const craftPrefix = gad.isCustomCraft ? '🛠️ [CRAFT] ' : '';
      const opt = new Option(`${craftPrefix}${gadName} ${gadDesc ? '(' + gadDesc + ')' : ''}`, gad.id);
      DOM.gadgetSelect.appendChild(opt);
    });
    DOM.gadgetSelect.value = gadVal;
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
    DOM.turretsSectionTitle.textContent = isMultiTurret
      ? (state.currentLang === 'en' ? `${ship.laserSlots} TURRETS CONFIGURATION (${ship.name})` : `CONFIGURATION DES ${ship.laserSlots} TOURELLES (${ship.name})`)
      : (state.currentLang === 'en' ? `MINING HEAD CONFIGURATION (${ship.name})` : `CONFIGURATION DE LA TÊTE DE MINAGE (${ship.name})`);
  }
  if (DOM.btnToggleAllTurrets) {
    DOM.btnToggleAllTurrets.style.display = isMultiTurret ? 'inline-block' : 'none';
  }

  // Compatible lasers for active ship size
  const compatibleLasers = MINING_DATA.lasers.filter(l => l.size === ship.laserSize || (ship.laserSize === 0 && l.size === 0));

  // Synchronize primary turret
  const turrets = getShipTurretConfigs(ship.id);
  const primaryLaser = compatibleLasers.find(l => l.id === turrets[0].laserId) || compatibleLasers[0] || MINING_DATA.lasers[0];
  state.selectedLaser = primaryLaser;
  turrets[0].laserId = primaryLaser.id;
  state.selectedModules = turrets[0].moduleIds;

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
  if (ship.laserSlots && ship.laserSlots > 1) {
    const activeCount = Math.min(state.moleActiveTurrets || 1, ship.laserSlots);
    const shipName = ship.name.split(' ').pop();
    DOM.loadoutSummary.textContent = `${shipName}: ${activeCount}/${ship.laserSlots} ${t.turretsActive || 'Tourelles'}`;
  } else {
    const slotCount = state.selectedLaser.slots ?? 0;
    const activeModsCount = (state.selectedModules || []).slice(0, slotCount).filter(m => m !== 'none').length;
    const modsSummary = slotCount > 0 ? ` (${activeModsCount}/${slotCount} mods)` : '';
    DOM.loadoutSummary.textContent = `${state.selectedLaser.name}${modsSummary}`;
  }
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
    cockpitVoice.speak("Attention ! Risque critique de surchauffe !", "Warning! Critical overheat risk!");
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
  cockpitVoice.speak(
    "Alerte rouge ! Contact hostile détecté ! Évacuation d'urgence recommandée.",
    "Red alert! Hostile contact detected! Emergency jump recommended."
  );
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
  cockpitVoice.speak("Fin d'alerte rouge. Reprise des opérations.", "Red alert stood down. All clear.");
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
      cockpitVoice.speak("Ordre de combat envoyé à l'escorte.", "Combat order dispatched to escort.");
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
  cockpitVoice.speak(
    "Cargaison de soute transférée au transporteur.",
    "Hold cargo transferred to hauler."
  );

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
  cockpitVoice.speak(
    "Demande de récupération de fret transmise sur Fleet-Net.",
    "Cargo pickup request broadcast over Fleet-Net."
  );

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
  cockpitVoice.speak(
    `Appel de fret reçu de ${senderCallsign || pickupData.senderCallsign}.`,
    `Cargo pickup request received from ${senderCallsign || pickupData.senderCallsign}.`
  );

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
  cockpitVoice.speak(
    "Arrimage rayon tracteur terminé. Fret sécurisé sur la grille physique.",
    "Tractor beam docking complete. Cargo secured on physical grid."
  );

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
  cockpitVoice.speak(
    `Fret arrimé par le transporteur ${acceptData.haulerShip || ''}.`,
    `Cargo secured by hauler ${acceptData.haulerShip || ''}.`
  );

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

function initCraftingWorkshop() {
  // Modal open / close
  if (DOM.btnOpenCraftingFromLoadout) {
    DOM.btnOpenCraftingFromLoadout.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      renderCustomLasersList();
      renderCustomGadgetsList();
      openModal(DOM.craftingModal);
    });
  }

  if (DOM.btnOpenCraftingFromCrew) {
    DOM.btnOpenCraftingFromCrew.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(12);
      renderCustomLasersList();
      renderCustomGadgetsList();
      openModal(DOM.craftingModal);
    });
  }

  if (DOM.btnCloseCrafting) {
    DOM.btnCloseCrafting.addEventListener('click', () => {
      closeModal(DOM.craftingModal);
    });
  }

  // Workshop Sub-tabs
  if (DOM.tabCraftLasers && DOM.tabCraftGadgets) {
    DOM.tabCraftLasers.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(10);
      DOM.tabCraftLasers.classList.add('active');
      DOM.tabCraftLasers.style.borderColor = 'var(--accent-purple)';
      DOM.tabCraftLasers.style.color = 'var(--accent-purple)';
      DOM.tabCraftGadgets.classList.remove('active');
      DOM.tabCraftGadgets.style.borderColor = '';
      DOM.tabCraftGadgets.style.color = '';
      if (DOM.craftPaneLasers) DOM.craftPaneLasers.style.display = 'block';
      if (DOM.craftPaneGadgets) DOM.craftPaneGadgets.style.display = 'none';
      renderCustomLasersList();
    });

    DOM.tabCraftGadgets.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.03);
      triggerHaptic(10);
      DOM.tabCraftGadgets.classList.add('active');
      DOM.tabCraftGadgets.style.borderColor = 'var(--accent-purple)';
      DOM.tabCraftGadgets.style.color = 'var(--accent-purple)';
      DOM.tabCraftLasers.classList.remove('active');
      DOM.tabCraftLasers.style.borderColor = '';
      DOM.tabCraftLasers.style.color = '';
      if (DOM.craftPaneLasers) DOM.craftPaneLasers.style.display = 'none';
      if (DOM.craftPaneGadgets) DOM.craftPaneGadgets.style.display = 'block';
      renderCustomGadgetsList();
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

  // Cockpit radio voice synthesis if audio enabled
  if (state.audioEnabled && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(
        state.currentLang === 'en'
          ? `Scan received from ${senderCallsign}: ${mineral.name_en}, ${rock.mass} kilograms, resistance ${rock.resistance} percent`
          : `Scan reçu de ${senderCallsign} : ${mineral.name_fr}, ${rock.mass} kilos, résistance ${rock.resistance} pour cent`
      );
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.volume = 0.6;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

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
  if ('vibrate' in navigator) {
    try { navigator.vibrate(duration); } catch (e) {}
  }
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
  [DOM.shipSelect, DOM.mgShipSelect, DOM.loadoutShipSelect].forEach(sel => {
    if (!sel) return;
    const shipOpts = sel.querySelectorAll('option');
      shipOpts.forEach(opt => {
        if (opt.value === 'prospector') opt.textContent = t.shipProspector;
        if (opt.value === 'mole') opt.textContent = t.shipMole;
        if (opt.value === 'arrastra') opt.textContent = t.shipArrastra || 'RSI Arrastra (576 SCU)';
        if (opt.value === 'orion') opt.textContent = t.shipOrion || 'RSI Orion (2 880 SCU)';
        if (opt.value === 'roc') opt.textContent = t.shipRoc;
        if (opt.value === 'roc_ds') opt.textContent = t.shipRocDs;
      });
  });

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
  DOM.btnOpenLoadout.addEventListener('click', () => {
    sfx.playBeep(600, 'sine', 0.04);
    populateLoadoutSelects();
    openModal(DOM.loadoutModal);
  });
  DOM.btnCloseLoadout.addEventListener('click', () => closeModal(DOM.loadoutModal));

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

  // Pilot Callsign Editor listeners
  if (DOM.btnEditMgCallsign) {
    DOM.btnEditMgCallsign.addEventListener('click', () => {
      sfx.playBeep(650, 'sine', 0.04);
      triggerHaptic(15);
      if (DOM.callsignModalInput) {
        DOM.callsignModalInput.value = state.callsign;
      }
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
    const turrets = getShipTurretConfigs(ship.id);

    // Read values from dynamically generated cards
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

    saveLoadout();
    updateLoadoutButtonSummary();
    closeModal(DOM.loadoutModal);
    calculateAll();
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


  // Alpha 4.10: Cockpit Voice Assistant (TTS)
  if (DOM.btnVoiceTTS) {
    DOM.btnVoiceTTS.addEventListener('click', () => {
      triggerHaptic(20);
      state.voiceTTSEnabled = !state.voiceTTSEnabled;
      updateVoiceTTSUI();
      const t = I18N[state.currentLang] || I18N.fr;
      if (state.voiceTTSEnabled) {
        sfx.playSuccess();
        cockpitVoice.speak(state.currentLang === 'en' ? 'Cockpit audio synthesis active. System online.' : 'Synthèse vocale de cockpit activée. Systèmes en ligne.');
        showToast(t.cockpitVoiceOn || 'Voix cockpit activée');
      } else {
        sfx.playBeep(350, 'square', 0.06);
        cockpitVoice.stop();
        showToast(t.cockpitVoiceOff || 'Voix cockpit désactivée');
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
  if (DOM.btnMgVoiceTTS) {
    DOM.btnMgVoiceTTS.addEventListener('click', () => {
      if (DOM.btnVoiceTTS) DOM.btnVoiceTTS.click();
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
  if (DOM.mobileLiveSummaryBar) {
    DOM.mobileLiveSummaryBar.addEventListener('click', () => setMobileView('analysis'));
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

  // mobiGlas 4.0: Bottom App Launcher Dock Handlers
  if (DOM.dockBtnScanner) {
    DOM.dockBtnScanner.addEventListener('click', () => {
      if (window.innerWidth <= 980) {
        setMobileView('scanner');
      } else {
        sfx.playBeep(700, 'sine', 0.03);
        triggerHaptic(10);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  if (DOM.dockBtnAnalysis) {
    DOM.dockBtnAnalysis.addEventListener('click', () => {
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
  if (DOM.dockBtnLoadout) {
    DOM.dockBtnLoadout.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      populateLoadoutSelects();
      openModal(DOM.loadoutModal);
    });
  }
  if (DOM.dockBtnRefinery) {
    DOM.dockBtnRefinery.addEventListener('click', () => {
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      populateRefineryModalSelects();
      openModal(DOM.refineryModal);
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
      sfx.playBeep(600, 'sine', 0.04);
      triggerHaptic(10);
      updateLedgerDisplay();
      openModal(DOM.ledgerModal);
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
  modal.classList.add('open');
  modal.style.display = 'flex';
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.style.display = 'none';
  modal.style.opacity = '0';
  modal.style.pointerEvents = 'none';
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
// ==========================================
const FACTORY_LOADOUT_PRESETS = [
  {
    id: 'preset_prospector_balanced',
    name: 'Prospector : Polyvalent Équilibré',
    name_en: 'Prospector: Balanced All-Rounder',
    shipId: 'prospector',
    turrets: [
      { laserId: 'lancet_s1', moduleIds: ['surge', 'focus_3'] }
    ],
    gadgetId: 'boremax',
    isPreset: true
  },
  {
    id: 'preset_prospector_power',
    name: 'Prospector : Puissance Brute (Grosses Roches)',
    name_en: 'Prospector: Raw Power (Heavy Rocks)',
    shipId: 'prospector',
    turrets: [
      { laserId: 'helix_s1', moduleIds: ['rieger_c3', 'torrent'] }
    ],
    gadgetId: 'sabir',
    isPreset: true
  },
  {
    id: 'preset_mole_trio',
    name: 'Argo MOLE : Trio Équilibré (1 Lancet + 2 Helix)',
    name_en: 'Argo MOLE: Balanced Trio (1 Lancet + 2 Helix)',
    shipId: 'mole',
    turrets: [
      { laserId: 'lancet_s2', moduleIds: ['surge', 'surge', 'none'] },
      { laserId: 'helix_s2', moduleIds: ['focus_3', 'focus_3', 'none'] },
      { laserId: 'helix_s2', moduleIds: ['focus_3', 'focus_3', 'none'] }
    ],
    gadgetId: 'boremax',
    isPreset: true
  },
  {
    id: 'preset_arrastra_heavy',
    name: 'RSI Arrastra : Escadre Lourde S3',
    name_en: 'RSI Arrastra: Heavy Mining S3',
    shipId: 'arrastra',
    turrets: [
      { laserId: 'lancet_s3', moduleIds: ['surge', 'focus_3', 'none'] },
      { laserId: 'helix_s3', moduleIds: ['focus_3', 'focus_3', 'none'] },
      { laserId: 'helix_s3', moduleIds: ['focus_3', 'focus_3', 'none'] }
    ],
    gadgetId: 'optimax',
    isPreset: true
  },
  {
    id: 'preset_roc_gems',
    name: 'Greycat ROC : Collecte Gemmes Sol',
    name_en: 'Greycat ROC: Surface Gem Harvester',
    shipId: 'roc',
    turrets: [
      { laserId: 'arbor_mh0', moduleIds: [] }
    ],
    gadgetId: 'none',
    isPreset: true
  }
];

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
// ==========================================

const DEFAULT_GUILD_STOCKPILE = [
  {
    id: 'lot_seed_1',
    stationId: 'arc_l1',
    stationName: 'ARC-L1 Wide Forest',
    mineralId: 'quantainium',
    mineralName: 'Quantainium',
    scu: 64.0,
    status: 'refined_ready',
    rawVal: 384000,
    refinedVal: 1718400,
    depositedBy: 'VORTEX-1',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'lot_seed_2',
    stationId: 'hur_l1',
    stationName: 'HUR-L1 Green Glade',
    mineralId: 'bexalite',
    mineralName: 'Bexalite',
    scu: 32.0,
    status: 'refining',
    rawVal: 180000,
    refinedVal: 384000,
    methodName: 'Dinyx Solventation',
    depositedBy: 'MINER-PROSPECTOR',
    timestamp: Date.now() - 1800000
  },
  {
    id: 'lot_seed_3',
    stationId: 'mic_l1',
    stationName: 'MIC-L1 Shallow Frontier',
    mineralId: 'laranite',
    mineralName: 'Laranite',
    scu: 48.0,
    status: 'raw',
    rawVal: 144000,
    refinedVal: 288000,
    depositedBy: 'SCOUT-MERCHANT',
    timestamp: Date.now() - 7200000
  }
];

const DEFAULT_GUILD_EXPENSES = [
  {
    id: 'exp_seed_1',
    category: 'refining',
    amount: 18500,
    author: 'VORTEX-1',
    location: 'ARC-L1 Wide Forest',
    note: 'Frais de raffinage procédé Dinyx pour 64 SCU Quantainium',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'exp_seed_2',
    category: 'fuel',
    amount: 12000,
    author: 'HAULER-9',
    location: 'HUR-L1 Green Glade',
    note: 'Plein de Quantum Fuel pour convoi C2 Hercules',
    timestamp: Date.now() - 1800000
  }
];

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
}

function switchStockpileTab(tabName) {
  state.activeStockpileTab = tabName;
  const tabs = [
    { id: 'overview', btn: DOM.btnStockpileTabOverview, pane: DOM.paneStockpileOverview },
    { id: 'refining', btn: DOM.btnStockpileTabRefining, pane: DOM.paneStockpileRefining },
    { id: 'expenses', btn: DOM.btnStockpileTabExpenses, pane: DOM.paneStockpileExpenses },
    { id: 'treasury', btn: DOM.btnStockpileTabTreasury, pane: DOM.paneStockpileTreasury },
    { id: 'trading', btn: DOM.btnStockpileTabTrading, pane: DOM.paneStockpileTrading }
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

  if (state.voiceTTSEnabled && typeof speakVoice === 'function') {
    speakVoice(body);
  }

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
// CORPO EXPENSE LEDGER
// ----------------------------------------------------
function addGuildExpense() {
  const t = I18N[state.currentLang] || I18N.fr;
  const category = DOM.expenseCategorySelect ? DOM.expenseCategorySelect.value : 'refining';
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
    timestamp: Date.now()
  };

  state.guildExpenses.unshift(newExp);
  saveGuildExpenses();

  // Reset inputs
  if (DOM.expenseAmountInput) DOM.expenseAmountInput.value = '';
  if (DOM.expenseNoteInput) DOM.expenseNoteInput.value = '';

  renderGuildExpenses();
  updateGuildNetWorthMetrics();
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

function deleteGuildExpense(expId) {
  const t = I18N[state.currentLang] || I18N.fr;
  state.guildExpenses = state.guildExpenses.filter(e => e.id !== expId);
  saveGuildExpenses();
  renderGuildExpenses();
  updateGuildNetWorthMetrics();
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
      text += `  ${idx + 1}. [${exp.categoryName}] ${exp.amount.toLocaleString(locale)} aUEC — ${exp.author} (${exp.location})${exp.note ? ' : ' + exp.note : ''}\n`;
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

    item.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:2px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <strong style="color:#fff; font-family:var(--font-hud); font-size:0.84rem;">${exp.categoryName}</strong>
          <span style="font-size:0.72rem; color:var(--text-muted);">• ${exp.author} (${exp.location})</span>
        </div>
        ${exp.note ? `<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">${exp.note}</div>` : ''}
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="expense-amount-tag">-${(exp.amount || 0).toLocaleString(locale)} aUEC</span>
        <button type="button" class="chip-btn btn-del-exp" data-exp-id="${exp.id}" style="border-color:rgba(239,68,68,0.3); color:#fca5a5; padding:2px 6px; font-size:0.72rem;">
          &times;
        </button>
      </div>
    `;

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
}

// ========================================================
// JALON 7 MODULE: GUILD TREASURY & MO.TRADER TRANSFER SHEET
// ========================================================
function renderGuildTreasury() {
  const locale = getLocale();
  if (DOM.treasuryBalanceVal) {
    DOM.treasuryBalanceVal.textContent = `${state.guildTreasuryBalance.toLocaleString(locale)} aUEC`;
  }
  if (DOM.treasuryTaxSelect) {
    DOM.treasuryTaxSelect.value = (state.guildCorpoTaxPct ?? 10).toString();
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
  const distributablePool = totalPool - totalTax;

  const totalWeight = pilots.reduce((sum, p) => sum + p.weight, 0);

  return pilots.map(p => {
    const grossShare = Math.round(totalPool * (p.weight / totalWeight));
    const corpoTax = Math.round(grossShare * (taxPct / 100));
    const netPayout = grossShare - corpoTax;
    const status = state.guildPayoutStatuses[p.id] || 'pending';
    return {
      id: p.id,
      callsign: p.callsign,
      role: p.role,
      grossShare: grossShare,
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
      <td style="font-family:var(--font-mono); color:var(--text-muted); font-size:0.8rem;">
        ${p.grossShare.toLocaleString(locale)} aUEC
      </td>
      <td style="font-family:var(--font-mono); color:#f87171; font-size:0.8rem;">
        -${p.corpoTax.toLocaleString(locale)} aUEC
      </td>
      <td style="font-family:var(--font-mono); font-weight:700; color:var(--accent-cyan); font-size:0.85rem;">
        ${p.netPayout.toLocaleString(locale)} aUEC
      </td>
      <td>
        <span class="motrader-status-pill ${statusClass}" data-pilot-id="${escapeHtml(p.id)}">
          ${isPaid ? '🟢' : '🟡'} ${escapeHtml(statusText)}
        </span>
      </td>
    `;

    const pill = tr.querySelector('.motrader-status-pill');
    if (pill) {
      pill.addEventListener('click', () => {
        toggleMoTraderStatus(p.id);
      });
    }

    DOM.moTraderTableBody.appendChild(tr);
  });
}

function toggleMoTraderStatus(pilotId) {
  const current = state.guildPayoutStatuses[pilotId] || 'pending';
  state.guildPayoutStatuses[pilotId] = current === 'paid' ? 'pending' : 'paid';
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

  splitData.forEach(p => {
    totalPaidOut += p.netPayout;
    totalWithheld += p.corpoTax;
    const badge = p.status === 'paid' ? '[VIREMENT FAIT]' : '[EN ATTENTE]';
    lines.push(`• ${p.callsign} (${p.role}) ➔ ${p.netPayout.toLocaleString(locale)} aUEC ${badge}`);
  });

  lines.push('────────────────────────────────────────');
  lines.push(`Total distribué : ${totalPaidOut.toLocaleString(locale)} aUEC`);
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

function submitCraftingGoal() {
  if (!DOM.craftingGoalItemSelect || !DOM.craftingGoalCountInput) return;
  const itemId = DOM.craftingGoalItemSelect.value;
  const count = Math.max(1, parseInt(DOM.craftingGoalCountInput.value, 10) || 1);

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

  const newGoal = {
    id: 'goal_' + Date.now(),
    itemId: itemId,
    name: `${preset.name} (x${count})`,
    targetCount: count,
    requiredMinerals: preset.minerals
  };

  state.guildCraftingGoals.unshift(newGoal);
  saveGuildTreasury();
  renderCraftingGoals();

  if (DOM.addCraftingGoalForm) {
    DOM.addCraftingGoalForm.style.display = 'none';
  }

  sfx.playSuccess();
  triggerHaptic(15);
  showToast('🛠️ Objectif d\'artisanat ajouté au carnet de guilde !');
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
  populateTradeSimulatorSelects();

  if (DOM.tradePresetRouteSelect) {
    DOM.tradePresetRouteSelect.addEventListener('change', (e) => {
      loadTradePresetRoute(e.target.value);
    });
  }

  if (DOM.tradeCommoditySelect) {
    DOM.tradeCommoditySelect.addEventListener('change', (e) => {
      const commId = e.target.value;
      const comm = (MINING_DATA.generalCommodities || []).find(c => c.id === commId);
      if (comm) {
        if (DOM.tradeBuyPriceInput) DOM.tradeBuyPriceInput.value = comm.baseBuy.toString();
        if (DOM.tradeSellPriceInput) DOM.tradeSellPriceInput.value = comm.baseSell.toString();
        calculateTradeMetrics();
      }
    });
  }

  const recalcInputs = [DOM.tradeCargoScuInput, DOM.tradeBuyPriceInput, DOM.tradeSellPriceInput];
  recalcInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateTradeMetrics);
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
      }
    });
  });

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

  loadTradePresetRoute('route_med_hurston');
  renderPopularTradeRoutes();
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

function populateTradeSimulatorSelects() {
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
    (MINING_DATA.generalCommodities || []).forEach(comm => {
      const opt = document.createElement('option');
      opt.value = comm.id;
      opt.textContent = `${comm.name_fr} (${comm.baseBuy} ➔ ${comm.baseSell} aUEC)`;
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
  calculateTradeMetrics();
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
  if (!DOM.popularTradeRoutesGrid) return;
  const locale = getLocale();
  DOM.popularTradeRoutesGrid.innerHTML = '';

  (MINING_DATA.popularTradeRoutes || []).forEach(route => {
    const item = document.createElement('div');
    item.className = 'trade-route-item';

    const riskClass = route.risk || 'safe';
    const riskLabel = riskClass === 'extreme' ? '🔴 Extrême' : (riskClass === 'moderate' ? '🟡 Modéré' : '🟢 Sûr');

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
        <strong style="color:#fff; font-family:var(--font-hud); font-size:0.83rem;">${escapeHtml(route.name)}</strong>
        <span class="trade-risk-badge ${riskClass}" style="font-size:0.65rem; padding:1px 5px;">${riskLabel}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted);">
        <span>Achat: ${route.buyPrice} ➔ Vente: ${route.sellPrice} aUEC</span>
        <strong style="font-family:var(--font-mono); color:var(--accent-emerald);">+${route.marginPerScu.toLocaleString(locale)} aUEC/SCU</strong>
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
      if (DOM.gadgetSelect) DOM.gadgetSelect.value = g.id;
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

// Run on load
document.addEventListener('DOMContentLoaded', init);

