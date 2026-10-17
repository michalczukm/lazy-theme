# lazy design system

## Purpose and scope

A shared visual foundation extracted from `../lazy-tea` and
`../lazy-firefox-extension`, intended for future lazy apps and the upcoming
lazy-diet and lazy-list migrations. Interfaces must remain readable on a phone
or kitchen tablet and comfortable to operate by touch.

The deliverable is a framework-independent CSS package, local fonts, component
catalog, and adoption guidance. Source apps remain untouched. All code,
documentation, and catalog copy are in English. Apps may localize their own copy.

## Visual authority

Light: both apps' current CSS, HTML, DESIGN.md, and locally rendered pages,
inspected on 2026-10-18. Their 400 / 600 / 700 font files match byte for byte.

Dark proposal: the user-supplied kitchen dashboard prototype,
`kuchenny-pulpit.html#plan`, inspected on 2026-10-18.
Its charcoal-green surfaces and warm gold are retained. The dark variant is
an additional proposal, not a replacement for the approved light baseline.

## Color roles

`css/tokens.css` is the source of truth for every shared value.

| Role                | Light baseline | Dark proposal |
| ------------------- | -------------- | ------------- |
| Background          | `#fbfaf5`      | `#222722`     |
| Surface             | `#fbfaf5`      | `#2c332c`     |
| Ink                 | `#263d33`      | `#f4f4e9`     |
| Muted               | `#58675c`      | `#b8c4b5`     |
| Accent              | `#59784f`      | `#e8c46b`     |
| On accent / action  | `#fbfaf5`      | `#24291f`     |
| Soft / selected row | `#e5eadd`      | `#363f32`     |
| Divider             | `#cdd5ca`      | `#56604e`     |
| Focus               | `#263d33`      | `#f0da8c`     |
| Error               | `#8f392b`      | `#ffa99d`     |
| Pressed neutral     | `#d4dfcd`      | `#414c3b`     |

The dark reference defines the first nine roles. Error uses lazy-list's
existing dark error color. Pressed neutral is a new deeper sage interaction
state. Text and action pairs meet WCAG AA for normal text; thin divider colors
are decorative and must not be the only boundary of a field.

Actions use semantic aliases: ink in light, gold in dark. Hover changes to green
in light and pale gold in dark. Selected choices use the same action fill.
Do not infer the action color from `ink`: that would create white buttons in dark.

## Shared visual rules

- Local Atkinson Hyperlegible Next, weights 400 / 600 / 700, synthesis disabled.
- Body 1rem / 1.5; semibold decisions; bold wordmark ending in an accent dot.
- Tabular numerals, regular large readings, smaller units.
- Flat sections and 1px horizontal rules. No shadows or card grid in app content.
- Control radius 10px; rows stay square. Minimum 48px targets.
- Focus outline 3px, offset 4px. Native inputs retain native behavior.
- A short 160ms state transition; reduced motion removes transitions/animations.
- The default light theme is explicit. The OS cannot silently change it.
- Both themes share all typography, spacing, component markup, and layout.

## Resolving baseline differences

| Source difference                             | Shared decision                                  |
| --------------------------------------------- | ------------------------------------------------ |
| Tea `--bg` / `--surface`, extension `--paper` | `--lazy-color-bg` and `--lazy-color-surface`     |
| `Atkinson` vs full family name                | Full family name; same files                     |
| Focus offset 4 / 5px                          | 4px                                              |
| Refresh target 44px / tea controls 48px       | Minimum 48px, 24px icon inside                   |
| Extension adds pressed state                  | Preserve it as a semantic role                   |
| Muted / lighter custom scrollbar              | Muted for clearer affordance                     |
| Page width 1240 / 1280px                      | Default 1280px; apps own specific composition    |
| Tea title 24px / dashboard headline 36px      | Heading role scales 24–36px                      |
| Countdown 88px / temperature 96px             | Default display 88px; app can override the token |

The extension's floating launcher is an exception: Shadow DOM isolation,
system-ui, floating shadow, horizontal overflow, and menu focus management
belong to that extension. They are not default patterns for app content.

## Architecture and ownership

`theme.css` imports tokens, `fonts.css`, base, and components. Relative font URLs
work under a subpath and in a bundler. No generator, dependencies, build step,
or JavaScript runtime is needed. Base styles opt in through `html.lazy-theme`;
component classes use `lazy-*`. Tokens can be adopted separately.

Shared patterns: page/header, wordmark, type roles, actions, pressed choices,
fields and errors, native checkbox labels, table, destination rows, skip link,
and visually hidden text. Apps own business state, routing, localization,
validation rules, responsive columns, and device-specific information density.

The catalog is documentation: its JavaScript demonstrates theme selection,
choice state, and field feedback without saving application data. It is excluded
from the published package. URL `?theme=dark` opens the dark proposal directly.

## Accessibility

Every field needs a visible label. Connect errors with `aria-invalid` and
`aria-describedby`. Pair state colors with text or semantic state. Use native
`disabled`; `aria-disabled` alone does not block activation. Buttons that toggle
use `aria-pressed`, not tab semantics. Decorative SVGs are hidden from assistive
technology; icon-only actions need accessible names. A scrollable table region
has a name and keyboard access. Static table rows are not made clickable.

A theme migration must preserve existing dark/light and large-text settings,
loading, empty, stale, error and disabled behavior. Do not shrink an entire app
to fit a tablet: tune its composition and validate with real content.

## Verification

Node tests pin both palettes and meaningful contrast pairs. The browser check
consumes an actual packed package under a URL subpath, checks fonts, both themes,
responsive overflow, keyboard focus, choice state, disabled actions, validation,
checkboxes, reduced motion, and produces screenshots. Device readability still
requires checking the actual kitchen tablet.
