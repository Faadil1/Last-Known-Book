# Hidden Spots Reinforcement — HS-002

Date: 2026-09-10  
Owner: Project Finisher / Winning Intelligence  
Scope: product differentiation and integration reinforcement without reopening the core incident-response thesis.

## Goal

Turn Last Known Book from a strong judge-facing investigation surface into an agent-native incident-response layer that can be called, replayed, integrated and audited by other systems while preserving the core safety rule:

> **The trading agent may be AI. The layer that decides whether money moves is not.**

## Implemented hidden spots

### HS-9 — Bring Your Own Incident

A live read-only intake surface accepts:

- transaction hash;
- marketId;
- agent intent;
- or a complete supported `caseData` packet.

Minimal inputs deliberately return `EVIDENCE_REQUIRED` and `RETRY_READ`; they do not fabricate a root cause. Complete supported packets can be reconstructed through the existing deterministic engine.

Public surface: `POST /api/investigate` plus the web UI section **Bring your own incident**.

### HS-10 — Machine-readable Authority Receipt

Every agent-native investigation can emit `LKB-AUTHORITY-RECEIPT-v0.1` containing:

- case id;
- report hash;
- root cause;
- recommended action;
- `writeAuthorized` boolean;
- bounded reason;
- OBSERVED / INFERRED / UNKNOWN counts;
- receipt hash;
- explicit authority-boundary marker.

The receipt is deterministic and suitable for logs, operators or downstream agents.

### HS-11 — Agent-native MCP surface

`scripts/lkb-mcp.mjs` exposes read-only MCP tools:

- `investigate_incident`;
- `evaluate_authority`;
- `get_safe_action`.

No wallet connection, signing method or broadcast method is present in this surface.

Run locally with:

```bash
npm run mcp
```

### HS-12 — Machine-readable CLI

```bash
npm run investigate -- incident.json
```

returns a JSON investigation result and authority receipt suitable for an agent workflow or CI pipeline.

### HS-13 — Generic operational webhook intake

`POST /api/incident-webhook` accepts an incident envelope from an external agent or workflow and returns an accepted bounded authority receipt.

The public demo performs **no outbound callback**. This avoids turning a demo endpoint into an SSRF / notification relay while still proving an operational integration contract.

### HS-14 — Slack / Discord notification adapters

The agent-native core produces bounded Slack and Discord payloads from the authority receipt.

These are response payloads only in the public demo. No external notification is sent without a separately configured operator-owned webhook.

### HS-15 — Read-only DreamDEX event watcher

`scripts/watch-dreamdex.mjs` is a generic JSON-RPC `eth_getLogs` watcher for a supplied DreamDEX contract address and event topic set.

It emits `LKB-LIVE-EVENT-INTAKE-v0.1` envelopes and never signs or broadcasts transactions.

This gives Last Known Book a truthful path from live venue events to incident reconstruction without claiming full autonomous root-cause classification from raw logs alone.

### HS-16 — Dynamic collateral-decimals guard

`scripts/read-token-decimals.mjs` calls ERC-20 `decimals()` through read-only JSON-RPC rather than assuming a Shannon/mainnet scale.

`normalizeTokenAmount(raw, decimals)` is tested with both 6-decimal and 18-decimal values.

### HS-17 — Reproduce this investigation

The case workspace now has a **Reproduce** action that copies the deterministic replay command for the selected LKB case.

This turns reproducibility from documentation into an evaluator-visible interaction.

## Deliberately not auto-applied

### Repository license

A license grants legal reuse rights and is therefore a human policy choice. HS-002 does not select MIT, Apache-2.0 or another license automatically.

### Sponsor/upstream issue publication

The draft already exists in `docs/UPSTREAM-FEEDBACK-DRAFT.md`, but publication into a third-party sponsor repository requires the appropriate authorized GitHub identity. HS-002 does not falsely claim publication.

### Automatic money movement

No hidden spot adds:

- browser wallet connection;
- private key handling;
- automatic compensating trades;
- mainnet writes;
- model-authorized spending.

## Why this improves the final product

The product now has a coherent integration story:

```text
DreamDEX event / agent incident
          ↓
read-only intake
          ↓
Last Known Book reconstruction
          ↓
OBSERVED / INFERRED / UNKNOWN
          ↓
Authority Receipt
          ↓
operator · MCP agent · CLI · webhook · notification adapter
```

The core differentiation remains evidence-bounded incident response, not another trading bot or analytics dashboard.
