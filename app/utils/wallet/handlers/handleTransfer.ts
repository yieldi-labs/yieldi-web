import { BaseAmount, baseToAsset } from "@xchainjs/xchain-util";
import { WalletState } from "../../interfaces";
import { Client as BitcoinClient } from "@xchainjs/xchain-bitcoin";
import * as Bitcoin from "bitcoinjs-lib";
import { getLedgerClient, UTXOChain } from "../utxoClients/ledgerClients";
import { ChainKey, WalletKey } from "../constants";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { getBftLedgerClient } from "../bftClients/ledgerClients";
import { getEvmLedgerClient } from "../evmClients/ledgerClients";
import { AssetRuneNative, RUNE_DECIMAL } from "@xchainjs/xchain-thorchain";
import { switchEvmChain } from "@/utils/chain";

export interface TransactionEvmParams extends TransactionParams {
  data: `0x${string}`;
  assetAddress: `0x${string}`;
  chainId: string;
}

interface TransactionParams extends DepositParams {
  recipient: string;
  feeRate?: number;
}

interface DepositParams {
  from: string;
  amount: BaseAmount;
  memo?: string;
}

export const transferUTXO = async (
  wallet: WalletState,
  transferParams: TransactionParams,
  clientBuilder?: BitcoinClient,
): Promise<string> => {
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
              value: transferParams.amount.amount().toString(),
              // TODO: Fee estimations
            },
          ],
        });
      case WalletKey.CTRL:
        return await new Promise((resolve, reject) => {
          wallet.provider.request(
            {
              method: "transfer",
              params: [
                {
                  feeRate: transferParams.feeRate,
                  from: transferParams.from,
                  recipient: transferParams.recipient,
                  memo: transferParams.memo,
                  amount: {
                    amount: transferParams.amount.amount().toNumber(),
                    decimals: transferParams.amount.decimal,
                  },
                },
              ],
            },
            (error: any, result: string) => {
              if (error) {
                console.error(error);
                reject(error);
              } else {
                resolve(result);
              }
            },
          );
        });
      case WalletKey.PHANTOM:
        if (!clientBuilder) {
          throw Error("");
        }
        const { rawUnsignedTx, inputs } = await clientBuilder.prepareTx({
          sender: transferParams.from,
          amount: transferParams.amount,
          recipient: transferParams.recipient,
          feeRate: transferParams.feeRate as number,
          memo: transferParams.memo,
        });
        const fromHexString = (hexString: any) =>
          Uint8Array.from(
            hexString.match(/.{1,2}/g).map((byte: any) => parseInt(byte, 16)),
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
          },
        );

        const psbtSigned = Bitcoin.Psbt.fromBuffer(signedPSBTBytes);
        psbtSigned.finalizeAllInputs();

        const txHex = psbtSigned.extractTransaction().toHex();

        psbtSigned.extractTransaction().getId();

        const hash = await clientBuilder.broadcastTx(txHex);
        return hash;
      case WalletKey.OKX:
        const value = baseToAsset(transferParams.amount).amount().toString();
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
          wallet.ChainInfo as UTXOChain,
          wallet.provider,
        );
        const utxoHash = await ledgerClient.transfer({
          amount: transferParams.amount,
          recipient: transferParams.recipient,
          memo: transferParams.memo,
          feeRate: transferParams.feeRate,
        });
        return utxoHash;
      default:
        throw Error(`Unknown walletId UTXO transfer: ${wallet.walletId}`);
    }
  } catch (error) {
    console.error("Error transfer UTXO wallet:", error);
    throw error;
  }
};

export const depositThorchain = async (
  wallet: WalletState,
  transferParams: DepositParams,
): Promise<string> => {
  switch (wallet.walletId) {
    case WalletKey.CTRL:
    case WalletKey.LEDGER:
      return new Promise<string>(async (resolve, reject) => {
        const depositParams = {
          asset: AssetRuneNative,
          from: transferParams.from,
          amount: {
            amount: transferParams.amount.amount().toNumber(),
            decimals: RUNE_DECIMAL,
          },
          memo: transferParams.memo,
        };
        await wallet.provider.request(
          {
            method: "deposit",
            params: [depositParams],
          },
          (error: Error | null, result: string | null) => {
            if (error) {
              reject(error);
            } else {
              resolve(result || "");
            }
          },
        );
      });
    case WalletKey.VULTISIG:
      const depositParams = {
        from: transferParams.from,
        value: transferParams.amount.amount().toString(),
        data: transferParams.memo,
      };
      const result = "";
      try {
        const result = await wallet.provider.request({
          method: "deposit_transaction",
          params: [depositParams],
        });
        if (Object.keys(result).length === 0 && result.constructor === Object) {
          throw Error("User cancel action"); // vulticonnect returns {} when user cancel action
        }
        return result;
      } catch (e) {
        console.error("deposit error", e);
      }
      return result;
    default:
      throw Error(`Deposit not implemented for ${wallet.walletId}`);
  }
};

export const transferCosmos = async (
  wallet: WalletState,
  transferParams: TransactionParams,
): Promise<string> => {
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
        },
      );
      const coin = {
        denom: "uatom",
        amount: transferParams.amount.amount().toString() + "",
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
        value: transferParams.amount.amount().toString(),
        data: transferParams.memo,
      };
      return await wallet.provider.request({
        method: "send_transaction",
        params: [txDetails],
      });
    case WalletKey.LEDGER:
      const client = getBftLedgerClient(ChainKey.GAIACHAIN, wallet.provider);
      const hash = await client.transfer({
        recipient: transferParams.recipient,
        amount: transferParams.amount,
        memo: transferParams.memo,
      });
      return hash;
    default:
      throw Error(`Deposit not implemented for ${wallet.walletId}`);
  }
};

export const transferEvm = async (
  wallet: WalletState,
  transferParams: TransactionEvmParams,
): Promise<any> => {
  switch (wallet.walletId) {
    case WalletKey.CTRL:
    case WalletKey.OKX:
    case WalletKey.METAMASK:
    case WalletKey.PHANTOM:
    case WalletKey.VULTISIG:
    case WalletKey.WALLETCONNECT:
      await switchEvmChain(wallet, transferParams.chainId as string);

      const currentChainId = await wallet.provider.request({
        method: "eth_chainId",
      });

      // Security measure to avoid sending a transaction through the wrong network
      if (
        currentChainId.toLowerCase() !== transferParams.chainId.toLowerCase()
      ) {
        throw new Error("Incorrect chain broadcast attempt");
      }

      // TODO: Enserue chainId before proceed
      const txHash = await wallet.provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: transferParams.from,
            to: transferParams.recipient,
            data: transferParams.data,
            value:
              transferParams.assetAddress ===
              "0x0000000000000000000000000000000000000000"
                ? `0x${transferParams.amount.amount().toString(16)}`
                : undefined,
          },
        ],
      });
      return txHash;
    case WalletKey.LEDGER:
      const client = getEvmLedgerClient(wallet.ChainInfo, wallet.provider);
      const gasLimit = await client.estimateGasLimit({
        recipient: transferParams.recipient,
        amount: transferParams.amount,
        memo: transferParams.data,
        from: transferParams.from,
        isMemoEncoded: true,
      });
      const hash = await client.transfer({
        recipient: transferParams.recipient,
        amount: transferParams.amount,
        memo: transferParams.data,
        isMemoEncoded: true,
        gasLimit: gasLimit,
      });
      return hash;
    default:
      throw Error(`Deposit not implemented for ${wallet.walletId}`);
  }
};
