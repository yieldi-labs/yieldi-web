import { Network } from "@xchainjs/xchain-client";
import type Transport from "@ledgerhq/hw-transport";
import {
  AddressFormat,
  ClientLedger as BitcoinLedgerClient,
  defaultBTCParams,
} from "@xchainjs/xchain-bitcoin";
import {
  ClientLedger as BitcoinCashClient,
  defaultBchParams,
} from "@xchainjs/xchain-bitcoincash";
import {
  defaultLtcParams,
  ClientLedger as LitecoinClient,
} from "@xchainjs/xchain-litecoin";
import { ClientLedger as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";
import {
  BitgoBtcProviders,
  BitgoDogeProviders,
  BitgoLtcProviders,
  BlockcypherBtcDataProviders,
  blockcypherDogeDataProviders,
  BlockcypherLtcDataProviders,
} from "./providers";
import { ChainKey } from "../constants";

const commonConfig = {
  network: Network.Mainnet,
};

export type UTXOChain = ChainKey.BITCOIN | ChainKey.DOGECOIN | ChainKey.LITECOIN | ChainKey.BITCOINCASH;

export const getLedgerClient = (chain: UTXOChain, transport: Transport) => {
  switch (chain) {
    case ChainKey.BITCOIN:
      return new BitcoinLedgerClient({
        ...defaultBTCParams,
        ...commonConfig,
        dataProviders: [BitgoBtcProviders, BlockcypherBtcDataProviders],
        transport,
        addressFormat: AddressFormat.P2WPKH
      });
    case ChainKey.BITCOINCASH:
      return new BitcoinCashClient({
        ...defaultBchParams,
        ...commonConfig,
        transport,
      });
    case ChainKey.LITECOIN:
      return new LitecoinClient({
        ...defaultLtcParams,
        ...commonConfig,
        dataProviders: [BitgoLtcProviders, BlockcypherLtcDataProviders],
        transport,
      });
    case ChainKey.DOGECOIN:
      return new DogeClient({
        ...defaultDogeParams,
        ...commonConfig,
        dataProviders: [BitgoDogeProviders, blockcypherDogeDataProviders],
        transport,
      });
    default:
      throw new Error(`Unsupported UTXO chain: ${chain}`);
  }
};
