# Process Architecture

## Main Process Responsibilities

```javascript
// main.js - Main process setup
const { app, BrowserWindow, Menu, Tray, nativeTheme } = require('electron');

class MainProcess {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.isQuitting = false;
  }

  async initialize() {
    // Single instance lock
    const gotLock = app.requestSingleInstanceLock();
    if (!gotLock) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }
    });

    await app.whenReady();

    this.createWindow();
    this.createMenu();
    this.createTray();
    this.setupIPC();
    this.setupUpdater();

    // Handle app lifecycle
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1a1a' : '#ffffff',
      show: false, // Show when ready to prevent flash
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      }
    });

    // Restore window state
    this.restoreWindowState();

    // Show when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    // Save state on close
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow.hide();
      } else {
        this.saveWindowState();
      }
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
  }

  saveWindowState() {
    const bounds = this.mainWindow.getBounds();
    const isMaximized = this.mainWindow.isMaximized();
    store.set('windowState', { bounds, isMaximized });
  }

  restoreWindowState() {
    const state = store.get('windowState');
    if (state) {
      this.mainWindow.setBounds(state.bounds);
      if (state.isMaximized) {
        this.mainWindow.maximize();
      }
    }
  }
}

const mainProcess = new MainProcess();
mainProcess.initialize();
```

## Renderer Process Isolation

```javascript
// renderer.js - Runs in isolated context
// NO access to Node.js or Electron APIs directly

// Access only through exposed API
async function loadDocument(filePath) {
  try {
    const content = await window.electronAPI.readFile(filePath);
    renderDocument(content);
  } catch (error) {
    showError('Failed to load document', error.message);
  }
}

// Subscribe to main process events
window.electronAPI.onUpdateAvailable((info) => {
  showUpdateNotification(info.version);
});

// Cleanup on unload
window.addEventListener('unload', () => {
  window.electronAPI.removeUpdateListener();
});
```

## Worker Thread Utilization

For CPU-intensive tasks, use worker threads in main process:

```javascript
// main.js
const { Worker } = require('worker_threads');

class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workers = [];
    this.queue = [];

    for (let i = 0; i < poolSize; i++) {
      this.workers.push({
        worker: new Worker(workerScript),
        busy: false
      });
    }
  }

  execute(data) {
    return new Promise((resolve, reject) => {
      const availableWorker = this.workers.find(w => !w.busy);

      if (availableWorker) {
        this.runTask(availableWorker, data, resolve, reject);
      } else {
        this.queue.push({ data, resolve, reject });
      }
    });
  }

  runTask(workerInfo, data, resolve, reject) {
    workerInfo.busy = true;

    const handleMessage = (result) => {
      workerInfo.busy = false;
      workerInfo.worker.off('message', handleMessage);
      workerInfo.worker.off('error', handleError);
      resolve(result);
      this.processQueue();
    };

    const handleError = (error) => {
      workerInfo.busy = false;
      workerInfo.worker.off('message', handleMessage);
      workerInfo.worker.off('error', handleError);
      reject(error);
      this.processQueue();
    };

    workerInfo.worker.on('message', handleMessage);
    workerInfo.worker.on('error', handleError);
    workerInfo.worker.postMessage(data);
  }

  processQueue() {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(w => !w.busy);
    if (availableWorker) {
      const { data, resolve, reject } = this.queue.shift();
      this.runTask(availableWorker, data, resolve, reject);
    }
  }
}

// worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', (data) => {
  // CPU-intensive work here
  const result = processData(data);
  parentPort.postMessage(result);
});
```

## Memory Leak Prevention

```javascript
// Proper cleanup patterns
class ResourceManager {
  constructor() {
    this.subscriptions = [];
    this.timers = [];
    this.windows = new Set();
  }

  addSubscription(unsubscribeFn) {
    this.subscriptions.push(unsubscribeFn);
  }

  addTimer(timerId) {
    this.timers.push(timerId);
  }

  trackWindow(window) {
    this.windows.add(window);
    window.on('closed', () => {
      this.windows.delete(window);
    });
  }

  cleanup() {
    // Clear all subscriptions
    this.subscriptions.forEach(unsub => unsub());
    this.subscriptions = [];

    // Clear all timers
    this.timers.forEach(id => clearInterval(id));
    this.timers = [];

    // Close remaining windows
    this.windows.forEach(win => {
      if (!win.isDestroyed()) {
        win.destroy();
      }
    });
    this.windows.clear();
  }
}

// Usage
const resources = new ResourceManager();

// Track IPC listeners
const handler = (event, data) => processData(data);
ipcMain.on('channel', handler);
resources.addSubscription(() => ipcMain.removeListener('channel', handler));

// Track timers
const timerId = setInterval(checkForUpdates, 60000);
resources.addTimer(timerId);

// Cleanup on quit
app.on('will-quit', () => {
  resources.cleanup();
});
```
