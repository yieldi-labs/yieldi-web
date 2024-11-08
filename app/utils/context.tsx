"use client";
import { WalletState } from "@/hooks/useWalletConnection";
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
  wallet: WalletState | null;
  setWalletState: (wallet: WalletState) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [wallet, setWalletState] = useState<WalletState | null>(null);

  const toggleWalletModal = () => {
    setIsWalletModalOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const provider = wallet?.provider;

    if (!provider) {
      console.warn(
        "Provider does not support event listeners. Consider adding polling for updates.",
      );
      return;
    }

    if (typeof provider.on === "function") {
      const handleAccountsChanged = (accounts: string[]) => {
        if (!wallet) return;
        setWalletState({ ...wallet, address: accounts[0] || "" });
      };

      const handleNetworkChanged = (networkId: string) => {
        if (!wallet) return;
        setWalletState({
          ...wallet,
          network: networkId,
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
        setWalletState({ ...wallet, address: accounts[0] || "" });
      };

      const handleNetworkChanged = (networkId: string) => {
        if (!wallet) return;
        setWalletState({ ...wallet, network: networkId });
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("networkChanged", handleNetworkChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged,
        );
        window.ethereum.removeListener("networkChanged", handleNetworkChanged);
      };
    }
  }, [wallet?.provider]);

  return (
    <AppStateContext.Provider
      value={{ isWalletModalOpen, toggleWalletModal, wallet, setWalletState }}
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
