import { AssetBTC, BTCChain } from "@xchainjs/xchain-bitcoin";
import { Network } from "@xchainjs/xchain-client";
import { AssetDOGE, DOGEChain } from "@xchainjs/xchain-doge";
import { AssetLTC, LTCChain } from "@xchainjs/xchain-litecoin";
import {
  BitgoProvider,
  BlockcypherNetwork,
  BlockcypherProvider,
  UtxoOnlineDataProviders,
} from "@xchainjs/xchain-utxo-providers";

// Bitcoin

const mainnetBtcBlockcypherProvider = new BlockcypherProvider(
  "https://api.blockcypher.com/v1",
  BTCChain,
  AssetBTC,
  8,
  BlockcypherNetwork.BTC,
  process.env.NEXT_PUBLIC_BLOCKCYPHER_TOKEN || "",
);

export const BlockcypherBtcDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBtcBlockcypherProvider,
  [Network.Mainnet]: mainnetBtcBlockcypherProvider,
};

const mainnetBtcBitgoProvider = new BitgoProvider({
  baseUrl: "https://app.bitgo.com",
  chain: BTCChain,
});
export const BitgoBtcProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetBtcBitgoProvider,
  [Network.Mainnet]: mainnetBtcBitgoProvider,
};

// Doge

const mainnetDogeBlockcypherProvider = new BlockcypherProvider(
  "https://api.blockcypher.com/v1",
  DOGEChain,
  AssetDOGE,
  8,
  BlockcypherNetwork.DOGE,
  process.env.NEXT_PUBLIC_BLOCKCYPHER_TOKEN || "",
);
export const blockcypherDogeDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetDogeBlockcypherProvider,
  [Network.Mainnet]: mainnetDogeBlockcypherProvider,
};

const mainnetDogeBitgoProvider = new BitgoProvider({
  baseUrl: "https://app.bitgo.com",
  chain: DOGEChain,
});

export const BitgoDogeProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetDogeBitgoProvider,
  [Network.Mainnet]: mainnetDogeBitgoProvider,
};

// Litecoin

//======================
// Blockcypher
//======================

const mainnetLtcBlockcypherProvider = new BlockcypherProvider(
  "https://api.blockcypher.com/v1",
  LTCChain,
  AssetLTC,
  8,
  BlockcypherNetwork.LTC,
  process.env.NEXT_PUBLIC_BLOCKCYPHER_TOKEN || "",
);

export const BlockcypherLtcDataProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetLtcBlockcypherProvider,
  [Network.Mainnet]: mainnetLtcBlockcypherProvider,
};

const mainnetLtcBitgoProvider = new BitgoProvider({
  baseUrl: "https://app.bitgo.com",
  chain: LTCChain,
});

export const BitgoLtcProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetLtcBitgoProvider,
  [Network.Mainnet]: mainnetLtcBitgoProvider,
};
