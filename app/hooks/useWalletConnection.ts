import { useState, useEffect } from "react";
import { detectWallets } from "@/utils/wallet/detectedWallets";
import { chainConfig } from "@/utils/wallet/chainConfig";
import { useConnectors, useSwitchChain } from "wagmi";
import { useAppState } from "@/utils/context";

export interface WalletState {
  provider: any;
  address: string;
  network: string;
}

export function useWalletConnection() {
  const { switchChain } = useSwitchChain();
  const ethConnectors = useConnectors();
  const [selectedChain, setSelectedChain] = useState<string | null>("bitcoin");
  const [detectedWallets, setDetectedWallets] = useState<WalletOption[]>([]);
  const { toggleWalletModal, setWalletState } = useAppState();

  useEffect(() => {
    const wallets = detectWallets(ethConnectors);
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

  const saveNetworkAddressToLocalStorage = (
    network: string,
    address: string,
  ) => {
    let thorchainIdentifier = "";
    chainConfig.forEach((chain) => {
      if (chain.thorchainIdentifier === network) {
        thorchainIdentifier = chain.thorchainIdentifier;
      }
    });
    localStorage.setItem(`wallet-${thorchainIdentifier}-address`, address);
  };

  const getNetworkAddressFromLocalStorage = (thorchainIdentifier: string) => {
    return localStorage.getItem(`wallet-${thorchainIdentifier}-address`);
  };

  //TODO: this is a temporary solution to check if thor address is in local storage
  // when multi-chain wallet connection is implemented, this should be replaced 
  // by a method that checks if the user has a connected wallet for THORChain.
  const hasThorAddressInLocalStorage = () => {
    return !!localStorage.getItem('wallet-thor-address');
  };

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
        (chain) => chain.id === selectedChain,
      );

      const isWalletConnect =
        detectedWalletForChain.id.includes("walletConnect");
      const isNonEVM = detectedWalletForChain.id.includes("-");
      const isVultisig = detectedWalletForChain.id.includes("vultisig");
      const connectedWallet = await detectedWalletForChain.connect();

      console.log("Connected Wallet:", connectedWallet);

      if (isWalletConnect) {
        saveNetworkAddressToLocalStorage(
          selectedChainConfig?.thorchainIdentifier!,
          connectedWallet.address,
        );
        setWalletState({
          provider: connectedWallet.provider,
          address: connectedWallet.address,
          network: selectedChain,
        });
        toggleWalletModal();
        return;
      }

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

      saveNetworkAddressToLocalStorage(
        selectedChainConfig?.thorchainIdentifier!,
        connectedWallet.address,
      );
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
    getNetworkAddressFromLocalStorage,
    hasThorAddressInLocalStorage,
  };
}
