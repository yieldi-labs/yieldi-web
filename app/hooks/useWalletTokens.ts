import { formatNumber, isERC20, normalizeAddress } from "@/app/utils";
import {
  WalletTokensData,
  TokenData,
  ConnectedWalletsState,
} from "@/utils/interfaces";
import { ChainKey } from "@/utils/wallet/constants";
import { getBalance, getPools, PoolDetail } from "@/midgard";
import { getChainKeyFromChain } from "@/utils/chain";
import {
  assetFromString,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
import { useUTXO } from "./useUTXO";
import {
  checkAndSwitchChain,
  initialWalletTokensData,
} from "@/utils/wallet/balances";
import { useQuery } from "@tanstack/react-query";
import { SigningStargateClient } from "@cosmjs/stargate";

export const useWalletTokens = (walletsState: ConnectedWalletsState) => {
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
  const { getBalance: getBalanceBch } = useUTXO({
    chain: "BCH",
    wallet: walletsState["BitcoinCash"],
  });

  const utxoBalancesHandlers = {
    [ChainKey.BITCOIN]: getBalanceBtc,
    [ChainKey.LITECOIN]: getBalanceLtc,
    [ChainKey.DOGECOIN]: getBalanceDoge,
    [ChainKey.BITCOINCASH]: getBalanceBch,
  };

  const fetchWalletTokens = async () => {
    const updatedTokensData: WalletTokensData = {
      ...initialWalletTokensData,
    };

    const addTokenData = (chainKey: ChainKey, tokenData: TokenData) => {
      updatedTokensData[chainKey] = {
        ...(updatedTokensData[chainKey] || {}),
        [tokenData.asset]: tokenData,
      };
    };

    const fetchNativeTokens = (pool: PoolDetail) => {
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
      }
    };

    const fetchPoolTokens = async () => {
      const { data: pools } = await getPools({
        query: { period: "30d", status: "available" },
      });

      if (!pools) return;
      
      pools.map((pool) => {
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
          fetchNativeTokens(pool);
        }
      });
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

    return { ...updatedTokensData };
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
    chainKey: "Bitcoin" | "Dogecoin" | "Litecoin" | "BitcoinCash",
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

  const getCosmosBalance = async (walletAddress: string) => {
    try {
      const client = await SigningStargateClient.connect(
        process.env.NEXT_PUBLIC_COSMOS_DIRECTORY_URL || "",
      );
      const atomDecimals = 6;
      const balance = await client.getBalance(walletAddress, "uatom");
      const baseAssetAmount = baseToAsset(
        baseAmount(balance.amount, atomDecimals),
      )
        .amount()
        .toNumber();
      return {
        balance: baseAssetAmount,
        formattedBalance: formatNumber(baseAssetAmount, atomDecimals),
      };
    } catch (err) {
      console.error("Error getting ATOM balance:", err);
      return null;
    }
  };

  const getTokenBalances = async (walletTokensData: WalletTokensData): Promise<WalletTokensData> => {
    let newWalletTokensData: WalletTokensData = { ...walletTokensData };
  
    const updateTokenData = (
      chain: ChainKey,
      tokenKey: string,
      updates: Partial<TokenData>,
      fallbackBalance = 0,
    ) => {
      newWalletTokensData = {
        ...newWalletTokensData,
        [chain]: {
          ...newWalletTokensData[chain],
          [tokenKey]: {
            ...newWalletTokensData[chain][tokenKey],
            ...walletTokensData[chain][tokenKey],
            ...updates,
            balance: updates.balance ?? fallbackBalance,
          },
        },
      };
    };
  
    const chainHandlers: Record<any, any> = {
      [ChainKey.AVALANCHE]: async (address: string, provider: any, token: TokenData) => {
        const info = await checkAndSwitchChain(
          ChainKey.AVALANCHE,
          address,
          provider,
          token.tokenAddress as `0x${string}`,
        );
        return { balance: baseToAsset(baseAmount(info?.balance.toString() || 0, 18)).amount().toNumber() };
      },
      [ChainKey.BSCCHAIN]: async (address: string, provider: any, token: TokenData) => {
        const info = await checkAndSwitchChain(
          ChainKey.BSCCHAIN,
          address,
          provider,
          token.tokenAddress as `0x${string}`,
        );
        return { balance: baseToAsset(baseAmount(info?.balance.toString() || 0, 18)).amount().toNumber() };
      },
      [ChainKey.ETHEREUM]: async (address: string, provider: any, token: TokenData) => {
        const info = await checkAndSwitchChain(
          ChainKey.ETHEREUM,
          address,
          provider,
          token.tokenAddress as `0x${string}`,
        );
        return { balance: baseToAsset(baseAmount(info?.balance.toString() || 0, 18)).amount().toNumber() };
      },
      [ChainKey.THORCHAIN]: async (address: string) => {
        const info = await getRuneBalance(address);
        const balance = info?.coins.find((coin) => coin.asset === "THOR.RUNE")?.amount || 0;
        return { balance: Number(formatNumber(balance, 8)) };
      },
      [ChainKey.BITCOIN]: async (address: string) => {
        const info = await getUTXOInfo(ChainKey.BITCOIN, address);
        return { balance: info?.balance || 0 };
      },
      [ChainKey.LITECOIN]: async (address: string) => {
        const info = await getUTXOInfo(ChainKey.LITECOIN, address);
        return { balance: info?.balance || 0 };
      },
      [ChainKey.BITCOINCASH]: async (address: string) => {
        const info = await getUTXOInfo(ChainKey.BITCOINCASH, address);
        return { balance: info?.balance || 0 };
      },
      [ChainKey.DOGECOIN]: async (address: string) => {
        const info = await getUTXOInfo(ChainKey.DOGECOIN, address);
        return { balance: info?.balance || 0 };
      },
      [ChainKey.GAIACHAIN]: async (address: string) => {
        const info = await getCosmosBalance(address);
        return { balance: info?.balance || 0 };
      },
    };
  
    for (const [chain, tokens] of Object.entries(walletTokensData)) {
      if (!walletsState || !walletsState[chain as ChainKey]) continue
    
      const chainHandler = chainHandlers[chain as ChainKey];
      if (!chainHandler) continue
    
      const provider = walletsState[chain as ChainKey].provider;
      const address = walletsState[chain as ChainKey].address;
    
      for (const [tokenKey, token] of Object.entries(tokens)) {
        try {
          const result = await chainHandler(address, provider, token);
          updateTokenData(chain as ChainKey, tokenKey, result);
        } catch (err) {
          console.error(`Error fetching balance for ${tokenKey}:`, err);
          updateTokenData(chain as ChainKey, tokenKey, {}, 0);
        }
      }
    }
    
    return newWalletTokensData;
  };
  
  const { data: walletTokensData, isFetching: isFetchingWalletTokens } =
    useQuery({
      queryKey: ["walletTokens", Object.keys(walletsState).length],
      queryFn: () => fetchWalletTokens(),
      enabled: Object.keys(walletsState).length > 0,
      retry: false
    });

  const {
    data: walletBalances,
    isFetching,
    refetch
  } = useQuery({
    queryKey: ["walletBalances", walletTokensData],
    queryFn: () => getTokenBalances(walletTokensData as WalletTokensData),
    enabled: !!walletTokensData,
    retry: false
  });

  return {
    refreshBalances: refetch, // TODO: Avoid refresh all at once
    balanceList: walletBalances,
    isLoadingBalance: isFetching,
    isLoadingTokenList: isFetchingWalletTokens,
  };
};
