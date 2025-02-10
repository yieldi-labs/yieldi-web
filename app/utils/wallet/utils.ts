import { ChainInfo, WalletType } from "../interfaces";

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
}

export const getAddressUrl = () => {
  if (process.env.NEXT_PUBLIC_IS_STAGENET) {
    return "https://stagenet.thorchain.net/address/";
  }
  return "https://thorchain.net/address/";
}