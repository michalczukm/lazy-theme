# lazy-theme

<!-- impeccable:product-schema 1 -->

## Platform

web

## Purpose

A reusable design system for the user's future lazy applications, extracted
from lazy-tea and lazy-firefox-extension. lazy-diet and lazy-list are the next
intended consumers. This task prepares their visual foundation and migration
instructions; it does not migrate them.

## Users and context

The owner builds personal household apps used on phones and a kitchen tablet.
Readable text, touch controls and quiet composition matter more than decoration.
The catalog helps developers inspect and reuse components.

## Confirmed direction

- Preserve the shared light paper-and-green identity of the two baseline apps.
- Also propose a dark theme inspired by the supplied kitchen dashboard reference.
- Keep all code, documentation and catalog copy in English.
- Support plain HTML, React and Preact through framework-independent CSS.
- Self-host the existing Atkinson Hyperlegible Next fonts.

## Constraints

No new runtime dependencies, source-app rewrites, registry publication or deploy.
Apps retain responsibility for behavior, localization and theme persistence.
Open user-facing previews in the system-default browser. Autonomous verification
uses agent-browser or Chrome DevTools MCP.
