# Workflow Reference

Detailed procedure for each step of the parity loop. Read this when the main SKILL.md summary isn't enough.

## Stabilization — the most important section

The #1 cause of flaky design-parity loops is environmental noise mistaken for design drift. Every screenshot — both target and impl — must pass through identical stabilization, or you'll chase ghosts forever.

### Required stabilization steps

```js
// In screenshot.mjs, these are all applied by default:

// 1. Lock viewport exactly
await page.setViewportSize({ width: 1440, height: 900 });

// 2. Disable animations and transitions
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      scroll-behavior: auto !important;
    }
  `
});

// 3. Wait for network idle (not just load)
await page.goto(url, { waitUntil: 'networkidle' });

// 4. Wait for web fonts to load
await page.evaluate(() => document.fonts.ready);

// 5. Scroll through the page to trigger lazy-loaded images,
//    then scroll back to top and wait for settle
await page.evaluate(async () => {
  const height = document.body.scrollHeight;
  for (let y = 0; y < height; y += window.innerHeight) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 100));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(500);

// 6. Mask dynamic regions
await page.evaluate((selectors) => {
  for (const sel of selectors) {
    document.querySelectorAll(sel).forEach(el => {
      el.style.visibility = 'hidden';
    });
  }
}, ['[data-timestamp]', '.live-counter', '.carousel-indicator']);
```

### DPR consistency

Use DPR=1 for all screenshots unless targeting retina specifically. If the target HTML was exported at DPR=1 and impl is captured at DPR=2, every text pixel will differ.

```js
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
```

### Font loading

Web fonts are the #1 cause of "why does the text area have tons of red pixels in the diff." If the target uses Inter loaded from Google Fonts and the impl uses the system font while fonts are loading, the whole typography diverges.

Make sure:
- Both target and impl load the same font files
- `document.fonts.ready` is awaited before screenshot
- No `font-display: swap` flashing — use `font-display: block` or preload

## Route mapping

When the target exports are filenames and the impl is a set of routes, you need a mapping. Ask the user once, save to `.parity/routes.json`:

```json
{
  "dashboard": {
    "target": "targets/dashboard.html",
    "url": "http://localhost:3000/dashboard",
    "auth": "authenticated"
  },
  "settings": {
    "target": "targets/settings-page.html",
    "url": "http://localhost:3000/settings"
  }
}
```

For authenticated routes, handle auth once at the start:

```bash
node scripts/screenshot.mjs --auth-setup --url http://localhost:3000/login
# opens a visible browser so user can log in, saves storageState to .parity/auth.json
```

Then pass `--storage-state .parity/auth.json` to subsequent screenshot calls.

## When the target is a PNG, not HTML

If the user only has PNG exports from Claude Design:

1. Read the PNG dimensions. Do they match a standard viewport (1440x900, 1920x1080, 390x844, 414x896)?
2. If yes: set impl viewport to match, proceed.
3. If no: ask the user what viewport the PNG was rendered at. Do NOT resize.

The reason: resizing always introduces interpolation artifacts that the diff will flag. Better to match the source than fight the math.

## Extracting computed styles for precise deltas

When the rubric says "use computed styles for exact values," use this helper in `screenshot.mjs`:

```js
// scripts/screenshot.mjs --extract-styles "h1,h2,.btn-primary"
const styles = await page.evaluate((selectors) => {
  const results = {};
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const cs = getComputedStyle(el);
    results[sel] = {
      fontFamily: cs.fontFamily,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      borderRadius: cs.borderRadius,
      padding: cs.padding,
      margin: cs.margin,
      boxShadow: cs.boxShadow,
    };
  }
  return results;
}, selectors.split(','));
```

Run this for both target and impl. Write to `.parity/<screen>/target_styles.json` and `.parity/<screen>/impl_styles.json`. Diff them programmatically — this gives exact deltas that vision can only approximate.

## Batching fixes

Don't re-screenshot after every single fix — it's slow and obscures which fixes worked. Batch fixes by:

- **Category**: all typography fixes, then all color fixes
- **File**: all fixes in `Button.tsx`, then all fixes in `Card.tsx`
- **Severity**: all blockers, then all majors

Re-screenshot after each batch completes. This keeps the iteration count meaningful and the diff progression legible.

## Convergence criteria (full)

A screen is considered converged when ALL of:

- `diffPercentage < 0.5%`
- Zero `blocker` deltas
- Zero `major` deltas
- User has not flagged any `minor` or `cosmetic` deltas as blocking

"Converged" does not mean "identical." Pursuing identical with an AI vision loop is a trap — diminishing returns kick in hard below 0.1%. The goal is "a designer reviewing this would say 'ship it.'"

## When to stop and ask the user

Stop and ask before:
- Making structural changes (adding/removing components)
- Changing framework-level choices (switching from CSS Modules to Tailwind, etc.)
- Modifying shared design tokens that affect other screens not in the parity run
- After 5 iterations without convergence
- When the fix would require backend/API changes

The skill's autonomy extends to CSS and layout fixes. It does not extend to architectural decisions.
