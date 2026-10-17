// ============================================================================
// AARON MFD — DATA MODELS & SCHEMAS
// Définitions, usines (factories) et validateurs des 7 entités fondamentales
// ============================================================================

/**
 * Constantes et descriptifs officiels des spécialités citoyennes déclarées
 */
export const CITIZEN_SPECIALTIES = {
  mining: {
    id: 'mining',
    label: 'Mineur',
    shortLabel: 'Mineur',
    icon: '⛏️',
    description: 'Prospection géologique, fracture laser & extraction de minerais'
  },
  hauler: {
    id: 'hauler',
    label: 'Transporteur',
    shortLabel: 'Transporteur',
    icon: '📦',
    description: 'Fret lourd, convois interplanétaires & arbitrage cargo'
  },
  escort: {
    id: 'escort',
    label: "Chasseur d'escorte",
    shortLabel: 'Escorte',
    icon: '⚔️',
    description: 'Combat spatial tactique, patrouille & protection de convoi'
  },
  scout: {
    id: 'scout',
    label: 'Prospecteur',
    shortLabel: 'Prospecteur',
    icon: '🧭',
    description: 'Reconnaissance de surface, scan de nappes & cartographie'
  },
  logistics: {
    id: 'logistics',
    label: 'Logisticien',
    shortLabel: 'Logisticien',
    icon: '📋',
    description: 'Gestion de stocks multi-sites, dispatching & approvisionnement'
  }
};

/**
 * 1. JOUEUR / CITOYEN & COMPTE
 * @typedef {Object} Player
 * @property {string} id - Identifiant unique
 * @property {string} email - Adresse email du compte
 * @property {string} rsiHandle - Pseudo officiel RSI
 * @property {string} callsign - Indicatif radio en jeu (ex: 'VORTEX-1')
 * @property {Array<string>} specialties - Spécialités déclarées (Mineur, Transporteur, Chasseur d'escorte, Prospecteur, Logisticien)
 * @property {string} primarySpecialty - Spécialité principale
 * @property {string} role - Rôle déclaré (rétrocompatibilité)
 * @property {string} citizenshipNumber - Numéro d'enregistrement citoyen UEE
 * @property {string} citizenshipStatus - Statut civique UEE
 * @property {string} location - Localisation spatiale actuelle
 * @property {string} activeShipId - Vaisseau actuellement assigné
 * @property {number} balanceAuec - Solde aUEC
 * @property {string} bio - Note de bord / biographie du pilote
 * @property {string|null} guildId - Identifiant de la guilde rattachée
 * @property {string} guildRole - Rôle dans la guilde ('admiral' | 'officer' | 'treasurer' | 'pilot' | 'recruit')
 * @property {Array<Object>} sessions - Sessions multi-appareils actives
 * @property {string} pairingCode - Code PIN d'appairage rapide 2nd écran
 * @property {Object} preferences - Préférences de vol & UI
 */
export function createPlayer(data = {}) {
  const specialties = Array.isArray(data.specialties) && data.specialties.length > 0
    ? [...data.specialties]
    : [data.role || 'mining'];
  const primarySpecialty = data.primarySpecialty || specialties[0] || 'mining';

  return {
    id: data.id || `pilot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: data.email || 'pilot@rsi.space',
    rsiHandle: data.rsiHandle || 'Commander_Vortex',
    callsign: (data.callsign || 'VORTEX-1').trim().toUpperCase(),
    specialties: specialties,
    primarySpecialty: primarySpecialty,
    role: primarySpecialty,
    citizenshipNumber: data.citizenshipNumber || `UEE-847291`,
    citizenshipStatus: data.citizenshipStatus || 'Citoyen UEE Actif',
    location: data.location || 'Stanton · ARC-L1',
    activeShipId: data.activeShipId || 'default_prospector',
    balanceAuec: typeof data.balanceAuec === 'number' ? data.balanceAuec : 0,
    bio: data.bio || '',
    organization: data.organization || '',
    orgTag: data.orgTag || '',
    guildId: data.guildId || null,
    guildRole: data.guildRole || 'member',
    pairingCode: data.pairingCode || `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
    sessions: Array.isArray(data.sessions) && data.sessions.length > 0 ? data.sessions : [
      {
        id: `sess_cockpit_main`,
        deviceName: 'Cockpit PC - Windows Chrome (Cet appareil)',
        deviceType: 'desktop',
        ip: '192.168.1.42 (Local)',
        createdAt: Date.now() - 3600000 * 4,
        lastActive: Date.now(),
        isCurrent: true
      },
      {
        id: `sess_mfd_tablet`,
        deviceName: 'Tablette MFD HOTAS - Safari iPadOS',
        deviceType: 'tablet',
        ip: '192.168.1.88 (Wi-Fi Cockpit)',
        createdAt: Date.now() - 3600000 * 1,
        lastActive: Date.now() - 600000,
        isCurrent: false
      }
    ],
    preferences: {
      lang: data.preferences?.lang || 'fr',
      theme: data.preferences?.theme || 'holo',
      autoSyncScan: data.preferences?.autoSyncScan ?? true,
      soundAlerts: data.preferences?.soundAlerts ?? true,
      hapticsEnabled: data.preferences?.hapticsEnabled ?? true,
      unitSystem: data.preferences?.unitSystem || 'metric',
      privacyShareWithGuild: data.preferences?.privacyShareWithGuild ?? true,
      ...data.preferences
    },
    createdAt: data.createdAt || Date.now(),
    lastLoginAt: data.lastLoginAt || Date.now()
  };
}

/**
 * 2. VAISSEAU & LOADOUT
 * @typedef {Object} ShipLoadout
 * @property {string} laserId - Tête laser principale ou standard
 * @property {Array<string>} submodules - Liste des identifiants de modules
 * @property {string} gadgetId - Gadget minier assigné
 * @property {Array<Object>} customCraftedSlots - Composants craftés montés sur le vaisseau
 * @property {Object} systems - Composants généraux (quantumDrive, shield, powerPlant, cooler)
 */
export function createShipLoadout(data = {}) {
  return {
    laserId: data.laserId || 'lancet_s1',
    submodules: Array.isArray(data.submodules) ? [...data.submodules] : ['focus_3', 'surge', 'none'],
    gadgetId: data.gadgetId || 'sabir',
    customCraftedSlots: Array.isArray(data.customCraftedSlots) ? [...data.customCraftedSlots] : [],
    systems: {
      quantumDriveId: data.systems?.quantumDriveId || 'atlas_s1',
      shieldId: data.systems?.shieldId || 'fr66_s1',
      powerPlantId: data.systems?.powerPlantId || 'js300_s1',
      coolerId: data.systems?.coolerId || 'ultraflow_s1',
      ...data.systems
    }
  };
}

/**
 * @typedef {Object} Ship
 * @property {string} id - Identifiant unique d'instance
 * @property {string} ownerId - Identifiant du joueur propriétaire
 * @property {string} modelId - Modèle ('prospector', 'mole', 'taurus', 'c2_hercules', etc.)
 * @property {string} customName - Nom de baptême donné par le joueur
 * @property {string} role - Rôle opérationnel ('mining' | 'cargo' | 'combat' | 'salvage')
 * @property {number} cargoCapacitySCU - Capacité de soute physique
 * @property {string} locationId - Emplacement actuel (Station, Hangar, etc.)
 * @property {string} status - État ('docked' | 'flight' | 'maintenance' | 'borrowed')
 * @property {ShipLoadout} loadout - Configuration d'armement et composants
 */
export function createShip(data = {}) {
  return {
    id: data.id || `ship_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ownerId: data.ownerId || 'local_user',
    modelId: data.modelId || 'prospector',
    customName: data.customName || 'Prospector Alpha',
    role: data.role || 'mining',
    cargoCapacitySCU: Number(data.cargoCapacitySCU) || 32,
    locationId: data.locationId || 'ARC-L1 Wide Forest Station',
    status: data.status || 'docked',
    loadout: createShipLoadout(data.loadout),
    notes: data.notes || '',
    registeredAt: data.registeredAt || Date.now()
  };
}

/**
 * 3. INVENTAIRE UNIFIÉ & ARTICLES MULTI-SITES
 * @typedef {Object} InventoryItem
 * @property {string} id - Identifiant unique de l'article
 * @property {string} category - 'raw_ore' | 'refined_ore' | 'salvage_rmc' | 'commodity_cargo' | 'crafted_laser' | 'crafted_weapon' | 'crafted_module' | 'gadget'
 * @property {string} code - Code d'identification ('quantainium', 'titanium', 'lancet_s2_mk2', etc.)
 * @property {string} name - Nom d'affichage
 * @property {number} quantitySCU - Volume en SCU (pour vrac)
 * @property {number} quantityUnits - Nombre d'unités (pour objets/armes)
 * @property {string} ownerType - 'personal' | 'guild'
 * @property {string} ownerId - Identifiant du propriétaire
 * @property {string} ownerCallsign - Callsign du pilote propriétaire
 * @property {string} locationId - Emplacement spatial précis
 * @property {string|null} installedOnShipId - Si équipé, identifiant du vaisseau
 * @property {string} origin - 'purchased' | 'looted' | 'crafted'
 * @property {boolean} forSale - Si l'objet est proposé à la vente
 * @property {number} salePriceUEC - Prix de vente en aUEC fixé par le joueur
 * @property {string} barterOffer - Proposition de troc optionnelle
 * @property {number} catalogReferencePriceUEC - Cours neuf FleetYards à titre indicatif
 * @property {string} saleScope - 'guild_internal' | 'inter_guild' | 'public'
 * @property {string} saleStatus - 'available' | 'reserved' | 'sold' | 'not_for_sale'
 * @property {Object} metadata - Attributs spécifiques (stats de craft, pureté, valeur estimée)
 */
export function createInventoryItem(data = {}) {
  const isForSale = Boolean(data.forSale);
  return {
    id: data.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    category: data.category || 'raw_ore',
    subCategory: data.subCategory || '',
    code: data.code || 'quantainium',
    name: data.name || 'Quantainium',
    size: data.size || null,
    grade: data.grade || null,
    quantitySCU: Number(data.quantitySCU) || 0,
    quantityUnits: Number(data.quantityUnits) || (data.quantitySCU ? 0 : 1),
    ownerType: data.ownerType === 'guild' ? 'guild' : 'personal',
    ownerId: data.ownerId || 'local_user',
    ownerCallsign: data.ownerCallsign || 'VORTEX-1',
    locationId: data.locationId || 'ARC-L1 Wide Forest Station',
    installedOnShipId: data.installedOnShipId || null,

    // === PROVENANCE & ORIGINE (ACHETÉ, TROUVÉ/LOOTÉ, CRAFTÉ, MINÉ) ===
    origin: data.origin || (['raw_ore', 'refined_ore'].includes(data.category) ? 'mined' : 'purchased'),
    craftBlueprintId: data.craftBlueprintId || null,
    serialNumber: data.serialNumber || '',
    conditionPct: typeof data.conditionPct === 'number' ? data.conditionPct : 100,

    // === QUALITÉ DES MATÉRIAUX & SCALING STATISTIQUE (STAR CITIZEN 4.0+) ===
    // Échelle officielle 0 à 1 000 (Standard Usine = 500, Maître-Ouvrier = 900+)
    materialQuality: typeof data.materialQuality === 'number'
      ? Math.max(0, Math.min(1000, Math.round(data.materialQuality)))
      : (data.origin === 'crafted' ? 500 : (['raw_ore', 'refined_ore'].includes(data.category) ? (data.metadata?.materialQuality || null) : null)),
    qualityTier: data.qualityTier || null,
    qualityTierLabel: data.qualityTierLabel || null,

    // === DESTINATION OPÉRATIONNELLE / ARBITRAGE (CRAFT vs VENTE BRUTE vs RAFFINAGE vs VENTE RAFFINÉE) ===
    intendedUse: data.intendedUse || (data.reservedForCraft ? 'craft' : (data.category === 'raw_ore' ? 'sell_raw' : (data.category === 'refined_ore' ? 'sell_refined' : 'unspecified'))),
    reservedForCraft: Boolean(data.reservedForCraft || data.intendedUse === 'craft'),

    // === COMMERCE, VENTE & BOURSE INTER-GUILDE ===
    forSale: isForSale,
    salePriceUEC: Number(data.salePriceUEC) || 0,
    barterOffer: (data.barterOffer || '').trim(),
    catalogReferencePriceUEC: Number(data.catalogReferencePriceUEC) || 0,
    saleScope: data.saleScope || 'inter_guild',
    saleStatus: data.saleStatus || (isForSale ? 'available' : 'not_for_sale'),
    reservedByCallsign: data.reservedByCallsign || null,
    listedAt: data.listedAt || (isForSale ? Date.now() : null),

    metadata: {
      tier: data.metadata?.tier || 1,
      estimatedValueUEC: Number(data.metadata?.estimatedValueUEC) || (isForSale && Number(data.salePriceUEC) > 0 ? Number(data.salePriceUEC) : 0),
      craftStats: data.metadata?.craftStats || null,
      notes: data.metadata?.notes || '',
      ...data.metadata
    },
    updatedAt: Date.now()
  };
}

/**
 * 4. BLUEPRINTS & CRAFTING
 * @typedef {Object} BlueprintUnlock
 * @property {string} blueprintId - Identifiant du blueprint
 * @property {string} playerId - Identifiant du joueur l'ayant débloqué
 * @property {number} unlockedAt - Horodatage de déblocage
 */
export function createBlueprintUnlock(blueprintId, playerId) {
  return {
    blueprintId,
    playerId: playerId || 'local_user',
    unlockedAt: Date.now()
  };
}

/**
 * 5. SESSION MINIÈRE & SCAN ROCHER
 * @typedef {Object} MiningScan
 * @property {string} id - Identifiant du scan
 * @property {number} massKg - Masse en kilogrammes
 * @property {string} mineralId - Minerai principal identifié
 * @property {number} orePercentage - Pourcentage de teneur (0 à 100)
 * @property {number} resistance - Résistance rocheuse (0 à 100)
 * @property {number} instability - Instabilité rocheuse (0 à 100)
 * @property {string} location - Lieu de scan
 * @property {string} scannedBy - Indicatif du pilote scanner
 */
export function createMiningScan(data = {}) {
  return {
    id: data.id || `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    massKg: Number(data.massKg) || 5000,
    mineralId: data.mineralId || 'quantainium',
    orePercentage: Number(data.orePercentage) || 30.0,
    resistance: Number(data.resistance) || 40,
    instability: Number(data.instability) || 50,
    location: data.location || 'Aaron Halo Band 5',
    scannedBy: data.scannedBy || 'CITIZEN-1',
    timestamp: data.timestamp || Date.now()
  };
}

/**
 * 6. ROUTE COMMERCIALE & CARGO
 * @typedef {Object} TradeRoute
 * @property {string} commodityId - Produit transporté
 * @property {string} originTerminal - Terminal d'achat
 * @property {string} destinationTerminal - Terminal de vente
 * @property {number} buyPrice - Prix d'achat unitaire (aUEC)
 * @property {number} sellPrice - Prix de vente unitaire (aUEC)
 * @property {number} cargoSCU - Capacité calculée
 * @property {number} estimatedProfit - Marge nette totale calculée
 * @property {string} threatLevel - 'safe' | 'moderate' | 'high' | 'extreme'
 */
export function createTradeRoute(data = {}) {
  const buyPrice = Number(data.buyPrice) || 0;
  const sellPrice = Number(data.sellPrice) || 0;
  const cargoSCU = Number(data.cargoSCU) || 0;
  const marginPerSCU = sellPrice - buyPrice;
  const estimatedProfit = marginPerSCU * cargoSCU * 100; // 1 SCU = 100 cSCU

  return {
    id: data.id || `route_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    commodityId: data.commodityId || 'laranite',
    commodityName: data.commodityName || 'Laranite',
    originTerminal: data.originTerminal || 'Arial - Lathan',
    destinationTerminal: data.destinationTerminal || 'Lorville - CBD',
    buyPrice,
    sellPrice,
    cargoSCU,
    marginPerSCU,
    estimatedProfit: data.estimatedProfit !== undefined ? Number(data.estimatedProfit) : estimatedProfit,
    threatLevel: data.threatLevel || 'moderate',
    notes: data.notes || ''
  };
}

/**
 * 7. GUILDE & ORDRE LOGISTIQUE
 * @typedef {Object} Guild
 * @property {string} id - Identifiant de la guilde
 * @property {string} name - Nom complet (ex: 'Deep Core Industrial')
 * @property {string} tag - Ticker court (ex: 'DCI')
 * @property {number} treasuryBalance - Crédits en caisse (aUEC)
 * @property {Array<Object>} members - Liste des membres
 * @property {Object} settings - Paramètres de guilde (taxe de corporation, mot de passe)
 */
export function createGuild(data = {}) {
  return {
    id: data.id || `guild_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name || 'Flotte Personnelle',
    tag: (data.tag || 'FLOTTE').trim().toUpperCase(),
    hqLocation: data.hqLocation || 'ARC-L1 Wide Forest Station',
    treasuryBalance: typeof data.treasuryBalance === 'number' ? data.treasuryBalance : 0,
    corporateTaxPct: Number(data.corporateTaxPct) || 0,
    motd: data.motd || '',
    createdAt: data.createdAt || Date.now()
  };
}

/**
 * Ordre de mission logistique pour le transport de ressources (Base Building & Stations)
 * @typedef {Object} LogisticOrder
 * @property {string} id - Identifiant de l'ordre
 * @property {string} guildId - Guilde émettrice
 * @property {string} title - Intitulé de l'ordre
 * @property {string} resourceCode - Ressource à transporter
 * @property {number} quantitySCU - Quantité requise
 * @property {string} originLocation - Lieu de départ
 * @property {string} destinationLocation - Lieu de livraison
 * @property {string} status - 'pending' | 'assigned' | 'in_transit' | 'completed' | 'cancelled'
 * @property {string|null} assignedCallsign - Transporteur assigné
 * @property {number} rewardUEC - Prime de transport allouée
 */
export function createLogisticOrder(data = {}) {
  return {
    id: data.id || `order_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    guildId: data.guildId || 'guild_default',
    title: data.title || 'Transport de minerais raffinés',
    resourceCode: data.resourceCode || 'quantainium',
    resourceName: data.resourceName || 'Quantainium Raffiné',
    quantitySCU: Number(data.quantitySCU) || 64,
    originLocation: data.originLocation || 'ARC-L1 Wide Forest Station',
    destinationLocation: data.destinationLocation || 'Avant-poste Pyro - Monox',
    status: data.status || 'pending',
    assignedCallsign: data.assignedCallsign || null,
    rewardUEC: Number(data.rewardUEC) || 50000,
    createdAt: data.createdAt || Date.now(),
    completedAt: data.completedAt || null
  };
}
