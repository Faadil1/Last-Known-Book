import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('refined hero replaces placeholder stack with interactive archive environment', async () => {
  const html = await readFile('index.html', 'utf8');
  const css = await readFile('hero-refined.css', 'utf8');
  const js = await readFile('hero-interactions.js', 'utf8');
  const scene = await readFile('hero-environment.svg', 'utf8');

  assert.match(html, /hero-environment\.svg/);
  assert.match(html, /archive-volume volume-events/);
  assert.match(html, /archive-volume volume-evidence/);
  assert.match(html, /archive-volume volume-timeline/);
  assert.match(html, /archive-volume volume-method/);
  assert.match(html, /MOVE · HOVER · OPEN THE ARCHIVE/);
  assert.match(html, /href="\/docs\.html"/);

  assert.match(css, /--scene-x/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /volume-method/);
  assert.match(js, /pointermove/);
  assert.match(js, /data-archive-target/);
  assert.match(js, /setActiveTab|\.case-tab/);
  assert.match(scene, /Refined alpine evidence landscape/);
  assert.match(scene, /stone bridge|bridge/i);
});

test('hero interactions stay presentation-only', async () => {
  const js = await readFile('hero-interactions.js', 'utf8');
  for (const forbidden of ['eth_sendTransaction', 'eth_sendRawTransaction', 'personal_sign', 'eth_sign', 'privateKey', 'walletConnect']) {
    assert.equal(js.includes(forbidden), false, `hero interaction layer must not include ${forbidden}`);
  }
});
