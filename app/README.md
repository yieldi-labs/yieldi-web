# Yieldi

Yieldi is a decentralized application (dApp) that allows users to earn yield on native assets using Thorchain Savers.

## Features

- Stake Bitcoin (BTC) and Ethereum (ETH) in Thorchain Savers
- View current APY and TVL for each asset
- Deposit and withdraw funds
- Connect to Bitcoin and Ethereum wallets

## Tech Stack

- Next.js
- React
- pnpm
- TypeScript
- Tailwind CSS
- Viem
- Sats-Connect (for Bitcoin interactions)
- Thorchain API

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Run the development server:
   ```
   pnpm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory and add:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECTID=your_walletconnect_project_id
```

## OpenaAPI clients

This application utilizes several openapi specifications from ninereals:

- [Midgard](https://midgard.ninerealms.com/v2/doc)
- [Thornode](https://thornode.ninerealms.com/thorchain/doc/)

To update and generate the ts clients to the latest specification, first pull the latest swagger spec:

```bash
# For midgard
$ pnpm openapi:pull:midgard

# For thornode
$ pnpm openapi:pull:thornode
```

Then generate the clients:

```bash
# For midgard
$ pnpm openapi:gen:midgard

# For thornode
$ pnpm openapi:gen:thornode
```

Or pull and generate both at the same time:

```bash
$ pnpm openapi:pull
$ pnpm openapi:gen
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

[MIT License](LICENSE)
