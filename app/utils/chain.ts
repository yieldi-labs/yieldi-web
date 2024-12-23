// chainUtils.ts

import { SupportedChain } from "@/app/utils";
import { ChainKey, ProviderKey } from "./wallet/constants";

/**
 * Interface for inbound address data from THORChain
 */
export interface InboundAddress {
  chain: string;
  pub_key: string;
  address: string;
  router?: string;
  halted: boolean;
  global_trading_paused: boolean;
  chain_trading_paused: boolean;
  chain_lp_actions_paused: boolean;
  gas_rate: string;
  gas_rate_units: string;
  outbound_tx_size: string;
  outbound_fee: string;
  dust_threshold: string;
}

/**
 * Chain ID mapping for EVM chains
 */
export const CHAIN_ID_MAP: Record<string, number> = {
  // TODO: This info is also in constants. Unify with issue: https://linear.app/project-chaos/issue/YLD-141/consolidate-all-chain-configuration
  eth: 1,
  avax: 43114,
  bsc: 56,
};

/**
 * Get inbound addresses from THORChain
 */
export const getInboundAddresses = async (): Promise<InboundAddress[]> => {
  const response = await fetch(
    "https://thornode.ninerealms.com/thorchain/inbound_addresses",
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Validate inbound address for liquidity operations
 */
export const validateInboundAddress = (inbound: InboundAddress) => {
  if (!inbound.router && !inbound.address) {
    throw new Error("Inbound address not found");
  }

  if (inbound.halted) {
    throw new Error("Network is halted");
  }

  if (inbound.chain_lp_actions_paused) {
    throw new Error("LP actions are paused for this chain");
  }
};

/**
 * Switch EVM chain if necessary
 */
export const switchEvmChain = async (
  provider: any,
  targetChain: string,
): Promise<void> => {
  const currentChainId = await provider.request({ method: "eth_chainId" });
  const targetChainId = CHAIN_ID_MAP[targetChain.toLowerCase()];

  if (!targetChainId) {
    throw new Error(`Unsupported chain: ${targetChain}`);
  }

  if (parseInt(currentChainId, 16) !== targetChainId) {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${targetChainId.toString(16)}` }],
    });
  }
};

/**
 * Get supported chain by asset chain
 */
export const getSupportedChainByAssetChain = (
  assetChain: string,
): SupportedChain | undefined => {
  return Object.values(SupportedChain).find(
    (chainValue) => chainValue.toLowerCase() === assetChain.toLowerCase(),
  ) as SupportedChain | undefined;
};

/**
 * Given the assetChain string, checks whether it's a supported chain.
 *
 * @param assetChain string, the chain to check if it's supported e.g: "ETH, "BNB", "BTC"
 * @returns boolean, true if it's a supported chain, false otherwise
 */
export const isSupportedChain = (assetChain: string): boolean => {
  return !!getSupportedChainByAssetChain(assetChain);
};

/**
 * Get minimum amount by chain
 */
export const getMinAmountByChain = (chain: SupportedChain): number => {
  switch (chain) {
    case SupportedChain.Bitcoin:
    case SupportedChain.Litecoin:
    case SupportedChain.BitcoinCash:
      return 0.00010001;
    case SupportedChain.Dogecoin:
      return 1.00000001;
    case SupportedChain.Avalanche:
    case SupportedChain.Ethereum:
    // case SupportedChain.Arbitrum:
    case SupportedChain.BinanceSmartChain:
      return 0.00000001;
    // case SupportedChain.THORChain:
    // case SupportedChain.Maya:
    //   return 0;
    // case SupportedChain.Kujira:
    case SupportedChain.Cosmos:
      return 0.000001;
    default:
      return 0.00000001;
  }
};

/**
 * Generate liquidity memo string
 */
export const getLiquidityMemo = (
  type: "add" | "remove",
  asset: string,
  pairedAddr: string = "",
  affiliate: string = "",
  feeBps: number = 0,
  percentage?: number,
  withdrawAsset?: string,
): string => {
  if (type === "add") {
    if (pairedAddr) {
      // Dual-sided add liquidity with optional affiliate and fee
      return `+:${asset}:${pairedAddr}:${affiliate}:${feeBps}`;
    }
    // Single-sided add liquidity
    return `+:${asset}::${affiliate}:${feeBps}`;
  }

  if (type === "remove") {
    const basisPoints = percentage ? Math.round(percentage * 100) : 0;
    if (basisPoints < 0 || basisPoints > 10000) {
      throw new Error("Percentage must be between 0 and 100");
    }
    // Single-sided or dual-sided remove liquidity
    return withdrawAsset
      ? `-:${asset}:${basisPoints}:${withdrawAsset}` // Single-sided
      : `-:${asset}:${basisPoints}`; // Dual-sided
  }

  throw new Error("Invalid liquidity operation type");
};

/**
 * Parse asset details from asset string
 */
export const parseAssetString = (asset: string): [string, string] => {
  const [chain = "", identifier = ""] = asset.split(".");
  return [chain, identifier];
};

export const isEVMAddress = (address: string): boolean => {
  return address.startsWith("0x") && address.length === 42;
};

export const getChainKeyFromChain = (chain: string): ChainKey => {
  chain = chain.toUpperCase();
  switch (chain) {
    case "AVAX": {
      return ChainKey.AVALANCHE;
    }
    case "BSC": {
      return ChainKey.BSCCHAIN;
    }
    case "ETH": {
      return ChainKey.ETHEREUM;
    }
    case "BTC": {
      return ChainKey.BITCOIN;
    }
    case "DOGE": {
      return ChainKey.DOGECOIN;
    }
    case "LTC": {
      return ChainKey.LITECOIN;
    }
    case "GAIA": {
      return ChainKey.GAIACHAIN;
    }
    case "BCH": {
      return ChainKey.BITCOINCASH;
    }
    case "THOR": {
      return ChainKey.THORCHAIN;
    }
    default: {
      return ChainKey.ETHEREUM;
    }
  }
};

export const getProviderTypeFromChain = (chain: string): ProviderKey => {
  switch (chain) {
    case "AVAX":
    case "BSC":
    case "ETH": {
      return ProviderKey.EVM;
    }
    case "BTC": {
      return ProviderKey.BITCOIN;
    }
    case "LTC": {
      return ProviderKey.LITECOIN;
    }
    case "BCH": {
      return ProviderKey.BITCOINCASH;
    }
    case "DOGE": {
      return ProviderKey.DOGECOIN;
    }
    case "THOR": {
      return ProviderKey.THORCHAIN;
    }
    default: {
      return ProviderKey.EVM;
    }
  }
};
