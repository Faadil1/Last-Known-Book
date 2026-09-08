# TRACE Rendered Viewport Evidence — 1280×720

Date: 2026-09-08
Product: Last Known Book
Canonical repository: `Faadil1/Last-Known-Book`
Canonical branch at capture: `main`
Canonical HEAD at capture: `5ccec71296ec38080c2346732acba49987eec60b`

## Human authorization

The user explicitly authorized a bounded external preview for visual evidence only. This did **not** authorize production deployment, hackathon submission, spend, or any blockchain write.

## External preview

A Vercel preview deployment of the exact current `main` static bundle was created:

- URL: `https://last-known-book-trace-preview-jhuebqiq3-faadil-s-projects.vercel.app`
- deployment id: `dpl_3fPT9HT2N69fSZh4XVQn7TKHaTsG`
- target: `preview`

The Vercel connector could create the deployment but could not subsequently read the deployment because its token lacks read authorization for scope `faadil-s-projects` (HTTP 403). Therefore deployment readiness is **not claimed** from connector evidence.

## Rendered browser evidence

Because the application is a static HTML/CSS/JS bundle, the exact canonical `main` source was also rendered in Chromium at a fixed evaluator viewport of **1280×720**. Case `LKB-001` was the opening state.

Raster SHA-256:

`1283f24e1ca9dacc9de5c5180c277840431c84427c8874f75d76218fbd2a0ac5`

Raster dimensions: `1280 × 720`.

Measured browser geometry:

- causal reveal top: `451.203125 px`
- causal reveal bottom: `562.796875 px`
- safe-response panel top: `451.203125 px`
- safe-response panel bottom: `561.796875 px`
- evidence section begins: `562.796875 px`
- viewport bottom: `720 px`

Therefore the evaluator sees, without scrolling:

1. product identity / case register;
2. `Agent Intent ≠ Venue Reality`;
3. DreamDEX-native causal reveal `MINT_A_PAIR + CHAIN_INDEXER_DIVERGENCE`;
4. root cause `MIXED`;
5. safe response `RETRY_READ`;
6. authority result `WRITE REFUSED`;
7. the beginning of grounded evidence rows.

The case does not depend on the lower authority/reconciliation sections to communicate the core evaluator story.

## Reduced-motion check

With browser media emulation `prefers-reduced-motion: reduce`:

- case-nav button computed `transition-duration`: `0s`
- case-nav button computed `animation-name`: `none`

The stylesheet contains a reduced-motion rule forcing transitions and animations off.

## TRACE visual assessment

PASS criteria observed:

- not a generic dark crypto trading terminal;
- not a grid of generic KPI cards;
- no chat copilot as primary interaction;
- no giant trust/risk score;
- `Intent vs Venue Reality` remains the primary signature;
- DreamDEX-native venue semantics carry the reveal;
- `WRITE REFUSED` is visible as a consequence of authority, not a disclaimer;
- proof depth continues below the fold without hiding the product thesis.

## Truth boundary

This viewport evidence proves browser rendering and evaluator hierarchy only. It does **not** prove production deployment, user behavior, MTTRC improvement, incident prevalence, or Last Known Book-originated Shannon writes.
