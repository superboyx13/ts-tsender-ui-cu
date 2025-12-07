# TSender UI

Lightweight Next.js UI for the TSender airdrop tool.

## Table of contents
- [TSender UI](#tsender-ui)
  - [Table of contents](#table-of-contents)
  - [Overview](#overview)
  - [Quick start](#quick-start)
  - [Scripts](#scripts)
  - [Key files \& symbols](#key-files--symbols)
  - [Testing](#testing)
  - [Environment / notes](#environment--notes)

## Overview
This repository contains a Next.js frontend for interacting with the TSender smart contract deployment (used to batch airdrops). It uses RainbowKit + wagmi for wallet connections and viem/wagmi for contract reads and writes.

## Quick start

Prerequisites
- Node.js (v18+ recommended)
- pnpm (or use npm/yarn)
- anvil (optional, for local blockchain state)

Install:
```sh
pnpm install
```

Run dev server:
```sh
pnpm dev
# or
npm run dev
```

Start local anvil with the saved state:
```sh
pnpm anvil
# uses tsender-deploy.json
```

Build for production:
```sh
pnpm build
pnpm start
```

## Scripts
See [package.json](package.json) for the full list. Notable scripts:
- `anvil` — start anvil with saved state ([tsender-deploy.json](tsender-deploy.json))
- `dev` — `next dev --turbopack`
- `build` / `start` — production build & start
- `test:unit` — run unit tests via vitest

## Key files & symbols
- UI form: [`AirDropForm`](src/components/AirDropForm.tsx) — handles approval + call to contract airdrop function.
- Providers wrapper: [`Providers`](src/app/providers.tsx) — sets up wagmi, RainbowKit and react-query.
- Chain config: [`chainsToTSender`](src/constants.tsx) — maps chainId → tsender addresses.
- ERC20 ABI: [`erc20Abi`](src/constants.tsx) — used for token reads/approvals.
- Wallet config: [src/rainbowKitConfig.tsx](src/rainbowKitConfig.tsx) — default wallet/connect config.
- Utils:
  - [`calculateTotal`](src/utils/calculateTotal/index.ts)
  - [`formatTokenAmount`](src/utils/formatTokenAmount/index.ts)
  - [src/utils/index.ts](src/utils/index.ts)

## Testing
- Unit tests: vitest — configured in [vitest.config.mts](vitest.config.mts)
```sh
pnpm test:unit
```

- End-to-end: Playwright — [playwright.config.ts](playwright.config.ts)
```sh
pnpm exec playwright test
```

- Synpress / browser automation (if present) — see package.json dev/test entries.

## Environment / notes
- Provide your WalletConnect project id as env var:
  - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID — used by [src/rainbowKitConfig.tsx](src/rainbowKitConfig.tsx)
- The app expects TS/Next tooling; [next-env.d.ts](next-env.d.ts) and [tsconfig.json](tsconfig.json) are present.


