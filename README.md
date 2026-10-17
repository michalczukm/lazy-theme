# @lazy/theme

Shared CSS, local fonts, light and dark themes for lazy apps. No build or runtime dependencies.

```sh
pnpm add '@lazy/theme@git+https://github.com/michalczukm/lazy-theme.git#v0.1.0'
```

```js
import '@lazy/theme'
```

Add `class="lazy-theme"` to `<html>`. Set `data-lazy-theme="dark"` for dark mode.

Commit the lockfile. CI: `pnpm install --frozen-lockfile`.

[Usage](docs/usage.md) · [Migration](docs/migration.md) · [Design](DESIGN.md)

Preview: `npm run dev`, then open <http://127.0.0.1:4188>.
Verify: `pnpm verify`. Browser checks: `pnpm test:browser` (requires agent-browser).

MIT. Fonts: [SIL OFL](fonts/OFL.txt).
