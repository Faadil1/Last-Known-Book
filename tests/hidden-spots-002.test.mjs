import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildAuthorityReceipt } from '../src/authority-receipt.mjs';
import { investigatePayload } from '../src/intake.mjs';
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

test('canonical case intake returns the existing deterministic engine plus authority receipt', async () => {
  const caseData = JSON.parse(await read('data/cases/mint-pair-indexer-lag.json'));
  const result = await investigatePayload({ caseData });
  assert.equal(result.mode, 'CANONICAL_OR_CAPTURED_CASE');
  assert.equal(result.report.caseId, 'LKB-001');
  assert.equal(result.report.policy.writeAuthorized, false);
  assert.equal(result.authorityReceipt.decision.executionPerformed, false);
  assert.equal(result.authorityReceipt.reportHash, result.report.reportHash);
});

test('bare live tx intake fails closed instead of inventing DreamDEX semantics', async () => {
  const fakeFetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    const results = {
      eth_chainId: '0xc488',
      eth_blockNumber: '0x64',
      eth_getTransactionReceipt: { status: '0x1', blockNumber: '0x60' }
    };
    return { ok: true, json: async () => ({ jsonrpc: '2.0', id: 1, result: results[request.method] }) };
  };
  const result = await investigatePayload({
    txHash: `0x${'ab'.repeat(32)}`,
    network: 'shannon',
    agentIntent: 'BUY_NO 10 @ 0.42'
  }, { fetchFn: fakeFetch });
  assert.equal(result.mode, 'LIVE_TX_INTAKE');
  assert.equal(result.report.rootCause, 'UNKNOWN');
  assert.equal(result.report.policy.action, 'ESCALATE');
  assert.equal(result.report.policy.writeAuthorized, false);
  assert.ok(result.report.claims.some((claim) => claim.truthClass === 'UNKNOWN'));
  assert.equal(result.authorityReceipt.decision.canMoveFunds, false);
});

test('agent surfaces stay read-only and expose the winning mechanism', async () => {
  const [investigate, incidents, mcp, watcher, status, skill, agent, docsInteractions] = await Promise.all([
    read('api/investigate.js'),
    read('api/incidents.js'),
    read('api/mcp.js'),
    read('scripts/watch-shannon-readonly.mjs'),
    read('api/agent-status.js'),
    read('SKILL.md'),
    read('agent.html'),
    read('docs-interactions.js')
  ]);
  assert.match(investigate, /writesAttempted: false/);
  assert.match(incidents, /READ_ONLY/);
  assert.match(mcp, /tools\/list/);
  assert.match(mcp, /tools\/call/);
  assert.match(watcher, /eth_getLogs/);
  assert.doesNotMatch(watcher, /eth_sendRawTransaction|createWalletClient|privateKeyToAccount|writeContract/i);
  assert.match(status, /READ_ONLY_AGENT_INTERFACE/);
  assert.match(status, /privateKeyAccepted: false/);
  assert.match(status, /broadcastAvailable: false/);
  assert.match(skill, /lkb_authority_receipt/);
  assert.match(agent, /Bring your own incident/);
  assert.match(agent, /Get back bounded authority/);
  assert.match(docsInteractions, /See the agent interface/);
  assert.match(docsInteractions, /\/agent\.html/);
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
  const status = await read('api/agent-status.js');
  const forbiddenExecutionApis = /privateKeyToAccount|createWalletClient|sendRawTransaction|sendTransaction|writeContract|signTransaction|signMessage/i;
  assert.doesNotMatch(tools, /CANCEL_EXACT_ORDER.*deterministicPredicatesSatisfied/s);
  assert.doesNotMatch(tools, forbiddenExecutionApis);
  assert.doesNotMatch(cli, forbiddenExecutionApis);
  assert.doesNotMatch(status, forbiddenExecutionApis);
  assert.match(status, /privateKeyAccepted: false/);
  assert.match(cli, /READ_ONLY_BY_DEFAULT/);
});
