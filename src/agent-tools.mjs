import { buildAuthorityReceipt } from './authority-receipt.mjs';
import { investigatePayload } from './intake.mjs';
import { formatRawUnits, getNetworkProfile, parseHumanUnits, verifyNetworkNormalization } from './network-normalization.mjs';

export const AGENT_TOOLS = Object.freeze([
  {
    name: 'lkb_investigate',
    description: 'Investigate a captured Last Known Book case or a live transaction intake. Read-only; never executes a blockchain write.',
    inputSchema: {
      type: 'object',
      properties: {
        caseData: { type: 'object', description: 'Canonical/captured Last Known Book case object.' },
        txHash: { type: 'string', description: '0x-prefixed transaction hash for read-only live intake.' },
        marketId: { type: 'string', description: 'Optional marketId supplied as context; not trusted until deterministically bound.' },
        agentIntent: { description: 'Agent/operator intent as a string or object.' },
        network: { type: 'string', enum: ['shannon', 'mainnet'], default: 'shannon' }
      },
      additionalProperties: true
    }
  },
  {
    name: 'lkb_authority_receipt',
    description: 'Convert an incident report into a deterministic machine-readable authority receipt. Receipt generation never executes the recommended action.',
    inputSchema: {
      type: 'object',
      required: ['report'],
      properties: { report: { type: 'object' } },
      additionalProperties: false
    }
  },
  {
    name: 'lkb_network_normalization',
    description: 'Read chainId and collateral decimals for Shannon or Somnia mainnet and verify the network normalization guard without any write.',
    inputSchema: {
      type: 'object',
      properties: { network: { type: 'string', enum: ['shannon', 'mainnet'], default: 'shannon' } },
      additionalProperties: false
    }
  },
  {
    name: 'lkb_convert_units',
    description: 'Convert collateral units using the network profile decimals; avoids cross-network 6-vs-18 decimal mistakes.',
    inputSchema: {
      type: 'object',
      required: ['network'],
      properties: {
        network: { type: 'string', enum: ['shannon', 'mainnet'] },
        human: { type: 'string' },
        raw: { type: 'string' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'lkb_reproduce_case',
    description: 'Return the deterministic reproduction path for a canonical case without executing it.',
    inputSchema: {
      type: 'object',
      required: ['caseId'],
      properties: { caseId: { type: 'string', enum: ['LKB-001', 'LKB-002', 'LKB-003', 'LKB-004'] } },
      additionalProperties: false
    }
  }
]);

const CASE_OUTPUTS = {
  'LKB-001': 'evidence/generated/LKB-001.incident-report.json',
  'LKB-002': 'evidence/generated/LKB-002.incident-report.json',
  'LKB-003': 'evidence/generated/LKB-003.incident-report.json',
  'LKB-004': 'evidence/generated/LKB-004.incident-report.json'
};

export async function callAgentTool(name, args = {}) {
  if (name === 'lkb_investigate') return investigatePayload(args);
  if (name === 'lkb_authority_receipt') return buildAuthorityReceipt(args.report, { source: 'LKB_AGENT_TOOL' });
  if (name === 'lkb_network_normalization') return verifyNetworkNormalization(args.network ?? 'shannon');
  if (name === 'lkb_convert_units') {
    const profile = getNetworkProfile(args.network);
    const decimals = profile.collateral.expectedDecimals;
    if ((args.human == null) === (args.raw == null)) throw new Error('Provide exactly one of human or raw');
    return args.human != null
      ? { network: profile.key, symbol: profile.collateral.symbol, decimals, human: String(args.human), raw: parseHumanUnits(args.human, decimals) }
      : { network: profile.key, symbol: profile.collateral.symbol, decimals, raw: String(args.raw), human: formatRawUnits(args.raw, decimals) };
  }
  if (name === 'lkb_reproduce_case') {
    const output = CASE_OUTPUTS[args.caseId];
    if (!output) throw new Error('Unsupported caseId');
    return {
      caseId: args.caseId,
      command: 'npm run replay',
      output,
      verification: 'Run npm test after replay; generated reports must remain byte-clean and deterministic.',
      writesAttempted: false
    };
  }
  throw new Error(`Unknown tool: ${name}`);
}
