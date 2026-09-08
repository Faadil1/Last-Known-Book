import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { analyzeCase, decodeMintPair } from '../src/engine.mjs';

async function fixture(name) {
  return JSON.parse(await readFile(new URL(`../data/cases/${name}`, import.meta.url), 'utf8'));
}

test('mint-a-pair decoder corrects naive quote interpretation', async () => {
  const data = await fixture('mint-pair-indexer-lag.json');
  const decoded = decodeMintPair(data);
  assert.equal(decoded.semantic, 'MINT_A_PAIR');
  assert.equal(decoded.netEscrow, 24.64864);
  assert.equal(decoded.naiveCost, 0.375);
  assert.ok(decoded.distortion > 60);
});

test('chain success + indexer unavailable fails closed to RETRY_READ', async () => {
  const report = analyzeCase(await fixture('mint-pair-indexer-lag.json'));
  assert.equal(report.rootCause, 'MIXED');
  assert.equal(report.policy.action, 'RETRY_READ');
  assert.equal(report.policy.writeAuthorized, false);
});

test('resting SELL escrow is explained without compensating write', async () => {
  const report = analyzeCase(await fixture('resting-sell-escrow.json'));
  assert.deepEqual(report.semantics, ['RESTING_SELL_ESCROW']);
  assert.equal(report.rootCause, 'VENUE_SEMANTICS');
  assert.equal(report.policy.action, 'NO_ACTION');
  assert.equal(report.policy.writeAuthorized, false);
});

test('expected-vs-actual case reconciles favorable fill without action', async () => {
  const report = analyzeCase(await fixture('expected-vs-actual.json'));
  assert.equal(report.rootCause, 'EXPECTED_VS_OBSERVED');
  assert.equal(report.policy.action, 'NO_ACTION');
  assert.ok(report.claims.some((claim) => claim.claim.includes('0.009000')));
});

test('same evidence produces same report hash', async () => {
  const data = await fixture('mint-pair-indexer-lag.json');
  const hashes = new Set(Array.from({ length: 10 }, () => analyzeCase(data).reportHash));
  assert.equal(hashes.size, 1);
});
