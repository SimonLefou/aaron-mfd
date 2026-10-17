const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AARON_DESKTOP', {
  isDesktop: true,
  platform: process.platform,
  version: '2.3.0',
  toggleAlwaysOnTop: () => ipcRenderer.invoke('desktop:toggle-always-on-top'),
  isAlwaysOnTop: () => ipcRenderer.invoke('desktop:is-always-on-top'),
  minimize: () => ipcRenderer.send('desktop:minimize'),
  maximize: () => ipcRenderer.send('desktop:maximize'),
  close: () => ipcRenderer.send('desktop:close'),
  selectGameLogPath: () => ipcRenderer.invoke('desktop:select-gamelog-path'),
  getGameLogStatus: () => ipcRenderer.invoke('desktop:get-gamelog-status'),
  onGameLogEvent: (callback) => {
    const listener = (event, data) => callback(data);
    ipcRenderer.on('desktop:gamelog-event', listener);
    return () => ipcRenderer.removeListener('desktop:gamelog-event', listener);
  },
  onAlwaysOnTopChanged: (callback) => {
    const listener = (event, isPinned) => callback(isPinned);
    ipcRenderer.on('desktop:always-on-top-changed', listener);
    return () => ipcRenderer.removeListener('desktop:always-on-top-changed', listener);
  }
});
