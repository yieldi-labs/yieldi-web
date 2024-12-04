import { formatNumber, isERC20, normalizeAddress } from "@/app/utils";
import { useAppState } from "@/utils/context";
import { WalletTokensData, TokenData, ConnectedWalletsState } from "@/utils/interfaces";
import { ChainKey, EVM_CHAINS } from "@/utils/wallet/constants";
import { useEffect, useState } from "react";
import { formatUnits, encodeFunctionData, decodeFunctionResult } from "viem";
import ERC20_ABI from "@/hooks/erc20.json";
import { getBalance, getPools } from "@/midgard";
import { Network } from "@xchainjs/xchain-client";
import {
  Client as BitcoinClient,
  defaultBTCParams,
} from "@xchainjs/xchain-bitcoin";
import * as viemChains from "viem/chains";
import { Client as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";


export const useWalletTokens = (walletsState: ConnectedWalletsState) => {
  const { getChainKeyFromChain } = useAppState();
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

  const [walletTokensData, setWalletTokensData] = useState<WalletTokensData>(
    initialWalletTokensData
  );
  const [walletBalanceData, setWalletBalanceData] = useState<WalletTokensData>(
    initialWalletTokensData
  );

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
          return checkAndSwitchChain(
            chainKey,
            walletAddress,
            provider,
            tokenAddress
          );
        }
      } catch (err) {
        // need to add chain

        if ((err as { code: number }).code === 4902) {
          const chainId = EVM_CHAINS.find(
            ({ name }) => name == chainKey
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
                tokenAddress
              );
            }
          }
        }
      }
    }
  };

  const getChainConfigById = (chainId: string) => {
    return Object.values(viemChains).find(
      (chain) => chain.id === Number(chainId)
    );
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

  useEffect(() => {
    fetchWalletTokens();
  }, [walletsState]);

  useEffect(() => {
    getTokenBalances();
  }, [walletTokensData]);

  return {
    fetch: fetchWalletTokens,
    balanceList: walletBalanceData,
  };
};
