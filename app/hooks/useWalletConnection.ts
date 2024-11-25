import { useState, useEffect } from "react";
import { detectWallets } from "@/utils/wallet/detectedWallets";
import { chainConfig, evmChains } from "@/utils/wallet/chainConfig";
import { useConnectors, useSwitchChain } from "wagmi";

export interface WalletState {
  provider: any;
  address: string;
  network: string[];
  walletId: string;
}
export interface ConnectedWalletsState {
  [key: string]: WalletState;
}

export function useWalletConnection(
  setWalletsState: any,
  walletsState: any,
  toggleWalletModal: () => void
) {
  const { switchChain } = useSwitchChain();
  const ethConnectors = useConnectors();
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletOption>();
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
    if (!selectedChains.length) {
      console.error("No chains selected.");
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
      const detectedWalletForChains = selectedChains.every((chainId) => {
        const identifier = chainIdentifiers[chainId];
        return detectedWallets.some((w) => {
          if (!identifier) {
            return w.id.split("-")[0] === wallet.id.split("-")[0];
          }
          return (
            (w.id.includes(identifier) || wallet.id.includes(identifier)) &&
            w.id.split("-")[0] === wallet.id.split("-")[0]
          );
        });
      });
      if (!detectedWalletForChains) {
        window.open(wallet.downloadUrl, "_blank");
        return;
      }

      const selectedChainConfigs = selectedChains.map((chainId) =>
        chainConfig.find((chain) => chain.id === chainId)
      );
      let i = 0;
      for (const selectedChainConfig of selectedChainConfigs) {
        let walletToConnect = null;
        if (evmChains.some((chain) => chain.id === selectedChainConfig?.id)) {
          walletToConnect = detectedWallets.find(
            (w) => w.id === wallet.name.toLocaleLowerCase()
          );
        } else {
          walletToConnect = detectedWallets.find(
            (w) =>
              w.id ===
                `${wallet.id}-${selectedChainConfig?.id.toLowerCase()}` ||
              w.id === `${wallet.id}`
          );
        }
        if (!walletToConnect) return;
        if (!selectedChainConfig) continue;

        const connectedWallet = await walletToConnect.connect();
        const provider =
          wallet.id.includes("vultisig") || wallet.id.includes("-")
            ? connectedWallet.provider
            : await connectedWallet.provider.getProvider();

        const chainId =
          walletToConnect.id === "vultisig"
            ? await connectedWallet.provider.request({
                method: "eth_chainId",
              })
            : walletToConnect.id.includes("-")
            ? undefined
            : await connectedWallet.provider.getChainId();

        if (
          selectedChainConfig.chainId &&
          chainId !== selectedChainConfig.chainId
        ) {
          if (connectedWallet.provider.id === "xdefi") {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: selectedChainConfig.chainId }],
            });
          }

          switchChain({ chainId: selectedChainConfig.chainId });
        }

        setWalletsState((prevState: ConnectedWalletsState) => ({
          ...prevState,
          [walletToConnect.id]: {
            provider,
            walletId: walletToConnect.id,
            address: connectedWallet.address,
            network: [selectedChainConfig.id],
          },
        }));
      }

      toggleWalletModal();
    } catch (error) {
      console.error(`Error connecting to ${wallet.name}:`, error);
    }
  };

  return {
    selectedChains,
    setSelectedChains,
    handleConnect,
    detectedWallets,
    selectedWallet,
    setSelectedWallet,
  };
}
