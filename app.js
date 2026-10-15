import { MINING_DATA } from './mining-data.js';
import { I18N } from './i18n.js';

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
    version: 'v1.6.4',
    isCurrent: true,
    title_fr: 'Correctif Critique Calcul Réactif & Synthèse Vocale',
    title_en: 'Critical Fix: Reactive Calculation & Voice Synthesis',
    date_fr: 'Dernière version (Alpha 4.10)',
    date_en: 'Latest Version (Alpha 4.10)',
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
  mobileTabVerdictBadge: document.getElementById('mobileTabVerdictBadge'),
  mobileLiveSummaryBar: document.getElementById('mobileLiveSummaryBar'),
  mlSummaryBadge: document.getElementById('mlSummaryBadge'),
  mlSummaryPrice: document.getElementById('mlSummaryPrice'),
  mlSummaryLaser: document.getElementById('mlSummaryLaser'),
  mainGrid: document.getElementById('mainGrid'),
  panelScanData: document.getElementById('panelScanData'),
  panelTacticalAnalysis: document.getElementById('panelTacticalAnalysis'),

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
  btnAutoCalcProps: document.getElementById('btnAutoCalcProps'),

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

  // Refinery Modal
  refineryModal: document.getElementById('refineryModal'),
  btnCloseRefinery: document.getElementById('btnCloseRefinery'),
  refineryActiveCount: document.getElementById('refineryActiveCount'),
  refineryTotalValueDisplay: document.getElementById('refineryTotalValueDisplay'),
  refineryOrderStationSelect: document.getElementById('refineryOrderStationSelect'),
  refineryOrderMethodSelect: document.getElementById('refineryOrderMethodSelect'),
  btnConfirmRefineryJob: document.getElementById('btnConfirmRefineryJob'),
  refineryJobsList: document.getElementById('refineryJobsList'),

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
  fleetStatCargo: document.getElementById('fleetStatCargo'),
  fleetStatShare: document.getElementById('fleetStatShare'),
  squadLeaderName: document.getElementById('squadLeaderName'),
  squadLeaderNameInput: document.getElementById('squadLeaderNameInput'),
  squadLeaderShipDesc: document.getElementById('squadLeaderShipDesc'),
  squadLeaderLaserDesc: document.getElementById('squadLeaderLaserDesc'),
  btnSquadEditLoadout: document.getElementById('btnSquadEditLoadout'),
  squadWingmenContainer: document.getElementById('squadWingmenContainer'),
  btnAddSquadMember: document.getElementById('btnAddSquadMember'),

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
      const opt = new Option(`${l.name} (S${l.size} • ${slotText} • ${l.power} W) - ${desc.slice(0, 30)}...`, l.id);
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
      const opt = new Option(`${gadName} ${gadDesc ? '(' + gadDesc + ')' : ''}`, gad.id);
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

      if (m.active && m.laserId) {
        const wLaser = MINING_DATA.lasers.find(l => l.id === m.laserId);
        if (wLaser) {
          totalLaserPower += wLaser.power;
          activeWingmenCount++;
          activeLaserDescList.push(`${m.name || 'Équipier'} (${wLaser.name})`);

          // Apply combined resistance and instability reduction
          if (wLaser.resistanceMod < combinedResistanceMod) combinedResistanceMod = wLaser.resistanceMod;
          if (wLaser.instabilityMod < combinedInstabilityMod) combinedInstabilityMod = wLaser.instabilityMod;
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
  updateSquadDisplay(refinedPrice, rawPrice, totalLaserPower, fleetCargoSCU);
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
function updateSquadDisplay(refinedPrice, rawPrice, totalLaserPower, fleetCargoSCU) {
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const totalShipsCount = 1 + (state.squadMembers ? state.squadMembers.length : 0);
  const activeFiringCount = (state.selectedShip.id === 'mole' ? state.moleActiveTurrets : 1) +
    (state.squadMembers ? state.squadMembers.filter(m => m.active && m.laserId).length : 0);

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

  // 4. Update Squad Modal Top Stat Tiles
  if (DOM.fleetStatShips) DOM.fleetStatShips.textContent = totalShipsCount;
  if (DOM.fleetStatPower) DOM.fleetStatPower.textContent = `${totalLaserPower.toLocaleString(locale)} W`;
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
      const shipLaserSize = shipObj.laserSize || 1;
      const compLasers = MINING_DATA.lasers.filter(l => l.size === shipLaserSize);
      const laserOpts = compLasers.map(l => {
        return `<option value="${l.id}" ${l.id === member.laserId ? 'selected' : ''}>${l.name} (${l.power} W)</option>`;
      }).join('');
      laserSelectHtml = `
        <div style="display:flex; flex-direction:column; gap:2px;">
          <label style="font-size:0.68rem; color:var(--text-muted); font-family:var(--font-hud);">${t.wingmanLaserLabel}</label>
          <select class="hud-select-sm wingman-laser-select" data-member-idx="${idx}" style="font-size:0.75rem; padding:4px;">
            ${laserOpts}
          </select>
        </div>
      `;
    } else {
      laserSelectHtml = `
        <div style="display:flex; flex-direction:column; gap:2px; justify-content:center;">
          <label style="font-size:0.68rem; color:var(--text-muted); font-family:var(--font-hud);">${t.wingmanLaserLabel}</label>
          <span style="font-size:0.75rem; color:var(--accent-amber); font-family:var(--font-mono);">📦 Transport Cargo (${shipObj.scu} SCU)</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="wingman-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.7rem; color:var(--accent-cyan); font-family:var(--font-hud); font-weight:700;">#${idx + 2}</span>
          <input type="text" class="hud-input wingman-name-input" data-member-idx="${idx}" value="${member.name || `Équipier ${idx + 1}`}" style="background:transparent; border:1px solid rgba(255,255,255,0.15); border-radius:4px; padding:2px 6px; font-family:var(--font-hud); font-size:0.82rem; color:#fff; width:150px;" />
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
  const share = Math.round(netPool / Math.max(1, state.crewMembers));

  DOM.crewTotalHoldValue.textContent = `${totalVal.toLocaleString(locale)} aUEC`;
  DOM.crewSharePerMember.textContent = `${share.toLocaleString(locale)} aUEC / ${t.perMember}`;
  DOM.crewReserveDeducted.textContent = t.crewDeducted.replace('{pct}', state.crewReservePct).replace('{amt}', reserveAmt.toLocaleString(locale));
  DOM.crewCountDisplay.textContent = `${state.crewMembers} ${state.crewMembers > 1 ? t.playersPlural : t.playersSingular}`;
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

  // Alpha 4.10: Dynamic Archetype Auto-Calc Button
  if (DOM.btnAutoCalcProps) {
    DOM.btnAutoCalcProps.addEventListener('click', () => {
      sfx.playSuccess();
      triggerHaptic(15);
      applyDynamicRockProperties();
      const t = I18N[state.currentLang] || I18N.fr;
      showToast(t.toastAutoCalcRockProps || (state.currentLang === 'en' ? 'Rock properties recalculated from geological composition!' : 'Propriétés de la roche recalculées selon la géologie !'));
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
    });
  }

  if (DOM.secondaryPctSlider) {
    DOM.secondaryPctSlider.addEventListener('input', (e) => {
      state.secondaryPercentage = parseFloat(e.target.value);
      if (DOM.secondaryPctLabel) DOM.secondaryPctLabel.textContent = `${state.secondaryPercentage.toFixed(1)} %`;
      if (DOM.secondaryPctDisplay) DOM.secondaryPctDisplay.textContent = `${state.secondaryPercentage.toFixed(0)}%`;
      applyDynamicRockProperties();
    });
  }

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
  if (DOM.mobileLiveSummaryBar) {
    DOM.mobileLiveSummaryBar.addEventListener('click', () => setMobileView('analysis'));
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
// FEATURE 2: REFINERY ORDERS TRACKER
// ==========================================
function populateRefineryModalSelects() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (DOM.refineryOrderStationSelect) {
    DOM.refineryOrderStationSelect.innerHTML = '';

    const stantonGroup = document.createElement('optgroup');
    stantonGroup.label = t.optgroupStanton || '🌌 SYSTÈME STANTON';

    const pyroGroup = document.createElement('optgroup');
    pyroGroup.label = t.optgroupPyro || '🔥 SYSTÈME PYRO';

    const nyxGroup = document.createElement('optgroup');
    nyxGroup.label = t.optgroupNyx || '🚀 SYSTÈME NYX';

    MINING_DATA.refineryStations.forEach(st => {
      const opt = document.createElement('option');
      opt.value = st.id;
      opt.textContent = `${st.name} (${st.system}) - ${st.bestFor}`;
      if (st.sector === 'pyro') {
        pyroGroup.appendChild(opt);
      } else if (st.sector === 'nyx') {
        nyxGroup.appendChild(opt);
      } else {
        stantonGroup.appendChild(opt);
      }
    });

    DOM.refineryOrderStationSelect.appendChild(stantonGroup);
    DOM.refineryOrderStationSelect.appendChild(pyroGroup);
    DOM.refineryOrderStationSelect.appendChild(nyxGroup);
  }

  if (DOM.refineryOrderMethodSelect) {
    DOM.refineryOrderMethodSelect.innerHTML = '';
    MINING_DATA.refiningMethods.forEach(rm => {
      const opt = document.createElement('option');
      opt.value = rm.id;
      opt.textContent = `${rm.name} (${Math.round(rm.yieldRate * 100)}% ${t.refineryYield}) - ${rm.durationHoursPerSCU}h/SCU`;
      DOM.refineryOrderMethodSelect.appendChild(opt);
    });
  }
}

function addRefineryJobFromHold() {
  const t = I18N[state.currentLang] || I18N.fr;
  if (state.holdSCU <= 0 && state.sessionLog.length === 0) {
    sfx.playWarning();
    showToast(t.toastHoldEmpty);
    return;
  }

  populateRefineryModalSelects();
  openModal(DOM.refineryModal);
}

function confirmCreateRefineryJob() {
  const t = I18N[state.currentLang] || I18N.fr;
  const stationId = DOM.refineryOrderStationSelect.value;
  const methodId = DOM.refineryOrderMethodSelect.value;

  const station = MINING_DATA.refineryStations.find(s => s.id === stationId) || MINING_DATA.refineryStations[0];
  const method = MINING_DATA.refiningMethods.find(m => m.id === methodId) || MINING_DATA.refiningMethods[0];

  const totalSCU = state.holdSCU > 0 ? state.holdSCU : 10.0;
  const totalRaw = state.sessionLog.reduce((acc, x) => acc + x.rawVal, 0) || 150000;
  const bonus = (station.bonusMineral === state.selectedMineral.id) ? (1 + station.bonusRate) : 1.0;
  const refinedVal = Math.round(totalRaw * method.yieldRate * 1.85 * bonus);

  // Duration scaled for interactive UI (e.g. ~45s to 2min per order for live feedback)
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
    collected: false
  };

  state.refineryJobs.unshift(newJob);
  saveRefineryJobs();

  // Empty ship hold since cargo has been handed to refinery
  clearHold();

  renderRefineryJobs();
  updateRefineryBadge();
  sfx.playSuccess();
  triggerHaptic(20);
  showToast(t.toastRefinerySubmitted);
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
      sfx.playSuccess();
      showToast(t.toastRefineryReady.replace('{station}', job.stationName));
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

  renderRefineryJobs();
  updateRefineryBadge();
  updateLedgerDisplay();
  sfx.playSuccess();
  triggerHaptic(25);
  showToast(t.toastRefineryCollectedVal.replace('{auec}', job.refinedVal.toLocaleString(getLocale())));
}

function renderRefineryJobs() {
  if (!DOM.refineryJobsList) return;
  const t = I18N[state.currentLang] || I18N.fr;
  const locale = getLocale();
  const now = Date.now();

  const activeJobs = state.refineryJobs.filter(j => !j.collected);
  if (DOM.refineryActiveCount) {
    DOM.refineryActiveCount.textContent = `${activeJobs.length} ${activeJobs.length > 1 ? t.refineryBatchPlural : t.refineryBatchSingle}`;
  }
  const totalRefVal = activeJobs.reduce((acc, j) => acc + j.refinedVal, 0);
  if (DOM.refineryTotalValueDisplay) {
    DOM.refineryTotalValueDisplay.textContent = `${totalRefVal.toLocaleString(locale)} aUEC`;
  }

  DOM.refineryJobsList.innerHTML = '';
  if (activeJobs.length === 0) {
    DOM.refineryJobsList.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.85rem; padding:20px;">${t.noActiveJobs}</div>`;
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
      timerHtml = `<span class="refinery-timer-badge ready">${t.refineryJobReady}</span>`;
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
        ${isReady ? `<button class="btn-collect-job" data-collect-id="${job.id}">${t.btnCollectJob}</button>` : `<span style="font-size:0.75rem; color:var(--text-muted);">${t.refineryJobInProgress}</span>`}
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
          console.log('[AARON MFD] ServiceWorker actif (v1.5):', reg.scope);

          // Force update check
          reg.update().catch(() => {});

          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[AARON MFD] Nouvelle version v1.5 disponible en cache.');
                  const t = I18N[state.currentLang] || I18N.fr;
                  showToast(t.toastCacheCleared || 'Mise à jour v1.5 disponible !');
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
  showToast(t.toastCacheCleared || 'Cache vidé ! Rechargement v1.5...');

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

