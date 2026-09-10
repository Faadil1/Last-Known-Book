#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { investigatePayload } from '../src/intake.mjs';
import { buildAuthorityReceipt } from '../src/authority-receipt.mjs';
import { verifyNetworkNormalization } from '../src/network-normalization.mjs';

const [command, ...args] = process.argv.slice(2);
const out = (value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
const die = (message) => { process.stderr.write(`${message}\n`); process.exitCode = 1; };

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

try {
  if (command === 'investigate') {
    if (!args[0]) throw new Error('Usage: npm run lkb -- investigate <incident.json>');
    out(await investigatePayload(await readJson(args[0])));
  } else if (command === 'tx') {
    const txHash = args[0];
    if (!txHash) throw new Error('Usage: npm run lkb -- tx <txHash> [shannon|mainnet] [marketId]');
    out(await investigatePayload({ txHash, network: args[1] ?? 'shannon', marketId: args[2] ?? undefined, agentIntent: process.env.LKB_AGENT_INTENT ?? 'Intent not supplied to CLI.' }));
  } else if (command === 'receipt') {
    if (!args[0]) throw new Error('Usage: npm run lkb -- receipt <incident-report.json>');
    out(buildAuthorityReceipt(await readJson(args[0]), { source: 'LKB_CLI' }));
  } else if (command === 'network-check') {
    out(await verifyNetworkNormalization(args[0] ?? 'shannon'));
  } else {
    out({
      name: 'Last Known Book CLI',
      authority: 'READ_ONLY_BY_DEFAULT',
      commands: [
        'investigate <incident.json>',
        'tx <txHash> [shannon|mainnet] [marketId]',
        'receipt <incident-report.json>',
        'network-check [shannon|mainnet]'
      ],
      note: 'This CLI exposes investigation/read paths only. It does not contain the protected blockchain write runner.'
    });
  }
} catch (error) {
  die(error instanceof Error ? error.message : String(error));
}
