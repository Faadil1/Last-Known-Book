# Last Known Book

**Reconstruct the market your agent actually traded.**

Last Known Book is a post-execution incident-response system for autonomous agents trading DreamDEX Event Contracts on Somnia.

When an agent gets an unexpected execution, Last Known Book reconstructs **Agent Intent vs Venue Reality**, applies DreamDEX-native semantic decoders, separates **OBSERVED / INFERRED / UNKNOWN**, and closes the incident through an authority-aware action or explicit no-action followed by reconciliation.

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
- inference alone cannot authorize a write; deterministic predicates **and** explicit human confirmation are required.

## Truth boundary

Still **not** claimed:

- production readiness or production reliability;
- MTTR / MTTRC improvement versus a measured manual baseline;
- ROI, financial-impact distribution or incident prevalence;
- fraud/manipulation detection without direct evidence;
- that captured third-party replay transactions were originated by Last Known Book.

The real Shannon micro-proof is **technical + behavior + operational-containment evidence**, not production evidence or business-outcome proof.

## Current DreamDEX build assumptions

Rechecked for the Shannon proof against the current Event Contracts surface: `@somnia-chain/markets-sdk` **0.28.0+** is required for current tick handling; the proof runner pins `0.29.0`. Shannon is chain **50312**; testnet collateral is **tUSDC with 6 decimals**; `marketId` is the durable incident identity and pools may be recycled.

See:
- `docs/SDK-SNAPSHOT.md`
- `docs/SDK-FEEDBACK.md`
- `docs/REQUIREMENTS-EVIDENCE-MATRIX.md`
- `evidence/REALITY-SOURCES.md`

## Canonical state

Start with `state/HANDOVER.yaml`.

Upstream:
- PBPD PRD/state: `Faadil1/pbpd-cowork-system/projects/dreamdex-execution-incident-response/`
- HOI decision/evidence: `Faadil1/hackathon-opportunity-intelligence/decisions/event-contracts-2026/`
- TRACE design contract: `Faadil1/trace-design-workflow/state/projects/dreamdex-execution-incident-response/`

Lifecycle promotion is evidence-gated. `BUILD_CANDIDATE_READY` is emitted only after the requirements-to-evidence matrix is green; terminal submission readiness belongs to Project Finisher and remains separate from protected submission.