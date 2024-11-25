"use client";
import {
  ConnectedWalletsState,
  WalletState,
} from "@/hooks/useWalletConnection";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AppStateContextType {
  isWalletModalOpen: boolean;
  toggleWalletModal: () => void;
  walletsState: ConnectedWalletsState | null;
  setWalletsState: (walletsState: ConnectedWalletsState) => void;
  getWallet: (chain: string) => WalletState | undefined;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletsState, setWalletsState] =
    useState<ConnectedWalletsState | null>(null);

  const toggleWalletModal = () => {
    setIsWalletModalOpen((prevState) => !prevState);
  };

  const getWallet = (chain: string) => {
    if (walletsState) {
      switch (chain) {
        case "ETH":
        case "BSC":
        case "AVAX": {
          // evm
          return walletsState[
            Object.keys(walletsState).find((key) => key.split("-")[0])!
          ];
        }
        case "BTC":
        case "DOGE": {
          // utxo
          return walletsState[
            Object.keys(walletsState).find((key) =>
              key.includes(chain.toLowerCase())
            )!
          ];
        }
      }
    }
  };

  useEffect(() => {
    if (walletsState) {
      const wallet = getWallet("ETH");
      const provider = wallet?.provider;

      if (!provider) {
        console.warn(
          "Provider does not support event listeners. Consider adding polling for updates."
        );
        return;
      }

      if (typeof provider.on === "function") {
        const handleAccountsChanged = (accounts: string[]) => {
          if (!wallet) return;
          setWalletsState({
            ...walletsState,
            [wallet.walletId]: {
              ...walletsState[wallet.walletId],
              address: accounts[0] || "",
            },
          });
        };

        const handleNetworkChanged = (networkId: string) => {
          if (!wallet) return;
          setWalletsState({
            ...walletsState,
            [wallet.walletId]: {
              ...walletsState[wallet.walletId],
              network: [networkId],
            },
          });
        };

        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("networkChanged", handleNetworkChanged);

        return () => {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("networkChanged", handleNetworkChanged);
        };
      } else if (window.ethereum) {
        const handleAccountsChanged = (accounts: string[]) => {
          if (!wallet) return;
          setWalletsState({
            ...walletsState,
            [wallet.walletId]: {
              ...walletsState[wallet.walletId],
              address: accounts[0] || "",
            },
          });
        };

        const handleNetworkChanged = (networkId: string) => {
          if (!wallet) return;
          setWalletsState({
            ...walletsState,
            [wallet.walletId]: {
              ...walletsState[wallet.walletId],
              network: [networkId],
            },
          });
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("networkChanged", handleNetworkChanged);

        return () => {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener(
            "networkChanged",
            handleNetworkChanged
          );
        };
      }
    }
  }, [walletsState]);

  return (
    <AppStateContext.Provider
      value={{
        isWalletModalOpen,
        toggleWalletModal,
        walletsState,
        setWalletsState,
        getWallet,
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
