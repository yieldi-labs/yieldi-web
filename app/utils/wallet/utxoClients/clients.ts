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
import { BitgoProviders, BlockcypherDataProviders } from "./providers";

const commonConfig = {
  network: Network.Mainnet,
  phrase: "", // We don't need phrase since we're using wallet provider
};

const clientBtc = new BitcoinClient({
  ...defaultBTCParams,
  ...commonConfig,
  dataProviders: [BitgoProviders, BlockcypherDataProviders],
});

const clientDoge = new DogeClient({
  ...defaultDogeParams,
  ...commonConfig,
});

const clientLtc = new LitecoinClient({
  ...defaultLtcParams,
  ...commonConfig,
});

const clientBch = new BitcoinCashClient({
  ...defaultBchParams,
  ...commonConfig,
});

export type UTXOChain = "BTC" | "DOGE" | "LTC" | "BCH";

export const getClient = (chain: UTXOChain) => {
  switch (chain) {
    case "BTC":
      return clientBtc
    case "DOGE":
      return clientDoge
    case "LTC":
      return clientLtc
    case "BCH":
      return clientBch
    default:
      throw new Error(`Unsupported UTXO chain: ${chain}`);
  }
};
