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

The first vertical slice uses three captured real Shannon incident classes. They are explicitly labeled replay evidence from public sources; Last Known Book does not claim it originated those transactions.

## Run the proof locally

Requires Node 20+ and no third-party runtime dependencies.

```bash
npm test
npm run replay
npm run serve
```

Then open `http://localhost:4173`.

Optional Shannon explorer smoke:

```bash
npm run live:read
```

## What is already proven in v0.1

- deterministic DreamDEX semantic decoders;
- `MINT_A_PAIR` accounting correction;
- chain-success/indexer-unavailable → `RETRY_READ`, never blind resubmit;
- resting SELL escrow → `NO_ACTION` when state is already explained;
- `OBSERVED / INFERRED / UNKNOWN` claim boundary;
- stable machine-readable incident-report hashes;
- judge-facing `Intent ≠ Venue Reality` casefile UI.

## What is not yet proven

- Last Known Book-originated live write/reconciliation;
- evaluator behavior proof;
- MTTRC improvement versus manual debugging;
- incident prevalence or production reliability.

## Current DreamDEX build assumptions

Rechecked 2026-09-08 against official docs: Event Contracts use `@somnia-chain/markets-sdk` **0.28.0+**; Shannon is chain **50312**; testnet collateral is **tUSDC with 6 decimals**; `marketId` is the durable incident identity and pools may be recycled.

See `docs/SDK-SNAPSHOT.md` and `evidence/REALITY-SOURCES.md`.

## Canonical state

Start with `state/HANDOVER.yaml`.

Upstream:
- PBPD PRD/state: `Faadil1/pbpd-cowork-system/projects/dreamdex-execution-incident-response/`
- HOI decision/evidence: `Faadil1/hackathon-opportunity-intelligence/decisions/event-contracts-2026/`
- TRACE design contract: `Faadil1/trace-design-workflow/state/projects/dreamdex-execution-incident-response/`

Current lifecycle: `PBPD_CONSEQUENTIAL_BUILD_VERTICAL_SLICE`.
