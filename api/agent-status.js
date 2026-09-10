import { AGENT_TOOLS } from '../src/agent-tools.mjs';
import { buildAuthorityReceipt } from '../src/authority-receipt.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED', writesAttempted: false });
  }

  const selfTestReceipt = buildAuthorityReceipt({
    caseId: 'SELF-TEST',
    reportHash: 'LKB_AGENT_STATUS_SELF_TEST',
    claims: [
      { id: 'O-SELF-1', truthClass: 'OBSERVED', claim: 'Agent status endpoint is executing.' },
      { id: 'U-SELF-1', truthClass: 'UNKNOWN', claim: 'No incident evidence was supplied to this self-test.' }
    ],
    policy: { action: 'ESCALATE', writeAuthorized: false }
  }, { source: 'LKB_AGENT_STATUS_SELF_TEST' });

  return res.status(200).json({
    ok: true,
    schema: 'LKB-AGENT-CAPABILITIES-v0.1',
    product: 'Last Known Book',
    authority: 'READ_ONLY_AGENT_INTERFACE',
    tools: AGENT_TOOLS.map(({ name, description }) => ({ name, description })),
    surfaces: {
      investigate: 'POST /api/investigate',
      inboundWebhook: 'POST /api/incidents',
      mcp: 'POST /api/mcp',
      networkNormalization: 'GET /api/network-check?network=shannon|mainnet',
      judgePage: 'GET /agent.html'
    },
    invariants: {
      walletRequired: false,
      privateKeyAccepted: false,
      signingAvailable: false,
      broadcastAvailable: false,
      inferenceCanAuthorizeSpend: false,
      executionPerformed: false
    },
    selfTest: {
      receiptSchema: selfTestReceipt.schema,
      recommendedAction: selfTestReceipt.decision.recommendedAction,
      writeAuthorized: selfTestReceipt.decision.writeAuthorized,
      receiptHash: selfTestReceipt.receiptHash
    },
    checkedAt: new Date().toISOString(),
    writesAttempted: false
  });
}
