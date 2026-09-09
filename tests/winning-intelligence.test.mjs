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
  'winning-intelligence.css',
  'docs/DEMO-SCRIPT.md',
  'docs/SUBMISSION-PACKAGE.md',
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

test('public judge package does not expose private Packet 003 identifiers', async () => {
  for (const file of PUBLIC_PACKAGE_FILES) {
    const content = await readFile(file, 'utf8');
    for (const identifier of PRIVATE_IDENTIFIERS) {
      assert.equal(content.includes(identifier), false, `${file} must not expose ${identifier}`);
    }
  }
});

test('submission package preserves proof versus production boundary', async () => {
  const submission = await readFile('docs/SUBMISSION-PACKAGE.md', 'utf8');
  assert.match(submission, /technical \+ behavior \+ operational-containment proof/i);
  assert.match(submission, /do not claim production reliability/i);
  assert.match(submission, /explicit human authorization for the protected submission action/i);
});
