/// HOOK to handle Cosmos Chain Transactions using COSMJS

import { useCallback, useContext } from "react";
import { WalletState } from "@/utils/interfaces";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";

interface UseCosmosProps {
  wallet?: WalletState | null;
}

export function useCosmos({ wallet }: UseCosmosProps) {
  const chainId = "cosmoshub-4"; // TODO: Receive from chain info.
  const keplr = wallet?.provider;
  const rpcUrl = "https://cosmos-rpc.publicnode.com:443";

  const transfer = useCallback(
    async (to: string, amount: number, memo: string) => {
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
    },
    [keplr, chainId],
  );

  return { transfer };
}
