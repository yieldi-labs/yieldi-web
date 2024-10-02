import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from "wagmi/chains";

export default getDefaultConfig({
  appName: 'Yieldi',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID || '', // TEMP ID, add new one in ENV
  chains: [mainnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});