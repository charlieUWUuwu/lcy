const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
  openCSV: () => ipcRenderer.invoke('dialog:openCSV'),
  readCSV: (filePath) => ipcRenderer.invoke('file:readCSV', filePath),
  loadImageBase64: (filePath) => ipcRenderer.invoke('load-image-base64', filePath),
});
