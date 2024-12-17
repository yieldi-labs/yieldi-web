import { ChainType, WalletType } from "../interfaces";

export const isWalletValidForAllChains = (
  wallet: WalletType,
  selectedChains: ChainType[],
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
  chain: ChainType,
  selectedWallet?: WalletType,
): boolean => {
  if (!selectedWallet) {
    return true;
  }
  const isSupported = selectedWallet.chains.includes(chain.name);
  return isSupported;
};
