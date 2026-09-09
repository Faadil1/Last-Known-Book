# DreamDEX Event Contracts — proposed upstream feedback

Status: **READY TO SUBMIT AFTER FINAL TARGET/WORDING REVIEW**

This note is intentionally short enough to become a GitHub issue or documentation-feedback post. It is based on a bounded real Shannon integration using `@somnia-chain/markets-sdk@0.29.0`.

## Suggested title

**Event Contracts docs: make rollover identity + bounded write-gating a first-class bot pattern**

## Suggested body

While building a post-execution assurance tool against Shannon Event Contracts, a few patterns proved disproportionately useful for preventing stale-state and authority mistakes:

1. **Treat `marketId` as durable incident identity, not pool address.** Pools are recycled across rolling windows, so historical execution/reconciliation state should be keyed by `marketId` (or an equally durable market identity) and the pool should be treated as current routing state.

2. **Centralize a canonical pre-write gate.** A short recipe that always performs `chainId → exact marketId → current on-chain status → current pool binding → tick/lot/min quantity → gas/collateral/allowance → submit → receipt/event reconciliation` would make the intended safety hierarchy easier to copy correctly.

3. **Show bounded approval next to `autoApprove`.** Safety-sensitive bots may prefer `autoApprove:false` plus an exact allowance policy rather than an implicit broad approval. A docs example that contrasts the two would make the authority consequence explicit.

4. **Document PostOnly as an event/state sequence.** For a resting PostOnly order, the useful success contract is not just `receipt.status === success`; it is `OrderPlaced → OrderRested`, zero fills, returned `orderId`, then `cancelOrder(exact orderId) → OrderCancelled` when containment is intended.

5. **Make raw-unit arithmetic visible.** On Shannon, tUSDC has 6 decimals. Showing raw and human units side by side reduces accidental 6-vs-18-decimal assumptions.

6. **Document SDK transport shutdown/testing lifecycle.** In CLI/test environments, developers need a clear supported pattern for closing live subscriptions/transports so a successful chain read is not confused with process-teardown noise.

7. **Separate testnet setup authority from trading authority.** Faucet and approval are blockchain writes too. A security-oriented example can model `setup → readiness read → explicit trade authority → execution → reconciliation` rather than hiding setup writes inside a trading helper.

The current Event Contracts docs already communicate several of these ideas individually — especially on-chain status gating, recycled pools, raw collateral decimals and event semantics. The suggestion is mainly to collect them into one explicit **rollover-safe bounded-write recipe** for autonomous agents.

## Evidence boundary

This feedback comes from one controlled Shannon proof, not from a claim about broad developer prevalence or production incidents. The associated build successfully exercised:

- Shannon chain 50312;
- current market/pool/lifecycle checks;
- bounded PostOnly placement;
- zero fills;
- `OrderPlaced` + `OrderRested`;
- exact-order cancellation;
- `OrderCancelled`;
- exact collateral restoration.

No private key or wallet-identifying proof needs to be included in the upstream post.
