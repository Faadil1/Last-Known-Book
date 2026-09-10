const rpcUrl = process.env.RPC_URL;
const contract = process.env.ORDERBOOK_ADDRESS;
const topics = (process.env.EVENT_TOPICS || '').split(',').map((x) => x.trim()).filter(Boolean);
const pollMs = Math.max(3000, Number(process.env.POLL_MS ?? 6000));

if (!rpcUrl || !contract || !/^0x[0-9a-fA-F]{40}$/.test(contract)) {
  console.error('Usage: RPC_URL=<rpc> ORDERBOOK_ADDRESS=<contract> EVENT_TOPICS=<topic0,...> npm run watch:dreamdex');
  process.exit(2);
}

async function rpc(method, params) {
  const response = await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  if (!response.ok) throw new Error(`RPC HTTP ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error(json.error.message ?? `${method} failed`);
  return json.result;
}

let fromBlock = BigInt(await rpc('eth_blockNumber', []));
console.error(`Last Known Book watcher · read-only · starting at ${fromBlock}`);

while (true) {
  const head = BigInt(await rpc('eth_blockNumber', []));
  if (head >= fromBlock) {
    const filter = { address: contract, fromBlock: `0x${fromBlock.toString(16)}`, toBlock: `0x${head.toString(16)}` };
    if (topics.length === 1) filter.topics = [topics];
    const logs = await rpc('eth_getLogs', [filter]);
    for (const log of logs) {
      const envelope = {
        schema: 'LKB-LIVE-EVENT-INTAKE-v0.1',
        source: 'DREAMDEX_READ_ONLY_WATCHER',
        chainReadOnly: true,
        event: {
          address: log.address,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
          logIndex: log.logIndex,
          topics: log.topics,
          data: log.data
        },
        next: 'RECONSTRUCT_WITH_MARKET_AND_AGENT_INTENT_BEFORE_ANY_ACTION'
      };
      process.stdout.write(`${JSON.stringify(envelope)}\n`);
    }
    fromBlock = head + 1n;
  }
  await new Promise((resolve) => setTimeout(resolve, pollMs));
}
