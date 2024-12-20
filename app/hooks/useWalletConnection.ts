"use client";
import { ChainKey, ProviderKey, WalletKey } from "@/utils/wallet/constants";
import {
  ChainType,
  ConnectedWalletsState,
  WalletType,
} from "@/utils/interfaces";
import { GetConnectorsReturnType } from "wagmi/actions";
import { useConnectors } from "wagmi";
import { useAppState } from "@/utils/context";

export function useWalletConnection() {
  const ethConnectors = useConnectors();
  const {
    setWalletsState,
    toggleWalletModal,
    selectedChains,
    selectedWallet,
    walletsState,
    isWalletConnected,
  } = useAppState();

  const handleProviderConnection = async (
    wallet: WalletType,
    chain: ChainType,
    ethConnectors: GetConnectorsReturnType,
  ) => {
    if (!wallet.chainConnect[chain.providerType])
      throw new Error(`Chain ${chain.name} Not Supported!`);

    let connectedWallet;
    switch (chain.providerType) {
      case ProviderKey.EVM:
        connectedWallet =
          await wallet.chainConnect[ProviderKey.EVM]!(ethConnectors);
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

      let newWalletState = { ...walletsState };

      for (const chain of selectedChains) {
        if (walletsState[chain.name] && walletsState[chain.name].address) {
          // Already connected
          continue;
        }
        const connection = await handleProviderConnection(
          wallet,
          chain,
          ethConnectors,
        );
        if (!connection) continue;
        newWalletState = updateWalletState(
          newWalletState,
          selectedWallet.id,
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
    isWalletConnected,
  };
}
