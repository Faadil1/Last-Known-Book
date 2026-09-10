import { analyzeCase, sha256 } from './engine.mjs';
import { buildAuthorityReceipt } from './authority-receipt.mjs';
import { getNetworkProfile } from './network-normalization.mjs';

const TX_HASH = /^0x[0-9a-fA-F]{64}$/;
const MARKET_ID = /^0x[0-9a-fA-F]{64}$/;

async function rpc(url, method, params = [], fetchFn = fetch) {
  const response = await fetchFn(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC_${body.error.code ?? 'ERROR'}`);
  return body.result;
}

function canonicalCaseFromPayload(payload) {
  if (payload?.caseData && typeof payload.caseData === 'object') return payload.caseData;
  if (payload?.type && payload?.evidence && payload?.intent && payload?.venueReality) return payload;
  return null;
}

function normalizeIntent(agentIntent) {
  if (typeof agentIntent === 'string' && agentIntent.trim()) return { summary: agentIntent.trim(), source: 'OPERATOR_OR_AGENT_INPUT' };
  if (agentIntent && typeof agentIntent === 'object') return { ...agentIntent, source: agentIntent.source ?? 'OPERATOR_OR_AGENT_INPUT' };
  return { summary: 'Intent not supplied.', source: 'MISSING_INPUT' };
}

export async function investigatePayload(payload, { fetchFn = fetch } = {}) {
  if (!payload || typeof payload !== 'object') throw new Error('JSON incident payload is required');

  const canonicalCase = canonicalCaseFromPayload(payload);
  if (canonicalCase) {
    const report = analyzeCase(canonicalCase);
    return {
      schema: 'LKB-INVESTIGATION-RESULT-v0.1',
      mode: 'CANONICAL_OR_CAPTURED_CASE',
      report,
      authorityReceipt: buildAuthorityReceipt(report, { source: 'LKB_CANONICAL_CASE_ENGINE' }),
      writesAttempted: false
    };
  }

  const txHash = String(payload.txHash ?? '').trim();
  if (!TX_HASH.test(txHash)) throw new Error('txHash must be a 32-byte transaction hash');
  const network = String(payload.network ?? 'shannon').toLowerCase();
  const profile = getNetworkProfile(network);
  const marketId = payload.marketId == null ? null : String(payload.marketId).trim();
  if (marketId && !MARKET_ID.test(marketId)) throw new Error('marketId must be a 32-byte marketId when supplied');
  const agentIntent = normalizeIntent(payload.agentIntent);

  const [chainHex, headHex, receipt] = await Promise.all([
    rpc(profile.rpcUrl, 'eth_chainId', [], fetchFn),
    rpc(profile.rpcUrl, 'eth_blockNumber', [], fetchFn),
    rpc(profile.rpcUrl, 'eth_getTransactionReceipt', [txHash], fetchFn)
  ]);

  const chainId = Number.parseInt(chainHex, 16);
  const headBlock = Number.parseInt(headHex, 16);
  const receiptBlock = receipt?.blockNumber ? Number.parseInt(receipt.blockNumber, 16) : null;
  const receiptStatus = receipt ? (Number.parseInt(receipt.status ?? '0x0', 16) === 1 ? 'SUCCESS' : 'REVERTED') : 'NOT_FOUND';
  const confirmations = receiptBlock == null ? null : Math.max(0, headBlock - receiptBlock + 1);

  const claims = [
    {
      id: 'O-INTAKE-1',
      truthClass: 'OBSERVED',
      claim: `Read-only RPC returned chain ${chainId} at head block ${headBlock}.`,
      evidence: ['eth_chainId', 'eth_blockNumber']
    },
    {
      id: 'O-INTAKE-2',
      truthClass: 'OBSERVED',
      claim: receipt ? `Transaction ${txHash} has receipt status ${receiptStatus} in block ${receiptBlock}.` : `Transaction ${txHash} has no receipt at the time of this read.`,
      evidence: ['eth_getTransactionReceipt']
    },
    {
      id: 'O-INTAKE-3',
      truthClass: 'OBSERVED',
      claim: `Agent/operator intent input: ${agentIntent.summary ?? JSON.stringify(agentIntent)}.`,
      evidence: ['input.agentIntent']
    },
    {
      id: 'U-INTAKE-1',
      truthClass: 'UNKNOWN',
      claim: 'DreamDEX-native execution semantics are not established from a bare transaction receipt alone.',
      evidence: []
    }
  ];

  if (marketId) {
    claims.push({
      id: 'U-INTAKE-2',
      truthClass: 'UNKNOWN',
      claim: `Provided marketId ${marketId} has not yet been bound to this receipt by deterministic event decoding.`,
      evidence: []
    });
  }
  if (chainId !== profile.chainId) {
    claims.push({
      id: 'U-INTAKE-CHAIN',
      truthClass: 'UNKNOWN',
      claim: `Observed chain ${chainId} does not match requested ${profile.chainId}; investigation fails closed.`,
      evidence: ['eth_chainId']
    });
  }

  const policy = receiptStatus === 'NOT_FOUND'
    ? { action: 'RETRY_READ', writeAuthorized: false, reason: 'No receipt is visible yet; retry reads before drawing an execution conclusion.' }
    : { action: 'ESCALATE', writeAuthorized: false, reason: 'The receipt is observed, but DreamDEX-native cause and exact write predicates are not established from transaction intake alone.' };

  const reportCore = {
    schema: 'LKB-INTAKE-REPORT-v0.1',
    engineVersion: 'INTAKE-0.1',
    caseId: payload.caseId ?? `INTAKE-${txHash.slice(2, 10).toUpperCase()}`,
    title: payload.title ?? 'Bring Your Own Incident',
    type: 'LIVE_TRANSACTION_INTAKE',
    network,
    chainId,
    txHash,
    marketId,
    intent: agentIntent,
    venueReality: {
      summary: receipt ? `Receipt ${receiptStatus}; DreamDEX semantic reconstruction pending.` : 'Receipt not visible yet.',
      blockNumber: receiptBlock,
      confirmations
    },
    semantics: [],
    rootCause: 'UNKNOWN',
    claims,
    policy,
    reconciliation: {
      finalState: 'No corrective write executed by Last Known Book intake.',
      writesAttempted: false
    },
    provenance: {
      truthClass: 'LIVE_READ_ONLY_INTAKE',
      rpc: profile.rpcUrl,
      checkedAt: new Date().toISOString()
    }
  };
  const report = { ...reportCore, reportHash: sha256(reportCore) };
  return {
    schema: 'LKB-INVESTIGATION-RESULT-v0.1',
    mode: 'LIVE_TX_INTAKE',
    report,
    authorityReceipt: buildAuthorityReceipt(report, { source: 'LKB_LIVE_TX_INTAKE' }),
    writesAttempted: false
  };
}
