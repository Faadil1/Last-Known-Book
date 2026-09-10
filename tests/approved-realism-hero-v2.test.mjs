import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const heroParts = Array.from({ length: 7 }, (_, index) => `assets/hero-v2/part-${String(index + 1).padStart(2, '0')}.b64`);

test('approved hero v2 remains recoverable while Atlas Room owns the active live surface', async () => {
  const [css, interactions, atlas, atlasV5, ...parts] = await Promise.all([
    readFile('hero-refined.css', 'utf8'),
    readFile('hero-interactions.js', 'utf8'),
    readFile('atlas-room.js', 'utf8'),
    readFile('atlas-room-v5.css', 'utf8'),
    ...heroParts.map((path) => readFile(path, 'utf8'))
  ]);

  const base64 = parts.map((part) => part.trim()).join('');
  const asset = Buffer.from(base64, 'base64');

  // Prior approved asset stays preserved for rollback / provenance even though
  // the user explicitly promoted Atlas Room as the active direction.
  assert.ok(asset.length > 50_000, 'previous approved editorial asset must remain recoverable');
  assert.equal(asset.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(asset.subarray(8, 12).toString('ascii'), 'WEBP');

  // Proven interaction contract remains in place and reduced motion is preserved.
  assert.match(interactions, /featured-investigations/);
  assert.match(interactions, /data-feature-case/);
  assert.match(interactions, /prefers-reduced-motion/);

  // Atlas Room is a static module dependency, avoiding a visible legacy-hero flash.
  assert.match(interactions, /import '\/atlas-room\.js';/);
  assert.doesNotMatch(interactions, /import\('\/atlas-room\.js'\)/);
  assert.match(atlas, /The Atlas Room/);
  assert.match(atlas, /images\.unsplash\.com/);
  assert.match(atlas, /POST-EXECUTION INCIDENT RESPONSE · DREAMDEX/);
  assert.match(atlas, /Know what happened before your agent acts again\./);
  assert.match(atlas, /atlas-room-v5\.css/);
  assert.doesNotMatch(atlas, /Investigate across chains/);

  // V5 keeps the visual primitives but changes the root into a jury-first overview.
  assert.match(css, /\.featured-investigations/);
  assert.match(css, /\.hotspot-main/);
  assert.match(atlasV5, /atlas-home-mode \.investigation-shell\{display:none!important\}/);
  assert.match(atlasV5, /atlas-mobile-nav/);
  assert.match(atlasV5, /prefers-reduced-motion/);
});
