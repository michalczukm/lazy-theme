# Usage guide

The shared design system for lazy apps. Extracted from **lazy-tea** and the
**lazy Firefox dashboard**, with a dark proposal inspired by the user's kitchen
dashboard reference. Plain CSS, self-hosted fonts, no runtime dependencies.

## Preview

```sh
npm run dev
open http://127.0.0.1:4188
# Dark proposal:
open 'http://127.0.0.1:4188/?theme=dark'
```

The catalog demonstrates both palettes, typography, actions, choices, fields,
errors, loading/disabled states, a meal table, shopping checkboxes and navigation
rows. Its actions are local examples and do not save app data.

## Install

Use a Git dependency pinned to a version tag or full commit SHA. Use the version tag below, or replace `v0.1.0` with a full commit SHA:

```sh
pnpm add '@lazy/theme@git+https://github.com/michalczukm/lazy-theme.git#v0.1.0'
```

Commit the consuming app's `package.json` and `pnpm-lock.yaml`. CI installs the
same revision with:

```sh
pnpm install --frozen-lockfile
```

The repository contains ready-to-use CSS and fonts. There is no build or
`prepare` step, and no npm registry publication is needed. HTTPS access is enough
for a public repository; a private repository needs a CI credential authorized to
read it. Do not embed credentials in dependency URLs or commit them in lockfiles.

To update the theme, push a new commit here and rerun `pnpm add` in the consuming
app with its new version tag or full SHA. Review and commit the dependency/lockfile changes.
Keep published version tags immutable. Avoid a moving branch such as `main` as the dependency revision.

For local development only, `pnpm add ../lazy-theme` can use a sibling checkout.
A sibling path requires checking out both projects in CI; it is not the default
deployment path. `npm pack` remains available for offline package snapshots.

### React / Vite or another CSS bundler

Import once, before app-specific styles:

```js
import '@lazy/theme';
import './styles.css';
```

Set the document root in the app's HTML shell:

```html
<html lang="en" class="lazy-theme" data-lazy-theme="light">
```

Use normal HTML classes, or `className` in React. Vite resolves font URLs and
emits assets; no font copying or hosted font provider is necessary.

### Static HTML / server-rendered apps

Install the Git dependency first, then copy its CSS graph and fonts into static
assets during the consuming app's build, preserving their relative structure:

```sh
mkdir -p public/vendor/lazy-theme
cp -R node_modules/@lazy/theme/theme.css node_modules/@lazy/theme/fonts.css \
  node_modules/@lazy/theme/css node_modules/@lazy/theme/fonts \
  node_modules/@lazy/theme/LICENSE public/vendor/lazy-theme/
```

```html
<link rel="stylesheet" href="/vendor/lazy-theme/theme.css">
```

Also add `lazy-theme` to `<html>`. Use a deployment-relative stylesheet URL if
the app lives under a subpath. Keep `LICENSE` and `fonts/OFL.txt` with redistributed
assets; the font license is already included in the fonts directory.
Run the copy after dependency installation and before packaging/deployment so CI
ships the installed revision. A bundler-based app does not need this copy step.

### Adopt only what you need

| Import | Responsibility |
| --- | --- |
| `@lazy/theme` | Complete theme; does not style the page until `.lazy-theme` is applied |
| `@lazy/theme/tokens.css` | Shared variables only, no visual reset |
| `@lazy/theme/fonts.css` | Font registrations, using relative local URLs |
| `@lazy/theme/base.css` | Opt-in base rules; requires tokens and fonts |
| `@lazy/theme/components.css` | Explicit `lazy-*` classes; requires tokens and base |

## Light and dark

Light is the default. Select the dark proposal explicitly on the root:

```html
<html class="lazy-theme" data-lazy-theme="dark">
```

For a runtime switch, set `document.documentElement.dataset.lazyTheme` to
`'light'` or `'dark'`. Your app owns persistence and any system-preference policy.
Apply the saved preference before first paint; do not ship a second independent
palette in an antiflash script. The catalog uses a URL parameter for comparison.

Light uses paper and green ink. Dark uses charcoal-green surfaces and warm gold
from the supplied kitchen dashboard. Layout, type, spacing and markup are shared.
Gold is both the dark accent and primary action, with dark text. Dark mode is a
proposal included for evaluation, not an automatic change to existing apps.

## Tokens

Use semantic roles instead of copying hex values. Every value lives in
[css/tokens.css](../css/tokens.css); visual decisions and source differences are in
[DESIGN.md](../DESIGN.md).

| Token | Use |
| --- | --- |
| `--lazy-color-bg`, `--lazy-color-surface` | Page and control surfaces |
| `--lazy-color-ink`, `--lazy-color-muted` | Main and secondary text |
| `--lazy-color-accent`, `--lazy-color-on-accent` | Links/icons and text on action fills |
| `--lazy-color-soft`, `--lazy-color-pressed` | Quiet hover/selection and neutral press |
| `--lazy-color-line` | Decorative separators; not the only field boundary |
| `--lazy-color-focus`, `--lazy-color-error` | Keyboard focus and errors |
| `--lazy-action-bg`, `--lazy-action-hover`, `--lazy-action-active` | Theme-aware primary/choice fills |
| `--lazy-font-family`, `--lazy-font-regular/semibold/bold` | Family and weights 400/600/700 |
| `--lazy-text-small/body/title/heading/wordmark/headline/display` | 14 / 16 / 18 / 24 / 32 / 36 / 88px at a 16px root |
| `--lazy-leading-body/heading/display` | 1.5 / 1.2 / 1.15 line heights |
| `--lazy-tracking-heading/wordmark` | −0.025em / −0.035em |
| `--lazy-space-1/2/3/4/5/6/8/12` | 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48px |
| `--lazy-radius-control`, `--lazy-radius-icon` | 10px / 8px |
| `--lazy-control-size`, `--lazy-control-size-primary` | 48px / 56px minimum targets |
| `--lazy-page-width`, `--lazy-reading-width` | 1280px page / 65ch reading measure |
| `--lazy-focus-width`, `--lazy-focus-offset` | 3px outline / 4px offset |
| `--lazy-duration-state`, `--lazy-ease-state` | 160ms / ease-out |
| `--lazy-scheme` | Native browser color scheme |

Typography and spacing use rem so browser font preferences remain effective.
Override a role inside a specific app surface when real content calls for it;
keep semantic colors centralized. For example, a temperature display can set
`--lazy-text-display: 6rem` without changing every other app's timer.

## Component contract

| Class | Expected element and behavior |
| --- | --- |
| `lazy-page`, `lazy-header` | Centered page and wrapping header; app owns columns |
| `lazy-wordmark` | Brand link; final `<span aria-hidden="true">.</span>` uses accent |
| `lazy-heading`, `lazy-title` | Semantic `h1`–`h3`; heading scales 24–36px |
| `lazy-note`, `lazy-prose` | Secondary text / readable paragraph measure |
| `lazy-value`, `lazy-display`, `lazy-unit` | Tabular numbers, large reading, smaller unit |
| `lazy-button` | Secondary `button` or navigation `a`; use actual native semantics |
| `lazy-button--primary/text/icon` | Modifier alongside `lazy-button` |
| `lazy-choices`, `lazy-choice` | Button group; app updates `aria-pressed` |
| `lazy-field-group`, `lazy-label`, `lazy-field`, `lazy-error` | Label + text/select/textarea field + feedback |
| `lazy-check` | Label wrapping a native checkbox; text remains clickable |
| `lazy-table-scroll`, `lazy-table` | Scroll region and semantic table; optional `is-selected` row |
| `lazy-link-row` | Navigation link: leading SVG, text span with strong/small, trailing SVG |
| `lazy-skip-link`, `lazy-sr-only` | Keyboard skip navigation and accessible hidden text |

There is no JavaScript component API. The package supplies appearance; apps own
state, validation, routing, menus, timers and network requests. Browser-native
checkboxes, selects and validation remain browser-native.

### Buttons and choices

```html
<button type="submit" class="lazy-button lazy-button--primary">Save changes</button>
<button type="button" class="lazy-button" disabled>Saving…</button>
<a class="lazy-button lazy-button--text" href="/recipes">Browse recipes</a>

<div class="lazy-choices" role="group" aria-label="Water volume">
  <button type="button" class="lazy-choice" aria-pressed="true">350 ml</button>
  <button type="button" class="lazy-choice" aria-pressed="false">500 ml</button>
</div>
```

Keep one primary action per task. Add an accessible name to icon-only controls
and hide decorative SVGs from assistive technology. Actual `disabled` blocks
activation; `aria-disabled` by itself does not. Do not put disabled attributes on
links. Use pressed buttons for toggles, not fake tabs or radio controls.

### Field and error

```html
<div class="lazy-field-group">
  <label class="lazy-label" for="amount">Amount in ml</label>
  <input class="lazy-field" id="amount" type="number" min="1" required
    aria-invalid="true" aria-describedby="amount-error">
  <p class="lazy-error" id="amount-error">Enter an amount greater than zero.</p>
</div>
```

Your validation sets `aria-invalid` and hides/shows the message. Connect help and
errors with `aria-describedby`; announce dynamic results through a status region.
For checkboxes use `lazy-check`, not the text-field class. For a wide table give
the scroll wrapper `tabindex="0"`, `role="region"` and an accessible name. Mark a
selected row in text or with app-owned control semantics as well as its color.

### Layout

Use flat sections, whitespace and horizontal rules. Do not wrap every block in a
card. Default page padding is 24px × 32px, becoming 20px on smaller screens and
16px horizontally below 360px. Breakpoints and column proportions inside an app
remain local: the tea table and launcher dashboard have different needs.

## Migrate existing apps

See [docs/migration.md](migration.md) for the concrete lazy-diet and lazy-list
paths, including RGB compatibility, theme persistence, existing large-text mode,
static asset delivery, and a behavior-preservation checklist.

## Verify

Node 22+ and Python 3 are needed for repository checks/preview. Browser checks
also require the installed `agent-browser` CLI and its browser engine.

```sh
npm test                 # Palette contract and WCAG AA text/action pairs
npm run test:browser     # Packed CSS/fonts, responsive states, screenshots
npm pack --dry-run       # Inspect the distributable; no build step
# Or all three:
npm run verify
```

The browser script uses a temporary local server, package snapshot and isolated
browser session, closes them afterward, and writes images to ignored `artifacts/`.
Check readability on the actual tablet before accepting a consuming app migration.

Code/CSS: MIT, retaining the source attribution. Fonts: SIL OFL 1.1, included
unchanged in [fonts/OFL.txt](../fonts/OFL.txt).
