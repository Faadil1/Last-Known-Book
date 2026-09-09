#!/usr/bin/env node
/** Last Known Book — local Shannon testnet proof runner. */
import fs from 'node:fs/promises';
import { decodeEventLog, erc20Abi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES, orderBookEventsAbi } from '@somnia-chain/markets-sdk';
import { somniaShannon } from '@somnia-chain/markets-sdk/chains';

const EXECUTE = process.argv.includes('--execute');
const PACKET_PATH = process.env.LKB_PACKET_PATH || 'evidence/shannon/SHANNON-PACKET-003.json';
const PRIVATE_KEY = (process.env.TEST_WALLET_PRIVATE_KEY || '').trim();
const CONFIRM = process.env.LKB_PACKET_CONFIRM || '';
const EXPECTED_CONFIRM = 'AUTHORIZE_SHANNON_PACKET_003';
const INDEXER_URL = process.env.INDEXER_URL || 'https://dev.smk.somnia.host/v1/graphql';
const MIN_HEADROOM_SEC = 600;
const CHAIN_ID = 50312;
const COLLATERAL = SOMNIA_TESTNET_ADDRESSES.collateral;
let WRITE_STARTED = false;

class LkbGateError extends Error {
  constructor(code, detail = null) {
    super(code);
    this.name = 'LkbGateError';
    this.code = code;
    this.detail = detail;
  }
}
function fail(code, detail = null) { throw new LkbGateError(code, detail); }
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label}_TIMEOUT_${ms}MS`)), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
function serial(value) {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(serial);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, serial(v)]));
  return value;
}
function decodeBookEvents(receipt, pool) {
  const events = [];
  for (const log of receipt?.logs ?? []) {
    if (String(log.address).toLowerCase() !== String(pool).toLowerCase()) continue;
    try {
      const d = decodeEventLog({ abi:orderBookEventsAbi, data:log.data, topics:log.topics });
      events.push({ eventName:d.eventName, args:serial(d.args) });
    } catch {}
  }
  return events;
}
async function readPacket() {
  const packet = JSON.parse(await fs.readFile(PACKET_PATH, 'utf8'));
  if (packet.packetId !== 'SHANNON_PACKET_003') fail('PACKET_ID_MISMATCH', packet.packetId);
  if (packet.chainId !== CHAIN_ID) fail('PACKET_CHAIN_MISMATCH', packet.chainId);
  if (Date.now() >= Date.parse(packet.authority.cutoffUtc)) fail('PACKET_EXPIRED', packet.authority.cutoffUtc);
  return packet;
}

async function main() {
  const packet = await readPacket();
  const exchange = new SomniaMarkets({ indexerUrl:INDEXER_URL, chain:somniaShannon, addresses:SOMNIA_TESTNET_ADDRESSES });
  const client = exchange.client;
  const viemClient = client.getViemClient();
  const now = Math.floor(Date.now()/1000);

  const onchain = await withTimeout(client.getMarketOnchain(packet.market.marketId), 10000, 'GET_MARKET_ONCHAIN');
  const pool = String(packet.market.pool);
  const params = await withTimeout(client.getBinaryBookParams(pool), 10000, 'GET_BOOK_PARAMS');
  const book = await withTimeout(client.getBinaryOrderBook(pool, { depth:5 }), 15000, 'GET_BINARY_ORDERBOOK');
  const readGate = {
    chainId:await withTimeout(viemClient.getChainId(), 10000, 'GET_CHAIN_ID'),
    marketId:packet.market.marketId,
    packetPool:pool,
    onchainPool:String(onchain.pool ?? ''),
    status:Number(onchain.status),
    secondsLeft:Number(packet.market.expiry) - now,
    tickSizeRaw:serial(params.tickSize),
    lotSizeRaw:serial(params.lotSize),
    minQuantityRaw:serial(params.minQuantity),
    bookTop:serial({ yesBids:book?.yesBids?.[0]??null, yesAsks:book?.yesAsks?.[0]??null }),
  };

  if (readGate.chainId !== CHAIN_ID) fail('WRONG_CHAIN', readGate);
  if (String(readGate.onchainPool).toLowerCase() !== pool.toLowerCase()) fail('POOL_MISMATCH', readGate);
  if (readGate.status !== 1) fail('MARKET_NOT_TRADING', readGate);
  if (readGate.secondsLeft < MIN_HEADROOM_SEC) fail('INSUFFICIENT_HEADROOM', readGate);
  if (BigInt(params.tickSize) !== BigInt(packet.order.priceRaw)) fail('TICK_DRIFT', readGate);
  if (BigInt(params.minQuantity) !== BigInt(packet.order.quantityRaw)) fail('MIN_QUANTITY_DRIFT', readGate);
  if (BigInt(params.lotSize) > BigInt(packet.order.quantityRaw) || BigInt(packet.order.quantityRaw) % BigInt(params.lotSize) !== 0n) fail('LOT_DRIFT', readGate);

  if (!EXECUTE) {
    console.log(JSON.stringify({ ok:true, mode:'READ_ONLY_PACKET_VALIDATED', readGate, next:'REQUIRES_EXPLICIT_AUTHORIZE_SHANNON_PACKET_003' }, null, 2));
    return;
  }

  if (CONFIRM !== EXPECTED_CONFIRM) fail('MISSING_EXACT_HUMAN_CONFIRMATION', { expected:EXPECTED_CONFIRM });
  if (!/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) fail('MISSING_OR_INVALID_TEST_WALLET_PRIVATE_KEY');
  const account = privateKeyToAccount(PRIVATE_KEY);
  const gasBalance = await withTimeout(viemClient.getBalance({ address:account.address }), 10000, 'GET_GAS_BALANCE');
  const collateralBalanceBefore = await withTimeout(viemClient.readContract({ address:COLLATERAL, abi:erc20Abi, functionName:'balanceOf', args:[account.address] }), 10000, 'GET_TUSDC_BALANCE');
  const allowance = await withTimeout(viemClient.readContract({ address:COLLATERAL, abi:erc20Abi, functionName:'allowance', args:[account.address,pool] }), 10000, 'GET_ALLOWANCE');
  const requiredRaw = (BigInt(packet.order.priceRaw) * BigInt(packet.order.quantityRaw)) / 1_000_000n;
  if (gasBalance <= 0n) fail('NO_TESTNET_GAS', { address:account.address });
  if (collateralBalanceBefore < requiredRaw) fail('INSUFFICIENT_TUSDC', { requiredRaw:requiredRaw.toString(), balance:collateralBalanceBefore.toString() });
  if (allowance < requiredRaw) fail('INSUFFICIENT_ALLOWANCE_NO_AUTO_APPROVE', { requiredRaw:requiredRaw.toString(), allowance:allowance.toString(), pool });

  const finalOnchain = await withTimeout(client.getMarketOnchain(packet.market.marketId), 10000, 'FINAL_GET_MARKET_ONCHAIN');
  const finalParams = await withTimeout(client.getBinaryBookParams(pool), 10000, 'FINAL_GET_BOOK_PARAMS');
  const finalSecondsLeft = Number(packet.market.expiry) - Math.floor(Date.now()/1000);
  if (Number(finalOnchain.status) !== 1) fail('FINAL_MARKET_NOT_TRADING');
  if (String(finalOnchain.pool ?? '').toLowerCase() !== pool.toLowerCase()) fail('FINAL_POOL_MISMATCH');
  if (finalSecondsLeft < MIN_HEADROOM_SEC) fail('FINAL_HEADROOM_TOO_LOW', finalSecondsLeft);
  if (BigInt(finalParams.tickSize) !== BigInt(packet.order.priceRaw) || BigInt(finalParams.minQuantity) !== BigInt(packet.order.quantityRaw)) fail('FINAL_BOOK_PARAMS_DRIFT');

  console.error('LKB_WRITE_BOUNDARY_CROSSED: local user-authorized testnet execution starting');
  WRITE_STARTED = true;
  const trader = client.createTrader({ privateKey:PRIVATE_KEY, decimals:6 });
  const placement = await trader.placeOrder({
    pool,
    side:'BUY_YES',
    price:BigInt(packet.order.priceRaw),
    quantity:BigInt(packet.order.quantityRaw),
    orderType:Number(packet.order.orderType),
    autoApprove:false,
    userData:BigInt(packet.order.userData),
  });
  const placementEvents = decodeBookEvents(placement.receipt, pool);
  const placementEvidence = { hash:placement.hash, receiptStatus:placement.receipt?.status, orderId:placement.orderId?.toString()??null, fills:serial(placement.fills??[]), events:placementEvents };
  if (placement.receipt?.status !== 'success') fail('PLACEMENT_RECEIPT_NOT_SUCCESS', placementEvidence);
  if ((placement.fills ?? []).length > 0) fail('POST_ONLY_UNEXPECTED_FILL', placementEvidence);
  if (!placement.orderId) fail('POST_ONLY_DID_NOT_REST', placementEvidence);
  if (!placementEvents.some(e => e.eventName === 'OrderPlaced' || e.eventName === 'OrderRested')) fail('REST_EVENT_NOT_FOUND', placementEvidence);

  const cancel = await trader.cancelOrder({ pool, orderId:placement.orderId });
  const cancelEvents = decodeBookEvents(cancel.receipt, pool);
  const collateralBalanceAfter = await withTimeout(viemClient.readContract({ address:COLLATERAL, abi:erc20Abi, functionName:'balanceOf', args:[account.address] }), 10000, 'FINAL_TUSDC_BALANCE');
  const cancelEvidence = { hash:cancel.hash, receiptStatus:cancel.receipt?.status, events:cancelEvents };
  if (cancel.receipt?.status !== 'success') fail('CANCEL_RECEIPT_NOT_SUCCESS', cancelEvidence);
  if (!cancelEvents.some(e => e.eventName === 'OrderCancelled')) fail('ORDER_CANCELLED_EVENT_NOT_FOUND', cancelEvidence);

  const evidence = {
    schema:'LKB-SHANNON-EXECUTION-PROOF-v0.2', packetId:packet.packetId, generatedAt:new Date().toISOString(), chainId:CHAIN_ID, wallet:account.address,
    market:packet.market, order:packet.order, readGate, placement:placementEvidence, cancel:cancelEvidence,
    reconciliation:{ tUSDCBeforeRaw:collateralBalanceBefore.toString(), tUSDCAfterRaw:collateralBalanceAfter.toString(), restoredExactly:collateralBalanceAfter===collateralBalanceBefore, gasTokenSpentExpected:true },
  };
  await fs.mkdir('evidence/shannon/executions',{ recursive:true });
  const outPath = `evidence/shannon/executions/${packet.packetId}-${Date.now()}.json`;
  await fs.writeFile(outPath, `${JSON.stringify(serial(evidence),null,2)}\n`, 'utf8');
  console.log(JSON.stringify({ ok:true, outPath, evidence:serial(evidence) }, null, 2));
}

main().catch((error) => {
  if (error instanceof LkbGateError) {
    console.error(JSON.stringify({ ok:false, code:error.code, detail:error.detail, writePerformed:WRITE_STARTED }, null, 2));
    process.exitCode = 2;
    return;
  }
  console.error(JSON.stringify({ ok:false, code:'UNHANDLED', message:String(error?.message ?? error), writePerformed:WRITE_STARTED }, null, 2));
  process.exitCode = 1;
});
