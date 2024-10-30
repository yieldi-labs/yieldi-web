import { useState, useEffect } from "react";
import { detectWallets } from "@/utils/wallet/detectedWallets";
import { chainConfig } from "@/utils/wallet/chainConfig";
import { useSwitchChain } from "wagmi";

export function useWalletConnection(
  setWalletState: any,
  toggleWalletModal: () => void,
) {
  const { switchChain } = useSwitchChain();

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
        switch (selectedChain) {
          case "solana":
            if (w.id.includes("solana") || wallet.id.includes("solana")) {
              return w.id === wallet.id;
            }
            break;
          case "kujira":
            if (w.id.includes("kujira") || wallet.id.includes("kujira")) {
              return w.id === wallet.id;
            }
            break;
          case "cosmos":
            if (w.id.includes("cosmos") || wallet.id.includes("cosmos")) {
              return w.id === wallet.id;
            }
            break;
          case "thorchain":
            if (w.id.includes("thorchain") || wallet.id.includes("thorchain")) {
              return w.id === wallet.id;
            }
            break;
          case "mayachain":
            if (w.id.includes("maya") || wallet.id.includes("maya")) {
              return w.id === wallet.id;
            }
            break;
          case "litecoin":
            if (w.id.includes("ltc") || wallet.id.includes("ltc")) {
              return w.id === wallet.id;
            }
            break;
          case "dogecoin":
            if (w.id.includes("doge") || wallet.id.includes("doge")) {
              return w.id === wallet.id;
            }
            break;
          case "bitcoincash":
            if (w.id.includes("bch") || wallet.id.includes("bch")) {
              return w.id === wallet.id;
            }
            break;
          case "bitcoin":
            if (w.id.includes("utxo") || wallet.id.includes("utxo")) {
              return w.id === wallet.id;
            }
            break;
          default:
            return w.id.split("-")[0] === wallet.id.split("-")[0];
        }
        return false;
      });

      if (!detectedWalletForChain) {
        window.open(wallet.downloadUrl, "_blank");
        return;
      }

      const selectedChainConfig = chainConfig.find(
        (chain) => chain.id === selectedChain,
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
