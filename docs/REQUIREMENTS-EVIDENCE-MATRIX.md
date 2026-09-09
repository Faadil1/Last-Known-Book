# Last Known Book — Requirements → Evidence Matrix

Assessment date: 2026-09-09  
Candidate basis: product main after real Shannon Packet 003 proof + exact-market settlement decoder v0.2  
Promotion rule: every **MUST** and **MUST_NOT** must be evidenced before `BUILD_CANDIDATE_READY`. SHOULD items may remain non-blocking if explicitly bounded.

## MUST

| ID | Verdict | Evidence |
|---|---|---|
| M1 | PASS | Incident reports preserve `marketId` when available; captured lifecycle fixtures include source order IDs; `scripts/shannon-packet-local.mjs` captures transaction hash, returned `orderId`, wallet and exact market/pool during real proof. |
| M2 | PASS | `shannon-packet-local.mjs` reads chain id, exact on-chain market state and book parameters immediately before write; receipt success is reconciled separately from indexed visibility. Packet 003 real proof passed this gate. |
| M3 | PASS | Real proof consumes current binary order book and fills; captured cases reconcile fills, order state, escrow and outcome balances; LKB-004 reconciles exact-market residual balances and payout state. |
| M4 | PASS | `index.html` / `app.js` render synchronized **Agent Intent** vs **Venue Reality**; TRACE rendered gate preserved this hierarchy at 1280×720. |
| M5 | PASS | Engine v0.2 decodes `MINT_A_PAIR`, chain/indexer divergence, resting SELL escrow and `EXACT_MARKET_SETTLEMENT_RECONCILIATION`; LKB-004 distinguishes winning redeemed residuals, losing zero-value residuals and no-repeat-write state. |
| M6 | PASS | Engine emits material claims as `OBSERVED`, `INFERRED` or `UNKNOWN` with evidence pointers. |
| M7 | PASS | Incident report includes explicit `rootCause`; unsupported/insufficient evidence falls through to `UNKNOWN` / fail-closed policy rather than certainty inflation. |
| M8 | PASS | `evaluatePolicy` requires deterministic predicates **and** explicit user confirmation for write authorization. Packet 003 additionally required an exact one-time confirmation token. Tests verify claimability alone does not authorize redeem. |
| M9 | PASS | Engine supports `NO_ACTION`, `RETRY_READ`, `ESCALATE`, `CANCEL_EXACT_ORDER`, `REDEEM_EXACT_WINNING_RESIDUAL`; real Packet 003 proves exact-order cancel containment after safe predicates and human approval. |
| M10 | PASS | `npm run replay` emits machine-readable `evidence/generated/LKB-00x.incident-report.json`; the casefile UI renders judge-readable RCA / causal evidence. |
| M11 | PASS | Replay is deterministic; tests assert identical report hashes across repeated runs and CI requires regenerated reports to be byte-clean. Four labeled real-Shannon replay classes are present. |
| M12 | PASS | Product repository was created from scratch for Last Known Book; product contract explicitly forbids Matchday Pulse source reuse. No Matchday Pulse source is present in this codebase. |
| M13 | PASS | `evidence/trace/VIEWPORT-1280x720.md` records the TRACE rendered viewport pass, causal hierarchy, anti-slop signature and reduced-motion pass. |

**MUST result: 13 / 13 PASS.**

## SHOULD

| ID | Verdict | Evidence / boundary |
|---|---|---|
| S1 | PASS | Four real Shannon incident classes are represented: mint-a-pair/indexer lag, resting SELL escrow, expected-vs-actual fill, exact-market residual settlement. |
| S2 | PARTIAL / NON-BLOCKING | Captured replay evidence contains source repositories / transaction evidence where available and private PBPD holds full Packet 003 receipt identifiers. Public Packet 003 wallet/tx identifiers remain intentionally redacted pending a judge-safe publication decision. |
| S3 | PASS | LKB-003 compares requested BUY_NO price/quantity with reconciled average fill and resulting position. |
| S4 | PASS | `docs/SDK-FEEDBACK.md` records concrete DreamDEX SDK/docs integration feedback from the real Shannon proof. |
| S5 | PASS | TRACE rendered evidence verifies the full causal slice at 1280×720 and reduced-motion behavior. |

## MUST_NOT

| ID | Verdict | Evidence |
|---|---|---|
| N1 | PASS | README, reports and PBPD truth boundaries prohibit unsupported fraud/manipulation, prevalence, ROI and production claims. |
| N2 | PASS | TRACE viewport evidence explicitly rejects generic dark crypto terminal, KPI card-grid, chat-copilot, trust-score and detective-noir identities; `Intent vs Venue Reality` remains primary. |
| N3 | PASS | No automated compensating trade path exists. Real Shannon writes were separately bounded, locally executed by the human and authorization-gated; the product prefers no-action/retry/escalate where evidence is insufficient. |
| N4 | PASS | `evaluatePolicy` never authorizes a write from inference/unknown evidence alone; deterministic predicates + explicit confirmation are required and tested. |
| N5 | PASS | Integration snapshot and write runner key durable identity by `marketId` and re-check its current on-chain pool; packet fails closed on pool mismatch. |
| N6 | PASS | Captured third-party Shannon cases are labeled replay/captured evidence; the Last Known Book-originated Packet 003 proof is separately labeled real product-originated testnet behavior proof. |
| N7 | PASS | Real Packet 003 is classified technical + behavior + operational-containment proof only; production evidence remains `ABSENT`. |

**MUST_NOT result: 7 / 7 PASS.**

## Candidate promotion verdict

`BUILD_CANDIDATE_READY` is justified **if and only if** the packaging PR containing this matrix, the updated README and SDK feedback passes product CI and merges to canonical `main`.

This verdict means the implemented candidate is ready for **Project Finisher terminal assurance**. It does **not** mean:

- `SUBMISSION_READY`;
- `SUBMITTED`;
- production-ready;
- permission to perform another blockchain write;
- permission to publish private wallet / transaction evidence.

Project Finisher must independently verify the exact merged candidate, requirements, evidence, demo/package, final QA and protected-action boundary.