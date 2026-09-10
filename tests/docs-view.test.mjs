import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Docs navigation is routed to the styled judge packet on Vercel', async () => {
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  const rewrite = config.rewrites?.find((item) => item.source === '/docs/SUBMISSION-PACKAGE.md');
  assert.ok(rewrite, 'Docs source route must be rewritten');
  assert.equal(rewrite.destination, '/docs.html');
});

test('styled judge packet preserves product identity and truth boundaries', async () => {
  const docs = await readFile('docs.html', 'utf8');
  assert.match(docs, /JUDGE PACKET/);
  assert.match(docs, /One product/);
  assert.match(docs, /REAL SHANNON PROOF/);
  assert.match(docs, /PostOnly → rest → exact cancel/);
  assert.match(docs, /The trading agent may be AI\. The layer that decides whether money moves is not\./);
  assert.match(docs, /Testnet technical and behavior proof is not presented as production reliability/i);
  assert.match(docs, /Back to investigations/);
});
