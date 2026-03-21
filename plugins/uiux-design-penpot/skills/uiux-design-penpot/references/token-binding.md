# Token Binding — Penpot Implementation

Penpot-specific patterns for binding design tokens to shapes. Implements the
strategies defined in `uiux-design-system/references/token-binding-strategy.md`.

> **Key constraint:** `applyToken()` is a **toggle** in Penpot — calling it on an
> already-bound shape **unbinds** the token. Always check `shape.tokens` before applying.

---

## Token Resolver Utility

Reusable helper for `execute_code` calls. Paste at the top of any token-binding script.

```javascript
function initTokenResolver() {
  const catalog = penpot.library.local.tokens;
  const sets = catalog.sets;
  const _cache = {};
  return {
    resolve(setName, tokenName) {
      const key = setName + '/' + tokenName;
      if (_cache[key]) return _cache[key];
      const set = sets.find(s => s.name === setName);
      if (!set) return null;
      const token = set.tokens.find(t => t.name === tokenName);
      _cache[key] = token || null;
      return _cache[key];
    },
    applySafe(shape, token, properties) {
      if (!token) return false;
      // Toggle guard: applyToken() is a toggle — calling twice UNBINDS
      // Read shape.tokens to check if already bound before applying
      const existing = shape.tokens || {};
      // TODO: verify shape.tokens key structure at runtime, then add:
      //   const propKey = properties || 'all';
      //   if (existing[propKey]?.id === token.id) return false; // already bound
      // Until verified, this is safe for greenfield (first-time binding)
      // but risky for brownfield re-runs. For brownfield, verify manually.
      shape.applyToken(token, properties);
      return true;
    }
  };
}
```

---

## Greenfield Pattern — Inline Binding During Creation

When creating new shapes, set the visual property **and** bind the token in the same pass.

```javascript
// Before (hardcoded):
rect.fills = [{ fillColor: '#3B82F6', fillOpacity: 1 }];

// After (token-bound):
const TR = initTokenResolver();
rect.fills = [{ fillColor: tokenMap['bg.interactive'], fillOpacity: 1 }];
TR.applySafe(rect, TR.resolve('semantic', 'bg.interactive'), 'fill');
```

### Property Strings by Token Type

> **CRITICAL:** `applyToken(token, properties)` **silently fails** for some non-color
> token types when passing explicit properties. Only pass `'fill'` or `'strokeColor'`
> for color tokens. For ALL other types, **omit the properties argument entirely**.
> See `mcp-known-issues.md` § "applyToken() Silent Failure" for details.

| Token type | `properties` arg | Notes |
|-|-|-|
| Color (fill) | `'fill'` | Maps to `fillColor` of the FIRST fill |
| Color (stroke) | `'strokeColor'` | Maps to first stroke color |
| borderRadius | **omit** | Explicit arg may silently fail |
| shadow | **omit** | |
| spacing | **omit** | |
| sizing | **omit** | |
| fontFamilies | **omit** | Confirmed: explicit `'fontFamilies'` silently fails |
| fontSizes | **omit** | |
| fontWeights | **omit** | |
| All other types | **omit** | Safe default — let Penpot resolve the property |

---

## Brownfield Sweep Recipe

Sweep an existing page to bind tokens to shapes whose visual properties match token values.

> **One page per `execute_code` call.** WASM renderer crashes on bulk font changes
> combined with page switches. See `mcp-known-issues.md` for details.

```javascript
// --- Paste initTokenResolver() and extractBindableProps() above this line ---

// Reverse map: value → { setName, tokenName, property }
// Build from your token definitions or pass in as a parameter
const REVERSE_MAP = {
  '#3B82F6': { set: 'semantic', token: 'bg.interactive', prop: 'fill' },
  '#EF4444': { set: 'semantic', token: 'bg.danger', prop: 'fill' },
  '#1E293B': { set: 'semantic', token: 'fg.default', prop: 'fill' },
  '8':       { set: 'primitives', token: 'borderRadius.md', prop: undefined },
  // ... extend with all token values
};

const TR = initTokenResolver();
const shapes = penpot.currentPage.findShapes();
let bound = 0;
let skipped = 0;

for (const shape of shapes) {
  const props = extractBindableProps(shape);
  for (const [propKey, value] of Object.entries(props)) {
    const match = REVERSE_MAP[value];
    if (!match) continue;
    const token = TR.resolve(match.set, match.token);
    if (TR.applySafe(shape, token, match.prop)) {
      bound++;
    } else {
      skipped++;
    }
  }
}

return { bound, skipped, totalShapes: shapes.length };
```

---

## Property Extraction Helpers

```javascript
function extractBindableProps(shape) {
  const props = {};
  if (shape.fills?.length && shape.fills[0].fillColor)
    props.fill = shape.fills[0].fillColor;
  if (shape.strokes?.length && shape.strokes[0].strokeColor)
    props.strokeColor = shape.strokes[0].strokeColor;
  if (shape.borderRadius)
    props.borderRadius = String(shape.borderRadius);
  if (shape.shadows?.length)
    props.shadow = shape.shadows.map(s =>
      `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color?.color || ''}`
    ).join('; ');
  // Text properties
  if (shape.type === 'text') {
    if (shape.fontSize) props.fontSize = String(shape.fontSize);
    if (shape.fontWeight) props.fontWeight = String(shape.fontWeight);
    if (shape.fontFamily) props.fontFamily = shape.fontFamily;
  }
  return props;
}
```

---

## Penpot-Specific Gotchas

| Gotcha | Detail |
|-|-|
| `applyToken()` is a toggle | Calling it on an already-bound shape **unbinds** the token. Read `shape.tokens` first. |
| `shape.tokens` is readonly | Exposes current bindings as an object. Use it to check before calling `applyToken()`. |
| Arg style is version-dependent | Object vs positional form flips between Penpot versions. Test both at project start (see `mcp-known-issues.md`). |
| One page per sweep call | Bulk font changes + page switch in a single `execute_code` call crashes WASM renderer. |
| Slash normalization in names | `atoms/button` becomes `atoms / button`. Use `.includes()` for name matching, never exact equality. |
| Duplicate token names are silent | `addToken()` with an existing name returns `undefined` without error. |
| `catalog.sets` on empty catalog | Crashes. Create at least one set before accessing `.sets`. |
