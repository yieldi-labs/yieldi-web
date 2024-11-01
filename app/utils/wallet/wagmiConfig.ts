import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  trustWallet,
  walletConnectWallet,
  okxWallet,
  phantomWallet,
  xdefiWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet, bsc, avalanche } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Yieldi",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID || "",
  chains: [bsc, mainnet, avalanche],
  wallets: [
    {
      groupName: "Recommended",
      wallets: [injectedWallet, metaMaskWallet],
    },
    {
      groupName: "Others",
      wallets: [
        trustWallet,
        walletConnectWallet,
        coinbaseWallet,
        okxWallet,
        phantomWallet,
        xdefiWallet,
      ],
    },
  ],
  ssr: true,
});
