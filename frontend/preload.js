const { contextBridge, ipcRenderer } = require('electron');

console.log('preload.js script loaded'); // It's good to keep a log to confirm it's loading

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose loadFile which takes options (e.g., for file extensions)
  loadFile: (options) => ipcRenderer.invoke('open-file-dialog', options),
  // Expose readFile which takes a filePath and invokes an IPC handler
  readFile: (filePath) => ipcRenderer.invoke('file:readFile', filePath),
});
