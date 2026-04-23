#!/usr/bin/env node
/**
 * screenshot.mjs — Stabilized Playwright screenshot helper for design-parity loop.
 *
 * Usage:
 *   node screenshot.mjs --url <url> --viewport WxH --out <path> [options]
 *
 * Options:
 *   --url <url>              Target URL (http://, https://, or file://)
 *   --viewport WxH           Viewport, e.g. 1440x900 (default)
 *   --dpr <n>                Device pixel ratio (default: 1)
 *   --out <path>             Output PNG path
 *   --wait-for <state>       load | domcontentloaded | networkidle (default: networkidle)
 *   --disable-animations     Inject CSS to freeze animations (default: true)
 *   --storage-state <path>   Load auth state JSON
 *   --auth-setup             Open visible browser for interactive login, save storageState
 *   --mask <selectors>       Comma-separated selectors to hide before screenshot
 *   --extract-styles <sels>  Extract computed styles for selectors, write <out>.styles.json
 *   --timeout <ms>           Navigation timeout (default: 30000)
 *   --full-page              Capture full page, not just viewport
 *
 * Exits 0 on success, 1 on failure. Writes screenshot to --out path.
 */

import { chromium } from 'playwright';
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const { values: args } = parseArgs({
  options: {
    url: { type: 'string' },
    viewport: { type: 'string', default: '1440x900' },
    dpr: { type: 'string', default: '1' },
    out: { type: 'string' },
    'wait-for': { type: 'string', default: 'networkidle' },
    'disable-animations': { type: 'boolean', default: true },
    'storage-state': { type: 'string' },
    'auth-setup': { type: 'boolean', default: false },
    mask: { type: 'string' },
    'extract-styles': { type: 'string' },
    timeout: { type: 'string', default: '30000' },
    'full-page': { type: 'boolean', default: false },
  },
});

if (!args.url) {
  console.error('Error: --url is required');
  process.exit(1);
}

if (!args['auth-setup'] && !args.out) {
  console.error('Error: --out is required (unless --auth-setup)');
  process.exit(1);
}

const [width, height] = args.viewport.split('x').map(Number);
const deviceScaleFactor = Number(args.dpr);
const timeout = Number(args.timeout);

async function main() {
  const browser = await chromium.launch({
    headless: !args['auth-setup'],
  });

  const contextOpts = {
    viewport: { width, height },
    deviceScaleFactor,
    reducedMotion: 'reduce',
  };

  if (args['storage-state']) {
    contextOpts.storageState = args['storage-state'];
  }

  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();

  // Auth setup mode — open visible browser, wait for user, save state
  if (args['auth-setup']) {
    await page.goto(args.url);
    console.log('Log in manually in the browser window, then press Enter here.');
    await new Promise(resolve => process.stdin.once('data', resolve));
    const authPath = '.parity/auth.json';
    await mkdir(dirname(authPath), { recursive: true });
    await context.storageState({ path: authPath });
    console.log(`Saved auth state to ${authPath}`);
    await browser.close();
    process.exit(0);
  }

  // ---- Stabilization pipeline ----

  // 1. Inject animation-disabling stylesheet BEFORE navigation
  //    so styles apply from the very first frame.
  if (args['disable-animations']) {
    await context.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
          scroll-behavior: auto !important;
        }
      `;
      // Insert as early as possible
      const insert = () => {
        if (document.head) document.head.appendChild(style);
        else requestAnimationFrame(insert);
      };
      insert();
    });
  }

  // 2. Navigate with appropriate wait state
  await page.goto(args.url, {
    waitUntil: args['wait-for'],
    timeout,
  });

  // 3. Wait for web fonts to fully load
  await page.evaluate(() => document.fonts.ready);

  // 4. Finish any running animations via Web Animations API
  await page.evaluate(() => {
    document.getAnimations().forEach(a => {
      try { a.finish(); } catch {}
    });
  });

  // 5. Trigger lazy-loaded content by scrolling through the page
  await page.evaluate(async () => {
    const h = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const step = window.innerHeight;
    for (let y = 0; y < h; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 80));
    }
    window.scrollTo(0, 0);
  });

  // 6. Settle
  await page.waitForTimeout(400);

  // 7. Hide masked regions
  if (args.mask) {
    const selectors = args.mask.split(',').map(s => s.trim()).filter(Boolean);
    await page.evaluate((sels) => {
      for (const sel of sels) {
        document.querySelectorAll(sel).forEach(el => {
          el.style.visibility = 'hidden';
        });
      }
    }, selectors);
  }

  // 8. Extract computed styles if requested
  if (args['extract-styles']) {
    const selectors = args['extract-styles'].split(',').map(s => s.trim()).filter(Boolean);
    const styles = await page.evaluate((sels) => {
      const out = {};
      for (const sel of sels) {
        const el = document.querySelector(sel);
        if (!el) { out[sel] = null; continue; }
        const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        out[sel] = {
          box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          borderRadius: cs.borderRadius,
          borderColor: cs.borderColor,
          borderWidth: cs.borderWidth,
          padding: cs.padding,
          margin: cs.margin,
          boxShadow: cs.boxShadow,
          display: cs.display,
          position: cs.position,
        };
      }
      return out;
    }, selectors);

    const stylesPath = args.out.replace(/\.png$/, '.styles.json');
    await mkdir(dirname(stylesPath), { recursive: true });
    await writeFile(stylesPath, JSON.stringify(styles, null, 2));
    console.log(`Styles written to ${stylesPath}`);
  }

  // 9. Screenshot
  await mkdir(dirname(args.out), { recursive: true });
  await page.screenshot({
    path: args.out,
    fullPage: args['full-page'],
    animations: 'disabled',
  });

  // 10. Emit metadata so diff can validate dimensions match
  const metaPath = args.out.replace(/\.png$/, '.meta.json');
  await writeFile(metaPath, JSON.stringify({
    url: args.url,
    viewport: { width, height },
    deviceScaleFactor,
    timestamp: new Date().toISOString(),
    fullPage: args['full-page'],
  }, null, 2));

  console.log(`Screenshot written to ${args.out}`);
  await browser.close();
}

main().catch(err => {
  console.error('Screenshot failed:', err.message);
  process.exit(1);
});
