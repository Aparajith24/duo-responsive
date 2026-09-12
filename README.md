# iphone-duo-responsive

Make a React / Next.js / Vite app respond to Apple's foldable **iPhone Duo**
(launched 2026-09-09, on sale 2026-10-23) — folded vs. unfolded — from plain
JS, React hooks, plain CSS, or Tailwind.

## Why this exists

The iPhone Duo is one continuous foldable OLED panel, not two separate
screens joined by a gap, so there's no hinge segment to lay content around.
But there is a real problem: **Safari does not implement the
CSS Viewport Segments API** (`env(viewport-segment-*)`, `getWindowSegments()`)
— that spec only ships in Chromium — so the first foldable device to run
Safari shipped with *no native API* to tell your page it folded.

What you get instead is a viewport that snaps between two shapes as the user
folds/unfolds the device:

| State    | Logical CSS viewport | Aspect ratio | DPR |
|----------|----------------------|---------------|-----|
| Folded   | 466 × 678pt          | ~0.69 (narrow)| 3   |
| Unfolded | 890 × 626pt          | ~1.42 (wide)  | 3   |

Neither size lines up with typical `sm`/`md`/`lg` breakpoints, and the
User-Agent string is identical to a regular iPhone, so you can't detect it
from the UA either. This package detects fold state from the viewport shape
itself (orientation-independent, tolerant of a few px of noise), keeps it in
sync as the device folds/unfolds, and exposes it as a hook, a sync
component, plain CSS, and a Tailwind variant.

## Install

```bash
npm install iphone-duo-responsive
```

`react` is a peer dependency. `tailwindcss` is an optional peer, only needed
if you use `iphone-duo-responsive/tailwind`.

## Usage

### React hook

```tsx
import { useIphoneDuo } from "iphone-duo-responsive";

function App() {
  const { state, isDuo, isFolded, isUnfolded, width, height } = useIphoneDuo();

  if (isUnfolded) {
    return <TwoColumnLayout />;
  }
  return <SingleColumnLayout />;
}
```

`state` is `"folded" | "unfolded" | "not-duo" | "unknown"`. It's `"unknown"`
during SSR and until the first client measurement runs — branch on
`isDuo`/`isFolded`/`isUnfolded` (all `false` when unknown) rather than
assuming a default, to avoid a hydration mismatch in Next.js.

### Sync fold state onto `<html>` for CSS / Tailwind

Mount once near your app root (Next.js: a client component in the root
layout; Vite/CRA: near the top of `App`):

```tsx
import { DuoStateSync } from "iphone-duo-responsive";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DuoStateSync />
        {children}
      </body>
    </html>
  );
}
```

This sets `<html data-duo-state="folded" | "unfolded" | "not-duo" | "unknown">`
plus `--duo-width` / `--duo-height` CSS custom properties, so the rest of
your app can react without touching the hook.

### Plain CSS

```css
@import "iphone-duo-responsive/styles.css";

[data-duo-state="unfolded"] .my-two-pane {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

Ships a few ready-made utility classes: `.duo-hide-folded`,
`.duo-hide-unfolded`, `.duo-two-pane` (a two-column grid that only kicks in
when unfolded, with a `--duo-hinge-size` gutter straddling the crease).

### Tailwind

```js
// tailwind.config.js
module.exports = {
  plugins: [require("iphone-duo-responsive/tailwind")],
};
```

```tsx
<div className="flex flex-col duo-unfolded:flex-row">
```

Adds `duo-folded:`, `duo-unfolded:`, `duo:` (either fold state), and
`duo-unknown:` variants, all keyed off the `data-duo-state` attribute that
`<DuoStateSync />` sets on `<html>`.

### Crease-safe gutter

The panel is continuous, so there's no gap to design around, but there is a
physical crease down the middle when unfolded. `<HingeGutter />` renders an
empty spacer over it so you don't accidentally center a button or a line of
text on the fold:

```tsx
import { HingeGutter } from "iphone-duo-responsive";

<div style={{ display: "flex" }}>
  <Sidebar />
  <HingeGutter size={32} />
  <MainContent />
</div>
```

It renders `null` unless `isUnfolded` is true.

## How detection works — and its limits

`classifyViewport(width, height, options)` compares the viewport's long/short
edges (orientation-independent) against registered device profiles within a
tolerance (default ±20px), and — in the default `strict` mode — also
requires `devicePixelRatio === 3` and touch support, to cut down on false
positives from a desktop window that happens to be resized to a similar
size.

This is a heuristic, not a spec-backed API:

- It can't distinguish an iPhone Duo from a hypothetical future device that
  ships the exact same viewport shape.
- If Apple ships a larger/smaller Duo model, register its profile yourself
  (no need to wait on a package update):

  ```ts
  import { registerDuoProfile } from "iphone-duo-responsive";

  registerDuoProfile({
    id: "iphone-duo-max",
    foldedLong: 720,
    foldedShort: 500,
    unfoldedLong: 950,
    unfoldedShort: 680,
    dpr: 3,
  });
  ```
- If Safari ever ships the CSS Viewport Segments API, this heuristic becomes
  unnecessary for the Duo specifically — this package will move to prefer
  that API and fall back to the heuristic on older Safari versions.

## API reference

- `useIphoneDuo()` — React hook, returns `{ state, isDuo, isFolded, isUnfolded, width, height, profileId }`.
- `<DuoStateSync />` — mounts fold state onto `document.documentElement`. Renders `null`.
- `<HingeGutter size?={32} />` — crease-safe spacer, renders only when unfolded.
- `classifyViewport(width, height, options?)` — pure function, no `window` access.
- `getFoldStateFromWindow(win?, options?)` — reads `window` and classifies it.
- `subscribeDuoState(listener)` / `getCurrentDuoSnapshot()` — low-level, framework-agnostic store (what the hook is built on).
- `registerDuoProfile(profile)` / `getDuoProfiles()` — register/inspect device profiles.
- `iphone-duo-responsive/tailwind` — Tailwind plugin exporting `iphoneDuoPlugin` (default export).
- `iphone-duo-responsive/styles.css` — prebuilt utility classes for non-Tailwind apps.

## Development

```bash
npm install
npm test        # vitest
npm run typecheck
npm run build    # tsup -> dist/
```
