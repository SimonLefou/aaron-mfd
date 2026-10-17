// Star Citizen Ship Internal Components (QD, Shields, Power Plants, Coolers)
export const QUANTUM_DRIVES = [
    // Size 1 (Prospector, Cutlass, Hull A, Vulture, Fighters...)
    { id: 'atlas_s1', name: 'Atlas S1', size: 1, grade: 'A', classType: 'Civilian', speed: 152000, speedC: 0.507, fuelRate: 18.5, spooledTime: 3.8, desc_fr: 'Le roi des moteurs S1. Excellent équilibre vitesse et autonomie.', desc_en: 'The king of S1 drives. Perfect balance of speed and fuel economy.' },
    { id: 'vk00_s1', name: 'VK-00 S1', size: 1, grade: 'A', classType: 'Military', speed: 283000, speedC: 0.944, fuelRate: 42.2, spooledTime: 4.2, desc_fr: 'Vitesse d\'interception foudroyante, consommation élevée.', desc_en: 'Lightning interception speed, heavy fuel draw.' },
    { id: 'voyage_s1', name: 'Voyage S1', size: 1, grade: 'B', classType: 'Civilian', speed: 135000, speedC: 0.450, fuelRate: 14.8, spooledTime: 4.0, desc_fr: 'Grande autonomie inter-système pour longues traversées.', desc_en: 'High range for long interplanetary expeditions.' },
    { id: 'spectre_s1', name: 'Spectre S1', size: 1, grade: 'A', classType: 'Stealth', speed: 158000, speedC: 0.527, fuelRate: 22.0, spooledTime: 4.5, desc_fr: 'Signature EM/IR réduite pour opérations discrètes.', desc_en: 'Low EM/IR signature for discreet operations.' },
    { id: 'beacon_s1', name: 'Beacon S1', size: 1, grade: 'C', classType: 'Industrial', speed: 88000, speedC: 0.293, fuelRate: 9.2, spooledTime: 3.5, desc_fr: 'Économie de carburant maximale, idéal pour les sauts courts.', desc_en: 'Maximum fuel efficiency, great for short regional hops.' },

    // Size 2 (MOLE, C1, Freelancer, Taurus, RAFT, Zeus, Vanguard...)
    { id: 'crossfield_s2', name: 'Crossfield S2', size: 2, grade: 'B', classType: 'Military', speed: 226000, speedC: 0.754, fuelRate: 65.0, spooledTime: 5.5, desc_fr: 'Moteur militaire S2 très rapide, standard pour le convoi rapide.', desc_en: 'Fast military S2 drive, gold standard for express hauling.' },
    { id: 'xl1_s2', name: 'XL-1 S2', size: 2, grade: 'A', classType: 'Military', speed: 260000, speedC: 0.867, fuelRate: 80.5, spooledTime: 5.8, desc_fr: 'Le plus rapide des S2. Traversée de Stanton en un temps record.', desc_en: 'Fastest S2 in the verse. Stanton crossing in record time.' },
    { id: 'hemera_s2', name: 'Hemera S2', size: 2, grade: 'A', classType: 'Civilian', speed: 172000, speedC: 0.574, fuelRate: 38.0, spooledTime: 5.0, desc_fr: 'Excellente efficacité pour le transport commercial moyen.', desc_en: 'Excellent efficiency for medium commercial transport.' },
    { id: 'yeager_s2', name: 'Yeager S2', size: 2, grade: 'A', classType: 'Industrial', speed: 145000, speedC: 0.484, fuelRate: 27.5, spooledTime: 4.5, desc_fr: 'Autonomie gigantesque, idéal pour explorer ou traverser Pyro.', desc_en: 'Huge operational range, perfect for Pyro exploration.' },

    // Size 3 (C2 Hercules, Caterpillar, Arrastra, Hull C, Orion...)
    { id: 'ts2_s3', name: 'TS-2 S3', size: 3, grade: 'A', classType: 'Military', speed: 229000, speedC: 0.764, fuelRate: 220.0, spooledTime: 7.0, desc_fr: 'Moteur militaire lourd haute vitesse pour les super-transporteurs.', desc_en: 'High-speed heavy military drive for super-freighters.' },
    { id: 'pontes_s3', name: 'Pontes S3', size: 3, grade: 'B', classType: 'Military', speed: 248000, speedC: 0.827, fuelRate: 265.0, spooledTime: 7.5, desc_fr: 'Vitesse de pointe absolue pour cargos capitaux et C2.', desc_en: 'Maximum top speed for capital haulers and C2.' },
    { id: 'agni_s3', name: 'Agni S3', size: 3, grade: 'A', classType: 'Industrial', speed: 135000, speedC: 0.450, fuelRate: 110.0, spooledTime: 6.0, desc_fr: 'Rendement industriel exceptionnel pour les trajets massifs.', desc_en: 'Exceptional industrial fuel economy for massive cargo runs.' }
  ];

export const SHIELDS = [
    // Size 1
    { id: 'fr66_s1', name: 'FR-66 S1', size: 1, grade: 'A', classType: 'Military', hp: 1650, regen: 320, em: 480, desc_fr: 'Régénération rapide militaire, référence de protection.', desc_en: 'Rapid military regeneration, premier light shield.' },
    { id: 'palisade_s1', name: 'Palisade S1', size: 1, grade: 'A', classType: 'Industrial', hp: 2150, regen: 190, em: 350, desc_fr: 'Bouclier industriel à très haute capacité de blindage brut.', desc_en: 'High-capacity industrial shield pool.' },
    { id: 'mirage_s1', name: 'Mirage S1', size: 1, grade: 'A', classType: 'Stealth', hp: 1350, regen: 410, em: 180, desc_fr: 'Signature furtive ultra-basse et relance express.', desc_en: 'Ultra-low signature and express regeneration delay.' },
    { id: 'allstop_s1', name: 'AllStop S1', size: 1, grade: 'C', classType: 'Civilian', hp: 1500, regen: 240, em: 380, desc_fr: 'Bouclier civil standard monté d\'origine.', desc_en: 'Standard factory civilian shield.' },

    // Size 2
    { id: 'fr76_s2', name: 'FR-76 S2', size: 2, grade: 'A', classType: 'Military', hp: 9800, regen: 1450, em: 1200, desc_fr: 'Protection militaire standard des vaisseaux moyens.', desc_en: 'Military shield standard for medium ships.' },
    { id: 'rampart_s2', name: 'Rampart S2', size: 2, grade: 'A', classType: 'Industrial', hp: 13200, regen: 850, em: 980, desc_fr: 'Blindage thermique et balistique massif pour l\'industrie lourde.', desc_en: 'Massive damage mitigation for heavy industry.' },
    { id: 'umbra_s2', name: 'Umbra S2', size: 2, grade: 'A', classType: 'Stealth', hp: 7900, regen: 1800, em: 550, desc_fr: 'Bouclier furtif S2 à régénération suralimentée.', desc_en: 'Stealth S2 shield with fast recovery cycle.' },

    // Size 3
    { id: 'fr86_s3', name: 'FR-86 S3', size: 3, grade: 'A', classType: 'Military', hp: 105000, regen: 9200, em: 4500, desc_fr: 'Forteresse militaire pour transporteurs lourds et vaisseaux capitaux.', desc_en: 'Military fortress for heavy haulers and capital craft.' },
    { id: 'stronghold_s3', name: 'Stronghold S3', size: 3, grade: 'A', classType: 'Industrial', hp: 145000, regen: 5400, em: 3600, desc_fr: 'Capacité de blindage titanesque contre les collisions et tirs.', desc_en: 'Colossal pool absorbing massive sustained damage.' }
  ];

export const POWER_PLANTS = [
    // Size 1
    { id: 'js300_s1', name: 'JS-300 S1', size: 1, grade: 'A', classType: 'Military', power: 4200, distortionPool: 650, desc_fr: 'Centrale militaire puissante et fiable sous charge maximale.', desc_en: 'High-output military power plant under heavy load.' },
    { id: 'quadracell_s1', name: 'QuadraCell S1', size: 1, grade: 'A', classType: 'Civilian', power: 3850, distortionPool: 500, desc_fr: 'Générateur civil très stable et silencieux.', desc_en: 'Stable, quiet civilian generator.' },
    { id: 'soniclite_s1', name: 'SonicLite S1', size: 1, grade: 'A', classType: 'Competition', power: 4600, distortionPool: 400, desc_fr: 'Rendement énergétique survolté pour configurations exigeantes.', desc_en: 'Overclocked energy output for demanding systems.' },

    // Size 2
    { id: 'js400_s2', name: 'JS-400 S2', size: 2, grade: 'A', classType: 'Military', power: 12500, distortionPool: 1800, desc_fr: 'Générateur militaire S2 résistant à la distorsion.', desc_en: 'Heavy military S2 generator with high distortion resistance.' },
    { id: 'durango_s2', name: 'Durango S2', size: 2, grade: 'A', classType: 'Industrial', power: 11200, distortionPool: 2200, desc_fr: 'Conçu pour endurer les environnements miniers hostiles.', desc_en: 'Engineered to withstand harsh mining environments.' },

    // Size 3
    { id: 'daybreak_s3', name: 'Daybreak S3', size: 3, grade: 'A', classType: 'Military', power: 65000, distortionPool: 8500, desc_fr: 'Centrale énergétique colossale pour navires de grande envergure.', desc_en: 'Colossal output plant for capital-class vessels.' }
  ];

export const COOLERS = [
    // Size 1
    { id: 'ultraflow_s1', name: 'Ultra-Flow S1', size: 1, grade: 'A', classType: 'Competition', coolingRate: 380, desc_fr: 'Dissipation thermique instantanée pour éviter toute surchauffe.', desc_en: 'Instant thermal dissipation to prevent heat bottlenecks.' },
    { id: 'coolcore_s1', name: 'CoolCore S1', size: 1, grade: 'A', classType: 'Industrial', coolingRate: 320, desc_fr: 'Refroidisseur industriel endurant à longue durée de vie.', desc_en: 'Durable industrial cooler with long thermal life.' },
    { id: 'glacier_s1', name: 'Glacier S1', size: 1, grade: 'A', classType: 'Military', coolingRate: 350, desc_fr: 'Refroidisseur militaire blindé résistant aux avaries.', desc_en: 'Armored military cooler resistant to combat shocks.' },

    // Size 2
    { id: 'avalanche_s2', name: 'Avalanche S2', size: 2, grade: 'A', classType: 'Military', coolingRate: 1450, desc_fr: 'Dissipation massive pour tourelles multiples et moteurs lourds.', desc_en: 'Massive heat dissipation for multi-turrets and heavy drives.' },
    { id: 'iceflush_s2', name: 'IceFlush S2', size: 2, grade: 'A', classType: 'Industrial', coolingRate: 1280, desc_fr: 'Régulation thermique continue pour opérations industrielles.', desc_en: 'Continuous thermal regulation for sustained industry.' },

    // Size 3
    { id: 'thermal4_s3', name: 'Thermal-4 S3', size: 3, grade: 'A', classType: 'Industrial', coolingRate: 7500, desc_fr: 'Capacité de refroidissement gigantesque pour super-cargos et Arrastra.', desc_en: 'Gigantic heat rejection for super-freighters and Arrastra.' }
  ];

export const TRACTOR_BEAMS = [
  { id: 'suregrip_s1', name: 'SureGrip S1', size: 1, force: 6000, powerN: 6000, range: 100, rangeM: 100, maxContainerScu: 16, maxBoxScu: 16, desc_fr: 'Rayon utilitaire léger haute précision pour conteneurs 8 à 16 SCU.', desc_en: 'Light utility precision beam for 8 to 16 SCU containers.' },
  { id: 'truhold_s2', name: 'Greycat TruHold S2', size: 2, force: 12000, powerN: 12000, range: 150, rangeM: 150, maxContainerScu: 32, maxBoxScu: 32, desc_fr: 'Tourelle motorisée de soute, standard conteneurs 32 SCU et arrimage.', desc_en: 'Motorized cargo turret, 32 SCU standard and freight alignment.' },
  { id: 'heavytractor_s3', name: 'Argo HeavyTractor S3', size: 3, force: 30000, powerN: 30000, range: 250, rangeM: 250, maxContainerScu: 32, maxBoxScu: 32, desc_fr: 'Portique lourd industriel pour manipulation de fret massif et épaves.', desc_en: 'Heavy industrial gantry for massive cargo and hull manipulation.' },
  { id: 'maxlift_fps', name: 'MultiTool MaxLift / ATLS', size: 0, force: 2500, powerN: 2500, range: 35, rangeM: 35, maxContainerScu: 4, maxBoxScu: 4, desc_fr: 'Manipulation manuelle en soute ou exosquelette motorisé de quai.', desc_en: 'Manual hold handling or motorized dock exoskeleton.' }
];

export const SALVAGE_HEADS = [
  { id: 'abrade_s1', name: 'Abrade S1', size: 1, manufacturer: 'Drake', speed: 0.85, speedScuMin: 0.85, efficiency: 85, efficiencyPct: 85, desc_fr: 'Tête de grattage solo équilibrée pour découpe de coque et RMC.', desc_en: 'Balanced solo scraping head for hull stripping and RMC.' },
  { id: 'clincher_s1', name: 'Clincher S1', size: 1, manufacturer: 'Aegis', speed: 1.10, speedScuMin: 1.10, efficiency: 75, efficiencyPct: 75, desc_fr: 'Extraction RMC haute vitesse agressive, perte légère de matière.', desc_en: 'High-speed aggressive scraping with slight material loss.' },
  { id: 'trawling_s1', name: 'Trawling S1', size: 1, manufacturer: 'Greycat', speed: 1.45, speedScuMin: 1.45, efficiency: 65, efficiencyPct: 65, desc_fr: 'Faisceau large pour décapage de grandes surfaces planes.', desc_en: 'Wide beam for large flat hull surface stripping.' },
  { id: 'cambium_s2', name: 'Cambium S2', size: 2, manufacturer: 'Aegis', speed: 2.50, speedScuMin: 2.50, efficiency: 90, efficiencyPct: 90, desc_fr: 'Tête industrielle lourde pour Reclaimer et démantèlement capital.', desc_en: 'Heavy industrial head for Reclaimer and capital dismantling.' }
];

export const SHIP_WEAPONS = [
  // S1
  { id: 'cf117_s1', name: 'CF-117 Bulldog S1', size: 1, type: 'laser_repeater', dps: 290, rpm: 750, velocity: 1400, desc_fr: 'Répéteur laser S1 polyvalent à tir rapide.', desc_en: 'Versatile S1 rapid-fire laser repeater.' },
  { id: 'yellowjacket_s1', name: 'GT-210 Yellowjacket S1', size: 1, type: 'ballistic_gatling', dps: 340, rpm: 1100, velocity: 1300, desc_fr: 'Gatling balistique S1 perforation de blindage.', desc_en: 'S1 ballistic gatling for armor penetration.' },
  { id: 'attrition1_s1', name: 'Attrition-1 S1', size: 1, type: 'laser_repeater', dps: 320, rpm: 650, velocity: 1400, desc_fr: 'Répéteur à surchauffe thermique rapprochée.', desc_en: 'Thermal overload close-quarters repeater.' },

  // S2
  { id: 'cf227_s2', name: 'CF-227 Badger S2', size: 2, type: 'laser_repeater', dps: 380, rpm: 700, velocity: 1400, desc_fr: 'Répéteur laser S2 standard de supériorité aérienne.', desc_en: 'Standard S2 laser repeater for space superiority.' },
  { id: 'scorpion_s2', name: 'GT-215 Scorpion S2', size: 2, type: 'ballistic_gatling', dps: 450, rpm: 1150, velocity: 1300, desc_fr: 'Gatling balistique S2 haute cadence cinétique.', desc_en: 'High fire-rate S2 kinetic ballistic gatling.' },
  { id: 'attrition2_s2', name: 'Attrition-2 S2', size: 2, type: 'laser_repeater', dps: 420, rpm: 620, velocity: 1400, desc_fr: 'Dégâts thermiques accrus à courte distance.', desc_en: 'Thermal damage boost at point-blank range.' },

  // S3
  { id: 'cf337_s3', name: 'CF-337 Panther S3', size: 3, type: 'laser_repeater', dps: 510, rpm: 700, velocity: 1400, desc_fr: 'Le roi des répéteurs S3, cadence et vélocité parfaites.', desc_en: 'The king of S3 repeaters, perfect velocity and fire rate.' },
  { id: 'mantis_s3', name: 'GT-220 Mantis S3', size: 3, type: 'ballistic_gatling', dps: 650, rpm: 1200, velocity: 1300, desc_fr: 'Gatling balistique S3 redoutable contre boucliers et coques.', desc_en: 'Devastating S3 ballistic gatling against shields and hulls.' },
  { id: 'attrition3_s3', name: 'Attrition-3 S3', size: 3, type: 'laser_repeater', dps: 560, rpm: 600, velocity: 1400, desc_fr: 'Répéteur laser lourd à saturation d\'énergie.', desc_en: 'Heavy laser repeater with thermal saturation.' },
  { id: 'omnisky9_s3', name: 'Omnisky IX S3', size: 3, type: 'laser_cannon', dps: 480, rpm: 250, velocity: 1600, desc_fr: 'Canon laser S3 de précision longue portée.', desc_en: 'Long-range high-precision S3 laser cannon.' },

  // S4
  { id: 'cf447_s4', name: 'CF-447 Rhino S4', size: 4, type: 'laser_repeater', dps: 780, rpm: 650, velocity: 1400, desc_fr: 'Répéteur laser lourd pour tourelles de bombardiers et cargos.', desc_en: 'Heavy laser repeater for freighter and gunship turrets.' },
  { id: 'revenant_s4', name: 'Revenant S4', size: 4, type: 'ballistic_gatling', dps: 920, rpm: 1000, velocity: 1250, desc_fr: 'Gatling balistique lourde destructrice.', desc_en: 'Destructive heavy ballistic gatling.' },

  // S5
  { id: 'cf557_s5', name: 'CF-557 Galdereen S5', size: 5, type: 'laser_repeater', dps: 1250, rpm: 600, velocity: 1400, desc_fr: 'Répéteur laser capital de défense lourde.', desc_en: 'Capital-class heavy defense laser repeater.' }
];

export const MISSILE_RACKS = [
  { id: 'msl_strikeforce_s2', name: '8x StrikeForce S2 (EM)', size: 2, count: 8, missileCount: 8, missileSize: 2, guidance: 'EM', tracking: 'EM', damage: 2800, desc_fr: 'Guidage électromagnétique instantané contre signatures élevées.', desc_en: 'Instant electromagnetic tracking against hot targets.' },
  { id: 'msl_thunderbolt_s3', name: '4x Thunderbolt III S3 (IR)', size: 3, count: 4, missileCount: 4, missileSize: 3, guidance: 'IR', tracking: 'IR', damage: 4200, desc_fr: 'Missiles thermiques lourds à impact dévastateur.', desc_en: 'Heavy infrared missiles with devastating impact.' },
  { id: 'msl_pioneer_s1', name: '16x Pioneer S1 (CS)', size: 1, count: 16, missileCount: 16, missileSize: 1, guidance: 'CS', tracking: 'CS', damage: 1400, desc_fr: 'Salve de saturation multi-cibles rapprochées.', desc_en: 'Multi-target saturation barrage at close quarters.' },
  { id: 'msl_seeker_s5', name: '2x Seeker IX S5 (Torpille)', size: 5, count: 2, missileCount: 2, missileSize: 5, guidance: 'EM', tracking: 'EM', damage: 18500, desc_fr: 'Torpille lourde anti-corvettes et vaisseaux capitaux.', desc_en: 'Heavy torpedo against corvettes and capital hulls.' }
];

