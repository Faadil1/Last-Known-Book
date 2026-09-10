# Last Known Book — Benita Demo Handoff

Date: 2026-09-10
Owner for recording: Benita
Product owner / final authority: Faadil
Runtime branch: `rework/atlas-room-v4`
Validated runtime head: `c33265670b44954a8783ef0b4745d0d5c9a001df`
Stable preview: https://rework-atlas-room-v4.last-known-book.pages.dev
Validated atomic preview: https://3ab1c9a9.last-known-book.pages.dev

## What the demo must make obvious

Last Known Book is post-execution incident response for autonomous DreamDEX agents.

When an execution looks wrong, it reconstructs what actually happened at the venue, separates OBSERVED / INFERRED / UNKNOWN, identifies the likely venue-native cause, and returns a bounded next action. An AI inference alone cannot authorize money to move.

The demo is not a feature tour. It should prove one complete argument:

**unexpected execution → venue reality → truth classes → safe next action → authority boundary → verifiable proof**

## Recommended 2–3 minute sequence

### 0:00–0:20 — Hero / thesis
Open the stable preview at the root.

Use the hero sentence as the setup:

> Know what happened before your agent acts again.

Then frame the problem in one sentence: autonomous agents can execute correctly at the chain level while the operator still has the wrong mental model of what happened.

Do not explain every card. The three questions under the hero are enough:

- What happened?
- What do we actually know?
- What is safe to do next?

### 0:20–0:55 — Open one real case
Open **LKB-001 — Mint + Indexer Lag** from Featured Case Files.

The home-to-Case-Room transition now happens inside the live Atlas DOM, so the old visual direction should not flash during the transition.

In the Case Room, point to:

- stated intent versus venue reality;
- OBSERVED / INFERRED / UNKNOWN;
- the bounded safe response;
- the fact that uncertainty can stop another write.

Do not visit all four cases. Mention that four captured Shannon incident classes exist, but demonstrate one deeply enough to prove the mechanism.

### 0:55–1:25 — Why DreamDEX matters
Use the Method or evidence view to make one venue-native point concrete. Good examples are `MINT_A_PAIR`, lifecycle state, resting escrow, or native order events.

The line to land is:

> This is not generic transaction analytics. DreamDEX semantics change the explanation and whether another action is justified.

### 1:25–2:05 — Proof Room
Open `/proof.html`.

The Proof Room is now designed as a visual receipt rather than a raw JSON/Markdown-looking surface and includes its own responsive mobile navigation.

Show these three things in order:

1. **Real Shannon behavior proof** — PostOnly → Rest → Exact Cancel.
2. **Truth boundary** — production evidence remains ABSENT; automatic spend is NOT AUTHORIZED.
3. **Tamper-evident commitment** — preserved proof object → Git blob fingerprint → canonical merge anchor → public judge-safe receipt.

The raw commitment JSON is now only a collapsed technical appendix. Do not open it in the main demo unless a judge explicitly asks for the underlying object.

### 2:05–2:30 — Agent / authority close
Open `/agent.html` only long enough to show that the product can be used through the agent-facing surface without exposing private-key, signing, or broadcast authority.

Close on this idea:

> The trading agent may be AI. The layer that decides whether money moves is not.

Then return to the product thesis: explain first, preserve uncertainty, and refuse unsafe follow-up action.

## Recording rules

- 16:9 capture, ideally 1920×1080 or 1440×900.
- Browser zoom at 100%.
- Hide bookmarks bar, personal extensions, notifications and unrelated tabs.
- Keep pointer movement deliberate; avoid circling or repeated hovering.
- Do not open DevTools in the primary judge demo.
- Do not show private Packet 003 identifiers, wallet addresses, private transaction identifiers, secrets or environment variables.
- Avoid feature dumping. One case + one proof chain is stronger than showing every control.
- Do not claim production reliability, profitability, ROI, fraud detection, incident prevalence or MTTR improvement.
- Real photography is contextual product imagery, not incident evidence.

## Mobile / responsive evidence

The main demo can remain desktop-first. If a short responsive insert is useful, show the root at roughly 390–430 px only after the core argument is already clear. Do not spend primary demo time scrolling through every mobile section.

Protected responsive expectations:

- compact mobile navigation;
- hero remains legible;
- three-question explainer stacks;
- Featured Case Files stack;
- Case Room becomes a one-column flow;
- Intent vs Venue Reality stacks;
- Proof / Methodology grids stack;
- Proof Room commitment and ledger stack cleanly;
- focus and reduced-motion remain supported.

## Current validation

Runtime head `c33265670b44954a8783ef0b4745d0d5c9a001df`:

- GitHub Actions `validate` run `34525245441`: PASS
- Cloudflare Pages: PASS
- stable branch preview: https://rework-atlas-room-v4.last-known-book.pages.dev
- atomic preview: https://3ab1c9a9.last-known-book.pages.dev

The separate Cloudflare Workers build is not the judge-facing Pages deployment; Pages is the validated runtime used for this demo.

The remaining human task before final encoded-video freeze is to record the demo against the stable preview and have TRACE review the encoded video for judge comprehension, pacing, truth boundaries and visual continuity.
