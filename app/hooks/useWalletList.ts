import { useCallback, useMemo } from "react";
import { chainConfig } from "@/utils/wallet/chainConfig";

interface UseWalletListReturn {
  detected: WalletOption[];
  undetected: WalletOption[];
  isWalletValidForChain: (walletName: string) => boolean;
}

export function useWalletList(
  selectedChain: string | null,
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

    if (selectedChain) {
      const chainWallets =
        chainConfig.find((chain) => selectedChain === chain.id)?.wallets || [];
      chainWallets.forEach(processWallet);
    } else {
      chainConfig.forEach((chain) => {
        chain.wallets.forEach(processWallet);
      });
    }

    return { detected, undetected };
  }, [selectedChain, detectedWallets]);

  const isWalletValidForChain = useCallback(
    (walletName: string): boolean => {
      if (!selectedChain) return true;
      const chainWallets =
        chainConfig.find((chain) => selectedChain === chain.id)?.wallets || [];
      return chainWallets.some((w) => w.name === walletName);
    },
    [selectedChain]
  );

  return {
    detected,
    undetected,
    isWalletValidForChain,
  };
}
