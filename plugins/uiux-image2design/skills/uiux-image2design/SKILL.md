---
name: uiux-image2design
description: >
  Analyze UI screenshots, extract a full design system, and generate it in Penpot.
  ALWAYS use this skill when: (1) The user provides screenshots or UI images and wants a
  design system created from them, (2) The user wants to reverse-engineer a visual style
  into Penpot components, (3) The user says "create a design from these screenshots",
  "extract the style from this UI", "build a design system from these images", or similar.
  Trigger keywords: screenshots to design, extract design, reverse-engineer UI, design from
  images, screenshot analysis, visual reference to Penpot, image to design system.
---

# Image to Design

Analyze UI screenshots with Claude's vision, extract a design system, confirm it with the user, then generate everything in Penpot: tokens, design system boards, reusable components, and a sample application screen.

## Prerequisites

This skill **orchestrates** two existing skills and a running Penpot MCP server.
**All three must be verified before starting any work.**

### Step 0: Verify Dependencies (MANDATORY — run before Phase 1)

Run these checks in order. If any check fails, stop and help the user resolve it
before proceeding. Do NOT skip this step.

#### 0a. Verify `uiux-design-tokens` skill is installed

This skill provides token format, naming taxonomy, 3-tier hierarchy, and W3C DTCG spec.
It is needed in Phase 3 (Token Generation).

```
Look for the skill in the project's plugin directory. Common locations:
- plugins/uiux-design-tokens/skills/uiux-design-tokens/SKILL.md
- .claude/plugins/uiux-design-tokens/skills/uiux-design-tokens/SKILL.md

Try to read the SKILL.md file. If it exists, confirm:
  ✅ uiux-design-tokens skill found

If NOT found, tell the user:
  ❌ The uiux-design-tokens skill is not installed.
  This skill is required for Phase 3 (Token Generation).
  Please install it from: https://github.com/dollro/claude-marketplace
  (or wherever the user hosts their skills)
  Then re-run this check.
```

Also verify these reference files exist (needed during Phase 3):
- `references/dtcg-format.md` — W3C DTCG JSON format
- `references/starter-template.md` — token scaffolding
- `references/platform-mapping.md` — CSS/Tailwind output

#### 0b. Verify `uiux-design-penpot` skill is installed

This skill provides the Penpot MCP API reference, component creation patterns,
layout helpers, and accessibility guidelines. It is needed in Phase 4 and 5.

```
Look for the skill in the project's plugin directory. Common locations:
- plugins/uiux-design-penpot/skills/uiux-design-penpot/SKILL.md
- .claude/plugins/uiux-design-penpot/skills/uiux-design-penpot/SKILL.md

Try to read the SKILL.md file. If it exists, confirm:
  ✅ uiux-design-penpot skill found

If NOT found, tell the user:
  ❌ The uiux-design-penpot skill is not installed.
  This skill is required for Phase 4 (Board Generation) and Phase 5 (Sample Screen).
  Please install it from: https://github.com/dollro/claude-marketplace
  Then re-run this check.
```

Also verify these reference files exist (needed during Phase 4/5):
- `references/penpot-api-reference.md` — full Penpot Plugin API
- `references/component-patterns.md` — UI component specs
- `references/color-utilities.md` — OKLCH→hex, contrast checks
- `references/prototyping-interactions.md` — interaction patterns

#### 0c. Verify Penpot MCP server is connected

```
Call mcp__penpot__penpot_api_info to test connectivity.

If it succeeds:
  ✅ Penpot MCP server connected

If it fails, tell the user:
  ❌ The Penpot MCP server is not connected.
  Please ensure:
  1. The MCP server is running (check ports 4400, 4401, 4402)
  2. A Penpot design file is open (not just the dashboard)
  3. The Penpot MCP plugin is loaded and shows "Connected"

  For detailed setup instructions, see:
  uiux-design-penpot/references/setup-troubleshooting.md
```

#### 0d. Report Readiness

Once all checks pass, confirm to the user:

```
✅ All prerequisites verified:
  • uiux-design-tokens skill — installed
  • uiux-design-penpot skill — installed
  • Penpot MCP server — connected

Ready to analyze your screenshots. Please share the images.
```

If any check failed, summarize what's missing and what the user needs to do.
Do NOT proceed to Phase 1 until all three checks pass.

## The 5-Phase Workflow

```
Phase 1: Screenshot Analysis (vision)
   ↓
Phase 2: User Confirmation (interactive, per-category + drill-down)
   ↓
Phase 3: Token Generation (delegates to uiux-design-tokens)
   ↓
Phase 4: Board & Component Generation (Penpot MCP)
   ↓
Phase 5: Sample Screen Generation (Penpot MCP)
```

Each phase completes fully before the next begins. Never skip the confirmation phase.

---

## Phase 1: Screenshot Analysis

**Goal:** Extract a structured design inventory from the provided screenshots.

**Input:** One or more images (screenshots, UI mockups, Pinterest boards, Dribbble shots).

**Core Analysis Directive:**

When analyzing screenshots, internalize this prompt as your guiding instruction:

> Deeply analyze the design of the attached screenshot to create a design system layout
> of every UI component needed in a design system for a SaaS product service. Pay close
> attention to spacing, fonts, colors, design styles and design principles.

This directive (adapted from Sergei Chyrkov's Figma Make workflow) captures the right
mindset: you are not just *describing* what you see — you are *reverse-engineering* a
complete design system from the visual evidence. Every observation should feed into a
tokenizable, reproducible system.

Expand the directive with project-specific context when available. If the user has
described their product (e.g. "a fitness tracking app" or "a B2B analytics dashboard"),
append that context to sharpen the analysis. For example:

> Deeply analyze the design of the attached screenshots to create a design system layout
> of every UI component needed in a design system for **a B2B analytics dashboard**.
> Pay close attention to spacing, fonts, colors, design styles and design principles.
> **Also identify data visualization patterns, metric card layouts, and filter/control
> components specific to dashboard interfaces.**

**Process:** Use Claude's vision capabilities to systematically analyze every image.
Read `references/analysis-guide.md` for the detailed extraction methodology.

**Output:** A structured **Design Inventory** presented to the user. The inventory has these
sections, each populated only if evidence exists in the screenshots:

### Inventory Structure

```
## Design Inventory

### Initial Assessment
PLATFORM: [mobile/web/desktop]  DESIGN LANGUAGE: [material/iOS HIG/custom]
LAYOUT: [single-column/sidebar+content/dashboard grid]
DENSITY: [compact/comfortable/spacious]  COLOR MODE: [light/dark/mixed]

### 1. Color Palette
For each color found:
- Swatch preview (describe the color)
- Approximate hex value
- Where it appears (observed in: [specific element])
- Suggested token name following uiux-design-tokens naming
Organized by role: brand, neutral, semantic, accent

### 2. Typography
For each text style found:
- Font family with confidence level (high/medium/low)
- Approximate size in px (prefixed with ~)
- Weight (regular, medium, semibold, bold)
- Case treatment (normal, uppercase, capitalize)
- Letter spacing (tight, normal, wide)
- Where it appears (headings, body, captions, button labels, etc.)

### 3. Spacing
- Detected base unit (usually 4px or 8px)
- Spacing scale as multipliers of base unit
- Component padding patterns (buttons, cards, inputs)
- Gap patterns (between cards, between form fields, inline gaps)

### 4. Layout Structure
- Grid system (columns, gutters, margins)
- Section map with approximate dimensions
- Visual hierarchy (reading order: what draws the eye 1st, 2nd, 3rd)
- Alignment axes

### 5. Border Radius
For each distinct radius:
- Approximate value in px
- Where it appears (buttons, cards, inputs, avatars, etc.)

### 6. Shadows & Depth
- Depth strategy: borders-only / subtle-shadows / layered-shadows / surface-shifts
- Shadow levels with approximate values
- Border treatments
- Elevation map (which elements sit above which)

### 7. Component Inventory
Numbered list of every distinct UI component detected:
- Component name
- Detected variants (e.g. "Primary Button, Secondary Button, Ghost Button")
- Detected states (if visible — hover, active, disabled, etc.)
- Key visual characteristics and measurements

### 8. Iconography (if detected)
- Icon style (outlined, filled, duotone)
- Approximate icon size
- Icon set guess (if recognizable — Lucide, Heroicons, Material, etc.)

### 9. Additional Patterns
Anything else notable: gradients, glassmorphism, specific textures,
illustration style, image treatment, etc.

### 10. Known Gaps (MANDATORY)
- States not visible (hover, focus, disabled, error, loading, empty)
- Values that could not be determined from static screenshots
- Low-confidence extractions flagged for user review
- Suggested next steps to fill gaps
```

### Analysis Rules

- **Be specific with hex values.** Use your best judgment extracting colors from the image.
  Round to the nearest clean value when uncertain (e.g. `#1B3C2D` not `#1B3D2E`).
- **Don't invent what isn't visible.** If you can only see a button's default state, don't
  guess the hover state. Note it as "hover state not visible — will need to be defined."
- **Cross-reference multiple screenshots.** If the user provides several images, look for
  consistency. Note discrepancies (e.g. "Screenshot 1 uses 8px card radius, Screenshot 3
  uses 12px — please confirm which to use").
- **Identify the font, don't assume Inter.** Look at character shapes. If uncertain, say
  "appears to be a geometric sans-serif like Inter or Poppins" — let the user confirm.
- **Count components conservatively.** A card with an icon, title, and value is one "Metric
  Card" component, not three separate components. Group logically.

---

## Phase 2: User Confirmation

**Goal:** Get explicit approval on the inventory before generating anything.

**Interaction pattern:** Hybrid — present per-category, then drill into any category on request.

### Step 2a: Category-Level Confirmation

Present the full inventory from Phase 1, then ask the user to confirm at the category level:

```
Here's what I extracted from your screenshots. For each category, let me know:
- ✅ Looks good as-is
- ✏️ Needs adjustments (I'll ask for details)
- ❌ Skip this category
- ➕ Add something not in the screenshots

Categories:
1. Color Palette — [summary: X colors extracted, organized by role]
2. Typography — [summary: X text styles, font family (confidence level)]
3. Spacing — [summary: Xpx base unit, Y scale values]
4. Layout Structure — [summary: grid type, section count, hierarchy]
5. Border Radius — [summary: X distinct values]
6. Shadows & Depth — [summary: depth strategy, X elevation levels]
7. Components — [summary: X components detected, Y gaps flagged]
8. Iconography — [summary or "none detected"]
9. Additional Patterns — [summary or "none"]
10. Known Gaps — [summary: X items need decisions from you]
```

**The Gaps category (10) is special.** Don't ask the user to "confirm" gaps — instead,
present each gap as a decision to be made. For example:
- "Hover states aren't visible. I propose: 10% darker for hover, 20% darker for active. OK?"
- "Font family is uncertain (confidence: medium). Best guess: Inter. Confirm or suggest alternative?"
- "No error states visible for inputs. Standard pattern: red border + error text. OK?"

### Step 2b: Drill-Down on Adjusted Categories

For any category the user marks as "needs adjustments," present the individual elements
and ask for specific changes. Examples of adjustments the user might request:

**Colors:**
- "Make the accent color more saturated"
- "Add a secondary accent in orange"
- "The dark background should be pure black, not dark green"

**Typography:**
- "Use Geist instead of Inter"
- "All button labels should be uppercase"
- "Heading sizes are too large, scale everything down 20%"

**Components:**
- "Skip the bottom navigation"
- "Add a dropdown/select component — not in screenshots but I need it"
- "The toggle should have a third state (indeterminate)"
- "Add a modal/dialog component"

**Spacing:**
- "Use 4px base grid, not 8px"
- "Card padding should be 20px, not 16px"

**Layout:**
- "The sidebar should be 280px, not 240px"
- "I want a top nav instead of a sidebar"
- "The sample screen should be mobile (375×812), not desktop"

**Shadows & Depth:**
- "This should be borders-only, no shadows"
- "Make the card shadows more pronounced"
- "Add a shadow level for the modal overlay"

### Step 2c: Confirm Final Spec

After all adjustments, present a clean summary of the **Confirmed Spec** — the final set
of decisions that will drive generation. Ask for one final "go ahead" before proceeding.

```
## Confirmed Spec — Ready to Generate

### Colors: [X colors]
[table of final colors with hex, token name, usage]

### Typography: [X styles]
[table of final styles with family, size, weight, usage]

### Spacing: [base unit]px base
[table of key spacing values]

### Layout: [platform] [dimensions]
[section map, grid structure, target device size for sample screen]

### Depth Strategy: [borders-only / subtle-shadows / layered-shadows / surface-shifts]
[shadow levels and border treatments]

### Components to Generate: [X components]
[numbered list with variants and states]

### Resolved Gaps: [decisions made during confirmation]
[hover state rules, missing states filled, uncertain values confirmed]

### Token Output: [what files will be generated]
### Penpot Output: [what pages/boards will be created]

Shall I proceed with generation?
```

### Confirmation Rules

- **Never proceed without explicit confirmation.** The user must say yes/go/proceed.
- **Absorb all feedback before moving on.** If the user gives partial feedback, ask about
  the remaining categories before proceeding.
- **Be opinionated when asked.** If the user says "what do you think?" — give a
  recommendation based on the screenshots and design best practices. Don't just defer.
- **Fill in gaps proactively.** If hover states aren't visible in screenshots, propose
  sensible defaults (e.g. "10% darker for hover, 20% darker for active") and let the
  user confirm.

---

## Phase 3: Token Generation

**Goal:** Generate the design token set based on the Confirmed Spec.

**Delegation:** This phase is handled by the `uiux-design-tokens` skill.

### What to Do

**Load the skill files now** (paths were verified in Step 0):

1. **Read `uiux-design-tokens/SKILL.md`** — it defines the 3-tier hierarchy,
   naming taxonomy, and all conventions.
2. **Read `uiux-design-tokens/references/dtcg-format.md`** — for W3C DTCG JSON structure.
3. **Read `uiux-design-tokens/references/starter-template.md`** — as structural scaffolding,
   replacing all values with the Confirmed Spec values.
4. **Read `uiux-design-tokens/references/platform-mapping.md`** — for CSS/Tailwind output.

Do NOT rely on memory of these files from earlier conversations. Read them fresh every time
— the user may have updated them since the last run.

### Framework-Agnostic Principle

The token and Penpot output from this skill is **independent of any frontend framework**.
The design system lives in Penpot (visual) and token files (data) — it works whether the
user implements in Vue, React, Svelte, or plain HTML.

However, if the user has framework-specific skills installed (e.g. a Tailwind CSS v4 skill,
a Vue 3 skill), the `uiux-design-tokens` skill's `platform-mapping.md` already covers how
to output tokens to CSS custom properties and Tailwind `@theme` configuration. The agent
should mention this optionally — "I can also generate Tailwind v4 / CSS output if you
want to bridge to code" — but never make it a required step.

### Token Generation Steps

1. **Build Primitive tokens** — raw color scales, font stacks, spacing values, radius values,
   shadow definitions, motion values. Every raw value lives here.

2. **Build Semantic tokens** — map primitives to intent: `color.background.surface`,
   `color.interactive.default`, `color.text.primary`, `space.inline.md`, etc.
   Include accessibility tokens: `color.border.focus-ring`, `size.touch-target.min`,
   `size.touch-target.comfortable`.

3. **Build Component tokens** — only where components diverge from semantic defaults.
   Most components should consume semantic tokens directly.

4. **Output token files** — as defined by the `uiux-design-tokens` skill:
   - `tokens.json` (W3C DTCG format)
   - `design-tokens.css` (CSS custom properties, 3-layer)
   - `main.css` (Tailwind v4 `@theme` integration)

5. **Apply tokens in Penpot** — using the Penpot Design Tokens API:
   ```javascript
   // Create token sets
   const catalog = penpot.library.local.tokens;
   const primitiveSet = catalog.addSet({ name: 'Primitives' });
   const semanticSet = catalog.addSet({ name: 'Semantics' });

   // Add tokens to sets
   primitiveSet.addToken({ type: 'color', name: 'color.primary.500', value: '#HEXVAL' });
   // ... etc.

   // Create and activate theme
   const theme = catalog.addTheme({ group: '', name: 'Light' });
   theme.addSet(primitiveSet);
   theme.addSet(semanticSet);
   ```

   **CRITICAL:** Split token operations across multiple `mcp__penpot__execute_code` calls.
   Do NOT create sets, add tokens, create themes, and activate themes in a single call —
   the async propagation will cause failures. Sequence:
   - Call 1: Create token sets
   - Call 2: Add primitive tokens to set
   - Call 3: Add semantic tokens to set
   - Call 4: Create theme, add sets, activate

6. **Register library colors** — for easy use in Penpot's color picker:
   ```javascript
   const color = penpot.library.local.createColor();
   color.name = 'Primary 500';
   color.path = 'Brand';
   color.color = '#HEXVAL';
   ```

7. **Register library typographies:**
   ```javascript
   const typo = penpot.library.local.createTypography();
   typo.name = 'Heading XL';
   typo.path = 'Headings';
   const font = penpot.fonts.findByName('Inter');
   if (font) typo.setFont(font);
   typo.fontSize = '36';
   typo.fontWeight = '700';
   ```

### Token Rules

- Follow the naming taxonomy from `uiux-design-tokens` exactly — `color.blue.600` not
  `blue-600` or `colorBlue600` in the token file.
- Use `rem` for font sizes, `px` for borders and shadows (as per DTCG conventions).
- Include all accessibility tokens: focus-ring, touch-target, reduced-motion.
- Every semantic token must alias a primitive. No raw values in the semantic tier.

---

## Phase 4: Board & Component Generation

**Goal:** Create visible, structured design system pages and component boards in Penpot.

**Load the skill files now** (paths were verified in Step 0):

1. **Read `uiux-design-penpot/SKILL.md`** — Penpot MCP workflow, API gotchas, layout patterns.
2. **Read `uiux-design-penpot/references/penpot-api-reference.md`** — full API for shapes,
   layouts, text, library, tokens.
3. **Read `uiux-design-penpot/references/color-utilities.md`** — hex converters, contrast checks.
   Especially important if the Confirmed Spec uses OKLCH or HSL values that need conversion.
4. **Read `uiux-design-penpot/references/component-patterns.md`** — specs for buttons, forms,
   cards, navigation, modals, empty states, loading states.

Also read **this skill's own references** for generation-specific patterns:
5. **Read `references/board-layouts.md`** — page structure, board dimensions, positioning.
6. **Read `references/component-recipes.md`** — Penpot MCP code recipes per component type.

### Page Structure

Create these pages in the Penpot file (unless they already exist):

| Page | Purpose |
|------|---------|
| `Design System` | Token visualization — colors, typography, spacing, radii, shadows |
| `Components` | Component boards with all variants × states |
| `Sample Screen` | A complete application screen using components (Phase 5) |

### Board Creation

**CRITICAL execution constraints** (from Penpot MCP limitations):

1. **One board per `execute_code` call.** Don't try to create the entire design system page
   in one call — you'll hit the 30-second timeout.

2. **Create structure first, populate second.** For each board:
   - Call 1: Create the board, set dimensions, add flex/grid layout
   - Call 2: Create child shapes, position them, apply colors/typography
   - Call 3: Register as component (if applicable)

3. **Always check existing boards** before creating new ones to avoid overlap.
   Use `penpotUtils.findShapes(s => s.type === 'board', penpot.root)` to find current boards
   and calculate the next available position.

4. **Visual validation after each board.** Call `mcp__penpot__export_shape` after creating
   each major board to verify it looks correct before moving on. If something looks wrong,
   fix it before proceeding.

### Design System Boards

#### Colors Board
- Grid of color swatches (rectangles with fill)
- Each swatch labeled with: token name, hex value
- Grouped by: Primitives (full scales) and Semantics (by purpose)
- Show contrast pairs side by side (background + foreground)

#### Typography Board
- Each typography level rendered as sample text
- Show: level name, font family, size, weight, line-height
- Use real sample text, not "Lorem ipsum" — e.g. "The quick brown fox" or contextual samples
- Group by: Headings, Body, UI (labels, captions, buttons)

#### Spacing Board
- Visual blocks showing each spacing value
- Labeled with token name and px/rem value
- Show base grid increments

#### Radius Board
- Rectangles demonstrating each radius value
- Labeled with token name and px value

#### Shadow Board
- Cards/rectangles demonstrating each shadow elevation
- Labeled with token name and visual description

### Component Boards

For each component in the Confirmed Spec, create a board that shows:

```
┌─────────────────────────────────────────────────────────────┐
│ Component Name                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Variant: Primary                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Default  │ │ Hover    │ │ Active   │ │ Disabled │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Variant: Secondary                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Default  │ │ Hover    │ │ Active   │ │ Disabled │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  Variant: Ghost                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Default  │ │ Hover    │ │ Active   │ │ Disabled │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

After creating all state variants of a component, **register the default state as a
Penpot Component** using `penpot.library.local.createComponent([shapes])`. This makes
it available as an instance for the sample screen in Phase 5.

### Component Generation Order

Generate components in dependency order:
1. **Atomic elements first** — buttons, badges, tags, icons
2. **Form elements** — inputs, selects, checkboxes, toggles, radios
3. **Composite elements** — cards (may contain buttons, badges)
4. **Navigation** — nav bars (contain buttons, icons)
5. **Complex composites** — modals, dropdowns (contain multiple atomic elements)

This ensures that when building composite components, the atomic parts are already
registered as library components and can be instantiated.

---

## Phase 5: Sample Screen Generation

**Goal:** Generate one complete application screen that proves the design system works.

### What to Generate

Based on the original screenshots, create a screen that:
- Uses the same overall layout structure as the primary screenshot
- Instantiates registered components from Phase 4
- Applies the token-based colors, typography, and spacing
- Includes realistic sample content (not placeholder text)
- Is built as a proper Penpot board at the target device size (e.g. 375×812 for mobile)

### Screen Generation Steps

1. **Create a new page** called "Sample Screen" (or use existing if present)
2. **Create the main board** at the target device size
3. **Build the layout structure** — header, content area, navigation, etc.
4. **Instantiate components** from the library:
   ```javascript
   const btnComponent = penpot.library.local.components.find(c => c.name === 'Button/Primary');
   const btnInstance = btnComponent.instance();
   board.appendChild(btnInstance);
   ```
5. **Apply final styling** — fills, text content, spacing
6. **Add prototyping interactions** (optional) — if the screenshots show multiple screens,
   wire up navigation between them
7. **Export and validate** — call `mcp__penpot__export_shape` to visually verify

### Validation Checklist

Before declaring Phase 5 complete, verify:
- [ ] All colors match the Confirmed Spec
- [ ] Typography hierarchy is correct
- [ ] Spacing is consistent with the base grid
- [ ] Components look correct and match their board definitions
- [ ] Touch targets meet minimum size (44px for interactive elements)
- [ ] The overall layout matches the intent of the original screenshots
- [ ] The screen would pass a basic visual review against the source material

---

## Error Handling & Recovery

### Penpot MCP Connection Lost

If any `execute_code` call fails with a connection error:
1. Tell the user: "The Penpot MCP connection dropped."
2. Ask them to reopen the plugin panel and click "Connect to MCP server"
3. Retry the failed operation
4. Do NOT restart from Phase 1 — resume from where it failed

### Timeout on Complex Operations

If a call times out (>30 seconds):
1. Split the operation into smaller chunks
2. Create fewer shapes per call
3. For large component boards, create one variant row per call

### Visual Validation Failures

If an exported shape doesn't look right:
1. Identify the specific issue (wrong color, misaligned, wrong size)
2. Use `penpotUtils.findShapes()` to locate the problematic shape
3. Fix it with targeted property updates
4. Re-export to verify

### Token Application Failures

If token operations fail due to async propagation:
1. Always wait between calls (the MCP bridge handles this, but don't chain too many ops)
2. Don't read token properties immediately after `toggleActive()`
3. Split: create set → add tokens → create theme → activate theme (4 separate calls)

---

## Adaptation Notes

### When Screenshots Show a Desktop Dashboard
- Use 1440×900 board dimensions
- Generate sidebar navigation component
- Card grid layout for content area
- Consider data visualization components (charts, metric cards)

### When Screenshots Show a Mobile App
- Use 375×812 (iPhone) or 390×844 (iPhone 14) board dimensions
- Generate bottom navigation component
- Stack layout for content
- Consider safe areas (status bar 44px, home indicator 34px)

### When Screenshots Show a Marketing/Landing Page
- Use 1440×900+ board dimensions (may be tall — scrollable)
- Generate hero section, feature sections, CTA blocks
- Focus on typography hierarchy and whitespace
- Components may be less standard — adapt to what's visible

### When Screenshots Are Low Quality or Partial
- Be transparent about uncertainty: "This color appears to be approximately #2D4A3A but
  the image quality makes it difficult to be precise"
- Ask the user to confirm uncertain values in Phase 2
- Suggest alternatives: "This could be 12px or 16px border radius — which do you prefer?"
