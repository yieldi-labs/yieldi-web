import { ChainSvg, WalletSvg } from "@/svg";
import {
  connectWalletConnect,
} from "./walletConnect";
import { GetConnectorsReturnType } from "wagmi/actions";
import { ChainType } from "@/types/global";

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
    chainId: 43_114,
  },
  {
    icon: <ChainSvg.Bitcoin />,
    name: ChainKey.BITCOIN,
    providerType: ProviderKey.BITCOIN,
  },
  {
    icon: <ChainSvg.BitcoinCash />,
    name: ChainKey.BITCOINCASH,
    providerType: ProviderKey.BITCOINCASH,
  },
  {
    icon: <ChainSvg.BSC />,
    name: ChainKey.BSCCHAIN,
    providerType: ProviderKey.EVM,
    chainId: 56,
  },
  {
    icon: <ChainSvg.Dogechain />,
    name: ChainKey.DOGECOIN,
    providerType: ProviderKey.DOGECOIN,
  },
  {
    icon: <ChainSvg.Ethereum />,
    name: ChainKey.ETHEREUM,
    providerType: ProviderKey.EVM,
    chainId: 1,
  },
  {
    icon: <ChainSvg.Litecoin />,
    name: ChainKey.LITECOIN,
    providerType: ProviderKey.LITECOIN,
  },
  {
    icon: <ChainSvg.Solana />,
    name: ChainKey.SOLANA,
    providerType: ProviderKey.SOLANA,
  },
  {
    icon: <ChainSvg.Thorchain />,
    name: ChainKey.THORCHAIN,
    providerType: ProviderKey.THORCHAIN,
  },
];

export const EVM_CHAINS: ChainType[] = [
  {
    icon: <ChainSvg.Avax />,
    name: ChainKey.AVALANCHE,
    providerType: ProviderKey.EVM,
    chainId: 43_114,
  },
  {
    icon: <ChainSvg.BSC />,
    name: ChainKey.BSCCHAIN,
    providerType: ProviderKey.EVM,
    chainId: 56,
  },
  {
    icon: <ChainSvg.Ethereum />,
    name: ChainKey.ETHEREUM,
    providerType: ProviderKey.EVM,
    chainId: 1,
  },
];

export let SUPPORTED_WALLETS = {
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
    // chainConnect: {
    //   [ProviderKey.EVM]: async (ethConnectors: GetConnectorsReturnType) =>
    //     await connectEVMWallet(window.xfi?.ethereum),

    //   // TODO - thorchain is not utxo
    //   [ProviderKey.THORCHAIN]: async () =>
    //     await connectUTXOWallet({
    //       id: "xdefi-thorchain",
    //       name: "CTRL Wallet",
    //       provider: window?.xfi?.thorchain,
    //     }),

    //   [ProviderKey.LITECOIN]: async () =>
    //     await connectUTXOWallet({
    //       id: "xdefi-ltc",
    //       name: "CTRL Wallet",
    //       provider: window?.xfi?.litecoin,
    //     }),

    //   [ProviderKey.DOGECOIN]: async () =>
    //     await connectUTXOWallet({
    //       id: "xdefi-doge",
    //       name: "CTRL Wallet",
    //       provider: window?.xfi?.dogecoin,
    //     }),

    //   [ProviderKey.BITCOIN]: async () =>
    //     await connectUTXOWallet({
    //       id: "xdefi-utxo",
    //       name: "CTRL Wallet",
    //       provider: window?.xfi?.bitcoin,
    //     }),

    //   [ProviderKey.BITCOINCASH]: async () =>
    //     await connectUTXOWallet({
    //       id: "xdefi-bch",
    //       name: "CTRL Wallet",
    //       provider: window?.xfi?.bitcoincash,
    //     }),
    // },
  },
  [WalletKey.METAMASK]: {
    id: WalletKey.METAMASK,
    name: "MetaMask",
    chains: [ChainKey.AVALANCHE, ChainKey.BSCCHAIN, ChainKey.ETHEREUM],
    downloadUrl: "https://metamask.io/",
    icon: <WalletSvg.Metamask />,
    // isDetected: (window: any) => window.ethereum?.isMetaMask,
    isAvailable: false,
    chainConnect: {},
    // chainConnect: {
    //   [ProviderKey.EVM]: async (ethConnectors: GetConnectorsReturnType) => {
    //     if (!ethConnectors) return;
    //     const connector = ethConnectors.find(
    //       (c) => c.id === WalletKey.METAMASK
    //     );
    //     if (!connector) return;
    //     return await connectEVMWallet(window.ethereum);
    //   },
    // },
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
    // isDetected: (window: any) => window.okxwallet,
    isAvailable: false,
    chainConnect: {},
    // chainConnect: {
    //   [ProviderKey.EVM]: async (ethConnectors: GetConnectorsReturnType) => {
    //     if (!ethConnectors) return;
    //     const connector = ethConnectors.find((c) => c.id === WalletKey.OKX);
    //     if (!connector) return;
    //     return await connectEVMWallet(window.ethereum);
    //   },
    //   [ProviderKey.BITCOIN]: async () =>
    //     await connectUTXOWallet({
    //       id: "okx-utxo",
    //       name: "OKX Wallet",
    //       provider: window.okxwallet.bitcoin,
    //     }),
    // },
  },
  [WalletKey.PHANTOM]: {
    id: WalletKey.PHANTOM,
    name: "Phantom",
    chains: [ChainKey.BITCOIN, ChainKey.ETHEREUM, ChainKey.SOLANA],
    downloadUrl: "https://phantom.app/",
    icon: <WalletSvg.Phantom />,
    // isDetected: (window: any) => window.phantom,
    isAvailable: false,
    chainConnect: {},
    // chainConnect: {
    //   [ProviderKey.EVM]: async (ethConnectors: GetConnectorsReturnType) => {
    //     if (!ethConnectors) return;
    //     const connector = ethConnectors.find((c) => c.id === WalletKey.PHANTOM);
    //     if (!connector) return;
    //     return await connectEVMWallet(window.phantom?.ethereum);
    //   },
    //   [ProviderKey.BITCOIN]: async () =>
    //     await connectUTXOWallet({
    //       id: "phantom-utxo",
    //       name: "Phantom Wallet",
    //       provider: window.phantom.bitcoin,
    //     }),
    //   [ProviderKey.SOLANA]: async () =>
    //     await connectUTXOWallet({
    //       id: "phantom-solana",
    //       name: "Phantom Wallet",
    //       provider: window.phantom.solana,
    //     }),
    // },
  },
  [WalletKey.VULTISIG]: {
    id: WalletKey.VULTISIG,
    name: "Vulticonnect",
    chains: [
      ChainKey.AVALANCHE,
      ChainKey.BSCCHAIN,
      ChainKey.ETHEREUM,
      ChainKey.THORCHAIN,
    ],
    downloadUrl: "https://vultisig.com/",
    icon: <WalletSvg.Vultisig />,
    // isDetected: (window: any) => window.vultisig,
    isAvailable: false,
    chainConnect: {},
    // chainConnect: {
    //   [ProviderKey.EVM]: async (ethConnectors: GetConnectorsReturnType) =>
    //     await connectEVMWallet(window.vultisig?.ethereum),
    //   [ProviderKey.THORCHAIN]: async () =>
    //     await connectUTXOWallet({
    //       id: "vultisig-thorchain",
    //       name: "Vultisig",
    //       provider: window.thorchain || window.vultisig?.thorchain,
    //     }),
    // },
  },
  [WalletKey.WALLETCONNECT]: {
    id: WalletKey.WALLETCONNECT,
    name: "WalletConnect",
    chains: [ChainKey.AVALANCHE, ChainKey.BSCCHAIN, ChainKey.ETHEREUM],
    icon: <WalletSvg.WalletConnect />,
    isAvailable: true,
    chainConnect: {
      [ProviderKey.EVM]: async (ethConnectors: GetConnectorsReturnType) =>
        (await connectWalletConnect()) as any,
    },
  },
};
