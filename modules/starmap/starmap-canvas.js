// Moteur de rendu Radar Orbital 2D Canvas interactif (Stanton & Pyro)
import { STANTON_SYSTEM_COORDINATES, PYRO_SYSTEM_COORDINATES } from './starmap-service.js';
import { AARON_HALO_BANDS } from '../../data/game/locations.js';

export class StarmapCanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.system = 'stanton';
    this.activeRouteId = 'arccorp_hurl3';

    // Vue & Caméra (Pan & Zoom)
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Animation & Particules
    this.animationFrameId = null;
    this.time = 0;
    this.asteroidParticles = this.generateHaloParticles(220);

    this.initEventListeners();
    this.startRenderLoop();
  }

  generateHaloParticles(count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Rayon concentré dans l'Aaron Halo (21.0 à 25.5 M km normalisé)
      const distRatio = Math.random();
      const isBand5 = distRatio >= 0.4 && distRatio <= 0.6;
      particles.push({
        angle,
        speed: (0.0003 + Math.random() * 0.0005) * (Math.random() > 0.5 ? 1 : -1),
        distRatio,
        isBand5,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.6 + 0.3
      });
    }
    return particles;
  }

  setSystem(systemId) {
    this.system = systemId;
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1.0;
  }

  setActiveRoute(routeId) {
    this.activeRouteId = routeId;
  }

  zoomIn() {
    this.zoom = Math.min(3.5, this.zoom * 1.25);
  }

  zoomOut() {
    this.zoom = Math.max(0.4, this.zoom / 1.25);
  }

  resetView() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  initEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.canvas.style.cursor = 'grab';
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }, { passive: false });
  }

  startRenderLoop() {
    const loop = () => {
      this.time += 1;
      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  render() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2 + this.panX;
    const centerY = height / 2 + this.panY;

    // Nettoyage fond spatial
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Grille radar subtile
    this.drawRadarGrid(ctx, centerX, centerY, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(this.zoom, this.zoom);

    if (this.system === 'stanton') {
      this.renderStanton(ctx);
    } else {
      this.renderPyro(ctx);
    }

    ctx.restore();
  }

  drawRadarGrid(ctx, cx, cy, w, h) {
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.05)';
    ctx.lineWidth = 1;

    // Cercles de distance
    for (let r = 80; r < 600; r += 80) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * this.zoom, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes orthogonaux
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();
  }

  renderStanton(ctx) {
    const data = STANTON_SYSTEM_COORDINATES;
    const scale = 3.6; // Facteur d'échelle Mkm -> pixels

    // 1. ANNEAU AARON HALO (CEINTURE D'ASTÉROÏDES)
    const haloInner = data.aaronHalo.innerRadiusMkm * scale;
    const haloOuter = data.aaronHalo.outerRadiusMkm * scale;
    const haloMid = data.aaronHalo.band5RadiusMkm * scale;

    // Halo Glow
    const haloGrad = ctx.createRadialGradient(0, 0, haloInner, 0, 0, haloOuter);
    haloGrad.addColorStop(0, 'rgba(0, 229, 255, 0.03)');
    haloGrad.addColorStop(0.35, 'rgba(234, 179, 8, 0.12)'); // Bande 5 dorée
    haloGrad.addColorStop(0.65, 'rgba(0, 229, 255, 0.08)');
    haloGrad.addColorStop(1, 'rgba(0, 229, 255, 0.02)');

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, haloOuter, 0, Math.PI * 2);
    ctx.arc(0, 0, haloInner, 0, Math.PI * 2, true);
    ctx.fill();

    // Ligne directrice de la Bande 5 (Dorée scintillante)
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, haloMid, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Particules de l'anneau
    for (const p of this.asteroidParticles) {
      p.angle += p.speed;
      const r = haloInner + p.distRatio * (haloOuter - haloInner);
      const px = Math.cos(p.angle) * r;
      const py = Math.sin(p.angle) * r;

      ctx.fillStyle = p.isBand5 ? `rgba(250, 204, 21, ${p.alpha})` : `rgba(186, 230, 253, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label Aaron Halo
    ctx.fillStyle = '#facc15';
    ctx.font = '10px monospace';
    ctx.fillText('ANNEAU AARON HALO (BANDE 5)', haloMid + 8, -6);

    // 2. ORBITES ET PLANÈTES MAJEURES
    for (const b of data.bodies) {
      const orbRadius = b.distMkm * scale;

      // Cercle d'orbite
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Position planète
      const px = Math.cos(b.angle) * orbRadius;
      const py = Math.sin(b.angle) * orbRadius;

      // Planète
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(px, py, b.radius, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(b.name, px + b.radius + 5, py + 4);
    }

    // 3. VECTEUR DE SAUT ACTIF (SI APPLICABLE)
    this.drawActiveVector(ctx, scale);

    // 4. ÉTOILE CENTRALE (STANTON)
    const star = data.star;
    const sunGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, star.radius * 2.2);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.4, star.color);
    sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(0, 0, star.radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('STANTON', -24, star.radius + 14);
  }

  drawActiveVector(ctx, scale) {
    const route = AARON_HALO_BANDS.find(r => r.id === this.activeRouteId);
    if (!route) return;

    // ArcCorp est à ~34.2 Mkm, HUR-L3 est à proximité de Hurston
    const startX = Math.cos(3.55) * 34.2 * scale;
    const startY = Math.sin(3.55) * 34.2 * scale;
    const endX = Math.cos(0.95) * 22.0 * scale;
    const endY = Math.sin(0.95) * 22.0 * scale;

    // Ligne de trajectoire cyan pulsante
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Point d'interception de coupure dans l'anneau
    const dropRatio = Math.min(0.9, route.targetDistanceMkm / (route.totalDistanceMkm || 32.5));
    const dropX = startX + (endX - startX) * dropRatio;
    const dropY = startY + (endY - startY) * dropRatio;

    // Balise de coupure clignotante
    const pulseSize = 6 + Math.sin(this.time * 0.08) * 2;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(dropX, dropY, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(dropX, dropY, pulseSize + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`🛑 DROP : ${route.targetDistanceMkm}M km`, dropX + 12, dropY - 6);
  }

  renderPyro(ctx) {
    const data = PYRO_SYSTEM_COORDINATES;
    const scale = 2.4;

    // Étoile Flare de Pyro
    const star = data.star;
    const sunGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, star.radius * 2.5);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.35, star.color);
    sunGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(0, 0, star.radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('PYRO (ÉTOILE FLARE)', -50, star.radius + 16);

    // Planètes de Pyro
    for (const b of data.bodies) {
      const orbRadius = b.distMkm * scale;

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.beginPath();
      ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
      ctx.stroke();

      const px = Math.cos(b.angle) * orbRadius;
      const py = Math.sin(b.angle) * orbRadius;

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(px, py, b.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fecaca';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(b.name, px + b.radius + 5, py + 4);
    }

    // Jump Point vers Stanton
    const jp = data.jumpPoints[0];
    const jpx = Math.cos(jp.angle) * jp.distMkm * scale;
    const jpy = Math.sin(jp.angle) * jp.distMkm * scale;

    ctx.fillStyle = jp.color;
    ctx.beginPath();
    ctx.arc(jpx, jpy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(jp.name, jpx + 10, jpy + 4);
  }
}
