import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [atlasJs, atlasCss, methodHtml, proofHtml, proofJs, proofCss, heroJs, routeJs, agentHtml, investigationsHtml] = await Promise.all([
  readFile(new URL('../atlas-room.js', import.meta.url), 'utf8'),
  readFile(new URL('../atlas-room-v5.css', import.meta.url), 'utf8'),
  readFile(new URL('../methodology.html', import.meta.url), 'utf8'),
  readFile(new URL('../proof.html', import.meta.url), 'utf8'),
  readFile(new URL('../proof-page.js', import.meta.url), 'utf8'),
  readFile(new URL('../proof-room-v2.css', import.meta.url), 'utf8'),
  readFile(new URL('../hero-interactions.js', import.meta.url), 'utf8'),
  readFile(new URL('../atlas-route-transition.js', import.meta.url), 'utf8'),
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

test('home-to-case transition stays in the live Atlas DOM instead of reloading the legacy hero', () => {
  assert.match(heroJs, /import '\/atlas-route-transition\.js';/);
  assert.match(routeJs, /history\.pushState/);
  assert.match(routeJs, /atlas-workspace-mode/);
  assert.match(routeJs, /data-feature-case/);
  assert.match(routeJs, /stopImmediatePropagation/);
  assert.doesNotMatch(routeJs, /window\.location\.href/);
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

test('Proof commitment is a judge-facing visual receipt and no raw JSON is rendered in the page', () => {
  assert.match(proofHtml, /Verifiable behavior\. Explicit boundaries\./);
  assert.match(proofHtml, /A readable receipt, not a wall of JSON\./);
  assert.match(proofHtml, /id="commitment"/);
  assert.match(proofHtml, /WHY IT MATTERS/);
  assert.doesNotMatch(proofHtml, /inspect raw commitment JSON/);
  assert.doesNotMatch(proofHtml, /proof-commitment-json/);
  assert.match(proofHtml, /PRODUCTION EVIDENCE/);
  assert.match(proofHtml, /class="atlas-mobile-nav"/);
  assert.match(proofJs, /SHANNON-PROOF-003-COMMITMENT\.json/);
  assert.doesNotMatch(proofJs, /raw\.textContent/);
  assert.match(proofJs, /fail closed/i);
  assert.match(proofCss, /proof-ledger/);
  assert.match(proofCss, /commitment-explainer/);
  assert.match(proofCss, /@media\(max-width:620px\)/);
  assert.match(heroJs, /\/proof\.html#commitment/);
});

test('Proof Room adds independent live on-chain witnesses without any write surface', () => {
  assert.match(proofHtml, /LIVE READ-ONLY WITNESSES/);
  assert.match(proofHtml, /Four independent checks against Shannon now/);
  assert.match(proofHtml, /PUBLIC CAPTURED TX · LKB-003/);
  assert.match(proofHtml, /DREAMDEX MODULE/);
  assert.match(proofJs, /eth_chainId/);
  assert.match(proofJs, /eth_blockNumber/);
  assert.match(proofJs, /eth_getTransactionReceipt/);
  assert.match(proofJs, /eth_getCode/);
  assert.match(proofJs, /eth_call/);
  assert.match(proofJs, /0x313ce567/);
  assert.match(proofJs, /50312/);
  assert.match(proofJs, /0x3ecC694Cef705358864a646142ac17A90E29e388/);
  assert.match(proofJs, /0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E/);
  assert.doesNotMatch(proofJs, /eth_sendRawTransaction/);
  assert.doesNotMatch(proofJs, /eth_sendTransaction/);
  assert.doesNotMatch(proofJs, /eth_requestAccounts/);
  assert.doesNotMatch(proofJs, /personal_sign/);
  assert.match(proofCss, /live-witness-grid/);
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
