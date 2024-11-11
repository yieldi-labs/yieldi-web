import { useState, useCallback } from "react";
import { useAppState } from "@/utils/context";
import { client, getMemberDetail, getPool } from "@/midgard";
import type { MemberPool, PoolDetail } from "@/midgard";
import { hex } from "@scure/base";
import { parseUnits, Address } from "viem";
import { useContracts } from "./useContracts";

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
  percentage: number; // 1-100
  address: string;
}

interface UseLiquidityPositionProps {
  pool: PoolDetail;
}

function normalizeAddress(address: string): `0x${string}` {
  const cleanAddr = address.toLowerCase().replace("0x", "");
  return `0x${cleanAddr}` as `0x${string}`;
}

export function useLiquidityPosition({
  pool: poolProp,
}: UseLiquidityPositionProps) {
  const { wallet } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<MemberPool | null>(null);
  const [pool, setPool] = useState<PoolDetail>(poolProp);

  // Initialize contract hooks
  const poolViemAddress = pool.asset.split(".")[1].split("-")[1];
  const tokenAddress = normalizeAddress(poolViemAddress);

  const { approveSpending, getAllowance, depositWithExpiry, parseAmount } =
    useContracts({
      tokenAddress,
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
        const [assetChain, assetAddress] = asset.split(".");
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

        const chainIdMap: Record<string, number> = {
          ethereum: 1,
          avalanche: 43114,
          bsc: 56,
        };

        // Switch chain if needed
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

        // For both native and token assets, use router's depositWithExpiry
        const routerAddress = normalizeAddress(inbound.router);
        const vaultAddress = normalizeAddress(inbound.address);
        const expiry = BigInt(Math.floor(Date.now() / 1000) + 300);

        // Check if the asset is a token or native
        const isToken =
          assetAddress && assetAddress !== assetChain.toUpperCase();
        let txHash;

        if (isToken) {
          // For tokens
          const parsedAmount = parseAmount(amount.toString());

          // Check current allowance
          const currentAllowance = await getAllowance(routerAddress);
          console.log("Current allowance:", currentAllowance.toString());
          console.log("Required amount:", parsedAmount.toString());

          // Only approve if current allowance is insufficient
          if (currentAllowance < parsedAmount) {
            console.log("Approving token spending...");
            await approveSpending(routerAddress, parsedAmount);
          } else {
            console.log("Sufficient allowance exists");
          }

          txHash = await depositWithExpiry(
            routerAddress, // The router contract address
            vaultAddress,
            tokenAddress, // The token address
            parsedAmount,
            memo,
            expiry,
          );
        } else {
          // For native assets
          const parsedAmount = parseUnits(amount.toString(), 18);
          const zeroAddress =
            "0x0000000000000000000000000000000000000000" as `0x${string}`;

          txHash = await depositWithExpiry(
            routerAddress, // The router contract address
            vaultAddress,
            zeroAddress, // Zero address for native assets
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
