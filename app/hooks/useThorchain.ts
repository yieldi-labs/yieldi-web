import { useMemo, useCallback, useState } from "react";
import {
  Client as ThorchainClient,
  defaultClientConfig,
} from "@xchainjs/xchain-thorchain";
import {
  assetToBase,
  assetAmount,
  Asset,
  AssetType,
} from "@xchainjs/xchain-util";
import { PoolDetail } from "@/midgard";
import { WalletState } from "@/utils/interfaces";

// Define RUNE asset
const AssetRUNE: Asset = {
  chain: "THOR",
  symbol: "RUNE",
  ticker: "RUNE",
  type: AssetType.NATIVE,
};

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
  const RUNE_DECIMALS = 8;
  const deposit = useCallback(
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
        const from = wallet.address;
        const finalAmount = assetToBase(assetAmount(amount, RUNE_DECIMALS));
        const depositParams = {
          asset: AssetRUNE,
          from,
          amount: {
            amount: finalAmount.amount().toNumber(),
            decimals: RUNE_DECIMALS,
          },
          memo,
        };

        return new Promise<string>((resolve, reject) => {
          wallet.provider.request(
            {
              method: "deposit",
              params: [depositParams],
            },
            (error: Error | null, result: TxResult | null) => {
              if (error) {
                setError(error.message);
                reject(error);
              } else {
                resolve(result?.hash || "");
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
    [wallet, getFees],
  );

  return {
    loading,
    error,
    getFees,
    deposit,
  };
}
