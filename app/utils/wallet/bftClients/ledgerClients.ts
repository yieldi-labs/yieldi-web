import { Network } from "@xchainjs/xchain-client";
import type Transport from "@ledgerhq/hw-transport";

import {
  ClientLedger as CosmosLedgerClient,
  defaultClientConfig,
} from "@xchainjs/xchain-cosmos";

import { ChainKey } from "../constants";

const commonConfig = {
  network: Network.Mainnet,
};

export const getBftLedgerClient = (chain: ChainKey, transport: Transport) => {
  switch (chain) {
    case ChainKey.GAIACHAIN:
      return new CosmosLedgerClient({
        ...defaultClientConfig,
        ...commonConfig,
        transport,
      });
    default:
      throw new Error(`Unsupported UTXO chain: ${chain}`);
  }
};
