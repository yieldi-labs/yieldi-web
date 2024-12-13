import { Asset } from "@xchainjs/xchain-util";
import { WalletState } from "../interfaces";

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
