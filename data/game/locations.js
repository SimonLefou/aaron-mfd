// Star Citizen Celestial Mining Locations (Aaron Halo Bands, Planetary Hotspots & Asteroid Archetypes)

// ==========================================
// AARON HALO ASTEROID BELT QUANTUM DROP ROUTES
// ==========================================
export const AARON_HALO_BANDS = [
  {
    id: 'arccorp_hurl3',
    route: 'ArcCorp ➔ HUR-L3',
    targetDistanceMkm: 13.6,
    totalDistanceMkm: 32.5,
    fromStation: 'ArcCorp',
    dropDistance_fr: '13 600 000 km d\'ArcCorp',
    dropDistance_en: '13,600,000 km from ArcCorp',
    band_fr: 'Bande 5 (Dense)',
    band_en: 'Band 5 (Dense)',
    qtRate_fr: 'Très élevé',
    qtRate_en: 'Very High',
    desc_fr: 'Coupez le Quantum Drive à 13,6 M km d\'ArcCorp pour plonger au cœur de la Bande 5.',
    desc_en: 'Cut Quantum Drive at 13.6M km from ArcCorp to drop directly into Band 5.'
  },
  {
    id: 'hurl3_arccorp',
    route: 'HUR-L3 ➔ ArcCorp',
    targetDistanceMkm: 18.9,
    totalDistanceMkm: 32.5,
    fromStation: 'HUR-L3',
    dropDistance_fr: '18 900 000 km de HUR-L3',
    dropDistance_en: '18,900,000 km from HUR-L3',
    band_fr: 'Bande 5 (Dense)',
    band_en: 'Band 5 (Dense)',
    qtRate_fr: 'Très élevé',
    qtRate_en: 'Very High',
    desc_fr: 'Coupez le QT à 18,9 M km de HUR-L3 en direction d\'ArcCorp.',
    desc_en: 'Cut QT at 18.9M km from HUR-L3 heading toward ArcCorp.'
  },
  {
    id: 'crul1_arccorp',
    route: 'CRU-L1 ➔ ArcCorp',
    targetDistanceMkm: 12.85,
    totalDistanceMkm: 43.1,
    fromStation: 'CRU-L1',
    dropDistance_fr: '12 850 000 km de CRU-L1',
    dropDistance_en: '12,850,000 km from CRU-L1',
    band_fr: 'Bande 6 (Large)',
    band_en: 'Band 6 (Wide)',
    qtRate_fr: 'Élevé',
    qtRate_en: 'High',
    desc_fr: 'Excellent couloir de minage sécurisé loin des routes de patrouille.',
    desc_en: 'Excellent secure mining corridor far away from main patrol vectors.'
  },
  {
    id: 'arccorp_crul1',
    route: 'ArcCorp ➔ CRU-L1',
    targetDistanceMkm: 30.25,
    totalDistanceMkm: 43.1,
    fromStation: 'ArcCorp',
    dropDistance_fr: '30 250 000 km d\'ArcCorp',
    dropDistance_en: '30,250,000 km from ArcCorp',
    band_fr: 'Bande 6 (Large)',
    band_en: 'Band 6 (Wide)',
    qtRate_fr: 'Élevé',
    qtRate_en: 'High',
    desc_fr: 'Traversée de la Bande 6 depuis ArcCorp. Champ d\'astéroïdes régulier et très calme.',
    desc_en: 'Band 6 transit from ArcCorp. Steady asteroid field with low pirate disruption.'
  },
  {
    id: 'arccorp_hurston',
    route: 'ArcCorp ➔ Hurston',
    targetDistanceMkm: 14.1,
    totalDistanceMkm: 29.8,
    fromStation: 'ArcCorp',
    dropDistance_fr: '14 100 000 km d\'ArcCorp',
    dropDistance_en: '14,100,000 km from ArcCorp',
    band_fr: 'Bande 5 Centrale',
    band_en: 'Central Band 5',
    qtRate_fr: 'Maximum',
    qtRate_en: 'Maximum',
    desc_fr: 'Route directe majeure vers la plus forte concentration de Quantainium de l\'anneau.',
    desc_en: 'Major direct vector to the densest Quantainium concentration in the ring.'
  },
  {
    id: 'hurston_arccorp',
    route: 'Hurston ➔ ArcCorp',
    targetDistanceMkm: 15.7,
    totalDistanceMkm: 29.8,
    fromStation: 'Hurston',
    dropDistance_fr: '15 700 000 km de Hurston',
    dropDistance_en: '15,700,000 km from Hurston',
    band_fr: 'Bande 5 Centrale',
    band_en: 'Central Band 5',
    qtRate_fr: 'Maximum',
    qtRate_en: 'Maximum',
    desc_fr: 'Retour direct depuis Hurston pour plonger dans les poches riches en Bexalite et Quantainium.',
    desc_en: 'Direct drop from Hurston into rich Bexalite and Quantainium pockets.'
  },
  {
    id: 'crul1_microtech',
    route: 'CRU-L1 ➔ microTech',
    targetDistanceMkm: 15.2,
    totalDistanceMkm: 57.4,
    fromStation: 'CRU-L1',
    dropDistance_fr: '15 200 000 km de CRU-L1',
    dropDistance_en: '15,200,000 km from CRU-L1',
    band_fr: 'Bande 4',
    band_en: 'Band 4',
    qtRate_fr: 'Moyen-Élevé',
    qtRate_en: 'Medium-High',
    desc_fr: 'Couloir de transition entre le secteur Crusader et microTech.',
    desc_en: 'Transition corridor between Crusader and microTech sectors.'
  },
  {
    id: 'delamar_arccorp',
    route: 'Delamar (Nyx) ➔ ArcCorp',
    targetDistanceMkm: 8.7,
    totalDistanceMkm: 25.1,
    fromStation: 'Delamar',
    dropDistance_fr: '8 700 000 km de Delamar',
    dropDistance_en: '8,700,000 km from Delamar',
    band_fr: 'Bande 7 Extérieure',
    band_en: 'Outer Band 7',
    qtRate_fr: 'Élevé',
    qtRate_en: 'High',
    desc_fr: 'Ceinture extérieure discrète très prisée des corporations indépendantes.',
    desc_en: 'Discreet outer belt favored by independent mining outfits.'
  }
];

// ==========================================
// CELESTIAL MINING HOTSPOTS (PLANETS, MOONS & FIELDS)
// ==========================================
export const MINING_HOTSPOTS = [
  // --- STANTON SYSTEM ---
  {
    id: 'lyria',
    name: 'Lyria',
    body: 'Lune d\'ArcCorp',
    system: 'stanton',
    mainOre: 'Quantainium (Clusters)',
    yield_fr: 'Concentration de clusters de surface n°1 de Stanton',
    yield_en: 'Number 1 surface cluster concentration in Stanton',
    recommendedLaser: 'Lancet MH1 / MH2',
    notes_fr: 'La référence absolue pour le Quantainium en surface. Cherchez les clusters multiples.',
    notes_en: 'The definitive surface Quantainium hotspot. Look for multi-rock clusters.'
  },
  {
    id: 'wala',
    name: 'Wala',
    body: 'Lune d\'ArcCorp',
    system: 'stanton',
    mainOre: 'Laranite & Agricium',
    yield_fr: 'Très riche en métaux nobles et semi-précieux',
    yield_en: 'Rich in noble and semi-precious metals',
    recommendedLaser: 'Helix ou Lancet',
    notes_fr: 'Faible gravité, topographie douce idéale pour prospecter sans danger.',
    notes_en: 'Low gravity, smooth topography ideal for safe prospecting.'
  },
  {
    id: 'daymar',
    name: 'Daymar',
    body: 'Lune de Crusader',
    system: 'stanton',
    mainOre: 'Bexalite & Hadanite',
    yield_fr: 'Excellent pour le minage terrestre au ROC et les grottes',
    yield_en: 'Excellent for ROC ground mining and deep caves',
    recommendedLaser: 'Greycat Arbor S0 / ROC',
    notes_fr: 'Dépôts de Hadanite massifs dans les canyons et grottes rocheuses (Kudre Ore).',
    notes_en: 'Massive Hadanite veins in canyons and caves (Kudre Ore).'
  },
  {
    id: 'yela',
    name: 'Yela (Ceinture & Surface)',
    body: 'Lune de Crusader',
    system: 'stanton',
    mainOre: 'Agricium, Taranite & Quantainium',
    yield_fr: 'Anneau d\'astéroïdes très dense',
    yield_en: 'Very dense asteroid ring',
    recommendedLaser: 'Lancet MH1 / MH2',
    notes_fr: 'L\'anneau de Yela regorge d\'astéroïdes glaciaires et de roches riches en Taranite.',
    notes_en: 'Yela\'s ring is packed with cryo-asteroids and Taranite-rich rocks.'
  },
  {
    id: 'cellin',
    name: 'Cellin',
    body: 'Lune de Crusader',
    system: 'stanton',
    mainOre: 'Taranite & Beryl',
    yield_fr: 'Roches volcaniques denses',
    yield_en: 'Dense volcanic formations',
    recommendedLaser: 'Impact ou Lancet',
    notes_fr: 'Cratères volcaniques et geysers. Excellente source de Taranite pure.',
    notes_en: 'Volcanic craters and geysers. Excellent source of pure Taranite.'
  },
  {
    id: 'aberdeen',
    name: 'Aberdeen',
    body: 'Lune de Hurston',
    system: 'stanton',
    mainOre: 'Hadanite (Surface ROC)',
    yield_fr: 'La plus forte concentration de Hadanite de Stanton',
    yield_en: 'Highest Hadanite concentration in Stanton',
    recommendedLaser: 'ROC / Arbor MH0',
    notes_fr: 'Chaleur extrême ! Combinaison thermique Pembroke obligatoire pour sortir.',
    notes_en: 'Extreme heat! Pembroke thermal environmental suit mandatory to step outside.'
  },
  {
    id: 'arial',
    name: 'Arial',
    body: 'Lune de Hurston',
    system: 'stanton',
    mainOre: 'Laranite & Bexalite',
    yield_fr: 'Roches de grande masse très rémunératrices',
    yield_en: 'High-mass, highly lucrative boulders',
    recommendedLaser: 'Helix ou Lancet avec sous-module Surge',
    notes_fr: 'Atmosphère corrosive et gravités élevées. HDMS-Bezdek à proximité.',
    notes_en: 'Corrosive atmosphere and heavy gravity. HDMS-Bezdek nearby.'
  },
  {
    id: 'magda',
    name: 'Magda',
    body: 'Lune de Hurston',
    system: 'stanton',
    mainOre: 'Hephaestanite & Cuivre',
    yield_fr: 'Gisements miniers continus et réguliers',
    yield_en: 'Steady, regular mineral deposits',
    recommendedLaser: 'Arbor ou Impact',
    notes_fr: 'Minage paisible sans prédateurs pirates fréquents.',
    notes_en: 'Peaceful mining with rare pirate disruptions.'
  },
  {
    id: 'calliope',
    name: 'Calliope',
    body: 'Lune de microTech',
    system: 'stanton',
    mainOre: 'Bexalite & Taranite',
    yield_fr: 'Roches glaciaires denses très riches',
    yield_en: 'Dense, rich glacial boulders',
    recommendedLaser: 'Lancet MH1 + Focus III',
    notes_fr: 'Tempêtes de neige violentes. Privilégiez les vallées abritées.',
    notes_en: 'Violent blizzards. Target sheltered valleys.'
  },
  {
    id: 'clio',
    name: 'Clio',
    body: 'Lune de microTech',
    system: 'stanton',
    mainOre: 'Quantainium & Beryl',
    yield_fr: 'Banquises et plateaux côtiers',
    yield_en: 'Ice shelves and coastal plains',
    recommendedLaser: 'Lancet MH1 / MH2',
    notes_fr: 'Plaisant pour les mineurs en solitaire avec paysages aquatiques glaciaires.',
    notes_en: 'Pleasant solo mining with glacial ocean vistas.'
  },
  {
    id: 'euterpe',
    name: 'Euterpe',
    body: 'Lune de microTech',
    system: 'stanton',
    mainOre: 'Or & Bexalite',
    yield_fr: 'Plaines de glace polaires',
    yield_en: 'Polar ice plains',
    recommendedLaser: 'Arbor ou Lancet',
    notes_fr: 'Visibilité excellente par ciel dégagé.',
    notes_en: 'Excellent visibility under clear skies.'
  },

  // --- PYRO SYSTEM (STAR CITIZEN 4.0) ---
  {
    id: 'pyro_monox',
    name: 'Pyro II (Monox)',
    body: 'Planète tellurique',
    system: 'pyro',
    mainOre: 'Stileron & Riccite',
    yield_fr: 'Métaux rares de blindage militaire de Pyro',
    yield_en: 'Rare Pyro military armor metals',
    recommendedLaser: 'Lancet MH2 / Helix II + Sabir 21',
    notes_fr: 'Gisements très résistants. Une escorte armée de guilde est indispensable.',
    notes_en: 'Extremely resilient veins. Armed guild escort is essential.'
  },
  {
    id: 'pyro_bloom',
    name: 'Pyro III (Bloom)',
    body: 'Planète gazeuse/volcanique',
    system: 'pyro',
    mainOre: 'Sadaryx & Carinite',
    yield_fr: 'Composés cristallins et alliages énergétiques',
    yield_en: 'Crystalline compounds & energy alloys',
    recommendedLaser: 'Hofstede ou Lancet',
    notes_fr: 'Volcanisme actif et poches énergétiques explosives.',
    notes_en: 'Active volcanism and explosive energy pockets.'
  },
  {
    id: 'pyro_terminus',
    name: 'Pyro VI (Terminus / Anneau)',
    body: 'Anneau d\'astéroïdes de Ruin Station',
    system: 'pyro',
    mainOre: 'Stileron, Riccite & Quantainium',
    yield_fr: 'Champ de débris et astéroïdes gigantesques',
    yield_en: 'Gigantic asteroid and debris field',
    recommendedLaser: 'MOLE / Arrastra S2-S3',
    notes_fr: 'Zone sans foi ni loi, primes maximales mais pirates omniprésents.',
    notes_en: 'Lawless zone, maximum payout but constant pirate presence.'
  },

  // --- NYX SYSTEM ---
  {
    id: 'nyx_delamar',
    name: 'Delamar (Anneau de Nyx)',
    body: 'Astéroïde géant / Cité minière de Levski',
    system: 'nyx',
    mainOre: 'Bexalite, Taranite & Borase',
    yield_fr: 'Champs d\'astéroïdes profonds sans juridiction',
    yield_en: 'Deep non-jurisdiction asteroid fields',
    recommendedLaser: 'Lancet ou Helix',
    notes_fr: 'Parfait pour le minage indépendant libre de toute taxe impériale.',
    notes_en: 'Perfect for independent mining free from UEE imperial tax.'
  }
];

// ==========================================
// ROCK ARCHETYPES & COMPOSITIONAL GEOLOGY
// ==========================================
export const ROCK_ARCHETYPES = [
  {
    id: 'basalt',
    name: 'Basalte',
    name_fr: 'Basalte Volcanique',
    name_en: 'Volcanic Basalt',
    densityCategory: 'Élevée',
    baseResistance: 0.55,
    baseInstability: 0.40,
    primaryMineral: 'Quantainium / Bexalite',
    desc_fr: 'Roche volcanique dense et sombre. Contient les gisements les plus riches de Stanton et Pyro.',
    desc_en: 'Dense, dark volcanic rock. Contains the richest mineral veins in Stanton and Pyro.'
  },
  {
    id: 'granite',
    name: 'Granite',
    name_fr: 'Granite Continental',
    name_en: 'Continental Granite',
    densityCategory: 'Moyenne-Élevée',
    baseResistance: 0.45,
    baseInstability: 0.25,
    primaryMineral: 'Laranite / Agricium',
    desc_fr: 'Roche magmatique grenue très stable. Réponse prévisible au laser de minage.',
    desc_en: 'Coarse-grained magmatic rock. Very predictable response under laser fire.'
  },
  {
    id: 'obsidian',
    name: 'Obsidienne',
    name_fr: 'Obsidienne Vitreuse',
    name_en: 'Vitreous Obsidian',
    densityCategory: 'Moyenne',
    baseResistance: 0.35,
    baseInstability: 0.75,
    primaryMineral: 'Quantainium / Sadaryx',
    desc_fr: 'Verre volcanique hautement instable. Risque critique de surchauffe et d\'explosion.',
    desc_en: 'Highly unstable volcanic glass. Critical overcharge and explosion hazard.'
  },
  {
    id: 'igneous',
    name: 'Igné',
    name_fr: 'Roches Ignées',
    name_en: 'Igneous Rock',
    densityCategory: 'Élevée',
    baseResistance: 0.50,
    baseInstability: 0.35,
    primaryMineral: 'Titane / Or',
    desc_fr: 'Roche magmatique refroidie. Forte capacité thermique et absorption d\'énergie.',
    desc_en: 'Cooled magmatic rock. High thermal mass and energy absorption.'
  },
  {
    id: 'felsic',
    name: 'Felsique',
    name_fr: 'Formation Felsique',
    name_en: 'Felsic Formation',
    densityCategory: 'Faible',
    baseResistance: 0.25,
    baseInstability: 0.20,
    primaryMineral: 'Béryl / Quartz',
    desc_fr: 'Roche riche en feldspath et silice. Facile à briser même avec des lasers de base.',
    desc_en: 'Silica and feldspar rich rock. Easy to crack even with stock lasers.'
  },
  {
    id: 'gneiss',
    name: 'Gneiss',
    name_fr: 'Gneiss Métamorphique',
    name_en: 'Metamorphic Gneiss',
    densityCategory: 'Moyenne',
    baseResistance: 0.40,
    baseInstability: 0.30,
    primaryMineral: 'Taranite / Borase',
    desc_fr: 'Roche rubanée métamorphique offrant un excellent compromis difficulté/gain.',
    desc_en: 'Banded metamorphic rock offering an optimal difficulty/payout balance.'
  },
  {
    id: 'quartzite',
    name: 'Quartzite',
    name_fr: 'Quartzite Crystalline',
    name_en: 'Crystalline Quartzite',
    densityCategory: 'Très Élevée',
    baseResistance: 0.65,
    baseInstability: 0.20,
    primaryMineral: 'Tungstène / Cuivre',
    desc_fr: 'Roche sédimentaire recristallisée ultra-dure. Nécessite une puissance laser soutenue.',
    desc_en: 'Ultra-hard recrystallized rock. Demands heavy, sustained laser wattage.'
  },
  {
    id: 'shale',
    name: 'Schiste',
    name_fr: 'Schiste Fissile',
    name_en: 'Fissile Shale',
    densityCategory: 'Faible',
    baseResistance: 0.20,
    baseInstability: 0.45,
    primaryMineral: 'Hephaestanite / Fer',
    desc_fr: 'Structure feuilletée se fragmentant rapidement en petits morceaux.',
    desc_en: 'Layered structure fragmenting rapidly into smaller chunks.'
  },
  {
    id: 'atacamite',
    name: 'Atacamite',
    name_fr: 'Matrice d\'Atacamite',
    name_en: 'Atacamite Matrix',
    densityCategory: 'Moyenne',
    baseResistance: 0.30,
    baseInstability: 0.15,
    primaryMineral: 'Cuivre / Minéraux Secondaires',
    desc_fr: 'Chlorure de cuivre hydraté vert. Très docile sous faisceau laser.',
    desc_en: 'Green hydrated copper chloride. Very docile under laser beam.'
  },
  {
    id: 'pyroxenite',
    name: 'Pyroxénite',
    name_fr: 'Pyroxénite Profonde',
    name_en: 'Deep Pyroxenite',
    densityCategory: 'Extrême',
    baseResistance: 0.70,
    baseInstability: 0.50,
    primaryMineral: 'Stileron / Riccite',
    desc_fr: 'Roche mantellique ultra-dense typique de Pyro. Résistance extrême nécessitant des têtes S2/S3.',
    desc_en: 'Ultra-dense mantle rock typical of Pyro. Extreme resistance demanding S2/S3 heads.'
  },
  {
    id: 'cryo_ice',
    name: 'Glace Cryo',
    name_fr: 'Astéroïde Glaciaire Cryo',
    name_en: 'Cryo-Glacial Asteroid',
    densityCategory: 'Faible',
    baseResistance: 0.15,
    baseInstability: 0.60,
    primaryMineral: 'Quantainium Pur / Hadanite',
    desc_fr: 'Matrice de glace pure sous vide spatial. Se fracture vite mais monte en température rapidement.',
    desc_en: 'Pure ice matrix in vacuum. Fractures quickly but heats up with volatile spikes.'
  }
];
