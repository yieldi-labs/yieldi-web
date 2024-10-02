import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: 'Yieldi',
  projectId: '27c0bf211981210772e092335b738a21', // TEMP ID, add new one in ENV
  chains: [mainnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});