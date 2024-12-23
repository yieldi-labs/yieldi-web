import { isERC20, normalizeAddress } from "@/app/utils";
import {
  WalletTokensData,
  TokenData,
  ConnectedWalletsState,
} from "@/utils/interfaces";
import { ChainKey } from "@/utils/wallet/constants";
import { getPools, PoolDetail } from "@/midgard";
import { getChainKeyFromChain } from "@/utils/chain";
import {
  assetFromString,
} from "@xchainjs/xchain-util";
import {
  initialWalletTokensData,
} from "@/utils/wallet/balances";
import { useQuery } from "@tanstack/react-query";
import { chainHandlers } from "@/utils/wallet/handlers/handleBalance";

export const useWalletTokens = (walletsState: ConnectedWalletsState) => {
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
  
    // TODO: We need to parallelize this requests (The EMV switch chain must be taken into account)
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
    refreshBalances: refetch,
    balanceList: walletBalances,
    isLoadingBalance: isFetching,
    isLoadingTokenList: isFetchingWalletTokens,
  };
};
