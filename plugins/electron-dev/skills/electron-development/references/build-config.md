# Build Configuration

## Multi-Platform Builds

```yaml
# electron-builder.yml
appId: com.yourcompany.yourapp
productName: YourApp
copyright: Copyright 2024 Your Company

directories:
  buildResources: build
  output: dist

files:
  - "**/*"
  - "!**/*.{md,txt,map}"
  - "!**/node_modules/*/{test,__tests__,tests}/**"
  - "!**/node_modules/.cache/**"

mac:
  category: public.app-category.productivity
  icon: build/icon.icns
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  target:
    - target: dmg
      arch: [universal]
    - target: zip
      arch: [universal]

win:
  icon: build/icon.ico
  target:
    - target: nsis
      arch: [x64, arm64]
    - target: portable
      arch: [x64]

linux:
  icon: build/icons
  category: Utility
  target:
    - target: AppImage
      arch: [x64, arm64]
    - target: deb
      arch: [x64]
    - target: rpm
      arch: [x64]

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  installerIcon: build/icon.ico
  uninstallerIcon: build/icon.ico
  license: LICENSE

dmg:
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications

publish:
  - provider: github
    releaseType: release
```

## Native Dependency Handling

```javascript
// postinstall script for native modules
// scripts/postinstall.js
const { execSync } = require('child_process');
const path = require('path');

const electronVersion = require('electron/package.json').version;

// Rebuild native modules for Electron
console.log(`Rebuilding native modules for Electron ${electronVersion}...`);

execSync(
  `npx electron-rebuild -v ${electronVersion} -m ${path.resolve(__dirname, '..')}`,
  { stdio: 'inherit' }
);

console.log('Native modules rebuilt successfully');
```

## CI/CD Integration

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: macos-latest
            platform: mac
          - os: ubuntu-latest
            platform: linux
          - os: windows-latest
            platform: win

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      # macOS signing
      - name: Import Code Signing Certificate (macOS)
        if: matrix.platform == 'mac'
        env:
          MACOS_CERTIFICATE: ${{ secrets.MACOS_CERTIFICATE }}
          MACOS_CERTIFICATE_PWD: ${{ secrets.MACOS_CERTIFICATE_PWD }}
        run: |
          echo $MACOS_CERTIFICATE | base64 --decode > certificate.p12
          security create-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P $MACOS_CERTIFICATE_PWD -T /usr/bin/codesign
          security set-key-partition-list -S apple-tool:,apple: -k "" build.keychain

      # Build Electron app
      - name: Build Electron
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
        run: npm run electron:build -- --${{ matrix.platform }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.platform }}-build
          path: dist/*
```
