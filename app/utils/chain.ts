// chainUtils.ts

import { SupportedChain } from "@/app/utils";
import {
  ChainKey,
  CHAINS,
  SUPPORTED_WALLETS,
  ThorchainIdentifiers,
} from "./wallet/constants";
import { ChainType, WalletState } from "./interfaces";
import { InboundAddress } from "@/thornode";
import { AnyAsset } from "@xchainjs/xchain-util";

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
  wallet: WalletState,
  targetChain: string,
): Promise<void> => {
  const selectedWallet = SUPPORTED_WALLETS[wallet.walletId];

  if (!selectedWallet.hasSupportMultichain) {
    return;
  }

  const currentChainId = await wallet.provider.request({
    method: "eth_chainId",
  });

  const targetChainInfo = CHAINS.find(
    (chain) =>
      chain.thorchainIdentifier.toLowerCase() === targetChain.toLowerCase(),
  );
  const targetChainId = targetChainInfo?.chainId;

  if (!targetChainId) {
    throw new Error(`Unsupported chain: ${targetChain}`);
  }

  if (currentChainId !== targetChainInfo?.chainId) {
    await wallet.provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainId }],
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
 * TODO: Get from inbound endpoint
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
    case SupportedChain.BinanceSmartChain:
      return 0.00000001;
    case SupportedChain.THORChain:
      return 0;
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
    case "BASE": {
      return ChainKey.BASE;
    }
    default: {
      return ChainKey.ETHEREUM;
    }
  }
};

export const isChainType = (
  type: ChainType,
  asset: AnyAsset,
): ThorchainIdentifiers | null => {
  const chain = CHAINS.find(
    (c) =>
      c.thorchainIdentifier.toLowerCase() === asset.chain.toLowerCase() &&
      c.type === type,
  );
  return chain ? chain.thorchainIdentifier : null;
};
