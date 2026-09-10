#!/usr/bin/env node
import readline from 'node:readline';
import { AGENT_TOOLS, callAgentTool } from '../src/agent-tools.mjs';

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
const send = (message) => process.stdout.write(`${JSON.stringify(message)}\n`);
const result = (id, value) => send({ jsonrpc: '2.0', id, result: value });
const error = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });

for await (const line of rl) {
  if (!line.trim()) continue;
  let message;
  try { message = JSON.parse(line); }
  catch { error(null, -32700, 'Parse error'); continue; }

  const id = message.id ?? null;
  const method = message.method;
  if (method === 'notifications/initialized') continue;
  if (method === 'initialize') {
    result(id, {
      protocolVersion: message.params?.protocolVersion ?? '2025-11-25',
      capabilities: { tools: {} },
      serverInfo: { name: 'last-known-book', version: '0.2.0' }
    });
    continue;
  }
  if (method === 'tools/list') {
    result(id, { tools: AGENT_TOOLS });
    continue;
  }
  if (method === 'tools/call') {
    try {
      const value = await callAgentTool(message.params?.name, message.params?.arguments ?? {});
      result(id, {
        content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
        structuredContent: value,
        isError: false
      });
    } catch (err) {
      result(id, {
        content: [{ type: 'text', text: err instanceof Error ? err.message : 'Tool call failed' }],
        isError: true
      });
    }
    continue;
  }
  if (method === 'ping') { result(id, {}); continue; }
  error(id, -32601, `Method not found: ${method}`);
}
