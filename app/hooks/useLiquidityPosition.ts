import { useState, useCallback, useMemo } from "react";
import { useAppState } from "@/utils/context";
import { client, getMemberDetail, getPool } from "@/midgard";
import type { MemberPool, PoolDetail } from "@/midgard";
import { normalizeAddress, SupportedChain } from "@/app/utils";
import { Address, parseUnits } from "viem";
import { useContracts } from "./useContracts";
import { useUTXO } from "./useUTXO";
import {
  getInboundAddresses,
  validateInboundAddress,
  switchEvmChain,
  getSupportedChainByAssetChain,
  getMinAmountByChain,
  getLiquidityMemo,
  parseAssetString,
} from "@/utils/chain";

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

interface MidgardResponse<T> {
  data?: T;
  error?: string;
}

const affiliate = "yi";
const feeBps = 0;

export function useLiquidityPosition({
  pool: poolProp,
}: UseLiquidityPositionProps) {
  const { walletsState, getProviderTypeFromChain } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<MemberPool | null>(null);
  const [pool, setPool] = useState<PoolDetail>(poolProp);

  // Parse asset details
  const [assetChain, assetIdentifier] = useMemo(
    () => parseAssetString(pool.asset),
    [pool.asset]
  );

  const wallet = walletsState![getProviderTypeFromChain(assetChain)];
  // Determine if this is a UTXO chain and which one
  const utxoChain = useMemo(() => {
    const chain = assetChain.toLowerCase();
    if (chain === "btc") return "BTC";
    if (chain === "doge") return "DOGE";
    return null;
  }, [assetChain]);

  // Check if it's a native asset
  const isNativeAsset = useMemo(
    () => assetIdentifier.indexOf("-") === -1,
    [assetIdentifier]
  );

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

  // Initialize UTXO hooks if needed
  const {
    addLiquidity: addUTXOLiquidity,
    removeLiquidity: removeUTXOLiquidity,
  } = useUTXO({
    chain: utxoChain as "BTC" | "DOGE",
    wallet: utxoChain ? wallet : null,
  });

  // Initialize contract hooks for EVM chains
  const { approveSpending, getAllowance, depositWithExpiry, parseAmount } =
    useContracts({
      tokenAddress: !utxoChain
        ? (tokenAddress as Address | undefined)
        : undefined,
      provider: !utxoChain ? wallet?.provider : undefined,
    });

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
            path: { address },
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
          (p) => p.pool === asset
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
            : "Failed to fetch position details"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const addLiquidity = useCallback(
    async ({ asset, amount, address }: AddLiquidityParams) => {
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const inboundAddresses = await getInboundAddresses();
        const [assetChain] = parseAssetString(asset);
        const inbound = inboundAddresses?.find(
          (i) => i.chain === assetChain.toUpperCase()
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        validateInboundAddress(inbound);
        const memo = getLiquidityMemo("add", asset, affiliate, feeBps);

        // Handle UTXO chain transactions
        if (utxoChain) {
          return await addUTXOLiquidity({
            pool,
            vault: inbound.address,
            amount: amount,
            memo: memo,
          });
        }

        // Handle EVM chain transactions
        await switchEvmChain(wallet.provider, assetChain);

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
            expiry
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
            expiry
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
      utxoChain,
      addUTXOLiquidity,
    ]
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
        const [assetChain] = parseAssetString(asset);

        const supportedChain = getSupportedChainByAssetChain(assetChain);
        if (!supportedChain) {
          throw new Error(`Chain not supported: ${assetChain}`);
        }

        const inbound = inboundAddresses?.find(
          (i) => i.chain === assetChain.toUpperCase()
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        validateInboundAddress(inbound);

        const memo = getLiquidityMemo(
          "remove",
          asset,
          undefined,
          undefined,
          percentage,
          withdrawAsset
        );

        // Handle UTXO chain withdrawals
        if (utxoChain) {
          return await removeUTXOLiquidity({
            pool,
            vault: inbound.address,
            amount: getMinAmountByChain(supportedChain),
            memo: memo,
          });
        }

        // Handle EVM chain withdrawals
        await switchEvmChain(wallet.provider, assetChain);

        const routerAddress = inbound.router
          ? normalizeAddress(inbound.router)
          : undefined;
        if (!routerAddress) throw new Error("Router address not found");
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
          expiry
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
      utxoChain,
      removeUTXOLiquidity,
      pool.nativeDecimal,
    ]
  );

  return {
    loading,
    error,
    position,
    pool,
    getMemberDetails,
    addLiquidity,
    removeLiquidity,
  };
}
