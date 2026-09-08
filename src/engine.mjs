import { createHash } from 'node:crypto';

export const ENGINE_VERSION = '0.1.0';

const ROOT_CAUSES = new Set([
  'VENUE_SEMANTICS',
  'DATA_INDEXER',
  'EXPECTED_VS_OBSERVED',
  'LIFECYCLE',
  'AGENT_CAUSED',
  'MIXED',
  'UNKNOWN'
]);

const ACTIONS = new Set([
  'NO_ACTION',
  'RETRY_READ',
  'CANCEL_EXACT_ORDER',
  'REDEEM_EXACT_WINNING_RESIDUAL',
  'ESCALATE'
]);

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function observed(id, claim, evidence = []) {
  return { id, truthClass: 'OBSERVED', claim, evidence };
}

function inferred(id, claim, evidence = []) {
  return { id, truthClass: 'INFERRED', claim, evidence };
}

function unknown(id, claim) {
  return { id, truthClass: 'UNKNOWN', claim, evidence: [] };
}

function assertPositiveNumber(value, label) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${label} must be a finite non-negative number`);
}

export function decodeMintPair(caseData) {
  const e = caseData.evidence;
  assertPositiveNumber(e.grossContractValue, 'grossContractValue');
  assertPositiveNumber(e.soldLegProceeds, 'soldLegProceeds');
  const netEscrow = Number((e.grossContractValue - e.soldLegProceeds).toFixed(6));
  const naiveCost = Number(e.quoteQuantityApprox.toFixed(6));
  const distortion = naiveCost === 0 ? null : Number((netEscrow / naiveCost).toFixed(2));

  return {
    semantic: 'MINT_A_PAIR',
    netEscrow,
    naiveCost,
    distortion,
    claims: [
      observed('O-MINT-1', 'The captured fill is labeled MINT_A_PAIR.', ['fill.kind']),
      observed('O-MINT-2', `Explorer-derived gross contract value is ${e.grossContractValue.toFixed(6)} tUSDC-equivalent and sold-leg proceeds are ${e.soldLegProceeds.toFixed(6)}.`, ['source.explorerAmounts']),
      observed('O-MINT-3', `Corrected net escrow is ${netEscrow.toFixed(6)}, not the approximate quoteQuantity ${naiveCost.toFixed(6)}.`, ['deterministic: grossContractValue - soldLegProceeds']),
      inferred('I-MINT-1', 'A naive directional-flow interpretation would materially misstate the economics of this fill.', ['O-MINT-1', 'O-MINT-3']),
      unknown('U-MINT-1', 'Counterparty strategy or intent cannot be established from the captured public evidence.')
    ]
  };
}

export function decodeIndexerLag(caseData) {
  const e = caseData.evidence;
  if (e.receiptStatus !== 'SUCCESS') return null;
  if (e.indexerVerification !== 'UNAVAILABLE') return null;
  return {
    semantic: 'CHAIN_INDEXER_DIVERGENCE',
    claims: [
      observed('O-IDX-1', 'The transaction was confirmed successful on-chain.', ['receipt.status', 'source.publicEvidence']),
      observed('O-IDX-2', 'The bounded indexer verification path returned unavailable / could not verify.', ['indexerVerification']),
      inferred('I-IDX-1', 'The application-layer failure is consistent with indexer lag, not transaction failure.', ['O-IDX-1', 'O-IDX-2'])
    ]
  };
}

export function decodeEscrow(caseData) {
  const e = caseData.evidence;
  if (e.orderState !== 'RESTING' || e.side !== 'SELL_YES') return null;
  const committed = e.committedOutcomeRaw;
  const visibleDelta = e.visibleYesBeforeRaw - e.visibleYesAfterPlacementRaw;
  if (visibleDelta !== committed) return null;
  return {
    semantic: 'RESTING_SELL_ESCROW',
    claims: [
      observed('O-ESC-1', `Visible YES moved ${e.visibleYesBeforeRaw} → ${e.visibleYesAfterPlacementRaw} while ${committed} raw YES remained committed by a resting SELL.`, ['balances.before', 'balances.afterPlacement', 'order.committed']),
      observed('O-ESC-2', `Exact cancel restored visible YES to ${e.visibleYesAfterCancelRaw}.`, ['cancel.txHash', 'balances.afterCancel']),
      inferred('I-ESC-1', 'The apparent disappearance is venue escrow semantics, not lost inventory.', ['O-ESC-1', 'O-ESC-2'])
    ]
  };
}

export function evaluatePolicy({ rootCause, chainTruth, indexerTruth, safeWriteCandidate = null }) {
  if (!ROOT_CAUSES.has(rootCause)) throw new Error(`Unknown root cause: ${rootCause}`);

  if (chainTruth === 'SUCCESS' && indexerTruth === 'UNAVAILABLE') {
    return {
      action: 'RETRY_READ',
      writeAuthorized: false,
      reason: 'Chain success outranks missing indexed confirmation; retry reads before any compensating write.'
    };
  }

  if (rootCause === 'VENUE_SEMANTICS' && safeWriteCandidate === null) {
    return {
      action: 'NO_ACTION',
      writeAuthorized: false,
      reason: 'The divergence is explained by venue semantics; no corrective write is justified.'
    };
  }

  if (safeWriteCandidate && ACTIONS.has(safeWriteCandidate.action) && safeWriteCandidate.deterministicPredicatesSatisfied === true && safeWriteCandidate.userConfirmed === true) {
    return {
      action: safeWriteCandidate.action,
      writeAuthorized: true,
      reason: 'Deterministic predicates and explicit user confirmation are both present.'
    };
  }

  return {
    action: 'ESCALATE',
    writeAuthorized: false,
    reason: 'Evidence is insufficient for an authorized write.'
  };
}

export function analyzeCase(caseData) {
  const claims = [];
  const semantics = [];
  let rootCause = 'UNKNOWN';
  let policy;

  if (caseData.type === 'MINT_PAIR_INDEXER_LAG') {
    const mint = decodeMintPair(caseData);
    const lag = decodeIndexerLag(caseData);
    semantics.push(mint.semantic);
    claims.push(...mint.claims);
    if (lag) {
      semantics.push(lag.semantic);
      claims.push(...lag.claims);
      rootCause = 'MIXED';
      policy = evaluatePolicy({ rootCause, chainTruth: caseData.evidence.receiptStatus, indexerTruth: caseData.evidence.indexerVerification });
    } else {
      rootCause = 'VENUE_SEMANTICS';
      policy = evaluatePolicy({ rootCause, chainTruth: caseData.evidence.receiptStatus, indexerTruth: caseData.evidence.indexerVerification });
    }
  } else if (caseData.type === 'RESTING_SELL_ESCROW') {
    const escrow = decodeEscrow(caseData);
    if (!escrow) throw new Error('Escrow case failed deterministic invariant');
    semantics.push(escrow.semantic);
    claims.push(...escrow.claims);
    rootCause = 'VENUE_SEMANTICS';
    policy = evaluatePolicy({ rootCause, chainTruth: 'SUCCESS', indexerTruth: 'AVAILABLE' });
  } else if (caseData.type === 'EXPECTED_VS_OBSERVED') {
    const e = caseData.evidence;
    const priceDelta = Number((e.requestedPrice - e.averageFillPrice).toFixed(6));
    claims.push(
      observed('O-EXEC-1', `Requested BUY_NO ${e.requestedQuantity} @ ${e.requestedPrice}.`, ['request']),
      observed('O-EXEC-2', `Average actual fill was ${e.averageFillPrice}; position moved ${e.positionBefore} → ${e.positionAfter}.`, ['receipt', 'position']),
      observed('O-EXEC-3', `Execution price improved by ${priceDelta.toFixed(6)} versus the request limit.`, ['deterministic: requestedPrice - averageFillPrice'])
    );
    semantics.push('EXPECTED_VS_ACTUAL_FILL');
    rootCause = 'EXPECTED_VS_OBSERVED';
    policy = { action: 'NO_ACTION', writeAuthorized: false, reason: 'Observed execution reconciles and is price-improved relative to the limit.' };
  } else {
    throw new Error(`Unsupported case type: ${caseData.type}`);
  }

  const reportCore = {
    schema: 'LKB-INCIDENT-REPORT-v0.1',
    engineVersion: ENGINE_VERSION,
    caseId: caseData.caseId,
    title: caseData.title,
    type: caseData.type,
    marketId: caseData.marketId ?? null,
    intent: caseData.intent,
    venueReality: caseData.venueReality,
    semantics,
    rootCause,
    claims,
    policy,
    reconciliation: caseData.reconciliation,
    provenance: caseData.provenance
  };

  return { ...reportCore, reportHash: sha256(reportCore) };
}
