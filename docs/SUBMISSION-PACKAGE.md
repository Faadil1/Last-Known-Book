# Last Known Book — DoraHacks Submission Package

Status: **FINAL CANDIDATE — VIDEO + HUMAN SUBMISSION GATE PENDING**  
Event: Somnia × DreamDEX Event Contracts Hackathon  
Current organizer extension: **2026-09-11 23:59 UTC**. Re-check DoraHacks / organizer announcement immediately before the protected final submit.

## Canonical identity

**Title:** Last Known Book  
**Tagline:** Reconstruct the market your agent actually traded.  
**Category:** Post-execution incident response and assurance for autonomous agents using DreamDEX Event Contracts on Somnia.  
**24-hour memory sentence:** The one that reconstructs what the agent actually traded — and proves why it looked wrong.  
**Hero hook:** This wasn't a whale. It was a mint.  
**Authority hook:** The trading agent may be AI. The layer that decides whether money moves is not.

## Live product

**Production runtime:** https://last-known-book.pages.dev  
**Proof Room:** https://last-known-book.pages.dev/proof.html  
**Agent Interface:** https://last-known-book.pages.dev/agent.html  
**Judge Packet:** https://last-known-book.pages.dev/docs.html  
**Public repository:** https://github.com/Faadil1/Last-Known-Book

The production runtime is built from canonical `main`. Branch-preview URLs are not submission URLs.

## Short description

Last Known Book starts after an autonomous DreamDEX agent has already acted and the resulting execution looks wrong. It reconstructs **Agent Intent vs Venue Reality**, applies DreamDEX-native causal semantics, separates `OBSERVED / INFERRED / UNKNOWN`, and returns a bounded next action plus a deterministic Authority Receipt. Inference alone cannot authorize spend.

The product includes four deterministic captured Shannon incident classes, a separate Last Known Book-originated real Shannon PostOnly → Rest → Exact Cancel behavior proof, a tamper-evident pre-judging commitment, and independent live read-only Shannon witnesses.

## Suggested DoraHacks project description

Autonomous trading agents can make a reasonable decision and still encounter an execution that looks wrong after DreamDEX venue semantics, lifecycle state, escrow behavior or indexed visibility enter the picture. The dangerous moment is what happens next: an operator or agent can misread the execution and create a second incident with a blind corrective transaction.

**Last Known Book** is a post-execution incident-response system for DreamDEX Event Contracts on Somnia. It reconstructs the incident as **Agent Intent ≠ Venue Reality**, then applies DreamDEX-native semantic decoders — including `MINT_A_PAIR`, chain/indexer divergence, resting SELL escrow, expected-vs-actual fills and exact-market settlement — to determine what can actually be supported by evidence.

Every material claim is classified `OBSERVED`, `INFERRED` or `UNKNOWN`. The system prefers `NO_ACTION`, `RETRY_READ` or `ESCALATE` when evidence does not justify another write. For upstream agents it returns a machine-readable Authority Receipt containing the report hash, recommended action, blocking unknowns and `writeAuthorized`; the receipt does not execute funds.

The evidence stack deliberately separates proof types. Four incident classes are deterministic replays from captured Shannon evidence. Separately, Last Known Book originated a bounded real Shannon testnet proof on chain 50312: it revalidated the exact market context, placed a PostOnly order, observed `0 fills` plus `OrderPlaced → OrderRested`, cancelled exactly the returned order, observed `OrderCancelled`, and reconciled tUSDC collateral exactly from `1 raw → 1 raw`. The Proof Room also performs independent live read-only checks for chain identity/head, a public captured LKB-003 receipt, DreamDEX module bytecode and tUSDC `decimals()`.

DreamDEX is load-bearing: `marketId`, rolling pool binding, Event Contract lifecycle, `MINT_A_PAIR`, escrow semantics and native order events change both the explanation and whether a follow-up action is justified.

**Evidence boundary:** this is Shannon testnet technical + behavior + operational-containment evidence. We do not claim production reliability, profitability, ROI, MTTR improvement, incident prevalence or fraud/manipulation detection.

## RUBRIC → PAIN → PROBLEM → DIFFERENTIATOR → EXECUTION → EVIDENCE → STORY → DEMO → Q&A

### RUBRIC
The package is optimized around meaningful DreamDEX integration, technical implementation, innovation, UX/product comprehension, ecosystem value and a concise 2–3 minute demonstration.

### PAIN
After an unexpected autonomous execution, an operator may need to reconcile the submitted order, transaction receipt, balances, venue book, lifecycle and an indexer before knowing what actually happened.

### PROBLEM
Those surfaces can be individually valid while supporting the wrong explanation. A wrong explanation can cause a second, unnecessary write.

### DIFFERENTIATOR
**Agent Intent ≠ Venue Reality** + DreamDEX-native semantic decoding + `OBSERVED / INFERRED / UNKNOWN` + deterministic authority boundaries.

### EXECUTION
- four captured incident classes (`LKB-001` through `LKB-004`);
- deterministic incident engine and reconciliation;
- Atlas Room jury-first product UI + mobile-responsive Case Room;
- Methodology + Proof Room + Judge Packet;
- Bring Your Own Incident HTTP intake and provider-neutral webhook;
- remote MCP, local stdio MCP and JSON-first CLI;
- deterministic `LKB-AUTHORITY-RECEIPT-v0.1`;
- read-only Shannon watcher and dynamic collateral-unit normalization.

### EVIDENCE
1. **Captured replay evidence:** four distinct Shannon incident classes, kept explicitly separate from product-originated writes.
2. **Product-originated real Shannon behavior proof:** PostOnly → Rest → Exact Cancel with zero fills and exact collateral reconciliation.
3. **Live read-only witnesses:** chain ID/current block, a public captured LKB-003 receipt, DreamDEX BinaryMarketsModule bytecode, and live tUSDC `decimals()`.
4. **Tamper-evident commitment:** public Git identities bind the submission to the preserved private Packet 003 proof object without publishing private operational identifiers.
5. **Deterministic CI/replay:** engine, safety, proof/redaction and UI regression contracts run in CI.

The purpose is not to maximize transaction count. Each proof source answers a different judge objection.

### STORY
Unexpected execution → apparent anomaly → venue-native causal reveal → uncertainty made explicit → unsafe write refused → reconciled proof.

Memory hook: **This wasn't a whale. It was a mint.**

### DEMO
Canonical script: `docs/DEMO-SCRIPT.md`  
Target duration: **2:35**  
Final encoded video: **PENDING BENITA RECORDING + TRACE REVIEW**

### Q&A
See the defense set below. The final video should answer the first objections implicitly before a judge asks them.

## Judge Fast Lane

1. Open https://last-known-book.pages.dev and understand the three questions: **What happened? What do we actually know? What is safe to do next?**
2. Open `LKB-001` and follow `AGENT INTENT ≠ VENUE REALITY → MINT_A_PAIR + CHAIN_INDEXER_DIVERGENCE → RETRY_READ → WRITE REFUSED`.
3. Open `/proof.html` and inspect the **real Shannon behavior proof**.
4. Read the **live read-only witnesses**. They independently check Shannon chain/head, a public captured receipt, DreamDEX deployed bytecode and tUSDC units. If RPC is unavailable the page fails closed rather than inventing a pass.
5. Read the **tamper-evident commitment** as a visual receipt — not raw JSON.
6. Open `/agent.html` and see how another agent can submit an incident and consume an Authority Receipt without receiving automatic spend authority.
7. Use `/docs.html`, CI and SDK feedback only for deeper audit.

## Why now

DreamDEX Event Contracts are rolling markets: windows end, successors open and pool bindings can change. Durable market identity and fresh on-chain lifecycle checks matter before any follow-up write.

`market rolls → cached venue state can become stale → naive corrective action can create a second incident`

Last Known Book turns rollover safety, venue semantics and write authority into one post-execution incident contract.

## Why Somnia / DreamDEX is necessary

Removing DreamDEX Event Contract semantics collapses the current mechanism. The product depends on:

- durable `marketId` identity rather than cached/recycled pool identity;
- current on-chain lifecycle for write safety;
- `MINT_A_PAIR` and venue-specific fill semantics;
- resting-order escrow behavior;
- exact-market settlement/residual semantics;
- native `OrderPlaced`, `OrderRested` and `OrderCancelled` events;
- Shannon execution/reconciliation for authentic behavior proof.

## Evidence strategy: more proof, not proof spam

The competitive opportunity is **independent evidence density**, not raw on-chain transaction count. A second identical PostOnly transaction would add little. A different proof that validates a different critical claim can add real value.

Current no-write evidence expansion is therefore preferred: the Proof Room now checks four independent live Shannon facts using read-only RPC calls. These checks are complementary to Packet 003 rather than pretending to be additional product-originated trades.

A new blockchain write is **not authorized by this package**. Any additional product-originated Shannon transaction requires a fresh, exact human approval packet with bounded amount, market, action, closure path and cutoff. With the final demo close, new writes should only be considered if they prove a genuinely new high-value semantic path that the current evidence cannot establish.

## Real Shannon proof surface

Product-originated Packet 003 proves:

- Shannon chain `50312`;
- exact market/pool/lifecycle/order-param pre-write gate;
- bounded PostOnly placement receipt success;
- `0 fills`;
- `OrderPlaced → OrderRested`;
- exact returned order cancelled;
- cancel receipt success + `OrderCancelled`;
- collateral `1 raw tUSDC → 1 raw tUSDC`;
- classification: technical + behavior + operational containment;
- `PRODUCTION_EVIDENCE = ABSENT`.

Private Packet 003 identifiers remain protected. Do not publish the disposable wallet, private key, seed phrase, full transaction identifiers or private receipt bundle without a separate explicit human publication decision.

## Pre-submission proof commitment

Judge-facing route: `https://last-known-book.pages.dev/proof.html#commitment`

The underlying machine-readable artifact `evidence/SHANNON-PROOF-003-COMMITMENT.json` publishes only a tamper-evident Git object + canonical private-commit reference while withholding wallet, transaction hashes and order ID. The product does not render the raw JSON to judges.

## Agent-native integration

Available surfaces:

- `POST /api/investigate` — Bring Your Own Incident;
- `POST /api/incidents` — provider-neutral inbound incident webhook;
- `POST /api/mcp` — bounded remote tool surface;
- `npm run mcp` — local stdio adapter;
- `npm run lkb -- ...` — JSON-first CLI;
- `SKILL.md` — LLM-readable operating reference;
- `/agent.html` — judge-facing agent contract.

A bare `txHash` is never enough to invent DreamDEX semantics. When deterministic evidence is insufficient, Last Known Book returns `UNKNOWN` with `RETRY_READ` or `ESCALATE` and `writeAuthorized:false`.

## SDK / docs feedback

Artifacts:

- `docs/SDK-FEEDBACK.md`
- `docs/UPSTREAM-FEEDBACK-DRAFT.md`

High-value findings include durable market identity, chain-authoritative write safety, bounded approvals, raw-unit arithmetic, PostOnly event reconciliation and clean transport lifecycle. A sponsor-facing draft is preserved without falsely claiming it was filed upstream.

## Q&A defense

### Isn't this just analytics?
No. Analytics describes a market. Last Known Book reconstructs one unexpected execution, determines what DreamDEX-native cause explains it, applies an authority policy and reconciles closure.

### Why not just inspect a block explorer?
An explorer shows transactions. It does not reconstruct Agent Intent vs Venue Reality, classify DreamDEX-specific cause, separate truth classes, decide whether another action is justified and close the incident as one evidence contract.

### Why not prevent the issue before trading?
Pre-trade checks cannot explain what actually occurred after a venue-specific execution path, indexer lag, resting escrow or settlement residual has already happened.

### Why does this require DreamDEX?
The mechanism depends on DreamDEX Event Contract semantics: `marketId`, rolling pool binding, `MINT_A_PAIR`, escrow, lifecycle and native order events.

### What is real versus replayed?
Four casefiles are deterministic replays built from captured Shannon incident evidence. Separately, Packet 003 is a Last Known Book-originated real Shannon placement/rest/exact-cancel/reconciliation proof. Live read-only witnesses are a third category: current chain verification, not additional product-originated trades.

### Why add live witnesses if Packet 003 is already real?
They answer different objections. Packet 003 proves bounded behavior. Live witnesses prove that the judge-facing runtime can independently verify current Shannon/network/contract/unit facts without trusting a screenshot.

### Is a larger number of transactions automatically stronger?
No. Ten repetitions of the same weak claim are less useful than one independent proof of a missing critical claim. Last Known Book optimizes evidence coverage and provenance, not transaction count.

### Did the real order execute against another trader?
No. It was deliberately PostOnly, rested with zero fills, then exactly cancelled. That proves bounded authority and reconciliation, not profitable execution.

### Is WRITE REFUSED a failure?
No. A truthful refusal is correct behavior when evidence does not justify a write. A blind compensating transaction can turn one confusing incident into two.

### Why isn't the critical authority layer an LLM?
Because this layer can move money. Models may interpret context, but inference alone is not an authority primitive. The critical path uses deterministic DreamDEX predicates and explicit human confirmation for any protected write.

### Why MCP/API and not only a UI?
The operator UI explains incidents to humans; HTTP, webhook, MCP and CLI let upstream agents and workflows consume the same deterministic investigation contract without copying the authority logic.

### What is an Authority Receipt?
A machine-readable record of the investigation result: report hash, recommended action, `writeAuthorized`, truth-class counts, blocking unknowns and `executionPerformed:false`. It can inform another agent but cannot move funds by itself.

### What happens with only a transaction hash?
The system reads what it can and fails closed. If venue-native cause cannot be established deterministically, it returns `UNKNOWN` and requests more evidence or escalation rather than inventing semantics.

### What business impact is proven?
Operational containment is demonstrated on Shannon testnet. MTTR improvement, ROI, incident prevalence and production reliability are not yet proven and are not claimed.

### What would you build next?
Persistent immutable incident storage keyed by durable market identity, a broader live incident corpus, measured operator baselines, stronger identity/privacy/deployment controls, and additional DreamDEX semantic decoders — while preserving the same evidence and authority boundary. Basic incident ingestion, HTTP/MCP/CLI integration and Authority Receipts already exist in this build.

## Packaging consistency check

All final surfaces must preserve:

`SAME OPERATOR → SAME UNEXPECTED EXECUTION PAIN → SAME INTENT/REALITY DIFFERENTIATOR → SAME DREAMDEX-NATIVE CAUSAL REVEAL → SAME AUTHORITY BOUNDARY → SAME RECONCILED PROOF`

Required aligned surfaces:

- DoraHacks title and description;
- thumbnail;
- README;
- production live demo;
- final video;
- Q&A;
- Proof Room;
- SDK/docs feedback.

## Protected final gate

This package is **not a submission authorization**.

Before final submit:

1. re-check https://last-known-book.pages.dev from an anonymous browser session;
2. attach the final encoded 2–3 minute video;
3. pass TRACE encoded-video assurance;
4. export/freeze the final cover/thumbnail;
5. rerun final CI / Winning Intelligence check;
6. obtain Project Finisher `SUBMISSION_READY`;
7. re-read the exact DoraHacks / organizer cutoff immediately before submission;
8. obtain explicit human authorization for the protected submission action.
