// ============================================================================
// AARON MFD — FLEET SERVICE
// Gestion de la flotte : Composition (ships.js), Vue Hangar, Configuration par tourelle
// ============================================================================

import { SHIPS, SUPPORT_SHIPS, getAllPlayableShips } from '../../data/game/ships.js';
import { LASERS } from '../../data/game/lasers.js';
import { MODULES } from '../../data/game/modules.js';
import { QUANTUM_DRIVES, SHIELDS, POWER_PLANTS, COOLERS } from '../../data/game/components.js';

const STORAGE_KEY = 'aaron-mfd.fleet.v3';
const uid = () => Math.random().toString(36).slice(2, 9);

const NO_TRACTOR = { hasTractor: false, size: null, power: null, desc_fr: '', desc_en: '' };

/**
 * Normalise un vaisseau issu de ships.js / support ships
 */
export function normalizeShip(s) {
  if (!s) return null;
  const n = (v) => (v === undefined ? null : v);
  return {
    id: s.id,
    name: s.name,
    manufacturer: s.manufacturer || 'Inconnu',
    role: s.role || 'mining',
    isCargoSupport: Boolean(s.isCargoSupport),
    type_fr: s.type_fr || s.name,
    type_en: s.type_en || s.name,
    scu: Number(s.scu) || 0,
    // Minage
    laserSize: n(s.laserSize),
    laserSlots: n(s.laserSlots),
    moduleSlots: n(s.moduleSlots),
    basePower: n(s.basePower),
    saddlebags: n(s.saddlebags),
    saddlebagSCU: n(s.saddlebagSCU),
    detachableBags: n(s.detachableBags),
    // Support & cargo
    tractorBeam: s.tractorBeam ?? NO_TRACTOR,
    gridType: n(s.gridType),
    prospectorBagsMax: n(s.prospectorBagsMax),
    moleBagsMax: n(s.moleBagsMax),
    // Composants internes
    qdSize: n(s.qdSize),
    shieldSize: n(s.shieldSize),
    shieldCount: n(s.shieldCount),
    powerSize: n(s.powerSize),
    coolerSize: n(s.coolerSize),
    coolerCount: n(s.coolerCount),
    qfTank: n(s.qfTank),
    incomplete: s._incomplete ?? null
  };
}

export const ALL_SHIPS = [...SHIPS, ...SUPPORT_SHIPS].map(normalizeShip);
export const getShip = (id) => ALL_SHIPS.find(s => s.id === id) || null;

/**
 * Capacité totale transportable (soute physique + sacoches)
 */
export function totalScu(s) {
  if (!s) return 0;
  return (s.scu || 0) + ((s.saddlebags || 0) * (s.saddlebagSCU || 0));
}

/**
 * Emplacements (hardpoints) déduits pour les composants internes
 */
export function hardpointsOf(ship) {
  if (!ship) return [];
  const hp = [];
  const add = (count, category, label, size) => {
    for (let i = 1; i <= (count ?? 0); i++) {
      hp.push({
        category,
        name: count > 1 ? `${label} ${i}` : label,
        size: size ?? 0,
        turretIndex: category === 'MINING_HEAD' ? i : null
      });
    }
  };
  add(ship.laserSlots, 'MINING_HEAD', ship.laserSlots > 1 ? 'Tourelle' : 'Tête de minage', ship.laserSize);
  add(ship.shieldCount, 'SHIELD', 'Bouclier', ship.shieldSize);
  add(ship.powerSize ? 1 : 0, 'POWER_PLANT', 'Centrale', ship.powerSize);
  add(ship.coolerCount, 'COOLER', 'Refroidisseur', ship.coolerSize);
  add(ship.qdSize ? 1 : 0, 'QUANTUM_DRIVE', 'Moteur quantique', ship.qdSize);
  return hp;
}

/**
 * Configuration vide d'un vaisseau
 */
export function emptyConfig(ship) {
  return {
    turrets: Array.from({ length: ship?.laserSlots ?? 0 }, () => ({
      laserId: null,
      modules: [],
      operator: ''
    })),
    components: {}
  };
}

export function getLaser(id) {
  if (!id) return null;
  const match = LASERS.find(l => l.id === id);
  if (match) return match;
  const alias = id
    .replace('_mh', '_s')
    .replace('_1', '_s1')
    .replace('_2', '_s2')
    .replace('_3', '_s3');
  return LASERS.find(l => l.id === alias) || null;
}

export function getModule(id) {
  if (!id) return null;
  const match = MODULES.find(m => m.id === id);
  if (match) return match;
  const alias = id.replace('_iii', '_3').replace('-3', '_3');
  return MODULES.find(m => m.id === alias) || null;
}

/**
 * Nombre de slots de modules par tête laser (ou du vaisseau en repli)
 */
export function moduleSlotsFor(t, ship) {
  const laser = getLaser(t?.laserId);
  if (laser && (laser.slots !== undefined || laser.moduleSlots !== undefined)) {
    return laser.slots !== undefined ? laser.slots : laser.moduleSlots;
  }
  return ship?.moduleSlots ?? 0;
}

/**
 * État de configuration d'un vaisseau
 */
export function configState(entry, ship) {
  const t = entry.config?.turrets || [];
  if (!t.length) return { label: 'Rien à configurer', cls: 'cyan' };
  const set = t.filter(x => x.laserId).length;
  return set === t.length
    ? { label: 'Configuré', cls: 'green' }
    : { label: `${set}/${t.length} ${t.length > 1 ? 'tourelles' : 'tête'}`, cls: 'amber' };
}

/**
 * Flotte par défaut authentique du joueur : Prospector Alpha & Big Mole (MOLE)
 */
const DEFAULT_FLEET = () => {
  return [
    {
      uid: 'prospector_alpha',
      shipId: 'prospector',
      nickname: 'Prospector Alpha',
      active: true,
      insurance: 'LTI',
      config: {
        turrets: [{ laserId: 'helix_s1', modules: ['surge', null], operator: '' }],
        components: { 'Bouclier': 'FR-66 S1', 'Centrale': 'JS-300 S1', 'Refroidisseur': 'Ultra-Flow S1', 'Moteur quantique': 'Atlas S1' }
      }
    },
    {
      uid: 'bigmole',
      shipId: 'mole',
      nickname: 'Big Mole',
      active: false,
      insurance: '10 ans',
      config: {
        turrets: [
          { laserId: 'lancet_s2', modules: ['focus_3', 'surge'], operator: '' },
          { laserId: 'helix_s2', modules: ['stampede', 'brandt'], operator: '' },
          { laserId: 'arbor_s2', modules: [], operator: '' }
        ],
        components: { 'Bouclier': 'FR-76 S2', 'Centrale': 'JS-400 S2', 'Refroidisseur 1': 'Avalanche S2', 'Refroidisseur 2': 'Avalanche S2', 'Moteur quantique': 'XL-1 S2' }
      }
    }
  ];
};

export const fleetService = {
  /**
   * Charger la flotte depuis le stockage local
   */
  getShips() {
    if (typeof window === 'undefined') return DEFAULT_FLEET();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const d = DEFAULT_FLEET();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
        return d;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_FLEET();
    }
  },

  /**
   * Sauvegarder la flotte
   */
  saveFleet(fleet) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
    }
  },

  /**
   * Trouver un vaisseau de la flotte par son uid
   */
  getShipByUid(uidVal) {
    return this.getShips().find(s => s.uid === uidVal) || null;
  },

  /**
   * Trouver le vaisseau actif
   */
  getActiveShip() {
    const fleet = this.getShips();
    return fleet.find(s => s.active) || fleet[0] || null;
  },

  /**
   * Définir le vaisseau actif (un clic suffit)
   */
  setActiveShip(uidVal) {
    const fleet = this.getShips().map(s => ({
      ...s,
      active: s.uid === uidVal
    }));
    this.saveFleet(fleet);
    return true;
  },

  /**
   * Ajouter un vaisseau au hangar depuis le catalogue ships.js
   * (Possibilité d'en posséder plusieurs du même modèle)
   */
  addShip(shipId, customNickname = null) {
    const ship = getShip(shipId);
    if (!ship) return null;

    const fleet = this.getShips();
    const existingCount = fleet.filter(s => s.shipId === shipId).length;
    const defaultNick = existingCount > 0
      ? `${ship.name.split(' ').slice(1).join(' ') || ship.name} ${existingCount + 1}`
      : (ship.name.split(' ').slice(1).join(' ') || ship.name);

    const newEntry = {
      uid: uid(),
      shipId,
      nickname: customNickname || defaultNick,
      active: false,
      insurance: 'Achat aUEC',
      config: emptyConfig(ship)
    };

    fleet.push(newEntry);
    this.saveFleet(fleet);
    return newEntry;
  },

  /**
   * Dupliquer un vaisseau avec sa configuration complète
   */
  duplicateShip(uidVal) {
    const fleet = this.getShips();
    const src = fleet.find(s => s.uid === uidVal);
    if (!src) return null;

    const dup = {
      ...structuredClone(src),
      uid: uid(),
      nickname: `${src.nickname} (copie)`,
      active: false
    };

    fleet.push(dup);
    this.saveFleet(fleet);
    return dup;
  },

  /**
   * Retirer un vaisseau de sa flotte
   */
  removeShip(uidVal) {
    let fleet = this.getShips().filter(s => s.uid !== uidVal);
    // Si on a supprimé le vaisseau actif, rendre le premier actif
    if (fleet.length > 0 && !fleet.some(s => s.active)) {
      fleet[0].active = true;
    }
    this.saveFleet(fleet);
    return true;
  },

  /**
   * Mettre à jour la configuration d'un vaisseau
   */
  updateShip(uidVal, patch) {
    const fleet = this.getShips().map(s => {
      if (s.uid === uidVal) {
        return { ...s, ...patch };
      }
      return s;
    });
    this.saveFleet(fleet);
    return fleet.find(s => s.uid === uidVal);
  },

  /**
   * Calculer les totaux de haut de page
   */
  getFleetTotals() {
    const fleet = this.getShips();
    const totalCargo = fleet.reduce((sum, e) => sum + totalScu(getShip(e.shipId)), 0);
    const turrets = fleet.reduce((sum, e) => sum + (e.config?.turrets?.length || 0), 0);
    const crewNeeded = fleet.reduce((sum, e) => sum + Math.max(1, e.config?.turrets?.length || 0), 0);

    return {
      totalShips: fleet.length,
      totalCargo,
      turrets,
      crewNeeded
    };
  },

  /**
   * Obtenir toutes les têtes laser filtrées sur la taille
   */
  getLasersForSize(size) {
    if (size === null || size === undefined) return [];
    return LASERS.filter(l => l.size === size);
  },

  /**
   * Obtenir tous les modules de minage
   */
  getAllModules() {
    return MODULES.filter(m => m.id !== 'none');
  },

  /**
   * Nom d'affichage d'un laser
   */
  getLaserName(id) {
    return getLaser(id)?.name || null;
  },

  /**
   * Nom d'affichage d'un module
   */
  getModuleName(id) {
    return getModule(id)?.name || null;
  },

  /**
   * Réinitialiser aux vaisseaux d'exemple
   */
  resetToDefault() {
    const d = DEFAULT_FLEET();
    this.saveFleet(d);
    return d;
  }
};
