# Generation Recipes for Penpot MCP

Reusable `execute_code` templates for generating UI components and design system boards
in Penpot. Each recipe is self-contained — adapt placeholder values (colors, fonts, sizes)
to match your project's design system or Confirmed Spec.

> **Execution constraints:**
> - One board per `execute_code` call
> - Max ~30 seconds per call
> - Split complex components across multiple calls
> - Don't read properties immediately after toggle/resize operations
> - Always use hex colors (no CSS functions like oklch/hsl)

## Shared Helpers

These helper patterns are used across multiple recipes. Include them at the top of any
`execute_code` call that needs them.

### Create a Labeled Section Header

```javascript
// Creates a text label for a section within a board
function createLabel(parent, text, x, y, fontSize, fontWeight, color) {
  const label = penpot.createText(text);
  label.fontFamily = 'Inter';
  label.fontSize = String(fontSize);
  label.fontWeight = String(fontWeight);
  label.fills = [{ fillColor: color, fillOpacity: 1 }];
  parent.appendChild(label);
  label.x = x;
  label.y = y;
  return label;
}
```

### Position After Existing Boards

```javascript
// Find next available X position to avoid overlap
const existingBoards = penpotUtils.findShapes(s => s.type === 'board', penpot.root);
let nextX = 0;
existingBoards.forEach(b => {
  const rightEdge = b.x + b.width;
  if (rightEdge + 100 > nextX) nextX = rightEdge + 100;
});
```

---

## Design System Boards

### Color Swatches Board

Generates a grid of color swatches with hex labels.

```javascript
// Configuration — replace with your design system values
const colors = {
  'Primitives': [
    { name: 'Neutral 50',  hex: '#FAFAFA' },
    { name: 'Neutral 100', hex: '#F5F5F5' },
    { name: 'Neutral 200', hex: '#E5E5E5' },
    // ... full scale
    { name: 'Primary 500', hex: '#3B82F6' },
    { name: 'Primary 600', hex: '#2563EB' },
    { name: 'Primary 700', hex: '#1D4ED8' },
  ],
  'Semantic': [
    { name: 'BG Surface',      hex: '#FAFAFA' },
    { name: 'BG Primary',      hex: '#3B82F6' },
    { name: 'Text Primary',    hex: '#171717' },
    { name: 'Text Secondary',  hex: '#525252' },
    { name: 'Border Default',  hex: '#E5E5E5' },
    { name: 'Interactive',     hex: '#3B82F6' },
  ]
};

const SWATCH_SIZE = 64;
const GAP = 16;
const LABEL_HEIGHT = 32;
const COLUMNS = 6;

// Calculate board size
const maxRow = Math.max(...Object.values(colors).map(arr => Math.ceil(arr.length / COLUMNS)));
const totalGroups = Object.keys(colors).length;
const boardWidth = COLUMNS * (SWATCH_SIZE + GAP) + 48;
const boardHeight = totalGroups * (40 + maxRow * (SWATCH_SIZE + LABEL_HEIGHT + GAP)) + 48;

// Create board
const board = penpot.createBoard();
board.name = 'Colors';
board.resize(Math.max(boardWidth, 600), Math.max(boardHeight, 400));
board.fills = [{ fillColor: '#FFFFFF', fillOpacity: 1 }];
// Position after existing boards
board.x = nextX; // from shared helper
board.y = 0;

let yOffset = 24;

for (const [groupName, swatches] of Object.entries(colors)) {
  // Group header
  const header = penpot.createText(groupName);
  header.fontFamily = 'Inter';
  header.fontSize = '20';
  header.fontWeight = '700';
  header.fills = [{ fillColor: '#171717', fillOpacity: 1 }];
  board.appendChild(header);
  header.x = 24;
  header.y = yOffset;
  yOffset += 36;

  // Swatches grid
  swatches.forEach((color, i) => {
    const col = i % COLUMNS;
    const row = Math.floor(i / COLUMNS);
    const x = 24 + col * (SWATCH_SIZE + GAP);
    const y = yOffset + row * (SWATCH_SIZE + LABEL_HEIGHT + GAP);

    // Color rectangle
    const rect = penpot.createRectangle();
    rect.resize(SWATCH_SIZE, SWATCH_SIZE);
    rect.fills = [{ fillColor: color.hex, fillOpacity: 1 }];
    rect.borderRadius = 8;
    rect.strokes = [{ strokeColor: '#E5E5E5', strokeWidth: 1, strokeStyle: 'solid', strokeAlignment: 'inner', strokeOpacity: 1 }];
    board.appendChild(rect);
    rect.x = x;
    rect.y = y;

    // Label
    const label = penpot.createText(color.name + '\n' + color.hex);
    label.fontFamily = 'Inter';
    label.fontSize = '10';
    label.fontWeight = '500';
    label.fills = [{ fillColor: '#525252', fillOpacity: 1 }];
    board.appendChild(label);
    label.x = x;
    label.y = y + SWATCH_SIZE + 4;
  });

  const rows = Math.ceil(swatches.length / COLUMNS);
  yOffset += rows * (SWATCH_SIZE + LABEL_HEIGHT + GAP) + 16;
}

return 'Colors board created with ' + Object.values(colors).flat().length + ' swatches';
```

### Typography Board

```javascript
const styles = [
  { name: 'Display',  size: '48', weight: '700', sample: 'Display Heading' },
  { name: 'H1',       size: '36', weight: '700', sample: 'Heading Level 1' },
  { name: 'H2',       size: '24', weight: '600', sample: 'Heading Level 2' },
  { name: 'H3',       size: '20', weight: '600', sample: 'Heading Level 3' },
  { name: 'Body',     size: '16', weight: '400', sample: 'Body text for main content areas and paragraphs.' },
  { name: 'Small',    size: '14', weight: '400', sample: 'Small text for secondary content' },
  { name: 'Caption',  size: '12', weight: '500', sample: 'CAPTION TEXT FOR LABELS' },
];

const FONT_FAMILY = 'Inter'; // Replace with confirmed font
const TEXT_COLOR = '#171717';
const META_COLOR = '#9CA3AF';
const ROW_GAP = 48;
const BOARD_PADDING = 32;

const board = penpot.createBoard();
board.name = 'Typography';
board.resize(800, BOARD_PADDING * 2 + styles.length * (ROW_GAP + 40));
board.fills = [{ fillColor: '#FFFFFF', fillOpacity: 1 }];
board.x = nextX;
board.y = 0;

let y = BOARD_PADDING;

styles.forEach(style => {
  // Meta info (name + specs)
  const meta = penpot.createText(`${style.name} — ${FONT_FAMILY} ${style.weight} / ${style.size}px`);
  meta.fontFamily = FONT_FAMILY;
  meta.fontSize = '12';
  meta.fontWeight = '400';
  meta.fills = [{ fillColor: META_COLOR, fillOpacity: 1 }];
  board.appendChild(meta);
  meta.x = BOARD_PADDING;
  meta.y = y;

  // Sample text
  const sample = penpot.createText(style.sample);
  sample.fontFamily = FONT_FAMILY;
  sample.fontSize = style.size;
  sample.fontWeight = style.weight;
  sample.fills = [{ fillColor: TEXT_COLOR, fillOpacity: 1 }];
  board.appendChild(sample);
  sample.x = BOARD_PADDING;
  sample.y = y + 18;

  y += parseInt(style.size) + ROW_GAP;
});

return 'Typography board created with ' + styles.length + ' styles';
```

### Spacing Board

```javascript
const spacings = [
  { name: 'space-1',  value: 4,  label: '4px / 0.25rem' },
  { name: 'space-2',  value: 8,  label: '8px / 0.5rem' },
  { name: 'space-3',  value: 12, label: '12px / 0.75rem' },
  { name: 'space-4',  value: 16, label: '16px / 1rem' },
  { name: 'space-6',  value: 24, label: '24px / 1.5rem' },
  { name: 'space-8',  value: 32, label: '32px / 2rem' },
  { name: 'space-12', value: 48, label: '48px / 3rem' },
  { name: 'space-16', value: 64, label: '64px / 4rem' },
];

const BLOCK_COLOR = '#3B82F6';
const board = penpot.createBoard();
board.name = 'Spacing';
board.resize(600, 48 + spacings.length * 56);
board.fills = [{ fillColor: '#FFFFFF', fillOpacity: 1 }];
board.x = nextX;
board.y = 0;

let y = 24;
spacings.forEach(sp => {
  // Spacing block
  const rect = penpot.createRectangle();
  rect.resize(sp.value, 24);
  rect.fills = [{ fillColor: BLOCK_COLOR, fillOpacity: 0.3 }];
  rect.borderRadius = 2;
  board.appendChild(rect);
  rect.x = 24;
  rect.y = y;

  // Label
  const label = penpot.createText(`${sp.name}  —  ${sp.label}`);
  label.fontFamily = 'Inter';
  label.fontSize = '12';
  label.fontWeight = '500';
  label.fills = [{ fillColor: '#525252', fillOpacity: 1 }];
  board.appendChild(label);
  label.x = 24 + Math.max(sp.value, 20) + 16;
  label.y = y + 4;

  y += 48;
});

return 'Spacing board created';
```

---

## Component Recipes

### Button Component

Creates a single button shape. Call once per variant × state combination.
Combine all variants into a board, then register the default as a component.

```javascript
// === Configuration — replace with your design system values ===
const VARIANT = 'primary'; // 'primary' | 'secondary' | 'ghost' | 'destructive'
const STATE = 'default';   // 'default' | 'hover' | 'active' | 'disabled'
const LABEL_TEXT = 'Button Label';

const FONT_FAMILY = 'Inter';
const FONT_SIZE = '14';
const FONT_WEIGHT = '600';
const TEXT_TRANSFORM = null; // or 'uppercase'

const RADIUS = 8;
const PADDING_X = 24;
const PADDING_Y = 12;
const MIN_HEIGHT = 44; // Touch target

// Variant × State color map
const BUTTON_STYLES = {
  primary: {
    default:  { bg: '#3B82F6', text: '#FFFFFF', border: null },
    hover:    { bg: '#2563EB', text: '#FFFFFF', border: null },
    active:   { bg: '#1D4ED8', text: '#FFFFFF', border: null },
    disabled: { bg: '#3B82F6', text: '#FFFFFF', border: null, opacity: 0.5 },
  },
  secondary: {
    default:  { bg: 'transparent', text: '#3B82F6', border: '#3B82F6' },
    hover:    { bg: '#EFF6FF',     text: '#2563EB', border: '#2563EB' },
    active:   { bg: '#DBEAFE',     text: '#1D4ED8', border: '#1D4ED8' },
    disabled: { bg: 'transparent', text: '#3B82F6', border: '#3B82F6', opacity: 0.5 },
  },
  ghost: {
    default:  { bg: 'transparent', text: '#3B82F6', border: null },
    hover:    { bg: '#EFF6FF',     text: '#2563EB', border: null },
    active:   { bg: '#DBEAFE',     text: '#1D4ED8', border: null },
    disabled: { bg: 'transparent', text: '#3B82F6', border: null, opacity: 0.5 },
  },
};

const style = BUTTON_STYLES[VARIANT][STATE];

// === Create button board (acts as the button frame) ===
const btn = penpot.createBoard();
btn.name = `btn-${VARIANT}-${STATE}`;
btn.resize(160, MIN_HEIGHT);
btn.borderRadius = RADIUS;

// Background fill
if (style.bg && style.bg !== 'transparent') {
  btn.fills = [{ fillColor: style.bg, fillOpacity: 1 }];
} else {
  btn.fills = [];
}

// Border
if (style.border) {
  btn.strokes = [{
    strokeColor: style.border, strokeOpacity: 1,
    strokeWidth: 1, strokeStyle: 'solid', strokeAlignment: 'inner'
  }];
}

// Opacity for disabled
if (style.opacity) {
  btn.opacity = style.opacity;
}

// Flex layout for centering
const flex = btn.addFlexLayout();
flex.dir = 'row';
flex.alignItems = 'center';
flex.justifyContent = 'center';
flex.horizontalPadding = PADDING_X;
flex.verticalPadding = PADDING_Y;
btn.horizontalSizing = 'auto';
btn.verticalSizing = 'auto';

// Label
const label = penpot.createText(LABEL_TEXT);
label.fontFamily = FONT_FAMILY;
label.fontSize = FONT_SIZE;
label.fontWeight = FONT_WEIGHT;
label.fills = [{ fillColor: style.text, fillOpacity: 1 }];
if (TEXT_TRANSFORM === 'uppercase') label.textTransform = 'uppercase';
label.growType = 'auto-width';
btn.appendChild(label);

// Position in parent board (adjust x/y as needed for the variant×state grid)
// The orchestrating code should position this within the component board

return { id: btn.id, name: btn.name };
```

### Button Component Board (all variants × states)

After creating individual buttons, assemble them into a grid board:

```javascript
// This is the ASSEMBLY step — call after all individual buttons exist
// Find all button shapes created in previous calls
const buttons = penpotUtils.findShapes(s => s.name && s.name.startsWith('btn-'), penpot.root);

const board = penpot.createBoard();
board.name = 'Buttons';
board.resize(900, 600);
board.fills = [{ fillColor: '#FFFFFF', fillOpacity: 1 }];

const grid = board.addGridLayout();
// Columns: Default | Hover | Active | Disabled
grid.addColumn('flex', 1);
grid.addColumn('flex', 1);
grid.addColumn('flex', 1);
grid.addColumn('flex', 1);
// Rows: one per variant + header row
grid.addRow('fixed', 32); // header
grid.addRow('auto');       // primary
grid.addRow('auto');       // secondary
grid.addRow('auto');       // ghost
grid.rowGap = 16;
grid.columnGap = 16;
grid.horizontalPadding = 24;
grid.verticalPadding = 24;

// Add state headers
const states = ['Default', 'Hover', 'Active', 'Disabled'];
states.forEach((state, col) => {
  const header = penpot.createText(state);
  header.fontFamily = 'Inter';
  header.fontSize = '12';
  header.fontWeight = '600';
  header.fills = [{ fillColor: '#9CA3AF', fillOpacity: 1 }];
  header.textTransform = 'uppercase';
  grid.appendChild(header, 0, col);
});

// Place buttons in grid (map variant to row, state to column)
const variantRow = { primary: 1, secondary: 2, ghost: 3 };
const stateCol = { default: 0, hover: 1, active: 2, disabled: 3 };

buttons.forEach(btn => {
  const parts = btn.name.replace('btn-', '').split('-');
  const variant = parts[0];
  const state = parts[1];
  if (variantRow[variant] !== undefined && stateCol[state] !== undefined) {
    grid.appendChild(btn, variantRow[variant], stateCol[state]);
  }
});

return 'Button component board assembled with ' + buttons.length + ' variants';
```

### Register as Component

After assembling a component board, register the default variant:

```javascript
// Find the default button to register as a component
const defaultBtn = penpotUtils.findShapes(
  s => s.name === 'btn-primary-default', penpot.root
)[0];

if (defaultBtn) {
  const component = penpot.library.local.createComponent([defaultBtn]);
  // The component is now available as an instance via:
  // component.instance()
  return 'Button/Primary registered as component: ' + component.id;
}
return 'Default button not found';
```

---

### Text Input Component

```javascript
const STATE = 'default'; // 'default' | 'focus' | 'error' | 'disabled'
const HAS_LABEL = true;
const LABEL_TEXT = 'Email Address';
const PLACEHOLDER = 'you@example.com';

const STYLES = {
  default:  { border: '#D1D5DB', bg: '#FFFFFF', text: '#171717', placeholder: '#9CA3AF', label: '#374151' },
  focus:    { border: '#3B82F6', bg: '#FFFFFF', text: '#171717', placeholder: '#9CA3AF', label: '#374151' },
  error:    { border: '#EF4444', bg: '#FEF2F2', text: '#171717', placeholder: '#9CA3AF', label: '#374151' },
  disabled: { border: '#E5E5E5', bg: '#F3F4F6', text: '#9CA3AF', placeholder: '#D1D5DB', label: '#9CA3AF' },
};

const style = STYLES[STATE];
const INPUT_HEIGHT = 44;
const INPUT_RADIUS = 8;
const FONT_FAMILY = 'Inter';

// Wrapper board
const wrapper = penpot.createBoard();
wrapper.name = `input-${STATE}`;
const wrapperFlex = wrapper.addFlexLayout();
wrapperFlex.dir = 'column';
wrapperFlex.rowGap = 6;
wrapper.horizontalSizing = 'auto';
wrapper.verticalSizing = 'auto';

// Label
if (HAS_LABEL) {
  const label = penpot.createText(LABEL_TEXT);
  label.fontFamily = FONT_FAMILY;
  label.fontSize = '14';
  label.fontWeight = '500';
  label.fills = [{ fillColor: style.label, fillOpacity: 1 }];
  label.growType = 'auto-width';
  wrapper.appendChild(label);
}

// Input field
const input = penpot.createBoard();
input.name = `input-field-${STATE}`;
input.resize(320, INPUT_HEIGHT);
input.borderRadius = INPUT_RADIUS;
input.fills = [{ fillColor: style.bg, fillOpacity: 1 }];
input.strokes = [{
  strokeColor: style.border, strokeOpacity: 1,
  strokeWidth: STATE === 'focus' ? 2 : 1,
  strokeStyle: 'solid', strokeAlignment: 'inner'
}];

const inputFlex = input.addFlexLayout();
inputFlex.dir = 'row';
inputFlex.alignItems = 'center';
inputFlex.horizontalPadding = 12;
input.horizontalSizing = 'fix';
input.verticalSizing = 'fix';

// Placeholder/value text
const text = penpot.createText(PLACEHOLDER);
text.fontFamily = FONT_FAMILY;
text.fontSize = '16';
text.fontWeight = '400';
text.fills = [{ fillColor: style.placeholder, fillOpacity: 1 }];
text.growType = 'auto-width';
input.appendChild(text);

wrapper.appendChild(input);

// Error message (only for error state)
if (STATE === 'error') {
  const error = penpot.createText('Please enter a valid email address');
  error.fontFamily = FONT_FAMILY;
  error.fontSize = '12';
  error.fontWeight = '400';
  error.fills = [{ fillColor: '#EF4444', fillOpacity: 1 }];
  error.growType = 'auto-width';
  wrapper.appendChild(error);
}

return { id: wrapper.id, name: wrapper.name };
```

### Toggle Switch

```javascript
const IS_ON = false;
const IS_DISABLED = false;

const TRACK_W = 48;
const TRACK_H = 28;
const THUMB_SIZE = 22;
const THUMB_OFFSET = 3;

const ON_TRACK = '#3B82F6';
const OFF_TRACK = '#D1D5DB';
const THUMB_COLOR = '#FFFFFF';

const toggle = penpot.createBoard();
toggle.name = `toggle-${IS_ON ? 'on' : 'off'}${IS_DISABLED ? '-disabled' : ''}`;
toggle.resize(TRACK_W, TRACK_H);
toggle.borderRadius = TRACK_H / 2;
toggle.fills = [{ fillColor: IS_ON ? ON_TRACK : OFF_TRACK, fillOpacity: 1 }];

if (IS_DISABLED) toggle.opacity = 0.5;

// Thumb
const thumb = penpot.createEllipse();
thumb.resize(THUMB_SIZE, THUMB_SIZE);
thumb.fills = [{ fillColor: THUMB_COLOR, fillOpacity: 1 }];
thumb.shadows = [{
  style: 'drop-shadow', offsetX: 0, offsetY: 1,
  blur: 3, spread: 0,
  color: { color: '#000000', opacity: 0.2 }
}];
toggle.appendChild(thumb);
thumb.x = IS_ON ? (TRACK_W - THUMB_SIZE - THUMB_OFFSET) : THUMB_OFFSET;
thumb.y = THUMB_OFFSET;

return { id: toggle.id, name: toggle.name };
```

### Card Component

```javascript
const CARD_WIDTH = 320;
const CARD_RADIUS = 12;
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#E5E5E5';
const CARD_SHADOW = true;

const card = penpot.createBoard();
card.name = 'card-content';
card.resize(CARD_WIDTH, 200); // Height will auto-adjust
card.borderRadius = CARD_RADIUS;
card.fills = [{ fillColor: CARD_BG, fillOpacity: 1 }];

if (CARD_BORDER) {
  card.strokes = [{
    strokeColor: CARD_BORDER, strokeOpacity: 1,
    strokeWidth: 1, strokeStyle: 'solid', strokeAlignment: 'inner'
  }];
}

if (CARD_SHADOW) {
  card.shadows = [{
    style: 'drop-shadow', offsetX: 0, offsetY: 2,
    blur: 8, spread: -2,
    color: { color: '#000000', opacity: 0.1 }
  }];
}

const flex = card.addFlexLayout();
flex.dir = 'column';
flex.rowGap = 12;
flex.horizontalPadding = 20;
flex.verticalPadding = 20;
card.horizontalSizing = 'fix';
card.verticalSizing = 'auto';

// Category label
const category = penpot.createText('Category');
category.fontFamily = 'Inter';
category.fontSize = '12';
category.fontWeight = '600';
category.textTransform = 'uppercase';
category.fills = [{ fillColor: '#3B82F6', fillOpacity: 1 }];
category.growType = 'auto-width';
card.appendChild(category);

// Title
const title = penpot.createText('Card Title');
title.fontFamily = 'Inter';
title.fontSize = '18';
title.fontWeight = '600';
title.fills = [{ fillColor: '#171717', fillOpacity: 1 }];
title.growType = 'auto-width';
card.appendChild(title);

// Description
const desc = penpot.createText('A brief description of the card content that may span multiple lines.');
desc.fontFamily = 'Inter';
desc.fontSize = '14';
desc.fontWeight = '400';
desc.fills = [{ fillColor: '#525252', fillOpacity: 1 }];
desc.growType = 'auto-width';
card.appendChild(desc);

return { id: card.id, name: card.name };
```

### Metric Card

```javascript
const METRIC = { label: 'Total Revenue', value: '$12,450', change: '+12.5%' };
const CARD_BG = '#FFFFFF';

const card = penpot.createBoard();
card.name = 'card-metric';
card.resize(240, 120);
card.borderRadius = 12;
card.fills = [{ fillColor: CARD_BG, fillOpacity: 1 }];
card.shadows = [{
  style: 'drop-shadow', offsetX: 0, offsetY: 1,
  blur: 3, spread: 0,
  color: { color: '#000000', opacity: 0.08 }
}];

const flex = card.addFlexLayout();
flex.dir = 'column';
flex.rowGap = 8;
flex.horizontalPadding = 20;
flex.verticalPadding = 20;
card.horizontalSizing = 'fix';
card.verticalSizing = 'fix';

// Label
const label = penpot.createText(METRIC.label);
label.fontFamily = 'Inter';
label.fontSize = '13';
label.fontWeight = '500';
label.fills = [{ fillColor: '#6B7280', fillOpacity: 1 }];
label.growType = 'auto-width';
card.appendChild(label);

// Value
const value = penpot.createText(METRIC.value);
value.fontFamily = 'Inter';
value.fontSize = '28';
value.fontWeight = '700';
value.fills = [{ fillColor: '#171717', fillOpacity: 1 }];
value.growType = 'auto-width';
card.appendChild(value);

// Change badge
const change = penpot.createText(METRIC.change);
change.fontFamily = 'Inter';
change.fontSize = '12';
change.fontWeight = '600';
change.fills = [{ fillColor: '#22C55E', fillOpacity: 1 }];
change.growType = 'auto-width';
card.appendChild(change);

return { id: card.id, name: card.name };
```

### Bottom Navigation

```javascript
const ITEMS = [
  { label: 'Home',    active: true },
  { label: 'Search',  active: false },
  { label: 'Add',     active: false },
  { label: 'Chat',    active: false },
  { label: 'Profile', active: false },
];

const NAV_HEIGHT = 84; // includes safe area
const NAV_BG = '#FFFFFF';
const ACTIVE_COLOR = '#3B82F6';
const INACTIVE_COLOR = '#9CA3AF';
const DEVICE_WIDTH = 375;

const nav = penpot.createBoard();
nav.name = 'nav-bottom';
nav.resize(DEVICE_WIDTH, NAV_HEIGHT);
nav.fills = [{ fillColor: NAV_BG, fillOpacity: 1 }];
nav.strokes = [{
  strokeColor: '#E5E5E5', strokeOpacity: 1,
  strokeWidth: 1, strokeStyle: 'solid', strokeAlignment: 'inner'
}];

const flex = nav.addFlexLayout();
flex.dir = 'row';
flex.alignItems = 'start';
flex.justifyContent = 'space-around';
flex.verticalPadding = 8;
flex.horizontalPadding = 16;
nav.horizontalSizing = 'fix';
nav.verticalSizing = 'fix';

ITEMS.forEach(item => {
  // Tab item wrapper
  const tab = penpot.createBoard();
  tab.name = `nav-item-${item.label.toLowerCase()}`;
  tab.resize(48, 48);
  tab.fills = [];
  const tabFlex = tab.addFlexLayout();
  tabFlex.dir = 'column';
  tabFlex.alignItems = 'center';
  tabFlex.rowGap = 4;
  tab.horizontalSizing = 'auto';
  tab.verticalSizing = 'auto';

  // Icon placeholder (circle)
  const icon = penpot.createEllipse();
  icon.resize(24, 24);
  icon.fills = [{ fillColor: item.active ? ACTIVE_COLOR : INACTIVE_COLOR, fillOpacity: 1 }];
  tab.appendChild(icon);

  // Label
  const label = penpot.createText(item.label);
  label.fontFamily = 'Inter';
  label.fontSize = '10';
  label.fontWeight = item.active ? '600' : '400';
  label.fills = [{ fillColor: item.active ? ACTIVE_COLOR : INACTIVE_COLOR, fillOpacity: 1 }];
  label.growType = 'auto-width';
  label.align = 'center';
  tab.appendChild(label);

  nav.appendChild(tab);
});

return { id: nav.id, name: nav.name };
```

---

## Tips for Dynamic Components

### Adapting Recipes to Dark Themes

When your design system uses a dark color scheme, invert the patterns:
- Board backgrounds become dark (`#1B1B1B` instead of `#FFFFFF`)
- Text colors become light (`#FFFFFF` instead of `#171717`)
- Borders become subtle light (`#2D2D2D` instead of `#E5E5E5`)
- Shadows increase in opacity (dark surfaces need stronger shadows for visibility)

### Handling Unknown Component Types

If the design calls for a component not covered by these recipes:
1. Identify the closest recipe as a starting point
2. Adapt the structure (board + flex layout + child shapes)
3. Follow the same pattern: create per-state, assemble into grid, register component
4. Use `mcp__penpot__export_shape` to validate before moving on

### Working with Icons

Since Penpot MCP supports SVG import via `penpot.createShapeFromSvg()`:
- Use simple SVG strings for common icons
- Import from an icon library URL via `mcp__penpot__import_image` for complex icons
- Keep icon colors as fills so they respond to token changes

```javascript
// Simple SVG icon example (chevron right)
const chevron = penpot.createShapeFromSvg(
  '<svg viewBox="0 0 24 24" fill="none" stroke="#171717" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>'
);
```
