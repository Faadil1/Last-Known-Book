# DreamDEX / Shannon integration snapshot

Captured: 2026-09-08

This is a build-time snapshot, not a permanent truth source. Recheck the official DreamDEX docs before any write.

## Developer surface

- Event Contracts developer surface: `@somnia-chain/markets-sdk`.
- Minimum supported version for this build: **0.28.0+**.
- HTTP API is not the Event Contracts surface; use the SDK / chain.
- Shannon chain id: **50312**.
- Testnet collateral: **tUSDC**, 6 decimals, `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`.

## Core contracts

- BinaryMarketsModule: `0x3ecC694Cef705358864a646142ac17A90E29e388`
- MarketsCore: `0x2802504314685D89bF6C992CA5a8e7cC78bc0294`
- BinarySettlement: `0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23`
- OutcomeToken6909: `0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9`
- OracleHub: `0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b`
- CollateralRouter: `0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C`

## Load-bearing rules

1. Key incident state by `marketId`, never cached pool address: pools are recycled.
2. Gate every write on fresh on-chain market status; indexed status can lag.
3. A successful receipt is not converted into failure because an indexer read is late.
4. `Buy Up × Buy Down` can settle through `mint-a-pair`; `Sell Up × Sell Down` can `burn-a-pair`.
5. A resting sell escrows outcome tokens and can reduce visible wallet inventory while the order is open.
6. On Shannon, collateral uses 6 decimals; never inherit mainnet 18-decimal assumptions.
7. Settled markets disappear from ordinary live-market loading; recovery must scan finalized binaries / exact market state.

## Official references

- https://app.dreamdex.io/docs/developers/event-contracts
- https://app.dreamdex.io/docs/developers/event-contracts/gotchas
- https://app.dreamdex.io/docs/developers/event-contracts/market-structure
- https://app.dreamdex.io/docs/developers/event-contracts/contracts-and-addresses
