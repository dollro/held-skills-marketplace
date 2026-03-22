# Layout Patterns: Flex vs Grid

Tool-agnostic decision guide for choosing between CSS Flexbox and CSS Grid.
Both Penpot and Tailwind implement these same concepts — learn the pattern here,
apply it with tool-specific APIs.

## Decision Matrix

| Scenario | Use | Why |
|-|-|-|
| Items in a single row or column | **Flex** | 1D flow — items size to their content |
| Equal-width columns (card grids, dashboards) | **Grid** with `1fr` tracks | Parent enforces equal sizing regardless of content |
| 2D page structure (sidebar + header + main) | **Grid** with mixed tracks | Row and column control simultaneously |
| Tags / chips that wrap naturally | **Flex** with `flex-wrap: wrap` | Content-driven reflow, no predefined columns |
| Card internals (title → text → button at bottom) | **Flex** `column` or **Grid** `auto / 1fr / auto` rows | See "Button Alignment" below |
| Items that must fill equal space regardless of content | **Grid** | Flex requires per-child `flex: 1`; grid does it from the parent |

**Rule of thumb:** If you're setting properties on *children* to fix layout problems, you probably want Grid (which controls layout from the *parent*).

## Pattern 1: Equal-Size Card Grid

### The problem with Flex

Three cards with different content lengths produce unequal widths in Flex:

```css
/* Flex — requires child-level fix */
.container { display: flex; gap: 1em; }
.card { flex: 1; }  /* flex-grow:1, flex-shrink:1, flex-basis:0 */
```

Every card needs `flex: 1` to share space equally. Forget one child, layout breaks.

### The Grid solution

```css
/* Grid — parent controls everything */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);  /* 3 equal columns */
  gap: 1em;
}
```

No child rules needed. Change `repeat(3, 1fr)` to `repeat(4, 1fr)` for 4 columns —
the children don't need to know.

**When to use:** Dashboard metric cards, product grids, feature comparison layouts,
any row of identically-sized containers.

## Pattern 2: Button Alignment (content + push-to-bottom)

Cards with a heading, variable-length text, and a button — buttons must align
across cards on the same baseline.

### Flex approach

```css
.card {
  display: flex;
  flex-direction: column;
}
.card p {  /* the variable-length text */
  flex-grow: 1;  /* stretches to fill remaining space */
}
/* Button stays at the bottom because text pushes it down */
```

Works well. Requires identifying *which child* should grow.

### Grid approach

```css
.card {
  display: grid;
  grid-template-rows: auto 1fr auto;
}
/* Row 1 (auto): heading — takes only what it needs
   Row 2 (1fr):  text   — fills remaining space
   Row 3 (auto): button — takes only what it needs */
```

No child-level rules. The row template declares the structure declaratively.

**When to use:** Any card or panel with a fixed header, flexible body, and fixed footer.
Also applies to page layouts: `auto` header, `1fr` main content, `auto` footer.

## Pattern 3: Responsive Wrap

### Flex wrap — for tag-like elements

```css
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}
```

Items wrap naturally when the container narrows. Each item sizes to its content.
Ideal for: tag lists, chip groups, breadcrumbs, toolbar buttons.

### Grid auto-fit — for structured responsive grids

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1em;
}
```

- Each column is at least 200px wide
- `1fr` lets columns grow to fill remaining space
- `auto-fit` packs as many columns as fit, wraps the rest to new rows

**Key difference:** Flex wrap produces *uneven* last rows (items keep their natural size).
Grid `auto-fit` produces *even* columns — last-row items stretch to match.

**When to use:** Product grids, image galleries, card layouts that must adapt from
4 columns on desktop to 1 column on mobile without media queries.

## Pattern 4: Nested Layouts (Grid + Flex)

Complex UIs combine both. The principle:

- **Grid** for the outer page/section structure (defines the spatial grid)
- **Flex** for inner component layout (content-driven flow within each cell)

```text
┌─ Grid (page) ──────────────────────────┐
│ ┌── sidebar ──┐ ┌── main ────────────┐ │
│ │ Flex column  │ │ Grid (card grid)   │ │
│ │  nav items   │ │ ┌────┐ ┌────┐     │ │
│ │  ↕ flow      │ │ │Flex│ │Flex│     │ │
│ │              │ │ │col │ │col │     │ │
│ └──────────────┘ │ └────┘ └────┘     │ │
│                  └───────────────────┘ │
└────────────────────────────────────────┘
```

- Page layout: Grid (`fixed 240px` sidebar + `1fr` main)
- Sidebar navigation: Flex column (items flow vertically)
- Main content area: Grid (`repeat(auto-fit, minmax(280px, 1fr))`)
- Each card: Flex column (title → text → button)

## Pattern 5: Fluid Design Without Media Queries

Modern layout avoids fixed breakpoints. Instead of designing for specific device widths,
design *rules* that adapt fluidly:

- `1fr` tracks share space proportionally at any width
- `auto-fit` / `auto-fill` with `minmax()` reflow columns automatically
- `min()` / `max()` / `clamp()` constrain elements without breakpoints
- `flex-wrap` lets content decide when to wrap

```css
/* Fluid card grid — no breakpoints needed */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: 1.5em;
}
/* min(280px, 100%) prevents overflow on very narrow screens */
```

**When to use:** Prefer this approach by default. Only add explicit breakpoints when
the design requires fundamentally different layouts (e.g., switching from tabs to
a sidebar at a certain width), not just reflowing the same content.

## Constraints: Max/Min Sizing

For responsive elements that should grow but not indefinitely:

```css
.card {
  width: 100%;       /* fill available space */
  max-width: 400px;  /* but never wider than this */
  min-width: 200px;  /* and never narrower than this */
}
```

Use on flex/grid children to prevent elements from becoming too large on wide
screens or too small on narrow ones. Especially useful for:
- Cards that should fill mobile but cap at a readable width on desktop
- Images that should scale but maintain minimum quality
- Input fields that need a readable minimum width

## Quick Reference: Flex vs Grid Properties

| Concept | Flex | Grid |
|-|-|-|
| Direction | `flex-direction: row/column` | `grid-template-columns` / `grid-template-rows` |
| Equal sizing | `flex: 1` on each child | `repeat(N, 1fr)` on parent |
| Gap | `gap` | `gap`, `row-gap`, `column-gap` |
| Wrap | `flex-wrap: wrap` | `repeat(auto-fit, minmax(…, 1fr))` |
| Alignment | `align-items`, `justify-content` | `align-items`, `justify-content`, `place-items` |
| Child sizing | `flex-grow`, `flex-shrink`, `flex-basis` | track definitions (`auto`, `1fr`, `fixed`) |
| Spanning | N/A | `grid-column: span 2`, `grid-row: span 2` |
| Control locus | Mixed (parent + children) | Primarily parent |
