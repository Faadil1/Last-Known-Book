import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [atlasJs, atlasCss, methodHtml, proofHtml, proofJs, heroJs, agentHtml, investigationsHtml] = await Promise.all([
  readFile(new URL('../atlas-room.js', import.meta.url), 'utf8'),
  readFile(new URL('../atlas-room-v5.css', import.meta.url), 'utf8'),
  readFile(new URL('../methodology.html', import.meta.url), 'utf8'),
  readFile(new URL('../proof.html', import.meta.url), 'utf8'),
  readFile(new URL('../proof-page.js', import.meta.url), 'utf8'),
  readFile(new URL('../hero-interactions.js', import.meta.url), 'utf8'),
  readFile(new URL('../agent.html', import.meta.url), 'utf8'),
  readFile(new URL('../investigations.html', import.meta.url), 'utf8')
]);

test('Atlas Room is a live DOM direction with real photo URLs, not a flat screenshot', () => {
  assert.match(atlasJs, /The Atlas Room/);
  assert.match(atlasJs, /images\.unsplash\.com/);
  assert.match(atlasJs, /atlas-explainer/);
  assert.doesNotMatch(atlasJs, /data:image\/webp;base64/);
});

test('home is jury-first and does not repeat investigation as the page structure', () => {
  assert.match(atlasJs, /ONE INCIDENT · THREE QUESTIONS/);
  assert.match(atlasJs, /What happened\? What do we actually know\? What is safe to do next\?/);
  assert.match(atlasJs, /Featured Case Files/);
  assert.match(atlasCss, /atlas-home-mode \.investigation-shell\{display:none!important\}/);
  assert.doesNotMatch(atlasJs, /atlas-index-card/);
});

test('Atlas hero is venue-native and easy to understand without overclaiming scope', () => {
  assert.match(atlasJs, /POST-EXECUTION INCIDENT RESPONSE · DREAMDEX/);
  assert.match(atlasJs, /Know what happened before your agent acts again\./);
  assert.match(atlasJs, /separates fact from inference/);
  assert.doesNotMatch(atlasJs, /Investigate across chains/);
});

test('case workspace remains directly reachable through a dedicated route and deep links', () => {
  assert.match(investigationsHtml, /LKB-001/);
  assert.match(investigationsHtml, /window\.location\.replace/);
  assert.match(atlasJs, /WORKSPACE_MODE/);
  assert.match(atlasJs, /atlas-workspace-intro/);
  assert.match(atlasCss, /atlas-workspace-mode \.investigation-shell/);
});

test('mobile navigation and responsive jury flow are explicit', () => {
  assert.match(atlasJs, /atlas-mobile-nav/);
  assert.match(atlasCss, /@media\(max-width:680px\)/);
  assert.match(atlasCss, /hero-feature-row\{grid-template-columns:1fr!important/);
  assert.match(atlasCss, /featured-grid\{grid-template-columns:1fr\}/);
  assert.match(atlasCss, /investigation-shell\{grid-template-columns:1fr!important\}/);
});

test('unsupported vanity counters are not part of the Atlas runtime', () => {
  assert.match(atlasCss, /hero-metrics-strip\{display:none\}/);
  assert.match(atlasJs, /Somnia Shannon · 50312/);
  assert.match(atlasJs, /4 captured incident classes/);
  assert.match(atlasJs, /Inference alone cannot move funds/);
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

test('Atlas loads synchronously with the proven interaction layer and keeps reduced-motion behavior', () => {
  assert.match(heroJs, /import '\/atlas-room\.js';/);
  assert.doesNotMatch(heroJs, /import\('\/atlas-room\.js'\)/);
  assert.match(heroJs, /prefers-reduced-motion/);
  assert.match(heroJs, /openFeaturedCase/);
});

test('Agent page follows the same product navigation story', () => {
  assert.match(agentHtml, /\/methodology\.html/);
  assert.match(agentHtml, /\/proof\.html/);
  assert.match(agentHtml, /aria-current="page">Agent/);
  assert.match(agentHtml, /\/docs\.html/);
});
