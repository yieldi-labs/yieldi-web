import { Asset, baseAmount, baseToAsset } from "@xchainjs/xchain-util";
import { WalletState } from "../../interfaces";
import { Client as BitcoinClient } from "@xchainjs/xchain-bitcoin";
import * as Bitcoin from "bitcoinjs-lib";
import { getLedgerClient, UTXOChain } from "../utxoClients/ledgerClients";
import { WalletKey } from "../constants";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";

interface TransactionParams {
  from: string;
  asset?: Asset;
  recipient: string;
  amount: {
    amount: number;
    decimals: number;
  };
  memo: string;
  feeRate?: number;
}

interface DepositParams {
  from: string;
  asset: Asset;
  amount: {
    amount: number;
    decimals: number;
  };
  memo: string;
}

export const transferUTXO = async (
  wallet: WalletState,
  transferParams: TransactionParams,
  clientBuilder?: BitcoinClient
): Promise<any> => {
  try {
    switch (wallet.walletId) {
      case WalletKey.VULTISIG:
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
      case WalletKey.CTRL:
        return wallet.provider.request({
          method: "transfer",
          params: [transferParams],
        });
      case WalletKey.PHANTOM:
        if (!clientBuilder) {
          throw Error("");
        }
        const { rawUnsignedTx, inputs } = await clientBuilder.prepareTx({
          sender: transferParams.from,
          amount: baseAmount(
            transferParams.amount.amount,
            transferParams.amount.decimals
          ),
          recipient: transferParams.recipient,
          feeRate: transferParams.feeRate as number,
          memo: transferParams.memo,
        });
        const fromHexString = (hexString: any) =>
          Uint8Array.from(
            hexString.match(/.{1,2}/g).map((byte: any) => parseInt(byte, 16))
          );
        const psbtUnsigned = Bitcoin.Psbt.fromBase64(rawUnsignedTx);
        const signedPSBTBytes: Uint8Array = await wallet.provider.signPSBT(
          fromHexString(psbtUnsigned.toHex()),
          {
            inputsToSign: [
              {
                address: transferParams.from,
                signingIndexes: inputs.map((input) => input.index),
              },
            ],
          }
        );

        const psbtSigned = Bitcoin.Psbt.fromBuffer(signedPSBTBytes);
        psbtSigned.finalizeAllInputs();

        const txHex = psbtSigned.extractTransaction().toHex();

        psbtSigned.extractTransaction().getId();

        const hash = await clientBuilder.broadcastTx(txHex);
        return hash;
      case WalletKey.OKX:
        const value = baseToAsset(
          baseAmount(
            transferParams.amount.amount,
            transferParams.amount.decimals
          )
        )
          .amount()
          .toString();
        const { txHash } = await wallet.provider.send({
          from: transferParams.from,
          to: transferParams.recipient,
          value: value,
          memo: transferParams.memo,
          memoPos: 0,
          satBytes: transferParams.feeRate,
        });
        return txHash;
      case WalletKey.LEDGER:
        const ledgerClient = getLedgerClient(
          wallet.chainType as UTXOChain,
          wallet.provider
        );
        const btcHash = await ledgerClient.transfer({
          amount: baseAmount(
            transferParams.amount.amount,
            transferParams.amount.decimals
          ),
          recipient: transferParams.recipient,
          memo: transferParams.memo,
          feeRate: transferParams.feeRate,
        });
        return btcHash;
      default:
        console.warn(`Unknown walletId UTXO transfer: ${wallet.walletId}`);
    }
  } catch (error) {
    console.error("Error transfer UTXO wallet:", error);
    throw error;
  }
};

export const depositThorchain = async (
  wallet: WalletState,
  transferParams: DepositParams
): Promise<any> => {
  switch (wallet.walletId) {
    case WalletKey.VULTISIG:
    case WalletKey.CTRL:
    case WalletKey.LEDGER:
      return wallet.provider.request({
        method: "deposit",
        params: [transferParams],
      });
    default:
      throw Error(`Deposit not implemented for ${wallet.walletId}`);
  }
};

export const transferCosmos = async (
  wallet: WalletState,
  transferParams: TransactionParams
): Promise<any> => {
  switch (wallet.walletId) {
    case WalletKey.CTRL:
    case WalletKey.OKX:
      const chainId = "cosmoshub-4";
      const rpcUrl = process.env.NEXT_PUBLIC_COSMOS_RPC_URL || "";
      await wallet.provider.enable(chainId);
      const offlineSigner = wallet.provider.getOfflineSigner(chainId);

      const gasPrice = GasPrice.fromString("0.025uatom");
      const cosmJS = await SigningStargateClient.connectWithSigner(
        rpcUrl,
        offlineSigner,
        {
          gasPrice,
        }
      );
      const coin = {
        denom: "uatom",
        amount: transferParams.amount.amount + "",
      };

      const result = await cosmJS.sendTokens(
        transferParams.from,
        transferParams.recipient,
        [coin],
        "auto",
        transferParams.memo,
      );
      return result.transactionHash;
    case WalletKey.VULTISIG:
      const txDetails = {
        from: transferParams.from,
        to: transferParams.recipient,
        value: transferParams.amount.amount,
        data: transferParams.memo,
      };
      return await wallet.provider.request({
        method: "send_transaction",
        params: [txDetails],
      });
    case WalletKey.LEDGER:
    default:
      throw Error(`Deposit not implemented for ${wallet.walletId}`);
  }
};
