const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let tray = null;
let isAlwaysOnTop = false;
let gameLogWatcher = null;
let currentGameLogPath = null;
let lastLogFileOffset = 0;

// Standard Star Citizen Game.log search candidate paths
const SC_CANDIDATE_PATHS = [
  'C:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE\\Game.log',
  'D:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE\\Game.log',
  'E:\\Program Files\\Roberts Space Industries\\StarCitizen\\LIVE\\Game.log',
  'C:\\Program Files (x86)\\Roberts Space Industries\\StarCitizen\\LIVE\\Game.log',
  'D:\\StarCitizen\\LIVE\\Game.log',
  'E:\\StarCitizen\\LIVE\\Game.log',
  'C:\\Roberts Space Industries\\StarCitizen\\LIVE\\Game.log',
  'D:\\Roberts Space Industries\\StarCitizen\\LIVE\\Game.log',
  'C:\\Program Files\\Roberts Space Industries\\StarCitizen\\PTU\\Game.log',
  'D:\\Program Files\\Roberts Space Industries\\StarCitizen\\PTU\\Game.log'
];

function findActiveStarCitizenGameLog() {
  for (const candidate of SC_CANDIDATE_PATHS) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore permission or drive missing errors
    }
  }
  return null;
}

function startWatchingGameLog(logPath) {
  if (!logPath || !fs.existsSync(logPath)) return;
  currentGameLogPath = logPath;

  try {
    const stats = fs.statSync(logPath);
    // Start reading from the last 20KB to catch recent events without overloading
    lastLogFileOffset = Math.max(0, stats.size - 20000);
  } catch (err) {
    lastLogFileOffset = 0;
  }

  if (gameLogWatcher) {
    clearInterval(gameLogWatcher);
  }

  console.log(`[AARON DESKTOP] 🎮 Live Game.log watcher connecté sur: ${logPath}`);

  gameLogWatcher = setInterval(() => {
    if (!currentGameLogPath || !fs.existsSync(currentGameLogPath)) return;

    try {
      const stats = fs.statSync(currentGameLogPath);
      if (stats.size < lastLogFileOffset) {
        // File was truncated / restarted with game launch
        lastLogFileOffset = 0;
      }

      if (stats.size > lastLogFileOffset) {
        const stream = fs.createReadStream(currentGameLogPath, {
          start: lastLogFileOffset,
          end: stats.size,
          encoding: 'utf8'
        });

        let chunk = '';
        stream.on('data', data => { chunk += data; });
        stream.on('end', () => {
          lastLogFileOffset = stats.size;
          processGameLogChunk(chunk);
        });
      }
    } catch (e) {
      // Temporary lock during game write
    }
  }, 1000);
}

function processGameLogChunk(text) {
  if (!text || !mainWindow || mainWindow.isDestroyed()) return;

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;

    // Detect known Star Citizen log telemetry patterns
    const lower = line.toLowerCase();

    // Location & Station detections
    const stationMatches = [
      { key: 'arc-l1', label: 'ARC-L1 Wide Forest Station', system: 'stanton' },
      { key: 'hur-l1', label: 'HUR-L1 Green Glade Station', system: 'stanton' },
      { key: 'mic-l1', label: 'MIC-L1 Shallow Frontier Station', system: 'stanton' },
      { key: 'cru-l1', label: 'CRU-L1 Ambitious Dream Station', system: 'stanton' },
      { key: 'grim hex', label: 'Grim HEX', system: 'stanton' },
      { key: 'area18', label: 'Area18 (ArcCorp)', system: 'stanton' },
      { key: 'lorville', label: 'Lorville (Hurston)', system: 'stanton' },
      { key: 'orison', label: 'Orison (Crusader)', system: 'stanton' },
      { key: 'new babbage', label: 'New Babbage (microTech)', system: 'stanton' },
      { key: 'ruin station', label: 'Ruin Station', system: 'pyro' },
      { key: 'checkmate', label: 'Checkmate Station', system: 'pyro' },
      { key: 'pyro gateway', label: 'Pyro Gateway', system: 'stanton' }
    ];

    for (const st of stationMatches) {
      if (lower.includes(st.key) && (lower.includes('location') || lower.includes('zone') || lower.includes('spawn') || lower.includes('dock') || lower.includes('landing'))) {
        mainWindow.webContents.send('desktop:gamelog-event', {
          type: 'STATION_DETECTED',
          station: st.label,
          system: st.system,
          rawLine: line
        });
        break;
      }
    }

    // Death / Crash detection
    if (lower.includes('vehicle destroyed') || lower.includes('onvehicledestroyed') || lower.includes('killed by') || lower.includes('fatal collision')) {
      mainWindow.webContents.send('desktop:gamelog-event', {
        type: 'SHIP_DESTROYED',
        timestamp: Date.now(),
        rawLine: line
      });
    }

    // Quantum travel detection
    if (lower.includes('quantum') && (lower.includes('arrived') || lower.includes('completed') || lower.includes('spool'))) {
      mainWindow.webContents.send('desktop:gamelog-event', {
        type: 'QUANTUM_EVENT',
        timestamp: Date.now(),
        rawLine: line
      });
    }
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon-512.png');

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#070a0f',
    title: 'AARON MFD — Star Citizen Tactical Mining Companion',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'desktop-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
      webSecurity: false // Allows local P2P WebRTC data channels & local audio
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (gameLogWatcher) {
      clearInterval(gameLogWatcher);
      gameLogWatcher = null;
    }
  });

  // Global hotkeys
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    toggleAlwaysOnTop();
  });

  globalShortcut.register('CommandOrControl+Shift+M', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Auto-detect Star Citizen log
  const detectedLog = findActiveStarCitizenGameLog();
  if (detectedLog) {
    startWatchingGameLog(detectedLog);
  }

  // Create System Tray
  createSystemTray(iconPath);
}

function toggleAlwaysOnTop() {
  if (!mainWindow) return false;
  isAlwaysOnTop = !isAlwaysOnTop;
  mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'screen-saver');
  mainWindow.webContents.send('desktop:always-on-top-changed', isAlwaysOnTop);
  return isAlwaysOnTop;
}

function createSystemTray(iconPath) {
  try {
    if (!fs.existsSync(iconPath)) return;
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'AARON MFD (Star Citizen)',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Afficher / Masquer l\'Interface',
        click: () => {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Épingler au-dessus du Jeu (Always-on-Top)',
        type: 'checkbox',
        checked: isAlwaysOnTop,
        click: (menuItem) => {
          toggleAlwaysOnTop();
          menuItem.checked = isAlwaysOnTop;
        }
      },
      {
        label: 'Sélectionner Game.log Star Citizen...',
        click: () => {
          selectGameLogFile();
        }
      },
      { type: 'separator' },
      {
        label: 'Quitter',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setToolTip('AARON MFD — Tactical Mining Companion');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      mainWindow.show();
      mainWindow.focus();
    });
  } catch (err) {
    console.warn('[Desktop Tray] Notice:', err.message);
  }
}

async function selectGameLogFile() {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Sélectionner le fichier Game.log de Star Citizen',
    properties: ['openFile'],
    filters: [
      { name: 'Star Citizen Log (*.log)', extensions: ['log'] },
      { name: 'Tous les fichiers (*.*)', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const selected = result.filePaths[0];
    startWatchingGameLog(selected);
    return {
      connected: true,
      path: selected
    };
  }
  return {
    connected: !!currentGameLogPath,
    path: currentGameLogPath
  };
}

// IPC Handlers
ipcMain.handle('desktop:toggle-always-on-top', () => {
  return toggleAlwaysOnTop();
});

ipcMain.handle('desktop:is-always-on-top', () => {
  return isAlwaysOnTop;
});

ipcMain.on('desktop:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('desktop:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('desktop:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('desktop:select-gamelog-path', async () => {
  return await selectGameLogFile();
});

ipcMain.handle('desktop:get-gamelog-status', () => {
  return {
    connected: !!currentGameLogPath && fs.existsSync(currentGameLogPath),
    path: currentGameLogPath
  };
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (gameLogWatcher) clearInterval(gameLogWatcher);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
