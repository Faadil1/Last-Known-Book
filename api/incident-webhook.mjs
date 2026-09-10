import { ingestIncident } from '../src/agent-native.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  try {
    const envelope = req.body ?? {};
    const payload = envelope.incident ?? envelope;
    const result = ingestIncident(payload);
    return res.status(202).json({
      accepted: true,
      source: envelope.source ?? 'external-agent',
      callbackPolicy: 'NO_OUTBOUND_CALLBACKS_FROM_PUBLIC_DEMO',
      status: result.status,
      caseId: result.report.caseId,
      authorityReceipt: result.authorityReceipt
    });
  } catch (error) {
    return res.status(400).json({ accepted: false, error: 'INVALID_INCIDENT', message: error.message });
  }
}
