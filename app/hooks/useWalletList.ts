import { useCallback, useMemo } from "react";
import { ChainType, WalletType } from "@/types/global";
import { SUPPORTED_WALLETS, WalletKey } from "@/utils/wallet/constants";

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
        processedWallets.add(wallet.id);
        return;
      }
      if (wallet.isAvailable) {
        detected.push(wallet);
      } else {
        undetected.push(wallet);
      }
      processedWallets.add(wallet.id);
    };
    if (selectedChains.length > 0) {
      const selectedChainKeys = selectedChains.map((chain) => chain.name);
      const commonWallets = Object.values(SUPPORTED_WALLETS).filter((wallet) =>
        selectedChainKeys.every((chainKey) => wallet.chains.includes(chainKey))
      );
      (commonWallets as unknown as WalletType[]).forEach(processWallet);
    } else {
      Object.values(SUPPORTED_WALLETS).forEach((wallet) =>
        processWallet(wallet)
      );
    }

    return { detected, undetected };
  }, [selectedChains, SUPPORTED_WALLETS]);

  const isWalletValidForChain = useCallback(
    (wallet: WalletType): boolean => {
      return selectedChains.every((chain) =>
        wallet.chains.includes(chain.name)
      );
      // if (!selectedChains.length) return true;
      // const chainWalletLists = selectedChains.map((chainId) => {
      //   return chainConfig.find((chain) => chain.id === chainId)?.wallets || [];
      // });

      // return chainWalletLists.every((wallets) =>
      //   wallets.some((wallet) => wallet.name === walletName)
      // );
    },
    [selectedChains]
  );
  return {
    detected,
    undetected,
    isWalletValidForChain,
  };
}
