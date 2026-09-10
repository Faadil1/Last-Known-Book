import { AGENT_TOOLS, callAgentTool } from '../src/agent-tools.mjs';

function jsonRpc(res, id, result) {
  return res.status(200).json({ jsonrpc: '2.0', id: id ?? null, result });
}

function jsonRpcError(res, id, code, message, data) {
  return res.status(200).json({ jsonrpc: '2.0', id: id ?? null, error: { code, message, ...(data ? { data } : {}) } });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, mcp-protocol-version, mcp-method, mcp-name');
  res.setHeader('X-LKB-Authority', 'READ_ONLY_AGENT_INTERFACE');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST_ONLY', writesAttempted: false });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return jsonRpcError(res, null, -32700, 'Parse error');
  }

  const id = body?.id ?? null;
  const method = body?.method ?? req.headers['mcp-method'];

  if (method === 'tools/list') {
    return jsonRpc(res, id, { tools: AGENT_TOOLS, _meta: { authority: 'READ_ONLY', writesAttempted: false } });
  }

  if (method === 'tools/call') {
    const name = body?.params?.name ?? req.headers['mcp-name'];
    const args = body?.params?.arguments ?? {};
    try {
      const result = await callAgentTool(name, args);
      return jsonRpc(res, id, {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
        isError: false,
        _meta: { authority: 'READ_ONLY', writesAttempted: false }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TOOL_CALL_FAILED';
      return jsonRpc(res, id, {
        content: [{ type: 'text', text: message }],
        isError: true,
        _meta: { authority: 'READ_ONLY', failClosed: true, writesAttempted: false }
      });
    }
  }

  // Legacy discovery path used by many stdio/HTTP clients. Modern 2026 clients
  // may call tools/list directly; no session state or write authority exists here.
  if (method === 'initialize') {
    return jsonRpc(res, id, {
      protocolVersion: body?.params?.protocolVersion ?? '2025-11-25',
      capabilities: { tools: {} },
      serverInfo: { name: 'last-known-book', version: '0.2.0' }
    });
  }

  if (method === 'ping') return jsonRpc(res, id, {});
  return jsonRpcError(res, id, -32601, `Method not found: ${method ?? 'undefined'}`);
}
