const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess;
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    console.log('開發環境，載入本地伺服器');
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
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
