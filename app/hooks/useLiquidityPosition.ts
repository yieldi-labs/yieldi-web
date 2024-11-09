import { useState, useCallback } from "react";
import { useAppState } from "@/utils/context";
import { client, getMemberDetail, getPool } from "@/midgard";
import type { MemberPool, PoolDetail } from "@/midgard";
import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";
import { parseUnits, formatUnits } from "viem";

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

const BITCOIN_NETWORK = {
  bech32: "bc",
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

export function useLiquidityPosition() {
  const { wallet } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<MemberPool | null>(null);
  const [pool, setPool] = useState<PoolDetail | null>(null);

  const getInboundAddresses = async (): Promise<InboundAddress[]> => {
    const response = await fetch('https://thornode.ninerealms.com/thorchain/inbound_addresses');
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

  const sendUTXOTransaction = async (
    inbound: InboundAddress,
    memo: string,
    amount: number,
    chain: string,
  ) => {
    if (!wallet) throw new Error("Wallet not connected");
    if (!wallet.provider) throw new Error("Wallet provider not found");

    const isXDEFI = wallet.id?.includes("xdefi");
    const isPhantom = wallet.id?.includes("phantom");
    const isOKX = wallet.id?.includes("okx");

    // Handle different UTXO wallet providers
    if (isXDEFI && window.xfi?.[chain]) {
      const provider = window.xfi[chain];
      return await provider.request({
        method: "request_accounts",
        params: [
          {
            memo,
            recipient: inbound.address,
            amount: String(amount),
          },
        ],
      });
    } else if (isPhantom && window.phantom?.[chain]) {
      const provider = window.phantom[chain];
      return await provider.request({
        method: "request_accounts",
        params: [
          {
            memo,
            recipient: inbound.address,
            amount: String(amount),
          },
        ],
      });
    } else if (isOKX && window.okxwallet?.[chain]) {
      const provider = window.okxwallet[chain];
      return await provider.request({
        method: "request_accounts",
        params: [
          {
            memo,
            recipient: inbound.address,
            amount: String(amount),
          },
        ],
      });
    }

    throw new Error("Unsupported wallet for UTXO chain");
  };

  const sendEVMTransaction = async (
    inbound: InboundAddress,
    memo: string,
    amount: bigint,
    chainId?: number,
  ) => {
    if (!wallet?.provider) throw new Error("Wallet provider not found");

    const provider = wallet.provider;

    if (chainId) {
      const currentChainId = await provider.request({ method: "eth_chainId" });
      if (currentChainId !== chainId) {
        if (wallet.id === "xdefi") {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          });
        }
      }
    }

    // Call contract for deposit
    const memoBytes = Buffer.from(memo, "utf-8");
    const encodedMemo = hex.encode(memoBytes);
    const tx = {
      to: inbound.router,
      value: Number(amount),
      data: `0x${encodedMemo}`, // Encode memo as hex
    };
    console.log("Sending transaction", tx);

    const result = await provider.request({
      method: "eth_sendTransaction",
      params: [tx],
    });
    console.log({ result });
    return result;
  };

  const addLiquidity = useCallback(
    async ({ asset, amount, runeAmount, address }: AddLiquidityParams) => {
      if (!wallet?.address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const inboundAddresses = await getInboundAddresses();

        const assetChain = asset.split(".")[0].toLowerCase();
        const inbound = inboundAddresses?.find(
          (i) => i.chain === assetChain.toUpperCase(),
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        // Construct memo for single or symmetric add
        const memo = runeAmount
          ? `+:${asset}:${address}` // Symmetric add
          : `+:${asset}:${address}`; // Single-sided add

        let txHash;

        // Handle transaction based on chain type
        switch (assetChain) {
          // UTXO chains
          case "bitcoin":
          case "litecoin":
          case "bitcoincash":
          case "dogecoin":
            txHash = await sendUTXOTransaction(
              inbound,
              memo,
              amount,
              assetChain,
            );
            break;

          // EVM chains
          case "ethereum":
          case "avalanche":
          case "bsc": {
            const parsedAmount = parseUnits(amount.toString(), 18);
            txHash = await sendEVMTransaction(
              inbound,
              memo,
              parsedAmount,
            );
            break;
          }

          default:
            throw new Error(`Unsupported chain: ${assetChain}`);
        }

        await getMemberDetails(address, asset);
        return txHash;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add liquidity",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [wallet, pool, getMemberDetails],
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

        const assetChain = asset.split(".")[0].toLowerCase();
        const inbound = inboundAddresses.find(
          (i) => i.chain === assetChain.toUpperCase(),
        );

        if (!inbound) {
          throw new Error(`No inbound address found for ${assetChain}`);
        }

        if (inbound.halted) {
          throw new Error("Network is halted");
        }

        const basisPoints = percentage * 100;
        const memo = `-:${asset}:${basisPoints}`;

        let txHash;

        switch (assetChain) {
          case "bitcoin":
          case "litecoin":
          case "bitcoincash":
          case "dogecoin":
            txHash = await sendUTXOTransaction(inbound, memo, 0, assetChain); // Amount 0 for withdrawal
            break;

          case "ethereum":
          case "avalanche":
          case "binance-smart-chain":
            txHash = await sendEVMTransaction(
              inbound,
              memo,
              BigInt(0),
            ); // Amount 0 for withdrawal
            break;

          default:
            throw new Error(`Unsupported chain: ${assetChain}`);
        }

        await getMemberDetails(address, asset);
        return txHash;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to remove liquidity",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [wallet, pool, getMemberDetails],
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