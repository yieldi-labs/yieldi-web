import { formatNumber, isERC20, normalizeAddress } from "@/app/utils";
import {
  WalletTokensData,
  TokenData,
  ConnectedWalletsState,
} from "@/utils/interfaces";
import { ChainKey, EVM_CHAINS } from "@/utils/wallet/constants";
import { useEffect, useState } from "react";
import { formatUnits, encodeFunctionData, decodeFunctionResult } from "viem";
import ERC20_ABI from "@/hooks/erc20.json";
import { getBalance, getPools, PoolDetail } from "@/midgard";
import * as viemChains from "viem/chains";
import { getChainKeyFromChain } from "@/utils/chain";
import { baseToAsset } from "@xchainjs/xchain-util";
import { useUTXO } from "./useUTXO";

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

export const useWalletTokens = (walletsState: ConnectedWalletsState) => {
  const [walletTokensData, setWalletTokensData] = useState<WalletTokensData>(
    initialWalletTokensData,
  );
  const [walletBalanceData, setWalletBalanceData] = useState<WalletTokensData>(
    initialWalletTokensData,
  );

  // TODO: Avoid duplication of this condition between useUTXO and this line (https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration#comment-d10c7c6f)
  const { getBalance: getBalanceBtc } = useUTXO({chain: 'BTC',  wallet: walletsState['Bitcoin']})
  const { getBalance: getBalanceLtc } = useUTXO({chain: 'LTC',  wallet: walletsState['Litecoin']})
  const { getBalance: getBalanceDoge } = useUTXO({chain: 'DOGE',  wallet: walletsState['Dogecoin']})

  const utxoBalancesHandlers = {
    [ChainKey.BITCOIN]: getBalanceBtc,
    [ChainKey.LITECOIN]: getBalanceLtc,
    [ChainKey.DOGECOIN]: getBalanceDoge,
  }

  const getERC20TokenInfo = async (
    walletAddress: string,
    provider: any,
    tokenAddress?: `0x${string}`,
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
          ],
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
        const chainKey = getChainKeyFromChain(pool.asset.split(".")[0]);

        const wallet = walletsState[chainKey as ChainKey];
        if (wallet?.address && wallet?.provider) {
          try {
            addTokenData(chainKey as ChainKey, {
              name: chainKey,
              symbol: pool.asset.split(".")[0],
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
        }
      };

      const fetchPoolTokens = async () => {
        const { data: pools } = await getPools({
          query: { period: "30d", status: "available" },
        });

        if (!pools) return;
        const fetchPromises = pools.map(async (pool) => {
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
          } else if (walletsState[getChainKeyFromChain(assetType)]) {
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

  const checkAndSwitchChain = async (
    chainKey: ChainKey,
    walletAddress: string,
    provider: any,
    tokenAddress?: `0x${string}`,
  ): Promise<
    | {
        balance: number;
        name?: undefined;
        symbol?: undefined;
        decimals?: undefined;
      }
    | {
        name: string;
        symbol: string;
        decimals: number;
        balance: number;
      }
  > => {
    let providerChainId = await provider.request({
      method: "eth_chainId",
    });
    const currentChain = EVM_CHAINS.find(
      ({ chainId }) => chainId == providerChainId,
    );
    if (currentChain?.name !== chainKey) {
      try {
        providerChainId = await provider.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: EVM_CHAINS.find(({ name }) => name == chainKey)?.chainId,
            },
          ],
        });
        if (providerChainId) {
          checkAndSwitchChain(chainKey, walletAddress, provider, tokenAddress);
        }
      } catch (err) {
        // need to add chain

        if ((err as { code: number }).code === 4902) {
          const chainId = EVM_CHAINS.find(
            ({ name }) => name == chainKey,
          )?.chainId;
          const config = getChainConfigById(chainId!);
          const addRequest = {
            chainId: chainId,
            chainName: config?.name,
            rpcUrls: config?.rpcUrls.default.http,
            iconUrls: [],
            nativeCurrency: config?.nativeCurrency,
            blockExplorerUrls: config?.blockExplorers?.default.url,
          };

          if (chainId) {
            providerChainId = await provider.request({
              method: "wallet_addEthereumChain",
              params: [addRequest],
            });
            if (providerChainId) {
              checkAndSwitchChain(
                chainKey,
                walletAddress,
                provider,
                tokenAddress,
              );
            }
          }
        }
      }
    }

    const tokenInfo = await getERC20TokenInfo(
      walletAddress,
      provider,
      tokenAddress,
    );
    if (!tokenInfo) {
      throw new Error("Failed to fetch token info");
    }
    return tokenInfo;
  };

  const getChainConfigById = (chainId: string) => {
    return Object.values(viemChains).find(
      (chain) => chain.id === Number(chainId),
    );
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

  const getUTXOInfo = async (chainKey: "Bitcoin" | "Dogecoin" | "Litecoin", walletAddress: string) => { // TODO: Remove once unify chains configurations (https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration#comment-d10c7c6f)
    if (!walletsState) return;
    if (!walletsState[chainKey]?.provider) return null;
    const balance = await utxoBalancesHandlers[chainKey](walletAddress)
    return { balance: baseToAsset(balance.amount).amount().toNumber(), formattedBalance: baseToAsset(balance.amount).amount().toString() };
  };

  const getTokenBalances = async () => {
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
                } catch (err) {
                  console.error(`Error getting balance of ${tokenKey}: ${err}`);
                  setWalletBalanceData((prevData) => {
                    return {
                      ...prevData,
                      [key as ChainKey]: {
                        ...prevData[key as ChainKey],
                        [tokenKey]: {
                          ...prevData[key as ChainKey][tokenKey],
                          ...walletTokensData[key as ChainKey][tokenKey],
                          formattedBlanace: 0,
                          balance: 0,
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
                try {
                  const info = await getRuneBalance(
                    walletsState[ChainKey.THORCHAIN].address,
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
                    });
                  }
                } catch (err) {
                  console.error(`Error getting balance of ${tokenKey}: ${err}`);
                  setWalletBalanceData((prevData) => {
                    return {
                      ...prevData,
                      [key as ChainKey]: {
                        ...prevData[key as ChainKey],
                        [tokenKey]: {
                          ...prevData[key as ChainKey][tokenKey],
                          ...walletTokensData[key as ChainKey][tokenKey],
                          formattedBlanace: 0,
                          balance: 0,
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
          case ChainKey.LITECOIN:
          case ChainKey.BITCOIN: {
            for (const tokenKey of Object.keys(list)) {
              const token = list[tokenKey];
              if (token.balance === 0) {
                try {
                  const info = await getUTXOInfo(
                    key as "Bitcoin" | "Litecoin" | "Dogecoin",
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
                } catch (err) {
                  console.error(`Error getting balance of ${tokenKey}: ${err}`);
                  setWalletBalanceData((prevData) => {
                    return {
                      ...prevData,
                      [key as ChainKey]: {
                        ...prevData[key as ChainKey],
                        [tokenKey]: {
                          ...prevData[key as ChainKey][tokenKey],
                          ...walletTokensData[key as ChainKey][tokenKey],
                          formattedBlanace: 0,
                          balance: 0,
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

  useEffect(() => {
    fetchWalletTokens();
  }, [walletsState]);

  useEffect(() => {
    getTokenBalances();
  }, [walletTokensData]);

  return {
    refreshBalances: fetchWalletTokens, // TODO: Avoid refresh all at once
    balanceList: walletBalanceData,
  };
};
