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
import { mainnet, arbitrum, dogechain, bsc, avalanche } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Yieldi",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID || "",
  chains: [
    { ...bsc, iconUrl: "/icons/coins/bnb.png" },
    { ...mainnet, iconUrl: "/icons/coins/ethereum.png" },
    { ...arbitrum, iconUrl: "/icons/coins/arbitrum.png" },
    { ...dogechain, iconUrl: "/icons/coins/dogecoin.png" },
    { ...avalanche, iconUrl: "/icons/coins/avalanche.png" },
  ],
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
