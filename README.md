# Last Known Book

**Reconstruct the market your agent actually traded.**

Production: **https://last-known-book.pages.dev**

Last Known Book is post-execution incident response for autonomous agents trading DreamDEX Event Contracts on Somnia. When an execution looks wrong, it reconstructs **Agent Intent vs Venue Reality**, applies DreamDEX-native semantic decoders, separates **OBSERVED / INFERRED / UNKNOWN**, and returns a bounded next action plus a deterministic Authority Receipt.

> **The trading agent may be AI. The layer that decides whether money moves is not.**

Inference can explain or request more evidence. It cannot authorize spend by itself.

## Judge Fast Lane — 60 seconds

1. Open **https://last-known-book.pages.dev** and select **LKB-001**.
2. Follow `AGENT INTENT ≠ VENUE REALITY → MINT_A_PAIR + CHAIN_INDEXER_DIVERGENCE → RETRY_READ → WRITE REFUSED`.
3. Land the memory hook: **This wasn't a whale. It was a mint.**
4. Open **/proof.html** for the Last Known Book-originated Shannon proof: `50312 → PostOnly → 0 fills → OrderPlaced → OrderRested → exact cancel → OrderCancelled → tUSDC 1 raw → 1 raw`.
5. Read the **LIVE READ-ONLY WITNESSES**: current Shannon chain/head, a public captured LKB-003 receipt, DreamDEX BinaryMarketsModule bytecode and tUSDC `decimals()`.
6. Inspect the visual proof commitment. The raw JSON remains a machine-readable artifact but is not the judge-facing experience.
7. Open **/agent.html** to see Bring Your Own Incident + deterministic Authority Receipt through HTTP, webhook, MCP or CLI.

Canonical source: `main`. Current validation status is recorded in `state/CURRENT.yaml` and `state/HANDOVER.yaml` rather than hardcoded here so the README does not go stale after every final-assurance commit.

## The problem

An autonomous agent can submit a valid transaction while the operator still has the wrong explanation of what happened at the venue. Order intent, receipts, balances, the order book, lifecycle and indexed state can each be individually real while telling an incomplete story.

The risk is the second action: a blind retry, compensating trade or redeem can turn one confusing incident into two.

Last Known Book starts **after execution** and asks three questions:

1. What happened?
2. What do we actually know?
3. What is safe to do next?

## Why DreamDEX is load-bearing

This is not generic transaction analytics. The causal model depends on DreamDEX Event Contract semantics:

- durable `marketId` identity and rolling pool binding;
- current on-chain lifecycle;
- `MINT_A_PAIR` fill economics;
- resting SELL escrow;
- expected-vs-actual fill reconciliation;
- exact-market residual settlement;
- native `OrderPlaced`, `OrderRested` and `OrderCancelled` events.

Removing those semantics changes both the explanation and whether another action is justified.

## Four captured incident classes

- **LKB-001 — Mint + Indexer Lag:** chain success + `MINT_A_PAIR` while indexed verification lags → `RETRY_READ`, no resubmit.
- **LKB-002 — Resting Sell Escrow:** inventory is committed by the venue, not lost → `NO_ACTION`.
- **LKB-003 — Fill Dislocation:** actual execution differs from request but reconciles correctly → `NO_ACTION`.
- **LKB-004 — Settlement Residual:** exact-market lifecycle determines whether a residual is actionable → fail closed without fresh authority.

These are deterministic replays from captured Shannon evidence. They are not represented as Last Known Book-originated writes.

## Evidence stack

### 1. Product-originated real Shannon behavior proof

Packet 003 is a bounded Somnia Shannon testnet proof originated by Last Known Book:

- chain `50312`;
- exact market/pool/lifecycle/order parameters revalidated before the write;
- one PostOnly order;
- `0 fills`;
- `OrderPlaced → OrderRested`;
- exact returned order cancelled;
- `OrderCancelled`;
- tUSDC collateral reconciled exactly `1 raw → 1 raw`.

This proves technical behavior + operational containment. It does **not** prove production reliability, profitability, ROI or MTTR improvement.

### 2. Independent live read-only witnesses

The Proof Room verifies four separate facts against Shannon at runtime using read-only JSON-RPC:

- `eth_chainId` + `eth_blockNumber`;
- `eth_getTransactionReceipt` for the public captured LKB-003 transaction;
- `eth_getCode` for the DreamDEX BinaryMarketsModule;
- `eth_call` for tUSDC `decimals()`.

No wallet, signing or transaction broadcast method is used. If RPC verification is unavailable, the UI fails closed rather than showing a fabricated pass.

### 3. Tamper-evident proof commitment

`/proof.html#commitment` presents a visual receipt that binds the preserved private Packet 003 proof object to Git identities while keeping private wallet/transaction/order identifiers out of the public judge surface.

The underlying machine-readable artifact remains at `evidence/SHANNON-PROOF-003-COMMITMENT.json` for auditability only.

### 4. Deterministic replay + CI

The repository tests engine semantics, case coverage, proof/redaction boundaries, agent tools, UI contracts, mobile/reduced-motion requirements and the absence of protected write methods from public surfaces.

## Agent-native integration

```text
DreamDEX event / tx / captured case
              ↓
      Last Known Book intake
              ↓
 OBSERVED / INFERRED / UNKNOWN
              ↓
 root cause or fail-closed UNKNOWN
              ↓
          safe action
              ↓
 machine-readable Authority Receipt
```

Available surfaces:

- `POST /api/investigate` — Bring Your Own Incident;
- `POST /api/incidents` — provider-neutral inbound operational webhook;
- `POST /api/mcp` — bounded remote tool surface;
- `npm run mcp` — local stdio MCP adapter;
- `npm run lkb -- ...` — JSON-first CLI;
- `SKILL.md` — LLM-readable operating reference;
- `/agent.html` — judge-facing agent contract.

A bare transaction hash does not authorize Last Known Book to invent DreamDEX semantics. If the cause cannot be established deterministically, the system returns `UNKNOWN` with `RETRY_READ` or `ESCALATE` and `writeAuthorized:false`.

### Authority Receipt

`LKB-AUTHORITY-RECEIPT-v0.1` contains the report hash, recommended action, `writeAuthorized`, truth-class counts, blocking unknowns and `executionPerformed:false`.

Another agent can consume the receipt. The receipt still cannot move money by itself.

## Production adoption path

Basic incident intake, webhook, HTTP, MCP/CLI integration and Authority Receipts already exist. The credible next steps are:

1. persist immutable incident receipts keyed by durable market identity;
2. expand the live incident corpus;
3. measure a real operator baseline for time-to-root-cause and containment;
4. harden identity, privacy, deployment and action-policy controls;
5. extend deterministic DreamDEX semantic coverage;
6. only then evaluate production write authority and measured business outcomes.

## Run locally

Requires Node 20+.

```bash
npm test
npm run replay
npm run serve
```

Then open `http://localhost:4173`.

Optional read-only surfaces:

```bash
npm run live:read
npm run lkb -- investigate data/cases/mint-pair-indexer-lag.json
npm run lkb -- network-check shannon
npm run lkb -- network-check mainnet
npm run mcp
```

Protected Shannon write runners are intentionally not a one-command demo. Any additional blockchain write requires fresh exact human authorization and fails closed on chain, market, pool, lifecycle, book parameters, gas, collateral, allowance, cutoff and closure predicates.

## Truth boundary

Still **not** claimed:

- production readiness or reliability;
- MTTR / MTTRC improvement versus a measured baseline;
- ROI, profitability, incident prevalence or financial-impact distribution;
- fraud/manipulation detection without direct evidence;
- that captured replay transactions were originated by Last Known Book;
- that live read-only witnesses are additional product-originated trades;
- that a bare receipt proves a DreamDEX root cause;
- that an Authority Receipt executes or bypasses protected write authority.

## Key files

- `docs/DEMO-SCRIPT.md`
- `docs/HANDOFF-BENITA-DEMO-2026-09-10.md`
- `docs/SUBMISSION-PACKAGE.md`
- `docs/AGENT-INTEGRATION.md`
- `docs/SDK-FEEDBACK.md`
- `docs/REQUIREMENTS-EVIDENCE-MATRIX.md`
- `evidence/REALITY-SOURCES.md`
- `evidence/SHANNON-PROOF-003-COMMITMENT.json`
- `state/CURRENT.yaml`
- `state/HANDOVER.yaml`

## Canonical state

Start with `state/HANDOVER.yaml`.

Upstream canon:

- PBPD: `Faadil1/pbpd-cowork-system/projects/dreamdex-execution-incident-response/`
- Hackathon Opportunity Intelligence: `Faadil1/hackathon-opportunity-intelligence/decisions/event-contracts-2026/`
- TRACE: `Faadil1/trace-design-workflow/state/projects/dreamdex-execution-incident-response/`

Final submission remains protected and human-only.
