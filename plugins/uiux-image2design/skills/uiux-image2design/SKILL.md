---
name: uiux-image2design
description: >
  Analyze UI screenshots, extract a full design system, and generate it in Penpot.
  ALWAYS use this skill when: (1) The user provides UI screenshots or images and wants
  a design system built from them, (2) The user wants to reverse-engineer a visual style
  into Penpot components and tokens, (3) The user says "create a design from these images",
  "extract the style", "build a design system from these screenshots", or similar.
  Trigger keywords: image to design, screenshot to design system, extract design, reverse
  engineer UI, visual reference to Penpot, design from images, image2design.
---

# Image to Design System

Analyze UI screenshots, extract a design system, confirm it with the user, then generate
everything in Penpot: tokens, design system boards, reusable components, and a sample screen.

This skill orchestrates two knowledge skills:
- `uiux-design-tokens` — token format, naming, hierarchy, W3C DTCG spec
- `uiux-design-penpot` — Penpot MCP API, component patterns, accessibility

## Step 0: Verify Dependencies

Run ALL checks before starting. Stop if any fail.

**0a. Find `uiux-design-tokens` skill.**
Search for its SKILL.md in the project's plugin directories. Confirm it exists along
with its references: `dtcg-format.md`, `starter-template.md`, `platform-mapping.md`.
If missing, tell the user to install it and stop.

**0b. Find `uiux-design-penpot` skill.**
Search for its SKILL.md and references: `penpot-api-reference.md`, `component-patterns.md`,
`color-utilities.md`, `prototyping-interactions.md`, `generation-recipes.md`.
If missing, tell the user to install it and stop.

**0c. Test Penpot MCP connection.**
Call `mcp__penpot__penpot_api_info`. If it fails, tell the user to ensure:
1. MCP server is running (ports 4400, 4401, 4402)
2. A Penpot design file is open
3. The plugin panel shows "Connected"
Refer them to `uiux-design-penpot/references/setup-troubleshooting.md`.

**0d. Report readiness.** Confirm all three checks passed, then ask for screenshots.

---

## The 5-Phase Workflow

```
Phase 1: Screenshot Analysis ──→ Design Inventory
Phase 2: User Confirmation   ──→ Confirmed Spec
Phase 3: Token Generation     ──→ Token files + Penpot tokens
Phase 4: Board Generation     ──→ Design system + component pages
Phase 5: Sample Screen        ──→ Complete application screen
```

Each phase completes before the next begins.
Drive forward autonomously — only pause at Phase 2 for user confirmation.

---

## Phase 1: Screenshot Analysis

**Read** `references/analysis-guide.md` — the full 10-section extraction methodology.

**Core directive** (internalize this when analyzing):

> Deeply analyze the design of the attached screenshot to create a design system layout
> of every UI component needed in a design system for a SaaS product service. Pay close
> attention to spacing, fonts, colors, design styles and design principles.

If the user has described their product, append that context to sharpen the analysis:

> ...for **a B2B analytics dashboard**. Also identify data visualization patterns,
> metric card layouts, and filter/control components specific to dashboard interfaces.

**Execute the 10-section analysis in order:**
1. Initial Assessment (platform, design language, density, color mode)
2. Color Palette (by role, with hex values and `observed in:` attributions)
3. Typography (font family with confidence level, sizes with `~` prefix)
4. Spacing (base unit, scale as multipliers, component padding, gap patterns)
5. Layout Structure (grid, section map, visual hierarchy, alignment)
6. Border Radius (values with usage contexts)
7. Shadows & Depth (classify strategy first, then extract values)
8. Component Inventory (variants, visible states, missing states)
9. Iconography (style, size, set identification)
10. Known Gaps (MANDATORY — states not visible, uncertain values, next steps)

**Output:** Present the full Design Inventory to the user.
Read `references/confirmation-templates.md` for the inventory output format.

---

## Phase 2: User Confirmation

**Read** `references/confirmation-templates.md` — output formats and interaction patterns.

### Step 2a: Category-Level Review

Present the inventory and ask for per-category feedback:
- ✅ Looks good
- ✏️ Needs adjustments (drill down)
- ❌ Skip
- ➕ Add something not in screenshots

Categories: Colors, Typography, Spacing, Layout, Radius, Shadows & Depth,
Components, Iconography, Additional Patterns, Known Gaps.

The **Gaps** category is special: present each gap as a decision with a proposed default.
Example: "Hover states not visible. I propose: 10% darker for hover, 20% for active. OK?"

### Step 2b: Drill-Down

For any category marked ✏️, present individual elements and ask for specific changes.
Absorb all feedback before moving on.

### Step 2c: Confirm Final Spec

Present the clean **Confirmed Spec** summary. Ask for one final "go ahead."
Do NOT proceed to Phase 3 without explicit confirmation.

---

## Phase 3: Token Generation

**Read these now** (paths verified in Step 0):
- `uiux-design-tokens/SKILL.md`
- `uiux-design-tokens/references/dtcg-format.md`
- `uiux-design-tokens/references/starter-template.md`
- `uiux-design-tokens/references/platform-mapping.md`

Read them fresh — the user may have updated them since the last run.

For Penpot token API patterns and async sequencing rules, read `uiux-design-penpot/SKILL.md`
(sections: "Design Tokens API" and "Connection Stability"). The unique sequencing for this
workflow is:

| Call | Operation |
|-|-|
| 1 | Create token sets |
| 2 | Add primitive tokens (~20 per call; split if >50) |
| 3 | Add semantic tokens |
| 4 | Create theme, add sets |
| 5 | Activate theme |
| 6 | Verify (read back) |

### Framework-Agnostic Principle

Token and Penpot output is independent of any frontend framework. The design system works
whether the user implements in Vue, React, Svelte, or plain HTML. If the user has
framework-specific skills installed (e.g. Tailwind CSS v4), mention that CSS/Tailwind
output is available — but never make it a required step.

### Execute

1. **Build Primitive tokens** — raw color scales, font stacks, spacing values, radius,
   shadows, motion. Every raw value lives here exclusively.

2. **Build Semantic tokens** — map primitives to intent. Include accessibility tokens:
   `color.border.focus-ring`, `size.touch-target.min`, `size.touch-target.comfortable`.

3. **Build Component tokens** — only where components diverge from semantic defaults.

4. **Output token files** — as defined by `uiux-design-tokens`:
   `tokens.json` (W3C DTCG), `design-tokens.css` (CSS custom properties),
   `main.css` (Tailwind v4 `@theme`).

5. **Apply tokens in Penpot** — follow the 6-call sequencing table above.
   Split across multiple `execute_code` calls.

6. **Register library colors and typographies** — for Penpot's color picker and text styles.

---

## Phase 4: Board & Component Generation

**Read these now** (paths verified in Step 0):
- `uiux-design-penpot/SKILL.md`
- `uiux-design-penpot/references/penpot-api-reference.md`
- `uiux-design-penpot/references/color-utilities.md`
- `uiux-design-penpot/references/component-patterns.md`

**Read this skill's own references:**
- `references/board-layouts.md` — page structure, board dimensions, positioning
- `references/component-recipes.md` — workflow orchestration for component generation
- `uiux-design-penpot/references/generation-recipes.md` — Penpot MCP execute_code templates

### Page Structure

Create three pages (unless they already exist):

| Page | Content |
|------|---------|
| Design System | Colors, typography, spacing, radius, shadows boards |
| Components | All component boards (variants × states) |
| Sample Screen | Complete application screen (Phase 5) |

### Execution Constraints

1. **One board per `execute_code` call.** 30-second timeout.
2. **Structure first, populate second.** Board → layout → children → register.
3. **Check existing boards** before creating to avoid overlap.
4. **Validate visually** — `mcp__penpot__export_shape` after each major board.

### Component Generation Order

Build in dependency order so composite components can instantiate atomic ones:
1. Atomic — buttons, badges, tags
2. Form — inputs, selects, checkboxes, toggles
3. Composite — cards (contain buttons, badges)
4. Navigation — nav bars (contain buttons, icons)
5. Complex — modals, dropdowns (contain multiple atomic elements)

Register each component's default variant via `penpot.library.local.createComponent()`.

---

## Phase 5: Sample Screen

Create one complete application screen proving the system works end-to-end.

1. Create/find "Sample Screen" page
2. Create main board at target device size (from Confirmed Spec layout)
3. Build layout structure — header, content, navigation
4. Instantiate registered components from library
5. Apply final styling — fills, text content, spacing
6. Optionally add prototyping interactions
7. Export and validate visually

**Validation checklist:**
- Colors match Confirmed Spec
- Typography hierarchy is correct
- Spacing follows base grid
- Components match their board definitions
- Touch targets ≥ 44px
- Layout matches original screenshot intent

---

## Error Recovery

**Connection lost:** Tell user to reconnect plugin. Resume from failed operation.
**Timeout:** Split into smaller calls. One variant row per call for large boards.
**Visual mismatch:** Find shape via `penpotUtils.findShapes()`, fix, re-export.
**Token async failures:** Never chain creates + activates in one call. Sequence:
create set → add tokens → create theme → activate (4 separate calls).

---

## Adaptation

**Desktop dashboard:** 1440×900, sidebar nav, card grid, consider data viz components.
**Mobile app:** 375×812 or 390×844, bottom nav, stack layout, safe areas (44px status, 34px home).
**Marketing page:** 1440×900+, hero + feature sections, focus on typography and whitespace.
**Low quality screenshots:** Be transparent about uncertainty. Flag in Gaps. Confirm in Phase 2.
