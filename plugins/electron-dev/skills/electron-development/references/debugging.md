# Debugging and Diagnostics

## DevTools Integration

```javascript
// Toggle DevTools based on environment
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools({ mode: 'detach' });
}

// Add DevTools extension
const { session } = require('electron');

app.whenReady().then(async () => {
  // Install React DevTools
  try {
    const reactDevToolsPath = path.join(
      os.homedir(),
      'Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi'
    );
    await session.defaultSession.loadExtension(reactDevToolsPath);
  } catch (error) {
    console.log('React DevTools not found');
  }
});

// Custom DevTools menu item
{
  label: 'Developer',
  submenu: [
    {
      label: 'Toggle DevTools',
      accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
      click: () => mainWindow.webContents.toggleDevTools()
    },
    {
      label: 'Open Process Manager',
      click: () => app.showProcessMonitor()
    }
  ]
}
```

## Crash Reporting

```javascript
const { crashReporter } = require('electron');

// Initialize crash reporter
crashReporter.start({
  productName: 'YourApp',
  companyName: 'YourCompany',
  submitURL: 'https://your-crash-server.com/submit',
  uploadToServer: true,
  extra: {
    version: app.getVersion(),
    platform: process.platform
  }
});

// Log crashes locally too
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);

  // Log to file
  const logPath = path.join(app.getPath('logs'), 'crash.log');
  fs.appendFileSync(logPath, `${new Date().toISOString()}: ${error.stack}\n`);

  // Show error dialog
  dialog.showErrorBox('Application Error', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});
```
