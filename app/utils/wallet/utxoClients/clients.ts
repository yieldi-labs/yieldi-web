import { Network } from "@xchainjs/xchain-client";
import {
  Client as BitcoinClient,
  defaultBTCParams,
} from "@xchainjs/xchain-bitcoin";
import { Client as DogeClient, defaultDogeParams } from "@xchainjs/xchain-doge";
import {
  defaultLtcParams,
  Client as LitecoinClient,
} from "@xchainjs/xchain-litecoin";
import {
  Client as BitcoinCashClient,
  defaultBchParams,
} from "@xchainjs/xchain-bitcoincash";
import {
  BitgoBtcProviders,
  BlockcypherBtcDataProviders,
  BitgoDogeProviders,
  blockcypherDogeDataProviders,
  BitgoLtcProviders,
  BlockcypherLtcDataProviders,
} from "./providers";
import { ThorchainIdentifiers } from "../constants";

const commonConfig = {
  network: Network.Mainnet,
  phrase: "", // We don't need phrase since we're using wallet provider
};

const clientBtc = new BitcoinClient({
  ...defaultBTCParams,
  ...commonConfig,
  dataProviders: [BitgoBtcProviders, BlockcypherBtcDataProviders],
});

const clientDoge = new DogeClient({
  ...defaultDogeParams,
  ...commonConfig,
  dataProviders: [BitgoDogeProviders, blockcypherDogeDataProviders],
});

const clientLtc = new LitecoinClient({
  ...defaultLtcParams,
  ...commonConfig,
  dataProviders: [BitgoLtcProviders, BlockcypherLtcDataProviders],
});

const clientBch = new BitcoinCashClient({
  ...defaultBchParams,
  ...commonConfig,
});

export const getClient = (chain: ThorchainIdentifiers) => {
  switch (chain) {
    case ThorchainIdentifiers.BTC:
      return clientBtc;
    case ThorchainIdentifiers.DOGE:
      return clientDoge;
    case ThorchainIdentifiers.LTC:
      return clientLtc;
    case ThorchainIdentifiers.BCH:
      return clientBch;
    default:
      throw new Error(`Unsupported UTXO chain: ${chain}`);
  }
};
