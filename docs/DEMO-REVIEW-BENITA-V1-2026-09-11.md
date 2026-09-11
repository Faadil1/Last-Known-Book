# Benita Demo V1 — Review Receipt

Date: 2026-09-11
Video: https://youtu.be/tKmv5IVVX5k
YouTube title observed: `Last Book for Somnia Dreamdex Hackathon`
Duration observed: `1:39`
Review status: `REVISION_REQUIRED`

## What works

- The opening establishes the autonomous-agent trading context and the risk of a wrong follow-up action.
- The product is framed as post-execution assurance rather than generic analytics.
- The case walkthrough shows Agent Intent vs Venue Reality and the indexer-lag failure mode.
- `MINT_A_PAIR` is explained as a DreamDEX-native mechanism rather than generic market activity.
- The agent-facing close correctly introduces HTTP / webhook / MCP / CLI and the Authority Receipt.
- The authority boundary is preserved: the receipt can recommend and report, but cannot sign or execute a transaction.

## Why this is not the final encoded submission yet

The current cut is strong as a concise product walkthrough, but it is too short for the canonical 2–3 minute demo contract and omits the strongest evidence layer.

Missing P0 beats:

1. **Proof Room** — show the real Last Known Book-originated Shannon Packet 003 path:
   `50312 → PostOnly → 0 fills → OrderPlaced → OrderRested → exact cancel → OrderCancelled → tUSDC 1 raw → 1 raw`.
2. **Live read-only witnesses** — briefly show current Shannon/network/receipt/contract/unit verification and state clearly that these are independent reads, not additional trades.
3. **Visual proof commitment** — show the readable `Capture → Fingerprint → Anchor → Public Receipt` surface, not raw JSON.
4. **Truth taxonomy** — keep captured replay, product-originated Packet 003, live read-only witnesses and tamper-evident commitment conceptually distinct.
5. **Final memory close** — end on the product signature:
   `The trading agent may be AI. The layer that decides whether money moves is not.`
   followed by `Last Known Book — reconstruct the market your agent actually traded.`

## Recommended revision

Preserve most of the current 1:39 cut. Add roughly 35–55 seconds after the MINT_A_PAIR case and before the final agent-interface close:

- ~20–25s: Proof Room / Packet 003
- ~10–15s: live read-only witnesses
- ~8–12s: visual commitment
- retain the existing Authority Receipt close

Target final duration: `2:15–2:35`.

## Packaging cleanup before final submission

- Preferred YouTube title: `Last Known Book — Somnia × DreamDEX Hackathon Demo`
- Add a short description containing:
  - Live product: https://last-known-book.pages.dev
  - GitHub: https://github.com/Faadil1/Last-Known-Book
  - One-line product description: post-execution incident response for autonomous DreamDEX agents.

## Verdict

`STORY = PASS`
`DREAMDEX_CAUSAL_REVEAL = PASS`
`AUTHORITY_BOUNDARY = PASS`
`EVIDENCE_LAYER = INCOMPLETE_IN_VIDEO`
`DURATION = BELOW_CANONICAL_TARGET`
`FINAL_SUBMISSION_VIDEO = NOT_YET_PASS`

Next action: Benita produces V2 with the proof sequence added, then TRACE reviews the encoded artifact before human final approval.
