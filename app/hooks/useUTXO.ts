import { useMemo, useCallback, useState } from "react";
import {
  Client as BitcoinClient,
  defaultBTCParams,
} from "@xchainjs/xchain-bitcoin";
import { Client as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";
import { Network } from "@xchainjs/xchain-client";
import {
  assetToBase,
  Asset,
  assetAmount,
  AssetType,
} from "@xchainjs/xchain-util";
import { WalletState } from "./useWalletConnection";
import { PoolDetail } from "@/midgard";

// Define BTC and DOGE assets
const AssetBTC: Asset = {
  chain: "BTC",
  symbol: "BTC",
  ticker: "BTC",
  type: AssetType.NATIVE,
};

const AssetDOGE: Asset = {
  chain: "DOGE",
  symbol: "DOGE",
  ticker: "DOGE",
  type: AssetType.NATIVE,
};

type UTXOChain = "BTC" | "DOGE";

interface UseUTXOProps {
  chain: UTXOChain;
  wallet?: WalletState | null;
}

interface UTXOMetadata {
  network: Network;
  explorerUrl: string;
  hash?: string;
}

interface TransferParams {
  pool: PoolDetail;
  recipient: string;
  amount: number;
  memo?: string;
  feeRate?: number;
}

export interface TxResult {
  hash: string;
  txid: string;
}

export function useUTXO({ chain, wallet }: UseUTXOProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<UTXOMetadata>({
    network: Network.Mainnet,
    explorerUrl:
      chain === "BTC"
        ? defaultBTCParams.explorerProviders[Network.Mainnet].getExplorerUrl()
        : defaultDogeParams.explorerProviders[Network.Mainnet].getExplorerUrl(),
  });

  // Initialize UTXO client with proper configuration
  const client = useMemo(() => {
    if (!wallet?.provider) return null;

    try {
      const commonConfig = {
        network: Network.Mainnet,
        phrase: "", // We don't need phrase since we're using wallet provider
      };

      switch (chain) {
        case "BTC":
          return new BitcoinClient({
            ...defaultBTCParams,
            ...commonConfig,
          });
        case "DOGE":
          return new DogeClient({
            ...defaultDogeParams,
            ...commonConfig,
          });
        default:
          throw new Error(`Unsupported UTXO chain: ${chain}`);
      }
    } catch (err) {
      console.error(`Error initializing ${chain} client:`, err);
      return null;
    }
  }, [wallet?.provider, chain]);

  // Get balance
  const getBalance = useCallback(
    async (address: string) => {
      if (!client) throw new Error(`${chain} client not initialized`);

      try {
        const balance = await client.getBalance(address);
        return balance[0];
      } catch (err) {
        console.error(`Error getting ${chain} balance:`, err);
        throw err;
      }
    },
    [client, chain],
  );

  // Get network fees
  const getFees = useCallback(async () => {
    if (!client) throw new Error(`${chain} client not initialized`);

    try {
      return await client.getFeeRates();
    } catch (err) {
      console.error(`Error getting ${chain} fees:`, err);
      throw err;
    }
  }, [client, chain]);

  // Transfer using wallet provider
  const transfer = useCallback(
    async ({
      pool,
      recipient,
      amount,
      memo = "",
      feeRate,
    }: TransferParams): Promise<string> => {
      if (!wallet?.provider || !wallet.address) {
        throw new Error("Wallet not initialized");
      }

      setLoading(true);
      setError(null);

      try {
        const fees = feeRate || (await getFees()).fast;
        const asset = chain === "BTC" ? AssetBTC : AssetDOGE;
        const from = wallet.address;
        const nativeDecimal = parseInt(pool.nativeDecimal);
        const finalAmount = assetToBase(assetAmount(amount, nativeDecimal));
        const transferParams = {
          from,
          asset,
          recipient,
          amount: {
            amount: finalAmount.amount().toNumber(),
            decimals: nativeDecimal,
          },
          memo,
          feeRate: fees,
        };
        console.log("Transfer params:", transferParams);

        return new Promise<string>((resolve, reject) => {
          wallet.provider.request(
            {
              method: "transfer",
              params: [transferParams],
            },
            (error: any, result: any) => {
              if (error) {
                console.error("Transfer error:", error);
                setError(error.message || "Transfer failed");
                reject(error);
              } else {
                // Just return the txid/hash directly
                setMetadata((prev) => ({
                  ...prev,
                  hash: result,
                }));
                resolve(result);
                console.log("Transfer result:", result);
              }
            },
          );
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Transfer failed";
        setError(errMsg);
        throw new Error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [wallet, getFees, chain],
  );

  // Add liquidity to a pool using transfer
  // Add liquidity to a pool using transfer
  const addLiquidity = useCallback(
    async ({
      pool,
      vault,
      amount,
      memo,
    }: {
      pool: PoolDetail;
      vault: string;
      amount: number;
      memo: string;
    }): Promise<string> => {
      if (!wallet?.address) {
        throw new Error("Wallet not initialized");
      }

      try {
        const fees = await getFees();
        return new Promise<string>(async (resolve) => {
          const txHash = await transfer({
            pool,
            recipient: vault,
            amount,
            memo,
            feeRate: fees.fast,
          });
          console.log("Add liquidity tx hash:", txHash);
          resolve(txHash);
        });
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to add liquidity";
        setError(errMsg);
        throw new Error(errMsg);
      }
    },
    [wallet],
  );

  // Remove liquidity from a pool using transfer
  const removeLiquidity = useCallback(
    async ({
      pool,
      vault,
      amount,
      memo,
    }: {
      pool: PoolDetail;
      vault: string;
      amount: number;
      memo: string;
    }) => {
      if (!wallet?.address) {
        throw new Error("Wallet not initialized");
      }

      try {
        const fees = await getFees();
        const result = await transfer({
          pool,
          recipient: vault,
          amount,
          memo,
          feeRate: fees.fast,
        });

        return result;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to remove liquidity";
        setError(errMsg);
        throw new Error(errMsg);
      }
    },
    [transfer, wallet, getFees],
  );

  return {
    loading,
    error,
    metadata,
    getBalance,
    getFees,
    transfer,
    addLiquidity,
    removeLiquidity,
  };
}
