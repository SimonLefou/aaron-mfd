// ============================================================================
// AARON MFD — CITIZEN AUTHENTICATION & PROFILE SERVICE (1.1)
// Authentification sécurisée, Identité RSI, Multi-appareils & Préférences
// ============================================================================

import { storage } from '../core/storage.js';
import { store } from '../core/state.js';
import { eventBus, EVENTS } from '../core/event-bus.js';
import { createPlayer, CITIZEN_SPECIALTIES } from '../core/models.js';

const STORAGE_ACCOUNTS = 'accounts_registry';
const STORAGE_CURRENT_SESSION = 'active_auth_session';

/**
 * Détection du type d'appareil et du navigateur courant pour le nommage de session
 */
function detectCurrentDeviceName() {
  if (typeof window === 'undefined') return 'Serveur / Node.js';
  const ua = navigator.userAgent || '';
  const isMobile = /Android|iPhone/i.test(ua);
  const isTablet = /iPad|Tablet/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
  
  let browser = 'Navigateur Web';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';

  let os = 'Appareil';
  if (/Windows/i.test(ua)) os = 'Windows Cockpit';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android mobiGlas';
  else if (/iPhone|iPad/i.test(ua)) os = isTablet ? 'iPad MFD HOTAS' : 'iPhone';
  else if (/Linux/i.test(ua)) os = 'Linux Console';

  if (isTablet) return `Tablette MFD · ${os} (${browser})`;
  if (isMobile) return `mobiGlas Mobile · ${os}`;
  return `Cockpit PC · ${os} (${browser})`;
}

function detectDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPad|Tablet/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) return 'tablet';
  if (/Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Fonction simple et robuste de hash/salage pour environnement navigateur / client
 */
function hashPassword(password) {
  let hash = 0;
  const str = String(password) + '_aaron_mfd_salt_uee_4.0';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sha256_mock_${Math.abs(hash).toString(16)}`;
}

class AuthService {
  constructor() {
    this._accounts = [];
    this._currentSession = null;
    this._initialized = false;
  }

  /**
   * Initialisation du service d'authentification
   */
  init() {
    if (this._initialized) return;

    // 1. Charger les comptes existants
    this._accounts = storage.get(STORAGE_ACCOUNTS, []);

    // 2. Si aucun compte n'existe, initialiser le compte Citoyen Maître de démonstration
    if (!this._accounts || this._accounts.length === 0) {
      const demoPlayer = createPlayer({
        id: 'usr_cmdr_vortex',
        email: 'vortex@rsi.space',
        rsiHandle: 'Commander_Vortex',
        callsign: 'VORTEX-1',
        specialties: ['mining', 'hauler', 'scout'],
        primarySpecialty: 'mining',
        citizenshipNumber: 'UEE-847291',
        citizenshipStatus: 'Citoyen Actif UEE (Palier III)',
        location: 'Stanton · ARC-L1 Wide Forest',
        activeShipId: 'default_prospector',
        balanceAuec: 1284500,
        bio: 'Commandant d\'opération industrielle dans l’Aaron Halo. Vétéran de prospection et logistique.',
        organization: 'Nova Mining Co.',
        orgTag: 'NMC',
        pairingCode: '749-821'
      });

      const demoAccount = {
        id: demoPlayer.id,
        email: 'vortex@rsi.space',
        passwordHash: hashPassword('Password123!'),
        player: demoPlayer,
        createdAt: Date.now() - 86400000 * 30
      };

      this._accounts = [demoAccount];
      storage.set(STORAGE_ACCOUNTS, this._accounts);
    }

    // 3. Charger la session active ou restaurer le compte par défaut
    const savedSession = storage.get(STORAGE_CURRENT_SESSION, null);
    if (savedSession && savedSession.userId) {
      const account = this._accounts.find(a => a.id === savedSession.userId);
      if (account) {
        this._currentSession = {
          ...savedSession,
          lastActive: Date.now()
        };
        this._syncPlayerToStore(account.player);
      } else {
        this._loginDefault();
      }
    } else {
      this._loginDefault();
    }

    this._initialized = true;
  }

  _loginDefault() {
    if (this._accounts.length > 0) {
      const defaultAcc = this._accounts[0];
      const deviceName = detectCurrentDeviceName();
      const deviceType = detectDeviceType();

      this._currentSession = {
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: defaultAcc.id,
        deviceName,
        deviceType,
        token: `jwt_aaron_${Date.now()}`,
        startedAt: Date.now(),
        lastActive: Date.now()
      };

      storage.set(STORAGE_CURRENT_SESSION, this._currentSession);
      this._syncPlayerToStore(defaultAcc.player);
    }
  }

  _syncPlayerToStore(player) {
    storage.set('player', player);
    store.setState({ player: { ...player } });
  }

  /**
   * Création d'un nouveau compte citoyen
   * @param {Object} data 
   */
  register(data = {}) {
    this.init();

    const email = (data.email || '').trim().toLowerCase();
    const password = String(data.password || '');
    const rsiHandle = (data.rsiHandle || '').trim();
    const callsign = (data.callsign || 'PILOT-1').trim().toUpperCase();
    const specialties = Array.isArray(data.specialties) && data.specialties.length > 0
      ? data.specialties
      : [data.primarySpecialty || 'mining'];
    const primarySpecialty = data.primarySpecialty || specialties[0] || 'mining';

    // Validations
    if (!email || !email.includes('@') || !email.includes('.')) {
      return { success: false, error: 'Adresse email invalide' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères' };
    }

    if (!rsiHandle || rsiHandle.length < 3) {
      return { success: false, error: 'Le pseudo RSI officiel doit comporter au moins 3 caractères' };
    }

    // Vérifier l'unicité de l'email
    const existing = this._accounts.find(a => a.email === email);
    if (existing) {
      return { success: false, error: 'Un compte avec cette adresse email existe déjà' };
    }

    // Génération du nouveau profil citoyen
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const pairingCode = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    const currentDevice = detectCurrentDeviceName();
    const currentType = detectDeviceType();

    const newPlayer = createPlayer({
      id: newId,
      email,
      rsiHandle,
      callsign,
      specialties,
      primarySpecialty,
      citizenshipNumber: `UEE-${Math.floor(100000 + Math.random() * 900000)}`,
      citizenshipStatus: 'Citoyen Enrôlé UEE',
      location: data.location || 'Stanton · ARC-L1 Wide Forest',
      activeShipId: data.activeShipId || 'default_prospector',
      balanceAuec: typeof data.balanceAuec === 'number' ? data.balanceAuec : 500000,
      bio: data.bio || `Pilote citoyen enregistré avec la spécialité ${CITIZEN_SPECIALTIES[primarySpecialty]?.label || primarySpecialty}.`,
      organization: data.organization || 'Indépendant',
      orgTag: data.orgTag || 'IND',
      pairingCode,
      sessions: [
        {
          id: `sess_${Date.now()}`,
          deviceName: `${currentDevice} (Cette session)`,
          deviceType: currentType,
          ip: '192.168.1.10 (Local)',
          createdAt: Date.now(),
          lastActive: Date.now(),
          isCurrent: true
        }
      ]
    });

    const newAccount = {
      id: newId,
      email,
      passwordHash: hashPassword(password),
      player: newPlayer,
      createdAt: Date.now()
    };

    this._accounts.push(newAccount);
    storage.set(STORAGE_ACCOUNTS, this._accounts);

    // Définir comme session active
    this._currentSession = {
      sessionId: `sess_${Date.now()}`,
      userId: newId,
      deviceName: currentDevice,
      deviceType: currentType,
      token: `jwt_aaron_${Date.now()}`,
      startedAt: Date.now(),
      lastActive: Date.now()
    };
    storage.set(STORAGE_CURRENT_SESSION, this._currentSession);

    this._syncPlayerToStore(newPlayer);
    eventBus.emit(EVENTS.AUTH_CHANGED, { user: newPlayer, action: 'register' });
    eventBus.emit(EVENTS.PLAYER_UPDATED, newPlayer);

    return { success: true, user: newPlayer };
  }

  /**
   * Connexion avec Email et Mot de passe
   */
  login(email, password) {
    this.init();

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPwd = String(password || '');

    const account = this._accounts.find(a => a.email === cleanEmail);
    if (!account) {
      return { success: false, error: 'Compte introuvable pour cette adresse email' };
    }

    if (account.passwordHash !== hashPassword(cleanPwd)) {
      return { success: false, error: 'Mot de passe erroné' };
    }

    const currentDevice = detectCurrentDeviceName();
    const currentType = detectDeviceType();
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;

    // Mettre à jour la liste des sessions de l'utilisateur
    const currentSessions = account.player.sessions || [];
    currentSessions.forEach(s => s.isCurrent = false);
    currentSessions.unshift({
      id: sessionId,
      deviceName: `${currentDevice} (Cette session)`,
      deviceType: currentType,
      ip: '192.168.1.15 (Local)',
      createdAt: Date.now(),
      lastActive: Date.now(),
      isCurrent: true
    });

    // Garder max 6 sessions
    account.player.sessions = currentSessions.slice(0, 6);
    account.player.lastLoginAt = Date.now();

    storage.set(STORAGE_ACCOUNTS, this._accounts);

    this._currentSession = {
      sessionId,
      userId: account.id,
      deviceName: currentDevice,
      deviceType: currentType,
      token: `jwt_aaron_${Date.now()}`,
      startedAt: Date.now(),
      lastActive: Date.now()
    };
    storage.set(STORAGE_CURRENT_SESSION, this._currentSession);

    this._syncPlayerToStore(account.player);
    eventBus.emit(EVENTS.AUTH_CHANGED, { user: account.player, action: 'login' });
    eventBus.emit(EVENTS.PLAYER_UPDATED, account.player);

    return { success: true, user: account.player };
  }

  /**
   * Connexion instantanée via code d'appairage multi-appareils (2nd écran / tablette MFD)
   * Permet de lier une tablette HOTAS sans ressaisir l'identifiant et le mot de passe
   */
  loginWithPairingCode(code) {
    this.init();
    if (!code) return { success: false, error: 'Veuillez saisir un code d\'appairage' };

    const cleanCode = code.toString().trim().replace(/\s+/g, '');
    const account = this._accounts.find(a => {
      const pCode = (a.player?.pairingCode || '').replace(/[\s-]+/g, '');
      const inputCode = cleanCode.replace(/[\s-]+/g, '');
      return pCode === inputCode;
    });

    if (!account) {
      return { success: false, error: 'Code d\'appairage introuvable ou expiré' };
    }

    const currentDevice = detectCurrentDeviceName();
    const currentType = detectDeviceType();
    const sessionId = `sess_paired_${Date.now()}`;

    // Ajouter la session compagnon
    const currentSessions = account.player.sessions || [];
    currentSessions.forEach(s => s.isCurrent = false);
    currentSessions.unshift({
      id: sessionId,
      deviceName: `${currentDevice} (Compagnon Appairé)`,
      deviceType: currentType,
      ip: '192.168.1.99 (Wi-Fi Cockpit)',
      createdAt: Date.now(),
      lastActive: Date.now(),
      isCurrent: true
    });

    account.player.sessions = currentSessions.slice(0, 6);
    storage.set(STORAGE_ACCOUNTS, this._accounts);

    this._currentSession = {
      sessionId,
      userId: account.id,
      deviceName: currentDevice,
      deviceType: currentType,
      token: `jwt_aaron_${Date.now()}`,
      startedAt: Date.now(),
      lastActive: Date.now()
    };
    storage.set(STORAGE_CURRENT_SESSION, this._currentSession);

    this._syncPlayerToStore(account.player);
    eventBus.emit(EVENTS.AUTH_CHANGED, { user: account.player, action: 'paired' });
    eventBus.emit(EVENTS.PLAYER_UPDATED, account.player);

    return { success: true, user: account.player };
  }

  /**
   * Génération d'un nouveau code PIN d'appairage multi-appareils
   */
  generateNewPairingCode() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const newCode = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    return this.updateProfile({ pairingCode: newCode }).user?.pairingCode || newCode;
  }

  /**
   * Déconnexion de la session actuelle
   */
  logout() {
    this.init();
    if (this._currentSession && this._currentSession.userId) {
      const account = this._accounts.find(a => a.id === this._currentSession.userId);
      if (account && account.player && account.player.sessions) {
        account.player.sessions = account.player.sessions.filter(s => s.id !== this._currentSession.sessionId);
        storage.set(STORAGE_ACCOUNTS, this._accounts);
      }
    }

    this._currentSession = null;
    storage.remove(STORAGE_CURRENT_SESSION);

    eventBus.emit(EVENTS.AUTH_CHANGED, { user: null, action: 'logout' });
    return { success: true };
  }

  /**
   * Mise à jour du profil citoyen (RSI handle, callsign, spécialités, etc.)
   */
  updateProfile(updates = {}) {
    this.init();
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, error: 'Aucun utilisateur connecté' };

    const account = this._accounts.find(a => a.id === currentUser.id);
    if (!account) return { success: false, error: 'Compte introuvable' };

    // Formatage et mise à jour
    if (updates.callsign) {
      updates.callsign = updates.callsign.trim().toUpperCase();
    }
    if (updates.rsiHandle) {
      updates.rsiHandle = updates.rsiHandle.trim();
    }
    if (updates.specialties && Array.isArray(updates.specialties)) {
      if (updates.specialties.length > 0 && !updates.primarySpecialty) {
        updates.primarySpecialty = updates.specialties[0];
      }
      updates.role = updates.primarySpecialty || updates.specialties[0];
    }
    if (updates.primarySpecialty) {
      updates.role = updates.primarySpecialty;
    }

    const updatedPlayer = {
      ...account.player,
      ...updates,
      preferences: {
        ...account.player.preferences,
        ...(updates.preferences || {})
      }
    };

    account.player = updatedPlayer;
    storage.set(STORAGE_ACCOUNTS, this._accounts);

    this._syncPlayerToStore(updatedPlayer);
    eventBus.emit(EVENTS.PLAYER_UPDATED, updatedPlayer);
    if (updates.callsign) {
      eventBus.emit(EVENTS.CALLSIGN_CHANGED, updatedPlayer.callsign);
    }

    return { success: true, user: updatedPlayer };
  }

  /**
   * Changement de mot de passe sécurisé
   */
  changePassword(oldPassword, newPassword) {
    this.init();
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, error: 'Aucun utilisateur connecté' };

    const account = this._accounts.find(a => a.id === currentUser.id);
    if (!account) return { success: false, error: 'Compte introuvable' };

    if (account.passwordHash !== hashPassword(oldPassword)) {
      return { success: false, error: 'L’ancien mot de passe est incorrect' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Le nouveau mot de passe doit comporter au moins 6 caractères' };
    }

    account.passwordHash = hashPassword(newPassword);
    storage.set(STORAGE_ACCOUNTS, this._accounts);

    return { success: true };
  }

  /**
   * Révocation d'une session multi-appareils à distance
   */
  revokeSession(sessionId) {
    this.init();
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, error: 'Aucun utilisateur connecté' };

    const account = this._accounts.find(a => a.id === currentUser.id);
    if (!account || !account.player || !account.player.sessions) {
      return { success: false, error: 'Session introuvable' };
    }

    account.player.sessions = account.player.sessions.filter(s => s.id !== sessionId);
    storage.set(STORAGE_ACCOUNTS, this._accounts);

    this._syncPlayerToStore(account.player);
    eventBus.emit(EVENTS.SESSION_CHANGED, account.player.sessions);
    eventBus.emit(EVENTS.PLAYER_UPDATED, account.player);

    return { success: true, sessions: account.player.sessions };
  }

  /**
   * Récupérer la liste des comptes enregistrés (pour sélection ou démonstration)
   */
  getRegisteredAccounts() {
    this.init();
    return this._accounts.map(a => ({
      id: a.id,
      email: a.email,
      callsign: a.player.callsign,
      rsiHandle: a.player.rsiHandle,
      primarySpecialty: a.player.primarySpecialty
    }));
  }

  /**
   * Récupérer le profil citoyen actuellement connecté
   */
  getCurrentUser() {
    this.init();
    return store.getState().player || null;
  }

  /**
   * Obtenir la session courante
   */
  getCurrentSession() {
    this.init();
    return this._currentSession;
  }

  /**
   * Vérifier si un compte est actuellement connecté
   */
  isAuthenticated() {
    this.init();
    return !!(this._currentSession && this._currentSession.userId);
  }
}

export const authService = new AuthService();
