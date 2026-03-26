---
name: uiux-design-tailwindv4
description: "Build production-ready design systems with Tailwind CSS v4. Covers CSS-first @theme configuration, semantic design tokens (OKLCH/HSL), CVA component variants, responsive layouts, dark mode, native animations, and accessibility. Includes optional shadcn/ui integration depth for rapid component development. Use when: creating component libraries, implementing design systems, building responsive UIs, setting up Tailwind v4 theming, migrating from v3 to v4, or troubleshooting Tailwind v4 issues. Triggers: 'tailwind', 'design system', 'component library', 'tailwind v4', 'css theme', 'dark mode tailwind', 'shadcn', 'CVA', 'design tokens'."
---

# Tailwind CSS v4 Design Systems

Build production-ready design systems with Tailwind CSS v4, including CSS-first configuration, design tokens, component variants, responsive patterns, dark mode, and accessibility.

> **Note**: This skill targets Tailwind CSS v4 (2024+). For v3 projects, see [references/migration-v3-to-v4.md](references/migration-v3-to-v4.md).

## When to Use This Skill

- Creating a component library with Tailwind v4
- Implementing design tokens and theming with CSS-first configuration
- Building responsive and accessible components
- Standardizing UI patterns across a codebase
- Migrating from Tailwind v3 to v4
- Setting up dark mode with native CSS features
- Integrating shadcn/ui components with Tailwind v4
- Fixing Tailwind v4 color/theme issues

## Design System Foundation

This skill implements the code side of a design system. For the architectural foundation — token tiers, naming conventions, component specs — it builds on `uiux-design-system`:

| Design System Knowledge | Reference |
|-|-|
| 3-tier token architecture (primitive → semantic → mapped) | `uiux-design-system/SKILL.md` § "The 3-Tier Token Hierarchy" |
| Mapped token categories (text/icon/surface/border) | `uiux-design-system/SKILL.md` § "Mapped Token Tables" |
| Component specs & build recipes | `uiux-design-system/references/component-patterns.md` |
| Color scale generation (opacity method) | `uiux-design-system/SKILL.md` § "Token Categories > Color" |
| Typography type scale (ratio-based + 4px snap) | `uiux-design-system/SKILL.md` § "Token Categories > Typography" |
| Accessibility (WCAG 2.2 + EAA, contrast ratios) | `uiux-design-system/references/accessibility.md` |
| Design-to-code pipeline (DTCG → CSS → Tailwind) | `uiux-design-system/SKILL.md` § "Design-to-Code Pipeline" |
| Multi-brand theming strategy | `uiux-design-system/SKILL.md` § "Multi-Brand Strategies" |

### How Tailwind v4 Maps to the 3-Tier Token System

| Token Tier | Tailwind v4 Implementation |
|-|-|
| **Primitive** (raw values) | CSS custom properties in `:root` — hex/OKLCH/HSL values |
| **Semantic** (intent aliases) | CSS custom properties referencing primitives — `var(--color-purple-500)` |
| **Mapped** (component-ready) | `@theme` block — maps semantic tokens to Tailwind utilities (`bg-primary`, `text-foreground`) |

Dark mode swaps values at the **semantic tier** (not primitives). The `@theme` block and utility classes stay unchanged — they auto-resolve through the alias chain. See `uiux-design-system/references/platform-mapping.md` for the full strategy.

### Mapped Token Categories in @theme

The design system defines four mapped categories. Here's how they map to Tailwind `@theme`:

```css
@theme {
  /* text/* tokens → text-* utilities */
  --color-text-heading: var(--color-neutral-text);
  --color-text-body: var(--color-neutral-text);
  --color-text-action: var(--color-primary-default);
  --color-text-on-action: var(--text-on-action);

  /* surface/* tokens → bg-* utilities */
  --color-surface-page: var(--surface-page);
  --color-surface-default: var(--surface-default);
  --color-surface-action: var(--color-primary-default);

  /* border/* tokens → border-* utilities */
  --color-border-default: var(--border-default);
  --color-border-focus: var(--border-focus);

  /* icon/* mirrors text/* — use the same color utilities */
}
```

This is complementary to the shadcn/ui naming pattern (Approach B below). Both work — choose based on whether you're using shadcn.

## Key v4 Changes

| v3 Pattern | v4 Pattern |
|-|-|
| `tailwind.config.ts` | `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `darkMode: "class"` | `@custom-variant dark (&:where(.dark, .dark *))` |
| `theme.extend.colors` | `@theme { --color-*: value }` |
| `require("tailwindcss-animate")` | CSS `@keyframes` in `@theme` + `@starting-style` |
| PostCSS plugin | `@tailwindcss/vite` plugin (for Vite projects) |

## Quick Start: CSS-First Configuration

### Approach A: Direct @theme with OKLCH (Recommended)

This is the primary v4 pattern. Colors are defined directly in `@theme` using OKLCH for perceptual uniformity. No intermediate CSS variables needed.

```css
/* app.css */
@import "tailwindcss";

@theme {
  /* Semantic color tokens using OKLCH */
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(14.5% 0.025 264);

  --color-primary: oklch(14.5% 0.025 264);
  --color-primary-foreground: oklch(98% 0.01 264);

  --color-secondary: oklch(96% 0.01 264);
  --color-secondary-foreground: oklch(14.5% 0.025 264);

  --color-muted: oklch(96% 0.01 264);
  --color-muted-foreground: oklch(46% 0.02 264);

  --color-accent: oklch(96% 0.01 264);
  --color-accent-foreground: oklch(14.5% 0.025 264);

  --color-destructive: oklch(53% 0.22 27);
  --color-destructive-foreground: oklch(98% 0.01 264);

  --color-border: oklch(91% 0.01 264);
  --color-ring: oklch(14.5% 0.025 264);
  --color-ring-offset: oklch(100% 0 0);

  --color-card: oklch(100% 0 0);
  --color-card-foreground: oklch(14.5% 0.025 264);

  /* Radius tokens */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Animation tokens */
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-fade-out: fade-out 0.2s ease-in;
  --animate-slide-in: slide-in 0.3s ease-out;
  --animate-slide-out: slide-out 0.3s ease-in;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slide-in {
    from { transform: translateY(-0.5rem); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes slide-out {
    from { transform: translateY(0); opacity: 1; }
    to { transform: translateY(-0.5rem); opacity: 0; }
  }
}

/* Dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));

/* Dark mode overrides */
.dark {
  --color-background: oklch(14.5% 0.025 264);
  --color-foreground: oklch(98% 0.01 264);

  --color-primary: oklch(98% 0.01 264);
  --color-primary-foreground: oklch(14.5% 0.025 264);

  --color-secondary: oklch(22% 0.02 264);
  --color-secondary-foreground: oklch(98% 0.01 264);

  --color-muted: oklch(22% 0.02 264);
  --color-muted-foreground: oklch(65% 0.02 264);

  --color-accent: oklch(22% 0.02 264);
  --color-accent-foreground: oklch(98% 0.01 264);

  --color-destructive: oklch(42% 0.15 27);
  --color-destructive-foreground: oklch(98% 0.01 264);

  --color-border: oklch(22% 0.02 264);
  --color-ring: oklch(83% 0.02 264);
  --color-ring-offset: oklch(14.5% 0.025 264);

  --color-card: oklch(14.5% 0.025 264);
  --color-card-foreground: oklch(98% 0.01 264);
}

/* Base styles */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

### Approach B: CSS Variables + @theme inline (HSL, shadcn/ui compatible)

Use this pattern when integrating with shadcn/ui, which expects `:root` CSS variables with HSL values. This four-step architecture is mandatory when using shadcn.

```css
/* src/index.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Step 1: Define CSS variables at root (NOT inside @layer base) */
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(221.2 83.2% 53.3%);
  --primary-foreground: hsl(210 40% 98%);
  --secondary: hsl(210 40% 96.1%);
  --secondary-foreground: hsl(222.2 47.4% 11.2%);
  --muted: hsl(210 40% 96.1%);
  --muted-foreground: hsl(215.4 16.3% 46.9%);
  --accent: hsl(210 40% 96.1%);
  --accent-foreground: hsl(222.2 47.4% 11.2%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(214.3 31.8% 91.4%);
  --ring: hsl(221.2 83.2% 53.3%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222.2 84% 4.9%);
}

.dark {
  --background: hsl(222.2 84% 4.9%);
  --foreground: hsl(210 40% 98%);
  --primary: hsl(217.2 91.2% 59.8%);
  --primary-foreground: hsl(222.2 47.4% 11.2%);
  --secondary: hsl(217.2 32.6% 17.5%);
  --secondary-foreground: hsl(210 40% 98%);
  --muted: hsl(217.2 32.6% 17.5%);
  --muted-foreground: hsl(215 20.2% 65.1%);
  --accent: hsl(217.2 32.6% 17.5%);
  --accent-foreground: hsl(210 40% 98%);
  --destructive: hsl(0 62.8% 30.6%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(217.2 32.6% 17.5%);
  --ring: hsl(224.3 76.3% 48%);
  --card: hsl(222.2 84% 4.9%);
  --card-foreground: hsl(210 40% 98%);
}

/* Step 2: Map variables to Tailwind utilities */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
}

/* Step 3: Apply base styles (NO hsl() wrapper -- already has hsl) */
@layer base {
  * {
    border-color: var(--border);
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}
```

Result: `bg-background`, `text-primary`, etc. work automatically. Dark mode switches via `.dark` class -- no `dark:` variants needed for semantic colors.

### Vite Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

Install:

```bash
pnpm add tailwindcss @tailwindcss/vite
pnpm add -D @types/node
```

## Core Concepts

### Design Token Hierarchy

```
Brand Tokens (abstract)
    --> Semantic Tokens (purpose)
        --> Component Tokens (specific)

Example:
    oklch(45% 0.2 260) --> --color-primary --> bg-primary
```

### Component Architecture

```
Base styles --> Variants --> Sizes --> States --> Overrides
```

## Component Patterns

### CVA (Class Variance Authority) Components

```typescript
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// React 19: ref as prop, no forwardRef
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
}
```

### Compound Components (React 19)

```typescript
// components/ui/card.tsx
import { cn } from '@/lib/utils'

export function Card({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
}

export function CardTitle({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { ref?: React.Ref<HTMLHeadingElement> }) {
  return (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & { ref?: React.Ref<HTMLParagraphElement> }) {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({
  className,
  ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
```

### Form Components

```typescript
// components/ui/input.tsx
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  ref?: React.Ref<HTMLInputElement>
}

export function Input({ className, type, error, ref, ...props }: InputProps) {
  return (
    <div className="relative">
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// components/ui/label.tsx
import { cva } from 'class-variance-authority'

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
)

export function Label({
  className,
  ref,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { ref?: React.Ref<HTMLLabelElement> }) {
  return <label ref={ref} className={cn(labelVariants(), className)} {...props} />
}
```

Form usage with React Hook Form + Zod:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} error={errors.email?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} error={errors.password?.message} />
      </div>
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
  )
}
```

### Responsive Grid System

```typescript
// components/ui/grid.tsx
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    },
    gap: {
      none: 'gap-0',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
  },
  defaultVariants: { cols: 3, gap: 'md' },
})

interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export function Grid({ className, cols, gap, ...props }: GridProps) {
  return <div className={cn(gridVariants({ cols, gap, className }))} {...props} />
}

const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: { size: 'xl' },
})

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({ className, size, ...props }: ContainerProps) {
  return <div className={cn(containerVariants({ size, className }))} {...props} />
}

// Usage
// <Container>
//   <Grid cols={4} gap="lg">
//     {items.map(item => <Card key={item.id} />)}
//   </Grid>
// </Container>
```

## Native CSS Animations (v4)

### @starting-style for Entry Animations

```css
/* Native popover animations */
[popover] {
  transition:
    opacity 0.2s,
    transform 0.2s,
    display 0.2s allow-discrete;
  opacity: 0;
  transform: scale(0.95);
}

[popover]:popover-open {
  opacity: 1;
  transform: scale(1);
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

### Dialog Animations in @theme

```css
@theme {
  --animate-dialog-in: dialog-fade-in 0.2s ease-out;
  --animate-dialog-out: dialog-fade-out 0.15s ease-in;
}

@keyframes dialog-fade-in {
  from { opacity: 0; transform: scale(0.95) translateY(-0.5rem); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes dialog-fade-out {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.95) translateY(-0.5rem); }
}
```

Usage in components:

```tsx
<DialogPrimitive.Overlay
  className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
/>
<DialogPrimitive.Content
  className="... data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
/>
```

## Dark Mode

Two implementation approaches are available. For the full guide, see [references/dark-mode.md](references/dark-mode.md).

**Quick setup**: Wrap your app in a `ThemeProvider` that toggles `.dark` on `<html>`. With semantic tokens (either OKLCH or HSL), `bg-primary` automatically responds to theme -- no `dark:` variants needed for themed colors.

```typescript
// providers/ThemeProvider.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void; resolvedTheme: 'dark' | 'light' } | undefined>(undefined)

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'theme' }: {
  children: React.ReactNode; defaultTheme?: Theme; storageKey?: string
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null
    if (stored) setTheme(stored)
  }, [storageKey])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
    root.classList.add(resolved)
    setResolvedTheme(resolved)
  }, [theme])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: (t) => { localStorage.setItem(storageKey, t); setTheme(t) },
      resolvedTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
```

## Advanced v4 Patterns

### Custom Utilities with @utility

```css
@utility line-t {
  @apply relative before:absolute before:top-0 before:-left-[100vw] before:h-px before:w-[200vw] before:bg-gray-950/5 dark:before:bg-white/10;
}

@utility text-gradient {
  @apply bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent;
}
```

### Theme Modifiers

```css
/* @theme inline: reference other CSS variables */
@theme inline {
  --font-sans: var(--font-inter), system-ui;
}

/* @theme static: always generate CSS variables, even when unused */
@theme static {
  --color-brand: oklch(65% 0.15 240);
}

/* Import with theme options */
@import "tailwindcss" theme(static);
```

### Namespace Overrides

```css
@theme {
  /* Clear all default colors and define your own */
  --color-*: initial;
  --color-white: #fff;
  --color-black: #000;
  --color-primary: oklch(45% 0.2 260);
  --color-secondary: oklch(65% 0.15 200);
}
```

### Semi-transparent Color Variants

```css
@theme {
  --color-primary-50: color-mix(in oklab, var(--color-primary) 5%, transparent);
  --color-primary-100: color-mix(in oklab, var(--color-primary) 10%, transparent);
  --color-primary-200: color-mix(in oklab, var(--color-primary) 20%, transparent);
}
```

### Container Queries

```css
@theme {
  --container-xs: 20rem;
  --container-sm: 24rem;
  --container-md: 28rem;
  --container-lg: 32rem;
}
```

## shadcn/ui Integration

When using shadcn/ui with Tailwind v4, use **Approach B** (CSS variables + `@theme inline`) from the Quick Start section above.

### Setup

```bash
pnpm dlx shadcn@latest init
rm -f tailwind.config.ts  # v4 does not use config file
```

### components.json (critical)

```json
{
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  }
}
```

`"config": ""` is required -- v4 does not use `tailwind.config.ts`.

### Component Installation

Install foundation components first, then feature components as needed:

```bash
pnpm dlx shadcn@latest add button input label card
```

For complete component guides and UI recipes, see:
- [references/shadcn-ui.md](references/shadcn-ui.md) -- component installation, dependencies, gotchas, customization
- [references/shadcn-recipes.md](references/shadcn-recipes.md) -- working patterns (forms, data tables, navigation, modals, settings)

## Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Reusable focus ring
export const focusRing = cn(
  'focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-ring focus-visible:ring-offset-2'
)

// Reusable disabled state
export const disabled = 'disabled:pointer-events-none disabled:opacity-50'
```

Install dependencies: `pnpm add clsx tailwind-merge`

## v3 to v4 Migration Checklist

- [ ] Replace `tailwind.config.ts` with CSS `@theme` block
- [ ] Change `@tailwind base/components/utilities` to `@import "tailwindcss"`
- [ ] Move color definitions to `@theme { --color-*: value }`
- [ ] Replace `darkMode: "class"` with `@custom-variant dark`
- [ ] Move `@keyframes` inside `@theme` blocks
- [ ] Replace `require("tailwindcss-animate")` with native CSS animations
- [ ] Update `h-10 w-10` to `size-10`
- [ ] Remove `forwardRef` (React 19 passes ref as prop)
- [ ] Consider OKLCH colors for better color perception
- [ ] Replace custom plugins with `@utility` directives
- [ ] Replace hardcoded colors with semantic tokens
- [ ] Use `@tailwindcss/vite` plugin instead of PostCSS (for Vite)
- [ ] Set `components.json` `"config": ""` (if using shadcn)

For the complete migration guide with patterns and examples, see [references/migration-v3-to-v4.md](references/migration-v3-to-v4.md).

## Common Errors

| Symptom | Likely Cause | Fix |
|-|-|-|
| `bg-primary` doesn't work | Missing `@theme inline` mapping | Add `@theme inline` block |
| Colors all black/white | Double `hsl()` wrapping | Use `var(--color)` not `hsl(var(--color))` |
| Dark mode not switching | Missing ThemeProvider | Wrap app in `<ThemeProvider>` |
| Build fails | `tailwind.config.ts` exists | Delete the file |
| `@apply` fails on custom class | v4 breaking change | Use `@utility` instead of `@layer components` |
| Animation errors | Using `tailwindcss-animate` | Use native CSS animations or `tw-animate-css` |
| `@/` imports fail | Missing path aliases | Add paths to `tsconfig.app.json` |

For detailed error explanations and prevention checklist, see [references/common-gotchas.md](references/common-gotchas.md).

## Best Practices

### Do

- Use `@theme` blocks for CSS-first configuration
- Use OKLCH colors for perceptual uniformity (or HSL with shadcn)
- Compose with CVA for type-safe component variants
- Use semantic tokens (`bg-primary` not `bg-blue-500`)
- Use `size-*` shorthand for equal width/height
- Add ARIA attributes and focus states for accessibility
- Use `@tailwindcss/vite` plugin for Vite projects
- Pair every background color with a foreground token
- Test both light and dark themes
- Check WCAG contrast ratios (4.5:1 for text, 3:1 for UI)

### Don't

- Don't use `tailwind.config.ts` -- use CSS `@theme` instead
- Don't use `@tailwind` directives -- use `@import "tailwindcss"`
- Don't use `forwardRef` -- React 19 passes ref as prop
- Don't use arbitrary values -- extend `@theme` instead
- Don't hardcode colors -- use semantic tokens
- Don't put `:root` inside `@layer base`
- Don't nest `@theme` inside selectors (`.dark { @theme {} }`)
- Don't double-wrap colors: `hsl(var(--background))` when variable already contains `hsl()`
- Don't mix hardcoded and semantic colors in the same component
