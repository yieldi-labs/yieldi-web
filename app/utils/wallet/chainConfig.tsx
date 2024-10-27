import { ChainSvg, WalletSvg } from "@/svg";

export const chainConfig: ChainConfig[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: <ChainSvg.Bitcoin />,
    wallets: [
      {
        id: "xdefi-utxo",
        name: "CTRL",
        icon: <WalletSvg.Ctrl />,
        downloadUrl: "https://ctrl.xyz/",
      },
      {
        id: "okx-utxo",
        name: "OKX",
        icon: <WalletSvg.OKX />,
        downloadUrl: "https://www.okx.com/web3",
      },
      {
        id: "metamask",
        name: "MetaMask",
        icon: <WalletSvg.Metamask />,
        disabled: true,
      },
      {
        id: "vultisig",
        name: "Vultisig",
        icon: <WalletSvg.Vultisig />,
        disabled: true,
      },
      {
        id: "walletconnect",
        name: "WalletConnect",
        icon: <WalletSvg.WalletConnect />,
        disabled: true,
      },
    ],
  },
  {
    id: "ethereum",
    name: "Ethereum",
    icon: <ChainSvg.Ethereum />,
    wallets: [
      {
        id: "metamask",
        name: "MetaMask",
        icon: <WalletSvg.Metamask />,
        downloadUrl: "https://metamask.io/",
      },
      {
        id: "walletconnect",
        name: "WalletConnect",
        icon: <WalletSvg.WalletConnect />,
      },
      {
        id: "xdefi",
        name: "CTRL",
        icon: <WalletSvg.Ctrl />,
        downloadUrl: "https://ctrl.xyz/",
      },
      {
        id: "okx",
        name: "OKX",
        icon: <WalletSvg.OKX />,
        downloadUrl: "https://www.okx.com/web3",
      },
      {
        id: "vultisig",
        name: "Vultisig",
        icon: <WalletSvg.Vultisig />,
        downloadUrl: "https://vultisig.com/",
      },
    ],
  },
];
