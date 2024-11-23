import { useCallback, useMemo } from "react";
import { chainConfig } from "@/utils/wallet/chainConfig";

interface UseWalletListReturn {
  detected: WalletOption[];
  undetected: WalletOption[];
  isWalletValidForChain: (walletName: string) => boolean;
}

export function useWalletList(
  selectedChains: string[] | [],
  detectedWallets: WalletOption[]
): UseWalletListReturn {
  const { detected, undetected } = useMemo(() => {
    const detected: WalletOption[] = [];
    const undetected: WalletOption[] = [];
    const processedWallets = new Set();

    const processWallet = (wallet: WalletOption) => {
      const baseId = wallet.id.split("-")[0];
      if (processedWallets.has(baseId)) return;

      if (wallet.id === "walletConnect") {
        undetected.push(wallet);
        processedWallets.add(baseId);
        return;
      }

      const isDetected = detectedWallets.some((w) => {
        const detectedBaseId = w.id.split("-")[0];
        return detectedBaseId === baseId;
      });

      if (isDetected) {
        detected.push(wallet);
      } else {
        undetected.push(wallet);
      }
      processedWallets.add(baseId);
    };

    if (selectedChains.length) {
      const test = chainConfig.filter(
        ({ id }) => selectedChains.findIndex((item) => item === id) >= 0
      );
      const chainWalletLists = selectedChains.map((chainId) => {
        return chainConfig.find((chain) => chain.id === chainId)?.wallets || [];
      });

      const commonWallets = chainWalletLists.reduce<WalletOption[]>(
        (common, wallets) => {
          return common.filter((w) => {
            return wallets.some(
              (wallet) => wallet.id.split("-")[0] === w.id.split("-")[0]
            );
          });
        },
        chainWalletLists[0] || []
      );

      commonWallets.forEach(processWallet);
    } else {
      chainConfig.forEach((chain) => {
        chain.wallets.forEach(processWallet);
      });
    }

    return { detected, undetected };
  }, [selectedChains, detectedWallets]);

  const isWalletValidForChain = useCallback(
    (walletName: string): boolean => {
      if (!selectedChains.length) return true;
      const chainWalletLists = selectedChains.map((chainId) => {
        return chainConfig.find((chain) => chain.id === chainId)?.wallets || [];
      });

      return chainWalletLists.every((wallets) =>
        wallets.some((wallet) => wallet.name === walletName)
      );
    },
    [selectedChains]
  );
  return {
    detected,
    undetected,
    isWalletValidForChain,
  };
}
