# Last Known Book

**Reconstruct the market your agent actually traded.**

Last Known Book is a post-execution incident-response system for autonomous agents trading DreamDEX Event Contracts on Somnia.

When an agent gets an unexpected execution, Last Known Book reconstructs **Agent Intent vs Venue Reality**, applies DreamDEX-native semantic decoders, separates **OBSERVED / INFERRED / UNKNOWN**, and closes the incident through an authority-aware action or explicit no-action followed by reconciliation.

> **The trading agent may be AI. The layer that decides whether money moves is not.**
>
> AI can interpret. Evidence can constrain. Deterministic predicates + explicit human authority decide the write.

## Judge Fast Lane — 60 seconds

1. Open the live judge surface and select **LKB-001**.
2. Read one causal slice: `AGENT INTENT ≠ VENUE REALITY → MINT_A_PAIR + CHAIN_INDEXER_DIVERGENCE → RETRY_READ → WRITE REFUSED`.
3. Land the memory hook: **This wasn't a whale. It was a mint.**
4. Read the **REAL SHANNON PROOF** card: chain `50312` → PostOnly → `0 fills` → `OrderPlaced → OrderRested → OrderCancelled` → `tUSDC 1 raw → 1 raw`.
5. Use the **LIVE SHANNON READBACK** panel to verify the network head and a public captured transaction without signing or connecting a wallet.
6. Open `/agent.html` to see how another agent can hand an incident to Last Known Book and consume a machine-readable Authority Receipt.
7. Inspect `docs/SDK-FEEDBACK.md`, `docs/DEMO-SCRIPT.md` and CI if deeper technical validation is needed.

Judge code candidate: `6ee02917aa92951dc1222282367ef7599095bffa`  
Winning Intelligence CI: `34361037435` — PASS (engine tests + proof/redaction tests + deterministic replay cleanliness).

## Why now: rolling markets make stale state dangerous

DreamDEX Event Contracts are rolling windows: a market expires, a successor opens, and pools may be recycled. The current DreamDEX developer documentation therefore recommends treating `marketId` as the durable identity, re-reading current on-chain lifecycle before writes, and never hardcoding a per-window pool.

That is exactly the incident boundary Last Known Book protects:

`marketId changes → market-specific state must be treated as stale → reconstruct before any corrective write`

As agent loops become faster and more autonomous, an execution-assurance layer becomes more important because a stale order, pool binding, indexed lifecycle or misunderstood fill path can turn one unexpected execution into a second transaction.

## Product contract

- Post-execution assurance, not a prediction agent or generic analytics dashboard.
- DreamDEX-native semantics are load-bearing: `marketId`, on-chain lifecycle, escrow, fill paths, `MINT_A_PAIR`, settlement and exact-market recovery.
- Chain truth outranks lagging indexed state for writes and final reconciliation.
- Inference alone never authorizes spend.
- A truthful `NO_ACTION`, `RETRY_READ`, or `ESCALATE` is preferable to an unsafe corrective transaction.
- No Matchday Pulse source code is reused; this repository is implemented from scratch.

## Hero line

> **This wasn't a whale. It was a mint.**

The deterministic casefile engine now covers four captured real Shannon incident classes: `MINT_A_PAIR` + indexer lag, resting SELL escrow, expected-vs-actual fill, and exact-market residual settlement. Captured cases remain explicitly labeled as replay evidence from public sources.

Separately, Last Known Book has now originated one bounded **real Shannon testnet proof** of its authority and reconciliation path: an exact-market PostOnly order rested with zero fills, the exact returned order was cancelled, native order events were reconciled, and tUSDC collateral returned exactly to its pre-placement balance. The public repo keeps wallet and transaction identifiers redacted; the complete receipt bundle is preserved in private PBPD canon.

## Where Last Known Book sits

```text
autonomous DreamDEX agent
        ↓
DreamDEX execution
        ↓
unexpected result / ambiguous venue state
        ↓
┌───────────────────────────────┐
│        LAST KNOWN BOOK        │
│ Intent vs Venue Reality       │
│ DreamDEX semantic decoders    │
│ OBSERVED / INFERRED / UNKNOWN │
│ deterministic authority gate  │
└───────────────────────────────┘
        ↓
NO_ACTION / RETRY_READ / ESCALATE / bounded exact action
        ↓
reconciled incident receipt + operator-visible closure
```

This is intentionally not another alpha engine. It is the assurance layer between **an agent that already acted** and **the decision about what happens next**.

## Agent-native integration — HS-002

Last Known Book is no longer only a human-facing investigation surface. The same bounded mechanism can now be consumed by an upstream agent or incident router:

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

- `POST /api/investigate` — Bring Your Own Incident. Accepts a canonical/captured case or a live `txHash` intake.
- `POST /api/incidents` — provider-neutral inbound operational webhook.
- `POST /api/mcp` — bounded agent tool discovery/calls; no protected write tool.
- `npm run mcp` — local stdio agent adapter.
- `npm run lkb -- ...` — JSON-first CLI for incident intake and network checks.
- `SKILL.md` — LLM-readable operating reference.
- `/agent.html` — judge-facing explanation of the agent integration contract.

A transaction-only intake deliberately does **not** invent DreamDEX-native semantics from a bare receipt. If the cause cannot be deterministically established, Last Known Book returns `UNKNOWN` plus `RETRY_READ` or `ESCALATE`, with `writeAuthorized:false`.

### Authority Receipt

`LKB-AUTHORITY-RECEIPT-v0.1` turns the safety boundary into a machine-readable artifact: report hash, recommended action, `writeAuthorized`, observed/inferred/unknown counts, blocking unknowns and explicit `executionPerformed:false`.

A receipt can be consumed by another agent. It still cannot move money by itself.

### Cross-network normalization

`GET /api/network-check?network=shannon` and `?network=mainnet` read chain identity and ERC-20 `decimals()` using read-only RPC. This protects the 6-decimal Shannon tUSDC vs 18-decimal mainnet USDso boundary without performing a mainnet transaction.

### Live event ingestion seam

`scripts/watch-shannon-readonly.mjs` uses only `eth_chainId`, `eth_blockNumber` and `eth_getLogs` for a configured address/topic. Raw logs are emitted as intake candidates; they are not automatically promoted to semantic claims.

See `docs/AGENT-INTEGRATION.md` for the complete contract and explicit non-actions.

## Production adoption path — without pretending the prototype is production

The credible next path is incremental:

1. ingest execution incidents continuously from an autonomous trading agent;
2. persist immutable incident receipts keyed by durable market identity;
3. measure a real operator baseline for mean time to root cause and containment;
4. expand the live incident corpus while preserving replay-vs-originated-proof labels;
5. harden identity, privacy, deployment and action-policy controls;
6. only then evaluate production write authority and measured business outcomes.

The prototype does **not** claim those later steps are already complete.

## Run the proof locally

Requires Node 20+.

```bash
npm test
npm run replay
npm run serve
```

Then open `http://localhost:4173`.

Optional Shannon read smoke:

```bash
npm run live:read
```

Agent-native read-only surfaces:

```bash
npm run lkb -- investigate data/cases/mint-pair-indexer-lag.json
npm run lkb -- network-check shannon
npm run lkb -- network-check mainnet
npm run mcp
```

The judge-facing live panel is read-only. It never requests a wallet, key or signature.

The protected Shannon write runners are intentionally not a one-command demo. They fail closed on chain, market, pool, lifecycle, book parameters, gas, collateral, allowance, cutoff and exact human-confirmation predicates.

## What is proven in v0.2

- deterministic DreamDEX semantic decoders;
- `MINT_A_PAIR` accounting correction;
- chain-success/indexer-unavailable → `RETRY_READ`, never blind resubmit;
- resting SELL escrow → `NO_ACTION` when state is already explained;
- exact-market residual settlement classification, including zero-value losing residuals and already-redeemed positions;
- `OBSERVED / INFERRED / UNKNOWN` claim boundary;
- stable machine-readable incident-report hashes and deterministic replay;
- judge-facing `Intent ≠ Venue Reality` casefile UI;
- rendered 1280×720 causal-slice and reduced-motion assurance;
- **real Last Known Book-originated Shannon behavior proof**: PostOnly placement → `OrderPlaced` / `OrderRested` → exact-order cancel → `OrderCancelled` → tUSDC restored exactly;
- inference alone cannot authorize a write; deterministic predicates **and** explicit human confirmation are required;
- agent-native read-only intake + machine-readable Authority Receipt;
- cross-network collateral normalization guard that verifies `decimals()` instead of assuming testnet scale.

## Truth boundary

Still **not** claimed:

- production readiness or production reliability;
- MTTR / MTTRC improvement versus a measured manual baseline;
- ROI, financial-impact distribution or incident prevalence;
- fraud/manipulation detection without direct evidence;
- that captured third-party replay transactions were originated by Last Known Book;
- that a bare tx receipt alone proves a DreamDEX root cause;
- that an Authority Receipt executes or bypasses the protected write path.

The real Shannon micro-proof is **technical + behavior + operational-containment evidence**, not production evidence or business-outcome proof.

## Current DreamDEX build assumptions

Rechecked for the Shannon proof against the current Event Contracts surface: `@somnia-chain/markets-sdk` **0.28.0+** is required for current tick handling; the proof runner pins `0.29.0`. Shannon is chain **50312**; testnet collateral is **tUSDC with 6 decimals**; `marketId` is the durable incident identity and pools may be recycled.

See:
- `docs/SDK-SNAPSHOT.md`
- `docs/SDK-FEEDBACK.md`
- `docs/UPSTREAM-FEEDBACK-DRAFT.md`
- `docs/AGENT-INTEGRATION.md`
- `SKILL.md`
- `docs/DEMO-SCRIPT.md`
- `docs/SUBMISSION-PACKAGE.md`
- `docs/REQUIREMENTS-EVIDENCE-MATRIX.md`
- `evidence/REALITY-SOURCES.md`
- `evidence/SHANNON-PROOF-003-COMMITMENT.json`

## Canonical state

Start with `state/HANDOVER.yaml`.

Upstream:
- PBPD PRD/state: `Faadil1/pbpd-cowork-system/projects/dreamdex-execution-incident-response/`
- HOI decision/evidence: `Faadil1/hackathon-opportunity-intelligence/decisions/event-contracts-2026/`
- TRACE design contract: `Faadil1/trace-design-workflow/state/projects/dreamdex-execution-incident-response/`

Lifecycle promotion is evidence-gated. `BUILD_CANDIDATE_READY` is emitted only after the requirements-to-evidence matrix is green; terminal submission readiness belongs to Project Finisher and remains separate from protected submission.
