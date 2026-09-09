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

**Authority hook**  
The trading agent may be AI. The layer that decides whether money moves is not.

## Short description

Last Known Book reconstructs unexpected DreamDEX Event Contract executions as **Agent Intent vs Venue Reality**, applies venue-native causal semantics, separates `OBSERVED / INFERRED / UNKNOWN`, and authorizes only bounded evidence-backed containment. It includes deterministic Shannon incident replays plus a separate Last Known Book-originated real Shannon PostOnly rest-and-exact-cancel proof.

## Suggested DoraHacks project description

Autonomous trading agents can make a reasonable decision and still encounter an execution that looks wrong after DreamDEX venue semantics, lifecycle state, escrow behavior or indexed visibility enter the picture.

**Last Known Book** is a post-execution incident-response system for DreamDEX Event Contracts on Somnia. It reconstructs the exact incident as **Agent Intent ≠ Venue Reality**, then applies DreamDEX-native semantic decoders — including `MINT_A_PAIR`, chain/indexer divergence, resting SELL escrow, expected-vs-actual fills and exact-market settlement — to determine what actually happened.

Every material claim is labeled `OBSERVED`, `INFERRED` or `UNKNOWN`. Inference alone never authorizes spend. **The trading agent may be AI; the layer that decides whether money moves is deterministic and authority-gated.** The system prefers `NO_ACTION`, `RETRY_READ` or `ESCALATE` when evidence does not justify a corrective write, and it reconciles the final state after any bounded action.

The build includes deterministic replay evidence from real Shannon incident classes and a separate **Last Known Book-originated real Shannon testnet proof**. For that proof, the system revalidated chain 50312, the exact market/pool/lifecycle and order-book parameters, placed a bounded PostOnly order, observed zero fills plus `OrderPlaced → OrderRested`, cancelled exactly the returned order, observed `OrderCancelled`, and reconciled tUSDC collateral exactly from `1 raw → 1 raw`.

DreamDEX is load-bearing to the product: `marketId`, rolling pool binding, Event Contract lifecycle, `MINT_A_PAIR`, escrow semantics and native order events form the causal vocabulary and evidence path. The integration also produced concrete SDK/docs feedback around market identity, write gating, bounded approvals, unit arithmetic and PostOnly reconciliation.

**Evidence boundary:** this is real Shannon technical + behavior + operational-containment proof. We do not claim production reliability, ROI, MTTR improvement, incident prevalence or fraud/manipulation detection from this prototype.

## Why now

DreamDEX Event Contracts are rolling markets: windows end, successors open, and pools can be recycled. The current developer documentation explicitly recommends durable market identity and fresh on-chain lifecycle checks rather than treating a pool or indexed state as permanently authoritative.

That creates a real autonomous-agent failure mode:

`market rolls → cached venue state can become stale → a naive corrective action can create a second incident`

Last Known Book turns rollover safety, venue semantics and write authority into one post-execution incident contract.

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

## Operator / adoption path

```text
autonomous DreamDEX agent
        ↓
DreamDEX execution
        ↓
unexpected result / ambiguous venue state
        ↓
LAST KNOWN BOOK
  Intent vs Venue Reality
  DreamDEX semantic decoders
  OBSERVED / INFERRED / UNKNOWN
  deterministic authority gate
        ↓
NO_ACTION / RETRY_READ / ESCALATE / bounded exact action
        ↓
reconciled incident receipt + operator-visible closure
```

Credible production path: continuous incident ingestion → persistent receipts keyed by durable market identity → measured operator baseline → larger live incident corpus → hardened privacy/deployment/action controls → only then evaluate production write authority and business outcomes.

## Judge Fast Lane

1. Open live demo.
2. Select `LKB-001`.
3. Follow `AGENT INTENT ≠ VENUE REALITY → MINT_A_PAIR + CHAIN_INDEXER_DIVERGENCE → RETRY_READ → WRITE REFUSED`.
4. Read `REAL SHANNON PROOF`: `50312 → PostOnly → 0 fills → OrderPlaced → OrderRested → exact cancel → OrderCancelled → tUSDC 1 raw → 1 raw`.
5. Read `LIVE SHANNON READBACK`: current network head + live receipt lookup for the public captured `LKB-003` transaction, with no wallet/signing/writes.
6. Watch the 2–3 minute demo and inspect SDK feedback / CI only if deeper validation is desired.

## Demo video

Canonical script: `docs/DEMO-SCRIPT.md`  
Target: **2:35**  
Requirement: final encoded video must be **2–3 minutes** and pass TRACE encoded-video review.

Video URL: **PENDING**

## GitHub

Public repository: `https://github.com/Faadil1/Last-Known-Book`

Judge code candidate: `6ee02917aa92951dc1222282367ef7599095bffa`  
Winning Intelligence CI: `34361037435` — PASS.

## Live demo

Stable anonymous judge URL: **PENDING TERMINAL DEPLOYMENT / READBACK**

The current product code now includes a browser-side **read-only Shannon verification panel** that polls:

- `eth_chainId`;
- `eth_blockNumber`;
- `eth_getTransactionReceipt` for a public captured Shannon transaction already used by `LKB-003`.

If RPC readback is unavailable it fails closed and attempts a public explorer read fallback. It contains no wallet request, signing method or transaction-broadcast method.

The live panel intentionally does **not** expose the private Packet 003 transaction identifiers. The real LKB-originated proof remains separately represented by the redacted proof card and public proof commitment.

## Real Shannon proof surface

Public judge-safe proof exposes only the bounded facts already represented in the UI:

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

### Pre-submission proof commitment

`evidence/SHANNON-PROOF-003-COMMITMENT.json` publishes a tamper-evident Git object + canonical private-commit reference to the already-preserved private Packet 003 proof bundle while withholding wallet, transaction hashes and order ID.

This creates a public answer to: **"Was the private receipt bundle fixed before judging, or reconstructed afterward?"**

## SDK / docs feedback

Artifacts:

- `docs/SDK-FEEDBACK.md`
- `docs/UPSTREAM-FEEDBACK-DRAFT.md`

High-value findings:

- make `marketId`, not pool, the durable incident identity;
- centralize the recommended chain-authoritative write-safety recipe;
- document `autoApprove` consequences and bounded approval alternatives;
- show raw-unit and human-unit arithmetic together;
- explain PostOnly success as an event/state sequence;
- document clean SDK transport shutdown/testing lifecycle;
- separate testnet funding/setup authority from trade authority.

A concise sponsor-facing contribution has been prepared. Publishing it to the sponsor repository depends on external GitHub write access; the current integration does not have permission to create issues in `somnia-chain/dreamdex-bot-kit`, so the public draft is preserved in this repository rather than falsely claiming an upstream issue was filed.

## Thumbnail / cover

Deterministic cover surface: `/cover.html`

It reuses the same casefile identity as the product:

- warm off-white casefile background;
- `LAST KNOWN BOOK`;
- `AGENT INTENT ≠ VENUE REALITY`;
- `MINT_A_PAIR`;
- `WRITE REFUSED`;
- real Shannon proof cue;
- no transaction/wallet identifiers.

This page is intended to become the DoraHacks thumbnail, README hero capture and video intro/closing frame after the final screenshot/export gate.

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

### Why isn't the critical authority layer an LLM?
Because this layer can move money. An LLM may help interpret heterogeneous context later, but inference alone is not an authority primitive. The current critical path deliberately uses deterministic DreamDEX predicates plus explicit human confirmation for writes.

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

1. verify stable live URL and live read-only panel;
2. attach final encoded 2–3 minute video;
3. pass TRACE encoded-video assurance;
4. export/freeze final cover/thumbnail;
5. rerun Winning Intelligence final check;
6. obtain Project Finisher `SUBMISSION_READY`;
7. re-read exact DoraHacks Sep 11 cutoff clock/timezone;
8. obtain explicit human authorization for the protected submission action.
