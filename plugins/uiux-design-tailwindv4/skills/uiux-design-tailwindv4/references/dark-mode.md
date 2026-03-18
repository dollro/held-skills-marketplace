# Dark Mode Implementation

## Overview

Tailwind v4 dark mode requires:
1. A `ThemeProvider` component to manage state
2. `.dark` class toggling on the `<html>` element
3. localStorage persistence
4. System theme detection

## ThemeProvider Component (shadcn/ui style)

### Full Implementation

```typescript
// src/components/theme-provider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(storageKey) as Theme) || defaultTheme
    } catch (e) {
      return defaultTheme
    }
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme)
      } catch (e) {
        console.warn('Storage unavailable')
      }
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
```

### Wrap Your App

```typescript
// src/main.tsx
import { ThemeProvider } from '@/components/theme-provider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
```

## ModeToggle Component

### Using shadcn/ui Dropdown Menu

```bash
pnpm dlx shadcn@latest add dropdown-menu
```

```typescript
// src/components/mode-toggle.tsx
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/components/theme-provider'

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## How It Works

### Theme Flow

```
User selects theme --> setTheme() called
  --> Save to localStorage
  --> Update state
  --> useEffect triggers
  --> Remove existing classes (.light, .dark)
  --> Add new class to <html>
  --> CSS variables update (.dark overrides :root)
  --> UI updates automatically
```

### System Theme Detection

```typescript
if (theme === 'system') {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
    .matches ? 'dark' : 'light'
  root.classList.add(systemTheme)
}
```

This respects the user's OS preference when "System" is selected.

## Modern React 19 Alternative

This approach uses `@custom-variant` from Tailwind v4, `resolvedTheme` for programmatic access, and updates `meta[theme-color]` for mobile browsers.

### CSS Setup

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(14.5% 0.025 264);
  /* ... other tokens */
}

.dark {
  --color-background: oklch(14.5% 0.025 264);
  --color-foreground: oklch(98% 0.01 264);
  /* ... dark overrides */
}
```

### ThemeProvider with resolvedTheme

```typescript
// providers/ThemeProvider.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
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

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolved === 'dark' ? '#09090b' : '#ffffff')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme: (newTheme) => {
        localStorage.setItem(storageKey, newTheme)
        setTheme(newTheme)
      },
      resolvedTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

### Simple Toggle (no dropdown needed)

```typescript
// components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/providers/ThemeProvider'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## Common Issues

### Dark mode not switching

**Cause**: Theme provider not wrapping app.
**Fix**: Ensure `<ThemeProvider>` wraps your app in `main.tsx`.

### Theme resets on page refresh

**Cause**: localStorage not working.
**Fix**: Check browser privacy settings, add sessionStorage fallback.

### Flash of wrong theme on load

**Cause**: Theme applied after initial render.
**Fix**: Add inline script to `index.html` before the app loads:

```html
<script>
  const theme = localStorage.getItem('theme') || 'system';
  const resolved = theme === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.classList.add(resolved);
</script>
```

### Icons not changing

**Cause**: CSS transitions not working.
**Fix**: Verify icon classes use `dark:` variants for the sun/moon animations.

## Testing Checklist

- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] System mode respects OS setting
- [ ] Theme persists after page refresh
- [ ] Toggle component shows current state
- [ ] All text has proper contrast in both themes
- [ ] No flash of wrong theme on initial load
- [ ] Works in incognito mode (graceful fallback)
- [ ] `meta[theme-color]` updates for mobile browsers

## Official Documentation

- shadcn/ui Dark Mode (Vite): https://ui.shadcn.com/docs/dark-mode/vite
- Tailwind Dark Mode: https://tailwindcss.com/docs/dark-mode
