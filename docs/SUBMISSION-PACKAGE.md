# Last Known Book — DoraHacks Submission Package

Status: **DRAFT FOR PROJECT FINISHER / HUMAN FINAL GATE**  
Event: Somnia × DreamDEX Event Contracts Hackathon  
Extended submission date: **2026-09-11**; exact cutoff clock/timezone must be re-read from DoraHacks before final submit.

## Canonical identity

**Title**  
Last Known Book

**Tagline**  
Reconstruct the market your agent actually traded.

**Category identity**  
Post-execution incident assurance for autonomous agents using DreamDEX Event Contracts on Somnia.

**24-hour memory sentence**  
The one that reconstructs what the agent actually traded — and proves why it looked wrong.

**Hero hook**  
This wasn't a whale. It was a mint.

## Short description

Last Known Book reconstructs unexpected DreamDEX Event Contract executions as **Agent Intent vs Venue Reality**, applies venue-native causal semantics, separates `OBSERVED / INFERRED / UNKNOWN`, and authorizes only bounded evidence-backed containment. It includes deterministic Shannon incident replays plus a separate Last Known Book-originated real Shannon PostOnly rest-and-exact-cancel proof.

## Suggested DoraHacks project description

Autonomous trading agents can make a reasonable decision and still encounter an execution that looks wrong after DreamDEX venue semantics, lifecycle state, escrow behavior or indexed visibility enter the picture.

**Last Known Book** is a post-execution incident-response system for DreamDEX Event Contracts on Somnia. It reconstructs the exact incident as **Agent Intent ≠ Venue Reality**, then applies DreamDEX-native semantic decoders — including `MINT_A_PAIR`, chain/indexer divergence, resting SELL escrow, expected-vs-actual fills and exact-market settlement — to determine what actually happened.

Every material claim is labeled `OBSERVED`, `INFERRED` or `UNKNOWN`. Inference alone never authorizes spend. The system prefers `NO_ACTION`, `RETRY_READ` or `ESCALATE` when evidence does not justify a corrective write, and it reconciles the final state after any bounded action.

The build includes deterministic replay evidence from real Shannon incident classes and a separate **Last Known Book-originated real Shannon testnet proof**. For that proof, the system revalidated chain 50312, the exact market/pool/lifecycle and order-book parameters, placed a bounded PostOnly order, observed zero fills plus `OrderPlaced → OrderRested`, cancelled exactly the returned order, observed `OrderCancelled`, and reconciled tUSDC collateral exactly from `1 raw → 1 raw`.

DreamDEX is load-bearing to the product: `marketId`, rolling pool binding, Event Contract lifecycle, `MINT_A_PAIR`, escrow semantics and native order events form the causal vocabulary and evidence path. The integration also produced concrete SDK/docs feedback around market identity, write gating, bounded approvals, unit arithmetic and PostOnly reconciliation.

**Evidence boundary:** this is real Shannon technical + behavior + operational-containment proof. We do not claim production reliability, ROI, MTTR improvement, incident prevalence or fraud/manipulation detection from this prototype.

## Judge-facing differentiator

**Most Event Contract tools help an agent predict, price, trade or test before execution. Last Known Book begins after the execution and reconstructs the exact DreamDEX venue reality, separates facts from inference, and contains the incident only when grounded authority permits it.**

## Why Somnia / DreamDEX is necessary

Removing DreamDEX Event Contract semantics would collapse the current mechanism. The product depends on:

- durable `marketId` identity rather than cached/recycled pool identity;
- current on-chain lifecycle for write safety;
- `MINT_A_PAIR` and venue-specific fill semantics;
- resting-order escrow behavior;
- exact-market settlement/residual semantics;
- native `OrderPlaced`, `OrderRested` and `OrderCancelled` events;
- Shannon testnet execution/reconciliation for authentic behavior proof.

## Demo video

Canonical script: `docs/DEMO-SCRIPT.md`  
Target: **2:35**  
Requirement: final encoded video must be **2–3 minutes** and pass TRACE encoded-video review.

Video URL: **PENDING**

## GitHub

Public repository: `https://github.com/Faadil1/Last-Known-Book`

## Live demo

Stable anonymous judge URL: **PENDING HUMAN-AUTHORIZED DEPLOYMENT + TERMINAL READBACK**

Existing TRACE preview is evidence of rendered design only and must not be used as the final judge URL until anonymous/stable accessibility is verified.

## Real Shannon proof surface

Public judge-safe proof should expose only the bounded facts already represented in the UI:

- Shannon chain `50312`;
- exact market/pool/lifecycle/order-param pre-write gate;
- PostOnly placement receipt success;
- `0 fills`;
- `OrderPlaced → OrderRested`;
- exact returned order cancelled;
- cancel receipt success + `OrderCancelled`;
- collateral `1 raw tUSDC → 1 raw tUSDC`;
- classification: technical + behavior + operational containment;
- `PRODUCTION_EVIDENCE = ABSENT`.

Do **not** publish the disposable wallet, private key, seed phrase or full private receipt bundle without a separate explicit human publication decision.

## SDK / docs feedback

Artifact: `docs/SDK-FEEDBACK.md`

High-value findings:

- make `marketId`, not pool, the durable incident identity;
- centralize the recommended chain-authoritative write-safety recipe;
- document `autoApprove` consequences and bounded approval alternatives;
- show raw-unit and human-unit arithmetic together;
- explain PostOnly success as an event/state sequence;
- document clean SDK transport shutdown/testing lifecycle;
- separate testnet funding/setup authority from trade authority.

## Thumbnail / cover brief

**Do not use:** generic dark crypto terminal, candlestick chart, neon blockchain globe, AI robot, KPI grid.

**Preferred composition:**

- warm off-white casefile background consistent with product;
- dominant text: `LAST KNOWN BOOK`;
- central tension: `AGENT INTENT ≠ VENUE REALITY`;
- one venue-native reveal: `MINT_A_PAIR`;
- one consequence stamp: `WRITE REFUSED`;
- small Somnia Shannon / DreamDEX Event Contracts context;
- no transaction/wallet identifiers.

The cover should look like an execution incident file, not a trading dashboard.

## Q&A defense

### Isn't this just analytics?
No. Analytics describes the market. Last Known Book reconstructs one unexpected execution, determines what DreamDEX-native cause explains it, decides whether a corrective action is justified, and reconciles closure.

### Why not just inspect a block explorer?
An explorer shows transactions. It does not reconstruct **Agent Intent vs Venue Reality**, classify DreamDEX-specific cause, separate truth classes, apply authority policy and close the incident as one contract.

### Why not prevent the issue before trading?
Pre-trade checks cannot explain what actually occurred after a venue-specific execution path, indexer lag, resting escrow or settlement residual has already happened.

### Why does this require DreamDEX?
The mechanism depends on DreamDEX Event Contract semantics: `marketId`, rolling pool binding, `MINT_A_PAIR`, escrow, lifecycle and native order events.

### What is real versus replayed?
The product includes captured real-Shannon incident replays. Separately, Packet 003 is a Last Known Book-originated real Shannon testnet placement/rest/exact-cancel/reconciliation proof.

### Did the real order execute against another trader?
No. It was deliberately PostOnly, rested with zero fills, then exactly cancelled. The proof demonstrates bounded authority and reconciliation, not profitable execution.

### Is WRITE REFUSED a failure?
No. A truthful refusal is correct behavior when the evidence does not justify a write. The system optimizes safe containment, not transaction count.

### Why not auto-approve or automatically compensate?
Inference never authorizes spend. The real proof used an exact bounded allowance and explicit human authorization. An automatic compensating trade can turn one confusing incident into two.

### What business impact is proven?
Operational containment is demonstrated on Shannon testnet. MTTR improvement, ROI, incident prevalence and production reliability are not yet proven and are not claimed.

### What would you build next?
A production incident-ingestion path, a measured operator baseline for MTTRC, a broader live incident corpus, and hardened deployment/privacy controls while preserving the same evidence and authority boundary.

## Packaging consistency check

All final surfaces must preserve:

`SAME OPERATOR → SAME UNEXPECTED EXECUTION PAIN → SAME INTENT/REALITY DIFFERENTIATOR → SAME DREAMDEX-NATIVE CAUSAL REVEAL → SAME AUTHORITY BOUNDARY → SAME RECONCILED PROOF`

Required aligned surfaces:

- DoraHacks title and description;
- thumbnail;
- README;
- live demo;
- final video;
- Q&A;
- SDK/docs feedback.

## Protected final gate

This document is a draft package, **not a submission authorization**.

Before final submit:

1. verify stable live URL;
2. attach final encoded 2–3 minute video;
3. pass TRACE encoded-video assurance;
4. rerun Winning Intelligence final check;
5. obtain Project Finisher `SUBMISSION_READY`;
6. re-read exact DoraHacks Sep 11 cutoff clock/timezone;
7. obtain explicit human authorization for the protected submission action.
