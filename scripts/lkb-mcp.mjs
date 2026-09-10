import readline from 'node:readline';
import { ingestIncident, buildAuthorityReceipt } from '../src/agent-native.mjs';

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

const tools = [
  {
    name: 'investigate_incident',
    description: 'Reconstruct a supplied Last Known Book incident packet or accept a bounded txHash/marketId intake. Read-only.',
    inputSchema: { type: 'object', additionalProperties: true }
  },
  {
    name: 'evaluate_authority',
    description: 'Return a machine-readable authority receipt from a completed incident report. Never authorizes from model inference alone.',
    inputSchema: { type: 'object', properties: { report: { type: 'object' } }, required: ['report'] }
  },
  {
    name: 'get_safe_action',
    description: 'Return the safe next action and write authorization state for a supplied incident payload.',
    inputSchema: { type: 'object', additionalProperties: true }
  }
];

function ok(id, result) { return { jsonrpc: '2.0', id, result }; }
function err(id, code, message) { return { jsonrpc: '2.0', id, error: { code, message } }; }
function textContent(value) { return [{ type: 'text', text: JSON.stringify(value, null, 2) }]; }

async function handle(message) {
  const { id, method, params } = message;
  if (method === 'initialize') {
    return ok(id, {
      protocolVersion: params?.protocolVersion ?? '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'last-known-book', version: '0.1.0' }
    });
  }
  if (method === 'notifications/initialized') return null;
  if (method === 'tools/list') return ok(id, { tools });
  if (method === 'tools/call') {
    try {
      const name = params?.name;
      const args = params?.arguments ?? {};
      if (name === 'investigate_incident') {
        const result = ingestIncident(args);
        return ok(id, { content: textContent(result), structuredContent: result });
      }
      if (name === 'evaluate_authority') {
        const result = buildAuthorityReceipt(args.report, 'MCP_EVALUATE_AUTHORITY');
        return ok(id, { content: textContent(result), structuredContent: result });
      }
      if (name === 'get_safe_action') {
        const result = ingestIncident(args);
        const safe = {
          caseId: result.report.caseId,
          action: result.authorityReceipt.recommendedAction,
          writeAuthorized: result.authorityReceipt.writeAuthorized,
          reason: result.authorityReceipt.reason,
          receiptHash: result.authorityReceipt.receiptHash
        };
        return ok(id, { content: textContent(safe), structuredContent: safe });
      }
      return err(id, -32602, `Unknown tool: ${name}`);
    } catch (error) {
      return ok(id, { isError: true, content: [{ type: 'text', text: error.message }] });
    }
  }
  if (id === undefined) return null;
  return err(id, -32601, `Method not found: ${method}`);
}

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const response = await handle(JSON.parse(line));
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch (error) {
    process.stdout.write(`${JSON.stringify(err(null, -32700, error.message))}\n`);
  }
});
