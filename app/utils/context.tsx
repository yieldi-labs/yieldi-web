"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { ProviderKey, SUPPORTED_WALLETS, WalletKey } from "./wallet/constants";
import { GetConnectorsReturnType } from "wagmi/actions";
import { connectEVMWallet, connectUTXOWallet } from "./wallet/walletConnect";

import {
  ChainType,
  ConnectedWalletsState,
  WalletTokensData,
  WalletType,
} from "./interfaces";
import { useWalletTokens } from "@/hooks/useWalletTokens";

interface AppStateContextType {
  isWalletModalOpen: boolean;
  toggleWalletModal: () => void;
  walletsState: ConnectedWalletsState;
  setWalletsState: React.Dispatch<React.SetStateAction<ConnectedWalletsState>>;
  toggleWalletDrawer: () => void;
  isWalletDrawerOpen: boolean;
  selectedChains: ChainType[];
  setSelectedChains: Dispatch<SetStateAction<ChainType[]>>;
  selectedWallet: WalletType | undefined;
  setSelectedWallet: Dispatch<SetStateAction<WalletType | undefined>>;
  balanceList: WalletTokensData;
  refreshBalances: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChains, setSelectedChains] = useState<ChainType[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletDrawerOpen, setIsWalletDrawerOpen] = useState(false);
  const [walletsState, setWalletsState] = useState<ConnectedWalletsState>({});
  const toggleWalletModal = () => {
    setIsWalletModalOpen((prevState) => !prevState);
  };
  const toggleWalletDrawer = () => {
    setIsWalletDrawerOpen((prevState) => !prevState);
  };

  const { refreshBalances, balanceList } = useWalletTokens(walletsState!);

  const checkAvailableWallets = (window: any) => {
    Object.keys(SUPPORTED_WALLETS).forEach((key) => {
      const walletKey = key as WalletKey;
      switch (walletKey) {
        case WalletKey.CTRL: {
          if (window.xfi) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async () => await connectEVMWallet(window.xfi?.ethereum),

              [ProviderKey.THORCHAIN]: async () =>
                await connectUTXOWallet({
                  id: "xdefi-thorchain",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.thorchain,
                }),

              [ProviderKey.LITECOIN]: async () =>
                await connectUTXOWallet({
                  id: "xdefi-ltc",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.litecoin,
                }),

              [ProviderKey.DOGECOIN]: async () =>
                await connectUTXOWallet({
                  id: "xdefi-doge",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.dogecoin,
                }),

              [ProviderKey.BITCOIN]: async () =>
                await connectUTXOWallet({
                  id: "xdefi-utxo",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.bitcoin,
                }),

              [ProviderKey.BITCOINCASH]: async () =>
                await connectUTXOWallet({
                  id: "xdefi-bch",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.bitcoincash,
                }),

              [ProviderKey.SOLANA]: async () =>
                await connectUTXOWallet({
                  id: "xdefi-solana",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.solana,
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }

          break;
        }
        case WalletKey.METAMASK: {
          if (window.ethereum?.isMetaMask) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async (
                ethConnectors: GetConnectorsReturnType,
              ) => {
                if (!ethConnectors) return;
                const connector = ethConnectors.find(
                  (c) => c.id === WalletKey.METAMASK,
                );
                if (!connector) return;
                return await connectEVMWallet(window.ethereum);
              },
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }
          break;
        }
        case WalletKey.OKX: {
          if (window.okxwallet) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async (
                ethConnectors: GetConnectorsReturnType,
              ) => {
                if (!ethConnectors) return;
                const connector = ethConnectors.find(
                  (c) => c.id === WalletKey.OKX,
                );
                if (!connector) return;
                return await connectEVMWallet(window.ethereum);
              },
              [ProviderKey.BITCOIN]: async () =>
                await connectUTXOWallet({
                  id: "okx-utxo",
                  name: "OKX Wallet",
                  provider: window.okxwallet.bitcoin,
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }
          break;
        }
        case WalletKey.PHANTOM: {
          if (window.phantom) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async (
                ethConnectors: GetConnectorsReturnType,
              ) => {
                if (!ethConnectors) return;
                const connector = ethConnectors.find(
                  (c) => c.id === WalletKey.PHANTOM,
                );
                if (!connector) return;
                return await connectEVMWallet(window.phantom?.ethereum);
              },
              [ProviderKey.BITCOIN]: async () =>
                await connectUTXOWallet({
                  id: "phantom-utxo",
                  name: "Phantom Wallet",
                  provider: window.phantom.bitcoin,
                }),
              [ProviderKey.SOLANA]: async () =>
                await connectUTXOWallet({
                  id: "phantom-solana",
                  name: "Phantom Wallet",
                  provider: window.phantom.solana,
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }

          break;
        }
        case WalletKey.VULTISIG: {
          if (window.vultisig) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async () => await connectEVMWallet(window.vultisig?.ethereum),
              [ProviderKey.THORCHAIN]: async () =>
                await connectUTXOWallet({
                  id: "vultisig-thorchain",
                  name: "Vultisig",
                  provider: window.thorchain || window.vultisig?.thorchain,
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }
          break;
        }
      }
    });
  };

  useEffect(() => {
    checkAvailableWallets(window);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        isWalletModalOpen,
        toggleWalletModal,
        walletsState,
        setWalletsState,
        isWalletDrawerOpen,
        toggleWalletDrawer,
        selectedChains,
        selectedWallet,
        setSelectedChains,
        setSelectedWallet,
        refreshBalances,
        balanceList,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
