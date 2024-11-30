import { useCallback, useMemo } from "react";
import {
  ChainKey,
  SUPPORTED_WALLETS,
  WalletKey,
} from "@/utils/wallet/constants";
import { ChainType, WalletType } from "@/utils/interfaces";

interface UseWalletListReturn {
  detected: WalletType[];
  undetected: WalletType[];
  isWalletValidForChain: (wallet: WalletType) => boolean;
}

export function useWalletList(
  selectedChains: ChainType[] | []
): UseWalletListReturn {
  const { detected, undetected } = useMemo(() => {
    const detected: WalletType[] = [];
    const undetected: WalletType[] = [];
    const processedWallets = new Set<WalletKey>();

    const processWallet = (wallet: WalletType) => {
      if (processedWallets.has(wallet.id)) return;
      if (wallet.id === WalletKey.WALLETCONNECT) {
        undetected.push(wallet);
      } else if (wallet.isAvailable) {
        detected.push(wallet);
      } else {
        undetected.push(wallet);
      }
      processedWallets.add(wallet.id);
    };
    const walletList: WalletType[] = Object.values(
      SUPPORTED_WALLETS
    ) as WalletType[];
    const selectedChainKeys = new Set(
      selectedChains.map((chain) => chain.name)
    );
    const commonWallets = selectedChains.length
      ? walletList.filter((wallet) =>
          wallet.chains.some((chainKey) => selectedChainKeys.has(chainKey))
        )
      : walletList;

    commonWallets.forEach(processWallet);

    return { detected, undetected };
  }, [selectedChains]);

  const isWalletValidForChain = useCallback(
    (wallet: WalletType): boolean => {
      if (selectedChains.length) {
        const selectedChainKeys = new Set(
          selectedChains.map((chain) => chain.name)
        );
        return wallet.chains.some((chainKey: ChainKey) =>
          selectedChainKeys.has(chainKey)
        );
      } else {
        return true;
      }
    },
    [selectedChains]
  );

  return {
    detected,
    undetected,
    isWalletValidForChain,
  };
}
