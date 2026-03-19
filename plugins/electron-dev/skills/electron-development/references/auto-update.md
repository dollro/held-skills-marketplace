# Auto-Update System

## Update Server Setup

```javascript
// Using electron-updater with GitHub releases
const { autoUpdater } = require('electron-updater');

class UpdateManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    // Configure logging
    autoUpdater.logger = require('electron-log');
    autoUpdater.logger.transports.file.level = 'info';

    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    autoUpdater.on('checking-for-update', () => {
      this.sendStatus('checking');
    });

    autoUpdater.on('update-available', (info) => {
      this.sendStatus('available', info);

      // Optionally auto-download
      // autoUpdater.downloadUpdate();
    });

    autoUpdater.on('update-not-available', (info) => {
      this.sendStatus('not-available', info);
    });

    autoUpdater.on('download-progress', (progress) => {
      this.sendStatus('downloading', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.sendStatus('downloaded', info);

      // Show notification
      new Notification({
        title: 'Update Ready',
        body: `Version ${info.version} is ready to install. Restart to update.`
      }).show();
    });

    autoUpdater.on('error', (error) => {
      this.sendStatus('error', { message: error.message });
    });
  }

  sendStatus(status, data = {}) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update:status', { status, ...data });
    }
  }

  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Update check failed:', error);
    }
  }

  async downloadUpdate() {
    try {
      await autoUpdater.downloadUpdate();
    } catch (error) {
      console.error('Update download failed:', error);
    }
  }

  quitAndInstall() {
    autoUpdater.quitAndInstall(false, true);
  }
}

// IPC handlers
ipcMain.handle('update:check', () => updateManager.checkForUpdates());
ipcMain.handle('update:download', () => updateManager.downloadUpdate());
ipcMain.handle('update:install', () => updateManager.quitAndInstall());
```

## Differential Updates

```javascript
// electron-builder.yml
publish:
  - provider: github
    owner: your-org
    repo: your-app
    releaseType: release

# Enable differential updates
nsis:
  differentialPackage: true

mac:
  # Enable code signing for auto-updates
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: entitlements.mac.plist
  entitlementsInherit: entitlements.mac.plist
```

## Rollback Mechanism

```javascript
// Store previous version for rollback
const Store = require('electron-store');
const store = new Store();

class VersionManager {
  savePreviousVersion() {
    const currentVersion = app.getVersion();
    const previousVersions = store.get('previousVersions', []);

    // Keep last 3 versions
    previousVersions.unshift(currentVersion);
    store.set('previousVersions', previousVersions.slice(0, 3));
  }

  getPreviousVersions() {
    return store.get('previousVersions', []);
  }

  // Manual rollback would require server-side support
  // or keeping old installers available
}

// Check for update issues on startup
app.on('ready', () => {
  const lastVersion = store.get('lastSuccessfulVersion');
  const currentVersion = app.getVersion();

  if (lastVersion && lastVersion !== currentVersion) {
    // New version, mark as pending validation
    store.set('pendingValidation', true);

    // If app crashes within first 5 minutes, consider rollback
    setTimeout(() => {
      store.set('pendingValidation', false);
      store.set('lastSuccessfulVersion', currentVersion);
    }, 5 * 60 * 1000);
  }
});
```
