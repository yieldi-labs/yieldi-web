import {
  ChainKey,
  SUPPORTED_WALLETS,
  WalletKey,
} from "@/utils/wallet/constants";
import { ChainType, WalletType } from "@/utils/interfaces";
import { useMemo, useCallback, useEffect } from "react";
import { useAppState } from "@/utils/context";

interface UseWalletListReturn {
  detected: WalletType[];
  undetected: WalletType[];
  isWalletValidForChain: (wallet: WalletType) => boolean;
  isChainSupportedByWallet: (
    chain: ChainType,
    selectedWallet?: WalletType,
  ) => boolean;
}

export function useWalletList(): UseWalletListReturn {
  const { selectedChains, selectedWallet } = useAppState();
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
      SUPPORTED_WALLETS,
    ) as WalletType[];
    const commonWallets = selectedChains.length
      ? walletList.filter((wallet) => {
          return selectedChains.every((chain) =>
            wallet.chains.includes(chain.name),
          );
        })
      : walletList;
    commonWallets.forEach(processWallet);

    return { detected, undetected };
  }, [selectedChains]);

  const isWalletValidForChain = useCallback(
    (wallet: WalletType): boolean => {
      if (selectedChains.length) {
        const selectedChainKeys = new Set(
          selectedChains.map((chain) => chain.name),
        );
        return wallet.chains.some((chainKey: ChainKey) =>
          selectedChainKeys.has(chainKey),
        );
      } else {
        return true;
      }
    },
    [selectedChains],
  );

  const isChainSupportedByWallet = useCallback(
    (chain: ChainType): boolean => {
      if (!selectedWallet) {
        return true;
      }
      const isSupported = selectedWallet.chains.includes(chain.name);
      return isSupported;
    },
    [selectedWallet, selectedChains],
  );

  return {
    detected,
    undetected,
    isWalletValidForChain,
    isChainSupportedByWallet,
  };
}
