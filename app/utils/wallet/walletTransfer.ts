import { Asset } from "@xchainjs/xchain-util";
import { WalletState } from "../interfaces";
import { ProviderKey } from "./constants";

interface TransactionParams {
  from: string;
  asset: Asset;
  recipient: string;
  amount: {
    amount: number;
    decimals: number;
  };
  memo: string;
  feeRate: number;
}

export const transferCosmos = async (
  wallet: WalletState,
  transferParams: TransactionParams,
): Promise<any> => {
  try {
    if (wallet.providerType !== ProviderKey.COSMOS) {
      throw new Error("Not a Cosmos chain");
    }

    const msg = {
      type: "cosmos-sdk/MsgSend",
      value: {
        from_address: transferParams.from,
        to_address: transferParams.recipient,
        amount: [
          {
            denom: "uatom",
            amount: String(transferParams.amount.amount),
          },
        ],
        memo: transferParams.memo,
      },
    };

    return wallet.provider.request({
      method: "cosmos_sendTransaction",
      params: [msg],
    });
  } catch (error) {
    console.error("Error transfer Cosmos wallet:", error);
    return "";
  }
};

export const transferUTXO = async (
  wallet: WalletState,
  transferParams: TransactionParams,
): Promise<any> => {
  try {
    switch (wallet.walletId) {
      case "vultisig":
        return wallet.provider.request({
          method: "send_transaction",
          params: [
            {
              from: transferParams.from,
              to: transferParams.recipient,
              data: transferParams.memo,
              value: String(transferParams.amount.amount),
              // TODO: Fee estimations
            },
          ],
        });
      case "xdefi":
        return wallet.provider.request({
          method: "transfer",
          params: [transferParams],
        });
      case "phantom":
        throw Error("Pending to implement");
      case "okx":
        throw Error("Pending to implement");
      default:
        console.warn(`Unknown walletId UTXO transfer: ${wallet.walletId}`);
    }
  } catch (error) {
    console.error("Error transfer UTXO wallet:", error);
    return "";
  }
};
