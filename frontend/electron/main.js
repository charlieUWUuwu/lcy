const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs').promises;
const fsSync = require('fs'); // 注意：這是非 promises 版的 fs
const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess;
const isDev = !app.isPackaged;

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // 改直接使用 preload.js ?
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    console.log('開發環境，載入本地伺服器');
  } else {
    win.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
    console.log('正式環境，載入打包後的前端檔案');
  }
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  if (!isDev) {
    // 打包正式環境，啟動後端
    const backendPath = path.join(process.resourcesPath, 'backend_server.exe');
    console.log(`後端路徑: ${backendPath}`);

    backendProcess = spawn(backendPath);

    backendProcess.on('error', (error) => {
      console.error(`後端服務啟動失敗: ${error}`);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log(`後端程式退出，退出碼: ${code}, 訊號: ${signal}`);
    });
  } else {
    // 開發環境可以放這裡的邏輯
    console.log('開發環境，不啟動後端可執行檔');
  }

  createWindow();
});

// 最後一個視窗關閉，就強制要全部退出
app.on('window-all-closed', () => {
  if (backendProcess && backendProcess.pid) {
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        try {
          // 使用 /T 參數確保終止整個進程樹
          execSync(`taskkill /F /T /PID ${backendProcess.pid}`);
          console.log('後端及其所有 child process 已關閉');
        } catch (err) {
          console.log(`無法使用 taskkill 終止進程: ${err.message}`);
        }
      } else {
        // 非 Windows 平台
        backendProcess.kill();
        console.log('後端已關閉');
      }
    } catch (error) {
      console.error(`關閉後端時發生錯誤: ${error.message}`);
    }
  }

  // 退出應用程式
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 處理 IPC 事件
ipcMain.handle('dialog:openCSV', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];

  try {
    const stat = await fs.stat(filePath);
    if (stat.size > MAX_FILE_SIZE_BYTES) {
      const maxSizeGB = (MAX_FILE_SIZE_BYTES / 1024 ** 3).toFixed(2);
      return { error: `檔案大小不可超過 ${maxSizeGB} GB` };
    }
    return { filePath };
  } catch (err) {
    console.error('讀取檔案資訊失敗:', err);
    return { error: '無法讀取檔案資訊' };
  }
});

ipcMain.handle('file:readCSV', async (_, filePath) => {
  const maxTotalPoints = 2100;

  return new Promise((resolve, reject) => {
    const stream = fsSync.createReadStream(filePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: stream });

    const sampledTimestamps = [];
    const sampledFeatures = [];

    let headers = [];
    let lineCount = 0;
    let factor = 1;
    let skipSampling = false;

    rl.on('line', (line) => {
      if (line.trim() === '') return;

      if (lineCount === 0) {
        headers = line.split(',').map((h) => h.trim());
        for (let i = 1; i < headers.length; i++) {
          sampledFeatures.push([]);
        }
      } else {
        if (lineCount === 1) {
          // 預估總點數
          const estimatedLines = Math.floor(fsSync.statSync(filePath).size / line.length);
          const M = headers.length - 1;
          const totalPoints = estimatedLines * M;

          if (totalPoints <= maxTotalPoints) {
            skipSampling = true;
            factor = 1;
            console.log(`資料量 (${totalPoints}) 小於 ${maxTotalPoints}，不進行下採樣`);
          } else {
            factor = Math.ceil(totalPoints / maxTotalPoints);
            console.log(
              `資料量 (${totalPoints}) 超過 ${maxTotalPoints}，執行下採樣，factor=${factor}`,
            );
          }
        }

        if (skipSampling || lineCount % factor === 1) {
          const cells = line.split(',').map((c) => c.trim());
          sampledTimestamps.push(cells[0]);

          for (let i = 1; i < cells.length; i++) {
            const value = Number(cells[i]);
            sampledFeatures[i - 1].push(isNaN(value) ? 0 : value);
          }
        }
      }

      lineCount++;
    });

    rl.on('close', () => {
      resolve({
        headers: headers.slice(1),
        sampledTimestamps,
        sampledFeatures,
      });
    });

    rl.on('error', (err) => reject(err));
  });
});

ipcMain.handle('load-image-base64', async (event, filePath) => {
  const data = await fs.readFile(filePath);
  const base64 = data.toString('base64');
  return `data:image/png;base64,${base64}`;
});
