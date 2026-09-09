#!/usr/bin/env node
/**
 * Last Known Book — Shannon wallet readiness check (READ-ONLY).
 *
 * Usage (PowerShell):
 *   $env:WALLET_ADDRESS='0x...'
 *   node scripts/check-shannon-wallet.mjs
 *
 * Optional after a fresh packet selects a pool:
 *   $env:POOL_ADDRESS='0x...'
 *   node scripts/check-shannon-wallet.mjs
 *
 * No private key is read. No transaction is created or broadcast.
 */
import { erc20Abi } from 'viem';
import { SomniaMarkets, SOMNIA_TESTNET_ADDRESSES } from '@somnia-chain/markets-sdk';
import { somniaShannon } from '@somnia-chain/markets-sdk/chains';

const WALLET = (process.env.WALLET_ADDRESS || '').trim();
const POOL = (process.env.POOL_ADDRESS || '').trim();
const INDEXER_URL = process.env.INDEXER_URL || 'https://dev.smk.somnia.host/v1/graphql';
const CHAIN_ID = 50312;
const COLLATERAL = SOMNIA_TESTNET_ADDRESSES.collateral;

function fail(code, detail = null) {
  console.error(JSON.stringify({ ok:false, code, detail, writePerformed:false }, null, 2));
  process.exit(2);
}

if (!/^0x[0-9a-fA-F]{40}$/.test(WALLET)) fail('INVALID_WALLET_ADDRESS');
if (POOL && !/^0x[0-9a-fA-F]{40}$/.test(POOL)) fail('INVALID_POOL_ADDRESS');

const exchange = new SomniaMarkets({
  indexerUrl: INDEXER_URL,
  chain: somniaShannon,
  addresses: SOMNIA_TESTNET_ADDRESSES,
});
const client = exchange.client;
const viemClient = client.getViemClient();

const chainId = await viemClient.getChainId();
if (chainId !== CHAIN_ID) fail('WRONG_CHAIN', chainId);

const [gasBalance, tUSDCBalance] = await Promise.all([
  viemClient.getBalance({ address: WALLET }),
  viemClient.readContract({ address: COLLATERAL, abi: erc20Abi, functionName:'balanceOf', args:[WALLET] }),
]);

let allowance = null;
if (POOL) {
  allowance = await viemClient.readContract({ address: COLLATERAL, abi: erc20Abi, functionName:'allowance', args:[WALLET, POOL] });
}

console.log(JSON.stringify({
  ok:true,
  mode:'READ_ONLY_WALLET_READINESS',
  chainId,
  wallet:WALLET,
  gas:{ symbol:'STT', raw:gasBalance.toString(), human:Number(gasBalance) / 1e18 },
  collateral:{ symbol:'tUSDC', address:COLLATERAL, decimals:6, raw:tUSDCBalance.toString(), human:Number(tUSDCBalance) / 1e6 },
  pool:POOL || null,
  allowanceRaw:allowance === null ? null : allowance.toString(),
  writePerformed:false,
}, null, 2));
process.exit(0);
