import { useConnectors } from "wagmi";
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
import { GetConnectorsReturnType } from "wagmi/actions";
import { useState } from "react";
import { useAppState } from "@/utils/context";

export function useWalletConnection() {
  const ethConnectors = useConnectors();
  const { setWalletsState, toggleWalletModal, selectedChains, selectedWallet } =
    useAppState();

  const handleProviderConnection = async (
    wallet: WalletType,
    chain: ChainType,
    ethConnectors: GetConnectorsReturnType
  ) => {
    if (!wallet.chainConnect[chain.providerType])
      throw new Error("Chain Not Supported!");
    const connectedWallet =
      chain.providerType === ProviderKey.EVM
        ? await wallet.chainConnect[chain.providerType]!(ethConnectors)
        : await wallet.chainConnect[chain.providerType]!();
    if (!connectedWallet) return;
    const provider = connectedWallet.provider;
    let chainId = null;
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
    chainId?: string
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
    address: string
  ) => {
    localStorage.setItem(`wallet-${chainKey}-address`, address);
  };

  const getNetworkAddressFromLocalStorage = (chainKey: ChainKey) => {
    return localStorage.getItem(`wallet-${chainKey}-address`);
  };

  const getAllNetworkAddressesFromLocalStorage = () => {
    return CHAINS.map((chain) =>
      localStorage.getItem(`wallet-${chain.name}-address`)
    ).filter((address) => address != undefined);
  };

  const hasThorAddressInLocalStorage = () => {
    return !!localStorage.getItem(`wallet-${ChainKey.THORCHAIN}-address`);
  };

  const handleConnect = async (wallet: WalletType) => {
    if (!selectedChains.length) {
      console.error("No chains selected.");
      return;
    }

    try {
      if (!wallet.isAvailable) {
        window.open(wallet.downloadUrl, "_blank");
        return;
      }

      if (!selectedWallet) return;
      for (const chain of selectedChains) {
        const connection = await handleProviderConnection(
          wallet,
          chain,
          ethConnectors
        );
        if (!connection) continue;
        saveNetworkAddressToLocalStorage(chain.name, connection.address);
        setWalletsState((prevState) =>
          updateWalletState(
            prevState,
            selectedWallet.id,
            chain.providerType,
            chain.name,
            connection.provider,
            connection.address,
            connection.chainId
          )
        );
      }

      toggleWalletModal();
    } catch (error) {
      console.error(`Error connecting to ${wallet.id}:`, error);
    }
  };

  return {
    selectedChains,
    handleConnect,
    getNetworkAddressFromLocalStorage,
    getAllNetworkAddressesFromLocalStorage,
    hasThorAddressInLocalStorage,
  };
}
