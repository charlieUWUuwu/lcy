const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openCSV: () => ipcRenderer.invoke('dialog:openCSV'),
  readCSV: (filePath) => ipcRenderer.invoke('file:readCSV', filePath),
});
