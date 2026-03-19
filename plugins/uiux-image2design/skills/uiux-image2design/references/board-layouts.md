# Board Layouts Reference

Standard page structure, board dimensions, and positioning conventions for the
uiux-image2design workflow.

## Page Structure

The plugin creates three pages in the Penpot file:

```
📄 Design System
  ├── 🎨 Colors          (token swatches)
  ├── 🔤 Typography       (text style samples)
  ├── ⬜ Spacing          (spacing blocks)
  ├── ⬜ Border Radius    (radius samples)
  └── 🔲 Shadows          (elevation samples)

📄 Components
  ├── 🔘 Buttons          (all variants × states)
  ├── 📝 Form Inputs      (text, select, checkbox, toggle, radio)
  ├── 🃏 Cards            (content card, metric card, etc.)
  ├── 🧭 Navigation       (top bar, sidebar, bottom nav)
  └── 📦 [Dynamic]        (any additional from Confirmed Spec)

📄 Sample Screen
  └── 📱 Home Screen      (or primary screen from screenshots)
```

## Board Positioning

### Horizontal Flow

Boards on the same page are laid out left-to-right with consistent gaps.

```
┌──────────┐  100px  ┌──────────┐  100px  ┌──────────┐
│  Colors  │ ◄─────► │ Typo     │ ◄─────► │ Spacing  │
│          │  gap    │          │  gap    │          │
└──────────┘         └──────────┘         └──────────┘
     x=0                x=W₁+100            x=W₁+W₂+200
```

- **Same-page gap:** 100px between related boards
- **All boards aligned at y=0** (top-aligned)
- **Always calculate position** from existing boards — never hardcode x positions

### Page Navigation

```javascript
// Check if page exists, create if not
let page = penpot.currentFile.pages?.find(p => p.name === 'Design System');
if (!page) {
  page = penpot.createPage();
  page.name = 'Design System';
}
penpot.openPage(page);
```

## Design System Board Dimensions

| Board | Width | Height | Notes |
|-------|-------|--------|-------|
| Colors | 600–900px | Dynamic | Based on number of colors; ~100px per row of 6 swatches |
| Typography | 800px | Dynamic | ~60–80px per text style |
| Spacing | 600px | Dynamic | ~48px per spacing value |
| Border Radius | 600px | Dynamic | ~80px per radius value |
| Shadows | 600px | Dynamic | ~120px per elevation level |

### Colors Board Layout

```
┌──────────────────────────────────────────────────────┐
│ Colors                                               │  Board: 800 × dynamic
├──────────────────────────────────────────────────────┤
│                                                      │
│ PRIMITIVES                                           │  Section header
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │ 50 │ │100 │ │200 │ │300 │ │400 │ │500 │         │  Row 1: Neutral scale
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │600 │ │700 │ │800 │ │900 │ │950 │ │    │         │  Row 2: Neutral cont.
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│                                                      │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │ 50 │ │100 │ │200 │ │300 │ │400 │ │500 │         │  Primary scale
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│                                                      │
│ SEMANTIC                                             │  Section header
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │ BG │ │ BG │ │Text│ │Text│ │Bord│ │Actv│         │  Semantic colors
│ │Surf│ │Prim│ │Prim│ │ Sec│ │ Def│ │ Def│         │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│                                                      │
│ FEEDBACK                                             │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│ │Succ│ │Warn│ │Dang│ │Info│                         │  Feedback colors
│ └────┘ └────┘ └────┘ └────┘                        │
└──────────────────────────────────────────────────────┘

Swatch: 64×64px, 16px gap, 6 per row
Section header: 20px Inter Bold, 24px gap below
Board padding: 24px all sides
```

### Typography Board Layout

```
┌──────────────────────────────────────────────────────┐
│ Typography                                           │  Board: 800 × dynamic
├──────────────────────────────────────────────────────┤
│                                                      │
│ Display — Inter Bold / 48px / 1.25               │  Meta line (12px, gray)
│ Display Heading Text                                │  Sample (actual size)
│                                                      │  48px gap
│ H1 — Inter Bold / 36px / 1.25                    │
│ Heading Level One                                   │
│                                                      │
│ H2 — Inter Semibold / 24px / 1.25                │
│ Heading Level Two                                   │
│                                                      │
│ Body — Inter Regular / 16px / 1.5                │
│ Body text for main content areas and paragraphs.    │
│ This sample shows how running text appears at the   │
│ default body size.                                  │
│                                                      │
│ Caption — Inter Medium / 12px / 1.5 / UPPERCASE  │
│ CAPTION TEXT FOR LABELS AND METADATA                │
│                                                      │
└──────────────────────────────────────────────────────┘

Meta line: 12px Inter Regular, #9CA3AF
Sample text: actual font size/weight/color
Row gap: max(fontSize + 32, 48)px
Board padding: 32px all sides
```

## Component Board Dimensions

| Board | Width | Height | Notes |
|-------|-------|--------|-------|
| Buttons | 800–1000px | Dynamic | 4 states × N variants; ~80px per variant row |
| Form Inputs | 800px | Dynamic | 4 states × input types; ~120px per input type |
| Cards | 800px | Dynamic | Based on card count and size |
| Navigation | Device width | Component height | Varies by nav type |

### Component Board Layout Pattern

All component boards follow the same structure: **variant rows × state columns**.

```
┌────────────────────────────────────────────────────────────────────┐
│ Component Name                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│           DEFAULT      HOVER        ACTIVE       DISABLED         │  State headers
│                                                                    │
│ PRIMARY   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│           │ Button │  │ Button │  │ Button │  │ Button │         │  Variant row 1
│           └────────┘  └────────┘  └────────┘  └────────┘        │
│                                                                    │
│ SECONDARY ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│           │ Button │  │ Button │  │ Button │  │ Button │         │  Variant row 2
│           └────────┘  └────────┘  └────────┘  └────────┘        │
│                                                                    │
│ GHOST     ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│           │ Button │  │ Button │  │ Button │  │ Button │         │  Variant row 3
│           └────────┘  └────────┘  └────────┘  └────────┘        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Grid layout:
- Columns: variant label (120px fixed) + state columns (flex 1 each)
- Rows: header (32px fixed) + variant rows (auto height)
- Column gap: 16px
- Row gap: 24px
- Board padding: 24px
```

### Variant Label Column

Each row starts with a text label identifying the variant:

```
Variant labels: 12px Inter Semibold, UPPERCASE, #9CA3AF
Position: left-aligned in first grid column
Vertically centered with the component in that row
```

### State Column Headers

Top row contains state labels:

```
State headers: 12px Inter Semibold, UPPERCASE, #9CA3AF
Position: centered in each column
```

### Focus State

Focus state is typically shown as default + focus ring overlay rather than a separate column.
Create it as the default state with an additional border:

```javascript
// Focus state = default appearance + focus ring
const focusRing = penpot.createRectangle();
focusRing.resize(componentWidth + 4, componentHeight + 4);
focusRing.fills = [];
focusRing.strokes = [{
  strokeColor: '#3B82F6', strokeOpacity: 1,
  strokeWidth: 2, strokeStyle: 'solid', strokeAlignment: 'outer'
}];
focusRing.borderRadius = componentRadius + 2;
// Position centered around the default component
```

## Sample Screen Board Dimensions

| Target | Board Size | Notes |
|--------|-----------|-------|
| iPhone SE | 375 × 667 | Small mobile |
| iPhone 14 | 390 × 844 | Standard mobile |
| iPhone 14 Pro Max | 430 × 932 | Large mobile |
| Android standard | 360 × 800 | Common Android |
| iPad | 820 × 1180 | Tablet |
| Desktop | 1440 × 900 | Standard desktop |
| Desktop HD | 1920 × 1080 | Full HD desktop |

### Mobile Screen Structure

```
┌─────────────────────────┐
│ ▓▓ Status Bar (44px) ▓▓ │  Background matches nav or content
├─────────────────────────┤
│ Header (56px)           │  App name, back button, actions
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                         │
│ Content Area            │  Scrollable
│ Padding: 16px horiz     │
│                         │
│ ┌─────────────────────┐ │  Cards, lists, forms
│ │     Component       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │     Component       │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ Bottom Nav (84px)       │  Includes safe area (34px)
└─────────────────────────┘
```

### Desktop Dashboard Structure

```
┌──────────────────────────────────────────────────────┐
│ Top Bar (64px)                                       │
│ Logo        Search                       User Menu   │
├────────┬─────────────────────────────────────────────┤
│        │ Page Title + Actions                        │
│ Side   │─────────────────────────────────────────────│
│ bar    │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│        │ │Metric│ │Metric│ │Metric│ │Metric│        │  Metric cards row
│ 240px  │ └──────┘ └──────┘ └──────┘ └──────┘       │
│        │─────────────────────────────────────────────│
│ Nav    │ ┌────────────────────────┐ ┌──────────────┐│
│ items  │ │                        │ │              ││  Main content area
│        │ │  Primary Content       │ │  Side Panel  ││
│        │ │  (Chart, Table, etc.)  │ │              ││
│        │ │                        │ │              ││
│        │ └────────────────────────┘ └──────────────┘│
└────────┴─────────────────────────────────────────────┘
```

## Execution Sequence

### Recommended Board Creation Order

```
1. Switch to "Design System" page
   ├── Create Colors board           (1-2 execute_code calls)
   ├── Create Typography board       (1 call)
   ├── Create Spacing board          (1 call)
   ├── Create Border Radius board    (1 call)
   └── Create Shadows board          (1 call)

2. Switch to "Components" page
   ├── Create Button variants        (1 call per variant×state = ~12 calls)
   ├── Assemble Button board         (1 call)
   ├── Register Button components    (1 call)
   ├── Create Input variants         (similar pattern)
   ├── Create Toggle variants        (similar pattern)
   ├── Create Card variants          (similar pattern)
   ├── Create Navigation             (1-2 calls)
   └── Create any additional comps   (varies)

3. Switch to "Sample Screen" page
   ├── Create main board             (1 call)
   ├── Build layout structure        (1-2 calls)
   ├── Instantiate components        (1-2 calls)
   └── Apply content and final style (1-2 calls)
```

**Total estimated calls:** 25–40 `execute_code` calls for a typical design system
with 4 component types + sample screen.

### Visual Validation Points

Export and check at these milestones:

1. After Colors board → verify palette looks correct
2. After Typography board → verify font renders correctly
3. After first component type (Buttons) → verify style matches spec
4. After sample screen layout → verify before adding content
5. Final export of complete sample screen → final validation

Use `mcp__penpot__export_shape` with the board ID to get a PNG for inspection.

## Naming Conventions

### Page Names

```
Design System
Components
Sample Screen
```

### Board Names

```
Colors
Typography
Spacing
Border Radius
Shadows
Buttons
Form Inputs
Cards
Navigation
[Component Name]    (for additional detected components)
Home Screen         (or descriptive name for sample screen)
```

### Shape Names

Follow a consistent naming pattern within boards:

```
Buttons board:
  btn-primary-default
  btn-primary-hover
  btn-primary-active
  btn-primary-disabled
  btn-secondary-default
  ...

Form Inputs board:
  input-default
  input-focus
  input-error
  input-disabled
  select-default
  select-open
  checkbox-unchecked
  checkbox-checked
  toggle-off
  toggle-on

Cards board:
  card-content
  card-metric
  card-[type]

Navigation board:
  nav-top
  nav-bottom
  nav-sidebar
```

This consistent naming enables:
- Easy lookup via `penpotUtils.findShapes(s => s.name.startsWith('btn-'))`
- Component registration by name
- Future automation and scripting
