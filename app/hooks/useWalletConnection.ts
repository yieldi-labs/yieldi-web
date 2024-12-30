"use client";
import {
  ChainKey,
  CHAINS,
  ProviderKey,
  WalletKey,
} from "@/utils/wallet/constants";
import {
  ChainType,
  ConnectedWalletsState,
  WalletType,
} from "@/utils/interfaces";
import { useCallback } from "react";
import { useAppState } from "@/utils/contexts/context";

export function useWalletConnection() {
  const { setWalletsState, toggleWalletModal, selectedChains, walletsState } =
    useAppState();

  const handleProviderConnection = async (
    wallet: WalletType,
    chain: ChainType,
  ) => {
    if (!wallet.chainConnect[chain.providerType])
      throw new Error(`Chain ${chain.name} Not Supported!`);

    let connectedWallet;
    switch (chain.providerType) {
      case ProviderKey.EVM:
        connectedWallet = await wallet.chainConnect[ProviderKey.EVM]!();
        break;
      case ProviderKey.COSMOS:
        connectedWallet = await wallet.chainConnect[ProviderKey.COSMOS]!();
        break;
      default:
        connectedWallet = await wallet.chainConnect[chain.providerType]!();
    }

    if (!connectedWallet) return;
    const provider = connectedWallet.provider;
    let chainId = null;

    // Only fetch chainId for EVM chains
    if (chain.providerType === ProviderKey.EVM) {
      chainId = await connectedWallet.provider.request({
        method: "eth_chainId",
      });
    }

    return {
      provider,
      address: connectedWallet.address,
      chainId,
    };
  };

  const updateWalletState = (
    prevState: ConnectedWalletsState,
    walletId: WalletKey,
    providerType: ProviderKey,
    chainType: ChainKey,
    provider: any,
    address: string,
    chainId?: string,
  ): ConnectedWalletsState => {
    return {
      ...prevState,
      [chainType]: {
        provider,
        walletId,
        address,
        chainType,
        providerType,
        chainId,
      },
    };
  };

  const saveNetworkAddressToLocalStorage = (
    chainKey: ChainKey,
    address: string,
  ) => {
    if (typeof window !== "undefined" && localStorage) {
      localStorage.setItem(`wallet-${chainKey}-address`, address);
    }
  };

  const getNetworkAddressFromLocalStorage = (chainKey: ChainKey) => {
    if (typeof window !== "undefined" && localStorage) {
      return localStorage.getItem(`wallet-${chainKey}-address`);
    }
    return null;
  };

  const getAllNetworkAddressesFromLocalStorage = useCallback((): string[] => {
    const addresses: string[] = [];
    if (typeof window !== "undefined" && localStorage) {
      for (const config of CHAINS) {
        const address = localStorage.getItem(
          `wallet-${config.thorchainIdentifier}-address`,
        );
        if (!address) continue;
        addresses.push(address);
      }
    }
    return addresses;
  }, []);

  const hasThorAddressInLocalStorage = () => {
    if (typeof window !== "undefined" && localStorage) {
      return !!localStorage.getItem(`wallet-${ChainKey.THORCHAIN}-address`);
    }
    return false;
  };

  const handleConnect = async (wallet: WalletType) => {
    if (!selectedChains.length) {
      console.error("No chains selected.");
      return;
    }

    try {
      let newWalletState = { ...walletsState };

      for (const chain of selectedChains) {
        if (walletsState[chain.name] && walletsState[chain.name].address) {
          // Already connected
          continue;
        }
        const connection = await handleProviderConnection(wallet, chain);
        if (!connection) continue;
        saveNetworkAddressToLocalStorage(chain.name, connection.address);
        newWalletState = updateWalletState(
          newWalletState,
          wallet.id,
          chain.providerType,
          chain.name,
          connection.provider,
          connection.address,
          connection.chainId,
        );
      }

      setWalletsState(newWalletState);
      toggleWalletModal();
    } catch (error) {
      console.error(`Error connecting to ${wallet.id}:`, error);
    }
  };

  return {
    handleConnect,
    getNetworkAddressFromLocalStorage,
    getAllNetworkAddressesFromLocalStorage,
    hasThorAddressInLocalStorage,
  };
}
