import { InboundAddressesResponse } from "@/thornode";
import {
  assetFromString,
  BaseAmount,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
import { PoolDetail } from "@/midgard";

export enum WithdrawalType {
  SPLIT = "SPLIT",
  ALL_RUNE = "ALL_RUNE",
  ALL_ASSET = "ALL_ASSET",
}

export function getOutboundFeeInDollarsByPoolAndWithdrawalStrategy(
  pool: PoolDetail,
  runePriceInDollar: number,
  withdrawalType: WithdrawalType,
  gasAssetPool?: PoolDetail,
  nativeOutboundFeeRuneInBase?: string,
  inboundAddresses?: InboundAddressesResponse
) {
  if (!gasAssetPool) {
    throw Error("gasAssetPool is invalid");
  }
  if (!nativeOutboundFeeRuneInBase) {
    throw Error("nativeOutboundFeeRuneInBase is invalid");
  }
  const asset = assetFromString(pool.asset);
  if (!asset) {
    throw Error(`Invalid asset ${pool.asset}`);
  }
  const inboundInfo = inboundAddresses?.find(
    (inbound) => inbound.chain?.toLowerCase() === asset.chain.toLowerCase()
  );
  if (!inboundInfo) {
    throw Error(`No inbound info for asset ${asset.chain}.${asset.symbol}`);
  }

  // Asset outbound
  const outboundFeeInGasAsset = baseAmount(inboundInfo?.outbound_fee);
  const outboundFeeInRune = getValueOfAssetInRune(outboundFeeInGasAsset, gasAssetPool);
  const princeOutboundAssetInDollars =
    baseToAsset(outboundFeeInRune).times(runePriceInDollar);

  // Rune outbound
  const outboundFeeRuneNetwork = baseAmount(nativeOutboundFeeRuneInBase);
  const princeNativeRuneWithdrawalInDollars = baseToAsset(outboundFeeRuneNetwork).times(runePriceInDollar);

  if (withdrawalType === WithdrawalType.ALL_RUNE) {
    return princeNativeRuneWithdrawalInDollars.amount().toNumber();
  }

  if (withdrawalType === WithdrawalType.ALL_ASSET) {
    return princeOutboundAssetInDollars.amount().toNumber();
  }

  return princeOutboundAssetInDollars.plus(princeNativeRuneWithdrawalInDollars).amount().toNumber();
}

const getValueOfAssetInRune = (
  inputAsset: BaseAmount,
  pool: PoolDetail
): BaseAmount => {
  // formula: ((a * R) / A) => R per A (Runeper$)
  const t = inputAsset.amount();
  const R = pool.runeDepth;
  const A = pool.assetDepth;
  const result = t.times(R).div(A);
  return baseAmount(result);
};
