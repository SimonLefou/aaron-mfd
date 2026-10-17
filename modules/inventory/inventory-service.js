// ============================================================================
// AARON MFD — INVENTORY SERVICE
// Registre unifié des avoirs : minerais, RMC, composants craftés et marchandises
// Traçabilité multi-sites, séparation Personnel / Guilde, valorisation en temps réel
// ============================================================================

import { store } from '../core/state.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { createInventoryItem } from '../core/models.js';
import { MINERALS } from '../../data/game/minerals.js';

// Référentiel des cours de base pour commodités hors minerais
const COMMODITY_PRICE_MAP = {
  rmc: 7700,
  construction_materials: 6500,
  laranite: 3100,
  titanium: 950,
  beryl: 4300,
  medical_supplies: 1980,
  distilled_spirits: 450,
  processed_food: 140,
  agricium: 2750,
  hephaestanite: 1520,
  tungsten: 410,
  copper: 580,
  corundum: 280,
  diamond: 720,
  gold: 6800,
  taranite: 8100,
  bexalite: 4400,
  quantainium_raw: 12500,
  quantainium_refined: 25500
};

export const inventoryService = {
  /**
   * Récupérer tous les éléments de l'inventaire avec filtrage multicritères
   * @param {Object} filters - Filtres optionnels { ownerType, category, locationId, search, availableOnly }
   * @returns {Array<Object>}
   */
  getItems(filters = {}) {
    let items = store.get('inventory').items || [];

    if (filters.ownerType && filters.ownerType !== 'all') {
      items = items.filter(i => i.ownerType === filters.ownerType);
    }
    if (filters.category && filters.category !== 'all') {
      if (filters.category === 'crafted') {
        items = items.filter(i => i.category && i.category.startsWith('crafted'));
      } else {
        items = items.filter(i => i.category === filters.category);
      }
    }
    if (filters.locationId && filters.locationId !== 'all') {
      items = items.filter(i => i.locationId === filters.locationId);
    }
    if (filters.availableOnly) {
      items = items.filter(i => !i.installedOnShipId);
    }
    if (filters.forSaleOnly) {
      items = items.filter(i => Boolean(i.forSale));
    }
    if (filters.origin && filters.origin !== 'all') {
      items = items.filter(i => i.origin === filters.origin);
    }
    if (filters.saleScope && filters.saleScope !== 'all') {
      items = items.filter(i => i.saleScope === filters.saleScope);
    }
    if (filters.saleStatus && filters.saleStatus !== 'all') {
      items = items.filter(i => i.saleStatus === filters.saleStatus);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(i =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.code && i.code.toLowerCase().includes(q)) ||
        (i.locationId && i.locationId.toLowerCase().includes(q)) ||
        (i.category && i.category.toLowerCase().includes(q)) ||
        (i.subCategory && i.subCategory.toLowerCase().includes(q)) ||
        (i.origin && i.origin.toLowerCase().includes(q)) ||
        (i.ownerCallsign && i.ownerCallsign.toLowerCase().includes(q)) ||
        (i.barterOffer && i.barterOffer.toLowerCase().includes(q)) ||
        (i.metadata?.notes && i.metadata.notes.toLowerCase().includes(q))
      );
    }

    return items;
  },

  /**
   * Trouver un article précis par son ID
   * @param {string} itemId 
   * @returns {Object|null}
   */
  getItemById(itemId) {
    const items = store.get('inventory').items || [];
    return items.find(i => i.id === itemId) || null;
  },

  /**
   * Obtenir la quantité totale disponible d'une ressource (SCU)
   * @param {string} resourceCode (ex: 'quantainium', 'titanium', 'rmc')
   * @param {string} ownerType - 'personal' ou 'guild' (ou null pour tout)
   * @returns {number} SCU cumulé
   */
  getAvailableQuantity(resourceCode, ownerType = null) {
    const items = this.getItems({ ownerType });
    return items
      .filter(i => i.code.toLowerCase() === resourceCode.toLowerCase())
      .reduce((sum, i) => sum + (Number(i.quantitySCU) || 0), 0);
  },

  /**
   * Calculer la valeur marchande estimée d'un lot (en aUEC)
   * Utilise les taux officiels par cSCU * 100 ou les cours de commodités
   * @param {Object} item 
   * @returns {number} aUEC estimé
   */
  getItemEstimatedValue(item) {
    if (!item) return 0;
    if (item.metadata?.estimatedValueUEC && Number(item.metadata.estimatedValueUEC) > 0) {
      return Number(item.metadata.estimatedValueUEC);
    }

    const scu = Number(item.quantitySCU) || 0;
    const units = Number(item.quantityUnits) || 1;
    const code = (item.code || '').toLowerCase();

    // 0. Si un prix de vente joueur est fixé
    if (item.forSale && Number(item.salePriceUEC) > 0) {
      return Math.round(units * Number(item.salePriceUEC));
    }

    // Calcul du coefficient multiplicateur de qualité (0 à 1 000)
    let qualityMultiplier = 1.0;
    const qualityScore = typeof item.materialQuality === 'number'
      ? item.materialQuality
      : (item.origin === 'crafted' && typeof item.metadata?.materialQuality === 'number' ? item.metadata.materialQuality : null);

    if (typeof qualityScore === 'number') {
      const q = Math.max(0, Math.min(1000, qualityScore));
      if (q < 500) {
        qualityMultiplier = 0.5 + 0.5 * (q / 500); // 0.5x à 1.0x
      } else {
        qualityMultiplier = 1.0 + 2.5 * Math.pow((q - 500) / 500, 1.2); // 1.0x à 3.5x
      }
    }

    if (Number(item.catalogReferencePriceUEC) > 0) {
      return Math.round(units * Number(item.catalogReferencePriceUEC) * qualityMultiplier);
    }

    // 1. Minerais officiels dans la base
    const mineral = MINERALS.find(m => m.id.toLowerCase() === code || m.name.toLowerCase() === code);
    if (mineral) {
      // Les prix sont en aUEC / cSCU -> multiplier par 100 pour 1 SCU
      const pricePerScu = item.category === 'raw_ore'
        ? (Number(mineral.rawPrice) || 50) * 100
        : (Number(mineral.refinedPrice) || (mineral.rawPrice * 2)) * 100;
      return Math.round(scu * pricePerScu);
    }

    // 2. Commodités & RMC
    if (COMMODITY_PRICE_MAP[code]) {
      return Math.round(scu * COMMODITY_PRICE_MAP[code]);
    }

    // 3. Objets et équipements craftés (avec bonus qualité Star Citizen 4.0)
    if (item.category === 'crafted_laser') {
      return Math.round(units * 145000 * qualityMultiplier);
    }
    if (item.category === 'crafted_module') {
      return Math.round(units * 38000 * qualityMultiplier);
    }
    if (item.category === 'crafted_weapon') {
      return Math.round(units * 85000 * qualityMultiplier);
    }

    // Défaut
    return scu > 0 ? Math.round(scu * 2500) : units * 5000;
  },

  /**
   * Calculer les métriques agrégées pour un ensemble de filtres
   * @param {Object} filters 
   * @returns {{ totalScu: number, totalValueUEC: number, totalCount: number }}
   */
  getTotals(filters = {}) {
    const items = this.getItems(filters);
    let totalScu = 0;
    let totalValueUEC = 0;

    for (const item of items) {
      totalScu += Number(item.quantitySCU) || 0;
      totalValueUEC += this.getItemEstimatedValue(item);
    }

    return {
      totalScu: Math.round(totalScu * 100) / 100,
      totalValueUEC,
      totalCount: items.length
    };
  },

  /**
   * Ajouter une ressource ou un objet à l'inventaire
   * Si la ressource existe déjà au même endroit et même propriétaire, on incrémente la quantité
   * @param {Object} itemData 
   */
  addItem(itemData) {
    const newItem = createInventoryItem(itemData);

    // Si la valeur estimée n'est pas fournie, on la calcule automatiquement
    if (!newItem.metadata.estimatedValueUEC) {
      newItem.metadata.estimatedValueUEC = this.getItemEstimatedValue(newItem);
    }

    store.set('inventory', prev => {
      const items = [...prev.items];
      // Pour les minerais en vrac ou RMC, fusionner si même code, même lieu, même propriétaire, même qualité et même usage
      if (['raw_ore', 'refined_ore', 'salvage_rmc', 'commodity_cargo'].includes(newItem.category)) {
        const existingIndex = items.findIndex(i =>
          i.code === newItem.code &&
          i.category === newItem.category &&
          i.ownerType === newItem.ownerType &&
          i.locationId === newItem.locationId &&
          i.materialQuality === newItem.materialQuality &&
          i.intendedUse === newItem.intendedUse
        );

        if (existingIndex !== -1) {
          const updatedScu = Number(items[existingIndex].quantitySCU) + Number(newItem.quantitySCU);
          items[existingIndex] = {
            ...items[existingIndex],
            quantitySCU: updatedScu,
            updatedAt: Date.now()
          };
          items[existingIndex].metadata.estimatedValueUEC = this.getItemEstimatedValue(items[existingIndex]);
          return { ...prev, items };
        }
      }

      items.push(newItem);
      return { ...prev, items };
    });

    eventBus.emit(EVENTS.ITEM_ADDED, newItem);
    eventBus.emit(EVENTS.INVENTORY_CHANGED, this.getItems());
    return newItem;
  },

  /**
   * Mettre à jour un article existant
   * @param {string} itemId 
   * @param {Object} updates 
   */
  updateItem(itemId, updates = {}) {
    let updatedItem = null;

    store.set('inventory', prev => {
      const items = prev.items.map(item => {
        if (item.id === itemId) {
          updatedItem = {
            ...item,
            ...updates,
            metadata: {
              ...item.metadata,
              ...(updates.metadata || {})
            },
            updatedAt: Date.now()
          };
          updatedItem.metadata.estimatedValueUEC = this.getItemEstimatedValue(updatedItem);
          return updatedItem;
        }
        return item;
      });
      return { ...prev, items };
    });

    if (updatedItem) {
      eventBus.emit(EVENTS.INVENTORY_CHANGED, this.getItems());
    }
    return updatedItem;
  },

  /**
   * Enregistrer un équipement (acheté, trouvé/looté ou crafté) dans l'inventaire
   * @param {Object} data 
   * @returns {Object} Nouvel équipement
   */
  addEquipmentItem(data = {}) {
    const user = store.get('profile') || {};
    const equipmentItem = createInventoryItem({
      category: data.category || 'component',
      subCategory: data.subCategory || 'general',
      code: data.code || 'component',
      name: data.name || 'Équipement non spécifié',
      size: data.size || null,
      grade: data.grade || null,
      quantitySCU: 0,
      quantityUnits: Number(data.quantityUnits) || 1,
      ownerType: data.ownerType || 'personal',
      ownerId: data.ownerId || user.id || 'local_user',
      ownerCallsign: data.ownerCallsign || user.callsign || 'VORTEX-1',
      locationId: data.locationId || 'ARC-L1 Wide Forest Station',
      origin: data.origin || 'purchased',
      craftBlueprintId: data.craftBlueprintId || null,
      materialQuality: data.materialQuality,
      qualityTier: data.qualityTier,
      qualityTierLabel: data.qualityTierLabel,
      serialNumber: data.serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      conditionPct: typeof data.conditionPct === 'number' ? data.conditionPct : 100,
      forSale: Boolean(data.forSale),
      salePriceUEC: Number(data.salePriceUEC) || 0,
      barterOffer: (data.barterOffer || '').trim(),
      catalogReferencePriceUEC: Number(data.catalogReferencePriceUEC) || 0,
      saleScope: data.saleScope || 'inter_guild',
      saleStatus: data.forSale ? 'available' : 'not_for_sale',
      metadata: {
        notes: data.notes || '',
        materialQuality: data.materialQuality,
        qualityTier: data.qualityTier,
        qualityTierLabel: data.qualityTierLabel,
        ...(data.metadata || {})
      }
    });

    return this.addItem(equipmentItem);
  },

  /**
   * Mettre à jour l'offre de vente d'un équipement (prix aUEC, troc, statut, visibilité)
   * @param {string} itemId 
   * @param {Object} saleParams - { forSale, salePriceUEC, barterOffer, saleScope, saleStatus, reservedByCallsign }
   * @returns {Object|null}
   */
  updateItemSaleListing(itemId, saleParams = {}) {
    const existing = this.getItemById(itemId);
    if (!existing) return null;

    const isForSale = saleParams.forSale !== undefined ? Boolean(saleParams.forSale) : existing.forSale;
    const updates = {
      forSale: isForSale,
      salePriceUEC: saleParams.salePriceUEC !== undefined ? Number(saleParams.salePriceUEC) : existing.salePriceUEC,
      barterOffer: saleParams.barterOffer !== undefined ? String(saleParams.barterOffer).trim() : (existing.barterOffer || ''),
      saleScope: saleParams.saleScope || existing.saleScope || 'inter_guild',
      saleStatus: isForSale ? (saleParams.saleStatus || (existing.saleStatus === 'not_for_sale' ? 'available' : existing.saleStatus)) : 'not_for_sale',
      listedAt: isForSale ? (existing.listedAt || Date.now()) : null
    };

    if (saleParams.reservedByCallsign !== undefined) {
      updates.reservedByCallsign = saleParams.reservedByCallsign;
    }

    return this.updateItem(itemId, updates);
  },

  /**
   * Récupérer tous les articles actuellement mis en vente
   * @param {Object} options - { scope, status, category }
   * @returns {Array<Object>}
   */
  getSaleItems(options = {}) {
    return this.getItems({
      forSaleOnly: true,
      category: options.category || 'all',
      saleScope: options.scope || 'all',
      saleStatus: options.status || 'all'
    });
  },

  /**
   * Supprimer définitivement un lot de l'inventaire
   * @param {string} itemId 
   * @returns {boolean}
   */
  removeItem(itemId) {
    let removedItem = null;

    store.set('inventory', prev => {
      const item = prev.items.find(i => i.id === itemId);
      if (item) removedItem = item;
      const items = prev.items.filter(i => i.id !== itemId);
      return { ...prev, items };
    });

    if (removedItem) {
      eventBus.emit(EVENTS.ITEM_REMOVED, removedItem);
      eventBus.emit(EVENTS.INVENTORY_CHANGED, this.getItems());
      return true;
    }
    return false;
  },

  /**
   * Scinder un lot en deux (ex: décharger 10 SCU d'une pile de 32 SCU)
   * @param {string} itemId 
   * @param {number} splitQuantitySCU 
   * @param {string|null} targetLocationId 
   * @returns {Object|null} Nouveau lot créé
   */
  splitItem(itemId, splitQuantitySCU, targetLocationId = null) {
    const original = this.getItemById(itemId);
    if (!original || original.quantitySCU <= splitQuantitySCU || splitQuantitySCU <= 0) {
      return null;
    }

    const remainingSCU = original.quantitySCU - splitQuantitySCU;
    this.updateItem(itemId, { quantitySCU: remainingSCU });

    const newLot = this.addItem({
      ...original,
      id: undefined, // Générera un nouvel identifiant unique
      quantitySCU: splitQuantitySCU,
      locationId: targetLocationId || original.locationId,
      metadata: {
        ...original.metadata,
        notes: `Scindé depuis lot ${original.name} (${splitQuantitySCU} SCU)`
      }
    });

    return newLot;
  },

  /**
   * Transférer la propriété d'un lot (Personnel <-> Guilde)
   * @param {string} itemId 
   * @param {string} targetOwnerType - 'personal' ou 'guild'
   * @returns {Object|null}
   */
  transferOwnership(itemId, targetOwnerType) {
    const item = this.getItemById(itemId);
    if (!item) return null;

    return this.updateItem(itemId, {
      ownerType: targetOwnerType === 'guild' ? 'guild' : 'personal',
      ownerId: targetOwnerType === 'guild' ? (store.get('guild')?.id || 'guild_primary') : 'local_user'
    });
  },

  /**
   * Consommer / Soustraire une quantité de ressource (pour le craft ou la vente)
   * @param {string} resourceCode 
   * @param {number} requiredSCU 
   * @param {string} ownerType 
   * @returns {boolean} Succès ou échec
   */
  consumeResource(resourceCode, requiredSCU, ownerType = 'personal') {
    const available = this.getAvailableQuantity(resourceCode, ownerType);
    if (available < requiredSCU) {
      return false; // Pas assez de stock
    }

    let remainingToDeduct = requiredSCU;

    store.set('inventory', prev => {
      const items = [];
      for (const item of prev.items) {
        if (
          item.code.toLowerCase() === resourceCode.toLowerCase() &&
          item.ownerType === ownerType &&
          remainingToDeduct > 0
        ) {
          if (item.quantitySCU <= remainingToDeduct) {
            remainingToDeduct -= item.quantitySCU;
            // L'élément est complètement consommé, on ne le remet pas dans la liste
          } else {
            const updated = {
              ...item,
              quantitySCU: item.quantitySCU - remainingToDeduct,
              updatedAt: Date.now()
            };
            updated.metadata.estimatedValueUEC = this.getItemEstimatedValue(updated);
            items.push(updated);
            remainingToDeduct = 0;
          }
        } else {
          items.push(item);
        }
      }
      return { ...prev, items };
    });

    eventBus.emit(EVENTS.ITEM_REMOVED, { resourceCode, quantitySCU: requiredSCU });
    eventBus.emit(EVENTS.INVENTORY_CHANGED, this.getItems());
    return true;
  },

  /**
   * Assigner un composant crafté à un vaisseau
   * @param {string} itemId 
   * @param {string} shipId 
   */
  equipItemOnShip(itemId, shipId) {
    store.set('inventory', prev => {
      const items = prev.items.map(item => {
        if (item.id === itemId) {
          return { ...item, installedOnShipId: shipId, updatedAt: Date.now() };
        }
        return item;
      });
      return { ...prev, items };
    });

    eventBus.emit(EVENTS.INVENTORY_CHANGED, this.getItems());
    return true;
  },

  /**
   * Retirer un composant d'un vaisseau (retour en stock disponible)
   * @param {string} itemId 
   */
  unequipItem(itemId) {
    store.set('inventory', prev => {
      const items = prev.items.map(item => {
        if (item.id === itemId) {
          return { ...item, installedOnShipId: null, updatedAt: Date.now() };
        }
        return item;
      });
      return { ...prev, items };
    });

    eventBus.emit(EVENTS.INVENTORY_CHANGED, this.getItems());
    return true;
  },

  /**
   * Transférer un lot vers un autre emplacement (station, vaisseau, etc.)
   * @param {string} itemId 
   * @param {string} targetLocationId 
   */
  transferLocation(itemId, targetLocationId) {
    store.set('inventory', prev => {
      const items = prev.items.map(item => {
        if (item.id === itemId) {
          return { ...item, locationId: targetLocationId, updatedAt: Date.now() };
        }
        return item;
      });
      return { ...prev, items };
    });

    eventBus.emit(EVENTS.ITEM_TRANSFERRED, { itemId, targetLocationId });
    eventBus.emit(EVENTS.INVENTORY_CHANGED, this.getItems());
    return true;
  },

  /**
   * Remplir automatiquement un inventaire initial réaliste s'il est vide
   */
  seedInitialInventory() {
    // Données par défaut désactivées : l'inventaire commence vierge
    return;
  },

  /**
   * Vider l'intégralité des articles de l'inventaire (remise à zéro propre)
   */
  clearAllItems() {
    store.set('inventory', { items: [] });
    eventBus.emit(EVENTS.INVENTORY_CHANGED, []);
    return true;
  },



  /**
   * Vendre un lot de minerai brut directement au comptoir sans passer par la raffinerie
   * @param {string} itemId 
   * @param {number|null} customPricePerSCU 
   */
  sellRawOreBatch(itemId, customPricePerSCU = null) {
    const item = this.getItemById(itemId);
    if (!item) return { success: false, message: 'Lot introuvable dans l\'inventaire' };
    if (item.category !== 'raw_ore') {
      return { success: false, message: 'Seul un lot de minerai brut peut être vendu brut' };
    }

    const scu = Number(item.quantitySCU) || 0;
    const mineral = MINERALS.find(m => m.id.toLowerCase() === (item.code || '').toLowerCase());
    const basePricePerSCU = (mineral?.rawPrice || 50) * 100;
    const unitPrice = typeof customPricePerSCU === 'number' ? customPricePerSCU : basePricePerSCU;

    // Prise en compte de la qualité dans la valorisation
    const q = typeof item.materialQuality === 'number' ? item.materialQuality : 500;
    const qMultiplier = q > 500 ? (1 + (q - 500) / 1500) : (0.7 + 0.3 * (q / 500));
    const revenueUEC = Math.round(scu * unitPrice * qMultiplier);

    this.removeItem(itemId);
    this.creditBalance(revenueUEC);

    eventBus.emit('ORE_SOLD_RAW', { itemId, item, revenueUEC, scu });
    return {
      success: true,
      revenueUEC,
      scu,
      mineralName: item.name,
      message: `Lot brut de ${scu} SCU vendu avec succès pour +${revenueUEC.toLocaleString('fr-FR')} aUEC.`
    };
  },

  /**
   * Vendre un lot de minerai raffiné au comptoir de commodités au cours raffiné
   * @param {string} itemId 
   * @param {number|null} customPricePerSCU 
   */
  sellRefinedOreBatch(itemId, customPricePerSCU = null) {
    const item = this.getItemById(itemId);
    if (!item) return { success: false, message: 'Lot introuvable dans l\'inventaire' };
    if (item.category !== 'refined_ore') {
      return { success: false, message: 'Seul un lot raffiné peut être vendu au cours raffiné' };
    }

    const scu = Number(item.quantitySCU) || 0;
    const mineral = MINERALS.find(m => m.id.toLowerCase() === (item.code || '').toLowerCase());
    const basePricePerSCU = (mineral?.refinedPrice || ((mineral?.rawPrice || 50) * 2.1)) * 100;
    const unitPrice = typeof customPricePerSCU === 'number' ? customPricePerSCU : basePricePerSCU;

    // Bonus de valeur marchande pour les matériaux raffinés de haute pureté / qualité
    const q = typeof item.materialQuality === 'number' ? item.materialQuality : 500;
    const qMultiplier = q > 500 ? (1 + (q - 500) / 1000) : (0.8 + 0.2 * (q / 500));
    const revenueUEC = Math.round(scu * unitPrice * qMultiplier);

    this.removeItem(itemId);
    this.creditBalance(revenueUEC);

    eventBus.emit('ORE_SOLD_REFINED', { itemId, item, revenueUEC, scu });
    return {
      success: true,
      revenueUEC,
      scu,
      mineralName: item.name,
      message: `Lot raffiné de ${scu} SCU vendu avec succès pour +${revenueUEC.toLocaleString('fr-FR')} aUEC.`
    };
  },

  /**
   * Envoyer un lot de minerai brut à la raffinerie (conversion brut -> raffiné avec conservation de qualité)
   * @param {string} itemId 
   * @param {string} methodId ('dinyx', 'ferron', 'cormack')
   * @param {string} stationId 
   */
  refineRawOreBatch(itemId, methodId = 'dinyx', stationId = 'CRU-L1 Ambitious Dream') {
    const item = this.getItemById(itemId);
    if (!item) return { success: false, message: 'Lot introuvable' };
    if (item.category !== 'raw_ore') {
      return { success: false, message: 'Seul un lot brut peut être raffiné' };
    }

    const scu = Number(item.quantitySCU) || 0;
    let yieldPct = 93;
    let costPerSCU = 190;
    if (methodId === 'ferron') { yieldPct = 88; costPerSCU = 320; }
    else if (methodId === 'cormack') { yieldPct = 84; costPerSCU = 450; }

    const refiningCostUEC = Math.round(scu * costPerSCU);
    const refinedSCU = Math.round((scu * (yieldPct / 100)) * 10) / 10;
    const mineral = MINERALS.find(m => m.id.toLowerCase() === (item.code || '').toLowerCase());
    const mineralName = mineral?.name_fr || mineral?.name || item.code;

    // Retirer le brut
    this.removeItem(itemId);

    // Déduire les frais de traitement du compte
    this.creditBalance(-refiningCostUEC);

    // Créer le lot raffiné en conservant fidèlement la note de qualité des matériaux
    const refinedItem = this.addItem({
      category: 'refined_ore',
      code: item.code,
      name: `${mineralName} Raffiné [Q${item.materialQuality || 500}]`,
      quantitySCU: refinedSCU,
      ownerType: item.ownerType,
      ownerId: item.ownerId,
      ownerCallsign: item.ownerCallsign,
      locationId: stationId,
      origin: 'mined',
      materialQuality: item.materialQuality,
      qualityTier: item.qualityTier,
      qualityTierLabel: item.qualityTierLabel,
      intendedUse: item.intendedUse === 'craft' ? 'craft' : 'sell_refined',
      reservedForCraft: Boolean(item.reservedForCraft),
      forSale: item.intendedUse !== 'craft',
      metadata: {
        ...(item.metadata || {}),
        refiningMethod: methodId,
        refineryStation: stationId,
        refiningCostUEC,
        notes: `Issu du raffinage de ${scu} SCU bruts via méthode ${methodId.toUpperCase()} à ${stationId}.`
      }
    });

    eventBus.emit('ORE_REFINED', { rawItemId: itemId, refinedItem, costUEC: refiningCostUEC });
    return {
      success: true,
      refinedItem,
      costUEC: refiningCostUEC,
      refinedSCU,
      message: `Raffinage terminé : ${refinedSCU} SCU de ${mineralName} raffiné obtenus (Frais : -${refiningCostUEC.toLocaleString('fr-FR')} aUEC).`
    };
  },

  /**
   * Basculer l'intention d'usage d'un lot : Garder pour le Craft <-> Mettre en Vente
   * @param {string} itemId 
   */
  toggleOreCraftReservation(itemId) {
    const item = this.getItemById(itemId);
    if (!item) return null;

    const willReserve = !item.reservedForCraft;
    const newUse = willReserve ? 'craft' : (item.category === 'raw_ore' ? 'sell_raw' : 'sell_refined');

    return this.updateItem(itemId, {
      reservedForCraft: willReserve,
      intendedUse: newUse,
      forSale: !willReserve,
      metadata: {
        ...item.metadata,
        notes: willReserve
          ? '⭐ Réservé en inventaire pour le Craft d’équipements surcadencés.'
          : (item.category === 'raw_ore' ? 'Destiné à la vente brute.' : 'Prêt pour la vente au cours raffiné.')
      }
    });
  },

  /**
   * Mettre à jour l'usage stratégique d'un minerai
   * @param {string} itemId 
   * @param {string} intendedUse - 'craft' | 'sell_raw' | 'refine' | 'sell_refined'
   */
  setOreIntendedUse(itemId, intendedUse) {
    const item = this.getItemById(itemId);
    if (!item) return null;

    const isReserved = intendedUse === 'craft';
    return this.updateItem(itemId, {
      intendedUse,
      reservedForCraft: isReserved,
      forSale: !isReserved
    });
  },

  /**
   * Ajouter directement un lot extrait depuis le calculateur de minage
   */
  addExtractedOreBatch({ mineralId, quantitySCU, quality, intendedUse = 'craft', locationId = 'ship_cargo', notes = '' }) {
    const mineral = MINERALS.find(m => m.id.toLowerCase() === (mineralId || '').toLowerCase());
    const mineralName = mineral?.name_fr || mineral?.name || mineralId;
    const q = Math.max(0, Math.min(1000, Number(quality) || 500));

    let tier = 'standard';
    let tierLabel = 'Standard Usine';
    if (q >= 900) { tier = 'masterwork'; tierLabel = '⭐ Maître-Ouvrier / Prototype'; }
    else if (q >= 750) { tier = 'high'; tierLabel = 'Haute Qualité Industrielle'; }
    else if (q >= 600) { tier = 'enhanced'; tierLabel = 'Supérieur / Militaire'; }
    else if (q < 400) { tier = 'low'; tierLabel = 'Rebut / Basse Qualité'; }

    const isReserved = intendedUse === 'craft';

    return this.addItem({
      category: 'raw_ore',
      code: mineralId,
      name: `${mineralName} Brut [Q${q}]`,
      quantitySCU: Number(quantitySCU) || 1,
      ownerType: 'personal',
      locationId: locationId || 'ship_cargo',
      origin: 'mined',
      materialQuality: q,
      qualityTier: tier,
      qualityTierLabel: tierLabel,
      intendedUse: intendedUse,
      reservedForCraft: isReserved,
      forSale: !isReserved,
      metadata: {
        materialQuality: q,
        qualityTier: tier,
        qualityTierLabel: tierLabel,
        notes: notes || (isReserved ? `Gisement Q${q} réservé pour l'atelier de craft.` : `Gisement Q${q} prêt pour la vente brute.`)
      }
    });
  },

  /**
   * Créditer ou débiter le portefeuille du joueur (persiste dans storage & profil)
   * @param {number} deltaUEC 
   */
  creditBalance(deltaUEC) {
    const amount = Number(deltaUEC) || 0;
    if (amount === 0) return;

    store.set('player', prev => ({
      ...prev,
      balanceAuec: Math.max(0, (Number(prev.balanceAuec) || 0) + amount)
    }));

    try {
      const authStorage = localStorage.getItem('aaron_mfd_accounts');
      if (authStorage) {
        const accounts = JSON.parse(authStorage);
        if (Array.isArray(accounts) && accounts.length > 0) {
          accounts[0].balanceAuec = Math.max(0, (Number(accounts[0].balanceAuec) || 0) + amount);
          localStorage.setItem('aaron_mfd_accounts', JSON.stringify(accounts));
        }
      }
    } catch (e) {}

    eventBus.emit('BALANCE_UPDATED', amount);
  }
};
