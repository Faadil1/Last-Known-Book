# Last Known Book — Agent Integration

Last Known Book can now be consumed by humans, CI pipelines and agent runtimes without granting model inference authority over funds.

## 1. HTTP incident intake

`POST /api/investigate`

Minimal example:

```json
{
  "txHash": "0x…64 hex chars…",
  "marketId": "0x…64 hex chars…",
  "intent": "Buy NO within the stated limit"
}
```

A minimal intake intentionally returns `EVIDENCE_REQUIRED`, `RETRY_READ` and `writeAuthorized: false` until fresh venue evidence is reconciled.

A complete supported fixture can be supplied under `caseData` to run through the deterministic engine.

## 2. Generic operational webhook

`POST /api/incident-webhook`

```json
{
  "source": "my-trading-agent",
  "incident": {
    "txHash": "0x…",
    "marketId": "0x…",
    "intent": "…"
  }
}
```

The public demo accepts the envelope and returns a bounded authority receipt. It does not relay arbitrary outbound callbacks.

## 3. Authority Receipt

Every result can emit:

```json
{
  "schema": "LKB-AUTHORITY-RECEIPT-v0.1",
  "caseId": "BYOI-…",
  "rootCause": "UNKNOWN",
  "recommendedAction": "RETRY_READ",
  "writeAuthorized": false,
  "reason": "Incident intake is read-only until fresh chain, market lifecycle and execution evidence are reconciled.",
  "authorityBoundary": "MODEL_INFERENCE_ALONE_CANNOT_AUTHORIZE_FUNDS",
  "receiptHash": "…"
}
```

The receipt is designed to be loggable and machine-consumable.

## 4. CLI

```bash
npm run investigate -- incident.json
```

Output is JSON only.

## 5. MCP

```bash
npm run mcp
```

Tools:

- `investigate_incident`
- `evaluate_authority`
- `get_safe_action`

All three tools are read-only with respect to blockchain state.

## 6. Live DreamDEX watcher

```bash
RPC_URL=<rpc> \
ORDERBOOK_ADDRESS=<contract> \
EVENT_TOPICS=<topic0,...> \
npm run watch:dreamdex
```

The watcher uses `eth_blockNumber` and `eth_getLogs`, then emits read-only event intake envelopes. It does not claim a root cause directly from an undecoded raw log.

## 7. Dynamic token decimals

```bash
RPC_URL=<rpc> TOKEN_ADDRESS=<erc20> npm run token:decimals
```

This calls ERC-20 `decimals()` over JSON-RPC so the integration does not assume Shannon and mainnet use the same collateral scale.

## 8. Notification adapters

The HTTP investigation endpoint returns Slack and Discord payload shapes derived only from the Authority Receipt. The public demo never sends them automatically.

## Security boundary

Agent-native does **not** mean agent-authorized money movement.

Last Known Book keeps these boundaries:

- no browser wallet request;
- no signing surface in MCP/HTTP/CLI;
- no broadcast method in agent-native code;
- no write from INFERRED or UNKNOWN evidence;
- production evidence remains absent unless explicitly proven later.
