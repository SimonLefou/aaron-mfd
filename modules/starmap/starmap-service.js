// Service Métier de Cartographie Spatiale & Visualisateur Aaron Halo (Star Citizen 4.0+)
import { calculateQuantumDrop, evaluateDropCountdownProgress, AARON_HALO_RING_ZONES } from './aaron-halo-calc.js';
import { AARON_HALO_BANDS } from '../../data/game/locations.js';
import { QUANTUM_DRIVES } from '../../data/game/components.js';
import { eventBus } from '../core/event-bus.js';

export const STANTON_SYSTEM_COORDINATES = {
  star: { name: 'Stanton', x: 0, y: 0, radius: 16, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  bodies: [
    { id: 'hurston', name: 'Hurston', distMkm: 14.8, angle: 0.45, radius: 8, color: '#d97706', moons: ['Arial', 'Aberdeen', 'Magda', 'Ita'] },
    { id: 'crusader', name: 'Crusader', distMkm: 23.5, angle: 1.95, radius: 12, color: '#f59e0b', moons: ['Yela', 'Daymar', 'Cellin'] },
    { id: 'arccorp', name: 'ArcCorp', distMkm: 34.2, angle: 3.55, radius: 8, color: '#ef4444', moons: ['Lyria', 'Wala'] },
    { id: 'microtech', name: 'microTech', distMkm: 57.4, angle: 5.10, radius: 9, color: '#06b6d4', moons: ['Calliope', 'Clio', 'Euterpe'] }
  ],
  aaronHalo: {
    innerRadiusMkm: 21.0,
    outerRadiusMkm: 25.5,
    band5RadiusMkm: 22.1,
    glowColor: 'rgba(0, 229, 255, 0.25)'
  },
  jumpPoints: [
    { id: 'jp_pyro', name: 'Point de Saut vers Pyro', distMkm: 48.0, angle: 2.70, color: '#ff0055' },
    { id: 'jp_magnus', name: 'Point de Saut vers Magnus', distMkm: 62.0, angle: 0.90, color: '#38bdf8' }
  ]
};

export const PYRO_SYSTEM_COORDINATES = {
  star: { name: 'Pyro Flare', x: 0, y: 0, radius: 22, color: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' },
  bodies: [
    { id: 'pyro1', name: 'Pyro I (Akiro)', distMkm: 8.5, angle: 0.2, radius: 5, color: '#78716c' },
    { id: 'pyro2', name: 'Pyro II (Monox)', distMkm: 17.2, angle: 1.4, radius: 7, color: '#ea580c' },
    { id: 'pyro3', name: 'Pyro III (Bloom)', distMkm: 28.5, angle: 2.8, radius: 8, color: '#dc2626' },
    { id: 'pyro4', name: 'Pyro IV', distMkm: 42.0, angle: 4.1, radius: 6, color: '#ca8a04' },
    { id: 'pyro5', name: 'Pyro V', distMkm: 61.5, angle: 5.3, radius: 14, color: '#b45309' },
    { id: 'pyro6', name: 'Pyro VI (Terminus & Ruin Station)', distMkm: 84.0, angle: 3.6, radius: 10, color: '#991b1b' }
  ],
  jumpPoints: [
    { id: 'jp_stanton', name: 'Point de Saut vers Stanton', distMkm: 72.0, angle: 0.8, color: '#00e5ff' }
  ]
};

class StarmapService {
  constructor() {
    this.state = {
      activeSystem: 'stanton', // 'stanton' | 'pyro'
      activeRouteId: 'arccorp_hurl3',
      activeDriveId: 'atlas_s1',
      countdownActive: false,
      elapsedSeconds: 0,
      totalSeconds: 60
    };

    this.timer = null;
  }

  getState() {
    return { ...this.state };
  }

  setSystem(systemId) {
    if (systemId === 'stanton' || systemId === 'pyro') {
      this.state.activeSystem = systemId;
      eventBus.emit('STARMAP_SYSTEM_CHANGED', this.state.activeSystem);
    }
  }

  setRoute(routeId) {
    if (AARON_HALO_BANDS.some(r => r.id === routeId)) {
      this.state.activeRouteId = routeId;
      this.resetCountdown();
      eventBus.emit('STARMAP_ROUTE_CHANGED', this.state.activeRouteId);
    }
  }

  setQuantumDrive(driveId) {
    if (QUANTUM_DRIVES.some(d => d.id === driveId)) {
      this.state.activeDriveId = driveId;
      this.resetCountdown();
      eventBus.emit('STARMAP_DRIVE_CHANGED', this.state.activeDriveId);
    }
  }

  getLiveCalculation() {
    return calculateQuantumDrop({
      routeId: this.state.activeRouteId,
      driveId: this.state.activeDriveId
    });
  }

  startCountdown(onProgress) {
    if (this.state.countdownActive) return;

    const calc = this.getLiveCalculation();
    this.state.totalSeconds = calc.flightSeconds;
    this.state.elapsedSeconds = 0;
    this.state.countdownActive = true;

    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.state.elapsedSeconds += 1;
      const progress = evaluateDropCountdownProgress({
        elapsedSeconds: this.state.elapsedSeconds,
        totalFlightSeconds: this.state.totalSeconds,
        warningThresholdSeconds: calc.warningWindowSeconds,
        cutoffThresholdSeconds: calc.cutoffWindowSeconds
      });

      if (onProgress) onProgress(progress);
      eventBus.emit('STARMAP_DROP_TICK', progress);

      if (this.state.elapsedSeconds >= this.state.totalSeconds) {
        clearInterval(this.timer);
        this.timer = null;
        this.state.countdownActive = false;
        eventBus.emit('STARMAP_DROP_FINISHED', progress);
      }
    }, 1000);

    const initialProgress = evaluateDropCountdownProgress({
      elapsedSeconds: 0,
      totalFlightSeconds: this.state.totalSeconds
    });
    if (onProgress) onProgress(initialProgress);
  }

  stopCountdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state.countdownActive = false;
  }

  resetCountdown() {
    this.stopCountdown();
    this.state.elapsedSeconds = 0;
    const calc = this.getLiveCalculation();
    this.state.totalSeconds = calc.flightSeconds;
  }
}

export const starmapService = new StarmapService();
