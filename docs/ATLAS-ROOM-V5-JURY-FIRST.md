# Last Known Book — Atlas Room V5 / Jury-First Information Architecture

Status: SOURCE + CI + CLOUDFLARE PASS; human runtime review required before promotion.

## Trigger
A runtime screen recording showed that the V4 root page repeated the investigation concept too many times: hero, pathway card, Featured Investigations, then the full investigation workspace. The result was technically rich but slower for a jury to understand.

## V5 principle
The homepage sells the product. The Case Room proves the product. Methodology, Proof, Agent and Docs explain the system in depth.

A judge should be able to answer these questions from the first screen and the next section:
1. What is Last Known Book?
2. What happens when an autonomous DreamDEX execution looks wrong?
3. What is different about this product?
4. Where can I verify the evidence?

## Root page sequence
1. **Atlas Room hero** — post-execution incident response for DreamDEX. Core line: “Know what happened before your agent acts again.”
2. **One incident · three questions** — What happened? What do we actually know? What is safe to do next?
3. **Featured Case Files** — four concrete incident classes, each opening the real Case Room.
4. **Judge Fast Lane** — Shannon network, real proof pattern, case corpus, agent surfaces.
5. **DreamDEX is load-bearing** — marketId/lifecycle/MINT_A_PAIR/escrow/order-event semantics change the causal answer.
6. Existing premium close/footer.

The full case workspace is intentionally hidden on the root overview.

## Case Room
The detailed interactive workspace remains unchanged in capability and opens via:
- `/investigations.html` (semantic entry route)
- `/?case=LKB-001` through `/?case=LKB-004` (canonical deep links)

In Case Room mode, the marketing hero is hidden and replaced by a compact workspace introduction so the user reaches the evidence immediately.

## Supporting pages
- `/methodology.html` — how fragmented evidence becomes a bounded decision.
- `/proof.html` — real Shannon proof, commitment rendering and explicit claim boundaries.
- `/agent.html` — HTTP / webhook / MCP / CLI and deterministic Authority Receipt.
- `/docs.html` — judge packet and deeper technical evidence.

## Mobile contract
At <= 980px:
- desktop nav becomes a native `<details>` menu;
- explainer cards stack;
- truth band reflows;
- Case Room becomes a single-column workspace;
- sidebar/proof rail stop behaving as desktop rails.

At <= 680px:
- nonessential network/theme/top CTA chrome is removed;
- hero typography and copy scale down;
- hero product principles stack;
- Featured Case Files become one column;
- case register becomes one column;
- truth metrics become two columns;
- Intent vs Venue Reality stacks vertically;
- Methodology and Proof grids become one column.

`prefers-reduced-motion` remains a protected requirement.

## Truth boundary
- Real photographic assets are editorial context, never incident evidence.
- No unsupported cross-chain positioning.
- No wallet/private key/signing/broadcast in public agent surfaces.
- Inference alone cannot authorize spend.
- Production evidence remains absent.

## Acceptance gate
Do not promote based on CI alone. Review root desktop, root ~390–430px mobile, Case Room desktop/mobile, Methodology, Proof and Agent. Promotion requires explicit human + TRACE PASS.
