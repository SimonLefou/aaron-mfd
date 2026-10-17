// ============================================================================
// AARON MFD — CENTRAL STATE MANAGER
// Gestionnaire d'état réactif centralisé avec persistance et notifications
// ============================================================================

import { storage } from './storage.js';
import { eventBus, EVENTS } from './event-bus.js';
import { createPlayer, createShip, createGuild } from './models.js';

function getInitialLocalValue(key, fallback) {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key) || fallback;
  }
  return fallback;
}

class StateStore {
  constructor() {
    this._state = {
      // 1. Profil Joueur
      player: storage.get('player', createPlayer({
        callsign: getInitialLocalValue('aaron_mfd_callsign', 'CITIZEN-1'),
        role: 'mining'
      })),

      // 2. Flotte Personnelle
      fleet: storage.get('fleet', {
        activeShipId: 'default_prospector',
        ships: [
          createShip({
            id: 'default_prospector',
            modelId: 'prospector',
            customName: 'Prospector Alpha',
            role: 'mining',
            cargoCapacitySCU: 32,
            locationId: 'ARC-L1 Wide Forest Station'
          })
        ]
      }),

      // 3. Inventaire Unifié
      inventory: storage.get('inventory', {
        items: []
      }),

      // 4. Blueprints Maîtrisés (Crafting 4.0)
      crafting: storage.get('crafting', {
        unlockedBlueprintIds: [
          'bp_lancet_s1_mk2',
          'bp_lancet_s2_mk2',
          'bp_hofstede_s1_pulsed',
          'bp_surge_module',
          'bp_arbor_s1_reinforced',
          'bp_salvage_abrade_s1',
          'bp_fr66_shield'
        ],
        workshopHistory: []
      }),

      // 5. Paramètres du Scan Minier Actuel
      mining: {
        activeRock: null,
        selectedRefineryMethod: 'dinyx',
        selectedRefineryStation: 'ARC-L1'
      },

      // 6. Commerce & Cargo
      trade: {
        selectedRouteId: null,
        userCapitalUEC: 0,
        riskTolerance: 'moderate'
      },

      // 7. Guilde & Gouvernance
      guild: storage.get('guild', createGuild({
        name: 'Flotte Personnelle',
        tag: 'FLOTTE',
        treasuryBalance: 0
      })),

      // Ordres Logistiques de Fret
      logistics: storage.get('logistics', {
        orders: []
      }),

      // UI & Système
      ui: {
        lang: getInitialLocalValue('aaron_mfd_lang', 'fr'),
        theme: getInitialLocalValue('aaron_mfd_theme', 'mobiglas'),
        activeTab: 'mining'
      }
    };

    this._subscribers = new Map();
  }

  /**
   * Obtenir une copie immuable de l'état complet
   */
  getState() {
    return this._state;
  }

  /**
   * Obtenir une tranche (slice) de l'état
   * @param {string} sliceKey 
   */
  get(sliceKey) {
    return this._state[sliceKey];
  }

  /**
   * Mettre à jour une tranche de l'état et notifier les observateurs
   * @param {string} sliceKey - 'player', 'fleet', 'inventory', etc.
   * @param {Object|Function} updater - Nouvel objet ou fonction de mise à jour
   * @param {boolean} shouldPersist - Sauvegarder automatiquement dans le stockage local
   */
  set(sliceKey, updater, shouldPersist = true) {
    const currentSlice = this._state[sliceKey];
    const newSlice = typeof updater === 'function' ? updater(currentSlice) : { ...currentSlice, ...updater };

    this._state[sliceKey] = newSlice;

    if (shouldPersist && !['mining', 'ui'].includes(sliceKey)) {
      storage.set(sliceKey, newSlice);
    }

    this._notify(sliceKey, newSlice, currentSlice);
  }

  /**
   * Mettre à jour plusieurs tranches d'état en une seule passe
   * @param {Object} partialState 
   */
  setState(partialState) {
    if (!partialState || typeof partialState !== 'object') return;
    for (const [key, val] of Object.entries(partialState)) {
      this.set(key, val);
    }
  }

  /**
   * S'abonner aux changements d'une tranche d'état
   * @param {string} sliceKey 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe
   */
  subscribe(sliceKey, callback) {
    if (!this._subscribers.has(sliceKey)) {
      this._subscribers.set(sliceKey, new Set());
    }
    this._subscribers.get(sliceKey).add(callback);

    return () => {
      if (this._subscribers.has(sliceKey)) {
        this._subscribers.get(sliceKey).delete(callback);
      }
    };
  }

  _notify(sliceKey, newSlice, oldSlice) {
    if (this._subscribers.has(sliceKey)) {
      for (const cb of this._subscribers.get(sliceKey)) {
        try {
          cb(newSlice, oldSlice);
        } catch (err) {
          console.error(`[StateStore] Erreur dans le souscripteur pour "${sliceKey}":`, err);
        }
      }
    }
  }
}

export const store = new StateStore();
