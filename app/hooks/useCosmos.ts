import { useCallback, useContext, useState } from "react";
import { WalletState } from "@/utils/interfaces";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";

interface UseCosmosProps {
  wallet?: WalletState | null;
}

export function useCosmos({ wallet }: UseCosmosProps) {
  const chainId = "cosmoshub-4"; // TODO: Receive from chain info.
  const keplr = wallet?.provider;
  const rpcUrl = process.env.NEXT_PUBLIC_COSMOS_RPC_URL || "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const transfer = useCallback(
    async (to: string, amount: number, memo: string) => {
      setError(null);
      setLoading(true);
      try {
        if (keplr.isVultisig) {
          const txDetails = {
            from: wallet!.address,
            to,
            amount: amount + "uatom",
            memo,
          };

          console.log("Vultisig-Cosmos transaction details:", txDetails);

          const result = await keplr.request({
            method: "send_transaction",
            params: [txDetails],
          });
          console.log("Vultisig-Cosmos transaction result:", result);
        } else {
          await keplr.enable(chainId);
          const offlineSigner = keplr.getOfflineSigner(chainId);

          const gasPrice = GasPrice.fromString("0.025uatom");
          const cosmJS = await SigningStargateClient.connectWithSigner(
            rpcUrl,
            offlineSigner,
            {
              gasPrice,
            },
          );
          const coin = {
            denom: "uatom",
            amount: amount + "",
          };

          const result = await cosmJS.sendTokens(
            wallet!.address,
            to,
            [coin],
            "auto",
            memo,
          );
          return result.transactionHash;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to perform transfer";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [keplr, chainId],
  );

  return { transfer, error, loading };
}
