import { Asset, baseAmount, baseToAsset } from "@xchainjs/xchain-util";
import { WalletState } from "../interfaces";
import { Client as BitcoinClient } from "@xchainjs/xchain-bitcoin";
import * as Bitcoin from 'bitcoinjs-lib'

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
  clientBuilder?: BitcoinClient
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
        if (!clientBuilder) {
          throw Error('')
        }
        const { rawUnsignedTx, inputs } = await clientBuilder.prepareTx({
          sender: transferParams.from,
          amount: baseAmount(transferParams.amount.amount, transferParams.amount.decimals),
          recipient: transferParams.recipient,
          feeRate: transferParams.feeRate,
          memo: transferParams.memo
        })
        const fromHexString = (hexString: any) =>
          Uint8Array.from(hexString.match(/.{1,2}/g).map((byte: any) => parseInt(byte, 16)));
        const psbtUnsigned = Bitcoin.Psbt.fromBase64(rawUnsignedTx)
        try {
          const signedPSBTBytes: Uint8Array = await wallet.provider.signPSBT(
            fromHexString(psbtUnsigned.toHex()),
            {
              inputsToSign: [{
                address: transferParams.from,
                signingIndexes: inputs.map(input => input.index),
              }]
            }
          );

          const psbtSigned = Bitcoin.Psbt.fromBuffer(signedPSBTBytes)
          psbtSigned.finalizeAllInputs()

          const txHex = psbtSigned.extractTransaction().toHex()

          psbtSigned.extractTransaction().getId()

          const hash = clientBuilder.broadcastTx(txHex)
          return hash
        } catch(e) {
          console.error('Error transfer UTXO using Phantom', e)
          throw Error('Error transfer UTXO using Phantom')
        }
      case "okx":
        const { txHash } = wallet.provider.send({ 
          from: transferParams.from, 
          to: transferParams.recipient, 
          value: baseToAsset(baseAmount(transferParams.amount.amount, transferParams.amount.decimals)).amount().toString(), 
          memo: transferParams.memo,
          satBytes: transferParams.feeRate
        })
        return txHash
      default:
        console.warn(`Unknown walletId UTXO transfer: ${wallet.walletId}`);
    }
  } catch (error) {
    console.error("Error transfer UTXO wallet:", error);
    return "";
  }
};
