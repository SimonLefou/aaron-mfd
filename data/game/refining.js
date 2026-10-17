// Star Citizen Refinery Methods & Stations (Stanton, Pyro & Nyx Official Game Balance)
export const REFINING_METHODS = [
  {
    id: 'dinyx',
    name: 'Dinyx Solventation',
    yieldRate: 0.93,
    costFactor: 0.15,
    speedFactor: 0.20,
    durationHoursPerSCU: 0.55,
    desc_fr: 'Rendement maximum (93%) et coût dérisoire. Parfait pour le Quantainium si vous n\'êtes pas pressé.',
    desc_en: 'Maximum yield (93%) and lowest fee. Perfect for Quantainium if you are not in a rush.'
  },
  {
    id: 'ferris',
    name: 'Ferris Carbide',
    yieldRate: 0.88,
    costFactor: 0.50,
    speedFactor: 0.70,
    durationHoursPerSCU: 0.28,
    desc_fr: 'Très bon équilibre rendement (88%) / vitesse pour la plupart des minerais.',
    desc_en: 'Great balance of yield (88%) and turnaround speed for most ores.'
  },
  {
    id: 'cormack',
    name: 'Cormack Method',
    yieldRate: 0.86,
    costFactor: 0.40,
    speedFactor: 0.85,
    durationHoursPerSCU: 0.18,
    desc_fr: 'Rapide avec un bon rendement restant (86%). Idéal pour rotation rapide de soute.',
    desc_en: 'Fast process with decent retained yield (86%). Ideal for quick cargo turnaround.'
  },
  {
    id: 'gaskin',
    name: 'Gaskin Process',
    yieldRate: 0.84,
    costFactor: 0.35,
    speedFactor: 0.88,
    durationHoursPerSCU: 0.16,
    desc_fr: 'Procédé économique et rapide (84% de rendement). Excellent pour les minerais intermédiaires.',
    desc_en: 'Cost-effective and fast process (84% yield). Excellent for mid-tier ores.'
  },
  {
    id: 'electro_chem',
    name: 'Electro-Chemical',
    yieldRate: 0.82,
    costFactor: 0.45,
    speedFactor: 0.75,
    durationHoursPerSCU: 0.22,
    desc_fr: 'Électrolyse chimique ciblée (82% de rendement). Recommandée pour les métaux conducteurs (Cuivre, Or).',
    desc_en: 'Targeted chemical electrolysis (82% yield). Recommended for conductive metals (Copper, Gold).'
  },
  {
    id: 'thermonator',
    name: 'Thermonator',
    yieldRate: 0.80,
    costFactor: 0.55,
    speedFactor: 0.92,
    durationHoursPerSCU: 0.12,
    desc_fr: 'Dissociation thermique accélérée (80% de rendement). Traitement très rapide.',
    desc_en: 'Accelerated thermal dissociation (80% yield). Very fast processing time.'
  },
  {
    id: 'kazen',
    name: 'Kazen Electro-Catalytic',
    yieldRate: 0.78,
    costFactor: 0.60,
    speedFactor: 0.95,
    durationHoursPerSCU: 0.09,
    desc_fr: 'Conversion catalytique rapide (78% de rendement). Conçu pour le traitement d\'urgence.',
    desc_en: 'Fast catalytic conversion (78% yield). Engineered for rapid processing turnaround.'
  },
  {
    id: 'pyroburst',
    name: 'Pyro-Burst',
    yieldRate: 0.72,
    costFactor: 0.75,
    speedFactor: 1.00,
    durationHoursPerSCU: 0.06,
    desc_fr: 'Ultra rapide mais grosse perte de minerai (seulement 72% de rendement). Pour ventes immédiates.',
    desc_en: 'Fastest method but heavy ore loss (only 72% yield). Designed for emergency quick sales.'
  }
];

export const REFINERY_STATIONS = [
  // ==========================================
  // STANTON SYSTEM REFINERIES
  // ==========================================
  {
    id: 'arc_l1',
    name: 'ARC-L1 Wide Forest',
    system: 'ArcCorp',
    sector: 'stanton',
    bestFor: 'Quantainium (+10%) & Bexalite (+3%)',
    bonusMineral: 'quantainium',
    bonusRate: 0.10,
    notes_fr: 'La Mecque du Quantainium ! Idéal pour les retours rapides depuis l\'Aaron Halo.',
    notes_en: 'The Quantainium hub! Ideal for rapid round trips from the Aaron Halo.'
  },
  {
    id: 'arc_l2',
    name: 'ARC-L2 Lonely Forest',
    system: 'ArcCorp',
    sector: 'stanton',
    bestFor: 'Laranite (+5%) & Titane (+4%)',
    bonusMineral: 'laranite',
    bonusRate: 0.05,
    notes_fr: 'Station tranquille peu fréquentée des pirates, excellente pour la Laranite de Wala.',
    notes_en: 'Quiet station with low pirate traffic, great for Wala Laranite.'
  },
  {
    id: 'arc_l4',
    name: 'ARC-L4 Faint Glen',
    system: 'ArcCorp',
    sector: 'stanton',
    bestFor: 'Béryl (+6%) & Quartz (+5%)',
    bonusMineral: 'beryl',
    bonusRate: 0.06,
    notes_fr: 'Station de transit vers les ceintures extérieures d\'ArcCorp.',
    notes_en: 'Transit station toward outer ArcCorp belts.'
  },
  {
    id: 'cru_l1',
    name: 'CRU-L1 Ambitious Dream',
    system: 'Crusader',
    sector: 'stanton',
    bestFor: 'Quantainium (+5%), Taranite (+4%) & Bexalite (+5%)',
    bonusMineral: 'quantainium',
    bonusRate: 0.05,
    notes_fr: 'Hub central de Crusader. Emplacement privilégié pour les retours de Yela et Cellin.',
    notes_en: 'Crusader central hub. Prime drop point for Yela and Cellin returns.'
  },
  {
    id: 'hur_l1',
    name: 'HUR-L1 Green Glade',
    system: 'Hurston',
    sector: 'stanton',
    bestFor: 'Agricium (+5%), Or (+5%) & Titane (+4%)',
    bonusMineral: 'agricium',
    bonusRate: 0.05,
    notes_fr: 'Raffinerie majeure de Hurston, idéale après des sessions sur Magda et Arial.',
    notes_en: 'Major Hurston refinery, ideal after mining runs on Magda and Arial.'
  },
  {
    id: 'hur_l2',
    name: 'HUR-L2 Faithful Dream',
    system: 'Hurston',
    sector: 'stanton',
    bestFor: 'Laranite (+6%), Or (+8%) & Bexalite (+4%)',
    bonusMineral: 'laranite',
    bonusRate: 0.06,
    notes_fr: 'Meilleur bonus pour l\'Or de Stanton (+8%). Proche de Lorville pour vente rapide.',
    notes_en: 'Best bonus for Gold in Stanton (+8%). Close to Lorville for quick TDD sales.'
  },
  {
    id: 'hur_l3',
    name: 'HUR-L3 Thriving Point',
    system: 'Hurston',
    sector: 'stanton',
    bestFor: 'Hephaestanite (+6%) & Cuivre (+5%)',
    bonusMineral: 'hephaestanite',
    bonusRate: 0.06,
    notes_fr: 'Point de saut vers l\'Aaron Halo (route ArcCorp ➔ HUR-L3).',
    notes_en: 'Key jump vector into Aaron Halo (ArcCorp ➔ HUR-L3 route).'
  },
  {
    id: 'hur_l4',
    name: 'HUR-L4 Melodic Stop',
    system: 'Hurston',
    sector: 'stanton',
    bestFor: 'Titane (+5%) & Tungstène (+5%)',
    bonusMineral: 'titanium',
    bonusRate: 0.05,
    notes_fr: 'Spécialisé dans les métaux lourds de construction.',
    notes_en: 'Specialized in structural heavy metals.'
  },
  {
    id: 'hur_l5',
    name: 'HUR-L5 Highfall Station',
    system: 'Hurston',
    sector: 'stanton',
    bestFor: 'Fer (+6%) & Corindon (+4%)',
    bonusMineral: 'iron',
    bonusRate: 0.06,
    notes_fr: 'Raffinerie industrielle de métaux de base.',
    notes_en: 'Industrial base metals refinery.'
  },
  {
    id: 'mic_l1',
    name: 'MIC-L1 Shallow Frontier',
    system: 'microTech',
    sector: 'stanton',
    bestFor: 'Bexalite (+7%), Taranite (+7%) & Or (+5%)',
    bonusMineral: 'bexalite',
    bonusRate: 0.07,
    notes_fr: 'Le paradis des mineurs de Bexalite et Taranite sur Calliope et Clio !',
    notes_en: 'Paradise for Bexalite & Taranite miners working Calliope and Clio!'
  },
  {
    id: 'mic_l2',
    name: 'MIC-L2 Long Forest',
    system: 'microTech',
    sector: 'stanton',
    bestFor: 'Quantainium (+6%) & Titane (+5%)',
    bonusMineral: 'quantainium',
    bonusRate: 0.06,
    notes_fr: 'Raffinerie d\'appui pour les gisements d\'astéroïdes extérieurs de microTech.',
    notes_en: 'Support refinery for outer microTech asteroid belts.'
  },

  // ==========================================
  // PYRO SYSTEM REFINERIES (STAR CITIZEN 4.0)
  // ==========================================
  {
    id: 'pyro_checkmate',
    name: 'Checkmate Station (Pyro)',
    system: 'Système Pyro',
    sector: 'pyro',
    bestFor: 'Stileron (+9%) & Riccite (+8%)',
    bonusMineral: 'stileron',
    bonusRate: 0.09,
    notes_fr: 'Forteresse orbitale de Pyro V. Raffinage sous protection de guilde fortement recommandé.',
    notes_en: 'Pyro V orbital fortress. Refining under guild escort strongly recommended.'
  },
  {
    id: 'pyro_ruin',
    name: 'Ruin Station (Pyro VI - Terminus)',
    system: 'Système Pyro',
    sector: 'pyro',
    bestFor: 'Quantainium (+8%), Stileron (+7%) & Carinite (+6%)',
    bonusMineral: 'stileron',
    bonusRate: 0.08,
    notes_fr: 'Mégastructure de pirates dans l\'anneau de Terminus. Zone sans loi, primes de vente massives.',
    notes_en: 'Pirate megastructure in Terminus ring. Lawless zone with massive payout bonuses.'
  },
  {
    id: 'pyro_orbituary',
    name: 'Orbituary (Pyro)',
    system: 'Système Pyro',
    sector: 'pyro',
    bestFor: 'Riccite (+7%) & Lindinium (+7%)',
    bonusMineral: 'riccite',
    bonusRate: 0.07,
    notes_fr: 'Station avancée au cœur des champs d\'astéroïdes de Pyro.',
    notes_en: 'Forward station in the heart of Pyro asteroid clusters.'
  },
  {
    id: 'pyro_patchcity',
    name: 'PatchCity Station (Pyro V)',
    system: 'Système Pyro',
    sector: 'pyro',
    bestFor: 'Sadaryx (+8%) & Savrilium (+6%)',
    bonusMineral: 'sadaryx',
    bonusRate: 0.08,
    notes_fr: 'Hub de raffinerie indépendant au-dessus des nuages gazeux de Pyro V.',
    notes_en: 'Independent refinery hub above Pyro V gas clouds.'
  },
  {
    id: 'pyro_starlight',
    name: 'Starlight Service Station (Pyro II)',
    system: 'Système Pyro',
    sector: 'pyro',
    bestFor: 'Stileron (+7%) & Or (+6%)',
    bonusMineral: 'stileron',
    bonusRate: 0.07,
    notes_fr: 'Poste de ravitaillement et de traitement pour les mineurs de Monox.',
    notes_en: 'Service and processing post for Monox miners.'
  },
  {
    id: 'pyro_gateway',
    name: 'Station Jump Point Stanton-Pyro',
    system: 'Frontière Pyro',
    sector: 'pyro',
    bestFor: 'Lindinium (+6%) & Bexalite (+5%)',
    bonusMineral: 'lindinium',
    bonusRate: 0.06,
    notes_fr: 'Sas douanier interstellaire stratégique. Idéal pour déposer du minerai avant de franchir le trou de ver.',
    notes_en: 'Strategic jump gate lock. Ideal for offloading ore before wormhole transit.'
  },

  // ==========================================
  // NYX SYSTEM REFINERIES
  // ==========================================
  {
    id: 'nyx_levski',
    name: 'Levski • Delamar (Nyx)',
    system: 'Système Nyx',
    sector: 'nyx',
    bestFor: 'Bexalite (+8%), Taranite (+6%) & Borase (+5%)',
    bonusMineral: 'bexalite',
    bonusRate: 0.08,
    notes_fr: 'Cité forée dans l\'astéroïde Delamar. Idéale pour le minage profond sans juridiction UEE.',
    notes_en: 'Borehole city in Delamar asteroid. Ideal for deep mining outside UEE jurisdiction.'
  },
  {
    id: 'nyx_glaciem',
    name: 'Poste Glaciem • Ceinture Nyx',
    system: 'Système Nyx',
    sector: 'nyx',
    bestFor: 'Quantainium (+8%) & Laranite (+5%)',
    bonusMineral: 'quantainium',
    bonusRate: 0.08,
    notes_fr: 'Station glaciaire d\'extraction au milieu des champs de comètes de Nyx.',
    notes_en: 'Glacial extraction outpost amidst Nyx cometary fields.'
  },
  {
    id: 'nyx_gateway',
    name: 'Station Jump Point Stanton-Nyx',
    system: 'Frontière Nyx',
    sector: 'nyx',
    bestFor: 'Quantainium (+6%) & Bexalite (+5%)',
    bonusMineral: 'quantainium',
    bonusRate: 0.06,
    notes_fr: 'Porte d\'entrée vers Nyx. Hub logistique sécurisé.',
    notes_en: 'Gateway into Nyx. Secure logistics hub.'
  }
];
