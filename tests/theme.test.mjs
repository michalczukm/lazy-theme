import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const baseline = {
  bg: '#fbfaf5', surface: '#fbfaf5', ink: '#263d33', muted: '#58675c',
  accent: '#59784f', 'on-accent': '#fbfaf5', soft: '#e5eadd',
  line: '#cdd5ca', focus: '#263d33', error: '#8f392b', pressed: '#d4dfcd',
};

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(value => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test('shared palette preserves the two baselines and readable text pairs', async () => {
  const css = await readFile(new URL('../css/tokens.css', import.meta.url), 'utf8').catch(() => '');
  const light = css.match(/:root\s*\{([^}]+)\}/)?.[1] ?? '';
  const tokens = Object.fromEntries([...light.matchAll(/--lazy-color-([\w-]+):\s*(#[\da-f]{6});/g)].map(match => [match[1], match[2]]));
  assert.deepEqual(tokens, baseline, 'the extracted shared palette must exist and match');
  for (const [fg, bg] of [
    ['ink', 'bg'], ['muted', 'bg'], ['accent', 'bg'], ['error', 'bg'],
    ['muted', 'soft'], ['ink', 'pressed'], ['on-accent', 'ink'], ['on-accent', 'accent'],
  ]) {
    const values = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, `${fg} on ${bg} must reach WCAG AA`);
  }
});

test('dark proposal preserves the kitchen reference and readable action states', async () => {
  const css = await readFile(new URL('../css/tokens.css', import.meta.url), 'utf8');
  const dark = css.match(/:root\[data-lazy-theme='dark'\]\s*\{([^}]+)\}/)?.[1] ?? '';
  const tokens = Object.fromEntries([...dark.matchAll(/--lazy-color-([\w-]+):\s*(#[\da-f]{6});/g)].map(match => [match[1], match[2]]));
  assert.deepEqual(tokens, {
    bg: '#222722', surface: '#2c332c', ink: '#f4f4e9', muted: '#b8c4b5',
    accent: '#e8c46b', 'on-accent': '#24291f', soft: '#363f32', line: '#56604e',
    focus: '#f0da8c', error: '#ffa99d', pressed: '#414c3b',
  });
  for (const [fg, bg] of [
    ['ink', 'bg'], ['muted', 'surface'], ['muted', 'soft'], ['accent', 'surface'],
    ['error', 'surface'], ['ink', 'pressed'], ['on-accent', 'accent'], ['on-accent', 'focus'],
  ]) {
    const values = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5, `${fg} on ${bg} must reach WCAG AA`);
  }
});
