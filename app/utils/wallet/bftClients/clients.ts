import { Network } from "@xchainjs/xchain-client";
import {
  Client as ThorchainClient,
  defaultClientConfig,
} from "@xchainjs/xchain-thorchain";
import { ThorchainIdentifiers } from "../constants";

const commonConfig = {
  network: Network.Mainnet,
  phrase: "", // We don't need phrase since we're using wallet provider
};

const clientRune = new ThorchainClient({
  ...defaultClientConfig,
  ...commonConfig,
});


export const getBftClient = (chain: ThorchainIdentifiers) => {
  switch (chain) {
    case ThorchainIdentifiers.THOR:
      return clientRune;
    default:
      throw new Error(`Unsupported BFT chain: ${chain}`);
  }
};
