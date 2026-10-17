import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const execute = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = await mkdtemp(resolve(tmpdir(), 'lazy-theme-'));
const session = `lazy-theme-check-${process.pid}`;
const artifacts = resolve(root, 'artifacts');
const failures = [];
const served = new Set();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf' };

async function command(...args) {
  const { stdout } = await execute('agent-browser', ['--session', session, ...args], { timeout: 30_000 });
  return stdout;
}
async function evaluate(source) {
  const output = JSON.parse(await command('--json', 'eval', source));
  assert.equal(output.success, true, JSON.stringify(output));
  return output.data.result;
}

// Serve the actual npm archive under a nested URL, not the working CSS files.
const packageRoot = resolve(scratch, 'package');
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const packagePrefix = '/preview/vendor/lazy-theme/';
  const fromPackage = pathname.startsWith(packagePrefix);
  const base = fromPackage ? packageRoot : root;
  const relative = fromPackage ? pathname.slice(packagePrefix.length) : pathname.slice('/preview/'.length);
  const file = resolve(base, decodeURIComponent(relative || 'index.html'));
  if (!pathname.startsWith('/preview/') || !file.startsWith(base + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    let content = await readFile(file);
    if (file === resolve(root, 'index.html')) {
      content = content.toString().replace('href="theme.css"', 'href="vendor/lazy-theme/theme.css"');
    }
    served.add(pathname);
    response.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    response.end(content);
  } catch {
    failures.push(pathname);
    response.writeHead(404).end();
  }
});

try {
  const { stdout } = await execute('npm', ['pack', '--json', '--pack-destination', scratch], { cwd: root });
  const [{ filename }] = JSON.parse(stdout);
  await execute('tar', ['-xzf', resolve(scratch, filename), '-C', scratch]);
  await mkdir(artifacts, { recursive: true });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${server.address().port}/preview/`;

  for (const theme of ['light', 'dark']) {
    await command('set', 'viewport', '1280', '900');
    await command('open', `${origin}?theme=${theme}`);
    await evaluate(`(async () => {
      await Promise.all([400, 600, 700].map(weight => document.fonts.load(weight + ' 16px "Atkinson Hyperlegible Next"')));
      await document.fonts.ready;
      return true;
    })()`);
    assert.deepEqual(await evaluate(`({
      theme: document.documentElement.dataset.lazyTheme,
      background: getComputedStyle(document.documentElement).backgroundColor,
      scheme: getComputedStyle(document.documentElement).colorScheme,
      fonts: [400, 600, 700].every(weight => document.fonts.check(weight + ' 16px "Atkinson Hyperlegible Next"')),
    })`), {
      theme, background: theme === 'light' ? 'rgb(251, 250, 245)' : 'rgb(34, 39, 34)', scheme: theme, fonts: true,
    });
    assert.deepEqual(await evaluate(`({
      background: getComputedStyle(document.querySelector('.lazy-button--primary')).backgroundColor,
      color: getComputedStyle(document.querySelector('.lazy-button--primary')).color,
    })`), theme === 'light'
      ? { background: 'rgb(38, 61, 51)', color: 'rgb(251, 250, 245)' }
      : { background: 'rgb(232, 196, 107)', color: 'rgb(36, 41, 31)' });

    // Keyboard entry reveals the skip link and the shared focus ring.
    await command('press', 'Tab');
    assert.equal(await evaluate('document.activeElement.className'), 'lazy-skip-link');
    assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineWidth'), '3px');
    assert.ok(await evaluate('document.activeElement.getBoundingClientRect().top >= 0'));

    await command('click', '#volume-choices button:nth-child(3)');
    assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('#volume-choices button'), button => button.getAttribute('aria-pressed'))`), ['false', 'false', 'true']);
    await command('fill', '#example-amount', '350');
    await command('click', '#example-form button[type="submit"]');
    assert.equal(await evaluate('document.getElementById("amount-error").hidden'), true);
    await command('fill', '#example-amount', '0');
    await command('click', '#example-form button[type="submit"]');
    assert.equal(await evaluate('document.getElementById("example-amount").getAttribute("aria-invalid")'), 'true');
    assert.equal(await evaluate('document.activeElement.id'), 'example-amount');
    await command('check', '.catalog-shopping-list input');
    assert.equal(await evaluate('document.querySelector(".catalog-shopping-list input").checked'), true);

    await command('click', '[data-example-action="Saved in this preview only."]');
    assert.equal(await evaluate('document.getElementById("action-status").textContent'), 'Saved in this preview only.');
    await evaluate('document.querySelector("button[disabled]").click()');
    assert.equal(await evaluate('document.getElementById("action-status").textContent'), 'Saved in this preview only.');
    assert.ok(await evaluate(`Array.from(document.querySelectorAll('.lazy-button, .lazy-choice, .lazy-field, .lazy-check'), element => element.getBoundingClientRect().height).every(height => height >= 48)`));

    for (const [width, height] of [[1280, 900], [800, 1024], [390, 844], [320, 740]]) {
      await command('set', 'viewport', String(width), String(height));
      assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `${theme}: no page overflow at ${width}px`);
      await evaluate('window.scrollTo(0, 0)');
      await command('screenshot', resolve(artifacts, `${theme}-${width}.png`), '--full');
    }

    // Reduced motion and larger browser text preferences remain usable.
    await command('set', 'media', theme, 'reduced-motion');
    assert.equal(await evaluate('getComputedStyle(document.querySelector(".lazy-button")).transitionDuration'), '0s');
    await command('set', 'viewport', '1280', '900');
    await evaluate('document.documentElement.style.fontSize = "200%"');
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `${theme}: no page overflow at 200% text`);
    await evaluate('document.documentElement.style.fontSize = ""');
    await command('set', 'media', theme);
    assert.deepEqual(JSON.parse(await command('--json', 'errors')).data.errors, [], 'no browser runtime errors');
  }

  await command('select', '#theme-switch', 'light');
  assert.equal(await evaluate('document.documentElement.dataset.lazyTheme'), 'light');
  await command('select', '#theme-switch', 'dark');
  assert.equal(await evaluate('getComputedStyle(document.documentElement).backgroundColor'), 'rgb(34, 39, 34)');
  assert.equal(await evaluate('document.querySelector(".catalog-palette dd").textContent'), '#222722');
  assert.deepEqual(failures, [], 'every requested asset must exist');
  for (const weight of [400, 600, 700]) {
    assert.ok(served.has(`/preview/vendor/lazy-theme/fonts/atkinson-${weight}.ttf`), `packed ${weight} font served under a subpath`);
  }
  console.log('Passed: packed CSS and fonts, both themes, 4 viewport sizes, 200% text, keyboard focus, controls, errors, disabled state and reduced motion.');
  console.log(`Screenshots: ${artifacts}`);
} finally {
  await command('close').catch(() => {});
  if (server.listening) await new Promise(done => server.close(done));
  await rm(scratch, { recursive: true, force: true });
}
