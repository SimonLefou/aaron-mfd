// Service Métier de Salvage & Recyclage (Star Citizen 4.0+)
import { calculateSalvageYield, evaluateBufferState } from './salvage-calc.js';
import { SALVAGE_SHIPS, SALVAGE_SCRAPERS, SALVAGE_WRECKS, SALVAGE_COMMODITIES } from '../../data/game/salvage.js';
import { inventoryService } from '../inventory/inventory-service.js';
import { store } from '../core/state.js';
import { eventBus } from '../core/event-bus.js';

class SalvageService {
  constructor() {
    this.state = {
      activeShipId: 'vulture',
      activeScraperId: 'abrade_s1',
      activeWreckId: 'wreck_cutlass_black',
      hullIntegrity: 85,
      currentBufferSCU: 3.5,
      cargoHoldRMC_SCU: 0,
      cargoHoldCM_SCU: 0,
      isScrapingActive: false
    };

    this.scrapingInterval = null;
  }

  getState() {
    return { ...this.state };
  }

  setShip(shipId) {
    if (SALVAGE_SHIPS.some(s => s.id === shipId)) {
      this.state.activeShipId = shipId;
      eventBus.emit('SALVAGE_STATE_CHANGED', this.getState());
    }
  }

  setScraper(scraperId) {
    if (SALVAGE_SCRAPERS.some(s => s.id === scraperId)) {
      this.state.activeScraperId = scraperId;
      eventBus.emit('SALVAGE_STATE_CHANGED', this.getState());
    }
  }

  setWreck(wreckId) {
    if (SALVAGE_WRECKS.some(w => w.id === wreckId)) {
      this.state.activeWreckId = wreckId;
      eventBus.emit('SALVAGE_STATE_CHANGED', this.getState());
    }
  }

  setHullIntegrity(integrity) {
    this.state.hullIntegrity = Math.max(5, Math.min(100, Number(integrity) || 85));
    eventBus.emit('SALVAGE_STATE_CHANGED', this.getState());
  }

  getLiveCalculation() {
    const yieldCalc = calculateSalvageYield({
      wreckId: this.state.activeWreckId,
      hullIntegrity: this.state.hullIntegrity,
      scraperId: this.state.activeScraperId,
      shipId: this.state.activeShipId
    });

    const bufferState = evaluateBufferState({
      currentBufferSCU: this.state.currentBufferSCU,
      bufferCapacitySCU: yieldCalc.bufferSCU
    });

    return {
      ...yieldCalc,
      bufferState
    };
  }

  /**
   * Vide le tampon interne vers la soute physique (éjection de caisses SCU)
   */
  ejectBufferToCargo() {
    if (this.state.currentBufferSCU <= 0) {
      return { success: false, message: 'Le tampon de broyage est déjà vide.' };
    }

    const ejectedSCU = Number(this.state.currentBufferSCU.toFixed(2));
    this.state.cargoHoldRMC_SCU = Number((this.state.cargoHoldRMC_SCU + ejectedSCU).toFixed(2));
    this.state.currentBufferSCU = 0;

    eventBus.emit('SALVAGE_STATE_CHANGED', this.getState());
    return {
      success: true,
      ejectedSCU,
      message: `${ejectedSCU} SCU de RMC conditionnés et transférés sur la grille de soute.`
    };
  }

  /**
   * Action : Garder un lot de RMC pour l'Atelier de Crafting
   */
  reserveRmcForCraft(scuAmount = null) {
    const calc = this.getLiveCalculation();
    const amountToReserve = scuAmount !== null ? scuAmount : Math.min(12, calc.rmcSCU);

    if (amountToReserve <= 0) return { success: false, message: 'Quantité invalide' };

    const newItem = {
      id: `salvage_rmc_${Date.now()}`,
      name: 'Matériau Composite Recyclé (RMC)',
      material: 'rmc',
      category: 'salvage',
      origin: 'salvage',
      scu: amountToReserve,
      purity: 100,
      materialQuality: 820, // RMC de haute qualité
      location: 'Hangar Principal / Vulture Hold',
      intendedUse: 'craft',
      reservedForCraft: true,
      unitPriceAuec: calc.rmcPrice,
      totalValueAuec: Math.round(amountToReserve * calc.rmcPrice)
    };

    inventoryService.addItem(newItem);
    return {
      success: true,
      scu: amountToReserve,
      message: `${amountToReserve} SCU de RMC réservés en inventaire pour l'Atelier de Crafting.`
    };
  }

  /**
   * Action : Vendre le RMC immédiatement au TDD
   */
  sellRmcInstant(scuAmount = null) {
    const calc = this.getLiveCalculation();
    const amountToSell = scuAmount !== null ? scuAmount : calc.rmcSCU;
    const revenue = Math.round(amountToSell * calc.rmcPrice);

    inventoryService.creditBalance(revenue);
    return {
      success: true,
      revenue,
      message: `Vente de ${amountToSell} SCU de RMC au TDD pour +${revenue.toLocaleString()} aUEC.`
    };
  }

  /**
   * Action : Vendre les Matériaux de Construction (CM)
   */
  sellCmInstant(scuAmount = null) {
    const calc = this.getLiveCalculation();
    const amountToSell = scuAmount !== null ? scuAmount : calc.cmSCU;
    const revenue = Math.round(amountToSell * calc.cmPrice);

    inventoryService.creditBalance(revenue);
    return {
      success: true,
      revenue,
      message: `Vente de ${amountToSell} SCU de Matériaux de Construction pour +${revenue.toLocaleString()} aUEC.`
    };
  }
}

export const salvageService = new SalvageService();
