import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';

test('validated photographic hero is the active scene and remains interactive', async () => {
  const html = await readFile('index.html', 'utf8');
  const css = await readFile('hero-refined.css', 'utf8');
  const interactions = await readFile('hero-interactions.js', 'utf8');
  const asset = await stat('hero-validated-scene.webp');

  assert.ok(asset.size > 10000, 'validated photographic hero asset must be present');
  assert.match(html, /hero-validated-scene\.webp/);
  assert.match(html, /hero-reference-scene/);
  assert.match(html, /hero-reference-photo/);
  assert.match(html, /hotspot-main/);
  assert.match(html, /hotspot-evidence/);
  assert.match(html, /hotspot-timeline/);
  assert.match(html, /hotspot-method/);
  assert.match(html, /Start an Investigation/);
  assert.match(html, /Explore a Sample Case/);
  assert.match(html, /REAL EVENTS/);
  assert.match(html, /VERIFIED EVIDENCE/);
  assert.match(html, /OPERATOR READY/);
  assert.match(css, /\.hero-reference-photo/);
  assert.match(css, /\.hero-hotspot/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(interactions, /\.hero-reference-scene/);
  assert.match(interactions, /--photo-x/);
  assert.match(interactions, /data-archive-target/);
});

test('exact hero does not regress judge docs or blockchain boundaries', async () => {
  const html = await readFile('index.html', 'utf8');
  const docs = await readFile('docs.html', 'utf8');
  const interactions = await readFile('hero-interactions.js', 'utf8');

  assert.match(html, /href="\/docs\.html"/);
  assert.match(docs, /JUDGE PACKET/);
  assert.doesNotMatch(interactions, /eth_sendTransaction|eth_sendRawTransaction|personal_sign|eth_sign/);
});
