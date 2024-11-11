import { useState, useCallback, useMemo } from "react";
import { useAppState } from "@/utils/context";
import { client, getMemberDetail, getPool } from "@/midgard";
import type { MemberPool, PoolDetail } from "@/midgard";
import { hex } from "@scure/base";
import { parseUnits, Address } from "viem";
import { useContracts } from "./useContracts";
import { normalizeAddress } from "@/app/utils";

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

  // More robust asset parsing
  const [assetChain = "", assetIdentifier = ""] = pool.asset.split(".");

  // Check if it's a native asset (e.g., ETH.ETH, AVAX.AVAX)
  const isNativeAsset = useMemo(() => {
    return (
      !assetIdentifier ||
      assetIdentifier === assetChain ||
      assetIdentifier.toUpperCase() === assetChain.toUpperCase()
    );
  }, [assetChain, assetIdentifier]);

  // Only attempt to get token address for non-native assets
  const tokenAddress = useMemo(() => {
    if (isNativeAsset) return undefined;

    try {
      // For tokens like ETH.USDT-0x... format
      const [_, addressPart] = assetIdentifier.split("-");
      return addressPart
        ? (normalizeAddress(addressPart) as Address)
        : undefined;
    } catch (err) {
      console.warn("Failed to parse token address:", err);
      return undefined;
    }
  }, [assetIdentifier, isNativeAsset]);

  // Initialize contract hooks with proper type checking
  const { approveSpending, getAllowance, depositWithExpiry, parseAmount } =
    useContracts({
      tokenAddress: tokenAddress as Address | undefined,
      provider: wallet?.provider,
    });

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

        if (!inbound.router) {
          throw new Error("Router address not found");
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        const memo = `+:${asset}`;
        const supportedChains = ["ethereum", "avalanche", "bsc"];
        const chainLower = assetChain.toLowerCase();

        if (!supportedChains.includes(chainLower)) {
          throw new Error(
            `Unsupported chain: ${assetChain}. Only EVM chains are supported.`,
          );
        }

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

        // Check if the asset is a token or native
        const isNativeAsset =
          !assetIdentifier ||
          assetIdentifier === assetChain ||
          assetIdentifier.toUpperCase() === assetChain.toUpperCase();

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

          // For native assets, use a direct transaction
          txHash = await wallet.provider.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: wallet.address,
                to: routerAddress,
                value: `0x${parsedAmount.toString(16)}`,
                data: "0x",
              },
            ],
          });
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
    ],
  );

  const removeLiquidity = useCallback(
    async ({ asset, percentage, address }: RemoveLiquidityParams) => {
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const inboundAddresses = await getInboundAddresses();
        const [assetChain] = asset.split(".");
        const inbound = inboundAddresses.find(
          (i) => i.chain === assetChain.toUpperCase(),
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        if (!inbound.router) {
          throw new Error("Router address not found");
        }

        const basisPoints = percentage * 100;
        const memo = `-:${asset}:${basisPoints}`;
        const memoBytes = Buffer.from(memo, "utf-8");
        const encodedMemo = hex.encode(memoBytes);

        const routerAddress = normalizeAddress(inbound.router);

        const tx = {
          from: wallet.address,
          to: routerAddress,
          value: "0x0",
          data: `0x${encodedMemo}`,
        };

        const txHash = await wallet.provider.request({
          method: "eth_sendTransaction",
          params: [tx],
        });

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
    [wallet, getMemberDetails],
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
