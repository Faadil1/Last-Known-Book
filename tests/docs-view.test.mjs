import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Docs navigation is routed to the styled judge packet on Vercel', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  const rewrite = config.rewrites?.find((item) => item.source === '/docs/SUBMISSION-PACKAGE.md');
  assert.ok(rewrite, 'Docs source route must be rewritten');
  assert.equal(rewrite.destination, '/docs.html');

  const index = await readFile('index.html', 'utf8');
  assert.match(index, /href="\/docs\.html"/);
  assert.equal(index.includes('href="/docs/SUBMISSION-PACKAGE.md"'), false, 'primary Docs nav must not open raw markdown');
});

test('styled judge packet preserves product identity, proof and truth boundaries', async () => {
  const docs = await readFile('docs.html', 'utf8');
  assert.match(docs, /JUDGE PACKET/);
  assert.match(docs, /One product/);
  assert.match(docs, /JUDGE IN 60 SECONDS/);
  assert.match(docs, /REAL SHANNON PROOF/);
  assert.match(docs, /PostOnly → rest → exact cancel/);
  assert.match(docs, /The trading agent may be AI\. The layer that decides whether money moves is not\./);
  assert.match(docs, /does not demonstrate production reliability/i);
  assert.match(docs, /Protected submission remains human-only/);
  assert.match(docs, /Judge Q&A/);
  assert.match(docs, /Back to investigations/);
});

test('judge packet interactions and refined styling are loaded', async () => {
  const docs = await readFile('docs.html', 'utf8');
  const js = await readFile('docs-interactions.js', 'utf8');
  const css = await readFile('docs-refined.css', 'utf8');
  assert.match(docs, /docs-refined\.css/);
  assert.match(docs, /docs-interactions\.js/);
  assert.match(docs, /data-doc-target="proof"/);
  assert.match(docs, /qa-expand-all/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /scrollIntoView/);
  assert.match(js, /\/proof\.html#commitment/);
  assert.match(js, /Open visual receipt/);
  assert.match(css, /\.qa-item/);
  assert.match(css, /\.docs-nav/);
});
