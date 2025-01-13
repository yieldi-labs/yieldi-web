import { useMemo, useCallback, useState } from "react";
import { defaultBTCParams } from "@xchainjs/xchain-bitcoin";
import { defaultDogeParams } from "@xchainjs/xchain-doge";
import { defaultLtcParams } from "@xchainjs/xchain-litecoin";
import { Network } from "@xchainjs/xchain-client";
import {
  assetToBase,
  assetAmount,
  assetFromString,
  Asset,
} from "@xchainjs/xchain-util";
import { PoolDetail } from "@/midgard";
import { WalletState } from "@/utils/interfaces";
import { transferUTXO } from "@/utils/wallet/handlers/handleTransfer";
import { defaultBchParams } from "@xchainjs/xchain-bitcoincash";
import { getClient } from "@/utils/wallet/utxoClients/clients";
type UTXOChain = "BTC" | "DOGE" | "LTC" | "BCH";

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
    explorerUrl: (() => {
      switch (chain) {
        case "BTC":
          return defaultBTCParams.explorerProviders[
            Network.Mainnet
          ].getExplorerUrl();
        case "DOGE":
          return defaultDogeParams.explorerProviders[
            Network.Mainnet
          ].getExplorerUrl();
        case "LTC":
          return defaultLtcParams.explorerProviders[
            Network.Mainnet
          ].getExplorerUrl();
        case "BCH":
          return defaultBchParams.explorerProviders[
            Network.Mainnet
          ].getExplorerUrl();
        default:
          return "";
      }
    })(),
  });

  const client = useMemo(() => {
    if (chain) {
      return getClient(chain);
    }
    return null;
  }, [chain]);

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
        const fees = feeRate || (await getFees()).fastest;
        const from = wallet.address;
        const nativeDecimal = parseInt(pool.nativeDecimal);
        const finalAmount = assetToBase(assetAmount(amount, nativeDecimal));
        const asset = assetFromString(pool.asset);
        if (!asset) {
          throw Error("Invalid asset");
        }
        const transferParams = {
          from,
          asset: asset as Asset,
          recipient,
          amount: finalAmount,
          memo,
          feeRate: fees,
        };

        const result = await transferUTXO(
          wallet,
          transferParams,
          client as any,
        );
        setMetadata((prev) => ({
          ...prev,
          hash: result,
        }));
        return result;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Transfer failed";
        setError(errMsg);
        throw new Error(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [wallet, getFees, client],
  );

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
        const txHash = await transfer({
          pool,
          recipient: vault,
          amount,
          memo,
          feeRate: fees.fast,
        });
        return txHash;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Failed to add liquidity";
        setError(errMsg);
        throw new Error(errMsg);
      }
    },
    [getFees, transfer, wallet?.address],
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
    [getFees],
  );

  return {
    loading,
    error,
    metadata,
    getFees,
    transfer,
    addLiquidity,
    removeLiquidity,
  };
}
