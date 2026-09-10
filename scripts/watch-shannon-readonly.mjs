#!/usr/bin/env node
import { getNetworkProfile } from '../src/network-normalization.mjs';

const profile = getNetworkProfile('shannon');
const address = String(process.env.LKB_WATCH_ADDRESS ?? '').trim();
const topic0 = String(process.env.LKB_WATCH_TOPIC0 ?? '').trim();
const intervalMs = Math.max(1000, Number(process.env.LKB_WATCH_INTERVAL_MS ?? 5000));
const once = process.argv.includes('--once');
if (!/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error('Set LKB_WATCH_ADDRESS to a contract address.');
if (topic0 && !/^0x[0-9a-fA-F]{64}$/.test(topic0)) throw new Error('LKB_WATCH_TOPIC0 must be a 32-byte event topic when supplied.');

async function rpc(method, params = []) {
  const response = await fetch(profile.rpcUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC_${body.error.code ?? 'ERROR'}`);
  return body.result;
}

const hex = (n) => `0x${n.toString(16)}`;
let cursor = null;
const seen = new Set();

async function tick() {
  const [chainHex, headHex] = await Promise.all([rpc('eth_chainId'), rpc('eth_blockNumber')]);
  const chainId = Number.parseInt(chainHex, 16);
  const head = Number.parseInt(headHex, 16);
  if (chainId !== profile.chainId) throw new Error(`CHAIN_MISMATCH_${chainId}`);
  const from = cursor == null ? Math.max(0, head - 2) : cursor + 1;
  if (from > head) return;
  const filter = { fromBlock: hex(from), toBlock: hex(head), address };
  if (topic0) filter.topics = [topic0];
  const logs = await rpc('eth_getLogs', [filter]);
  for (const log of logs ?? []) {
    const key = `${log.transactionHash}:${log.logIndex}`;
    if (seen.has(key)) continue;
    seen.add(key);
    process.stdout.write(`${JSON.stringify({
      schema: 'LKB-RAW-LIVE-EVENT-v0.1',
      source: 'SOMNIA_SHANNON_RPC_READ_ONLY',
      chainId,
      blockNumber: Number.parseInt(log.blockNumber, 16),
      transactionHash: log.transactionHash,
      logIndex: Number.parseInt(log.logIndex, 16),
      address: log.address,
      topics: log.topics,
      data: log.data,
      nextAction: 'QUEUE_FOR_LKB_INVESTIGATION',
      writesAttempted: false
    })}\n`);
  }
  cursor = head;
}

await tick();
if (!once) {
  setInterval(() => tick().catch((error) => process.stderr.write(`${error.message}\n`)), intervalMs);
}
