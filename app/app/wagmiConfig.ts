import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Yieldi",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID || "",
  chains: [mainnet],
  ssr: true,
});
