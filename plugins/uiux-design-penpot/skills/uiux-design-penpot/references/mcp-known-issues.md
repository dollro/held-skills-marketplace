# Penpot MCP Known Issues & Workarounds

> Documented API bugs, workarounds, and correct patterns for the Penpot MCP plugin.
> Updated: 2026-03-20. Some issues have branch fixes; others require upstream changes.

---

## Fix Status Key

| Status | Meaning |
|-|-|
| **FIXED** | Resolved in our branch |
| **PARTIAL** | Partially improved in our branch |
| **UPSTREAM** | Requires fix in Penpot core / plugin API |
| **BY DESIGN** | Correct API behavior — caller must adapt |

---

## Critical: Token API Argument Style — Version-Dependent

**Status: UPSTREAM**

> **WARNING:** The correct argument style (object vs positional) has **flipped between Penpot versions**.
> Do NOT assume either form works — test both at the start of every project.

The `penpot_api_info` tool documents TypeScript-style object signatures. In some Penpot versions the object form fails and positional works; in others the **opposite** is true — the object form returns a usable proxy with a valid ID while the positional form creates a ghost set that can't be found via `catalog.sets.find()`.

| Method | Object form | Positional form |
|-|-|-|
| `catalog.addSet` | `addSet({ name: "x" })` | `addSet("x")` |
| `set.addToken` | `addToken({ type: "color", name: "x", value: "#FFF" })` | `addToken("color", "x", "#FFF")` |
| `catalog.addTheme` | `addTheme({ group: "Mode", name: "Light" })` | `addTheme("Mode", "Light")` |

**Always test at project start:** Create a throwaway set with each form, read it back via `catalog.sets.find()`, and use whichever returns a valid proxy. Delete the test set afterward.

### catalog.sets Crash on Empty Catalog

```javascript
const catalog = penpot.library.local.tokens;

catalog.sets;
// CRASHES: "No protocol method ITokenSets.get-sets defined for type null:"
// Clojure protocol dispatch error — backend calls ITokenSets.get-sets on nil

// After creating any set:
catalog.addSet("anything");
catalog.sets; // NOW works, returns TokenSetProxy[]
```

**Workaround:** Always create at least one set before accessing `catalog.sets`.

### Duplicate Token Behavior

```javascript
primSet.addToken("color", "color.blue.500", "#2563EB"); // first call: returns proxy
primSet.addToken("color", "color.blue.500", "#FF0000"); // duplicate: returns undefined (silent)
// GUI shows "a token with the same name exists" but API swallows it
// Cannot distinguish duplicate from wrong-signature — both return undefined
```

### Token Types Confirmed Working

All 17 Penpot token types. `$type` must match these exact strings.

| TokenType string | Example value | Notes |
|-|-|-|
| `"borderRadius"` | `"8"` | String, not number |
| `"borderWidth"` | `"1"` | String, not number |
| `"color"` | `"#2563EB"` | Hex string with `#` |
| `"dimension"` | `"16"` | String, not number |
| `"fontFamilies"` | `"Inter"` | NOT `"fontFamily"` |
| `"fontSizes"` | `"16"` | NOT `"fontSize"` — string, not number |
| `"fontWeights"` | `"600"` | String, not number |
| `"letterSpacing"` | `"-0.025em"` | String with unit |
| `"number"` | `"1.5"` | Unitless numeric string |
| `"opacity"` | `"0.5"` | String 0-1 range |
| `"rotation"` | `"45"` | Degrees as string |
| `"shadow"` | `"0 4 6 -1 #0000001A"` | `offsetX offsetY blur spread color` |
| `"sizing"` | `"24"` | String, not number |
| `"spacing"` | `"{dimension.4}"` | Reference syntax `{...}` works |
| `"textCase"` | `"uppercase"` | Rarely used in primitives |
| `"textDecoration"` | `"underline"` | Rarely used in primitives |
| `"typography"` | — | Composite type, rarely used directly |

### Full Working Token Flow

```javascript
const catalog = penpot.library.local.tokens;

// 0. TEST which arg style works on this Penpot version
//    Try object form first (newer versions), fall back to positional
catalog.addSet({ name: "___test___" });
let testSet = catalog.sets.find(s => s.name === "___test___");
const useObjectArgs = !!testSet;
// Clean up test set, then proceed with the style that worked

// 1. Create set (ignore returned proxy — may be broken)
catalog.addSet("primitives"); // or addSet({ name: "primitives" })

// 2. Read back to get reliable proxy
const primSet = catalog.sets.find(s => s.name === "primitives");

// 3. Add tokens — use whichever arg style tested working
primSet.addToken("color", "color.blue.500", "#2563EB");
primSet.addToken("dimension", "dimension.4", "16");
primSet.addToken("borderRadius", "borderRadius.md", "8");
primSet.addToken("spacing", "spacing.md", "{dimension.4}"); // references work

// 4. Activate
if (!primSet.active) primSet.toggleActive();

// 5. Semantic set with references
catalog.addSet("semantic");
const semSet = catalog.sets.find(s => s.name === "semantic");
semSet.addToken("color", "bg.body", "{color.white}");
if (!semSet.active) semSet.toggleActive();

// 6. Themes
catalog.addTheme("Mode", "Light");
catalog.addTheme("Mode", "Dark");
```

---

## addSet() Returns Broken Proxy

**Status: PARTIAL (branch fix)**

```javascript
const newSet = catalog.addSet("primitives");

newSet.id;      // "" (empty string)
newSet.tokens;  // [] (always empty)
newSet.addToken("color", "test", "#FF0000"); // may fail

// Workaround — always read back:
const workingSet = catalog.sets.find(s => s.name === "primitives");
workingSet.id;  // "2cc8df8b-..." (valid UUID)
workingSet.addToken("color", "test", "#FF0000"); // works
```

**Root cause:** `addSet()` returns a proxy before the backend assigns the UUID. Branch fix gives the proxy a name-based fallback, but the read-back workaround remains the most reliable pattern.

---

## openPage() Context Switch

**Status: FIXED (branch)**

```javascript
// BEFORE FIX:
const foundationsPage = penpotUtils.getPageByName('foundations');
penpot.openPage(foundationsPage);
await new Promise(r => setTimeout(r, 1000));
penpot.currentPage.name; // STILL "cover" — didn't switch
const rect = penpot.createRectangle(); // lands on "cover", not target

// AFTER FIX:
penpot.openPage(foundationsPage);
// No await needed — context switches synchronously
penpot.currentPage.name; // "foundations" ✓
const rect = penpot.createRectangle(); // lands on correct page ✓

// Full workflow:
const newPage = penpot.createPage();
newPage.name = 'my-page';
penpot.openPage(newPage);
penpot.currentPage.id === newPage.id; // true ✓
```

**Root cause:** `openPage()` navigated the UI viewport but the plugin execution context was not updated. Branch fix: synchronous `UpdateEvent` for `:current-page-id`.

**Note:** If running on upstream Penpot without this fix, cross-page workflows require manual page switches by the user.

---

## createText('') Returns Null

**Status: UPSTREAM**

```javascript
penpot.createText('');    // null
penpot.createText('  ');  // valid Text (spaces work)
penpot.createText('x');   // valid Text

// Dangerous cascading failure:
const text = penpot.createText(''); // null
text.fontFamily = 'Inter';         // CRASH: "Cannot set properties of null"
```

**Defensive pattern:**

```javascript
function safeText(content, opts) {
  if (!content || content.trim() === '') return null;
  const t = penpot.createText(content);
  if (!t) return null;
  if (opts.fontFamily) t.fontFamily = opts.fontFamily;
  if (opts.fontSize) t.fontSize = opts.fontSize;
  if (opts.fontWeight) t.fontWeight = opts.fontWeight;
  if (opts.fills) t.fills = opts.fills;
  t.growType = opts.growType || 'auto-width';
  return t;
}
```

---

## Component Naming Issues

**Status: UPSTREAM**

### Slash Normalization

```javascript
board.name = 'atoms/button/primary';
board.name; // "atoms / button / primary" (spaces injected around slashes)
```

### createComponent Doubles the Name

```javascript
shape.name = 'atoms / button / primary / default';
penpot.library.local.createComponent([shape]);
comp.mainInstance().name;
// "atoms / button / primary / atoms / button / primary / default" — DOUBLED
```

### comp.name Returns Leaf Only

```javascript
comp.name;               // "default"
comp.mainInstance().name; // "atoms / button / primary / default"
```

### Post-Registration Fix Pattern

```javascript
function registerAndFixComponents(root, prefix) {
  const shapes = penpotUtils.findShapes(
    s => s.name.includes(prefix) && s.type === 'board', root
  );
  for (const shape of shapes) {
    try { penpot.library.local.createComponent([shape]); } catch(e) {}
  }
  for (const comp of penpot.library.local.components) {
    const main = comp.mainInstance();
    if (!main) continue;
    const name = main.name;
    const lastIdx = name.lastIndexOf(prefix);
    if (lastIdx > 0) main.name = name.substring(lastIdx);
  }
}
```

### Fuzzy Name Matching (Required Due to Slash Normalization)

```javascript
// FAILS:
penpotUtils.findShape(s => s.name === 'atoms/button', root);

// WORKS:
penpotUtils.findShape(s => s.name.includes('atoms') && s.name.includes('button'), root);
```

---

## Absolute vs Relative Positioning — Children Outside Board Bounds

**Status: BY DESIGN**

After `board.appendChild(child)`, setting `child.x = 32` uses **absolute page coordinates**, not board-relative coordinates. If the board is positioned at x=1000, the child ends up at page x=32 — roughly 1000px to the left of its parent, invisible.

```javascript
// WRONG — absolute coordinates, child appears outside board:
board.appendChild(child);
child.x = 32;   // page-absolute → child is at page x=32, not board x=32
child.y = 100;

// CORRECT — relative positioning via utility:
board.appendChild(child);
penpotUtils.setParentXY(child, 32, 100);  // positions relative to parent board

// BEST — use flex/grid layouts (never has this issue):
board.addFlexLayout();
board.appendChild(child);  // layout handles positioning automatically
```

### Recursive Fix for Nested Boards

The first positioning fix may only correct direct children of top-level boards. Nested boards (e.g., input fields inside an inputs board) have their own misplaced children. A recursive fix is required:

```javascript
function fixBoard(board) {
  for (const child of board.children || []) {
    // Re-apply relative positioning
    const relX = child.x - board.x;
    const relY = child.y - board.y;
    penpotUtils.setParentXY(child, relX, relY);
    // Recurse into nested boards
    if (child.type === 'board' && child.children?.length) {
      fixBoard(child);
    }
  }
}
```

**Best practice:** Use flex/grid layouts wherever possible — they handle positioning automatically and never exhibit this issue. Only use manual positioning for absolute-positioned overlays (e.g., badges, tooltips).

---

## layoutChild Null Before Parenting

**Status: BY DESIGN**

```javascript
const parent = penpot.createBoard();
parent.addFlexLayout();
const child = penpot.createRectangle();

// WRONG ORDER:
child.layoutChild.horizontalSizing = 'fix'; // CRASH — layoutChild is null

// CORRECT ORDER:
parent.appendChild(child);                   // FIRST — parent the child
child.layoutChild.horizontalSizing = 'fix';  // THEN — layoutChild exists
```

`layoutChild` only exists when the shape is inside a layout container. Always parent first.

---

## resize() Is a Method, Not a Property

```javascript
shape.resize = 80;              // CRASH — .resize is a method
shape.resize(80, 80);           // CORRECT

shape.width = 80;               // DOES NOT WORK — read-only
shape.resize(80, shape.height); // CORRECT way to set width only

shape.x = 100;                  // WORKS — writable
shape.parentX = 50;             // DOES NOT WORK — read-only
penpotUtils.setParentXY(shape, 50, 50); // CORRECT
```

---

## Orphaned Shapes After Crash

**Status: UPSTREAM**

When `execute_code` throws mid-execution, all shapes created before the error persist as root-level orphans.

```javascript
// After a crashed execution, clean up:
const orphans = penpot.root.children.filter(c =>
  !expectedBoardNames.some(n => c.name.includes(n))
);
for (const o of orphans) o.remove();
```

**Best practice:** Wrap complex multi-shape operations in a try/catch and clean up on failure. There is no transactional execution / rollback.

---

## WASM Renderer Crash on Bulk Font Changes + Page Switch

**Status: UPSTREAM**

Bulk `fontFamily` changes across multiple pages in a single `execute_code` call can crash the WASM renderer. The crash trace:

```
_set_shape_text_content → fonts_from_text_content → set_object → initialize_viewport
```

The crash occurs in the WASM text rendering pipeline when initializing the viewport after a page switch (`open-page-context` in the event trail). The renderer tries to resolve fonts for text content it can't handle after rapid `update-text-attrs` commits followed by page navigation.

**Note:** The `openPage()` branch fix makes this more reachable — `openPage` now works and triggers `initialize-viewport` with the new page's shapes, whereas before it silently did nothing.

**Data is safe** — WASM crashes are rendering-side only. Reload the file to verify.

**Workaround:** Don't combine bulk `fontFamily` changes across multiple pages in a single `execute_code` call. Split into one page per call:

```javascript
// WRONG — bulk font changes + page switch in one call:
for (const page of pages) {
  penpot.openPage(page);
  for (const text of getTexts(page)) {
    text.fontFamily = 'Inter';  // rapid update-text-attrs
  }
}

// CORRECT — one page per execute_code call:
// Call 1:
penpot.openPage(page1);
for (const text of getTexts(page1)) {
  text.fontFamily = 'Inter';
}
return { done: 'page1' }; // let renderer settle

// Call 2 (separate execute_code):
penpot.openPage(page2);
for (const text of getTexts(page2)) {
  text.fontFamily = 'Inter';
}
return { done: 'page2' };
```

---

## applyToken() Silent Failure with Explicit Properties

**Status: UPSTREAM**

`applyToken(token, properties)` silently fails for some token types when passing the `properties` argument explicitly. Confirmed with `fontFamilies` — may affect other types.

```javascript
// BROKEN — silent failure, token not bound:
shape.applyToken(token, 'fontFamilies');   // nothing happens
shape.applyToken(token, ['fontFamilies']); // nothing happens

// WORKS — omit properties, let Penpot use the default:
shape.applyToken(token);  // binds correctly
```

**Safe pattern:** Always try without explicit properties first. Only pass `'fill'` or `'strokeColor'` for color tokens where you need to disambiguate fill vs stroke. For all other token types (fontFamilies, fontSizes, fontWeights, borderRadius, shadow, spacing, sizing, etc.), **omit the properties argument**.

```javascript
// Color tokens — explicit property needed to disambiguate:
shape.applyToken(colorToken, 'fill');        // bind to fill
shape.applyToken(colorToken, 'strokeColor'); // bind to stroke

// All other token types — omit properties:
shape.applyToken(radiusToken);      // binds to borderRadius
shape.applyToken(shadowToken);      // binds to shadow
shape.applyToken(fontFamilyToken);  // binds to fontFamily
shape.applyToken(fontSizeToken);    // binds to fontSize
shape.applyToken(spacingToken);     // binds to spacing/sizing
```

**Reminder:** `applyToken()` is a **toggle** — calling it on a shape that already has the same token bound will **unbind** it. Always check `shape.tokens` before applying.

---

## Quick Reference: Common Pitfalls

| Pitfall | Correct Pattern |
|-|-|
| `applyToken` with explicit properties | Omit properties for non-color tokens — explicit args silently fail for some types. Only use `'fill'`/`'strokeColor'` for color tokens |
| Assuming token API arg style | Test both object and positional forms at project start — behavior is version-dependent |
| Using `addSet()` return value | Read back: `catalog.sets.find(s => s.name === "x")` |
| `catalog.sets` on empty file | Create any set first, then access `.sets` |
| Exact name match after slash | Use `.includes()` — slashes get normalized with spaces |
| `createText('')` | Guard: check content non-empty before calling |
| `layoutChild` before parenting | Always `parent.appendChild(child)` first |
| Setting `width`/`height` | Use `shape.resize(w, h)` |
| `child.x = N` inside board | Use `penpotUtils.setParentXY(child, relX, relY)` — `.x`/`.y` are page-absolute |
| Fixing only top-level children | Use recursive `fixBoard()` — nested boards have the same issue |
| Cross-page shape creation | Use `penpot.openPage(targetPage)` first (requires branch fix) |
| Reading props after toggle | Split into separate `execute_code` calls |
| Bulk font changes + page switch | One page per `execute_code` call — WASM renderer crashes on rapid `update-text-attrs` + `initialize-viewport` |
