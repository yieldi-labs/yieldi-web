import { useMemo, useCallback, useState } from "react";
import {
  Client as ThorchainClient,
  defaultClientConfig,
  RUNE_DECIMAL,
} from "@xchainjs/xchain-thorchain";
import { assetToBase, assetAmount } from "@xchainjs/xchain-util";
import { PoolDetail } from "@/midgard";
import { WalletState } from "@/utils/interfaces";
import { depositThorchain } from "@/utils/wallet/handlers/handleTransfer";

interface UseThorchainProps {
  wallet?: WalletState | null;
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

export function useThorchain({ wallet }: UseThorchainProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize Thorchain client with proper configuration
  const client = useMemo(() => {
    if (!wallet?.provider) return null;

    try {
      return new ThorchainClient(defaultClientConfig);
    } catch (err) {
      console.error(`Error initializing Thorchain client:`, err);
      return null;
    }
  }, [wallet?.provider]);

  // Get network fees
  const getFees = useCallback(async () => {
    if (!client) throw new Error(`Thorchain client not initialized`);

    try {
      return await client.getFees();
    } catch (err) {
      console.error(`Error getting Thorchain fees:`, err);
      throw err;
    }
  }, [client]);

  // Transfer using wallet provider
  const deposit = useCallback(
    async ({ amount, memo = "" }: TransferParams): Promise<string> => {
      if (!wallet?.provider || !wallet.address) {
        throw new Error("Wallet not initialized");
      }

      setLoading(true);
      setError(null);

      try {
        const from = wallet.address;
        const finalAmount = assetToBase(assetAmount(amount, RUNE_DECIMAL));
        console.log("finalAmount", finalAmount);
        return depositThorchain(wallet, {
          from: from,
          amount: finalAmount,
          memo,
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

  return {
    loading,
    error,
    getFees,
    deposit,
  };
}
