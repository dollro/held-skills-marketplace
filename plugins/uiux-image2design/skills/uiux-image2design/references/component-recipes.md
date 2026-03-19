# Component Generation Orchestration

Workflow guide for generating design system boards and UI components in Penpot.
For the actual `execute_code` templates, read:
→ `uiux-design-penpot/references/generation-recipes.md`

## Board Generation Order

Build boards in this dependency order — composite components may instantiate atomic ones:

1. **Design System page** (no dependencies)
   - Colors board
   - Typography board
   - Spacing board
   - Border Radius board (if applicable)
   - Shadows board (if applicable)

2. **Components page** (depends on registered library colors/typographies)
   - Atomic: buttons, badges, tags
   - Form: inputs, selects, checkboxes, toggles
   - Composite: cards (contain buttons, badges)
   - Navigation: nav bars (contain buttons, icons)
   - Complex: modals, dropdowns (contain multiple atomic elements)

3. **Sample Screen page** (depends on registered components)

## Mapping Confirmed Spec → Recipe Placeholders

For each recipe in `generation-recipes.md`, replace placeholder values with Confirmed Spec data:

| Recipe placeholder | Source in Confirmed Spec |
|-|-|
| Color hex values | Colors table → Hex column |
| `FONT_FAMILY` | Typography → Family column |
| Font sizes/weights | Typography → Size, Weight columns |
| `RADIUS` values | Border Radius → Value column |
| Shadow values | Depth Strategy → shadow levels |
| `BLOCK_COLOR` (spacing) | Use primary color from Colors |
| Component state colors | Derive from palette: hover = primary-600, active = primary-700 |
| `DEVICE_WIDTH` | Layout → target dimensions |

## Component Selection Logic

Based on the Confirmed Spec's component inventory:

1. **Always generate**: Colors, Typography, Spacing boards (every design system needs these)
2. **Generate if listed**: Each component from the "Components to Generate" table
3. **Skip if marked ❌**: Components the user explicitly excluded in Phase 2
4. **Infer variants**: Use the "Variants" and "States" columns to determine how many
   individual shapes to create before assembling the grid board
5. **Register defaults**: After assembling each component board, register the default
   variant (e.g., `btn-primary-default`) as a library component
