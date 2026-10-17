# Migrating lazy apps

The system is ready for adoption; this extraction does not modify the source or
target apps. Migrate one app at a time, keeping its behavior intact.

## Common sequence

1. Install a Git dependency pinned to a version tag or full commit SHA. Commit package.json and
   the lockfile; CI uses `pnpm install --frozen-lockfile`. For a static app, also
   copy the installed package's CSS/font graph during its build.
2. Start with tokens only if you need a gradual migration. Otherwise import the
   complete theme before local styles and add `lazy-theme` to the document root.
3. Replace the app's palette with semantic `--lazy-*` roles. Remove obsolete font
   registrations and shared base rules once the package owns them.
4. Replace repeated visual patterns with explicit `lazy-*` classes. Keep routing,
   form handlers, state, network logic, accessibility labels and live regions.
5. Keep app layout rules where they belong. Use real meal names, quantities,
   errors and loading states when checking responsive behavior.
6. Verify light and dark before deleting old theme code. Preserve the user's saved
   preference and large-text setting. Publish the app only through its usual flow.

## lazy-diet: React / Vite

Observed files: `apps/web/src/styles.css`, `apps/web/package.json`. The app uses
React 19 and Vite; CSS currently owns a separate palette, filled buttons, white
recipe surfaces and global form rules.

From `lazy-diet/apps/web`, install into the web workspace:

```sh
pnpm add '@lazy/theme@git+https://github.com/michalczukm/lazy-theme.git#v0.1.0'
```

Use the immutable version tag above, or replace `v0.1.0` with a full commit SHA. Commit the web package.json and workspace lockfile. No package build or npm
publication is needed. A private Git repository requires CI read access.

Import the theme from the web entry, before existing app CSS:

```js
import '@lazy/theme'
import './styles.css'
```

Add `class="lazy-theme" data-lazy-theme="light"` to `apps/web/index.html`'s root
HTML element. In React use `className="lazy-button lazy-button--primary"` and
normal `htmlFor` / `aria-*` attributes. No React component library is required.

Replace broad selectors such as `button`, `input`, `label`, `[aria-pressed]`, and
hard-coded recipe colors deliberately: old global CSS loaded after the theme
can still override it. Retain feature classes for recipe grids, plan days,
people/portions, cooking steps, import review and responsive layouts.

Specific visual mapping:

| Existing pattern                     | Shared role                                       |
| ------------------------------------ | ------------------------------------------------- |
| App background / white form surfaces | bg / surface                                      |
| Recipe text action                   | Text button or normal link, depending on behavior |
| Selected recipe choice               | `lazy-choice` with existing `aria-pressed` state  |
| Form input/select/textarea           | `lazy-field`, separate label and message          |
| Form checkbox / cooking checklist    | `lazy-check` wrapping a native checkbox           |
| Planner summaries / recipe tiles     | App-owned composition using shared tokens         |
| Validation error                     | error color plus visible explanation              |

This is a visual migration; preserve conflict handling, validation, recipe review,
planner changes, nutrition and portion calculations, and cooking progress.

## lazy-list: Preact / Hono / static assets

Observed files: `src/theme.tsx`, `public/app.css`, `package.json`. Hono renders the
HTML shell; Preact handles client behavior. Static files are served from public,
and dependencies are vendored separately rather than processed by Vite.

Install the Git dependency from the lazy-list repository root, using the same
pinned-commit command as above. Use the static copy recipe in [the usage guide](usage.md#static-html--server-rendered-apps) after
dependency installation and before the existing vendor/deploy steps, then load
`/vendor/lazy-theme/theme.css` before `/app.css` in **both** the app shell and the
privacy page. Preserve the font license. A theme copy inside each deployed app
keeps it independent of a sibling checkout and external CDN availability.

### Replace the RGB palette safely

`src/theme.tsx` exports `THEME_VARS`, `THEME_CONFIG`, `THEME_ANTIFLASH` and
`FONT_SIZE_ANTIFLASH`. Its old variables are RGB channels, for example
`--bg: 34 39 34`, consumed as `rgb(var(--bg) / opacity)`.

New tokens are complete CSS colors. This is invalid and must not survive migration:

```css
/* Invalid: rgb(#222722). */
background: rgb(var(--lazy-color-bg));
```

Use full colors directly and replace existing consumers together:

```css
background: var(--lazy-color-bg);
color: var(--lazy-color-ink);
border-color: var(--lazy-color-line);
```

Update Tailwind color configuration to use `var(--lazy-color-*)` directly. For
existing opacity utilities, either update the individual style to a full-color
expression (for example `color-mix(in srgb, var(--lazy-color-ink) 50%, transparent)`)
or retain a temporary, explicitly maintained RGB compatibility layer. Avoid
shipping a duplicate independent palette or pretending a hex token is a channel.

| Old role                                           | Shared role                                           |
| -------------------------------------------------- | ----------------------------------------------------- |
| `bg`, `surface`, `muted`, `accent`, `soft`, `line` | Corresponding `--lazy-color-*`                        |
| `fg`                                               | `--lazy-color-ink`                                    |
| `on-accent`                                        | `--lazy-color-on-accent`                              |
| `danger`                                           | `--lazy-color-error`                                  |
| Primary action fill                                | `--lazy-action-bg` (green ink in light, gold in dark) |

### Keep preferences and the first paint consistent

- Keep the existing `localStorage['theme']` values `light` / `dark`.
- Apply `document.documentElement.dataset.lazyTheme` before CSS paints, using the
  existing saved preference and first-visit policy. The package itself does not
  select an OS preference or write storage.
- Replace `html.light` palette ownership with `[data-lazy-theme]`; remove the old
  palette once every consumer is migrated.
- Update the theme-color meta value for the chosen background (`#fbfaf5` or
  `#222722`), including after user changes. Preserve sensible fallback behavior
  when storage is unavailable.
- Keep `FONT_SIZE_ANTIFLASH`, `html.large`, and the user's saved large-text choice.
  Verify that text actually grows; do not undo it with a fixed root pixel size.
- Keep nav selection semantics and responsive app-shell scrolling. The system's
  optional `lazy-page` layout is not a replacement for the existing shell.

## Baseline apps

Both sources already match the light identity. If migrating them later, replace
shared values and patterns only. Keep tea-specific table density, timer editor,
landscape rules and device-tuned type sizes in lazy-tea. Keep dashboard/weather
layouts and the extension's isolated launcher behavior in the extension.

Do not import global page rules into arbitrary host pages. The launcher's Shadow
DOM, system font, focus restoration, outside-click dismissal and floating shadow
are a separate integration surface and need their own parity check.

## Acceptance checklist

- Both themes, including text, links, placeholders, selected and pressed states.
- Phone 320/390px, tablet 800/1280px, desktop and 200% text/zoom.
- Keyboard focus, skip navigation, named icon actions and table scrolling.
- Field errors, loading, stale/offline, empty and disabled states.
- Large-text preference and persisted theme, including the privacy page.
- Fonts load locally; no requests to external font services.
- App tests, typecheck/build, and the app's established verification command.
- Review on the actual kitchen tablet before considering device readability done.
