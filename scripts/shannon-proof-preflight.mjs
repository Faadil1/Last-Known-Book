#!/usr/bin/env node
import fs from 'node:fs/promises';
import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk';
import { somniaShannon } from '@somnia-chain/markets-sdk/chains';

const INDEXER_URL = process.env.INDEXER_URL || 'https://dev.smk.somnia.host/v1/graphql';
const WS_RPC_URL = process.env.WS_RPC_URL || 'wss://api.infra.testnet.somnia.network/ws';
const MIN_HEADROOM_SEC = Number(process.env.MIN_HEADROOM_SEC || 600);
const OUT = process.env.PREFLIGHT_OUT || 'evidence/shannon/preflight.json';

const exchange = new SomniaMarkets({
  indexerUrl: INDEXER_URL,
  chain: somniaShannon,
  wsRpcUrl: WS_RPC_URL,
  addresses: SOMNIA_TESTNET_ADDRESSES,
});

function serial(value) {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(serial);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, serial(v)]));
  }
  return value;
}

function pickBookTop(book) {
  const bids = book?.yesBids ?? book?.bids ?? [];
  const asks = book?.yesAsks ?? book?.asks ?? [];
  return {
    bidCount: bids.length,
    askCount: asks.length,
    bestBidRaw: bids[0] ?? null,
    bestAskRaw: asks[0] ?? null,
  };
}

async function main() {
  const now = Math.floor(Date.now() / 1000);
  const live = await exchange.client.listLiveBinaryMarkets({ limit: 50 });
  if (!Array.isArray(live) || live.length === 0) throw new Error('NO_LIVE_BINARY_MARKETS');

  const unified = Object.values(await exchange.loadMarkets(true));
  const inspected = [];
  let chosen = null;

  const ordered = [...live].sort((a,b) => {
    const score = (m) => {
      const asset = String(m.asset ?? '').toUpperCase();
      const interval = Number(m.intervalSec ?? 0);
      const preferred = (asset === 'BTC' || asset === 'ETH') && (interval === 900 || interval === 3600);
      const headroom = Number(m.expiry ?? 0) - now;
      return (preferred ? 1_000_000 : 0) + headroom;
    };
    return score(b) - score(a);
  });

  for (const row of ordered.slice(0, 20)) {
    const marketId = row.marketId;
    const pool = row.pool ?? row.poolAddress;
    if (!marketId || !pool) continue;
    const secondsLeft = Number(row.expiry ?? 0) - now;
    let onchain;
    try { onchain = await exchange.client.getMarketOnchain(marketId); }
    catch (error) {
      inspected.push({marketId, pool, secondsLeft, readError: String(error?.message ?? error)});
      continue;
    }
    const entry = {
      marketId,
      pool,
      asset: row.asset ?? null,
      intervalSec: Number(row.intervalSec ?? 0),
      expiry: Number(row.expiry ?? 0),
      secondsLeft,
      onchainStatus: Number(onchain.status),
    };
    inspected.push(entry);
    if (chosen || Number(onchain.status) !== 1 || secondsLeft < MIN_HEADROOM_SEC) continue;

    const params = await exchange.client.getBinaryBookParams(pool);
    const rawBook = await exchange.client.getBinaryOrderBook(pool, { depth: 5 });
    const unifiedMarket = unified.find((m) => String(m?.info?.marketId ?? '').toLowerCase() === String(marketId).toLowerCase());
    const upSymbol = unifiedMarket?.outcomes?.[0]?.symbol ?? null;
    const downSymbol = unifiedMarket?.outcomes?.[1]?.symbol ?? null;
    let humanBook = null;
    if (upSymbol) {
      try {
        const b = await exchange.fetchOrderBook(upSymbol, 5);
        humanBook = {
          bids: (b.bids ?? []).slice(0,5),
          asks: (b.asks ?? []).slice(0,5),
        };
      } catch (error) {
        humanBook = { error: String(error?.message ?? error) };
      }
    }
    chosen = {
      ...entry,
      onchain: serial(onchain),
      bookParams: serial(params),
      bookTop: serial(pickBookTop(rawBook)),
      humanBook: serial(humanBook),
      symbols: { up: upSymbol, down: downSymbol },
      collateral: {
        address: SOMNIA_TESTNET_ADDRESSES.collateral,
        decimals: 6,
        symbol: 'tUSDC',
      },
    };
  }

  const result = {
    schema: 'LKB-SHANNON-PREFLIGHT-v0.1',
    generatedAt: new Date().toISOString(),
    mode: 'READ_ONLY_NO_SIGNER',
    chainId: 50312,
    sdkPinnedVersion: '0.29.0',
    indexerUrl: INDEXER_URL,
    wsRpcUrl: WS_RPC_URL,
    minHeadroomSec: MIN_HEADROOM_SEC,
    liveMarketCount: live.length,
    chosen,
    inspected,
    authority: {
      blockchainWritePerformed: false,
      privateKeyPresent: false,
      nextBoundary: chosen ? 'PREPARE_WRITE_PACKET_ONLY' : 'BLOCK_NO_SAFE_TRADING_MARKET',
    },
  };

  await fs.mkdir(new URL('../evidence/shannon/', import.meta.url), { recursive: true });
  await fs.writeFile(OUT, `${JSON.stringify(serial(result), null, 2)}\n`, 'utf8');
  console.log('LKB_SHANNON_PREFLIGHT_JSON_START');
  console.log(JSON.stringify(serial(result), null, 2));
  console.log('LKB_SHANNON_PREFLIGHT_JSON_END');
  if (!chosen) process.exitCode = 2;
}

main().catch((error) => {
  console.error('LKB_SHANNON_PREFLIGHT_FAILED', error);
  process.exit(1);
});
