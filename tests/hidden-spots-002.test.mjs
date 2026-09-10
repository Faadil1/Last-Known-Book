import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAuthorityReceipt } from '../src/authority-receipt.mjs';
import { formatRawUnits, parseHumanUnits } from '../src/network-normalization.mjs';

const read = (path) => readFile(path, 'utf8');

test('authority receipt is deterministic and never executes the decision', () => {
  const report = {
    caseId: 'TEST-1',
    reportHash: 'abc123',
    claims: [
      { id: 'O1', truthClass: 'OBSERVED', claim: 'receipt success' },
      { id: 'I1', truthClass: 'INFERRED', claim: 'possible cause' },
      { id: 'U1', truthClass: 'UNKNOWN', claim: 'market binding unresolved' }
    ],
    policy: { action: 'ESCALATE', writeAuthorized: false }
  };
  const a = buildAuthorityReceipt(report);
  const b = buildAuthorityReceipt(report);
  assert.equal(a.receiptHash, b.receiptHash);
  assert.equal(a.decision.executionPerformed, false);
  assert.equal(a.decision.canMoveFunds, false);
  assert.equal(a.inferenceCanAuthorizeSpend, false);
  assert.deepEqual(a.truthGate.blockingUnknowns, ['U1']);
});

test('network unit conversion keeps Shannon 6 and mainnet 18 decimal scales exact', () => {
  assert.equal(parseHumanUnits('1.25', 6), '1250000');
  assert.equal(formatRawUnits('1250000', 6), '1.25');
  assert.equal(parseHumanUnits('1.25', 18), '1250000000000000000');
  assert.equal(formatRawUnits('1250000000000000000', 18), '1.25');
});

test('agent surfaces stay read-only and expose the winning mechanism', async () => {
  const [investigate, incidents, mcp, watcher, skill, agent] = await Promise.all([
    read('api/investigate.js'),
    read('api/incidents.js'),
    read('api/mcp.js'),
    read('scripts/watch-shannon-readonly.mjs'),
    read('SKILL.md'),
    read('agent.html')
  ]);
  assert.match(investigate, /writesAttempted: false/);
  assert.match(incidents, /READ_ONLY/);
  assert.match(mcp, /tools\/list/);
  assert.match(mcp, /tools\/call/);
  assert.match(watcher, /eth_getLogs/);
  assert.doesNotMatch(watcher, /eth_sendRawTransaction|walletClient|privateKey/i);
  assert.match(skill, /lkb_authority_receipt/);
  assert.match(agent, /Bring your own incident/);
  assert.match(agent, /Get back bounded authority/);
});

test('cross-network guard performs read-only ERC20 decimals lookup', async () => {
  const source = await read('src/network-normalization.mjs');
  assert.match(source, /0x313ce567/);
  assert.match(source, /eth_call/);
  assert.match(source, /50312/);
  assert.match(source, /5031/);
  assert.match(source, /expectedDecimals: 6/);
  assert.match(source, /expectedDecimals: 18/);
  assert.doesNotMatch(source, /eth_sendRawTransaction/);
});

test('protected write path is not exposed through public agent tools', async () => {
  const tools = await read('src/agent-tools.mjs');
  const cli = await read('scripts/lkb-cli.mjs');
  assert.doesNotMatch(tools, /CANCEL_EXACT_ORDER.*deterministicPredicatesSatisfied/s);
  assert.doesNotMatch(cli, /privateKey|walletClient|sendTransaction|writeContract/i);
  assert.match(cli, /READ_ONLY_BY_DEFAULT/);
});
