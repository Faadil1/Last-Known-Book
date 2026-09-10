# Agent Integration — Hidden Spots HS-002

Date: 2026-09-10  
Scope: bounded reinforcement after the core product and visual direction were already established.

## Why this exists

The original product proved that Last Known Book could reconstruct captured DreamDEX incidents and safely gate corrective authority. The remaining product-level question was adoption: **how does another agent or operational system actually hand an incident to Last Known Book and consume the result?**

HS-002 closes that gap without adding automated trading authority.

## Integration architecture

```text
agent runtime / incident router / webhook / CLI
                     |
                     v
              Last Known Book
           read-only incident intake
                     |
                     v
       OBSERVED / INFERRED / UNKNOWN
                     |
                     v
          root cause + safe action
                     |
                     v
             Authority Receipt
                     |
             +-------+-------+
             |               |
             v               v
         operator       upstream agent
          review          continues safely
```

## 1. Bring Your Own Incident

`POST /api/investigate`

Two intake modes are supported:

1. **Canonical/captured case** — send `caseData`; the deterministic DreamDEX engine produces the rich incident report used by the existing casefiles.
2. **Live transaction intake** — send `txHash`, optional `marketId`, `agentIntent`, and network. Last Known Book performs read-only RPC verification and refuses to invent venue semantics that are not established by a bare receipt.

A bare transaction intake therefore normally returns `ESCALATE` or `RETRY_READ`, never a fabricated root cause.

## 2. Generic incident webhook

`POST /api/incidents`

This is intentionally provider-neutral. Slack, Discord, workflow engines, bots and custom runtimes can all route through the same contract without introducing provider credentials into the hackathon candidate.

Provider-specific notification adapters are not required for the winning mechanism and are deliberately kept downstream of this generic seam.

## 3. Machine-readable Authority Receipt

Every investigation result can include `LKB-AUTHORITY-RECEIPT-v0.1`:

- incident/report hash;
- recommended action;
- `writeAuthorized`;
- `canMoveFunds`;
- observed / inferred / unknown counts;
- blocking unknowns;
- explicit `executionPerformed:false`.

The receipt makes the safety boundary consumable by another machine without weakening it.

## 4. Agent tool surface

Last Known Book now exposes the same core tool contract through:

- `/api/mcp` for remote tool discovery/calls;
- `npm run mcp` for local stdio clients;
- `npm run lkb -- ...` for shell/CI workflows;
- repository `SKILL.md` for LLM-readable operating instructions.

The implementation is intentionally bounded to investigation/read tools. The protected write runner is not exposed through MCP, HTTP, CLI or the browser.

## 5. Read-only live ingestion seam

`scripts/watch-shannon-readonly.mjs` polls Shannon with `eth_blockNumber` + `eth_getLogs` for a configured contract address/topic and emits raw `LKB-RAW-LIVE-EVENT-v0.1` records.

Raw logs are queued as investigation candidates. They are not automatically upgraded to a DreamDEX semantic claim until a deterministic decoder establishes the meaning.

## 6. Cross-network normalization guard

DreamDEX Event Contracts use different collateral precision across venues:

- Shannon tUSDC: 6 decimals;
- Somnia mainnet USDso: 18 decimals.

`/api/network-check` reads both chain identity and ERC-20 `decimals()` with `eth_call`. `src/network-normalization.mjs` also provides exact string-based raw/human conversion helpers.

This closes a subtle testnet-to-mainnet failure mode without performing a mainnet transaction.

## 7. Reproducibility surface

The `lkb_reproduce_case` agent tool returns the deterministic reproduction path for LKB-001 through LKB-004. Existing `npm run replay` + `npm test` remain the source-of-truth path.

## Explicit non-actions

- no automatic compensating trade;
- no browser wallet connection;
- no MCP/private-key integration;
- no provider-specific secret required;
- no mainnet transaction;
- no new Packet 003 identifier publication;
- no claim that a tx-only intake has decoded DreamDEX semantics when it has not;
- no claim of production reliability, ROI or MTTR improvement.

## Deferred by design

### Slack / Discord-specific adapters
The generic inbound incident contract is stronger architecture for the hackathon candidate. Provider adapters can be added later without changing the core.

### Repository license
A license changes downstream legal reuse rights. It remains a human policy choice and is not inferred from a general product-polish authorization.

### Protected write automation
Not exposed. A machine-readable `writeAuthorized:true` receipt is still not a transaction. Any real write remains on the separately gated human-controlled execution path.
