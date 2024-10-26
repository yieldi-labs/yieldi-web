import { ChainSvg, WalletSvg } from "./svg";

export interface WalletOption {
  id: string;
  name: string;
  icon: JSX.Element;
  connector?: any;
}

export interface ChainConfig {
  id: string;
  name: string;
  icon: JSX.Element;
  wallets: WalletOption[];
}

export const chainConfig: ChainConfig[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: <ChainSvg.Bitcoin />,
    wallets: [
      { id: "xdefi-utxo", name: "CTRL", icon: <WalletSvg.Ctrl /> },
      // { id: "phantom-utxo", name: "Phantom", icon: <WalletSvg.Ctrl /> },
      { id: "okx-utxo", name: "OKX", icon: <WalletSvg.OKX /> },
    ],
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: <ChainSvg.Ethereum />,
    wallets: [
      // {
      //   id: "metamask",
      //   name: "MetaMask",
      //   icon: "/wallets/metamask.svg",
      // },
      // {
      //   id: "walletconnect",
      //   name: "WalletConnect",
      //   icon: "/wallets/walletconnect.svg",
      // },
      { id: "xdefi", name: "CTRL", icon: <WalletSvg.Ctrl /> },
      { id: "okx", name: "OKX", icon: <WalletSvg.OKX /> },
      // { id: "trust", name: "Trust Wallet", icon: "/wallets/Phantom.svg" },
    ],
  },
];
