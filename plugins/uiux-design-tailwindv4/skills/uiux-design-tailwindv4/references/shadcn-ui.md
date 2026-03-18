# shadcn/ui Component Guide

Install and configure shadcn/ui components for React projects with Tailwind v4. This guide runs AFTER theme infrastructure is set up (CSS variables, `components.json`, `cn()` utility).

**Prerequisite**: Theme infrastructure must exist. See the main skill's "Approach B" (CSS variables + `@theme inline`) for the shadcn-compatible setup.

## Installation Order

Install components in dependency order. Foundation first, then feature components.

### Foundation (install first)

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input label
pnpm dlx shadcn@latest add card
```

### Feature Components (install as needed)

```bash
# Forms
pnpm dlx shadcn@latest add form        # needs: react-hook-form, zod, @hookform/resolvers
pnpm dlx shadcn@latest add textarea select checkbox switch

# Feedback
pnpm dlx shadcn@latest add toast        # needs: sonner
pnpm dlx shadcn@latest add alert badge

# Overlay
pnpm dlx shadcn@latest add dialog sheet popover dropdown-menu

# Data Display
pnpm dlx shadcn@latest add table        # for data tables, also: @tanstack/react-table
pnpm dlx shadcn@latest add tabs separator avatar

# Navigation
pnpm dlx shadcn@latest add navigation-menu command
```

### External Dependencies

| Component | Requires |
|-|-|
| Form | `react-hook-form`, `zod`, `@hookform/resolvers` |
| Toast | `sonner` |
| Data Table | `@tanstack/react-table` |
| Command | `cmdk` |
| Date Picker | `date-fns` (optional) |

Install external deps separately: `pnpm add react-hook-form zod @hookform/resolvers`

## Known Gotchas

### Radix Select -- No Empty Strings

```tsx
// WRONG: empty string values
<SelectItem value="">All</SelectItem>           // BREAKS

// CORRECT: use sentinel value
<SelectItem value="__any__">All</SelectItem>    // WORKS
const actual = value === "__any__" ? "" : value
```

### React Hook Form -- Null Values

```tsx
// WRONG: spreading field passes null which Input rejects
<Input {...field} />

// CORRECT: destructure and handle null
<Input
  value={field.value ?? ''}
  onChange={field.onChange}
  onBlur={field.onBlur}
  name={field.name}
  ref={field.ref}
/>
```

### Lucide Icons -- Tree-Shaking

```tsx
// WRONG: dynamic import breaks tree-shaking in production
import * as LucideIcons from 'lucide-react'
const Icon = LucideIcons[iconName]  // BREAKS in prod

// CORRECT: use explicit map
import { Home, Users, Settings, type LucideIcon } from 'lucide-react'
const ICON_MAP: Record<string, LucideIcon> = { Home, Users, Settings }
const Icon = ICON_MAP[iconName]
```

### Dialog Width Override

```tsx
// WRONG: default sm:max-w-lg won't be overridden by unprefixed class
<DialogContent className="max-w-6xl">       // DOESN'T WORK

// CORRECT: use same breakpoint prefix
<DialogContent className="sm:max-w-6xl">    // WORKS
```

## Customizing Components

shadcn components use semantic CSS tokens from your theme.

### Variant Extension

Add custom variants by editing the component file in `src/components/ui/`:

```tsx
// button.tsx -- add a "brand" variant
const buttonVariants = cva("...", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      brand: "bg-brand text-brand-foreground hover:bg-brand/90",
      // ... existing variants
    },
  },
})
```

### Color Overrides

Use semantic tokens from your theme -- never raw Tailwind colors:

```tsx
// WRONG
<Button className="bg-blue-500">

// CORRECT
<Button className="bg-primary">
<Card className="bg-card text-card-foreground">
```

## Workflow

### Step 1: Assess Needs

| Need | Components |
|-|-|
| Forms with validation | Form, Input, Label, Select, Textarea, Button, Toast |
| Data display with sorting | Table, Badge, Pagination |
| Admin CRUD interface | Dialog, Form, Table, Button, Toast |
| Marketing/landing page | Card, Button, Badge, Separator |
| Settings/preferences | Tabs, Form, Switch, Select, Toast |
| Navigation | NavigationMenu (desktop), Sheet (mobile), ModeToggle |

### Step 2: Install Components

Install foundation first, then feature components for the identified needs.

### Step 3: Build Recipes

Combine components into working patterns. See [shadcn-recipes.md](shadcn-recipes.md) for complete working examples:

- **Contact Form** -- Form + Input + Textarea + Button + Toast
- **Data Table** -- Table + Column sorting + Pagination + Search
- **Modal CRUD** -- Dialog + Form + Button
- **Navigation** -- Sheet + NavigationMenu + ModeToggle
- **Settings Page** -- Tabs + Form + Switch + Select + Toast

### Step 4: Customize

Apply project-specific colors and variants using semantic tokens from the theme.

## Component Catalogue

### Button

```bash
pnpm dlx shadcn@latest add button
```

**Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes**: `default`, `sm`, `lg`, `icon`

```tsx
<Button variant="outline" size="sm" onClick={handleClick}>Save</Button>
<Button variant="ghost" size="icon"><Trash className="h-4 w-4" /></Button>
<Button disabled={isPending}>{isPending ? 'Saving...' : 'Save'}</Button>
```

### Input + Label

```bash
pnpm dlx shadcn@latest add input label
```

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

When using with react-hook-form, don't spread `{...field}` -- pass props individually to avoid null value issues.

### Card

```bash
pnpm dlx shadcn@latest add card
```

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Form

```bash
pnpm dlx shadcn@latest add form
pnpm add react-hook-form zod @hookform/resolvers
```

Wraps react-hook-form with shadcn styling. See [shadcn-recipes.md](shadcn-recipes.md) for complete form examples.

**Key exports**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`

### Dialog

```bash
pnpm dlx shadcn@latest add dialog
```

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <Button onClick={() => setOpen(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

Override width with `sm:max-w-*` (must match breakpoint prefix).

### Sheet

```bash
pnpm dlx shadcn@latest add sheet
```

Side panel -- commonly used for mobile navigation.

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon"><Menu /></Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader>
    {/* nav links */}
  </SheetContent>
</Sheet>
```

**Sides**: `left`, `right`, `top`, `bottom`

### Table

```bash
pnpm dlx shadcn@latest add table
```

Static table. For sortable/filterable data tables, also install `@tanstack/react-table`. See [shadcn-recipes.md](shadcn-recipes.md) for the data table pattern.

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(u => (
      <TableRow key={u.id}>
        <TableCell>{u.name}</TableCell>
        <TableCell>{u.email}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Select

```bash
pnpm dlx shadcn@latest add select
```

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

No empty string values. Use `"__any__"` sentinel for "All" options.

### Toast (Sonner)

```bash
pnpm dlx shadcn@latest add toast
pnpm add sonner
```

Add `<Toaster />` to your root layout, then:

```tsx
import { toast } from 'sonner'

toast.success('Saved successfully')
toast.error('Something went wrong')
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
})
```

### Tabs

```bash
pnpm dlx shadcn@latest add tabs
```

```tsx
<Tabs defaultValue="general">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
  </TabsList>
  <TabsContent value="general">General settings...</TabsContent>
  <TabsContent value="security">Security settings...</TabsContent>
</Tabs>
```

### Dropdown Menu

```bash
pnpm dlx shadcn@latest add dropdown-menu
```

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Badge

```bash
pnpm dlx shadcn@latest add badge
```

**Variants**: `default`, `secondary`, `outline`, `destructive`

```tsx
<Badge variant="secondary">Draft</Badge>
<Badge variant="destructive">Overdue</Badge>
```

### Switch

```bash
pnpm dlx shadcn@latest add switch
```

```tsx
<div className="flex items-center gap-2">
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

### Separator

```bash
pnpm dlx shadcn@latest add separator
```

```tsx
<Separator />                                              {/* horizontal */}
<Separator orientation="vertical" className="h-6" />       {/* vertical */}
```

### Avatar

```bash
pnpm dlx shadcn@latest add avatar
```

```tsx
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>
```
