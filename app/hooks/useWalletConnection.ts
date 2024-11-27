import { useState } from "react";
import { useConnectors, useSwitchChain } from "wagmi";
import { ProviderKey, WalletKey } from "@/utils/wallet/constants";
import { ChainType, WalletType } from "@/types/global";

export interface WalletState {
  provider: any;
  address: string;
  network: Set<string>;
  walletId: WalletKey;
  chain?: string;
}

export interface ConnectedWalletsState {
  [key: string]: WalletState;
}

export function useWalletConnection(
  setWalletsState: React.Dispatch<React.SetStateAction<ConnectedWalletsState>>,
  toggleWalletModal: () => void
) {
  const ethConnectors = useConnectors();
  const [selectedChains, setSelectedChains] = useState<ChainType[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>();

  const handleProviderConnection = async (
    wallet: WalletType,
    providerType: ProviderKey,
    ethConnectors: any
  ) => {
    if (!wallet.chainConnect[providerType]) return null;

    const connectedWallet =
      providerType === ProviderKey.EVM
        ? await wallet.chainConnect[providerType]!(ethConnectors)
        : await wallet.chainConnect[providerType]!();
    if (!connectedWallet) return;

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
    provider: any,
    address: string,
    network: string
  ): ConnectedWalletsState => {
    return {
      ...prevState,
      [providerType]: {
        provider,
        walletId,
        address,
        network: new Set([
          ...(prevState[providerType]?.network || []),
          network,
        ]),
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

      const providerTypesSet = new Set(
        selectedChains.map((chain) => chain.providerType)
      );

      for (const providerType of providerTypesSet) {
        const connection = await handleProviderConnection(
          wallet,
          providerType,
          ethConnectors
        );
        if (!connection) continue;

        setWalletsState((prevState) =>
          updateWalletState(
            prevState,
            selectedWallet.id,
            providerType,
            connection.provider,
            connection.address,
            providerType
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
    setSelectedChains,
    handleConnect,
    selectedWallet,
    setSelectedWallet,
    updateWalletState,
  };
}
