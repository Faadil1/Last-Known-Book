const txHash = process.argv[2] ?? '0x3a0016826685680538cbfe5534ce76103b5abc5dcb86416c8c0e8417438d9792';
const explorer = process.env.SHANNON_EXPLORER_BASE ?? 'https://shannon-explorer.somnia.network';
const url = `${explorer}/api/v2/transactions/${txHash}`;

console.log(`Last Known Book live-read smoke: ${url}`);
try {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  const proof = {
    txHash,
    status: body.status ?? body.result ?? 'UNKNOWN',
    block: body.block_number ?? body.block ?? null,
    from: body.from?.hash ?? body.from ?? null,
    to: body.to?.hash ?? body.to ?? null,
    source: url
  };
  console.log(JSON.stringify(proof, null, 2));
} catch (error) {
  console.error(`LIVE_READ_UNAVAILABLE: ${error.message}`);
  process.exitCode = 2;
}
