import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana } from "@reown/appkit/networks";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

export const networks = [solana];

export const metadata = {
  name: "Your App Name",
  description: "Your App Description",
  url: typeof window !== "undefined" ? window.location.origin : "",
  icons: ["your-icon-url"],
};

export const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

export const appKit = createAppKit({
  adapters: [solanaAdapter],
  networks: networks as any,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID as string,
  metadata,
  features: {
    analytics: true,
  },
});
