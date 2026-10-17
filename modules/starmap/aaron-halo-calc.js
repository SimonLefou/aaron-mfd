// Moteur géométrique et calculateur de coupure Quantum Drive dans l'Aaron Halo
// Conçu pour un guidage 100% visuel haute précision (silencieux)

import { AARON_HALO_BANDS } from '../../data/game/locations.js';
import { QUANTUM_DRIVES } from '../../data/game/components.js';

export const AARON_HALO_RING_ZONES = [
  { bandNumber: 1, innerRadiusMkm: 18.5, outerRadiusMkm: 19.3, density: 'Faible', mineralRichness: 'Basse (Silicates)', color: 'rgba(100, 116, 139, 0.4)' },
  { bandNumber: 2, innerRadiusMkm: 19.3, outerRadiusMkm: 20.1, density: 'Faible', mineralRichness: 'Basse (Métaux communs)', color: 'rgba(100, 116, 139, 0.5)' },
  { bandNumber: 3, innerRadiusMkm: 20.1, outerRadiusMkm: 20.9, density: 'Moyenne', mineralRichness: 'Moyenne (Taranite)', color: 'rgba(56, 189, 248, 0.4)' },
  { bandNumber: 4, innerRadiusMkm: 20.9, outerRadiusMkm: 21.7, density: 'Moyenne-Élevée', mineralRichness: 'Élevée (Bexalite & Borase)', color: 'rgba(56, 189, 248, 0.6)' },
  { bandNumber: 5, innerRadiusMkm: 21.7, outerRadiusMkm: 22.5, density: 'MAXIMALE (Cœur)', mineralRichness: '⭐ Quantainium & Bexalite (Filon Royal)', color: 'rgba(234, 179, 8, 0.85)' },
  { bandNumber: 6, innerRadiusMkm: 22.5, outerRadiusMkm: 23.3, density: 'Élevée (Large)', mineralRichness: 'Laranite & Agricium (Minage Serein)', color: 'rgba(0, 229, 255, 0.7)' },
  { bandNumber: 7, innerRadiusMkm: 23.3, outerRadiusMkm: 24.1, density: 'Moyenne-Élevée', mineralRichness: 'Agricium & Hephaestanite', color: 'rgba(0, 229, 255, 0.5)' },
  { bandNumber: 8, innerRadiusMkm: 24.1, outerRadiusMkm: 24.9, density: 'Moyenne', mineralRichness: 'Beryl & Diamant', color: 'rgba(148, 163, 184, 0.5)' },
  { bandNumber: 9, innerRadiusMkm: 24.9, outerRadiusMkm: 25.7, density: 'Faible', mineralRichness: 'Corindon & Tungstène', color: 'rgba(100, 116, 139, 0.4)' },
  { bandNumber: 10, innerRadiusMkm: 25.7, outerRadiusMkm: 26.5, density: 'Bordure Extérieure', mineralRichness: 'Épaves & Astéroïdes épars', color: 'rgba(71, 85, 105, 0.3)' }
];

/**
 * Calcule les paramètres d'interception et le timing de coupure du Quantum Drive
 */
export function calculateQuantumDrop({
  routeId = 'arccorp_hurl3',
  driveId = 'atlas_s1',
  customSpeedKmS = null
}) {
  const route = AARON_HALO_BANDS.find(r => r.id === routeId) || AARON_HALO_BANDS[0];
  const drive = QUANTUM_DRIVES.find(d => d.id === driveId) || QUANTUM_DRIVES[0];

  const speedKmS = customSpeedKmS || drive.speed || 152000;
  const targetDistanceMkm = route.targetDistanceMkm;
  const targetDistanceKm = targetDistanceMkm * 1000000;
  const totalDistanceKm = (route.totalDistanceMkm || 35.0) * 1000000;

  // Calcul du temps de trajet en secondes
  // Prise en compte du temps de spool et de calibrage
  const flightSeconds = Math.max(10, Math.round(targetDistanceKm / speedKmS) + Math.round(drive.spooledTime || 4));
  const totalFlightSeconds = Math.round(totalDistanceKm / speedKmS) + Math.round(drive.spooledTime || 4);

  // Découpage en jalons visuels de progression
  const warningWindowSeconds = 12; // Alerte visuelle orange à 12 secondes
  const cutoffWindowSeconds = 3;   // Alerte visuelle rouge flash à 3 secondes de la cible

  return {
    route,
    drive,
    speedKmS,
    targetDistanceMkm,
    targetDistanceKm,
    totalDistanceKm,
    flightSeconds,
    totalFlightSeconds,
    warningWindowSeconds,
    cutoffWindowSeconds,
    formattedTargetDistance: `${targetDistanceMkm.toFixed(2)} M km (${targetDistanceKm.toLocaleString()} km)`,
    formattedFlightTime: formatDuration(flightSeconds),
    targetBand_fr: route.band_fr || 'Bande 5',
    targetBand_en: route.band_en || 'Band 5',
    dropInstruction_fr: route.desc_fr || `Coupez le Quantum Drive à ${targetDistanceMkm} M km de l'origine.`,
    dropInstruction_en: route.desc_en || `Cut Quantum Drive at ${targetDistanceMkm} M km from departure origin.`
  };
}

/**
 * Évalue l'état visuel du compte à rebours de coupure (100% silencieux)
 */
export function evaluateDropCountdownProgress({
  elapsedSeconds = 0,
  totalFlightSeconds = 60,
  warningThresholdSeconds = 12,
  cutoffThresholdSeconds = 3
}) {
  const remainingSeconds = Math.max(0, totalFlightSeconds - elapsedSeconds);
  const progressRatio = Math.min(1.0, elapsedSeconds / totalFlightSeconds);
  const progressPercent = Math.round(progressRatio * 100);

  let visualPhase = 'cruise'; // 'cruise' | 'warning' | 'imminent' | 'cut_now' | 'overshot'
  let bannerClass = 'banner-cruise';
  let bannerText = 'NAVIGATION QUANTUM EN COURS';
  let bannerSub = `Arrivée dans l'anneau dans ${formatDuration(remainingSeconds)}`;

  if (remainingSeconds === 0) {
    visualPhase = 'cut_now';
    bannerClass = 'banner-cut-now blink-fast';
    bannerText = '🛑 COUPEZ LE QUANTUM DRIVE MAINTENANT ! (TOUCHE B)';
    bannerSub = 'POSITION CIBLE ATTEINTE : SORTIE DANS L\'ANNEAU D\'AARON';
  } else if (remainingSeconds <= cutoffThresholdSeconds) {
    visualPhase = 'imminent';
    bannerClass = 'banner-imminent blink-fast';
    bannerText = `⚡ DÉCÉLÉRATION IMMINENTE DANS ${remainingSeconds} SECONDES !`;
    bannerSub = 'DOIGT SUR LA COMMANDE DE DÉCONNEXION QT';
  } else if (remainingSeconds <= warningThresholdSeconds) {
    visualPhase = 'warning';
    bannerClass = 'banner-warning';
    bannerText = `⚠️ ENTRÉE DANS LA ZONE D'APPROCHE (${remainingSeconds}s)`;
    bannerSub = 'Préparez l\'extinction du moteur Quantum';
  }

  return {
    elapsedSeconds,
    remainingSeconds,
    progressPercent,
    visualPhase,
    bannerClass,
    bannerText,
    bannerSub,
    formattedRemainingTime: formatDuration(remainingSeconds)
  };
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}
