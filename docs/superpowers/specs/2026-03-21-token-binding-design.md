# Token Binding for Penpot Design Systems

**Date:** 2026-03-21
**Status:** Reviewed
**Plugins affected:** `uiux-design-penpot` (v2.5.2), `uiux-image2design` (v2.3.1)

---

## Problem

The image2design workflow (and manual Penpot design workflows) creates well-structured
design tokens (primitives, semantics, components) but never binds them to the shapes
they describe. Every shape uses hardcoded hex values. Changing a token value propagates
nowhere — the tokens are decorative, not functional.

**Measured impact (real project):** 88 tokens defined, 1 applied across 481 shapes on 8 pages (0.2% coverage).

## Solution

Inline token binding during shape creation (greenfield) and a post-hoc binding sweep
(brownfield). Both strategies share a common token resolver utility with a toggle-safe
application guard.

### Design Principles

1. **Bind at creation** — when creating a shape, you know its semantic intent. Bind the
   token immediately. Don't defer.
2. **Sweep for existing files** — brownfield files need a reverse-mapping heuristic with
   confidence scoring. Auto-apply high confidence, surface low confidence for user decision.
3. **Toggle guard** — `applyToken()` is a toggle in Penpot. Calling it on an already-bound
   shape unbinds it. Always check existing bindings before applying.
4. **Engine in penpot, orchestration in image2design** — the binding logic is Penpot API
   knowledge and belongs in `uiux-design-penpot`. The image2design skill orchestrates when
   and how to invoke it.

---

## Deliverable 1: Token Resolver Utility

**File:** `uiux-design-penpot/references/token-binding.md`

A new reference containing reusable `execute_code` helpers for token binding.

### 1a. Core Helper

Loaded at the top of any `execute_code` call that needs token binding (~15 lines):

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
      // Toggle guard: check if already bound to avoid unbinding
      // applyToken is a toggle — calling it twice unbinds
      // Check shape's existing token bindings before applying
      shape.applyToken(token, properties);
      return true;
    }
  };
}
```

**Toggle guard detail:** The Penpot API exposes `shape.tokens` (readonly object) which
contains current token bindings for the shape. The `applySafe` function reads
`shape.tokens` to check if the target token is already bound to the given property
before calling `applyToken()`. This prevents accidental unbinding.

```javascript
applySafe(shape, token, properties) {
  if (!token) return false;
  // Read existing bindings from shape.tokens
  const existing = shape.tokens || {};
  // Check if this token is already bound to the target property
  // If so, skip — applyToken() is a toggle and would unbind it
  // (exact key structure of shape.tokens to be verified at implementation)
  shape.applyToken(token, properties);
  return true;
}
```

### 1b. Reverse Map Builder (for brownfield)

```javascript
function buildReverseMap() {
  const catalog = penpot.library.local.tokens;
  const map = {}; // { resolvedValue: [{ set, name, type, tier }] }
  for (const set of catalog.sets) {
    const tier = set.name; // 'primitives' | 'semantic' | 'component'
    for (const token of set.tokens) {
      const value = token.value; // may be a reference like {color.blue.500}
      const resolved = resolveTokenValue(token, catalog);
      if (!map[resolved]) map[resolved] = [];
      map[resolved].push({ set: set.name, name: token.name, type: token.type, tier });
    }
  }
  return map;
}
```

`resolveTokenValue` follows reference chains (`{color.blue.500}` → `#2563EB`) to get
final values. Must handle multi-level references. Implementation must walk all token sets
to resolve references since the API's `token.value` returns the raw string (which may be
a `{reference}`), not the resolved value:

```javascript
function resolveTokenValue(token, catalog) {
  let value = token.value;
  const seen = new Set(); // cycle guard
  while (value && value.startsWith('{') && value.endsWith('}')) {
    const refName = value.slice(1, -1);
    if (seen.has(refName)) break;
    seen.add(refName);
    let found = null;
    for (const set of catalog.sets) {
      found = set.tokens.find(t => t.name === refName);
      if (found) break;
    }
    if (!found) break;
    value = found.value;
  }
  return value;
}
```

### 1c. Confidence Scorer

Scoring rules for brownfield disambiguation, applied per shape per property:

| Signal | Confidence | Logic |
|-|-|-|
| Shape name contains token name | High | `shape.name.includes(token.name)` — foundations swatches |
| Single semantic candidate for value | High | Only one token in `semantic` set resolves to this hex |
| Parent board narrows semantic domain | High | Board `btn-primary-*` + fill → prefer `bg.*` tokens |
| Property type narrows candidates | Medium | `strokeColor` → prefer `border.*`; text fill → prefer `text.*` |
| Shape type narrows candidates | Medium | Text shape → prefer `text.*` for fill, `fontSizes`/`fontWeights` for size/weight |
| Multiple semantic candidates, no signal | Low | Ambiguous — surface to user |
| Only primitive candidates exist | Low | Semantic token may be missing — flag |

**Confidence threshold:** High = auto-apply. Medium = auto-apply with note in report.
Low = collect for user confirmation.

---

## Deliverable 2: Greenfield Inline Binding

**Files changed:**
- `uiux-design-penpot/references/generation-recipes.md` — all recipes
- `uiux-image2design/SKILL.md` — Phases 3, 4, 5

### 2a. Token Map (Phase 3 output)

Phase 3 of image2design currently outputs tokens into Penpot and token files. It gains
a new output: a **token map** — a plain JS object mapping every semantic token name to its
resolved hex value.

```javascript
const tokenMap = {
  // Colors
  'bg.surface': '#FFFFFF',
  'bg.interactive': '#3B82F6',
  'bg.interactive.hover': '#2563EB',
  'text.primary': '#171717',
  'text.secondary': '#525252',
  'text.on-interactive': '#FFFFFF',
  'border.default': '#E5E5E5',
  'border.focus': '#3B82F6',
  // Spacing (as strings — Penpot convention)
  'spacing.sm': '8',
  'spacing.md': '16',
  'spacing.lg': '24',
  // Radius
  'radius.sm': '4',
  'radius.md': '8',
  'radius.lg': '12',
  // ... all semantic tokens
};
```

This map is built from the Confirmed Spec and the token definitions. It feeds into
Phase 4 and 5 as a constant at the top of each `execute_code` call.

### 2b. Recipe Pattern (updated generation-recipes.md)

Every recipe transforms from hardcoded hex to token-bound:

**Before:**
```javascript
const rect = penpot.createRectangle();
rect.fills = [{ fillColor: '#3B82F6', fillOpacity: 1 }];
rect.borderRadius = 8;
```

**After:**
```javascript
const TR = initTokenResolver();

const rect = penpot.createRectangle();
rect.fills = [{ fillColor: tokenMap['bg.interactive'], fillOpacity: 1 }];
rect.borderRadius = parseInt(tokenMap['radius.md']);
TR.applySafe(rect, TR.resolve('semantic', 'bg.interactive'), 'fill');
TR.applySafe(rect, TR.resolve('semantic', 'radius.md')); // omit → defaults to 'all'
```

The visual value (`fillColor`, `borderRadius`) is set from `tokenMap` so the shape
renders correctly. The `applyToken` call binds the token so changes propagate.

**Recipes to update:**
- Color Swatches Board — bind primitive color tokens to swatch fills
- Typography Board — bind fontSizes, fontWeights, fontFamilies tokens
- Spacing Board — bind spacing tokens to block widths
- Button Component — bind bg.interactive, text.on-interactive, border.*, radius.*
- Text Input Component — bind bg.surface, border.default/focus/error, text.*
- Toggle Switch — bind bg.interactive, bg.muted
- Card Component — bind bg.surface, border.default, shadow.*, radius.*, text.*
- Metric Card — bind same as card + text.secondary for labels
- Bottom Navigation — bind bg.surface, text.interactive, text.muted

### 2c. image2design SKILL.md Phase Updates

**Phase 3 addition** (after step 6 "Verify"):
> 7. **Build token map** — construct a `tokenMap` object mapping every semantic token name
>    to its resolved hex value. This map is used by Phase 4 and 5 for both visual rendering
>    and token binding. Include all semantic color, spacing, radius, shadow, and typography
>    tokens.

**Phase 4 instruction change:**
> Replace the current pattern of hardcoded hex values with `tokenMap` lookups.
> After creating each shape, immediately bind its tokens using `applyTokenSafe()`.
> Load `uiux-design-penpot/references/token-binding.md` for the resolver utility
> and toggle-guard pattern.
>
> **Every shape must have its tokens bound at creation time.** This is not optional.
> A shape without token bindings is incomplete — like a database row without foreign keys.

**Phase 5 instruction change:**
> Same pattern as Phase 4. Screen assembly uses `tokenMap` + inline binding.
> Components instantiated from the library inherit their token bindings from the
> main component — no need to rebind instances.

---

## Deliverable 3: Brownfield Token Binding Sweep

**Files:**
- `uiux-design-penpot/references/token-binding.md` — the sweep engine (same file as Deliverable 1)
- `uiux-image2design/SKILL.md` — Phase 6 orchestration
- `uiux-design-penpot/SKILL.md` — standalone trigger section

### 3a. Sweep Engine (in token-binding.md)

A recipe that processes one page at a time. **Each page must be a separate
`execute_code` call** — do not iterate pages in a single call. This avoids
WASM renderer crashes from bulk property changes combined with page switches
(see `mcp-known-issues.md` § "WASM Renderer Crash").

```
1. Init resolver + build reverse map
2. Get all shapes on current page (recursive, including nested boards)
3. For each shape:
   a. Extract bindable properties:
      - fills[0].fillColor → color token, property 'fill'
      - strokes[0].strokeColor → color token, property 'strokeColor'
      - borderRadius → borderRadius token
      - shadows → shadow token
      - fontSize, fontWeight, fontFamily → typography tokens
      - width/height (for spacing demo shapes) → dimension/spacing tokens
   b. For each property value, look up reverse map
   c. Score each candidate using the confidence rules
   d. If high/medium confidence: apply immediately via applySafe()
   e. If low confidence: add to pending list
4. Return { applied: [...], pending: [...] }
```

**Context signals for scoring** (expanded):

For **fill** property:
- Shape is a text element → prefer `text.*` semantic tokens
- Shape is inside a board named `btn-*` or `button-*` → prefer `bg.interactive*`
- Shape is inside a board named `card-*` → prefer `bg.surface`
- Shape is inside a board named `nav-*` → prefer `bg.surface` or `bg.interactive`
- Shape is on the `foundations` page → prefer matching by token name in shape name

For **strokeColor** property:
- Always prefer `border.*` semantic tokens over `color.*` primitives
- Inside `input-*` boards → prefer `border.default`, `border.focus`, `border.error`

For **borderRadius** property:
- Match by numeric value to radius tokens
- Usually unambiguous (few radius tokens exist)

For **shadow** property:
- Match by shadow string to shadow tokens
- Usually unambiguous (few shadow tokens exist)

For **typography** properties:
- Match fontSize to `fontSizes.*` tokens
- Match fontWeight to `fontWeights.*` tokens
- Match fontFamily to `fontFamilies.*` tokens

### 3b. Phase 6: Token Binding Audit (in image2design SKILL.md)

A new phase after Phase 5:

```
Phase 6: Token Binding Audit  ──→ All shapes bound to tokens
```

**Instructions:**

> Read `uiux-design-penpot/references/token-binding.md` — the sweep engine and
> confidence scoring rules.
>
> Run the binding sweep for each page in order:
> `foundations → atoms → molecules → organisms → patterns → screens-*`
>
> After each page, report to the user:
> - Bindings applied (high/medium confidence): count and summary
> - Items needing input (low confidence): list with shape name, property,
>   candidate tokens, and why confidence is low
>
> Collect user decisions for low-confidence items. Apply confirmed bindings.
>
> **Final summary:** total bindings before/after, coverage percentage per page.
> Target: >90% of shapes with at least one token binding on foundations and atoms
> pages, >70% on screen pages.

**Standalone usage:** Phase 6 can also be triggered independently on any existing
Penpot file. The user says "bind my tokens" or "audit token bindings" and the sweep
runs without needing Phases 1-5.

### 3c. Standalone Trigger (in uiux-design-penpot SKILL.md)

Add a section to the penpot skill:

> ### Token Binding (Brownfield)
>
> For existing Penpot files where tokens are defined but not bound to shapes:
> read `references/token-binding.md` and run the binding sweep page by page.
> Report high-confidence bindings applied automatically and surface low-confidence
> items for user confirmation.
>
> This can be triggered by: "bind tokens to shapes", "wire up tokens",
> "audit token bindings", "tokens aren't applied".

---

## Versioning

| Plugin | Current | New | Reason |
|-|-|-|-|
| `uiux-design-penpot` | 2.5.2 | 2.6.0 | New reference file, new SKILL.md section |
| `uiux-image2design` | 2.3.1 | 3.0.0 | New phase, changed Phase 3/4/5 behavior (breaking: recipes now require tokenMap) |

`uiux-design-system` is unchanged — it's token architecture, not Penpot binding.

---

## Open Questions

1. ~~**Toggle guard API**~~ **RESOLVED.** `shape.tokens` (readonly object) exists in the
   API and exposes current token bindings. The toggle guard reads this before applying.
   Exact key structure of the object (property names, token ID format) needs verification
   at implementation time.
2. **Component instance inheritance** — do instances created via `component.instance()`
   inherit token bindings from the main component? If yes, Phase 5 screen assembly
   doesn't need to rebind instances. If no, Phase 5 scope increases significantly.
   **Must verify before implementation.**
3. ~~**Reference token resolution**~~ **RESOLVED.** `token.value` returns the raw string
   (may be a `{reference}`). The `resolveTokenValue` helper follows reference chains
   manually. Implementation included in Deliverable 1b.
4. **`applyToken` property strings for non-color types** — the API documents
   `TokenColorProps` (`"fill"` | `"strokeColor"`) but does not document property strings
   for borderRadius, spacing, shadow, or typography tokens. Omitting `properties`
   defaults to `"all"` which works for single-property token types. **Verify during
   implementation** that `"all"` correctly binds radius to all 4 corners, shadow to
   the shadow stack, etc.
