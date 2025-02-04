"use client";
import { ChainKey, ProviderKey, WalletKey } from "@/utils/wallet/constants";
import {
  ChainInfo,
  ConnectedWalletsState,
  WalletType,
} from "@/utils/interfaces";
import { useAppState } from "@/utils/contexts/context";
import { getWalletId } from "@/utils/chain";

export function useWalletConnection() {
  const { setWalletsState, toggleWalletModal, selectedChains, walletsState } =
    useAppState();

  const handleProviderConnection = async (
    wallet: WalletType,
    chain: ChainInfo,
  ) => {
    if (!wallet.chainConnect[chain.providerType]) {
      throw new Error(`Chain ${chain.name} Not Supported!`);
    }

    const connectedWallet = await wallet.chainConnect[chain.providerType]!();

    if (!wallet.chainConnect[chain.providerType]) {
      throw new Error(
        `Error conection wallet for provider ${chain.providerType}`,
      );
    }

    const provider = connectedWallet.provider;

    return {
      provider,
      address: connectedWallet.address,
    };
  };

  const updateWalletState = (
    prevState: ConnectedWalletsState,
    walletId: WalletKey,
    providerType: ProviderKey,
    ChainInfo: ChainKey,
    provider: any,
    address: string,
  ): ConnectedWalletsState => {
    return {
      ...prevState,
      [ChainInfo]: {
        provider,
        walletId,
        address,
        ChainInfo,
        providerType,
      },
    };
  };

  const handleConnect = async (wallet: WalletType) => {
    if (!selectedChains.length) {
      console.error("No chains selected.");
      return;
    }

    let newWalletState = { ...walletsState };

    for (const chain of selectedChains) {
      if (walletsState[chain.name] && walletsState[chain.name].address) {
        // Already connected
        continue;
      }
      const connection = await handleProviderConnection(wallet, chain);
      if (!connection || !connection.address) continue;
      newWalletState = updateWalletState(
        newWalletState,
        getWalletId(chain, connection.provider, wallet.id), // Before conenct important Xdefi can overwrite the provider depends on user preferences so return window.ethereum
        chain.providerType,
        chain.name,
        connection.provider,
        connection.address,
      );
    }

    setWalletsState(newWalletState);
    toggleWalletModal();
  };

  return {
    handleConnect,
  };
}
