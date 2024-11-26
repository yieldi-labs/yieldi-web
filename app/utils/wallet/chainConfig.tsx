import { ChainSvg, WalletSvg } from "@/svg";
import { avalanche, bsc, mainnet } from "wagmi/chains";
import { connectEVMWallet, connectUTXOWallet } from "./walletConnect";
import { GetConnectorsReturnType } from "wagmi/actions";

// NOTE: to add another asset or wallet, you must update both SUPPORTED_WALLETS and SUPPORTED_CHAINS.

type WalletId =
  'vultisig' |
  'metamask' |
  'okx' |
  'xdefi' |
  'phantom' |
  'walletConnect';

type WalletConfig = {
  id: WalletId;
  name: string;
  icon: JSX.Element;
  downloadUrl: string;
  chains: Set<ChainId>;

  isDetected: () => boolean;

  // TODO: Replace with proper return type. string | void is not correct
  chainConnect: { [key in ChainType]?: (ethConnectors?: GetConnectorsReturnType) => Promise<any> };
}

export const SUPPORTED_WALLETS: { [key in WalletId]: WalletConfig } = {
  'vultisig': {
    id: 'vultisig',
    name: "Vultisig",
    icon: <WalletSvg.Vultisig />,
    downloadUrl: "https://vultisig.com/",
    isDetected: () => window.thorchain || window.vultisig?.thorchain,
    chains: new Set<ChainId>(['thorchain', 'ethereum']),
    chainConnect: {
      'evm': async () => await connectEVMWallet(window.vultisig?.ethereum),

      // TODO - thorchain is not utxo
      'thorchain': async () => await connectUTXOWallet({
        id: "vultisig-thorchain",
        name: "Vultisig",
        provider: window.thorchain || window.vultisig?.thorchain,
      }),
    },
  },
  'metamask': {
    id: 'metamask',
    name: "MetaMask",
    icon: <WalletSvg.Metamask />,
    downloadUrl: "https://metamask.io/",
    chains: new Set<ChainId>(['ethereum']),
    isDetected: () => window.ethereum?.isMetaMask,
    chainConnect: {
      'evm': async (ethConnectors) => {
        if (!ethConnectors) return;
        const connector = ethConnectors.find((c) => c.id === "metaMask");
        if (!connector) return;
        return await connectEVMWallet(window.vultisig?.ethereum);
      },
    }
  },

  // TODO: complete the rest of the config
}

type ChainId =
  'bitcoin' |
  'dogecoin' |
  'bitcoincash' |
  'litecoin' |
  'solana' |
  'ethereum' |
  'avalanche' |
  'thorchain' |
  'binance-smart-chain';

type ChainType =
  'utxo' |
  'evm' |
  'svm' |
  'thorchain';

type ChainConfig = {
  id: ChainId;
  name: string;
  chainId?: number;
  type: ChainType;
  icon: JSX.Element;
  wallets: Set<WalletId>;
}

export const SUPPORTED_CHAINS: { [key in ChainId]: ChainConfig } = {
  'bitcoin': {
    id: "bitcoin",
    name: "Bitcoin",
    type: 'utxo',
    icon: <ChainSvg.Bitcoin />,
    wallets: new Set<WalletId>([
      'okx',
      'xdefi',
      'phantom',
    ]),
  },
  'dogecoin': {
    id: "dogecoin",
    name: "Dogecoin",
    type: 'utxo',
    icon: <ChainSvg.Dogechain />,
    wallets: new Set<WalletId>([
      'okx',
      'xdefi',
      'phantom',
    ]),
  },
  'bitcoincash': {
    id: "bitcoincash",
    name: "Bitcoin Cash",
    type: 'utxo',
    icon: <ChainSvg.BitcoinCash />,
    wallets: new Set<WalletId>([
      'okx',
      'xdefi',
      'phantom',
    ]),
  },
  'litecoin': {
    id: "litecoin",
    name: "Litecoin",
    type: 'utxo',
    icon: <ChainSvg.Litecoin />,
    wallets: new Set<WalletId>([
      'okx',
      'xdefi',
      'phantom',
    ]),
  },
  'thorchain': {
    id: "thorchain",
    name: "THORChain",
    icon: <ChainSvg.Thorchain />,
    type: 'thorchain',
    wallets: new Set<WalletId>([
      'xdefi',
      'vultisig',
    ]),
  },
  'solana': {
    id: "solana",
    name: "Solana",
    icon: <ChainSvg.Solana />,
    type: 'svm',
    wallets: new Set<WalletId>([
      'phantom',
    ]),
  },
  'ethereum': {
    id: "ethereum",
    name: "Ethereum",
    type: 'evm',
    icon: <ChainSvg.Ethereum />,
    chainId: mainnet.id,
    wallets: new Set<WalletId>([
      'vultisig',
      'phantom',
      'metamask',
      'walletConnect',
      'okx',
      'xdefi',
    ]),
  },
  'binance-smart-chain': {
    id: "binance-smart-chain",
    name: "BSC",
    type: 'evm',
    icon: <ChainSvg.BSC />,
    chainId: bsc.id,
    wallets: new Set<WalletId>([
      'vultisig',
      'metamask',
      'walletConnect',
      'okx',
      'xdefi',
    ]),
  },
  'avalanche': {
    id: "avalanche",
    name: "Avalanche",
    type: 'evm',
    icon: <ChainSvg.Avax />,
    chainId: avalanche.id,
    wallets: new Set<WalletId>([
      'vultisig',
      'metamask',
      'walletConnect',
      'okx',
      'xdefi',
    ]),
  },
}


// Goals
// 1. Easy enumeration of each supported chain
Object.values(SUPPORTED_CHAINS);

// 2. Easy enumeration of each supported wallet
const walletList = Object.values(SUPPORTED_WALLETS)

// 3. Given a set of chains, enable supported wallets and disable the rest
const selectedChains: ChainId[] = [
  'bitcoin',
  'ethereum',
]
let intersectedChainWallets = new Set<WalletId>([]);
for (const chain of selectedChains) {
  const chainWallets = SUPPORTED_CHAINS[chain].wallets;
  if (intersectedChainWallets.size === 0) {
    intersectedChainWallets = chainWallets
    continue
  }
  intersectedChainWallets = intersectedChainWallets.intersection(chainWallets)
}
const WalletButton = ({ }: { wallet: WalletConfig; disabled: boolean; }) => <div />
walletList.map(wallet => <WalletButton wallet={wallet} disabled={!intersectedChainWallets.has(wallet.id)} />)

// 4. Given a set of wallets, enable supported chains
// You basically need to do the same thing as (3)

// 5. Simplify wallet detection
walletList.filter(wallet => wallet.isDetected()); // detected
walletList.filter(wallet => !wallet.isDetected()); // non-detected

// 6. Simplify wallet connection
const selectedWallets: WalletId[] = [ // should be subset of intersected wallets since the user can only select 1 wallet
  'vultisig',
];
for (const walletId of selectedWallets) {
  for (const chainId of selectedChains) {
    const wallet = SUPPORTED_WALLETS[walletId];
    const chain = SUPPORTED_CHAINS[chainId];
    const connectFn = wallet.chainConnect[chain.type];
    if (!connectFn) continue;
    connectFn(); // use async/await
  }
}
