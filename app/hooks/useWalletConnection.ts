import { useState } from "react";
import { useConnectors } from "wagmi";
import { ChainKey, ProviderKey, WalletKey } from "@/utils/wallet/constants";
import { ChainType, WalletType } from "@/utils/interfaces";
import { GetConnectorsReturnType } from "wagmi/actions";

export interface WalletState {
  provider: any;
  address: string;
  providerType: ProviderKey;
  chainType: ChainKey;
  walletId: WalletKey;
  chainId?: string;
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
    setSelectedChains,
    handleConnect,
    selectedWallet,
    setSelectedWallet,
    updateWalletState,
  };
}
