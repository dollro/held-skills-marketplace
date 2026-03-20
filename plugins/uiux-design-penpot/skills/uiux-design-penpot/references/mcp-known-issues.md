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

## Critical: Token API Uses Positional Arguments

**Status: UPSTREAM**

The `penpot_api_info` tool documents TypeScript-style object signatures that **don't work**. The actual API uses positional arguments:

| Method | Documented (BROKEN) | Actual (WORKS) |
|-|-|-|
| `catalog.addSet` | `addSet({ name: string })` → `undefined` | `addSet("name")` → `TokenSetProxy` |
| `set.addToken` | `addToken({ type, name, value })` → `undefined` | `addToken("type", "name", "value")` → `TokenSetProxy` |
| `catalog.addTheme` | `addTheme({ group, name })` → `undefined` | `addTheme("group", "name")` → `TokenThemeProxy` |

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

// 1. Create set (ignore returned proxy — may be broken)
catalog.addSet("primitives");

// 2. Read back to get reliable proxy
const primSet = catalog.sets.find(s => s.name === "primitives");

// 3. Add tokens with POSITIONAL args
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

// 6. Themes (positional args)
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

## Quick Reference: Common Pitfalls

| Pitfall | Correct Pattern |
|-|-|
| Object args for token API | Use positional: `addSet("name")`, `addToken("type", "name", "value")` |
| Using `addSet()` return value | Read back: `catalog.sets.find(s => s.name === "x")` |
| `catalog.sets` on empty file | Create any set first, then access `.sets` |
| Exact name match after slash | Use `.includes()` — slashes get normalized with spaces |
| `createText('')` | Guard: check content non-empty before calling |
| `layoutChild` before parenting | Always `parent.appendChild(child)` first |
| Setting `width`/`height` | Use `shape.resize(w, h)` |
| Cross-page shape creation | Use `penpot.openPage(targetPage)` first (requires branch fix) |
| Reading props after toggle | Split into separate `execute_code` calls |
