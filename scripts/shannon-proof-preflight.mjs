#!/usr/bin/env node
import fs from 'node:fs/promises';
import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk';
import { somniaShannon } from '@somnia-chain/markets-sdk/chains';

const INDEXER_URL = process.env.INDEXER_URL || 'https://dev.smk.somnia.host/v1/graphql';
const MIN_HEADROOM_SEC = Number(process.env.MIN_HEADROOM_SEC || 600);
const OUT = process.env.PREFLIGHT_OUT || 'evidence/shannon/preflight.json';

const exchange = new SomniaMarkets({
  indexerUrl: INDEXER_URL,
  chain: somniaShannon,
  addresses: SOMNIA_TESTNET_ADDRESSES,
});

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}_TIMEOUT_${ms}MS`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

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
  const live = await withTimeout(exchange.client.listLiveBinaryMarkets({ limit: 50 }), 20000, 'LIST_LIVE');
  if (!Array.isArray(live) || live.length === 0) throw new Error('NO_LIVE_BINARY_MARKETS');

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

  for (const row of ordered.slice(0, 12)) {
    const marketId = row.marketId;
    const pool = row.pool ?? row.poolAddress;
    if (!marketId || !pool) continue;
    const secondsLeft = Number(row.expiry ?? 0) - now;
    let onchain;
    try {
      onchain = await withTimeout(exchange.client.getMarketOnchain(marketId), 10000, 'GET_MARKET_ONCHAIN');
    } catch (error) {
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

    try {
      const params = await withTimeout(exchange.client.getBinaryBookParams(pool), 10000, 'GET_BOOK_PARAMS');
      const rawBook = await withTimeout(exchange.client.getBinaryOrderBook(pool, { depth: 5 }), 15000, 'GET_BINARY_ORDERBOOK');
      chosen = {
        ...entry,
        onchain: serial(onchain),
        bookParams: serial(params),
        bookTop: serial(pickBookTop(rawBook)),
        collateral: {
          address: SOMNIA_TESTNET_ADDRESSES.collateral,
          decimals: 6,
          symbol: 'tUSDC',
        },
      };
    } catch (error) {
      inspected[inspected.length - 1].candidateReadError = String(error?.message ?? error);
    }
  }

  const result = {
    schema: 'LKB-SHANNON-PREFLIGHT-v0.3',
    generatedAt: new Date().toISOString(),
    mode: 'READ_ONLY_NO_SIGNER_LOW_LEVEL_BOUNDED',
    chainId: 50312,
    sdkPinnedVersion: '0.29.0',
    indexerUrl: INDEXER_URL,
    minHeadroomSec: MIN_HEADROOM_SEC,
    liveMarketCount: live.length,
    chosen,
    inspected,
    authority: {
      blockchainWritePerformed: false,
      privateKeyPresent: false,
      nextBoundary: chosen ? 'PREPARE_WRITE_PACKET_ONLY' : 'BLOCK_NO_SAFE_FULL_READ',
    },
  };

  await fs.mkdir(new URL('../evidence/shannon/', import.meta.url), { recursive: true });
  await fs.writeFile(OUT, `${JSON.stringify(serial(result), null, 2)}\n`, 'utf8');
  console.log('LKB_SHANNON_PREFLIGHT_JSON_START');
  console.log(JSON.stringify(serial(result), null, 2));
  console.log('LKB_SHANNON_PREFLIGHT_JSON_END');
  process.exit(chosen ? 0 : 2);
}

main().catch((error) => {
  console.error('LKB_SHANNON_PREFLIGHT_FAILED', error);
  process.exit(1);
});
