// Star Citizen Salvage & Structural Disintegration Database (Star Citizen 4.0+)
// Vaisseaux de recyclage, modules de grattage, catalogues d'épaves et cours RMC / CM

export const SALVAGE_SHIPS = [
  {
    id: 'vulture',
    name: 'Drake Vulture',
    manufacturer: 'Drake Interplanetary',
    role: 'salvage',
    type_fr: 'Vaisseau Solo de Recyclage & Scraping',
    type_en: 'Solo Salvage & Scraping Ship',
    scu: 13,
    bufferSCU: 12,
    maxManualSCU: 28,
    scraperSlots: 2,
    scraperSize: 1,
    tractorSlots: 1,
    qdSize: 1,
    shieldSize: 1,
    shieldCount: 2,
    baseScrapingSpeed: 1.0,
    desc_fr: 'Vaisseau solo incontournable avec deux bras d\'épluchage et un tampon de broyage interne de 12 SCU.',
    desc_en: 'The definitive solo salvage craft featuring twin scraping arms and an internal 12 SCU buffer.'
  },
  {
    id: 'reclaimer',
    name: 'Aegis Reclaimer',
    manufacturer: 'Aegis Dynamics',
    role: 'salvage',
    type_fr: 'Plateforme Industrielle Lourde de Démantèlement',
    type_en: 'Heavy Industrial Salvage & Disintegration Platform',
    scu: 240,
    bufferSCU: 180,
    maxManualSCU: 420,
    scraperSlots: 2,
    scraperSize: 2,
    clawDisintegration: true,
    tractorSlots: 2,
    qdSize: 3,
    shieldSize: 3,
    shieldCount: 3,
    baseScrapingSpeed: 3.2,
    desc_fr: 'Léviathan industriel équipé de tourelles de grattage S2 et d\'une griffe colossale de fracturation structurelle.',
    desc_en: 'Industrial leviathan armed with dual S2 scraping turrets and a colossal structural disintegration claw.'
  },
  {
    id: 'srv',
    name: 'Argo SRV',
    manufacturer: 'Argo Astronautics',
    role: 'support',
    type_fr: 'Remorqueur Spatial & Tracteur d\'Épaves',
    type_en: 'Search, Recovery & Towing Vessel',
    scu: 10,
    bufferSCU: 0,
    maxManualSCU: 10,
    scraperSlots: 0,
    scraperSize: 0,
    clawDisintegration: false,
    tractorSlots: 1,
    qdSize: 2,
    shieldSize: 2,
    shieldCount: 1,
    baseScrapingSpeed: 0,
    desc_fr: 'Remorqueur utilitaire équipé d\'un rayon tracteur S3 pour déplacer des épaves entières vers une zone de démantèlement sécurisée.',
    desc_en: 'Towing utility vessel equipped with an S3 tractor beam to haul derelict hulls to safe salvage sectors.'
  }
];

export const SALVAGE_SCRAPERS = [
  {
    id: 'abrade_s1',
    name: 'Abrade S1',
    size: 1,
    manufacturer: 'Drake',
    speedScuMin: 0.90,
    efficiencyPct: 85,
    beamRadiusM: 1.2,
    desc_fr: 'Polyvalente et équilibrée. Le choix par défaut pour gratter proprement sans gaspiller de matière.',
    desc_en: 'Versatile and well-balanced. Standard choice for clean scraping without wasting hull matter.'
  },
  {
    id: 'cinch_s1',
    name: 'Cinch S1',
    size: 1,
    manufacturer: 'Aegis',
    speedScuMin: 0.70,
    efficiencyPct: 95,
    beamRadiusM: 0.8,
    desc_fr: 'Faisceau focalisé de haute précision. Rendement RMC maximal (95%) pour les coques rares.',
    desc_en: 'High-precision focused beam. Maximum RMC yield (95%) on valuable military hulls.'
  },
  {
    id: 'trawler_s1',
    name: 'Trawler S1',
    size: 1,
    manufacturer: 'Greycat',
    speedScuMin: 1.55,
    efficiencyPct: 68,
    beamRadiusM: 2.4,
    desc_fr: 'Cône ultra-large à haut débit. Idéal pour décaper à toute allure les grandes surfaces planes (C2, Connie).',
    desc_en: 'Ultra-wide cone with high scraping flow. Ideal for rapid scraping on vast flat hull panels.'
  },
  {
    id: 'cambium_s2',
    name: 'Cambium S2',
    size: 2,
    manufacturer: 'Aegis',
    speedScuMin: 2.80,
    efficiencyPct: 92,
    beamRadiusM: 3.0,
    desc_fr: 'Tête industrielle lourde montée sur les tourelles du Reclaimer. Décapage de masse à haut rendement.',
    desc_en: 'Heavy industrial head fitted on Reclaimer turrets. High-yield mass scraping.'
  }
];

export const SALVAGE_WRECKS = [
  {
    id: 'wreck_prospector',
    name: 'MISC Prospector',
    category: 'Solo Industriel',
    surfaceAreaM2: 850,
    baseMassKg: 38000,
    potentialRMC: 6.2,
    potentialCM: 11.5,
    scrapingDifficulty: 'Très Facile',
    difficultyColor: '#00ff9d',
    estimatedTimeMin: 4,
    commonLoot: ['Tête de minage Lancet/Helix S1', 'Modules de laser', 'Batteries industrielles'],
    desc_fr: 'Petite carcasse industrielle rapide à vider. Parfaite pour remplir la première moitié du tampon.',
    desc_en: 'Small industrial carcass fast to clear. Perfect to fill the first half of the buffer.'
  },
  {
    id: 'wreck_cutlass_black',
    name: 'Drake Cutlass Black',
    category: 'Moyen Polyvalent',
    surfaceAreaM2: 1350,
    baseMassKg: 54000,
    potentialRMC: 8.8,
    potentialCM: 16.5,
    scrapingDifficulty: 'Facile',
    difficultyColor: '#00e5ff',
    estimatedTimeMin: 6,
    commonLoot: ['Bouclier FR-66 S1', 'Répéteurs laser S3', 'Conteneurs 2 SCU'],
    desc_fr: 'Épave très commune en mission. Blindage Drake fin et facile à décoller.',
    desc_en: 'Common mission wreck. Thin Drake plating fast and effortless to scrape.'
  },
  {
    id: 'wreck_c1_spirit',
    name: 'Crusader C1 Spirit',
    category: 'Moyen Cargo',
    surfaceAreaM2: 1750,
    baseMassKg: 68000,
    potentialRMC: 12.5,
    potentialCM: 22.0,
    scrapingDifficulty: 'Intermédiaire',
    difficultyColor: '#38bdf8',
    estimatedTimeMin: 9,
    commonLoot: ['Générateur S2', 'Plaques composites', 'Conteneurs commerciaux'],
    desc_fr: 'De larges ailes profilées offrent d\'immenses panneaux réguliers pour un scraping au Trawler.',
    desc_en: 'Wide wing geometry provides vast continuous panels for Trawler scraping runs.'
  },
  {
    id: 'wreck_connie_andromeda',
    name: 'RSI Constellation Andromeda',
    category: 'Lourd Polyvalent',
    surfaceAreaM2: 2600,
    baseMassKg: 122000,
    potentialRMC: 19.5,
    potentialCM: 38.0,
    scrapingDifficulty: 'Intermédiaire-Élevé',
    difficultyColor: '#fbbf24',
    estimatedTimeMin: 14,
    commonLoot: ['Bouclier S2 Rampart', 'Générateur JS-400', 'Missiles S2/S1'],
    desc_fr: 'Le grand classique du salvage rentable : un Connie complet sature la soute d\'un Vulture et déborde.',
    desc_en: 'The classic profitable salvage prize: one complete Connie fills a Vulture to maximum brim.'
  },
  {
    id: 'wreck_c2_hercules',
    name: 'Crusader C2 Hercules',
    category: 'Super-Transporteur Lourd',
    surfaceAreaM2: 5400,
    baseMassKg: 295000,
    potentialRMC: 44.0,
    potentialCM: 92.0,
    scrapingDifficulty: 'Élevé (Duo Vultures ou Reclaimer)',
    difficultyColor: '#f97316',
    estimatedTimeMin: 28,
    commonLoot: ['Composants capitaux S3', 'Bouclier FR-86', 'Conteneurs 16-32 SCU'],
    desc_fr: 'Monstre logistique de Crusader. Idéal pour une session de guilde ou une sortie Reclaimer.',
    desc_en: 'Crusader logistics titan. Prime target for an organization salvage wing or Reclaimer crew.'
  },
  {
    id: 'wreck_hammerhead',
    name: 'Aegis Hammerhead',
    category: 'Corvette Militaire Lourde',
    surfaceAreaM2: 8100,
    baseMassKg: 440000,
    potentialRMC: 68.0,
    potentialCM: 155.0,
    scrapingDifficulty: 'Extrême (Opération Reclaimer)',
    difficultyColor: '#ef4444',
    estimatedTimeMin: 45,
    commonLoot: ['Tourelles quadruples S4', 'Boucliers militaires S3', 'Armatures en titane militaire'],
    desc_fr: 'La récompense suprême : blindage militaire multicouche produisant un volume colossal de Construction Materials.',
    desc_en: 'The apex salvage contract: heavy multilayered military plating yielding massive Construction Materials.'
  }
];

export const SALVAGE_COMMODITIES = [
  {
    id: 'rmc',
    name: 'Recycled Material Composite (RMC)',
    name_fr: 'Matériau Composite Recyclé (RMC)',
    scuWeightKg: 1000,
    basePriceAuec: 14200,
    typicalPriceRange: { min: 13000, max: 15400 },
    bestLocations: [
      { name: 'TDD Area18', price: 14850, demand: 'Très Forte' },
      { name: 'TDD New Babbage', price: 14600, demand: 'Forte' },
      { name: 'TDD Orison', price: 14500, demand: 'Forte' },
      { name: 'TDD Lorville', price: 14400, demand: 'Moyenne' },
      { name: 'GrimHEX Admin', price: 13800, demand: 'Sans Juridiction' }
    ],
    craftingUsage_fr: 'Plaques de blindage, coques d\'engins, consommables de réparation spatiale',
    craftingUsage_en: 'Hull armor plating, spacecraft chassis, field repair consumables'
  },
  {
    id: 'construction_materials',
    name: 'Construction Materials (CM)',
    name_fr: 'Matériaux de Construction (CM)',
    scuWeightKg: 1250,
    basePriceAuec: 7200,
    typicalPriceRange: { min: 6500, max: 8100 },
    bestLocations: [
      { name: 'TDD Lorville (Hurston)', price: 7800, demand: 'Très Forte' },
      { name: 'TDD Area18', price: 7450, demand: 'Forte' },
      { name: 'Orison Industrial Supply', price: 7300, demand: 'Moyenne' },
      { name: 'Ruin Station (Pyro)', price: 8100, demand: 'Maximale' }
    ],
    craftingUsage_fr: 'Armatures structurales, renforts de canons, ossatures de bases et modules',
    craftingUsage_en: 'Structural trusses, heavy weapon cradles, base building modular frames'
  }
];
