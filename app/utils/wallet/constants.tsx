import { WalletSvg } from "@/svg";
import { ChainInfo, ChainType, WalletType } from "../interfaces";
import {
  Avax,
  Base,
  Bitcoin,
  BitcoinCash,
  BSC,
  Cosmos,
  Dogechain,
  Ethereum,
  Litecoin,
  Thorchain,
} from "@/svg/chains";

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
  BASE = "Base",
}
export enum ProviderKey {
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
  BASE = "Base",
}
export enum WalletKey {
  CTRL = "xdefi",
  METAMASK = "metaMask",
  OKX = "okx",
  PHANTOM = "phantom",
  VULTISIG = "vultisig",
  WALLETCONNECT = "walletConnect",
  LEDGER = "ledger",
  LEAP = "leap",
}

export enum ThorchainIdentifiers {
  AVAX = "AVAX",
  BTC = "BTC",
  BCH = "BCH",
  BSC = "BSC",
  ETH = "ETH",
  LTC = "LTC",
  THOR = "THOR",
  GAIA = "GAIA",
  DOGE = "DOGE",
  BASE = "BASE",
}

export const CHAINS: ChainInfo[] = [
  {
    icon: Avax,
    name: ChainKey.AVALANCHE,
    providerType: ProviderKey.AVALANCHE,
    thorchainIdentifier: ThorchainIdentifiers.AVAX,
    nativeAsset: "avax",
    nativeDecimals: 18,
    chainId: "0xa86a",
    addressUrl: "https://snowtrace.dev/address/{wallet}",
    ctrlChainId: "avalanche",
    type: ChainType.EVM,
  },
  {
    icon: Bitcoin,
    name: ChainKey.BITCOIN,
    providerType: ProviderKey.BITCOIN,
    thorchainIdentifier: ThorchainIdentifiers.BTC,
    nativeAsset: "btc",
    nativeDecimals: 8,
    addressUrl: "https://www.blockchain.com/btc/address/{wallet}",
    ctrlChainId: "bitcoin",
    type: ChainType.UTXO,
  },
  {
    icon: BitcoinCash,
    name: ChainKey.BITCOINCASH,
    providerType: ProviderKey.BITCOINCASH,
    thorchainIdentifier: ThorchainIdentifiers.BCH,
    nativeAsset: "bch",
    nativeDecimals: 8,
    addressUrl: "https://www.blockchain.com/bch/address/{wallet}",
    ctrlChainId: "bitcoincash",
    type: ChainType.UTXO,
  },
  {
    icon: BSC,
    name: ChainKey.BSCCHAIN,
    providerType: ProviderKey.BINANCESMARTCHAIN,
    chainId: "0x38",
    thorchainIdentifier: ThorchainIdentifiers.BSC,
    nativeAsset: "bnb",
    nativeDecimals: 18,
    addressUrl: "https://bscscan.com/address/{wallet}",
    ctrlChainId: "binanceSmartChain",
    type: ChainType.EVM,
    addChainRequestPayload: {
      chainId: "0x38",
      chainName: "Binance Smart Chain",
      rpcUrls: ["https://bsc-dataseed.binance.org"],
      iconUrls: [],
      nativeCurrency: {
        name: "Binance Smart Chain",
        symbol: "BNB",
        decimals: 18,
      },
      blockExplorerUrls: ["https://bscscan.com"],
    },
  },
  {
    icon: Cosmos,
    name: ChainKey.GAIACHAIN,
    providerType: ProviderKey.COSMOS,
    thorchainIdentifier: ThorchainIdentifiers.GAIA,
    nativeAsset: "atom",
    nativeDecimals: 6,
    addressUrl: "https://mintscan.io/cosmos/address/{wallet}",
    ctrlChainId: "cosmos",
    type: ChainType.BFT,
  },
  {
    icon: Dogechain,
    name: ChainKey.DOGECOIN,
    providerType: ProviderKey.DOGECOIN,
    thorchainIdentifier: ThorchainIdentifiers.DOGE,
    nativeAsset: "doge",
    nativeDecimals: 8,
    addressUrl: "https://dogechain.info/address/{wallet}",
    ctrlChainId: "dogecoin",
    type: ChainType.UTXO,
  },
  {
    icon: Ethereum,
    name: ChainKey.ETHEREUM,
    providerType: ProviderKey.ETHEREUM,
    chainId: "0x1",
    thorchainIdentifier: ThorchainIdentifiers.ETH,
    nativeAsset: "eth",
    nativeDecimals: 18,
    addressUrl: "https://etherscan.io/address/{wallet}",
    ctrlChainId: "ethereum",
    type: ChainType.EVM,
  },
  {
    icon: Litecoin,
    name: ChainKey.LITECOIN,
    providerType: ProviderKey.LITECOIN,
    thorchainIdentifier: ThorchainIdentifiers.LTC,
    nativeAsset: "ltc",
    nativeDecimals: 8,
    addressUrl: "https://ltc.bitaps.com/{wallet}",
    ctrlChainId: "litecoin",
    type: ChainType.UTXO,
  },
  {
    icon: Thorchain,
    name: ChainKey.THORCHAIN,
    providerType: ProviderKey.THORCHAIN,
    thorchainIdentifier: ThorchainIdentifiers.THOR,
    nativeAsset: "rune",
    nativeDecimals: 8,
    addressUrl: "https://runescan.io/address/{wallet}",
    ctrlChainId: "thorchain",
    type: ChainType.BFT,
  },
  {
    icon: Base,
    name: ChainKey.BASE,
    providerType: ProviderKey.BASE,
    thorchainIdentifier: ThorchainIdentifiers.BASE,
    nativeAsset: "-",
    nativeDecimals: 18,
    addressUrl: "https://basescan.org/address/{wallet}",
    chainId: "0x2105",
    ctrlChainId: "base",
    type: ChainType.EVM,
    addChainRequestPayload: {
      chainId: "0x2105",
      chainName: "Base",
      rpcUrls: ["https://mainnet.base.org"],
      iconUrls: ["https://www.base.org/_next/static/media/logo.f6fdedfc.svg"],
      nativeCurrency: {
        name: "eth",
        symbol: "eth",
        decimals: 18,
      },
      blockExplorerUrls: ["https://basescan.org"],
    },
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
      ChainKey.BASE,
    ],
    downloadUrl: "https://ctrl.xyz/",
    icon: <WalletSvg.Ctrl />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    hasSupportStagenet: false,
    chainConnect: {},
  },
  [WalletKey.METAMASK]: {
    id: WalletKey.METAMASK,
    name: "MetaMask",
    chains: [
      ChainKey.AVALANCHE,
      ChainKey.BSCCHAIN,
      ChainKey.ETHEREUM,
      ChainKey.BASE,
    ],
    downloadUrl: "https://metamask.io/",
    icon: <WalletSvg.Metamask />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    hasSupportStagenet: false,
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
    hasSupportStagenet: false,
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
    hasSupportStagenet: false,
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
      ChainKey.BASE,
    ],
    downloadUrl: "https://vultisig.com/",
    icon: <WalletSvg.Vultisig />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    hasSupportStagenet: false,
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
    hasSupportStagenet: false,
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
    hasSupportStagenet: false,
    chainConnect: {},
  },
  [WalletKey.LEAP]: {
    id: WalletKey.LEAP,
    name: "Leap",
    chains: [
      ChainKey.THORCHAIN,
      ChainKey.GAIACHAIN
    ],
    downloadUrl: "https://www.leapwallet.io/",
    icon: <WalletSvg.Leap />,
    isAvailable: false,
    isHardware: false,
    hasSupportMultichain: true,
    hasSupportToAddConectionToExistingConnection: true,
    hasSupportToSelectChains: true,
    hasSupportStagenet: true,
    chainConnect: {},
  },
};
