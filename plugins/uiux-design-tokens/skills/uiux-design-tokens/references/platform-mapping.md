# Platform Mapping Reference

How to transform design tokens from the abstract DTCG format into platform-specific code. The token layer is the single source of truth — platform outputs are generated transforms.

## CSS Custom Properties

### Naming Transform

| DTCG path | CSS custom property |
|-|-|
| `color.primitive.blue.500` | `--color-primitive-blue-500` |
| `color.semantic.action.primary` | `--color-semantic-action-primary` |
| `spacing.scale.md` | `--spacing-scale-md` |
| `font.size.body.base` | `--font-size-body-base` |

Dots become hyphens. The full token path maps 1:1 to the variable name.

### Organization

Use `:root` for light/default values. Override with `[data-theme="dark"]` for alternate themes.

```css
/* Primitives — raw palette */
:root {
  --color-primitive-blue-500: #2563eb;
  --color-primitive-blue-700: #1d4ed8;
  --color-primitive-gray-50: #f9fafb;
  --color-primitive-gray-900: #111827;
  --spacing-scale-sm: 0.5rem;
  --spacing-scale-md: 1rem;
}

/* Semantics — reference primitives */
:root {
  --color-action-primary: var(--color-primitive-blue-500);
  --color-action-primary-hover: var(--color-primitive-blue-700);
  --color-bg-default: var(--color-primitive-gray-50);
  --color-text-default: var(--color-primitive-gray-900);
}

[data-theme="dark"] {
  --color-bg-default: var(--color-primitive-gray-900);
  --color-text-default: var(--color-primitive-gray-50);
}
```

Key principle: semantic CSS vars always reference primitive CSS vars, never raw hex values.

### Dark Mode

Override primitive custom properties within a dark scope. Semantic vars stay unchanged — they reference the same primitives, which now resolve differently.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-50: #0a0a0a;
    --color-neutral-900: #fafafa;
    /* Swap the full neutral scale + adjust feedback colors */
  }
}

/* Or class-based for manual toggle: */
.dark {
  --color-neutral-50: #0a0a0a;
  --color-neutral-900: #fafafa;
}
```

### High Contrast

For `forced-colors` / Windows High Contrast mode:

```css
@media (forced-colors: active) {
  :root {
    --color-background-surface: Canvas;
    --color-text-primary: CanvasText;
    --color-border-default: CanvasText;
    --color-interactive-default: LinkText;
  }
}
```

### Reduced Motion

Gate all duration tokens when user prefers reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-fast: 0ms;
    --motion-duration-normal: 0ms;
    --motion-duration-slow: 0ms;
  }
}
```

## Tailwind CSS v4

Tailwind v4 uses CSS-first configuration. Import the generated token CSS file, then map tokens in `@theme`:

```css
@import "./design-tokens.css";
@import "tailwindcss";

@theme {
  --color-surface: var(--color-background-surface);
  --color-primary: var(--color-interactive-default);
  --color-danger: var(--color-feedback-danger);
  --spacing-inline-md: var(--space-inline-md);
  --spacing-stack-lg: var(--space-stack-lg);
  --radius-interactive: var(--radius-interactive);
}
```

Key principle: the token CSS file provides custom properties; `@theme` maps them to Tailwind's namespace so utility classes like `bg-surface`, `text-primary`, and `rounded-interactive` work.

For Tailwind v3: use `tailwind.config.js` with `var(--token-name)` references in `theme.extend`.

> For full Tailwind v4 configuration, dark mode ThemeProvider, OKLCH color patterns, and shadcn/ui integration, see the `uiux-design-tailwindv4` skill.

## SCSS

Map tokens to `$variables` and use maps for scales:

```scss
$color-action-primary: var(--color-action-primary);
$spacing-md: var(--spacing-scale-md);

$font-sizes: (
  sm: var(--font-size-body-sm),
  base: var(--font-size-body-base),
  lg: var(--font-size-body-lg),
);

@mixin typography($token) {
  font-family: map-get($token, fontFamily);
  font-size: map-get($token, fontSize);
  font-weight: map-get($token, fontWeight);
  line-height: map-get($token, lineHeight);
}
```

## Other Platforms

| Platform | Output Format | Pattern |
|-|-|-|
| React Native | JS/TS module | Named exports: `export const colorActionPrimary = '#2563eb'` |
| iOS (Swift) | Enum/struct | `enum DesignTokens { static let actionPrimary = UIColor(hex: "#2563eb") }` |
| Android | XML resources / Compose theme | `<color name="action_primary">#2563eb</color>` or `MaterialTheme` values |

Native platforms receive resolved values (not `var()` references) since CSS custom properties are unavailable.

## Style Dictionary

[Style Dictionary](https://amzn.github.io/style-dictionary/) is the standard pipeline tool for multi-platform token generation. It reads DTCG-compatible JSON and outputs platform-specific code.

```json
{
  "source": ["tokens/**/*.json"],
  "platforms": {
    "css": {
      "transformGroup": "css",
      "buildPath": "dist/css/",
      "files": [{ "destination": "tokens.css", "format": "css/variables" }]
    },
    "js": {
      "transformGroup": "js",
      "buildPath": "dist/js/",
      "files": [{ "destination": "tokens.js", "format": "javascript/es6" }]
    }
  }
}
```

Add additional platform entries (android, ios, scss) to generate all outputs from one token source.

For Tokens Studio projects, add `@tokens-studio/sd-transforms` to handle Tokens Studio–specific formats (math expressions, color modifiers, multi-value composites) before Style Dictionary processes them:

```bash
npm install @tokens-studio/sd-transforms
```
