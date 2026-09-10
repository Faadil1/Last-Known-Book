import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const heroParts = Array.from({ length: 7 }, (_, index) => `assets/hero-v2/part-${String(index + 1).padStart(2, '0')}.b64`);

test('approved hero v2 remains recoverable while Atlas Room owns the active live surface', async () => {
  const [css, interactions, atlas, ...parts] = await Promise.all([
    readFile('hero-refined.css', 'utf8'),
    readFile('hero-interactions.js', 'utf8'),
    readFile('atlas-room.js', 'utf8'),
    ...heroParts.map((path) => readFile(path, 'utf8'))
  ]);

  const base64 = parts.map((part) => part.trim()).join('');
  const asset = Buffer.from(base64, 'base64');

  // Prior approved asset stays preserved for rollback / provenance even though
  // the user explicitly promoted Atlas Room as the active direction.
  assert.ok(asset.length > 50_000, 'previous approved editorial asset must remain recoverable');
  assert.equal(asset.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP');

  // Proven interaction contract remains in place while Atlas owns the label.
  assert.match(interactions, /featured-investigations/);
  assert.match(interactions, /data-feature-case/);
  assert.match(interactions, /Open the Atlas/);
  assert.match(interactions, /prefers-reduced-motion/);

  // Atlas Room is now a static module dependency, avoiding a visible legacy-hero flash.
  assert.match(interactions, /import '\/atlas-room\.js';/);
  assert.doesNotMatch(interactions, /import\('\/atlas-room\.js'\)/);
  assert.match(atlas, /The Atlas Room/);
  assert.match(atlas, /images\.unsplash\.com/);
  assert.match(atlas, /VENUE-NATIVE CLARITY/);
  assert.doesNotMatch(atlas, /Investigate across chains/);

  assert.match(css, /\.featured-investigations/);
  assert.match(css, /\.hotspot-main/);
  assert.match(css, /prefers-reduced-motion/);
});
