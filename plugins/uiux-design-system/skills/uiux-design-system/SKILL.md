---
name: uiux-design-system
description: >
  Comprehensive design system architecture guide: component hierarchy (atoms/molecules/organisms/patterns/screens),
  3-tier token system (primitive/semantic/component), W3C DTCG format, naming conventions, UX decision patterns,
  layout decisions (Flex vs Grid), content voice, responsive rules, accessibility standards, and visual reference
  structuring. ALWAYS use this skill when: building or modifying a design system, creating theme configurations,
  working with token files (.tokens, .tokens.json), defining CSS custom properties for theming, structuring
  design variables, naming or organizing components, establishing UX patterns, organizing screenshots or
  visual references for a design system, choosing layout approaches, or architecting a design system from scratch.
  Also trigger when the user mentions: design tokens, token naming, DTCG, design system, theme tokens,
  primitive/semantic/component tokens, token hierarchy, style dictionary, design variables, component naming,
  variant system, design system architecture, UX patterns, content voice, design template, atomic design,
  screenshot structure, visual references, component inventory.
  Trigger keywords: design system, design tokens, token naming, DTCG, W3C, theme tokens, CSS variables,
  style dictionary, primitives, semantic tokens, component tokens, token hierarchy, design variables,
  theming, component naming, UX patterns, design architecture, design template, component library,
  variant system, atoms, molecules, organisms, patterns, visual reference, screenshot naming.
---

# Design System Architecture

Comprehensive guide for architecting production design systems — from component hierarchy and token foundations through UX patterns, layout decisions, and accessibility standards. Follows W3C DTCG standards, atomic design methodology, and industry best practices.

A complete design system covers:
- **Component architecture** — atomic tiers, naming, variants, composition rules
- **Design tokens** — the value layer (colors, spacing, typography) that components consume
- **Patterns & screens** — reusable layout recipes, section templates, product page compositions
- **UX decisions** — form behavior, feedback patterns, data display choices
- **Content & voice** — tone, grammar, terminology consistency
- **Accessibility** — WCAG 2.2 AA compliance baked into tokens and components
- **Responsive behavior** — breakpoints, layout adaptation, platform-specific rules

## Reference Files

Read on demand based on your current task:

### Architecture & Components
- **`references/design-system-template.md`** — Full design system template: complete component inventory (all atoms/molecules/organisms with every variant and state listed out), typography scale, layout/grid specs, motion/animation, full pattern recipe lists, UX decision pattern tables, product screen compositions, content/voice guidelines with terminology glossary, icon specs, responsive rules, accessibility standards, and completeness checklist. **Start here when architecting a new design system from scratch.**
- **`references/componentization-guide.md`** — When to componentize, granularity decisions (split vs monolithic), variant architecture (multi-axis vs split), token binding through the hierarchy, instance vs fresh build, composition patterns (flat, slot-based, responsive), scaling to 100+ screens, anti-patterns checklist, and decision trees. **Read when deciding component boundaries or reviewing component quality.**

### Token Implementation
- **`references/dtcg-format.md`** — W3C DTCG JSON format specification: all simple and composite token types, alias syntax, group nesting, type inheritance, validation rules. **Read when creating or validating `.tokens` / `.tokens.json` files.**
- **`references/starter-template.md`** — Minimal but complete DTCG token set (primitives + semantics) ready to adapt. **Use as scaffolding for new projects with no existing tokens.**
- **`references/platform-mapping.md`** — Outputting tokens to CSS custom properties, Tailwind v4 `@theme`, SCSS, Style Dictionary, React Native, iOS Swift, Android. **Read when transforming tokens into platform-specific code.**

### Shared Design Knowledge (tool-agnostic)
These are used by tool-specific plugins (`uiux-design-penpot`, `uiux-design-figma`) and workflow orchestrators (`uiux-image2design`). **Tool plugins MUST read these from here** — they are not duplicated into tool-specific plugins.

- **`references/component-patterns.md`** — UI component specs: buttons, forms, navigation, cards, modals, dashboards, empty/loading states. Variants, states, accessibility, best practices. **Read when creating or reviewing any UI component.**
- **`references/accessibility.md`** — WCAG 2.2 AA: color contrast, touch targets, focus management, screen reader patterns, keyboard navigation, ARIA quick reference. **Read when designing any user-facing interface.**
- **`references/platform-guidelines.md`** — Screen sizes, safe areas, platform-specific specs for iOS HIG, Android Material Design, responsive web, desktop. **Read when targeting a specific platform or device.**
- **`references/color-utilities.md`** — Pure-math color converters (OKLCH→hex, HSL→hex, RGB→hex), palette generation, WCAG contrast ratio calculation. No dependencies. **Read when converting colors between formats or validating contrast.**
- **`references/layout-patterns.md`** — Flex vs Grid decision matrix with 5 patterns: equal-size grids, button-at-bottom alignment, responsive wrap, nested layouts, fluid design without breakpoints. **Read when choosing layout approach for a specific UI.**
- **`references/token-binding-strategy.md`** — Binding tokens to shapes in design tools: greenfield (inline at creation), brownfield (sweep with confidence scoring), token map pattern, reverse map builder, coverage reporting. Tool-agnostic strategy — tool plugins implement API calls. **Read when implementing or auditing token binding.**

You don't need to load all references at once. If you're advising on naming, hierarchy, or reviewing existing tokens, this SKILL.md alone is sufficient.

---

## Component Architecture

Design systems organize UI into tiers of increasing complexity using **atomic design** — the industry standard shared by Figma, Penpot, and code-based systems.

### The 5 Tiers

| Tier | What it is | Examples |
|-|-|-|
| **Atoms** | Smallest meaningful UI unit. Has states, no sub-components | button, input, badge, avatar, toggle, checkbox, radio, divider, tooltip, spinner |
| **Molecules** | Small group of atoms functioning as a unit | form-field, card, nav-item, dropdown, toast, alert, search-bar, pagination |
| **Organisms** | Complex UI sections composed of molecules + atoms | header, sidebar, data-table, modal, footer, command-palette |
| **Patterns** | Reusable layout/section/state recipes (not registered as components) | layout templates, section recipes (hero, pricing), state patterns (empty, loading, error) |
| **Screens** | Full-page compositions at specific breakpoints | landing/desktop, dashboard/default, settings/profile, auth/login |

### Component Naming Convention

Slash-separated hierarchy creates nested groups in asset panels:

```
{tier}/{component}/{variant-type}/{variant-value}
```

```
atoms/button/primary/default       atoms/input/text/focus
atoms/button/primary/hover         atoms/badge/status/success
atoms/button/secondary/disabled    atoms/avatar/image/lg
molecules/card/content/default     molecules/form-field/error
molecules/dropdown/single/open     molecules/toast/success
organisms/header/desktop/default   organisms/sidebar/expanded/default
organisms/header/mobile/menu-open  organisms/data-table/empty
organisms/modal/confirm/default    organisms/footer/mega/default
```

For components with multiple variant axes, prefer **variant properties** over encoding everything in the slash-name:

```
Component: atoms/button
Variant properties:
  - style:  primary | secondary | outline | ghost | danger
  - size:   sm | md | lg
  - state:  default | hover | active | disabled | loading
```

### Responsive Variants

Breakpoints are component variants, not separate trees:

```
organisms/header/desktop/default
organisms/header/tablet/default
organisms/header/mobile/menu-open
```

Each organism and pattern should have frames at standard breakpoints (1440px desktop, 768px tablet, 375px mobile).

### Key Componentization Rules

- **Register when**: used 3+ times, has interactive states, represents enforced design decision, or needs change propagation
- **Keep as one-off when**: used once or twice, purely compositional, or >50% overrides needed
- **Split sub-components when**: parts are independently reusable, or variant combinations exceed ~50
- **Start monolithic, split when pain appears** — easier to split a working component than merge scattered one-offs
- **After registering atoms, all higher tiers MUST use component instances** — never rebuild a button shape inside a card if a button component exists

For detailed decision trees and anti-patterns, read `references/componentization-guide.md`.

---

## Visual Reference Naming

When organizing screenshots or visual references to inform a design system, use a flat naming convention that maps directly to the component tiers:

```
{tier}--{component}.{breakpoint}.{variant}.{state}.png
```

| Segment | Values | Purpose |
|-|-|-|
| tier | `atom`, `molecule`, `organism`, `pattern`, `screen` | Maps 1:1 to component architecture |
| component | kebab-case element name | What UI piece |
| breakpoint | `tablet`, `mobile` (omit for desktop — it's the default) | Responsive variant |
| variant | `primary`, `compact`, `dark`, `collapsed`, etc. | Optional variation |
| state | `hover`, `active`, `error`, `loading`, `empty`, etc. | Optional interaction state |

```
screen--dashboard.png                    # desktop (implied default)
screen--dashboard.tablet.png
screen--dashboard.mobile.png
organism--header.png
organism--header.mobile.menu-open.png
organism--sidebar.collapsed.png
molecule--card.content.hover.png
molecule--form-field.error.png
atom--button.primary.png
atom--button.primary.hover.png
atom--input.text.focus.png
pattern--section.hero-centered.png
pattern--state.empty.png
```

**Grep-friendly patterns:**
- `screen--*` — all full screens
- `*mobile*` — all mobile breakpoints
- `*.hover.*` — all hover states
- `organism--*` — all organisms
- `atom--button*` — all button references

**Tips**: One concept per screenshot. Capture states — hover/focus/disabled drive 80% of token decisions. Dark mode gets a variant (`screen--dashboard.dark.png`), not a separate folder. Flat directory until 100+ images.

---

## The 3-Tier Token Hierarchy

Design tokens are organized into three tiers. Each builds on the one below, creating layered abstraction from raw values to component-specific decisions.

| Tier | Purpose | Holds Raw Values? | Example |
|-|-|-|-|
| Primitive | Raw values on a named scale | Yes | `color.blue.600` |
| Semantic | Intent-based aliases | No | `color.background.danger` |
| Component | Scoped to UI elements | No | `button.color.background.primary.hover` |

**Primitive tokens** define your palette — all available colors, sizes, values. They describe *what exists*.

**Semantic tokens** assign meaning — *how* primitives are used: which color is a background, which is danger text, which spacing goes between stacked elements.

**Component tokens** handle exceptions — *where* a semantic value is overridden for a specific component or state.

### Referencing Chain

```
Component tokens → Semantic tokens → Primitive tokens → Raw values

button.color.background.primary.hover
  → color.interactive.hover           (semantic)
    → color.blue.700                  (primitive)
      → #1d4ed8                       (raw value)
```

When theming, swap values at the **primitive** tier only. Semantic and component tiers stay stable — the entire UI updates through the alias chain.

### Rules

1. **Never skip tiers.** Component → semantic → primitive. No shortcuts.
2. **Primitives are the only source of raw values.** Hex codes, pixel values, font stacks live exclusively in primitives.
3. **Semantic tokens encode intent, not appearance.** Name by role (`danger`, `surface`, `interactive`) not visual (`red`, `light-gray`).
4. **Component tokens are optional.** Only create when a component genuinely diverges from semantics.
5. **Start lean.** Begin with primitives + semantics. Add component tier when real divergence demands it.

---

## Naming Taxonomy

### Formula

```
{namespace}.{category}.{concept}.{property}.{variant}.{scale}.{state}
```

Not every token uses all seven levels. Include only levels that add meaning. The order is fixed — don't rearrange.

### Levels

| Level | Definition | When to Include | Examples |
|-|-|-|-|
| namespace | System or brand identifier | Multi-system orgs | `acme`, `nord`, `ds` |
| category | Token type / domain | Always | `color`, `space`, `font`, `shadow`, `border`, `motion`, `opacity`, `radius`, `z`, `breakpoint`, `size` |
| concept | Semantic role or grouping | Semantic + component tiers | `background`, `text`, `border`, `surface`, `interactive`, `feedback`, `inline`, `stack` |
| property | Specific attribute | When concept is ambiguous | `family`, `size`, `weight`, `line-height`, `duration`, `easing` |
| variant | Named variation | When element has variants | `primary`, `secondary`, `danger`, `success`, `warning`, `info` |
| scale | Position on a value scale | Primitive tier / sizing | `50`–`950`, `xs`/`s`/`m`/`l`/`xl`, `1`–`12` |
| state | Interactive / contextual state | Component tier / interactive | `hover`, `active`, `focus`, `disabled`, `pressed` |

**Minimum:** Every token needs `category` + one more level. **Maximum practical depth:** 5 levels. Deeper becomes unwieldy.

### Annotated Examples

```
color.blue.600
└─cat──┘.└concept┘.└scale┘                (primitive — raw hue on numeric scale)

color.background.danger
└─cat──┘.└─concept──┘.└variant┘            (semantic — intent-based, no raw value)

button.color.background.primary.hover
└─comp─┘.└cat┘.└concept┘.└variant┘.└state┘ (component — scoped, includes interaction state)

space.inline.md
└cat──┘.└concept┘.└scale┘                 (semantic — directional spacing, t-shirt size)
```

### Examples by Tier

**Primitive** — raw values: `color.blue.600`, `space.4`, `font.size.300`, `font.weight.semibold`, `shadow.elevation.2`, `radius.md`, `motion.duration.fast`

**Semantic** — intent: `color.background.surface`, `color.text.primary`, `color.interactive.default`, `color.feedback.success`, `space.inline.md`, `space.stack.lg`, `font.heading.size`, `shadow.overlay`

**Component** — scoped overrides: `button.color.background.primary.hover`, `button.radius`, `input.color.border.error`, `card.shadow.hover`

### Separator Conventions

- **Token files** (`.tokens`): `.` — `color.blue.600`
- **CSS custom properties**: `-` — `--color-blue-600`
- **SCSS variables**: `-` — `$color-blue-600`
- **Figma**: `/` — `color / blue / 600`
- **Penpot**: `.` — `color.blue.600`
- **Tailwind v4 classes**: `-` — `bg-[--color-bg-surface]`
- **Within levels**: `kebab-case` — `line-height`, `ease-in-out`

The canonical source is always the token file (`.` separators). Platform naming is derived during build.

---

## Token Categories

**Priority for new systems:** Color > Typography > Spacing > Border Radius > Shadow > Sizing > Border > Motion > Opacity > Z-Index > Breakpoints > Grid. The first three cover ~80% of typical UI token needs.

### 1. Color

**Primitives:** Hue scales `50`–`950` (lightest to darkest). E.g., `color.blue.50` through `color.blue.950`. Include `color.neutral.*` for grays.

**Semantic patterns:**
- `color.background.*` — surfaces, overlays, elevated containers
- `color.text.*` — foreground content, headings, body, muted
- `color.border.*` — dividers, outlines, input borders
- `color.interactive.*` — buttons, links, focus rings, hover states
- `color.feedback.*` — success, warning, error, info

Use `on-*` for contrast pairs: `color.text.on-primary` pairs with `color.background.primary`. Always define both sides. Name by intent (`danger`) not appearance (`red`).

### 2. Typography

**Primitives:** `font.family.{sans|serif|mono}`, `font.size.{100–900}` on rem scale, `font.weight.{regular|medium|semibold|bold}`, `font.line-height.{tight|normal|relaxed}`, `font.letter-spacing.{tight|normal|wide}`, `font.paragraph-spacing.{none|md}`.

**Semantic patterns:** `font.heading.*`, `font.body.*`, `font.caption.*`, `font.label.*` — each bundles family + size + weight + line-height + letter-spacing using DTCG composite `typography` type.

Use `rem` for font sizes (WCAG 1.4.4 — Resize Text). Pick one scale convention (numeric `100–900` or t-shirt `xs–xl`) and use it everywhere.

### 3. Spacing

**Primitives:** 4px base grid — `space.1` (4px) through `space.16` (64px).

**Semantic patterns:** `space.inline.*` (horizontal), `space.stack.*` (vertical), `space.inset.*` (padding). T-shirt sizing: `xs`, `sm`, `md`, `lg`, `xl`.

Don't create component-specific spacing at semantic level (`space.card-padding`) — that belongs in component tier as `card.space.inset`.

### Categories 4–12

| # | Category | Primitive pattern | Semantic pattern | Key convention |
|-|-|-|-|-|
| 4 | Sizing | `size.{1–16}` (4px grid) | `size.icon.{sm\|md\|lg}`, `size.avatar.{sm\|md\|lg}` | Separate from spacing — different purpose |
| 5 | Border | `border.width.{1\|2\|4}`, `border.style.{solid\|dashed}` | DTCG composite `border` type | Colors under `color.border.*`, not here |
| 6 | Border Radius | `radius.{none\|xs\|s\|m\|l\|xl\|full}` | `radius.interactive`, `radius.container` | `full` = 9999px (pill). 5–7 values max |
| 7 | Shadow | `shadow.elevation.{1–5}` (DTCG shadow type) | `shadow.card`, `shadow.dropdown`, `shadow.modal` | Map levels to UI layering |
| 8 | Z-Index | Inherently semantic — no primitives | `z.base`, `z.dropdown`, `z.sticky`, `z.modal`, `z.toast` | 100-increment gaps between values |
| 9 | Breakpoints | Inherently semantic — no primitives | `breakpoint.{sm\|md\|lg\|xl}` | Mobile-first. No device names |
| 10 | Motion | `motion.duration.{instant\|fast\|normal\|slow}`, `motion.easing.*` | `motion.transition.default`, `motion.enter`, `motion.exit` | 3–4 durations. DTCG `transition` type |
| 11 | Opacity | `opacity.{subtle\|medium\|strong\|opaque}` | `opacity.disabled`, `opacity.overlay` | 4–6 values. Consider alpha colors instead |
| 12 | Grid | `grid.columns`, `grid.gutter`, `grid.margin` per breakpoint | — | 8-point grid. See `references/layout-patterns.md` |

---

## Accessibility Tokens

Embed accessibility at the token level — WCAG 2.2 requirements + European Accessibility Act (EAA, effective June 2025).

**Focus Ring** — every interactive element needs a visible focus indicator:
- `color.border.focus-ring` — 3:1 contrast ratio (WCAG 2.4.7/2.4.13)
- `border.width.focus-ring` — minimum 2px
- `space.focus-ring.offset` — 2px typical

**Touch Target Size** — WCAG 2.5.8 (Level AA):
- `size.touch-target.min` — 24px (AA minimum)
- `size.touch-target.comfortable` — 44px (AAA / Apple HIG)

**Reduced Motion** — `motion.reduce` gates all animation. When `prefers-reduced-motion: reduce` is active, all `motion.duration.*` resolve to `0ms`. Implement via CSS custom property at the media query boundary.

**Contrast Pairs** — document every semantic color pair (bg + fg) with its contrast ratio. AA = 4.5:1 normal text, AAA = 7:1. This prevents regressions when updating primitives.

For full WCAG checklist, ARIA reference, and testing guidance, read `references/accessibility.md`.

---

## Theming & Modes

Three modes minimum:

| Mode | Purpose |
|-|-|
| Light | Default — light backgrounds, dark text |
| Dark | Inverted neutral scale, adjusted feedback colors |
| High Contrast | Maximum contrast, bolder borders, no transparency — WCAG AAA + `forced-colors` |

**Dark mode rules:** Swap primitive values only — semantic aliases stay untouched. Key adjustments beyond inversion: shadows need higher opacity; feedback backgrounds shift to 900–950; interactive colors shift 1–2 stops lighter for contrast.

> For Tailwind v4 dark mode (ThemeProvider, `@custom-variant`, OKLCH), see the `uiux-design-tailwindv4` skill.

---

## Component Token Patterns

### State Matrix

Every interactive component needs tokens for 5 states:

| State | Token Pattern |
|-|-|
| Default | `{component}.color.{property}.{variant}` |
| Hover | `{component}.color.{property}.{variant}.hover` |
| Focus | Uses `color.border.focus-ring` token |
| Active | `{component}.color.{property}.{variant}.active` |
| Disabled | `{component}.color.{property}.{variant}.disabled` |

### Common Patterns

Only create component tokens when diverging from semantics:

**Button:** `button.color.background.primary.default` → `{color.interactive.default}`, `button.color.text.primary` → `{color.text.on-primary}`, `button.radius` → `{radius.interactive}`, `button.space.padding-x` → `{space.inline.md}`

**Input:** `input.color.border.default` → `{color.border.default}`, `input.color.border.focus` → `{color.border.focus-ring}`, `input.color.border.error` → `{color.feedback.danger}`

---

## Patterns & Product Screens

Patterns are reusable recipes composed of atoms, molecules, and organisms. Product screens are full-page compositions.

### Layout Templates
`patterns/layout/sidebar-content` (256px sidebar + fluid main), `top-nav-content`, `centered-narrow` (max 640px), `centered-wide` (max 1200px), `two-column`, `three-column`

### Section Recipes
`patterns/section/hero-split`, `hero-centered`, `features-grid`, `features-alternating`, `pricing-table`, `testimonials`, `cta-banner`, `faq-accordion`, `logo-cloud`, `stats-row`, `team-grid`, `footer-standard`

### State Patterns
`patterns/state/empty` (illustration + headline + CTA), `loading-skeleton` (shimmer placeholders), `error-page`, `no-results`, `offline`

### Product Screens

```
landing/desktop, landing/tablet, landing/mobile
dashboard/default, dashboard/empty, dashboard/loading, dashboard/detail-panel
settings/profile, settings/account, settings/preferences, settings/billing
auth/login, auth/register, auth/forgot-password, auth/verify-email
onboarding/step-1, onboarding/step-2, onboarding/complete
```

For full composition breakdowns (which organisms + patterns each screen uses), read `references/design-system-template.md`.

---

## UX Decision Patterns

### Forms
- Labels above input (most accessible). Placeholders for examples only — not a label substitute.
- Validate on blur, not on keystroke. Inline error below field using danger color.
- Primary action bottom-left, secondary (Cancel) as ghost button to the right.
- Related fields grouped with fieldset label. 16px within groups, 32px between groups.

### Feedback

| Situation | Component | Behavior |
|-|-|-|
| Action succeeded | toast/success | Auto-dismiss 5s |
| Action failed | toast/error | Persist until dismissed + retry |
| Destructive confirmation | modal/confirm | Require explicit action |
| System-wide warning | alert/warning | Persistent banner |
| Field validation | form-field/error | Inline below field, on blur |

Never stack more than 3 toasts.

### Data Display

| Data shape | Component |
|-|-|
| Structured rows, sortable | data-table (>5 items, 3+ attributes) |
| Homogeneous items, visual | card grid (products, projects) |
| Sequential, time-based | vertical list with dividers |
| Single key metric | stat card |
| Key-value pairs | definition list |

For full UX pattern details, read `references/design-system-template.md` §7.

---

## Content & Voice

**Tone:** Professional, clear, warm. Helpful colleague — not chatbot, not legal document.

| Context | Tone | Example |
|-|-|-|
| Success | Warm, brief | "Changes saved" |
| Error | Direct, helpful | "Couldn't connect. Check your internet and try again." |
| Empty state | Encouraging | "No projects yet. Create your first one to get started." |
| Destructive | Serious, specific | "Delete this project? This removes all files and can't be undone." |

**Key rules:** Sentence case for UI labels and headings. Button labels: verb + noun ("Save changes", not "Submit"). No "Please", "Successfully", "Error:" prefix. No periods on single-sentence UI text.

For full terminology glossary and grammar rules, read `references/design-system-template.md` §9.

---

## Layout Decisions

### Flex vs Grid

| Scenario | Use | Why |
|-|-|-|
| Items in a single row or column | **Flex** | 1D content flow |
| Equal-width columns (card grids) | **Grid** `repeat(N, 1fr)` | Parent enforces equal sizing |
| 2D page structure (sidebar + header + main) | **Grid** with mixed tracks | Row and column control |
| Tags/chips that wrap naturally | **Flex** `flex-wrap: wrap` | Content-driven reflow |
| Items must fill equal space | **Grid** | Flex requires per-child `flex: 1` |

**Rule of thumb:** If you're setting properties on children to fix layout, you want Grid (controls from the parent).

**Prefer fluid design** with `auto-fit` / `minmax()` over fixed breakpoints. Only add explicit breakpoints when the design requires fundamentally different layouts.

For patterns (equal-size grids, button-at-bottom, responsive auto-fit, nested layouts), read `references/layout-patterns.md`.

---

## Decision Framework

### Should I Create a Token?

1. **Used in 2+ places?** → tokenize
2. **Changes with theming?** → must be a token regardless of reuse
3. **One-off override?** → skip (local value or component tier)
4. **Existing token covers this intent?** → use existing

Score 2+ yes on questions 1–2 → create a token.

### Which Tier?

- Raw value (hex, px, font stack) → **Primitive**
- UI intent (background role, spacing direction) → **Semantic**
- Component-specific divergence → **Component**

When in doubt, start semantic. Promote to component only when a specific UI element diverges.

### Token Proliferation Guard

- **Start lean.** Add later; removing is harder.
- **Alias test.** If a new semantic token just aliases a primitive with no added meaning, skip it.
- **Fewer well-named tokens > many granular tokens.** Each token is a maintenance commitment.
- **Audit quarterly.** Treat token sets like code — use semantic versioning. New token = minor bump. Rename/remove = major bump.

### Should I Create a Component?

- Used 3+ times? → register
- Has interactive states? → register
- Represents enforced design decision? → register
- Otherwise → keep as one-off

### Add Variant or New Component?

- Same layer structure + same semantic role? → add variant
- Different structure or different role? → new component

For detailed decision trees, granularity guidance, and anti-patterns checklist, read `references/componentization-guide.md`.
