# uiux-design-tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Claude Code skill plugin that guides coding agents on design token best practices — 3-tier hierarchy, opinionated naming taxonomy, W3C DTCG format, and platform output mapping.

**Architecture:** A single skill plugin with a tiered structure: SKILL.md inlines the core naming taxonomy and tier system (~340 lines), while three reference files provide on-demand depth for DTCG format, starter templates, and platform mapping. Registered in the marketplace under the `development` category.

**Tech Stack:** Markdown (SKILL.md + references), JSON (plugin.json, marketplace.json entry)

**Spec:** `docs/superpowers/specs/2026-03-18-uiux-design-tokens-design.md`

---

## File Structure

| File | Action | Responsibility |
|-|-|-|
| `plugins/uiux-design-tokens/.claude-plugin/plugin.json` | Create | Plugin metadata (name, description, version) |
| `plugins/uiux-design-tokens/skills/uiux-design-tokens/SKILL.md` | Create | Core skill: trigger, 3-tier hierarchy, naming taxonomy, token categories, decision framework, reference pointers |
| `plugins/uiux-design-tokens/skills/uiux-design-tokens/references/dtcg-format.md` | Create | W3C DTCG JSON spec: types, aliases, groups, validation |
| `plugins/uiux-design-tokens/skills/uiux-design-tokens/references/starter-template.md` | Create | Minimal DTCG token set (primitive + semantic layers) as scaffolding |
| `plugins/uiux-design-tokens/skills/uiux-design-tokens/references/platform-mapping.md` | Create | CSS custom properties, Tailwind, SCSS, other platform output guidance |
| `.claude-plugin/marketplace.json` | Modify | Add plugin entry to the plugins array |

---

### Task 1: Plugin Scaffold

**Files:**
- Create: `plugins/uiux-design-tokens/.claude-plugin/plugin.json`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p plugins/uiux-design-tokens/.claude-plugin
mkdir -p plugins/uiux-design-tokens/skills/uiux-design-tokens/references
```

- [ ] **Step 2: Write plugin.json**

```json
{
  "name": "uiux-design-tokens",
  "description": "Guide coding agents on design token best practices: 3-tier hierarchy, naming taxonomy, W3C DTCG format, and platform mapping. Adds a /uiux-design-tokens skill.",
  "version": "1.0.0"
}
```

- [ ] **Step 3: Commit**

```bash
git add plugins/uiux-design-tokens/.claude-plugin/plugin.json
git commit -m "scaffold uiux-design-tokens plugin"
```

---

### Task 2: SKILL.md — Core Skill File

**Files:**
- Create: `plugins/uiux-design-tokens/skills/uiux-design-tokens/SKILL.md`

This is the largest file (~340 lines). Write it in full following the spec sections 3.1–3.6. The content must include:

- [ ] **Step 1: Write SKILL.md frontmatter + trigger section**

Frontmatter format must match existing plugins (see `pencil-pen-generator` SKILL.md for convention). The `description` field is the trigger — include all activation conditions and keywords from spec section 3.1.

```yaml
---
name: uiux-design-tokens
description: >
  Guide for design token best practices, naming conventions, and organization.
  ALWAYS use this skill when: building or modifying a design system, creating theme
  configurations, working with token files (.tokens, .tokens.json), defining CSS custom
  properties for theming, or structuring design variables. Also trigger when the user
  mentions: design tokens, token naming, DTCG, design system tokens, theme tokens,
  primitive/semantic/component tokens, token hierarchy, style dictionary, design variables.
  Trigger keywords: design tokens, token naming, DTCG, W3C, design system, theme tokens,
  CSS variables, style dictionary, primitives, semantic tokens, component tokens, token hierarchy,
  design variables, theming.
---
```

- [ ] **Step 2: Write the 3-Tier Token Hierarchy section**

Cover spec section 3.2 in full:
- Title: `# Design Token Best Practices`
- Reference pointers section (before you start): point to `references/dtcg-format.md`, `references/starter-template.md`, `references/platform-mapping.md` with when-to-load guidance
- `## The 3-Tier Token Hierarchy` — table of primitive/semantic/component with definitions, purpose, examples
- Rules: never skip tiers, primitives hold raw values, semantic encodes intent, component tier is optional
- The referencing chain diagram: component → semantic → primitive
- When to use each tier

Content to write (adapt from spec section 3.2):

```markdown
# Design Token Best Practices

Guide for creating, naming, and organizing design tokens following industry best practices and the W3C Design Tokens Community Group (DTCG) standard.

## Before You Start

Read the reference files in this skill's `references/` directory as needed:

- **`references/dtcg-format.md`** — W3C DTCG JSON format specification. Consult when creating or reading `.tokens` or `.tokens.json` files. Covers all token types, alias syntax, group nesting, and validation rules.
- **`references/starter-template.md`** — A minimal but complete DTCG token set covering all categories. Use as scaffolding when starting a new project with no existing tokens. Adapt to project needs, don't copy verbatim.
- **`references/platform-mapping.md`** — How to output tokens to CSS custom properties, Tailwind, SCSS, and other platforms. Consult when transforming tokens into platform-specific code.

## The 3-Tier Token Hierarchy

Design tokens are organized in three tiers. Each tier references the one below it.

| Tier | Purpose | Holds Raw Values? | Example |
|-|-|-|-|
| **Primitive** | Raw design values on a named scale. No semantic meaning. | Yes | `color.blue.600`, `space.4`, `font.size.300` |
| **Semantic** | Intent-based tokens that reference primitives. Encode *what the value is for*, not what it looks like. | No — aliases only | `color.background.danger`, `space.inline.md` |
| **Component** | Scoped to specific UI elements. Reference semantic tokens. Only create when a component diverges from the semantic layer. | No — aliases only | `button.color.background.primary.hover` |

### Referencing Chain

```
Component tokens  →  Semantic tokens  →  Primitive tokens  →  Raw values
(optional)            (required)          (required)
```

### Rules

1. **Never skip tiers.** A component token must not directly reference a primitive. Always go through semantic.
2. **Primitives are the only source of raw values.** Every other token is an alias.
3. **Semantic tokens encode intent.** Name them by *role* (`background.danger`), not by *appearance* (`red-light`).
4. **Component tokens are optional.** Only create them when a specific component needs to override or diverge from the semantic layer. A component token that just re-aliases a semantic token adds no value — skip it.
5. **Start lean.** Begin with primitives + semantic. Add component tokens only when you hit a concrete need.
```

- [ ] **Step 3: Write the Naming Taxonomy section**

Cover spec section 3.3 in full. This is the core of the skill (~120 lines). Include:
- The formula: `{namespace}.{category}.{concept}.{property}.{variant}.{scale}.{state}`
- Level definitions table with When to Include and Examples columns
- Separator conventions (`.` in token files, `-` in CSS, `kebab-case` within levels)
- Annotated formula mapping examples (the ASCII diagrams from the spec)
- Naming examples per tier: primitive, semantic, component (all examples from spec)

Content to write:

```markdown
## Naming Taxonomy

### The Formula

```
{namespace}.{category}.{concept}.{property}.{variant}.{scale}.{state}
```

**Levels are selectively included** — use only the levels needed for clarity. Never use all 7 unless required. Ordered from most stable (left) to most volatile (right).

| Level | Definition | When to Include | Examples |
|-|-|-|-|
| **namespace** | System or brand identifier | Multi-system orgs, shared design system libraries | `acme`, `nord`, `ds` |
| **category** | The token type/domain | Always — every token has a category | `color`, `space`, `font`, `shadow`, `border`, `motion`, `opacity`, `radius`, `z`, `breakpoint`, `size` |
| **concept** | Semantic role or logical grouping | Semantic and component tiers | `background`, `text`, `border`, `surface`, `interactive`, `feedback`, `inline`, `stack` |
| **property** | Specific design attribute | When the concept alone is ambiguous | `family`, `size`, `weight`, `line-height`, `duration`, `easing`, `width`, `style` |
| **variant** | Named variation of the concept | When the element has distinct variants | `primary`, `secondary`, `danger`, `success`, `warning`, `info`, `neutral`, `inverse` |
| **scale** | Position on a value scale | Primitive tier scales, sizing contexts | `50`–`950` (color), `xs`/`s`/`m`/`l`/`xl` (t-shirt), `1`–`12` (numeric) |
| **state** | Interactive or contextual state | Component tier, interactive elements | `hover`, `active`, `focus`, `disabled`, `pressed`, `visited` |

### Separator Conventions

- `.` (dot) in token definition files — maps to DTCG JSON group nesting
- `-` (hyphen) in CSS custom property output — `color.background.surface` → `--color-background-surface`
- Within each level, use `kebab-case` for multi-word names — `ease-out`, `line-height`, `on-primary`

### Annotated Examples

```
color.blue.600
└─category─┘.└concept┘.└scale┘

color.background.danger
└─category─┘.└─concept──┘.└variant┘

button.color.background.primary.hover
└──namespace/component──┘.└cat┘.└concept┘.└variant┘.└state┘

font.size.300
└cat┘.└property┘.└scale┘

space.inline.md
└cat──┘.└concept┘.└scale┘
```

### Examples by Tier

**Primitive tokens** — raw values on named scales:

- `color.blue.600` — blue hue, position 600 on the scale
- `color.neutral.100` — neutral gray, light end
- `space.4` — 16px on a 4px base grid
- `font.size.300` — font size position 300
- `font.weight.semibold` — font weight value
- `font.family.sans` — sans-serif font stack
- `shadow.elevation.2` — second elevation level
- `motion.duration.fast` — short animation duration
- `motion.easing.ease-out` — deceleration curve
- `radius.md` — medium border radius
- `opacity.subtle` — low opacity value
- `border.width.1` — thinnest border

**Semantic tokens** — intent-based, reference primitives:

- `color.background.surface` — default surface background
- `color.background.danger` — danger/error background
- `color.text.primary` — primary body text
- `color.text.on-primary` — text on primary-colored backgrounds
- `color.border.default` — standard border color
- `color.interactive.default` — clickable element default
- `color.feedback.success` — success state feedback
- `space.inline.md` — medium horizontal spacing
- `space.stack.lg` — large vertical spacing
- `space.inset.md` — medium padding (all sides)
- `font.heading.size` — heading text size
- `font.body.line-height` — body text line height
- `shadow.overlay` — overlay/modal shadow

**Component tokens** — scoped to specific UI elements:

- `button.color.background.primary` — primary button background
- `button.color.background.primary.hover` — primary button hover
- `button.color.text.primary` — primary button text
- `button.space.padding.md` — medium button padding
- `button.radius` — button border radius
- `input.color.border.default` — input default border
- `input.color.border.focus` — input focus border
- `input.color.border.error` — input error border
- `card.shadow.default` — card resting shadow
- `card.shadow.hover` — card hover shadow
```

- [ ] **Step 4: Write the Token Categories section**

Cover spec section 3.4 (~80 lines). For each of the 11 categories, document: which tiers apply, primitive scale conventions, semantic naming patterns, and common pitfalls.

Content to write:

```markdown
## Token Categories

### Color

**Primitive scale:** Hue scales from `50` (lightest) to `950` (darkest) in increments of 50 or 100. Include a neutral/gray scale plus brand and feedback hues.

**Semantic patterns:** `color.background.*`, `color.text.*`, `color.border.*`, `color.interactive.*`, `color.feedback.*`

**Key convention:** Use `on-*` tokens for contrast pairs — if you have `color.background.primary`, create `color.text.on-primary` for text that sits on top of it.

**Pitfall:** Don't name semantic colors by their visual appearance (`color.red-light`). Name by role (`color.feedback.danger`).

### Typography

**Primitive scale:** `font.family.*` (sans, serif, mono), `font.size.100`–`font.size.900`, `font.weight.*` (regular, medium, semibold, bold), `font.line-height.*` (tight, normal, relaxed)

**Semantic patterns:** `font.heading.*`, `font.body.*`, `font.caption.*`, `font.label.*`

**Key convention:** Typography is often expressed as composite tokens combining family + size + weight + line-height. In DTCG, use the `typography` composite type.

**Pitfall:** Don't duplicate size tokens as both `font.size.sm` and `font.size.200` — pick one scale convention and stick with it.

### Spacing

**Primitive scale:** 4px base grid. `space.1` = 4px, `space.2` = 8px, ... `space.16` = 64px. Alternatively, t-shirt sizing (`space.xs` through `space.xl`).

**Semantic patterns:** `space.inline.*` (horizontal), `space.stack.*` (vertical), `space.inset.*` (padding)

**Key convention:** Distinguish *direction*: inline (horizontal/row), stack (vertical/column), inset (padding on all sides or per-side). This prevents ambiguous spacing tokens.

**Pitfall:** Don't create `space.button-padding` — that's a component token. Keep semantic spacing directional and generic.

### Sizing

**Primitive scale:** `size.1`–`size.16` or t-shirt sizing.

**Semantic patterns:** `size.icon.*`, `size.avatar.*`, `size.touch-target`

**Key convention:** Sizing and spacing scales may share the same base grid but serve different purposes. Spacing = gaps between things. Sizing = dimensions of things.

### Border

**Primitive scale:** `border.width.1` (1px), `border.width.2` (2px), `border.width.4` (4px). `border.style.*` (solid, dashed, dotted).

**Semantic patterns:** `border.default` (composite), `border.strong` (composite)

**Key convention:** In DTCG, borders are composite tokens combining width + style + color. At the semantic level, define complete border composites.

### Border Radius

**Primitive scale:** `radius.none` / `radius.xs` / `radius.s` / `radius.m` / `radius.l` / `radius.xl` / `radius.full`

**Semantic patterns:** `radius.interactive` (buttons, inputs), `radius.container` (cards, panels)

**Key convention:** `radius.full` means pill shape (999px or 50%) for fully rounded elements.

### Shadow

**Primitive scale:** `shadow.elevation.1` (subtle) through `shadow.elevation.5` (pronounced). Each is a composite of color + x/y offset + blur + spread.

**Semantic patterns:** `shadow.overlay`, `shadow.dropdown`, `shadow.modal`, `shadow.card`

**Key convention:** Map elevation levels to UI layering. Level 1 = cards/surfaces. Level 3 = dropdowns. Level 5 = modals.

### Z-Index

**Scale:** `z.base` (0) / `z.dropdown` (1000) / `z.sticky` (1100) / `z.modal` (1300) / `z.toast` (1400) / `z.tooltip` (1500)

**Key convention:** Use named positions, never arbitrary numbers. Z-index is inherently semantic — the primitive and semantic tiers are the same. No component tier needed.

### Breakpoints

**Scale:** `breakpoint.sm` / `breakpoint.md` / `breakpoint.lg` / `breakpoint.xl` / `breakpoint.2xl`

**Key convention:** Mobile-first values (min-width). Like z-index, breakpoints are inherently semantic.

### Motion

**Primitive scale:** `motion.duration.instant` (~0ms) / `motion.duration.fast` (~150ms) / `motion.duration.normal` (~300ms) / `motion.duration.slow` (~500ms). `motion.easing.ease-out` / `motion.easing.ease-in-out` / `motion.easing.linear`

**Semantic patterns:** `motion.transition.default`, `motion.enter`, `motion.exit`

**Key convention:** Duration and easing compose into transitions. Semantic motion tokens define *when* motion happens (enter, exit, transition), referencing primitive duration + easing values.

### Opacity

**Primitive scale:** `opacity.subtle` (0.1–0.2) / `opacity.medium` (0.4–0.5) / `opacity.strong` (0.7–0.8) / `opacity.opaque` (1.0)

**Semantic patterns:** `opacity.disabled`, `opacity.overlay`, `opacity.hover`

**Key convention:** Small set — usually 4–6 values. Don't over-tokenize.
```

- [ ] **Step 5: Write the Decision Framework and Reference Pointers sections**

Cover spec sections 3.5 and 3.6 (~60 lines). Include:
- "Should I create a token?" decision logic
- Tier selection guidance
- Token proliferation guard (YAGNI)
- When to load each reference file

Content to write:

```markdown
## Decision Framework

### Should I Create a Token?

1. **Is this value used in 2+ places?** → Yes, tokenize it
2. **Will this value change with theming or rebranding?** → Yes, tokenize it
3. **Is this a one-off value for a unique element?** → No, use a raw value
4. **Does a semantic token already express this intent?** → Use the existing token, don't duplicate

### Which Tier?

- **Raw design value** (a specific hex color, pixel value, font stack) → **Primitive**
- **Value expresses UI intent** (background, text color, feedback, spacing role) → **Semantic**
- **Value is specific to one component** and that component diverges from the semantic layer → **Component**

### Token Proliferation Guard

- **Start lean:** Primitives + semantic tokens first. Add component tokens only when a concrete need arises.
- **Alias test:** If a component token would just alias a semantic token with no override, skip it — it adds no value.
- **Fewer, well-named tokens are better** than many granular tokens nobody remembers.
- **Consolidate outliers:** If you have a one-off value that's close to an existing token, change the design to use the existing token rather than creating a new one.
- **Review regularly:** As the system grows, audit for unused or redundant tokens.

## When to Load Reference Files

| Situation | Reference to Load |
|-|-|
| Creating or reading `.tokens` or `.tokens.json` files | `references/dtcg-format.md` |
| Starting a new project with no existing tokens | `references/starter-template.md` |
| Outputting tokens to CSS, Tailwind, SCSS, or other platforms | `references/platform-mapping.md` |
```

- [ ] **Step 6: Review SKILL.md for completeness**

Read the full file. Verify:
- Frontmatter matches pencil-pen-generator convention
- All spec sections 3.1–3.6 are covered
- Line count is ~300-400 lines
- No broken markdown

- [ ] **Step 7: Commit**

```bash
git add plugins/uiux-design-tokens/skills/uiux-design-tokens/SKILL.md
git commit -m "add SKILL.md with token hierarchy, naming taxonomy, and decision framework"
```

---

### Task 3: Reference — DTCG Format

**Files:**
- Create: `plugins/uiux-design-tokens/skills/uiux-design-tokens/references/dtcg-format.md`

- [ ] **Step 1: Write dtcg-format.md**

~150 lines covering the W3C DTCG JSON spec. Structure:

```markdown
# W3C DTCG Token Format Reference

The Design Tokens Community Group (DTCG) defines a standard JSON format for design tokens. This reference covers the format specification.

## File Structure

Design token files use `.tokens` or `.tokens.json` extension. Media type: `application/design-tokens+json`.

A token file is a JSON object. Top-level keys are either tokens (objects with `$value`) or groups (objects without `$value`).

```json
{
  "color": {
    "$type": "color",
    "blue": {
      "600": {
        "$value": "#2563eb",
        "$description": "Primary blue, position 600"
      }
    }
  }
}
```

## Token Properties

Every token is a JSON object with these properties:

| Property | Required | Type | Purpose |
|-|-|-|-|
| `$value` | Yes | any | The token's value — format depends on `$type` |
| `$type` | No* | string | The token type. *Required if not inherited from parent group |
| `$description` | No | string | Plain text explaining the token's purpose |
| `$deprecated` | No | boolean or string | Marks token as deprecated. String value provides explanation |
| `$extensions` | No | object | Vendor-specific metadata (use reverse domain notation for keys) |

## Token Types

### Simple Types

| Type | Value Format | Example |
|-|-|-|
| `color` | Object: `{ colorSpace, components, alpha }` or hex string | `"#2563eb"` |
| `dimension` | Object: `{ value, unit }` where unit is `px` or `rem` | `{ "value": 16, "unit": "px" }` |
| `fontFamily` | String or array of strings | `["Inter", "sans-serif"]` |
| `fontWeight` | Number (1–1000) or named string | `600` or `"semibold"` |
| `fontStyle` | String | `"normal"` or `"italic"` |
| `duration` | Object: `{ value, unit }` where unit is `ms` or `s` | `{ "value": 200, "unit": "ms" }` |
| `cubicBezier` | Array of 4 numbers [P1x, P1y, P2x, P2y] | `[0.4, 0, 0.2, 1]` |
| `number` | JSON number (unitless) | `1.5` |
| `string` | JSON string | `"block"` |

### Composite Types

| Type | Sub-values |
|-|-|
| `typography` | `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`, `lineHeight` |
| `shadow` | `color`, `offsetX`, `offsetY`, `blur`, `spread` |
| `border` | `color`, `width`, `style` |
| `transition` | `duration`, `delay`, `timingFunction` |
| `gradient` | Array of `{ color, position }` stops |
| `strokeStyle` | String (`solid`, `dashed`, etc.) or object with `dashArray` and `lineCap` |

## Aliases (References)

Tokens can reference other tokens using curly brace syntax:

```json
{
  "color": {
    "blue": {
      "600": { "$value": "#2563eb", "$type": "color" }
    },
    "background": {
      "primary": { "$value": "{color.blue.600}", "$type": "color" }
    }
  }
}
```

**Rules:**
- References use dot-separated paths: `{group.subgroup.token}`
- Target must be a token (must have `$value`)
- Chained references are allowed (alias → alias → value)
- Circular references are forbidden
- Changes to referenced tokens propagate to all aliases

## Groups

Groups are JSON objects without a `$value` property. They organize tokens hierarchically.

```json
{
  "color": {
    "$type": "color",
    "$description": "All color tokens",
    "blue": {
      "500": { "$value": "#3b82f6" },
      "600": { "$value": "#2563eb" }
    }
  }
}
```

**Group properties:**
- `$type` — sets default type for all child tokens that don't declare their own
- `$description` — documents the group's purpose
- `$extensions` — vendor-specific metadata
- `$deprecated` — marks entire group as deprecated

**Type inheritance:** A token's type is resolved by: (1) its own `$type`, (2) closest parent group's `$type`, (3) referenced token's type. Tools must NOT guess types from values.

## Validation Rules

- Token names must not start with `$` or contain `{`, `}`, `.`
- Names are case-sensitive
- Every token must have a resolvable `$type`
- Circular references must trigger errors
- An object cannot be both a token and a group (cannot have `$value` and child tokens)
```

- [ ] **Step 2: Commit**

```bash
git add plugins/uiux-design-tokens/skills/uiux-design-tokens/references/dtcg-format.md
git commit -m "add DTCG format reference with types, aliases, and validation rules"
```

---

### Task 4: Reference — Starter Template

**Files:**
- Create: `plugins/uiux-design-tokens/skills/uiux-design-tokens/references/starter-template.md`

- [ ] **Step 1: Write starter-template.md**

~120 lines. A complete minimal DTCG JSON token set with annotations. Covers primitive and semantic layers as specified in spec section 4.2.

```markdown
# Starter Token Template

A minimal but complete design token set in W3C DTCG format. Use as scaffolding for new projects — adapt to your brand and needs.

> **This is a starting point, not a prescription.** Rename, remove, or extend tokens to match your project. The structure and naming conventions matter more than the specific values.

## Primitive Tokens

```json
{
  "color": {
    "$type": "color",
    "neutral": {
      "50":  { "$value": "#fafafa" },
      "100": { "$value": "#f5f5f5" },
      "200": { "$value": "#e5e5e5" },
      "300": { "$value": "#d4d4d4" },
      "400": { "$value": "#a3a3a3" },
      "500": { "$value": "#737373" },
      "600": { "$value": "#525252" },
      "700": { "$value": "#404040" },
      "800": { "$value": "#262626" },
      "900": { "$value": "#171717" },
      "950": { "$value": "#0a0a0a" }
    },
    "primary": {
      "50":  { "$value": "#eff6ff" },
      "100": { "$value": "#dbeafe" },
      "200": { "$value": "#bfdbfe" },
      "300": { "$value": "#93c5fd" },
      "400": { "$value": "#60a5fa" },
      "500": { "$value": "#3b82f6" },
      "600": { "$value": "#2563eb" },
      "700": { "$value": "#1d4ed8" },
      "800": { "$value": "#1e40af" },
      "900": { "$value": "#1e3a8a" },
      "950": { "$value": "#172554" }
    },
    "success": {
      "base":  { "$value": "#22c55e" },
      "light": { "$value": "#bbf7d0" },
      "dark":  { "$value": "#15803d" }
    },
    "warning": {
      "base":  { "$value": "#eab308" },
      "light": { "$value": "#fef08a" },
      "dark":  { "$value": "#a16207" }
    },
    "danger": {
      "base":  { "$value": "#ef4444" },
      "light": { "$value": "#fecaca" },
      "dark":  { "$value": "#b91c1c" }
    },
    "info": {
      "base":  { "$value": "#06b6d4" },
      "light": { "$value": "#a5f3fc" },
      "dark":  { "$value": "#0e7490" }
    }
  },
  "font": {
    "family": {
      "sans":  { "$value": ["Inter", "system-ui", "sans-serif"], "$type": "fontFamily" },
      "mono":  { "$value": ["JetBrains Mono", "Fira Code", "monospace"], "$type": "fontFamily" }
    },
    "size": {
      "$type": "dimension",
      "100": { "$value": { "value": 0.75, "unit": "rem" } },
      "200": { "$value": { "value": 0.875, "unit": "rem" } },
      "300": { "$value": { "value": 1, "unit": "rem" } },
      "400": { "$value": { "value": 1.125, "unit": "rem" } },
      "500": { "$value": { "value": 1.25, "unit": "rem" } },
      "600": { "$value": { "value": 1.5, "unit": "rem" } },
      "700": { "$value": { "value": 1.875, "unit": "rem" } },
      "800": { "$value": { "value": 2.25, "unit": "rem" } },
      "900": { "$value": { "value": 3, "unit": "rem" } }
    },
    "weight": {
      "$type": "fontWeight",
      "regular":  { "$value": 400 },
      "medium":   { "$value": 500 },
      "semibold":  { "$value": 600 },
      "bold":     { "$value": 700 }
    },
    "line-height": {
      "$type": "number",
      "tight":   { "$value": 1.25 },
      "normal":  { "$value": 1.5 },
      "relaxed": { "$value": 1.75 }
    }
  },
  "space": {
    "$type": "dimension",
    "$description": "4px base grid. space.1 = 4px, space.2 = 8px, etc.",
    "1":  { "$value": { "value": 0.25, "unit": "rem" } },
    "2":  { "$value": { "value": 0.5, "unit": "rem" } },
    "3":  { "$value": { "value": 0.75, "unit": "rem" } },
    "4":  { "$value": { "value": 1, "unit": "rem" } },
    "6":  { "$value": { "value": 1.5, "unit": "rem" } },
    "8":  { "$value": { "value": 2, "unit": "rem" } },
    "12": { "$value": { "value": 3, "unit": "rem" } },
    "16": { "$value": { "value": 4, "unit": "rem" } }
  },
  "border": {
    "width": {
      "$type": "dimension",
      "1": { "$value": { "value": 1, "unit": "px" } },
      "2": { "$value": { "value": 2, "unit": "px" } },
      "4": { "$value": { "value": 4, "unit": "px" } }
    }
  },
  "radius": {
    "$type": "dimension",
    "none": { "$value": { "value": 0, "unit": "px" } },
    "xs":   { "$value": { "value": 2, "unit": "px" } },
    "s":    { "$value": { "value": 4, "unit": "px" } },
    "m":    { "$value": { "value": 8, "unit": "px" } },
    "l":    { "$value": { "value": 12, "unit": "px" } },
    "xl":   { "$value": { "value": 16, "unit": "px" } },
    "full": { "$value": { "value": 9999, "unit": "px" } }
  },
  "shadow": {
    "$type": "shadow",
    "elevation": {
      "1": { "$value": { "color": "#0000000d", "offsetX": { "value": 0, "unit": "px" }, "offsetY": { "value": 1, "unit": "px" }, "blur": { "value": 3, "unit": "px" }, "spread": { "value": 0, "unit": "px" } } },
      "2": { "$value": { "color": "#0000001a", "offsetX": { "value": 0, "unit": "px" }, "offsetY": { "value": 4, "unit": "px" }, "blur": { "value": 6, "unit": "px" }, "spread": { "value": -1, "unit": "px" } } },
      "3": { "$value": { "color": "#0000001a", "offsetX": { "value": 0, "unit": "px" }, "offsetY": { "value": 10, "unit": "px" }, "blur": { "value": 15, "unit": "px" }, "spread": { "value": -3, "unit": "px" } } }
    }
  },
  "motion": {
    "duration": {
      "$type": "duration",
      "instant": { "$value": { "value": 0, "unit": "ms" } },
      "fast":    { "$value": { "value": 150, "unit": "ms" } },
      "normal":  { "$value": { "value": 300, "unit": "ms" } },
      "slow":    { "$value": { "value": 500, "unit": "ms" } }
    },
    "easing": {
      "$type": "cubicBezier",
      "ease-out":    { "$value": [0.0, 0.0, 0.2, 1.0] },
      "ease-in-out": { "$value": [0.4, 0.0, 0.2, 1.0] },
      "linear":      { "$value": [0.0, 0.0, 1.0, 1.0] }
    }
  },
  "opacity": {
    "$type": "number",
    "subtle": { "$value": 0.15 },
    "medium": { "$value": 0.5 },
    "strong": { "$value": 0.75 },
    "opaque": { "$value": 1.0 }
  }
}
```

## Semantic Tokens

```json
{
  "color": {
    "$type": "color",
    "background": {
      "surface":   { "$value": "{color.neutral.50}" },
      "subtle":    { "$value": "{color.neutral.100}" },
      "primary":   { "$value": "{color.primary.600}" },
      "danger":    { "$value": "{color.danger.light}" },
      "warning":   { "$value": "{color.warning.light}" },
      "success":   { "$value": "{color.success.light}" },
      "info":      { "$value": "{color.info.light}" }
    },
    "text": {
      "primary":    { "$value": "{color.neutral.900}" },
      "secondary":  { "$value": "{color.neutral.600}" },
      "disabled":   { "$value": "{color.neutral.400}" },
      "on-primary": { "$value": "{color.neutral.50}" },
      "danger":     { "$value": "{color.danger.dark}" },
      "success":    { "$value": "{color.success.dark}" }
    },
    "border": {
      "default":     { "$value": "{color.neutral.200}" },
      "strong":      { "$value": "{color.neutral.400}" },
      "interactive": { "$value": "{color.primary.500}" }
    },
    "interactive": {
      "default": { "$value": "{color.primary.600}" },
      "hover":   { "$value": "{color.primary.700}" },
      "active":  { "$value": "{color.primary.800}" }
    },
    "feedback": {
      "success": { "$value": "{color.success.base}" },
      "warning": { "$value": "{color.warning.base}" },
      "danger":  { "$value": "{color.danger.base}" },
      "info":    { "$value": "{color.info.base}" }
    }
  },
  "font": {
    "heading": {
      "$type": "typography",
      "xl": { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.800}", "fontWeight": "{font.weight.bold}", "lineHeight": "{font.line-height.tight}" } },
      "lg": { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.600}", "fontWeight": "{font.weight.semibold}", "lineHeight": "{font.line-height.tight}" } },
      "md": { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.500}", "fontWeight": "{font.weight.semibold}", "lineHeight": "{font.line-height.tight}" } }
    },
    "body": {
      "$type": "typography",
      "default": { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.300}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.line-height.normal}" } },
      "small":   { "$value": { "fontFamily": "{font.family.sans}", "fontSize": "{font.size.200}", "fontWeight": "{font.weight.regular}", "lineHeight": "{font.line-height.normal}" } }
    }
  },
  "space": {
    "$type": "dimension",
    "inline": {
      "sm": { "$value": "{space.2}" },
      "md": { "$value": "{space.4}" },
      "lg": { "$value": "{space.8}" }
    },
    "stack": {
      "sm": { "$value": "{space.2}" },
      "md": { "$value": "{space.4}" },
      "lg": { "$value": "{space.8}" }
    },
    "inset": {
      "sm": { "$value": "{space.2}" },
      "md": { "$value": "{space.4}" },
      "lg": { "$value": "{space.8}" }
    }
  },
  "shadow": {
    "$type": "shadow",
    "card":     { "$value": "{shadow.elevation.1}" },
    "dropdown": { "$value": "{shadow.elevation.2}" },
    "overlay":  { "$value": "{shadow.elevation.3}" }
  },
  "opacity": {
    "$type": "number",
    "disabled": { "$value": "{opacity.subtle}" },
    "overlay":  { "$value": "{opacity.medium}" }
  }
}
```
```

- [ ] **Step 2: Commit**

```bash
git add plugins/uiux-design-tokens/skills/uiux-design-tokens/references/starter-template.md
git commit -m "add starter token template with primitive and semantic layers"
```

---

### Task 5: Reference — Platform Mapping

**Files:**
- Create: `plugins/uiux-design-tokens/skills/uiux-design-tokens/references/platform-mapping.md`

- [ ] **Step 1: Write platform-mapping.md**

~80 lines covering CSS custom properties (primary), Tailwind, SCSS, other platforms, and Style Dictionary.

```markdown
# Platform Mapping Reference

How to transform design tokens from the abstract DTCG format into platform-specific code. The token layer is the single source of truth — platform outputs are generated transforms.

## CSS Custom Properties (Primary)

### Naming Transform

Convert dot notation to hyphen-separated CSS custom properties:

```
Token path                    → CSS custom property
color.background.surface      → --color-background-surface
space.inline.md               → --space-inline-md
font.size.300                 → --font-size-300
button.color.background.hover → --button-color-background-hover
```

### Organization

Group tokens under `:root` for the default theme. Use `data-theme` attribute selectors for theme overrides:

```css
:root {
  /* Primitive */
  --color-primary-600: #2563eb;
  --space-4: 1rem;

  /* Semantic */
  --color-background-surface: var(--color-neutral-50);
  --color-text-primary: var(--color-neutral-900);
  --space-inline-md: var(--space-4);
}

[data-theme="dark"] {
  --color-background-surface: var(--color-neutral-900);
  --color-text-primary: var(--color-neutral-50);
}
```

**Key principle:** Semantic CSS variables reference primitive CSS variables using `var()`. This mirrors the DTCG alias chain and enables theming by only overriding semantic values.

## Tailwind CSS

Map tokens to `theme.extend` in your Tailwind config:

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        background: {
          surface: 'var(--color-background-surface)',
          primary: 'var(--color-background-primary)',
          danger: 'var(--color-background-danger)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
      },
      spacing: {
        'inline-sm': 'var(--space-inline-sm)',
        'inline-md': 'var(--space-inline-md)',
        'stack-md': 'var(--space-stack-md)',
      },
      fontSize: {
        sm: 'var(--font-size-200)',
        base: 'var(--font-size-300)',
        lg: 'var(--font-size-500)',
      },
      borderRadius: {
        sm: 'var(--radius-s)',
        md: 'var(--radius-m)',
        lg: 'var(--radius-l)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        dropdown: 'var(--shadow-dropdown)',
        overlay: 'var(--shadow-overlay)',
      },
    },
  },
}
```

**Key principle:** Tailwind config references CSS custom properties, not raw values. This keeps Tailwind in sync with the token system and enables theming.

## SCSS

Map tokens to SCSS variables and maps:

```scss
// _tokens.scss — generated from DTCG source

// Primitives as variables
$color-primary-600: #2563eb;
$space-4: 1rem;

// Scales as maps
$font-sizes: (
  '100': 0.75rem,
  '200': 0.875rem,
  '300': 1rem,
  '400': 1.125rem,
  '500': 1.25rem,
);

// Typography mixin for composite tokens
@mixin font-heading-lg {
  font-family: $font-family-sans;
  font-size: map-get($font-sizes, '600');
  font-weight: $font-weight-semibold;
  line-height: $line-height-tight;
}
```

## Other Platforms

Design tokens are platform-agnostic. The DTCG JSON is the source of truth; each platform gets a generated output:

| Platform | Output Format | Pattern |
|-|-|-|
| **React Native** | JS/TS module exporting an object | `export const tokens = { color: { background: { surface: '#fafafa' } } }` |
| **iOS (Swift)** | Enum or struct with static properties | `enum ColorToken { static let backgroundSurface = UIColor(hex: "#fafafa") }` |
| **Android** | XML resources or Compose theme | `<color name="color_background_surface">#fafafa</color>` |

## Style Dictionary

[Style Dictionary](https://amzn.github.io/style-dictionary/) is the standard pipeline tool for transforming tokens into platform-specific outputs.

Basic config:

```json
{
  "source": ["tokens/**/*.tokens.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "buildPath": "build/css/",
      "files": [{ "destination": "tokens.css", "format": "css/variables" }]
    },
    "js": {
      "transformGroup": "js",
      "buildPath": "build/js/",
      "files": [{ "destination": "tokens.js", "format": "javascript/es6" }]
    }
  }
}
```

Style Dictionary reads DTCG-compatible JSON and generates CSS, JS, SCSS, iOS, Android, and custom outputs via configurable transforms.
```

- [ ] **Step 2: Commit**

```bash
git add plugins/uiux-design-tokens/skills/uiux-design-tokens/references/platform-mapping.md
git commit -m "add platform mapping reference for CSS, Tailwind, SCSS, and Style Dictionary"
```

---

### Task 6: Marketplace Registration

**Files:**
- Modify: `.claude-plugin/marketplace.json:119` (insert new plugin entry before closing `]`)

- [ ] **Step 1: Add plugin entry to marketplace.json**

Add the following entry to the `plugins` array in `.claude-plugin/marketplace.json`, after the `pencil-pen-generator` entry:

```json
    {
      "name": "uiux-design-tokens",
      "source": "./plugins/uiux-design-tokens",
      "description": "Guide coding agents on design token best practices: 3-tier hierarchy, naming taxonomy, W3C DTCG format, and platform mapping. Adds a /uiux-design-tokens skill.",
      "version": "1.0.0",
      "category": "development",
      "tags": ["design-system", "tokens", "css", "theming", "ui"],
      "keywords": ["design tokens", "design system", "DTCG", "W3C", "CSS variables", "theme", "token naming", "style dictionary", "primitives", "semantic tokens"]
    }
```

- [ ] **Step 2: Verify JSON is valid**

```bash
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json')); print('Valid JSON')"
```

- [ ] **Step 3: Commit**

```bash
git add .claude-plugin/marketplace.json
git commit -m "register uiux-design-tokens plugin in marketplace"
```

---

### Task 7: Final Verification

- [ ] **Step 1: Verify file structure**

```bash
find plugins/uiux-design-tokens -type f | sort
```

Expected output:
```
plugins/uiux-design-tokens/.claude-plugin/plugin.json
plugins/uiux-design-tokens/skills/uiux-design-tokens/SKILL.md
plugins/uiux-design-tokens/skills/uiux-design-tokens/references/dtcg-format.md
plugins/uiux-design-tokens/skills/uiux-design-tokens/references/platform-mapping.md
plugins/uiux-design-tokens/skills/uiux-design-tokens/references/starter-template.md
```

- [ ] **Step 2: Verify marketplace.json has the new entry**

```bash
python3 -c "import json; data = json.load(open('.claude-plugin/marketplace.json')); names = [p['name'] for p in data['plugins']]; assert 'uiux-design-tokens' in names; print(f'Found. Total plugins: {len(names)}')"
```

Expected: `Found. Total plugins: 14`

- [ ] **Step 3: Verify SKILL.md frontmatter**

```bash
head -12 plugins/uiux-design-tokens/skills/uiux-design-tokens/SKILL.md
```

Expected: YAML frontmatter with `name: uiux-design-tokens` and description with trigger keywords.

- [ ] **Step 4: Verify all reference files exist and have content**

```bash
wc -l plugins/uiux-design-tokens/skills/uiux-design-tokens/references/*.md
```

Expected: each file has reasonable line count (dtcg-format ~120-160, starter-template ~100-130, platform-mapping ~70-90).
