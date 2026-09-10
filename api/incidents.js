import investigateHandler from './investigate.js';

// Generic inbound operational webhook. It intentionally shares the same
// read-only/fail-closed investigation path as /api/investigate.
export default async function handler(req, res) {
  res.setHeader('X-LKB-Integration', 'GENERIC_INBOUND_INCIDENT_WEBHOOK_READ_ONLY');
  return investigateHandler(req, res);
}
