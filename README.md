# Yieldi Monorepo

This repository contains the main components of the Yieldi project: the web application, landing page, and shared assets.

## Project Structure

```
yieldi-monorepo/
├── app/     # Main Yieldi dApp
├── landing/ # Marketing site (yieldi.xyz)
└── shared/  # Shared assets (e.g., Tailwind preset)
```

For detailed information, see [App README](app/README.md) and [Landing Page README](landing/README.md).

## Getting Started

1. Clone the repository:
   ```
   git clone [repository-url]
   cd yieldi-monorepo
   ```

2. Install dependencies:
   ```
   cd app && npm install
   cd ../landing && npm install
   ```

3. Set up environment variables:
   Create `app/.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECTID=your_walletconnect_project_id
   ```

3. Build api clientes
   For `stagenet`
   ```
   pnpm run openapi:gen:stagenet
   ```
   For `mainnet`
      ```
   pnpm run openapi:gen
   ```

4. Run development servers:
   ```
   cd app && npm run dev
   cd landing && npm run dev
   ```

## Tech Stack

- Next.js, React, TypeScript
- Tailwind CSS
- XchainJS
- Thorchain API and Midgard

## Configure Thorchain stagenet

The stagenet network is only available with the wallet [leap](https://www.leapwallet.io/).

You need to add custom network with this parameters: 

```
chain id: thorchain-stagenet-2
chain name: thorchain
rpc URL: https://stagenet-rpc.ninerealms.com
Rest URL: https://stagenet-thornode.ninerealms.com
prefix: sthor
coin type: 931
native denom: rune
decimals: 8
```

Aditional you need to add env variable: 

`NEXT_PUBLIC_IS_STAGENET=true`

Finally you need to generate the clients based on stagenet specs using: 

`pnpm run openapi:gen:stagenet`


## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

MIT License. See [LICENSE](LICENSE) file.

---

Visit [https://yieldi.xyz](https://yieldi.xyz) for more information.
