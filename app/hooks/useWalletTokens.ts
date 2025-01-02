import { isERC20, normalizeAddress } from "@/app/utils";
import {
  WalletTokensData,
  TokenData,
  ConnectedWalletsState,
} from "@/utils/interfaces";
import { ChainKey, CHAINS } from "@/utils/wallet/constants";
import { getPools, PoolDetail } from "@/midgard";
import { getChainKeyFromChain } from "@/utils/chain";
<<<<<<< HEAD
import {
  assetFromString,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
=======
import { assetFromString, baseAmount, baseToAsset } from "@xchainjs/xchain-util";
>>>>>>> a2fdf8d (Disable wallets instead of hide them)
import { initialWalletTokensData } from "@/utils/wallet/balances";
import { useQuery } from "@tanstack/react-query";
import { getBalancePerChainAndAddress } from "@/ctrl/client";

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
              decimals: Number(pool.nativeDecimal),
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

  const getTokenBalances = async (
    walletTokensData: WalletTokensData,
  ): Promise<WalletTokensData> => {
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

    const chainPromises = Object.entries(walletTokensData).map(async ([chain, tokens]) => {
      if (!walletsState || !walletsState[chain as ChainKey]) return;
    
      const address = walletsState[chain as ChainKey].address;
    
      const chainInfo = CHAINS.find(chainDetail => chainDetail.name === chain);
      if (!chainInfo) {
        throw new Error('Unknown chain');
      }
    
      const balances = await getBalancePerChainAndAddress(chainInfo.ctrlChainId, address);
    
      Object.entries(tokens).forEach(([tokenKey, token]) => {
        try {
          const asset = assetFromString(tokenKey);
          const balance = balances.find(balance => {
            if (tokenKey.indexOf('-') === -1) { // Is native
              return balance.asset.contract === null;
            }
            return balance.asset.contract?.toLowerCase() === asset?.symbol.split('-')[1].toLowerCase();
          });
    
          const formattedAssetBalance = baseToAsset(
            baseAmount(balance?.amount.value || 0, token.decimals)
          ).amount().toNumber();
    
          updateTokenData(chain as ChainKey, tokenKey, { balance: formattedAssetBalance });
        } catch (err) {
          console.error(`Error fetching balance for ${tokenKey}:`, err);
          updateTokenData(chain as ChainKey, tokenKey, {}, 0);
        }
      });
    });
    
    await Promise.all(chainPromises);
    
    return newWalletTokensData;
  };

  const { data: walletTokensData, isFetching: isFetchingWalletTokens } =
    useQuery({
      queryKey: ["walletTokens", Object.keys(walletsState).length],
      queryFn: () => fetchWalletTokens(),
      enabled: Object.keys(walletsState).length > 0,
      retry: false,
    });

  const {
    data: walletBalances,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["walletBalances", walletTokensData],
    queryFn: () => getTokenBalances(walletTokensData as WalletTokensData),
    enabled: !!walletTokensData,
    retry: false,
<<<<<<< HEAD
    staleTime: 25000,
=======
    staleTime: 25000
>>>>>>> a2fdf8d (Disable wallets instead of hide them)
  });

  return {
    refreshBalances: refetch,
    balanceList: walletBalances,
    isLoadingBalance: isFetching,
    isLoadingTokenList: isFetchingWalletTokens,
  };
};
