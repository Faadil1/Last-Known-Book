const rpcUrl = process.env.RPC_URL;
const token = process.env.TOKEN_ADDRESS;
if (!rpcUrl || !token || !/^0x[0-9a-fA-F]{40}$/.test(token)) {
  console.error('Usage: RPC_URL=<rpc> TOKEN_ADDRESS=<erc20> npm run token:decimals');
  process.exit(2);
}

const response = await fetch(rpcUrl, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: token, data: '0x313ce567' }, 'latest'] })
});
if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
const json = await response.json();
if (json.error) throw new Error(json.error.message ?? 'RPC decimals() call failed');
const decimals = Number(BigInt(json.result));
if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) throw new Error('invalid decimals result');
process.stdout.write(`${JSON.stringify({ token, decimals, source: 'LIVE_ERC20_DECIMALS_READ', readOnly: true }, null, 2)}\n`);
