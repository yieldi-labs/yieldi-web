import { getMemberDetail, MemberPool, PoolDetail, PoolDetails } from "@/midgard";
import {
  assetAmount,
  AssetAmount,
  baseAmount,
  baseToAsset,
} from "@xchainjs/xchain-util";
import BigNumber from "bignumber.js";
import { ActionData, actionsTransformer } from "./parseActions";

export enum PositionStatus {
  LP_POSITION_DEPOSIT_PENDING = "LP_POSITION_DEPOSIT_PENDING",
  LP_POSITION_WITHDRAWAL_PENDING = "LP_POSITION_WITHDRAWAL_PENDING",
  LP_POSITION_INCOMPLETE = "LP_POSITION_INCOMPLETE",
  LP_POSITION_COMPLETE = "LP_POSITION_COMPLETE",
}

export enum PositionType {
  SLP = "SLP",
  DLP = "DLP",
}

export interface PositionStats {
  assetId: string;
  type: PositionType;
  status: PositionStatus;
  deposit: {
    usd: number;
    totalInAsset: number;
    assetAdded: number;
    runeAdded: number;
  };
  gain: {
    usd: number;
    asset: number;
    percentage: string;
  };
  pendingActions: ActionData[];
  pool: PoolDetail;
  memberDetails: MemberPool;
}

export interface Positions {
  [pool: string]: {
    DLP: PositionStats | null;
    SLP: PositionStats | null;
  };
}

export const positionsTransformer = async (
  addresses: string[],
  pools: PoolDetails,
) => {
  const result: Positions = {};

  const memberPoolsResult = await getMemberDetail({
    path: {
      address: addresses.join(","),
    },
  });

  const actions = await actionsTransformer(addresses)

  const memberPools = memberPoolsResult.data?.pools

  if (!memberPools) {
    throw Error("No member pools data");
  }
  
  memberPools.forEach((memberPool) => {
    const type = determinePositionType(memberPool);

    const key = memberPool.pool.replace("/", ".");

    if (!result[key]) {
      result[key] = { DLP: null, SLP: null };
    }

    const pool = pools?.find(
      (p) => p.asset === memberPool.pool.replace("/", "."),
    );
    if (!pool) throw Error("Position on invalid liquidity pool");

    let totalAddedValueInUsd: AssetAmount = assetAmount(0);
    let totalAddedValueInAsset: AssetAmount = assetAmount(0);
    let gainInUsd: AssetAmount = assetAmount(0);
    let gainInAsset: AssetAmount = assetAmount(0);
    let assetAdded = 0;
    let runeAdded = 0;

    const userPoolPercentage = BigNumber(memberPool.liquidityUnits).div(
      pool.units,
    );
    const assetToRedeem = baseAmount(
      BigNumber(pool.assetDepth).times(userPoolPercentage),
    );
    const runeToRedeem = baseAmount(
      BigNumber(pool.runeDepth).times(userPoolPercentage),
    );

    const redeemValueAssetInUsd = baseToAsset(assetToRedeem).times(
      pool.assetPriceUSD,
    );
    const redeemValueRuneInUsd = baseToAsset(runeToRedeem)
      .div(pool.assetPrice)
      .times(pool.assetPriceUSD);
    const totalRedeemValueInUsd =
      redeemValueAssetInUsd.plus(redeemValueRuneInUsd);

    const depositValueAsset = baseToAsset(
      baseAmount(memberPool.assetAdded).minus(memberPool.assetWithdrawn),
    );
    const depositValueRune = baseToAsset(
      baseAmount(memberPool.runeAdded).minus(memberPool.runeWithdrawn),
    );

    totalAddedValueInUsd = depositValueAsset
      .times(pool.assetPriceUSD)
      .plus(depositValueRune.div(pool.assetPrice).times(pool.assetPriceUSD));
    gainInUsd = totalRedeemValueInUsd.minus(totalAddedValueInUsd);

    totalAddedValueInAsset = depositValueAsset.plus(
      depositValueRune.div(pool.assetPrice),
    );
    gainInAsset = baseToAsset(assetToRedeem)
      .plus(baseToAsset(runeToRedeem).div(pool.assetPrice))
      .minus(totalAddedValueInAsset);

    assetAdded = depositValueAsset.amount().toNumber();
    runeAdded = depositValueRune.amount().toNumber();

    result[key][type] = {
      assetId: memberPool.pool,
      type: determinePositionType(memberPool),
      status: determinePositionStatus(memberPool),
      deposit: {
        usd: totalAddedValueInUsd.amount().toNumber(),
        totalInAsset: totalAddedValueInAsset.amount().toNumber(),
        assetAdded,
        runeAdded,
      },
      gain: {
        usd: gainInUsd.amount().toNumber(),
        asset: gainInAsset.amount().toNumber(),
        percentage: gainInUsd
          .div(totalAddedValueInUsd)
          .times(100)
          .amount()
          .toFixed(4),
      },
      pool,
      pendingActions: actions.filter((action) => action.pool === memberPool.pool),
      memberDetails: memberPool,
    };
  });

  return result;
};

const determinePositionType = (memberPool: MemberPool): PositionType => {
  if (
    (memberPool.runeAdded !== "0" && memberPool.assetDeposit !== "0") ||
    memberPool.runePending !== "0" ||
    memberPool.assetPending !== "0"
  )
    return PositionType.DLP;
  return PositionType.SLP;
};

const determinePositionStatus = (memberPool: MemberPool) => {
  if (Number(memberPool.assetPending) > 0 || Number(memberPool.runePending) > 0)
    return PositionStatus.LP_POSITION_INCOMPLETE;
  return PositionStatus.LP_POSITION_COMPLETE;
};

