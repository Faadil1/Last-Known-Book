import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ingestIncident, buildAuthorityReceipt, normalizeTokenAmount, formatSlackNotification, formatDiscordNotification } from '../src/agent-native.mjs';

const MARKET = `0x${'1'.repeat(64)}`;
const TX = `0x${'2'.repeat(64)}`;

test('minimal BYOI intake fails closed and never authorizes a write', () => {
  const result = ingestIncident({ txHash: TX, marketId: MARKET, intent: 'Buy NO within limit' });
  assert.equal(result.status, 'EVIDENCE_REQUIRED');
  assert.equal(result.report.policy.action, 'RETRY_READ');
  assert.equal(result.authorityReceipt.writeAuthorized, false);
  assert.equal(result.authorityReceipt.authorityBoundary, 'MODEL_INFERENCE_ALONE_CANNOT_AUTHORIZE_FUNDS');
  assert.ok(result.authorityReceipt.receiptHash.length === 64);
});

test('authority receipt is deterministic for the same report', () => {
  const result = ingestIncident({ txHash: TX, marketId: MARKET, intent: 'Buy NO within limit' });
  assert.deepEqual(buildAuthorityReceipt(result.report), buildAuthorityReceipt(result.report));
});

test('token normalization supports Shannon 6 decimals and mainnet-scale 18 decimals without a hardcoded scale', () => {
  assert.equal(normalizeTokenAmount('1000000', 6), '1');
  assert.equal(normalizeTokenAmount('1000000000000000000', 18), '1');
  assert.equal(normalizeTokenAmount('1234500', 6), '1.2345');
});

test('Slack and Discord adapters only carry bounded authority output', () => {
  const result = ingestIncident({ txHash: TX, marketId: MARKET });
  const slack = formatSlackNotification(result.authorityReceipt);
  const discord = formatDiscordNotification(result.authorityReceipt);
  assert.match(slack.text, /RETRY_READ/);
  assert.match(JSON.stringify(discord), /Write authorized/);
  assert.doesNotMatch(JSON.stringify({ slack, discord }), /privateKey|seed phrase|walletClient/i);
});

test('agent-native surfaces contain no browser signing or broadcast methods', async () => {
  const files = await Promise.all([
    readFile(new URL('../agent-native-ui.js', import.meta.url), 'utf8'),
    readFile(new URL('../api/investigate.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../api/incident-webhook.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../scripts/lkb-mcp.mjs', import.meta.url), 'utf8')
  ]);
  const joined = files.join('\n');
  assert.doesNotMatch(joined, /eth_sendTransaction|eth_sendRawTransaction|wallet_switchEthereumChain|requestAccounts|privateKeyToAccount|createWalletClient/);
});
