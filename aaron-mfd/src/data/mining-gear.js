// Têtes laser et modules de minage.
// ⚠️ Liste de départ à compléter : les noms sont ceux du jeu, mais les stats et le nombre
// de slots de modules par tête (moduleSlots) sont à renseigner depuis une source fiable.
// Tant que moduleSlots vaut null, l'appli utilise le moduleSlots du vaisseau (ships.js).
export const MINING_LASERS = [
  { id: 'arbor_mh1', name: 'Arbor MH1', size: 1, moduleSlots: null },
  { id: 'helix_1', name: 'Helix I', size: 1, moduleSlots: null },
  { id: 'hofstede_s1', name: 'Hofstede-S1', size: 1, moduleSlots: null },
  { id: 'klein_s1', name: 'Klein-S1', size: 1, moduleSlots: null },
  { id: 'lancet_mh1', name: 'Lancet MH1', size: 1, moduleSlots: null },
  { id: 'impact_1', name: 'Impact I', size: 1, moduleSlots: null },
  { id: 'arbor_mh2', name: 'Arbor MH2', size: 2, moduleSlots: null },
  { id: 'helix_2', name: 'Helix II', size: 2, moduleSlots: null },
  { id: 'hofstede_s2', name: 'Hofstede-S2', size: 2, moduleSlots: null },
  { id: 'klein_s2', name: 'Klein-S2', size: 2, moduleSlots: null },
  { id: 'lancet_mh2', name: 'Lancet MH2', size: 2, moduleSlots: null },
  { id: 'impact_2', name: 'Impact II', size: 2, moduleSlots: null },
];

export const MINING_MODULES = [
  { id: 'surge', name: 'Surge', type: 'actif' },
  { id: 'stampede', name: 'Stampede', type: 'actif' },
  { id: 'brandt', name: 'Brandt', type: 'actif' },
  { id: 'forel', name: 'Forel', type: 'actif' },
  { id: 'lifeline', name: 'Lifeline', type: 'actif' },
  { id: 'optimum', name: 'Optimum', type: 'actif' },
  { id: 'rime', name: 'Rime', type: 'actif' },
  { id: 'torrent', name: 'Torrent', type: 'passif' },
  { id: 'focus', name: 'Focus', type: 'passif' },
  { id: 'rieger', name: 'Rieger', type: 'passif' },
  { id: 'vaux', name: 'Vaux', type: 'passif' },
  { id: 'fltr', name: 'FLTR', type: 'passif' },
];
