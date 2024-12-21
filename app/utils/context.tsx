"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import {
  CHAINS,
  ProviderKey,
  SUPPORTED_WALLETS,
  WalletKey,
} from "./wallet/constants";
import {
  connectEVMWallet,
  connectWallet,
  connectWalletConnect,
} from "./wallet/walletConnect";
import {
  ChainType,
  ConnectedWalletsState,
  WalletTokensData,
  WalletType,
} from "./interfaces";
import { useWalletTokens } from "@/hooks/useWalletTokens";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, avalanche, bsc } from "@reown/appkit/networks";
import UniversalProvider from "@walletconnect/universal-provider";

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
  balanceList: WalletTokensData | undefined;
  refreshBalances: () => void;
  isLoadingBalance: boolean;
  isLoadingTokenList: boolean;
  detected: WalletType[];
  undetected: WalletType[];
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

const metadata = {
  name: "Yieldi",
  description: "-",
  url: "http://localhost:3000",
  icons: [],
};

const modal = createAppKit({
  adapters: [],
  features: {
    email: true, // default to true
    emailShowWallets: true, // default to true
    connectMethodsOrder: ["wallet", "email", "social"],
  },
  metadata,
  networks: [mainnet, avalanche, bsc],
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID as string,
});

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChains, setSelectedChains] = useState<ChainType[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<WalletType>();
  const [detected, setDetected] = useState<WalletType[]>([]);
  const [undetected, setUndetected] = useState<WalletType[]>([]);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isWalletDrawerOpen, setIsWalletDrawerOpen] = useState(false);
  const [walletsState, setWalletsState] = useState<ConnectedWalletsState>({}); // TODO: We should remove complex objects as wallet providers from provider state. It can not be passed as props
  const toggleWalletModal = () => {
    setIsWalletModalOpen((prevState) => !prevState);
  };
  const toggleWalletDrawer = () => {
    setIsWalletDrawerOpen((prevState) => !prevState);
  };

  const { refreshBalances, balanceList, isLoadingBalance, isLoadingTokenList } =
    useWalletTokens(walletsState!);

  useEffect(() => {
    modal.subscribeProviders((data) => {
      if (data.eip155) {
        const connectedChains = (
          data.eip155 as UniversalProvider
        ).session?.namespaces.eip155.chains?.map(
          (chainStr) =>
            `0x${Number(chainStr.replace("eip155:", "")).toString(16)}`,
        );
        const chainsInfo = CHAINS.filter((chain) =>
          connectedChains?.includes(chain.chainId || ""),
        );
        const newState: Record<any, any> = {};

        chainsInfo.forEach((chain) => {
          const parsedAccounts = (
            data.eip155 as UniversalProvider
          ).session?.namespaces.eip155.accounts.map((account) =>
            account.split(":"),
          );
          const filteredAccount = parsedAccounts?.find(
            (account) =>
              `0x${Number(account[1]).toString(16)}` === chain.chainId,
          );
          const addressFilteredAccount = filteredAccount?.[2];
          newState[chain.name] = {
            provider: data.eip155,
            walletId: WalletKey.WALLETCONNECT,
            address: addressFilteredAccount,
            chainType: chain.name,
            providerType: ProviderKey.EVM,
            chainId: chain.chainId,
          };
        });

        setWalletsState((prev) => ({
          ...prev,
          ...newState,
        }));
      }
    });
  }, []);

  const checkAvailableWallets = (window: any) => {
    Object.keys(SUPPORTED_WALLETS).forEach((key) => {
      const walletKey = key as WalletKey;
      switch (walletKey) {
        case WalletKey.CTRL: {
          if (window.xfi) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true; // TODO: Not modify a constant exported from other file. We are merging react state with static definitions
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async () =>
                await connectEVMWallet(window.xfi?.ethereum),

              [ProviderKey.THORCHAIN]: async () =>
                await connectWallet({
                  id: "xdefi-thorchain",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.thorchain,
                }),

              [ProviderKey.LITECOIN]: async () =>
                await connectWallet({
                  id: "xdefi-ltc",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.litecoin,
                }),

              [ProviderKey.DOGECOIN]: async () =>
                await connectWallet({
                  id: "xdefi-doge",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.dogecoin,
                }),

              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "xdefi-utxo",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.bitcoin,
                }),

              [ProviderKey.BITCOINCASH]: async () =>
                await connectWallet({
                  id: "xdefi-bch",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.bitcoincash,
                }),

              [ProviderKey.SOLANA]: async () =>
                await connectWallet({
                  id: "xdefi-solana",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.solana,
                }),

              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "xdefi-cosmos",
                  name: "CTRL Wallet",
                  provider: window?.xfi?.keplr,
                  subchain: "cosmoshub-4",
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }

          break;
        }
        case WalletKey.METAMASK: {
          if (
            window.ethereum?.isMetaMask &&
            !window.ethereum?.isVultisig &&
            !window.ethereum?.isXDEFI
          ) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async () => {
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
              [ProviderKey.EVM]: async () => {
                return await connectEVMWallet(window.okxwallet);
              },
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "okx-utxo",
                  name: "OKX Wallet",
                  provider: window.okxwallet.bitcoin,
                }),
              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "okx-cosmos",
                  name: "OKX Wallet",
                  provider: window.okxwallet.keplr,
                  subchain: "cosmoshub-4",
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }
          break;
        }
        case WalletKey.PHANTOM: {
          if (
            window.solana.isPhantom &&
            !window.solana.isBraveWallet &&
            !window.solana.isXDEFI
          ) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async () => {
                return await connectEVMWallet(window.phantom?.ethereum);
              },
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "phantom-utxo",
                  name: "Phantom Wallet",
                  provider: window.phantom.bitcoin,
                }),
              [ProviderKey.SOLANA]: async () =>
                await connectWallet({
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
              [ProviderKey.EVM]: async () => {
                return await connectEVMWallet(window.vultisig?.ethereum);
              },
              [ProviderKey.THORCHAIN]: async () =>
                await connectWallet({
                  id: "vultisig-thorchain",
                  name: "Vultisig",
                  provider: window.thorchain || window.vultisig?.thorchain,
                }),
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "vultisig-utxo",
                  name: "Vultisig",
                  provider: window.bitcoin || window.vultisig?.bitcoin,
                }),
              [ProviderKey.BITCOINCASH]: async () =>
                await connectWallet({
                  id: "vultisig-bch",
                  name: "Vultisig",
                  provider: window.bitcoincash || window.vultisig?.bitcoincash,
                }),
              [ProviderKey.LITECOIN]: async () =>
                await connectWallet({
                  id: "vultisig-ltc",
                  name: "Vultisig",
                  provider: window.litecoin || window.vultisig?.litecoin,
                }),
              [ProviderKey.DOGECOIN]: async () =>
                await connectWallet({
                  id: "vultisig-doge",
                  name: "Vultisig",
                  provider: window.dogecoin || window.vultisig?.dogecoin,
                }),
              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "vultisig-cosmos",
                  name: "Vultisig",
                  provider: window.vultisig?.cosmos,
                  subchain: "cosmoshub-4",
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }
          break;
        }
        case WalletKey.WALLETCONNECT:
          SUPPORTED_WALLETS[walletKey].isAvailable = true;
          SUPPORTED_WALLETS[walletKey].chainConnect = {
            [ProviderKey.EVM]: async () => {
              connectWalletConnect(modal);
            },
          };
          break;
      }
    });
  };

  const getDectectedAndUndetected = useCallback(() => {
    const detected: WalletType[] = [];
    const undetected: WalletType[] = [];
    const processedWallets = new Set<WalletKey>();

    const processWallet = (wallet: WalletType) => {
      if (processedWallets.has(wallet.id)) return;
      if (wallet.isAvailable) {
        detected.push(wallet);
      } else {
        undetected.push(wallet);
      }
      processedWallets.add(wallet.id);
    };

    const walletList: WalletType[] = Object.values(
      SUPPORTED_WALLETS,
    ) as WalletType[];
    walletList.forEach(processWallet);

    return { detected, undetected };
  }, []); // TODO: This status (detected, undetected) should be handle on a centralized state as part of wallet object. Take into account for https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration

  useEffect(() => {
    checkAvailableWallets(window);
    const { detected, undetected } = getDectectedAndUndetected();
    setDetected(detected);
    setUndetected(undetected);
  }, [getDectectedAndUndetected]);

  useEffect(() => {
    const connectedChains = CHAINS.filter((chain) =>
      Object.keys(walletsState).includes(chain.name),
    );
    setSelectedChains(connectedChains);
  }, [walletsState]);

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
        isLoadingBalance,
        isLoadingTokenList,
        detected,
        undetected,
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
