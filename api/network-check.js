import { verifyNetworkNormalization } from '../src/network-normalization.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED', writesAttempted: false });
  }
  try {
    const network = String(req.query?.network ?? 'shannon').toLowerCase();
    const check = await verifyNetworkNormalization(network);
    return res.status(check.pass ? 200 : 409).json({ ok: check.pass, ...check });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : 'NETWORK_CHECK_FAILED',
      failClosed: true,
      writesAttempted: false
    });
  }
}
