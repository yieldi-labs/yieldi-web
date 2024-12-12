import { formatNumber, isERC20, normalizeAddress } from "@/app/utils";
import {
  WalletTokensData,
  TokenData,
  ConnectedWalletsState,
} from "@/utils/interfaces";
import { ChainKey } from "@/utils/wallet/constants";
import { useEffect, useState } from "react";
import { getBalance, getPools, PoolDetail } from "@/midgard";
import { getChainKeyFromChain } from "@/utils/chain";
import { assetFromString, baseToAsset } from "@xchainjs/xchain-util";
import { useUTXO } from "./useUTXO";
import { checkAndSwitchChain, initialWalletTokensData } from "@/utils/wallet/balances";
import { useQuery } from "@tanstack/react-query";

export const useWalletTokens = (walletsState: ConnectedWalletsState) => {
  const [walletTokensData, setWalletTokensData] = useState<WalletTokensData>();

  console.log('walletTokensData', walletTokensData)

  // TODO: Avoid duplication of this condition between useUTXO and this line (https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration#comment-d10c7c6f)
  const { getBalance: getBalanceBtc } = useUTXO({
    chain: "BTC",
    wallet: walletsState["Bitcoin"],
  });
  const { getBalance: getBalanceLtc } = useUTXO({
    chain: "LTC",
    wallet: walletsState["Litecoin"],
  });
  const { getBalance: getBalanceDoge } = useUTXO({
    chain: "DOGE",
    wallet: walletsState["Dogecoin"],
  });

  const utxoBalancesHandlers = {
    [ChainKey.BITCOIN]: getBalanceBtc,
    [ChainKey.LITECOIN]: getBalanceLtc,
    [ChainKey.DOGECOIN]: getBalanceDoge,
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

      const fetchNativeTokens = async (pool: PoolDetail) => {
        const asset = assetFromString(pool.asset);
        if (!asset) {
          throw Error(`Invalid asset ${pool.asset}`);
        }
        const chainKey = getChainKeyFromChain(asset.chain);

        const wallet = walletsState[chainKey as ChainKey];
        if (wallet?.address && wallet?.provider) {
          try {
            addTokenData(chainKey as ChainKey, {
              name: chainKey,
              symbol: asset.symbol,
              decimals: Number(pool.nativeDecimal),
              balance: 0,
              asset: pool.asset,
              chainName: "Native",
              chainKey: chainKey,
              tokenAddress: "0x",
            });
          } catch (error) {
            console.error(
              `Error fetching native balance for ${chainKey}:`,
              error,
            );
          }
        } else {
          console.log('This is the case')
        }
      };

      const fetchPoolTokens = async () => {
        const { data: pools } = await getPools({
          query: { period: "30d", status: "available" },
        });

        if (!pools) return;
        const fetchPromises = pools.map(async (pool) => {
          const asset = assetFromString(pool.asset);
          if (!asset) {
            throw Error(`Invalid asset ${pool.asset}`);
          }
          if (isERC20(pool.asset)) {
            const poolViemAddress = pool.asset.split(".")[1].split("-")[1];
            const chainKey = getChainKeyFromChain(asset.chain);
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
          } else if (walletsState[getChainKeyFromChain(asset.chain)]) {
            await fetchNativeTokens(pool);
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

  const getUTXOInfo = async (
    chainKey: "Bitcoin" | "Dogecoin" | "Litecoin",
    walletAddress: string,
  ) => {
    // TODO: Remove once unify chains configurations (https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration#comment-d10c7c6f)
    if (!walletsState) return;
    if (!walletsState[chainKey]?.provider) return null;
    const balance = await utxoBalancesHandlers[chainKey](walletAddress);
    return {
      balance: baseToAsset(balance.amount).amount().toNumber(),
      formattedBalance: baseToAsset(balance.amount).amount().toString(),
    };
  };

  const getTokenBalances = async (walletTokensData: WalletTokensData) => {
    let newWalletTokensData: WalletTokensData = { ...walletTokensData }
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
                try {
                  const info = await checkAndSwitchChain(
                    key as ChainKey,
                    walletsState[key].address,
                    walletsState[key].provider,
                    token.tokenAddress as `0x${string}`,
                  );
                  if (info?.balance) {
                    newWalletTokensData = {
                        ...newWalletTokensData,
                        [key as ChainKey]: {
                          ...newWalletTokensData[key as ChainKey],
                          [tokenKey]: {
                            ...newWalletTokensData[key as ChainKey][tokenKey],
                            ...walletTokensData[key as ChainKey][tokenKey],
                            ...info,
                          },
                        },
                    };
                  }
                } catch (err) {
                  console.error(`Error getting balance of ${tokenKey}: ${err}`);
                  newWalletTokensData =  {
                      ...newWalletTokensData,
                      [key as ChainKey]: {
                        ...newWalletTokensData[key as ChainKey],
                        [tokenKey]: {
                          ...newWalletTokensData[key as ChainKey][tokenKey],
                          ...walletTokensData[key as ChainKey][tokenKey],
                          formattedBlanace: 0,
                          balance: 0,
                        },
                      },
                    };
                }
              }
            }
            break;
          }
          case ChainKey.THORCHAIN: {
            for (const tokenKey of Object.keys(list)) {
              const token = list[tokenKey];
              if (token.balance === 0) {
                try {
                  const info = await getRuneBalance(
                    walletsState[ChainKey.THORCHAIN].address,
                  );
                  if (info) {
                    newWalletTokensData =  {
                        ...newWalletTokensData,
                        [key as ChainKey]: {
                          ...newWalletTokensData[key as ChainKey],
                          [tokenKey]: {
                            ...newWalletTokensData[key as ChainKey][tokenKey],
                            ...walletTokensData[key as ChainKey][tokenKey],
                            balance: Number(
                              formatNumber(
                                info?.coins.find(
                                  (coin) => coin.asset === "THOR.RUNE",
                                )?.amount || 0,
                                8,
                              ),
                            ),
                          },
                        },
                      };
                  }
                } catch (err) {
                  console.error(`Error getting balance of ${tokenKey}: ${err}`);
                  newWalletTokensData = {
                      ...newWalletTokensData,
                      [key as ChainKey]: {
                        ...newWalletTokensData[key as ChainKey],
                        [tokenKey]: {
                          ...newWalletTokensData[key as ChainKey][tokenKey],
                          ...walletTokensData[key as ChainKey][tokenKey],
                          formattedBlanace: 0,
                          balance: 0,
                        },
                      },
                    };
                }
              }
            }
            break;
          }
          case ChainKey.DOGECOIN:
          case ChainKey.LITECOIN:
          case ChainKey.BITCOIN: {
            for (const tokenKey of Object.keys(list)) {
              const token = list[tokenKey];
              if (token.balance === 0) {
                try {
                  const info = await getUTXOInfo(
                    key as "Bitcoin" | "Litecoin" | "Dogecoin",
                    walletsState[key as ChainKey].address,
                  );
                  if (info) {
                    newWalletTokensData = {
                        ...newWalletTokensData,
                        [key as ChainKey]: {
                          ...newWalletTokensData[key as ChainKey],
                          [tokenKey]: {
                            ...newWalletTokensData[key as ChainKey][tokenKey],
                            ...walletTokensData[key as ChainKey][tokenKey],
                            ...info,
                          },
                        },
                      };
                  }
                } catch (err) {
                  console.error(`Error getting balance of ${tokenKey}: ${err}`);
                  newWalletTokensData = {
                      ...newWalletTokensData,
                      [key as ChainKey]: {
                        ...newWalletTokensData[key as ChainKey],
                        [tokenKey]: {
                          ...newWalletTokensData[key as ChainKey][tokenKey],
                          ...walletTokensData[key as ChainKey][tokenKey],
                          formattedBlanace: 0,
                          balance: 0,
                        },
                      },
                    };
                }
              }
            }
            break;
          }
        }
      }
    }
    return newWalletTokensData
  };

  useEffect(() => {
    if (Object.keys(walletsState).length > 0) {
      fetchWalletTokens();
    }
  }, [walletsState]);

  // useEffect(() => {
  //   getTokenBalances();
  // }, [walletTokensData]);

  const { data: walletBalances, isFetching, refetch } = useQuery({
    queryKey: ["walletTokens", walletTokensData],
    queryFn: () => getTokenBalances(walletTokensData as WalletTokensData),
    enabled: !!walletTokensData,
  });

  console.log('isLoading', isFetching)

  return {
    refreshBalances: refetch, // TODO: Avoid refresh all at once
    balanceList: walletBalances,
    isLoadingBalance: isFetching
  };
};
