// ============================================================================
// 🛸 AARON MFD — APPLICATION CONTROLLER OFFICIEL
// Strictement aligné sur les maquettes visuelles AARON MFD & Star Citizen 4.x
// ============================================================================

import {
  fleetService,
  ALL_SHIPS,
  getShip,
  totalScu,
  hardpointsOf,
  moduleSlotsFor,
  configState,
  getLaser,
  getModule,
  inventoryService,
  miningCalc,
  FRONTIER_MINEABLES,
  getFrontierPreset,
  craftingService,
  tradeService,
  uexService,
  coopService,
  guildService,
  authService,
  salvageService,
  starmapService,
  CITIZEN_SPECIALTIES,
  store,
  eventBus,
  EVENTS
} from './modules/index.js';

import { StarmapCanvasRenderer } from './modules/starmap/starmap-canvas.js';
import { MINERALS } from './data/game/minerals.js';

// Exposer pour inspection et tests
if (typeof window !== 'undefined') {
  window.AaronMFD = window.VerseOps = {
    fleetService,
    inventoryService,
    miningCalc,
    FRONTIER_MINEABLES,
    getFrontierPreset,
    craftingService,
    tradeService,
    uexService,
    coopService,
    guildService,
    authService,
    store,
    eventBus
  };
}

// ============================================================================
// 1. RETOUR HAPTIQUE TACTILE (AUDIO TOTALEMENT DÉSACTIVÉ / SUPPRIMÉ)
// ============================================================================
function triggerHaptic(ms = 10) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function' && navigator.userActivation?.hasBeenActive) {
    try { navigator.vibrate(ms); } catch {}
  }
}

// ============================================================================
// 2. TOAST NOTIFICATIONS
// ============================================================================
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// ============================================================================
// 3. TIROIR D'INSPECTION (SLIDE-OVER)
// ============================================================================
function openInspector(options = {}) {
  const inspector = document.getElementById('slideOverInspector');
  if (!inspector) return;

  const titleEl = document.getElementById('inspectorTitle');
  const subtitleEl = document.getElementById('inspectorSubtitle');
  const bodyEl = document.getElementById('inspectorBody');
  const footerEl = document.getElementById('inspectorFooter');

  if (titleEl) titleEl.textContent = options.title || 'Détails';
  if (subtitleEl) subtitleEl.textContent = options.subtitle || 'VERSE OPS';

  if (bodyEl) {
    if (typeof options.body === 'string') {
      bodyEl.innerHTML = options.body;
    } else if (options.body instanceof HTMLElement) {
      bodyEl.innerHTML = '';
      bodyEl.appendChild(options.body);
    }
  }

  if (footerEl) {
    footerEl.innerHTML = options.footer || '';
  }

  if (options.wide) {
    inspector.classList.add('wide');
  } else {
    inspector.classList.remove('wide');
  }

  inspector.classList.add('open');
  inspector.setAttribute('aria-hidden', 'false');
  triggerHaptic(12);
}

function closeInspector() {
  const inspector = document.getElementById('slideOverInspector');
  if (!inspector) return;
  inspector.classList.remove('open');
  inspector.classList.remove('wide');
  inspector.setAttribute('aria-hidden', 'true');
}

// ============================================================================
// 4. ROUTEUR DES 8 ÉCRANS
// ============================================================================
let currentActiveApp = 'dashboard';

const APP_MAPPING = {
  dashboard: 'viewDashboard',
  fleet: 'viewFleet',
  inventory: 'viewInventory',
  mining: 'viewMining',
  salvage: 'viewSalvage',
  crafting: 'viewCrafting',
  trade: 'viewTrade',
  starmap: 'viewStarmap',
  fleets: 'viewFleets',
  guild: 'viewGuild',
  profile: 'viewProfile'
};

function setActiveApp(appId) {
  if (!APP_MAPPING[appId]) return;
  currentActiveApp = appId;

  // 1. Masquer les vues
  document.querySelectorAll('.screen-view').forEach(view => {
    view.classList.remove('active');
  });

  // 2. Afficher la vue demandée
  const targetView = document.getElementById(APP_MAPPING[appId]);
  if (targetView) targetView.classList.add('active');

  // 3. Mettre à jour la sidebar
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-app') === appId);
  });

  triggerHaptic(10);

  // 4. Déclencher le rendu de l'écran
  switch (appId) {
    case 'fleet':
      renderFleetHangar();
      break;
    case 'inventory':
      renderInventoryTable();
      break;
    case 'mining':
      renderMiningScreen();
      break;
    case 'salvage':
      renderSalvageScreen();
      break;
    case 'crafting':
      renderCraftingCatalog();
      break;
    case 'trade':
      renderTradeCards();
      break;
    case 'starmap':
      renderStarmapScreen();
      break;
    case 'fleets':
      renderFleetsScreen();
      break;
    case 'guild':
      renderGuildContent();
      break;
    case 'profile':
      renderProfileScreen();
      break;
  }

  const workspace = document.getElementById('verseopsWorkspace');
  if (workspace) workspace.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// 5. RENDU : FLOTTE & LOADOUTS (COMPOSITION, ÉTAT & CONFIGURATION)
// Strictement aligné sur FleetScreen.js & ShipConfigScreen.js (AARON MFD)
// ============================================================================
let fleetFilters = {
  search: '',
  role: 'all' // 'all', 'mining', 'support', 'combat'
};

let catalogFilters = {
  search: '',
  role: 'tous', // 'tous', 'mining', 'cargo'
  isOpen: false
};

let editingShipUid = null;
let activeTurretTab = 0;
let shipConfigDraft = null;

const ROLE_LABELS = {
  mining: ['Minage', 'amber', 'gold'],
  cargo: ['Support', 'green', 'green'],
  escort: ['Combat', 'red', 'red'],
  combat: ['Combat', 'red', 'red'],
  salvage: ['Salvage', 'purple', 'purple'],
  exploration: ['Exploration', 'blue', 'blue']
};

/**
 * Normalisation des accents et de la casse
 */
function stripAccents(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Recherche intelligente de vaisseau par mot ou préfixe de mot.
 * Évite les faux positifs (ex: "argo" ne doit pas matcher "cargo" dans type_fr).
 */
function matchShipSearch(query, ship, nickname = '') {
  if (!query) return true;
  const cleanQ = stripAccents(query).trim();
  const qTokens = cleanQ.split(/\s+/).filter(Boolean);
  if (qTokens.length === 0) return true;

  const rawText = `${ship.name || ''} ${ship.manufacturer || ''} ${ship.type_fr || ''} ${ship.id || ''} ${nickname || ''} ${ship.role || ''}`;
  const cleanText = stripAccents(rawText);
  const allWords = cleanText.split(/[^a-z0-9]+/i).filter(Boolean);

  return qTokens.every(token => {
    return allWords.some(w => w.startsWith(token));
  });
}

/**
 * Rendu de la grille des vaisseaux possédés dans le hangar
 */
function renderFleetHangar() {
  const grid = document.getElementById('fleetCardsGrid');
  if (!grid) return;

  const fleet = fleetService.getShips();
  const totals = fleetService.getFleetTotals();

  // Mettre à jour les totaux en haut de page
  const headerSubtitle = document.getElementById('fleetHeaderSubtitle');
  if (headerSubtitle) {
    headerSubtitle.textContent = `${totals.totalShips} vaisseaux · ${totals.totalCargo.toLocaleString('fr-FR')} SCU au total · ${totals.turrets} têtes/tourelles de minage · ${totals.crewNeeded} postes à pourvoir`;
  }

  // Mettre à jour les compteurs des filtres
  const countAll = fleet.length;
  const countMining = fleet.filter(e => getShip(e.shipId)?.role === 'mining').length;
  const countSupport = fleet.filter(e => getShip(e.shipId)?.role === 'cargo').length;
  const countCombat = fleet.filter(e => getShip(e.shipId)?.role === 'escort').length;
  const countSalvage = fleet.filter(e => getShip(e.shipId)?.role === 'salvage').length;
  const countExplo = fleet.filter(e => getShip(e.shipId)?.role === 'exploration').length;

  const cAllEl = document.getElementById('countFleetAll');
  const cMinEl = document.getElementById('countFleetMining');
  const cSupEl = document.getElementById('countFleetSupport');
  const cComEl = document.getElementById('countFleetCombat');
  const cSalEl = document.getElementById('countFleetSalvage');
  const cExpEl = document.getElementById('countFleetExplo');

  if (cAllEl) cAllEl.textContent = countAll;
  if (cMinEl) cMinEl.textContent = countMining;
  if (cSupEl) cSupEl.textContent = countSupport;
  if (cComEl) cComEl.textContent = countCombat;
  if (cSalEl) cSalEl.textContent = countSalvage;
  if (cExpEl) cExpEl.textContent = countExplo;

  // Filtrage des vaisseaux du hangar
  const filtered = fleet.filter(entry => {
    const s = getShip(entry.shipId);
    if (!s) return false;

    // Filtre rôle
    if (fleetFilters.role !== 'all') {
      if (fleetFilters.role === 'mining' && s.role !== 'mining') return false;
      if ((fleetFilters.role === 'support' || fleetFilters.role === 'cargo') && s.role !== 'cargo') return false;
      if ((fleetFilters.role === 'combat' || fleetFilters.role === 'escort') && s.role !== 'escort') return false;
      if (fleetFilters.role === 'salvage' && s.role !== 'salvage') return false;
      if ((fleetFilters.role === 'exploration' || fleetFilters.role === 'explo') && s.role !== 'exploration') return false;
    }

    // Filtre texte intelligent (par mot / préfixe pour éviter que 'argo' matche 'cargo')
    if (fleetFilters.search) {
      if (!matchShipSearch(fleetFilters.search, s, entry.nickname)) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-dim); background: var(--bg-card); border-radius: var(--card-radius); border: 1px dashed var(--border-medium);">
        <p style="font-size: 1.1rem; color: #fff; margin-bottom: 8px;">Aucun vaisseau ne correspond à vos filtres.</p>
        <p style="font-size: 0.85rem;">Utilisez « + Composer ma flotte » pour enrichir votre hangar depuis le catalogue.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(entry => {
    const s = getShip(entry.shipId);
    const [roleLabel, roleBadge, glowColor] = ROLE_LABELS[s.role] || ['Support', 'cyan', 'green'];
    const st = configState(entry, s);
    const isAct = Boolean(entry.active);
    const turrets = entry.config?.turrets || [];

    return `
      <div class="ship-card ${isAct ? 'active-ship' : ''}" data-ship-uid="${entry.uid}">
        <div class="ship-preview-glow ${glowColor}">
          <svg class="ship-icon-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L10 8L3 13L3 15L10 13L10 18L7 20L7 22L12 20.5L17 22L17 20L14 18L14 13L21 15L21 13L14 8Z"/>
          </svg>
        </div>

        <div class="ship-card-header-row">
          <div class="ship-card-title">${entry.nickname}</div>
          ${isAct
            ? '<span class="vo-badge green" style="font-size:0.68rem; padding:2px 6px; font-weight:700;">ACTIF</span>'
            : `<button type="button" class="vo-badge cyan btn-make-active-chip" data-uid="${entry.uid}" style="font-size:0.68rem; padding:2px 6px; cursor:pointer; background:rgba(14,165,233,0.15); border:1px solid rgba(14,165,233,0.35);" title="Définir comme vaisseau actif">Rendre actif</button>`
          }
        </div>

        <div class="ship-card-model">${s.name} <span style="color:var(--text-dim); font-size:0.7rem;">(${s.manufacturer || 'RSI'})</span></div>

        <div class="ship-card-badges">
          <span class="vo-badge ${roleBadge}">${roleLabel}</span>
          <span class="vo-badge amber">${totalScu(s)} SCU</span>
          <span class="vo-badge ${st.cls}">${st.label}</span>
        </div>

        ${turrets.length > 0 ? `
          <div class="ship-card-loadout" style="line-height:1.6; margin-bottom:6px;">
            ${turrets.map((t, i) => {
              const tLabel = turrets.length > 1 ? `T${i + 1}` : 'Tête';
              const lName = fleetService.getLaserName(t.laserId) || '—';
              const opStr = t.operator ? ` · ${t.operator}` : '';
              return `<div>${tLabel} : <span style="color:#d6e2f0; font-weight:600;">${lName}</span><span style="color:var(--text-dim);">${opStr}</span></div>`;
            }).join('')}
          </div>
        ` : `
          <div style="font-size:0.75rem; color:var(--text-dim); margin:6px 0;">
            ${s.role === 'cargo' ? 'Support fret & logistique' :
              s.role === 'escort' ? 'Défense & escorte armée' :
              s.role === 'salvage' ? 'Démantèlement & recyclage' :
              s.role === 'exploration' ? 'Reconnaissance & exploration' :
              'Vaisseau opérationnel'}
          </div>
        `}

        <div style="font-size:0.72rem; color:var(--text-dim); margin-top:auto;">
          🛡 Assurance : <span style="color:#e2e8f0;">${entry.insurance || 'Achat in-game'}</span>
        </div>

        <div class="ship-card-actions">
          <button type="button" class="ship-act-btn primary btn-config-ship" data-uid="${entry.uid}">⚙ Configurer</button>
          <button type="button" class="ship-act-btn btn-duplicate-ship" data-uid="${entry.uid}" title="Dupliquer ce vaisseau">📋 Dupliquer</button>
          <button type="button" class="ship-act-btn danger btn-remove-ship" data-uid="${entry.uid}" title="Retirer de la flotte">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  // Liaison des actions sur chaque carte
  grid.querySelectorAll('.btn-make-active-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-uid');
      if (uid && fleetService.setActiveShip(uid)) {
        triggerHaptic(12);
        updateTopBarProfile();
        renderFleetHangar();
        if (typeof renderMiningActiveShipBanner === 'function') {
          renderMiningActiveShipBanner();
          evaluateAndRenderMiningRock();
        }
        const shipEntry = fleetService.getShipByUid(uid);
        showToast(`★ ${shipEntry?.nickname || 'Vaisseau'} défini comme vaisseau actif !`);
      }
    });
  });

  grid.querySelectorAll('.btn-config-ship').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-uid');
      if (uid) openShipConfigScreen(uid);
    });
  });

  grid.querySelectorAll('.btn-duplicate-ship').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-uid');
      if (uid) {
        const dup = fleetService.duplicateShip(uid);
        if (dup) {
          triggerHaptic(10);
          renderFleetHangar();
          showToast(`📋 Vaisseau dupliqué : ${dup.nickname}`);
        }
      }
    });
  });

  grid.querySelectorAll('.btn-remove-ship').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const uid = btn.getAttribute('data-uid');
      const entry = fleetService.getShipByUid(uid);
      if (uid && confirm(`Êtes-vous sûr de vouloir retirer ${entry?.nickname || 'ce vaisseau'} de votre flotte ?`)) {
        fleetService.removeShip(uid);
        updateTopBarProfile();
        renderFleetHangar();
        if (catalogFilters.isOpen) renderShipCatalog();
        showToast(`${entry?.nickname || 'Vaisseau'} retiré de la flotte.`);
      }
    });
  });

  grid.querySelectorAll('.ship-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.ship-card-actions') || e.target.closest('.btn-make-active-chip')) return;
      const uid = card.getAttribute('data-ship-uid');
      if (uid) openShipConfigScreen(uid);
    });
  });
}

/**
 * Rendu du catalogue ships.js avec recherche et filtre rôle
 */
function renderShipCatalog() {
  const grid = document.getElementById('catalogShipsGrid');
  if (!grid) return;

  const fleet = fleetService.getShips();

  const catalog = ALL_SHIPS.filter(s => {
    if (!s) return false;
    if (catalogFilters.role !== 'tous') {
      const targetRole = (catalogFilters.role === 'combat' || catalogFilters.role === 'escort')
        ? 'escort'
        : (catalogFilters.role === 'support' || catalogFilters.role === 'cargo')
          ? 'cargo'
          : catalogFilters.role;
      if (s.role !== targetRole) return false;
    }
    if (catalogFilters.search) {
      if (!matchShipSearch(catalogFilters.search, s)) return false;
    }
    return true;
  });

  if (catalog.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: var(--text-dim);">
        Aucun modèle de vaisseau ne correspond à cette recherche.
      </div>
    `;
    return;
  }

  grid.innerHTML = catalog.map(s => {
    const owned = fleet.filter(e => e.shipId === s.id).length;
    const [roleLabel, roleBadge] = ROLE_LABELS[s.role] || ['Support', 'cyan'];

    return `
      <div class="vo-card" style="padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
            <b style="font-size:0.9rem; color:#fff;">${s.name}</b>
            ${owned > 0 ? `<span class="vo-badge green" style="font-size:0.7rem; font-weight:700;">×${owned}</span>` : ''}
          </div>
          <div style="color:var(--text-dim); font-size:0.74rem; margin:2px 0 8px;">${s.type_fr}</div>

          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
            <span class="vo-badge ${roleBadge}">${roleLabel}</span>
            <span class="vo-badge amber">${s.scu} SCU</span>
            ${s.laserSlots > 1 ? `<span class="vo-badge cyan">${s.laserSlots} tourelles</span>` : ''}
          </div>
        </div>

        ${s.incomplete
          ? `<span class="vo-badge red" title="${s.incomplete}" style="text-align:center; display:block;">Données incomplètes</span>`
          : `<button type="button" class="vo-btn outline btn-add-ship-to-fleet" data-ship-id="${s.id}" style="width:100%; padding:5px 8px; font-size:0.75rem;">+ Ajouter</button>`
        }
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.btn-add-ship-to-fleet').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-id');
      if (shipId) {
        const added = fleetService.addShip(shipId);
        if (added) {
          triggerHaptic(12);
          renderShipCatalog();
          renderFleetHangar();
          const s = getShip(shipId);
          showToast(`+ ${s?.name || 'Vaisseau'} ajouté à votre flotte !`);
        }
      }
    });
  });
}

/**
 * Ouvre l'éditeur de configuration d'un vaisseau
 */
function openShipConfigScreen(uid) {
  const entry = fleetService.getShipByUid(uid);
  if (!entry) return;

  editingShipUid = uid;
  shipConfigDraft = structuredClone(entry);
  activeTurretTab = 0;

  const overview = document.getElementById('fleetOverviewSubView');
  const editor = document.getElementById('fleetLoadoutEditorSubView');
  if (overview && editor) {
    overview.style.display = 'none';
    editor.style.display = 'block';
    triggerHaptic(10);
  }

  renderShipConfigView();
}

/**
 * Rendu complet de la vue de configuration du vaisseau sélectionné
 */
function renderShipConfigView() {
  if (!shipConfigDraft) return;

  const ship = getShip(shipConfigDraft.shipId);
  if (!ship) return;

  const turrets = shipConfigDraft.config?.turrets || [];
  const multi = turrets.length > 1;

  // 1. En-tête
  const nickInput = document.getElementById('configShipNicknameInput');
  const activeBadge = document.getElementById('configShipActiveBadge');
  const subtitleEl = document.getElementById('configShipSubtitle');
  const cargoEl = document.getElementById('configShipCargoVal');
  const powerEl = document.getElementById('configShipPowerVal');
  const powerBox = document.getElementById('configShipPowerBox');
  const crewEl = document.getElementById('configShipCrewVal');

  if (nickInput) nickInput.value = shipConfigDraft.nickname || '';
  if (activeBadge) activeBadge.style.display = shipConfigDraft.active ? 'inline-block' : 'none';
  if (subtitleEl) subtitleEl.textContent = `${ship.name} · ${ship.type_fr}`;
  if (cargoEl) cargoEl.textContent = `${totalScu(ship)} SCU`;
  if (powerEl && powerBox) {
    if (ship.basePower) {
      powerBox.style.display = 'block';
      powerEl.textContent = `${ship.basePower.toLocaleString('fr-FR')} W`;
    } else {
      powerBox.style.display = 'none';
    }
  }
  if (crewEl) {
    const assigned = turrets.filter(t => t.operator).length;
    crewEl.textContent = `${assigned}/${Math.max(1, turrets.length)}`;
  }

  // 2. Carte Tourelles (Colonne gauche)
  const turretCard = document.getElementById('turretConfigCard');
  const turretTitle = document.getElementById('turretCardTitle');
  const laserSizeBadge = document.getElementById('turretLaserSizeBadge');
  const tabsContainer = document.getElementById('turretTabsContainer');
  const formTableBody = document.getElementById('turretFormTableBody');
  const btnCopy = document.getElementById('btnCopyTurretToAll');

  if (turrets.length === 0) {
    if (turretCard) {
      const [roleName] = ROLE_LABELS[ship.role] || ['Support'];
      turretCard.style.display = 'block';
      turretTitle.textContent = 'Postes de bord & Équipement';
      laserSizeBadge.textContent = roleName;
      tabsContainer.innerHTML = '';
      formTableBody.innerHTML = `
        <tr>
          <td colspan="2" style="color:var(--text-dim); padding:16px; text-align:center;">
            Ce vaisseau de ${roleName.toLowerCase()} ne possède pas de tourelles de minage.<br>
            Vous pouvez configurer ses composants internes et son assurance dans la colonne de droite.
          </td>
        </tr>
      `;
      if (btnCopy) btnCopy.style.display = 'none';
    }
  } else {
    if (turretCard) turretCard.style.display = 'block';
    if (turretTitle) turretTitle.textContent = multi ? `Tourelles de minage (${turrets.length})` : 'Tête de minage';
    if (laserSizeBadge) laserSizeBadge.textContent = `Taille S${ship.laserSize ?? 0}`;
    if (btnCopy) btnCopy.style.display = multi ? 'inline-flex' : 'none';

    // Rendu des onglets si multi
    if (tabsContainer) {
      if (multi) {
        tabsContainer.innerHTML = turrets.map((t, idx) => {
          const isSel = idx === activeTurretTab;
          const hasLaser = Boolean(t.laserId);
          return `
            <button type="button" class="vo-btn ${isSel ? 'primary' : 'outline'} btn-turret-tab-item" data-tab-idx="${idx}" style="padding:5px 12px; font-size:0.78rem;">
              Tourelle ${idx + 1} ${hasLaser ? '●' : '○'}
            </button>
          `;
        }).join('');

        tabsContainer.querySelectorAll('.btn-turret-tab-item').forEach(btn => {
          btn.addEventListener('click', () => {
            activeTurretTab = parseInt(btn.getAttribute('data-tab-idx'), 10) || 0;
            renderShipConfigView();
          });
        });
      } else {
        tabsContainer.innerHTML = '';
      }
    }

    // Formulaire de la tourelle active
    const t = turrets[activeTurretTab] || turrets[0];
    if (formTableBody && t) {
      const compatibleLasers = fleetService.getLasersForSize(ship.laserSize);
      const craftedLasers = fleetService.getCraftedLasersForSize ? fleetService.getCraftedLasersForSize(ship.laserSize) : [];
      const allModules = fleetService.getAllModules();
      const numSlots = moduleSlotsFor(t, ship);

      let laserOptionsHtml = '<option value="">— Aucune —</option>';
      if (craftedLasers.length > 0) {
        laserOptionsHtml += `
          <optgroup label="🛠️ Mes Têtes de Minage Craftées (Inventaire)">
            ${craftedLasers.map(cl => `
              <option value="${cl.id}" ${(t.laserId === cl.id) ? 'selected' : ''}>
                ${cl.name} (${cl.power} W)
              </option>
            `).join('')}
          </optgroup>
        `;
      }

      laserOptionsHtml += `
        <optgroup label="🏭 Catalogue Standard (Stock Usine)">
          ${compatibleLasers.map(l => `
            <option value="${l.id}" ${(t.laserId === l.id || getLaser(t.laserId)?.id === l.id) ? 'selected' : ''}>
              ${l.name} (${l.power} W · ${l.slots ?? l.moduleSlots ?? 0} slots)
            </option>
          `).join('')}
        </optgroup>
      `;

      let formHtml = `
        <tr>
          <td style="width:180px; font-weight:600; color:var(--text-muted);">Tête laser (S${ship.laserSize ?? 0})</td>
          <td>
            <select class="vo-select" id="configTurretLaserSelect" style="width:100%; max-width:320px;">
              ${laserOptionsHtml}
            </select>
            ${ship.laserSize === 0 ? '<span style="font-size:0.75rem; color:var(--text-dim); margin-left:8px;">· intégré</span>' : ''}
          </td>
        </tr>
      `;

      // Slots de modules
      for (let k = 0; k < numSlots; k++) {
        const currentModId = t.modules?.[k] || '';
        formHtml += `
          <tr>
            <td style="color:var(--text-muted);">Module ${k + 1}</td>
            <td>
              <select class="vo-select mod-slot-select" data-slot-index="${k}" style="width:100%; max-width:280px;">
                <option value="">— Vide —</option>
                ${allModules.map(m => `
                  <option value="${m.id}" ${currentModId === m.id ? 'selected' : ''}>
                    ${m.name} (${m.type === 'active' || m.type === 'actif' ? 'Actif' : 'Passif'})
                  </option>
                `).join('')}
              </select>
            </td>
          </tr>
        `;
      }

      // Opérateur si multi-tourelles
      if (multi) {
        formHtml += `
          <tr>
            <td style="color:var(--text-muted);">Opérateur assigné</td>
            <td>
              <input type="text" class="vo-search-input" id="configTurretOperatorInput" value="${t.operator || ''}" placeholder="Pseudo RSI / Callsign" style="width:100%; max-width:280px;">
            </td>
          </tr>
        `;
      }

      formTableBody.innerHTML = formHtml;

      // Événements sur les selects
      document.getElementById('configTurretLaserSelect')?.addEventListener('change', (e) => {
        const newLaserId = e.target.value || null;
        const newSlots = moduleSlotsFor({ laserId: newLaserId }, ship);
        t.laserId = newLaserId;
        t.modules = (t.modules || []).slice(0, newSlots);
        renderShipConfigView();
      });

      formTableBody.querySelectorAll('.mod-slot-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const slotIdx = parseInt(sel.getAttribute('data-slot-index'), 10);
          if (!t.modules) t.modules = [];
          t.modules[slotIdx] = e.target.value || null;
          updateTurretOverviewTable();
        });
      });

      document.getElementById('configTurretOperatorInput')?.addEventListener('input', (e) => {
        t.operator = e.target.value;
        updateTurretOverviewTable();
        if (crewEl) {
          const assigned = turrets.filter(x => x.operator).length;
          crewEl.textContent = `${assigned}/${Math.max(1, turrets.length)}`;
        }
      });
    }
  }

  // 3. Schéma SVG avec tourelles numérotées
  const svgContainer = document.getElementById('schematicSvgContainer');
  if (svgContainer) {
    svgContainer.innerHTML = generateSchematicSvg(ship, turrets, activeTurretTab);

    // Clic sur les pins de tourelle dans le schéma SVG
    svgContainer.querySelectorAll('.schematic-turret-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const tabIdx = parseInt(pin.getAttribute('data-tab-index'), 10);
        if (!isNaN(tabIdx) && tabIdx < turrets.length) {
          activeTurretTab = tabIdx;
          renderShipConfigView();
        }
      });
    });
  }

  // 4. Colonne droite : Vue d'ensemble des tourelles
  updateTurretOverviewTable();

  // 5. Composants internes
  const compBody = document.getElementById('componentsConfigTableBody');
  if (compBody) {
    const hardpoints = hardpointsOf(ship).filter(h => h.category !== 'MINING_HEAD');
    if (hardpoints.length === 0) {
      compBody.innerHTML = `<tr><td colspan="3" style="color:var(--text-dim); text-align:center; padding:12px;">Aucun composant modifiable.</td></tr>`;
    } else {
      compBody.innerHTML = hardpoints.map(h => {
        const val = shipConfigDraft.config?.components?.[h.name] || '';
        return `
          <tr>
            <td style="font-weight:600; color:#fff;">${h.name}</td>
            <td><span class="vo-badge cyan">S${h.size}</span></td>
            <td>
              <input type="text" class="vo-search-input comp-input" data-comp-name="${h.name}" value="${val}" placeholder="d'origine" style="width:100%; padding:4px 8px; font-size:0.75rem;">
            </td>
          </tr>
        `;
      }).join('');

      compBody.querySelectorAll('.comp-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const compName = inp.getAttribute('data-comp-name');
          if (!shipConfigDraft.config.components) shipConfigDraft.config.components = {};
          shipConfigDraft.config.components[compName] = e.target.value;
        });
      });
    }
  }

  // 6. Assurance
  const insInput = document.getElementById('configShipInsuranceInput');
  if (insInput) {
    insInput.value = shipConfigDraft.insurance || '';
    insInput.oninput = (e) => {
      shipConfigDraft.insurance = e.target.value;
    };
  }

  // 7. Surnom live
  if (nickInput) {
    nickInput.oninput = (e) => {
      shipConfigDraft.nickname = e.target.value;
    };
  }
}

/**
 * Met à jour le tableau "Vue d'ensemble des tourelles"
 */
function updateTurretOverviewTable() {
  const tbody = document.getElementById('turretsOverviewTableBody');
  const card = document.getElementById('turretsOverviewCard');
  if (!tbody || !card || !shipConfigDraft) return;

  const turrets = shipConfigDraft.config?.turrets || [];
  if (turrets.length === 0) {
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';

  tbody.innerHTML = turrets.map((t, idx) => {
    const isSel = idx === activeTurretTab;
    const laserName = fleetService.getLaserName(t.laserId);
    const modNames = (t.modules || []).filter(Boolean).map(m => fleetService.getModuleName(m) || m).join(', ') || '—';
    const op = t.operator || '<span style="color:var(--text-dim);">libre</span>';

    return `
      <tr class="turret-overview-row" data-tab-idx="${idx}" style="cursor:pointer; ${isSel ? 'background:rgba(14,165,233,0.12);' : ''}">
        <td>
          <span class="vo-badge ${isSel ? 'cyan' : 'outline'}" style="font-weight:700;">T${idx + 1}</span>
        </td>
        <td style="font-weight:600; color:${laserName ? '#fff' : 'var(--accent-red)'};">
          ${laserName || '—'}
        </td>
        <td style="font-size:0.75rem; color:var(--text-muted);">${modNames}</td>
        <td>${op}</td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.turret-overview-row').forEach(row => {
    row.addEventListener('click', () => {
      activeTurretTab = parseInt(row.getAttribute('data-tab-idx'), 10) || 0;
      renderShipConfigView();
    });
  });
}

/**
 * Générateur SVG du schéma avec tourelles numérotées
 */
function generateSchematicSvg(ship, turrets, activeTab) {
  if (!ship) return '';
  const laserSlots = turrets.length;
  const isMole = ship.id === 'mole';
  const isArrastra = ship.id === 'arrastra';
  const isOrion = ship.id === 'orion';

  let turretPins = [];
  if (isMole) {
    turretPins = [
      { num: 1, x: 150, y: 70, label: 'T1 : Cabine centrale' },
      { num: 2, x: 70, y: 160, label: 'T2 : Bras bâbord' },
      { num: 3, x: 230, y: 160, label: 'T3 : Bras tribord' }
    ];
  } else if (isArrastra) {
    turretPins = [
      { num: 1, x: 150, y: 65, label: 'T1 : Tourelle haute' },
      { num: 2, x: 70, y: 170, label: 'T2 : Tourelle bâbord' },
      { num: 3, x: 230, y: 170, label: 'T3 : Tourelle tribord' }
    ];
  } else if (isOrion) {
    turretPins = [
      { num: 1, x: 150, y: 45, label: 'T1 : Avant supérieur' },
      { num: 2, x: 150, y: 95, label: 'T2 : Avant ventral' },
      { num: 3, x: 65, y: 175, label: 'T3 : Pod bâbord' },
      { num: 4, x: 235, y: 175, label: 'T4 : Pod tribord' }
    ];
  } else if (laserSlots > 0) {
    turretPins = [
      { num: 1, x: 150, y: 55, label: 'T1 : Tête de minage' }
    ];
  }

  const componentPins = [
    { type: 'Bouclier', x: 95, y: 235, label: 'Bouclier' },
    { type: 'Centrale', x: 205, y: 235, label: 'Centrale' },
    { type: 'Quantum', x: 150, y: 295, label: 'Quantum' }
  ];

  return `
    <svg viewBox="0 0 300 340" style="width:100%; height:100%;" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="schemGridGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
        </radialGradient>
        <filter id="turretGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      <!-- Grille radar d'arrière-plan -->
      <circle cx="150" cy="170" r="130" stroke="rgba(56,189,248,0.12)" stroke-width="1" fill="url(#schemGridGlow)" stroke-dasharray="4 4"/>
      <circle cx="150" cy="170" r="80" stroke="rgba(56,189,248,0.08)" stroke-width="1" fill="none"/>
      <circle cx="150" cy="170" r="30" stroke="rgba(56,189,248,0.06)" stroke-width="1" fill="none"/>
      <line x1="150" y1="20" x2="150" y2="320" stroke="rgba(56,189,248,0.15)" stroke-width="1" stroke-dasharray="2 4"/>
      <line x1="20" y1="170" x2="280" y2="170" stroke="rgba(56,189,248,0.15)" stroke-width="1" stroke-dasharray="2 4"/>

      <!-- Silhouette du vaisseau -->
      <polygon points="150,25 185,75 215,160 195,280 150,320 105,280 85,160 115,75" stroke="#38bdf8" stroke-width="1.8" fill="rgba(14,165,233,0.04)"/>
      <polygon points="150,45 165,85 135,85" stroke="#38bdf8" stroke-width="1.2" fill="rgba(56,189,248,0.1)"/>
      ${isMole ? `
        <!-- Bras latéraux MOLE -->
        <path d="M100,150 L60,165 L60,185 L100,175 Z" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" stroke-width="1.5"/>
        <path d="M200,150 L240,165 L240,185 L200,175 Z" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" stroke-width="1.5"/>
      ` : ''}

      <!-- Pins Tourelles Numérotées -->
      ${turretPins.map((tp, idx) => {
        const isSel = idx === activeTab;
        const color = isSel ? '#38bdf8' : '#f59e0b';
        const bg = isSel ? 'rgba(56,189,248,0.35)' : 'rgba(245,158,11,0.2)';
        const r = isSel ? 14 : 12;
        return `
          <g class="schematic-turret-pin" data-tab-index="${idx}" style="cursor:pointer;" filter="${isSel ? 'url(#turretGlow)' : 'none'}">
            <circle cx="${tp.x}" cy="${tp.y}" r="${r + 4}" fill="${bg}" stroke="${color}" stroke-width="${isSel ? '2.5' : '1.5'}"/>
            <circle cx="${tp.x}" cy="${tp.y}" r="${r}" fill="#0b1320" stroke="${color}" stroke-width="1.5"/>
            <text x="${tp.x}" y="${tp.y + 4}" fill="#ffffff" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="middle">T${tp.num}</text>
            <text x="${tp.x}" y="${tp.y - (r + 6)}" fill="${isSel ? '#38bdf8' : '#94a3b8'}" font-size="9" font-family="'Inter', sans-serif" font-weight="600" text-anchor="middle">${tp.label}</text>
          </g>
        `;
      }).join('')}

      <!-- Pins Composants Internes -->
      ${componentPins.map(cp => `
        <g class="schematic-comp-pin">
          <circle cx="${cp.x}" cy="${cp.y}" r="8" fill="#080e1a" stroke="rgba(148,163,184,0.4)" stroke-width="1.2"/>
          <circle cx="${cp.x}" cy="${cp.y}" r="3" fill="#38bdf8"/>
          <text x="${cp.x}" y="${cp.y + 16}" fill="#64748b" font-size="8.5" font-family="'Inter', sans-serif" text-anchor="middle">${cp.label}</text>
        </g>
      `).join('')}
    </svg>
  `;
}

/**
 * Ferme l'éditeur et revient à l'aperçu de la flotte
 */
function closeShipConfigScreen() {
  const overview = document.getElementById('fleetOverviewSubView');
  const editor = document.getElementById('fleetLoadoutEditorSubView');
  if (overview && editor) {
    editor.style.display = 'none';
    overview.style.display = 'block';
    renderFleetHangar();
  }
}

// ============================================================================
// ============================================================================
// 6. INVENTAIRE D'ÉQUIPEMENTS, COTATION & MARCHÉ INTER-GUILDE
// ============================================================================

let fleetyardsCatalogCache = null;
let fleetyardsCatalogLoadingPromise = null;

async function loadFleetyardsCatalog() {
  if (fleetyardsCatalogCache && fleetyardsCatalogCache.length > 0) {
    return fleetyardsCatalogCache;
  }
  if (fleetyardsCatalogLoadingPromise) {
    return fleetyardsCatalogLoadingPromise;
  }

  fleetyardsCatalogLoadingPromise = (async () => {
    const resolveDataUrl = (relPath) => {
      try {
        return new URL(relPath, window.location.href).href;
      } catch {
        return relPath;
      }
    };

    // 1. Essai avec l'index précompilé ultra-rapide (1.47 Mo au lieu de 44 Mo)
    try {
      const idxUrl = resolveDataUrl('data/fleetyards/catalog-index.json');
      const res = await fetch(idxUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          fleetyardsCatalogCache = data;
          const statusBadge = document.getElementById('eqCatalogStatusBadge');
          if (statusBadge) statusBadge.textContent = `✓ ${data.length.toLocaleString('fr-FR')} articles prêts`;
          return data;
        }
      }
    } catch (e) {
      console.warn('Catalogue index non disponible, repli sur components.json...', e);
    }

    // 2. Repli sur les fichiers individuels avec chemin relatif
    try {
      const compsUrl = resolveDataUrl('data/fleetyards/components.json');
      const equipUrl = resolveDataUrl('data/fleetyards/equipment.json');
      const [compsRes, equipRes] = await Promise.all([
        fetch(compsUrl).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(equipUrl).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      const unified = [];
      (compsRes || []).forEach(c => {
        const price = c.availability?.soldAt?.[0]?.price || c.availability?.boughtAt?.[0]?.price || c.price || 0;
        unified.push({
          name: c.name,
          code: c.slug || (c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          category: 'component',
          subCategory: c.type || 'component',
          size: c.size ? String(c.size) : null,
          grade: c.grade ? String(c.grade) : null,
          catalogPrice: Number(price) || 0,
          typeLabel: `Composant · ${c.type || 'Système'}`
        });
      });

      (equipRes || []).forEach(e => {
        const price = e.availability?.soldAt?.[0]?.price || e.availability?.boughtAt?.[0]?.price || e.price || 0;
        let cat = 'equipment';
        const typeStr = (e.type || '').toLowerCase();
        if (typeStr.includes('weapon') || typeStr.includes('gun') || typeStr.includes('smg') || typeStr.includes('rifle') || typeStr.includes('pistol')) {
          cat = 'weapon';
        } else if (typeStr.includes('armor') || typeStr.includes('suit') || typeStr.includes('helmet')) {
          cat = 'armor';
        }
        unified.push({
          name: e.name,
          code: e.slug || (e.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          category: cat,
          subCategory: e.type || 'gear',
          size: e.size ? String(e.size) : 'FPS',
          grade: e.grade ? String(e.grade) : 'B',
          catalogPrice: Number(price) || 0,
          typeLabel: `FPS · ${e.type || 'Équipement'}`
        });
      });

      if (unified.length > 0) {
        fleetyardsCatalogCache = unified;
        const statusBadge = document.getElementById('eqCatalogStatusBadge');
        if (statusBadge) statusBadge.textContent = `✓ ${unified.length.toLocaleString('fr-FR')} articles prêts`;
        return unified;
      }
    } catch (err) {
      console.error('Erreur chargement FleetYards components/equipment:', err);
    }

    // 3. Fallback de secours (composants populaires toujours disponibles)
    const fallbackCatalog = [
      { name: 'Lancet MH1', code: 'lancet-mh1', category: 'component', subCategory: 'Mining Laser', size: '1', grade: 'A', catalogPrice: 24000, typeLabel: 'Tête de minage · S1' },
      { name: 'Helix I', code: 'helix-i', category: 'component', subCategory: 'Mining Laser', size: '1', grade: 'A', catalogPrice: 42000, typeLabel: 'Tête de minage · S1' },
      { name: 'Helix II', code: 'helix-ii', category: 'component', subCategory: 'Mining Laser', size: '2', grade: 'A', catalogPrice: 84000, typeLabel: 'Tête de minage · S2' },
      { name: 'Arbor MH1', code: 'arbor-mh1', category: 'component', subCategory: 'Mining Laser', size: '1', grade: 'C', catalogPrice: 12000, typeLabel: 'Tête de minage · S1' },
      { name: 'Atlas (Quantum Drive)', code: 'atlas-qd', category: 'component', subCategory: 'Quantum Drive', size: '1', grade: 'A', catalogPrice: 28500, typeLabel: 'Moteur Quantique · S1' },
      { name: 'FR-66 (Shield)', code: 'fr-66-shield', category: 'component', subCategory: 'Shield Generator', size: '1', grade: 'A', catalogPrice: 22000, typeLabel: 'Bouclier · S1' },
      { name: 'FR-76 (Shield)', code: 'fr-76-shield', category: 'component', subCategory: 'Shield Generator', size: '2', grade: 'A', catalogPrice: 58000, typeLabel: 'Bouclier · S2' },
      { name: 'JS-300 (Power Plant)', code: 'js-300', category: 'component', subCategory: 'Power Plant', size: '1', grade: 'A', catalogPrice: 29000, typeLabel: 'Génératrice · S1' },
      { name: 'Novikov (Suit)', code: 'novikov-suit', category: 'armor', subCategory: 'Heavy Armor', size: 'FPS', grade: 'A', catalogPrice: 18000, typeLabel: 'Combinaison Environnementale' },
      { name: 'P8-SC SMG', code: 'p8-sc', category: 'weapon', subCategory: 'SMG', size: 'FPS', grade: 'A', catalogPrice: 3800, typeLabel: 'Arme FPS · Mitraillette' },
      { name: 'FS-9 LMG', code: 'fs-9', category: 'weapon', subCategory: 'LMG', size: 'FPS', grade: 'A', catalogPrice: 6200, typeLabel: 'Arme FPS · Mitrailleuse' },
      { name: 'Pyro RYT Multi-Tool', code: 'multi-tool', category: 'equipment', subCategory: 'Tool', size: 'FPS', grade: 'A', catalogPrice: 1500, typeLabel: 'Outil Multifonction FPS' }
    ];
    fleetyardsCatalogCache = fallbackCatalog;
    return fallbackCatalog;
  })();

  return fleetyardsCatalogLoadingPromise;
}

let inventoryFilterState = {
  locationId: 'all',
  origin: 'all',
  forSaleOnly: false,
  purpose: 'all'
};

function renderInventoryTable() {
  let items = inventoryService.getItems({
    locationId: inventoryFilterState.locationId,
    origin: inventoryFilterState.origin,
    forSaleOnly: inventoryFilterState.forSaleOnly
  });

  if (inventoryFilterState.purpose === 'craft') {
    items = items.filter(i => Boolean(i.reservedForCraft || i.intendedUse === 'craft'));
  } else if (inventoryFilterState.purpose === 'sell_raw') {
    items = items.filter(i => i.category === 'raw_ore' && !i.reservedForCraft);
  } else if (inventoryFilterState.purpose === 'sell_refined') {
    items = items.filter(i => i.category === 'refined_ore' && !i.reservedForCraft);
  } else if (inventoryFilterState.purpose === 'high_quality') {
    items = items.filter(i => (typeof i.materialQuality === 'number' && i.materialQuality >= 750) || (typeof i.metadata?.materialQuality === 'number' && i.metadata.materialQuality >= 750));
  }

  const allItems = inventoryService.getItems();
  const forSaleCount = allItems.filter(i => Boolean(i.forSale)).length;
  const totalValUEC = allItems.reduce((acc, i) => acc + inventoryService.getItemEstimatedValue(i), 0);
  const totalSCU = allItems.reduce((acc, i) => acc + (Number(i.quantitySCU) || 0), 0);

  const subTitleEl = document.getElementById('inventorySubtitle');
  if (subTitleEl) {
    subTitleEl.textContent = `${totalSCU} SCU · Valeur estimée ${totalValUEC.toLocaleString('fr-FR')} aUEC · ${allItems.length} référence(s) en stock`;
  }

  const countBadge = document.getElementById('inventoryTotalCountBadge');
  if (countBadge) countBadge.textContent = `${allItems.length} articles`;

  const forSaleBadge = document.getElementById('inventoryForSaleCountBadge');
  if (forSaleBadge) forSaleBadge.textContent = `${forSaleCount} en vente`;

  const tbody = document.getElementById('inventoryStockTableBody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:32px 16px; color:var(--text-dim);">
          Aucun article correspondant aux critères actifs.<br>
          <button type="button" class="vo-btn primary" id="btnEmptyAddEquipment" style="margin-top:12px; font-size:0.75rem;">
            ＋ Inventorier un équipement
          </button>
        </td>
      </tr>
    `;
    document.getElementById('btnEmptyAddEquipment')?.addEventListener('click', openAddEquipmentModal);
    return;
  }

  tbody.innerHTML = items.map(item => {
    // 1. Origine badge & Qualité
    let originHtml = '<span class="origin-badge purchased">🛒 Acheté</span>';
    const isMined = item.origin === 'mined' || item.category === 'raw_ore' || item.category === 'refined_ore';

    if (item.origin === 'looted') {
      originHtml = '<span class="origin-badge looted">🏴‍☠️ Looté</span>';
    } else if (isMined) {
      const qVal = typeof item.materialQuality === 'number'
        ? item.materialQuality
        : (typeof item.metadata?.materialQuality === 'number' ? item.metadata.materialQuality : null);

      if (qVal !== null && craftingService.getQualityTier) {
        const tier = craftingService.getQualityTier(qVal);
        originHtml = `
          <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
            <span class="origin-badge mined">⛏️ Miné</span>
            <span class="quality-badge ${tier.badgeClass}" title="${tier.name} · Pureté Q${qVal}/1000 (${tier.statBonusRange[0] >= 0 ? '+' : ''}${tier.statBonusRange[0]}% à +${tier.statBonusRange[1]}% stats craft)">
              ⭐ Q${qVal} ${tier.shortName}
            </span>
          </div>
        `;
      } else {
        originHtml = '<span class="origin-badge mined">⛏️ Miné</span>';
      }
    } else if (item.origin === 'crafted') {
      const qVal = typeof item.materialQuality === 'number'
        ? item.materialQuality
        : (typeof item.metadata?.materialQuality === 'number' ? item.metadata.materialQuality : null);

      if (qVal !== null && craftingService.getQualityTier) {
        const tier = craftingService.getQualityTier(qVal);
        originHtml = `
          <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
            <span class="origin-badge crafted">🛠 Crafté</span>
            <span class="quality-badge ${tier.badgeClass}" title="${tier.name} · Score Q${qVal}/1000">
              ⭐ Q${qVal} ${tier.shortName}
            </span>
          </div>
        `;
      } else {
        originHtml = '<span class="origin-badge crafted">🛠 Crafté</span>';
      }
    }

    // 2. Format Qté
    const qtyStr = item.quantitySCU > 0 ? `${item.quantitySCU} SCU` : `${item.quantityUnits || 1} ex.`;

    // 3. Catégorie badge
    let catBadgeClass = 'cyan';
    let catLabel = item.category;
    if (item.category === 'raw_ore') { catLabel = 'Minerai Brut'; catBadgeClass = 'amber'; }
    else if (item.category === 'refined_ore') { catLabel = 'Minerai Raffiné'; catBadgeClass = 'cyan'; }
    else if (item.category === 'salvage_rmc') { catLabel = 'RMC Salvage'; catBadgeClass = 'green'; }
    else if (item.category === 'commodity_cargo') { catLabel = 'Marchandise'; catBadgeClass = 'purple'; }
    else if (item.category === 'crafted_laser') { catLabel = 'Laser Minage'; catBadgeClass = 'cyan'; }
    else if (item.category === 'crafted_module') { catLabel = 'Module Passif'; catBadgeClass = 'cyan'; }
    else if (item.category === 'component') { catLabel = 'Composant'; catBadgeClass = 'blue'; }
    else if (item.category === 'weapon') { catLabel = 'Arme'; catBadgeClass = 'red'; }
    else if (item.category === 'equipment') { catLabel = 'Équipement'; catBadgeClass = 'green'; }

    // 4. Format Cotation & Usage & Prix
    let saleHtml = '';
    const isOre = item.category === 'raw_ore' || item.category === 'refined_ore';
    if (isOre) {
      const isReservedCraft = Boolean(item.reservedForCraft || item.intendedUse === 'craft');
      const estVal = inventoryService.getItemEstimatedValue(item);

      let usageBadge = '';
      if (isReservedCraft) {
        usageBadge = `<span class="intended-use-badge craft btn-toggle-ore-craft" data-item-id="${item.id}" title="Réservé pour le Craft. Cliquer pour libérer vers la vente.">🛠️ Réservé Craft</span>`;
      } else if (item.category === 'raw_ore') {
        usageBadge = `<span class="intended-use-badge sell_raw btn-toggle-ore-craft" data-item-id="${item.id}" title="À vendre brut. Cliquer pour réserver au craft.">💰 Vente Brute</span>`;
      } else {
        usageBadge = `<span class="intended-use-badge sell_refined btn-toggle-ore-craft" data-item-id="${item.id}" title="À vendre raffiné. Cliquer pour réserver au craft.">💎 Vente Raffinée</span>`;
      }

      saleHtml = `
        <div style="display:flex; flex-direction:column; gap:4px;">
          ${usageBadge}
          <span style="font-size:0.7rem; color:var(--text-dim); font-family:var(--font-mono);">
            ${isReservedCraft ? 'Stock atelier protégé' : `Valeur : +${estVal.toLocaleString('fr-FR')} aUEC`}
          </span>
        </div>
      `;
    } else if (item.forSale) {
      const isReserved = item.saleStatus === 'reserved';
      const priceText = item.salePriceUEC > 0 ? `${item.salePriceUEC.toLocaleString('fr-FR')} aUEC` : 'Sur devis';
      const barterIndicator = item.barterOffer ? `<span class="barter-pill" title="Troc : ${item.barterOffer}">🔄 Troc</span>` : '';
      const scopeIcon = item.saleScope === 'inter_guild' ? '🌐' : '🏛';
      saleHtml = `
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="sale-badge ${isReserved ? 'reserved' : 'for-sale'}" data-item-id="${item.id}" title="Cliquer pour modifier l'offre">
              🏷️ ${priceText}
            </span>
            ${barterIndicator}
          </div>
          <span style="font-size:0.7rem; color:var(--text-dim);">${scopeIcon} ${item.saleScope === 'inter_guild' ? 'Inter-guilde' : 'Interne'} ${isReserved ? '· (RÉSERVÉ)' : ''}</span>
        </div>
      `;
    } else {
      const estVal = inventoryService.getItemEstimatedValue(item);
      saleHtml = `
        <span class="sale-badge not-sale" data-item-id="${item.id}" title="Mettre en vente cet article">
          — En stock (${estVal > 0 ? `${estVal.toLocaleString('fr-FR')} aUEC` : 'Non coté'})
        </span>
      `;
    }

    // Subtitle meta: size/grade/SN/craftStats/notes
    const metaParts = [];
    if (item.size) metaParts.push(`Taille ${item.size}`);
    if (item.grade) metaParts.push(`Grade ${item.grade}`);
    if (item.conditionPct && item.conditionPct < 100) metaParts.push(`Santé ${item.conditionPct}%`);
    if (item.metadata?.craftStats) metaParts.push(`<span class="val-green" title="Performances ajustées">${item.metadata.craftStats}</span>`);
    if (item.metadata?.notes) metaParts.push(item.metadata.notes);
    const metaStr = metaParts.length > 0 ? `<div style="font-size:0.72rem; color:var(--text-dim); margin-top:2px;">${metaParts.join(' · ')}</div>` : '';

    // Action buttons column
    let actionsHtml = '';
    if (item.category === 'raw_ore') {
      actionsHtml = `
        <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:flex-end;">
          <button type="button" class="vo-btn outline btn-toggle-ore-craft" data-item-id="${item.id}" style="font-size:0.7rem; padding:3px 7px;" title="${item.reservedForCraft ? 'Débloquer du craft' : 'Garder pour le craft'}">
            ${item.reservedForCraft ? '🔓 Vente' : '🛠️ Craft'}
          </button>
          <button type="button" class="vo-btn outline btn-sell-raw-action" data-item-id="${item.id}" style="font-size:0.7rem; padding:3px 7px; color:var(--accent-amber);" title="Vendre brut immédiatement sans raffinage">
            💰 Vendre
          </button>
          <button type="button" class="vo-btn outline btn-refine-ore-action" data-item-id="${item.id}" style="font-size:0.7rem; padding:3px 7px; color:var(--accent-cyan);" title="Envoyer en raffinerie (Dinyx)">
            🏭 Raffiner
          </button>
          <button type="button" class="vo-btn outline btn-delete-item-action" data-item-id="${item.id}" style="font-size:0.7rem; padding:3px 7px; color:var(--accent-red);" title="Supprimer de l'inventaire">
            ✕
          </button>
        </div>
      `;
    } else if (item.category === 'refined_ore') {
      actionsHtml = `
        <div style="display:inline-flex; gap:4px; flex-wrap:wrap; justify-content:flex-end;">
          <button type="button" class="vo-btn outline btn-toggle-ore-craft" data-item-id="${item.id}" style="font-size:0.7rem; padding:3px 7px;" title="${item.reservedForCraft ? 'Débloquer du craft' : 'Garder pour le craft'}">
            ${item.reservedForCraft ? '🔓 Vente' : '🛠️ Craft'}
          </button>
          <button type="button" class="vo-btn outline btn-sell-refined-action" data-item-id="${item.id}" style="font-size:0.7rem; padding:3px 7px; color:var(--accent-green);" title="Vendre au comptoir au cours raffiné">
            💎 Vendre
          </button>
          <button type="button" class="vo-btn outline btn-delete-item-action" data-item-id="${item.id}" style="font-size:0.7rem; padding:3px 7px; color:var(--accent-red);" title="Supprimer de l'inventaire">
            ✕
          </button>
        </div>
      `;
    } else {
      actionsHtml = `
        <div style="display:inline-flex; gap:6px;">
          <button type="button" class="vo-btn outline btn-edit-sale-action" data-item-id="${item.id}" style="font-size:0.72rem; padding:3px 8px;" title="Configurer le prix, le troc et la vente">
            ✏️ Vente
          </button>
          <button type="button" class="vo-btn outline btn-delete-item-action" data-item-id="${item.id}" style="font-size:0.72rem; padding:3px 8px; color:var(--accent-red);" title="Supprimer de l'inventaire">
            ✕
          </button>
        </div>
      `;
    }

    return `
      <tr>
        <td>
          <div class="val-bold">${item.name}</div>
          ${metaStr}
        </td>
        <td>${originHtml}</td>
        <td><span class="vo-badge ${catBadgeClass}">${catLabel}</span></td>
        <td class="val-bold">${qtyStr}</td>
        <td style="color:var(--text-muted); font-size:0.78rem;">${item.locationId}</td>
        <td>${saleHtml}</td>
        <td style="text-align:right;">${actionsHtml}</td>
      </tr>
    `;
  }).join('');

  // Bind clicks
  tbody.querySelectorAll('.sale-badge, .btn-edit-sale-action').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-item-id');
      if (id) openEditSaleModal(id);
    });
  });

  // Bind ore strategic toggle (Garder pour Craft vs Vendre)
  tbody.querySelectorAll('.btn-toggle-ore-craft').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-item-id');
      const res = inventoryService.toggleOreCraftReservation(id);
      if (res) {
        triggerHaptic(8);
        showToast(res.reservedForCraft
          ? `🛠️ Lot "${res.name}" réservé pour le Craft (protégé contre la vente).`
          : `🏷️ Lot "${res.name}" libéré et prêt pour la vente.`);
        renderInventoryTable();
      }
    });
  });

  // Bind direct raw ore sale
  tbody.querySelectorAll('.btn-sell-raw-action').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-item-id');
      const item = inventoryService.getItemById(id);
      if (!item) return;
      if (confirm(`Vendre immédiatement ${item.quantitySCU} SCU de "${item.name}" au cours brut ?`)) {
        const res = inventoryService.sellRawOreBatch(id);
        if (res.success) {
          triggerHaptic(12);
          showToast(`💰 ${res.message}`);
          renderTopBarCitizen();
          renderInventoryTable();
        }
      }
    });
  });

  // Bind direct refined ore sale
  tbody.querySelectorAll('.btn-sell-refined-action').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-item-id');
      const item = inventoryService.getItemById(id);
      if (!item) return;
      if (confirm(`Vendre immédiatement ${item.quantitySCU} SCU de "${item.name}" au cours raffiné ?`)) {
        const res = inventoryService.sellRefinedOreBatch(id);
        if (res.success) {
          triggerHaptic(14);
          showToast(`💎 ${res.message}`);
          renderTopBarCitizen();
          renderInventoryTable();
        }
      }
    });
  });

  // Bind direct ore refining
  tbody.querySelectorAll('.btn-refine-ore-action').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-item-id');
      const item = inventoryService.getItemById(id);
      if (!item) return;
      if (confirm(`Envoyer ${item.quantitySCU} SCU de "${item.name}" en raffinage (Méthode Dinyx Solvent à CRU-L1) ?`)) {
        const res = inventoryService.refineRawOreBatch(id, 'dinyx', 'CRU-L1 Ambitious Dream');
        if (res.success) {
          triggerHaptic(15);
          showToast(`✨ ${res.message}`);
          renderTopBarCitizen();
          renderInventoryTable();
          // Mettre à jour le compteur de raffinage sur le tableau de bord
          const dashRefiningCount = document.querySelector('#viewDashboard .vo-grid-4 .vo-card:nth-child(2) .kpi-main-val');
          if (dashRefiningCount) {
            const cur = parseInt(dashRefiningCount.textContent, 10) || 3;
            dashRefiningCount.textContent = cur + 1;
          }
        }
      }
    });
  });

  tbody.querySelectorAll('.btn-delete-item-action').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-item-id');
      const item = inventoryService.getItemById(id);
      if (item && confirm(`Retirer définitivement "${item.name}" de l'inventaire ?`)) {
        inventoryService.removeItem(id);
        showToast(`Article "${item.name}" retiré de l'inventaire.`);
        renderInventoryTable();
        if (currentActiveApp === 'guild') renderGuildMarket();
      }
    });
  });
}

function openAddEquipmentModal() {
  const modal = document.getElementById('equipmentInventoryModal');
  if (!modal) return;

  const form = document.getElementById('formAddEquipment');
  if (form) form.reset();

  const searchInput = document.getElementById('eqSearchInput');
  if (searchInput) searchInput.value = '';

  const dropdown = document.getElementById('eqSearchDropdown');
  if (dropdown) dropdown.classList.remove('open');

  const titleEl = document.getElementById('eqDisplayTitle');
  if (titleEl) titleEl.textContent = 'Aucun article sélectionné';

  const metaEl = document.getElementById('eqDisplayMeta');
  if (metaEl) metaEl.textContent = 'Sélectionnez une pièce ci-dessus ou saisissez manuellement';

  const priceEl = document.getElementById('eqDisplayCatalogPrice');
  if (priceEl) priceEl.textContent = '— aUEC';

  document.getElementById('eqSelectedCode').value = '';
  document.getElementById('eqSelectedName').value = '';
  document.getElementById('eqSelectedCatalogPrice').value = '0';
  document.getElementById('eqSelectedCategory').value = 'component';
  document.getElementById('eqSelectedSubCategory').value = '';
  document.getElementById('eqSelectedSize').value = '';
  document.getElementById('eqSelectedGrade').value = '';
  const sizeSelect = document.getElementById('eqSizeSelect');
  if (sizeSelect) sizeSelect.value = '1';

  const toggle = document.getElementById('eqForSaleToggle');
  if (toggle) toggle.checked = false;

  const saleGroup = document.getElementById('eqSaleFieldsContainer');
  if (saleGroup) saleGroup.style.display = 'none';

  document.querySelectorAll('#originSelectorGrid .origin-card').forEach(card => {
    card.classList.toggle('selected', card.getAttribute('data-origin') === 'purchased');
  });
  document.getElementById('eqOriginInput').value = 'purchased';
  const craftQContainer = document.getElementById('eqCraftQualityContainer');
  if (craftQContainer) craftQContainer.style.display = 'none';
  const qualityInput = document.getElementById('eqMaterialQualityInput');
  if (qualityInput) qualityInput.value = 500;
  const qualityVal = document.getElementById('eqMaterialQualityVal');
  if (qualityVal) qualityVal.textContent = 'Q500';
  const qualityBadge = document.getElementById('eqQualityBadgePreview');
  if (qualityBadge) {
    qualityBadge.className = 'quality-badge quality-standard';
    qualityBadge.textContent = 'Standard Usine · Q500';
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  triggerHaptic(12);

  // Pre-load catalog in background
  loadFleetyardsCatalog();

  setTimeout(() => {
    document.getElementById('eqSearchInput')?.focus();
  }, 120);
}

function closeAddEquipmentModal() {
  const modal = document.getElementById('equipmentInventoryModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('eqSearchDropdown')?.classList.remove('open');
}

function openEditSaleModal(itemId) {
  const item = inventoryService.getItemById(itemId);
  if (!item) return;

  const modal = document.getElementById('editSaleModal');
  if (!modal) return;

  document.getElementById('editSaleItemId').value = item.id;
  document.getElementById('editSaleItemTitle').textContent = item.name;
  document.getElementById('editSaleItemSubtitle').textContent = `${item.locationId} · ${item.quantityUnits || 1} unité(s)`;

  const toggle = document.getElementById('editSaleForSaleToggle');
  if (toggle) toggle.checked = Boolean(item.forSale);

  const priceInput = document.getElementById('editSalePriceInput');
  if (priceInput) priceInput.value = item.salePriceUEC || item.catalogReferencePriceUEC || '';

  const barterInput = document.getElementById('editSaleBarterInput');
  if (barterInput) barterInput.value = item.barterOffer || '';

  const scopeSelect = document.getElementById('editSaleScopeSelect');
  if (scopeSelect) scopeSelect.value = item.saleScope || 'inter_guild';

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  triggerHaptic(12);
}

function closeEditSaleModal() {
  const modal = document.getElementById('editSaleModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function openExportManifestModal() {
  const modal = document.getElementById('manifestExportModal');
  const textarea = document.getElementById('manifestExportTextarea');
  const badge = document.getElementById('manifestCountBadge');
  if (!modal || !textarea) return;

  const manifest = guildService.generateInterGuildManifest();
  textarea.value = manifest;

  const activeSales = guildService.getGuildMarketListings({ scope: 'all' })
    .filter(i => i.saleScope === 'inter_guild' || i.saleScope === 'public');
  if (badge) badge.textContent = `${activeSales.length} lot(s) exportable(s)`;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  triggerHaptic(12);
}

function closeExportManifestModal() {
  const modal = document.getElementById('manifestExportModal');
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

let guildMarketFilters = {
  category: 'all',
  scope: 'all',
  status: 'all',
  barterOnly: false,
  search: ''
};

function renderGuildMarket() {
  const allListings = guildService.getGuildMarketListings();
  const filteredListings = guildService.getGuildMarketListings(guildMarketFilters);

  const totalValue = allListings.reduce((sum, item) => sum + (item.salePriceUEC || 0), 0);
  const interGuildCount = allListings.filter(i => i.saleScope === 'inter_guild' || i.saleScope === 'public').length;
  const barterCount = allListings.filter(i => Boolean(i.barterOffer && i.barterOffer.trim().length > 0)).length;

  const countEl = document.getElementById('gMarketKpiCount');
  if (countEl) countEl.textContent = allListings.length;

  const valEl = document.getElementById('gMarketKpiTotalValue');
  if (valEl) valEl.textContent = `${totalValue.toLocaleString('fr-FR')} aUEC`;

  const interEl = document.getElementById('gMarketKpiInterGuild');
  if (interEl) interEl.textContent = interGuildCount;

  const barterEl = document.getElementById('gMarketKpiBarter');
  if (barterEl) barterEl.textContent = barterCount;

  const grid = document.getElementById('guildMarketGrid');
  if (!grid) return;

  if (filteredListings.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding:40px; text-align:center; background:var(--bg-card); border-radius:8px; border:1px dashed var(--border-medium); color:var(--text-dim);">
        <div style="font-size:2rem; margin-bottom:8px;">🏪</div>
        <div style="font-weight:700; color:#fff; font-size:1rem;">Aucune offre correspondant aux critères</div>
        <div style="font-size:0.8rem; margin-top:4px;">Modifiez les filtres ou inventoriez des équipements pour les proposer à la guilde.</div>
        <button type="button" class="vo-btn primary" id="btnMarketAddEquip" style="margin-top:14px; font-size:0.8rem;">
          ＋ Mettre un équipement en vente
        </button>
      </div>
    `;
    document.getElementById('btnMarketAddEquip')?.addEventListener('click', openAddEquipmentModal);
    return;
  }

  const currentUser = store.get('profile') || {};
  const currentCallsign = (currentUser.callsign || 'VORTEX-1').toUpperCase();

  grid.innerHTML = filteredListings.map(item => {
    const isReserved = item.saleStatus === 'reserved';
    const isOwner = (item.ownerCallsign || '').toUpperCase() === currentCallsign;
    const originLabel = item.origin === 'crafted' ? '🛠 Crafté' : (item.origin === 'looted' ? '🏴‍☠️ Looté' : '🛒 Acheté');
    const originClass = item.origin || 'purchased';

    const priceText = item.salePriceUEC > 0 ? `${item.salePriceUEC.toLocaleString('fr-FR')} aUEC` : 'Devis';
    const catalogComparison = item.catalogReferencePriceUEC > 0
      ? `Neuf FleetYards : ${item.catalogReferencePriceUEC.toLocaleString('fr-FR')} aUEC`
      : 'Pièce spéciale';

    const scopeBadge = item.saleScope === 'inter_guild'
      ? '<span class="vo-badge cyan" style="font-size:0.68rem;">🌐 Inter-Guilde</span>'
      : '<span class="vo-badge amber" style="font-size:0.68rem;">🏛 Interne NMC</span>';

    const statusBadge = isReserved
      ? `<span class="sale-badge reserved" style="font-size:0.7rem;">RÉSERVÉ ${item.reservedByCallsign ? `par @${item.reservedByCallsign}` : ''}</span>`
      : `<span class="sale-badge for-sale" style="font-size:0.7rem;">DISPONIBLE</span>`;

    const barterBlock = item.barterOffer ? `
      <div class="market-card-barter">
        <strong>🔄 Troc proposé :</strong> « ${item.barterOffer} »
      </div>
    ` : '';

    let actionBtnHtml = '';
    if (isOwner) {
      actionBtnHtml = `
        <button type="button" class="vo-btn outline btn-card-edit-sale" data-item-id="${item.id}" style="font-size:0.72rem; padding:4px 10px;">
          ✏️ Mon offre
        </button>
      `;
    } else if (isReserved) {
      actionBtnHtml = `
        <button type="button" class="vo-btn outline btn-card-cancel-reserve" data-item-id="${item.id}" style="font-size:0.72rem; padding:4px 10px; color:var(--accent-amber);">
          Annuler réservation
        </button>
      `;
    } else {
      actionBtnHtml = `
        <button type="button" class="vo-btn primary btn-card-reserve" data-item-id="${item.id}" style="font-size:0.72rem; padding:4px 12px;">
          🤝 Réserver
        </button>
      `;
    }

    const sizeGrade = [item.size ? `S${item.size}` : null, item.grade ? `Grade ${item.grade}` : null].filter(Boolean).join(' · ');

    let qualityBadgeHtml = '';
    const qVal = typeof item.materialQuality === 'number'
      ? item.materialQuality
      : (typeof item.metadata?.materialQuality === 'number' ? item.metadata.materialQuality : null);
    if (qVal !== null && craftingService.getQualityTier) {
      const qTier = craftingService.getQualityTier(qVal);
      qualityBadgeHtml = `<span class="quality-badge ${qTier.badgeClass}" title="${qTier.name} · Score Q${qVal}/1000">⭐ Q${qVal} ${qTier.shortName}</span>`;
    }

    return `
      <div class="guild-market-card ${isReserved ? 'is-reserved' : ''}">
        <div>
          <div class="market-card-top">
            <div>
              <div class="market-card-title">${item.name}</div>
              <div class="market-card-meta">
                <span class="origin-badge ${originClass}">${originLabel}</span>
                ${qualityBadgeHtml}
                ${sizeGrade ? `<span class="vo-badge" style="font-size:0.68rem; color:var(--text-muted);">${sizeGrade}</span>` : ''}
                ${scopeBadge}
              </div>
            </div>
            <div>${statusBadge}</div>
          </div>

          ${item.metadata?.craftStats ? `<div style="font-size:0.72rem; color:var(--accent-green); margin-top:6px; font-family:var(--font-mono); background:rgba(34,197,94,0.08); padding:4px 8px; border-radius:4px; border:1px solid rgba(34,197,94,0.2);">${item.metadata.craftStats}</div>` : ''}

          <div style="margin-top:10px;" class="market-card-price-box">
            <div>
              <div style="font-size:0.68rem; color:var(--text-dim); text-transform:uppercase;">Prix demandé</div>
              <div class="market-card-price-val">${priceText}</div>
            </div>
            <div style="text-align:right;">
              <div class="market-card-catalog-ref">${catalogComparison}</div>
              <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">📍 ${item.locationId}</div>
            </div>
          </div>

          ${barterBlock}
        </div>

        <div class="market-card-bottom">
          <div class="market-card-seller">
            <span style="font-size:0.9rem;">👤</span>
            <span>Vendeur : <strong>@${item.ownerCallsign || 'PILOTE'}</strong></span>
          </div>
          <div>
            ${actionBtnHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind actions
  grid.querySelectorAll('.btn-card-reserve').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-item-id');
      const item = inventoryService.getItemById(id);
      if (item) {
        guildService.reserveItem(id, currentCallsign);
        showToast(`✓ Option posée sur "${item.name}" auprès de @${item.ownerCallsign || 'Vendeur'} !`);
        renderGuildMarket();
      }
    });
  });

  grid.querySelectorAll('.btn-card-cancel-reserve').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-item-id');
      guildService.cancelReservation(id);
      showToast('Réservation annulée. Lot remis en vente.');
      renderGuildMarket();
    });
  });

  grid.querySelectorAll('.btn-card-edit-sale').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-item-id');
      if (id) openEditSaleModal(id);
    });
  });
}

function switchGuildSubTab(gtab) {
  const overview = document.getElementById('guildOverviewSubView');
  const market = document.getElementById('guildMarketSubView');

  document.querySelectorAll('#viewGuild [data-gtab]').forEach(btn => {
    const isTarget = btn.getAttribute('data-gtab') === gtab;
    btn.classList.toggle('primary', isTarget);
    btn.classList.toggle('outline', !isTarget);
  });

  if (gtab === 'market') {
    if (overview) overview.style.display = 'none';
    if (market) market.style.display = 'block';
    renderGuildMarket();
  } else {
    if (overview) overview.style.display = 'block';
    if (market) market.style.display = 'none';
  }
}

function openOCRDrawer() {
  openInspector({
    title: 'Import OCR de Terminal',
    subtitle: 'Capture terminal_ARC-L1.png · reconnaissance optique',
    body: `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="border:2px dashed rgba(255,255,255,0.15); padding:24px; text-align:center; border-radius:6px; background:rgba(255,255,255,0.02); cursor:pointer;">
          <div style="font-size:1.6rem; margin-bottom:6px;">📸</div>
          <div style="font-weight:600; color:#fff; font-size:0.85rem;">capture_terminal_ARC-L1.png</div>
          <div style="font-size:0.75rem; color:var(--text-dim); margin-top:2px;">Terminal de raffinage ARC-L1 · Reconnu</div>
        </div>

        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">LIGNES EXTRAITES :</div>
        <table class="vo-table">
          <thead>
            <tr>
              <th>Minerai</th>
              <th>Volume</th>
              <th>Confiance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="val-bold">Laranite</td>
              <td class="val-green">12,4 SCU</td>
              <td><span class="vo-badge green">98 %</span></td>
            </tr>
            <tr>
              <td class="val-bold">Copper</td>
              <td class="val-green">8,0 SCU</td>
              <td><span class="vo-badge green">96 %</span></td>
            </tr>
            <tr style="background:rgba(245,158,11,0.12);">
              <td class="val-bold" style="color:var(--accent-amber);">Bexalite ?</td>
              <td style="font-weight:700; color:var(--accent-amber);">3,? SCU</td>
              <td><span class="vo-badge amber">61 % (à vérifier)</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    footer: `
      <button type="button" class="vo-btn primary" id="btnConfirmOCRModal" style="width:100%;">
        Valider et synchroniser l'inventaire
      </button>
    `
  });

  document.getElementById('btnConfirmOCRModal')?.addEventListener('click', () => {
    showToast('✓ 20.4 SCU importés avec succès depuis ARC-L1 !');
    closeInspector();
    renderInventoryTable();
  });
}

// ============================================================================
// 6. RENDU : CALCULATEUR DE ROCHER & MINAGE (AARON MFD)
// Connecté en temps réel au vaisseau actif, à ses tourelles, lasers et modules
// ============================================================================
// ============================================================================
// 6. CALCULATEUR MINIER AARON MFD (SCANNER GÉOLOGIQUE SC 4.10.2)
// Type de roche (Archétypes), 1 ou 2 minerais max + matériaux inertes automatiques
// ============================================================================
let currentMiningScan = {
  presetId: 'quantainium',
  archetypeId: 'basalt',
  massKg: 18420,
  resistance: 65,
  instability: 75,
  radarSignature: 3170,
  densityCategory: 'High',
  primaryQualityOptions: [550, 950],
  selectedQualityIndex: 1, // 0: Standard, 1: Haute / Riche
  quality: 950,
  mineral1Id: 'quantainium',
  pct1: 28,
  mineral2Id: 'beryl',
  pct2: 14,
  mineral3Id: null,
  pct3: 0,
  composition: miningCalc.buildRockComposition('quantainium', 28, 'beryl', 14, null, 0)
};

/**
 * Applique un preset officiel géologique SC 4.0 avec compositions liées et 2 qualités primaires
 */
function applyFrontierMiningPreset(presetId, qualityIndex = null) {
  const preset = getFrontierPreset(presetId);
  if (!preset) return;

  currentMiningScan.presetId = preset.id;
  currentMiningScan.mineral1Id = preset.primaryId;
  currentMiningScan.mineral2Id = preset.secondaryId || null;
  currentMiningScan.mineral3Id = preset.tertiaryId || null;
  currentMiningScan.radarSignature = preset.radarSignature;
  currentMiningScan.instability = preset.instabilityPct;
  currentMiningScan.resistance = preset.resistancePct;
  currentMiningScan.densityCategory = preset.density;
  currentMiningScan.primaryQualityOptions = [...preset.qualities];

  if (qualityIndex !== null && qualityIndex >= 0 && qualityIndex < preset.qualities.length) {
    currentMiningScan.selectedQualityIndex = qualityIndex;
  } else if (currentMiningScan.selectedQualityIndex == null || currentMiningScan.selectedQualityIndex >= preset.qualities.length) {
    currentMiningScan.selectedQualityIndex = 1;
  }
  currentMiningScan.quality = currentMiningScan.primaryQualityOptions[currentMiningScan.selectedQualityIndex] ?? preset.qualities[1];

  // Ajustement de pourcentages initiaux selon le nombre de minerais
  if (currentMiningScan.mineral3Id) {
    currentMiningScan.pct1 = 30;
    currentMiningScan.pct2 = 14;
    currentMiningScan.pct3 = 8;
  } else if (currentMiningScan.mineral2Id) {
    currentMiningScan.pct1 = 32;
    currentMiningScan.pct2 = 16;
    currentMiningScan.pct3 = 0;
  } else {
    currentMiningScan.pct1 = 45;
    currentMiningScan.pct2 = 0;
    currentMiningScan.pct3 = 0;
  }

  currentMiningScan.composition = miningCalc.buildRockComposition(
    currentMiningScan.mineral1Id,
    currentMiningScan.pct1,
    currentMiningScan.mineral2Id,
    currentMiningScan.pct2,
    currentMiningScan.mineral3Id,
    currentMiningScan.pct3
  );
}

let currentMiningFiringMode = 'all'; // 't1', 't1_t2', ou 'all'
let quantaniumTimerInterval = null;
let quantaniumSecondsLeft = 15 * 60; // 15:00 par défaut

function renderMiningActiveShipBanner() {
  const activeShipEntry = fleetService.getActiveShip();
  const cap = miningCalc.computeShipMiningCapabilities(activeShipEntry, currentMiningFiringMode);

  const nameEl = document.getElementById('miningBannerShipName');
  const cargoBadge = document.getElementById('miningBannerCargoBadge');
  const summaryEl = document.getElementById('miningBannerTurretsSummary');
  const powerBadge = document.getElementById('miningBannerPowerBadge');
  const resBadge = document.getElementById('miningBannerResBadge');
  const optWinBadge = document.getElementById('miningBannerOptWinBadge');
  const firingContainer = document.getElementById('miningFiringModeContainer');

  if (nameEl) {
    nameEl.textContent = `${cap.shipName} « ${cap.nickname} »`;
  }
  if (cargoBadge) {
    cargoBadge.textContent = `Soute : ${cap.cargoSCU} SCU`;
  }
  if (powerBadge) {
    powerBadge.textContent = `⚡ ${cap.totalPowerWatts.toLocaleString('fr-FR')} W`;
  }
  if (resBadge) {
    resBadge.textContent = `🛡 -${cap.resistanceReductionPct}% rés.`;
  }
  if (optWinBadge) {
    optWinBadge.textContent = `🎯 Fenêtre ${cap.optimalWindowModPct >= 0 ? '+' : ''}${cap.optimalWindowModPct}%`;
  }

  if (summaryEl) {
    if (cap.turrets && cap.turrets.length > 0) {
      summaryEl.textContent = cap.turrets.map(t => {
        const prefix = cap.turrets.length > 1 ? `T${t.index}` : 'Tête';
        const mods = t.modules.length ? ` [${t.modules.join(', ')}]` : '';
        const op = t.operator ? ` (${t.operator})` : '';
        return `${prefix}: ${t.laserName}${mods}${op}`;
      }).join(' · ');
    } else {
      summaryEl.textContent = 'Aucune tête laser équipée (Vaisseau de support / fret)';
    }
  }

  // Sélecteur multi-tourelles pour MOLE, Arrastra, Orion
  if (firingContainer) {
    if (cap.turretCount > 1) {
      firingContainer.style.display = 'flex';
      firingContainer.querySelectorAll('.firing-chip').forEach(btn => {
        const mode = btn.getAttribute('data-mode');
        btn.classList.toggle('active', mode === currentMiningFiringMode);
      });
    } else {
      firingContainer.style.display = 'none';
    }
  }

  return cap;
}

let isMiningMineralsPopulated = false;
function populateMiningMineralSelects() {
  const m1Select = document.getElementById('miningMineral1Select');
  const m2Select = document.getElementById('miningMineral2Select');
  const m3Select = document.getElementById('miningMineral3Select');
  const presetSelect = document.getElementById('miningPresetSelect');
  if (!m1Select || !m2Select || isMiningMineralsPopulated) return;

  const sortedMinerals = [...MINERALS].sort((a, b) => {
    const nameA = (a.name_fr || a.name || '').toLowerCase();
    const nameB = (b.name_fr || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // 1. Présélections géologiques SC 4.0
  if (presetSelect && Array.isArray(FRONTIER_MINEABLES)) {
    presetSelect.innerHTML = FRONTIER_MINEABLES.map(p => {
      const comps = [p.name, p.secondaryName, p.tertiaryName].filter(Boolean).join(' + ');
      return `<option value="${p.id}">${p.name} · RS ${p.radarSignature.toLocaleString('fr-FR')} (${comps})</option>`;
    }).join('');
  }

  // 2. Sélecteurs individuels de composants
  const m1OptionsHtml = sortedMinerals.map(m => {
    const sym = m.symbol ? ` [${m.symbol}]` : '';
    const vol = m.isVolatile ? ' ⚠️' : '';
    return `<option value="${m.id}">${m.name_fr || m.name}${sym}${vol} · ${m.rawPrice} aUEC</option>`;
  }).join('');
  m1Select.innerHTML = m1OptionsHtml;

  const m2OptionsHtml = '<option value="">— Aucun (Rocher mono-minerai) —</option>' + sortedMinerals.map(m => {
    const sym = m.symbol ? ` [${m.symbol}]` : '';
    const vol = m.isVolatile ? ' ⚠️' : '';
    return `<option value="${m.id}">${m.name_fr || m.name}${sym}${vol} · ${m.rawPrice} aUEC</option>`;
  }).join('');
  m2Select.innerHTML = m2OptionsHtml;

  if (m3Select) {
    const m3OptionsHtml = '<option value="">— Aucun —</option>' + sortedMinerals.map(m => {
      const sym = m.symbol ? ` [${m.symbol}]` : '';
      const vol = m.isVolatile ? ' ⚠️' : '';
      return `<option value="${m.id}">${m.name_fr || m.name}${sym}${vol} · ${m.rawPrice} aUEC</option>`;
    }).join('');
    m3Select.innerHTML = m3OptionsHtml;
  }

  isMiningMineralsPopulated = true;
}

function renderMiningScannerUI() {
  populateMiningMineralSelects();

  // 1. Presets Géologiques (Compositions Liées SC 4.0)
  const presetSelect = document.getElementById('miningPresetSelect');
  const presetRsBadge = document.getElementById('miningPresetRsBadge');
  const presetDensityBadge = document.getElementById('miningPresetDensityBadge');
  const presetCompsDesc = document.getElementById('miningPresetCompsDesc');

  const curPreset = getFrontierPreset(currentMiningScan.presetId || currentMiningScan.mineral1Id);
  if (presetSelect && curPreset) {
    presetSelect.value = curPreset.id;
  }
  if (presetRsBadge) {
    const rsVal = curPreset?.radarSignature || currentMiningScan.radarSignature;
    presetRsBadge.textContent = rsVal ? `RS ${rsVal.toLocaleString('fr-FR')}` : 'RS —';
  }
  if (presetDensityBadge) {
    const densVal = curPreset?.density || currentMiningScan.densityCategory || 'Medium';
    const densLabel = densVal === 'High' ? 'Densité Élevée' : (densVal === 'Low' ? 'Densité Faible' : 'Densité Moyenne');
    presetDensityBadge.textContent = densLabel;
    presetDensityBadge.className = `vo-badge ${densVal === 'High' ? 'cyan' : (densVal === 'Low' ? 'gray' : 'amber')}`;
  }
  if (presetCompsDesc && curPreset) {
    const c1 = curPreset.name;
    const c2 = curPreset.secondaryName || 'Aucun';
    const c3 = curPreset.tertiaryName || 'Aucun';
    presetCompsDesc.textContent = `Composition liée : 1. ${c1} · 2. ${c2} · 3. ${c3}`;
  }

  // 2. Sélecteur des 2 Qualités de la roche Primary
  const q0 = currentMiningScan.primaryQualityOptions?.[0] ?? (curPreset?.qualities[0] || 500);
  const q1 = currentMiningScan.primaryQualityOptions?.[1] ?? (curPreset?.qualities[1] || 850);
  const isQ0 = currentMiningScan.selectedQualityIndex === 0;

  const btnQ1 = document.getElementById('btnPrimaryQual1');
  const btnQ2 = document.getElementById('btnPrimaryQual2');
  const labelQ1 = document.getElementById('labelPrimaryQual1Val');
  const labelQ2 = document.getElementById('labelPrimaryQual2Val');
  const primaryQBadge = document.getElementById('miningPrimaryQualityBadge');

  if (labelQ1) labelQ1.textContent = `Q${q0}`;
  if (labelQ2) labelQ2.textContent = `Q${q1}`;

  if (btnQ1) {
    btnQ1.classList.toggle('active', isQ0);
    btnQ1.style.borderColor = isQ0 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.15)';
    btnQ1.style.background = isQ0 ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.03)';
  }
  if (btnQ2) {
    btnQ2.classList.toggle('active', !isQ0);
    btnQ2.style.borderColor = !isQ0 ? 'var(--accent-green)' : 'rgba(255,255,255,0.15)';
    btnQ2.style.background = !isQ0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)';
  }

  const curQ = typeof currentMiningScan.quality === 'number' ? currentMiningScan.quality : (isQ0 ? q0 : q1);
  if (primaryQBadge && craftingService.getQualityTier) {
    const tier = craftingService.getQualityTier(curQ);
    primaryQBadge.className = `quality-badge ${tier.badgeClass}`;
    primaryQBadge.textContent = `⭐ Q${curQ} ${tier.shortName}`;
  }

  // 3. Archétype de roche géologique
  const rockSelect = document.getElementById('miningRockTypeSelect');
  const rockBadge = document.getElementById('miningRockTypeBadge');
  const rockNotes = document.getElementById('miningRockTypeNotes');

  if (rockSelect && currentMiningScan.archetypeId) {
    rockSelect.value = currentMiningScan.archetypeId;
  }

  const arch = (miningCalc.ROCK_ARCHETYPES_CONFIG || []).find(a => a.id === currentMiningScan.archetypeId);
  if (arch) {
    if (rockNotes) rockNotes.textContent = arch.notes_fr;
    if (rockBadge) {
      if (arch.baseResistance > 50) {
        rockBadge.textContent = 'Haute Résistance';
        rockBadge.className = 'vo-badge amber';
      } else if (arch.baseInstability > 50) {
        rockBadge.textContent = 'Haute Instabilité';
        rockBadge.className = 'vo-badge red';
      } else {
        rockBadge.textContent = 'Densité Élevée';
        rockBadge.className = 'vo-badge cyan';
      }
    }
  }

  // 4. Paramètres physiques
  const massInput = document.getElementById('miningInputMass');
  const massSlider = document.getElementById('miningSliderMass');
  if (massInput && massInput !== document.activeElement) massInput.value = currentMiningScan.massKg;
  if (massSlider && massSlider !== document.activeElement) massSlider.value = Math.min(60000, currentMiningScan.massKg);

  const instInput = document.getElementById('miningInputInstability');
  const instSlider = document.getElementById('miningSliderInstability');
  const instBadge = document.getElementById('miningInstabilityBadge');
  if (instInput && instInput !== document.activeElement) instInput.value = currentMiningScan.instability;
  if (instSlider && instSlider !== document.activeElement) instSlider.value = currentMiningScan.instability;
  if (instBadge) {
    instBadge.textContent = currentMiningScan.instability > 50 ? 'Haute' : (currentMiningScan.instability > 25 ? 'Moyenne' : 'Basse');
    instBadge.className = `vo-badge ${currentMiningScan.instability > 50 ? 'red' : (currentMiningScan.instability > 25 ? 'amber' : 'green')}`;
  }

  const resInput = document.getElementById('miningInputResistance');
  const resSlider = document.getElementById('miningSliderResistance');
  if (resInput && resInput !== document.activeElement) resInput.value = currentMiningScan.resistance;
  if (resSlider && resSlider !== document.activeElement) resSlider.value = currentMiningScan.resistance;

  // Qualité du matériau géologique (slider / input alternatif)
  const qInput = document.getElementById('miningInputQuality');
  const qSlider = document.getElementById('miningSliderQuality');
  const qBadge = document.getElementById('miningQualityBadge');
  if (qInput && qInput !== document.activeElement) qInput.value = curQ;
  if (qSlider && qSlider !== document.activeElement) qSlider.value = curQ;
  if (qBadge && craftingService.getQualityTier) {
    const tier = craftingService.getQualityTier(curQ);
    qBadge.className = `quality-badge ${tier.badgeClass}`;
    qBadge.textContent = `⭐ Q${curQ} ${tier.shortName}`;
  }
  document.querySelectorAll('.mining-quality-preset-btn[data-quality]').forEach(btn => {
    const qVal = Number(btn.getAttribute('data-quality'));
    btn.classList.toggle('active', Math.abs(qVal - curQ) < 30);
  });

  // 5. Composants 1, 2 et 3
  const m1Select = document.getElementById('miningMineral1Select');
  const pct1Input = document.getElementById('miningPct1Input');
  const pct1Slider = document.getElementById('miningPct1Slider');
  const comp1Dot = document.getElementById('miningComp1Dot');

  const m2Select = document.getElementById('miningMineral2Select');
  const pct2Input = document.getElementById('miningPct2Input');
  const pct2Slider = document.getElementById('miningPct2Slider');
  const comp2Dot = document.getElementById('miningComp2Dot');
  const comp2Container = document.getElementById('miningComp2Container');

  const m3Select = document.getElementById('miningMineral3Select');
  const pct3Input = document.getElementById('miningPct3Input');
  const pct3Slider = document.getElementById('miningPct3Slider');
  const comp3Dot = document.getElementById('miningComp3Dot');
  const comp3Container = document.getElementById('miningComp3Container');

  const min1 = MINERALS.find(m => m.id === currentMiningScan.mineral1Id) || MINERALS[0];
  if (m1Select) m1Select.value = currentMiningScan.mineral1Id;
  if (pct1Input && pct1Input !== document.activeElement) pct1Input.value = currentMiningScan.pct1;
  if (pct1Slider && pct1Slider !== document.activeElement) pct1Slider.value = currentMiningScan.pct1;
  if (comp1Dot) comp1Dot.style.backgroundColor = min1?.color || 'var(--accent-purple)';

  const hasComp2 = Boolean(currentMiningScan.mineral2Id);
  const min2 = hasComp2 ? MINERALS.find(m => m.id === currentMiningScan.mineral2Id) : null;
  if (m2Select) m2Select.value = currentMiningScan.mineral2Id || '';

  if (pct2Input) {
    pct2Input.disabled = !hasComp2;
    if (pct2Input !== document.activeElement) pct2Input.value = hasComp2 ? currentMiningScan.pct2 : 0;
  }
  if (pct2Slider) {
    pct2Slider.disabled = !hasComp2;
    if (pct2Slider !== document.activeElement) pct2Slider.value = hasComp2 ? currentMiningScan.pct2 : 0;
  }
  if (comp2Dot) comp2Dot.style.backgroundColor = hasComp2 ? (min2?.color || 'var(--accent-cyan)') : '#64748b';
  if (comp2Container) {
    comp2Container.style.opacity = hasComp2 ? '1' : '0.6';
  }

  const hasComp3 = Boolean(currentMiningScan.mineral3Id);
  const min3 = hasComp3 ? MINERALS.find(m => m.id === currentMiningScan.mineral3Id) : null;
  if (m3Select) m3Select.value = currentMiningScan.mineral3Id || '';

  if (pct3Input) {
    pct3Input.disabled = !hasComp3;
    if (pct3Input !== document.activeElement) pct3Input.value = hasComp3 ? currentMiningScan.pct3 : 0;
  }
  if (pct3Slider) {
    pct3Slider.disabled = !hasComp3;
    if (pct3Slider !== document.activeElement) pct3Slider.value = hasComp3 ? currentMiningScan.pct3 : 0;
  }
  if (comp3Dot) comp3Dot.style.backgroundColor = hasComp3 ? (min3?.color || 'var(--accent-purple)') : '#64748b';
  if (comp3Container) {
    comp3Container.style.opacity = hasComp3 ? '1' : '0.6';
  }

  // 6. Inerte & pureté (100 - Pct1 - Pct2 - Pct3)
  const usefulPct = Math.round((currentMiningScan.pct1 + (hasComp2 ? currentMiningScan.pct2 : 0) + (hasComp3 ? currentMiningScan.pct3 : 0)) * 10) / 10;
  const inertPct = Math.max(0, Math.round((100 - usefulPct) * 10) / 10);
  const inertLabel = document.getElementById('miningInertPctLabel');
  const inertBar = document.getElementById('miningInertBar');
  if (inertLabel) inertLabel.textContent = `${inertPct} %`;
  if (inertBar) inertBar.style.width = `${inertPct}%`;

  // 7. Rendu du HUD scanner (barres SC 4.10.2)
  const hudContainer = document.getElementById('miningHudBarsContainer');
  if (hudContainer) {
    hudContainer.innerHTML = currentMiningScan.composition.map(item => `
      <div style="display:flex; flex-direction:column; gap:2px;">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
          <span style="font-weight:600; color:${item.color || '#fff'}; display:flex; align-items:center; gap:5px;">
            <span class="comp-dot" style="background-color:${item.color || '#94a3b8'}; width:7px; height:7px;"></span>
            ${item.name}${item.isVolatile ? ' <span class="vo-badge red" style="font-size:0.6rem; padding:1px 4px;">VOLATILE</span>' : ''}
          </span>
          <span style="font-weight:700; color:#fff; font-size:0.8rem;">${item.pct} %</span>
        </div>
        <div class="vo-progress-track" style="width:100%; height:7px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
          <div class="vo-progress-bar" style="width:${Math.max(0, Math.min(100, item.pct))}%; background-color:${item.color || 'var(--accent-cyan)'}; height:100%; transition:width 0.2s ease;"></div>
        </div>
      </div>
    `).join('');
  }

  const purityLabel = document.getElementById('miningPurityLabel');
  if (purityLabel) {
    purityLabel.textContent = `Pureté utile : ${usefulPct} %`;
    purityLabel.style.color = usefulPct >= 30 ? 'var(--accent-green)' : (usefulPct >= 15 ? 'var(--accent-cyan)' : 'var(--text-muted)');
  }

  const totalStatusLabel = document.getElementById('miningTotalStatusLabel');
  if (totalStatusLabel) {
    const total = Math.round((usefulPct + inertPct) * 10) / 10;
    if (total === 100) {
      totalStatusLabel.textContent = 'Total : 100 % (Équilibré)';
      totalStatusLabel.style.color = 'var(--text-muted)';
    } else {
      totalStatusLabel.textContent = `Total : ${total} %`;
      totalStatusLabel.style.color = 'var(--accent-amber)';
    }
  }
}

function evaluateAndRenderMiningRock() {
  const activeShipEntry = fleetService.getActiveShip();
  const cap = miningCalc.computeShipMiningCapabilities(activeShipEntry, currentMiningFiringMode);
  const evalResult = miningCalc.calculateLiveRockEvaluation(currentMiningScan, cap);

  // 0. VERDICT TACTIQUE & RENTABILITÉ DE FRACTURE
  const prof = evalResult.profitability;
  if (prof) {
    const cardProf = document.getElementById('cardMiningProfitability');
    const vIcon = document.getElementById('miningVerdictIcon');
    const vTitle = document.getElementById('miningVerdictTitle');
    const vBadge = document.getElementById('miningVerdictBadge');
    const vScore = document.getElementById('miningProfitScoreBadge');
    const vDesc = document.getElementById('miningVerdictDesc');
    const mNet = document.getElementById('miningMetricNetGain');
    const mUnit = document.getElementById('miningMetricUnitValue');
    const mDiag = document.getElementById('miningMetricDiagnostic');

    if (cardProf) {
      cardProf.className = `vo-card mining-verdict-card status-${prof.status}`;
    }
    if (vIcon) vIcon.textContent = prof.icon;
    if (vTitle) {
      vTitle.textContent = prof.title;
      vTitle.style.color = (prof.status === 'great' || prof.status === 'good')
        ? 'var(--accent-green)'
        : (prof.status === 'meh' ? 'var(--accent-amber)' : 'var(--accent-red)');
    }
    if (vBadge) {
      vBadge.textContent = prof.badgeText;
      vBadge.className = `vo-badge ${prof.badgeClass}`;
    }
    if (vScore) {
      vScore.textContent = `Score : ${prof.profitScore} / 100`;
    }
    if (vDesc) {
      vDesc.textContent = prof.desc;
      vDesc.style.borderLeftColor = (prof.status === 'great' || prof.status === 'good')
        ? 'var(--accent-green)'
        : (prof.status === 'meh' ? 'var(--accent-amber)' : 'var(--accent-red)');
    }
    if (mNet) {
      if (evalResult.oreLossRiskPct > 0 && prof.bestRefinedNet > 0) {
        mNet.innerHTML = `+${prof.bestRefinedNet.toLocaleString('fr-FR')} aUEC <span style="font-size:0.7rem; font-weight:600; color:var(--accent-amber); display:block;">(~+${evalResult.volatileNetUEC.toLocaleString('fr-FR')} si instable)</span>`;
      } else {
        mNet.textContent = prof.bestRefinedNet > 0 ? `+${prof.bestRefinedNet.toLocaleString('fr-FR')} aUEC` : '0 aUEC';
      }
      mNet.style.color = prof.isProfitable ? 'var(--accent-green)' : 'var(--accent-red)';
    }
    if (mUnit) {
      mUnit.textContent = `${prof.unitValuePerSCU.toLocaleString('fr-FR')} aUEC / SCU`;
    }
    if (mDiag) {
      mDiag.textContent = prof.tacticalDiagnostic;
      mDiag.title = prof.tacticalDiagnostic;
    }
  }

  // Résistance effective & pénétration laser
  const effResLabel = document.getElementById('miningEffectiveResLabel');
  if (effResLabel) {
    effResLabel.innerHTML = `🛡 Résistance effective : <strong style="color:#fff;">${evalResult.effectiveResistance} %</strong> (Pénétration : <strong style="color:var(--accent-cyan);">${evalResult.penetrationPct} %</strong> · <strong style="color:var(--accent-green);">${evalResult.effectiveLaserPower.toLocaleString('fr-FR')} W</strong> transmis)`;
  }

  // Instabilité effective & Fenêtre verte (SC 4.x - Modèle dynamique)
  const effInstLabel = document.getElementById('miningEffectiveInstabilityLabel');
  if (effInstLabel) {
    effInstLabel.innerHTML = `<span>Zone verte : <strong style="color:var(--accent-${evalResult.windowClass || 'cyan'});">${evalResult.optimalWindowPct} % (${evalResult.windowLabel})</strong></span> <span class="vo-badge ${evalResult.dangerClass || 'cyan'}" style="font-size:0.65rem; padding:1px 5px;">${evalResult.dangerBadge}</span>`;
  }

  const oreLossLabel = document.getElementById('miningOreLossWarningLabel');
  if (oreLossLabel) {
    if (evalResult.oreLossRiskPct > 0) {
      oreLossLabel.innerHTML = `<span>Pertes de minerai (éclatement) : <strong style="color:var(--accent-red); font-weight:800;">-${evalResult.oreLossRiskPct} % (-${evalResult.estimatedOreLossUEC.toLocaleString('fr-FR')} aUEC)</strong></span> <span>Oscillations : <strong>±${evalResult.bounceAmplitudePct} %</strong></span>`;
    } else {
      oreLossLabel.innerHTML = `<span>Pertes de minerai (éclatement) : <strong style="color:var(--accent-green);">0 % (Rendement Intact)</strong></span> <span>Oscillations : <strong>±${evalResult.bounceAmplitudePct} %</strong></span>`;
    }
  }

  // Conseils Tactiques (Loadout & Gadgets)
  const tacticalBadge = document.getElementById('miningOreLossBadge');
  const tacticalContent = document.getElementById('miningTacticalAdvisoryContent');
  if (tacticalBadge) {
    if (evalResult.oreLossRiskPct > 0) {
      tacticalBadge.className = `vo-badge ${evalResult.oreLossRiskPct >= 20 ? 'red' : 'amber'}`;
      tacticalBadge.textContent = `-${evalResult.oreLossRiskPct} % Pertes sans stabilisateur`;
    } else {
      tacticalBadge.className = 'vo-badge green';
      tacticalBadge.textContent = 'Rendement 100 % (Optimal)';
    }
  }
  if (tacticalContent) {
    if (evalResult.countermeasures && evalResult.countermeasures.length > 0) {
      tacticalContent.innerHTML = evalResult.countermeasures.map(cm => `
        <div style="margin-top:3px; padding-top:3px; border-top:1px solid rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:1px;">
          <div style="font-weight:700; color:#fff; display:flex; align-items:center; gap:5px;">
            <span>${cm.icon}</span>
            <span style="color:var(--accent-cyan);">${cm.category} :</span>
            <span style="color:var(--accent-amber);">${cm.equipment}</span>
          </div>
          <div style="font-size:0.71rem; color:var(--text-dim);">${cm.advice}</div>
        </div>
      `).join('');
    } else {
      tacticalContent.innerHTML = '<span style="color:var(--accent-green);">✓ Paramètres de tir optimaux :</span> Ce rocher peut être fracturé avec votre configuration actuelle sans risque de perte de minerai ou de surtension explosive.';
    }
  }

  // 1. KPI Faisabilité
  const feasVal = document.getElementById('miningKpiFeasibilityVal');
  const feasSub = document.getElementById('miningKpiFeasibilitySub');
  const ratioLabel = document.getElementById('miningEnergyRatioLabel');
  const gaugeBar = document.getElementById('miningFractureGaugeBar');

  if (feasVal) {
    feasVal.textContent = evalResult.verdictLabel;
    feasVal.className = `kpi-main-val ${evalResult.verdictClass}`;
  }
  if (feasSub) {
    feasSub.textContent = evalResult.summaryText;
  }
  if (ratioLabel) {
    ratioLabel.textContent = `${Math.round(evalResult.powerRatio * 100)} % (Pén. ${evalResult.penetrationPct}%)`;
  }
  if (gaugeBar) {
    const pct = Math.min(100, Math.max(10, Math.round(evalResult.powerRatio * 80)));
    gaugeBar.style.width = `${pct}%`;
    gaugeBar.style.backgroundColor = evalResult.verdictClass === 'green'
      ? 'var(--accent-green)'
      : (evalResult.verdictClass === 'amber' ? 'var(--accent-amber)' : 'var(--accent-red)');
  }

  // 2. KPI Valeur Brute & Utilisation Soute
  const grossVal = document.getElementById('miningKpiGrossVal');
  const grossSub = document.getElementById('miningKpiGrossSub');
  const cargoBar = document.getElementById('miningKpiCargoBar');
  const cargoText = document.getElementById('miningKpiCargoText');

  if (grossVal) {
    grossVal.textContent = evalResult.rawGrossUEC.toLocaleString('fr-FR');
  }
  if (grossSub) {
    grossSub.textContent = `aUEC · ${evalResult.usefulSCU} SCU de minerai utile`;
  }
  if (cargoBar) {
    cargoBar.style.width = `${evalResult.cargoFillPct}%`;
    cargoBar.style.backgroundColor = evalResult.cargoOverflow ? 'var(--accent-red)' : 'var(--accent-cyan)';
  }
  if (cargoText) {
    cargoText.textContent = `Soute : ${evalResult.usefulSCU} / ${cap.cargoSCU} SCU (${evalResult.cargoFillPct} % de soute)${evalResult.cargoOverflow ? ' ⚠️ Dépassement soute !' : ''}`;
    cargoText.style.color = evalResult.cargoOverflow ? 'var(--accent-red)' : 'var(--text-muted)';
  }

  // 3. KPI Risque Quantainium
  const qStatus = document.getElementById('miningKpiQuantaStatus');
  const qSub = document.getElementById('miningKpiQuantaSub');
  const qCard = document.getElementById('cardKpiQuantanium');

  if (qStatus) {
    qStatus.textContent = evalResult.quantaniumRisk.label;
    qStatus.className = `kpi-main-val ${evalResult.quantaniumRisk.class}`;
  }
  if (qSub) {
    qSub.textContent = evalResult.quantaniumRisk.sub;
  }
  if (qCard) {
    if (evalResult.quantaniumRisk.class === 'red') {
      qCard.classList.add('pulse-red-glow');
    } else {
      qCard.classList.remove('pulse-red-glow');
    }
  }

  // 4. Tableau Vendre ou Raffiner ?
  const optStationBadge = document.getElementById('miningOptimalStationBadge');
  if (optStationBadge) {
    optStationBadge.textContent = `Station conseillée : ${evalResult.refineryMethods[0]?.location || 'CRU-L1'}`;
  }

  const tbody = document.getElementById('miningRefiningTableBody');
  if (tbody) {
    tbody.innerHTML = evalResult.refineryMethods.map(m => `
      <tr class="${m.highlight ? 'highlight-green-row' : ''}">
        <td class="val-bold" style="${m.highlight ? 'color:var(--accent-green);' : ''}">${m.option}</td>
        <td>${m.location}</td>
        <td>${m.yieldPct !== undefined ? `${m.yieldPct} %` : '—'}</td>
        <td>${m.durationText}</td>
        <td style="color:${m.cost < 0 ? 'var(--accent-amber)' : 'inherit'};">${m.cost !== 0 ? m.cost.toLocaleString('fr-FR') : '0'}</td>
        <td class="val-green">${m.net > 0 ? `+${m.net.toLocaleString('fr-FR')}` : m.net.toLocaleString('fr-FR')}</td>
        <td>${m.tag ? `<span class="vo-badge ${m.tagClass || 'green'}">${m.tag}</span>` : ''}</td>
      </tr>
    `).join('');
  }

  const btnRefine = document.getElementById('btnLaunchRefining');
  if (btnRefine) {
    btnRefine.textContent = `Lancer le raffinage à ${evalResult.refineryMethods[0]?.location || 'CRU-L1'}`;
  }

  // 5. Arbitrage Stratégique & Actions (Garder pour Craft vs Vendre Brut vs Raffiner & Vendre)
  const qa = evalResult.qualityArbitrage;
  if (qa) {
    const sIcon = document.getElementById('miningStratRecIcon');
    const sTitle = document.getElementById('miningStratRecTitle');
    const sBadge = document.getElementById('miningStratRecBadge');
    const sAlert = document.getElementById('miningStratAlert');
    const sRationale = document.getElementById('miningStratRationale');
    const sStatBonus = document.getElementById('miningStratStatBonus');

    if (sIcon) sIcon.textContent = qa.icon;
    if (sTitle) sTitle.textContent = qa.title;
    if (sBadge) {
      sBadge.textContent = qa.badgeText;
      sBadge.className = `vo-badge ${qa.badgeClass}`;
    }
    if (sAlert) {
      sAlert.className = `mining-strategic-alert ${qa.decision}`;
    }
    if (sRationale) {
      sRationale.textContent = qa.rationale;
    }
    if (sStatBonus) {
      sStatBonus.textContent = `⚡ Potentiel d'overclocking atelier : ${qa.statBonus}`;
      sStatBonus.style.color = qa.statBonusPct > 0 ? 'var(--accent-green)' : (qa.statBonusPct < 0 ? 'var(--accent-red)' : 'var(--accent-cyan)');
    }

    // Bouton 1 : Garder pour Craft
    const btnKeep = document.getElementById('btnMiningActionKeepCraft');
    const badgeKeepQ = document.getElementById('badgeActionKeepQuality');
    const labelKeepSCU = document.getElementById('labelActionKeepSCU');
    if (btnKeep) {
      if (qa.decision === 'craft') {
        btnKeep.classList.add('recommended');
      } else {
        btnKeep.classList.remove('recommended');
      }
    }
    if (badgeKeepQ) badgeKeepQ.textContent = `⭐ Q${qa.qualityScore}`;
    if (labelKeepSCU) labelKeepSCU.textContent = `+${evalResult.usefulSCU} SCU utiles stockés`;

    // Bouton 2 : Vendre Brut
    const btnSellRaw = document.getElementById('btnMiningActionSellRaw');
    const labelSellRawPrice = document.getElementById('labelActionSellRawPrice');
    if (btnSellRaw) {
      if (qa.decision === 'sell_raw') {
        btnSellRaw.classList.add('recommended');
      } else {
        btnSellRaw.classList.remove('recommended');
      }
    }
    if (labelSellRawPrice) {
      labelSellRawPrice.textContent = `+${evalResult.rawGrossUEC.toLocaleString('fr-FR')} aUEC cash`;
    }

    // Bouton 3 : Raffiner & Vendre
    const btnRefineSell = document.getElementById('btnMiningActionRefine');
    const badgeRefineYield = document.getElementById('badgeActionRefineYield');
    const labelRefineNet = document.getElementById('labelActionRefineNet');
    if (btnRefineSell) {
      if (qa.decision === 'refine_and_sell') {
        btnRefineSell.classList.add('recommended');
      } else {
        btnRefineSell.classList.remove('recommended');
      }
    }
    if (badgeRefineYield) {
      badgeRefineYield.textContent = `${evalResult.refineryMethods[0]?.yieldPct || 92}% Dinyx`;
    }
    if (labelRefineNet) {
      const bestNet = evalResult.refineryMethods[0]?.net || 0;
      labelRefineNet.textContent = `+${bestNet.toLocaleString('fr-FR')} aUEC net`;
    }

    const usefulBarSCU = document.getElementById('miningStatusBarUsefulSCU');
    if (usefulBarSCU) {
      usefulBarSCU.textContent = `${evalResult.usefulSCU} SCU utiles`;
    }
  }

  return evalResult;
}

function renderMiningScreen() {
  renderMiningActiveShipBanner();
  renderMiningScannerUI();
  evaluateAndRenderMiningRock();
}


function openMiningOCRModal() {
  const OCR_DETECTIONS = [
    {
      id: 'basalt',
      title: 'Basalte Volcanique · Quantainium 28 % / Bexalite 14 %',
      massKg: 18420,
      confidence: '99 %',
      badgeClass: 'green'
    },
    {
      id: 'granite',
      title: 'Granite Continental · Laranite 36 % / Agricium 16 %',
      massKg: 34500,
      confidence: '97 %',
      badgeClass: 'green'
    },
    {
      id: 'gneiss',
      title: 'Gneiss Métamorphique (Équilibré)',
      massKg: 14800,
      confidence: '95 %',
      badgeClass: 'cyan'
    }
  ];

  openInspector({
    title: 'Scan Optique OCR · Scanner Minier SC 4.x',
    subtitle: 'Reconnaissance HUD temps réel d\'astéroïde / roche',
    body: `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="border:2px dashed var(--accent-cyan); padding:20px; text-align:center; border-radius:6px; background:rgba(14,165,233,0.04); cursor:pointer;">
          <div style="font-size:2rem; margin-bottom:6px;">📡</div>
          <div style="font-weight:700; color:#fff; font-size:0.9rem;">scanner_rock_hud_042.png</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Scan optique de tourelle active · Stanton / Pyro</div>
        </div>

        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; letter-spacing:0.5px;">ROCHERS DÉTECTÉS DANS LE SCAN :</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${OCR_DETECTIONS.map((scan, idx) => `
            <button type="button" class="vo-card btn-ocr-choice" data-arch="${scan.id}" data-mass="${scan.massKg}" style="text-align:left; cursor:pointer; background:${idx === 0 ? 'rgba(14,165,233,0.1)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${idx === 0 ? 'var(--accent-cyan)' : 'var(--border-medium)'}; padding:10px 14px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="val-bold" style="color:var(--accent-cyan);">${scan.title}</span>
                <span class="vo-badge ${scan.badgeClass}">Confiance ${scan.confidence}</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${scan.massKg.toLocaleString('fr-FR')} kg · SC 4.10.2</div>
            </button>
          `).join('')}
        </div>
      </div>
    `,
    footer: `
      <button type="button" class="vo-btn primary" id="btnConfirmMiningOCR" style="width:100%;">
        Valider et importer le scan sélectionné
      </button>
    `
  });

  let selectedScan = OCR_DETECTIONS[0];
  document.querySelectorAll('.btn-ocr-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-ocr-choice').forEach(b => {
        b.style.borderColor = 'var(--border-medium)';
        b.style.background = 'rgba(255,255,255,0.02)';
      });
      btn.style.borderColor = 'var(--accent-cyan)';
      btn.style.background = 'rgba(14,165,233,0.1)';
      const archId = btn.getAttribute('data-arch');
      selectedScan = OCR_DETECTIONS.find(s => s.id === archId) || OCR_DETECTIONS[0];
    });
  });

  document.getElementById('btnConfirmMiningOCR')?.addEventListener('click', () => {
    const arch = (miningCalc.ROCK_ARCHETYPES_CONFIG || []).find(a => a.id === selectedScan.id);
    if (arch) {
      currentMiningScan.archetypeId = arch.id;
      currentMiningScan.massKg = selectedScan.massKg;
      currentMiningScan.resistance = arch.baseResistance;
      currentMiningScan.instability = arch.baseInstability;
      renderMiningScannerUI();
      evaluateAndRenderMiningRock();
    }
    triggerHaptic(12);
    showToast(`📷 Scan OCR importé : ${arch?.name || 'Roche'} (${currentMiningScan.massKg.toLocaleString('fr-FR')} kg)`);
    closeInspector();
  });
}

// ============================================================================
// 7. RENDU : CRAFT & BLUEPRINTS (AARON MFD ENRICHI)
// ============================================================================
// Blueprints unifiés : 42 recettes de minage d'origine + 1618 schémas officiels FleetYards
const CRAFT_SAMPLE_BLUEPRINTS = (function() {
  try {
    const list = craftingService.getBlueprints() || [];
    // Adapter le format pour l'affichage de l'atelier de craft AARON MFD
    return list.map((b, idx) => {
      const ings = (b.materials || b.ingredients || []).map(m => ({
        name: m.name_fr || m.name || m.mineralId || 'Composant',
        code: m.code || m.mineralId || m.slug || 'mat',
        quantity: m.scu || m.quantity || 1,
        unit: m.unit || 'SCU'
      }));

      const acqs = b.acquisitions || (b.obtaining ? [{
        type: 'Lieu',
        title: `${b.obtaining.location_fr || b.obtaining.location_en || 'Stanton'} · ${b.obtaining.faction_fr || 'Verse'}`
      }] : [{ type: 'Fabrication', title: 'Fabricator standard' }]);

      return {
        id: b.id,
        name: b.name,
        category: craftingService.resolveBlueprintCategory(b),
        size: b.size ? (typeof b.size === 'number' ? 'S' + b.size : b.size) : 'S1',
        craftMinutes: b.craftMinutes || Math.round((b.craftTimeSeconds || 60) / 60),
        owned: Boolean(b.owned || (store.get('crafting')?.unlockedBlueprintIds || []).includes(b.id)),
        ingredients: ings,
        acquisitions: acqs,
        status: b.statsSummary || 'Vérifié Star Citizen 4.x (FleetYards)',
        guild: b.guild || { owners: 1, crafters: [] },
        rawBlueprint: b
      };
    });
  } catch {
    return [];
  }
})();

// Stock dynamique synchronisé depuis l'inventaire réel
let craftUserStock = {};

function syncCraftStockFromInventory() {
  craftUserStock = {};
  if (typeof inventoryService !== 'undefined' && typeof inventoryService.getItems === 'function') {
    const items = inventoryService.getItems();
    items.forEach(item => {
      const code = (item.mineralId || item.code || '').toLowerCase();
      if (code) {
        craftUserStock[code] = (craftUserStock[code] || 0) + (Number(item.quantitySCU || item.quantity) || 0);
      }
    });
  }
}

// Qualité des matériaux injectés dans le craft en cours (0 à 1 000)
let craftSelectedQualities = {};

let craftFilters = {
  search: '',
  category: 'toutes',
  size: 'toutes',
  acq: 'toutes',
  chip: null // 'g' | 'a' | 'b' | 'r'
};

let selectedCraftBpId = CRAFT_SAMPLE_BLUEPRINTS[0]?.id || 'bp_lancet_s1_mk2';
let craftCurrentQty = 1;

function evaluateBlueprintCraft(bp) {
  let maxQty = Infinity;
  const missing = [];

  bp.ingredients.forEach(ing => {
    const have = craftUserStock[ing.code] || 0;
    const needed = ing.quantity;
    const possible = Math.floor(have / needed);
    if (possible < 1) {
      missing.push({ name: ing.name, needed, have });
    }
    maxQty = Math.min(maxQty, possible);
  });

  const finalMaxQty = maxQty === Infinity ? 0 : maxQty;
  let statusKey = 'r';
  let statusLabel = 'Non possédé';

  if (bp.owned) {
    if (finalMaxQty > 0) {
      statusKey = 'g';
      statusLabel = 'Craftable';
    } else {
      statusKey = 'a';
      statusLabel = `Manque ${missing.length}`;
    }
  }

  // Closeness score (aaron-mfd) : 0 pour craftable, 1-99 pour manquant, 1000 pour non possédé
  let closeness = 1000;
  if (bp.owned) {
    closeness = finalMaxQty > 0 ? 0 : missing.length;
  }

  return {
    ...bp,
    maxQty: finalMaxQty,
    missing,
    statusKey,
    statusLabel,
    closeness
  };
}

function renderCraftingCatalog() {
  const tbody = document.getElementById('craftRankedTableBody');
  if (!tbody) return;

  // Synchroniser le stock avec l'inventaire réel
  syncCraftStockFromInventory();

  // Évaluer tous les blueprints
  const evaluated = CRAFT_SAMPLE_BLUEPRINTS.map(evaluateBlueprintCraft);

  // Mettre à jour les compteurs de chips
  const countG = evaluated.filter(b => b.statusKey === 'g').length;
  const countA = evaluated.filter(b => b.statusKey === 'a').length;
  const countB = evaluated.filter(b => b.owned).length;
  const countR = evaluated.filter(b => !b.owned).length;

  const countGEl = document.getElementById('countCraftable');
  const countAEl = document.getElementById('countMissing');
  const countBEl = document.getElementById('countOwned');
  const countREl = document.getElementById('countUnowned');

  if (countGEl) countGEl.textContent = countG;
  if (countAEl) countAEl.textContent = countA;
  if (countBEl) countBEl.textContent = countB;
  if (countREl) countREl.textContent = countR;

  // Filtrer
  const filtered = evaluated.filter(bp => {
    const text = `${bp.name} ${bp.category} ${bp.acquisitions.map(a => a.title).join(' ')} ${bp.ingredients.map(i => i.name).join(' ')}`.toLowerCase();
    if (craftFilters.search && !text.includes(craftFilters.search.toLowerCase())) return false;
    if (craftFilters.category !== 'toutes' && bp.category !== craftFilters.category) return false;
    if (craftFilters.size !== 'toutes' && bp.size !== craftFilters.size) return false;
    if (craftFilters.acq !== 'toutes' && !bp.acquisitions.some(a => a.type === craftFilters.acq)) return false;

    if (craftFilters.chip === 'g' || craftFilters.chip === 'a') return bp.statusKey === craftFilters.chip;
    if (craftFilters.chip === 'b') return bp.owned;
    if (craftFilters.chip === 'r') return !bp.owned;
    return true;
  });

  const subEl = document.getElementById('craftCatalogSub');
  if (subEl) {
    const totalCount = CRAFT_SAMPLE_BLUEPRINTS.length;
    const catLabel = craftFilters.category === 'toutes' ? 'Toutes catégories' : craftFilters.category;
    subEl.textContent = `Catalogue : ${totalCount.toLocaleString('fr-FR')} schémas industriels · ${countB} possédés · ${countG} craftables immédiatement · Filtre : ${catLabel} (${filtered.length} affichés)`;
  }

  // Trier par closeness (proche du craft)
  filtered.sort((a, b) => a.closeness - b.closeness);

  tbody.innerHTML = filtered.map(bp => {
    const isSel = bp.id === selectedCraftBpId;
    const acqFirst = bp.acquisitions[0];
    const acqText = acqFirst
      ? `${acqFirst.type} · ${acqFirst.title}${bp.acquisitions.length > 1 ? ` (+${bp.acquisitions.length - 1})` : ''}`
      : '—';

    const missingNames = bp.owned && bp.missing.length > 0
      ? bp.missing.map(m => m.name.split(' ')[0]).join(', ')
      : '';

    return `
      <tr class="craft-row-item ${isSel ? 'highlight-green-row' : ''}" data-craft-id="${bp.id}" style="cursor:pointer;">
        <td class="val-bold">${bp.name}</td>
        <td>${bp.category}</td>
        <td>${bp.size}</td>
        <td style="font-size:0.75rem; color:var(--text-muted);">${acqText}</td>
        <td>
          <span class="vo-badge ${bp.owned ? 'cyan' : 'red'}">${bp.owned ? 'Possédé' : 'Non possédé'}</span>
        </td>
        <td>
          <span class="vo-badge ${bp.statusKey === 'g' ? 'green' : (bp.statusKey === 'a' ? 'amber' : 'red')}">
            ${bp.statusLabel}
          </span>
        </td>
        <td style="font-size:0.75rem; color:var(--text-dim);">${missingNames}</td>
      </tr>
    `;
  }).join('');

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-dim); padding:20px;">Aucun blueprint ne correspond aux filtres.</td></tr>`;
  }

  // Row click bindings
  tbody.querySelectorAll('.craft-row-item').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-craft-id');
      if (id) {
        selectedCraftBpId = id;
        craftCurrentQty = 1;
        renderCraftingCatalog();
      }
    });
  });

  // Mettre à jour la colonne détail
  const selectedBp = evaluated.find(b => b.id === selectedCraftBpId) || evaluated[0];
  if (selectedBp) {
    renderCraftDetail(selectedBp);
  }
}

function renderCraftDetail(bp) {
  const nameEl = document.getElementById('craftDetailName');
  const subEl = document.getElementById('craftDetailSubtitle');
  const badgeEl = document.getElementById('craftDetailBadge');
  const acqBody = document.getElementById('craftAcquisitionsBody');
  const statusNoteEl = document.getElementById('craftVerificationStatus');
  const ingBody = document.getElementById('craftIngredientsBody');
  const actionsRow = document.getElementById('craftActionsRow');
  const ownersEl = document.getElementById('guildOwnersCount');
  const craftersCountEl = document.getElementById('guildCraftersCount');
  const craftersNamesEl = document.getElementById('guildCraftersNames');

  if (nameEl) nameEl.textContent = bp.name;
  if (subEl) subEl.textContent = `${bp.category} ${bp.size !== '—' ? bp.size : ''} · ${bp.craftMinutes} min`;

  if (badgeEl) {
    badgeEl.className = `vo-badge ${bp.statusKey === 'g' ? 'green' : (bp.statusKey === 'a' ? 'amber' : 'red')}`;
    badgeEl.textContent = bp.owned
      ? (bp.maxQty > 0 ? `Craftable ×${bp.maxQty}` : bp.statusLabel)
      : 'Non possédé';
  }

  if (acqBody) {
    const ACQ_BADGES = { Mission: 'cyan', Vendeur: 'amber', Loot: 'red', Événement: 'green' };
    acqBody.innerHTML = bp.acquisitions.map(a => `
      <tr>
        <td style="width:110px;">
          <span class="vo-badge ${ACQ_BADGES[a.type] || 'cyan'}">${a.type}</span>
        </td>
        <td>
          ${a.title}
          ${a.price ? ` · <span style="font-family:var(--font-mono); font-weight:600;">${a.price.toLocaleString('fr-FR')} aUEC</span>` : ''}
          ${a.dropRatePct ? ` · <span class="val-green">drop ~${a.dropRatePct} %</span>` : ''}
        </td>
      </tr>
    `).join('');
  }

  if (statusNoteEl) statusNoteEl.textContent = bp.status || '';

  if (ingBody) {
    ingBody.innerHTML = bp.ingredients.map(ing => {
      const have = craftUserStock[ing.code] || 0;
      const req = ing.quantity * craftCurrentQty;
      const isMet = have >= req;

      return `
        <tr>
          <td class="val-bold">${ing.name}</td>
          <td>${req} ${ing.unit}</td>
          <td class="val-bold">${have} ${ing.unit}</td>
          <td><span class="${isMet ? 'status-dot-green' : 'status-dot-red'}"></span></td>
        </tr>
      `;
    }).join('');
  }

  // === QUALITÉ DES MATÉRIAUX & ATELIER D'OPTIMISATION (0-1000) ===
  bp.ingredients.forEach(ing => {
    if (craftSelectedQualities[ing.code] === undefined) {
      craftSelectedQualities[ing.code] = 500;
    }
  });

  const slidersContainer = document.getElementById('craftQualitySlidersContainer');
  const compositeScoreVal = document.getElementById('compositeScoreValue');
  const compositeMeterFill = document.getElementById('compositeMeterFill');
  const compositeTierBadge = document.getElementById('compositeTierBadge');
  const chipOverallTier = document.getElementById('chipOverallQualityTier');
  const compositeTierDesc = document.getElementById('compositeTierDesc');
  const statsGrid = document.getElementById('craftStatsComparisonGrid');

  function updateQualityCalculations() {
    const ingredientsWithQ = bp.ingredients.map(ing => ({
      quantity: ing.quantity,
      scu: ing.quantity,
      quality: craftSelectedQualities[ing.code] ?? 500
    }));

    const compositeQ = craftingService.calculateCompositeQuality(ingredientsWithQ);
    const tier = craftingService.getQualityTier(compositeQ);
    const analysis = craftingService.calculateCraftedStats(bp.rawBlueprint || bp, compositeQ);

    if (compositeScoreVal) compositeScoreVal.textContent = 'Q' + compositeQ;
    if (compositeMeterFill) compositeMeterFill.style.width = Math.min(100, Math.max(5, Math.round(compositeQ / 10))) + '%';
    if (compositeTierBadge) {
      compositeTierBadge.className = 'quality-badge ' + tier.badgeClass;
      compositeTierBadge.textContent = tier.shortName;
    }
    if (chipOverallTier) {
      chipOverallTier.textContent = `${tier.name} · Q${compositeQ}`;
      chipOverallTier.className = `vo-chip ${tier.id === 'masterwork' ? 'amber' : (tier.id === 'high' ? 'green' : (tier.id === 'enhanced' ? 'purple' : (tier.id === 'low' ? 'red' : 'cyan')))}`;
    }
    if (compositeTierDesc) {
      const sign = analysis.deltaPct >= 0 ? '+' : '';
      compositeTierDesc.textContent = `Modificateur stats global : ${sign}${analysis.deltaPct}% · Cote marchande : ×${analysis.valueMultiplier}`;
    }

    // Grille de comparaison des stats
    if (statsGrid) {
      if (analysis.baseStats.laserPowerWatts) {
        const pDelta = analysis.statDeltas.powerDeltaPct;
        const rDelta = analysis.statDeltas.resDeltaPct;
        const gDelta = analysis.statDeltas.greenDeltaPct;
        const baseVal = 145000;
        const customVal = Math.round(baseVal * analysis.valueMultiplier);

        statsGrid.innerHTML = `
          <div class="craft-stat-box">
            <span class="craft-stat-label">Puissance Laser</span>
            <div class="craft-stat-val">
              <span>${analysis.craftedStats.laserPowerWatts.toLocaleString('fr-FR')} W</span>
              <span class="delta-pill ${pDelta >= 0 ? 'positive' : 'negative'}">${pDelta >= 0 ? '+' : ''}${pDelta}%</span>
            </div>
            <span style="font-size:0.68rem; color:var(--text-dim);">Usine : ${analysis.baseStats.laserPowerWatts.toLocaleString('fr-FR')} W</span>
          </div>

          <div class="craft-stat-box">
            <span class="craft-stat-label">Réduction Résistance</span>
            <div class="craft-stat-val">
              <span>-${analysis.craftedStats.resistanceReductionPct}%</span>
              <span class="delta-pill ${rDelta >= 0 ? 'positive' : 'negative'}">${rDelta >= 0 ? '+' : ''}${rDelta}%</span>
            </div>
            <span style="font-size:0.68rem; color:var(--text-dim);">Usine : -${analysis.baseStats.resistanceReductionPct}%</span>
          </div>

          <div class="craft-stat-box">
            <span class="craft-stat-label">Zone Verte (Fenêtre)</span>
            <div class="craft-stat-val">
              <span>+${analysis.craftedStats.greenZoneBonusPct}%</span>
              <span class="delta-pill ${gDelta >= 0 ? 'positive' : 'negative'}">${gDelta >= 0 ? '+' : ''}${gDelta}%</span>
            </div>
            <span style="font-size:0.68rem; color:var(--text-dim);">Usine : +${analysis.baseStats.greenZoneBonusPct}%</span>
          </div>

          <div class="craft-stat-box">
            <span class="craft-stat-label">Valeur Estimée</span>
            <div class="craft-stat-val">
              <span style="color:var(--accent-green);">${customVal.toLocaleString('fr-FR')}</span>
              <span class="delta-pill ${analysis.valueMultiplier >= 1 ? 'positive' : 'negative'}">×${analysis.valueMultiplier}</span>
            </div>
            <span style="font-size:0.68rem; color:var(--text-dim);">Usine : ${baseVal.toLocaleString('fr-FR')} aUEC</span>
          </div>
        `;
      } else if (analysis.baseStats.instabReductionPct) {
        statsGrid.innerHTML = `
          <div class="craft-stat-box">
            <span class="craft-stat-label">Stabilité Rocher</span>
            <div class="craft-stat-val">
              <span>-${analysis.craftedStats.instabReductionPct}%</span>
              <span class="delta-pill positive">${analysis.statDeltas.instabDeltaPct >= 0 ? '+' : ''}${analysis.statDeltas.instabDeltaPct}%</span>
            </div>
          </div>
          <div class="craft-stat-box">
            <span class="craft-stat-label">Extraction SCU</span>
            <div class="craft-stat-val">
              <span>+${analysis.craftedStats.extractionSpeedBonusPct}%</span>
              <span class="delta-pill positive">${analysis.statDeltas.extractDeltaPct >= 0 ? '+' : ''}${analysis.statDeltas.extractDeltaPct}%</span>
            </div>
          </div>
          <div class="craft-stat-box">
            <span class="craft-stat-label">Charges Disponibles</span>
            <div class="craft-stat-val">
              <span>${analysis.craftedStats.chargesCount}</span>
            </div>
          </div>
          <div class="craft-stat-box">
            <span class="craft-stat-label">Valeur Estimée</span>
            <div class="craft-stat-val">
              <span style="color:var(--accent-green);">${Math.round(38000 * analysis.valueMultiplier).toLocaleString('fr-FR')}</span>
              <span class="delta-pill positive">×${analysis.valueMultiplier}</span>
            </div>
          </div>
        `;
      } else {
        statsGrid.innerHTML = `
          <div class="craft-stat-box">
            <span class="craft-stat-label">Efficacité Pièce</span>
            <div class="craft-stat-val">
              <span>${analysis.craftedStats.efficiencyPct || 100}%</span>
              <span class="delta-pill ${analysis.deltaPct >= 0 ? 'positive' : 'negative'}">${analysis.deltaPct >= 0 ? '+' : ''}${analysis.deltaPct}%</span>
            </div>
          </div>
          <div class="craft-stat-box">
            <span class="craft-stat-label">Multiplicateur Valeur</span>
            <div class="craft-stat-val">
              <span style="color:var(--accent-green);">×${analysis.valueMultiplier}</span>
            </div>
          </div>
        `;
      }
    }

    return { compositeQ, tier, analysis };
  }

  if (slidersContainer) {
    slidersContainer.innerHTML = bp.ingredients.map(ing => {
      const q = craftSelectedQualities[ing.code] ?? 500;
      const ingTier = craftingService.getQualityTier(q);
      const req = ing.quantity * craftCurrentQty;

      return `
        <div class="craft-ingredient-quality-row" data-ing-code="${ing.code}">
          <div class="ing-quality-top">
            <span class="ing-quality-name">
              <span style="color:var(--accent-cyan);">✦</span> ${ing.name} <span style="color:var(--text-dim); font-size:0.75rem;">(${req} ${ing.unit})</span>
            </span>
            <div class="ing-quality-val">
              <span class="quality-badge ${ingTier.badgeClass}" id="badge-quality-${ing.code}">
                ${ingTier.shortName}
              </span>
              <span id="label-quality-${ing.code}" style="color:#fff;">Q${q}</span>
            </div>
          </div>
          <input type="range" min="0" max="1000" step="10" value="${q}" class="quality-range-slider" id="slider-quality-${ing.code}" data-ing-code="${ing.code}">
          <div class="ing-presets-row">
            <span style="font-size:0.68rem; color:var(--text-dim); margin-right:4px;">Presets :</span>
            <button type="button" class="quality-preset-btn" data-preset="250" data-ing-code="${ing.code}">Rebut (Q250)</button>
            <button type="button" class="quality-preset-btn" data-preset="500" data-ing-code="${ing.code}">Standard (Q500)</button>
            <button type="button" class="quality-preset-btn" data-preset="750" data-ing-code="${ing.code}">Militaire (Q750)</button>
            <button type="button" class="quality-preset-btn" data-preset="950" data-ing-code="${ing.code}">⭐ Maître (Q950)</button>
          </div>
        </div>
      `;
    }).join('');

    slidersContainer.querySelectorAll('.quality-range-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const code = e.target.getAttribute('data-ing-code');
        const val = Number(e.target.value) || 500;
        craftSelectedQualities[code] = val;
        const label = document.getElementById(`label-quality-${code}`);
        if (label) label.textContent = 'Q' + val;
        const badge = document.getElementById(`badge-quality-${code}`);
        if (badge) {
          const t = craftingService.getQualityTier(val);
          badge.className = 'quality-badge ' + t.badgeClass;
          badge.textContent = t.shortName;
        }
        updateQualityCalculations();
      });
    });

    slidersContainer.querySelectorAll('.quality-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-ing-code');
        const val = Number(btn.getAttribute('data-preset')) || 500;
        craftSelectedQualities[code] = val;
        const slider = document.getElementById(`slider-quality-${code}`);
        if (slider) slider.value = val;
        const label = document.getElementById(`label-quality-${code}`);
        if (label) label.textContent = 'Q' + val;
        const badge = document.getElementById(`badge-quality-${code}`);
        if (badge) {
          const t = craftingService.getQualityTier(val);
          badge.className = 'quality-badge ' + t.badgeClass;
          badge.textContent = t.shortName;
        }
        triggerHaptic(8);
        updateQualityCalculations();
      });
    });
  }

  // Initialiser les calculs immédiats
  updateQualityCalculations();

  // Action buttons & stepper
  if (actionsRow) {
    if (bp.owned && bp.maxQty > 0) {
      actionsRow.innerHTML = `
        <button type="button" class="vo-btn primary" id="btnExecuteCraftMain">⚒ Crafter ×${craftCurrentQty}</button>
        <div class="stepper-container">
          <button type="button" class="stepper-btn" id="btnCraftQtyMinus">−</button>
          <span class="stepper-val" id="craftQtyDisplay">${craftCurrentQty}</span>
          <button type="button" class="stepper-btn" id="btnCraftQtyPlus">+</button>
          <span style="font-size:0.75rem; color:var(--text-dim);">max ${bp.maxQty}</span>
        </div>
      `;

      document.getElementById('btnExecuteCraftMain')?.addEventListener('click', () => {
        const { compositeQ, tier, analysis } = updateQualityCalculations();

        // 1. Appel du moteur officiel de fabrication avec qualité
        const res = craftingService.executeCraft(bp.id, 'personal', 'ARC-L1 Wide Forest Station', craftCurrentQty, craftSelectedQualities);

        // 2. Déduction locale du stock visuel de l'interface
        bp.ingredients.forEach(ing => {
          craftUserStock[ing.code] = Math.max(0, (craftUserStock[ing.code] || 0) - (ing.quantity * craftCurrentQty));
        });

        // 3. Si le craft a réussi ou si une pièce a été créée en inventaire
        if (res && res.success) {
          showToast(`🛠 ${craftCurrentQty} × ${bp.name} (${tier.name} · Q${compositeQ}) forgé avec succès !`);
        } else {
          // Création directe sécurisée dans l'inventaire avec métadonnées de qualité
          let cat = 'crafted_laser';
          let subCat = 'mining_laser';
          if (bp.category.includes('module')) { cat = 'crafted_module'; subCat = 'mining_module'; }
          else if (bp.category.includes('arme')) { cat = 'crafted_weapon'; subCat = 'ship_weapon'; }

          inventoryService.addItem({
            category: cat,
            subCategory: subCat,
            code: bp.id,
            name: `${bp.name} [Q${compositeQ}]`,
            size: bp.size ? String(bp.size).replace('S', '') : '1',
            grade: tier.id === 'masterwork' ? 'A+' : (tier.id === 'high' ? 'A' : (tier.id === 'enhanced' ? 'B' : 'C')),
            quantityUnits: craftCurrentQty,
            quantitySCU: 0,
            origin: 'crafted',
            materialQuality: compositeQ,
            qualityTier: tier.id,
            qualityTierLabel: tier.name,
            catalogReferencePriceUEC: 145000,
            metadata: {
              craftStats: analysis.statsSummary,
              detailedStats: analysis.craftedStats,
              statDeltas: analysis.statDeltas,
              materialQuality: compositeQ,
              qualityTier: tier.id,
              qualityTierLabel: tier.name,
              valueMultiplier: analysis.valueMultiplier,
              notes: `Forgé avec matériaux ${tier.name} (Q${compositeQ}/1000).`
            }
          });
          showToast(`🛠 ${craftCurrentQty} × ${bp.name} (${tier.name} · Q${compositeQ}) forgé et ajouté à l'inventaire !`);
        }

        triggerHaptic(25);
        craftCurrentQty = 1;
        renderCraftingCatalog();
        renderInventoryTable();
        if (currentActiveApp === 'guild') renderGuildMarket();
      });

      document.getElementById('btnCraftQtyMinus')?.addEventListener('click', () => {
        if (craftCurrentQty > 1) {
          craftCurrentQty--;
          renderCraftDetail(bp);
        }
      });

      document.getElementById('btnCraftQtyPlus')?.addEventListener('click', () => {
        if (craftCurrentQty < bp.maxQty) {
          craftCurrentQty++;
          renderCraftDetail(bp);
        }
      });
    } else if (bp.owned) {
      actionsRow.innerHTML = `
        <button type="button" class="vo-btn outline" id="btnFindMissingIngredients">🛒 Où trouver ce qui manque</button>
      `;
      document.getElementById('btnFindMissingIngredients')?.addEventListener('click', () => {
        showToast(`🛒 Ordre d'approvisionnement généré pour les ingrédients manquants de ${bp.name} !`);
      });
    } else {
      actionsRow.innerHTML = `
        <button type="button" class="vo-btn outline" id="btnTrackBlueprint">★ Je le cherche</button>
      `;
      document.getElementById('btnTrackBlueprint')?.addEventListener('click', () => {
        showToast(`★ ${bp.name} ajouté à votre journal de recherche d'épaves !`);
      });
    }
  }

  // Guild info
  if (ownersEl) ownersEl.textContent = `${bp.guild.owners} membre${bp.guild.owners > 1 ? 's' : ''}`;
  if (craftersCountEl) craftersCountEl.textContent = bp.guild.crafters.length;
  if (craftersNamesEl) {
    craftersNamesEl.textContent = bp.guild.crafters.length > 0 ? ` (${bp.guild.crafters.join(', ')})` : '';
  }

  const reqGuildBtn = document.getElementById('btnRequestGuildCraft');
  if (reqGuildBtn) {
    reqGuildBtn.style.display = bp.guild.crafters.length > 0 ? 'inline-block' : 'none';
    reqGuildBtn.onclick = () => {
      showToast(`✉ Demande de fabrication de ${bp.name} transmise à ${bp.guild.crafters.join(' et ')} !`);
    };
  }
}

// ============================================================================
// 8. RENDU : COMMERCE (AARON MFD ENRICHI)
// Calculateur bidirectionnel : Vaisseau ➔ Routes et Route ➔ Vaisseaux
// Strictement aligné sur CommerceScreen.js & la charte mobiGlas Holo
// ============================================================================

let tradeState = {
  customSelectedShip: null, // Si null, calculé dynamiquement depuis la flotte du joueur
  userCapital: 1284500,
  avoidHighRisk: true,
  selectedRouteId: 'r1'
};

const MARKET_CARGO_SHIPS = [
  { id: 'c2', name: 'C2 Hercules', fullName: 'Crusader C2 Hercules', cargoScu: 696, qdSize: 3, owned: false },
  { id: 'caterpillar', name: 'Drake Caterpillar', fullName: 'Drake Caterpillar', cargoScu: 576, qdSize: 3, owned: false },
  { id: 'hull_c', name: 'Hull C', fullName: 'MISC Hull C', cargoScu: 4608, qdSize: 3, owned: false },
  { id: 'taurus', name: 'Constellation Taurus', fullName: 'RSI Constellation Taurus', cargoScu: 174, qdSize: 2, owned: false },
  { id: 'freelancer_max', name: 'Freelancer MAX', fullName: 'MISC Freelancer MAX', cargoScu: 120, qdSize: 2, owned: false },
  { id: 'cutlass_black', name: 'Cutlass Black', fullName: 'Drake Cutlass Black', cargoScu: 46, qdSize: 2, owned: false }
];

/**
 * Récupère le vaisseau de commerce effectif en se synchronisant avec la flotte du joueur
 * Si le vaisseau actif est un mineur (Prospector/MOLE), propose un cargo de la flotte s'il existe
 * Sinon, bascule en mode simulation de marché (C2 Hercules) sans prétendre qu'il est possédé
 */
function getEffectiveTradeContext() {
  const activeEntry = fleetService.getActiveShip();
  const activeDef = getShip(activeEntry?.shipId);
  const isMiner = activeDef?.role === 'mining';

  // Identifier tous les vaisseaux de fret possédés dans la flotte du joueur
  const allFleetShips = fleetService.getShips();
  const fleetCargoShips = allFleetShips.map(s => {
    const def = getShip(s.shipId);
    return {
      uid: s.uid,
      shipId: s.shipId,
      nickname: s.nickname,
      name: def?.name || s.shipId,
      fullName: `${def?.name || s.shipId} « ${s.nickname} »`,
      cargoScu: def?.scu || 0,
      role: def?.role || 'cargo',
      qdSize: def?.qdSize || 2,
      isMiner: def?.role === 'mining',
      active: s.active,
      owned: true
    };
  }).filter(s => !s.isMiner && s.cargoScu > 0);

  // Si l'utilisateur a sélectionné manuellement un vaisseau dans cette session
  if (tradeState.customSelectedShip) {
    const isOwned = tradeService.isShipOwnedInFleet(tradeState.customSelectedShip, allFleetShips);
    return {
      currentShip: { ...tradeState.customSelectedShip, owned: isOwned },
      activeEntry,
      activeDef,
      isMiner,
      fleetCargoShips,
      hasOwnedCargo: isOwned
    };
  }

  // Si le vaisseau actif EST un cargo ou transporteur de fret
  if (!isMiner && activeDef?.scu > 0) {
    const activeShipObj = {
      id: activeEntry.shipId,
      name: activeDef.name,
      fullName: `${activeDef.name} « ${activeEntry.nickname} »`,
      cargoScu: activeDef.scu,
      qdSize: activeDef.qdSize || 2,
      owned: true
    };
    return {
      currentShip: activeShipObj,
      activeEntry,
      activeDef,
      isMiner: false,
      fleetCargoShips,
      hasOwnedCargo: true
    };
  }

  // Si le vaisseau actif est un mineur (Prospector, MOLE, etc.) :
  // Si le joueur possède des vaisseaux cargos dans sa flotte, on propose le meilleur
  if (fleetCargoShips.length > 0) {
    const bestFleetCargo = fleetCargoShips.sort((a, b) => b.cargoScu - a.cargoScu)[0];
    return {
      currentShip: bestFleetCargo,
      activeEntry,
      activeDef,
      isMiner: true,
      fleetCargoShips,
      hasOwnedCargo: true
    };
  }

  // Si AUCUN cargo n'est possédé dans la flotte du joueur :
  // Mode simulation de marché (C2 Hercules) avec owned: false
  const marketSimulationShip = {
    id: 'c2',
    name: 'C2 Hercules',
    fullName: 'Crusader C2 Hercules (Simulation Marché)',
    cargoScu: 696,
    qdSize: 3,
    owned: false
  };

  return {
    currentShip: marketSimulationShip,
    activeEntry,
    activeDef,
    isMiner: true,
    fleetCargoShips,
    hasOwnedCargo: false
  };
}

function renderTradeCards() {
  const tbody = document.getElementById('tradeRoutesTableBody');
  if (!tbody) return;

  const { currentShip, activeEntry, activeDef, isMiner, fleetCargoShips, hasOwnedCargo } = getEffectiveTradeContext();

  // 0. Indicateur de synchronisation Bourse UEX Corp
  const syncInfo = uexService.getSyncStatus();
  const uexBadge = document.getElementById('uexSyncBadge');
  const uexText = document.getElementById('uexSyncText');
  const countEl = document.getElementById('tradeCommoditiesCount');
  if (uexBadge && uexText) {
    uexBadge.className = `uex-sync-badge ${syncInfo.badgeClass}`;
    uexText.textContent = `${syncInfo.badgeText} (${syncInfo.timeAgoText})`;
  }
  if (countEl) {
    countEl.textContent = syncInfo.totalCommodities;
  }

  // 1. Bannière de synchronisation flotte (Mineur vs Cargo)
  const bannerEl = document.getElementById('tradeActiveShipBanner');
  if (bannerEl) {
    if (isMiner) {
      if (hasOwnedCargo && currentShip.owned) {
        bannerEl.innerHTML = `
          <div class="trade-fleet-sync-bar is-miner">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.5rem;">⛏️</span>
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.9rem;">
                  Vaisseau actif : <span style="color:var(--accent-purple);">${activeDef?.name || 'Vaisseau'} « ${activeEntry?.nickname || 'Actif'} »</span> (Minage · ${activeDef?.scu || 32} SCU minerai brut)
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                  Vaisseau de minage non prévu pour le fret marchand. Cargo assigné depuis votre flotte : <b style="color:var(--accent-cyan);">${currentShip.fullName || currentShip.name} (${currentShip.cargoScu} SCU)</b>
                </div>
              </div>
            </div>
            <button type="button" class="vo-btn outline" id="btnTradeSwitchFleetShip" style="font-size:0.75rem; padding:6px 12px;">
              Changer de cargo de flotte ▾
            </button>
          </div>
        `;
      } else {
        bannerEl.innerHTML = `
          <div class="trade-fleet-sync-bar is-miner" style="border-left-color:var(--accent-amber, #f59e0b);">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:1.5rem;">⚠️</span>
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.9rem;">
                  Vaisseau actif : <span style="color:var(--accent-purple);">${activeDef?.name || 'Vaisseau'} « ${activeEntry?.nickname || 'Actif'} »</span> (Minage · ${activeDef?.scu || 32} SCU minerai brut)
                </div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                  Aucun vaisseau de transport dans votre flotte. <b style="color:var(--accent-amber, #f59e0b);">Simulation Marché : ${currentShip.name} (${currentShip.cargoScu} SCU · Hors flotte)</b>
                </div>
              </div>
            </div>
            <button type="button" class="vo-btn outline" id="btnTradeSwitchFleetShip" style="font-size:0.75rem; padding:6px 12px;">
              Choisir un vaisseau ▾
            </button>
          </div>
        `;
      }
    } else {
      bannerEl.innerHTML = `
        <div class="trade-fleet-sync-bar">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:1.5rem;">🛸</span>
            <div>
              <div style="font-weight:700; color:#fff; font-size:0.9rem;">
                Vaisseau actif connecté : <span style="color:var(--accent-cyan);">${activeDef?.name || 'Vaisseau'} « ${activeEntry?.nickname || 'Actif'} »</span> (${currentShip.cargoScu} SCU · Prêt pour le fret)
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                Synchronisé avec votre hangar · Prise en compte de la route en Quantum Full et des temps atmosphériques
              </div>
            </div>
          </div>
          <button type="button" class="vo-btn outline" id="btnTradeSwitchFleetShip" style="font-size:0.75rem; padding:6px 12px;">
            Changer de vaisseau cargo ▾
          </button>
        </div>
      `;
    }
    document.getElementById('btnTradeSwitchFleetShip')?.addEventListener('click', openTradeShipModal);
  }

  // 2. Mettre à jour les labels de la barre d'outils
  const shipBtn = document.getElementById('btnTradeShip');
  if (shipBtn) {
    const isOwnedInFleet = Boolean(currentShip.owned);
    shipBtn.textContent = `${isOwnedInFleet ? 'Flotte' : 'Marché (Simu)'} : ${currentShip.name} (${currentShip.cargoScu} SCU)`;
  }

  const capitalBtn = document.getElementById('btnTradeCapital');
  if (capitalBtn) {
    capitalBtn.textContent = `Capital : ${tradeState.userCapital.toLocaleString('fr-FR')} aUEC`;
  }

  const riskBtn = document.getElementById('btnTradeRiskToggle');
  if (riskBtn) {
    riskBtn.textContent = tradeState.avoidHighRisk ? 'Éviter zones à risque ✓' : 'Toutes zones (avec risque) ⚠';
    riskBtn.className = `vo-btn ${tradeState.avoidHighRisk ? 'outline' : 'primary'}`;
  }

  // 3. Calcul dynamique des meilleures routes pour ce vaisseau en Quantum Full
  const evaluatedRoutes = tradeService.findBestRoutesForShip(
    currentShip,
    tradeState.userCapital,
    10,
    { avoidHighRisk: tradeState.avoidHighRisk, shipName: currentShip.name }
  );

  // Vérifier si la route sélectionnée est présente
  if (!evaluatedRoutes.some(r => r.id === tradeState.selectedRouteId)) {
    tradeState.selectedRouteId = evaluatedRoutes[0]?.id || 'r1';
  }

  // 4. Rendu du tableau des meilleures routes
  tbody.innerHTML = evaluatedRoutes.map((r, index) => {
    const isSel = r.id === tradeState.selectedRouteId;
    const rank = index + 1;
    const isPartial = r.isCapitalConstrained;
    return `
      <tr class="trade-route-row ${isSel ? 'sel' : ''}" data-route-id="${r.id}" style="cursor:pointer;">
        <td>${rank}</td>
        <td class="val-bold">${r.from || r.origin}</td>
        <td class="val-bold">${r.to || r.destination}</td>
        <td>${r.item || r.name}</td>
        <td class="val-green">
          <b>+${r.actualProfit.toLocaleString('fr-FR')}</b>
          <div style="font-size:0.65rem; color:${isPartial ? 'var(--accent-amber, #f59e0b)' : 'var(--text-muted)'}; font-family:var(--font-mono);">
            ${isPartial ? `${r.actualCargoSCU}/${r.shipCapacitySCU} SCU financés` : `${r.shipCapacitySCU} SCU (Plein)`}
          </div>
        </td>
        <td class="val-green">
          <b>+${r.profitPerHourUEC.toLocaleString('fr-FR')}</b>
          <div style="font-size:0.65rem; color:var(--text-muted);">/heure</div>
        </td>
        <td style="text-align:right;">
          <span style="font-family:var(--font-mono); font-size:0.75rem;">${r.costPerSCU.toLocaleString('fr-FR')}</span> <span style="font-size:0.65rem; color:var(--text-muted);">aUEC</span>
          <div style="font-size:0.68rem; color:var(--accent-green); font-family:var(--font-mono); font-weight:600;">+${r.marginPerSCU.toLocaleString('fr-FR')}/SCU</div>
        </td>
      </tr>
    `;
  }).join('');

  // Clic interactif sur chaque ligne de route
  tbody.querySelectorAll('.trade-route-row').forEach(row => {
    row.addEventListener('click', () => {
      const rid = row.getAttribute('data-route-id');
      if (rid) {
        tradeState.selectedRouteId = rid;
        renderTradeCards();
        triggerHaptic(8);
      }
    });
  });

  // 5. Rendu de la route sélectionnée
  const selRoute = evaluatedRoutes.find(r => r.id === tradeState.selectedRouteId) || evaluatedRoutes[0];
  if (selRoute) {
    renderTradeRouteDetail(selRoute, currentShip);
  }
}

function renderTradeRouteDetail(route, currentShip) {
  const titleEl = document.getElementById('tradeRouteDetailTitle');
  const buyEl = document.getElementById('tradeDetailBuy');
  const sellEl = document.getElementById('tradeDetailSell');
  const netProfitEl = document.getElementById('tradeDetailNetProfit');
  const distEl = document.getElementById('tradeDetailDistance');
  const quantumTimeEl = document.getElementById('tradeDetailQuantumTime');
  const fillRateEl = document.getElementById('tradeDetailFillRate');
  const riskBadgeEl = document.getElementById('tradeDetailRiskBadge');
  const warningBox = document.getElementById('tradeCapitalWarningBox');
  const warningText = document.getElementById('tradeCapitalWarningText');
  const oversizedBox = document.getElementById('tradeOversizedWarningBox');
  const oversizedText = document.getElementById('tradeOversizedWarningText');
  const bestShipsBody = document.getElementById('tradeBestShipsBody');

  if (titleEl) {
    titleEl.textContent = `ROUTE #${route.rank || 1} · DÉTAIL`;
  }

  const hold = currentShip.cargoScu;
  const costPerScu = route.costPerSCU || route.buyPricePerScu || Math.round((route.buyPrice || 10) * 100);
  const revenuePerScu = route.revenuePerSCU || route.sellPricePerScu || Math.round((route.sellPrice || 12) * 100);

  // Quantité et gains réels basés sur le capital alloué
  const maxAffordable = costPerScu > 0 ? Math.floor(tradeState.userCapital / costPerScu) : hold;
  const actualCargoSCU = Math.min(hold, maxAffordable);
  const actualBuyTotal = actualCargoSCU * costPerScu;
  const actualSellTotal = actualCargoSCU * revenuePerScu;
  const actualProfitTotal = actualSellTotal - actualBuyTotal;
  const fillRatePct = hold > 0 ? Math.round((actualCargoSCU / hold) * 1000) / 10 : 0;

  if (buyEl) {
    if (actualCargoSCU < hold) {
      buyEl.innerHTML = `<span style="color:#fff;">${actualCargoSCU} SCU</span> × ${costPerScu.toLocaleString('fr-FR')} = <b style="color:var(--accent-cyan);">${actualBuyTotal.toLocaleString('fr-FR')} aUEC</b> <span style="font-size:0.68rem; color:var(--accent-amber, #f59e0b);">(${actualCargoSCU}/${hold} SCU)</span>`;
    } else {
      buyEl.innerHTML = `<span style="color:#fff;">${hold} SCU</span> × ${costPerScu.toLocaleString('fr-FR')} = <b style="color:var(--accent-cyan);">${actualBuyTotal.toLocaleString('fr-FR')} aUEC</b> <span style="font-size:0.68rem; color:var(--accent-green);">(Soute pleine)</span>`;
    }
  }
  if (sellEl) {
    sellEl.innerHTML = `<span style="color:#fff;">${actualCargoSCU} SCU</span> × ${revenuePerScu.toLocaleString('fr-FR')} = <b style="color:var(--accent-green);">${actualSellTotal.toLocaleString('fr-FR')} aUEC</b>`;
  }

  // Métriques de rotation en Quantum Full
  const q = route.quantumRoute || tradeService.computeQuantumFullRoute(route, currentShip);
  if (quantumTimeEl) {
    quantumTimeEl.textContent = `~${q.totalRotationMinutes} min A/R (${q.rotationsPerHour} rot/h · QD ${q.qdName})`;
  }

  if (netProfitEl) {
    const rotH = q.rotationsPerHour || 1;
    const profitH = Math.round(actualProfitTotal * rotH);
    netProfitEl.innerHTML = `<b style="color:var(--accent-green); font-size:1.05rem;">+${actualProfitTotal.toLocaleString('fr-FR')} aUEC</b> <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(+${profitH.toLocaleString('fr-FR')} aUEC/h)</span>`;
  }

  if (distEl) {
    distEl.textContent = route.distance || `${route.origin} ➔ ${route.destination}`;
  }

  if (fillRateEl) {
    fillRateEl.textContent = `${actualCargoSCU} / ${hold} SCU (${fillRatePct} %)`;
  }

  if (riskBadgeEl) {
    riskBadgeEl.className = `vo-badge ${route.riskClass || 'green'}`;
    riskBadgeEl.textContent = route.risk || 'Faible';
  }

  // Alerte 1 : Contrainte de capital
  if (warningBox && warningText) {
    if (actualCargoSCU === 0) {
      warningBox.style.display = 'flex';
      warningBox.classList.remove('success');
      warningText.textContent = `Capital insuffisant (${tradeState.userCapital.toLocaleString('fr-FR')} aUEC) pour financer ne serait-ce qu'1 SCU de cette marchandise (${costPerScu.toLocaleString('fr-FR')} aUEC/SCU requis).`;
    } else if (actualCargoSCU < hold) {
      warningBox.style.display = 'flex';
      warningBox.classList.remove('success');
      warningText.textContent = `Capital alloué (${tradeState.userCapital.toLocaleString('fr-FR')} aUEC) : ${actualCargoSCU} SCU financés sur les ${hold} SCU du vaisseau (${fillRatePct} % de soute). Gain réel : +${actualProfitTotal.toLocaleString('fr-FR')} aUEC.`;
    } else {
      warningBox.style.display = 'flex';
      warningBox.classList.add('success');
      warningText.textContent = `✓ Capital suffisant pour financer une soute pleine : ${hold} SCU financés (+${actualProfitTotal.toLocaleString('fr-FR')} aUEC).`;
    }
  }

  // Alerte 2 : Surdimensionnement (ex. C2 pour seulement 4 SCU)
  const isOversized = actualCargoSCU <= 10 || (fillRatePct < 15 && hold >= 100);
  if (oversizedBox && oversizedText) {
    if (isOversized) {
      oversizedBox.style.display = 'flex';
      const actualProfitH = Math.round(actualProfitTotal * q.rotationsPerHour);
      oversizedText.textContent = `Vaisseau surdimensionné : seulement ${actualCargoSCU} SCU transportés sur les ${hold} SCU du ${currentShip.name} (${fillRatePct} %). Mobiliser ce vaisseau pour ${actualCargoSCU} SCU en Quantum Full génère un profit horaire dérisoire (+${actualProfitH.toLocaleString('fr-FR')} aUEC/h). Utilisez un transport plus agile ou augmentez la somme allouée.`;
    } else {
      oversizedBox.style.display = 'none';
    }
  }

  // Tableau comparatif des meilleurs vaisseaux pour cette route (Mode 2)
  if (bestShipsBody) {
    const scoredShips = tradeService.getBestShipsForRoute(route, tradeState.userCapital, fleetService.getShips());
    bestShipsBody.innerHTML = scoredShips.map(s => {
      const isCurrentActive = s.shipName === currentShip.name ||
        currentShip.name.includes(s.shipName) ||
        s.shipName.includes(currentShip.name);
      return `
        <tr class="trade-ship-candidate-row ${isCurrentActive ? 'sel' : ''}" data-ship-name="${s.shipName}" style="cursor:pointer;" title="Cliquez pour sélectionner ce vaisseau">
          <td class="val-bold"><b>${s.shipName}</b></td>
          <td><b>${s.affordableScu}</b> <span style="font-size:0.7rem; color:var(--text-muted);">/ ${s.cargoScu} SCU</span></td>
          <td class="val-green"><b>+${s.profitPerHourUEC.toLocaleString('fr-FR')}/h</b></td>
          <td>
            <span class="tag ${s.owned ? 't-g' : 't-r'}">${s.owned ? 'Possédé' : 'Non possédé'}</span>
          </td>
        </tr>
      `;
    }).join('');

    // Interaction : cliquer sur un vaisseau dans le tableau comparatif
    bestShipsBody.querySelectorAll('.trade-ship-candidate-row').forEach(row => {
      row.addEventListener('click', () => {
        const sname = row.getAttribute('data-ship-name');
        const candidate = scoredShips.find(c => c.shipName === sname);
        const match = MARKET_CARGO_SHIPS.find(p => p.name === sname || sname.includes(p.name));
        const isOwned = Boolean(candidate?.owned);
        if (match) {
          tradeState.customSelectedShip = { ...match, owned: isOwned };
        } else {
          tradeState.customSelectedShip = {
            id: candidate?.id || 'custom',
            name: candidate?.shipName || sname,
            fullName: candidate?.shipName || sname,
            cargoScu: candidate?.cargoScu || 100,
            qdSize: candidate?.quantumRoute?.qdSize || 2,
            owned: isOwned
          };
        }
        renderTradeCards();
        triggerHaptic(10);
        showToast(`Vaisseau sélectionné : ${tradeState.customSelectedShip.name} (${tradeState.customSelectedShip.cargoScu} SCU · ${isOwned ? 'Flotte' : 'Simulation'})`);
      });
    });
  }
}

// Tiroir de sélection de vaisseau pour le commerce (Priorité flotte du joueur)
function openTradeShipModal() {
  const { currentShip, fleetCargoShips } = getEffectiveTradeContext();
  const allFleetShips = fleetService.getShips();

  const fleetHtml = fleetCargoShips.map(s => {
    const isSelected = s.name === currentShip.name || s.cargoScu === currentShip.cargoScu;
    return `
      <div class="vo-card" style="margin-bottom:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; border:${isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)'}; cursor:pointer;" data-select-ship-fleet="${s.uid}">
        <div>
          <div style="font-weight:700; color:#fff;">${s.fullName}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
            Soute cargo : <b style="color:var(--accent-cyan);">${s.cargoScu} SCU</b> · Moteur Quantique : <b>S${s.qdSize}</b> ·
            <span class="tag t-g" style="margin-left:4px;">Dans votre flotte</span>
          </div>
        </div>
        <button type="button" class="vo-btn ${isSelected ? 'primary' : 'outline'}" style="font-size:0.72rem; padding:6px 12px;">
          ${isSelected ? 'Actif ✓' : 'Sélectionner'}
        </button>
      </div>
    `;
  }).join('');

  const marketHtml = MARKET_CARGO_SHIPS.map(s => {
    const isOwnedInFleet = tradeService.isShipOwnedInFleet(s, allFleetShips);
    const isSelected = s.name === currentShip.name;
    return `
      <div class="vo-card" style="margin-bottom:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; border:${isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-medium)'}; cursor:pointer;" data-select-ship-market="${s.id}">
        <div>
          <div style="font-weight:700; color:#fff;">${s.fullName}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
            Soute cargo : <b style="color:var(--accent-cyan);">${s.cargoScu} SCU</b> ·
            <span class="tag ${isOwnedInFleet ? 't-g' : 't-r'}" style="margin-left:4px;">${isOwnedInFleet ? 'Dans votre flotte' : 'Hors flotte'}</span>
          </div>
        </div>
        <button type="button" class="vo-btn ${isSelected ? 'primary' : 'outline'}" style="font-size:0.72rem; padding:6px 12px;">
          ${isSelected ? 'Actif ✓' : (isOwnedInFleet ? 'Sélectionner' : 'Simuler')}
        </button>
      </div>
    `;
  }).join('');

  openInspector({
    title: 'Choisir le vaisseau de commerce',
    subtitle: 'Vaisseaux de fret de votre flotte & marché',
    body: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">
            DISPONIBLES DANS VOTRE FLOTTE
          </div>
          ${fleetHtml.length ? fleetHtml : `
            <div class="vo-card" style="padding:12px; background:rgba(255,255,255,0.02); border:1px dashed var(--border-medium); text-align:center;">
              <p style="font-size:0.8rem; color:var(--text-muted); margin:0 0 4px 0;">Aucun vaisseau cargo dans votre flotte.</p>
              <p style="font-size:0.72rem; color:var(--text-dim); margin:0;">Vous possédez actuellement des vaisseaux de minage. Ajoutez un transporteur dans l'onglet <b>Flotte</b> pour l'exploiter en commerce.</p>
            </div>
          `}
        </div>

        <div>
          <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">
            AUTRES TRANSPORTEURS DU MARCHÉ (SIMULATION)
          </div>
          ${marketHtml}
        </div>
      </div>
    `,
    footer: `
      <button type="button" class="vo-btn outline" id="btnCloseTradeShipDrawer" style="width:100%;">
        Fermer
      </button>
    `
  });

  document.getElementById('btnCloseTradeShipDrawer')?.addEventListener('click', closeInspector);

  // Écouteur pour les vaisseaux de la flotte
  document.querySelectorAll('[data-select-ship-fleet]').forEach(card => {
    card.addEventListener('click', () => {
      const uidVal = card.getAttribute('data-select-ship-fleet');
      const target = fleetCargoShips.find(s => s.uid === uidVal);
      if (target) {
        tradeState.customSelectedShip = { ...target, owned: true };
        renderTradeCards();
        triggerHaptic(12);
        showToast(`Vaisseau cargo assigné : ${target.fullName} (${target.cargoScu} SCU)`);
        closeInspector();
      }
    });
  });

  // Écouteur pour les autres vaisseaux du marché
  document.querySelectorAll('[data-select-ship-market]').forEach(card => {
    card.addEventListener('click', () => {
      const mid = card.getAttribute('data-select-ship-market');
      const target = MARKET_CARGO_SHIPS.find(s => s.id === mid);
      if (target) {
        const isOwnedInFleet = tradeService.isShipOwnedInFleet(target, allFleetShips);
        tradeState.customSelectedShip = { ...target, owned: isOwnedInFleet };
        renderTradeCards();
        triggerHaptic(12);
        showToast(`${isOwnedInFleet ? 'Vaisseau cargo assigné' : 'Simulation activée sur'} : ${target.fullName} (${target.cargoScu} SCU)`);
        closeInspector();
      }
    });
  });
}

// Tiroir d'ajustement du capital disponible
function openTradeCapitalModal() {
  const presets = [10000, 500000, 1284500, 2500000, 5000000, 10000000];
  const presetsHtml = presets.map(p => `
    <button type="button" class="vo-btn ${tradeState.userCapital === p ? 'primary' : 'outline'} btn-capital-preset" data-preset="${p}" style="font-size:0.75rem; padding:8px;">
      ${p.toLocaleString('fr-FR')} aUEC ${p === 10000 ? '(Test 4 SCU)' : ''}
    </button>
  `).join('');

  openInspector({
    title: 'Ajuster votre capital de commerce',
    subtitle: 'Calcul d\'exposition financière, soute et Quantum Full',
    body: `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <p style="font-size:0.8rem; color:var(--text-dim);">
          Le capital détermine le nombre maximum de SCU finançables par rotation et vérifie si le vaisseau n'est pas surdimensionné pour le volume acheté :
        </p>
        <div>
          <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:6px;">Presets rapides :</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            ${presetsHtml}
          </div>
        </div>
        <div>
          <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:6px;">Montant personnalisé (aUEC) :</label>
          <input type="number" id="inputCustomCapital" value="${tradeState.userCapital}" step="50000" min="1000" style="width:100%; padding:10px 14px; background:var(--bg-card-inner); border:1px solid var(--border-medium); border-radius:4px; color:#fff; font-family:var(--font-mono); font-size:1rem;">
        </div>
      </div>
    `,
    footer: `
      <button type="button" class="vo-btn primary" id="btnConfirmCapital" style="width:100%;">
        Appliquer ce capital (${tradeState.userCapital.toLocaleString('fr-FR')} aUEC)
      </button>
    `
  });

  document.querySelectorAll('.btn-capital-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.getAttribute('data-preset')) || 1284500;
      const input = document.getElementById('inputCustomCapital');
      if (input) input.value = val;
      const confirmBtn = document.getElementById('btnConfirmCapital');
      if (confirmBtn) confirmBtn.textContent = `Appliquer ce capital (${val.toLocaleString('fr-FR')} aUEC)`;
      triggerHaptic(6);
    });
  });

  document.getElementById('inputCustomCapital')?.addEventListener('input', (e) => {
    const val = Number(e.target.value) || 0;
    const confirmBtn = document.getElementById('btnConfirmCapital');
    if (confirmBtn) confirmBtn.textContent = `Appliquer ce capital (${val.toLocaleString('fr-FR')} aUEC)`;
  });

  document.getElementById('btnConfirmCapital')?.addEventListener('click', () => {
    const input = document.getElementById('inputCustomCapital');
    const val = Math.max(1000, Number(input?.value) || tradeState.userCapital);
    tradeState.userCapital = val;
    renderTradeCards();
    triggerHaptic(12);
    showToast(`Capital disponible mis à jour : ${val.toLocaleString('fr-FR')} aUEC`);
    closeInspector();
  });
}

// Tiroir Mode 2 : Analyse détaillée de la route & vaisseau optimal
function openTradeRouteAnalysisModal() {
  const routes = tradeService.getRoutes();
  const sel = routes.find(r => r.id === tradeState.selectedRouteId) || routes[0];
  const rec = tradeService.recommendBestShipForRoute(sel, tradeState.userCapital, fleetService.getShips());
  const { currentShip } = getEffectiveTradeContext();
  const q = tradeService.computeQuantumFullRoute(sel, rec.recommendedShip);

  openInspector({
    title: `Mode 2 · Analyse de la route`,
    subtitle: `${sel.name || sel.item}`,
    body: `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div class="vo-card" style="padding:14px; background:rgba(60,210,255,0.06); border-left:3px solid var(--accent-cyan);">
          <div style="font-weight:700; color:#fff; font-size:0.9rem; margin-bottom:4px;">Recommandation AARON MFD</div>
          <p style="font-size:0.82rem; color:#d1fae5; line-height:1.5; margin:0;">
            ${rec.rationale_fr}
          </p>
        </div>

        <div>
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">NAVIGATION EN QUANTUM FULL</div>
          <table class="vo-table">
            <tbody>
              <tr><td>Distance interplanétaire</td><td style="text-align:right;" class="val-bold">${q.distanceGm} GM (${(q.distanceKm).toLocaleString('fr-FR')} km)</td></tr>
              <tr><td>Moteur Quantique préconisé</td><td style="text-align:right;">${q.qdName} (${(q.qdSpeedKmS).toLocaleString('fr-FR')} km/s)</td></tr>
              <tr><td>Temps Quantum pur (A/R)</td><td style="text-align:right;">~${q.quantumMinutesRoundTrip} min</td></tr>
              <tr><td>Montée / descente atmosphère</td><td style="text-align:right;">~${q.atmoMinutesRoundTrip} min</td></tr>
              <tr><td>Transit TDD & terminaux</td><td style="text-align:right;">~${q.terminalMinutesRoundTrip} min</td></tr>
              <tr><td>Rotation complète Quantum Full</td><td style="text-align:right;" class="val-green"><b>~${q.totalRotationMinutes} min (${q.rotationsPerHour} rot/h)</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    footer: `
      <button type="button" class="vo-btn primary" id="btnApplyOptimalShip" style="width:100%;">
        ${rec.recommendedShip.owned ? 'Assigner' : 'Simuler avec'} ${rec.recommendedShip.shipName} (${rec.recommendedShip.cargoScu} SCU)
      </button>
    `
  });

  document.getElementById('btnApplyOptimalShip')?.addEventListener('click', () => {
    const recShip = rec.recommendedShip;
    const isOwned = tradeService.isShipOwnedInFleet(recShip, fleetService.getShips());
    const match = MARKET_CARGO_SHIPS.find(p => p.name === recShip.shipName || recShip.shipName.includes(p.name));
    if (match) {
      tradeState.customSelectedShip = { ...match, owned: isOwned };
    } else {
      tradeState.customSelectedShip = {
        id: 'custom',
        name: recShip.shipName,
        fullName: recShip.shipName,
        cargoScu: recShip.cargoScu,
        owned: isOwned
      };
    }
    renderTradeCards();
    triggerHaptic(12);
    showToast(`Vaisseau optimal assigné : ${recShip.shipName} (${recShip.cargoScu} SCU · ${isOwned ? 'Flotte' : 'Simulation'}) !`);
    closeInspector();
  });
}

// Tiroir interactif d'exploration des marchandises de commerce (Catalogue UEX Corp)
function openCommoditiesCatalogModal() {
  let selectedCategory = 'all';
  let searchQuery = '';

  const renderTableContent = () => {
    const list = uexService.getCommoditiesList({
      category: selectedCategory,
      search: searchQuery
    });

    if (list.length === 0) {
      return `
        <tr>
          <td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">
            Aucune marchandise trouvée pour « ${searchQuery} »
          </td>
        </tr>
      `;
    }

    return list.map(c => {
      const marginClass = c.marginPerScu > 2000 ? 'val-green' : (c.marginPerScu > 0 ? '' : 'val-red');
      const categoryIcon = {
        metals: '💎',
        industrial: '⚙️',
        medical: '💉',
        consumables: '🥫',
        gases: '⛽',
        illicit: '☠️'
      }[c.category] || '📦';

      return `
        <tr class="comm-catalog-row" data-comm-id="${c.id}" style="cursor:pointer;" title="Cliquez pour filtrer les routes avec cette marchandise">
          <td class="val-bold">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.1rem;">${categoryIcon}</span>
              <div>
                <div style="font-weight:700; color:#fff;">${c.name_fr}</div>
                <div style="font-size:0.7rem; color:var(--text-muted);">${c.name_en}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="tag" style="font-size:0.65rem;">${c.category.toUpperCase()}</span>
            ${c.isIllegal ? '<span class="tag t-r" style="margin-left:4px; font-size:0.65rem;">ILLICITE</span>' : ''}
          </td>
          <td style="font-family:var(--font-mono); text-align:right;">${c.currentBuy.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</td>
          <td style="font-family:var(--font-mono); text-align:right;">${c.currentSell.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</td>
          <td class="${marginClass}" style="font-family:var(--font-mono); font-weight:700; text-align:right;">
            +${c.marginPerScu.toLocaleString('fr-FR')} aUEC
          </td>
          <td style="font-size:0.75rem;">
            <b>${c.bestBuy?.location || 'Stanton'}</b>
            <div style="font-size:0.68rem; color:var(--text-muted);">${c.bestBuy?.system || 'Stanton'}</div>
          </td>
          <td style="font-size:0.75rem;">
            <b>${c.bestSell?.location || 'TDD'}</b>
            <div style="font-size:0.68rem; color:var(--text-muted);">${c.bestSell?.system || 'Stanton'}</div>
          </td>
        </tr>
      `;
    }).join('');
  };

  const categories = uexService.getCategories();
  const catChipsHtml = categories.map(cat => `
    <button type="button" class="vo-btn ${cat.id === 'all' ? 'primary' : 'outline'} btn-comm-cat-filter" data-cat="${cat.id}" style="font-size:0.7rem; padding:4px 8px;">
      ${cat.icon} ${cat.label_fr.split(' ')[0]} (${cat.count})
    </button>
  `).join('');

  const syncInfo = uexService.getSyncStatus();

  openInspector({
    title: 'Catalogue des Marchandises de Trade',
    subtitle: `Star Citizen 4.x · ${syncInfo.totalCommodities} commodités · Cours ${syncInfo.badgeText} (${syncInfo.timeAgoText})`,
    body: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <!-- Barre de recherche et filtres -->
        <div style="display:flex; gap:8px; align-items:center;">
          <input type="text" id="commCatalogSearchInput" placeholder="Rechercher une marchandise (Quantainium, Titane, Maze, Vivres)..." style="flex:1; padding:8px 12px; background:var(--bg-card-inner); border:1px solid var(--border-medium); border-radius:4px; color:#fff; font-size:0.85rem;">
        </div>

        <!-- Puces de catégories -->
        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="commCategoryChipsContainer">
          ${catChipsHtml}
        </div>

        <!-- Tableau scrollable des marchandises -->
        <div style="max-height:480px; overflow-y:auto; border:1px solid var(--border-subtle); border-radius:4px;">
          <table class="vo-table" style="font-size:0.78rem;">
            <thead>
              <tr style="position:sticky; top:0; background:var(--bg-card); z-index:2;">
                <th>Marchandise</th>
                <th>Catégorie</th>
                <th style="text-align:right;">Achat (aUEC/cSCU)</th>
                <th style="text-align:right;">Vente (aUEC/cSCU)</th>
                <th style="text-align:right;">Marge / SCU</th>
                <th>Meilleur Achat</th>
                <th>Meilleure Vente</th>
              </tr>
            </thead>
            <tbody id="commCatalogTableBody">
              ${renderTableContent()}
            </tbody>
          </table>
        </div>
      </div>
    `,
    footer: `
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
        <span style="font-size:0.75rem; color:var(--text-muted);">
          1 SCU = 100 cSCU · Données officielles UEX Corp (Stanton & Pyro)
        </span>
        <button type="button" class="vo-btn outline" id="btnCloseCommCatalog">
          Fermer
        </button>
      </div>
    `,
    wide: true
  });

  const searchInput = document.getElementById('commCatalogSearchInput');
  const tbody = document.getElementById('commCatalogTableBody');

  const updateTable = () => {
    if (tbody) tbody.innerHTML = renderTableContent();
    attachRowClicks();
  };

  const attachRowClicks = () => {
    tbody?.querySelectorAll('.comm-catalog-row').forEach(row => {
      row.addEventListener('click', () => {
        const commId = row.getAttribute('data-comm-id');
        if (commId) {
          tradeState.selectedCommodityFilter = commId;
          triggerHaptic(8);
          closeInspector();
          showToast(`Marchandise filtrée : ${commId}`);
          renderTradeCards();
        }
      });
    });
  };

  attachRowClicks();

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    updateTable();
  });

  document.querySelectorAll('.btn-comm-cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-comm-cat-filter').forEach(b => {
        b.className = 'vo-btn outline btn-comm-cat-filter';
      });
      btn.className = 'vo-btn primary btn-comm-cat-filter';
      selectedCategory = btn.getAttribute('data-cat') || 'all';
      triggerHaptic(6);
      updateTable();
    });
  });

  document.getElementById('btnCloseCommCatalog')?.addEventListener('click', closeInspector);
}

// ============================================================================
// 9. RENDU : GUILDE (NOVA MINING CO. - MAQUETTE 5 EXACTE)
// ============================================================================
let activeGuildTab = 'overview';

function renderGuildContent() {
  // Bind candidates action buttons
  document.querySelectorAll('.candidate-btn.approve').forEach(btn => {
    btn.onclick = () => {
      const row = btn.closest('.candidate-row');
      const name = row?.querySelector('.val-bold')?.textContent || 'Candidat';
      row?.remove();
      showToast(`✓ Candidature de ${name} approuvée dans Nova Mining Co. !`);
    };
  });

  document.querySelectorAll('.candidate-btn.reject').forEach(btn => {
    btn.onclick = () => {
      const row = btn.closest('.candidate-row');
      const name = row?.querySelector('.val-bold')?.textContent || 'Candidat';
      row?.remove();
      showToast(`Candidature de ${name} rejetée.`);
    };
  });

  // Ordres logistiques interactifs (Kanban click to advance)
  document.querySelectorAll('.logistics-kanban-card').forEach(card => {
    card.onclick = () => {
      showToast('📦 Statut de transfert logistique synchronisé avec le hangar de guilde !');
    };
  });

  // Sous-onglets Guilde (Vue d'ensemble / Membres / Opérations / Logistique / Bourse & Marché)
  document.querySelectorAll('#viewGuild [data-gtab]').forEach(btn => {
    btn.onclick = () => {
      const gtab = btn.getAttribute('data-gtab');
      switchGuildSubTab(gtab);
    };
  });
}

// ============================================================================
// 10. FLEETS & MULTI-CREW OPERATIONS CONTROLLER (AARON MFD WING OPS)
// Coordination multi-joueurs à bord du même vaisseau (MOLE) ou en escadre (Wing),
// simulation de tir laser synchronisé, répartition de session et ordres mo.Trader
// ============================================================================
let liveSessionSeconds = 0;
let liveSessionTimerInterval = null;
let activeFleetSubview = 'roster'; // 'roster' | 'jointfire' | 'payouts' | 'logs'
let activeJointFireCallsigns = new Set();

function syncActiveJointFireCallsigns() {
  const members = coopService.getAllCrewMembers().filter(m => m.laserId && m.powerWatts > 0);
  activeJointFireCallsigns = new Set(members.map(m => m.callsign));
}

function formatSessionTime(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `EN COURS ${h}:${m}:${s}`;
}

function renderFleetsScreen() {
  const hasSession = coopService.hasActiveSession();
  const session = coopService.getSession();
  const emptyContainer = document.getElementById('fleetEmptyStateContainer');
  const activeContainer = document.getElementById('fleetActiveStateContainer');
  const timerBadge = document.getElementById('fleetLiveTimerBadge');
  const titleEl = document.getElementById('fleetLiveSessionTitle');
  const subEl = document.getElementById('fleetLiveSubtitle');
  const btnClose = document.getElementById('btnCloseLiveSession');
  const btnAddShip = document.getElementById('btnOpenAddFleetShip');
  const btnHeaderCreate = document.getElementById('btnHeaderCreateFleet');
  const presetSelect = document.getElementById('fleetPresetSelect');

  if (btnHeaderCreate) {
    btnHeaderCreate.style.display = hasSession ? 'none' : 'inline-flex';
  }

  if (!hasSession || !session) {
    if (emptyContainer) emptyContainer.style.display = 'block';
    if (activeContainer) activeContainer.style.display = 'none';

    if (titleEl) titleEl.textContent = "Opérations d'Escadre (Fleets)";
    if (subEl) subEl.textContent = "Coordination multi-joueurs, partage de soute et tirs laser synchronisés";
    if (timerBadge) timerBadge.style.display = 'none';
    if (btnClose) btnClose.style.display = 'none';
    if (btnAddShip) btnAddShip.style.display = 'none';
    if (presetSelect) presetSelect.value = '';
    activeJointFireCallsigns.clear();

    if (liveSessionTimerInterval) {
      clearInterval(liveSessionTimerInterval);
      liveSessionTimerInterval = null;
    }
    updateFleetNetUI();
    return;
  }

  // Session active
  if (emptyContainer) emptyContainer.style.display = 'none';
  if (activeContainer) activeContainer.style.display = 'block';
  if (btnClose) btnClose.style.display = 'inline-flex';
  if (btnAddShip) btnAddShip.style.display = 'inline-flex';

  if (liveSessionSeconds === 0 && session.startedAt) {
    liveSessionSeconds = Math.max(0, Math.floor((Date.now() - session.startedAt) / 1000));
  }

  if (activeJointFireCallsigns.size === 0) {
    syncActiveJointFireCallsigns();
  }

  if (timerBadge) {
    timerBadge.style.display = 'inline-block';
    timerBadge.className = 'vo-badge green';
    timerBadge.textContent = formatSessionTime(liveSessionSeconds);
  }

  if (titleEl) titleEl.textContent = session.name || 'Escadre Minière en direct';
  if (subEl) subEl.textContent = `Escadre Minière & Multi-Crew · ${session.location || 'Stanton'}`;

  // Démarre le timer si pas encore démarré
  if (!liveSessionTimerInterval) {
    liveSessionTimerInterval = setInterval(() => {
      liveSessionSeconds++;
      if (timerBadge) timerBadge.textContent = formatSessionTime(liveSessionSeconds);
    }, 1000);
  }

  const metrics = coopService.getCombinedMetrics();
  const split = coopService.calculateFinancialSplit();

  // KPI 1 : Soute Flotte
  const cargoVal = document.getElementById('fleetKpiCargoVal');
  const cargoBar = document.getElementById('fleetKpiCargoBar');
  const cargoSub = document.getElementById('fleetKpiCargoSub');
  if (cargoVal) {
    cargoVal.innerHTML = `${session.totalOreSCU || 0} / ${metrics.totalScuCapacity} <span style="font-size:0.9rem; font-weight:500; color:var(--text-dim);">SCU</span>`;
  }
  if (cargoBar) {
    const pct = metrics.totalScuCapacity > 0 ? Math.min(100, Math.round(((session.totalOreSCU || 0) / metrics.totalScuCapacity) * 100)) : 0;
    cargoBar.style.width = `${pct}%`;
  }
  if (cargoSub) {
    cargoSub.textContent = `${session.totalOreSCU || 0} SCU extraits · Soutes & Pods cumulés`;
  }

  // KPI 2 : Puissance Laser Combinée
  const laserPower = document.getElementById('fleetKpiLaserPower');
  const laserDetails = document.getElementById('fleetKpiLaserDetails');
  if (laserPower) {
    laserPower.innerHTML = `${metrics.combinedPowerMegaWatts} <span style="font-size:0.9rem; font-weight:500;">MW</span>`;
  }
  if (laserDetails) {
    laserDetails.textContent = `${metrics.totalLasersCount} lasers actifs · -${metrics.combinedResistanceReductionPct}% Résistance cumulée`;
  }

  // KPI 3 : Valeur Nette
  const netVal = document.getElementById('fleetKpiNetVal');
  const grossSub = document.getElementById('fleetKpiGrossSub');
  if (netVal) {
    netVal.textContent = `${(split.distributableUEC / 1000000).toFixed(2)} M`;
  }
  if (grossSub) {
    const deductionsK = Math.round((split.expenses + split.guildTaxUEC + split.reserveFundUEC) / 1000);
    grossSub.textContent = `aUEC · Brut ${(split.gross / 1000000).toFixed(2)} M (Déductions -${deductionsK} k)`;
  }

  // KPI 4 : Effectif & Sécurité
  const crewCount = document.getElementById('fleetKpiCrewCount');
  const securitySub = document.getElementById('fleetKpiSecuritySub');
  if (crewCount) {
    crewCount.textContent = `${metrics.totalCrewCount} membres`;
  }
  if (securitySub) {
    const mcCount = (session.ships || []).filter(s => s.isMultiCrew).length;
    securitySub.textContent = `${metrics.totalShipsCount} vaisseaux · ${mcCount} Multi-Crew · Escorte Active`;
  }

  // Sélecteur de preset synchronisé
  if (presetSelect && session.presetId) {
    presetSelect.value = session.presetId;
  }

  // Sous-vues
  renderFleetRoster(session);
  renderFleetJointFire(session);
  renderFleetPayouts(session, split);
  renderFleetLogs(session);

  // Mise à jour de la barre de liaison P2P
  updateFleetNetUI();
}

function renderFleetRoster(session) {
  const container = document.getElementById('fleetShipsRosterGrid');
  if (!container) return;

  container.innerHTML = session.ships.map(ship => {
    if (ship.isMultiCrew) {
      // Affichage spécifique Vaisseau Multi-Crew avec postes à bord
      const stationsHtml = ship.crew.map(member => {
        const isLaser = Boolean(member.laserId);
        const laserDetail = isLaser
          ? `<div class="station-laser-info">⚡ ${member.laserName || 'Laser'} · ${member.powerWatts} W ${member.resistanceReductionPct > 0 ? `· <span class="val-green">-${member.resistanceReductionPct}% rés</span>` : ''}</div>`
          : `<div class="station-laser-info" style="color:var(--text-dim);">Commande de vol & navigation</div>`;

        return `
          <div class="crew-station-box">
            <div class="station-role-row">
              <span class="station-role-label">${member.role.includes('pilot') ? '🧑‍✈️' : (member.role.includes('turret') ? '⚡' : '🧲')} ${member.roleLabel}</span>
              <span class="vo-badge ${member.status === 'online' ? 'green' : 'amber'}" style="font-size:0.68rem; padding:1px 6px;">
                ${member.status === 'online' ? 'EN LIGNE' : 'ABSENT'}
              </span>
            </div>
            <div class="station-operator">
              <span class="status-dot-green"></span>
              <span class="station-callsign">${member.callsign}</span>
            </div>
            ${laserDetail}
            <div class="station-actions">
              <span style="font-size:0.72rem; color:var(--text-dim); font-family:var(--font-mono);">Part : ${member.sharePct}%</span>
              <button type="button" class="vo-btn outline btn-edit-crew-slot" data-ship-id="${ship.id}" data-callsign="${member.callsign}" style="font-size:0.68rem; padding:2px 6px;">
                ✏️ Assigner
              </button>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="multicrew-ship-card">
          <div class="multicrew-header">
            <div>
              <div class="multicrew-title">
                <span>🛰️</span> ${ship.name}
                <span class="vo-badge cyan">Multi-Crew (${ship.crew.length} postes occupés)</span>
              </div>
              <div class="multicrew-meta">
                Modèle : ${ship.modelId.toUpperCase()} · Soute : ${ship.totalScu} SCU · Rôle : ${ship.roleLabel}
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="vo-btn outline btn-quick-assign-crew" data-ship-id="${ship.id}" style="font-size:0.72rem; padding:4px 8px;">
                ＋ Ajouter poste
              </button>
            </div>
          </div>

          <div style="font-size:0.78rem; font-weight:700; color:var(--accent-cyan); text-transform:uppercase; letter-spacing:0.5px;">
            Postes à bord & Opérateurs de tourelles :
          </div>
          <div class="stations-grid">
            ${stationsHtml}
          </div>
        </div>
      `;
    } else {
      // Vaisseau solo ou support d'escadre
      const pilot = ship.crew[0] || { callsign: 'Non assigné', roleLabel: 'Pilote', sharePct: 10 };
      const roleBadgeCls = ship.role === 'cargo' ? 'green' : (ship.role === 'escort' ? 'amber' : 'cyan');

      return `
        <div class="vo-card" style="padding:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div class="citizen-avatar-pill" style="width:42px; height:42px; font-size:1.3rem;">
              ${ship.role === 'cargo' ? '📦' : (ship.role === 'escort' ? '⚔️' : '⛏️')}
            </div>
            <div>
              <div style="font-size:0.98rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">
                ${ship.name}
                <span class="vo-badge ${roleBadgeCls}">${ship.roleLabel}</span>
              </div>
              <div style="font-size:0.76rem; color:var(--text-dim); margin-top:2px;">
                Pilote : <strong style="color:#fff;">${pilot.callsign}</strong> · Capacité : ${ship.totalScu} SCU · Part : ${pilot.sharePct}%
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="vo-btn outline btn-edit-crew-slot" data-ship-id="${ship.id}" data-callsign="${pilot.callsign}" style="font-size:0.72rem; padding:4px 8px;">
              ✏️ Changer pilote
            </button>
            <button type="button" class="vo-btn outline btn-remove-wing-ship" data-ship-id="${ship.id}" style="font-size:0.72rem; padding:4px 8px; color:var(--accent-red);">
              ✕ Retirer
            </button>
          </div>
        </div>
      `;
    }
  }).join('');

  // Clics sur boutons d'assignation
  container.querySelectorAll('.btn-edit-crew-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-id');
      const callsign = btn.getAttribute('data-callsign');
      const newCallsign = prompt(`Nouveau callsign / pseudo pour ce poste (actuel: ${callsign}) :`, callsign);
      if (newCallsign && newCallsign.trim()) {
        const ship = session.ships.find(s => s.id === shipId);
        if (ship) {
          const member = ship.crew.find(m => m.callsign === callsign);
          if (member) member.callsign = newCallsign.trim().toUpperCase();
        }
        renderFleetsScreen();
        showToast(`✓ Poste assigné à ${newCallsign.trim().toUpperCase()} !`);
      }
    });
  });

  container.querySelectorAll('.btn-quick-assign-crew').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-id');
      const callsign = prompt('Callsign du nouveau coéquipier à bord :');
      if (callsign && callsign.trim()) {
        coopService.assignCrewMember(shipId, {
          callsign: callsign.trim().toUpperCase(),
          role: 'turret_extra',
          roleLabel: 'Tourelle Auxiliaire',
          laserId: 'lancet_s2',
          laserName: 'Lancet MH2 S2',
          powerWatts: 2000,
          resistanceReductionPct: 35,
          sharePct: 15
        });
        renderFleetsScreen();
        showToast(`✓ Nouveau coéquipier ${callsign.trim().toUpperCase()} ajouté à bord !`);
      }
    });
  });

  container.querySelectorAll('.btn-remove-wing-ship').forEach(btn => {
    btn.addEventListener('click', () => {
      const shipId = btn.getAttribute('data-ship-id');
      coopService.removeShip(shipId);
      renderFleetsScreen();
      showToast('Vaisseau retiré de l’escadre.');
    });
  });
}

function renderFleetJointFire(session) {
  const listEl = document.getElementById('jointFireLasersList');
  if (!listEl) return;

  const allMembers = coopService.getAllCrewMembers().filter(m => m.laserId && m.powerWatts > 0);
  const sim = coopService.simulateJointFracture(session.targetRock, Array.from(activeJointFireCallsigns));

  listEl.innerHTML = allMembers.map(m => {
    const isFiring = activeJointFireCallsigns.has(m.callsign);
    return `
      <div class="laser-toggle-item ${isFiring ? 'firing' : ''}" data-callsign="${m.callsign}">
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="checkbox" ${isFiring ? 'checked' : ''} style="cursor:pointer;" onclick="event.stopPropagation()">
          <div>
            <div style="font-weight:700; color:#fff; font-size:0.86rem;">
              ${m.shipName} · ${m.roleLabel}
            </div>
            <div style="font-size:0.74rem; color:var(--text-dim);">
              Opérateur : <strong style="color:var(--accent-cyan);">${m.callsign}</strong> · ${m.laserName || 'Laser'}
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:var(--font-mono); font-weight:700; color:#fff; font-size:0.88rem;">${m.powerWatts} W</div>
          ${m.resistanceReductionPct > 0 ? `<div style="font-size:0.7rem; color:#4ade80;">-${m.resistanceReductionPct}% rés.</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  listEl.querySelectorAll('.laser-toggle-item').forEach(item => {
    item.addEventListener('click', () => {
      const callsign = item.getAttribute('data-callsign');
      if (activeJointFireCallsigns.has(callsign)) {
        activeJointFireCallsigns.delete(callsign);
      } else {
        activeJointFireCallsigns.add(callsign);
      }
      coopService.broadcastJointFire(activeJointFireCallsigns);
      renderFleetJointFire(session);
    });
  });

  // Mettre à jour l'affichage de fracture
  const rockNameEl = document.getElementById('jointFireRockName');
  const rockSubEl = document.getElementById('jointFireRockSub');
  const rockValEl = document.getElementById('jointFireRockValBadge');
  const rockMassEl = document.getElementById('jointFireRockMass');
  const effectiveResEl = document.getElementById('jointFireRockEffectiveRes');
  const reqWattsEl = document.getElementById('jointFireRequiredWatts');
  const powerDeliveredEl = document.getElementById('jointFirePowerDelivered');
  const powerBarEl = document.getElementById('jointFirePowerBar');
  const verdictTitleEl = document.getElementById('jointFireVerdictTitle');
  const verdictDescEl = document.getElementById('jointFireVerdictDesc');
  const verdictBoxEl = document.getElementById('jointFireVerdictBox');

  const rock = session.targetRock || {};
  if (rockNameEl) rockNameEl.textContent = rock.name || 'Astéroïde Colossal';
  if (rockSubEl) rockSubEl.textContent = `${rock.mineralName || 'Quantainium'} ${rock.orePercentage || 30}% · ${(rock.massKg || 35000).toLocaleString('fr-FR')} kg · Résistance ${rock.resistance}% · Instabilité ${rock.instability}`;
  if (rockValEl) rockValEl.textContent = `~${((rock.estimatedValueUEC || 3000000) / 1000000).toFixed(1)} M aUEC`;
  if (rockMassEl) rockMassEl.textContent = `${((rock.massKg || 35000) / 1000).toFixed(1)} t`;
  if (effectiveResEl) effectiveResEl.textContent = `${sim.effectiveResistancePct} %`;
  if (reqWattsEl) reqWattsEl.textContent = `${sim.requiredWatts.toLocaleString('fr-FR')} W`;
  if (powerDeliveredEl) powerDeliveredEl.textContent = `${sim.totalWatts.toLocaleString('fr-FR')} W (${sim.activeShooters.length} lasers)`;

  if (powerBarEl) {
    const pct = Math.min(100, Math.round((sim.totalWatts / (sim.requiredWatts || 1)) * 100));
    powerBarEl.style.width = `${pct}%`;
    powerBarEl.className = `power-bar-fill ${sim.powerRatio > 1.8 ? 'overload' : ''}`;
  }

  if (verdictBoxEl) {
    if (sim.isFracturable) {
      verdictBoxEl.style.background = 'rgba(34,197,94,0.12)';
      verdictBoxEl.style.borderColor = '#22c55e';
      if (verdictTitleEl) {
        verdictTitleEl.style.color = '#4ade80';
        verdictTitleEl.textContent = '✓ FRACTURABLE EN ÉQUIPE';
      }
      if (verdictDescEl) {
        verdictDescEl.textContent = `${sim.activeShooters.length} lasers synchronisés · Seuil d'énergie franchi (${Math.round(sim.powerRatio * 100)}%) · Temps estimé : ~${sim.estimatedTimeToFractureSec}s`;
      }
    } else {
      verdictBoxEl.style.background = 'rgba(239,68,68,0.12)';
      verdictBoxEl.style.borderColor = '#ef4444';
      if (verdictTitleEl) {
        verdictTitleEl.style.color = '#f87171';
        verdictTitleEl.textContent = '⚠ PUISSANCE INSUFFISANTE';
      }
      if (verdictDescEl) {
        verdictDescEl.textContent = `Il manque ${Math.round(sim.requiredWatts - sim.totalWatts)} W pour briser ce bloc. Activez une tourelle laser supplémentaire ou appliquez un gadget Sabir !`;
      }
    }
  }
}

function renderFleetPayouts(session, split) {
  const tbody = document.getElementById('fleetPayoutsTableBody');
  const box = document.getElementById('motraderCommandsBox');
  const distTotalEl = document.getElementById('fleetDistributableTotal');
  const guildTaxEl = document.getElementById('fleetGuildTaxTotal');

  if (distTotalEl) distTotalEl.textContent = `${split.distributableUEC.toLocaleString('fr-FR')} aUEC`;
  if (guildTaxEl) guildTaxEl.textContent = `${split.guildTaxUEC.toLocaleString('fr-FR')} aUEC`;

  if (tbody) {
    tbody.innerHTML = split.payouts.map(p => {
      let roleCls = 'cyan';
      if (p.shipRole === 'cargo') roleCls = 'green';
      else if (p.shipRole === 'escort') roleCls = 'amber';

      return `
        <tr>
          <td><span class="status-dot-green" style="display:inline-block; margin-right:6px;"></span><strong>${p.callsign}</strong></td>
          <td style="color:var(--text-muted); font-size:0.8rem;">${p.shipName}</td>
          <td><span class="vo-badge ${roleCls}">${p.roleLabel}</span></td>
          <td>${p.calculatedSharePct || p.sharePct} %</td>
          <td class="val-green" style="font-family:var(--font-mono); font-weight:700;">${p.amountUEC.toLocaleString('fr-FR')} aUEC</td>
        </tr>
      `;
    }).join('');
  }

  // Commandes mo.Trader
  if (box) {
    const cmds = coopService.generateMoTraderCommands();
    box.innerHTML = cmds.map(c => `
      <div class="motrader-cmd-line">
        <span>${c.commandText}</span>
        <span style="color:var(--text-dim); font-size:0.74rem;">${c.role}</span>
      </div>
    `).join('');
  }
}

function renderFleetLogs(session) {
  const feed = document.getElementById('fleetLiveLogFeed');
  if (!feed) return;

  const logs = session.logs || [];
  feed.innerHTML = logs.map(l => {
    let authorColor = 'var(--accent-cyan)';
    if (l.type === 'cargo') authorColor = 'var(--accent-green)';
    if (l.type === 'security') authorColor = 'var(--accent-amber)';

    return `
      <div class="session-log-item">
        <span class="session-log-time">${l.time}</span>
        <span><strong style="color:${authorColor};">${l.author}</strong> : ${l.text}</span>
      </div>
    `;
  }).join('');
}

// Timer tick pour la session de flotte
setInterval(() => {
  liveSessionSeconds++;
  const badgeEl = document.getElementById('fleetLiveTimerBadge');
  if (badgeEl) badgeEl.textContent = formatSessionTime(liveSessionSeconds);
}, 1000);

// ============================================================================
// LIAISON RÉSEAU MULTIJOUEUR EN DIRECT (FLEET-NET P2P & LOCAL)
// ============================================================================

function updateFleetNetUI() {
  const net = coopService.getNetworkStatus();
  const dot = document.getElementById('fleetNetStatusDot');
  const text = document.getElementById('fleetNetStatusText');
  const details = document.getElementById('fleetNetDetailsTag');
  const roomEl = document.getElementById('fleetNetRoomCodeDisplay');
  const peersEl = document.getElementById('fleetNetPeersCountDisplay');
  const pingEl = document.getElementById('fleetNetPingDisplay');
  const actionBtnText = document.getElementById('btnWingActionText');
  const inviteBtn = document.getElementById('btnCopyInviteLink');
  const disconnectBtn = document.getElementById('btnDisconnectWing');
  const topbarFleetDot = document.getElementById('topbarFleetDot');
  const topbarFleetName = document.getElementById('topbarFleetName');

  const isConnected = (net.status === 'connected');
  const isConnecting = (net.status === 'connecting');

  if (dot) {
    if (isConnected) {
      dot.style.background = '#22c55e';
      dot.style.boxShadow = '0 0 8px rgba(34,197,94,0.6)';
    } else if (isConnecting) {
      dot.style.background = '#f59e0b';
      dot.style.boxShadow = '0 0 8px rgba(245,158,11,0.6)';
    } else {
      dot.style.background = '#ef4444';
      dot.style.boxShadow = '0 0 8px rgba(239,68,68,0.6)';
    }
  }

  if (text) {
    if (isConnected) {
      text.textContent = `LIAISON P2P MULTIJOUEUR EN LIGNE (${net.isHost ? 'HÔTE' : 'AILIER'})`;
      text.style.color = '#4ade80';
    } else if (isConnecting) {
      text.textContent = 'CONNEXION RÉSEAU P2P EN COURS...';
      text.style.color = '#fbbf24';
    } else {
      text.textContent = 'LIAISON P2P : HORS-LIGNE (MODE SOLO)';
      text.style.color = 'var(--text-muted)';
    }
  }

  if (details) {
    details.style.display = isConnected ? 'inline-flex' : 'none';
  }
  if (roomEl) roomEl.textContent = net.roomCode || 'WING-XXXX';
  if (peersEl) {
    const count = net.peers.length;
    peersEl.textContent = `${count} ailier${count > 1 ? 's' : ''} connecté${count > 1 ? 's' : ''}`;
  }
  if (pingEl) pingEl.textContent = `${net.pingMs || 15} ms`;

  if (actionBtnText) {
    actionBtnText.textContent = isConnected ? `Gérer Escadre (${net.roomCode})` : 'Rejoindre / Créer Escadre P2P';
  }
  if (inviteBtn) inviteBtn.style.display = isConnected ? 'inline-flex' : 'none';
  if (disconnectBtn) disconnectBtn.style.display = isConnected ? 'inline-flex' : 'none';

  if (topbarFleetDot) {
    topbarFleetDot.style.background = isConnected ? '#22c55e' : (isConnecting ? '#f59e0b' : '#ef4444');
    topbarFleetDot.style.boxShadow = isConnected ? '0 0 8px rgba(34,197,94,0.6)' : 'none';
  }
  if (topbarFleetName) {
    topbarFleetName.textContent = isConnected
      ? `${net.roomCode} [${net.peers.length + 1}p · ${net.pingMs || 15}ms]`
      : 'Opération Quanta (Solo)';
  }
}

function initFleetNetSync() {
  const localCallsign = (typeof store !== 'undefined' && store.get('callsign')) || 'VORTEX-1';
  coopService.initFleetNet({
    callsign: localCallsign,
    onStatusChange: (status, roomCode, isHost) => {
      updateFleetNetUI();
      if (status === 'connected') {
        showToast(`🟢 Liaison P2P ${isHost ? 'Hôte' : 'Ailier'} active sur le salon ${roomCode}`);
      }
    },
    onPeersUpdate: () => {
      updateFleetNetUI();
      const session = coopService.getSession();
      renderFleetRoster(session);
      renderFleetJointFire(session);
    },
    onPeerJoin: (peer) => {
      showToast(`🛰️ ${peer.callsign} a rejoint l’escadre !`);
      renderFleetsScreen();
    },
    onPeerLeave: (peer) => {
      showToast(`👋 ${peer.callsign} s'est déconnecté.`);
      renderFleetsScreen();
    }
  });

  coopService.manager.onJointFireRemoteSync = (fireData, fromCallsign) => {
    if (fireData && Array.isArray(fireData.activeCallsigns)) {
      activeJointFireCallsigns = new Set(fireData.activeCallsigns);
      renderFleetJointFire(coopService.getSession());
      showToast(`⚡ Tir laser synchronisé par ${fromCallsign}`);
    }
  };

  coopService.manager.onNetworkUpdate = () => {
    renderFleetsScreen();
  };

  // Détection du paramètre d'invitation URL (?fleet=WING-XXXX ou ?wing=WING-XXXX)
  if (typeof window !== 'undefined' && window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('fleet') || urlParams.get('wing');
    if (roomFromUrl && roomFromUrl.trim()) {
      setTimeout(() => {
        coopService.joinWing(roomFromUrl.trim().toUpperCase());
        setActiveApp('fleets');
        showToast(`🛰️ Rejoint l'escadre ${roomFromUrl.trim().toUpperCase()} via lien d'invitation !`);
      }, 600);
    }
  }
}

// ============================================================================
// 10. COMPTE, AUTHENTIFICATION & PROFIL CITOYEN UEE (1.1)
// ============================================================================

const CALLSIGN_PREFIXES = ['VORTEX', 'HAULER', 'VIPER', 'GHOST', 'IRONCLAD', 'TITAN', 'EAGLE', 'SHADOW', 'ROCK', 'NOVA', 'CORSAIR', 'APEX', 'STORM', 'PHANTOM'];

function generateRandomCallsign() {
  const prefix = CALLSIGN_PREFIXES[Math.floor(Math.random() * CALLSIGN_PREFIXES.length)];
  const num = Math.floor(1 + Math.random() * 99);
  return `${prefix}-${num}`;
}

function evaluatePasswordStrength(password) {
  if (!password) return { percent: 0, text: 'Vide', color: '#64748b' };
  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 25;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 25;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;

  if (score <= 25) return { percent: 25, text: 'Faible', color: '#ef4444' };
  if (score <= 50) return { percent: 50, text: 'Moyen', color: '#f59e0b' };
  if (score <= 75) return { percent: 75, text: 'Fort', color: '#38bdf8' };
  return { percent: 100, text: 'Sécurisé UEE', color: '#22c55e' };
}

let selectedSpecialtiesCache = ['mining'];

function renderTopBarCitizen() {
  const user = authService.getCurrentUser();
  if (!user) return;

  // 1. Position
  const posEl = document.getElementById('topbarPositionName');
  if (posEl) posEl.textContent = user.location || 'Stanton · ARC-L1';

  // 2. Solde aUEC
  const balEl = document.getElementById('topbarBalanceVal');
  if (balEl && typeof user.balanceAuec === 'number') {
    balEl.textContent = `${user.balanceAuec.toLocaleString('fr-FR')} aUEC`;
  }

  // 3. Capsule Citoyen Topbar
  const avatarEl = document.getElementById('topbarCitizenAvatar');
  const callsignEl = document.getElementById('topbarCallsign');
  const handleEl = document.getElementById('topbarRsiHandle');
  const dropTitle = document.getElementById('dropdownUserTitle');
  const dropSub = document.getElementById('dropdownUserSub');

  const specialtyInfo = CITIZEN_SPECIALTIES[user.primarySpecialty] || CITIZEN_SPECIALTIES.mining;
  if (avatarEl) avatarEl.textContent = specialtyInfo.icon || '⛏️';
  if (callsignEl) callsignEl.textContent = user.callsign || 'CITIZEN-1';
  if (handleEl) handleEl.textContent = `@${user.rsiHandle || 'Citizen'}`;
  if (dropTitle) dropTitle.textContent = `${user.rsiHandle || 'Citoyen'} (${user.callsign || 'PILOT'})`;
  if (dropSub) dropSub.textContent = `${specialtyInfo.label} · ${user.citizenshipNumber || 'UEE-847291'}`;

  // 4. Salutation Dashboard
  const dashTitle = document.querySelector('#viewDashboard .screen-title');
  const dashSub = document.querySelector('#viewDashboard .screen-subtitle');
  if (dashTitle) {
    dashTitle.textContent = `Bonsoir, Commandant ${user.callsign}`;
  }
  if (dashSub) {
    const specsList = (user.specialties || [user.primarySpecialty])
      .map(s => CITIZEN_SPECIALTIES[s]?.label || s)
      .join(', ');
    dashSub.textContent = `Identité RSI : @${user.rsiHandle} · Spécialité : ${specsList} · ${user.location}`;
  }
}

function renderProfileScreen() {
  const user = authService.getCurrentUser();
  if (!user) return;

  const specInfo = CITIZEN_SPECIALTIES[user.primarySpecialty] || CITIZEN_SPECIALTIES.mining;

  // 1. Hero Card
  const heroIcon = document.getElementById('heroCitizenIcon');
  if (heroIcon) heroIcon.textContent = specInfo.icon || '⛏️';

  const heroRank = document.getElementById('heroCitizenRank');
  if (heroRank) heroRank.textContent = (specInfo.shortLabel || 'CITOYEN').toUpperCase();

  const heroCallsign = document.getElementById('heroCallsign');
  if (heroCallsign) heroCallsign.textContent = user.callsign;

  const heroHandle = document.getElementById('heroRsiHandle');
  if (heroHandle) heroHandle.textContent = `@${user.rsiHandle}`;

  const heroUeeNum = document.getElementById('heroUeeNum');
  if (heroUeeNum) heroUeeNum.textContent = `REGISTRE UEE · #${user.citizenshipNumber || 'UEE-847291'} · ${user.citizenshipStatus || 'STATUT ACTIF'}`;

  const heroLoc = document.getElementById('heroLocation');
  if (heroLoc) heroLoc.textContent = user.location ? user.location.replace(/^Stanton · |^Pyro · /, '') : 'ARC-L1';

  const heroShip = document.getElementById('heroActiveShip');
  if (heroShip) {
    const activeShip = fleetService.getActiveShip();
    const shipMeta = activeShip ? getShip(activeShip.shipId) : null;
    heroShip.textContent = shipMeta?.name || 'Prospector';
  }

  const heroBal = document.getElementById('heroBalance');
  if (heroBal) heroBal.textContent = `${user.balanceAuec.toLocaleString('fr-FR')}`;

  // Hero Specialties tags
  const heroTags = document.getElementById('heroSpecialtiesTags');
  if (heroTags) {
    heroTags.innerHTML = (user.specialties || ['mining']).map(specKey => {
      const sp = CITIZEN_SPECIALTIES[specKey] || { label: specKey, icon: '❖' };
      const isPri = specKey === user.primarySpecialty;
      return `<span class="specialty-badge-pill ${isPri ? 'primary' : ''}">${sp.icon} ${sp.label} ${isPri ? '★' : ''}</span>`;
    }).join('');
  }

  // 2. Formulaire Identité RSI
  const rsiInput = document.getElementById('profileInputRsiHandle');
  if (rsiInput) rsiInput.value = user.rsiHandle || '';

  const callsignInput = document.getElementById('profileInputCallsign');
  if (callsignInput) callsignInput.value = user.callsign || '';

  const bioInput = document.getElementById('profileInputBio');
  if (bioInput) bioInput.value = user.bio || '';

  const locSelect = document.getElementById('profileSelectLocation');
  if (locSelect) locSelect.value = user.location || 'Stanton · ARC-L1 Wide Forest';

  const emailDisplay = document.getElementById('profileDisplayEmail');
  if (emailDisplay) emailDisplay.value = user.email || '';

  const pairingCodeDisplay = document.getElementById('profilePairingCodeDisplay');
  if (pairingCodeDisplay) pairingCodeDisplay.textContent = user.pairingCode || '749-821';

  // 3. Sélecteur de Spécialités (Grille)
  renderSpecialtiesGrid(user);

  // 4. Sélecteur de Spécialité Principale
  const priSelect = document.getElementById('profileSelectPrimarySpecialty');
  if (priSelect) {
    priSelect.innerHTML = (user.specialties || ['mining']).map(s => {
      const sp = CITIZEN_SPECIALTIES[s] || { label: s, icon: '❖' };
      return `<option value="${s}" ${s === user.primarySpecialty ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`;
    }).join('');
  }

  // 5. Sélecteur de Vaisseau Actif
  const shipSelect = document.getElementById('profileSelectActiveShip');
  if (shipSelect) {
    const allUserShips = fleetService.getAllShips();
    shipSelect.innerHTML = allUserShips.map(s => {
      const meta = getShip(s.shipId);
      const isAct = s.isActive ? 'selected' : '';
      const [roleName] = ROLE_LABELS[meta?.role || s.role] || ['Support'];
      return `<option value="${s.id}" ${isAct}>${meta?.name || 'Vaisseau'} « ${s.nickname} » (${roleName})</option>`;
    }).join('');
  }

  // 6. Rendu des Sessions Actives
  renderSessionsList(user);

  // 7. Préférences
  const hapticCheck = document.getElementById('prefHaptics');
  if (hapticCheck) hapticCheck.checked = user.preferences?.hapticsEnabled ?? true;

  const syncCheck = document.getElementById('prefAutoSyncScan');
  if (syncCheck) syncCheck.checked = user.preferences?.autoSyncScan ?? true;

  const guildCheck = document.getElementById('prefGuildShare');
  if (guildCheck) guildCheck.checked = user.preferences?.privacyShareWithGuild ?? true;
}

function renderSpecialtiesGrid(user) {
  const container = document.getElementById('specialtySelectionGrid');
  if (!container) return;

  selectedSpecialtiesCache = [...(user.specialties || ['mining'])];

  container.innerHTML = Object.values(CITIZEN_SPECIALTIES).map(spec => {
    const isSelected = selectedSpecialtiesCache.includes(spec.id);
    const isPrimary = spec.id === user.primarySpecialty;

    return `
      <div class="specialty-choice-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'is-primary' : ''}" data-specialty="${spec.id}">
        <div class="specialty-card-header">
          <div class="specialty-card-title">
            <span>${spec.icon}</span>
            <span>${spec.label}</span>
          </div>
          <div class="specialty-checkbox">
            ${isSelected ? '✓' : ''}
          </div>
        </div>
        <div class="specialty-card-desc">${spec.description}</div>
        ${isPrimary ? '<div class="specialty-primary-tag">★ Spécialité Maîtresse</div>' : ''}
      </div>
    `;
  }).join('');

  container.querySelectorAll('.specialty-choice-card').forEach(card => {
    card.addEventListener('click', () => {
      const specId = card.getAttribute('data-specialty');
      if (!specId) return;

      if (selectedSpecialtiesCache.includes(specId)) {
        if (selectedSpecialtiesCache.length <= 1) {
          showToast('Au moins une spécialité doit rester sélectionnée');
          return;
        }
        selectedSpecialtiesCache = selectedSpecialtiesCache.filter(s => s !== specId);
      } else {
        selectedSpecialtiesCache.push(specId);
      }

      // Mettre à jour le selecteur de spécialité principale
      const priSelect = document.getElementById('profileSelectPrimarySpecialty');
      if (priSelect) {
        const curPri = priSelect.value;
        priSelect.innerHTML = selectedSpecialtiesCache.map(s => {
          const sp = CITIZEN_SPECIALTIES[s] || { label: s, icon: '❖' };
          return `<option value="${s}" ${s === curPri ? 'selected' : ''}>${sp.icon} ${sp.label}</option>`;
        }).join('');
      }

      renderSpecialtiesGrid({ ...user, specialties: selectedSpecialtiesCache });
      triggerHaptic(8);
    });
  });
}

function renderSessionsList(user) {
  const container = document.getElementById('profileSessionsList');
  if (!container) return;

  const sessions = user.sessions || [];
  if (sessions.length === 0) {
    container.innerHTML = '<div style="color:var(--text-dim); font-size:0.8rem; padding:8px;">Aucune session active enregistrée.</div>';
    return;
  }

  container.innerHTML = sessions.map(sess => {
    let icon = '💻';
    if (sess.deviceType === 'tablet') icon = '📱';
    else if (sess.deviceType === 'mobile') icon = '📲';

    return `
      <div class="session-item-row">
        <div class="session-item-left">
          <div class="session-icon">${icon}</div>
          <div>
            <div class="session-name">
              ${sess.deviceName}
              ${sess.isCurrent ? '<span style="color:var(--accent-green); font-size:0.7rem; margin-left:6px;">● Actuelle</span>' : ''}
            </div>
            <div class="session-meta">
              IP: ${sess.ip || '192.168.1.x'} · Dernière activité : ${new Date(sess.lastActive || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div>
          ${sess.isCurrent 
            ? '<span class="specialty-badge-pill primary" style="font-size:0.7rem;">Cet appareil</span>'
            : `<button type="button" class="vo-btn outline btn-revoke-session" data-session-id="${sess.id}" style="padding:4px 8px; font-size:0.72rem; color:#f87171; border-color:rgba(248,113,113,0.3);">Révoquer</button>`
          }
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-revoke-session').forEach(btn => {
    btn.addEventListener('click', () => {
      const sessId = btn.getAttribute('data-session-id');
      if (sessId) {
        authService.revokeSession(sessId);
        showToast('Session révoquée avec succès');
        renderProfileScreen();
      }
    });
  });
}

function openAuthModal(defaultTab = 'login') {
  const modal = document.getElementById('authModalBackdrop');
  if (!modal) return;
  modal.classList.add('active');
  switchAuthTab(defaultTab);
  triggerHaptic(10);
}

function closeAuthModal() {
  const modal = document.getElementById('authModalBackdrop');
  if (!modal) return;
  modal.classList.remove('active');
}

function switchAuthTab(tabId) {
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  const paneLogin = document.getElementById('authPaneLogin');
  const paneReg = document.getElementById('authPaneRegister');
  const panePairing = document.getElementById('authPanePairing');

  if (paneLogin) paneLogin.style.display = tabId === 'login' ? 'block' : 'none';
  if (paneReg) paneReg.style.display = tabId === 'register' ? 'block' : 'none';
  if (panePairing) panePairing.style.display = tabId === 'pairing' ? 'block' : 'none';
}

function initCitizenProfileAndAuth() {
  // 1. Bouton Capsule Citoyen Topbar & Menu Déroulant
  const citizenBtn = document.getElementById('topbarCitizenBtn');
  const citizenMenu = document.getElementById('citizenDropdownMenu');

  citizenBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (citizenMenu) {
      citizenMenu.style.display = citizenMenu.style.display === 'none' ? 'block' : 'none';
    }
  });

  document.addEventListener('click', (e) => {
    if (citizenMenu && !citizenMenu.contains(e.target) && !citizenBtn?.contains(e.target)) {
      citizenMenu.style.display = 'none';
    }
  });

  // Liens du menu déroulant
  document.getElementById('btnMenuOpenProfile')?.addEventListener('click', () => {
    if (citizenMenu) citizenMenu.style.display = 'none';
    setActiveApp('profile');
  });

  document.getElementById('btnMenuPairDevice')?.addEventListener('click', () => {
    if (citizenMenu) citizenMenu.style.display = 'none';
    setActiveApp('profile');
    setTimeout(() => {
      document.querySelector('.fast-pairing-box')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  });

  document.getElementById('btnMenuSwitchUser')?.addEventListener('click', () => {
    if (citizenMenu) citizenMenu.style.display = 'none';
    openAuthModal('login');
  });

  document.getElementById('btnMenuLogout')?.addEventListener('click', () => {
    if (citizenMenu) citizenMenu.style.display = 'none';
    authService.logout();
    showToast('Déconnexion effectuée');
    openAuthModal('login');
  });

  // Boutons du Profil Citoyen
  document.getElementById('btnProfileSwitchAccount')?.addEventListener('click', () => {
    openAuthModal('login');
  });

  document.getElementById('btnProfileLogout')?.addEventListener('click', () => {
    authService.logout();
    showToast('Déconnexion effectuée');
    openAuthModal('login');
  });

  // Génération de callsign aléatoire
  document.getElementById('btnRandomCallsign')?.addEventListener('click', () => {
    const input = document.getElementById('profileInputCallsign');
    if (input) {
      input.value = generateRandomCallsign();
      triggerHaptic(8);
    }
  });

  document.getElementById('btnRegRandomCallsign')?.addEventListener('click', () => {
    const input = document.getElementById('regCallsign');
    if (input) {
      input.value = generateRandomCallsign();
      triggerHaptic(8);
    }
  });

  // Sauvegarde de l'identité RSI
  document.getElementById('btnSaveRsiProfile')?.addEventListener('click', () => {
    const rsiHandle = document.getElementById('profileInputRsiHandle')?.value || '';
    const callsign = document.getElementById('profileInputCallsign')?.value || '';
    const location = document.getElementById('profileSelectLocation')?.value || '';
    const bio = document.getElementById('profileInputBio')?.value || '';
    const primarySpecialty = document.getElementById('profileSelectPrimarySpecialty')?.value || 'mining';
    const activeShipId = document.getElementById('profileSelectActiveShip')?.value;

    if (activeShipId) {
      fleetService.setActiveShip(activeShipId);
    }

    const res = authService.updateProfile({
      rsiHandle,
      callsign,
      location,
      bio,
      specialties: selectedSpecialtiesCache,
      primarySpecialty
    });

    if (res.success) {
      showToast(`Identité RSI enregistrée : ${res.user.callsign}`);
      updateTopBarProfile();
      renderProfileScreen();
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  });

  // Régénération du code PIN d'appairage
  document.getElementById('btnRegeneratePairingCode')?.addEventListener('click', () => {
    const newCode = authService.generateNewPairingCode();
    if (newCode) {
      const display = document.getElementById('profilePairingCodeDisplay');
      if (display) display.textContent = newCode;
      showToast(`Nouveau code PIN généré : ${newCode}`);
    }
  });

  // Copier le lien compagnon
  document.getElementById('btnCopyPairingLink')?.addEventListener('click', () => {
    const user = authService.getCurrentUser();
    if (!user) return;
    const pin = (user.pairingCode || '').replace(/[\s-]+/g, '');
    const url = `${window.location.origin}${window.location.pathname}?pair=${pin}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Lien compagnon copié dans le presse-papier !');
      }).catch(() => {
        showToast(`Lien direct : ${url}`);
      });
    } else {
      showToast(`Lien direct : ${url}`);
    }
  });

  // Changement de mot de passe
  document.getElementById('profileInputNewPassword')?.addEventListener('input', (e) => {
    const strength = evaluatePasswordStrength(e.target.value);
    const bar = document.getElementById('profilePasswordBar');
    const label = document.getElementById('profilePasswordLabel');
    if (bar) {
      bar.style.width = `${strength.percent}%`;
      bar.style.backgroundColor = strength.color;
    }
    if (label) {
      label.textContent = `Force : ${strength.text}`;
      label.style.color = strength.color;
    }
  });

  document.getElementById('btnChangePassword')?.addEventListener('click', () => {
    const oldPass = document.getElementById('profileInputOldPassword')?.value || '';
    const newPass = document.getElementById('profileInputNewPassword')?.value || '';
    const confPass = document.getElementById('profileInputConfirmPassword')?.value || '';

    if (!oldPass) {
      showToast('Veuillez saisir votre mot de passe actuel');
      return;
    }
    if (newPass.length < 6) {
      showToast('Le nouveau mot de passe doit comporter au moins 6 caractères');
      return;
    }
    if (newPass !== confPass) {
      showToast('La confirmation du mot de passe ne correspond pas');
      return;
    }

    const res = authService.changePassword(oldPass, newPass);
    if (res.success) {
      showToast('Mot de passe mis à jour avec succès');
      const oldEl = document.getElementById('profileInputOldPassword');
      if (oldEl) oldEl.value = '';
      const newEl = document.getElementById('profileInputNewPassword');
      if (newEl) newEl.value = '';
      const confEl = document.getElementById('profileInputConfirmPassword');
      if (confEl) confEl.value = '';
      const bar = document.getElementById('profilePasswordBar');
      if (bar) bar.style.width = '0%';
      const label = document.getElementById('profilePasswordLabel');
      if (label) label.textContent = 'Force : -';
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  });

  // Préférences
  ['prefHaptics', 'prefAutoSyncScan', 'prefGuildShare'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const haptics = document.getElementById('prefHaptics')?.checked ?? true;
      const autoSync = document.getElementById('prefAutoSyncScan')?.checked ?? true;
      const guildShare = document.getElementById('prefGuildShare')?.checked ?? true;

      authService.updateProfile({
        preferences: {
          hapticsEnabled: haptics,
          autoSyncScan: autoSync,
          privacyShareWithGuild: guildShare
        }
      });
      showToast('Préférences sauvegardées');
    });
  });

  // Modale d'authentification : Onglets & Fermeture
  document.getElementById('btnCloseAuthModal')?.addEventListener('click', closeAuthModal);
  document.getElementById('authModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'authModalBackdrop') closeAuthModal();
  });

  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchAuthTab(tab);
    });
  });

  // Formulaire Connexion
  document.getElementById('formAuthLogin')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    const res = authService.login(email, password);
    if (res.success) {
      closeAuthModal();
      showToast(`Bienvenue à bord, Commandant ${res.user.callsign} !`);
      updateTopBarProfile();
      renderProfileScreen();
    } else {
      showToast(`Erreur de connexion : ${res.error}`);
    }
  });

  // Connexion Express Démo
  document.getElementById('btnQuickDemoLogin')?.addEventListener('click', () => {
    const res = authService.login('vortex@rsi.space', 'Password123!');
    if (res.success) {
      closeAuthModal();
      showToast(`Connecté en tant que Commandant ${res.user.callsign}`);
      updateTopBarProfile();
      renderProfileScreen();
    }
  });

  // Formulaire Inscription / Enrôlement
  document.getElementById('formAuthRegister')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail')?.value || '';
    const password = document.getElementById('regPassword')?.value || '';
    const confPassword = document.getElementById('regConfirmPassword')?.value || '';
    const rsiHandle = document.getElementById('regRsiHandle')?.value || '';
    const callsign = document.getElementById('regCallsign')?.value || '';
    const primarySpecialty = document.getElementById('regPrimarySpecialty')?.value || 'mining';
    const location = document.getElementById('regLocation')?.value || 'Stanton · ARC-L1 Wide Forest';

    if (password !== confPassword) {
      showToast('La confirmation du mot de passe ne correspond pas');
      return;
    }

    const res = authService.register({
      email,
      password,
      rsiHandle,
      callsign,
      primarySpecialty,
      specialties: [primarySpecialty],
      location
    });

    if (res.success) {
      closeAuthModal();
      showToast(`Enrôlement citoyen réussi ! Bienvenue Commandant ${res.user.callsign}`);
      updateTopBarProfile();
      renderProfileScreen();
    } else {
      showToast(`Erreur d'inscription : ${res.error}`);
    }
  });

  // Formulaire Appairage PIN
  document.getElementById('formAuthPairing')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('pairingInputPin')?.value || '';
    const res = authService.loginWithPairingCode(pin);
    if (res.success) {
      closeAuthModal();
      showToast(`Écran compagnon connecté au profil de ${res.user.callsign} !`);
      updateTopBarProfile();
      renderProfileScreen();
    } else {
      showToast(`Erreur d'appairage : ${res.error}`);
    }
  });

  // Vérification paramètre URL ?pair=PIN
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const pairCode = params.get('pair');
    if (pairCode) {
      const res = authService.loginWithPairingCode(pairCode);
      if (res.success) {
        showToast(`Appairage automatique réussi : Bienvenue ${res.user.callsign}`);
        updateTopBarProfile();
        renderProfileScreen();
      }
    }
  }

  // Écoute des événements du bus
  eventBus.on(EVENTS.PLAYER_UPDATED, () => {
    renderTopBarCitizen();
  });
  eventBus.on(EVENTS.CALLSIGN_CHANGED, () => {
    renderTopBarCitizen();
  });
  eventBus.on(EVENTS.AUTH_CHANGED, () => {
    renderTopBarCitizen();
  });
}

// ============================================================================
// 11. TOPBAR & EVENT BINDINGS
// ============================================================================
function updateTopBarProfile() {
  const activeShip = fleetService.getActiveShip();
  const activeShipNameEl = document.getElementById('topbarActiveShipName');
  if (activeShipNameEl && activeShip) {
    const s = getShip(activeShip.shipId);
    activeShipNameEl.textContent = `${s?.name || 'Vaisseau'} « ${activeShip.nickname || 'Sans nom'} »`;
  }
  renderTopBarCitizen();
}

function initEventBindings() {
  // Navigation Sidebar (8 Onglets)
  document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = btn.getAttribute('data-app');
      if (app) setActiveApp(app);
    });
  });

  // Slide-Over Drawer Close
  document.getElementById('btnCloseInspector')?.addEventListener('click', closeInspector);
  document.getElementById('inspectorBackdrop')?.addEventListener('click', closeInspector);

  // Boutons du Dashboard
  document.getElementById('btnDashScanRock')?.addEventListener('click', () => setActiveApp('mining'));
  document.getElementById('btnDashFindRoute')?.addEventListener('click', () => setActiveApp('trade'));
  document.getElementById('btnDashImportOCR')?.addEventListener('click', openOCRDrawer);

  // Boutons du Minage (Calculateur de rocher dynamique connecté à la flotte)
  document.getElementById('btnGoToFleetFromMining')?.addEventListener('click', () => {
    setActiveApp('fleet');
  });

  // Sélecteur de mode de tir pour vaisseaux multi-tourelles (MOLE, Arrastra, Orion)
  document.querySelectorAll('#miningFiringModeContainer .firing-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMiningFiringMode = btn.getAttribute('data-mode') || 'all';
      renderMiningActiveShipBanner();
      evaluateAndRenderMiningRock();
    });
  });

  // Saisie Masse & Slider synchronisé
  document.getElementById('miningInputMass')?.addEventListener('input', (e) => {
    const val = Math.max(100, Number(e.target.value) || 0);
    currentMiningScan.massKg = val;
    const slider = document.getElementById('miningSliderMass');
    if (slider) slider.value = Math.min(60000, val);
    evaluateAndRenderMiningRock();
  });

  document.getElementById('miningSliderMass')?.addEventListener('input', (e) => {
    const val = Number(e.target.value) || 0;
    currentMiningScan.massKg = val;
    const input = document.getElementById('miningInputMass');
    if (input) input.value = val;
    evaluateAndRenderMiningRock();
  });

  // Instabilité (Input clavier & Slider synchronisé)
  const handleInstabilityChange = (rawVal, isFromSlider = false) => {
    const val = Math.max(0, Math.min(100, Number(rawVal) || 0));
    currentMiningScan.instability = val;
    const input = document.getElementById('miningInputInstability');
    const slider = document.getElementById('miningSliderInstability');
    if (isFromSlider && input) input.value = val;
    if (!isFromSlider && slider) slider.value = val;

    const instBadge = document.getElementById('miningInstabilityBadge');
    if (instBadge) {
      instBadge.textContent = val > 50 ? 'Haute' : (val > 25 ? 'Moyenne' : 'Basse');
      instBadge.className = `vo-badge ${val > 50 ? 'red' : (val > 25 ? 'amber' : 'green')}`;
    }
    evaluateAndRenderMiningRock();
  };

  document.getElementById('miningInputInstability')?.addEventListener('input', (e) => {
    handleInstabilityChange(e.target.value, false);
  });
  document.getElementById('miningSliderInstability')?.addEventListener('input', (e) => {
    handleInstabilityChange(e.target.value, true);
  });

  // Résistance brute (Input clavier & Slider synchronisé)
  const handleResistanceChange = (rawVal, isFromSlider = false) => {
    const val = Math.max(0, Math.min(100, Number(rawVal) || 0));
    currentMiningScan.resistance = val;
    const input = document.getElementById('miningInputResistance');
    const slider = document.getElementById('miningSliderResistance');
    if (isFromSlider && input) input.value = val;
    if (!isFromSlider && slider) slider.value = val;
    evaluateAndRenderMiningRock();
  };

  document.getElementById('miningInputResistance')?.addEventListener('input', (e) => {
    handleResistanceChange(e.target.value, false);
  });
  document.getElementById('miningSliderResistance')?.addEventListener('input', (e) => {
    handleResistanceChange(e.target.value, true);
  });

  // Qualité du matériau géologique (Input clavier, Slider & Presets)
  const handleQualityChange = (rawVal, isFromSlider = false) => {
    const val = Math.max(0, Math.min(1000, Number(rawVal) || 0));
    currentMiningScan.quality = val;
    const input = document.getElementById('miningInputQuality');
    const slider = document.getElementById('miningSliderQuality');
    const badge = document.getElementById('miningQualityBadge');
    if (isFromSlider && input) input.value = val;
    if (!isFromSlider && slider) slider.value = val;

    if (badge && craftingService.getQualityTier) {
      const tier = craftingService.getQualityTier(val);
      badge.className = `quality-badge ${tier.badgeClass}`;
      badge.textContent = `⭐ Q${val} ${tier.shortName}`;
    }

    document.querySelectorAll('.mining-quality-preset-btn[data-quality]').forEach(btn => {
      const qVal = Number(btn.getAttribute('data-quality'));
      btn.classList.toggle('active', Math.abs(qVal - val) < 30);
    });

    evaluateAndRenderMiningRock();
  };

  document.getElementById('miningInputQuality')?.addEventListener('input', (e) => {
    handleQualityChange(e.target.value, false);
  });
  document.getElementById('miningSliderQuality')?.addEventListener('input', (e) => {
    handleQualityChange(e.target.value, true);
  });

  document.querySelectorAll('.mining-quality-preset-btn[data-quality]').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = Number(btn.getAttribute('data-quality')) || 780;
      handleQualityChange(q, false);
      triggerHaptic(8);
    });
  });

  document.getElementById('btnMiningRandomQuality')?.addEventListener('click', () => {
    const roll = Math.floor(300 + Math.random() * 680);
    handleQualityChange(roll, false);
    triggerHaptic(12);
    showToast(`🎲 Nouveau jet de qualité scanner : Q${roll}`);
  });

  // Choix du type de roche géologique (Archétype Star Citizen 4.10)
  document.getElementById('miningRockTypeSelect')?.addEventListener('change', (e) => {
    const archId = e.target.value;
    const arch = (miningCalc.ROCK_ARCHETYPES_CONFIG || []).find(a => a.id === archId);
    if (!arch) return;

    currentMiningScan.archetypeId = arch.id;
    currentMiningScan.resistance = arch.baseResistance;
    currentMiningScan.instability = arch.baseInstability;

    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
    showToast(`Type de roche géologique : ${arch.name}`);
  });

  // Presets géologiques officiels SC 4.0
  document.getElementById('miningPresetSelect')?.addEventListener('change', (e) => {
    applyFrontierMiningPreset(e.target.value);
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
    const selText = e.target.options[e.target.selectedIndex]?.text || e.target.value;
    showToast(`Preset géologique appliqué : ${selText}`);
  });

  // Sélection des 2 Qualités de la roche Primary (Standard vs Haute/Riche)
  document.getElementById('btnPrimaryQual1')?.addEventListener('click', () => {
    currentMiningScan.selectedQualityIndex = 0;
    if (currentMiningScan.primaryQualityOptions && currentMiningScan.primaryQualityOptions[0] != null) {
      currentMiningScan.quality = currentMiningScan.primaryQualityOptions[0];
    }
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
    triggerHaptic(8);
  });

  document.getElementById('btnPrimaryQual2')?.addEventListener('click', () => {
    currentMiningScan.selectedQualityIndex = 1;
    if (currentMiningScan.primaryQualityOptions && currentMiningScan.primaryQualityOptions[1] != null) {
      currentMiningScan.quality = currentMiningScan.primaryQualityOptions[1];
    }
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
    triggerHaptic(8);
  });

  // Composant 1 : Minéral & Pourcentage (Lié automatiquement aux compositions géologiques)
  document.getElementById('miningMineral1Select')?.addEventListener('change', (e) => {
    applyFrontierMiningPreset(e.target.value);
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
  });

  const handlePct1Change = (val) => {
    const clamped = Math.max(0, Math.min(100, Number(val) || 0));
    const p2 = currentMiningScan.mineral2Id ? currentMiningScan.pct2 : 0;
    const p3 = currentMiningScan.mineral3Id ? currentMiningScan.pct3 : 0;
    if (clamped + p2 + p3 > 100) {
      const remaining = Math.max(0, 100 - clamped);
      if (p2 + p3 > 0) {
        const factor = remaining / (p2 + p3);
        currentMiningScan.pct2 = Math.round(p2 * factor * 10) / 10;
        currentMiningScan.pct3 = Math.round(p3 * factor * 10) / 10;
      }
    }
    currentMiningScan.pct1 = clamped;
    currentMiningScan.composition = miningCalc.buildRockComposition(
      currentMiningScan.mineral1Id,
      currentMiningScan.pct1,
      currentMiningScan.mineral2Id,
      currentMiningScan.pct2,
      currentMiningScan.mineral3Id,
      currentMiningScan.pct3
    );
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
  };

  document.getElementById('miningPct1Input')?.addEventListener('input', (e) => {
    handlePct1Change(e.target.value);
  });
  document.getElementById('miningPct1Slider')?.addEventListener('input', (e) => {
    handlePct1Change(e.target.value);
  });

  // Composant 2 : Minéral (ou Aucun) & Pourcentage
  document.getElementById('miningMineral2Select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    currentMiningScan.mineral2Id = val || null;
    if (!val) {
      currentMiningScan.pct2 = 0;
    } else if (currentMiningScan.pct2 === 0) {
      const p1 = currentMiningScan.pct1;
      const p3 = currentMiningScan.mineral3Id ? currentMiningScan.pct3 : 0;
      const maxAllowed = Math.max(0, Math.round((100 - p1 - p3) * 10) / 10);
      currentMiningScan.pct2 = Math.min(15, maxAllowed);
    }
    currentMiningScan.composition = miningCalc.buildRockComposition(
      currentMiningScan.mineral1Id,
      currentMiningScan.pct1,
      currentMiningScan.mineral2Id,
      currentMiningScan.pct2,
      currentMiningScan.mineral3Id,
      currentMiningScan.pct3
    );
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
  });

  const handlePct2Change = (val) => {
    if (!currentMiningScan.mineral2Id) return;
    const p1 = currentMiningScan.pct1;
    const p3 = currentMiningScan.mineral3Id ? currentMiningScan.pct3 : 0;
    const maxAllowed = Math.max(0, Math.round((100 - p1 - p3) * 10) / 10);
    const clamped = Math.max(0, Math.min(maxAllowed, Number(val) || 0));
    currentMiningScan.pct2 = clamped;
    currentMiningScan.composition = miningCalc.buildRockComposition(
      currentMiningScan.mineral1Id,
      currentMiningScan.pct1,
      currentMiningScan.mineral2Id,
      currentMiningScan.pct2,
      currentMiningScan.mineral3Id,
      currentMiningScan.pct3
    );
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
  };

  document.getElementById('miningPct2Input')?.addEventListener('input', (e) => {
    handlePct2Change(e.target.value);
  });
  document.getElementById('miningPct2Slider')?.addEventListener('input', (e) => {
    handlePct2Change(e.target.value);
  });

  // Composant 3 : Minéral (ou Aucun) & Pourcentage
  document.getElementById('miningMineral3Select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    currentMiningScan.mineral3Id = val || null;
    if (!val) {
      currentMiningScan.pct3 = 0;
    } else if (currentMiningScan.pct3 === 0) {
      const p1 = currentMiningScan.pct1;
      const p2 = currentMiningScan.mineral2Id ? currentMiningScan.pct2 : 0;
      const maxAllowed = Math.max(0, Math.round((100 - p1 - p2) * 10) / 10);
      currentMiningScan.pct3 = Math.min(10, maxAllowed);
    }
    currentMiningScan.composition = miningCalc.buildRockComposition(
      currentMiningScan.mineral1Id,
      currentMiningScan.pct1,
      currentMiningScan.mineral2Id,
      currentMiningScan.pct2,
      currentMiningScan.mineral3Id,
      currentMiningScan.pct3
    );
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
  });

  const handlePct3Change = (val) => {
    if (!currentMiningScan.mineral3Id) return;
    const p1 = currentMiningScan.pct1;
    const p2 = currentMiningScan.mineral2Id ? currentMiningScan.pct2 : 0;
    const maxAllowed = Math.max(0, Math.round((100 - p1 - p2) * 10) / 10);
    const clamped = Math.max(0, Math.min(maxAllowed, Number(val) || 0));
    currentMiningScan.pct3 = clamped;
    currentMiningScan.composition = miningCalc.buildRockComposition(
      currentMiningScan.mineral1Id,
      currentMiningScan.pct1,
      currentMiningScan.mineral2Id,
      currentMiningScan.pct2,
      currentMiningScan.mineral3Id,
      currentMiningScan.pct3
    );
    renderMiningScannerUI();
    evaluateAndRenderMiningRock();
  };

  document.getElementById('miningPct3Input')?.addEventListener('input', (e) => {
    handlePct3Change(e.target.value);
  });
  document.getElementById('miningPct3Slider')?.addEventListener('input', (e) => {
    handlePct3Change(e.target.value);
  });

  // Trigger OCR scanner modal
  document.getElementById('btnTriggerOCRScanner')?.addEventListener('click', openMiningOCRModal);

  // Bouton Calculer
  document.getElementById('btnCalculateRock')?.addEventListener('click', () => {
    const evalResult = evaluateAndRenderMiningRock();
    triggerHaptic(12);
    const prof = evalResult.profitability;
    if (prof) {
      showToast(`${prof.icon} ${prof.title} · ${prof.tacticalDiagnostic}`);
    } else {
      showToast(`⚡ Faisabilité : ${evalResult.verdictLabel} (${evalResult.summaryText})`);
    }
  });

  // Minuteur de dégradation du Quantainium
  document.getElementById('btnQuantaTimer')?.addEventListener('click', () => {
    const btn = document.getElementById('btnQuantaTimer');
    if (quantaniumTimerInterval) {
      clearInterval(quantaniumTimerInterval);
      quantaniumTimerInterval = null;
      quantaniumSecondsLeft = 15 * 60;
      if (btn) btn.textContent = '⏱ Lancer chrono dégradation (15:00)';
      showToast('Minuteur Quantainium réinitialisé.');
      return;
    }

    triggerHaptic(12);
    showToast('⚠️ Chronomètre activé : ~15 min avant explosion du Quantainium !');
    quantaniumTimerInterval = setInterval(() => {
      quantaniumSecondsLeft--;
      if (quantaniumSecondsLeft <= 0) {
        clearInterval(quantaniumTimerInterval);
        quantaniumTimerInterval = null;
        if (btn) btn.textContent = '💥 CRITIQUE (TEMPS ÉCOULÉ)';
        showToast('🚨 ALERTE : Le Quantainium a atteint le seuil d\'explosion !');
        return;
      }
      const mins = Math.floor(quantaniumSecondsLeft / 60);
      const secs = quantaniumSecondsLeft % 60;
      const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (btn) btn.textContent = `⏱ Dégradation : ${timeStr} restant`;
    }, 1000);
  });

  // Actions Stratégiques de Minage (Garder pour Craft, Vendre Brut, Raffiner & Vendre)
  document.getElementById('btnMiningActionKeepCraft')?.addEventListener('click', () => {
    const activeShipEntry = fleetService.getActiveShip();
    const cap = miningCalc.computeShipMiningCapabilities(activeShipEntry, currentMiningFiringMode);
    const evalResult = miningCalc.calculateLiveRockEvaluation(currentMiningScan, cap);
    const mass = currentMiningScan.massKg || 18420;
    const q = currentMiningScan.quality || 780;

    let addedSummary = [];
    currentMiningScan.composition.forEach(comp => {
      if (comp.mineralId === 'inert' || (comp.name || '').toLowerCase().includes('inert')) return;
      const min = MINERALS.find(m => m.id === comp.mineralId) || { density: 2.0 };
      const scu = Math.round(((mass * (comp.pct / 100)) / ((min.density || 2.0) * 100)) * 10) / 10;
      if (scu > 0) {
        inventoryService.addExtractedOreBatch({
          mineralId: comp.mineralId,
          quantitySCU: scu,
          quality: q,
          intendedUse: 'craft',
          locationId: 'ship_cargo',
          notes: `Extrait depuis ${currentMiningScan.archetypeId || 'rocher'} [Q${q}]. Réservé pour la forge de composants surcadencés.`
        });
        addedSummary.push(`${scu} SCU de ${comp.name}`);
      }
    });

    triggerHaptic(15);
    showToast(`🛠️ ${addedSummary.join(' et ')} [Q${q}] ajoutés à votre inventaire personnel (Réservé pour le Craft) !`);
    renderInventoryTable();
  });

  document.getElementById('btnMiningActionSellRaw')?.addEventListener('click', () => {
    const activeShipEntry = fleetService.getActiveShip();
    const cap = miningCalc.computeShipMiningCapabilities(activeShipEntry, currentMiningFiringMode);
    const evalResult = miningCalc.calculateLiveRockEvaluation(currentMiningScan, cap);
    const revenue = evalResult.rawGrossUEC;

    inventoryService.creditBalance(revenue);
    triggerHaptic(12);
    showToast(`💰 Vente brute immédiate effectuée : +${revenue.toLocaleString('fr-FR')} aUEC crédités à votre solde (sans délai ni frais) !`);
    renderTopBarCitizen();
  });

  document.getElementById('btnMiningActionRefine')?.addEventListener('click', () => {
    const activeShipEntry = fleetService.getActiveShip();
    const cap = miningCalc.computeShipMiningCapabilities(activeShipEntry, currentMiningFiringMode);
    const evalResult = miningCalc.calculateLiveRockEvaluation(currentMiningScan, cap);
    const best = evalResult.refineryMethods[0];
    const q = currentMiningScan.quality || 780;
    const mass = currentMiningScan.massKg || 18420;

    currentMiningScan.composition.forEach(comp => {
      if (comp.mineralId === 'inert' || (comp.name || '').toLowerCase().includes('inert')) return;
      const min = MINERALS.find(m => m.id === comp.mineralId) || { density: 2.0 };
      const rawScu = Math.round(((mass * (comp.pct / 100)) / ((min.density || 2.0) * 100)) * 10) / 10;
      const refinedScu = Math.round((rawScu * ((best.yieldPct || 92) / 100)) * 10) / 10;
      if (refinedScu > 0) {
        inventoryService.addItem({
          category: 'refined_ore',
          code: comp.mineralId,
          name: `${comp.name} Raffiné [Q${q}]`,
          quantitySCU: refinedScu,
          ownerType: 'personal',
          locationId: best.location || 'CRU-L1 Ambitious Dream',
          origin: 'mined',
          materialQuality: q,
          qualityTier: evalResult.qualityArbitrage?.tierId || 'high',
          qualityTierLabel: evalResult.qualityArbitrage?.tierName || 'Haute Qualité',
          intendedUse: 'sell_refined',
          reservedForCraft: false,
          forSale: true,
          metadata: {
            refiningMethod: 'dinyx',
            refineryStation: best.location || 'CRU-L1',
            notes: `Raffiné via Dinyx Solvent. Qualité Q${q}. Prêt pour la vente marchande.`
          }
        });
      }
    });

    triggerHaptic(15);
    showToast(`✨ Ordre de raffinage Dinyx lancé à ${best.location} pour ${evalResult.usefulSCU} SCU (+${best.net.toLocaleString('fr-FR')} aUEC net après délai) !`);

    // Mettre à jour le KPI dashboard
    const dashRefiningCount = document.querySelector('#viewDashboard .vo-grid-4 .vo-card:nth-child(2) .kpi-main-val');
    if (dashRefiningCount) {
      const cur = parseInt(dashRefiningCount.textContent, 10) || 3;
      dashRefiningCount.textContent = cur + 1;
    }
    renderInventoryTable();
  });

  // Ajouter à la session d'escadre active
  document.getElementById('btnAddToFleetSession')?.addEventListener('click', () => {
    const activeShipEntry = fleetService.getActiveShip();
    const cap = miningCalc.computeShipMiningCapabilities(activeShipEntry, currentMiningFiringMode);
    const evalResult = miningCalc.calculateLiveRockEvaluation(currentMiningScan, cap);

    if (!coopService.hasActiveSession()) {
      coopService.createSession({
        name: `Escadre ${cap.nickname || 'Mineur'}`,
        targetRock: {
          name: currentMiningScan?.name || 'Astéroïde miné',
          massKg: currentMiningScan?.massKg || 12000,
          resistance: currentMiningScan?.resistance || 30,
          instability: currentMiningScan?.instability || 25,
          mineralId: currentMiningScan?.composition?.[0]?.id || 'quantainium',
          mineralName: currentMiningScan?.composition?.[0]?.name || 'Quantainium',
          orePercentage: currentMiningScan?.composition?.[0]?.pct || 25,
          estimatedValueUEC: evalResult.rawGrossUEC || 0
        }
      });
    }

    const session = coopService.getSession();
    if (session) {
      session.brokenRocksCount = (session.brokenRocksCount || 0) + 1;
      session.totalOreSCU = Math.round(((session.totalOreSCU || 0) + evalResult.usefulSCU) * 10) / 10;
      if (!session.financials) {
        session.financials = { grossRevenueUEC: 0, fuelAndRepairsUEC: 0, guildTaxPct: 5, reserveFundPct: 5, payoutMode: 'role_weighted' };
      }
      session.financials.grossRevenueUEC = (session.financials.grossRevenueUEC || 0) + evalResult.rawGrossUEC;
      const mineralLabel = currentMiningScan?.composition?.[0]?.name || 'minerai';
      coopService.addLog(`${cap.nickname || 'Mineur'} a extrait ${evalResult.usefulSCU} SCU de ${mineralLabel} (+${Math.round(evalResult.rawGrossUEC).toLocaleString('fr-FR')} aUEC)`, 'mining', cap.nickname || 'Mineur');
    }

    setActiveApp('fleets');
    renderFleetsScreen();
    triggerHaptic(15);
    showToast(`✓ +${evalResult.usefulSCU} SCU ajoutés aux opérations d’escadre !`);
  });

  // ============================================================================
  // ÉVÉNEMENTS ESCADRE & MULTI-CREW (AARON MFD FLEETS)
  // ============================================================================
  document.querySelectorAll('#fleetOpsSubNav .fleet-ops-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const sub = tab.getAttribute('data-fleet-subview');
      if (!sub) return;
      activeFleetSubview = sub;
      document.querySelectorAll('#fleetOpsSubNav .fleet-ops-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.fleet-subview-panel').forEach(p => p.style.display = 'none');
      const target = document.getElementById(
        sub === 'roster' ? 'fleetSubViewRoster' :
        sub === 'jointfire' ? 'fleetSubViewJointFire' :
        sub === 'payouts' ? 'fleetSubViewPayouts' : 'fleetSubViewLogs'
      );
      if (target) target.style.display = 'block';

      renderFleetsScreen();
    });
  });

  document.getElementById('fleetPresetSelect')?.addEventListener('change', (e) => {
    coopService.loadPreset(e.target.value);
    activeJointFireCallsigns = new Set(
      coopService.getAllCrewMembers().filter(m => m.laserId).map(m => m.callsign)
    );
    renderFleetsScreen();
    showToast(`✓ Modèle d'escadre chargé : ${e.target.options[e.target.selectedIndex].text}`);
  });

  document.getElementById('btnToggleAllLasers')?.addEventListener('click', () => {
    const allLasers = coopService.getAllCrewMembers().filter(m => m.laserId).map(m => m.callsign);
    if (activeJointFireCallsigns.size === allLasers.length) {
      activeJointFireCallsigns.clear();
    } else {
      activeJointFireCallsigns = new Set(allLasers);
    }
    coopService.broadcastJointFire(activeJointFireCallsigns);
    renderFleetJointFire(coopService.getSession());
  });

  // Modal Liaison Multijoueur P2P (WebRTC)
  const openModalWing = () => {
    const modal = document.getElementById('modalWingNet');
    if (modal) modal.classList.add('active');
    const net = coopService.getNetworkStatus();
    const joinInput = document.getElementById('inputJoinWingCode');
    if (joinInput && net.roomCode) joinInput.value = net.roomCode;
  };

  const closeModalWing = () => {
    const modal = document.getElementById('modalWingNet');
    if (modal) modal.classList.remove('active');
  };

  document.getElementById('btnOpenWingModal')?.addEventListener('click', openModalWing);
  document.getElementById('topbarFleetBadge')?.addEventListener('click', () => {
    setActiveApp('fleets');
    openModalWing();
  });
  document.getElementById('btnCloseWingModal')?.addEventListener('click', closeModalWing);
  document.getElementById('modalWingNet')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalWingNet') closeModalWing();
  });

  document.getElementById('btnConfirmCreateWing')?.addEventListener('click', () => {
    const customCode = document.getElementById('inputCreateWingCode')?.value?.trim();
    const roomCode = coopService.createWing(customCode || null);
    closeModalWing();
    syncActiveJointFireCallsigns();
    showToast(`✓ Escadre créée : ${roomCode} ! Transmets ce code à tes ailiers.`);
    updateFleetNetUI();
    renderFleetsScreen();
  });

  document.getElementById('btnConfirmJoinWing')?.addEventListener('click', () => {
    const code = document.getElementById('inputJoinWingCode')?.value?.trim();
    if (!code) {
      showToast('⚠️ Veuillez renseigner un code d’escadre (ex: WING-2954)');
      return;
    }
    coopService.joinWing(code);
    closeModalWing();
    syncActiveJointFireCallsigns();
    showToast(`✓ Connexion à l'escadre ${code.toUpperCase()} en cours...`);
    updateFleetNetUI();
    renderFleetsScreen();
  });

  document.getElementById('btnCopyInviteLink')?.addEventListener('click', () => {
    const net = coopService.getNetworkStatus();
    if (net.inviteUrl) {
      navigator.clipboard?.writeText(net.inviteUrl).then(() => {
        showToast(`🔗 Lien d'invitation pour ${net.roomCode} copié !`);
      }).catch(() => {
        prompt('Copie le lien d\'invitation :', net.inviteUrl);
      });
    }
  });

  document.getElementById('btnDisconnectWing')?.addEventListener('click', () => {
    coopService.leaveWing();
    showToast('🚪 Escadre quittée. Retour en mode solo.');
    updateFleetNetUI();
    renderFleetsScreen();
  });

  document.getElementById('btnPayoutModeWeighted')?.addEventListener('click', () => {
    const session = coopService.getSession();
    if (!session || !session.financials) return;
    session.financials.payoutMode = 'role_weighted';
    document.getElementById('btnPayoutModeWeighted')?.classList.add('active');
    document.getElementById('btnPayoutModeEqual')?.classList.remove('active');
    renderFleetPayouts(session, coopService.calculateFinancialSplit());
  });

  document.getElementById('btnPayoutModeEqual')?.addEventListener('click', () => {
    const session = coopService.getSession();
    if (!session || !session.financials) return;
    session.financials.payoutMode = 'equal';
    document.getElementById('btnPayoutModeEqual')?.classList.add('active');
    document.getElementById('btnPayoutModeWeighted')?.classList.remove('active');
    renderFleetPayouts(session, coopService.calculateFinancialSplit());
  });

  document.getElementById('btnCopyMoTraderCommands')?.addEventListener('click', () => {
    if (!coopService.hasActiveSession()) {
      showToast('⚠️ Aucune escadre active.');
      return;
    }
    const cmds = coopService.generateMoTraderCommands();
    const text = cmds.map(c => c.commandText).join('\n');
    navigator.clipboard?.writeText(text).then(() => {
      showToast('📋 Commandes mo.Trader copiées dans le presse-papier !');
    }).catch(() => {
      showToast(`📋 ${cmds.length} virements mo.Trader calculés !`);
    });
  });

  document.getElementById('btnOpenAddFleetShip')?.addEventListener('click', () => {
    if (!coopService.hasActiveSession()) {
      showToast('⚠️ Veuillez d’abord créer une escadre.');
      return;
    }
    const name = prompt('Nom du vaisseau à intégrer à l’escadre (ex: MISC Prospector Solo, C2 Hercules, MOLE #2) :');
    if (name && name.trim()) {
      const isMulti = confirm('S’agit-il d’un vaisseau Multi-Crew avec équipage à bord (ex: ARGO MOLE) ?');
      const pilotCallsign = prompt('Callsign du pilote / chef de bord :') || 'PILOT-1';
      coopService.addShip({
        name: name.trim(),
        modelId: isMulti ? 'mole' : 'prospector',
        isMultiCrew: isMulti,
        role: isMulti ? 'mining_heavy' : 'mining_solo',
        roleLabel: isMulti ? 'Mineur Lourd Multi-Crew' : 'Mineur Solo',
        totalScu: isMulti ? 96 : 32,
        crew: [
          { callsign: pilotCallsign.trim().toUpperCase(), role: 'pilot', roleLabel: 'Pilote', sharePct: isMulti ? 25 : 15, laserId: isMulti ? null : 'lancet_s1', powerWatts: isMulti ? 0 : 1400, resistanceReductionPct: isMulti ? 0 : 40, status: 'online' }
        ]
      });
      renderFleetsScreen();
      showToast(`✓ Vaisseau ${name.trim()} déployé dans l’escadre !`);
    }
  });

  document.getElementById('btnCloseLiveSession')?.addEventListener('click', () => {
    if (!coopService.hasActiveSession()) {
      showToast('⚠️ Aucune escadre active à clôturer.');
      return;
    }

    const summary = coopService.closeSession();
    if (!summary) return;

    if (liveSessionTimerInterval) {
      clearInterval(liveSessionTimerInterval);
      liveSessionTimerInterval = null;
    }
    liveSessionSeconds = 0;

    const split = summary.split;
    const totalUEC = (split?.distributableUEC || 0).toLocaleString('fr-FR');
    const grossUEC = (split?.gross || 0).toLocaleString('fr-FR');
    const taxUEC = ((split?.guildTaxUEC || 0) + (split?.reserveFundUEC || 0)).toLocaleString('fr-FR');
    const cmds = summary.moTraderCommands || [];

    const cmdsHtml = cmds.length > 0
      ? cmds.map(c => {
          const safeCallsign = String(c.recipientCallsign || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeRole = String(c.roleLabel || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const safeCmd = String(c.commandText || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const rawCmd = (c.commandText || '').replace(/'/g, "\\'");
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.06); font-family:var(--font-mono); font-size:0.8rem;">
              <div>
                <strong style="color:var(--accent-cyan);">${safeCallsign}</strong> 
                <span style="color:var(--text-dim); font-size:0.75rem;">(${safeRole})</span>: 
                <span style="color:var(--accent-green); font-weight:700;">${(c.amountUEC || 0).toLocaleString('fr-FR')} aUEC</span>
                <div style="color:var(--text-muted); font-size:0.72rem; margin-top:2px;"><code>${safeCmd}</code></div>
              </div>
              <button type="button" class="vo-btn outline" style="padding:4px 8px; font-size:0.72rem;" onclick="navigator.clipboard?.writeText('${rawCmd}'); showToast('✓ Commande copiée !');">Copier</button>
            </div>
          `;
        }).join('')
      : '<p style="color:var(--text-dim); font-size:0.8rem; margin:8px 0;">Aucun virement requis (pilote solo ou solde nul).</p>';

    openInspector({
      title: 'Clôture & Virements mo.Trader',
      subtitle: `${summary.sessionName || 'Escadre'} · Session terminée`,
      body: `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--accent-green); font-weight:700;">Recette Nette Distribuée</div>
            <div style="font-size:1.6rem; font-weight:800; color:#fff; font-family:var(--font-mono); margin-top:4px;">${totalUEC} <span style="font-size:0.9rem; color:var(--accent-green);">aUEC</span></div>
            <div style="font-size:0.72rem; color:var(--text-dim); margin-top:4px;">Brut : ${grossUEC} aUEC · Caisse & Taxes : ${taxUEC} aUEC</div>
          </div>
          <div>
            <div style="font-size:0.78rem; font-weight:700; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Commandes mo.Trader prêtes à coller en jeu</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${cmdsHtml}
            </div>
          </div>
        </div>
      `,
      footer: `
        <div style="display:flex; justify-content:space-between; gap:8px; width:100%;">
          <button type="button" class="vo-btn outline" id="btnCopyAllClosedMoTrader" style="font-size:0.78rem;">📋 Tout copier</button>
          <button type="button" class="vo-btn primary" onclick="closeInspector()" style="font-size:0.78rem;">Fermer</button>
        </div>
      `,
      wide: false
    });

    document.getElementById('btnCopyAllClosedMoTrader')?.addEventListener('click', () => {
      const fullText = cmds.map(c => c.commandText).join('\n');
      if (fullText) {
        navigator.clipboard?.writeText(fullText).then(() => {
          showToast('📋 Toutes les commandes mo.Trader ont été copiées !');
        });
      }
    });

    renderFleetsScreen();
    showToast(`💎 Session clôturée et escadre dissoute ! ${totalUEC} aUEC répartis.`);
  });

  document.getElementById('btnHeaderCreateFleet')?.addEventListener('click', () => {
    coopService.createSession();
    liveSessionSeconds = 0;
    syncActiveJointFireCallsigns();
    renderFleetsScreen();
    showToast('🚀 Nouvelle escadre créée ! Prêt pour le déploiement.');
  });

  document.getElementById('btnCreateFleetSession')?.addEventListener('click', () => {
    coopService.createSession();
    liveSessionSeconds = 0;
    syncActiveJointFireCallsigns();
    renderFleetsScreen();
    showToast('🚀 Nouvelle escadre créée ! Prêt pour le déploiement.');
  });

  document.getElementById('btnEmptyJoinWing')?.addEventListener('click', () => {
    openModalWing();
  });

  document.getElementById('btnEmptyLoadPreset')?.addEventListener('click', () => {
    coopService.loadPreset('mixed_wing');
    liveSessionSeconds = 0;
    syncActiveJointFireCallsigns();
    renderFleetsScreen();
    showToast('📑 Modèle d’entraînement « Escadre Mixte » chargé !');
  });

  document.getElementById('fleetPresetSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;
    coopService.loadPreset(val);
    liveSessionSeconds = 0;
    syncActiveJointFireCallsigns();
    renderFleetsScreen();
    showToast('📑 Modèle d’entraînement chargé dans l’escadre !');
  });

  document.getElementById('btnLiveAddScan')?.addEventListener('click', () => {
    if (!coopService.hasActiveSession()) {
      showToast('⚠️ Aucune escadre active.');
      return;
    }
    const min = prompt('Minerai scanné (ex: Quantainium 42%, Laranite 28%) :', 'Quantainium 44%');
    if (min) {
      coopService.addLog(`Scan longue portée confirmé · ${min.trim()}`, 'scan', 'Scout');
      renderFleetLogs(coopService.getSession());
      showToast('📷 Scan enregistré dans le journal d’escadre !');
    }
  });

  document.getElementById('btnLiveAddCargoEvent')?.addEventListener('click', () => {
    if (!coopService.hasActiveSession()) {
      showToast('⚠️ Aucune escadre active.');
      return;
    }
    const qty = prompt('Volume transféré en SCU (ex: 32 SCU Saddlebag) :', '32 SCU');
    if (qty) {
      coopService.addLog(`Transfert de conteneur ${qty.trim()} vers le transporteur cargo`, 'cargo', 'Logistique');
      renderFleetLogs(coopService.getSession());
      showToast('📦 Transfert de conteneur enregistré !');
    }
  });

  // Inventaire
  document.getElementById('btnTriggerOCRDrawer')?.addEventListener('click', openOCRDrawer);
  document.getElementById('btnValidateOCRStock')?.addEventListener('click', () => {
    showToast('✓ 20,4 SCU (Laranite + Copper) ajoutés aux stocks depuis ARC-L1 !');
  });

  document.getElementById('btnCorrectOCRStock')?.addEventListener('click', () => {
    openInspector({
      title: 'Correction manuelle OCR',
      subtitle: 'Ligne ambiguë détectée · Indice de confiance 61 %',
      body: `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <p style="font-size:0.82rem; color:var(--text-muted);">La reconnaissance optique hésite entre Bexalite et Hephaestanite :</p>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Minerai corrigé</label>
            <input type="text" id="inputCorrectMineral" value="Bexalite" style="width:100%; padding:8px 12px; background:var(--bg-card-inner); border:1px solid var(--border-medium); border-radius:4px; color:#fff; font-family:var(--font-ui);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Volume exact (SCU)</label>
            <input type="number" id="inputCorrectQty" value="3.4" step="0.1" style="width:100%; padding:8px 12px; background:var(--bg-card-inner); border:1px solid var(--border-medium); border-radius:4px; color:#fff; font-family:var(--font-mono);">
          </div>
        </div>
      `,
      footer: `
        <button type="button" class="vo-btn primary" id="btnConfirmManualCorrection" style="width:100%;">
          Valider la correction (3.4 SCU)
        </button>
      `
    });

    document.getElementById('btnConfirmManualCorrection')?.addEventListener('click', () => {
      showToast('✓ Ligne corrigée : 3,4 SCU de Bexalite ajoutés !');
      closeInspector();
    });
  });

  // Filtres Crafting dynamiques (Recherche, Catégories, Tailles, Sources, Chips)
  document.getElementById('craftSearchInput')?.addEventListener('input', (e) => {
    craftFilters.search = e.target.value;
    renderCraftingCatalog();
  });

  document.getElementById('craftCategorySelect')?.addEventListener('change', (e) => {
    craftFilters.category = e.target.value;
    renderCraftingCatalog();
  });

  document.getElementById('craftSizeSelect')?.addEventListener('change', (e) => {
    craftFilters.size = e.target.value;
    renderCraftingCatalog();
  });

  document.getElementById('craftAcqSelect')?.addEventListener('change', (e) => {
    craftFilters.acq = e.target.value;
    renderCraftingCatalog();
  });

  const bindChip = (id, key) => {
    document.getElementById(id)?.addEventListener('click', () => {
      craftFilters.chip = craftFilters.chip === key ? null : key;
      document.querySelectorAll('.vo-chip').forEach(c => c.classList.remove('active'));
      if (craftFilters.chip) document.getElementById(id)?.classList.add('active');
      renderCraftingCatalog();
    });
  };

  bindChip('chipCraftFilterCraftable', 'g');
  bindChip('chipCraftFilterMissing', 'a');
  bindChip('chipCraftFilterOwned', 'b');
  bindChip('chipCraftFilterUnowned', 'r');

  document.getElementById('btnCraftViewMe')?.addEventListener('click', () => {
    document.getElementById('btnCraftViewMe')?.classList.add('primary');
    document.getElementById('btnCraftViewMe')?.classList.remove('outline');
    document.getElementById('btnCraftViewGuild')?.classList.add('outline');
    document.getElementById('btnCraftViewGuild')?.classList.remove('primary');
    showToast('Vue Craft : mes blueprints personnels');
  });

  document.getElementById('btnCraftViewGuild')?.addEventListener('click', () => {
    document.getElementById('btnCraftViewGuild')?.classList.add('primary');
    document.getElementById('btnCraftViewGuild')?.classList.remove('outline');
    document.getElementById('btnCraftViewMe')?.classList.add('outline');
    document.getElementById('btnCraftViewMe')?.classList.remove('primary');
    showToast('Vue Craft : catalogue consolidé de la guilde');
  });

  // Contrôles Commerce (AARON MFD Interactif)
  document.getElementById('btnTradeRiskToggle')?.addEventListener('click', () => {
    tradeState.avoidHighRisk = !tradeState.avoidHighRisk;
    renderTradeCards();
    triggerHaptic(10);
    showToast(tradeState.avoidHighRisk ? 'Filtre actif : routes sécurisées uniquement' : 'Attention : routes à haute criminalité (Pyro/Jumptown) incluses');
  });

  document.getElementById('btnTradeShip')?.addEventListener('click', () => {
    triggerHaptic(10);
    openTradeShipModal();
  });

  document.getElementById('btnTradeCapital')?.addEventListener('click', () => {
    triggerHaptic(10);
    openTradeCapitalModal();
  });

  document.getElementById('btnTradeRouteSelect')?.addEventListener('click', () => {
    triggerHaptic(10);
    openTradeRouteAnalysisModal();
  });

  // Bourse UEX Corp : Synchronisation manuelle des cours
  document.getElementById('btnRefreshUex')?.addEventListener('click', async () => {
    const btn = document.getElementById('btnRefreshUex');
    if (btn) btn.classList.add('spinning');
    triggerHaptic(12);

    const res = await uexService.syncPrices(true);
    if (btn) btn.classList.remove('spinning');

    if (res.status === 'live') {
      showToast('🟢 Cours UEX Corp synchronisés en direct avec succès !');
    } else {
      showToast('🟡 Hors-ligne ou API indisponible : bascule sur le cache local sécurisé (price_cache).');
    }
    renderTradeCards();
  });

  // Commerce : Ouverture du catalogue officiel des marchandises
  document.getElementById('btnOpenCommoditiesCatalog')?.addEventListener('click', () => {
    triggerHaptic(10);
    openCommoditiesCatalogModal();
  });

  // Flotte : Composer ma flotte (Toggle Catalogue)
  const toggleCatalogBtn = document.getElementById('btnToggleCatalog');
  const catalogSection = document.getElementById('fleetCatalogSection');
  if (toggleCatalogBtn && catalogSection) {
    toggleCatalogBtn.addEventListener('click', () => {
      catalogFilters.isOpen = !catalogFilters.isOpen;
      catalogSection.style.display = catalogFilters.isOpen ? 'block' : 'none';
      toggleCatalogBtn.textContent = catalogFilters.isOpen ? '✕ Fermer le catalogue' : '+ Composer ma flotte';
      if (catalogFilters.isOpen) {
        renderShipCatalog();
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Catalogue : Recherche en direct
  document.getElementById('catalogSearchInput')?.addEventListener('input', (e) => {
    catalogFilters.search = e.target.value;
    renderShipCatalog();
  });

  // Catalogue : Filtres de rôle
  const bindCatalogRoleBtn = (btnId, roleVal) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
      catalogFilters.role = roleVal;
      document.querySelectorAll('#fleetCatalogSection .vo-chip').forEach(c => c.classList.remove('active'));
      document.getElementById(btnId)?.classList.add('active');
      renderShipCatalog();
    });
  };

  bindCatalogRoleBtn('btnCatalogFilterAll', 'tous');
  bindCatalogRoleBtn('btnCatalogFilterMining', 'mining');
  bindCatalogRoleBtn('btnCatalogFilterCargo', 'cargo');
  bindCatalogRoleBtn('btnCatalogFilterCombat', 'escort');
  bindCatalogRoleBtn('btnCatalogFilterSalvage', 'salvage');
  bindCatalogRoleBtn('btnCatalogFilterExplo', 'exploration');

  // Flotte : Recherche dans la flotte possédée
  document.getElementById('fleetSearchInput')?.addEventListener('input', (e) => {
    fleetFilters.search = e.target.value;
    renderFleetHangar();
  });

  // Flotte : Filtres de rôle dans la flotte possédée
  const bindFleetRoleChip = (chipId, roleVal) => {
    document.getElementById(chipId)?.addEventListener('click', () => {
      fleetFilters.role = roleVal;
      document.querySelectorAll('#fleetOverviewSubView .vo-chip').forEach(c => c.classList.remove('active'));
      document.getElementById(chipId)?.classList.add('active');
      renderFleetHangar();
    });
  };

  bindFleetRoleChip('chipFleetFilterAll', 'all');
  bindFleetRoleChip('chipFleetFilterMining', 'mining');
  bindFleetRoleChip('chipFleetFilterSupport', 'support');
  bindFleetRoleChip('chipFleetFilterCombat', 'combat');
  bindFleetRoleChip('chipFleetFilterSalvage', 'salvage');
  bindFleetRoleChip('chipFleetFilterExplo', 'exploration');

  // Éditeur de configuration : Copier la tourelle sur toutes les tourelles
  document.getElementById('btnCopyTurretToAll')?.addEventListener('click', () => {
    if (!shipConfigDraft || !shipConfigDraft.config?.turrets) return;
    const turrets = shipConfigDraft.config.turrets;
    if (turrets.length <= 1) return;

    const src = turrets[activeTurretTab];
    if (!src) return;

    shipConfigDraft.config.turrets = turrets.map(t => ({
      ...t,
      laserId: src.laserId,
      modules: [...(src.modules || [])]
    }));

    triggerHaptic(12);
    renderShipConfigView();
    showToast(`Configuration de la Tourelle ${activeTurretTab + 1} copiée sur toutes les tourelles !`);
  });

  // Éditeur de configuration : Profils rapides
  document.getElementById('btnQuickPresetPureMining')?.addEventListener('click', () => {
    if (!shipConfigDraft) return;
    const ship = getShip(shipConfigDraft.shipId);
    if (!ship || !shipConfigDraft.config?.turrets?.length) return;

    const laser = ship.laserSize === 2 ? 'helix_s2' : ship.laserSize === 3 ? 'helix_s3' : 'helix_s1';
    shipConfigDraft.config.turrets = shipConfigDraft.config.turrets.map(t => ({
      ...t,
      laserId: laser,
      modules: ['surge', 'stampede']
    }));

    renderShipConfigView();
    showToast('✓ Profil « Minage Pur » (Helix + Boosters) appliqué !');
  });

  document.getElementById('btnQuickPresetQuantainium')?.addEventListener('click', () => {
    if (!shipConfigDraft) return;
    const ship = getShip(shipConfigDraft.shipId);
    if (!ship || !shipConfigDraft.config?.turrets?.length) return;

    const laser = ship.laserSize === 2 ? 'lancet_s2' : ship.laserSize === 3 ? 'lancet_s3' : 'lancet_s1';
    shipConfigDraft.config.turrets = shipConfigDraft.config.turrets.map(t => ({
      ...t,
      laserId: laser,
      modules: ['focus_3', 'brandt']
    }));

    renderShipConfigView();
    showToast('✓ Profil « Quantainium » (Lancet + Focus III) appliqué !');
  });

  document.getElementById('btnQuickPresetFactory')?.addEventListener('click', () => {
    if (!shipConfigDraft) return;
    const ship = getShip(shipConfigDraft.shipId);
    if (!ship || !shipConfigDraft.config?.turrets?.length) return;

    const laser = ship.laserSize === 2 ? 'arbor_s2' : ship.laserSize === 3 ? 'arbor_s3' : 'arbor_s1';
    shipConfigDraft.config.turrets = shipConfigDraft.config.turrets.map(t => ({
      ...t,
      laserId: laser,
      modules: []
    }));

    renderShipConfigView();
    showToast('✓ Profil « Usine Standard » (Arbor) réinitialisé !');
  });

  // Éditeur de configuration : Enregistrement
  document.getElementById('btnSaveShipConfig')?.addEventListener('click', () => {
    if (!shipConfigDraft) return;
    fleetService.updateShip(shipConfigDraft.uid, shipConfigDraft);
    triggerHaptic(12);
    updateTopBarProfile();
    renderFleetHangar();
    showToast(`✓ Configuration de ${shipConfigDraft.nickname} enregistrée !`);
  });

  document.getElementById('btnSaveAndExitShipConfig')?.addEventListener('click', () => {
    if (!shipConfigDraft) return;
    fleetService.updateShip(shipConfigDraft.uid, shipConfigDraft);
    triggerHaptic(12);
    updateTopBarProfile();
    closeShipConfigScreen();
    showToast(`✓ Configuration enregistrée. Retour au hangar.`);
  });

  document.getElementById('btnBackToFleetOverview')?.addEventListener('click', closeShipConfigScreen);

  // Guilde : sous-onglets
  document.querySelectorAll('[data-gtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-gtab]').forEach(b => {
        b.classList.remove('primary');
        b.classList.add('outline');
      });
      btn.classList.add('primary');
      btn.classList.remove('outline');
      activeGuildTab = btn.getAttribute('data-gtab');
      showToast(`Onglet Guilde : ${btn.textContent}`);
    });
  });

  document.getElementById('btnGuildCreateOp')?.addEventListener('click', () => {
    openInspector({
      title: 'Créer une opération de guilde',
      subtitle: 'Nova Mining Co. · Planification d\'escadre',
      body: `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Nom de l'opération</label>
            <input type="text" value="Opération Aaron Deep Core" style="width:100%; padding:8px 12px; background:var(--bg-card-inner); border:1px solid var(--border-medium); border-radius:4px; color:#fff; font-family:var(--font-ui);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Zone cible</label>
            <input type="text" value="Aaron Halo · Belt 5" style="width:100%; padding:8px 12px; background:var(--bg-card-inner); border:1px solid var(--border-medium); border-radius:4px; color:#fff; font-family:var(--font-ui);">
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Composition prévue</label>
            <p style="font-size:0.8rem; color:var(--text-dim);">2 Foreuses MOLE, 1 Transport Hercules C2, 2 Chasseurs Scorpius</p>
          </div>
        </div>
      `,
      footer: `
        <button type="button" class="vo-btn primary" id="btnConfirmCreateOp" style="width:100%;">
          Publier l'ordre d'opération
        </button>
      `
    });

    document.getElementById('btnConfirmCreateOp')?.addEventListener('click', () => {
      showToast('🚀 Opération Aaron Deep Core planifiée et notifiée sur Discord !');
      closeInspector();
    });
  });

  // Initialisation des écouteurs Équipement, Vente & Marché de Guilde
  initEquipmentAndMarketBindings();
}

function initEquipmentAndMarketBindings() {
  // 1. Bouton ouverture modal inventorier un équipement
  document.getElementById('btnOpenAddEquipmentModal')?.addEventListener('click', openAddEquipmentModal);
  document.getElementById('btnCloseEquipmentModal')?.addEventListener('click', closeAddEquipmentModal);
  document.getElementById('btnCancelEquipmentModal')?.addEventListener('click', closeAddEquipmentModal);

  // 2. Sélection d'origine (3 cartes : Acheté, Trouvé, Crafté)
  document.querySelectorAll('#originSelectorGrid .origin-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('#originSelectorGrid .origin-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const origin = card.getAttribute('data-origin') || 'purchased';
      const input = document.getElementById('eqOriginInput');
      if (input) input.value = origin;
      const craftQContainer = document.getElementById('eqCraftQualityContainer');
      if (craftQContainer) craftQContainer.style.display = origin === 'crafted' ? 'block' : 'none';
      triggerHaptic(8);
    });
  });

  // Slider de qualité des matériaux pour équipement crafté
  document.getElementById('eqMaterialQualityInput')?.addEventListener('input', (e) => {
    const val = Number(e.target.value) || 500;
    const valEl = document.getElementById('eqMaterialQualityVal');
    if (valEl) valEl.textContent = 'Q' + val;
    const badge = document.getElementById('eqQualityBadgePreview');
    if (badge && craftingService.getQualityTier) {
      const tier = craftingService.getQualityTier(val);
      badge.className = 'quality-badge ' + tier.badgeClass;
      badge.textContent = `${tier.name} · Q${val}`;
    }
  });

  // 3. Bascule champ de vente dans la modal d'ajout
  document.getElementById('eqForSaleToggle')?.addEventListener('change', (e) => {
    const container = document.getElementById('eqSaleFieldsContainer');
    if (container) {
      container.style.display = e.target.checked ? 'flex' : 'none';
      if (e.target.checked) {
        const catPrice = Number(document.getElementById('eqSelectedCatalogPrice')?.value) || 0;
        const priceInput = document.getElementById('eqSalePrice');
        if (priceInput && (!priceInput.value || Number(priceInput.value) === 0)) {
          priceInput.value = catPrice > 0 ? catPrice : '';
        }
      }
    }
  });

  // 4. Recherche FleetYards, Catégories & Autocomplétion
  let searchDebounceTimer = null;
  let currentEqCategory = 'popular';
  const searchInput = document.getElementById('eqSearchInput');
  const dropdown = document.getElementById('eqSearchDropdown');

  async function updateAndShowEquipmentDropdown(cat = currentEqCategory, q = '') {
    if (!dropdown) return;
    const cleanQ = (q || '').trim().toLowerCase();

    // Affichage d'attente si chargement en cours
    if (!fleetyardsCatalogCache || fleetyardsCatalogCache.length === 0) {
      dropdown.innerHTML = `
        <div style="padding:14px; text-align:center; color:var(--accent-cyan); font-size:0.78rem;">
          ⏳ Chargement de la base FleetYards (7 966 articles)...
        </div>
      `;
      dropdown.classList.add('open');
    }

    const catalog = await loadFleetyardsCatalog();
    let matches = [];

    if (cleanQ.length > 0) {
      // Filtrage par texte
      matches = catalog.filter(item => {
        const matchText = (item.name || '').toLowerCase().includes(cleanQ) ||
                          (item.code || '').toLowerCase().includes(cleanQ) ||
                          (item.subCategory && item.subCategory.toLowerCase().includes(cleanQ)) ||
                          (item.typeLabel && item.typeLabel.toLowerCase().includes(cleanQ));
        if (!matchText) return false;
        if (cat === 'all' || cat === 'popular') return true;
        if (cat === 'mining') {
          const s = (item.name + ' ' + (item.subCategory || '') + ' ' + (item.typeLabel || '')).toLowerCase();
          return s.includes('mining') || s.includes('minage') || s.includes('laser') || s.includes('lancet') || s.includes('helix') || s.includes('arbor') || s.includes('gadget');
        }
        return item.category === cat;
      }).slice(0, 25);
    } else {
      // Affichage par catégorie par défaut (au clic)
      if (cat === 'popular') {
        const popularCodes = [
          'lancet', 'helix', 'arbor', 'atlas', 'fr-66', 'fr-76', 'js-300',
          'novikov', 'pembroke', 'p8-sc', 'fs-9', 'multi-tool', 'medpen'
        ];
        matches = catalog.filter(item => {
          const s = (item.name + ' ' + (item.code || '')).toLowerCase();
          return popularCodes.some(p => s.includes(p));
        }).slice(0, 18);
      } else if (cat === 'mining') {
        matches = catalog.filter(item => {
          const s = (item.name + ' ' + (item.subCategory || '') + ' ' + (item.typeLabel || '')).toLowerCase();
          return s.includes('mining') || s.includes('minage') || s.includes('laser') || s.includes('lancet') || s.includes('helix') || s.includes('arbor') || s.includes('gadget');
        }).slice(0, 25);
      } else if (cat === 'all') {
        matches = catalog.slice(0, 30);
      } else {
        matches = catalog.filter(item => item.category === cat).slice(0, 25);
      }
    }

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding:12px 14px; font-size:0.75rem; color:var(--text-dim); text-align:center;">
          Aucune pièce correspondante trouvée.<br>
          <span style="color:#fff; font-weight:600;">Appuyez sur Entrée</span> pour enregistrer « ${q} » comme désignation personnalisée.
        </div>
      `;
      dropdown.classList.add('open');
      return;
    }

    dropdown.innerHTML = matches.map((m, idx) => `
      <div class="eq-search-item" data-index="${idx}">
        <div>
          <div class="eq-item-main-title">${m.name}</div>
          <div class="eq-item-sub-meta">${m.typeLabel} ${m.size ? `· S${m.size}` : ''} ${m.grade ? `· Grade ${m.grade}` : ''}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:var(--font-mono); font-weight:600; font-size:0.8rem; color:var(--accent-cyan);">
            ${m.catalogPrice > 0 ? `${m.catalogPrice.toLocaleString('fr-FR')} aUEC` : '— aUEC'}
          </div>
          <div style="font-size:0.68rem; color:var(--text-dim);">Cours officiel</div>
        </div>
      </div>
    `).join('');

    dropdown.classList.add('open');

    dropdown.querySelectorAll('.eq-search-item').forEach(itemEl => {
      itemEl.addEventListener('click', () => {
        const idx = Number(itemEl.getAttribute('data-index'));
        const selected = matches[idx];
        if (!selected) return;

        document.getElementById('eqSelectedCode').value = selected.code || '';
        document.getElementById('eqSelectedName').value = selected.name || '';
        document.getElementById('eqSelectedCategory').value = selected.category || 'component';
        document.getElementById('eqSelectedSubCategory').value = selected.subCategory || '';
        document.getElementById('eqSelectedSize').value = selected.size || '';
        document.getElementById('eqSelectedGrade').value = selected.grade || '';
        document.getElementById('eqSelectedCatalogPrice').value = selected.catalogPrice || 0;

        if (selected.size) {
          const sSelect = document.getElementById('eqSizeSelect');
          if (sSelect) {
            const opt = Array.from(sSelect.options).find(o => o.value === String(selected.size));
            if (opt) sSelect.value = opt.value;
          }
        }

        document.getElementById('eqDisplayTitle').textContent = selected.name;
        document.getElementById('eqDisplayMeta').textContent = `${selected.typeLabel} ${selected.size ? `· Taille ${selected.size}` : ''} ${selected.grade ? `· Grade ${selected.grade}` : ''}`;
        document.getElementById('eqDisplayCatalogPrice').textContent = selected.catalogPrice > 0
          ? `${selected.catalogPrice.toLocaleString('fr-FR')} aUEC`
          : '—';

        const priceInput = document.getElementById('eqSalePrice');
        if (priceInput && (!priceInput.value || Number(priceInput.value) === 0) && selected.catalogPrice > 0) {
          priceInput.value = selected.catalogPrice;
        }

        if (searchInput) searchInput.value = selected.name;
        dropdown.classList.remove('open');
        triggerHaptic(10);
      });
    });
  }

  // Écouteur de saisie dans le champ de recherche
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchDebounceTimer);
    const q = e.target.value;
    searchDebounceTimer = setTimeout(() => {
      updateAndShowEquipmentDropdown(currentEqCategory, q);
    }, 150);
  });

  // Ouverture de la liste au clic ou focus dans le champ
  searchInput?.addEventListener('focus', () => {
    updateAndShowEquipmentDropdown(currentEqCategory, searchInput.value);
  });

  searchInput?.addEventListener('click', () => {
    updateAndShowEquipmentDropdown(currentEqCategory, searchInput.value);
  });

  // Écouteurs sur les puces de filtres rapides
  document.querySelectorAll('#eqQuickCategoryChips button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#eqQuickCategoryChips button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEqCategory = btn.getAttribute('data-eq-cat') || 'popular';
      updateAndShowEquipmentDropdown(currentEqCategory, searchInput?.value || '');
      triggerHaptic(8);
    });
  });

  // Fermer dropdown si clic extérieur
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.eq-search-wrapper')) {
      dropdown?.classList.remove('open');
    }
  });

  // 5. Soumission du formulaire d'ajout d'équipement
  document.getElementById('formAddEquipment')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawName = document.getElementById('eqSearchInput')?.value?.trim();
    const selectedName = document.getElementById('eqSelectedName')?.value?.trim();
    const finalName = selectedName || rawName;

    if (!finalName) {
      showToast('⚠️ Veuillez renseigner le nom ou rechercher une référence.');
      return;
    }

    const code = document.getElementById('eqSelectedCode')?.value || finalName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let category = document.getElementById('eqSelectedCategory')?.value || 'component';
    let subCategory = document.getElementById('eqSelectedSubCategory')?.value || '';
    const size = document.getElementById('eqSizeSelect')?.value || document.getElementById('eqSelectedSize')?.value || '1';
    const grade = document.getElementById('eqSelectedGrade')?.value || null;
    const catalogPrice = Number(document.getElementById('eqSelectedCatalogPrice')?.value) || 0;
    const origin = document.getElementById('eqOriginInput')?.value || 'purchased';
    const locationId = document.getElementById('eqLocationSelect')?.value || 'ARC-L1 Wide Forest Station';
    const units = Math.max(1, Number(document.getElementById('eqQuantityUnits')?.value) || 1);
    const conditionPct = Math.max(1, Math.min(100, Number(document.getElementById('eqConditionPct')?.value) || 100));

    // Détection automatique de tête de minage si nom ou sous-catégorie l'indique
    const lowerName = finalName.toLowerCase();
    if (lowerName.includes('lancet') || lowerName.includes('helix') || lowerName.includes('arbor') ||
        lowerName.includes('klein') || lowerName.includes('impact') || lowerName.includes('hofstede') ||
        lowerName.includes('laser') || lowerName.includes('tête')) {
      category = 'component';
      if (!subCategory) subCategory = 'WeaponMining';
    }

    let materialQuality = null;
    let qualityTier = null;
    let qualityTierLabel = null;
    if (origin === 'crafted') {
      materialQuality = Number(document.getElementById('eqMaterialQualityInput')?.value) || 500;
      if (craftingService.getQualityTier) {
        const tier = craftingService.getQualityTier(materialQuality);
        qualityTier = tier.id;
        qualityTierLabel = tier.name;
      }
    }

    const forSale = document.getElementById('eqForSaleToggle')?.checked || false;
    const salePrice = forSale ? (Number(document.getElementById('eqSalePrice')?.value) || catalogPrice || 0) : 0;
    const barterOffer = forSale ? (document.getElementById('eqBarterOffer')?.value || '').trim() : '';
    const saleScope = forSale ? (document.getElementById('eqSaleScope')?.value || 'inter_guild') : 'guild_internal';

    const currentUser = store.get('profile') || {};
    const ownerCallsign = currentUser.callsign || 'VORTEX-1';

    const newEquipment = inventoryService.addEquipmentItem({
      name: finalName,
      code,
      category,
      subCategory,
      size,
      grade,
      origin,
      materialQuality,
      qualityTier,
      qualityTierLabel,
      locationId,
      quantityUnits: units,
      conditionPct,
      forSale,
      salePriceUEC: salePrice,
      barterOffer,
      catalogReferencePriceUEC: catalogPrice,
      saleScope,
      ownerCallsign
    });

    showToast(`✓ Équipement "${newEquipment.name}" inventorié avec succès !`);
    closeAddEquipmentModal();
    renderInventoryTable();
    if (currentActiveApp === 'guild') renderGuildMarket();
  });

  // 6. Modale Édition Rapide de Vente
  document.getElementById('btnCloseEditSaleModal')?.addEventListener('click', closeEditSaleModal);
  document.getElementById('btnCancelEditSaleModal')?.addEventListener('click', closeEditSaleModal);

  document.getElementById('formEditSale')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const itemId = document.getElementById('editSaleItemId')?.value;
    if (!itemId) return;

    const forSale = document.getElementById('editSaleForSaleToggle')?.checked || false;
    const salePrice = Number(document.getElementById('editSalePriceInput')?.value) || 0;
    const barter = (document.getElementById('editSaleBarterInput')?.value || '').trim();
    const scope = document.getElementById('editSaleScopeSelect')?.value || 'inter_guild';

    inventoryService.updateItemSaleListing(itemId, {
      forSale,
      salePriceUEC: salePrice,
      barterOffer: barter,
      saleScope: scope
    });

    showToast(`✓ Offre de vente mise à jour.`);
    closeEditSaleModal();
    renderInventoryTable();
    if (currentActiveApp === 'guild') renderGuildMarket();
  });

  // 7. Modale Export Manifeste Inter-Guilde
  document.getElementById('btnOpenExportManifestModal')?.addEventListener('click', openExportManifestModal);
  document.getElementById('btnCloseManifestModal')?.addEventListener('click', closeExportManifestModal);
  document.getElementById('btnDismissManifestModal')?.addEventListener('click', closeExportManifestModal);

  document.getElementById('btnCopyManifestClipboard')?.addEventListener('click', () => {
    const textarea = document.getElementById('manifestExportTextarea');
    if (!textarea) return;
    textarea.select();
    try {
      navigator.clipboard.writeText(textarea.value).then(() => {
        showToast('📋 Manifeste inter-guilde copié dans le presse-papier !');
      }).catch(() => {
        document.execCommand('copy');
        showToast('📋 Manifeste inter-guilde copié !');
      });
    } catch {
      document.execCommand('copy');
      showToast('📋 Manifeste inter-guilde copié !');
    }
  });

  // 8. Filtres d'inventaire
  document.getElementById('inventoryLocSelect')?.addEventListener('change', (e) => {
    inventoryFilterState.locationId = e.target.value;
    renderInventoryTable();
  });

  document.getElementById('inventoryOriginSelect')?.addEventListener('change', (e) => {
    inventoryFilterState.origin = e.target.value;
    renderInventoryTable();
  });

  document.getElementById('inventoryPurposeSelect')?.addEventListener('change', (e) => {
    inventoryFilterState.purpose = e.target.value;
    renderInventoryTable();
  });

  document.getElementById('inventorySaleFilterBtn')?.addEventListener('click', () => {
    inventoryFilterState.forSaleOnly = !inventoryFilterState.forSaleOnly;
    const btn = document.getElementById('inventorySaleFilterBtn');
    if (btn) {
      btn.textContent = inventoryFilterState.forSaleOnly ? '🏷️ En vente uniquement' : '🏷️ Tous';
      btn.classList.toggle('primary', inventoryFilterState.forSaleOnly);
      btn.classList.toggle('outline', !inventoryFilterState.forSaleOnly);
    }
    renderInventoryTable();
  });

  // 9. Raccourci Trade -> Bourse de Guilde
  document.getElementById('btnGoToGuildMarket')?.addEventListener('click', () => {
    setActiveApp('guild');
    switchGuildSubTab('market');
  });

  // 10. Filtres & recherche Bourse de Guilde
  document.querySelectorAll('.g-market-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.g-market-filter-btn').forEach(b => {
        b.classList.remove('primary');
        b.classList.add('outline');
      });
      btn.classList.remove('outline');
      btn.classList.add('primary');

      guildMarketFilters.category = btn.getAttribute('data-mcat') || 'all';
      renderGuildMarket();
    });
  });

  document.getElementById('btnMarketBarterToggle')?.addEventListener('click', () => {
    guildMarketFilters.barterOnly = !guildMarketFilters.barterOnly;
    const btn = document.getElementById('btnMarketBarterToggle');
    if (btn) {
      btn.classList.toggle('primary', guildMarketFilters.barterOnly);
      btn.classList.toggle('outline', !guildMarketFilters.barterOnly);
    }
    renderGuildMarket();
  });

  document.getElementById('guildMarketSearchInput')?.addEventListener('input', (e) => {
    guildMarketFilters.search = e.target.value;
    renderGuildMarket();
  });
}

// ============================================================================
// GESTION DU THÈME HOLO (mobiGlas) & CLASSIQUE
// ============================================================================
const THEME_STORAGE_KEY = 'aaron-mfd.theme';

function initThemeToggle() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'holo';
  document.documentElement.dataset.theme = savedTheme;
  updateThemeToggleUI(savedTheme);

  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme || 'holo';
    const nextTheme = currentTheme === 'holo' ? 'classic' : 'holo';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    updateThemeToggleUI(nextTheme);
    triggerHaptic(10);
    showToast(`Thème activé : ${nextTheme === 'holo' ? 'Holo (mobiGlas)' : 'Classique'}`);
  });
}

function updateThemeToggleUI(theme) {
  const val = document.getElementById('themeToggleVal');
  if (val) {
    val.innerHTML = `<b>${theme === 'holo' ? 'Holo' : 'Classique'}</b>`;
  }
}

// ============================================================================
// 12. GESTION DU SALVAGE & RECYCLAGE DE COQUES (STAR CITIZEN 4.0)
// ============================================================================
function renderSalvageScreen() {
  const calc = salvageService.getLiveCalculation();
  if (!calc) return;

  // 1. Bandeau vaisseau actif & modules
  const bannerShip = document.getElementById('salvageBannerShipName');
  if (bannerShip) bannerShip.textContent = `${calc.ship.name} « ${calc.ship.manufacturer} »`;

  const bannerCargo = document.getElementById('salvageBannerCargoBadge');
  if (bannerCargo) bannerCargo.textContent = `Soute : ${calc.cargoGridSCU} SCU`;

  const bannerBuffer = document.getElementById('salvageBannerBufferBadge');
  if (bannerBuffer) bannerBuffer.textContent = `Tampon : ${calc.bufferSCU} SCU`;

  const bannerScrapers = document.getElementById('salvageBannerScrapersSummary');
  if (bannerScrapers) bannerScrapers.textContent = `${calc.ship.scraperSlots || 2}x ${calc.scraper.name} (${calc.scraper.manufacturer})`;

  const bannerSpeed = document.getElementById('salvageBannerSpeedBadge');
  if (bannerSpeed) bannerSpeed.textContent = `⚡ ${(calc.scraper.speedScuMin * (calc.ship.scraperSlots || 2)).toFixed(1)} SCU/min`;

  const bannerEff = document.getElementById('salvageBannerEffBadge');
  if (bannerEff) bannerEff.textContent = `🎯 Efficacité ${calc.scraper.efficiencyPct}%`;

  // 2. Épave scannée
  const diffBadge = document.getElementById('salvageWreckDiffBadge');
  if (diffBadge) {
    diffBadge.textContent = calc.wreck.scrapingDifficulty || 'Normal';
    diffBadge.style.color = calc.wreck.difficultyColor || '#38bdf8';
  }

  const commonLoot = document.getElementById('salvageCommonLoot');
  if (commonLoot && calc.wreck.commonLoot) {
    commonLoot.textContent = calc.wreck.commonLoot.join(' · ');
  }

  // 3. Simulateur de buffer
  const buf = calc.bufferState;
  const bufCurrent = document.getElementById('salvageBufferCurrentText');
  if (bufCurrent) bufCurrent.textContent = buf.currentBufferSCU.toFixed(1);

  const bufMax = document.getElementById('salvageBufferMaxText');
  if (bufMax) bufMax.textContent = buf.bufferCapacitySCU.toFixed(1);

  const bufPercentBadge = document.getElementById('salvageBufferPercentBadge');
  if (bufPercentBadge) bufPercentBadge.textContent = `${buf.percentage}%`;

  const bufBar = document.getElementById('salvageBufferProgressBar');
  if (bufBar) {
    bufBar.style.width = `${buf.percentage}%`;
    if (buf.isFull) {
      bufBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
    } else if (buf.isNearFull) {
      bufBar.style.background = 'linear-gradient(90deg, #38bdf8, #f59e0b)';
    } else {
      bufBar.style.background = 'linear-gradient(90deg, #38bdf8, #818cf8)';
    }
  }

  const bufAlert = document.getElementById('salvageBufferVisualAlert');
  if (bufAlert) {
    bufAlert.textContent = buf.alertText;
    bufAlert.className = `salvage-buffer-alert ${buf.alertLevel}`;
  }

  // 4. Extraction Dashboard KPIs
  const rmcSCU = document.getElementById('salvageRmcSCU');
  if (rmcSCU) rmcSCU.textContent = `${calc.rmcSCU.toFixed(1)} SCU`;

  const rmcRev = document.getElementById('salvageRmcRevenue');
  if (rmcRev) rmcRev.textContent = `~${calc.revenueRMC.toLocaleString('fr-FR')} aUEC (TDD)`;

  const cmSCU = document.getElementById('salvageCmSCU');
  if (cmSCU) cmSCU.textContent = `${calc.cmSCU.toFixed(1)} SCU`;

  const cmRev = document.getElementById('salvageCmRevenue');
  if (cmRev) cmRev.textContent = `~${calc.revenueCM.toLocaleString('fr-FR')} aUEC`;

  const totalRev = document.getElementById('salvageTotalRevenue');
  if (totalRev) totalRev.textContent = `+${calc.totalRevenue.toLocaleString('fr-FR')}`;

  const timeEst = document.getElementById('salvageTimeEstimate');
  if (timeEst) timeEst.textContent = `Temps estimé : ${calc.estimatedScrapingMinutes} min · ${calc.runsNeeded} rotation(s)`;

  // 5. Arbitrage Stratégique
  const rec = calc.strategicRecommendation;
  const stratBadge = document.getElementById('salvageStrategicBadge');
  if (stratBadge) stratBadge.textContent = rec.badge_fr;

  const stratTitle = document.getElementById('salvageStrategicTitle');
  if (stratTitle) stratTitle.textContent = rec.title_fr;

  const stratDetail = document.getElementById('salvageStrategicDetail');
  if (stratDetail) stratDetail.textContent = rec.detail_fr;

  // Boutons d'actions
  const reserveAmount = Math.min(6, calc.rmcSCU);
  const lblReserve = document.getElementById('labelSalvageReserveCraftAmount');
  if (lblReserve) lblReserve.textContent = `Réserver ${reserveAmount} SCU`;

  const lblSellRmc = document.getElementById('labelSalvageSellRmcRevenue');
  if (lblSellRmc) lblSellRmc.textContent = `+${calc.revenueRMC.toLocaleString('fr-FR')} aUEC`;

  const lblSellCm = document.getElementById('labelSalvageSellCmRevenue');
  if (lblSellCm) lblSellCm.textContent = `+${calc.revenueCM.toLocaleString('fr-FR')} aUEC`;
}

// ============================================================================
// 13. GESTION DU STARMAP & CALCULATEUR QUANTUM DROP AARON HALO (100% VISUEL)
// ============================================================================
let starmapRendererInstance = null;

function renderStarmapScreen() {
  const calc = starmapService.getLiveCalculation();
  if (!calc) return;

  // 1. Initialiser le Canvas Renderer si nécessaire
  const canvas = document.getElementById('starmapCanvas');
  if (canvas && !starmapRendererInstance) {
    starmapRendererInstance = new StarmapCanvasRenderer(canvas);
  }

  if (starmapRendererInstance) {
    starmapRendererInstance.setSystem(starmapService.state.activeSystem);
    starmapRendererInstance.setActiveRoute(starmapService.state.activeRouteId);
  }

  // Titre du Canvas
  const canvasTitle = document.getElementById('starmapCanvasTitle');
  if (canvasTitle) {
    canvasTitle.textContent = `RADAR ORBITAL · SYSTÈME ${starmapService.state.activeSystem.toUpperCase()}`;
  }

  // 2. Mise à jour de la colonne Droite (Calculateur de Drop)
  const bandBadge = document.getElementById('starmapTargetBandBadge');
  if (bandBadge) bandBadge.textContent = `⭐ ${calc.targetBand_fr}`;

  const cutoffDist = document.getElementById('starmapCutoffDistanceDisplay');
  if (cutoffDist) cutoffDist.textContent = `${calc.targetDistanceKm.toLocaleString('fr-FR')} km`;

  const cutoffInstr = document.getElementById('starmapCutoffInstructionDisplay');
  if (cutoffInstr) cutoffInstr.textContent = calc.dropInstruction_fr;

  const flightTime = document.getElementById('starmapFlightTimeDisplay');
  if (flightTime) flightTime.textContent = calc.formattedFlightTime;

  const flightSpeed = document.getElementById('starmapFlightSpeedDisplay');
  if (flightSpeed) flightSpeed.textContent = `${calc.speedKmS.toLocaleString('fr-FR')} km/s`;
}

function initSalvageAndStarmapEvents() {
  // --- SALVAGE EVENTS ---
  document.getElementById('salvageShipSelect')?.addEventListener('change', (e) => {
    salvageService.setShip(e.target.value);
    renderSalvageScreen();
  });

  document.getElementById('salvageScraperSelect')?.addEventListener('change', (e) => {
    salvageService.setScraper(e.target.value);
    renderSalvageScreen();
  });

  document.getElementById('salvageWreckSelect')?.addEventListener('change', (e) => {
    salvageService.setWreck(e.target.value);
    renderSalvageScreen();
  });

  document.getElementById('salvageHullIntegritySlider')?.addEventListener('input', (e) => {
    const badge = document.getElementById('salvageHullIntegrityBadge');
    if (badge) badge.textContent = `${e.target.value}%`;
    salvageService.setHullIntegrity(e.target.value);
    renderSalvageScreen();
  });

  document.getElementById('btnSalvageEjectBuffer')?.addEventListener('click', () => {
    const res = salvageService.ejectBufferToCargo();
    renderSalvageScreen();
    showToast(res.message);
  });

  const feedbackBox = document.getElementById('salvageActionFeedback');
  const showSalvageFeedback = (msg, isSuccess = true) => {
    if (!feedbackBox) return;
    feedbackBox.style.display = 'block';
    feedbackBox.style.background = isSuccess ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
    feedbackBox.style.border = `1px solid ${isSuccess ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`;
    feedbackBox.style.color = isSuccess ? '#4ade80' : '#fca5a5';
    feedbackBox.textContent = msg;
    setTimeout(() => { feedbackBox.style.display = 'none'; }, 5000);
  };

  document.getElementById('btnSalvageActionReserveCraft')?.addEventListener('click', () => {
    const res = salvageService.reserveRmcForCraft();
    showSalvageFeedback(res.message, res.success);
    showToast(res.message);
    renderSalvageScreen();
  });

  document.getElementById('btnSalvageActionSellRMC')?.addEventListener('click', () => {
    const res = salvageService.sellRmcInstant();
    showSalvageFeedback(res.message, res.success);
    showToast(res.message);
    renderSalvageScreen();
    renderTopBarCitizen();
  });

  document.getElementById('btnSalvageActionSellCM')?.addEventListener('click', () => {
    const res = salvageService.sellCmInstant();
    showSalvageFeedback(res.message, res.success);
    showToast(res.message);
    renderSalvageScreen();
    renderTopBarCitizen();
  });

  // --- STARMAP EVENTS ---
  const btnStanton = document.getElementById('btnStarmapSystemStanton');
  const btnPyro = document.getElementById('btnStarmapSystemPyro');

  btnStanton?.addEventListener('click', () => {
    btnStanton.className = 'vo-btn primary small';
    if (btnPyro) btnPyro.className = 'vo-btn outline small';
    starmapService.setSystem('stanton');
    renderStarmapScreen();
  });

  btnPyro?.addEventListener('click', () => {
    btnPyro.className = 'vo-btn primary small';
    if (btnStanton) btnStanton.className = 'vo-btn outline small';
    starmapService.setSystem('pyro');
    renderStarmapScreen();
  });

  document.getElementById('starmapRouteSelect')?.addEventListener('change', (e) => {
    starmapService.setRoute(e.target.value);
    renderStarmapScreen();
  });

  document.getElementById('starmapDriveSelect')?.addEventListener('change', (e) => {
    starmapService.setQuantumDrive(e.target.value);
    renderStarmapScreen();
  });

  // Contrôles Zoom Canvas
  document.getElementById('btnStarmapZoomIn')?.addEventListener('click', () => starmapRendererInstance?.zoomIn());
  document.getElementById('btnStarmapZoomOut')?.addEventListener('click', () => starmapRendererInstance?.zoomOut());
  document.getElementById('btnStarmapResetView')?.addEventListener('click', () => starmapRendererInstance?.resetView());

  // Compte à rebours 100% visuel de coupure Quantum Drive
  const btnStartDrop = document.getElementById('btnStartQuantumDrop');
  const btnResetDrop = document.getElementById('btnResetQuantumDrop');
  const dropProgressBar = document.getElementById('starmapDropProgressBar');
  const progressPercentText = document.getElementById('starmapProgressPercentText');
  const silentAlertBanner = document.getElementById('starmapSilentAlertBanner');
  const silentAlertTitle = document.getElementById('starmapSilentAlertTitle');
  const silentAlertSub = document.getElementById('starmapSilentAlertSub');

  btnStartDrop?.addEventListener('click', () => {
    if (starmapService.state.countdownActive) {
      starmapService.stopCountdown();
      if (btnStartDrop) btnStartDrop.textContent = '⏱️ Démarrer le Saut Quantum';
      return;
    }

    if (btnStartDrop) btnStartDrop.textContent = '⏸️ Interrompre le Saut';

    starmapService.startCountdown((progress) => {
      if (dropProgressBar) dropProgressBar.style.width = `${progress.progressPercent}%`;
      if (progressPercentText) progressPercentText.textContent = `${progress.progressPercent}% (${progress.formattedRemainingTime})`;

      if (silentAlertBanner) {
        silentAlertBanner.className = progress.bannerClass;
      }
      if (silentAlertTitle) {
        silentAlertTitle.textContent = progress.bannerText;
      }
      if (silentAlertSub) {
        silentAlertSub.textContent = progress.bannerSub;
      }

      if (progress.visualPhase === 'cut_now') {
        if (btnStartDrop) btnStartDrop.textContent = '✅ ARRIVÉE DANS L\'ANNEAU D\'AARON';
      }
    });
  });

  btnResetDrop?.addEventListener('click', () => {
    starmapService.resetCountdown();
    if (btnStartDrop) btnStartDrop.textContent = '⏱️ Démarrer le Saut Quantum';
    if (dropProgressBar) dropProgressBar.style.width = '0%';
    if (progressPercentText) progressPercentText.textContent = '0% (En attente)';
    if (silentAlertBanner) {
      silentAlertBanner.className = 'banner-cruise';
      silentAlertBanner.classList.remove('blink-fast');
    }
    if (silentAlertTitle) silentAlertTitle.textContent = 'PRÊT POUR LE SAUT QUANTUM';
    if (silentAlertSub) silentAlertSub.textContent = 'Enclenchez le Quantum Drive en jeu puis appuyez sur « Démarrer le Saut Quantum »';
  });
}

// Initialisation sécurisée (exécution unique)
let isAppInitialized = false;
function initApp() {
  if (isAppInitialized) return;
  isAppInitialized = true;

  // Nettoyage automatique des données de démo et d'exemple résiduelles en stockage
  try {
    const inv = store.get('inventory');
    if (inv && Array.isArray(inv.items) && inv.items.length > 0) {
      const cleaned = inv.items.filter(item => {
        const id = String(item.id || '');
        return !id.startsWith('inv_quant_') &&
               !id.startsWith('inv_beryl_') &&
               !id.startsWith('inv_laranite_') &&
               !id.startsWith('inv_rmc_') &&
               !id.startsWith('inv_cm_') &&
               !id.startsWith('inv_bex_') &&
               !id.startsWith('inv_tar_') &&
               !id.startsWith('inv_titan_') &&
               !id.startsWith('inv_quartz_') &&
               !id.startsWith('inv_laser_') &&
               !id.startsWith('inv_mod_') &&
               !id.startsWith('inv_armor_') &&
               !id.startsWith('inv_multi_') &&
               !id.startsWith('inv_food_') &&
               !id.includes('_seed_');
      });
      if (cleaned.length !== inv.items.length) {
        store.set('inventory', { items: cleaned });
      }
    }

    const craftState = store.get('crafting');
    if (craftState && Array.isArray(craftState.unlockedBlueprintIds)) {
      const filteredBp = craftState.unlockedBlueprintIds.filter(id => id !== 'bp_lancet_s1_mk2' && id !== 'bp_focus_3_mk2');
      if (filteredBp.length !== craftState.unlockedBlueprintIds.length) {
        store.set('crafting', { ...craftState, unlockedBlueprintIds: filteredBp });
      }
    }
  } catch (err) {
    console.warn('Nettoyage du cache d’exemples :', err);
  }

  authService.init();
  initThemeToggle();
  uexService.initCache();
  initCitizenProfileAndAuth();
  updateTopBarProfile();
  initFleetNetSync();
  initEventBindings();
  initSalvageAndStarmapEvents();
  renderMiningScreen();
  setActiveApp('dashboard', false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


