# Last Known Book — Shannon Write Packet 001

Status: `HUMAN_WRITE_APPROVAL_REQUIRED`
Prepared: 2026-09-08T23:25Z
Execution performed: **NO**
Private key used: **NO**

## Proof class

This packet proposes a **controlled TECHNICAL_PROOF** of Last Known Book's authority boundary and on-chain reconciliation. It is not an organic incident, behavior proof, outcome proof, or production evidence.

## Live Shannon snapshot

Source: `evidence/shannon/preflight-2026-09-08T232328Z.json`
GitHub Actions run: `34290405286`
Artifact: `10081109116`
Artifact digest: `sha256:e21aee80836bac4740ea297c1b24dda83e532d79e6790a0f82e00da76031b31d`

At 2026-09-08T23:23:28.630Z:

- chain: Somnia Shannon `50312`
- SDK: `@somnia-chain/markets-sdk@0.29.0`
- asset/window: BTC / 1h
- marketId: `0x000000000000000000000000000000000000000000000000000000000001772a`
- pool: `0x3604C66cDd41649F26A804dF2c6cbD2f2753CB68`
- market address: `0xB7531fB3060Ad4DB694c9CEe99937B0C4eA926da`
- on-chain status: `1 / Trading`
- expiry: `2026-09-09T00:00:00Z`
- headroom at snapshot: `2194 s`
- tUSDC: `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`, 6 decimals
- tick size: raw `1000` = `0.001`
- minimum quantity: raw `1000` = `0.001` contract
- lot size: raw `1000` = `0.001` contract
- best YES bid: raw `169000` = `0.169`
- best YES ask: raw `194000` = `0.194`

## Proposed controlled action

### Transaction A — one minimum-size PostOnly BUY_YES

Intent:

- side: `BUY_YES`
- order type: `PostOnly`
- price: raw `1000` = **0.001 tUSDC per contract**
- quantity: raw `1000` = **0.001 contract**
- order expiry: 120 seconds after transaction construction
- builder: zero address / no builder fee
- self-match policy: cancel taker / safest supported non-self-match behavior

Maximum order principal if somehow filled:

`0.001 price × 0.001 contract = 0.000001 tUSDC`

That is **1 raw tUSDC unit** at 6 decimals. Gas in test STT is additional testnet cost.

Why this price:

- snapshot best ask is 0.194;
- proposed bid is 0.001, 193 ticks below the ask;
- PostOnly must reject rather than cross if the book changes into the order at placement;
- if accepted, expected venue state is `OrderPlaced` + `OrderRested`, not a taker fill.

### Transaction B — exact cancel, only if A rests and remains open

Last Known Book policy after A:

`CONTROLLED_PROOF_MUST_END_WITH_ZERO_OPEN_EXPOSURE`

If the order is confirmed resting and still owned/open, the justified response is `cancelOrder(orderId)`.

Expected proof:

- mined cancel receipt status success;
- `OrderCancelled(orderId)` log;
- exact order no longer present among own open orders;
- any locked tUSDC returned to the wallet under auto-pull semantics;
- final open quantity = 0;
- final incident state = `CLOSED_ACTION_TAKEN_RECONCILED`.

If the order filled before cancel, **do not blindly resubmit cancel**. Reconcile actual fill/position and close as an unexpected-but-bounded branch instead.

## Mandatory pre-write predicates

Every predicate below must be re-read immediately before Transaction A. Any failure means `BLOCK` and zero write.

1. `marketId` is still exactly `...1772a` for this approval packet.
2. authoritative on-chain market status is still `1 / Trading`.
3. at least **900 seconds** remain before market expiry.
4. pool read from current market registry/on-chain state still equals `0x3604...CB68`.
5. tick/min/lot still equal `1000 / 1000 / 1000` raw.
6. current best ask is strictly greater than proposed PostOnly price `0.001`.
7. wallet has sufficient test STT for gas.
8. wallet has at least **1 raw tUSDC unit** free for the order requirement.
9. pool allowance is at least the exact auto-pull requirement. **No automatic approval write is authorized by this packet.** If allowance is insufficient, stop at `APPROVAL_REQUIRED`.
10. simulation/static call does not indicate rejection/revert.
11. no other Last Known Book proof order is active for this packet.

## Receipt truth rules

For Transaction A:

- a transaction hash alone is not success;
- require mined success plus an `OrderPlaced` event;
- obtain the real `orderId` from the receipt/event, never from simulation;
- require `OrderRested` before treating cancel as the expected next action.

For Transaction B:

- re-read exact order state before cancel;
- require mined success + `OrderCancelled`;
- reconcile final open orders and balances;
- if chain receipt succeeds while indexer lags, chain truth wins and indexed reads are retried with a bounded deadline;
- never rebroadcast a write solely because the indexer says unavailable.

## Approval lifetime

This exact market packet is only eligible while the market has >=900 seconds remaining. With expiry at 2026-09-09T00:00:00Z, the conservative approval cutoff is:

**2026-09-08T23:45:00Z / 19:45 EDT.**

If that cutoff passes, or if any market parameter changes, this packet expires. A new live read and a new exact packet are required; this approval must not be silently transferred to a successor market.

## Authority boundary

No blockchain write has occurred in preparing this packet.

A human must explicitly approve **this two-step bounded proof** before Transaction A. Transaction B is authorized by the same approval only if Transaction A actually rests and the deterministic cleanup predicate is satisfied. Any different market, price, quantity, setup approval, faucet action, mint, trade, redeem, or additional transaction requires a new authority decision.
