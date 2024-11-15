import { useState, useCallback, useMemo } from "react";
import { useAppState } from "@/utils/context";
import { client, getMemberDetail, getPool } from "@/midgard";
import type { MemberPool, PoolDetail } from "@/midgard";
import { hex } from "@scure/base";
import { parseUnits, Address } from "viem";
import { useContracts } from "./useContracts";
import { useDoge } from "./useDoge";
import { normalizeAddress, SupportedChain } from "@/app/utils";

const affiliate = "yi";
const feeBps = 0;

interface InboundAddress {
  chain: string;
  pub_key: string;
  address: string;
  router?: string;
  halted: boolean;
  global_trading_paused: boolean;
  chain_trading_paused: boolean;
  chain_lp_actions_paused: boolean;
  gas_rate: string;
  gas_rate_units: string;
  outbound_tx_size: string;
  outbound_fee: string;
  dust_threshold: string;
}

interface MidgardResponse<T> {
  data?: T;
  error?: string;
}

interface AddLiquidityParams {
  asset: string;
  amount: number;
  runeAmount?: number;
  address: string;
}

interface RemoveLiquidityParams {
  asset: string;
  percentage: number;
  address: string;
  withdrawAsset?: string;
}

interface UseLiquidityPositionProps {
  pool: PoolDetail;
}

export function useLiquidityPosition({
  pool: poolProp,
}: UseLiquidityPositionProps) {
  const { wallet } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<MemberPool | null>(null);
  const [pool, setPool] = useState<PoolDetail>(poolProp);

  // Parse asset details
  const [assetChain = "", assetIdentifier = ""] = pool.asset.split(".");

  // Determine if this is a DOGE pool
  const isDogePool = useMemo(() => {
    return assetChain.toLowerCase() === "doge";
  }, [assetChain]);

  // Check if it's a native asset (e.g., ETH.ETH, AVAX.AVAX, DOGE.DOGE)
  const isNativeAsset = useMemo(() => {
    return assetIdentifier.indexOf("-") === -1;
  }, [assetIdentifier]);

  // Get token address for non-native assets
  const tokenAddress = useMemo(() => {
    if (isNativeAsset) return undefined;

    try {
      const [_, addressPart] = assetIdentifier.split("-");
      return addressPart
        ? (normalizeAddress(addressPart) as Address)
        : undefined;
    } catch (err) {
      console.warn("Failed to parse token address:", err);
      return undefined;
    }
  }, [assetIdentifier, isNativeAsset]);

  // Initialize EVM contract hooks (only if not DOGE)
  const { approveSpending, getAllowance, depositWithExpiry, parseAmount } =
    useContracts({
      tokenAddress: !isDogePool
        ? (tokenAddress as Address | undefined)
        : undefined,
      provider: !isDogePool ? wallet?.provider : undefined,
    });

  // Initialize DOGE hooks (only if DOGE pool)
  const {
    addLiquidity: addDogeLiquidity,
    removeLiquidity: removeDogeLiquidity,
  } = useDoge({ wallet });

  const getInboundAddresses = async (): Promise<InboundAddress[]> => {
    const response = await fetch(
      "https://thornode.ninerealms.com/thorchain/inbound_addresses",
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const getMemberDetails = useCallback(
    async (address: string, asset: string) => {
      if (!address || !asset) {
        setError("Address and asset are required");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const [memberResponse, poolResponse] = await Promise.all([
          getMemberDetail({
            client: client,
            path: {
              address: address,
            },
          }) as Promise<MidgardResponse<{ pools: MemberPool[] }>>,
          getPool({
            client: client,
            path: { asset },
          }) as Promise<MidgardResponse<PoolDetail>>,
        ]);

        if (!memberResponse.data) {
          throw new Error("No member data returned from Midgard");
        }

        const poolPosition = memberResponse.data.pools.find(
          (p) => p.pool === asset,
        );

        if (poolPosition) {
          setPosition(poolPosition);
        }

        if (poolResponse.data) {
          setPool(poolResponse.data);
        }

        return {
          position: poolPosition,
          pool: poolResponse.data,
        };
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch position details",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const addLiquidity = useCallback(
    async ({ asset, amount, runeAmount, address }: AddLiquidityParams) => {
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const inboundAddresses = await getInboundAddresses();
        const [assetChain, assetIdentifier] = asset.split(".");
        const inbound = inboundAddresses?.find(
          (i) => i.chain === assetChain.toUpperCase(),
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        if (!inbound.router && !inbound.address) {
          throw new Error("Inbound address not found");
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        if (inbound.chain_lp_actions_paused) {
          throw new Error("LP actions are paused for this chain");
        }

        const memo = `+:${asset}::${affiliate}:${feeBps}`;

        // Handle DOGE transactions
        if (isDogePool) {
          return await addDogeLiquidity({
            vault: inbound.address,
            amount: amount,
            memo: memo,
          });
        }

        // Handle EVM chain transactions
        const chainLower = assetChain.toLowerCase();

        // Chain ID mapping
        const chainIdMap: Record<string, number> = {
          ethereum: 1,
          avalanche: 43114,
          bsc: 56,
        };

        // Handle chain switching
        const currentChainId = await wallet.provider.request({
          method: "eth_chainId",
        });
        const targetChainId = chainIdMap[chainLower];

        if (parseInt(currentChainId, 16) !== targetChainId) {
          await wallet.provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        }

        const routerAddress = inbound.router
          ? normalizeAddress(inbound.router)
          : undefined;
        if (!routerAddress) throw new Error("Router address not found");
        const vaultAddress = normalizeAddress(inbound.address);
        const expiry = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 minutes

        // Handle token or native asset deposit
        let txHash;
        if (!isNativeAsset && tokenAddress) {
          // Handle ERC20 token deposit
          const parsedAmount = parseAmount(amount.toString());

          // Check and handle allowance
          const currentAllowance = await getAllowance(routerAddress);
          if (currentAllowance < parsedAmount) {
            await approveSpending(routerAddress, parsedAmount);
          }

          txHash = await depositWithExpiry(
            routerAddress,
            vaultAddress,
            tokenAddress,
            parsedAmount,
            memo,
            expiry,
          );
        } else {
          // Handle native asset deposit
          const parsedAmount = parseUnits(amount.toString(), 18);
          txHash = await depositWithExpiry(
            routerAddress,
            vaultAddress,
            "0x0000000000000000000000000000000000000000",
            parsedAmount,
            memo,
            expiry,
          );
        }

        await getMemberDetails(address, asset);
        return txHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add liquidity";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      wallet,
      getMemberDetails,
      approveSpending,
      depositWithExpiry,
      parseAmount,
      tokenAddress,
      getAllowance,
      isNativeAsset,
      isDogePool,
      addDogeLiquidity,
    ],
  );

  const removeLiquidity = useCallback(
    async ({
      asset,
      percentage,
      address,
      withdrawAsset,
    }: RemoveLiquidityParams) => {
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const inboundAddresses = await getInboundAddresses();
        const [assetChain, assetIdentifier] = asset.split(".");

        const supportedChain = getSupportedChainByAssetChain(assetChain);
        if (!supportedChain) {
          throw new Error(`Chain not supported: ${assetChain}`);
        }

        const inbound = inboundAddresses?.find(
          (i) => i.chain === assetChain.toUpperCase(),
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        if (!inbound.router && !inbound.address) {
          throw new Error("Router address not found");
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        if (inbound.chain_lp_actions_paused) {
          throw new Error("LP actions are paused for this chain");
        }

        const basisPoints = Math.round(percentage * 100);
        if (basisPoints < 0 || basisPoints > 10000) {
          throw new Error("Percentage must be between 0 and 100");
        }

        // Construct memo based on withdrawal type
        const memo = withdrawAsset
          ? `-:${asset}:${basisPoints}:${withdrawAsset}` // Single-sided
          : `-:${asset}:${basisPoints}`; // Dual-sided

        // Handle DOGE withdrawals
        if (isDogePool) {
          return await removeDogeLiquidity({
            vault: inbound.address,
            amount: getMinAmountByChain(SupportedChain.Dogecoin),
            memo: memo,
          });
        }

        // Handle EVM chain withdrawals
        const chainLower = assetChain.toLowerCase();

        // Handle chain switching
        const chainIdMap: Record<string, number> = {
          ethereum: 1,
          avalanche: 43114,
          bsc: 56,
        };

        const currentChainId = await wallet.provider.request({
          method: "eth_chainId",
        });
        const targetChainId = chainIdMap[chainLower];

        if (parseInt(currentChainId, 16) !== targetChainId) {
          await wallet.provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${targetChainId.toString(16)}` }],
          });
        }

        const routerAddress = normalizeAddress(inbound.router);
        const vaultAddress = normalizeAddress(inbound.address);
        const expiry = BigInt(Math.floor(Date.now() / 1000) + 300);

        // Use base unit amount for withdrawal transaction
        const decimals = parseInt(pool.nativeDecimal);
        const minAmountByChain =
          getMinAmountByChain(supportedChain) * 10 ** decimals;
        const txHash = await depositWithExpiry(
          routerAddress,
          vaultAddress,
          "0x0000000000000000000000000000000000000000",
          BigInt(minAmountByChain),
          memo,
          expiry,
        );

        await getMemberDetails(address, asset);
        return txHash;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove liquidity";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      wallet,
      getMemberDetails,
      depositWithExpiry,
      isDogePool,
      removeDogeLiquidity,
      pool.nativeDecimal,
    ],
  );

  const getSupportedChainByAssetChain = (
    assetChain: string,
  ): SupportedChain | undefined => {
    return Object.values(SupportedChain).find(
      (chainValue) => chainValue.toLowerCase() === assetChain.toLowerCase(),
    ) as SupportedChain | undefined;
  };

  const getMinAmountByChain = (chain: SupportedChain): number => {
    switch (chain) {
      case SupportedChain.Bitcoin:
      case SupportedChain.Litecoin:
      case SupportedChain.BitcoinCash:
      case SupportedChain.Dash:
        return 0.00010001;
      case SupportedChain.Dogecoin:
        return 1.00000001;
      case SupportedChain.Avalanche:
      case SupportedChain.Ethereum:
      case SupportedChain.Arbitrum:
      case SupportedChain.BinanceSmartChain:
        return 0.00000001;
      case SupportedChain.THORChain:
      case SupportedChain.Maya:
        return 0;
      case SupportedChain.Cosmos:
      case SupportedChain.Kujira:
        return 0.000001;
      default:
        return 0.00000001;
    }
  };

  return {
    loading,
    error,
    position,
    pool,
    getMemberDetails,
    addLiquidity,
    removeLiquidity,
    getMinAmountByChain,
  };
}
