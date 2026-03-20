---
name: uiux-design-system
description: >
  Comprehensive design system architecture guide: 3-tier token hierarchy, W3C DTCG format,
  component naming and inventory, UX decision patterns, content and voice, layout and
  responsive rules, motion, accessibility standards, and completeness checklists.
  ALWAYS use this skill when: building or modifying a design system, creating theme
  configurations, working with token files (.tokens, .tokens.json), defining CSS custom
  properties for theming, structuring design variables, naming components, establishing
  UX patterns, defining content voice, or architecting a design system from scratch.
  Also trigger when the user mentions: design tokens, token naming, DTCG, design system,
  theme tokens, primitive/semantic/component tokens, token hierarchy, style dictionary,
  design variables, component naming, variant system, design system architecture,
  UX patterns, content voice, design template.
  Trigger keywords: design system, design tokens, token naming, DTCG, W3C, theme tokens,
  CSS variables, style dictionary, primitives, semantic tokens, component tokens,
  token hierarchy, design variables, theming, component naming, UX patterns,
  design architecture, design template, component library, variant system.
---

# Design System Architecture

Comprehensive guide for architecting production design systems — from token foundations through component architecture, UX patterns, and accessibility standards. Follows W3C DTCG standards and industry best practices.

Design tokens are the atomic values of a design system — colors, spacing, typography, shadows, and more — stored as platform-agnostic data. They bridge the gap between design tools and code, ensuring consistency across platforms and products. But a complete design system extends beyond tokens to include component architecture, naming conventions, UX decision patterns, content voice, and accessibility standards.

## Before You Start

Read the reference files in this skill's `references/` directory as needed:

- **`references/design-system-template.md`** — Complete, tool-agnostic design system architecture template. Covers component naming/inventory/variants/annotations, typography scale, layout/grid, motion/animation, pattern recipes, UX decision patterns, product screen patterns, content/voice, icon specs, responsive rules, accessibility standards (WCAG 2.2 AA), and completeness checklist. **Start here when architecting a new design system from scratch.**
- **`references/dtcg-format.md`** — W3C DTCG JSON format specification. Consult when creating or reading `.tokens` or `.tokens.json` files. Covers all token types, alias syntax, group nesting, and validation rules.
- **`references/starter-template.md`** — A minimal but complete DTCG token set covering all categories. Use as scaffolding when starting a new project with no existing tokens. Adapt to project needs, don't copy verbatim.
- **`references/platform-mapping.md`** — How to output tokens to CSS custom properties, Tailwind, SCSS, and other platforms. Consult when transforming tokens into platform-specific code.

## The 3-Tier Token Hierarchy

Design tokens are organized into three tiers. Each tier builds on the one below it, creating a layered abstraction from raw values to component-specific decisions.

| Tier | Purpose | Holds Raw Values? | Example |
|-|-|-|-|
| Primitive | Raw values on a named scale | Yes | `color.blue.600` |
| Semantic | Intent-based aliases | No | `color.background.danger` |
| Component | Scoped to UI elements | No | `button.color.background.primary.hover` |

**Primitive tokens** are the foundation. They define your design language's palette — all available colors, sizes, and values. They describe *what exists* in the system.

**Semantic tokens** assign meaning. They answer *how* primitives are used: which color is a background, which is danger text, which spacing goes between stacked elements.

**Component tokens** handle exceptions. They answer *where* a semantic value is overridden for a specific component or state.

### Referencing Chain

Tokens form a directed chain of references. Each tier only references the tier directly below it:

```
Component tokens → Semantic tokens → Primitive tokens → Raw values

button.color.background.primary.hover
  → color.interactive.hover           (semantic)
    → color.blue.700                  (primitive)
      → #1d4ed8                       (raw value)
```

When theming, you only swap values at the **primitive** tier. The semantic and component tiers remain stable, and the entire UI updates automatically through the alias chain. This is the primary benefit of the tier system — one change at the primitive level cascades through hundreds of semantic and component references.

### Rules

1. **Never skip tiers.** A component token must reference a semantic token, never a primitive directly. This ensures theming works correctly — swapping a primitive propagates through every layer without broken references.
2. **Primitives are the only source of raw values.** Hex codes, pixel values, font stacks, and cubic-bezier curves live exclusively in the primitive tier. If you find a raw value in a semantic or component token, it's a bug.
3. **Semantic tokens encode intent, not appearance.** Name them by role (`danger`, `surface`, `interactive`) rather than visual description (`red`, `light-gray`). This makes themes coherent — `color.background.danger` can be red in one theme and orange in another without renaming the token.
4. **Component tokens are optional.** Only create them when a component genuinely diverges from the semantic layer. Most components can consume semantic tokens directly without needing their own tier. A good rule of thumb: if the component token would just alias a semantic token with no modification, skip it.
5. **Start lean.** Begin with primitives + semantic tokens. Add the component tier only when real divergence demands it — premature component tokens add maintenance burden with no benefit. You can always promote a semantic reference to a component token later.

## Naming Taxonomy

### Formula

```
{namespace}.{category}.{concept}.{property}.{variant}.{scale}.{state}
```

Not every token uses all seven levels. Include only the levels that add meaning. Most primitive tokens use 2–3 levels; semantic tokens use 3–4; component tokens use 4–6.

The order is fixed. Don't rearrange levels — consistency across the system is more important than any individual token's readability.

### Levels

| Level | Definition | When to Include | Examples |
|-|-|-|-|
| namespace | System or brand identifier | Multi-system orgs | `acme`, `nord`, `ds` |
| category | Token type / domain | Always | `color`, `space`, `font`, `shadow`, `border`, `motion`, `opacity`, `radius`, `z`, `breakpoint`, `size` |
| concept | Semantic role or grouping | Semantic + component tiers | `background`, `text`, `border`, `surface`, `interactive`, `feedback`, `inline`, `stack` |
| property | Specific attribute | When concept is ambiguous | `family`, `size`, `weight`, `line-height`, `duration`, `easing`, `width`, `style` |
| variant | Named variation | When element has variants | `primary`, `secondary`, `danger`, `success`, `warning`, `info`, `neutral`, `inverse` |
| scale | Position on a value scale | Primitive tier scales / sizing | `50`–`950`, `xs`/`s`/`m`/`l`/`xl`, `1`–`12` |
| state | Interactive / contextual state | Component tier / interactive elements | `hover`, `active`, `focus`, `disabled`, `pressed`, `visited` |

**Minimum required levels:** Every token needs at least `category` + one more level. A bare `color` is too vague; `color.blue.600` or `color.background.surface` is specific enough to be useful.

**Maximum practical depth:** Tokens deeper than 5 levels become unwieldy. If you find yourself at 6–7 levels, consider whether some levels can be flattened or whether the token belongs in a different category.

### Separator Conventions

- **Token files** (`.tokens`, `.tokens.json`): use `.` as the separator — `color.blue.600`
- **CSS custom properties**: use `-` as the separator — `--color-blue-600`
- **SCSS variables**: use `-` as the separator — `$color-blue-600`
- **JavaScript/TypeScript**: use camelCase — `colorBlue600` or nested objects `color.blue[600]`
- **Figma Local Variables**: use `/` as the separator — `color / blue / 600`
- **Penpot Design Tokens**: use `.` as the separator — `color.blue.600`
- **Tailwind CSS v4 classes**: use `-` in utility classes — `bg-[--color-bg-surface]`
- **Within levels**: use `kebab-case` — `line-height`, `ease-in-out`, `on-primary`
- **Never mix** separators within the same context. Don't use `color-blue.600` or `color.blue-600`.

The canonical source of truth is always the token file (using `.` separators). Platform-specific naming is derived during the build/transform step.

### Annotated Examples

These diagrams show which naming level each segment occupies:

```
color.blue.600
└─cat──┘.└concept┘.└scale┘
(primitive — raw hue value on a numeric scale)

color.background.danger
└─cat──┘.└─concept──┘.└variant┘
(semantic — intent-based, no raw value)

button.color.background.primary.hover
└─────component────────┘.└cat┘.└concept┘.└variant┘.└state┘
(component — scoped to button, includes interaction state)

font.size.300
└cat┘.└property┘.└scale┘
(primitive — numeric type scale)

space.inline.md
└cat──┘.└concept┘.└scale┘
(semantic — directional spacing with t-shirt size)
```

### Examples by Tier

**Primitive tokens** — raw values on named scales:

- `color.blue.600`, `color.neutral.100`, `color.green.500`, `color.red.600`
- `space.4`, `space.8`, `space.12`
- `font.size.300`, `font.weight.semibold`, `font.family.sans`
- `shadow.elevation.2`, `motion.duration.fast`, `motion.easing.ease-out`
- `radius.md`, `opacity.subtle`, `border.width.1`

**Semantic tokens** — intent-based aliases to primitives:

- `color.background.surface`, `color.background.danger`, `color.background.inverse`
- `color.text.primary`, `color.text.on-primary`, `color.text.secondary`, `color.text.muted`
- `color.border.default`, `color.interactive.default`, `color.feedback.success`
- `space.inline.md`, `space.stack.lg`, `space.inset.md`
- `font.heading.size`, `font.body.line-height`, `shadow.overlay`

**Component tokens** — scoped overrides for specific UI elements:

- `button.color.background.primary`, `button.color.background.primary.hover`
- `button.color.text.primary`, `button.space.padding.md`, `button.radius`
- `input.color.border.default`, `input.color.border.focus`, `input.color.border.error`
- `card.shadow.default`, `card.shadow.hover`

## Token Categories

Each category below covers the primitive scale, semantic patterns, key conventions, and common pitfalls. Not every project needs all 12 categories — start with color, typography, and spacing, then add others as your system grows.

**Priority order for new systems:** Color > Typography > Spacing > Border Radius > Shadow > Sizing > Border > Motion > Opacity > Z-Index > Breakpoints > Grid System. The first three cover ~80% of typical UI token needs.

### 1. Color

**Primitive scale:** Hue scales from `50` (lightest) to `950` (darkest), e.g. `color.blue.50` through `color.blue.950`. Include a `color.neutral.*` scale for grays. Typical hues: blue, red, green, yellow, orange, purple, pink, teal — choose only those your brand needs.

**Semantic patterns:**
- `color.background.*` — surfaces, overlays, elevated containers
- `color.text.*` — foreground content, headings, body, muted text
- `color.border.*` — dividers, outlines, separators, input borders
- `color.interactive.*` — buttons, links, focus rings, hover states
- `color.feedback.*` — success, warning, error, info states

**Convention:** Use `on-*` naming for contrast pairs. If `color.background.primary` is dark, `color.text.on-primary` is its readable foreground. Always define both sides of any contrast pair.

**Pitfall:** Don't name semantic tokens by appearance (`color.text.red`). Name by intent (`color.text.danger`). Appearance-based names break when themes change.

### 2. Typography

**Primitive scale:** `font.family.sans`, `font.family.serif`, `font.family.mono` — each holds a font stack string. Sizes: `font.size.100` (12px) through `font.size.900` (60px) on a modular or linear scale. Weights: `font.weight.regular` (400), `font.weight.medium` (500), `font.weight.semibold` (600), `font.weight.bold` (700). Line heights: `font.line-height.tight` (1.2), `font.line-height.normal` (1.5), `font.line-height.relaxed` (1.75). Letter spacing: `font.letter-spacing.tight` (-0.025em, for headings), `font.letter-spacing.normal` (0, for body), `font.letter-spacing.wide` (0.025em, for captions and all-caps text). Paragraph spacing: `font.paragraph-spacing.none` (0), `font.paragraph-spacing.md` (1rem).

**Semantic patterns:**
- `font.heading.*` — `font.heading.size`, `font.heading.weight`, `font.heading.line-height`
- `font.body.*` — `font.body.size`, `font.body.weight`, `font.body.line-height`
- `font.caption.*` — smaller supporting text
- `font.label.*` — form labels, button text, UI chrome

**Convention:** Use `rem` for font size token values, not `px`. This allows users to scale text via browser preferences — a WCAG requirement (Success Criterion 1.4.4 — Resize Text). Store values as rem in token files; design tools convert automatically using the base font size. Use DTCG composite `typography` type to bundle family + size + weight + line-height + letter-spacing into a single token for heading/body presets.

**Pitfall:** Pick one scale convention (numeric `100–900` or t-shirt `xs–xl`) and stick with it across the entire system. Mixing conventions creates confusion.

### 3. Spacing

**Primitive scale:** 4px base grid — `space.1` (4px), `space.2` (8px), `space.3` (12px), `space.4` (16px) through `space.16` (64px). Some systems also include `space.0.5` (2px) and `space.px` (1px) for fine adjustments.

**Semantic patterns:** `space.inline.*` (horizontal gaps), `space.stack.*` (vertical gaps), `space.inset.*` (padding on all sides). Each uses t-shirt sizing: `xs`, `sm`, `md`, `lg`, `xl`.

**Convention:** Distinguish direction to avoid ambiguity. `space.inline.md` is horizontal spacing; `space.stack.md` is vertical. `space.inset.md` is uniform padding.

**Pitfall:** Don't create component-specific spacing at the semantic level (`space.card-padding`). That belongs in the component tier as `card.space.inset`.

### 4. Sizing

**Primitive scale:** `size.1` (4px) through `size.16` (64px), following the same base grid as spacing.

**Semantic patterns:** `size.icon.sm` (16px), `size.icon.md` (20px), `size.icon.lg` (24px), `size.avatar.sm` (32px), `size.avatar.md` (40px), `size.avatar.lg` (48px).

**Convention:** Keep sizing separate from spacing. They share a scale but serve different purposes — sizing controls width/height of elements, spacing controls the gaps between them.

**Pitfall:** Don't conflate size and spacing tokens. `space.4` and `size.4` may resolve to the same value (16px) but carry different semantic meaning.

### 5. Border

**Primitive scale:** `border.width.1` (1px), `border.width.2` (2px), `border.width.4` (4px). Styles: `border.style.solid`, `border.style.dashed`, `border.style.dotted`.

**Semantic patterns:** Compose width + style + color into semantic composite tokens using the DTCG `border` type. For example, `border.default` might compose `border.width.1` + `border.style.solid` + `color.border.default`.

**Convention:** Use the DTCG composite `border` type to bundle `width`, `style`, and `color` into a single token. This keeps border definitions atomic and themeable.

**Pitfall:** Don't define border colors separately from the color category. Border colors belong under `color.border.*` in the semantic tier, and the border composite references them.

### 6. Border Radius

**Primitive scale:** `radius.none` (0), `radius.xs` (2px), `radius.s` (4px), `radius.m` (8px), `radius.l` (12px), `radius.xl` (16px), `radius.full` (9999px).

**Semantic patterns:** `radius.interactive` (buttons, inputs), `radius.container` (cards, modals, dialogs).

**Convention:** `full` means pill-shaped (9999px) — used for tags, avatars, and fully rounded buttons. The `none` value is explicit zero, not the absence of a token.

**Pitfall:** Don't create too many radius values. Most systems need 5–7 at most. If you have more, some are likely redundant.

### 7. Shadow

**Primitive scale:** `shadow.elevation.1` through `shadow.elevation.5`, from subtle to dramatic. Each level is a DTCG `shadow` type with `offsetX`, `offsetY`, `blur`, `spread`, and `color`.

**Semantic patterns:** `shadow.overlay`, `shadow.dropdown`, `shadow.modal`, `shadow.card` — mapped to UI layering contexts.

**Convention:** Map shadow levels to specific UI layering. Elevation 1 for cards, 2 for dropdowns, 3 for modals, etc. This makes it easy to reason about visual depth.

**Pitfall:** Don't create shadows with arbitrary values. Stick to the elevation scale and let semantic tokens choose the appropriate level.

### 8. Z-Index

**Named positions:** `z.base` (0), `z.dropdown` (1000), `z.sticky` (1100), `z.modal` (1300), `z.toast` (1400).

**Convention:** Z-index tokens are inherently semantic — there is no meaningful primitive tier. Skip straight to named positions. No component tier needed. Define gaps between values (e.g. increments of 100) to allow insertion of new layers without renumbering.

**Pitfall:** Never use raw z-index numbers in code. Competing z-indexes are the source of most layering bugs. The token set defines a strict stacking order that everyone on the team must follow.

### 9. Breakpoints

**Named positions:** `breakpoint.sm` (640px), `breakpoint.md` (768px), `breakpoint.lg` (1024px), `breakpoint.xl` (1280px), `breakpoint.2xl` (1536px).

**Convention:** Mobile-first. Breakpoints are inherently semantic. Values define the minimum width at which each breakpoint activates. They are typically used only in CSS media queries and build configurations, not in component styles directly.

**Pitfall:** Don't tie breakpoints to specific devices (`breakpoint.iphone`). Devices change constantly; named sizes are stable. Also avoid creating too many breakpoints — 4 to 5 is sufficient for most responsive layouts.

### 10. Motion

**Primitive scale — Duration:** `motion.duration.instant` (0ms), `motion.duration.fast` (150ms), `motion.duration.normal` (300ms), `motion.duration.slow` (500ms).

**Primitive scale — Easing:** `motion.easing.ease-out`, `motion.easing.ease-in-out`, `motion.easing.linear`. Store as cubic-bezier values.

**Semantic patterns:** `motion.transition.default` (general UI transitions), `motion.enter` (elements appearing), `motion.exit` (elements disappearing).

**Convention:** Compose duration + easing into semantic transition tokens using the DTCG `transition` composite type. `motion.transition.default` might compose `motion.duration.fast` + `motion.easing.ease-out`.

**Pitfall:** Don't create too many duration tokens. Most UIs need only 3–4 distinct durations. Too many speeds make motion feel inconsistent.

### 11. Opacity

**Primitive scale:** `opacity.subtle` (0.1), `opacity.medium` (0.5), `opacity.strong` (0.8), `opacity.opaque` (1.0). Some systems add `opacity.none` (0) for fully transparent states.

**Semantic patterns:** `opacity.disabled` (disabled controls, typically 0.5), `opacity.overlay` (backdrop overlays, typically 0.5–0.8), `opacity.placeholder` (placeholder text).

**Convention:** Keep the set small — 4 to 6 values. Opacity rarely needs a large scale.

**Pitfall:** If you find yourself creating many opacity tokens, reconsider whether you should be using color tokens with alpha channels instead (e.g. `rgba(0,0,0,0.5)` as a color primitive rather than a separate opacity token applied to a solid color).

### 12. Grid System

**Tokens per breakpoint:** `grid.columns` (4/8/12), `grid.gutter` (16px/24px/24px), `grid.margin` (16px/24px/auto), `grid.max-width` (1280px for desktop).

**Convention:** Grid tokens are inherently responsive — define values per breakpoint. They bridge spacing tokens (gaps between elements) and layout structure (column arrangement). Follow the 8-point grid: all spacing and sizing dimensions are multiples of 8, with 4px for fine adjustments.

**Pitfall:** Don't over-tokenize the grid. Most systems need 3–4 breakpoint configurations. The grid is structural scaffolding, not a design decision that changes frequently.

## Accessibility Tokens

SOTA 2025 embeds accessibility at the token level — driven by WCAG 2.2 requirements and the European Accessibility Act (EAA, effective June 2025). Define these tokens once; every component inherits compliance.

### Focus Ring

Every interactive element needs a visible focus indicator.

- `color.border.focus-ring` — focus ring color (must meet 3:1 contrast ratio per WCAG 2.4.7/2.4.13)
- `border.width.focus-ring` — ring width (minimum 2px recommended)
- `space.focus-ring.offset` — gap between element and ring (2px typical)

These are semantic tokens referencing primitives. They participate in theming — dark mode shifts focus ring color for contrast, high-contrast mode makes it bolder.

### Touch Target Size

WCAG 2.5.8 (Level AA) requires interactive targets of at least 24×24 CSS pixels.

- `size.touch-target.min` — 24px (AA minimum)
- `size.touch-target.comfortable` — 44px (AAA / Apple HIG recommended)

Apply to buttons, links, checkboxes, radio buttons, and any tappable element.

### Reduced Motion

A semantic token that gates all animation:

- `motion.reduce` — `false` default / `true` when `prefers-reduced-motion: reduce` active

When active, all `motion.duration.*` tokens resolve to `0ms`. WCAG Level A requires motion over 5 seconds can be paused.

**Convention:** Implement via a CSS custom property that flips at the media query boundary, so components do not need individual `@media prefers-reduced-motion` blocks.

### Contrast Pair Documentation

Every semantic color pair (background + foreground) should document its contrast ratio. Maintain a contrast matrix:

| Pair | Light | Dark | WCAG |
|-|-|-|-|
| `color.bg.surface` / `color.text.primary` | 12.1:1 | 11.4:1 | AAA |
| `color.bg.brand` / `color.text.on-brand` | 5.2:1 | 5.2:1 | AA |

AA = 4.5:1 (normal text), AAA = 7:1. This is a documentation practice, not a token type — it prevents accessibility regressions when updating color primitives.

## Theming & Modes

### Standard Modes

SOTA 2025 requires at minimum three modes:

| Mode | Purpose |
|-|-|
| Light | Default — light backgrounds, dark text |
| Dark | Inverted neutral scale, adjusted feedback colors |
| High Contrast | Maximum contrast ratios, bolder borders, no transparency — WCAG AAA and `forced-colors` support |

### Dark Mode Swap Rules

Only swap primitive values — semantic aliases stay untouched. When you swap `color.neutral.50` from `#fafafa` to `#0a0a0a`, every semantic token referencing it updates automatically.

Key adjustments beyond simple inversion:

- Shadows need higher opacity (dark surfaces don't reveal subtle shadows)
- Feedback backgrounds shift to 900–950 end of hue scale instead of 50
- Feedback text shifts to 300 end instead of 700 for readability on dark surfaces
- Primary interactive colors shift 1–2 stops lighter to maintain contrast

### High-Contrast Mode

Semantic tokens remap to maximum-contrast primitives. No intermediate grays, bolder borders, no transparency. Maps to Windows High Contrast / CSS `forced-colors` media query.

> For Tailwind v4 dark mode implementation (ThemeProvider, `@custom-variant`, OKLCH), see the `uiux-design-tailwindv4` skill and its `references/dark-mode.md`.

## Component Token Patterns

### State Matrix

Every interactive component needs tokens for these 5 states:

| State | Visual Treatment | Token Pattern |
|-|-|-|
| Default | Base colors | `{component}.color.{property}.{variant}` |
| Hover | Darker/lighter background | `{component}.color.{property}.{variant}.hover` |
| Focus | Focus ring applied | Uses `color.border.focus-ring` token |
| Active | Pressed visual shift | `{component}.color.{property}.{variant}.active` |
| Disabled | Reduced opacity, no interaction | `{component}.color.{property}.{variant}.disabled` |

### Common Patterns

Only create component tokens when diverging from semantics:

**Button:**
- `button.color.background.primary.default` → `{color.interactive.default}`
- `button.color.background.primary.hover` → `{color.interactive.hover}`
- `button.color.background.primary.active` → `{color.interactive.active}`
- `button.color.background.primary.disabled` → `{color.interactive.disabled}`
- `button.color.text.primary` → `{color.text.on-primary}`
- `button.radius` → `{radius.interactive}`
- `button.space.padding-x` → `{space.inline.md}`
- `button.space.padding-y` → `{space.inset.sm}`

**Input:**
- `input.color.border.default` → `{color.border.default}`
- `input.color.border.focus` → `{color.border.focus-ring}`
- `input.color.border.error` → `{color.feedback.danger}`
- `input.radius` → `{radius.interactive}`

## Decision Framework

Use these guidelines to make consistent tokenization decisions across your team.

### Should I Create a Token?

Ask these four questions before creating any new token:

1. **Is this value used in 2+ places?** If yes, tokenize it. If it's truly a one-off, a local value is fine.
2. **Would this value change with theming?** If yes, it must be a token regardless of reuse count. Even a single-use value needs a token if it participates in theme switching.
3. **Is this a one-off override?** If yes, skip the token. Use a local value or a component-tier token scoped to that specific use case.
4. **Does an existing token already cover this intent?** If yes, use the existing token. Don't create `color.background.card-surface` if `color.background.surface` already serves the same purpose.

Score 2+ "yes" answers on questions 1–2 → create a token.

**Quick litmus test:** If removing a value and replacing it with a token reference would make the codebase easier to update during a rebrand or theme change, it should be a token.

### Which Tier?

- **Raw value** (hex code, px value, font stack, bezier curve) → **Primitive**
- **UI intent** (background purpose, text role, spacing direction) → **Semantic**
- **Component-specific divergence** from semantic defaults → **Component**

When in doubt between semantic and component, start at the semantic tier. Promote to component only when a specific UI element needs to deviate from the system-wide semantic value.

**Common examples:**
- A button whose hover color doesn't follow the standard interactive color → component token
- A card that uses the same background as all other surfaces → semantic token (no component token needed)
- A data table with a unique alternating row color → component token

### Token Proliferation Guard

- **Start lean.** Launch with the minimum set that covers your UI. You can always add tokens later; removing unused ones is harder.
- **Alias test.** If a new semantic token would just alias a primitive with no added meaning, skip it. The alias must encode intent beyond what the primitive name already provides.
- **Fewer, well-named tokens > many granular tokens.** Each token is a maintenance commitment. A system with 50 well-named tokens is better than one with 200 poorly organized ones.
- **Consolidate outliers.** If two tokens always hold the same value and serve the same intent, merge them into one.
- **Review regularly.** Audit tokens quarterly. Remove unused ones, merge duplicates, and rename tokens that no longer match their intent.
- **Document decisions.** When you create a token, briefly note why it exists. Future maintainers will thank you when they need to decide whether to keep it or consolidate it.

### Governance

Treat token sets like code — use semantic versioning (MAJOR.MINOR.PATCH). A new token is a minor bump. Renaming or removing a token is a major bump. Audit tokens quarterly: remove unused ones, merge duplicates, update names that no longer match their intent.

## When to Load Reference Files

Consult the appropriate reference file based on what you're doing:

| Situation | Reference to Load |
|-|-|
| Architecting a new design system from scratch | `references/design-system-template.md` |
| Component naming, inventory, or variant system | `references/design-system-template.md` |
| UX decision patterns (forms, feedback, data display) | `references/design-system-template.md` |
| Content voice, terminology, or icon specs | `references/design-system-template.md` |
| Responsive rules, motion/animation specs | `references/design-system-template.md` |
| Accessibility standards (WCAG 2.2 AA) or completeness checklist | `references/design-system-template.md` |
| Creating or reading `.tokens` / `.tokens.json` files | `references/dtcg-format.md` |
| Validating token JSON structure or types | `references/dtcg-format.md` |
| Starting a new project with no existing tokens | `references/starter-template.md` |
| Need a quick token starting point to adapt | `references/starter-template.md` |
| Outputting tokens to CSS custom properties | `references/platform-mapping.md` |
| Generating Tailwind theme config from tokens | `references/platform-mapping.md` |
| Creating SCSS variables or maps from tokens | `references/platform-mapping.md` |
| Setting up Style Dictionary or token pipelines | `references/platform-mapping.md` |
| Adding accessibility tokens (focus ring, touch target) | `references/starter-template.md` |
| Implementing dark mode or high-contrast CSS | `references/platform-mapping.md` |
| Setting up reduced-motion overrides | `references/platform-mapping.md` |

You don't need to load all references at once. Load them on demand based on the task at hand. If you're only advising on naming, hierarchy, or reviewing existing tokens, this SKILL.md alone is sufficient — no reference files needed.

For building a full design system from scratch, start with `design-system-template.md` for the architecture, then `starter-template.md` for token scaffolding, `dtcg-format.md` for validation, and `platform-mapping.md` when ready to output.
