import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('judge UI loads all four canonical incident classes', async () => {
  const app = await readFile('app.js', 'utf8');
  for (const file of [
    'mint-pair-indexer-lag.json',
    'resting-sell-escrow.json',
    'expected-vs-actual.json',
    'exact-market-residual-settlement.json'
  ]) {
    assert.match(app, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(app, /EXACT_MARKET_RESIDUAL_SETTLEMENT/);
  assert.match(app, /EXACT_MARKET_SETTLEMENT/);
  assert.match(app, /Fresh redeem authority/);
});
