# Performance Optimization

## Startup Time Optimization

```javascript
// 1. Defer non-critical initialization
const criticalInit = () => {
  // Only what's needed to show the window
  createWindow();
};

const deferredInit = () => {
  // Initialize after window is shown
  setupAnalytics();
  checkForUpdates();
  loadPlugins();
};

app.whenReady().then(async () => {
  criticalInit();

  // Defer non-critical work
  setTimeout(deferredInit, 1000);
});

// 2. Use v8 snapshots for faster startup
// In package.json build config:
{
  "build": {
    "electronCompile": true,
    "nodeGypRebuild": false
  }
}

// 3. Lazy load modules
let heavyModule;
function getHeavyModule() {
  if (!heavyModule) {
    heavyModule = require('heavy-module');
  }
  return heavyModule;
}

// 4. Preload critical assets
const preloadAssets = async () => {
  const critical = ['main.css', 'app.js', 'icons/logo.png'];
  await Promise.all(critical.map(asset =>
    fetch(asset).then(r => r.blob())
  ));
};
```

## Memory Management

```javascript
// Monitor memory usage
const v8 = require('v8');

function logMemoryUsage() {
  const heapStats = v8.getHeapStatistics();
  const used = process.memoryUsage();

  console.log('Memory Usage:', {
    heapUsed: `${Math.round(heapStats.used_heap_size / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(heapStats.total_heap_size / 1024 / 1024)}MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`
  });
}

// Run garbage collection when memory is high
function checkMemoryPressure() {
  const used = process.memoryUsage();
  const heapUsedMB = used.heapUsed / 1024 / 1024;

  if (heapUsedMB > 150) { // 150MB threshold
    if (global.gc) {
      global.gc();
    }
  }
}

setInterval(checkMemoryPressure, 30000);

// Enable GC access (run with --expose-gc flag)
// In package.json:
{
  "scripts": {
    "start": "electron --expose-gc ."
  }
}
```

## GPU Acceleration

```javascript
// Enable hardware acceleration
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

// Disable for problematic systems
if (store.get('disableHardwareAcceleration')) {
  app.disableHardwareAcceleration();
}

// Check GPU info
app.whenReady().then(() => {
  const gpuInfo = app.getGPUInfo('basic');
  gpuInfo.then(info => {
    console.log('GPU Info:', info);
  });
});

// Handle GPU process crash
app.on('gpu-process-crashed', (event, killed) => {
  console.error('GPU process crashed', { killed });

  // Offer to disable hardware acceleration
  dialog.showMessageBox({
    type: 'error',
    title: 'GPU Error',
    message: 'The graphics process crashed. Would you like to disable hardware acceleration?',
    buttons: ['Disable & Restart', 'Ignore']
  }).then(({ response }) => {
    if (response === 0) {
      store.set('disableHardwareAcceleration', true);
      app.relaunch();
      app.exit();
    }
  });
});
```
