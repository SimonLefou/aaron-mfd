// ============================================================================
// AARON MFD — CORE EVENT BUS
// Système de publication / souscription découplé pour la communication inter-modules
// ============================================================================

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * S'abonner à un événement
   * @param {string} event - Nom de l'événement (ex: 'INVENTORY_CHANGED')
   * @param {Function} callback - Fonction appelée lors de l'émission
   * @returns {Function} Fonction de désabonnement (unsubscribe)
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Retourne une fonction pour se désabonner facilement
    return () => this.off(event, callback);
  }

  /**
   * Se désabonner d'un événement
   * @param {string} event - Nom de l'événement
   * @param {Function} callback - Callback à retirer
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Émettre un événement vers tous les abonnés
   * @param {string} event - Nom de l'événement
   * @param {any} data - Données associées
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Erreur dans le handler de l'événement "${event}":`, err);
        }
      }
    }
  }

  /**
   * S'abonner pour une seule exécution
   * @param {string} event 
   * @param {Function} callback 
   */
  once(event, callback) {
    const unsub = this.on(event, (data) => {
      unsub();
      callback(data);
    });
    return unsub;
  }

  /**
   * Supprimer tous les abonnements (utile pour réinitialisation / tests)
   */
  clear() {
    this.listeners.clear();
  }
}

// Instance singleton
export const eventBus = new EventBus();

// Événements standards du système
export const EVENTS = {
  // Profil & Auth
  AUTH_CHANGED: 'auth:changed',
  CALLSIGN_CHANGED: 'auth:callsign_changed',
  PLAYER_UPDATED: 'auth:player_updated',
  SESSION_CHANGED: 'auth:session_changed',

  // Flotte & Vaisseaux
  FLEET_UPDATED: 'fleet:updated',
  ACTIVE_SHIP_CHANGED: 'fleet:active_ship_changed',
  LOADOUT_CHANGED: 'fleet:loadout_changed',

  // Inventaire
  INVENTORY_CHANGED: 'inventory:changed',
  ITEM_ADDED: 'inventory:item_added',
  ITEM_REMOVED: 'inventory:item_removed',
  ITEM_TRANSFERRED: 'inventory:item_transferred',

  // Minage & Scanner
  ROCK_SCANNED: 'mining:rock_scanned',
  MINING_SESSION_UPDATED: 'mining:session_updated',
  REFINERY_ORDER_CREATED: 'mining:refinery_order_created',

  // Crafting & Blueprints
  BLUEPRINT_UNLOCKED: 'crafting:blueprint_unlocked',
  ITEM_CRAFTED: 'crafting:item_crafted',

  // Commerce & Cargo
  TRADE_ROUTE_SELECTED: 'trade:route_selected',

  // Co-op & Escouade
  FLEET_SYNC_RECEIVED: 'coop:fleet_sync_received',
  SCAN_BROADCAST_RECEIVED: 'coop:scan_broadcast_received',

  // Guilde & Organisation
  GUILD_UPDATED: 'guild:updated',
  LOGISTIC_ORDER_CREATED: 'guild:logistic_order_created',
  LOGISTIC_ORDER_STATUS_CHANGED: 'guild:logistic_order_status_changed',
  TREASURY_TRANSACTION: 'guild:treasury_transaction'
};
