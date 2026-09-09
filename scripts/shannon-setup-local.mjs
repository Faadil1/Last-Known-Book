#!/usr/bin/env node
/**
 * Last Known Book — bounded Shannon wallet setup runner.
 *
 * Default: READ-ONLY.
 * Writes require --execute AND LKB_SETUP_CONFIRM=AUTHORIZE_SHANNON_SETUP_003.
 * Allowed writes only:
 *   1) tUSDC.faucet(1 raw) when balance < 1 raw
 *   2) tUSDC.approve(exact packet pool, 1 raw) when allowance < 1 raw
 * No market order, no cancel, no autoApprove, no unlimited approval.
 */
import fs from 'node:fs/promises';
import { createPublicClient, createWalletClient, erc20Abi, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { somniaShannon } from '@somnia-chain/markets-sdk/chains';

const EXECUTE = process.argv.includes('--execute');
const SETUP_PATH = process.env.LKB_SETUP_PATH || 'evidence/shannon/SHANNON-SETUP-003.json';
const MARKET_PACKET_PATH = process.env.LKB_PACKET_PATH || 'evidence/shannon/SHANNON-PACKET-003.json';
const PRIVATE_KEY = (process.env.TEST_WALLET_PRIVATE_KEY || '').trim();
const CONFIRM = process.env.LKB_SETUP_CONFIRM || '';
const EXPECTED_CONFIRM = 'AUTHORIZE_SHANNON_SETUP_003';
const EXPECTED_WALLET = (process.env.WALLET_ADDRESS || '').trim();

const faucetAbi = [{
  type:'function',
  name:'faucet',
  stateMutability:'nonpayable',
  inputs:[{name:'amount',type:'uint256'}],
  outputs:[],
}];

function fail(code, detail = null) {
  console.error(JSON.stringify({ok:false,code,detail,writePerformed:false}, null, 2));
  process.exit(2);
}

async function main() {
  const setup = JSON.parse(await fs.readFile(SETUP_PATH, 'utf8'));
  const packet = JSON.parse(await fs.readFile(MARKET_PACKET_PATH, 'utf8'));
  if (setup.setupId !== 'SHANNON_SETUP_003') fail('SETUP_ID_MISMATCH');
  if (setup.chainId !== 50312) fail('SETUP_CHAIN_MISMATCH');
  if (packet.packetId !== 'SHANNON_PACKET_003') fail('MARKET_PACKET_ID_MISMATCH');
  if (Date.now() >= Date.parse(setup.authority.cutoffUtc)) fail('SETUP_EXPIRED', setup.authority.cutoffUtc);
  if (Date.now() >= Date.parse(packet.authority.cutoffUtc)) fail('MARKET_PACKET_EXPIRED', packet.authority.cutoffUtc);
  if (String(packet.market.pool).toLowerCase() !== String(setup.targetPool).toLowerCase()) fail('POOL_BINDING_MISMATCH');

  const rpc = somniaShannon.rpcUrls.default.http[0];
  const publicClient = createPublicClient({chain:somniaShannon,transport:http(rpc)});
  const chainId = await publicClient.getChainId();
  if (chainId !== 50312) fail('WRONG_CHAIN', chainId);

  if (!/^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY)) {
    if (EXECUTE) fail('MISSING_OR_INVALID_TEST_WALLET_PRIVATE_KEY');
    console.log(JSON.stringify({ok:true,mode:'READ_ONLY_SETUP_PACKET_VALIDATED',chainId,targetPool:setup.targetPool,collateral:setup.collateral,next:'LOCAL_PRIVATE_KEY_REQUIRED_ONLY_FOR_EXECUTE'}, null, 2));
    process.exit(0);
  }

  const account = privateKeyToAccount(PRIVATE_KEY);
  if (EXPECTED_WALLET && account.address.toLowerCase() !== EXPECTED_WALLET.toLowerCase()) fail('WALLET_ADDRESS_MISMATCH');

  const readState = async () => {
    const [gas,balance,allowance] = await Promise.all([
      publicClient.getBalance({address:account.address}),
      publicClient.readContract({address:setup.collateral.address,abi:erc20Abi,functionName:'balanceOf',args:[account.address]}),
      publicClient.readContract({address:setup.collateral.address,abi:erc20Abi,functionName:'allowance',args:[account.address,setup.targetPool]}),
    ]);
    return {gasRaw:gas.toString(),tUsdcRaw:balance.toString(),allowanceRaw:allowance.toString()};
  };

  const before = await readState();
  if (!EXECUTE) {
    console.log(JSON.stringify({ok:true,mode:'READ_ONLY_WALLET_SETUP_CHECK',wallet:account.address,before,required:{tUsdcRawAtLeast:'1',allowanceRawExactly:'1'}}, null, 2));
    process.exit(0);
  }

  if (CONFIRM !== EXPECTED_CONFIRM) fail('MISSING_EXACT_HUMAN_CONFIRMATION',{expected:EXPECTED_CONFIRM});
  if (BigInt(before.gasRaw) <= 0n) fail('NO_TESTNET_GAS',before);

  const walletClient = createWalletClient({account,chain:somniaShannon,transport:http(rpc)});
  const writes = [];

  let state = before;
  if (BigInt(state.tUsdcRaw) < 1n) {
    const hash = await walletClient.writeContract({address:setup.collateral.address,abi:faucetAbi,functionName:'faucet',args:[1n]});
    const receipt = await publicClient.waitForTransactionReceipt({hash});
    writes.push({action:'FAUCET_1_RAW_TUSDC',hash,receiptStatus:receipt.status});
    if (receipt.status !== 'success') fail('FAUCET_RECEIPT_NOT_SUCCESS',writes);
    state = await readState();
  }

  if (BigInt(state.tUsdcRaw) < 1n) fail('FAUCET_POSTSTATE_INSUFFICIENT',state);

  if (BigInt(state.allowanceRaw) !== 1n) {
    const hash = await walletClient.writeContract({address:setup.collateral.address,abi:erc20Abi,functionName:'approve',args:[setup.targetPool,1n]});
    const receipt = await publicClient.waitForTransactionReceipt({hash});
    writes.push({action:'APPROVE_EXACT_1_RAW_TO_PACKET_POOL',hash,receiptStatus:receipt.status});
    if (receipt.status !== 'success') fail('APPROVAL_RECEIPT_NOT_SUCCESS',writes);
    state = await readState();
  }

  if (BigInt(state.allowanceRaw) !== 1n) fail('ALLOWANCE_POSTSTATE_NOT_EXACTLY_ONE',state);
  if (BigInt(state.tUsdcRaw) < 1n) fail('TUSDC_POSTSTATE_INSUFFICIENT',state);

  const evidence = {
    schema:'LKB-SHANNON-SETUP-PROOF-v0.1',
    setupId:setup.setupId,
    generatedAt:new Date().toISOString(),
    chainId,
    wallet:account.address,
    targetPool:setup.targetPool,
    before,
    writes,
    after:state,
    marketOrderPerformed:false,
  };
  await fs.mkdir('evidence/shannon/executions',{recursive:true});
  const outPath = `evidence/shannon/executions/${setup.setupId}-${Date.now()}.json`;
  await fs.writeFile(outPath, `${JSON.stringify(evidence,null,2)}\n`, 'utf8');
  console.log(JSON.stringify({ok:true,outPath,evidence}, null, 2));
  process.exit(0);
}

main().catch((error)=>{
  console.error(JSON.stringify({ok:false,code:'UNHANDLED',message:String(error?.message??error)},null,2));
  process.exit(1);
});
