import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const heroParts = Array.from({ length: 7 }, (_, index) => `assets/hero-v2/part-${String(index + 1).padStart(2, '0')}.b64`);

test('approved hero v2 is a valid environment asset with live product overlays', async () => {
  const [css, interactions, ...parts] = await Promise.all([
    readFile('hero-refined.css', 'utf8'),
    readFile('hero-interactions.js', 'utf8'),
    ...heroParts.map((path) => readFile(path, 'utf8'))
  ]);

  const base64 = parts.map((part) => part.trim()).join('');
  const asset = Buffer.from(base64, 'base64');

  assert.ok(asset.length > 50_000, 'approved editorial environment must carry a substantive photographic asset');
  assert.equal(asset.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP');

  assert.match(interactions, /APPROVED_HERO_PARTS\s*=\s*7/);
  assert.match(interactions, /featured-investigations/);
  assert.match(interactions, /data-feature-case/);
  assert.match(interactions, /Open Case Files/);
  assert.match(interactions, /ON-CHAIN EVIDENCE/);

  assert.match(css, /\.featured-investigations/);
  assert.match(css, /\.hotspot-main/);
  assert.match(css, /linear-gradient\(90deg,rgba\(6,12,9/);
  assert.match(css, /prefers-reduced-motion/);
});
