# Last Known Book — Benita Demo Handoff

Date: 2026-09-10
Recording owner: Benita
Product owner / final authority: Faadil
Canonical branch: `main`
Canonical product merge: `8c9377afe8821d7eca4fbf0b0c64bf6a68ae2f34`
Production runtime: https://last-known-book.pages.dev

## What the demo must make obvious

Last Known Book is **post-execution incident response for autonomous DreamDEX agents**.

When an execution looks wrong, it reconstructs what actually happened at the venue, separates **OBSERVED / INFERRED / UNKNOWN**, identifies the venue-native cause that can be supported, and returns a bounded next action. An AI inference alone cannot authorize money to move.

The demo is not a feature tour. It should prove one complete argument:

**unexpected execution → venue reality → truth classes → safe next action → authority boundary → verifiable proof**

## Recommended 2–3 minute sequence

### 0:00–0:20 — Hero / thesis
Open:

https://last-known-book.pages.dev

Land the product in one sentence:

> Know what happened before your agent acts again.

Then explain the pain simply: an autonomous agent can produce a valid on-chain transaction while the operator still has the wrong explanation of what happened at the venue.

Use the three questions under the hero rather than explaining every section:

- What happened?
- What do we actually know?
- What is safe to do next?

### 0:20–0:55 — One case, not four
Open **LKB-001 — Mint + Indexer Lag** from Featured Case Files.

The home-to-Case-Room transition is designed to happen inside the live Atlas DOM, with no reload into the old visual direction.

Show only what advances the argument:

- **Stated Intent vs Venue Reality**;
- **OBSERVED / INFERRED / UNKNOWN**;
- the venue-native causal reveal;
- the bounded safe response;
- the fact that uncertainty can stop another write.

Mention that four captured Shannon incident classes exist, but do not tour all four.

### 0:55–1:25 — Why DreamDEX is load-bearing
Use the Method/Evidence view to make one DreamDEX-native semantic point concrete. Strong options are:

- `MINT_A_PAIR`;
- lifecycle state;
- resting SELL escrow;
- native order events.

Land this line:

> This is not generic transaction analytics. DreamDEX semantics change the explanation and whether another action is justified.

### 1:25–2:05 — Proof Room
Open:

https://last-known-book.pages.dev/proof.html

Show the Proof Room as a **visual receipt**, not a source file.

Use this order:

1. **Real Shannon behavior proof** — PostOnly → Rest → Exact Cancel.
2. **Truth boundary** — production evidence remains ABSENT; automatic spend is NOT AUTHORIZED.
3. **Tamper-evident commitment** — Capture → Fingerprint → Anchor → Public Receipt.
4. Point briefly to the readable commitment facts, including the Git blob fingerprint and canonical merge anchor.

The underlying commitment JSON still exists as a machine-readable public evidence artifact, but the judge-facing product no longer renders it. **Do not open the raw JSON in the primary demo.**

### 2:05–2:30 — Agent surface / authority close
Open:

https://last-known-book.pages.dev/agent.html

Show just enough to establish that another agent or workflow can consume Last Known Book through the agent-native surface and receive a deterministic Authority Receipt.

Do not turn this into an API tour.

Close with:

> The trading agent may be AI. The layer that decides whether money moves is not.

Then restate the operating principle: explain first, preserve uncertainty, and refuse unsafe follow-up action.

## Optional 10–15 second responsive insert

The primary demo should remain desktop-first. If useful, show the home briefly around **390–430 px** after the core argument is already clear.

Protected mobile expectations:

- compact mobile navigation;
- hero stays legible;
- three-question explainer stacks;
- Featured Case Files stack;
- Case Room becomes a one-column flow;
- Intent vs Venue Reality stacks;
- Proof and Methodology grids reflow;
- focus and reduced-motion remain supported.

Do not spend the main demo scrolling through every mobile section.

## Recording rules

- 16:9 capture, ideally 1920×1080 or 1440×900.
- Browser zoom: 100%.
- Hide bookmarks bar, personal extensions, notifications and unrelated tabs.
- Use deliberate pointer movement; avoid circling and repeated hovering.
- Do not open DevTools in the primary judge demo.
- Do not show private Packet 003 identifiers, wallet addresses, private transaction identifiers, secrets or environment variables.
- Do not show the raw proof commitment JSON in the primary demo.
- Do not claim production reliability, profitability, ROI, fraud detection, incident prevalence or MTTR improvement.
- Real photography is contextual product imagery, not incident evidence.
- One case + one proof chain is stronger than a feature dump.

## Current verified product state

Canonical product is on `main`.

- Main product merge: `8c9377afe8821d7eca4fbf0b0c64bf6a68ae2f34`
- GitHub Actions validate for the main merge: PASS (`34526856417`)
- Cloudflare Pages for the main merge: PASS
- Post-merge Judge Packet commitment routing: PASS (`9e74ff855b7a57565179eb253adca6152ee2b6f7`, validate `34527128539`)
- Production runtime: https://last-known-book.pages.dev

## What happens after recording

Do not submit immediately from the video export.

Send the encoded video back for **TRACE encoded-video review**. The review should check:

- first-time jury comprehension;
- pacing and visual continuity;
- whether the causal reveal lands early enough;
- whether Proof Room is legible in the capture;
- whether the authority boundary is unmistakable;
- whether any claim exceeds the evidence;
- whether the final close is memorable.

The hackathon submission remains **human-only**.
