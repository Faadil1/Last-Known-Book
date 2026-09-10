import { sha256 } from './engine.mjs';

export function buildAuthorityReceipt(report, { source = 'LAST_KNOWN_BOOK' } = {}) {
  if (!report || typeof report !== 'object') throw new Error('report is required');
  const claims = Array.isArray(report.claims) ? report.claims : [];
  const count = (truthClass) => claims.filter((claim) => claim?.truthClass === truthClass).length;
  const blockingUnknowns = claims.filter((claim) => claim?.truthClass === 'UNKNOWN').map((claim) => claim.id ?? claim.claim ?? 'UNKNOWN');
  const action = report.policy?.action ?? 'ESCALATE';
  const writeAuthorized = report.policy?.writeAuthorized === true;
  const reportHash = report.reportHash ?? sha256(report);

  const core = {
    schema: 'LKB-AUTHORITY-RECEIPT-v0.1',
    source,
    caseId: report.caseId ?? null,
    reportHash,
    decision: {
      recommendedAction: action,
      writeAuthorized,
      canMoveFunds: writeAuthorized,
      executionPerformed: false
    },
    truthGate: {
      observed: count('OBSERVED'),
      inferred: count('INFERRED'),
      unknown: count('UNKNOWN'),
      blockingUnknowns
    },
    authorityModel: 'DETERMINISTIC_EVIDENCE_POLICY',
    inferenceCanAuthorizeSpend: false,
    humanConfirmationStillRequiredForWriteExecution: true,
    note: writeAuthorized
      ? 'The report policy may authorize a bounded write, but this receipt never executes it; execution still requires the separate protected human-controlled path.'
      : 'No write authority is granted by this receipt.'
  };

  return { ...core, receiptHash: sha256(core) };
}
