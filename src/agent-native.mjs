import { analyzeCase, sha256 } from './engine.mjs';

const HEX_32 = /^0x[0-9a-fA-F]{64}$/;
const TX_HASH = /^0x[0-9a-fA-F]{64}$/;

export function normalizeTokenAmount(raw, decimals) {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) throw new Error('raw must be a non-negative integer string');
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) throw new Error('decimals must be an integer between 0 and 255');
  const n = BigInt(raw);
  const base = 10n ** BigInt(decimals);
  const whole = n / base;
  const fraction = (n % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export function buildAuthorityReceipt(report, source = 'LKB_AGENT_NATIVE') {
  if (!report?.policy) throw new Error('report.policy is required');
  const core = {
    schema: 'LKB-AUTHORITY-RECEIPT-v0.1',
    caseId: report.caseId ?? null,
    reportHash: report.reportHash ?? null,
    rootCause: report.rootCause ?? 'UNKNOWN',
    recommendedAction: report.policy.action,
    writeAuthorized: report.policy.writeAuthorized === true,
    reason: report.policy.reason,
    truthSummary: {
      observed: (report.claims ?? []).filter((claim) => claim.truthClass === 'OBSERVED').length,
      inferred: (report.claims ?? []).filter((claim) => claim.truthClass === 'INFERRED').length,
      unknown: (report.claims ?? []).filter((claim) => claim.truthClass === 'UNKNOWN').length
    },
    source,
    authorityBoundary: 'MODEL_INFERENCE_ALONE_CANNOT_AUTHORIZE_FUNDS'
  };
  return { ...core, receiptHash: sha256(core) };
}

export function ingestIncident(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('incident payload must be an object');

  if (payload.caseData) {
    const report = analyzeCase(payload.caseData);
    return {
      status: 'RECONSTRUCTED',
      report,
      authorityReceipt: buildAuthorityReceipt(report, 'BYOI_CASE_DATA')
    };
  }

  const txHash = payload.txHash ?? null;
  const marketId = payload.marketId ?? null;
  const intent = typeof payload.intent === 'string' ? payload.intent.trim() : '';

  if (txHash && !TX_HASH.test(txHash)) throw new Error('txHash must be a 32-byte transaction hash');
  if (marketId && !HEX_32.test(marketId)) throw new Error('marketId must be a 32-byte marketId');
  if (!txHash && !marketId) throw new Error('provide caseData or at least txHash / marketId');

  const core = {
    schema: 'LKB-INCIDENT-INTAKE-v0.1',
    caseId: payload.caseId ?? `BYOI-${sha256({ txHash, marketId, intent }).slice(0, 8).toUpperCase()}`,
    txHash,
    marketId,
    intent: intent || 'UNKNOWN',
    status: 'EVIDENCE_REQUIRED',
    claims: [
      txHash ? { id: 'O-INTAKE-1', truthClass: 'OBSERVED', claim: 'A transaction hash was supplied by the caller.', evidence: ['input.txHash'] } : null,
      marketId ? { id: 'O-INTAKE-2', truthClass: 'OBSERVED', claim: 'A marketId was supplied by the caller.', evidence: ['input.marketId'] } : null,
      { id: 'U-INTAKE-1', truthClass: 'UNKNOWN', claim: 'Venue state has not yet been reconstructed from chain and market evidence.', evidence: [] }
    ].filter(Boolean),
    rootCause: 'UNKNOWN',
    policy: {
      action: 'RETRY_READ',
      writeAuthorized: false,
      reason: 'Incident intake is read-only until fresh chain, market lifecycle and execution evidence are reconciled.'
    }
  };
  const report = { ...core, reportHash: sha256(core) };
  return {
    status: 'EVIDENCE_REQUIRED',
    report,
    authorityReceipt: buildAuthorityReceipt(report, 'BYOI_MINIMAL_INTAKE')
  };
}

export function formatSlackNotification(authorityReceipt) {
  return {
    text: `Last Known Book · ${authorityReceipt.caseId ?? 'incident'} · ${authorityReceipt.recommendedAction}`,
    blocks: [
      { type: 'section', text: { type: 'mrkdwn', text: `*Last Known Book*\nCase: *${authorityReceipt.caseId ?? 'unknown'}*\nAction: *${authorityReceipt.recommendedAction}*\nWrite authorized: *${authorityReceipt.writeAuthorized ? 'YES' : 'NO'}*` } },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `Authority receipt: \`${authorityReceipt.receiptHash}\`` }] }
    ]
  };
}

export function formatDiscordNotification(authorityReceipt) {
  return {
    content: `Last Known Book · ${authorityReceipt.caseId ?? 'incident'}`,
    embeds: [{
      title: authorityReceipt.recommendedAction,
      description: authorityReceipt.reason,
      fields: [
        { name: 'Write authorized', value: authorityReceipt.writeAuthorized ? 'YES' : 'NO', inline: true },
        { name: 'Root cause', value: authorityReceipt.rootCause ?? 'UNKNOWN', inline: true },
        { name: 'Receipt', value: authorityReceipt.receiptHash }
      ]
    }]
  };
}
