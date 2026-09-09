# DreamDEX Event Contracts — SDK / docs feedback from Last Known Book

Date: 2026-09-09  
Scope: bounded Shannon testnet integration and proof work for Last Known Book  
SDK exercised: `@somnia-chain/markets-sdk@0.29.0`

This is implementation feedback from one real bounded Shannon proof. It is not a claim that every developer will encounter each issue.

## What worked well

- `marketId` + on-chain market state provided a strong durable identity for a rolling Event Contract.
- `getMarketOnchain`, `getBinaryBookParams` and `getBinaryOrderBook` made a fresh pre-write gate possible.
- `Trader.placeOrder` returned enough information to reconcile a PostOnly placement: transaction hash, receipt, `orderId` and fills.
- Order-book receipt logs could be decoded into `OrderPlaced`, `OrderRested` and `OrderCancelled`, which made the proof chain auditable without relying on indexer timing.
- `cancelOrder({ pool, orderId })` supported exact containment after a resting order.

## Documentation improvements that would reduce integration risk

### 1. Make `marketId`, not pool, the incident identity explicit everywhere

Rolling Event Contracts may recycle pools. Developer examples should consistently state:

> Persist and key historical execution/reconciliation by `marketId`; treat the pool as current routing state, not durable market identity.

This matters especially for incident tooling, settlement recovery and rollover-aware agents.

### 2. Put the write-safety hierarchy in one canonical recipe

A recommended write gate would be valuable:

1. verify chain id;
2. read exact `marketId` on-chain;
3. require `Trading` immediately before order placement;
4. verify current pool equals the market's on-chain pool;
5. re-read tick / lot / min quantity;
6. verify gas, collateral and allowance;
7. submit;
8. reconcile receipt events and final state.

This makes the intended relationship between indexer reads and chain-authoritative writes much clearer.

### 3. Explain `autoApprove` more prominently

For a safety-sensitive agent, `autoApprove` is consequential. Documentation should call out that approval behavior may be broader than the principal of a single order and show a bounded alternative:

- set `autoApprove: false`;
- read current allowance;
- approve only the amount and spender required by the intended policy when appropriate.

Last Known Book intentionally used an exact `1 raw` tUSDC allowance for its proof rather than relying on automatic approval.

### 4. Show raw-unit arithmetic beside human-unit arithmetic

Shannon tUSDC uses 6 decimals. A simple Event Contract example should show both:

- `priceRaw = 1000` → `0.001`;
- `quantityRaw = 1000` → `0.001`;
- principal = `priceRaw × quantityRaw / 1_000_000` → `1 raw tUSDC` = `0.000001 tUSDC`.

This would reduce accidental 6-vs-18-decimal assumptions when developers move between testnet collateral and other EVM assets.

### 5. Document PostOnly success as an event/state sequence

A successful transaction receipt alone is not enough to understand order behavior. A PostOnly recipe should explicitly show the expected paths:

- rested: `OrderPlaced` → `OrderRested`, zero fills, returned `orderId`;
- rejected/cancelled for matching constraints: corresponding cancellation/self-match events;
- if later contained: `cancelOrder(exact orderId)` → `OrderCancelled`.

For incident response, this distinction is more useful than `receipt.status === success` alone.

### 6. Add a shutdown/testing recipe for SDK transports

During Windows proof work, force-closing Node after a successful SDK read produced a libuv `UV_HANDLE_CLOSING` assertion. A documented test/shutdown pattern for clients with live transports/subscriptions would help developers avoid treating transport teardown noise as a chain failure.

The important documentation point is not a specific workaround; it is to make lifecycle ownership explicit: which SDK object opens long-lived handles, and which supported API should be used to close them in CLI/test processes.

### 7. Separate faucet/setup authority from trade authority in examples

The testnet faucet is convenient, but for authority-aware agents it is still a blockchain write. A security-oriented example could model:

`funding/setup → readiness read → explicit trade authorization → trade → reconciliation`

rather than hiding faucet or approval writes inside a trading helper.

## Product-facing learning

The most important Event Contract integration lesson from this proof is:

**receipt success, order behavior, indexed visibility and economic reconciliation are separate facts.**

Last Known Book treats them separately so an indexer delay, resting escrow, mint-a-pair path, exact-market residual or successful-but-unexpected execution does not automatically become a compensating transaction.

## Evidence boundary

The real Last Known Book Shannon proof demonstrated:

- chain `50312`;
- fresh exact-market/pool/state/book-parameter checks;
- bounded PostOnly order;
- zero fills;
- `OrderPlaced` + `OrderRested`;
- exact returned-order cancellation;
- `OrderCancelled`;
- exact tUSDC restoration after cancellation.

This feedback does **not** claim production load, broad ecosystem prevalence or that the SDK is defective. It records concrete friction and safety opportunities observed in one controlled integration.