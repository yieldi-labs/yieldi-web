import { useState, useEffect } from "react";
import { detectWallets } from "@/utils/wallet/detectedWallets";
import { chainConfig } from "@/utils/wallet/chainConfig";
import { useConnectors, useSwitchChain } from "wagmi";

export function useWalletConnection(
  setWalletState: any,
  toggleWalletModal: () => void
) {
  const { switchChain } = useSwitchChain();
  const ethConnectors = useConnectors();
  const [selectedChain, setSelectedChain] = useState<string | null>("bitcoin");
  const [detectedWallets, setDetectedWallets] = useState<WalletOption[]>([]);

  useEffect(() => {
    const wallets = detectWallets(ethConnectors);
    const walletsWithIcons = wallets
      .map((detectedWallet) => {
        for (const chain of chainConfig) {
          const matchingWallet = chain.wallets.find(
            (w) => w.id === detectedWallet.id
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
      const chainIdentifiers: Record<string, string> = {
        solana: "solana",
        thorchain: "thorchain",
        litecoin: "ltc",
        dogecoin: "doge",
        bitcoincash: "bch",
        bitcoin: "utxo",
      };

      const detectedWalletForChain = detectedWallets.find((w) => {
        const identifier = chainIdentifiers[selectedChain];

        if (!identifier) {
          return w.id.split("-")[0] === wallet.id.split("-")[0];
        }

        return (
          (w.id.includes(identifier) || wallet.id.includes(identifier)) &&
          w.id === wallet.id
        );
      });

      if (!detectedWalletForChain) {
        window.open(wallet.downloadUrl, "_blank");
        return;
      }

      const selectedChainConfig = chainConfig.find(
        (chain) => chain.id === selectedChain
      );

      const isNonEVM = detectedWalletForChain.id.includes("-");
      const isVultisig = detectedWalletForChain.id.includes("vultisig");
      const connectedWallet = await detectedWalletForChain.connect();

      const provider =
        isVultisig || isNonEVM
          ? connectedWallet.provider
          : await connectedWallet.provider.getProvider();

      const vultiChainId = isVultisig
        ? await connectedWallet.provider.request({
            method: "eth_chainId",
          })
        : undefined;

      const chainId = isVultisig
        ? vultiChainId
        : isNonEVM
          ? undefined
          : await connectedWallet.provider.getChainId();

      if (selectedChainConfig?.chainId) {
        if (chainId !== selectedChainConfig.chainId) {
          if (connectedWallet.provider.id === "xdefi") {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: selectedChainConfig.chainId }],
            });
          }

          switchChain({ chainId: selectedChainConfig.chainId });
        }
      }

      setWalletState({
        provider: provider,
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
