// ============================================================================
// AARON MFD — STORAGE ADAPTER
// Gestionnaire de persistance universel (Navigateur & Node.js)
// ============================================================================

const STORAGE_PREFIX = 'aaron_mfd_v3_';

// Mémoire tampon de repli si localStorage n'est pas disponible (Node.js / tests)
const memoryStorage = new Map();

function getStorageDriver() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: (key) => memoryStorage.get(key) || null,
    setItem: (key, val) => memoryStorage.set(key, String(val)),
    removeItem: (key) => memoryStorage.delete(key),
    key: (index) => Array.from(memoryStorage.keys())[index] || null,
    get length() { return memoryStorage.size; }
  };
}

export const storage = {
  /**
   * Sauvegarder un objet ou une valeur sous une clé préfixée
   * @param {string} key 
   * @param {any} value 
   */
  set(key, value) {
    try {
      const driver = getStorageDriver();
      const fullKey = STORAGE_PREFIX + key;
      const serialized = JSON.stringify(value);
      driver.setItem(fullKey, serialized);
      return true;
    } catch (err) {
      console.error(`[Storage] Erreur d'écriture pour "${key}":`, err);
      return false;
    }
  },

  /**
   * Récupérer une valeur avec valeur par défaut si absente
   * @param {string} key 
   * @param {any} defaultValue 
   */
  get(key, defaultValue = null) {
    try {
      const driver = getStorageDriver();
      const fullKey = STORAGE_PREFIX + key;
      const raw = driver.getItem(fullKey);
      if (raw === null || raw === undefined) {
        return defaultValue;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[Storage] Erreur de lecture pour "${key}", retour de la valeur par défaut:`, err);
      return defaultValue;
    }
  },

  /**
   * Supprimer une entrée
   * @param {string} key 
   */
  remove(key) {
    try {
      const driver = getStorageDriver();
      driver.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (err) {
      console.error(`[Storage] Erreur de suppression pour "${key}":`, err);
      return false;
    }
  },

  /**
   * Vérifier l'existence d'une clé
   * @param {string} key 
   */
  has(key) {
    const driver = getStorageDriver();
    return driver.getItem(STORAGE_PREFIX + key) !== null;
  },

  /**
   * Exporter l'ensemble des données locales en un objet JSON
   */
  exportAll() {
    const driver = getStorageDriver();
    const backup = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      data: {}
    };

    for (let i = 0; i < driver.length; i++) {
      const k = driver.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const shortKey = k.substring(STORAGE_PREFIX.length);
        try {
          backup.data[shortKey] = JSON.parse(driver.getItem(k));
        } catch {
          backup.data[shortKey] = driver.getItem(k);
        }
      }
    }
    return backup;
  },

  /**
   * Importer une sauvegarde complète
   * @param {Object} backupObject 
   */
  importAll(backupObject) {
    if (!backupObject || !backupObject.data) {
      throw new Error('Format de sauvegarde invalide');
    }
    for (const [key, val] of Object.entries(backupObject.data)) {
      this.set(key, val);
    }
    return true;
  }
};
