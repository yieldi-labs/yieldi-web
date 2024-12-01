"use client";
import { cloneElement, FC, useEffect, useState } from "react";
import { formatNumber } from "@/app/utils";
import Image from "next/image";
import {
  Copy,
  Exit,
  Eye,
  LinkExternal,
  Plus,
  QRCode,
  Synchronize,
} from "@/svg/icons";
import MiddleTruncate from "@/app/components/middle-truncate";
import { useAppState } from "@/utils/context";
import ERC20_ABI from "@/hooks/erc20.json";
import {
  ChainKey,
  EVM_CHAINS,
  SUPPORTED_WALLETS,
} from "@/utils/wallet/constants";
import {
  getAssetSymbol,
  getLogoPath,
  isERC20,
  normalizeAddress,
} from "@/app/utils";
import { decodeFunctionResult, encodeFunctionData, formatUnits } from "viem";
import { getBalance, getPools } from "@/midgard";
import { Network } from "@xchainjs/xchain-client";
import {
  Client as BitcoinClient,
  defaultBTCParams,
} from "@xchainjs/xchain-bitcoin";
import { Client as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";
import { WalletTokensData, TokenData } from "@/utils/interfaces";

const Component: FC = () => {
  const {
    walletsState,
    isWalletDrawerOpen,
    toggleWalletDrawer,
    toggleWalletModal,
    getChainKeyFromChain,
    walletTokensData,
    setWalletTokensData,
  } = useAppState();

  const initialWalletTokensData: WalletTokensData = {
    [ChainKey.ARBITRUM]: {},
    [ChainKey.AVALANCHE]: {},
    [ChainKey.BASE]: {},
    [ChainKey.BITCOIN]: {},
    [ChainKey.BITCOINCASH]: {},
    [ChainKey.BLAST]: {},
    [ChainKey.BSCCHAIN]: {},
    [ChainKey.CRONOSCHAIN]: {},
    [ChainKey.DASH]: {},
    [ChainKey.DOGECOIN]: {},
    [ChainKey.DYDX]: {},
    [ChainKey.ETHEREUM]: {},
    [ChainKey.GAIACHAIN]: {},
    [ChainKey.KUJIRA]: {},
    [ChainKey.LITECOIN]: {},
    [ChainKey.MAYACHAIN]: {},
    [ChainKey.OPTIMISM]: {},
    [ChainKey.POLKADOT]: {},
    [ChainKey.POLYGON]: {},
    [ChainKey.SOLANA]: {},
    [ChainKey.SUI]: {},
    [ChainKey.THORCHAIN]: {},
    [ChainKey.TON]: {},
    [ChainKey.ZKSYNC]: {},
  };

  const handleAddWallet = () => {
    toggleWalletModal();
    toggleWalletDrawer();
  };

  const fetchWalletTokens = async () => {
    if (!walletsState) return;

    try {
      const updatedTokensData: WalletTokensData = {
        ...initialWalletTokensData,
      };

      const addTokenData = (chainKey: ChainKey, tokenData: TokenData) => {
        updatedTokensData[chainKey] = {
          ...(updatedTokensData[chainKey] || {}),
          [tokenData.asset]: tokenData,
        };
      };

      const fetchNativeTokens = async (poolAsset: string) => {
        const chainKey = getChainKeyFromChain(poolAsset.split(".")[0]);

        const wallet = walletsState[chainKey as ChainKey];
        if (wallet?.address && wallet?.provider) {
          try {
            addTokenData(chainKey as ChainKey, {
              name: chainKey,
              symbol: poolAsset.split(".")[0],
              decimals: 18,
              balance: 0,
              asset: poolAsset,
              chainName: "Native",
              chainKey: chainKey,
              tokenAddress: "0x",
            });
          } catch (error) {
            console.error(
              `Error fetching native balance for ${chainKey}:`,
              error
            );
          }
        }
      };

      const fetchPoolTokens = async () => {
        const { data: pools } = await getPools({
          query: { period: "30d", status: "available" },
        });

        if (!pools) return;
        const fetchPromises = pools.map(async (pool: any) => {
          const assetType = pool.asset.split(".")[0].toLowerCase();
          if (isERC20(pool.asset)) {
            const poolViemAddress = pool.asset.split(".")[1].split("-")[1];
            const chainKey = getChainKeyFromChain(pool.asset.split(".")[0]);
            const tokenAddress = normalizeAddress(poolViemAddress!);
            if (tokenAddress) {
              addTokenData(chainKey, {
                asset: pool.asset,
                balance: 0,
                chainName: pool.asset.split(".")[0],
                chainKey: chainKey,
                tokenAddress: tokenAddress,
              });
            }
          } else if (assetType === "btc" || assetType === "doge") {
            const chainKey =
              assetType === "btc" ? ChainKey.BITCOIN : ChainKey.DOGECOIN;
            addTokenData(chainKey, {
              asset: pool.asset,
              symbol: chainKey,
              chainName: pool.asset.split(".")[0],
              balance: 0,
              formattedBalance: 0,
              chainKey: chainKey,
              tokenAddress: "0x",
            });
          } else if (walletsState[getChainKeyFromChain(assetType)]) {
            await fetchNativeTokens(pool.asset);
          }
        });

        await Promise.all(fetchPromises);
      };

      addTokenData(ChainKey.THORCHAIN, {
        name: ChainKey.THORCHAIN,
        symbol: "RUNE",
        decimals: 8,
        balance: 0,
        asset: "THOR.RUNE",
        chainName: "Native",
        chainKey: ChainKey.THORCHAIN,
        tokenAddress: "",
      });

      await fetchPoolTokens();

      setWalletTokensData({ ...updatedTokensData });
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
    }
  };

  const [walletBalanceData, setWalletBalanceData] = useState<WalletTokensData>(
    initialWalletTokensData
  );
  useEffect(() => {
    fetchWalletTokens();
  }, [walletsState]);

  useEffect(() => {
    const getBalance = async () => {
      for (const key of Object.keys(walletTokensData)) {
        if (walletsState && walletsState[key]) {
          const list = walletTokensData[key as ChainKey];
          switch (key as ChainKey) {
            case ChainKey.AVALANCHE:
            case ChainKey.BSCCHAIN:
            case ChainKey.ETHEREUM: {
              for (const tokenKey of Object.keys(list)) {
                const token = list[tokenKey];
                if (token.balance === 0) {
                  const info = await checkAndSwitchChain(
                    key as ChainKey,
                    walletsState[key].address,
                    walletsState[key].provider,
                    token.tokenAddress as `0x${string}`
                  );
                  if (info?.balance) {
                    setWalletBalanceData((prevData) => {
                      return {
                        ...prevData,
                        [key as ChainKey]: {
                          ...prevData[key as ChainKey],
                          [tokenKey]: {
                            ...prevData[key as ChainKey][tokenKey],
                            ...walletTokensData[key as ChainKey][tokenKey],
                            ...info,
                          },
                        },
                      };
                    });
                  }
                }
              }
              break;
            }
            case ChainKey.THORCHAIN: {
              for (const tokenKey of Object.keys(list)) {
                const token = list[tokenKey];
                if (token.balance === 0) {
                  const info = await getRuneBalance(
                    walletsState[ChainKey.THORCHAIN].address
                  );
                  if (info) {
                    setWalletBalanceData((prevData) => {
                      return {
                        ...prevData,
                        [key as ChainKey]: {
                          ...prevData[key as ChainKey],
                          [tokenKey]: {
                            ...prevData[key as ChainKey][tokenKey],
                            ...walletTokensData[key as ChainKey][tokenKey],
                            balance: info?.coins[0]
                              ? Number(formatNumber(info?.coins[0].amount, 8))
                              : 0,
                          },
                        },
                      };
                    });
                  }
                }
              }
              break;
            }
            case ChainKey.DOGECOIN:
            case ChainKey.BITCOIN: {
              for (const tokenKey of Object.keys(list)) {
                const token = list[tokenKey];
                if (token.balance === 0) {
                  const info = await getUTXOInfo(
                    key as ChainKey,
                    walletsState[key as ChainKey].address
                  );
                  if (info) {
                    setWalletBalanceData((prevData) => {
                      return {
                        ...prevData,
                        [key as ChainKey]: {
                          ...prevData[key as ChainKey],
                          [tokenKey]: {
                            ...prevData[key as ChainKey][tokenKey],
                            ...walletTokensData[key as ChainKey][tokenKey],
                            ...info,
                          },
                        },
                      };
                    });
                  }
                }
              }
              break;
            }
          }
        }
      }
    };
    getBalance();
  }, [walletTokensData]);

  const checkAndSwitchChain = async (
    chainKey: ChainKey,
    walletAddress: string,
    provider: any,
    tokenAddress?: `0x${string}`
  ) => {
    let providerChainId = await provider.request({
      method: "eth_chainId",
    });
    const currentChain = EVM_CHAINS.find(
      ({ chainId }) => chainId == providerChainId
    );
    if (currentChain?.name === chainKey) {
      return getERC20TokenInfo(walletAddress, provider, tokenAddress);
    } else {
      providerChainId = await provider.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: EVM_CHAINS.find(({ name }) => name == chainKey)?.chainId,
          },
        ],
      });
      return checkAndSwitchChain(
        chainKey,
        walletAddress,
        provider,
        tokenAddress
      );
    }
  };

  const getERC20TokenInfo = async (
    walletAddress: string,
    provider: any,
    tokenAddress?: `0x${string}`
  ) => {
    try {
      if (tokenAddress === "0x") {
        // Native Balance
        const balanceHex = await provider.request({
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
        });
        const balanceBigInt = BigInt(balanceHex);
        const balance = Number(formatUnits(balanceBigInt, 18));
        return { balance };
      } else {
        // Encode function calls
        const nameData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "name",
        });

        const symbolData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "symbol",
        });

        const decimalsData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "decimals",
        });

        const balanceData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [walletAddress],
        });

        // Make parallel RPC calls
        const [nameHex, symbolHex, decimalsHex, balanceHex] = await Promise.all(
          [
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: nameData }, "latest"],
            }),
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: symbolData }, "latest"],
            }),
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: decimalsData }, "latest"],
            }),
            provider.request({
              method: "eth_call",
              params: [{ to: tokenAddress, data: balanceData }, "latest"],
            }),
          ]
        );
        // Decode results
        const name = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "name",
          data: nameHex,
        }) as string;

        const symbol = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "symbol",
          data: symbolHex,
        }) as string;

        const decimals = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "decimals",
          data: decimalsHex,
        }) as number;

        const balanceBigInt = decodeFunctionResult({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          data: balanceHex,
        }) as bigint;
        const balance = Number(formatUnits(balanceBigInt, Number(decimals)));

        return { name, symbol, decimals, balance };
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getUXTOClient = (chainKey: ChainKey) => {
    try {
      const commonConfig = {
        network: Network.Mainnet,
        phrase: "",
      };

      switch (chainKey) {
        case ChainKey.BITCOIN:
          return new BitcoinClient({
            ...defaultBTCParams,
            ...commonConfig,
          });
        case ChainKey.DOGECOIN:
          return new DogeClient({
            ...defaultDogeParams,
            ...commonConfig,
          });
        default:
          throw new Error(`Unsupported UTXO chain: ${chainKey}`);
      }
    } catch (err) {
      console.error(`Error initializing ${chainKey} client:`, err);
      return null;
    }
  };

  const getUTXOInfo = async (chainKey: ChainKey, walletAddress: string) => {
    if (!walletsState) return;
    if (!walletsState[chainKey]?.provider) return null;
    const client = getUXTOClient(chainKey);
    const getBalance = async (address: string) => {
      if (!client) throw new Error(`${chainKey} client not initialized`);
      try {
        const res = await client.getBalance(address);
        const balance = res[0];
        const balanceAmount = balance.amount.amount();
        const balanceBigInt = BigInt(balanceAmount.toString());
        const formattedBalance = Number(formatUnits(balanceBigInt, 8));
        return { balanceAmount, balanceBigInt, formattedBalance };
      } catch (err) {
        console.error(`Error getting ${chainKey} balance:`, err);
        throw err;
      }
    };
    return await getBalance(walletAddress);
  };

  const getRuneBalance = async (walletAddress: string) => {
    try {
      const { data: runeBalance } = await getBalance({
        path: {
          address: walletAddress,
        },
      });
      return runeBalance;
    } catch {
      return undefined;
    }
  };

  return (
    isWalletDrawerOpen && (
      <>
        <div
          className="bg-[rgba(0,0,0,0.5)] fixed h-full inset-0 z-20"
          onClick={toggleWalletDrawer}
        />
        <div className="bg-secondary border-b-4 border-l-4 border-t-4 border-white fixed h-full right-0 rounded-l-large top-0 w-[360px] z-20">
          <div className="border-b flex py-4">
            <span className="flex-1 font-bold leading-6 px-4 text-2xl">
              Wallet
            </span>
            <span className="border-r cursor-pointer px-2">
              <Eye strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="border-r cursor-pointer px-2">
              <Synchronize strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span
              className="border-r cursor-pointer px-2"
              onClick={handleAddWallet}
            >
              <Plus strokeColor="#627eea" strokeWidth={1.5} />
            </span>
            <span className="cursor-pointer px-2">
              <Exit strokeColor="#ff6656" strokeWidth={1.5} />
            </span>
          </div>
          <div className="overflow-auto max-h-[calc(100vh-6rem)] custom-scroll ">
            {Object.keys(walletsState!).map((key) => {
              const wallet = walletsState![key];
              return (
                <div key={wallet.walletId + key} className="p-4">
                  <div className="bg-white flex gap-2 rounded-lg p-4">
                    <span className="leading-6">
                      {cloneElement(SUPPORTED_WALLETS[wallet.walletId].icon, {
                        className: "icon",
                      })}
                    </span>
                    <span className="flex-3 font-bold leading-6">{key}</span>
                    <span className="flex-1 leading-6 px-2">
                      <MiddleTruncate text={wallet.address} />
                    </span>
                    <span className="cursor-pointer my-auto ">
                      <Copy strokeColor="#627eea" size={14} />
                    </span>
                    <span className="cursor-pointer my-auto ">
                      <QRCode strokeColor="#627eea" size={14} />
                    </span>
                    <span className="cursor-pointer my-auto ">
                      <LinkExternal strokeColor="#627eea" size={14} />
                    </span>
                    <span className="cursor-pointer my-auto -mr-1">
                      <Exit strokeColor="#ff6656" size={14} />
                    </span>
                  </div>
                  {walletBalanceData &&
                    Object.values(walletBalanceData[key as ChainKey]).map(
                      (token: TokenData) => {
                        return (
                          <div
                            key={token.chainName + token.asset}
                            className="px-2 py-4"
                          >
                            <div className="flex gap-2 items-center">
                              <Image
                                src={getLogoPath(token.asset)}
                                alt={`${getAssetSymbol(token.asset)} logo`}
                                width={26}
                                height={26}
                                className="rounded-full"
                              />
                              <div className="flex flex-1 flex-col">
                                <span className="font-bold leading-5">
                                  {token.symbol}
                                </span>
                                <span className="leading-4 text-gray-500">
                                  {token.chainName}
                                </span>
                              </div>
                              <span className="font-bold">
                                {formatNumber(token.balance, 6) ||
                                  formatNumber(token.formattedBalance!, 6)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </>
    )
  );
};

export default Component;
