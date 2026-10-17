// ============================================================================
// AARON MFD — CO-OP FLEET & MULTI-CREW SERVICE (STAR CITIZEN 4.0+)
// Coordination d'escadre minière, postes multi-crew (MOLE/Arrastra/Orion),
// simulateur de tir laser synchronisé et répartition financière mo.Trader
// ============================================================================

import { miningCalc } from '../mining/mining-calc.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { store } from '../core/state.js';
import { AaronFleetNet } from '../../fleet-net.js';

// Configuration des postes officiels pour vaisseaux Multi-Crew
export const MULTICREW_ROLES = {
  PILOT: { id: 'pilot', name: 'Pilote & Chef de bord', icon: '🧑‍✈️', isLaser: false, desc: 'Positionnement, contrôle d’attitude et distance au rocher' },
  TURRET_CENTER: { id: 'turret_center', name: 'Tourelle 1 (Centre)', icon: '⚡', isLaser: true, desc: 'Tête laser principale S2' },
  TURRET_LEFT: { id: 'turret_left', name: 'Tourelle 2 (Gauche)', icon: '⚡', isLaser: true, desc: 'Tête laser latérale bâbord S2' },
  TURRET_RIGHT: { id: 'turret_right', name: 'Tourelle 3 (Droite)', icon: '⚡', isLaser: true, desc: 'Tête laser latérale tribord S2' },
  SCANNER_GADGETS: { id: 'scanner', name: 'Opérateur Scan & Gadgets', icon: '🧲', isLaser: false, desc: 'Déploiement de dispositifs miniers et analyse spectrale' },
  TRACTOR_CARGO: { id: 'tractor', name: 'Rayon Tracteur & Cargo', icon: '🔧', isLaser: false, desc: 'Gestion des conteneurs SCU et saddlebags détachables' }
};

// Rôles des vaisseaux d'escadre (Wing)
export const FLEET_SHIP_ROLES = {
  MINING_HEAVY: { id: 'mining_heavy', label: 'Mineur Lourd Multi-Crew', badge: 'cyan', icon: '⛏️' },
  MINING_SOLO: { id: 'mining_solo', label: 'Mineur Solo Agile', badge: 'cyan', icon: '⛏️' },
  CARGO: { id: 'cargo', label: 'Transporteur de Soute / Pods', badge: 'green', icon: '📦' },
  ESCORT: { id: 'escort', label: 'Escorte Armée & Sécurité', badge: 'amber', icon: '⚔️' },
  SCOUT: { id: 'scout', label: 'Éclaireur & Détecteur', badge: 'purple', icon: '🧭' },
  SALVAGE: { id: 'salvage', label: 'Support Recyclage', badge: 'purple', icon: '♻️' }
};

// Modèles d'opérations d'escadre (Presets)
export const FLEET_SESSION_PRESETS = [
  {
    id: 'mixed_wing',
    name: 'Escadre Mixte Stanton (1 MOLE + 1 Prospector + C2 + Gladius)',
    desc: 'La composition d’entraînement : 1 MOLE avec équipage complet, 1 Prospector de soutien, 1 transporteur lourd C2 et 1 chasseur d’escorte.',
    location: 'Aaron Halo · Bande 5 (Stanton)',
    ships: [
      {
        id: 'ship_mole_01',
        modelId: 'mole',
        name: 'ARGO MOLE "Titan Drill"',
        role: 'mining_heavy',
        roleLabel: 'Mineur Lourd Multi-Crew',
        isMultiCrew: true,
        totalScu: 96,
        crew: [
          { callsign: 'Pilote Leader', role: 'pilot', roleLabel: 'Pilote & Chef de bord', status: 'online', sharePct: 22, laserId: null, laserName: null, powerWatts: 0, resistanceReductionPct: 0 },
          { callsign: 'Tourelle Centre', role: 'turret_center', roleLabel: 'Tourelle 1 (Centre)', status: 'online', sharePct: 20, laserId: 'lancet_s2', laserName: 'Lancet MH2 S2', powerWatts: 2125, resistanceReductionPct: 50 },
          { callsign: 'Tourelle Bâbord', role: 'turret_left', roleLabel: 'Tourelle 2 (Gauche)', status: 'online', sharePct: 18, laserId: 'helix_s2', laserName: 'Helix II S2', powerWatts: 2600, resistanceReductionPct: 0 },
          { callsign: 'Tourelle Tribord', role: 'turret_right', roleLabel: 'Tourelle 3 (Droite)', status: 'online', sharePct: 15, laserId: 'hofstede_s2', laserName: 'Hofstede S2', powerWatts: 1750, resistanceReductionPct: 30 }
        ]
      },
      {
        id: 'ship_prospector_01',
        modelId: 'prospector',
        name: 'MISC Prospector',
        role: 'mining_solo',
        roleLabel: 'Mineur Solo Agile',
        isMultiCrew: false,
        totalScu: 32,
        crew: [
          { callsign: 'Ailier Foreur', role: 'pilot', roleLabel: 'Pilote Foreur', status: 'online', sharePct: 12, laserId: 'lancet_s1', laserName: 'Lancet MH1 S1', powerWatts: 1400, resistanceReductionPct: 40 }
        ]
      },
      {
        id: 'ship_c2_01',
        modelId: 'c2_hercules',
        name: 'Crusader C2 Hercules',
        role: 'cargo',
        roleLabel: 'Transporteur Cargo & Pods',
        isMultiCrew: false,
        totalScu: 696,
        crew: [
          { callsign: 'Pilote Fret', role: 'pilot', roleLabel: 'Transporteur Fret', status: 'online', sharePct: 8, laserId: null, laserName: null, powerWatts: 0, resistanceReductionPct: 0 }
        ]
      },
      {
        id: 'ship_gladius_01',
        modelId: 'gladius',
        name: 'Aegis Gladius',
        role: 'escort',
        roleLabel: 'Escorte Armée & Sécurité',
        isMultiCrew: false,
        totalScu: 0,
        crew: [
          { callsign: 'Pilote Chasseur', role: 'pilot', roleLabel: 'Pilote de Chasse', status: 'online', sharePct: 5, laserId: null, laserName: null, powerWatts: 0, resistanceReductionPct: 0 }
        ]
      }
    ],
    targetRock: {
      name: 'Astéroïde Colossal Q-77',
      massKg: 42500,
      resistance: 68,
      instability: 54,
      mineralId: 'quantainium',
      mineralName: 'Quantainium',
      orePercentage: 38.5,
      estimatedValueUEC: 4120000
    }
  },
  {
    id: 'mole_crew',
    name: 'Multi-Crew Pur ARGO MOLE (1 Vaisseau, 4 Joueurs à Bord)',
    desc: 'Un équipage soudé opérant dans le même vaisseau : 1 pilote et 3 opérateurs de tourelles laser synchronisées.',
    location: 'Lyria · Champ d’Astéroïdes (ArcCorp)',
    ships: [
      {
        id: 'ship_mole_solo',
        modelId: 'mole',
        name: 'ARGO MOLE',
        role: 'mining_heavy',
        roleLabel: 'Mineur Lourd Multi-Crew',
        isMultiCrew: true,
        totalScu: 96,
        crew: [
          { callsign: 'Chef de Bord', role: 'pilot', roleLabel: 'Pilote & Chef de bord', status: 'online', sharePct: 28, laserId: null, laserName: null, powerWatts: 0, resistanceReductionPct: 0 },
          { callsign: 'Tourelle Centre', role: 'turret_center', roleLabel: 'Tourelle 1 (Centre)', status: 'online', sharePct: 24, laserId: 'lancet_s2', laserName: 'Lancet MH2 S2', powerWatts: 2125, resistanceReductionPct: 50 },
          { callsign: 'Tourelle Bâbord', role: 'turret_left', roleLabel: 'Tourelle 2 (Gauche)', status: 'online', sharePct: 24, laserId: 'helix_s2', laserName: 'Helix II S2', powerWatts: 2600, resistanceReductionPct: 0 },
          { callsign: 'Tourelle Tribord', role: 'turret_right', roleLabel: 'Tourelle 3 (Droite)', status: 'online', sharePct: 24, laserId: 'arbor_s2', laserName: 'Arbor MH2 S2', powerWatts: 1600, resistanceReductionPct: 20 }
        ]
      }
    ],
    targetRock: {
      name: 'Monolithe Lyria Rock-09',
      massKg: 28400,
      resistance: 55,
      instability: 42,
      mineralId: 'bexalite',
      mineralName: 'Bexalite',
      orePercentage: 29.0,
      estimatedValueUEC: 2240000
    }
  },
  {
    id: 'prospector_swarm',
    name: 'Escadre de Prospectors & Taurus (3 Mineurs Solo + Cargo)',
    desc: 'Trois Prospectors autonomes appuyés par un Constellation Taurus équipé de rayon tracteur pour ramasser les sacoches pleines.',
    location: 'Pyro · Ruin Station Belt',
    ships: [
      {
        id: 'ship_pros_1',
        modelId: 'prospector',
        name: 'Prospector Alpha',
        role: 'mining_solo',
        roleLabel: 'Mineur Solo',
        isMultiCrew: false,
        totalScu: 32,
        crew: [{ callsign: 'Foreur Alpha', role: 'pilot', roleLabel: 'Pilote Foreur', status: 'online', sharePct: 28, laserId: 'helix_s1', laserName: 'Helix I S1', powerWatts: 1800, resistanceReductionPct: 0 }]
      },
      {
        id: 'ship_pros_2',
        modelId: 'prospector',
        name: 'Prospector Beta',
        role: 'mining_solo',
        roleLabel: 'Mineur Solo',
        isMultiCrew: false,
        totalScu: 32,
        crew: [{ callsign: 'Foreur Beta', role: 'pilot', roleLabel: 'Pilote Foreur', status: 'online', sharePct: 28, laserId: 'lancet_s1', laserName: 'Lancet MH1 S1', powerWatts: 1400, resistanceReductionPct: 40 }]
      },
      {
        id: 'ship_pros_3',
        modelId: 'prospector',
        name: 'Prospector Gamma',
        role: 'mining_solo',
        roleLabel: 'Mineur Solo',
        isMultiCrew: false,
        totalScu: 32,
        crew: [{ callsign: 'Foreur Gamma', role: 'pilot', roleLabel: 'Pilote Foreur', status: 'online', sharePct: 28, laserId: 'klein_s1', laserName: 'Klein S1', powerWatts: 1350, resistanceReductionPct: 25 }]
      },
      {
        id: 'ship_taurus_cargo',
        modelId: 'constellation_taurus',
        name: 'RSI Taurus',
        role: 'cargo',
        roleLabel: 'Cargo & Récupérateur Pods',
        isMultiCrew: false,
        totalScu: 174,
        crew: [{ callsign: 'Pilote Fret', role: 'pilot', roleLabel: 'Transport & Tracteur', status: 'online', sharePct: 16, laserId: null, laserName: null, powerWatts: 0, resistanceReductionPct: 0 }]
      }
    ],
    targetRock: {
      name: 'Astéroïde Pyro Dense B-12',
      massKg: 34800,
      resistance: 62,
      instability: 58,
      mineralId: 'taranite',
      mineralName: 'Taranite',
      orePercentage: 34.2,
      estimatedValueUEC: 3150000
    }
  }
];

export class FleetCoopManager {
  constructor() {
    // Un nouveau joueur n'est dans AUCUNE flotte dès le départ
    this.session = null;
    this.fleetNet = null;
    this.onJointFireRemoteSync = null;
    this.onNetworkUpdate = null;
  }

  /**
   * Vérifie si une escadre est actuellement active
   * @returns {boolean}
   */
  hasActiveSession() {
    return Boolean(this.session && this.session.status === 'active' && Array.isArray(this.session.ships) && this.session.ships.length > 0);
  }

  /**
   * Créer une nouvelle escadre propre pour le joueur connecté
   * @param {Object} options 
   */
  createSession(options = {}) {
    const userCallsign = (typeof store !== 'undefined' && store.get('player')?.callsign) || 'CITIZEN-1';
    const userFleet = (typeof store !== 'undefined' && store.get('fleet')?.ships) || [];
    const activeShip = userFleet[0] || {
      modelId: 'prospector',
      customName: 'Prospector Alpha',
      role: 'mining_solo',
      cargoCapacitySCU: 32
    };

    const isMultiCrew = activeShip.modelId === 'mole' || activeShip.modelId === 'orion' || activeShip.modelId === 'arrastra';

    this.session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: options.name || `Escadre de ${userCallsign}`,
      location: options.location || 'Aaron Halo · Bande 5 (Stanton)',
      status: 'active',
      startedAt: Date.now(),
      durationSeconds: 0,
      brokenRocksCount: 0,
      scannedRocksCount: 0,
      totalOreSCU: 0,
      financials: {
        grossRevenueUEC: 0,
        fuelAndRepairsUEC: 0,
        guildTaxPct: 5,
        reserveFundPct: 5,
        payoutMode: 'role_weighted'
      },
      targetRock: options.targetRock || {
        name: 'Astéroïde Détecté',
        massKg: 18000,
        resistance: 35,
        instability: 30,
        mineralId: 'quantainium',
        mineralName: 'Quantainium',
        orePercentage: 25.0,
        estimatedValueUEC: 0
      },
      ships: [
        {
          id: `ship_${Date.now()}_1`,
          modelId: activeShip.modelId || 'prospector',
          name: activeShip.customName || activeShip.name || 'Mon Vaisseau',
          role: activeShip.role || (isMultiCrew ? 'mining_heavy' : 'mining_solo'),
          roleLabel: isMultiCrew ? 'Mineur Lourd Multi-Crew' : 'Mineur Solo',
          isMultiCrew: isMultiCrew,
          totalScu: activeShip.cargoCapacitySCU || 32,
          crew: [
            {
              callsign: userCallsign,
              role: 'pilot',
              roleLabel: isMultiCrew ? 'Pilote & Chef de bord' : 'Pilote Foreur',
              status: 'online',
              sharePct: 100,
              laserId: 'lancet_s1',
              laserName: 'Lancet MH1 S1',
              powerWatts: 1400,
              resistanceReductionPct: 40
            }
          ]
        }
      ],
      logs: [
        {
          time: new Date().toLocaleTimeString('fr-FR'),
          author: 'Système',
          text: `Escadre créée par ${userCallsign}. Prêt pour les opérations de flotte.`,
          type: 'system'
        }
      ]
    };

    eventBus.emit('FLEET_SESSION_UPDATED', this.session);
    return this.session;
  }

  /**
   * Clôturer officiellement la session d'escadre active et générer le virement mo.Trader
   * Dissout l'escadre pour que la flotte ne reste plus active.
   */
  closeSession() {
    if (!this.session) return null;

    const split = this.calculateFinancialSplit();
    const moTraderCommands = this.generateMoTraderCommands();

    const summary = {
      sessionId: this.session.id,
      sessionName: this.session.name,
      durationSeconds: Math.floor((Date.now() - (this.session.startedAt || Date.now())) / 1000),
      totalOreSCU: this.session.totalOreSCU || 0,
      split,
      moTraderCommands,
      closedAt: Date.now()
    };

    if (this.fleetNet && typeof this.fleetNet.leaveWing === 'function') {
      try {
        this.fleetNet.leaveWing();
      } catch (err) {
        console.warn('Erreur déconnexion fleetNet:', err);
      }
    }

    // Réinitialisation complète : plus aucune escadre active
    this.session = null;
    eventBus.emit('FLEET_SESSION_CLOSED', summary);
    eventBus.emit('FLEET_SESSION_UPDATED', null);
    return summary;
  }

  /**
   * Récupérer l'état de la session active
   */
  getSession() {
    return this.session;
  }

  /**
   * Charger un modèle d'opération d'escadre (Preset)
   * @param {string} presetId 
   */
  loadPreset(presetId) {
    const preset = FLEET_SESSION_PRESETS.find(p => p.id === presetId) || FLEET_SESSION_PRESETS[0];
    this.session = {
      id: `session_${preset.id}_${Date.now()}`,
      presetId: preset.id,
      name: preset.name,
      location: preset.location,
      status: 'active',
      startedAt: Date.now(),
      durationSeconds: 0,
      brokenRocksCount: 0,
      scannedRocksCount: 0,
      totalOreSCU: 0,
      financials: {
        grossRevenueUEC: 0,
        fuelAndRepairsUEC: 0,
        guildTaxPct: 5,
        reserveFundPct: 5,
        payoutMode: 'role_weighted'
      },
      targetRock: preset.targetRock ? { ...preset.targetRock } : null,
      ships: JSON.parse(JSON.stringify(preset.ships)),
      logs: [
        {
          time: new Date().toLocaleTimeString('fr-FR'),
          author: 'Système',
          text: `Scénario modèle chargé : ${preset.name}`,
          type: 'system'
        }
      ]
    };
    eventBus.emit('FLEET_SESSION_UPDATED', this.session);
    return this.session;
  }

  /**
   * Ajouter un vaisseau à l'escadre
   * @param {Object} shipData 
   */
  addShip(shipData) {
    if (!this.session) this.createSession();
    const newShip = {
      id: shipData.id || `ship_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      modelId: shipData.modelId || 'prospector',
      name: shipData.name || 'Nouveau Vaisseau',
      role: shipData.role || 'mining_solo',
      roleLabel: shipData.roleLabel || 'Mineur Solo',
      isMultiCrew: Boolean(shipData.isMultiCrew),
      totalScu: Number(shipData.totalScu) || 32,
      crew: shipData.crew || []
    };
    if (!Array.isArray(this.session.ships)) this.session.ships = [];
    this.session.ships.push(newShip);
    this.addLog(`Nouveau vaisseau intégré à l'escadre : ${newShip.name}`, 'system');
    eventBus.emit('FLEET_SESSION_UPDATED', this.session);
    return newShip;
  }

  /**
   * Retirer un vaisseau de l'escadre
   * @param {string} shipId 
   */
  removeShip(shipId) {
    if (!this.session || !Array.isArray(this.session.ships)) return false;
    const idx = this.session.ships.findIndex(s => s.id === shipId);
    if (idx !== -1) {
      const removed = this.session.ships.splice(idx, 1)[0];
      this.addLog(`Vaisseau retiré de l'escadre : ${removed.name}`, 'system');
      eventBus.emit('FLEET_SESSION_UPDATED', this.session);
      return true;
    }
    return false;
  }

  /**
   * Assigner ou modifier un membre d'équipage sur un poste précis d'un vaisseau
   * @param {string} shipId 
   * @param {Object} memberData - { callsign, role, roleLabel, laserId, laserName, powerWatts, resistanceReductionPct, sharePct }
   */
  assignCrewMember(shipId, memberData) {
    if (!this.session || !Array.isArray(this.session.ships)) return null;
    const ship = this.session.ships.find(s => s.id === shipId);
    if (!ship) return null;

    const existingMemberIdx = ship.crew.findIndex(m => m.role === memberData.role);
    const member = {
      callsign: (memberData.callsign || 'CITIZEN').trim().toUpperCase(),
      role: memberData.role || 'pilot',
      roleLabel: memberData.roleLabel || 'Opérateur',
      status: memberData.status || 'online',
      sharePct: typeof memberData.sharePct === 'number' ? memberData.sharePct : 15,
      laserId: memberData.laserId || null,
      laserName: memberData.laserName || null,
      powerWatts: Number(memberData.powerWatts) || 0,
      resistanceReductionPct: Number(memberData.resistanceReductionPct) || 0
    };

    if (existingMemberIdx !== -1) {
      ship.crew[existingMemberIdx] = member;
    } else {
      ship.crew.push(member);
    }

    this.addLog(`${member.callsign} a pris le poste : ${member.roleLabel} à bord de ${ship.name}`, 'crew');
    eventBus.emit('FLEET_SESSION_UPDATED', this.session);
    return member;
  }

  /**
   * Retirer un membre d'équipage d'un vaisseau
   * @param {string} shipId 
   * @param {string} callsign 
   */
  removeCrewMember(shipId, callsign) {
    if (!this.session || !Array.isArray(this.session.ships)) return false;
    const ship = this.session.ships.find(s => s.id === shipId);
    if (!ship) return false;

    const idx = ship.crew.findIndex(m => m.callsign.toLowerCase() === callsign.toLowerCase());
    if (idx !== -1) {
      const removed = ship.crew.splice(idx, 1)[0];
      this.addLog(`${removed.callsign} a quitté le poste ${removed.roleLabel} sur ${ship.name}`, 'crew');
      eventBus.emit('FLEET_SESSION_UPDATED', this.session);
      return true;
    }
    return false;
  }

  /**
   * Tous les membres de la flotte (aplatis pour calculs financiers & de tir)
   * @returns {Array<Object>}
   */
  getAllCrewMembers() {
    if (!this.session || !Array.isArray(this.session.ships)) return [];
    const list = [];
    this.session.ships.forEach(ship => {
      if (Array.isArray(ship.crew)) {
        ship.crew.forEach(member => {
          list.push({
            ...member,
            shipId: ship.id,
            shipName: ship.name,
            shipModel: ship.modelId,
            shipRole: ship.role,
            isMultiCrew: ship.isMultiCrew
          });
        });
      }
    });
    return list;
  }

  /**
   * Calcul des métriques globales de l'escadre
   */
  getCombinedMetrics() {
    if (!this.session || !Array.isArray(this.session.ships)) {
      return {
        totalScuCapacity: 0,
        totalCrewCount: 0,
        totalShipsCount: 0,
        totalLasersCount: 0,
        combinedLaserPowerWatts: 0,
        combinedPowerMegaWatts: '0.00',
        combinedResistanceReductionPct: 0
      };
    }

    let totalScuCapacity = 0;
    let totalCrewCount = 0;
    let totalLasersCount = 0;
    let combinedLaserPowerWatts = 0;
    let combinedResistanceReduction = 0;

    this.session.ships.forEach(ship => {
      totalScuCapacity += (Number(ship.totalScu) || 0);
      totalCrewCount += (Array.isArray(ship.crew) ? ship.crew.length : 0);

      if (Array.isArray(ship.crew)) {
        ship.crew.forEach(member => {
          if (member.laserId && member.powerWatts > 0) {
            totalLasersCount++;
            combinedLaserPowerWatts += Number(member.powerWatts) || 0;
            const red = Number(member.resistanceReductionPct) || 0;
            combinedResistanceReduction = 100 - ((100 - combinedResistanceReduction) * (1 - (red / 100)));
          }
        });
      }
    });

    return {
      totalScuCapacity,
      totalCrewCount,
      totalShipsCount: this.session.ships.length,
      totalLasersCount,
      combinedLaserPowerWatts: Math.round(combinedLaserPowerWatts),
      combinedPowerMegaWatts: (combinedLaserPowerWatts / 1000).toFixed(2),
      combinedResistanceReductionPct: Math.round(combinedResistanceReduction * 10) / 10
    };
  }

  /**
   * Simuler la fracture d'un astéroïde par tir synchronisé multi-lasers
   * @param {Object} rock - { massKg, resistance, instability }
   * @param {Array<string>} activeMemberCallsigns - Liste des tireurs actifs
   */
  simulateJointFracture(rock = null, activeMemberCallsigns = null) {
    if (!this.session) {
      return {
        targetRock: rock || { massKg: 0, resistance: 0, instability: 0 },
        activeShooters: [],
        totalWatts: 0,
        requiredWatts: 0,
        powerRatio: 0,
        combinedResistanceReductionPct: 0,
        effectiveResistancePct: 0,
        isFracturable: false,
        estimatedTimeToFractureSec: null,
        verdict: 'AUCUNE ESCADRE ACTIVE'
      };
    }

    const target = rock || this.session.targetRock || { massKg: 35000, resistance: 60, instability: 50 };
    const allMembers = this.getAllCrewMembers();

    // Filtrer les tireurs qui font feu
    const activeShooters = allMembers.filter(m => {
      if (!m.laserId || !m.powerWatts) return false;
      if (Array.isArray(activeMemberCallsigns)) {
        return activeMemberCallsigns.includes(m.callsign);
      }
      return true; // Par défaut, toutes les tourelles/lasers tirent
    });

    let totalWatts = 0;
    let combinedReduction = 0;

    activeShooters.forEach(s => {
      totalWatts += Number(s.powerWatts) || 0;
      const red = Number(s.resistanceReductionPct) || 0;
      combinedReduction = 100 - ((100 - combinedReduction) * (1 - (red / 100)));
    });

    combinedReduction = Math.round(combinedReduction * 10) / 10;
    const effectiveResistance = Math.max(0, target.resistance * (1 - (combinedReduction / 100)));

    const requiredWatts = Math.round(target.massKg * (1 + effectiveResistance / 100) * 0.075);
    const powerRatio = totalWatts / (requiredWatts || 1);
    const isFracturable = powerRatio >= 1.0;
    const estimatedTimeToFractureSec = isFracturable
      ? Math.max(8, Math.round(45 / Math.min(3, powerRatio)))
      : null;

    return {
      targetRock: target,
      activeShooters,
      totalWatts,
      requiredWatts,
      powerRatio: Math.round(powerRatio * 100) / 100,
      combinedResistanceReductionPct: combinedReduction,
      effectiveResistancePct: Math.round(effectiveResistance * 10) / 10,
      isFracturable,
      estimatedTimeToFractureSec,
      verdict: isFracturable
        ? `✓ FRACTURABLE EN ÉQUIPE (${activeShooters.length} lasers synchronisés · ~${estimatedTimeToFractureSec}s)`
        : `⚠ PUISSANCE INSUFFISANTE (Manque ${Math.round(requiredWatts - totalWatts)} W)`
    };
  }

  /**
   * Calcul complet de la répartition financière de la session
   */
  calculateFinancialSplit() {
    if (!this.session) {
      return { gross: 0, expenses: 0, netRevenue: 0, guildTaxUEC: 0, reserveFundUEC: 0, distributableUEC: 0, payouts: [] };
    }

    const financials = this.session.financials || {};
    const gross = Number(financials.grossRevenueUEC) || 0;
    const expenses = Number(financials.fuelAndRepairsUEC) || 0;
    const netRevenue = Math.max(0, gross - expenses);

    const guildTaxPct = Number(financials.guildTaxPct) || 5;
    const reserveFundPct = Number(financials.reserveFundPct) || 5;

    const guildTaxUEC = Math.round(netRevenue * (guildTaxPct / 100));
    const reserveFundUEC = Math.round(netRevenue * (reserveFundPct / 100));
    const distributableUEC = Math.max(0, netRevenue - guildTaxUEC - reserveFundUEC);

    const allMembers = this.getAllCrewMembers();
    if (allMembers.length === 0) {
      return { gross, expenses, netRevenue, guildTaxUEC, reserveFundUEC, distributableUEC, payouts: [] };
    }

    const mode = financials.payoutMode || 'role_weighted';
    let payouts = [];

    if (mode === 'equal') {
      const perPlayer = Math.round(distributableUEC / allMembers.length);
      payouts = allMembers.map(m => ({
        ...m,
        sharePct: Math.round((100 / allMembers.length) * 10) / 10,
        amountUEC: perPlayer
      }));
    } else {
      // Calcul au pourcentage fixé
      const totalShares = allMembers.reduce((sum, m) => sum + (Number(m.sharePct) || 10), 0) || 1;
      payouts = allMembers.map(m => {
        const share = Number(m.sharePct) || 10;
        const amount = Math.round((distributableUEC * share) / totalShares);
        return {
          ...m,
          calculatedSharePct: Math.round((share / totalShares) * 1000) / 10,
          amountUEC: amount
        };
      });
    }

    return {
      gross,
      expenses,
      netRevenue,
      guildTaxUEC,
      reserveFundUEC,
      distributableUEC,
      payouts
    };
  }

  /**
   * Générer les commandes in-game officielles mo.Trader (/pay [Callsign] [Montant])
   */
  generateMoTraderCommands() {
    const { payouts } = this.calculateFinancialSplit();
    return payouts
      .filter(p => p.amountUEC > 0)
      .map(p => ({
        callsign: p.callsign,
        amountUEC: p.amountUEC,
        role: p.roleLabel,
        commandText: `/pay ${p.callsign} ${p.amountUEC}`
      }));
  }

  /**
   * Ajouter une entrée dans le journal d'activité de la session
   * @param {string} text 
   * @param {string} type - 'fracture' | 'cargo' | 'scan' | 'security' | 'system'
   * @param {string} author 
   * @param {boolean} shouldBroadcast
   */
  addLog(text, type = 'system', author = 'Système', shouldBroadcast = true) {
    if (!this.session) return;
    if (!Array.isArray(this.session.logs)) this.session.logs = [];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const logEntry = {
      time: timeStr,
      author,
      text,
      type
    };
    this.session.logs.unshift(logEntry);
    if (this.session.logs.length > 50) {
      this.session.logs.pop();
    }
    if (shouldBroadcast && this.fleetNet && this.fleetNet.status === 'connected') {
      this.fleetNet.broadcastFleetLog(logEntry);
    }
  }

  // --- LIAISON RÉSEAU MULTIJOUEUR EN DIRECT (FLEET-NET P2P) ---

  /**
   * Initialiser le moteur réseau hybride (BroadcastChannel + WebRTC PeerJS)
   */
  initFleetNet(options = {}) {
    const callsign = options.callsign || (typeof store !== 'undefined' && store.get('callsign')) || 'VORTEX-1';
    if (this.fleetNet) {
      this.fleetNet.leaveWing();
    }

    this.fleetNet = new AaronFleetNet({
      callsign,
      onStatusChange: (status, roomCode, isHost) => {
        this.session.isNetworked = (status === 'connected');
        this.session.networkStatus = status;
        this.session.roomCode = roomCode;
        this.session.isHost = isHost;
        if (options.onStatusChange) options.onStatusChange(status, roomCode, isHost);
        if (this.onNetworkUpdate) this.onNetworkUpdate();
      },
      onPeersUpdate: (peers) => {
        if (options.onPeersUpdate) options.onPeersUpdate(peers);
        if (this.onNetworkUpdate) this.onNetworkUpdate();
      },
      onPeerJoin: (peer) => {
        this.addLog(`${peer.callsign} a rejoint l’escadre (${peer.isInternetPeer ? 'Internet P2P' : 'Local'})`, 'security', 'Système', false);
        this._syncPeerIntoSession(peer);
        if (options.onPeerJoin) options.onPeerJoin(peer);
        if (this.onNetworkUpdate) this.onNetworkUpdate();
      },
      onPeerLeave: (peer) => {
        this.addLog(`${peer.callsign} a quitté la liaison d’escadre`, 'security', 'Système', false);
        this._markPeerOffline(peer);
        if (options.onPeerLeave) options.onPeerLeave(peer);
        if (this.onNetworkUpdate) this.onNetworkUpdate();
      },
      onJointFireSync: (fireData, fromCallsign) => {
        if (this.onJointFireRemoteSync) {
          this.onJointFireRemoteSync(fireData, fromCallsign);
        }
        if (this.onNetworkUpdate) this.onNetworkUpdate();
      },
      onRockBroadcast: (rock, fromCallsign) => {
        if (rock) {
          this.session.targetRock = { ...this.session.targetRock, ...rock };
          this.addLog(`Rocher synchronisé par ${fromCallsign} : ${rock.name || 'Astéroïde'}`, 'scan', fromCallsign, false);
          if (this.onNetworkUpdate) this.onNetworkUpdate();
        }
      },
      onFleetLog: (log, fromCallsign) => {
        if (log && log.text) {
          this.session.logs.unshift(log);
          if (this.session.logs.length > 50) this.session.logs.pop();
          if (this.onNetworkUpdate) this.onNetworkUpdate();
        }
      }
    });

    return this.fleetNet;
  }

  /**
   * Créer une escadre P2P (Mode Hôte)
   */
  createWing(customCode = null) {
    if (!this.fleetNet) this.initFleetNet();
    const ok = this.fleetNet.createWing(customCode, this._getLocalLoadoutPayload());
    if (ok) {
      this.session.name = `Escadre ${this.fleetNet.roomCode} · Live P2P`;
      this.addLog(`Escadre P2P créée sous le code ${this.fleetNet.roomCode}`, 'system', 'Hôte', false);
      if (this.onNetworkUpdate) this.onNetworkUpdate();
    }
    return this.fleetNet.roomCode;
  }

  /**
   * Rejoindre une escadre existante par son code
   */
  joinWing(roomCode) {
    if (!roomCode) return false;
    if (!this.fleetNet) this.initFleetNet();
    const ok = this.fleetNet.joinWing(roomCode, false, this._getLocalLoadoutPayload());
    if (ok) {
      this.session.name = `Escadre ${this.fleetNet.roomCode} · Live P2P`;
      this.addLog(`Connexion à l’escadre ${this.fleetNet.roomCode} en cours...`, 'system', 'Ailier', false);
      if (this.onNetworkUpdate) this.onNetworkUpdate();
    }
    return ok;
  }

  /**
   * Quitter la session réseau et repasser en mode solo
   */
  leaveWing() {
    if (this.fleetNet) {
      const code = this.fleetNet.roomCode;
      this.fleetNet.leaveWing();
      this.session.isNetworked = false;
      this.session.name = FLEET_SESSION_PRESETS[0].name;
      this.addLog(`Liaison escadre ${code || ''} déconnectée. Mode solo actif.`, 'system', 'Système', false);
      if (this.onNetworkUpdate) this.onNetworkUpdate();
    }
  }

  /**
   * Récupérer les informations de statut réseau en direct
   */
  getNetworkStatus() {
    return {
      status: this.fleetNet ? this.fleetNet.status : 'disconnected',
      roomCode: this.fleetNet ? this.fleetNet.roomCode : null,
      isHost: this.fleetNet ? this.fleetNet.isHost : false,
      pingMs: this.fleetNet ? this.fleetNet.pingMs : 0,
      peers: this.fleetNet ? this.fleetNet.getPeersList() : [],
      inviteUrl: this.fleetNet ? this.fleetNet.getInviteUrl() : null
    };
  }

  /**
   * Synchroniser en direct le tir des lasers
   */
  broadcastJointFire(activeCallsigns = []) {
    if (this.fleetNet && this.fleetNet.status === 'connected') {
      this.fleetNet.broadcastJointFireSync({
        activeCallsigns: Array.isArray(activeCallsigns) ? activeCallsigns : Array.from(activeCallsigns),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Diffuser un rocher scanné à toute l'escadre
   */
  broadcastTargetRock(rock) {
    if (this.fleetNet && this.fleetNet.status === 'connected') {
      this.fleetNet.broadcastRock(rock || this.session.targetRock);
    }
  }

  _getLocalLoadoutPayload() {
    const localCallsign = (typeof store !== 'undefined' && store.get('callsign')) || 'VORTEX-1';
    const activeShip = (typeof store !== 'undefined' && store.get('activeShip')) || 'prospector';
    return {
      shipId: activeShip,
      callsign: localCallsign,
      laserId: 'lancet_s1',
      totalScu: activeShip === 'mole' ? 96 : 32
    };
  }

  _syncPeerIntoSession(peer) {
    const allMembers = this.getAllCrewMembers();
    const existing = allMembers.find(m => m.callsign === peer.callsign);
    if (existing) {
      existing.status = 'online';
      if (peer.laserId) existing.laserId = peer.laserId;
    } else {
      this.addShip({
        id: `ship_remote_${peer.peerId}`,
        name: `${(peer.shipId || 'Prospector').toUpperCase()} "${peer.callsign}"`,
        modelId: peer.shipId || 'prospector',
        role: 'mining_solo',
        roleLabel: 'Ailier Connecté P2P',
        isMultiCrew: false,
        totalScu: peer.loadout?.totalScu || 32,
        crew: [{
          callsign: peer.callsign,
          role: 'pilot',
          roleLabel: 'Ailier P2P',
          status: 'online',
          sharePct: 15,
          laserId: peer.laserId || 'lancet_s1',
          laserName: peer.laserId ? peer.laserId.toUpperCase() : 'Lancet MH1 S1',
          powerWatts: 1400,
          resistanceReductionPct: 40
        }]
      });
    }
  }

  _markPeerOffline(peer) {
    const allMembers = this.getAllCrewMembers();
    const existing = allMembers.find(m => m.callsign === peer.callsign);
    if (existing) {
      existing.status = 'offline';
    }
  }

  // --- COMPATIBILITÉ AVEC LE CODE EXISTANT ---
  calculateCombinedFleetPower(squadMembers = []) {
    return coopService.calculateCombinedFleetPower(squadMembers);
  }

  evaluateSquadFracture(rock, squadMembers = []) {
    return coopService.evaluateSquadFracture(rock, squadMembers);
  }

  calculateSquadSplit(sessionEarnings, policy = {}, members = []) {
    return coopService.calculateSquadSplit(sessionEarnings, policy, members);
  }

  splitPayout(totalUEC, members = []) {
    const sum = members.reduce((s, m) => s + (Number(m.sharePct) || 0), 0) || 1;
    return members.map(m => ({
      ...m,
      amount: Math.round(((Number(totalUEC) || 0) * (Number(m.sharePct) || 0)) / sum)
    }));
  }
}

export const coopService = {
  manager: new FleetCoopManager(),

  getSession() {
    return this.manager.getSession();
  },
  loadPreset(presetId) {
    return this.manager.loadPreset(presetId);
  },
  addShip(shipData) {
    return this.manager.addShip(shipData);
  },
  removeShip(shipId) {
    return this.manager.removeShip(shipId);
  },
  assignCrewMember(shipId, memberData) {
    return this.manager.assignCrewMember(shipId, memberData);
  },
  removeCrewMember(shipId, callsign) {
    return this.manager.removeCrewMember(shipId, callsign);
  },
  getAllCrewMembers() {
    return this.manager.getAllCrewMembers();
  },
  getCombinedMetrics() {
    return this.manager.getCombinedMetrics();
  },
  simulateJointFracture(rock, activeLasers) {
    return this.manager.simulateJointFracture(rock, activeLasers);
  },
  calculateFinancialSplit() {
    return this.manager.calculateFinancialSplit();
  },
  generateMoTraderCommands() {
    return this.manager.generateMoTraderCommands();
  },
  addLog(text, type, author, shouldBroadcast = true) {
    return this.manager.addLog(text, type, author, shouldBroadcast);
  },
  initFleetNet(options) {
    return this.manager.initFleetNet(options);
  },
  createWing(code) {
    return this.manager.createWing(code);
  },
  joinWing(code) {
    return this.manager.joinWing(code);
  },
  leaveWing() {
    return this.manager.leaveWing();
  },
  getNetworkStatus() {
    return this.manager.getNetworkStatus();
  },
  broadcastJointFire(callsigns) {
    return this.manager.broadcastJointFire(callsigns);
  },
  broadcastTargetRock(rock) {
    return this.manager.broadcastTargetRock(rock);
  },

  calculateCombinedFleetPower(squadMembers = []) {
    let combinedPowerWatts = 0;
    let combinedResistanceReduction = 0;
    let activeLasersCount = 0;
    const shipsSummary = [];

    squadMembers.forEach(member => {
      const shipName = member.shipModel || 'Vaisseau Minier';
      const power = Number(member.laserPowerWatts) || 1400;
      const reduction = Number(member.resistanceReductionPct) || 0;

      combinedPowerWatts += power;
      combinedResistanceReduction = 100 - ((100 - combinedResistanceReduction) * (1 - (reduction / 100)));
      activeLasersCount++;

      shipsSummary.push({
        callsign: member.callsign || 'CITIZEN',
        shipName,
        powerWatts: power,
        reductionPct: reduction
      });
    });

    return {
      combinedPowerWatts: Math.round(combinedPowerWatts),
      combinedResistanceReductionPct: Math.round(combinedResistanceReduction * 10) / 10,
      activeLasersCount,
      shipsSummary
    };
  },

  evaluateSquadFracture(rock, squadMembers = []) {
    const fleetPower = this.calculateCombinedFleetPower(squadMembers);
    const result = miningCalc.calculateFractureFeasibility(rock, {
      totalPowerWatts: fleetPower.combinedPowerWatts,
      resistanceReductionPct: fleetPower.combinedResistanceReductionPct
    });

    return {
      ...result,
      fleetSummary: fleetPower
    };
  },

  calculateSquadSplit(sessionEarnings, policy = {}, members = []) {
    const grossRevenue = Math.max(0, Number(sessionEarnings.totalRevenueUEC) || 0);
    const operatingExpenses = Math.max(0, Number(sessionEarnings.fuelAndRepairsUEC) || 0);
    const revenueAfterExpenses = Math.max(0, grossRevenue - operatingExpenses);

    const reserveFundPct = Number(policy.reserveFundPct) || 10;
    const guildTaxPct = Number(policy.guildTaxPct) || 5;

    const reserveAmountUEC = Math.round(revenueAfterExpenses * (reserveFundPct / 100));
    const guildTaxAmountUEC = Math.round(revenueAfterExpenses * (guildTaxPct / 100));
    const netDistributableUEC = Math.max(0, revenueAfterExpenses - reserveAmountUEC - guildTaxAmountUEC);

    const escortMembers = members.filter(m => m.role === 'escort');
    const haulerMembers = members.filter(m => m.role === 'cargo');
    const minerMembers = members.filter(m => m.role !== 'escort' && m.role !== 'cargo');

    const escortTotalCutPct = escortMembers.length > 0 ? (Number(policy.escortCutPct) || 15) : 0;
    const haulerTotalCutPct = haulerMembers.length > 0 ? (Number(policy.haulerCutPct) || 15) : 0;

    const escortTotalPool = Math.round(netDistributableUEC * (escortTotalCutPct / 100));
    const haulerTotalPool = Math.round(netDistributableUEC * (haulerTotalCutPct / 100));
    const minersTotalPool = netDistributableUEC - escortTotalPool - haulerTotalPool;

    const payouts = [];

    if (escortMembers.length > 0) {
      const perEscort = Math.round(escortTotalPool / escortMembers.length);
      escortMembers.forEach(m => {
        payouts.push({
          callsign: m.callsign,
          role: 'escort',
          roleLabel: 'Escorte Armée',
          payoutUEC: perEscort
        });
      });
    }

    if (haulerMembers.length > 0) {
      const perHauler = Math.round(haulerTotalPool / haulerMembers.length);
      haulerMembers.forEach(m => {
        payouts.push({
          callsign: m.callsign,
          role: 'cargo',
          roleLabel: 'Transport Fret',
          payoutUEC: perHauler
        });
      });
    }

    if (minerMembers.length > 0) {
      const perMiner = Math.round(minersTotalPool / minerMembers.length);
      minerMembers.forEach(m => {
        payouts.push({
          callsign: m.callsign,
          role: m.role || 'miner',
          roleLabel: 'Extraction / Prospection',
          payoutUEC: perMiner
        });
      });
    }

    return {
      grossRevenue,
      operatingExpenses,
      reserveAmountUEC,
      guildTaxAmountUEC,
      netDistributableUEC,
      payouts
    };
  },

  splitPayout(totalUEC, members = []) {
    const sum = members.reduce((s, m) => s + (Number(m.sharePct) || 0), 0) || 1;
    return members.map(m => ({
      ...m,
      amount: Math.round(((Number(totalUEC) || 0) * (Number(m.sharePct) || 0)) / sum)
    }));
  }
};

export function splitPayout(total, members) {
  const sum = members.reduce((s, m) => s + (Number(m.sharePct) || 0), 0) || 1;
  return members.map(m => ({
    ...m,
    amount: Math.round(((Number(total) || 0) * (Number(m.sharePct) || 0)) / sum)
  }));
}
