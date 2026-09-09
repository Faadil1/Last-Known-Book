import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  analyzeCase,
  decodeMintPair,
  decodeExactMarketResidualSettlement,
  evaluatePolicy
} from '../src/engine.mjs';

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

test('exact-market settlement decoder distinguishes redeemed winners from losing residual', async () => {
  const data = await fixture('exact-market-residual-settlement.json');
  const decoded = decodeExactMarketResidualSettlement(data);
  assert.equal(decoded.semantic, 'EXACT_MARKET_SETTLEMENT_RECONCILIATION');
  assert.equal(decoded.classifications.filter((row) => row.classification === 'WINNING_RESIDUAL_REDEEMED').length, 2);
  assert.equal(decoded.classifications.filter((row) => row.classification === 'KNOWN_ZERO_VALUE_SETTLED_RESIDUAL').length, 1);

  const report = analyzeCase(data);
  assert.equal(report.rootCause, 'LIFECYCLE');
  assert.equal(report.policy.action, 'NO_ACTION');
  assert.equal(report.policy.writeAuthorized, false);
  assert.ok(report.claims.some((claim) => claim.claim.includes('should not trigger a blind redeem attempt')));
});

test('claimable winning residual does not authorize redeem without deterministic predicates and human confirmation', () => {
  const denied = evaluatePolicy({
    rootCause: 'LIFECYCLE',
    chainTruth: 'SUCCESS',
    indexerTruth: 'AVAILABLE',
    safeWriteCandidate: {
      action: 'REDEEM_EXACT_WINNING_RESIDUAL',
      deterministicPredicatesSatisfied: true,
      userConfirmed: false
    }
  });
  assert.equal(denied.action, 'ESCALATE');
  assert.equal(denied.writeAuthorized, false);

  const allowed = evaluatePolicy({
    rootCause: 'LIFECYCLE',
    chainTruth: 'SUCCESS',
    indexerTruth: 'AVAILABLE',
    safeWriteCandidate: {
      action: 'REDEEM_EXACT_WINNING_RESIDUAL',
      deterministicPredicatesSatisfied: true,
      userConfirmed: true
    }
  });
  assert.equal(allowed.action, 'REDEEM_EXACT_WINNING_RESIDUAL');
  assert.equal(allowed.writeAuthorized, true);
});

test('same evidence produces same report hash', async () => {
  const data = await fixture('mint-pair-indexer-lag.json');
  const hashes = new Set(Array.from({ length: 10 }, () => analyzeCase(data).reportHash));
  assert.equal(hashes.size, 1);
});
