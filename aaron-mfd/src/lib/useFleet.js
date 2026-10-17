'use client';
// Flotte du joueur. Pour le prototype : stockée dans le navigateur (localStorage).
// Plus tard : mêmes fonctions, mais appels à /api/fleet (tables UserShip, Loadout, LoadoutSlot).
import { useCallback, useEffect, useState } from 'react';
import { getShip } from '@/lib/ships';

const KEY = 'aaron-mfd.fleet.v1';
const uid = () => Math.random().toString(36).slice(2, 9);

/** Configuration vide d'un vaisseau : une entrée par tourelle/tête + composants */
export function emptyConfig(ship) {
  return {
    turrets: Array.from({ length: ship.laserSlots ?? 0 }, () => ({ laserId: null, modules: [], operator: '' })),
    components: {},
  };
}

const DEFAULT = () => {
  const p = getShip('prospector');
  const m = getShip('mole');
  return [
    { uid: 'rockhound', shipId: 'prospector', nickname: 'Rockhound', active: true, insurance: 'LTI', config: { ...emptyConfig(p), turrets: [{ laserId: 'helix_1', modules: ['surge', null], operator: '' }] } },
    { uid: 'bigmole', shipId: 'mole', nickname: 'Big Mole', active: false, insurance: '10 ans', config: { ...emptyConfig(m), turrets: [
      { laserId: 'lancet_mh2', modules: [], operator: 'Vex' },
      { laserId: 'helix_2', modules: [], operator: 'RockHound' },
      { laserId: null, modules: [], operator: '' },
    ] } },
  ];
};

export function useFleet() {
  const [fleet, setFleet] = useState(null);
  useEffect(() => {
    try { setFleet(JSON.parse(localStorage.getItem(KEY)) ?? DEFAULT()); } catch { setFleet(DEFAULT()); }
  }, []);
  const save = useCallback((next) => { setFleet(next); localStorage.setItem(KEY, JSON.stringify(next)); }, []);

  return {
    fleet: fleet ?? [],
    ready: fleet !== null,
    add: (shipId, nickname) => {
      const ship = getShip(shipId);
      const n = { uid: uid(), shipId, nickname: nickname || ship.name.split(' ').slice(1).join(' '), active: false, insurance: '', config: emptyConfig(ship) };
      save([...(fleet ?? []), n]);
      return n;
    },
    remove: (id) => save(fleet.filter((s) => s.uid !== id)),
    setActive: (id) => save(fleet.map((s) => ({ ...s, active: s.uid === id }))),
    update: (id, patch) => save(fleet.map((s) => (s.uid === id ? { ...s, ...patch } : s))),
    duplicate: (id) => { const s = fleet.find((x) => x.uid === id); save([...fleet, { ...structuredClone(s), uid: uid(), nickname: `${s.nickname} (copie)`, active: false }]); },
    reset: () => save(DEFAULT()),
  };
}
