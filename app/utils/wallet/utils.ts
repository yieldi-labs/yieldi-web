import { ChainInfo, WalletType } from "../interfaces";
import { ThorchainIdentifiers } from "./constants";

export const isWalletValidForAllChains = (
  wallet: WalletType,
  selectedChains: ChainInfo[],
): boolean => {
  if (selectedChains.length) {
    const selectedChainKeys = new Set(
      selectedChains.map((chain) => chain.name),
    );
    return Array.from(selectedChainKeys).every((chainKey) =>
      wallet.chains.includes(chainKey),
    );
  } else {
    return true;
  }
};

export const isChainSupportedByWallet = (
  chain: ChainInfo,
  selectedWallet?: WalletType,
): boolean => {
  if (!selectedWallet) {
    return true;
  }
  const isSupported = selectedWallet.chains.includes(chain.name);
  return isSupported;
};

export const getTransactionUrl = () => {
  if (process.env.NEXT_PUBLIC_IS_STAGENET) {
    return "https://stagenet.thorchain.net/tx/";
  }
  return "https://thorchain.net/tx/";
};

export const getAddressUrl = () => {
  if (process.env.NEXT_PUBLIC_IS_STAGENET) {
    return "https://stagenet.thorchain.net/address/";
  }
  return "https://thorchain.net/address/";
};

const networkPatterns: Record<ThorchainIdentifiers, RegExp> = {
  [ThorchainIdentifiers.AVAX]: /^(0x[a-fA-F0-9]{40})$/,
  [ThorchainIdentifiers.BTC]: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
  [ThorchainIdentifiers.BCH]: /^(q|p)[a-z0-9]{41}$/,
  [ThorchainIdentifiers.BSC]: /^(0x[a-fA-F0-9]{40})$/,
  [ThorchainIdentifiers.ETH]: /^(0x[a-fA-F0-9]{40})$/,
  [ThorchainIdentifiers.LTC]: /^(L|M|ltc1)[a-zA-HJ-NP-Z0-9]{25,39}$/,
  [ThorchainIdentifiers.THOR]: /^(thor1|sthor1)[a-z0-9]{38}$/,
  [ThorchainIdentifiers.GAIA]: /^cosmos1[a-z0-9]{38}$/,
  [ThorchainIdentifiers.DOGE]: /^(D|A)[a-zA-HJ-NP-Z0-9]{25,34}$/,
  [ThorchainIdentifiers.BASE]: /^(0x[a-fA-F0-9]{40})$/,
};

export function identifyNetworks(address: string): ThorchainIdentifiers[] {
  return Object.entries(networkPatterns)
    .filter(([, regex]) => regex.test(address))
    .map(([network]) => network as ThorchainIdentifiers);
}

export function generateEmptyAddressObject(): Record<
  ThorchainIdentifiers,
  string
> {
  return Object.keys(ThorchainIdentifiers).reduce<
    Record<ThorchainIdentifiers, string>
  >(
    (emptyAddresses, network) => {
      emptyAddresses[network as ThorchainIdentifiers] = "";
      return emptyAddresses;
    },
    {} as Record<ThorchainIdentifiers, string>,
  );
}
