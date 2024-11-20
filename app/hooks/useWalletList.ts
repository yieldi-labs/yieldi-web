interface UseWalletListReturn {
  detected: WalletOption[];
  undetected: WalletOption[];
  isWalletValidForChain: (walletName: string) => boolean;
}

export function useWalletList(
  _selectedChain: string | null,
  detectedWallets: WalletOption[],
): UseWalletListReturn {

  return {
    detected: detectedWallets,
    undetected: [],
    isWalletValidForChain: (_: string) => true,
  };
}
