# uiux-design-tokens — Skill Design Spec

**Date:** 2026-03-18
**Status:** Draft
**Category:** development (claude-marketplace plugin)

---

## 1. Purpose

A Claude Code skill that guides coding agents on design token best practices. It teaches the 3-tier token hierarchy, an opinionated naming taxonomy, W3C DTCG format, and platform output mapping. The skill is tool-agnostic — it does not prescribe Penpot, Figma, or any specific design tool.

### Target Scenarios

- **Greenfield:** Agent builds a design token system from scratch
- **Brownfield:** Agent extends or refactors an existing token system
- **Translation:** Agent converts a designer's token export into code
- **All lifecycle stages** are covered

### Trigger Scope

Activates when an agent is:
- Building or modifying a design system
- Creating theme configurations or token files (`.tokens`, `.tokens.json`)
- Defining CSS custom properties for theming
- Structuring design variables

Also activates on explicit mentions: "design tokens", "token naming", "DTCG", "design system tokens", "theme tokens", "primitive/semantic/component tokens", "token hierarchy".

---

## 2. Plugin Structure

```
plugins/uiux-design-tokens/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── uiux-design-tokens/
│       ├── SKILL.md                   # ~340 lines, core principles + naming taxonomy inline
│       └── references/
│           ├── dtcg-format.md         # W3C DTCG JSON structure, types, aliases
│           ├── starter-template.md    # Minimal DTCG token set for scaffolding
│           └── platform-mapping.md    # CSS, Tailwind, SCSS output guidance
```

### Approach: Tiered — Inline Essentials + References

**SKILL.md** inlines the naming taxonomy and tier system (always needed). Heavier material (DTCG spec, starter template, platform mapping) lives in `references/` and is loaded on-demand via explicit pointers in the skill.

---

## 3. SKILL.md Content Architecture (~340 lines)

### 3.1 Trigger & Scope (~20 lines)
- Activation conditions and keyword list
- Frontmatter with name and description

### 3.2 The 3-Tier Token Hierarchy (~60 lines)

Three tiers, each referencing the one below:

| Tier | Purpose | Example |
|-|-|-|
| **Primitive** | Raw values on a scale, no semantic meaning | `color.blue.600`, `space.4`, `font.size.300` |
| **Semantic** | Intent-based, references primitives | `color.background.danger`, `space.inline.md` |
| **Component** | Scoped to UI elements, references semantic | `button.color.background.primary.hover` |

**Rules:**
- Never skip tiers (component must not directly reference primitive)
- Primitives are the only tier with raw values
- Semantic tokens encode *intent*, not visual description
- Component tokens are optional — only create them when a component needs to diverge from the semantic layer

### 3.3 Naming Taxonomy (~120 lines) — Core of the Skill

**The Formula:**

```
{namespace}.{category}.{concept}.{property}.{variant}.{scale}.{state}
```

**Levels are selectively included** — never use all 7 unless needed. Ordered from most stable to most volatile.

| Level | Definition | When to Include | Examples |
|-|-|-|-|
| **namespace** | System/brand identifier | Multi-system orgs, design system libraries | `acme`, `nord`, `ds` |
| **category** | Token type | Always | `color`, `space`, `font`, `shadow`, `border`, `motion`, `opacity`, `radius`, `z`, `breakpoint`, `size` |
| **concept** | Semantic role or grouping | Semantic + component tiers | `background`, `text`, `border`, `surface`, `interactive`, `feedback`, `inline`, `stack` |
| **property** | Specific attribute | When concept is ambiguous | `family`, `size`, `weight`, `line-height`, `duration`, `easing`, `width`, `style` |
| **variant** | Named variation | When element has variants | `primary`, `secondary`, `danger`, `success`, `warning`, `info`, `neutral`, `inverse` |
| **scale** | Position on a scale | Primitive tier scales; sizing | `50`–`950` (colors), `xs`/`s`/`m`/`l`/`xl` (t-shirt), `1`–`12` (numeric) |
| **state** | Interactive/contextual state | Component tier, interactive elements | `hover`, `active`, `focus`, `disabled`, `pressed`, `visited` |

**Separator conventions:**
- `.` (dot) in token definition files (DTCG JSON groups)
- `-` (hyphen) in CSS custom properties output
- Token names are `kebab-case` within each level

**Naming examples per tier:**

Primitive:
- `color.blue.600`
- `color.neutral.100`
- `space.4` (= 16px on 4px base)
- `font.size.300`
- `font.weight.semibold`
- `shadow.elevation.2`
- `motion.duration.fast`
- `motion.easing.ease-out`
- `radius.md`
- `opacity.subtle`

Semantic:
- `color.background.surface`
- `color.background.danger`
- `color.text.primary`
- `color.text.on-primary`
- `color.border.default`
- `color.interactive.default`
- `color.feedback.success`
- `space.inline.md`
- `space.stack.lg`
- `font.heading.size`
- `font.body.line-height`
- `shadow.overlay`

Component:
- `button.color.background.primary`
- `button.color.background.primary.hover`
- `button.color.text.primary`
- `button.space.padding.md`
- `button.radius`
- `input.color.border.default`
- `input.color.border.focus`
- `input.color.border.error`
- `card.shadow.default`
- `card.shadow.hover`

### 3.4 Token Categories Covered (~80 lines)

For each category, the skill defines: which tiers apply, primitive scale conventions, semantic naming patterns, and common pitfalls.

| Category | Primitive Scale | Semantic Examples | Notes |
|-|-|-|-|
| **Color** | Hue scales 50–950, neutral scale | `background.*`, `text.*`, `border.*`, `interactive.*`, `feedback.*` | Most tokens live here; use `on-*` for contrast pairs |
| **Typography** | `font.size.100–900`, `font.weight.*`, `font.family.*` | `font.heading.*`, `font.body.*`, `font.caption.*` | Composite tokens combine family+size+weight+lineHeight |
| **Spacing** | 4px base grid: `space.1`–`space.16` or t-shirt | `space.inline.*`, `space.stack.*`, `space.inset.*` | Distinguish inline (horizontal) vs. stack (vertical) vs. inset (padding) |
| **Sizing** | `size.1`–`size.16` | `size.icon.*`, `size.avatar.*` | Often overlaps spacing; keep separate for semantic clarity |
| **Border** | `border.width.*`, `border.style.*` | `border.default`, `border.strong` | Width uses numeric scale (1, 2, 4) |
| **Border Radius** | `radius.none`/`xs`/`s`/`m`/`l`/`xl`/`full` | `radius.interactive`, `radius.container` | `full` = pill/circle |
| **Shadow** | `shadow.elevation.1`–`shadow.elevation.5` | `shadow.overlay`, `shadow.dropdown`, `shadow.modal` | Elevation scale maps to UI layering |
| **Z-Index** | `z.base`/`dropdown`/`sticky`/`modal`/`toast` | Same as primitive (z-index is inherently semantic) | Use named positions, not arbitrary numbers |
| **Breakpoints** | `breakpoint.sm`/`md`/`lg`/`xl`/`2xl` | Same as primitive | Mobile-first values |
| **Motion** | `motion.duration.instant`/`fast`/`normal`/`slow`, `motion.easing.*` | `motion.transition.default`, `motion.enter`, `motion.exit` | Duration + easing compose into transitions |
| **Opacity** | `opacity.subtle`/`medium`/`strong`/`opaque` | `opacity.disabled`, `opacity.overlay` | Small set, usually 4–6 values |

### 3.5 Decision Framework (~40 lines)

**"Should I create a token?"**
1. Is this value used in 2+ places? → Yes, tokenize
2. Is this value likely to change with theming/branding? → Yes, tokenize
3. Is this a one-off value for a unique element? → No, use a raw value
4. Does a semantic token already express this intent? → Use existing, don't duplicate

**Tier selection:**
- Raw design value → Primitive
- Value expresses UI intent (background, text, feedback) → Semantic
- Value is specific to one component and diverges from semantic layer → Component

**Token proliferation guard (YAGNI):**
- Start with primitives + semantic. Add component tokens only when needed.
- A component token that just aliases a semantic token with no override adds no value — skip it.
- Fewer well-named tokens > many granular tokens nobody remembers.

### 3.6 Reference Pointers (~20 lines)

- **Creating or reading `.tokens.json` files?** → Load `references/dtcg-format.md`
- **Starting a new project with no tokens?** → Load `references/starter-template.md`
- **Outputting tokens to CSS, Tailwind, or SCSS?** → Load `references/platform-mapping.md`

---

## 4. Reference Files

### 4.1 `references/dtcg-format.md` (~150 lines)

W3C Design Tokens Community Group JSON format specification:
- File structure: tokens as JSON objects with `$value`, `$type`, `$description`
- All official token types: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`
- Composite types: `shadow`, `border`, `transition`, `gradient`, `typography`, `strokeStyle`
- Alias syntax: `{group.token}` for referencing other tokens
- Group nesting with `$type` inheritance
- `$extensions` for vendor-specific metadata
- `$deprecated` for lifecycle management
- File extensions: `.tokens` or `.tokens.json`
- Type inheritance precedence: explicit `$type` > parent group `$type` > referenced token type
- Validation rules: no circular references, no guessing types from values

### 4.2 `references/starter-template.md` (~120 lines)

A complete minimal DTCG JSON token set, annotated. Covers:

**Primitive layer:**
- Color: neutral scale (50–950), brand primary + secondary (50–950), feedback colors (success, warning, danger, info — each with base + light + dark)
- Typography: 2 font families (sans, mono), size scale (100–900), weight scale (regular, medium, semibold, bold), line-height scale (tight, normal, relaxed)
- Spacing: 4px base, scale 1–16
- Border: width (1, 2, 4), radius (none, xs, s, m, l, xl, full)
- Shadow: 3-level elevation
- Motion: 4 durations (instant, fast, normal, slow), 3 easings (ease-out, ease-in-out, linear)
- Opacity: 4 values (subtle, medium, strong, opaque)

**Semantic layer:**
- Color semantic tokens referencing primitives: background (surface, primary, danger, etc.), text (primary, secondary, on-primary, etc.), border (default, strong, interactive), interactive (default, hover, active), feedback (success, warning, danger, info)
- Typography semantic composites: heading, body, caption
- Spacing semantic: inline (sm, md, lg), stack (sm, md, lg), inset (sm, md, lg)

Explicitly framed as scaffolding — the agent should adapt to project needs, not copy verbatim.

### 4.3 `references/platform-mapping.md` (~80 lines)

**CSS Custom Properties (primary focus):**
- Naming transform: dot notation → hyphen (`color.background.surface` → `--color-background-surface`)
- Organization: group under `:root`, use `[data-theme="dark"]` for theme overrides
- Example output mapping

**Tailwind CSS:**
- Mapping tokens to `theme.extend` in `tailwind.config`
- Color, spacing, fontSize, borderRadius, boxShadow mapping patterns

**SCSS:**
- `$variable` mapping with maps for scales
- Mixin patterns for composite tokens (typography)

**Other platforms (brief):**
- React Native: JS/TS object export
- iOS (Swift): enum/struct patterns
- Android: XML resources
- Emphasis: the token layer is the source of truth; platform outputs are transforms

**Style Dictionary:**
- Mentioned as the primary transform pipeline tool
- Basic config structure for transforms

---

## 5. Marketplace Registration

```json
{
  "name": "uiux-design-tokens",
  "source": "plugins/uiux-design-tokens",
  "description": "Guide coding agents on design token best practices: 3-tier hierarchy, naming taxonomy, W3C DTCG format, and platform mapping",
  "version": "1.0.0",
  "category": "development",
  "tags": ["design-system", "tokens", "css", "theming", "ui"],
  "keywords": ["design tokens", "design system", "DTCG", "W3C", "CSS variables", "theme", "token naming", "style dictionary", "primitives", "semantic tokens"]
}
```

---

## 6. Design Decisions & Rationale

| Decision | Choice | Rationale |
|-|-|-|
| Token standard | W3C DTCG primary, agnostic when needed | Emerging industry standard; broadest tooling support |
| Naming system | Opinionated 7-level formula | Research synthesis from Nathan Curtis, Lukas Oppermann, GitLab, Nord, Vodafone; agents need concrete rules, not vague principles |
| Tier count | 3 (primitive/semantic/component) | Industry consensus; component tier is optional to prevent over-engineering |
| Separator | `.` in tokens, `-` in CSS | DTCG uses dot for JSON nesting; CSS convention is hyphens |
| Skill structure | Tiered (inline essentials + references) | Core naming always loaded; heavier DTCG spec and templates on-demand |
| Platform focus | Token-first abstract, web/CSS detailed | Most agents work on web; other platforms get brief coverage |
| Starter template | Optional scaffolding, not prescription | Gives agents a fast start without being rigid |
| Trigger scope | Design system work + explicit token mentions | Broad enough to be useful, narrow enough to not fire on every CSS file |

---

## 7. Research Sources

- Penpot blog: "Design Tokens for Designers" (2025)
- W3C DTCG Format Specification (designtokens.org)
- Nathan Curtis / EightShapes: "Naming Tokens in Design Systems"
- Smashing Magazine: "Best Practices For Naming Design Tokens" (2024)
- Smart Interface Design Patterns: "How To Name Design Tokens"
- GitLab Pajamas: Design Token Authoring Guidelines
- Nord Design System: Naming Conventions
- Lukas Oppermann: "Naming Design Tokens" — what/where/how framework
- Vodafone UK: Variables Taxonomy Map
