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

The demo target is a real Shannon incident whose naive interpretation is corrected by venue-native evidence, then closed with a reproducible incident receipt.

## Canonical upstream state

- PBPD PRD/state: `Faadil1/pbpd-cowork-system/projects/dreamdex-execution-incident-response/`
- HOI decision/evidence: `Faadil1/hackathon-opportunity-intelligence/decisions/event-contracts-2026/`
- TRACE design contract: `Faadil1/trace-design-workflow/state/projects/dreamdex-execution-incident-response/`

Current lifecycle: `PBPD_PRD_READY__CONSEQUENTIAL_BUILD_VERTICAL_SLICE`.
