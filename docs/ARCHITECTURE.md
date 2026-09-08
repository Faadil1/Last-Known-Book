# Last Known Book — Architecture v0.1

## Boundary

`Last Known Book` is a post-execution assurance product. It does not predict markets and it does not let model inference authorize funds.

## Vertical slice

```text
captured/live incident packet
        ↓
chain truth + indexed truth + agent intent
        ↓
deterministic DreamDEX semantic decoders
        ↓
Intent vs Venue Reality
        ↓
OBSERVED / INFERRED / UNKNOWN claims
        ↓
root-cause class
        ↓
authority policy
        ↓
NO_ACTION / RETRY_READ / ESCALATE
        ↓
reconciled incident report
```

Write-capable responses (`CANCEL_EXACT_ORDER`, `REDEEM_EXACT_WINNING_RESIDUAL`) are modeled in policy but remain disabled in the v0.1 implementation until current on-chain predicates and explicit user confirmation are proven end-to-end.

## DreamDEX rules encoded deterministically

- `marketId` is the incident identity; pool addresses are not durable identities because pools are recycled.
- On-chain lifecycle outranks indexed lifecycle before writes.
- A mined successful transaction is not converted into failure because the indexer is late.
- A resting SELL escrows outcome inventory and can make the visible balance fall to zero.
- `MINT_A_PAIR` is a distinct crossing path; naive quote-field interpretation can materially misstate economics.
- Losing residuals are not blindly redeemed.
- tUSDC on Shannon has 6 decimals; scaling is never assumed from mainnet USDso.

## Evidence truth classes

- **OBSERVED** — grounded in source evidence or deterministic arithmetic from grounded fields.
- **INFERRED** — interpretation supported by observed claims; cannot independently authorize a write.
- **UNKNOWN** — evidence gap; may force escalation/hold.

## AI boundary

The first vertical slice deliberately uses no LLM on the critical path. The Prototype Killer is good structured logging + deterministic rules. A reasoning worker is only justified later if it demonstrably reduces MTTRC on heterogeneous cases without weakening truth boundaries.
