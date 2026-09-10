import { ingestIncident, formatSlackNotification, formatDiscordNotification } from '../src/agent-native.mjs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'Last Known Book incident intake',
      schema: 'LKB-INCIDENT-INTAKE-v0.1',
      readOnly: true,
      accepts: ['caseData', 'txHash + marketId + intent']
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  try {
    const result = ingestIncident(req.body ?? {});
    return res.status(200).json({
      ...result,
      notifications: {
        slack: formatSlackNotification(result.authorityReceipt),
        discord: formatDiscordNotification(result.authorityReceipt)
      }
    });
  } catch (error) {
    return res.status(400).json({ error: 'INVALID_INCIDENT', message: error.message });
  }
}
