import { useCallback, useState } from "react";
import { WalletState } from "@/utils/interfaces";
import { transferCosmos } from "@/utils/wallet/handlers/handleTransfer";
import { baseAmount } from "@xchainjs/xchain-util";
import { COSMOS_DECIMAL } from "@xchainjs/xchain-cosmos";

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

  return { transfer, error, loading };
}
