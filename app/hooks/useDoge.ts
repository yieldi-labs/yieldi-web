import { useMemo, useCallback, useState } from "react";
import { Client as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";
import { Network } from "@xchainjs/xchain-client";
import { baseAmount } from "@xchainjs/xchain-util";
import { WalletState } from "./useWalletConnection";

interface UseDogeProps {
  wallet?: WalletState | null;
}

interface DogeMetadata {
  network: Network;
  explorerUrl: string;
  hash?: string;
}

interface TransferParams {
  recipient: string;
  amount: number;
  memo?: string;
}

export function useDoge({ wallet }: UseDogeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DogeMetadata>({
    network: Network.Mainnet,
    explorerUrl: "https://blockchair.com/dogecoin",
  });

  // Initialize Doge client with provider
  const client = useMemo(() => {
    if (!wallet?.provider) return null;

    try {
      return new DogeClient({
        ...defaultDogeParams,
        network: Network.Mainnet,
      });
    } catch (err) {
      console.error("Error initializing Doge client:", err);
      return null;
    }
  }, [wallet?.provider]);

  // Get balance of Doge address
  const getBalance = useCallback(
    async (address: string) => {
      if (!client) throw new Error("Doge client not initialized");

      try {
        const balance = await client.getBalance(address);
        return balance[0]; // Returns the DOGE balance
      } catch (err) {
        console.error("Error getting Doge balance:", err);
        throw err;
      }
    },
    [client],
  );

  // Transfer DOGE using XDEFI wallet
  const transfer = useCallback(
    async ({ recipient, amount, memo = "" }: TransferParams) => {
      if (!wallet?.provider || !wallet.address) {
        throw new Error("Wallet not initialized");
      }

      setLoading(true);
      setError(null);

      try {
        const transferParams = {
          asset: {
            chain: "DOGE",
            symbol: "DOGE",
            ticker: "DOGE",
          },
          from: wallet.address,
          recipient,
          amount: {
            amount: Math.floor(amount * 1e8), // Convert to smallest unit (satoshis)
            decimals: 8,
          },
          memo,
        };

        return new Promise((resolve, reject) => {
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
                console.log("Transfer result:", result);
                setMetadata((prev) => ({
                  ...prev,
                  hash: result.hash || result.txid,
                }));
                resolve(result);
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
    [wallet],
  );

  // Add liquidity to a pool using transfer
  const addLiquidity = useCallback(
    async ({
      vault,
      amount,
      memo,
    }: {
      vault: string;
      amount: number;
      memo: string;
    }) => {
      if (!wallet?.address) {
        throw new Error("Wallet not initialized");
      }

      try {
        const result = await transfer({
          recipient: vault,
          amount,
          memo,
        });

        return result.hash || result.txid;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to add liquidity";
        setError(errMsg);
        throw new Error(errMsg);
      }
    },
    [transfer, wallet],
  );

  // Remove liquidity from a pool using transfer
  const removeLiquidity = useCallback(
    async ({
      vault,
      amount,
      memo,
    }: {
      vault: string;
      amount: number;
      memo: string;
    }) => {
      if (!wallet?.address) {
        throw new Error("Wallet not initialized");
      }

      try {
        // For removal, we send a minimal amount of DOGE
        const result = await transfer({
          recipient: vault,
          amount,
          memo,
        });

        return result.hash || result.txid;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to remove liquidity";
        setError(errMsg);
        throw new Error(errMsg);
      }
    },
    [transfer, wallet],
  );

  return {
    loading,
    error,
    metadata,
    getBalance,
    transfer,
    addLiquidity,
    removeLiquidity,
  };
}
