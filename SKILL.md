# Last Known Book — Agent Skill Reference

Use Last Known Book after an autonomous DreamDEX execution becomes confusing or requires containment.

## Core rule

**The trading agent may be AI. The layer that decides whether money moves is not.**

The interfaces in this repository are read-only by default. They may reconstruct evidence and return an Authority Receipt. They do not expose the protected blockchain write runner.

## HTTP

### Bring your own incident

`POST /api/investigate`

Live transaction intake:

```json
{
  "txHash": "0x...",
  "network": "shannon",
  "marketId": "0x...",
  "agentIntent": "BUY_NO 10 @ 0.42"
}
```

For richer deterministic reconstruction, pass a canonical/captured case object as `caseData`.

### Generic inbound webhook

`POST /api/incidents`

Same fail-closed investigation path as `/api/investigate`; intended for agent runtimes, workflow tools and incident routers.

### Network normalization

`GET /api/network-check?network=shannon`

Reads `eth_chainId` and ERC-20 `decimals()` only. The guard knows Shannon tUSDC expects 6 decimals and mainnet USDso expects 18, but verifies the observed value instead of trusting a cross-network constant.

## Agent MCP surface

Remote endpoint: `POST /api/mcp`

Supported core methods:

- `tools/list`
- `tools/call`
- legacy `initialize`
- `ping`

Tools:

- `lkb_investigate`
- `lkb_authority_receipt`
- `lkb_network_normalization`
- `lkb_convert_units`
- `lkb_reproduce_case`

This is a bounded tool surface; no claim is made that every optional MCP extension is implemented.

## Local stdio adapter

```bash
npm run mcp
```

The adapter reads newline-delimited JSON-RPC on stdin/stdout and supports the same Last Known Book tools.

## CLI

```bash
npm run lkb -- investigate data/cases/mint-pair-indexer-lag.json
npm run lkb -- tx 0x... shannon
npm run lkb -- network-check shannon
npm run lkb -- network-check mainnet
```

## Read-only Shannon watcher

```bash
LKB_WATCH_ADDRESS=0x... npm run watch:shannon -- --once
```

Optionally set `LKB_WATCH_TOPIC0` to restrict the read-only `eth_getLogs` filter to one event topic. Emitted records are raw intake candidates; Last Known Book does not invent DreamDEX semantics from an undecoded log.

## Reproduce canonical investigations

```bash
npm run replay
npm test
```

Generated reports live under `evidence/generated/`. Reproduction does not authorize or execute a fresh blockchain write.

## Truth contract

- `OBSERVED` — grounded in input/source evidence or deterministic arithmetic.
- `INFERRED` — interpretation supported by observed evidence; cannot independently authorize spend.
- `UNKNOWN` — evidence gap; may stop the system.
- Authority Receipt — machine-readable decision artifact. Receipt generation itself never executes the decision.
