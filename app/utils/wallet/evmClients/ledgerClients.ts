import { Network } from "@xchainjs/xchain-client";
import type Transport from "@ledgerhq/hw-transport";

import {
  ClientLedger as EthereumLedgerClient,
  defaultEthParams,
} from "@xchainjs/xchain-ethereum";

import {
  ClientLedger as AvalancheLedgerClient,
  defaultAvaxParams,
} from "@xchainjs/xchain-avax";

import {
  ClientLedger as BscLedgerClient,
  defaultBscParams,
} from "@xchainjs/xchain-bsc";

import { ChainKey } from "../constants";

const commonConfig = {
  network: Network.Mainnet,
};

export const getEvmLedgerClient = (chain: ChainKey, transport: Transport) => {
  switch (chain) {
    case ChainKey.ETHEREUM:
      return new EthereumLedgerClient({
        ...defaultEthParams,
        ...commonConfig,
        transport,
      });
    case ChainKey.AVALANCHE:
      return new AvalancheLedgerClient({
        ...defaultAvaxParams,
        ...commonConfig,
        feeBounds: {
          lower: 1000000000,
          upper: defaultAvaxParams.feeBounds?.upper as number,
        },
        transport,
      });
    case ChainKey.BSCCHAIN:
      return new BscLedgerClient({
        ...defaultBscParams,
        ...commonConfig,
        transport,
      });
    default:
      throw new Error(`Unsupported EVM chain: ${chain}`);
  }
};
