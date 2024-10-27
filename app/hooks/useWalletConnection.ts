import { useState, useEffect } from "react";
import { detectWallets } from "@/utils/wallet/detectedWallets";
import { chainConfig } from "@/utils/wallet/chainConfig";

export function useWalletConnection(
  setWalletState: any,
  toggleWalletModal: () => void,
) {
  const [selectedChain, setSelectedChain] = useState<string | null>("bitcoin");
  const [detectedWallets, setDetectedWallets] = useState<WalletOption[]>([]);

  useEffect(() => {
    const wallets = detectWallets();
    const walletsWithIcons = wallets
      .map((detectedWallet) => {
        for (const chain of chainConfig) {
          const matchingWallet = chain.wallets.find(
            (w) => w.id === detectedWallet.id,
          );
          if (matchingWallet) {
            return {
              ...detectedWallet,
              icon: matchingWallet.icon,
              name: matchingWallet.name,
              downloadUrl: matchingWallet.downloadUrl,
            };
          }
        }
        return null;
      })
      .filter((w): w is NonNullable<typeof w> => w !== null);

    setDetectedWallets(walletsWithIcons);
  }, []);

  const handleConnect = async (wallet: WalletOption) => {
    if (!selectedChain) {
      console.error("No chain selected.");
      return;
    }

    try {
      const detectedWalletForChain = detectedWallets.find((w) => {
        if (
          selectedChain === "bitcoin" &&
          (w.id.includes("utxo") || wallet.id.includes("utxo"))
        ) {
          return w.id === wallet.id;
        }
        return w.id.split("-")[0] === wallet.id.split("-")[0];
      });

      if (!detectedWalletForChain) {
        window.open(wallet.downloadUrl, "_blank");
        return;
      }

      const connectedWallet = await detectedWalletForChain.connect();
      setWalletState({
        provider: connectedWallet.provider,
        address: connectedWallet.address,
        network: selectedChain,
      });
      toggleWalletModal();
    } catch (error) {
      console.error(`Error connecting to ${wallet.name}:`, error);
    }
  };

  return {
    selectedChain,
    setSelectedChain,
    handleConnect,
    detectedWallets,
  };
}
