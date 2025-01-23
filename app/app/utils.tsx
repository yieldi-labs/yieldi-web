import { MemberPool, PoolDetail } from "@/midgard";
import { CHAINS } from "@/utils/wallet/constants";
import { assetFromString } from "@xchainjs/xchain-util";

export enum SupportedChain {
  Avalanche = "AVAX",
  BinanceSmartChain = "BSC",
  Bitcoin = "BTC",
  BitcoinCash = "BCH",
  Cosmos = "GAIA",
  Dogecoin = "DOGE",
  Ethereum = "ETH",
  Litecoin = "LTC",
  // Maya = "MAYA",
  // Optimism = "OP",
  // Polkadot = "DOT",
  // Chainflip = "FLIP",
  // Polygon = "MATIC",
  // Radix = "XRD",
  THORChain = "THOR",
  // Solana = "SOL",
}

export function formatNumber(
  amount: string | number,
  decimals = 8,
  decimalsShown = 4,
) {
  if (!amount && amount != 0) return "0";
  if (typeof amount !== "number") {
    amount = parseFloat(amount) / 10 ** decimals;
  }
  return Intl.NumberFormat("en-US", {
    useGrouping: true,
    minimumFractionDigits: decimalsShown,
    maximumFractionDigits: decimalsShown,
  }).format(amount);
}

export const addDollarSignAndSuffix = (value: number) => {
  if (value === 0) {
    return "-";
  }
  if (value >= 1e6) {
    return `$${formatNumber(value / 1e6, 2, 2)}M`;
  } else if (value >= 1e3) {
    return `$${formatNumber(value / 1e3, 2, 2)}K`;
  } else {
    return `$${formatNumber(value, 2, 2)}`;
  }
};

export const calculatePoolTVL = (pool: PoolDetail, runePriceUSD: number) => {
  const assetValueInUSD =
    (parseFloat(pool.assetDepth) * parseFloat(pool.assetPriceUSD)) / DECIMALS;
  const runeValueInUSD = (parseFloat(pool.runeDepth) * runePriceUSD) / DECIMALS;
  return assetValueInUSD + runeValueInUSD;
};

export const getFormattedPoolTVL = (pool: PoolDetail, runePriceUSD: number) => {
  return addDollarSignAndSuffix(calculatePoolTVL(pool, runePriceUSD));
};

export const getFormattedPoolEarnings = (
  pool: PoolDetail,
  runePriceUSD: number,
) => {
  return addDollarSignAndSuffix(
    (parseInt(pool.earnings) * runePriceUSD) / DECIMALS,
  );
};

export const calculateVolumeUSD = (pool: PoolDetail, runePriceUSD: number) => {
  const volumeInRune = parseFloat(pool.volume24h) / DECIMALS;
  return volumeInRune * runePriceUSD;
};

export const calculateVolumeDepthRatio = (
  pool: PoolDetail,
  runePriceUSD: number,
): number => {
  const volumeUSD = calculateVolumeUSD(pool, runePriceUSD);
  const tvlUSD = calculatePoolTVL(pool, runePriceUSD);
  return volumeUSD / tvlUSD;
};

export const getAssetSymbol = (assetString: string): string => {
  // https://dev.thorchain.org/concepts/asset-notation.html#asset-notation
  const asset = assetFromString(assetString);
  if (!asset) {
    throw new Error(`Invalid asset ${assetString}`);
  }
  return asset?.ticker;
};

export const getLogoPath = (asset: string): string => {
  const assetLower = asset.toLowerCase();
  return `https://storage.googleapis.com/token-list-swapkit-dev/images/${assetLower}.png`;
};

export const getNetworkLogoPath = (assetString: string): string => {
  const asset = assetFromString(assetString);
  const chain = CHAINS.find(
    (chain) => chain.thorchainIdentifier === asset?.chain.toLowerCase(),
  );
  return `https://storage.googleapis.com/token-list-swapkit-dev/images/${chain?.thorchainIdentifier}.${chain?.nativeAsset}.png`;
};

export const getAssetCanonicalSymbol = (asset: string) => {
  return asset.split("-")[0] || asset;
};

export const getAssetShortSymbol = (asset: string) => {
  return getAssetCanonicalSymbol(asset).split(".")[1] || asset;
};

export const normalizeAddress = (address: string) => {
  const cleanAddr = address.toLowerCase().replace("0x", "");
  return `0x${cleanAddr}` as `0x${string}`;
};

export const isERC20 = (asset: string) => {
  return asset.includes("-");
};

export const getPercentage = (amount: number, max: number): number => {
  return max > 0 ? (amount / max) * 100 : 0;
};

/**
 * Extracts the symbol from a pool asset identifier
 * @param asset Pool asset identifier (e.g. "BTC.BTC" or "ETH.USDT-0x...")
 * @returns The asset symbol (e.g. "BTC" or "USDT")
 */
export const getAssetSimpleSymbol = (asset: string): string => {
  return asset.split(".")[1]?.split("-")[0] || asset;
};

export interface MemberStats {
  deposit: {
    asset: number;
    usd: number;
  };
  gain: {
    asset: number;
    usd: number;
  };
}

export const DECIMALS = 1e8;

export interface PositionDetails {
  assetAdded: number;
  runeAdded: number;
}

export const getPositionDetails = (position: MemberPool): PositionDetails => {
  const assetAdded = parseFloat(position.assetAdded) / DECIMALS;
  const runeAdded = parseFloat(position.runeAdded) / DECIMALS;
  return {
    assetAdded,
    runeAdded,
  };
};

export const disableDueTooSmallAmount = (
  currentMinOutboundFee: number,
  usdAssetAmount: number,
  usdRuneAmount: number,
): boolean => {
  const MIN_OUTBOUND_FEE_MULTIPLIER = 3; // Random multiplier to stay sage despite of refund or other things happen. Real calcs are more complex than that. https://dev.thorchain.org/concepts/fees.html#outbound-fee
  const minOutboundInDollars = currentMinOutboundFee / 10e7;
  const totalAmountInDollarsOfAction = usdAssetAmount + usdRuneAmount;
  return (
    minOutboundInDollars * MIN_OUTBOUND_FEE_MULTIPLIER >
    totalAmountInDollarsOfAction
  );
};
