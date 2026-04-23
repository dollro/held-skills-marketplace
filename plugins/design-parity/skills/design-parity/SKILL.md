---
name: design-parity
description: Close the gap between a Claude Design spec and its implementation. Use when the user has exported screens from Claude Design (as HTML or PNG) and wants Claude Code to compare them against a running frontend, produce a ranked delta report, and iteratively apply fixes until they match. Triggers include "compare to the design", "match the spec", "design parity", "fix the differences from Claude Design", "why does my implementation not match the mockup", or when Claude Design HTML exports are present alongside a running dev server URL.
---

# Design Parity

## What this skill does

Close the gap between a Claude Design spec (target) and its implementation (actual) through a repeatable compare-and-fix loop. The skill produces a ranked delta report — not just pixel diffs — and applies fixes hierarchically (structure before style).

## Core loop

```
┌───────────────────────────────────────────────────────────┐
│  1. Prepare target  (Claude Design HTML → rendered PNG)   │
│  2. Screenshot impl (running dev server at same viewport) │
│  3. Pixel diff      (odiff finds WHERE things differ)     │
│  4. Vision analysis (Claude explains WHAT and WHY)        │
│  5. Rank deltas     (by perceptual impact, not pixel count)│
│  6. Apply fixes     (structure → layout → type → color)   │
│  7. Re-screenshot   (goto 2 until converged or accepted)  │
└───────────────────────────────────────────────────────────┘
```

Each iteration writes artifacts to `.parity/<screen>/` so the loop is resumable and reviewable.

## Prerequisites — ask the user if missing

Before running, confirm the user has:

1. **Target exports** — one of:
   - HTML export from Claude Design (`File → Export → Standalone HTML`) — **preferred**
   - PNG screenshots of each target screen — acceptable fallback
2. **A running local dev server** with a reachable URL (e.g. `http://localhost:3000`)
3. **A route map** — which URL path corresponds to which target file. If not obvious from filenames, ask.
4. **Viewport spec** — default `1440×900` desktop. For responsive work also run `390×844` mobile.

If anything is missing, ask a single clarifying question. Do not guess routes.

## Why HTML exports beat PNGs

When the target is a PNG, every "difference" is filtered through two different rendering stacks (Claude Design's vs. the user's browser). Font metrics, subpixel rendering, and DPR all diverge — producing false positives that aren't real bugs.

When the target is HTML, we render it in the **same browser, same viewport, same DPR** as the implementation. The only remaining differences are real differences. Always prefer HTML when available.

## Step-by-step workflow

Detailed procedure lives in `references/workflow.md`. Summary:

### 1. Setup

```bash
# Install dependencies if not present
npm install --save-dev playwright odiff-bin pngjs

# Initialize .parity directory
mkdir -p .parity
```

### 2. Prepare target renders

For each target HTML file in `targets/`:

```bash
node scripts/screenshot.mjs \
  --url "file://$(pwd)/targets/dashboard.html" \
  --viewport 1440x900 \
  --out .parity/dashboard/target.png
```

For PNG targets: copy directly to `.parity/<screen>/target.png`. Check that dimensions match the viewport — if they don't, warn the user before continuing.

### 3. Screenshot implementation

```bash
node scripts/screenshot.mjs \
  --url "http://localhost:3000/dashboard" \
  --viewport 1440x900 \
  --out .parity/dashboard/impl.png \
  --wait-for "networkidle" \
  --disable-animations
```

The `screenshot.mjs` helper handles font loading, animation disabling, and lazy-image stabilization. **Do not roll your own `page.screenshot()` call** — stabilization is the entire difference between a useful skill and flaky noise.

### 4. Pixel diff

```bash
node scripts/diff.mjs \
  --base .parity/dashboard/target.png \
  --compare .parity/dashboard/impl.png \
  --out .parity/dashboard/diff.png \
  --threshold 0.1 \
  --antialiasing true \
  > .parity/dashboard/diff.json
```

The diff produces:
- `diff.png` — overlay showing changed pixels
- `diff.json` — machine-readable summary with `diffCount`, `diffPercentage`, bounding boxes of changed regions

If `diffPercentage < 0.5%`, consider the screen converged. Otherwise continue.

### 5. Vision analysis

Load all three images into context:
- `target.png`
- `impl.png`
- `diff.png` (highlights changed regions)

Apply the rubric from `references/rubric.md` — **hierarchical, in this order**:

1. **Structure** — are all elements present? Any extra or missing components?
2. **Layout** — positions, alignment, spacing, grid/flex ordering
3. **Typography** — font family, size, weight, line-height, letter-spacing
4. **Color** — fill, border, shadow colors with ΔE thresholds
5. **Micro** — border radius, shadow depth, iconography

Produce `.parity/<screen>/deltas.json` with this shape:

```json
{
  "screen": "dashboard",
  "iteration": 1,
  "converged": false,
  "deltas": [
    {
      "category": "structure",
      "severity": "blocker",
      "description": "Target has a 'Filter' button in the header; implementation is missing it.",
      "region": {"x": 820, "y": 64, "w": 96, "h": 36},
      "suggested_fix": "Add <Button variant='ghost'>Filter</Button> to HeaderActions.tsx after the search input.",
      "files": ["src/components/HeaderActions.tsx"]
    },
    {
      "category": "typography",
      "severity": "major",
      "description": "H1 font-weight differs. Target: 600. Impl: 400.",
      "region": {"x": 48, "y": 120, "w": 400, "h": 48},
      "suggested_fix": "Change .page-title font-weight to 600 (or 'font-semibold' in Tailwind).",
      "files": ["src/styles/typography.css"]
    }
  ]
}
```

### 6. Apply fixes

Process deltas in severity order: `blocker` → `major` → `minor` → `cosmetic`. Within a severity, process by category order from step 5 (structure first).

Apply fixes with the `Edit` tool, one delta at a time. After each fix, do **not** re-screenshot immediately — batch related fixes before re-running the loop.

### 7. Re-screenshot and loop

Run steps 3–5 again. Track progress:

```
.parity/dashboard/
├── iteration_1/
│   ├── impl.png
│   ├── diff.png
│   ├── diff.json
│   └── deltas.json
├── iteration_2/
│   └── ...
└── summary.json      # rolling: iteration count, diffPercentage trend
```

Stop when **any** of:
- `diffPercentage < 0.5%` *and* no `blocker` or `major` deltas
- User says "accept" or "good enough"
- Three consecutive iterations without meaningful improvement (likely hit a fundamental limitation — ask user)

## Thresholds (defaults)

| Metric | Threshold | Notes |
|---|---|---|
| Pixel threshold | `0.1` | odiff default, covers anti-aliasing noise |
| Antialiasing filter | `true` | must be on to avoid font-rendering false positives |
| ΔE color threshold | `2.0` | below this, humans cannot perceive the difference |
| Convergence | `< 0.5%` diff | + no blocker/major deltas |
| Max iterations | `5` | if exceeded, ask user before continuing |

## What to ignore (mask these regions)

When generating target and impl screenshots, mask:
- Timestamps, "last updated X minutes ago" strings
- Dynamic user avatars / initials
- Carousel/ticker content that rotates
- Charts fed by live data (mask the plot area, not the axis labels)

Pass regions via `--mask` to `screenshot.mjs`. See `references/workflow.md` for the exact selector syntax.

## Common failure modes

See `references/troubleshooting.md` for the full list. Top three:

1. **Every pixel appears different** — viewport, DPR, or OS font stack mismatch. Fix: re-check `--viewport`, render target at same DPR, use web fonts not system fonts.
2. **Diff keeps flipping between states** — animations or transitions. Fix: `--disable-animations` is on; also check for intersection-observer-triggered fade-ins.
3. **Claude fixes color but breaks layout** — wrong category order. Always process `structure` and `layout` deltas before `color`.

## Constraints

- Do not run this skill without an explicit running dev server URL — it will not start servers for the user.
- Do not update the target files. The target is the source of truth; only the implementation changes.
- If the user exported target as PNG and viewport doesn't match, warn and stop. Don't scale images — it corrupts the comparison.
- Do not delete the `.parity/` directory between runs. It's the audit trail.

## Output to user

After each iteration, produce a concise summary (not the full JSON):

```
Iteration 2 of dashboard:
  Pixel diff:    2.3% → 0.8% (improved)
  Blockers:      1 → 0
  Major:         4 → 2
  Minor:         7 → 5

Remaining major issues:
  1. Sidebar collapse button padding (4px too tight)
  2. Card shadow offset differs (target uses y=4, impl uses y=2)

Suggested next action: apply fixes, re-run. ETA to convergence: 1-2 more iterations.
```

Write the full JSON to `.parity/<screen>/iteration_N/deltas.json` for the audit trail.

## Related files

- `references/workflow.md` — detailed per-step procedure with Playwright flags
- `references/rubric.md` — full hierarchical comparison rubric with examples
- `references/troubleshooting.md` — false-positive patterns and fixes
- `scripts/screenshot.mjs` — stabilized Playwright screenshot helper
- `scripts/diff.mjs` — odiff wrapper that emits structured JSON
