import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const PRIVATE_IDENTIFIERS = [
  '0x740B79cb9BAf3488b0b576CcEF64aB491e723B9b',
  '0x1d8b9df00dfce34f5e7ccc493fe06f332d16b9f3748c37dd3113ff791b708859',
  '0x3b74c095d4926dcc71e9332704dc7393a371968ab79b9a9729baede4da1c7259'
];

const PUBLIC_PACKAGE_FILES = [
  'index.html',
  'app.js',
  'winning-intelligence.css',
  'cover.html',
  'docs/DEMO-SCRIPT.md',
  'docs/SUBMISSION-PACKAGE.md',
  'docs/SDK-FEEDBACK.md',
  'docs/UPSTREAM-FEEDBACK-DRAFT.md',
  'evidence/SHANNON-PROOF-003-COMMITMENT.json',
  'README.md'
];

test('judge-visible real Shannon proof is surfaced with correct bounded facts', async () => {
  const html = await readFile('index.html', 'utf8');

  for (const required of [
    'REAL SHANNON PROOF',
    'POSTONLY → REST → EXACT CANCEL',
    'OrderPlaced → OrderRested → OrderCancelled',
    '50312',
    '0 FILLS',
    'tUSDC 1 → 1 RAW',
    'Production evidence remains absent'
  ]) {
    assert.match(html, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('live judge surface is read-only and uses public captured evidence', async () => {
  const html = await readFile('index.html', 'utf8');
  const app = await readFile('app.js', 'utf8');

  assert.match(html, /LIVE SHANNON READBACK/);
  assert.match(html, /NO WALLET · NO SIGNING · NO WRITES/);
  assert.match(app, /eth_chainId/);
  assert.match(app, /eth_blockNumber/);
  assert.match(app, /eth_getTransactionReceipt/);
  assert.match(app, /0xbe1b148423553b21f7c4177248dc6be19406e1416b1f065cc556279de4da03be/);

  for (const forbiddenWriteMethod of ['eth_sendTransaction', 'eth_sendRawTransaction', 'personal_sign', 'eth_sign']) {
    assert.equal(app.includes(forbiddenWriteMethod), false, `live browser surface must not contain ${forbiddenWriteMethod}`);
  }
});

test('public judge package does not expose private Packet 003 identifiers', async () => {
  for (const file of PUBLIC_PACKAGE_FILES) {
    const content = await readFile(file, 'utf8');
    for (const identifier of PRIVATE_IDENTIFIERS) {
      assert.equal(content.includes(identifier), false, `${file} must not expose ${identifier}`);
    }
  }
});

test('judge fast lane and deterministic authority positioning are present', async () => {
  const readme = await readFile('README.md', 'utf8');
  assert.match(readme, /Judge Fast Lane — 60 seconds/);
  assert.match(readme, /The trading agent may be AI\. The layer that decides whether money moves is not\./);
  assert.match(readme, /rolling pool binding/i);
  assert.match(readme, /The risk is the second action/i);
  assert.match(readme, /What is safe to do next\?/i);
});

test('public proof commitment contains no private transaction or wallet identifiers', async () => {
  const commitment = JSON.parse(await readFile('evidence/SHANNON-PROOF-003-COMMITMENT.json', 'utf8'));
  assert.equal(commitment.redaction.walletAddressPublishedHere, false);
  assert.equal(commitment.redaction.transactionHashesPublishedHere, false);
  assert.equal(commitment.redaction.orderIdPublishedHere, false);
  assert.equal(commitment.privateCanonicalBundle.gitBlobSha1, '57c32ae2dae2eed45cdb265831e52efa2081b317');
});

test('submission package preserves proof versus production boundary', async () => {
  const submission = await readFile('docs/SUBMISSION-PACKAGE.md', 'utf8');
  assert.match(submission, /technical \+ behavior \+ operational-containment (?:proof|evidence)/i);
  assert.match(submission, /do not claim production reliability/i);
  assert.match(submission, /explicit human authorization for the protected submission action/i);
  assert.match(submission, /independent evidence density/i);
});
