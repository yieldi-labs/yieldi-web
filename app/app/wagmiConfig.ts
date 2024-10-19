import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { createConfig } from "wagmi";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Yieldi",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID || "",
    chains: [mainnet],
    ssr: true,
  }),
);
