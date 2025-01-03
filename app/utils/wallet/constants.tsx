import { ChainSvg, WalletSvg } from "@/svg";
import { ChainType, WalletType } from "../interfaces";

export enum ChainKey {
  AVALANCHE = "Avalanche",
  BITCOIN = "Bitcoin",
  BITCOINCASH = "BitcoinCash",
  BSCCHAIN = "BSC",
  DOGECOIN = "Dogecoin",
  ETHEREUM = "Ethereum",
  GAIACHAIN = "Cosmos",
  LITECOIN = "Litecoin",
  THORCHAIN = "THORChain",
}
export enum ProviderKey {
  EVM = "evm",
  ETHEREUM = "ethereum",
  AVALANCHE = "avalanche",
  BINANCESMARTCHAIN = "binancesmartchain",
  BITCOIN = "bitcoin",
  DOGECOIN = "dogecoin",
  LITECOIN = "litecoin",
  BITCOINCASH = "bitcoincash",
  SOLANA = "solana",
  THORCHAIN = "thorchain",
  COSMOS = "cosmos",
}
export enum WalletKey {
  CTRL = "xdefi",
  METAMASK = "metaMask",
  OKX = "okx",
  PHANTOM = "phantom",
  VULTISIG = "vultisig",
  WALLETCONNECT = "walletConnect",
  LEDGER = "ledger",
}

export const CHAINS: ChainType[] = [
  {
    icon: <ChainSvg.Avax />,
    name: ChainKey.AVALANCHE,
    providerType: ProviderKey.AVALANCHE,
    thorchainIdentifier: "avax",
    nativeAsset: "avax",
    chainId: "0xa86a",
    addressUrl: "https://snowtrace.dev/address/{wallet}",
    ctrlChainId: "avalanche",
  },
  {
    icon: <ChainSvg.Bitcoin />,
    name: ChainKey.BITCOIN,
    providerType: ProviderKey.BITCOIN,
    thorchainIdentifier: "btc",
    nativeAsset: "btc",
    addressUrl: "https://www.blockchain.com/btc/address/{wallet}",
    ctrlChainId: "bitcoin",
  },
  {
    icon: <ChainSvg.BitcoinCash />,
    name: ChainKey.BITCOINCASH,
    providerType: ProviderKey.BITCOINCASH,
    thorchainIdentifier: "bch",
    nativeAsset: "bch",
    addressUrl: "https://www.blockchain.com/bch/address/{wallet}",
    ctrlChainId: "bitcoincash",
  },
  {
    icon: <ChainSvg.BSC />,
    name: ChainKey.BSCCHAIN,
    providerType: ProviderKey.BINANCESMARTCHAIN,
    chainId: "0x38",
    thorchainIdentifier: "bsc",
    nativeAsset: "bnb",
    addressUrl: "https://bscscan.com/address/{wallet}",
    ctrlChainId: "binanceSmartChain",
  },
  {
    icon: <ChainSvg.Cosmos />,
    name: ChainKey.GAIACHAIN,
    providerType: ProviderKey.COSMOS,
    thorchainIdentifier: "gaia",
    nativeAsset: "atom",
    addressUrl: "https://mintscan.io/cosmos/address/{wallet}",
    ctrlChainId: "cosmos",
  },
  {
    icon: <ChainSvg.Dogechain />,
    name: ChainKey.DOGECOIN,
    providerType: ProviderKey.DOGECOIN,
    thorchainIdentifier: "doge",
    nativeAsset: "doge",
    addressUrl: "https://dogechain.info/address/{wallet}",
    ctrlChainId: "dogecoin",
  },
  {
    icon: <ChainSvg.Ethereum />,
    name: ChainKey.ETHEREUM,
    providerType: ProviderKey.ETHEREUM,
    chainId: "0x1",
    thorchainIdentifier: "eth",
    nativeAsset: "eth",
    addressUrl: "https://etherscan.io/address/{wallet}",
    ctrlChainId: "ethereum",
  },
  {
    icon: <ChainSvg.Litecoin />,
    name: ChainKey.LITECOIN,
    providerType: ProviderKey.LITECOIN,
    thorchainIdentifier: "ltc",
    nativeAsset: "ltc",
    addressUrl: "https://ltc.bitaps.com/{wallet}",
    ctrlChainId: "litecoin",
  },
  // {
  //   icon: <ChainSvg.Solana />,
  //   name: ChainKey.SOLANA,
  //   providerType: ProviderKey.SOLANA,
  //   thorchainIdentifier: "sol",
  //   nativeAsset: "sol",
  //   addressUrl: "https://solscan.io/account/{wallet}",
  // },
  {
    icon: <ChainSvg.Thorchain />,
    name: ChainKey.THORCHAIN,
    providerType: ProviderKey.THORCHAIN,
    thorchainIdentifier: "thor",
    nativeAsset: "rune",
    addressUrl: "https://runescan.io/address/{wallet}",
    ctrlChainId: "thorchain",
  },
];

// TODO: Duplicate info on CHAINs array. Remove this as part of https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration
export const EVM_CHAINS: ChainType[] = [
  {
    icon: <ChainSvg.Avax />,
    name: ChainKey.AVALANCHE,
    providerType: ProviderKey.AVALANCHE,
    chainId: "0xa86a",
    thorchainIdentifier: "avax",
    nativeAsset: "avax",
    addressUrl: "https://snowtrace.dev/address/{wallet}",
    ctrlChainId: "avalanche",
  },
  {
    icon: <ChainSvg.BSC />,
    name: ChainKey.BSCCHAIN,
    providerType: ProviderKey.BINANCESMARTCHAIN,
    chainId: "0x38",
    thorchainIdentifier: "bsc",
    nativeAsset: "bnb",
    addressUrl: "https://bscscan.com/address/{wallet}",
    ctrlChainId: "binanceSmartChain",
  },
  {
    icon: <ChainSvg.Ethereum />,
    name: ChainKey.ETHEREUM,
    providerType: ProviderKey.ETHEREUM,
    chainId: "0x1",
    thorchainIdentifier: "eth",
    nativeAsset: "eth",
    addressUrl: "https://etherscan.io/address/{wallet}",
    ctrlChainId: "ethereum",
  },
];

export const SUPPORTED_WALLETS: Record<WalletKey, WalletType> = {
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
      ChainKey.THORCHAIN,
      ChainKey.GAIACHAIN,
    ],
    downloadUrl: "https://ctrl.xyz/",
    icon: <WalletSvg.Ctrl />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    chainConnect: {},
  },
  [WalletKey.METAMASK]: {
    id: WalletKey.METAMASK,
    name: "MetaMask",
    chains: [ChainKey.AVALANCHE, ChainKey.BSCCHAIN, ChainKey.ETHEREUM],
    downloadUrl: "https://metamask.io/",
    icon: <WalletSvg.Metamask />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
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
      ChainKey.GAIACHAIN,
    ],
    downloadUrl: "https://www.okx.com/web3",
    icon: <WalletSvg.OKX />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    chainConnect: {},
  },
  [WalletKey.PHANTOM]: {
    id: WalletKey.PHANTOM,
    name: "Phantom",
    chains: [ChainKey.ETHEREUM, ChainKey.BITCOIN],
    downloadUrl: "https://phantom.app/",
    icon: <WalletSvg.Phantom />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
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
      ChainKey.GAIACHAIN,
    ],
    downloadUrl: "https://vultisig.com/",
    icon: <WalletSvg.Vultisig />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    chainConnect: {},
  },
  [WalletKey.WALLETCONNECT]: {
    id: WalletKey.WALLETCONNECT,
    name: "WalletConnect",
    chains: [ChainKey.AVALANCHE, ChainKey.BSCCHAIN, ChainKey.ETHEREUM],
    icon: <WalletSvg.WalletConnect />,
    downloadUrl: "https://walletconnect.network/",
    isAvailable: true,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: false,
    hasSupportToSelectChains: false,
    chainConnect: {},
  },
  [WalletKey.LEDGER]: {
    id: WalletKey.LEDGER,
    name: "Ledger",
    chains: [
      ChainKey.AVALANCHE,
      ChainKey.BITCOIN,
      ChainKey.BITCOINCASH,
      ChainKey.BSCCHAIN,
      ChainKey.DOGECOIN,
      ChainKey.ETHEREUM,
      ChainKey.LITECOIN,
      ChainKey.THORCHAIN,
      ChainKey.GAIACHAIN,
    ],
    downloadUrl: "https://www.ledger.com/",
    icon: <WalletSvg.Ledger />,
    isAvailable: false,
    isHardware: true,
    hasSupportMultichain: false,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    chainConnect: {},
  },
};
