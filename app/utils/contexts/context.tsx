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
} from "../wallet/constants";
import { connectWallet } from "../wallet/handlers/handleConnect";
import {
  ChainType,
  ConnectedWalletsState,
  WalletTokensData,
  WalletType,
} from "../interfaces";
import { useWalletTokens } from "@/hooks/useWalletTokens";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, avalanche, bsc } from "@reown/appkit/networks";
import UniversalProvider from "@walletconnect/universal-provider";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";

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
    email: true,
    emailShowWallets: true,
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
                await connectWallet({
                  id: "xdefi-evm",
                  provider: window?.xfi?.ethereum,
                }),

              [ProviderKey.THORCHAIN]: async () =>
                await connectWallet({
                  id: "xdefi-thorchain",
                  provider: window?.xfi?.thorchain,
                }),

              [ProviderKey.LITECOIN]: async () =>
                await connectWallet({
                  id: "xdefi-ltc",
                  provider: window?.xfi?.litecoin,
                }),

              [ProviderKey.DOGECOIN]: async () =>
                await connectWallet({
                  id: "xdefi-doge",
                  provider: window?.xfi?.dogecoin,
                }),

              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "xdefi-utxo",
                  provider: window?.xfi?.bitcoin,
                }),

              [ProviderKey.BITCOINCASH]: async () =>
                await connectWallet({
                  id: "xdefi-bch",
                  provider: window?.xfi?.bitcoincash,
                }),

              [ProviderKey.SOLANA]: async () =>
                await connectWallet({
                  id: "xdefi-solana",
                  provider: window?.xfi?.solana,
                }),

              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "xdefi-cosmos",
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
            !window.ethereum?.isXDEFI &&
            !window.ethereum?.isPhanthom
          ) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async () =>
                await connectWallet({
                  id: "metamask-evm",
                  provider: window.ethereum,
                }),
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
              [ProviderKey.EVM]: async () =>
                await connectWallet({
                  id: "okx-evm",
                  provider: window.okxwallet,
                }),
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "okx-utxo",
                  provider: window.okxwallet.bitcoin,
                }),
              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "okx-cosmos",
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
            !window.solana.isXDEFI &&
            !window.solana.isOkxWallet
          ) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.EVM]: async () =>
                await connectWallet({
                  id: "phantom-evm",
                  provider: window.phantom?.ethereum,
                }),
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "phantom-utxo",
                  provider: window.phantom.bitcoin,
                }),
              [ProviderKey.SOLANA]: async () =>
                await connectWallet({
                  id: "phantom-solana",
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
              [ProviderKey.EVM]: async () =>
                await connectWallet({
                  id: "vultisig-evm",
                  provider: window.vultisig?.ethereum,
                }),
              [ProviderKey.THORCHAIN]: async () =>
                await connectWallet({
                  id: "vultisig-thorchain",
                  provider: window.thorchain || window.vultisig?.thorchain,
                }),
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "vultisig-utxo",
                  provider: window.bitcoin || window.vultisig?.bitcoin,
                }),
              [ProviderKey.BITCOINCASH]: async () =>
                await connectWallet({
                  id: "vultisig-bch",
                  provider: window.bitcoincash || window.vultisig?.bitcoincash,
                }),
              [ProviderKey.LITECOIN]: async () =>
                await connectWallet({
                  id: "vultisig-ltc",
                  provider: window.litecoin || window.vultisig?.litecoin,
                }),
              [ProviderKey.DOGECOIN]: async () =>
                await connectWallet({
                  id: "vultisig-doge",
                  provider: window.dogecoin || window.vultisig?.dogecoin,
                }),
              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "vultisig-cosmos",
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
            [ProviderKey.EVM]: async () =>
              await connectWallet({
                id: "walletconnect-evm",
                provider: modal,
              }),
          };
          break;
        case WalletKey.LEDGER:
          SUPPORTED_WALLETS[walletKey].isAvailable = true;
          SUPPORTED_WALLETS[walletKey].chainConnect = {
            [ProviderKey.EVM]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-evm", // TODO: Review this approach
                provider: transport,
              });
            },
            [ProviderKey.BITCOIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-btc",
                provider: transport,
              });
            },
            [ProviderKey.BITCOINCASH]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-bch",
                provider: transport,
              });
            },
            [ProviderKey.LITECOIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-ltc",
                provider: transport,
              });
            },
            [ProviderKey.DOGECOIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-doge",
                provider: transport,
              });
            },
            [ProviderKey.COSMOS]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-cosmos",
                provider: transport,
              });
            },
            [ProviderKey.THORCHAIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-thorchain",
                provider: transport,
              });
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
