// ============================================================================
// AARON MFD — GUILD & OPERATIONS SERVICE
// Gouvernance d'organisation, tableau de bord 360°, flottes mixtes et ordres logistiques
// ============================================================================

import { store } from '../core/state.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { createGuild, createLogisticOrder } from '../core/models.js';
import { inventoryService } from '../inventory/inventory-service.js';
import { craftingService } from '../crafting/crafting-service.js';

export const guildService = {
  /**
   * Obtenir la configuration et le profil de la guilde active
   */
  getGuild() {
    return store.get('guild');
  },

  /**
   * Obtenir la liste des membres enregistrés dans la guilde
   */
  getMembers() {
    const guild = this.getGuild();
    return guild.members || [
      {
        id: 'member_1',
        callsign: 'COMMANDER-ALPHA',
        role: 'admiral',
        specialty: 'Commandement',
        joinedAt: Date.now() - 30 * 86400000,
        unlockedBlueprints: ['bp_lancet_s2_mk2', 'bp_focus_3_mk2']
      },
      {
        id: 'member_2',
        callsign: 'MINER-PRO',
        role: 'pilot',
        specialty: 'Minage Lourd (MOLE)',
        joinedAt: Date.now() - 15 * 86400000,
        unlockedBlueprints: ['bp_lancet_s1_mk2', 'bp_surge_mk2']
      },
      {
        id: 'member_3',
        callsign: 'HAULER-HEAVY',
        role: 'pilot',
        specialty: 'Transport Cargo (C2)',
        joinedAt: Date.now() - 10 * 86400000,
        unlockedBlueprints: []
      },
      {
        id: 'member_4',
        callsign: 'VIPER-LEAD',
        role: 'pilot',
        specialty: 'Escorte Armée (Gladius/Scorpius)',
        joinedAt: Date.now() - 5 * 86400000,
        unlockedBlueprints: ['bp_cf337_overclock']
      }
    ];
  },

  /**
   * Valider / Accepter un nouveau joueur dans la guilde
   * @param {Object} candidate - { callsign, specialty, role }
   */
  acceptMember(candidate) {
    const newMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      callsign: (candidate.callsign || 'CITIZEN').toUpperCase().trim(),
      role: candidate.role || 'pilot',
      specialty: candidate.specialty || 'Polyvalent',
      joinedAt: Date.now(),
      unlockedBlueprints: candidate.unlockedBlueprints || []
    };

    store.set('guild', prev => ({
      ...prev,
      members: [...(prev.members || this.getMembers()), newMember]
    }));

    eventBus.emit(EVENTS.GUILD_UPDATED, this.getGuild());
    return newMember;
  },

  /**
   * Modifier le rôle ou le grade d'un membre (RBAC)
   * @param {string} memberId 
   * @param {string} newRole - 'admiral' | 'officer' | 'treasurer' | 'pilot' | 'recruit'
   */
  setMemberRole(memberId, newRole) {
    store.set('guild', prev => ({
      ...prev,
      members: (prev.members || this.getMembers()).map(m => {
        if (m.id === memberId) {
          return { ...m, role: newRole };
        }
        return m;
      })
    }));

    eventBus.emit(EVENTS.GUILD_UPDATED, this.getGuild());
    return true;
  },

  /**
   * VUE D'UN SEUL COUP D'ŒIL (BIRD'S EYE VIEW DASHBOARD 360°)
   * Récapitule instantanément :
   * 1. Trésorerie & argent de la guilde
   * 2. Ressources partagées en stock (par station / base)
   * 3. Tous les blueprints maîtrisés dans l'orga et QUI peut les crafter
   */
  getConsolidatedDashboard() {
    const guild = this.getGuild();
    const members = this.getMembers();

    // 1. Trésorerie
    const treasuryBalanceUEC = Number(guild.treasuryBalance) || 0;

    // 2. Ressources partagées de la guilde (Stockpile)
    const guildStockpile = inventoryService.getItems({ ownerType: 'guild' });
    const totalStockSCU = guildStockpile.reduce((sum, item) => sum + (Number(item.quantitySCU) || 0), 0);
    const estimatedStockValueUEC = guildStockpile.reduce((sum, item) => {
      const val = (Number(item.quantitySCU) || 0) * (item.metadata?.estimatedValueUEC || 15000);
      return sum + val;
    }, 0);

    // 3. Blueprints connus au sein de l'organisation
    // On recense tous les blueprints uniques et les membres capables de les fabriquer
    const guildBlueprintDirectory = new Map();

    members.forEach(member => {
      (member.unlockedBlueprints || []).forEach(bpId => {
        const bp = craftingService.getBlueprintById(bpId);
        if (bp) {
          if (!guildBlueprintDirectory.has(bpId)) {
            guildBlueprintDirectory.set(bpId, {
              blueprint: bp,
              crafters: []
            });
          }
          guildBlueprintDirectory.get(bpId).crafters.push({
            callsign: member.callsign,
            role: member.role
          });
        }
      });
    });

    const knownBlueprintsList = Array.from(guildBlueprintDirectory.values());

    return {
      guildName: guild.name,
      guildTag: guild.tag,
      treasuryBalanceUEC,
      totalStockSCU: Math.round(totalStockSCU * 10) / 10,
      estimatedStockValueUEC: Math.round(estimatedStockValueUEC),
      stockpileItemsCount: guildStockpile.length,
      membersCount: members.length,
      knownBlueprintsCount: knownBlueprintsList.length,
      knownBlueprints: knownBlueprintsList,
      stockpile: guildStockpile
    };
  },

  /**
   * GESTIONNAIRE D'ORDRES LOGISTIQUES (Base Building & Stations)
   * Émettre un ordre de transport de fret
   * @param {Object} orderData 
   */
  createLogisticOrder(orderData) {
    const newOrder = createLogisticOrder(orderData);

    store.set('logistics', prev => ({
      ...prev,
      orders: [...(prev.orders || []), newOrder]
    }));

    eventBus.emit(EVENTS.LOGISTIC_ORDER_CREATED, newOrder);
    return newOrder;
  },

  /**
   * Obtenir tous les ordres logistiques
   * @param {string|null} statusFilter - 'pending' | 'assigned' | 'in_transit' | 'completed'
   */
  getLogisticOrders(statusFilter = null) {
    const orders = store.get('logistics').orders || [];
    if (!statusFilter || statusFilter === 'all') {
      return orders;
    }
    return orders.filter(o => o.status === statusFilter);
  },

  /**
   * Assigner un transporteur à un ordre logistique
   * @param {string} orderId 
   * @param {string} carrierCallsign 
   */
  assignCarrier(orderId, carrierCallsign) {
    let updatedOrder = null;
    store.set('logistics', prev => {
      const orders = (prev.orders || []).map(o => {
        if (o.id === orderId) {
          updatedOrder = {
            ...o,
            status: 'assigned',
            assignedCallsign: carrierCallsign
          };
          return updatedOrder;
        }
        return o;
      });
      return { ...prev, orders };
    });

    if (updatedOrder) {
      eventBus.emit(EVENTS.LOGISTIC_ORDER_STATUS_CHANGED, updatedOrder);
    }
    return updatedOrder;
  },

  /**
   * Finaliser la livraison d'un ordre logistique :
   * Déplace les stocks vers la destination et valide l'ordre
   * @param {string} orderId 
   */
  completeDelivery(orderId) {
    let completedOrder = null;

    store.set('logistics', prev => {
      const orders = (prev.orders || []).map(o => {
        if (o.id === orderId) {
          completedOrder = {
            ...o,
            status: 'completed',
            completedAt: Date.now()
          };
          return completedOrder;
        }
        return o;
      });
      return { ...prev, orders };
    });

    if (completedOrder) {
      // Déplacement effectif dans l'inventaire de guilde :
      // On retire du lieu d'origine et on ajoute au lieu de destination
      inventoryService.consumeResource(completedOrder.resourceCode, completedOrder.quantitySCU, 'guild');
      inventoryService.addItem({
        category: 'refined_ore',
        code: completedOrder.resourceCode,
        name: completedOrder.resourceName,
        quantitySCU: completedOrder.quantitySCU,
        ownerType: 'guild',
        locationId: completedOrder.destinationLocation
      });

      eventBus.emit(EVENTS.LOGISTIC_ORDER_STATUS_CHANGED, completedOrder);
    }
    return completedOrder;
  },

  /**
   * BOURSE & MARCHÉ DE GUILDE
   * Obtenir toutes les annonces de vente consolidées des membres de la guilde
   * @param {Object} filters - { category, scope, status, search, barterOnly }
   * @returns {Array<Object>}
   */
  getGuildMarketListings(filters = {}) {
    const allItems = inventoryService.getItems();
    let listings = allItems.filter(i => Boolean(i.forSale));

    if (filters.category && filters.category !== 'all') {
      if (filters.category === 'crafted') {
        listings = listings.filter(i => i.origin === 'crafted' || (i.category && i.category.startsWith('crafted')));
      } else if (filters.category === 'component') {
        listings = listings.filter(i => i.category === 'component' || i.category === 'crafted_laser' || i.category === 'crafted_module');
      } else {
        listings = listings.filter(i => i.category === filters.category);
      }
    }

    if (filters.scope && filters.scope !== 'all') {
      listings = listings.filter(i => i.saleScope === filters.scope);
    }

    if (filters.status && filters.status !== 'all') {
      listings = listings.filter(i => i.saleStatus === filters.status);
    }

    if (filters.barterOnly) {
      listings = listings.filter(i => Boolean(i.barterOffer && i.barterOffer.trim().length > 0));
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      listings = listings.filter(i =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.code && i.code.toLowerCase().includes(q)) ||
        (i.locationId && i.locationId.toLowerCase().includes(q)) ||
        (i.ownerCallsign && i.ownerCallsign.toLowerCase().includes(q)) ||
        (i.barterOffer && i.barterOffer.toLowerCase().includes(q))
      );
    }

    // Tri : Disponibles en premier, puis les plus récents
    return listings.sort((a, b) => {
      if (a.saleStatus === 'available' && b.saleStatus !== 'available') return -1;
      if (a.saleStatus !== 'available' && b.saleStatus === 'available') return 1;
      return (b.listedAt || 0) - (a.listedAt || 0);
    });
  },

  /**
   * Réserver un article mis en vente par un membre
   * @param {string} itemId 
   * @param {string} buyerCallsign 
   * @returns {Object|null}
   */
  reserveItem(itemId, buyerCallsign = 'COMMANDER') {
    const updated = inventoryService.updateItemSaleListing(itemId, {
      saleStatus: 'reserved',
      reservedByCallsign: buyerCallsign
    });
    if (updated) {
      eventBus.emit(EVENTS.GUILD_UPDATED, this.getGuild());
    }
    return updated;
  },

  /**
   * Annuler la réservation d'un article
   * @param {string} itemId 
   * @returns {Object|null}
   */
  cancelReservation(itemId) {
    const updated = inventoryService.updateItemSaleListing(itemId, {
      saleStatus: 'available',
      reservedByCallsign: null
    });
    if (updated) {
      eventBus.emit(EVENTS.GUILD_UPDATED, this.getGuild());
    }
    return updated;
  },

  /**
   * GÉNÉRATEUR DE MANIFESTE DE COMMERCE INTER-GUILDE
   * Produit un document textuel structuré / Markdown prêt à copier sur Spectrum ou Discord
   * @param {Object} options - { guildTag, contactCallsign }
   * @returns {string} Manifeste formaté
   */
  generateInterGuildManifest(options = {}) {
    const guild = this.getGuild();
    const tag = options.guildTag || guild.tag || 'NMC';
    const name = guild.name || 'Nova Mining Co.';
    const contact = options.contactCallsign || 'VORTEX-1';
    const listings = this.getGuildMarketListings({ scope: 'all' })
      .filter(i => i.saleScope === 'inter_guild' || i.saleScope === 'public');

    const timestamp = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Regrouper par catégorie
    const groups = {
      '⚡ COMPOSANTS DE VAISSEAU & PROPULSION': [],
      '⛏ LASERS & OUTILS DE MINAGE': [],
      '🎯 ARMES & SÉCURITÉ FPS': [],
      '🛡 COMBINAISONS & ARMURES': [],
      '📦 COMMODITÉS & AUTRES LOTS': []
    };

    listings.forEach(item => {
      const cat = (item.category || '').toLowerCase();
      const sub = (item.subCategory || '').toLowerCase();

      if (cat === 'crafted_laser' || sub.includes('mining') || cat.includes('laser')) {
        groups['⛏ LASERS & OUTILS DE MINAGE'].push(item);
      } else if (cat === 'component' || sub.includes('quantum') || sub.includes('shield') || sub.includes('power') || sub.includes('cooler')) {
        groups['⚡ COMPOSANTS DE VAISSEAU & PROPULSION'].push(item);
      } else if (cat === 'weapon' || sub.includes('weapon') || sub.includes('gun')) {
        groups['🎯 ARMES & SÉCURITÉ FPS'].push(item);
      } else if (cat === 'equipment' || sub.includes('armor') || sub.includes('suit')) {
        groups['🛡 COMBINAISONS & ARMURES'].push(item);
      } else {
        groups['📦 COMMODITÉS & AUTRES LOTS'].push(item);
      }
    });

    let manifest = `╔══════════════════════════════════════════════════════════════════════════════╗\n`;
    manifest += `   🌐 MANIFESTE OFFICIEL DE COMMERCE INTER-GUILDE // ${name.toUpperCase()} [${tag}]\n`;
    manifest += `╚══════════════════════════════════════════════════════════════════════════════╝\n`;
    manifest += `📅 Émission : ${timestamp} | Système : Stanton & Pyro\n`;
    manifest += `📡 Fréquence Diplomatique & Négociation : @${contact} (Comm-Link)\n`;
    manifest += `📋 Total des références proposées : ${listings.length} lot(s)\n`;
    manifest += `────────────────────────────────────────────────────────────────────────────────\n\n`;

    if (listings.length === 0) {
      manifest += `* Aucun équipement n'est actuellement coté pour l'export inter-guilde. *\n`;
      return manifest;
    }

    const originLabels = {
      purchased: '🛒 Acheté',
      looted: '🏴‍☠️ Trouvé / Épave',
      crafted: '🛠 Crafté Spécialisé'
    };

    for (const [groupName, items] of Object.entries(groups)) {
      if (items.length === 0) continue;
      manifest += `### ${groupName} (${items.length})\n\n`;
      items.forEach((item, idx) => {
        const originStr = originLabels[item.origin] || item.origin || 'Inconnu';
        const priceStr = item.salePriceUEC > 0 ? `${item.salePriceUEC.toLocaleString('fr-FR')} aUEC` : 'Offre / Devis';
        const statusBadge = item.saleStatus === 'reserved' ? '[RÉSERVÉ]' : '[DISPONIBLE]';
        const sizeGrade = [item.size ? `Taille ${item.size}` : null, item.grade ? `Grade ${item.grade}` : null].filter(Boolean).join(' · ');

        manifest += `${idx + 1}. **${item.name}** ${sizeGrade ? `(${sizeGrade})` : ''} — ${statusBadge}\n`;
        manifest += `   • Provenance : ${originStr} | Qté : ${item.quantityUnits || 1} ex.\n`;
        manifest += `   • Localisation actuelle : 📍 ${item.locationId}\n`;
        manifest += `   • Prix demandé : 💰 **${priceStr}**\n`;
        if (item.barterOffer) {
          manifest += `   • Option Troc / Échange : 🔄 *« ${item.barterOffer} »*\n`;
        }
        manifest += `   • Contact vendeur : Pilote @${item.ownerCallsign || contact}\n\n`;
      });
    }

    manifest += `────────────────────────────────────────────────────────────────────────────────\n`;
    manifest += `🤝 Accord de commerce certifié par la guilde ${name} [${tag}].\n`;
    manifest += `Pour réserver un lot ou proposer un troc, transmettez cet identifiant de lot sur Spectrum ou Discord.\n`;

    return manifest;
  }
};
