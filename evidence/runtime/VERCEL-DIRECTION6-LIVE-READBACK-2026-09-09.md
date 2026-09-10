# Vercel Direction 6 — Runtime Verification

Date: 2026-09-09 (America/Toronto)  
Environment: Production  
Public URL: `https://last-known-book-6fc1.vercel.app`  
Source lineage: `main`, Direction 6 merge `14b3f457d9bbcb321708a0a8dc6e05a5451734e7`, post-merge handover commit displayed by Vercel `738cdde`.

## Evidence source

Human browser video capture supplied during Project Finisher terminal assurance. The video itself is not committed to the public repository. This artifact records only the observed runtime facts.

## Runtime observations

- Public production page loaded successfully in a normal browser.
- Canonical Direction 6 identity rendered: Last Known Book logo/favicon, ivory + deep-green editorial investigation UI, hero `Same chain. Clearer answers.`.
- Public URL carried case deep-link state (`?case=LKB-001`, later `?case=LKB-002`, `?case=LKB-004`).
- Case register showed all four canonical incident classes LKB-001 through LKB-004.
- Case switching worked in-browser.
- Overview / Evidence / Timeline / Method interaction surface rendered.
- Timeline/event items were clickable and opened the evidence-detail dialog.
- LKB-004 exact-market residual settlement case rendered successfully.
- Redacted Real Shannon Proof surface remained present and separate from replay evidence.

## Live Shannon Readback observations

The right-rail `LIVE SHANNON READBACK` / `Network verification` panel rendered in production and showed:

- chain id: `50312`
- public transaction status: `CONFIRMED`
- read-only state explicitly visible
- no wallet/signing/write UI

Two observed samples from the same browser recording:

### Sample A

- head: `484,279,850`
- confirmations: `8,422,358`

### Sample B

- head: `484,280,000`
- confirmations: `8,422,508`

Delta during the recording:

- head: `+150`
- confirmations: `+150`

This is sufficient evidence that the displayed network head/confirmation values were changing during the session and were not a fixed static value.

## Runtime verdict

`PASS_PUBLIC_DIRECTION_6_AND_LIVE_SHANNON_READBACK`

Classification:

- public judge runtime: PASS
- Direction 6 runtime: PASS
- four-case UI coverage: PASS
- interactive event detail: PASS
- live Shannon chain readback: PASS
- chain id 50312: PASS
- public captured transaction confirmed: PASS
- head changed during session: PASS
- confirmations changed consistently with head: PASS
- live path remains read-only: PASS based on runtime surface + CI guardrails

## Truth boundaries

- The live transaction in this panel is captured public LKB-003 replay evidence, not the private Last Known Book-originated Packet 003 transaction.
- Packet 003 wallet, full transaction hashes and orderId remain redacted from the public UI.
- This runtime verification does not authorize or prove any new blockchain write.
- Testnet technical/behavior evidence does not imply production reliability, ROI, MTTR improvement or incident prevalence.
- The uploaded browser video is not a public repository artifact and is not redistributed by this evidence note.
