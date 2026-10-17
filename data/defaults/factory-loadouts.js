// AARON MFD Factory Loadout Presets (Solo & Wing)
export const FACTORY_LOADOUT_PRESETS = [
  {
    id: 'preset_prospector_balanced',
    name: 'Prospector : Polyvalent Équilibré',
    name_en: 'Prospector: Balanced All-Rounder',
    shipId: 'prospector',
    turrets: [
      { laserId: 'lancet_s1', moduleIds: ['surge', 'focus_3'] }
    ],
    gadgetId: 'boremax',
    isPreset: true
  },
  {
    id: 'preset_prospector_power',
    name: 'Prospector : Puissance Brute (Grosses Roches)',
    name_en: 'Prospector: Raw Power (Heavy Rocks)',
    shipId: 'prospector',
    turrets: [
      { laserId: 'helix_s1', moduleIds: ['rieger_c3', 'torrent'] }
    ],
    gadgetId: 'sabir',
    isPreset: true
  },
  {
    id: 'preset_mole_trio',
    name: 'Argo MOLE : Trio Équilibré (1 Lancet + 2 Helix)',
    name_en: 'Argo MOLE: Balanced Trio (1 Lancet + 2 Helix)',
    shipId: 'mole',
    turrets: [
      { laserId: 'lancet_s2', moduleIds: ['surge', 'surge', 'none'] },
      { laserId: 'helix_s2', moduleIds: ['focus_3', 'focus_3', 'none'] },
      { laserId: 'helix_s2', moduleIds: ['focus_3', 'focus_3', 'none'] }
    ],
    gadgetId: 'boremax',
    isPreset: true
  },
  {
    id: 'preset_arrastra_heavy',
    name: 'RSI Arrastra : Escadre Lourde S3',
    name_en: 'RSI Arrastra: Heavy Mining S3',
    shipId: 'arrastra',
    turrets: [
      { laserId: 'lancet_s3', moduleIds: ['surge', 'focus_3', 'none'] },
      { laserId: 'helix_s3', moduleIds: ['focus_3', 'focus_3', 'none'] },
      { laserId: 'helix_s3', moduleIds: ['focus_3', 'focus_3', 'none'] }
    ],
    gadgetId: 'optimax',
    isPreset: true
  },
  {
    id: 'preset_roc_gems',
    name: 'Greycat ROC : Collecte Gemmes Sol',
    name_en: 'Greycat ROC: Surface Gem Harvester',
    shipId: 'roc',
    turrets: [
      { laserId: 'arbor_mh0', moduleIds: [] }
    ],
    gadgetId: 'none',
    isPreset: true
  }
];
