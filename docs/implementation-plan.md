# Theme extraction plan

Goal: ship the shared identity of the two baseline apps as a reusable CSS package.
Design contract: [DESIGN.md](../DESIGN.md).

1. Compare source CSS, HTML, design documentation, font files and rendered pages.
   Resolve differences in DESIGN.md without changing source apps.
2. Pin shared palette and text contrast with Node tests. Extract tokens, fonts,
   opt-in base styles and explicit `lazy-*` components.
3. Add the requested dark proposal from the supplied kitchen dashboard. Keep
   component markup unchanged; map semantic action aliases per theme.
4. Build an interactive HTML catalog with both themes, native control states,
   illustrative meal/shopping patterns and English documentation.
5. Document package and static integration, component semantics, and separate
   migration paths for React/Vite and Preact/Hono, including old RGB tokens.
6. Verify a packed package in agent-browser at phone, tablet and desktop sizes;
   inspect both themes and run contrast checks and package verification.

No source-app migrations, registry publication, deployment or runtime dependencies.
