import { Network } from "@xchainjs/xchain-client";
import type Transport from "@ledgerhq/hw-transport";

import {
  ClientLedger as CosmosLedgerClient,
  defaultClientConfig as defaultCosmosClientConfig,
} from "@xchainjs/xchain-cosmos";

import {
  ClientLedger as ThorChainLedgerClient,
  defaultClientConfig as defaultThorchainClientConfig,
} from "@xchainjs/xchain-thorchain";

import { ChainKey } from "../constants";

const commonConfig = {
  network: Network.Mainnet,
};

export const getBftLedgerClient = (chain: ChainKey, transport: Transport) => {
  switch (chain) {
    case ChainKey.GAIACHAIN:
      return new CosmosLedgerClient({
        ...defaultCosmosClientConfig,
        ...commonConfig,
        transport,
      });
    case ChainKey.THORCHAIN:
      return new ThorChainLedgerClient({
        ...defaultThorchainClientConfig,
        ...commonConfig,
        transport,
      });
    default:
      throw new Error(`Unsupported BFT chain: ${chain}`);
  }
};
