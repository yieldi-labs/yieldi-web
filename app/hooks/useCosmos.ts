import { useCallback, useState } from "react";
import { WalletState } from "@/utils/interfaces";
import { transferCosmos } from "@/utils/wallet/handlers/handleTransfer";
import { Asset, baseAmount } from "@xchainjs/xchain-util";
import { COSMOS_DECIMAL } from "@xchainjs/xchain-cosmos";
import { PoolDetail } from "@/midgard";
import { inboundAddresses } from "@/thornode";

interface UseCosmosProps {
  wallet?: WalletState | null;
}

export function useCosmos({ wallet }: UseCosmosProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const transfer = useCallback(
    async (to: string, amount: number, memo: string) => {
      setError(null);
      setLoading(true);

      try {
        if (!wallet) {
          throw Error("No wallet initialized");
        }

        const transferParams = {
          from: wallet!.address,
          recipient: to,
          amount: baseAmount(amount, COSMOS_DECIMAL),
          memo: memo,
        };

        return await transferCosmos(wallet, transferParams);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to perform transfer";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [wallet],
  );

  const calculateFees = async (asset: Asset, amount: number, pool: PoolDetail) => {
    const inboundAddressesResponse = await inboundAddresses();
    const inbound = inboundAddressesResponse.data?.find(
      (i) => i.chain === asset.chain.toUpperCase(),
    );

    if (!inbound) {
      throw new Error(`No inbound address found for ${asset.chain}`);
    }

    if (!inbound.gas_rate) {
      throw new Error(`No gas rate found for ${asset.chain}`);
    }

    const gasRate = parseFloat(inbound.gas_rate);
    const txSize = 21000; // Assuming a standard tx size for Cosmos chains
    const OFM = 1.5; // Assuming a default Outbound Fee Multiplier

    const inboundFee = txSize * gasRate * 1e9; // Convert GWEI to WEI
    const outboundFee = txSize * gasRate * 1e9 * OFM; // Convert GWEI to WEI

    const liquidityFee = (amount / (amount + parseFloat(pool.assetDepth))) * amount;

    // Convert fees to USD
    const assetPriceUSD = parseFloat(pool.assetPriceUSD);
    const inboundFeeUSD = inboundFee * assetPriceUSD;
    const outboundFeeUSD = outboundFee * assetPriceUSD;
    const liquidityFeeUSD = liquidityFee * assetPriceUSD;

    return {
      inboundFee: inboundFeeUSD,
      outboundFee: outboundFeeUSD,
      liquidityFee: liquidityFeeUSD,
    };
  };

  return { transfer, error, loading, calculateFees };
}
