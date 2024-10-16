import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

export default getDefaultConfig({
  appName: "Yieldi",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID || "",
  chains: [mainnet],
  ssr: true,
});
