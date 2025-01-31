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
  ChainKey,
  CHAINS,
  ProviderKey,
  SUPPORTED_WALLETS,
  WalletKey,
} from "../wallet/constants";
import { connectWallet } from "../wallet/handlers/handleConnect";
import {
  ChainInfo,
  ConnectedWalletsState,
  WalletTokensData,
  WalletType,
} from "../interfaces";
import { useWalletTokens } from "@/hooks/useWalletTokens";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, avalanche, bsc } from "@reown/appkit/networks";
import UniversalProvider from "@walletconnect/universal-provider";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { useQuery } from "@tanstack/react-query";
import { mimir } from "@/thornode/services.gen";
import { MimirResponse } from "@/thornode";
import { getStats, StatsData } from "@/midgard";

interface AppStateContextType {
  isWalletModalOpen: boolean;
  toggleWalletModal: () => void;
  walletsState: ConnectedWalletsState;
  setWalletsState: React.Dispatch<React.SetStateAction<ConnectedWalletsState>>;
  toggleWalletDrawer: () => void;
  isWalletDrawerOpen: boolean;
  selectedChains: ChainInfo[];
  setSelectedChains: Dispatch<SetStateAction<ChainInfo[]>>;
  selectedWallet: WalletType | undefined;
  setSelectedWallet: Dispatch<SetStateAction<WalletType | undefined>>;
  balanceList: WalletTokensData | undefined;
  refreshBalances: () => void;
  isLoadingBalance: boolean;
  isLoadingTokenList: boolean;
  detected: WalletType[];
  undetected: WalletType[];
  isWalletConnected: (chainKey: ChainKey) => boolean;
  mimirParameters: MimirResponse | undefined;
  midgardStats: StatsData | undefined;
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
  const [selectedChains, setSelectedChains] = useState<ChainInfo[]>([]);
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

  const { data: mimirParameters } = useQuery({
    queryKey: ["mimir-params"],
    retry: false,
    queryFn: async () => {
      const data = await mimir();
      if (!data.data) {
        throw Error("No mimir parameters found");
      }
      return data.data;
    },
  });

  const { data: midgardStats } = useQuery({
    queryKey: ["midgard-stats"],
    retry: false,
    queryFn: async () => {
      const data = await getStats();
      if (!data.data) {
        throw Error("No midgard stats found");
      }
      return data.data;
    },
  });

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
            ChainInfo: chain.name,
            providerType: chain.providerType,
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
              [ProviderKey.AVALANCHE]: async () =>
                await connectWallet({
                  id: "xdefi-avax", // TODO: Remove literal IDs use enum composition
                  provider: window?.xfi?.ethereum,
                  walletId: WalletKey.CTRL,
                }),
              [ProviderKey.BINANCESMARTCHAIN]: async () =>
                await connectWallet({
                  id: "xdefi-bsc",
                  provider: window?.xfi?.ethereum,
                  walletId: WalletKey.CTRL,
                }),
              [ProviderKey.ETHEREUM]: async () =>
                await connectWallet({
                  id: "xdefi-eth",
                  provider: window?.xfi?.ethereum,
                  walletId: WalletKey.CTRL,
                }),
              [ProviderKey.BASE]: async () =>
                await connectWallet({
                  id: "xdefi-base",
                  provider: window?.xfi?.ethereum,
                  walletId: WalletKey.CTRL,
                }),
              [ProviderKey.THORCHAIN]: async () =>
                await connectWallet({
                  id: "xdefi-thorchain",
                  provider: window?.xfi?.thorchain,
                  walletId: WalletKey.CTRL,
                }),

              [ProviderKey.LITECOIN]: async () =>
                await connectWallet({
                  id: "xdefi-ltc",
                  provider: window?.xfi?.litecoin,
                  walletId: WalletKey.CTRL,
                }),

              [ProviderKey.DOGECOIN]: async () =>
                await connectWallet({
                  id: "xdefi-doge",
                  provider: window?.xfi?.dogecoin,
                  walletId: WalletKey.CTRL,
                }),

              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "xdefi-utxo",
                  provider: window?.xfi?.bitcoin,
                  walletId: WalletKey.CTRL,
                }),

              [ProviderKey.BITCOINCASH]: async () =>
                await connectWallet({
                  id: "xdefi-bch",
                  provider: window?.xfi?.bitcoincash,
                  walletId: WalletKey.CTRL,
                }),

              [ProviderKey.SOLANA]: async () =>
                await connectWallet({
                  id: "xdefi-solana",
                  provider: window?.xfi?.solana,
                  walletId: WalletKey.CTRL,
                }),

              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "xdefi-cosmos",
                  provider: window?.xfi?.keplr,
                  subchain: "cosmoshub-4",
                  walletId: WalletKey.CTRL,
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
              [ProviderKey.AVALANCHE]: async () =>
                await connectWallet({
                  id: "metamask-avax",
                  provider: window.ethereum,
                  walletId: WalletKey.METAMASK,
                }),
              [ProviderKey.BINANCESMARTCHAIN]: async () =>
                await connectWallet({
                  id: "metamask-bsc",
                  provider: window.ethereum,
                  walletId: WalletKey.METAMASK,
                }),
              [ProviderKey.ETHEREUM]: async () =>
                await connectWallet({
                  id: "metamask-eth",
                  provider: window.ethereum,
                  walletId: WalletKey.METAMASK,
                }),
              [ProviderKey.BASE]: async () =>
                await connectWallet({
                  id: "metamask-base",
                  provider: window.ethereum,
                  walletId: WalletKey.METAMASK,
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
              [ProviderKey.AVALANCHE]: async () =>
                await connectWallet({
                  id: "okx-avax",
                  provider: window.okxwallet,
                  walletId: WalletKey.OKX,
                }),
              [ProviderKey.BINANCESMARTCHAIN]: async () =>
                await connectWallet({
                  id: "okx-bsc",
                  provider: window.okxwallet,
                  walletId: WalletKey.OKX,
                }),
              [ProviderKey.ETHEREUM]: async () =>
                await connectWallet({
                  id: "okx-eth",
                  provider: window.okxwallet,
                  walletId: WalletKey.OKX,
                }),
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "okx-utxo",
                  provider: window.okxwallet.bitcoin,
                  walletId: WalletKey.OKX,
                }),
              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "okx-cosmos",
                  provider: window.okxwallet.keplr,
                  subchain: "cosmoshub-4",
                  walletId: WalletKey.OKX,
                }),
            };
          } else {
            SUPPORTED_WALLETS[walletKey].isAvailable = false;
          }
          break;
        }
        case WalletKey.PHANTOM: {
          if (window.solana?.isPhantom) {
            SUPPORTED_WALLETS[walletKey].isAvailable = true;
            SUPPORTED_WALLETS[walletKey].chainConnect = {
              [ProviderKey.AVALANCHE]: async () =>
                await connectWallet({
                  id: "phantom-avax",
                  provider: window.phantom?.ethereum,
                  walletId: WalletKey.PHANTOM,
                }),
              [ProviderKey.BINANCESMARTCHAIN]: async () =>
                await connectWallet({
                  id: "phantom-bsc",
                  provider: window.phantom?.ethereum,
                  walletId: WalletKey.PHANTOM,
                }),
              [ProviderKey.ETHEREUM]: async () =>
                await connectWallet({
                  id: "phantom-eth",
                  provider: window.phantom?.ethereum,
                  walletId: WalletKey.PHANTOM,
                }),
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "phantom-utxo",
                  provider: window.phantom.bitcoin,
                  walletId: WalletKey.PHANTOM,
                }),
              [ProviderKey.SOLANA]: async () =>
                await connectWallet({
                  id: "phantom-solana",
                  provider: window.phantom.solana,
                  walletId: WalletKey.PHANTOM,
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
              [ProviderKey.AVALANCHE]: async () =>
                await connectWallet({
                  id: "vultisig-avax",
                  provider: window.vultisig?.ethereum,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.BINANCESMARTCHAIN]: async () =>
                await connectWallet({
                  id: "vultisig-bsc",
                  provider: window.vultisig?.ethereum,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.ETHEREUM]: async () =>
                await connectWallet({
                  id: "vultisig-eth",
                  provider: window.vultisig?.ethereum,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.THORCHAIN]: async () =>
                await connectWallet({
                  id: "vultisig-thorchain",
                  provider: window.thorchain || window.vultisig?.thorchain,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.BITCOIN]: async () =>
                await connectWallet({
                  id: "vultisig-utxo",
                  provider: window.bitcoin || window.vultisig?.bitcoin,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.BITCOINCASH]: async () =>
                await connectWallet({
                  id: "vultisig-bch",
                  provider: window.bitcoincash || window.vultisig?.bitcoincash,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.LITECOIN]: async () =>
                await connectWallet({
                  id: "vultisig-ltc",
                  provider: window.litecoin || window.vultisig?.litecoin,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.DOGECOIN]: async () =>
                await connectWallet({
                  id: "vultisig-doge",
                  provider: window.dogecoin || window.vultisig?.dogecoin,
                  walletId: WalletKey.VULTISIG,
                }),
              [ProviderKey.COSMOS]: async () =>
                await connectWallet({
                  id: "vultisig-cosmos",
                  provider: window.vultisig?.cosmos,
                  subchain: "cosmoshub-4",
                  walletId: WalletKey.VULTISIG,
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
            [ProviderKey.AVALANCHE]: async () =>
              await connectWallet({
                id: "walletconnect-avax",
                provider: modal,
                walletId: WalletKey.WALLETCONNECT,
              }),
            [ProviderKey.BINANCESMARTCHAIN]: async () =>
              await connectWallet({
                id: "walletconnect-bsc",
                provider: modal,
                walletId: WalletKey.WALLETCONNECT,
              }),
            [ProviderKey.ETHEREUM]: async () =>
              await connectWallet({
                id: "walletconnect-eth",
                provider: modal,
                walletId: WalletKey.WALLETCONNECT,
              }),
          };
          break;
        case WalletKey.LEDGER:
          SUPPORTED_WALLETS[walletKey].isAvailable = true;
          SUPPORTED_WALLETS[walletKey].chainConnect = {
            [ProviderKey.AVALANCHE]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-avax",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.BINANCESMARTCHAIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-bsc",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.ETHEREUM]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-eth",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.BITCOIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-btc",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.BITCOINCASH]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-bch",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.LITECOIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-ltc",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.DOGECOIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-doge",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.COSMOS]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-cosmos",
                provider: transport,
                walletId: WalletKey.LEDGER,
              });
            },
            [ProviderKey.THORCHAIN]: async () => {
              const transport = await TransportWebUSB.create();
              return await connectWallet({
                id: "ledger-thorchain",
                provider: transport,
                walletId: WalletKey.LEDGER,
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

  const isWalletConnected = (chainKey: ChainKey) => {
    return Boolean(walletsState[chainKey]?.address);
  };

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
        isWalletConnected,
        mimirParameters,
        midgardStats,
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
