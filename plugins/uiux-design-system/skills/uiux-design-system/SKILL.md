---
name: uiux-design-system
description: >
  Comprehensive design system architecture guide: component hierarchy (atoms/molecules/organisms/patterns/screens),
  3-tier token system (primitive/semantic/component), W3C DTCG format, mapped token categories (text/icon/surface/border),
  naming conventions, UX decision patterns, layout decisions (Flex vs Grid), multi-brand theming (branded house vs house
  of brands), typography & type scale generation, 4px number scale, responsive rules, design-to-code pipeline,
  content voice, accessibility standards (WCAG 2.2 + EAA), and visual reference structuring.
  ALWAYS use this skill when: building or modifying a design system, creating theme configurations, working with
  token files (.tokens, .tokens.json), defining CSS custom properties for theming, structuring design variables,
  naming or organizing components, establishing UX patterns, organizing screenshots or visual references for a
  design system, choosing layout approaches, generating type scales, planning multi-brand or dark mode strategies,
  defining mapped token categories, or architecting a design system from scratch.
  Also trigger when the user mentions: design tokens, token naming, DTCG, design system, theme tokens,
  primitive/semantic/component tokens, token hierarchy, style dictionary, design variables, component naming,
  variant system, design system architecture, UX patterns, content voice, design template, atomic design,
  screenshot structure, visual references, component inventory, type scale, multi-brand, branded house,
  house of brands, design-to-code, mapped tokens, surface tokens, text tokens, icon tokens, border tokens.
  Trigger keywords: design system, design tokens, token naming, DTCG, W3C, theme tokens, CSS variables,
  style dictionary, primitives, semantic tokens, component tokens, token hierarchy, design variables,
  theming, component naming, UX patterns, design architecture, design template, component library,
  variant system, atoms, molecules, organisms, patterns, visual reference, screenshot naming, type scale,
  typography, multi-brand, dark mode strategy, design-to-code, mapped tokens, 4px grid, number scale.
---

# Design System Architecture

Comprehensive guide for architecting production design systems — from philosophy and token foundations through component hierarchy, UX patterns, multi-brand theming, and accessibility standards. Follows W3C DTCG standards, atomic design methodology, and industry best practices from Brad Frost, UI Collective (Kirk), IBM Carbon, Salesforce Lightning, and Atlassian.

A complete design system covers:
- **Philosophy** — mental models, why three tiers, tokens as design decisions
- **Component architecture** — atomic tiers, naming, variants, internal vs published, composition rules
- **Design tokens** — the value layer (colors, spacing, typography) that components consume
- **Mapped tokens** — the 4-category system (text, icon, surface, border) applied to components
- **Typography** — type scale generation, 4px snap, responsive rules
- **Patterns & screens** — reusable layout recipes, section templates, product page compositions
- **UX decisions** — form behavior, feedback patterns, data display choices
- **Content & voice** — tone, grammar, terminology consistency
- **Multi-brand & theming** — dark mode, branded house vs house of brands
- **Accessibility** — WCAG 2.2 AA + EAA compliance baked into tokens and components
- **Responsive behavior** — breakpoints, layout adaptation, platform-specific rules
- **Design-to-code** — token pipeline from design tool to CSS/Tailwind

## Reference Files

Read on demand based on your current task:

### Architecture & Components
- **`references/design-system-template.md`** — Full design system template: complete component inventory (all atoms/molecules/organisms with every variant and state listed out), typography scale, layout/grid specs, motion/animation, full pattern recipe lists, UX decision pattern tables, product screen compositions, content/voice guidelines with terminology glossary, icon specs, responsive rules, accessibility standards, and completeness checklist. **Start here when architecting a new design system from scratch.**
- **`references/componentization-guide.md`** — When to componentize, granularity decisions (split vs monolithic), variant architecture (multi-axis vs split), token binding through the hierarchy, instance vs fresh build, composition patterns (flat, slot-based, responsive), scaling to 100+ screens, anti-patterns checklist, and decision trees. **Read when deciding component boundaries or reviewing component quality.**

### Token Implementation
- **`references/dtcg-format.md`** — W3C DTCG JSON format specification: all simple and composite token types, alias syntax, group nesting, type inheritance, validation rules. **Read when creating or validating `.tokens` / `.tokens.json` files.**
- **`references/starter-template.md`** — Minimal but complete DTCG token set (primitives + semantics + mapped tier) ready to adapt. **Use as scaffolding for new projects with no existing tokens.**
- **`references/platform-mapping.md`** — Outputting tokens to CSS custom properties, Tailwind v4 `@theme`, SCSS, Style Dictionary, React Native, iOS Swift, Android. **Read when transforming tokens into platform-specific code.**

### Shared Design Knowledge (tool-agnostic)
These are used by tool-specific plugins (`uiux-design-penpot`, `uiux-design-figma`) and workflow orchestrators (`uiux-image2design`). **Tool plugins MUST read these from here** — they are not duplicated into tool-specific plugins.

- **`references/component-patterns.md`** — UI component specs and build recipes: buttons, forms, inputs, checkboxes, radios, switches, navigation, tabs, menus, cards, modals, tables, avatars, tags, badges, loaders, progress bars, snackbars, carousels, dashboards, empty/loading states. Token bindings, variants, states, composition patterns, accessibility. **Read when creating or reviewing any UI component.**
- **`references/accessibility.md`** — WCAG 2.2 AA + EAA: color contrast, touch targets, focus management, high contrast tokens, screen reader patterns, keyboard navigation, ARIA quick reference. **Read when designing any user-facing interface.**
- **`references/platform-guidelines.md`** — Screen sizes, safe areas, platform-specific specs for iOS HIG, Android Material Design, responsive web, desktop. **Read when targeting a specific platform or device.**
- **`references/color-utilities.md`** — Pure-math color converters (OKLCH→hex, HSL→hex, RGB→hex), palette generation, WCAG contrast ratio calculation. No dependencies. **Read when converting colors between formats or validating contrast.**
- **`references/layout-patterns.md`** — Flex vs Grid decision matrix with 5 patterns: equal-size grids, button-at-bottom alignment, responsive wrap, nested layouts, fluid design without breakpoints. **Read when choosing layout approach for a specific UI.**
- **`references/token-binding-strategy.md`** — Binding tokens to shapes in design tools: greenfield (inline at creation), brownfield (sweep with confidence scoring), token map pattern, reverse map builder, coverage reporting. Tool-agnostic strategy — tool plugins implement API calls. **Read when implementing or auditing token binding.**

You don't need to load all references at once. If you're advising on naming, hierarchy, or reviewing existing tokens, this SKILL.md alone is sufficient.

---

## Philosophy & Mental Models

### The Tree Metaphor

A design system is a tree:

- **Roots** = Primitive tokens — raw values nobody sees directly. Hex codes, pixel values, font family strings.
- **Trunk** = Semantic tokens — contextual roles connecting raw values to intent. "Primary", "error", "neutral" — the translation layer.
- **Leaves** = Mapped/Component tokens — what users actually see applied to components. Surface fills, text colors, border colors for specific states.

Every leaf traces back through the trunk to the roots. Change a root color, and it ripples through the trunk and out to every leaf that references it.

### Core Principle: Tokens ≠ Variables

Design tokens are *design decisions*, not just CSS variables. A raw color `#6C5CE7` is a value. The *decision* that it's your brand's primary color, and the further *decision* that primary buttons use it as a background — those are the tokens that matter.

### Naming Across the Industry

| This Skill | UI Collective | Brad Frost | Salesforce | Carbon (IBM) |
|-|-|-|-|-|
| Tier 1 (Primitive) | Brand | Tier 1 | Global | Foundation |
| Tier 2 (Semantic) | Alias | Tier 2 | Alias / Semantic | Theme |
| Tier 3 (Component) | Mapped | Tier 3 | Component-specific | Component |

The three-tier model is the architecture used by IBM Carbon, Salesforce Lightning, Atlassian, and recommended by Brad Frost. Figma's variable scoping and Penpot's token system naturally support it.

---

## Component Architecture

Design systems organize UI into tiers of increasing complexity using **atomic design** — the industry standard shared by Figma, Penpot, and code-based systems.

### The 5 Tiers

| Tier | What it is | Examples |
|-|-|-|
| **Atoms** | Smallest meaningful UI unit. Has states, no sub-components | button, input field, badge, avatar, toggle, checkbox, radio, divider, tooltip, spinner, label |
| **Molecules** | Small group of atoms functioning as a unit | form-field (label + input + hint), card, nav-item, dropdown, toast, alert, search-bar, pagination, checkbox-label, switch-label |
| **Organisms** | Complex UI sections composed of molecules + atoms | header, sidebar, data-table, modal, footer, command-palette, tab-bar, menu, carousel |
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

### Internal vs Published Components

Prefix private/internal building blocks with a dot (`.`):

```
.menu-item     → internal building block, not published
Menu           → published, composed of .menu-item instances

.tab-item      → internal
Tab Bar        → published

.carousel-item → internal
Carousel       → published

.text-area     → internal (the raw text box)
Text Area      → published (label + text area + hint text)
```

The dot prefix tells design tools not to publish it in the library. End users only see composed components, not the building blocks. In code-based systems, use `_` prefix or an `internal/` directory.

### Responsive Variants

Breakpoints are component variants, not separate trees:

```
organisms/header/desktop/default
organisms/header/tablet/default
organisms/header/mobile/menu-open
```

Each organism and pattern should have frames at standard breakpoints (1440px desktop, 768px tablet, 375px mobile).

### State Variants

Every interactive component needs these states:

| State | Surface Token | Border Token | Text/Icon Token | Notes |
|-|-|-|-|-|
| **Default** | `surface/default` or `surface/action` | `border/default` or `border/action` | `text/body` or `text/on-action` | Resting state |
| **Hover** | `surface/action-hover` or `surface/action-hover-light` | `border/action-hover` | `text/action-hover` | Mouse over |
| **Focus** | Same as default | `border/focus` (2px) | Same as default | Keyboard navigation — accessibility critical |
| **Disabled** | `surface/disabled` | `border/disabled` | `text/disabled` / `icon/disabled` | Non-interactive |
| **Error** | `surface/error` | `border/error` | `text/error` | Validation failure |
| **Selected** | `surface/action` | `border/action` | `text/on-action` | Toggled/active |

**Focus ring implementation:** Use a separate shape layered around the component with absolute positioning — 2px stroke on the outside, no fill, constrained to resize with the component. 1px is too subtle; 2px provides clear keyboard-navigation visibility.

### Component Properties Pattern

Every component should expose these property types as appropriate:

| Property Type | Use Case | Example |
|-|-|-|
| **Text** | Editable text content | Button label, input placeholder |
| **Instance Swap** | Swappable nested components | Icon left/right in buttons |
| **Layer** (Boolean) | Show/hide elements | Toggle icon visibility, show/hide hint text |
| **Variant** | Switch between states/types | status: default/hover/focus/disabled; type: filled/outline |

**Icon handling convention:** Standard icon size 20×20px across all components. Use instance swap properties for icon left and icon right. Add a layer (boolean) property to toggle icon visibility.

### Key Componentization Rules

- **Register when**: used 3+ times, has interactive states, represents enforced design decision, or needs change propagation
- **Keep as one-off when**: used once or twice, purely compositional, or >50% overrides needed
- **Split sub-components when**: parts are independently reusable, or variant combinations exceed ~50
- **Start monolithic, split when pain appears** — easier to split a working component than merge scattered one-offs
- **After registering atoms, all higher tiers MUST use component instances** — never rebuild a button shape inside a card if a button component exists

### Recommended Build Order

Build atoms first, then compose upward:
1. **Button** → **Label** → **Input Field** → **Input** (composed: label + field + hint)
2. **Checkbox** → **Radio** → **Switch** (each with label molecule)
3. **Text Area** → **Menu Item** (internal) → **Menu** → **Tab Item** (internal) → **Tab Bar**
4. **Button Group** → **Link** (+ breadcrumb variant) → **Avatar** (+ avatar group) → **Tag/Chip** → **Badge**
5. **Loader/Spinner** → **Progress Bar** (+ progress circle) → **Snackbar/Toast**
6. **Button Icon** → **Carousel** → **Table** (most complex — cells → columns → table)

For detailed build recipes with token bindings, read `references/component-patterns.md`.
For decision trees and anti-patterns, read `references/componentization-guide.md`.

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

**Primitive tokens** define your palette — all available colors, sizes, values. They describe *what exists*. The roots of the tree — raw material.

**Semantic tokens** assign meaning — *how* primitives are used: which color is a background, which is danger text, which spacing goes between stacked elements. The trunk — the translation layer.

**Component tokens** handle exceptions — *where* a semantic value is overridden for a specific component or state. The leaves — what users see.

### Referencing Chain

```
Component tokens → Semantic tokens → Primitive tokens → Raw values

surface/action (mapped)
  → primary/default              (semantic/alias)
    → purple-500                 (primitive/brand)
      → #6C5CE7                  (raw value)
```

When theming, swap values at the **semantic** tier. Component tokens stay stable — the entire UI updates through the alias chain. Same token names, different values per mode.

### When to Use 2 vs 3 Tiers

**Two tiers** (Primitive → Semantic) are sufficient when:
- Single-brand, single-theme product
- Small team (1–3 designers)
- No dark mode or rebrand anticipated

**Three tiers** are recommended when:
- Multiple brands or sub-brands are involved
- Dark mode / high-contrast mode are requirements
- Component library is reused across projects
- Design language evolution anticipated (rebrands, v2.0)

Start with 2 tiers for simplicity; promote to 3 when real component-level divergence demands it.

### Rules

1. **Never skip tiers.** Component → semantic → primitive. No shortcuts — it breaks the abstraction.
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

**Minimum:** Every token needs `category` + one more level. **Maximum practical depth:** 5 levels.

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

### Mapped Token Categories

At the component/mapped tier, tokens organize into **four categories** that get directly applied to UI elements:

| Category | What it controls | Example tokens |
|-|-|-|
| `text/*` | Text/font colors | `text/heading`, `text/body`, `text/action`, `text/on-action`, `text/disabled` |
| `icon/*` | Icon colors (mirrors text) | `icon/default`, `icon/action`, `icon/on-action`, `icon/disabled` |
| `surface/*` | Background fills | `surface/page`, `surface/default`, `surface/action`, `surface/action-hover` |
| `border/*` | Stroke/border colors | `border/default`, `border/action`, `border/focus`, `border/error` |

### State Naming

| State | When it applies |
|-|-|
| `default` | Resting state |
| `hover` | Mouse over |
| `hover-light` | Subtle hover (lighter surface change for inputs, rows) |
| `focus` | Keyboard focus |
| `disabled` | Non-interactive |
| `active` / `selected` | Currently active/toggled |
| `on-action` | Content that sits *on top of* an action surface (e.g., text on primary button) |

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

**Priority for new systems:** Color > Typography > Number Scale (Spacing) > Border Radius > Shadow > Sizing > Border > Motion > Opacity > Z-Index > Breakpoints > Grid. The first three cover ~80% of typical UI token needs.

### 1. Color

**Primitives:** Hue scales `50`–`950` (lightest to darkest). E.g., `color.blue.50` through `color.blue.950`. Include `color.neutral.*` for grays.

**Minimum scales needed:**

| Scale | Purpose | Typical Hue |
|-|-|-|
| **Primary** | Brand identity, CTAs, active states | Your brand color |
| **Neutral** | Text, backgrounds, borders, disabled states | Gray |
| **Error/Danger** | Form errors, destructive actions, alerts | Red |
| **Success** | Confirmations, completed states | Green |
| **Warning** | Caution alerts, attention needed | Orange / Amber |
| **Information** | Informational alerts, help text | Blue |

Start with these six. Add a secondary brand color only when needed.

**Scale generation (opacity method):**
1. Start with your core brand color as a solid hex (e.g., `#6C5CE7` at position 500)
2. For lighter shades (50–400): place the core color on a **white** background, reduce opacity in even intervals (e.g., 10% steps: 50→~10%, 100→~20%, 200→~30%, etc.)
3. For darker shades (600–900): place the core color on a **black** background, reduce opacity
4. **Always convert resulting colors to solid hex codes** — opacity-based tokens cause problems in dark mode and when layering elements

**Semantic patterns:**
- `color.background.*` — surfaces, overlays, elevated containers
- `color.text.*` — foreground content, headings, body, muted
- `color.border.*` — dividers, outlines, input borders
- `color.interactive.*` — buttons, links, focus rings, hover states
- `color.feedback.*` — success, warning, error, info

Use `on-*` for contrast pairs: `color.text.on-primary` pairs with `color.background.primary`. Always define both sides. Name by intent (`danger`) not appearance (`red`).

### 2. Typography

**Primitives:** `font.family.{sans|serif|mono}`, `font.size.{100–900}` on rem scale, `font.weight.{regular|medium|semibold|bold}`, `font.line-height.{tight|normal|relaxed}`, `font.letter-spacing.{tight|normal|wide}`, `font.paragraph-spacing.{none|md}`.

**Generating a type scale:**
1. Set base size to **16px** (paragraph `<p>` size)
2. Choose a scale ratio:
   - **Minor Third** (1.2) — conservative, good for apps
   - **Major Third** (1.25) — balanced, popular choice
   - **Perfect Fourth** (1.333) — more dramatic, good for marketing
3. **Snap each generated size to the nearest multiple of 4** — keeps everything crisp on 1x, 2x, 3x displays

| Scale Output | 4px Snap | Used For |
|-|-|-|
| 12px | 12px | Extra small / captions |
| 14px | 14px | Small text (use sparingly) |
| 16px | 16px | Base paragraph |
| 20px | 20px | H6 |
| 25px | 24px | H5 |
| 31.25px | 32px | H4 |
| 39px | 40px | H3 |
| 48.8px | 48px | H2 |
| 61px | 60px | H1 |

**Line height rules:**
- **Headings:** `font-size × 1.2`, snapped to nearest multiple of 4
- **Body text:** `font-size × 1.4–1.5`, snapped to nearest multiple of 4

| Font Size | × Multiplier | Snapped | Use |
|-|-|-|-|
| 60px | × 1.2 = 72 | 72px | H1 line height |
| 48px | × 1.2 = 57.6 | 56px | H2 line height |
| 40px | × 1.2 = 48 | 48px | H3 line height |
| 32px | × 1.2 = 38.4 | 40px | H4 line height |
| 24px | × 1.2 = 28.8 | 28px | H5 line height |
| 20px | × 1.2 = 24 | 24px | H6 line height |
| 16px | × 1.5 = 24 | 24px | Body line height |

**Paragraph spacing:** H1: 64–80px, H2: 48–64px, H3: 32–48px, H4: 24–32px, Body: 16–20px.

**Text styles naming convention** (hierarchical with `/` separator):

```
Heading/H1, Heading/H2, Heading/H3, Heading/H4, Heading/H5, Heading/H6
Body/Large, Body/Large - Semi Bold, Body/Large - Link
Body/Medium, Body/Medium - Semi Bold, Body/Medium - Link
Body/Small, Body/Small - Semi Bold, Body/Small - Link
Body/Extra Small, Body/Extra Small - Semi Bold, Body/Extra Small - Link
```

Each text style bundles: font family + font size + line height + font weight + paragraph spacing.

**Responsive typography — cardinal rule:** Body text stays the same size on mobile (16px). **Only headings scale down.** Body text at 14px on mobile is too small for comfortable reading.

| Variable | Desktop | Mobile |
|-|-|-|
| H1 font-size | 60px | 40px |
| H2 font-size | 48px | 32px |
| H3 font-size | 40px | 32px |
| H4 font-size | 32px | 24px |
| H5 font-size | 24px | 20px |
| H6 font-size | 20px | 20px |
| Body font-size | 16px | 16px (unchanged) |

**Accessibility floor:** Never go below 12px for any readable text. Body text minimum is 16px. 14px only for supplementary content.

**Semantic patterns:** `font.heading.*`, `font.body.*`, `font.caption.*`, `font.label.*` — each bundles family + size + weight + line-height + letter-spacing using DTCG composite `typography` type.

Use `rem` for font sizes (WCAG 1.4.4 — Resize Text). Pick one scale convention (numeric `100–900` or t-shirt `xs–xl`) and use it everywhere.

### 3. Number Scale (4px Grid)

All spacing, sizing, border width, and border radius values derive from **multiples of 4**:

```
scale/0    = 0px
scale/25   = 1px    (exception: borders — the only non-4px value)
scale/50   = 2px    (exception: focus rings)
scale/100  = 4px
scale/200  = 8px
scale/300  = 12px
scale/400  = 16px
scale/500  = 20px
scale/600  = 24px
scale/700  = 28px
scale/800  = 32px
scale/900  = 36px
scale/1000 = 40px
scale/1100 = 48px
scale/1200 = 64px
```

**Why multiples of 4?** Screens render in even pixel counts — 4px aligns perfectly on 1x, 2x, and 3x displays. Consistent visual rhythm, easy mental math.

**Rule:** Never mix odd and even numbers. The only exceptions are 1px (borders) and 2px (focus rings).

Border width and border radius reference this scale directly:

```
border-width/default  → scale/25  (1px)
border-width/focus    → scale/50  (2px)
border-radius/none    → 0
border-radius/sm      → scale/100 (4px)
border-radius/md      → scale/200 (8px)
border-radius/lg      → scale/300 (12px)
border-radius/xl      → scale/400 (16px)
border-radius/full    → 9999      (pill/circle)
```

### 4. Spacing

**Primitives:** 4px base grid — `space.1` (4px) through `space.16` (64px).

**Semantic patterns:** `space.inline.*` (horizontal), `space.stack.*` (vertical), `space.inset.*` (padding). T-shirt sizing: `xs`, `sm`, `md`, `lg`, `xl`.

Don't create component-specific spacing at semantic level (`space.card-padding`) — that belongs in component tier as `card.space.inset`.

### Categories 5–12

| # | Category | Primitive pattern | Semantic pattern | Key convention |
|-|-|-|-|-|
| 5 | Sizing | `size.{1–16}` (4px grid) | `size.icon.{sm\|md\|lg}`, `size.avatar.{sm\|md\|lg}` | Separate from spacing — different purpose |
| 6 | Border | `border.width.{1\|2\|4}`, `border.style.{solid\|dashed}` | DTCG composite `border` type | Colors under `color.border.*`, not here |
| 7 | Border Radius | `radius.{none\|xs\|s\|m\|l\|xl\|full}` | `radius.interactive`, `radius.container` | `full` = 9999px (pill). 5–7 values max |
| 8 | Shadow | `shadow.elevation.{1–5}` (DTCG shadow type) | `shadow.card`, `shadow.dropdown`, `shadow.modal` | Map levels to UI layering |
| 9 | Z-Index | Inherently semantic — no primitives | `z.base`, `z.dropdown`, `z.sticky`, `z.modal`, `z.toast` | 100-increment gaps between values |
| 10 | Breakpoints | Inherently semantic — no primitives | `breakpoint.{sm\|md\|lg\|xl}` | Mobile-first. No device names |
| 11 | Motion | `motion.duration.{instant\|fast\|normal\|slow}`, `motion.easing.*` | `motion.transition.default`, `motion.enter`, `motion.exit` | 3–4 durations. DTCG `transition` type |
| 12 | Opacity | `opacity.{subtle\|medium\|strong\|opaque}` | `opacity.disabled`, `opacity.overlay` | 4–6 values. Consider alpha colors instead |

---

## Mapped Token Tables (Tier 3)

The mapped/component collection defines **four major categories** of tokens that get directly applied to components. Each category has state variants. These tables show the complete set — use them as a checklist when building your mapped tier.

### Text Tokens

| Token | Purpose | Light Mode | Dark Mode |
|-|-|-|-|
| `text/heading` | Headings (h1–h6) | neutral/800 | neutral/100 |
| `text/body` | Body paragraphs | neutral/700 | neutral/200 |
| `text/action` | Links, clickable text | primary/500 | primary/400 |
| `text/action-hover` | Link hover state | primary/600 | primary/300 |
| `text/on-action` | Text on primary surfaces (buttons) | white | white |
| `text/disabled` | Inactive/disabled text | neutral/400 | neutral/600 |
| `text/success` | Success messages | success/default | success/default |
| `text/warning` | Warning messages | warning/default | warning/default |
| `text/error` | Error messages | error/default | error/default |
| `text/information` | Info messages | information/default | information/default |

### Icon Tokens

Icon tokens **mirror text tokens** intentionally. When an icon sits next to text (which is most of the time), they should be the same color. Having different warning text and warning icon colors creates inconsistency.

| Token | Maps to same alias as |
|-|-|
| `icon/default` | Same as `text/body` (neutral/700) |
| `icon/action` | Same as `text/action` |
| `icon/action-hover` | Same as `text/action-hover` |
| `icon/on-action` | Same as `text/on-action` |
| `icon/disabled` | Same as `text/disabled` |
| `icon/success` | Same as `text/success` |
| `icon/error` | Same as `text/error` |
| `icon/warning` | Same as `text/warning` |
| `icon/information` | Same as `text/information` |

### Surface Tokens

Surface = the background fill of elements.

| Token | Purpose | Light Mode | Dark Mode |
|-|-|-|-|
| `surface/page` | Full page background | white | neutral/900 |
| `surface/default` | Card/container backgrounds | neutral/50 or white | neutral/800 |
| `surface/action` | Primary action elements (buttons) | primary/500 | primary/500 |
| `surface/action-hover` | Hovered action elements | primary/600 | primary/400 |
| `surface/action-hover-light` | Subtle hover (input fields, rows) | primary/50 | primary/900 |
| `surface/disabled` | Disabled element backgrounds | neutral/100 | neutral/800 |
| `surface/success` | Success alert background | success/50 | success/900 |
| `surface/warning` | Warning alert background | warning/50 | warning/900 |
| `surface/error` | Error alert background | error/50 | error/900 |
| `surface/information` | Info alert background | information/50 | information/900 |

**Key insight:** Alert/notification surfaces use the lightest shade (50 in light mode, 900 in dark mode) so text remains readable against them.

### Border Tokens

| Token | Purpose | Light Mode | Dark Mode |
|-|-|-|-|
| `border/default` | Standard borders | neutral/200 | neutral/700 |
| `border/action` | Active/interactive element borders | primary/500 | primary/400 |
| `border/action-hover` | Hovered interactive borders | primary/600 | primary/300 |
| `border/focus` | Focus ring color (accessibility critical) | primary/500 | primary/400 |
| `border/disabled` | Disabled element borders | neutral/200 | neutral/700 |
| `border/success` | Success state borders | success/200 | success/700 |
| `border/warning` | Warning state borders | warning/200 | warning/700 |
| `border/error` | Error state borders | error/200 | error/700 |
| `border/information` | Info state borders | information/200 | information/700 |

---

## Accessibility Tokens

Embed accessibility at the token level — WCAG 2.2 requirements + European Accessibility Act (EAA, effective June 2025).

**Focus Ring** — every interactive element needs a visible focus indicator:
- `color.border.focus-ring` / `border/focus` — 3:1 contrast ratio (WCAG 2.4.7/2.4.13)
- `border.width.focus-ring` — minimum 2px
- `space.focus-ring.offset` — 2px typical
- Style: solid

**Touch Target Size** — WCAG 2.5.8:
- `size.touch-target.min` — 24px (Level AA minimum)
- `size.touch-target.comfortable` — 44px (Apple HIG / AAA recommended)
- `size.touch-target.spacious` — 48px (Android Material)

**Reduced Motion** — `motion.reduce` gates all animation. When `prefers-reduced-motion: reduce` is active, all `motion.duration.*` resolve to `0ms`. Implement via CSS custom property at the media query boundary.

**High Contrast Overrides:**
- `a11y/high-contrast/text` → #000000
- `a11y/high-contrast/background` → #FFFFFF
- `a11y/high-contrast/border` → #000000
- `a11y/high-contrast/link` → #0000EE

**Contrast Pairs** — document every semantic color pair (bg + fg) with its contrast ratio:

| Text Size | Minimum Ratio (AA) | Enhanced Ratio (AAA) |
|-|-|-|
| Normal text (< 18px) | 4.5:1 | 7:1 |
| Large text (≥ 18px bold, ≥ 24px regular) | 3:1 | 4.5:1 |
| Non-text UI elements (icons, borders) | 3:1 | — |

**Test every token pairing:** Every text token + its expected surface token must meet these ratios. This prevents regressions when updating primitives.

For full WCAG checklist, ARIA reference, and testing guidance, read `references/accessibility.md`.

---

## Theming & Modes

Three modes minimum:

| Mode | Purpose |
|-|-|
| Light | Default — light backgrounds, dark text |
| Dark | Inverted neutral scale, adjusted feedback colors |
| High Contrast | Maximum contrast, bolder borders, no transparency — WCAG AAA + `forced-colors` |

### Dark Mode Strategy

**Same token names, different values.** Every component that references `primary/default` automatically gets the correct color in both modes. This is the entire power of the semantic layer.

**Quick approach:** Rough pass first, then refine for accessibility.

1. **Invert the scale direction:** Where light mode uses `neutral/800` for headings, dark mode uses `neutral/100`
2. **Lighten primary colors:** Primary actions shift from `500` → `400` or `300` to maintain contrast on dark backgrounds
3. **Darken surfaces:** Page background goes from white → `neutral/900` or `neutral/950`
4. **Keep action surfaces recognizable:** Buttons can stay the same primary color if contrast is sufficient
5. **Test with accessibility tools:** Run WCAG contrast checks after the initial pass

**What stays the same in dark mode:**
- `text/on-action` (text on buttons) — typically stays white in both modes
- Semantic intent — `error` is still red, `success` is still green
- Component structure — nothing in the component layer changes

**What changes:**
- Text colors get lighter (higher neutral values)
- Surface colors get darker
- Border colors adjust for visibility against dark backgrounds
- Primary/accent colors may shift to lighter variants
- Shadows need higher opacity
- Feedback backgrounds shift to 900–950 shades

> For Tailwind v4 dark mode (ThemeProvider, `@custom-variant`, OKLCH), see the `uiux-design-tailwindv4` skill.

---

## Multi-Brand Strategies

### Branded House

One house, brands that share the same system with slightly different visual identity. Think Coke, Coke Zero, Diet Coke — same components, primary color differs.

**Implementation:** In the semantic/alias collection, add modes per brand. Each mode remaps only the **primary** (and maybe secondary) color scales. Success, error, warning, neutral, fonts, spacing — all stay identical.

```
Semantic Collection Modes:
  Brand A → primary/* maps to purple scale
  Brand B → primary/* maps to blue scale
  Brand C → primary/* maps to teal scale
  (success, error, warning, neutral all identical)
```

### House of Brands

Completely different visual identities. Sprite vs Coke vs Powerade.

**Implementation:** Separate design system files per brand. Each brand has its own primitive collection with entirely different color scales, fonts, and potentially different spacing.

### When to Use Which

| Scenario | Strategy | Token Approach |
|-|-|-|
| Same components, slightly different colors | Branded House | Semantic modes |
| Completely different visual identities | House of Brands | Separate design system files |
| White-label / customer-specific theming | Branded House with Tier 1 overrides | Primitive swap + semantic auto-resolves |
| Design language evolution (v1 → v2) | Branded House | Legacy + new theme as modes |

---

## Component Token Patterns

Only create component tokens when diverging from the mapped token categories above.

### Common Patterns

**Button:**
- Fill: `surface/action` → border: `border/action` → text: `text/on-action` → icon: `icon/on-action`
- Type variants: *filled* (solid surface), *outline* (transparent bg + border/action + text/action), *transparent/ghost* (no fill, no stroke, text/action)
- Always add stroke even if same color as fill — maintains consistency across type variants

**Input Field:**
- Fill: `surface/default` → border: `border/default` → text: `text/body` (value), `text/disabled` (placeholder)
- Hover: `surface/action-hover-light` — subtle background change
- Focus: absolute-positioned focus rectangle with `border/focus`, 2px
- Error: `border/error` + `text/error` for hint message

**Checkbox / Radio / Switch:**
- Selected: fill `surface/action`, icon `icon/on-action`, stroke `border/action`
- Unselected: no fill, stroke `border/default`
- Each gets a label molecule: component + label text, 8px gap, exposed nested instances

**Menu Item** (internal `.menu-item`):
- 1px border on bottom only (separator between items)
- Hover: `surface/action-hover-light`
- Selected: `surface/action` + `text/on-action`

**Tab Item** (internal `.tab-item`):
- Selected indicator: bottom border with `border/action` + `text/action` + semibold weight
- Unselected: no bottom border + `text/body` + regular weight

**Avatar:**
- Types: icon (default user icon), image (clipped), initials (2-char text)
- Sizes: large (64×64), medium (48×48), small (32×32) — use scale constraints
- Avatar group: negative gap (e.g., -4px) for overlapping effect + count badge

**Badge:**
- Fixed-size circle (24×24), `border-radius/full`
- Types: count badge (shows number), dot badge (12×12, no text — status indicator)
- Semantic variants: default (`surface/action`), success, error, warning, information

**Snackbar/Toast:**
- Structure: icon + content (title + description + link) + close button + optional progress bar
- Each semantic variant changes: surface to the 50 shade, icon to the semantic color
- Progress bar: absolute positioned at bottom for timeout/countdown

**Table** (most complex component):
- Built from three sub-components: **Cell Item** → **Column** (vertical stack of cells) → **Table** (horizontal stack of columns)
- Header row: `surface/action-hover-light`, semibold text
- Expose nested instances so cell content is customizable from table level

For full component build recipes, read `references/component-patterns.md`.

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
- **Required field convention:** Mark required with asterisk (`*`), absolute-positioned to the left of the label so it doesn't push labels out of alignment. If most fields are required, mark optional fields with "(optional)" instead.
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

**Auto Layout best practices:** Use "Hug" (both directions) for components that resize to content. Use "Fill" for elements that should stretch (input text fields). Consistent padding in multiples of 4 (8px, 12px, 16px). Consistent gap: 4px, 8px, 12px between elements.

**Prefer fluid design** with `auto-fit` / `minmax()` over fixed breakpoints. Only add explicit breakpoints when the design requires fundamentally different layouts.

For patterns (equal-size grids, button-at-bottom, responsive auto-fit, nested layouts), read `references/layout-patterns.md`.

---

## Design-to-Code Pipeline

### Token Transformation

```
Figma Variables / Penpot Tokens
        ↓ (export JSON)
  tokens.json (W3C DTCG format)
        ↓ (Style Dictionary / Token Transformer)
  ├── design-tokens.css  (CSS Custom Properties)
  ├── main.css           (Tailwind v4 @theme)
  └── tokens.ts          (TypeScript constants, optional)
```

### CSS Custom Properties (Three Layers)

```css
/* Tier 1: Primitives */
:root {
  --color-purple-500: #6C5CE7;
  --color-purple-600: #5A4BD6;
  --color-gray-700: #374151;
  --spacing-400: 1rem;
  --radius-md: 0.5rem;
}

/* Tier 2: Semantic — this is the layer you swap for theming */
:root {
  --color-primary-default: var(--color-purple-500);
  --color-primary-hover: var(--color-purple-600);
  --color-neutral-text: var(--color-gray-700);
}

/* Tier 3: Mapped — references semantics, auto-resolves on theme change */
:root {
  --surface-action: var(--color-primary-default);
  --surface-action-hover: var(--color-primary-hover);
  --text-body: var(--color-neutral-text);
  --text-on-action: #FFFFFF;
  --border-focus: var(--color-primary-default);
}

/* Dark mode — remap Tier 2, Tier 3 auto-resolves */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-default: var(--color-purple-400);
    --color-neutral-text: var(--color-gray-200);
  }
}
```

### Tailwind v4 Integration

```css
@import "tailwindcss";
@import "./design-tokens.css";

@theme {
  --color-primary: var(--surface-action);
  --color-primary-hover: var(--surface-action-hover);
  --color-text-body: var(--text-body);
  --color-text-on-action: var(--text-on-action);
  --radius-md: var(--radius-md);
}
```

Then in templates: `<button class="bg-primary hover:bg-primary-hover text-text-on-action rounded-md px-4">`.

For detailed platform mappings (SCSS, React Native, iOS, Android), read `references/platform-mapping.md`.

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
- Component-specific divergence → **Component/Mapped**

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
