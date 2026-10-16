// ============================================================================
// AARON MFD — FLEET-NET HYBRID P2P NETWORKING ENGINE (JALON 1)
// WebRTC DataChannels (Internet P2P) & BroadcastChannel (Local zero-latency)
// ============================================================================

export class AaronFleetNet {
  constructor(options = {}) {
    this.peerId = 'peer_' + Math.random().toString(36).substring(2, 9);
    this.callsign = options.callsign || 'CITIZEN-1';
    this.roomCode = null;
    this.isHost = false;
    this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'connected'
    this.peers = new Map(); // peerId -> { peerId, callsign, shipId, role, ping, lastSeen, isHost, isInternetPeer }
    this.initialData = {};

    // Local Transport (BroadcastChannel for multi-tab / multi-monitor local sync)
    this.channel = null;

    // Remote Transport (WebRTC via PeerJS for full Internet P2P communication)
    this.webrtcPeer = null;
    this.webrtcConnections = new Map(); // remotePeerId -> DataConnection
    this.isInternetP2PActive = false;
    this.recentPacketKeys = new Set(); // Packet deduplication cache

    // Telemetry & Heartbeat
    this.heartbeatTimer = null;
    this.lastPingSent = 0;
    this.pingMs = 0;

    // Callbacks
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onPeersUpdate = options.onPeersUpdate || (() => {});
    this.onMessage = options.onMessage || (() => {});
    this.onPeerJoin = options.onPeerJoin || (() => {});
    this.onPeerLeave = options.onPeerLeave || (() => {});
    this.onRockBroadcast = options.onRockBroadcast || (() => {});
    this.onRedAlert = options.onRedAlert || (() => {});
    this.onJointFireSync = options.onJointFireSync || (() => {});
    this.onCargoPickupRequest = options.onCargoPickupRequest || (() => {});
    this.onCargoPickupAccept = options.onCargoPickupAccept || (() => {});
    this.onCorpoPriceUpdate = options.onCorpoPriceUpdate || (() => {});
    this.onCorpoStockSync = options.onCorpoStockSync || (() => {});
    this.onCorpoExpenseSync = options.onCorpoExpenseSync || (() => {});
    this.onCorpoTreasurySync = options.onCorpoTreasurySync || (() => {});
    this.onCorpoTradeSync = options.onCorpoTradeSync || (() => {});
  }

  // Generate a NATO / Star Citizen style room code (e.g. WING-4982)
  static generateRoomCode() {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `WING-${num}`;
  }

  // Create a new Wing (Host mode)
  createWing(customCode = null, initialData = {}) {
    const code = (customCode || AaronFleetNet.generateRoomCode()).trim().toUpperCase();
    return this.joinWing(code, true, initialData);
  }

  // Join an existing Wing
  joinWing(roomCode, isHost = false, initialData = {}) {
    if (!roomCode) return false;
    const cleanCode = roomCode.trim().toUpperCase();

    // If already in this wing, do nothing
    if (this.status === 'connected' && this.roomCode === cleanCode) {
      return true;
    }

    // Leave any current room
    this.leaveWing();

    this.roomCode = cleanCode;
    this.isHost = isHost;
    this.initialData = initialData || {};
    this.status = 'connecting';
    this.onStatusChange(this.status, this.roomCode, this.isHost);

    // 1. Initialize Local Transport (BroadcastChannel)
    try {
      this.channel = new BroadcastChannel(`aaron_fleet_${this.roomCode}`);
      this.channel.onmessage = (event) => this.handleIncomingMessage(event.data, 'broadcast');
    } catch (err) {
      console.warn('[FLEET-NET] BroadcastChannel indisponible:', err);
    }

    // 2. Initialize Remote Internet Transport (WebRTC DataChannel via PeerJS)
    this.initWebRTC(this.roomCode, this.isHost);

    // Mark connected
    this.status = 'connected';
    this.onStatusChange(this.status, this.roomCode, this.isHost);

    // Send Join packet across all active transports
    this.sendPacket({
      type: 'PEER_JOIN',
      senderId: this.peerId,
      callsign: this.callsign,
      isHost: this.isHost,
      shipId: this.initialData.shipId,
      laserId: this.initialData.laserId,
      loadout: this.initialData,
      timestamp: Date.now()
    });

    // Start Heartbeat & Ping loop (every 2.5s)
    this.startHeartbeat();

    return true;
  }

  // Initialize WebRTC P2P (PeerJS + Google STUN)
  initWebRTC(cleanCode, isHost) {
    const PeerClass = typeof window !== 'undefined' ? window.Peer : null;
    if (!PeerClass) {
      console.log('[FLEET-NET WebRTC] PeerJS non chargé, transport local BroadcastChannel uniquement.');
      return;
    }

    const normalizedRoom = cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const myPeerId = isHost
      ? `aaron_mfd_${normalizedRoom}_host`
      : `aaron_mfd_${normalizedRoom}_w_${Math.random().toString(36).substring(2, 7)}`;

    try {
      this.webrtcPeer = new PeerClass(myPeerId, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        },
        debug: 1
      });

      this.webrtcPeer.on('open', (id) => {
        this.isInternetP2PActive = true;
        console.log('[FLEET-NET WebRTC] Connexion active au maillage P2P Internet sous ID:', id);

        // If wingman, automatically connect to Host's known WebRTC endpoint
        if (!isHost) {
          const hostId = `aaron_mfd_${normalizedRoom}_host`;
          this.connectToWebRTCPeer(hostId);
        }
      });

      // Host receives incoming connections from remote wingmen
      this.webrtcPeer.on('connection', (conn) => {
        this.bindWebRTCConnection(conn);
      });

      this.webrtcPeer.on('error', (err) => {
        console.warn('[FLEET-NET WebRTC] Avertissement réseau:', err.type, err.message);
        // If Host ID already taken, switch to Wingman mode gracefully
        if (err.type === 'unavailable-id' && isHost) {
          console.log('[FLEET-NET WebRTC] Un hôte actif existe déjà pour ce code. Basculement en mode Ailier.');
          this.isHost = false;
          if (this.webrtcPeer) {
            try { this.webrtcPeer.destroy(); } catch (e) {}
            this.webrtcPeer = null;
          }
          this.initWebRTC(cleanCode, false);
        }
      });
    } catch (e) {
      console.warn('[FLEET-NET WebRTC] Initialisation PeerJS échouée:', e);
    }
  }

  // Connect to a remote WebRTC peer (Wingman -> Host)
  connectToWebRTCPeer(targetId) {
    if (!this.webrtcPeer || this.webrtcPeer.destroyed) return;
    try {
      const conn = this.webrtcPeer.connect(targetId, {
        reliable: true,
        serialization: 'json'
      });
      this.bindWebRTCConnection(conn);
    } catch (err) {
      console.warn('[FLEET-NET WebRTC] Erreur connexion au pair distant:', targetId, err);
    }
  }

  // Attach event handlers to an open WebRTC DataConnection
  bindWebRTCConnection(conn) {
    if (!conn) return;

    conn.on('open', () => {
      this.webrtcConnections.set(conn.peer, conn);
      console.log('[FLEET-NET WebRTC] Canal de données direct ouvert avec le pair distant:', conn.peer);

      // Immediately introduce our local loadout to the remote peer
      this.sendDirectPacket(conn, {
        type: 'PEER_JOIN',
        senderId: this.peerId,
        callsign: this.callsign,
        isHost: this.isHost,
        shipId: this.initialData?.shipId,
        laserId: this.initialData?.laserId,
        loadout: this.initialData,
        timestamp: Date.now()
      });
    });

    conn.on('data', (packet) => {
      this.handleIncomingMessage(packet, 'webrtc');

      // Star-Mesh Relay: if this node is Host, relay packet to all other connected wingmen
      if (this.isHost && packet && packet.senderId !== this.peerId) {
        this.webrtcConnections.forEach((otherConn, otherId) => {
          if (otherId !== conn.peer && otherConn && otherConn.open) {
            try {
              otherConn.send(packet);
            } catch (e) {}
          }
        });
      }
    });

    conn.on('close', () => {
      this.webrtcConnections.delete(conn.peer);
      console.log('[FLEET-NET WebRTC] Canal de données fermé avec:', conn.peer);
    });

    conn.on('error', (err) => {
      console.warn('[FLEET-NET WebRTC] Erreur canal:', conn.peer, err);
      this.webrtcConnections.delete(conn.peer);
    });
  }

  // Send packet directly to a specific WebRTC connection
  sendDirectPacket(conn, packet) {
    if (!conn || !conn.open) return;
    try {
      const payload = {
        ...packet,
        roomCode: this.roomCode,
        senderId: this.peerId,
        callsign: this.callsign
      };
      conn.send(payload);
    } catch (err) {
      console.warn('[FLEET-NET WebRTC] sendDirectPacket error:', err);
    }
  }

  // Leave Wing cleanly
  leaveWing() {
    if (this.status === 'disconnected') return;

    // 1. Notify peers that we are disconnecting
    if (this.status === 'connected') {
      try {
        this.sendPacket({
          type: 'PEER_LEAVE',
          senderId: this.peerId,
          callsign: this.callsign,
          timestamp: Date.now()
        });
      } catch (e) {}
    }

    // 2. Stop Heartbeat timer
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    // 3. Close Local BroadcastChannel
    if (this.channel) {
      try {
        this.channel.close();
      } catch (e) {}
      this.channel = null;
    }

    // 4. Close WebRTC Connections & Peer instance
    if (this.webrtcConnections.size > 0) {
      this.webrtcConnections.forEach((conn) => {
        try { conn.close(); } catch (e) {}
      });
      this.webrtcConnections.clear();
    }

    if (this.webrtcPeer) {
      try {
        this.webrtcPeer.destroy();
      } catch (e) {}
      this.webrtcPeer = null;
    }

    this.isInternetP2PActive = false;
    this.peers.clear();
    this.roomCode = null;
    this.isHost = false;
    this.status = 'disconnected';
    this.pingMs = 0;
    this.recentPacketKeys.clear();

    this.onStatusChange(this.status, null, false);
    this.onPeersUpdate(this.getPeersList());
  }

  // Broadcast packet to all peers (both local tabs via BroadcastChannel and remote players via WebRTC)
  sendPacket(packet) {
    if (this.status !== 'connected') return false;
    const payload = {
      ...packet,
      roomCode: this.roomCode,
      senderId: this.peerId,
      callsign: this.callsign
    };

    // 1. Send to local tabs
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('[FLEET-NET] BroadcastChannel send error:', err);
      }
    }

    // 2. Send to remote peers via WebRTC DataConnections
    if (this.webrtcConnections.size > 0) {
      this.webrtcConnections.forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send(payload);
          } catch (err) {
            console.warn('[FLEET-NET WebRTC] DataConnection send error:', err);
          }
        }
      });
    }

    return true;
  }

  // Handle incoming data packet
  handleIncomingMessage(packet, source = 'broadcast') {
    if (!packet || packet.roomCode !== this.roomCode) return;
    if (packet.senderId === this.peerId) return; // Ignore echo of own packets

    // Packet deduplication (in case received via both BroadcastChannel and WebRTC)
    const packetKey = `${packet.senderId}_${packet.type}_${packet.timestamp}`;
    if (this.recentPacketKeys.has(packetKey)) {
      return;
    }
    this.recentPacketKeys.add(packetKey);
    if (this.recentPacketKeys.size > 150) {
      const first = this.recentPacketKeys.values().next().value;
      this.recentPacketKeys.delete(first);
    }

    const now = Date.now();

    switch (packet.type) {
      case 'PEER_JOIN': {
        // A new peer joined the wing
        const peer = {
          peerId: packet.senderId,
          callsign: packet.callsign || 'CITIZEN',
          isHost: !!packet.isHost,
          shipId: packet.shipId || packet.loadout?.shipId || 'prospector',
          laserId: packet.laserId || packet.loadout?.laserId || null,
          customLaserStats: packet.customLaserStats || packet.loadout?.customLaserStats || null,
          loadout: packet.loadout || {},
          ping: source === 'webrtc' ? 35 : 12,
          isInternetPeer: source === 'webrtc',
          lastSeen: now
        };
        this.peers.set(packet.senderId, peer);
        this.onPeerJoin(peer);
        this.onPeersUpdate(this.getPeersList());

        // Reply with PEER_ANNOUNCE so the new peer knows we exist
        this.sendPacket({
          type: 'PEER_ANNOUNCE',
          senderId: this.peerId,
          callsign: this.callsign,
          isHost: this.isHost,
          shipId: this.initialData?.shipId,
          laserId: this.initialData?.laserId,
          customLaserStats: this.initialData?.customLaserStats || null,
          loadout: this.initialData,
          targetPeerId: packet.senderId,
          timestamp: now
        });
        break;
      }

      case 'PEER_ANNOUNCE': {
        // Response from existing peers in room
        const peer = {
          peerId: packet.senderId,
          callsign: packet.callsign || 'CITIZEN',
          isHost: !!packet.isHost,
          shipId: packet.shipId || packet.loadout?.shipId || 'prospector',
          laserId: packet.laserId || packet.loadout?.laserId || null,
          customLaserStats: packet.customLaserStats || packet.loadout?.customLaserStats || null,
          loadout: packet.loadout || {},
          ping: source === 'webrtc' ? 35 : 15,
          isInternetPeer: source === 'webrtc',
          lastSeen: now
        };
        this.peers.set(packet.senderId, peer);
        this.onPeersUpdate(this.getPeersList());
        break;
      }

      case 'PEER_LOADOUT_UPDATE': {
        if (this.peers.has(packet.senderId)) {
          const peer = this.peers.get(packet.senderId);
          peer.loadout = { ...peer.loadout, ...(packet.loadout || {}) };
          if (packet.shipId) peer.shipId = packet.shipId;
          if (packet.laserId) peer.laserId = packet.laserId;
          if (packet.callsign) peer.callsign = packet.callsign;
          if (packet.customLaserStats !== undefined || packet.loadout?.customLaserStats !== undefined) {
            peer.customLaserStats = packet.customLaserStats || packet.loadout?.customLaserStats || null;
          }
          peer.lastSeen = now;
          this.onPeersUpdate(this.getPeersList());
        }
        break;
      }

      case 'PEER_LEAVE': {
        if (this.peers.has(packet.senderId)) {
          const departing = this.peers.get(packet.senderId);
          this.peers.delete(packet.senderId);
          this.onPeerLeave(departing);
          this.onPeersUpdate(this.getPeersList());
        }
        break;
      }

      case 'HEARTBEAT_PING': {
        // Send PONG back immediately
        this.sendPacket({
          type: 'HEARTBEAT_PONG',
          targetPeerId: packet.senderId,
          originalTimestamp: packet.timestamp,
          timestamp: now
        });
        // Update presence
        if (this.peers.has(packet.senderId)) {
          const p = this.peers.get(packet.senderId);
          p.lastSeen = now;
          if (packet.callsign) p.callsign = packet.callsign;
        }
        break;
      }

      case 'HEARTBEAT_PONG': {
        if (packet.targetPeerId === this.peerId) {
          const rtt = Math.max(1, now - packet.originalTimestamp);
          this.pingMs = rtt;
          if (this.peers.has(packet.senderId)) {
            const p = this.peers.get(packet.senderId);
            p.ping = rtt;
            p.lastSeen = now;
            this.onPeersUpdate(this.getPeersList());
          }
        }
        break;
      }

      case 'ROCK_BROADCAST': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onRockBroadcast) {
          this.onRockBroadcast(packet.rock, packet.callsign || 'Ailier');
        }
        this.onMessage(packet);
        break;
      }

      case 'RED_ALERT': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onRedAlert) {
          this.onRedAlert(packet.alert, packet.callsign || 'Ailier');
        }
        this.onMessage(packet);
        break;
      }

      case 'JOINT_FIRE_SYNC': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onJointFireSync) {
          this.onJointFireSync(packet.fireData, packet.callsign || 'Ailier');
        }
        this.onMessage(packet);
        break;
      }

      case 'CARGO_PICKUP_REQUEST': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onCargoPickupRequest) {
          this.onCargoPickupRequest(packet.pickupRequest, packet.callsign || 'Mineur');
        }
        this.onMessage(packet);
        break;
      }

      case 'CARGO_PICKUP_ACCEPT': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onCargoPickupAccept) {
          this.onCargoPickupAccept(packet.pickupAccept, packet.callsign || 'Transporteur');
        }
        this.onMessage(packet);
        break;
      }

      case 'CORPO_PRICE_UPDATE': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onCorpoPriceUpdate) {
          this.onCorpoPriceUpdate(packet.priceUpdate, packet.callsign || 'Éclaireur');
        }
        this.onMessage(packet);
        break;
      }

      case 'CORPO_STOCK_SYNC': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onCorpoStockSync) {
          this.onCorpoStockSync(packet.stockSync, packet.callsign || 'Mineur');
        }
        this.onMessage(packet);
        break;
      }

      case 'CORPO_EXPENSE_SYNC': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onCorpoExpenseSync) {
          this.onCorpoExpenseSync(packet.expenseSync, packet.callsign || 'Trésorier');
        }
        this.onMessage(packet);
        break;
      }

      case 'CORPO_TREASURY_SYNC': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onCorpoTreasurySync) {
          this.onCorpoTreasurySync(packet.treasurySync, packet.callsign || 'Trésorier');
        }
        this.onMessage(packet);
        break;
      }

      case 'CORPO_TRADE_SYNC': {
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        if (this.onCorpoTradeSync) {
          this.onCorpoTradeSync(packet.tradeSync, packet.callsign || 'Négociant');
        }
        this.onMessage(packet);
        break;
      }

      default: {
        // Pass through custom telemetry packets (FLEET_SYNC, etc.)
        if (this.peers.has(packet.senderId)) {
          this.peers.get(packet.senderId).lastSeen = now;
        }
        this.onMessage(packet);
        break;
      }
    }
  }

  // Periodic heartbeat loop
  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    this.heartbeatTimer = setInterval(() => {
      if (this.status !== 'connected') return;

      const now = Date.now();
      this.lastPingSent = now;

      // Broadcast heartbeat ping
      this.sendPacket({
        type: 'HEARTBEAT_PING',
        timestamp: now
      });

      // Check for timed out peers (> 8 seconds without signal)
      let peerRemoved = false;
      this.peers.forEach((peer, id) => {
        if (now - peer.lastSeen > 8000) {
          this.peers.delete(id);
          this.onPeerLeave(peer);
          peerRemoved = true;
        }
      });

      if (peerRemoved) {
        this.onPeersUpdate(this.getPeersList());
      }
    }, 2500);
  }

  // Update own callsign across network
  updateCallsign(newCallsign) {
    this.callsign = (newCallsign || 'CITIZEN-1').trim().toUpperCase();
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'PEER_ANNOUNCE',
        shipId: this.initialData?.shipId,
        laserId: this.initialData?.laserId,
        loadout: this.initialData,
        timestamp: Date.now()
      });
    }
  }

  // Broadcast ship loadout, laser power & cargo hold to wingmen
  broadcastLoadout(loadout = {}) {
    this.initialData = { ...this.initialData, ...loadout };
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'PEER_LOADOUT_UPDATE',
        shipId: this.initialData?.shipId,
        laserId: this.initialData?.laserId,
        customLaserStats: this.initialData?.customLaserStats || null,
        loadout: this.initialData,
        timestamp: Date.now()
      });
    }
  }

  // Broadcast rock scan telemetry to wingmen (Jalon 3)
  broadcastRock(rockData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'ROCK_BROADCAST',
        senderId: this.peerId,
        callsign: this.callsign,
        rock: rockData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Red Alert (Pirate Attack / Emergency Jump) (Jalon 4)
  broadcastRedAlert(alertData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'RED_ALERT',
        senderId: this.peerId,
        callsign: this.callsign,
        alert: alertData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Joint Fire Sequencing & Overcharge Status (Jalon 4)
  broadcastJointFireSync(fireData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'JOINT_FIRE_SYNC',
        senderId: this.peerId,
        callsign: this.callsign,
        fireData: fireData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Cargo Pickup Request (Miner drops saddlebags in space) (Jalon 5)
  broadcastCargoPickupRequest(pickupData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'CARGO_PICKUP_REQUEST',
        senderId: this.peerId,
        callsign: this.callsign,
        pickupRequest: pickupData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Cargo Pickup Acceptance (Hauler tractors bags into hold) (Jalon 5)
  broadcastCargoPickupAccept(acceptData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'CARGO_PICKUP_ACCEPT',
        senderId: this.peerId,
        callsign: this.callsign,
        pickupAccept: acceptData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Corpo Scout Price Update (Jalon 6)
  broadcastCorpoPriceUpdate(priceUpdate) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'CORPO_PRICE_UPDATE',
        senderId: this.peerId,
        callsign: this.callsign,
        priceUpdate: priceUpdate,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Guild Stockpile Sync (Jalon 7)
  broadcastCorpoStockSync(stockSyncData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'CORPO_STOCK_SYNC',
        senderId: this.peerId,
        callsign: this.callsign,
        stockSync: stockSyncData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Guild Expense Sync (Jalon 7)
  broadcastCorpoExpenseSync(expenseSyncData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'CORPO_EXPENSE_SYNC',
        senderId: this.peerId,
        callsign: this.callsign,
        expenseSync: expenseSyncData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Guild Treasury & mo.Trader Split Sync
  broadcastCorpoTreasurySync(treasurySyncData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'CORPO_TREASURY_SYNC',
        senderId: this.peerId,
        callsign: this.callsign,
        treasurySync: treasurySyncData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Broadcast Guild Commodity Trading & Route Sync
  broadcastCorpoTradeSync(tradeSyncData) {
    if (this.status === 'connected') {
      this.sendPacket({
        type: 'CORPO_TRADE_SYNC',
        senderId: this.peerId,
        callsign: this.callsign,
        tradeSync: tradeSyncData,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  // Get array of active connected peers
  getPeersList() {
    return Array.from(this.peers.values());
  }

  // Generate 1-click shareable link
  getInviteUrl() {
    if (!this.roomCode) return window.location.origin + window.location.pathname;
    const url = new URL(window.location.href);
    url.searchParams.set('fleet', this.roomCode);
    return url.toString();
  }
}
