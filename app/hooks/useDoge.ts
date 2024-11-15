import { useMemo, useCallback, useState } from "react";
import { Client as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";
import { Network } from "@xchainjs/xchain-client";
import { baseAmount } from "@xchainjs/xchain-util";

interface UseDogeProps {
  wallet?: {
    address: string;
    provider: any;
  };
}

interface DogeMetadata {
  network: Network;
  explorerUrl: string;
  hash?: string;
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

  // Add liquidity to a pool
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
      if (!client || !wallet?.address) {
        throw new Error("Doge client or wallet not initialized");
      }

      setLoading(true);
      setError(null);

      try {
        // Convert amount to base amount (satoshis)
        const baseAmountValue = baseAmount(amount * 1e8);

        // Build unsigned transaction
        const feeRate = await client.getFeeRates();
        const unsignedTx = await client.prepareTx({
          sender: wallet.address,
          memo,
          amount: baseAmountValue,
          recipient: vault,
          feeRate: feeRate.average,
        });

        // Get unsigned raw transaction hex
        const unsignedRawTx = unsignedTx.rawUnsignedTx.toString();

        // Have wallet sign the raw transaction
        const signedRawTx = await wallet.provider.request({
          method: "signTransaction",
          params: [
            {
              network: "doge",
              rawTx: unsignedRawTx,
            },
          ],
        });

        console.log({ signedRawTx });
        // Broadcast signed transaction
        const txHash = await client.broadcastTx(signedRawTx);

        setMetadata((prev) => ({ ...prev, hash: txHash }));
        return txHash;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to add liquidity";
        setError(errMsg);
        throw new Error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [client, wallet],
  );

  // Remove liquidity from a pool
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
      if (!client || !wallet?.address) {
        throw new Error("Doge client or wallet not initialized");
      }

      setLoading(true);
      setError(null);

      try {
        // For withdrawal, we send a minimal amount of DOGE
        const baseAmountValue = baseAmount(10000); // Minimal dust amount

        // Build unsigned transaction
        const feeRates = await client.getFeeRates();
        const unsignedTx = await client.prepareTx({
          sender: wallet.address,
          memo,
          amount: baseAmountValue,
          recipient: vault,
          feeRate: feeRates.average,
        });

        // Get unsigned raw transaction hex
        const unsignedRawTx = unsignedTx.rawUnsignedTx.toString();
        // Have wallet sign the raw transaction
        const signedRawTx = await wallet.provider.request({
          method: "signTransaction",
          params: [
            {
              network: "doge",
              rawTx: unsignedRawTx,
            },
          ],
        });

        // Broadcast signed transaction
        console.log({ signedRawTx });
        const txHash = await client.broadcastTx(signedRawTx);

        setMetadata((prev) => ({ ...prev, hash: txHash }));
        return txHash;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to remove liquidity";
        setError(errMsg);
        throw new Error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [client, wallet],
  );

  return {
    loading,
    error,
    metadata,
    getBalance,
    addLiquidity,
    removeLiquidity,
  };
}
