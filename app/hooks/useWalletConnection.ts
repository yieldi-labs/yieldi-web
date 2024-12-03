import { useConnectors } from "wagmi";
import { CHAINS, ProviderKey, WalletKey } from "@/utils/wallet/constants";
import { GetConnectorsReturnType } from "wagmi/actions";
import { WalletType } from "@/utils/interfaces";
import { useAppState } from "@/utils/context";

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

export function useWalletConnection() {
  const ethConnectors = useConnectors();
  const { selectedChains, selectedWallet } = useAppState();
  const { setWalletsState, toggleWalletModal } = useAppState();
  const handleProviderConnection = async (
    wallet: WalletType,
    providerType: ProviderKey,
    ethConnectors: GetConnectorsReturnType
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

  const saveNetworkAddressToLocalStorage = (
    providerKey: ProviderKey,
    address: string
  ) => {
    let key = "";
    CHAINS.forEach((chain) => {
      if (chain.providerType === providerKey) {
        key = chain.providerType;
      }
    });
    localStorage.setItem(`wallet-${key}-address`, address);
  };

  const getNetworkAddressFromLocalStorage = (providerKey: ProviderKey) => {
    return localStorage.getItem(`wallet-${providerKey}-address`);
  };

  const getAllNetworkAddressesFromLocalStorage = () => {
    return CHAINS.map((chain) =>
      localStorage.getItem(`wallet-${chain.providerType}-address`)
    ).filter((address) => address != undefined);
  };

  const hasThorAddressInLocalStorage = () => {
    return !!localStorage.getItem(`wallet-${ProviderKey.THORCHAIN}-address`);
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
        saveNetworkAddressToLocalStorage(providerType, connection.address);
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
    handleConnect,
    updateWalletState,
    getNetworkAddressFromLocalStorage,
    getAllNetworkAddressesFromLocalStorage,
    hasThorAddressInLocalStorage,
  };
}
