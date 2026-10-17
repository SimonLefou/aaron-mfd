// Unifie SHIPS et SUPPORT_SHIPS : mêmes champs partout, null quand ça ne s'applique pas.
import { SHIPS, SUPPORT_SHIPS } from '@/data/ships';

const NO_TRACTOR = { hasTractor: false, size: null, power: null, desc_fr: '', desc_en: '' };

export function normalizeShip(s) {
  const n = (v) => (v === undefined ? null : v);
  return {
    id: s.id,
    name: s.name,
    manufacturer: s.manufacturer,
    role: s.role,
    isCargoSupport: Boolean(s.isCargoSupport),
    type_fr: s.type_fr,
    type_en: s.type_en,
    scu: s.scu,
    // minage
    laserSize: n(s.laserSize),
    laserSlots: n(s.laserSlots),
    moduleSlots: n(s.moduleSlots),
    basePower: n(s.basePower),
    saddlebags: n(s.saddlebags),
    saddlebagSCU: n(s.saddlebagSCU),
    detachableBags: n(s.detachableBags),
    // support
    tractorBeam: s.tractorBeam ?? NO_TRACTOR,
    gridType: n(s.gridType),
    prospectorBagsMax: n(s.prospectorBagsMax),
    moleBagsMax: n(s.moleBagsMax),
    // composants
    qdSize: n(s.qdSize),
    shieldSize: n(s.shieldSize),
    shieldCount: n(s.shieldCount),
    powerSize: n(s.powerSize),
    coolerSize: n(s.coolerSize),
    coolerCount: n(s.coolerCount),
    qfTank: n(s.qfTank),
    incomplete: s._incomplete ?? null,
  };
}

export const ALL_SHIPS = [...SHIPS, ...SUPPORT_SHIPS].map(normalizeShip);
export const getShip = (id) => ALL_SHIPS.find((s) => s.id === id) ?? null;

/** Emplacements (hardpoints) déduits des tailles et quantités, pour la table Hardpoint et l'écran loadout */
export function hardpointsOf(ship) {
  const hp = [];
  const add = (count, category, label, size) => {
    for (let i = 1; i <= (count ?? 0); i++) hp.push({ category, name: count > 1 ? `${label} ${i}` : label, size: size ?? 0, turretIndex: category === 'MINING_HEAD' ? i : null });
  };
  add(ship.laserSlots, 'MINING_HEAD', ship.laserSlots > 1 ? 'Tourelle' : 'Tête de minage', ship.laserSize);
  add(ship.moduleSlots, 'MINING_MODULE', 'Module', null);
  add(ship.shieldCount, 'SHIELD', 'Bouclier', ship.shieldSize);
  add(ship.powerSize ? 1 : 0, 'POWER_PLANT', 'Centrale', ship.powerSize);
  add(ship.coolerCount, 'COOLER', 'Refroidisseur', ship.coolerSize);
  add(ship.qdSize ? 1 : 0, 'QUANTUM_DRIVE', 'Moteur quantique', ship.qdSize);
  return hp;
}

/** Capacité totale transportable (soute + sacoches) */
export const totalScu = (s) => s.scu + (s.saddlebags ?? 0) * (s.saddlebagSCU ?? 0);
