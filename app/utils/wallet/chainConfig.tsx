import { ChainSvg, WalletSvg } from "@/svg";
import { avalanche, bsc, mainnet } from "wagmi/chains";

// Base wallet configurations
const baseWalletConfig = {
  CTRL: {
    name: "CTRL",
    icon: <WalletSvg.Ctrl />,
    downloadUrl: "https://ctrl.xyz/",
  },
  MetaMask: {
    name: "MetaMask",
    icon: <WalletSvg.Metamask />,
    downloadUrl: "https://metamask.io/",
  },
  OKX: {
    name: "OKX",
    icon: <WalletSvg.OKX />,
    downloadUrl: "https://www.okx.com/web3",
  },
  WalletConnect: {
    name: "WalletConnect",
    icon: <WalletSvg.WalletConnect />,
  },
  Vultisig: {
    name: "Vultisig",
    icon: <WalletSvg.Vultisig />,
    downloadUrl: "https://vultisig.com/",
  },
  Phantom: {
    name: "Phantom",
    icon: <WalletSvg.Phantom />,
    downloadUrl: "https://phantom.app/",
  },
};

// Wallet groups
const evmWallets = [
  { id: "metamask", ...baseWalletConfig.MetaMask },
  { id: "xdefi", ...baseWalletConfig.CTRL },
  { id: "okx", ...baseWalletConfig.OKX },
  { id: "vultisig", ...baseWalletConfig.Vultisig },
  { id: "phantom", ...baseWalletConfig.Phantom },
  { id: "walletConnect", ...baseWalletConfig.WalletConnect },
];

const utxoWallets = [
  { id: "xdefi-utxo", ...baseWalletConfig.CTRL },
  { id: "okx-utxo", ...baseWalletConfig.OKX },
  { id: "metamask", ...baseWalletConfig.MetaMask, disabled: true },
  { id: "vultisig", ...baseWalletConfig.Vultisig, disabled: true },
  { id: "walletConnect", ...baseWalletConfig.WalletConnect, disabled: true },
];

const disabledEvmWallets = [
  { id: "metamask", ...baseWalletConfig.MetaMask, disabled: true },
];

const singleWalletChains = [
  {
    id: "dogecoin",
    name: "Dogecoin",
    icon: <ChainSvg.Dogechain />,
    wallets: [
      { id: "xdefi-doge", ...baseWalletConfig.CTRL },
      { id: "okx-doge", ...baseWalletConfig.OKX, disabled: true },
      { id: "phantom-doge", ...baseWalletConfig.Phantom, disabled: true },
      {
        id: "walletconnect",
        ...baseWalletConfig.WalletConnect,
        disabled: true,
      },
      { id: "vultisig", ...baseWalletConfig.Vultisig, disabled: true },
      ...disabledEvmWallets,
    ],
  },
  {
    id: "bitcoincash",
    name: "Bitcoin Cash",
    icon: <ChainSvg.BitcoinCash />,
    wallets: [
      { id: "xdefi-bch", ...baseWalletConfig.CTRL },
      { id: "okx-bch", ...baseWalletConfig.OKX, disabled: true },
      { id: "phantom-bch", ...baseWalletConfig.Phantom, disabled: true },
      {
        id: "walletconnect",
        ...baseWalletConfig.WalletConnect,
        disabled: true,
      },
      { id: "vultisig", ...baseWalletConfig.Vultisig, disabled: true },
      ...disabledEvmWallets,
    ],
  },
  {
    id: "litecoin",
    name: "Litecoin",
    icon: <ChainSvg.Litecoin />,
    wallets: [
      { id: "xdefi-ltc", ...baseWalletConfig.CTRL },
      { id: "okx-ltc", ...baseWalletConfig.OKX, disabled: true },
      { id: "phantom-ltc", ...baseWalletConfig.Phantom, disabled: true },
      {
        id: "walletconnect",
        ...baseWalletConfig.WalletConnect,
        disabled: true,
      },
      { id: "vultisig", ...baseWalletConfig.Vultisig, disabled: true },
      ...disabledEvmWallets,
    ],
  },
  {
    id: "thorchain",
    name: "THORChain",
    icon: <ChainSvg.Thorchain />,
    wallets: [
      { id: "xdefi-thorchain", ...baseWalletConfig.CTRL },
      { id: "okx-thorchain", ...baseWalletConfig.OKX, disabled: true },
      { id: "phantom-thorchain", ...baseWalletConfig.Phantom, disabled: true },
      {
        id: "walletconnect",
        ...baseWalletConfig.WalletConnect,
        disabled: true,
      },
      { id: "vultisig-thorchain", ...baseWalletConfig.Vultisig },
      ...disabledEvmWallets,
    ],
  },
  {
    id: "solana",
    name: "Solana",
    icon: <ChainSvg.Solana />,
    wallets: [
      { id: "phantom-solana", ...baseWalletConfig.Phantom },
      { id: "xdefi-solana", ...baseWalletConfig.CTRL, disabled: true },
      { id: "okx-solana", ...baseWalletConfig.OKX, disabled: true },
      {
        id: "walletconnect",
        ...baseWalletConfig.WalletConnect,
        disabled: true,
      },
      { id: "vultisig", ...baseWalletConfig.Vultisig, disabled: true },
      ...disabledEvmWallets,
    ],
  },
];

const evmChains = [
  {
    id: "ethereum",
    name: "Ethereum",
    icon: <ChainSvg.Ethereum />,
    chainId: mainnet.id,
    wallets: evmWallets,
  },
  {
    id: "binance-smart-chain",
    name: "BSC",
    icon: <ChainSvg.BSC />,
    chainId: bsc.id,
    wallets: evmWallets.map((wallet) =>
      wallet.id === "phantom" ? { ...wallet, disabled: true } : wallet,
    ),
  },
  {
    id: "avalanche",
    name: "Avalanche",
    icon: <ChainSvg.Avax />,
    chainId: avalanche.id,
    wallets: evmWallets.map((wallet) =>
      wallet.id === "phantom" ? { ...wallet, disabled: true } : wallet,
    ),
  },
];

export const chainConfig: ChainConfig[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: <ChainSvg.Bitcoin />,
    wallets: [
      ...utxoWallets,
      { id: "phantom-utxo", ...baseWalletConfig.Phantom },
    ],
  },
  ...evmChains,
  ...singleWalletChains,
];
