# Last Known Book — Benita Demo Handoff

Date: 2026-09-10  
Recording owner: Benita  
Product owner / final authority: Faadil  
Canonical branch: `main`  
Production runtime: https://last-known-book.pages.dev  
Canonical film contract: `docs/DEMO-SCRIPT.md`

## What the demo must make obvious

Last Known Book is **post-execution incident response for autonomous DreamDEX agents**.

When an execution looks wrong, it reconstructs what actually happened at the venue, separates **OBSERVED / INFERRED / UNKNOWN**, identifies the DreamDEX-native cause that can be supported, and returns a bounded next action plus a deterministic Authority Receipt. AI inference alone cannot authorize money to move.

The demo is not a feature tour. Prove one argument:

**unexpected execution → venue reality → truth classes → safe next action → originated proof + live witnesses → authority boundary**

## Recommended 2–3 minute sequence

### 0:00–0:18 — Hero / thesis
Open https://last-known-book.pages.dev.

Use the three questions already visible in the product:

- What happened?
- What do we actually know?
- What is safe to do next?

Simple framing: the agent has already acted; if the operator misunderstands the venue reality, the next corrective action can create a second incident.

### 0:18–0:55 — LKB-001 only
Open **LKB-001 — Mint + Indexer Lag**.

Show:

- **Agent Intent ≠ Venue Reality**;
- **OBSERVED / INFERRED / UNKNOWN**;
- `MINT_A_PAIR + CHAIN_INDEXER_DIVERGENCE`;
- `RETRY_READ`;
- `WRITE REFUSED`.

Land the line:

> **This wasn't a whale. It was a mint.**

Mention that four captured incident classes exist. Do not tour all four.

### 0:55–1:15 — Why DreamDEX is load-bearing
Use Methodology or one brief secondary semantic reference such as resting SELL escrow.

Land:

> DreamDEX semantics change both the explanation and whether another action is justified.

Do not turn this into architecture narration.

### 1:15–1:58 — Proof Room
Open https://last-known-book.pages.dev/proof.html.

First show **REAL SHANNON BEHAVIOR PROOF**:

- chain 50312;
- PostOnly;
- 0 fills;
- `OrderPlaced → OrderRested → OrderCancelled`;
- `tUSDC 1 raw → 1 raw`.

Then show **LIVE READ-ONLY WITNESSES**. The page independently checks:

1. current Shannon chain ID + block head;
2. a public captured LKB-003 transaction receipt;
3. DreamDEX BinaryMarketsModule deployed bytecode;
4. tUSDC `decimals() = 6`.

Important narration:

> These are independent live witnesses, not four extra trades. Packet 003 is the product-originated behavior proof; these read-only calls verify separate current chain facts.

If the live panel says unavailable, do not retry repeatedly on camera. Say that it fails closed and continue with Packet 003 + commitment.

### 1:58–2:12 — Visual proof commitment
Scroll to **Capture → Fingerprint → Anchor → Public Receipt**.

Point briefly to the readable Git identity facts and keep the truth boundary visible.

Do **not** open `evidence/SHANNON-PROOF-003-COMMITMENT.json` during the primary demo.

### 2:12–2:28 — Agent Interface / Authority Receipt
Open https://last-known-book.pages.dev/agent.html.

Show only the winning flow:

`incident → Last Known Book → OBSERVED / INFERRED / UNKNOWN → safe action → Authority Receipt`

Mention HTTP / webhook / MCP / CLI once. Do not tour every API.

### 2:28–2:35 — Close
Close with:

> **The trading agent may be AI. The layer that decides whether money moves is not.**
>
> Last Known Book — reconstruct the market your agent actually traded.

## Proof taxonomy — do not blur these in narration

**Captured replay evidence**  
Four real-Shannon incident classes replayed deterministically. Not LKB-originated writes.

**Product-originated behavior proof**  
Packet 003: Last Known Book-originated PostOnly → Rest → Exact Cancel on Shannon.

**Live read-only witnesses**  
Current network / public receipt / deployed DreamDEX module / collateral-unit reads. No writes.

**Tamper-evident commitment**  
Git identities proving the private Packet 003 proof object was preserved before judging, without publishing private identifiers.

## Recording rules

- 16:9 capture, ideally 1920×1080 or 1440×900.
- Browser zoom 100%.
- Use only `https://last-known-book.pages.dev` and its production pages.
- Hide bookmarks, notifications, personal extensions and unrelated tabs.
- Deliberate cursor movement; no repeated hovering.
- No DevTools in the primary demo.
- No private Packet 003 identifiers, wallet, private keys, secrets or environment variables.
- No raw proof commitment JSON in the primary demo.
- No production reliability, profitability, ROI, fraud detection, prevalence or MTTR claims.
- Real photography is contextual product imagery, never incident evidence.
- One case + one originated proof + independent live witnesses is stronger than a feature dump.
- Optional mobile insert only after the core argument is already clear.

## Mobile expectation

If shown briefly around 390–430 px, confirm only that the hero, three-question explainer, Featured Case Files, Case Room, Methodology and Proof Room reflow cleanly. Do not spend the main demo scrolling through mobile sections.

## After recording

Do not submit directly from the video export. Return the encoded artifact for **TRACE encoded-video review**. TRACE must verify:

- first-time jury comprehension;
- pacing and continuity;
- first-minute causal reveal;
- proof taxonomy stays clear;
- live witnesses are readable and honestly framed;
- authority boundary is unmistakable;
- no unsupported claim appears;
- final duration remains 2–3 minutes.

The hackathon submission remains **human-only**.
