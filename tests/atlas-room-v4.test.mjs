import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [atlasJs, atlasCss, methodHtml, proofHtml, proofJs, heroJs] = await Promise.all([
  readFile(new URL('../atlas-room.js', import.meta.url), 'utf8'),
  readFile(new URL('../atlas-room.css', import.meta.url), 'utf8'),
  readFile(new URL('../methodology.html', import.meta.url), 'utf8'),
  readFile(new URL('../proof.html', import.meta.url), 'utf8'),
  readFile(new URL('../proof-page.js', import.meta.url), 'utf8'),
  readFile(new URL('../hero-interactions.js', import.meta.url), 'utf8')
]);

test('Atlas Room is a live DOM direction with real photo URLs, not a flat screenshot', () => {
  assert.match(atlasJs, /The Atlas Room/);
  assert.match(atlasJs, /images\.unsplash\.com/);
  assert.match(atlasJs, /atlas-index-card/);
  assert.doesNotMatch(atlasJs, /data:image\/webp;base64/);
});

test('unsupported vanity counters are not part of the Atlas runtime', () => {
  assert.match(atlasCss, /hero-metrics-strip\{display:none\}/);
  assert.match(atlasJs, /Shannon 50312/);
  assert.match(atlasJs, /4 captured classes/);
  assert.match(atlasJs, /Inference cannot spend/);
});

test('Methodology is a real judge-facing destination', () => {
  assert.match(methodHtml, /From fragmented evidence to a bounded decision/);
  assert.match(methodHtml, /OBSERVED/);
  assert.match(methodHtml, /INFERRED/);
  assert.match(methodHtml, /UNKNOWN/);
  assert.match(methodHtml, /MINT_A_PAIR/);
});

test('Proof commitment is rendered as HTML and retains the claim boundary', () => {
  assert.match(proofHtml, /Verifiable behavior\. Explicit boundaries\./);
  assert.match(proofHtml, /PRODUCTION EVIDENCE/);
  assert.match(proofJs, /SHANNON-PROOF-003-COMMITMENT\.json/);
  assert.match(proofJs, /fail closed/);
});

test('prior interaction layer transitions into Atlas Room and keeps reduced-motion behavior', () => {
  assert.match(heroJs, /prefers-reduced-motion/);
  assert.match(heroJs, /import\('\/atlas-room\.js'\)/);
  assert.match(heroJs, /openFeaturedCase/);
});
