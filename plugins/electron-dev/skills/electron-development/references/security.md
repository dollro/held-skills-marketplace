# Security Implementation

## Context Isolation (MANDATORY)

Context isolation ensures that preload scripts and Electron's internal logic run in a separate JavaScript context from the website loaded in the renderer.

```javascript
// main.js - Creating a secure BrowserWindow
const { BrowserWindow } = require('electron');

const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    // SECURITY: Must be enabled (default in Electron 12+)
    contextIsolation: true,

    // SECURITY: Must be disabled in renderer
    nodeIntegration: false,

    // SECURITY: Disable remote module
    enableRemoteModule: false,

    // SECURITY: Sandbox renderer processes
    sandbox: true,

    // Path to preload script
    preload: path.join(__dirname, 'preload.js'),

    // SECURITY: Enable web security
    webSecurity: true,

    // SECURITY: Disable webview tag unless needed
    webviewTag: false,
  }
});
```

## Preload Script API Exposure

Safely expose APIs to the renderer using contextBridge:

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Only expose specific, validated APIs
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations with validation
  readFile: (filePath) => {
    // Validate path before sending to main
    if (!isValidPath(filePath)) {
      throw new Error('Invalid file path');
    }
    return ipcRenderer.invoke('file:read', filePath);
  },

  // One-way communication
  sendNotification: (title, body) => {
    ipcRenderer.send('notification:show', { title, body });
  },

  // Two-way communication with response
  saveFile: (filePath, content) => {
    return ipcRenderer.invoke('file:save', filePath, content);
  },

  // Subscribe to events from main
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update:available', (event, info) => callback(info));
  },

  // Remove listeners
  removeUpdateListener: () => {
    ipcRenderer.removeAllListeners('update:available');
  }
});

// Path validation helper
function isValidPath(filePath) {
  // Prevent path traversal attacks
  const normalized = path.normalize(filePath);
  const allowedPaths = [app.getPath('documents'), app.getPath('downloads')];
  return allowedPaths.some(allowed => normalized.startsWith(allowed));
}
```

## IPC Channel Validation

Secure IPC handling in the main process:

```javascript
// main.js
const { ipcMain, dialog, BrowserWindow } = require('electron');

// Define allowed channels
const ALLOWED_CHANNELS = new Set([
  'file:read',
  'file:save',
  'notification:show',
  'dialog:open',
]);

// Validate sender
function validateSender(event) {
  const senderFrame = event.senderFrame;
  const url = new URL(senderFrame.url);

  // Only accept from our app
  if (url.protocol !== 'file:' && url.protocol !== 'app:') {
    throw new Error('Invalid sender protocol');
  }

  return true;
}

// File read handler with validation
ipcMain.handle('file:read', async (event, filePath) => {
  validateSender(event);

  // Additional path validation
  const normalizedPath = path.normalize(filePath);
  if (normalizedPath.includes('..')) {
    throw new Error('Path traversal not allowed');
  }

  // Check file exists and is readable
  try {
    await fs.access(normalizedPath, fs.constants.R_OK);
    return await fs.readFile(normalizedPath, 'utf-8');
  } catch (error) {
    throw new Error(`Cannot read file: ${error.message}`);
  }
});

// File save handler
ipcMain.handle('file:save', async (event, filePath, content) => {
  validateSender(event);

  // Validate content size
  if (content.length > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Content too large');
  }

  // Use safe write with temp file
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, content);
  await fs.rename(tempPath, filePath);

  return { success: true };
});
```

## Content Security Policy

Configure strict CSP for renderer content:

```javascript
// main.js
const { session } = require('electron');

app.whenReady().then(() => {
  // Set CSP headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'", // Allow inline styles if needed
          "img-src 'self' data: https:",
          "font-src 'self'",
          "connect-src 'self' https://api.yourapp.com",
          "frame-src 'none'",
          "object-src 'none'",
          "base-uri 'self'",
        ].join('; ')
      }
    });
  });
});
```

## Secure Data Storage

```javascript
// Use electron-store with encryption for sensitive data
const Store = require('electron-store');
const { safeStorage } = require('electron');

// Encrypted store for sensitive data
class SecureStore {
  constructor() {
    this.store = new Store({
      name: 'secure-config',
      encryptionKey: 'your-encryption-key', // In production, derive from system
    });
  }

  // Store sensitive data using OS-level encryption
  async setSecure(key, value) {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value);
      this.store.set(key, encrypted.toString('base64'));
    } else {
      // Fallback with warning
      console.warn('OS encryption not available');
      this.store.set(key, value);
    }
  }

  async getSecure(key) {
    const value = this.store.get(key);
    if (!value) return null;

    if (safeStorage.isEncryptionAvailable()) {
      const buffer = Buffer.from(value, 'base64');
      return safeStorage.decryptString(buffer);
    }
    return value;
  }
}
```

## Certificate Pinning

```javascript
// main.js
const { session } = require('electron');

// Pin certificates for your API
const PINNED_CERTS = {
  'api.yourapp.com': [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Primary
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Backup
  ]
};

app.whenReady().then(() => {
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    const { hostname, certificate } = request;

    if (PINNED_CERTS[hostname]) {
      const certFingerprint = `sha256/${certificate.fingerprint}`;
      if (PINNED_CERTS[hostname].includes(certFingerprint)) {
        callback(0); // Certificate is trusted
      } else {
        callback(-2); // Certificate not trusted
      }
    } else {
      callback(-3); // Use default verification
    }
  });
});
```
