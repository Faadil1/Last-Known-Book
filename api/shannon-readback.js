const RPC_URL = process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network/';
const PUBLIC_TX = process.env.LKB_PUBLIC_TX_HASH || '0xbe1b148423553b21f7c4177248dc6be19406e1416b1f065cc556279de4da03be';
const EXPECTED_CHAIN_ID = 50312;

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC_${body.error.code ?? 'ERROR'}`);
  return body.result;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const [chainHex, headHex, receipt] = await Promise.all([
      rpc('eth_chainId'),
      rpc('eth_blockNumber'),
      rpc('eth_getTransactionReceipt', [PUBLIC_TX])
    ]);

    const chainId = Number.parseInt(chainHex, 16);
    const blockNumber = Number.parseInt(headHex, 16);
    const receiptBlock = receipt?.blockNumber ? Number.parseInt(receipt.blockNumber, 16) : null;
    const txStatus = receipt ? (Number.parseInt(receipt.status ?? '0x0', 16) === 1 ? 'CONFIRMED' : 'REVERTED') : 'NOT FOUND';
    const confirmations = receiptBlock == null ? null : Math.max(0, blockNumber - receiptBlock + 1);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({
      ok: chainId === EXPECTED_CHAIN_ID,
      chainId,
      blockNumber,
      txStatus,
      confirmations,
      source: 'SOMNIA_SHANNON_RPC_SERVER_READ_ONLY',
      proofScope: 'PUBLIC_CAPTURED_LKB003_ONLY',
      checkedAt: new Date().toISOString(),
      writesAttempted: false
    });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({
      ok: false,
      error: error instanceof Error ? error.message : 'READ_FAILED',
      failClosed: true,
      writesAttempted: false,
      checkedAt: new Date().toISOString()
    });
  }
}
