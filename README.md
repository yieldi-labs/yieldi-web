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

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

MIT License. See [LICENSE](LICENSE) file.

---

Visit [https://yieldi.xyz](https://yieldi.xyz) for more information.
