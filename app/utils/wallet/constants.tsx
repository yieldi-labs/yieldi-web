import { ChainSvg, WalletSvg } from "@/svg";
import { connectWalletConnect } from "./walletConnect";
import { ChainType } from "../interfaces";

export enum ChainKey {
  ARBITRUM = "Arbitrum",
  AVALANCHE = "Avalanche",
  BASE = "Base",
  BITCOIN = "Bitcoin",
  BITCOINCASH = "BitcoinCash",
  BLAST = "Blast",
  BSCCHAIN = "BSC",
  CRONOSCHAIN = "CronosChain",
  DASH = "Dash",
  DOGECOIN = "Dogecoin",
  DYDX = "Dydx",
  ETHEREUM = "Ethereum",
  GAIACHAIN = "Cosmos",
  KUJIRA = "Kujira",
  LITECOIN = "Litecoin",
  MAYACHAIN = "MayaChain",
  OPTIMISM = "Optimism",
  POLKADOT = "Polkadot",
  POLYGON = "Polygon",
  SOLANA = "Solana",
  SUI = "Sui",
  THORCHAIN = "THORChain",
  TON = "TON",
  ZKSYNC = "Zksync",
}
export enum ProviderKey {
  EVM = "evm",
  BITCOIN = "bitcoin",
  DOGECOIN = "dogecoin",
  LITECOIN = "litecoin",
  BITCOINCASH = "bitcoincash",
  SOLANA = "solana",
  THORCHAIN = "thorchain",
}
export enum WalletKey {
  CTRL = "xdefi",
  METAMASK = "metaMask",
  OKX = "okx",
  PHANTOM = "phantom",
  VULTISIG = "vultisig",
  WALLETCONNECT = "walletConnect",
}

export const CHAINS: ChainType[] = [
  {
    icon: <ChainSvg.Avax />,
    name: ChainKey.AVALANCHE,
    providerType: ProviderKey.EVM,
    thorchainIdentifier: "avax",
    nativeAsset: "avax",
    chainId: "0xa86a",
    addressUrl: "https://snowtrace.dev/address/{wallet}",
  },
  {
    icon: <ChainSvg.Bitcoin />,
    name: ChainKey.BITCOIN,
    providerType: ProviderKey.BITCOIN,
    thorchainIdentifier: "btc",
    nativeAsset: "btc",
    addressUrl: "https://www.blockchain.com/btc/address/{wallet}",
  },
  {
    icon: <ChainSvg.BitcoinCash />,
    name: ChainKey.BITCOINCASH,
    providerType: ProviderKey.BITCOINCASH,
    thorchainIdentifier: "bch",
    nativeAsset: "bch",
    addressUrl: "https://www.blockchain.com/bch/address/{wallet}",
  },
  {
    icon: <ChainSvg.BSC />,
    name: ChainKey.BSCCHAIN,
    providerType: ProviderKey.EVM,
    chainId: "0x38",
    thorchainIdentifier: "bsc",
    nativeAsset: "bnb",
    addressUrl: "https://bscscan.com/address/{wallet}",
  },
  {
    icon: <ChainSvg.Dogechain />,
    name: ChainKey.DOGECOIN,
    providerType: ProviderKey.DOGECOIN,
    thorchainIdentifier: "doge",
    nativeAsset: "doge",
    addressUrl: "https://dogechain.info/address/{wallet}",
  },
  {
    icon: <ChainSvg.Ethereum />,
    name: ChainKey.ETHEREUM,
    providerType: ProviderKey.EVM,
    chainId: "0x1",
    thorchainIdentifier: "eth",
    nativeAsset: "eth",
    addressUrl: "https://etherscan.io/address/{wallet}",
  },
  {
    icon: <ChainSvg.Litecoin />,
    name: ChainKey.LITECOIN,
    providerType: ProviderKey.LITECOIN,
    thorchainIdentifier: "ltc",
    nativeAsset: "ltc",
    addressUrl: "https://ltc.bitaps.com/{wallet}",
  },
  {
    icon: <ChainSvg.Solana />,
    name: ChainKey.SOLANA,
    providerType: ProviderKey.SOLANA,
    thorchainIdentifier: "sol",
    nativeAsset: "sol",
    addressUrl: "https://solscan.io/account/{wallet}",
  },
  {
    icon: <ChainSvg.Thorchain />,
    name: ChainKey.THORCHAIN,
    providerType: ProviderKey.THORCHAIN,
    thorchainIdentifier: "thor",
    nativeAsset: "rune",
    addressUrl: "https://runescan.io/address/{wallet}",
  },
];

// TODO: Duplicate info on CHAINs array. Remove this as part of https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration
export const EVM_CHAINS: ChainType[] = [
  {
    icon: <ChainSvg.Avax />,
    name: ChainKey.AVALANCHE,
    providerType: ProviderKey.EVM,
    chainId: "0xa86a",
    thorchainIdentifier: "avax",
    nativeAsset: "avax",
    addressUrl: "https://snowtrace.dev/address/{wallet}",
  },
  {
    icon: <ChainSvg.BSC />,
    name: ChainKey.BSCCHAIN,
    providerType: ProviderKey.EVM,
    chainId: "0x38",
    thorchainIdentifier: "bsc",
    nativeAsset: "bnb",
    addressUrl: "https://bscscan.com/address/{wallet}",
  },
  {
    icon: <ChainSvg.Ethereum />,
    name: ChainKey.ETHEREUM,
    providerType: ProviderKey.EVM,
    chainId: "0x1",
    thorchainIdentifier: "eth",
    nativeAsset: "eth",
    addressUrl: "https://etherscan.io/address/{wallet}",
  },
];

export const SUPPORTED_WALLETS = {
  [WalletKey.CTRL]: {
    id: WalletKey.CTRL,
    name: "CTRL",
    chains: [
      ChainKey.AVALANCHE,
      ChainKey.BITCOIN,
      ChainKey.BITCOINCASH,
      ChainKey.BSCCHAIN,
      ChainKey.DOGECOIN,
      ChainKey.ETHEREUM,
      ChainKey.LITECOIN,
      ChainKey.SOLANA,
      ChainKey.THORCHAIN,
    ],
    downloadUrl: "https://ctrl.xyz/",
    icon: <WalletSvg.Ctrl />,
    isAvailable: false,
    chainConnect: {},
  },
  [WalletKey.METAMASK]: {
    id: WalletKey.METAMASK,
    name: "MetaMask",
    chains: [ChainKey.AVALANCHE, ChainKey.BSCCHAIN, ChainKey.ETHEREUM],
    downloadUrl: "https://metamask.io/",
    icon: <WalletSvg.Metamask />,
    isAvailable: false,
    chainConnect: {},
  },
  [WalletKey.OKX]: {
    id: WalletKey.OKX,
    name: "OKX Wallet",
    chains: [
      ChainKey.AVALANCHE,
      ChainKey.BITCOIN,
      ChainKey.BSCCHAIN,
      ChainKey.ETHEREUM,
    ],
    downloadUrl: "https://www.okx.com/web3",
    icon: <WalletSvg.OKX />,
    isAvailable: false,
    chainConnect: {},
  },
  [WalletKey.PHANTOM]: {
    id: WalletKey.PHANTOM,
    name: "Phantom",
    chains: [ChainKey.ETHEREUM, ChainKey.SOLANA],
    downloadUrl: "https://phantom.app/",
    icon: <WalletSvg.Phantom />,
    isAvailable: false,
    chainConnect: {},
  },
  [WalletKey.VULTISIG]: {
    id: WalletKey.VULTISIG,
    name: "Vulticonnect",
    chains: [
      ChainKey.AVALANCHE,
      ChainKey.BSCCHAIN,
      ChainKey.ETHEREUM,
      ChainKey.THORCHAIN,
      ChainKey.BITCOIN,
      ChainKey.BITCOINCASH,
      ChainKey.DOGECOIN,
      ChainKey.LITECOIN,
    ],
    downloadUrl: "https://vultisig.com/",
    icon: <WalletSvg.Vultisig />,
    isAvailable: false,
    chainConnect: {},
  },
  [WalletKey.WALLETCONNECT]: {
    id: WalletKey.WALLETCONNECT,
    name: "WalletConnect",
    chains: [ChainKey.AVALANCHE, ChainKey.BSCCHAIN, ChainKey.ETHEREUM],
    icon: <WalletSvg.WalletConnect />,
    isAvailable: true,
    chainConnect: {
      [ProviderKey.EVM]: async () => (await connectWalletConnect()) as any,
    },
  },
};
